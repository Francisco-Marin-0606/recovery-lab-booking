import { AlertCircle, ArrowRight } from "lucide-react";
import type { Booking } from "../../types";
import { getPendingBookings } from "./AttendeesRegistration";

interface PendingAttendeesAlertProps {
  bookings: Booking[];
  onGoToRegistration: () => void;
}

export default function PendingAttendeesAlert({
  bookings,
  onGoToRegistration,
}: PendingAttendeesAlertProps) {
  const pending = getPendingBookings(bookings);
  if (pending.length === 0) return null;

  const totalMissing = pending.reduce((acc, b) => {
    const needed = (b.quantity || 1) - 1;
    const current = (b.attendees || []).length;
    return acc + Math.max(0, needed - current);
  }, 0);

  return (
    <button
      type="button"
      onClick={onGoToRegistration}
      className="group w-full flex items-center gap-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl px-4 py-3 text-left hover:from-amber-100/80 hover:to-orange-100/80 transition-colors mb-6 shadow-sm"
    >
      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
        <AlertCircle className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-amber-900">
          {pending.length === 1
            ? "Hay 1 turno grupal con datos pendientes"
            : `Hay ${pending.length} turnos grupales con datos pendientes`}
        </p>
        <p className="text-[11px] text-amber-700 mt-0.5">
          Falta completar datos de {totalMissing} acompañante
          {totalMissing !== 1 ? "s" : ""} (email, celular y deporte).
        </p>
      </div>
      <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 shrink-0 group-hover:text-amber-800">
        <span>Completar</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </button>
  );
}
