import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { generateDemoDataset } from "../utils/demoData";
import type { Booking, Seller } from "../types";

const STORAGE_KEY = "recoveryLab.demoMode.v1";

interface DemoState {
  enabled: boolean;
  bookings: Booking[];
  sellers: Seller[];
}

interface DemoContextValue extends DemoState {
  enable: () => void;
  disable: () => void;
  toggle: () => void;
  regenerate: () => void;
  addBooking: (booking: Booking) => void;
  addSeller: (seller: Seller) => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

function loadFromStorage(): DemoState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DemoState;
    if (
      typeof parsed?.enabled === "boolean" &&
      Array.isArray(parsed?.bookings) &&
      Array.isArray(parsed?.sellers)
    ) {
      return parsed;
    }
  } catch {
    // ignore corrupted payload
  }
  return null;
}

function persist(state: DemoState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(() => {
    const stored = loadFromStorage();
    return stored ?? { enabled: false, bookings: [], sellers: [] };
  });

  useEffect(() => {
    persist(state);
  }, [state]);

  const regenerate = useCallback(() => {
    const { sellers, bookings } = generateDemoDataset();
    setState({ enabled: true, bookings, sellers });
  }, []);

  const enable = useCallback(() => {
    setState((prev) => {
      if (prev.enabled && prev.bookings.length > 0) return prev;
      const { sellers, bookings } = generateDemoDataset();
      return { enabled: true, sellers, bookings };
    });
  }, []);

  const disable = useCallback(() => {
    setState((prev) => ({ ...prev, enabled: false }));
  }, []);

  const toggle = useCallback(() => {
    setState((prev) => {
      if (prev.enabled) return { ...prev, enabled: false };
      if (prev.bookings.length === 0) {
        const { sellers, bookings } = generateDemoDataset();
        return { enabled: true, sellers, bookings };
      }
      return { ...prev, enabled: true };
    });
  }, []);

  const addBooking = useCallback((booking: Booking) => {
    setState((prev) => ({ ...prev, bookings: [...prev.bookings, booking] }));
  }, []);

  const addSeller = useCallback((seller: Seller) => {
    setState((prev) => ({ ...prev, sellers: [...prev.sellers, seller] }));
  }, []);

  return (
    <DemoContext.Provider
      value={{
        ...state,
        enable,
        disable,
        toggle,
        regenerate,
        addBooking,
        addSeller,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo(): DemoContextValue {
  const ctx = useContext(DemoContext);
  if (!ctx) {
    throw new Error("useDemo debe usarse dentro de <DemoProvider>");
  }
  return ctx;
}
