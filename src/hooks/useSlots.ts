import { useState, useEffect, useCallback } from "react";
import {
  format,
  isBefore,
  addHours,
  setHours,
  setMinutes,
  parseISO,
  isSameDay,
} from "date-fns";
import { MAX_CAPACITY, SCHEDULE } from "../constants";
import type { Booking, TimeSlot } from "../types";

export type SlotsEmptyReason =
  | "closed-today"
  | "all-past"
  | "fully-booked"
  | null;

function countBookingsForSlot(
  slotStart: Date,
  slotEnd: Date,
  dayBookings: Booking[]
): number {
  return dayBookings.reduce((count, b) => {
    const bStart = parseISO(b.start);
    const bEnd = parseISO(b.end);
    if (isBefore(slotStart, bEnd) && isBefore(bStart, slotEnd)) {
      return count + (b.quantity || 1);
    }
    return count;
  }, 0);
}

export { countBookingsForSlot };

function parseHHMM(value: string): { hour: number; minute: number } {
  const [h, m] = value.split(":").map(Number);
  return { hour: h, minute: m };
}

function getDayWindow(
  date: Date
): { dayStart: Date; dayEnd: Date } | null {
  const entry = SCHEDULE.find((d) => d.weekday === date.getDay());
  if (!entry || !entry.open || !entry.close) return null;
  const { hour: oh, minute: om } = parseHHMM(entry.open);
  const { hour: ch, minute: cm } = parseHHMM(entry.close);
  const dayStart = setMinutes(setHours(date, oh), om);
  const dayEnd = setMinutes(setHours(date, ch), cm);
  return { dayStart, dayEnd };
}

interface BuildResult {
  slots: TimeSlot[];
  emptyReason: SlotsEmptyReason;
}

function buildSlotsForDate(
  selectedDate: Date,
  bookings: Booking[]
): BuildResult {
  const window = getDayWindow(selectedDate);
  if (!window) {
    return { slots: [], emptyReason: "closed-today" };
  }

  const { dayStart, dayEnd } = window;
  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const dayBookings = bookings.filter((b) => b.start.startsWith(dateStr));
  const now = new Date();
  const isToday = isSameDay(selectedDate, now);

  const daySlots: TimeSlot[] = [];
  let slotsEligibleByTime = 0;
  let current = dayStart;

  while (isBefore(current, dayEnd)) {
    const slotEnd = addHours(current, 1);
    const bookedCount = countBookingsForSlot(current, slotEnd, dayBookings);

    if (!isBefore(current, now)) {
      slotsEligibleByTime += 1;
      daySlots.push({
        start: current,
        end: slotEnd,
        available: bookedCount < MAX_CAPACITY,
        bookedCount,
        capacity: MAX_CAPACITY,
      });
    }

    current = slotEnd;
  }

  if (daySlots.length === 0) {
    return {
      slots: [],
      emptyReason: isToday ? "all-past" : "closed-today",
    };
  }

  const anyAvailable = daySlots.some((s) => s.available);
  if (!anyAvailable) {
    return { slots: daySlots, emptyReason: "fully-booked" };
  }

  if (isToday && slotsEligibleByTime === 0) {
    return { slots: [], emptyReason: "all-past" };
  }

  return { slots: daySlots, emptyReason: null };
}

export function useSlots(
  selectedDate: Date,
  isConnected: boolean,
  bookings: Booking[]
) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [emptyReason, setEmptyReason] = useState<SlotsEmptyReason>(null);

  const generateSlotsFromFirebase = useCallback(() => {
    const { slots: next, emptyReason: reason } = buildSlotsForDate(
      selectedDate,
      bookings
    );
    setSlots(next);
    setEmptyReason(reason);
  }, [selectedDate, bookings]);

  const fetchAvailability = useCallback(async () => {
    try {
      const { slots: next, emptyReason: reason } = buildSlotsForDate(
        selectedDate,
        bookings
      );
      setSlots(next);
      setEmptyReason(reason);
    } catch (err) {
      console.error(err);
    }
  }, [selectedDate, bookings]);

  useEffect(() => {
    if (isConnected) {
      fetchAvailability();
    } else {
      generateSlotsFromFirebase();
    }
  }, [selectedDate, isConnected, bookings, fetchAvailability, generateSlotsFromFirebase]);

  return { slots, emptyReason };
}
