import { db } from "../index";
import { feeds } from "../schema";
import { sql, eq } from "drizzle-orm";
import { fetchFeed, RSSItem } from "src/feed";
import { createPost } from "./posts";
import { Feed } from "src/handler";

export async function createFeed(feedName: string, url: string, user_id: string) {
    const [result] = await db.
    insert(feeds).
    values({
        name: feedName,
        url: url,
        userId: user_id,
    }).returning()
    return result;
};

export async function markFeedFetched(feedId: string) {
    await db.update(feeds).
    set({last_fetched_at: sql`NOW()`,
        updatedAt: sql`NOW()`,
    }).
    where(eq(feeds.id, feedId));
}

export async function getNextFeedToFetch() {
    const [nextFeed] = await db.
    select().
    from(feeds).
    orderBy(sql`${feeds.last_fetched_at} asc nulls first`);
    return nextFeed;
}

export async function scrapeFeeds() {
    const feed = await getNextFeedToFetch();
    if (!feed) {
        console.log(`No feeds to fetch.`);
        return;
    }
    console.log(`Found a feed to fetch!`);
    scrapeFeed(feed);
}

async function scrapeFeed(feed: Feed) {
    await markFeedFetched(feed.id);
    const feedData = await fetchFeed(feed.url);
    const posts: RSSItem[] = feedData.channel.item;
    console.log(
        `Feed ${feed.name} collected, ${posts.length} posts found`,
    );
    for (const post of posts) {
        createPost(feed.id, post);
    };
    console.log(`Finished writing entries to database from ${feed.name}`)
}


