import { useState, useEffect, useMemo, useCallback } from "react";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  parseISO,
  isBefore,
} from "date-fns";
import { db, ref, push, onValue } from "../firebase";
import { generateSellerCode } from "../utils/validation";
import { useDemo } from "../contexts/DemoContext";
import type { Booking, Seller, SellerRankings } from "../types";

export function useSellers(bookings: Booking[]) {
  const demo = useDemo();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [newSellerName, setNewSellerName] = useState("");
  const [newSellerEmail, setNewSellerEmail] = useState("");
  const [newSellerPhone, setNewSellerPhone] = useState("");
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
    setShowAddSeller(false);
  }, [newSellerName, newSellerEmail, newSellerPhone, effectiveSellers, demo]);

  const handleCopyCode = useCallback((code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
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

  return {
    sellers: effectiveSellers,
    newSellerName,
    setNewSellerName,
    newSellerEmail,
    setNewSellerEmail,
    newSellerPhone,
    setNewSellerPhone,
    showAddSeller,
    setShowAddSeller,
    sellerRankingPeriod,
    setSellerRankingPeriod,
    copiedCode,
    handleAddSeller,
    handleCopyCode,
    matchSeller,
    sellerRankings,
  };
}
