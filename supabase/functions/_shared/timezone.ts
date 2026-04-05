/**
 * Timezone utilities for date calculations.
 * Used for streak evaluation and assignment generation at local midnight.
 */

/**
 * Get the current date string (YYYY-MM-DD) in the user's timezone.
 */
export function getTodayInTimezone(timezone: string): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(new Date());
  } catch {
    // Fallback to UTC if timezone is invalid
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * Get yesterday's date string in the user's timezone.
 */
export function getYesterdayInTimezone(timezone: string): string {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(yesterday);
  } catch {
    return yesterday.toISOString().split('T')[0];
  }
}

/**
 * Validate that a timezone string is a valid IANA timezone.
 */
export function isValidTimezone(tz: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}
