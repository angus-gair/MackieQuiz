
/**
 * Utility functions to handle dates in PostgreSQL
 */

/**
 * Format a date for PostgreSQL to prevent timezone adjustments
 * This uses the UTC year, month, and day to create a date in YYYY-MM-DD format
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
  
  // Use padStart to ensure 2 digits for month and day
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // +1 because months are 0-indexed
  const day = String(date.getUTCDate()).padStart(2, '0');
  
  // Create YYYY-MM-DD format without timezone information
  return `${year}-${month}-${day}`;
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

/**
 * Create a Date object for a specific date with time set to 00:00:00 UTC
 * This ensures the date doesn't shift when converted to different timezones
 * @param year Year
 * @param month Month (1-12)
 * @param day Day (1-31)
 * @returns Date object set to the specified date at midnight UTC
 */
export function createUTCDate(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Get a Date object representing the Monday of the week containing the specified date
 * @param date Date within the week
 * @returns Date object set to the Monday of that week
 */
export function getWeekMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  
  // Create a new date with the same year/month but set to the Monday
  return createUTCDate(d.getUTCFullYear(), d.getUTCMonth() + 1, diff);
}

/**
 * Get a Date object representing the Sunday of the week containing the specified date
 * @param date Date within the week
 * @returns Date object set to the Sunday of that week
 */
export function getWeekSunday(date: Date): Date {
  const monday = getWeekMonday(date);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6); // Monday + 6 days = Sunday
  return sunday;
}
