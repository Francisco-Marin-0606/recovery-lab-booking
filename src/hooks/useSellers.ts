import { useState, useEffect, useMemo, useCallback } from "react";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  subDays,
  parseISO,
  isBefore,
  isAfter,
  differenceInCalendarDays,
  startOfDay,
} from "date-fns";
import { db, ref, push, onValue, update, remove } from "../firebase";
import { generateSellerCode } from "../utils/validation";
import { useDemo } from "../contexts/DemoContext";
import type { Booking, Seller, SellerMetrics, SellerRankings } from "../types";

const DEFAULT_MONTHLY_GOAL = 15;

export function useSellers(bookings: Booking[]) {
  const demo = useDemo();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [newSellerName, setNewSellerName] = useState("");
  const [newSellerEmail, setNewSellerEmail] = useState("");
  const [newSellerPhone, setNewSellerPhone] = useState("");
  const [newSellerGoal, setNewSellerGoal] = useState<number>(DEFAULT_MONTHLY_GOAL);
  const [showAddSeller, setShowAddSeller] = useState(false);
  const [sellerRankingPeriod, setSellerRankingPeriod] = useState<"weekly" | "monthly">("weekly");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const sellersRef = ref(db, "sellers");
    const unsub = onValue(sellersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list: Seller[] = Object.entries(data).map(
          ([id, val]: [string, any]) => ({ id, ...val })
        );
        setSellers(list);
      } else {
        setSellers([]);
      }
    });
    return () => unsub();
  }, []);

  const effectiveSellers = demo.enabled ? demo.sellers : sellers;

  const handleAddSeller = useCallback(async () => {
    if (!newSellerName.trim() || !newSellerEmail.trim() || !newSellerPhone.trim()) return;
    const code = generateSellerCode(effectiveSellers);
    const payload = {
      name: newSellerName.trim(),
      email: newSellerEmail.trim(),
      phone: newSellerPhone.trim(),
      code,
      createdAt: new Date().toISOString(),
      monthlyGoal: newSellerGoal || DEFAULT_MONTHLY_GOAL,
      active: true,
    };

    if (demo.enabled) {
      demo.addSeller({ id: `demo-seller-local-${Date.now()}`, ...payload });
    } else {
      const sellersRef = ref(db, "sellers");
      await push(sellersRef, payload);
    }
    setNewSellerName("");
    setNewSellerEmail("");
    setNewSellerPhone("");
    setNewSellerGoal(DEFAULT_MONTHLY_GOAL);
    setShowAddSeller(false);
  }, [newSellerName, newSellerEmail, newSellerPhone, newSellerGoal, effectiveSellers, demo]);

  const handleUpdateSeller = useCallback(
    async (id: string, patch: Partial<Seller>) => {
      if (demo.enabled) {
        demo.updateSeller(id, patch);
        return;
      }
      await update(ref(db, `sellers/${id}`), patch);
    },
    [demo]
  );

  const handleDeleteSeller = useCallback(
    async (id: string) => {
      if (demo.enabled) {
        demo.deleteSeller(id);
        return;
      }
      await remove(ref(db, `sellers/${id}`));
    },
    [demo]
  );

  const handleCopyCode = useCallback((code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }, []);

  const handleCopyLink = useCallback((code: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const link = `${origin}/?ref=${encodeURIComponent(code)}`;
    navigator.clipboard.writeText(link);
    setCopiedCode(`link-${code}`);
    setTimeout(() => setCopiedCode(null), 2000);
  }, []);

  const matchSeller = useCallback(
    (referredBy: string): Seller | null => {
      if (!referredBy.trim()) return null;
      const input = referredBy.trim().toLowerCase();
      return (
        effectiveSellers.find(
          (s) => s.code.toLowerCase() === input || s.name.toLowerCase() === input
        ) || null
      );
    },
    [effectiveSellers]
  );

  const sellerRankings: SellerRankings = useMemo(() => {
    const now = new Date();
    const wStart = startOfWeek(now, { weekStartsOn: 1 });
    const wEnd = endOfWeek(now, { weekStartsOn: 1 });
    const mStart = startOfMonth(now);
    const mEnd = endOfMonth(now);

    const computeRankings = (filtered: Booking[]) => {
      const counts = new Map<string, number>();
      effectiveSellers.forEach((s) => counts.set(s.code, 0));
      filtered.forEach((b) => {
        const val = b.referredBy?.trim().toLowerCase();
        const matchedCode =
          b.sellerCode ||
          (val
            ? effectiveSellers.find(
                (s) =>
                  s.code.toLowerCase() === val || s.name.toLowerCase() === val
              )?.code
            : undefined);
        if (matchedCode && counts.has(matchedCode)) {
          counts.set(matchedCode, (counts.get(matchedCode) || 0) + (b.quantity || 1));
        }
      });
      return effectiveSellers
        .map((s) => ({ ...s, referrals: counts.get(s.code) || 0 }))
        .sort((a, b) => b.referrals - a.referrals);
    };

    const weeklyBookings = bookings.filter((b) => {
      const d = parseISO(b.start);
      return !isBefore(d, wStart) && !isBefore(addDays(wEnd, 1), d);
    });
    const monthlyBookings = bookings.filter((b) => {
      const d = parseISO(b.start);
      return !isBefore(d, mStart) && !isBefore(addDays(mEnd, 1), d);
    });

    return {
      weekly: computeRankings(weeklyBookings),
      monthly: computeRankings(monthlyBookings),
    };
  }, [bookings, effectiveSellers]);

  const sellerMetrics: Map<string, SellerMetrics> = useMemo(() => {
    const now = new Date();
    const todayStart = startOfDay(now);
    const d7 = subDays(todayStart, 7);
    const d14 = subDays(todayStart, 14);
    const d30 = subDays(todayStart, 30);
    const d60 = subDays(todayStart, 60);
    const mStart = startOfMonth(now);

    const bookingsBySeller = new Map<string, Booking[]>();
    effectiveSellers.forEach((s) => bookingsBySeller.set(s.code, []));

    bookings.forEach((b) => {
      const val = b.referredBy?.trim().toLowerCase();
      const matchedCode =
        b.sellerCode ||
        (val
          ? effectiveSellers.find(
              (s) =>
                s.code.toLowerCase() === val || s.name.toLowerCase() === val
            )?.code
          : undefined);
      if (matchedCode && bookingsBySeller.has(matchedCode)) {
        bookingsBySeller.get(matchedCode)!.push(b);
      }
    });

    const metricsMap = new Map<string, SellerMetrics>();

    effectiveSellers.forEach((seller) => {
      const list = bookingsBySeller.get(seller.code) || [];
      const goal = seller.monthlyGoal ?? DEFAULT_MONTHLY_GOAL;

      let totalAllTime = 0;
      let last7 = 0;
      let prev7 = 0;
      let last30 = 0;
      let prev30 = 0;
      let monthCount = 0;
      let lastActivity: Date | null = null;

      const emailVisits = new Map<string, number>();
      const sparkline = new Array(7).fill(0) as number[];
      const daysWithActivity = new Set<string>();

      list.forEach((b) => {
        const d = parseISO(b.start);
        const qty = b.quantity || 1;
        totalAllTime += qty;

        if (!isBefore(d, d7)) last7 += qty;
        else if (!isBefore(d, d14)) prev7 += qty;

        if (!isBefore(d, d30)) last30 += qty;
        else if (!isBefore(d, d60)) prev30 += qty;

        if (!isBefore(d, mStart)) monthCount += qty;

        if (!lastActivity || isAfter(d, lastActivity)) lastActivity = d;

        const emailKey = (b.clientEmail || "").trim().toLowerCase();
        if (emailKey) emailVisits.set(emailKey, (emailVisits.get(emailKey) || 0) + 1);

        const diffDays = differenceInCalendarDays(todayStart, startOfDay(d));
        if (diffDays >= 0 && diffDays < 7) {
          sparkline[6 - diffDays] += qty;
        }

        daysWithActivity.add(startOfDay(d).toISOString());
      });

      const uniqueClients = emailVisits.size;
      const repeatClients = Array.from(emailVisits.values()).filter((v) => v > 1).length;
      const repeatRate = uniqueClients > 0 ? (repeatClients / uniqueClients) * 100 : 0;

      const trend7dPct = prev7 === 0
        ? last7 > 0 ? 100 : 0
        : Math.round(((last7 - prev7) / prev7) * 100);
      const trend30dPct = prev30 === 0
        ? last30 > 0 ? 100 : 0
        : Math.round(((last30 - prev30) / prev30) * 100);

      let streakDays = 0;
      for (let i = 0; i < 30; i++) {
        const day = subDays(todayStart, i);
        if (daysWithActivity.has(day.toISOString())) streakDays++;
        else if (i > 0) break;
        else continue;
      }

      const goalProgress = goal > 0 ? (monthCount / goal) * 100 : 0;

      const lastActivityDays = lastActivity
        ? differenceInCalendarDays(todayStart, startOfDay(lastActivity))
        : null;

      let status: SellerMetrics["status"];
      if (lastActivityDays === null) status = "no-activity";
      else if (lastActivityDays > 14) status = "idle";
      else if (streakDays >= 3 && trend7dPct > 10) status = "hot";
      else if (goalProgress >= 80 || trend7dPct > 0) status = "on-track";
      else status = "cold";

      metricsMap.set(seller.code, {
        code: seller.code,
        totalAllTime,
        last7Days: last7,
        prev7Days: prev7,
        last30Days: last30,
        prev30Days: prev30,
        trend7dPct,
        trend30dPct,
        uniqueClients,
        repeatClients,
        repeatRate,
        lastActivity: lastActivity ? (lastActivity as Date).toISOString() : null,
        streakDays,
        sparkline,
        goal,
        goalProgress: Math.min(goalProgress, 999),
        status,
      });
    });

    return metricsMap;
  }, [bookings, effectiveSellers]);

  const teamMetrics = useMemo(() => {
    const now = new Date();
    const mStart = startOfMonth(now);
    const d7 = subDays(startOfDay(now), 7);
    const d14 = subDays(startOfDay(now), 14);

    let monthTotal = 0;
    let last7 = 0;
    let prev7 = 0;
    const emailVisits = new Map<string, number>();

    bookings.forEach((b) => {
      const val = b.referredBy?.trim().toLowerCase();
      const matchedCode =
        b.sellerCode ||
        (val
          ? effectiveSellers.find(
              (s) =>
                s.code.toLowerCase() === val || s.name.toLowerCase() === val
            )?.code
          : undefined);
      if (!matchedCode) return;

      const d = parseISO(b.start);
      const qty = b.quantity || 1;

      if (!isBefore(d, mStart)) monthTotal += qty;
      if (!isBefore(d, d7)) last7 += qty;
      else if (!isBefore(d, d14)) prev7 += qty;

      const emailKey = (b.clientEmail || "").trim().toLowerCase();
      if (emailKey) emailVisits.set(emailKey, (emailVisits.get(emailKey) || 0) + 1);
    });

    const activeSellers = Array.from(sellerMetrics.values()).filter(
      (m) => m.last30Days > 0
    ).length;

    const totalGoal = effectiveSellers.reduce(
      (sum, s) => sum + (s.monthlyGoal ?? DEFAULT_MONTHLY_GOAL),
      0
    );
    const goalProgressPct = totalGoal > 0 ? Math.round((monthTotal / totalGoal) * 100) : 0;

    const repeatRatePct = emailVisits.size > 0
      ? Math.round(
          (Array.from(emailVisits.values()).filter((v) => v > 1).length /
            emailVisits.size) *
            100
        )
      : 0;

    const trend7dPct = prev7 === 0
      ? last7 > 0 ? 100 : 0
      : Math.round(((last7 - prev7) / prev7) * 100);

    let topSeller: { name: string; code: string; count: number } | null = null;
    sellerMetrics.forEach((m, code) => {
      const s = effectiveSellers.find((x) => x.code === code);
      if (!s) return;
      if (!topSeller || m.last30Days > topSeller.count) {
        topSeller = { name: s.name, code: s.code, count: m.last30Days };
      }
    });

    return {
      monthTotal,
      totalGoal,
      goalProgressPct,
      activeSellers,
      totalSellers: effectiveSellers.length,
      last7,
      prev7,
      trend7dPct,
      repeatRatePct,
      topSeller,
    };
  }, [bookings, effectiveSellers, sellerMetrics]);

  return {
    sellers: effectiveSellers,
    newSellerName,
    setNewSellerName,
    newSellerEmail,
    setNewSellerEmail,
    newSellerPhone,
    setNewSellerPhone,
    newSellerGoal,
    setNewSellerGoal,
    showAddSeller,
    setShowAddSeller,
    sellerRankingPeriod,
    setSellerRankingPeriod,
    copiedCode,
    handleAddSeller,
    handleUpdateSeller,
    handleDeleteSeller,
    handleCopyCode,
    handleCopyLink,
    matchSeller,
    sellerRankings,
    sellerMetrics,
    teamMetrics,
  };
}
