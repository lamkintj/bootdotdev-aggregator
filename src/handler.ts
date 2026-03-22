import { readConfig, setUser } from "./config";
import { getUser, createUser, getAllUsers } from "./lib/db/queries/users";
import { createFeed, scrapeFeeds } from "./lib/db/queries/feeds";
import { createFeedFollow, unfollowFeed, getFeedFollowsForUser } from "./lib/db/queries/follows";
import { users, feeds, feed_follows, posts} from "./lib/db/schema";
import { db } from "./lib/db";
import { eq } from "drizzle-orm";
import { getPostsForUser } from "./lib/db/queries/posts";

// HELPER FUNCTIONS
export type Post = typeof posts.$inferInsert;
export type FeedFollow = typeof feed_follows.$inferInsert;
export type Feed = typeof feeds.$inferSelect;
export type User = typeof users.$inferSelect;
function printFeed(feed: Feed, user: User, follow: Follow) {
    console.log(`Printing fields of feeds table`);
    console.log(`id: ${feed.id}`);
    console.log(`name: ${feed.name}`);
    console.log(`created at: ${feed.createdAt}`);
    console.log(`updated at: ${feed.updatedAt}`);
    console.log(`url: ${feed.url}`);
    console.log(`user id: ${feed.userId}\n`);

    console.log(`Printing fields of users table`);
    console.log(`id: ${user.id}`);
    console.log(`name: ${user.name}`);
    console.log(`created at: ${user.createdAt}`);
    console.log(`updated at: ${user.updatedAt}\n`);

    console.log(`Printing data from feed follow entry`)
    console.log(`${JSON.stringify(follow, null, 2)}`);
};
function parseDuration(durationStr: string): number | undefined {
    const regex = /^(\d+)(ms|s|m|h)$/i;
    const match = durationStr.match(regex);
    if (match === null) {
        console.log("Invalid duration string used");
        console.log("Please provide an interval duration in the form <number><unit> where unit can be [ms, s, m, h]");
        process.exit(1);
    }
    const value: number = parseInt(match[1], 10);
    const unit: string = match[2];
    // switch statement to calculate milliseconds based on unit
    switch(unit) {
        case "ms":
            return value;
        case "s":
            return value * 1000;
        case "m":
            return value * 60 * 1000;
        case "h":
            return value * 60 * 60 * 1000;
        default:
            return undefined
    };
}
// END HELPER FUNCTIONS 

export async function handlerLogin(cmdName: string, ...args: string[]): Promise<void> {
    if (args.length !== 1) {
        console.log(`Usage: ${cmdName} <username>`);
        process.exit(1);
    }
    const user:string = args[0];
    const userExists = await getUser(user);
    if (!userExists) {
        console.log(`Error: ${user} does not exist in the database. Please register first before attempting to log in`);
    }
    setUser(user)
    console.log(`Username ${user} has been set!`);
    process.exit(0);
};

export async function handlerRegister(cmdName: string, ...args: string[]): Promise<void> {
    if (args.length !== 1) {
        console.log(`Usage: ${cmdName} <name to be registered>`);
        process.exit(1);
    }

    const username: string = args[0];
    const existing = await getUser(username);

    if (existing) {
        throw new Error(`User ${username} already exists in database`)
    }

    console.log(`Creating entry for user ${username}`);
    await createUser(username);
    setUser(username);

    console.log(`User ${username} successfully added to database`);
    console.log(await getUser(username));
    process.exit(0);
}

export async function handlerReset(cmdName: string, ...args: string[]): Promise<void> {
    if (args.length !== 0) {
        console.log(`${cmdName} takes no arguments. Ignoring additional supplied arguments`);
    }
    
    console.log(`Deleting all entries from all databases`);
    await db.delete(feeds)
    await db.delete(users);
    await db.delete(feed_follows);
    await db.delete(posts);
    process.exit(0);
}

