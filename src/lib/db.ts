import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// This connects to your Neon DB using the URL from .env.local
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);