import { format, parseISO } from "date-fns";
import { HOURS, MAX_CAPACITY } from "../../../constants";
import type { Booking, DashboardData } from "../../../types";

interface Props {
  data: DashboardData;
}

export default function DashboardDetailToday({ data }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-50 rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">{data.todayPeople}</p>
          <p className="text-xs text-blue-600/60 mt-1">Personas</p>
        </div>
        <div className="bg-indigo-50 rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-indigo-600">{data.todayBookingsList.length}</p>
          <p className="text-xs text-indigo-600/60 mt-1">Reservas</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <h4 className="font-bold text-sm mb-3">Ocupación por hora</h4>
        <div className="space-y-2">
          {HOURS.map((hour) => {
            const hourBookings = data.todayBookingsList.filter(
              (b) => parseISO(b.start).getHours() === hour
            );
            const count = hourBookings.reduce(
              (s: number, b: Booking) => s + (b.quantity || 1),
              0
            );
            const pct = (count / MAX_CAPACITY) * 100;
            return (
              <div key={hour} className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-gray-400 w-10 text-right shrink-0">
                  {String(hour).padStart(2, "0")}:00
                </span>
                <div className="flex-1 h-6 bg-gray-100 rounded-lg overflow-hidden relative">
                  <div
                    className={`h-full rounded-lg transition-all ${
                      pct >= 100
                        ? "bg-rose-500"
                        : pct >= 67
                          ? "bg-amber-500"
                          : count > 0
                            ? "bg-blue-500"
                            : ""
                    }`}
                    style={{ width: `${Math.max(count > 0 ? 8 : 0, pct)}%` }}
                  />
                  {count > 0 && (
                    <span
                      className={`absolute inset-0 flex items-center text-[10px] font-bold ${
                        pct >= 40 ? "justify-center text-white" : "pl-2 text-gray-600"
                      }`}
                    >
                      {count}/{MAX_CAPACITY}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h4 className="font-bold text-sm">
            Reservas de hoy ({data.todayBookingsList.length})
          </h4>
        </div>
        {data.todayBookingsList.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            No hay reservas para hoy
          </div>
        ) : (
          <div className="divide-y divide-gray-50 max-h-[300px] overflow-y-auto custom-scrollbar">
            {data.todayBookingsList.map((b) => (
              <div key={b.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                      {b.clientName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{b.clientName}</p>
                      <p className="text-[10px] text-gray-400">{b.clientEmail}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold">
                      {format(parseISO(b.start), "HH:mm")} –{" "}
                      {format(parseISO(b.end), "HH:mm")}
                    </p>
                    {(b.quantity || 1) > 1 && (
                      <span className="text-[10px] text-indigo-500 font-bold">
                        {b.quantity}p
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {b.sport && (
                    <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                      {b.sport}
                    </span>
                  )}
                  {b.reason && (
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full truncate max-w-[180px]">
                      {b.reason}
                    </span>
                  )}
                  {b.referredBy && (
                    <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-medium">
                      {b.referredBy}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
