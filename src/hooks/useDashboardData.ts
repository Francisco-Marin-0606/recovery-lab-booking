import { useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  isBefore,
  addDays,
  eachDayOfInterval,
  parseISO,
} from "date-fns";
import { es } from "date-fns/locale";
import { DAILY_GOAL, MONTHLY_GOAL, WORKING_DAYS_PER_MONTH } from "../constants";
import type { Booking, DashboardData } from "../types";

export function useDashboardData(bookings: Booking[]): DashboardData {
  return useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const todayStr = format(now, "yyyy-MM-dd");

    const monthBookings = bookings.filter((b) => {
      const d = parseISO(b.start);
      return !isBefore(d, monthStart) && !isBefore(addDays(monthEnd, 1), d);
    });

    const monthlyPeople = monthBookings.reduce((s, b) => s + (b.quantity || 1), 0);
    const todayBookings = bookings.filter((b) => b.start.startsWith(todayStr));
    const todayPeople = todayBookings.reduce((s, b) => s + (b.quantity || 1), 0);

    const dayOfMonth = now.getDate();
    const idealPace = Math.round(
      (MONTHLY_GOAL / WORKING_DAYS_PER_MONTH) *
        Math.min(dayOfMonth, WORKING_DAYS_PER_MONTH)
    );
    const paceGap = monthlyPeople - idealPace;

    const clientVisits = new Map<
      string,
      { name: string; email: string; visits: number; totalPeople: number; lastVisit: string }
    >();
    bookings.forEach((b) => {
      const existing = clientVisits.get(b.clientEmail);
      if (existing) {
        existing.visits += 1;
        existing.totalPeople += b.quantity || 1;
        if (b.start > existing.lastVisit) existing.lastVisit = b.start;
      } else {
        clientVisits.set(b.clientEmail, {
          name: b.clientName,
          email: b.clientEmail,
          visits: 1,
          totalPeople: b.quantity || 1,
          lastVisit: b.start,
        });
      }
    });

    const recurringClients = Array.from(clientVisits.values())
      .filter((c) => c.visits > 1)
      .sort((a, b) => b.visits - a.visits);

    const dailyBreakdown: { date: string; label: string; people: number }[] = [];
    const daysToShow = eachDayOfInterval({
      start: monthStart,
      end: isBefore(now, monthEnd) ? now : monthEnd,
    });
    daysToShow.forEach((day) => {
      const ds = format(day, "yyyy-MM-dd");
      const dayB = bookings.filter((b) => b.start.startsWith(ds));
      const dayP = dayB.reduce((s, b) => s + (b.quantity || 1), 0);
      dailyBreakdown.push({ date: ds, label: format(day, "d", { locale: es }), people: dayP });
    });

    const monthlyPercent = Math.min(100, Math.round((monthlyPeople / MONTHLY_GOAL) * 100));
    const dailyPercent = Math.min(100, Math.round((todayPeople / DAILY_GOAL) * 100));

    const totalPeopleAllTime = bookings.reduce((s, b) => s + (b.quantity || 1), 0);

    const sportMap = new Map<string, number>();
    bookings.forEach((b) => {
      if (b.sport?.trim()) {
        const key = b.sport.trim();
        sportMap.set(key, (sportMap.get(key) || 0) + (b.quantity || 1));
      }
    });
    const topSports = Array.from(sportMap.entries())
      .map(([sport, count]) => ({ sport, count }))
      .sort((a, b) => b.count - a.count);

    const hourDist = new Array(12).fill(0) as number[];
    bookings.forEach((b) => {
      const h = parseISO(b.start).getHours();
      if (h >= 8 && h < 20) hourDist[h - 8] += b.quantity || 1;
    });
    const peakHourIdx = hourDist.indexOf(Math.max(...hourDist));
    const peakHour = hourDist[peakHourIdx] > 0 ? peakHourIdx + 8 : -1;

    const refMap = new Map<string, number>();
    bookings.forEach((b) => {
      if (b.referredBy?.trim()) {
        const key = b.referredBy.trim();
        refMap.set(key, (refMap.get(key) || 0) + (b.quantity || 1));
      }
    });
    const topReferrals = Array.from(refMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const todayBookingsSorted = [...todayBookings].sort((a, b) =>
      a.start.localeCompare(b.start)
    );
    const avgPerDay =
      dailyBreakdown.length > 0
        ? Math.round(dailyBreakdown.reduce((s, d) => s + d.people, 0) / dailyBreakdown.length)
        : 0;
    const daysAboveGoal = dailyBreakdown.filter((d) => d.people >= DAILY_GOAL).length;

    return {
      monthlyPeople,
      todayPeople,
      idealPace,
      paceGap,
      recurringClients,
      totalUniqueClients: clientVisits.size,
      dailyBreakdown,
      monthlyPercent,
      dailyPercent,
      monthBookingsCount: monthBookings.length,
      topSports,
      hourDistribution: hourDist,
      peakHour,
      topReferrals,
      todayBookingsList: todayBookingsSorted,
      totalPeopleAllTime,
      avgPerDay,
      daysAboveGoal,
    };
  }, [bookings]);
}
