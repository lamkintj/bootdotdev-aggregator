import { db } from "../index";
import { feeds } from "../schema";

export async function createFeed(feedName: string, url: string, user_id: string) {
    const [result] = await db.
    insert(feeds).
    values({
        name: feedName,
        url: url,
        userId: user_id,
    }).returning()
    return result;
}


