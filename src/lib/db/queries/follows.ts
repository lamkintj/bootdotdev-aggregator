import { db } from "../index";
import { users, feeds, feed_follows } from "../schema";
import { eq } from "drizzle-orm";

export async function createFeedFollow (username: string, feedURL: string) {
    const [linkedUserId] = await db.
    select({name: users.name, id: users.id}).
    from(users).
    where(eq(users.name, username));

    const [linkedFeedId] = await db.
    select({url: feeds.url, id: feeds.id}).
    from(feeds).
    where(eq(feeds.url, feedURL));

    const [newFeedFollow] = await db.
    insert(feed_follows).
    values({
        feedId: linkedFeedId.id,
        userId: linkedUserId.id,
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