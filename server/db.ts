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

// Add timezone parameter to connection string if not present
const connectionString = process.env.DATABASE_URL.includes('timezone=') 
  ? process.env.DATABASE_URL 
  : `${process.env.DATABASE_URL}?options=timezone=Australia/Sydney`;

// Configure connection with timezone settings
export const pool = new Pool({ 
  connectionString,
  options: '-c timezone=Australia/Sydney -c datestyle=ISO,MDY'
});

// Run session SET commands after connection
pool.on('connect', async (client) => {
  try {
    // Set timezone to Australia/Sydney
    await client.query('SET timezone TO \'Australia/Sydney\'');
    await client.query('SET datestyle TO ISO, MDY');
    console.log('Successfully set timezone and datestyle for new connection');

    // Verify settings
    const tzResult = await client.query('SHOW timezone');
    console.log('Current timezone:', tzResult.rows[0].TimeZone);
  } catch (error) {
    console.error('Error setting timezone:', error);
    throw error; // Ensure connection fails if we can't set timezone
  }
});

// Create a utility function to format dates for PostgreSQL
export function formatPgDate(date: Date | string): string {
  if (typeof date === 'string') {
    // If it's already a string in YYYY-MM-DD format, return it
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    // Otherwise, convert to Date and format
    date = new Date(date);
  }

  // Format as YYYY-MM-DD with respect to Australia/Sydney timezone
  return date.toLocaleString('en-AU', { 
    timeZone: 'Australia/Sydney',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).split('/').reverse().join('-');
}

// Configure drizzle with the pool
export const db = drizzle(pool, { schema });