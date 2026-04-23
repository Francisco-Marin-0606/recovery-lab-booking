const FIREBASE_DB_URL =
  process.env.FIREBASE_DATABASE_URL ||
  "https://prueba-juan-d40b0-default-rtdb.firebaseio.com";

export interface StoredBooking {
  id: string;
  summary?: string;
  description?: string;
  start: string;
  end: string;
  createdAt?: string;
  clientName: string;
  clientEmail: string;
  quantity?: number;
  sport?: string;
  reason?: string;
  referredBy?: string;
  sellerCode?: string;
  reminderSent?: boolean;
  reminderSentAt?: string;
  cancelled?: boolean;
  cancelledAt?: string;
  calendarEventId?: string;
  cancelToken?: string;
}

export async function fetchAllBookings(): Promise<StoredBooking[]> {
  const res = await fetch(`${FIREBASE_DB_URL}/bookings.json`);
  if (!res.ok) {
    throw new Error(`Firebase fetch failed: ${res.status}`);
  }
  const data = (await res.json()) as Record<string, Omit<StoredBooking, "id">> | null;
  if (!data) return [];
  return Object.entries(data).map(([id, val]) => ({ id, ...val }));
}

export async function fetchBooking(id: string): Promise<StoredBooking | null> {
  const res = await fetch(`${FIREBASE_DB_URL}/bookings/${id}.json`);
  if (!res.ok) return null;
  const data = (await res.json()) as Omit<StoredBooking, "id"> | null;
  if (!data) return null;
  return { id, ...data };
}

export async function updateBooking(
  id: string,
  patch: Partial<StoredBooking>
): Promise<void> {
  const res = await fetch(`${FIREBASE_DB_URL}/bookings/${id}.json`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Firebase update failed: ${res.status} ${text}`);
  }
}
