import { format, formatDistanceToNowStrict, parseISO } from "date-fns";

/**
 * Formats a date string or Date object into a readable date format (e.g., "Jan 1, 2023").
 */
export function formatDate(
  dateInput: string | Date,
  dateFormat: string = "MMM dd, yyyy"
): string {
  if (!dateInput) return "N/A";
  const date = typeof dateInput === "string" ? parseISO(dateInput) : dateInput;
  return format(date, dateFormat);
}

/**
 * Formats a date string or Date object into a relative time (e.g., "3 days ago").
 */
export function formatRelativeTime(dateInput: string | Date): string {
  if (!dateInput) return "N/A";
  const date = typeof dateInput === "string" ? parseISO(dateInput) : dateInput;
  return formatDistanceToNowStrict(date, { addSuffix: true });
}

/**
 * Checks if a date is in the past.
 */
export function isPastDate(dateInput: string | Date): boolean {
  if (!dateInput) return false;
  const date = typeof dateInput === "string" ? parseISO(dateInput) : dateInput;
  return date < new Date();
}
