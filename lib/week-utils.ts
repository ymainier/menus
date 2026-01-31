/**
 * Get the number of ISO weeks in a year (52 or 53).
 * A year has 53 weeks if Jan 1 is a Thursday, or if it's a leap year and Jan 1 is a Wednesday.
 */
export function getWeeksInYear(year: number): number {
  const jan1 = new Date(year, 0, 1);
  const dec31 = new Date(year, 11, 31);
  // Thursday = 4, check if Jan 1 or Dec 31 is a Thursday
  if (jan1.getDay() === 4 || dec31.getDay() === 4) {
    return 53;
  }
  return 52;
}

/**
 * Increment an ISO week string by one week, handling year boundaries.
 */
export function incrementWeek(weekNumber: string): string {
  const match = weekNumber.match(/^(\d{4})-W(\d{2})$/);
  if (!match) {
    throw new Error(`Invalid week format: ${weekNumber}`);
  }

  const year = parseInt(match[1], 10);
  const week = parseInt(match[2], 10);
  const weeksInYear = getWeeksInYear(year);

  if (week >= weeksInYear) {
    // Move to week 1 of next year
    return `${year + 1}-W01`;
  }

  return `${year}-W${String(week + 1).padStart(2, "0")}`;
}

/**
 * Get current week number (Saturday-Friday convention).
 * Our app weeks run Saturday to Friday.
 */
export function getCurrentWeekNumber(): string {
  const now = new Date();

  // Get the ISO week for today
  const year = now.getFullYear();
  const jan4 = new Date(year, 0, 4);
  const dayOfWeek = jan4.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const mondayOfWeek1 = new Date(jan4);
  mondayOfWeek1.setDate(jan4.getDate() - daysToMonday);

  // Calculate which ISO week today is in
  const diffMs = now.getTime() - mondayOfWeek1.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const isoWeek = Math.floor(diffDays / 7) + 1;

  // Get Monday of the current ISO week
  const mondayOfCurrentWeek = new Date(mondayOfWeek1);
  mondayOfCurrentWeek.setDate(mondayOfWeek1.getDate() + (isoWeek - 1) * 7);

  // Our app weeks run Saturday to Friday
  // Saturday = Monday + 5
  const saturdayOfCurrentWeek = new Date(mondayOfCurrentWeek);
  saturdayOfCurrentWeek.setDate(mondayOfCurrentWeek.getDate() + 5);

  // If today is before the Saturday of this ISO week, we're in the previous app week
  if (now < saturdayOfCurrentWeek) {
    const prevWeek = isoWeek - 1;
    if (prevWeek < 1) {
      // Handle year boundary - use week 52 or 53 of previous year
      const prevYear = year - 1;
      const lastWeek = getWeeksInYear(prevYear);
      return `${prevYear}-W${String(lastWeek).padStart(2, "0")}`;
    }
    return `${year}-W${String(prevWeek).padStart(2, "0")}`;
  }

  return `${year}-W${String(isoWeek).padStart(2, "0")}`;
}

/**
 * Parse an ISO week string and return the start (Saturday) and end (Friday) dates.
 * Our week starts on Saturday and ends on Friday.
 */
export function getWeekDateRange(weekNumber: string): {
  start: Date;
  end: Date;
} {
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
