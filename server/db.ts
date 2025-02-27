import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure connection with timezone settings
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  // Set timezone to UTC to prevent automatic conversions
  options: '-c timezone=UTC'
});

// Run session SET commands after connection
pool.on('connect', async (client) => {
  // Disable timezone conversion and set to UTC explicitly
  await client.query('SET timezone TO UTC');
  // Force PostgreSQL to store dates as UTC timestamps
  await client.query('SET datestyle TO ISO, MDY');
});

export const db = drizzle({ client: pool, schema });
