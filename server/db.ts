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

// Create connection with timezone parameters
const connectionString = process.env.DATABASE_URL.includes('timezone=') 
  ? process.env.DATABASE_URL 
  : process.env.DATABASE_URL + (process.env.DATABASE_URL.includes('?') ? '&' : '?') + 'options=timezone=Australia/Sydney';

export const pool = new Pool({ connectionString });

// Set timezone explicitly on each new connection
pool.on('connect', async (client) => {
  try {
    await client.query("SET timezone TO 'Australia/Sydney'");

    // Verify timezone was set correctly
    const result = await client.query('SHOW timezone');
    console.log('Connection timezone set to:', result.rows[0].timezone);
  } catch (error) {
    console.error('Failed to set timezone:', error);
  }
});

export const db = drizzle({ client: pool, schema });