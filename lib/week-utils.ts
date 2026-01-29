/**
 * Parse an ISO week string and return the start (Saturday) and end (Friday) dates.
 * Our week starts on Saturday and ends on Friday.
 */
export function getWeekDateRange(weekNumber: string): { start: Date; end: Date } {
  // Parse ISO week format "2025-W04"
  const match = weekNumber.match(/^(\d{4})-W(\d{2})$/);
  if (!match) {
    throw new Error(`Invalid week format: ${weekNumber}`);
  }

  const year = parseInt(match[1], 10);
  const week = parseInt(match[2], 10);

  // Find Jan 4 of the year (always in week 1)
  const jan4 = new Date(year, 0, 4);
  // Find Monday of week 1
  const dayOfWeek = jan4.getDay();
  const mondayOfWeek1 = new Date(jan4);
  // getDay(): 0=Sun, 1=Mon, ..., 6=Sat
  // We need to go back to Monday
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  mondayOfWeek1.setDate(jan4.getDate() - daysToMonday);

  // Find Monday of the requested week
  const mondayOfWeek = new Date(mondayOfWeek1);
  mondayOfWeek.setDate(mondayOfWeek1.getDate() + (week - 1) * 7);

  // Our week starts on Saturday (Monday + 5) and ends on Friday (Saturday + 6)
  const saturday = new Date(mondayOfWeek);
  saturday.setDate(mondayOfWeek.getDate() + 5);

  const friday = new Date(saturday);
  friday.setDate(saturday.getDate() + 6);

  return { start: saturday, end: friday };
}

/**
 * Format a date in a human-readable format (e.g., "Sat, 25 Jan 2025")
 */
export function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    weekday: "short",
  });
}
