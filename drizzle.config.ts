import { defineConfig } from "drizzle-kit";
import { readConfig } from "./src/config.js"

const configFile = readConfig();
const dbUrl: string = configFile.dbUrl;

const schemaFile: string = "schema.ts";
const dbPath: string = "lib/db/";

export default defineConfig({
  schema: `src/${dbPath}${schemaFile}`,
  out: `src/${dbPath}`,
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl,
  },
});