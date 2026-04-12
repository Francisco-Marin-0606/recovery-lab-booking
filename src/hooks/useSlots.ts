import { useState, useEffect, useCallback } from "react";
import {
  format,
  isBefore,
  addHours,
  setHours,
  setMinutes,
  parseISO,
} from "date-fns";
import { MAX_CAPACITY } from "../constants";
import type { Booking, TimeSlot } from "../types";

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

export function useSlots(
  selectedDate: Date,
  isConnected: boolean,
  bookings: Booking[]
) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);

  const generateSlotsFromFirebase = useCallback(() => {
    const dayStart = setHours(setMinutes(selectedDate, 0), 8);
    const dayEnd = setHours(setMinutes(selectedDate, 0), 20);
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const dayBookings = bookings.filter((b) => b.start.startsWith(dateStr));

    const daySlots: TimeSlot[] = [];
    let current = dayStart;

    while (isBefore(current, dayEnd)) {
      const slotEnd = addHours(current, 1);
      const bookedCount = countBookingsForSlot(current, slotEnd, dayBookings);

      daySlots.push({
        start: current,
        end: slotEnd,
        available: bookedCount < MAX_CAPACITY,
        bookedCount,
        capacity: MAX_CAPACITY,
      });

      current = slotEnd;
    }

    setSlots(daySlots);
  }, [selectedDate, bookings]);

  const fetchAvailability = useCallback(async () => {
    const start = setHours(setMinutes(selectedDate, 0), 8);
    const end = setHours(setMinutes(selectedDate, 0), 20);

    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const dayBookings = bookings.filter((b) => b.start.startsWith(dateStr));

      const daySlots: TimeSlot[] = [];
      let current = start;

      while (isBefore(current, end)) {
        const slotEnd = addHours(current, 1);
        const bookedCount = countBookingsForSlot(current, slotEnd, dayBookings);

        daySlots.push({
          start: current,
          end: slotEnd,
          available: bookedCount < MAX_CAPACITY,
          bookedCount,
          capacity: MAX_CAPACITY,
        });

        current = slotEnd;
      }

      setSlots(daySlots);
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

  return { slots };
}
