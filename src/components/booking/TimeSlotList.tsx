import { format } from "date-fns";
import { Clock } from "lucide-react";
import { MAX_CAPACITY } from "../../constants";
import { isValidEmail } from "../../utils/validation";
import type { TimeSlot } from "../../types";

interface TimeSlotListProps {
  slots: TimeSlot[];
  quantity: number;
  bookingStatus: "idle" | "loading" | "success" | "error";
  clientName: string;
  clientEmail: string;
  sport: string;
  reason: string;
  onSlotSelect: (slot: TimeSlot) => void;
}

export default function TimeSlotList({
  slots,
  quantity,
  bookingStatus,
  clientName,
  clientEmail,
  sport,
  reason,
  onSlotSelect,
}: TimeSlotListProps) {
  return (
    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
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
                !isValidEmail(clientEmail) ||
                !sport.trim() ||
                !reason.trim()
              }
              onClick={() => onSlotSelect(slot)}
              className={`
                w-full p-4 rounded-2xl border transition-all flex items-center justify-between group
                ${
                  canBook
                    ? "border-gray-100 hover:border-black hover:shadow-md bg-white"
                    : "bg-gray-50 border-transparent opacity-50 cursor-not-allowed"
                }
              `}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`
                    w-10 h-10 rounded-xl flex items-center justify-center transition-colors
                    ${canBook ? "bg-gray-100 group-hover:bg-black group-hover:text-white" : "bg-gray-200"}
                  `}
                >
                  <Clock className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-bold">{format(slot.start, "HH:mm")}</p>
                  <p className="text-xs text-gray-500">
                    {remaining === 0
                      ? "Completo"
                      : `${remaining} lugar${remaining !== 1 ? "es" : ""} disponible${remaining !== 1 ? "s" : ""}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {remaining > 0 && remaining < MAX_CAPACITY && (
                  <div className="flex gap-0.5">
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
                  <span className="text-xs font-bold uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
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
