import { format, parseISO } from "date-fns";

/**
 * Returns the local-time calendar date key ("yyyy-MM-dd") for a booking's
 * ISO timestamp.
 *
 * Bookings are stored with `.toISOString()` (UTC). In timezones behind UTC
 * (e.g. Argentina, UTC-3), evening bookings roll over to the next UTC day,
 * so naive `iso.startsWith("yyyy-MM-dd")` comparisons misplace them on the
 * following day. Always use this helper when grouping/filtering bookings
 * by local calendar date.
 */
export function localDateKey(iso: string): string {
  try {
    return format(parseISO(iso), "yyyy-MM-dd");
  } catch {
    return iso.slice(0, 10);
  }
}
