import { RSSItem } from "src/feed";
import { db } from "../index";
import { posts, feeds } from "../schema";
import { sql, eq } from "drizzle-orm";
import { User, Feed } from "src/handler";

export async function createPost(feed: Feed, post: RSSItem) {
    try {
        const [result] = 
        await db.
        insert(posts).
        values({
            title: post.title,
            url: post.url,
            description: post.description,
            publishedAt: new Date(post.pubDate),
            feedId: feed.id,
        }).returning()
        return result;
    } catch (error) {
        if (error instanceof Error && (error as any).code === '23505') {
        // duplicate, skip silently
        }
        console.log(error);
    }
};

export async function getPostsForUser(user: User, limit: number = 2) { 
    console.log(`supplied limit value is ${limit}`)
    const postList = await db.
        select({
            feed_name: feeds.name,
            title: posts.title,
            url: posts.url,
            description: posts.description,
            publish_date: posts.publishedAt,
        }).
        from(posts).
        innerJoin(feeds, eq(posts.feedId, feeds.id)).
        limit(limit).
        orderBy(sql`${posts.publishedAt} desc`);

    console.log(`Here are the latest ${limit} posts for user ${user.name}`);
    console.log(postList);
}