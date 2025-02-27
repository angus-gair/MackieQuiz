
/**
 * Utility functions to handle dates in PostgreSQL
 */

/**
 * Format a date for PostgreSQL to prevent timezone adjustments
 * @param date Date to format
 * @returns Formatted date string (YYYY-MM-DD)
 */
export function formatDateForPg(date: Date | string): string {
  if (typeof date === 'string') {
    // If it's already a string in YYYY-MM-DD format, return it
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    // Otherwise, convert to Date and format
    date = new Date(date);
  }
  
  // Format as YYYY-MM-DD without time component
  return date.toISOString().split('T')[0];
}

/**
 * Parse a date from PostgreSQL without timezone adjustments
 * @param pgDate Date string from PostgreSQL
 * @returns Date string (YYYY-MM-DD)
 */
export function parseDateFromPg(pgDate: string): string {
  // If it has a time component, split it off
  if (pgDate && pgDate.includes('T')) {
    return pgDate.split('T')[0];
  }
  return pgDate;
}
