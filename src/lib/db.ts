import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./db/schema";


const sql = neon(process.env.DATABASE_URL!);

// Pass the schema object as the second argument
export const db = drizzle(sql, { schema });