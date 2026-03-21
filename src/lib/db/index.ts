import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "src/lib/db/schema";
import { readConfig, Config } from "src/config";

const config: Config = readConfig();
const conn = postgres(config.dbUrl);
export const db = drizzle(conn, {schema});