export async function handlerGetUsers(cmdName: string, ...args: string[]): Promise<void> {
    if (args.length !== 0) {
        console.log(`${cmdName} takes no arguments. Ignoring additional supplied arguments`);
    }
    const users = await getAllUsers();
    const config = readConfig();
    const current_user = config.currentUserName;
    for (const user of users) {
        if (user.name === current_user) {
            console.log(`* ${user.name} (current)`)
        } else {
            console.log(user.name)
        }
    }
    process.exit(0);
}

export async function handlerAgg(cmdName: string, ...args: string[]): Promise<void> {
     if (args.length !== 1) {
        console.log(`Usage: ${cmdName} <time_between_reqs>`);
        process.exit(1);
    }
    const duration = parseDuration(args[0]);
    if (duration === undefined) {
        throw new Error("Error parsing input into duration");
    }
    const timeBetweenReqs: number = duration;
    // interval is in units of milliseconds
    scrapeFeeds().catch(handleError)
    const interval = setInterval(() => {
        scrapeFeeds().catch(handleError);
    }, timeBetweenReqs);
    
    await new Promise<void>((resolve) => {
        process.on("SIGINT", () => {
            console.log("Shutting down feed aggregator...");
            clearInterval(interval);
            resolve();
        });
    });
    return 
}

function handleError(err: unknown) {
  if (err instanceof Error) {
    console.error(err.message);
  } else {
    console.error(err);
  }
}

export async function handlerAddFeed(cmdName: string, user: User, ...args: string[]): Promise<void> {
    if (args.length !== 2) {
        console.log(`Usage: ${cmdName} <feed_name> <url>`);
        process.exit(1);
    }
    const feedName = args[0];
    const feedURL = args[1];
    const userData = await getUser(user.name);
    const feedData = await createFeed(feedName, feedURL, userData.id);
    const followData = await createFeedFollow(user.name, feedURL);

    printFeed(feedData, userData, followData);
    process.exit(0);
}

export type Follow = {
    followRecord: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        feedId: string;
        userId: string;
    };
    feedName: string;
    userName: string;
};

export async function handlerListFeeds(cmdName: string, ...args: string[]): Promise<void> {
    if (args.length !== 0) {
        console.log(`Usage: ${cmdName}`);
        process.exit(1);
    }
    const feedList = await db.select({feeds: feeds}).from(feeds).innerJoin(users, eq(users.id, feeds.userId));
    
    console.log(feedList);
    process.exit(0);
}

export async function handlerAddFollow(cmdName: string, user: User,...args: string[]): Promise<void> {
    if (args.length !== 1) {
        console.log(`Usage: ${cmdName} <url>`);
        process.exit(1);
    }
    const url: string = args[0];
    const feedData = await createFeedFollow(user.name, url);
    console.log(`${JSON.stringify(feedData, null, 2)}`);
    process.exit(0);
}

export async function handlerFollowing (cmdName: string, user: User, ...args: string[]): Promise<void> {
     if (args.length !== 0) {
        console.log(`Usage: ${cmdName}`);
        process.exit(1);
    }
    const followingList = await getFeedFollowsForUser(user.name);
    
    console.log(`Feeds followed by user ${user.name}:`);
    for (const feed of followingList) {
        console.log(`   -${feed.feedName}`);
    }
    process.exit(0);
};

export async function handlerUnfollow (cmdName: string, user: User, ...args: string[]): Promise<void> {
    if (args.length !== 1) {
        console.log(`Usage: ${cmdName} <feed url>`);
        process.exit(1);
    }
    const url: string = args[0];
    await unfollowFeed(user.name, url);
    console.log(`${user.name} unfollowed feed at "${url}"`)
    process.exit(0);
}

export async function handlerBrowse (cmdName: string, user: User, ...args: string[]): Promise<void> {
    if (args.length > 1) {
        console.log(`Usage: ${cmdName} [optional: limit, default = 2]`);
        process.exit(1);
        }
    if (args.length === 1){
        const limit = parseInt(args[0], 10);
        console.log(limit)
        await getPostsForUser(user, limit);
    } else {
        await getPostsForUser(user);
    }
}