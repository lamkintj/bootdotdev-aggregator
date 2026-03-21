import { db } from "../index";
import { users } from "../schema";
import { eq } from "drizzle-orm";

export async function createUser(username: string) {
    const [result] = await db.
    insert(users).
    values({ name: username }).returning();
    return result;
}

export async function getUser(username: string) {
    const result = await db
    .select()
    .from(users)
    .where(eq(users.name, username));
    return result[0];
}

export async function reset() {
    await db.delete(users);
}

export async function getAllUsers() {
    const result = await db
    .select({name: users.name})
    .from(users)
    return result;
}