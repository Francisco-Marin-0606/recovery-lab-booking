import { format } from "date-fns";
import { Clock, CalendarOff, MoonStar, CheckCircle2 } from "lucide-react";
import { MAX_CAPACITY } from "../../constants";
import { isValidEmail } from "../../utils/validation";
import type { TimeSlot } from "../../types";
import type { SlotsEmptyReason } from "../../hooks/useSlots";

interface TimeSlotListProps {
  slots: TimeSlot[];
  quantity: number;
  bookingStatus: "idle" | "loading" | "success" | "error";
  clientName: string;
  clientEmail: string;
  sport: string;
  reason: string;
  emptyReason?: SlotsEmptyReason;
  onSlotSelect: (slot: TimeSlot) => void;
}

interface EmptyStateContent {
  icon: typeof CalendarOff;
  title: string;
  description: string;
  tone: "neutral" | "warning" | "success";
}

function getEmptyStateContent(
  reason: SlotsEmptyReason | undefined
): EmptyStateContent | null {
  switch (reason) {
    case "closed-today":
      return {
        icon: CalendarOff,
        title: "Sin atención este día",
        description:
          "Ese día no atendemos. Probá con otra fecha dentro del horario de atención.",
        tone: "neutral",
      };
    case "all-past":
      return {
        icon: MoonStar,
        title: "No quedan turnos disponibles hoy",
        description:
          "Ya pasó el horario de atención de hoy. Elegí otra fecha para reservar tu sesión.",
        tone: "warning",
      };
    case "fully-booked":
      return {
        icon: CheckCircle2,
        title: "Todos los turnos están completos",
        description:
          "No quedan lugares disponibles en este día. Probá con otra fecha para encontrar un horario.",
        tone: "warning",
      };
    default:
      return null;
  }
}

export default function TimeSlotList({
  slots,
  quantity,
  bookingStatus,
  clientName,
  clientEmail,
  sport,
  reason,
  emptyReason,
  onSlotSelect,
}: TimeSlotListProps) {
  const bookableSlots = slots.filter((s) => s.available);
  const showEmptyState =
    bookableSlots.length === 0 && emptyReason !== null && emptyReason !== undefined;
  const emptyContent = showEmptyState ? getEmptyStateContent(emptyReason) : null;

  if (emptyContent) {
    const Icon = emptyContent.icon;
    const toneClasses =
      emptyContent.tone === "warning"
        ? "bg-amber-50 border-amber-100 text-amber-900"
        : emptyContent.tone === "success"
        ? "bg-emerald-50 border-emerald-100 text-emerald-900"
        : "bg-gray-50 border-gray-100 text-gray-700";
    const iconWrapperClasses =
      emptyContent.tone === "warning"
        ? "bg-amber-100 text-amber-700"
        : emptyContent.tone === "success"
        ? "bg-emerald-100 text-emerald-700"
        : "bg-white text-gray-500 border border-gray-200";
    return (
      <div
        className={`rounded-2xl border p-6 flex items-start gap-4 ${toneClasses}`}
        role="status"
        aria-live="polite"
      >
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconWrapperClasses}`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-sm sm:text-base">{emptyContent.title}</p>
          <p className="text-xs sm:text-sm mt-1 opacity-80 leading-relaxed">
            {emptyContent.description}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2.5 sm:space-y-3 max-h-[360px] sm:max-h-[400px] overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
      {slots.length > 0 ? (
        slots.map((slot, idx) => {
          const remaining = slot.capacity - slot.bookedCount;
          const canBook = slot.available && remaining >= quantity;
          return (
            <button
              key={idx}
              disabled={
                !canBook ||
                bookingStatus === "loading" ||
                !clientName.trim() ||
                !clientEmail.trim() ||
                !isValidEmail(clientEmail)
              }
              onClick={() => onSlotSelect(slot)}
              className={`
                w-full p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center justify-between group active:scale-[0.98]
                ${
                  canBook
                    ? "border-gray-100 hover:border-black hover:shadow-md bg-white"
                    : "bg-gray-50 border-transparent opacity-50 cursor-not-allowed"
                }
              `}
            >
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div
                  className={`
                    w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0
                    ${canBook ? "bg-gray-100 group-hover:bg-black group-hover:text-white" : "bg-gray-200"}
                  `}
                >
                  <Clock className="w-5 h-5" />
                </div>
                <div className="text-left min-w-0">
                  <p className="font-bold text-base">{format(slot.start, "HH:mm")}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {remaining === 0
                      ? "Completo"
                      : `${remaining} lugar${remaining !== 1 ? "es" : ""} disponible${remaining !== 1 ? "s" : ""}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {remaining > 0 && remaining < MAX_CAPACITY && (
                  <div className="hidden sm:flex gap-0.5">
                    {Array.from({ length: MAX_CAPACITY }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-4 rounded-full ${
                          i < slot.bookedCount ? "bg-black/70" : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                )}
                {canBook && (
                  <span className="text-xs font-bold uppercase tracking-tighter sm:opacity-0 sm:group-hover:opacity-100 transition-opacity bg-black text-white sm:bg-transparent sm:text-current px-2.5 py-1 sm:px-0 sm:py-0 rounded-full sm:rounded-none">
                    Reservar
                  </span>
                )}
              </div>
            </button>
          );
        })
      ) : (
        <div className="text-center py-12 text-gray-400">
          Cargando horarios...
        </div>
      )}
    </div>
  );
}
