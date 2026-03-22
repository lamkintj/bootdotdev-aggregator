import { db } from "../index";
import { users, feeds, feed_follows } from "../schema";
import { eq, and } from "drizzle-orm";

// HELPER FUNCTIONS

async function linkUser(user: string) {
    const [linkedUser] = await db.
    select({name: users.name, id: users.id}).
    from(users).
    where(eq(users.name, user));
    return linkedUser;
}
async function linkFeed(url: string) {
    const [linkedFeed] = await db.
    select({url: feeds.url, id: feeds.id}).
    from(feeds).
    where(eq(feeds.url, url));
    return linkedFeed;
}

// END HELPER FUNCTIONS
export async function createFeedFollow (user: string, url: string) {
    const linkedFeed = await linkFeed(url);
    const linkedUser = await linkUser(user);

    const [newFeedFollow] = await db.
    insert(feed_follows).
    values({
        feedId: linkedFeed.id,
        userId: linkedUser.id,
    }).returning();

    const [joined] = await db.
    select().
    from(feed_follows).
    innerJoin(feeds, eq(feeds.id, newFeedFollow.feedId)).
    innerJoin(users, eq(users.id, newFeedFollow.userId));

    return {
        followRecord: joined.feed_follows,
        feedName: joined.feeds.name,
        userName: joined.users.name,
    }
};

export async function getFeedFollowsForUser (username: string) {

    const feedFollows = await db.
    select().
    from(feed_follows).
    innerJoin(users, eq(feed_follows.userId, users.id)).
    innerJoin(feeds, eq(feed_follows.feedId, feeds.id)).
    where(eq(users.name, username));

    return feedFollows.map((r) => ({
        followedFeed: r.feed_follows,
        feedName: r.feeds.name,
        userName: r.users.name,
    }));
}

export async function unfollowFeed(user: string, url: string): Promise<void> {
    const linkedFeed = await linkFeed(url);
    const linkedUser = await linkUser(user);

    await db.
    delete(feed_follows).
    where(
        and(
            eq(feed_follows.userId, linkedUser.id),
            eq(feed_follows.feedId, linkedFeed.id)
        )
    );
}