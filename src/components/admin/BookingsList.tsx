import { format, parseISO, isBefore } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock, List } from "lucide-react";
import type { Booking } from "../../types";

interface BookingsListProps {
  bookings: Booking[];
}

export default function BookingsList({ bookings }: BookingsListProps) {
  return (
    <section id="sec-turnos">
      <div className="flex items-center gap-2 mb-4">
        <List className="w-5 h-5 text-emerald-500" />
        <h3 className="font-bold text-base">Todos los Turnos</h3>
        <span className="text-xs text-gray-400 ml-auto">{bookings.length} reservas</span>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="w-10 h-10 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No hay reservas aún</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto custom-scrollbar">
            {[...bookings].sort((a, b) => b.start.localeCompare(a.start)).map((b) => {
              const bDate = parseISO(b.start);
              const isPast = isBefore(bDate, new Date());
              return (
                <div key={b.id} className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${isPast ? "opacity-50" : ""}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isPast ? "bg-gray-100 text-gray-400" : "bg-indigo-100 text-indigo-600"}`}>
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{b.clientName}</p>
                    <p className="text-[10px] text-gray-400 truncate">{b.clientEmail}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold capitalize">{format(bDate, "EEE d MMM", { locale: es })}</p>
                    <p className="text-[10px] text-gray-400">{format(bDate, "HH:mm")} – {format(parseISO(b.end), "HH:mm")}</p>
                  </div>
                  {(b.quantity || 1) > 1 && (
                    <div className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0">
                      {b.quantity}p
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
