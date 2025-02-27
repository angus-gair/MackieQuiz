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
  options: '-c timezone=UTC -c datestyle=ISO,MDY'
});

// Run session SET commands after connection
pool.on('connect', async (client) => {
  // Completely disable timezone adjustment
  await client.query('SET timezone TO UTC');
  await client.query('SET datestyle TO ISO, MDY');
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
  
  // Format as YYYY-MM-DD
  return date.toISOString().split('T')[0];
}

export const db = drizzle({ 
  client: pool, 
  schema,
  // Add custom type parsers to prevent PostgreSQL date conversion
  typeMappers: {
    // Ensure dates are handled consistently
    date: {
      from: (val) => val ? val.split('T')[0] : null,
      to: (date) => date ? formatPgDate(date) : null,
    }
  }
});
