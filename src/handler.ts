import { readConfig, setUser } from "./config";
import { getUser, createUser, getAllUsers } from "./lib/db/queries/users";
import { fetchFeed } from "./feed";
import { createFeed } from "./lib/db/queries/feeds";
import { users, feeds } from "./lib/db/schema";
import { db } from "./lib/db";

export async function handlerLogin(cmdName: string, ...args: string[]): Promise<void> {
    if (args.length !== 1) {
        console.log(`Usage: ${cmdName} <username>`);
        process.exit(1);
    }
    const username: string = args[0];
    const exists = await getUser(username);
    if (!exists) {
        console.log(`User ${username} does not exist in database, please register first`);
        process.exit(1)
    }
    setUser(username)
    console.log(`Username ${username} has been set!`);
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
     if (args.length !== 0) {
        console.log(`${cmdName} takes no arguments. Ignoring additional supplied arguments`);
    }
    const feed = await fetchFeed("https://www.wagslane.dev/index.xml");
    console.log(JSON.stringify(feed, null, 2));
    process.exit(0);
}

export async function handlerAddFeed(cmdName: string, ...args: string[]): Promise<void> {
    if (args.length !== 2) {
        console.log(`Usage: ${cmdName} <feed_name> <url>`);
        process.exit(1);
    }
    const config = readConfig();
    const feedName = args[0];
    const feedURL = args[1];
    const currentUser = config.currentUserName;
    const user = await getUser(currentUser);
    const user_id = user.id;
    const feed = await createFeed(feedName, feedURL, user_id);
    printFeed(feed, user);
    process.exit(0);
}

function printFeed(feed: Feed, user: User) {
    for (const item of Object.values(feed)) {
        console.log(`${item}`)
    }
    for (const item of Object.values(users)) {
        console.log(`${item}`)
    }
}

export type Feed = typeof feeds.$inferSelect;
export type User = typeof users.$inferSelect;
