import { useState } from "react";
import {
  format,
  addDays,
  addWeeks,
  subWeeks,
  addHours,
  setHours,
  setMinutes,
  startOfWeek,
  isSameDay,
  isBefore,
  parseISO,
} from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, User as UserIcon } from "lucide-react";
import { HOURS, MAX_CAPACITY } from "../../constants";
import { countBookingsForSlot } from "../../hooks/useSlots";
import type { Booking } from "../../types";

interface WeeklyCalendarProps {
  bookings: Booking[];
}

export default function WeeklyCalendar({ bookings }: WeeklyCalendarProps) {
  const [adminWeekStart, setAdminWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [selectedAdminDay, setSelectedAdminDay] = useState<Date | null>(null);

  const weekEnd = addDays(adminWeekStart, 6);
  const weekBookings = bookings.filter((b) => {
    const bDate = parseISO(b.start);
    return !isBefore(bDate, adminWeekStart) && isBefore(bDate, addDays(weekEnd, 1));
  });
  const totalPeople = weekBookings.reduce((sum, b) => sum + (b.quantity || 1), 0);
  const totalBookings = weekBookings.length;
  const avgPerDay = totalPeople > 0 ? Math.round(totalPeople / 7) : 0;

  const refDay = selectedAdminDay || new Date();
  const refDateStr = format(refDay, "yyyy-MM-dd");
  const dayBookings = bookings
    .filter((b) => b.start.startsWith(refDateStr))
    .sort((a, b) => a.start.localeCompare(b.start));

  return (
    <section id="sec-calendario">
      <div className="flex items-center gap-2 mb-4">
        <CalendarIcon className="w-5 h-5 text-indigo-500" />
        <h3 className="font-bold text-base">Calendario semanal</h3>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Stats */}
        <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white p-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div><p className="text-[10px] text-white/60 uppercase">Personas</p><p className="text-xl font-bold">{totalPeople}</p></div>
            <div><p className="text-[10px] text-white/60 uppercase">Reservas</p><p className="text-xl font-bold">{totalBookings}</p></div>
            <div><p className="text-[10px] text-white/60 uppercase">Prom/día</p><p className="text-xl font-bold">{avgPerDay}</p></div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div>
            <span className="font-bold text-sm capitalize">{format(adminWeekStart, "MMMM yyyy", { locale: es })}</span>
            <span className="text-xs text-gray-400 ml-2">
              {format(adminWeekStart, "d", { locale: es })} – {format(addDays(adminWeekStart, 6), "d MMM", { locale: es })}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setAdminWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))} className="px-2 py-1 text-[10px] font-bold border border-gray-200 hover:bg-gray-50 rounded-md">Hoy</button>
            <button onClick={() => setAdminWeekStart(subWeeks(adminWeekStart, 1))} className="p-1 hover:bg-gray-100 rounded-md"><ChevronLeft className="w-4 h-4 text-gray-500" /></button>
            <button onClick={() => setAdminWeekStart(addWeeks(adminWeekStart, 1))} className="p-1 hover:bg-gray-100 rounded-md"><ChevronRight className="w-4 h-4 text-gray-500" /></button>
          </div>
        </div>

        <div className="p-4">
          <p className="text-xs text-gray-400 mb-2 capitalize">
            {selectedAdminDay
              ? format(selectedAdminDay, "EEEE d 'de' MMMM", { locale: es })
              : format(new Date(), "EEEE d 'de' MMMM", { locale: es })}
          </p>

          {/* Day selector */}
          <div className="grid grid-cols-7 gap-1 mb-3">
            {Array.from({ length: 7 }).map((_, i) => {
              const day = addDays(adminWeekStart, i);
              const isToday = isSameDay(day, new Date());
              const isSelected = selectedAdminDay && isSameDay(day, selectedAdminDay);
              const dateStr = format(day, "yyyy-MM-dd");
              const dayTotal = bookings.filter((b) => b.start.startsWith(dateStr)).reduce((s, b) => s + (b.quantity || 1), 0);
              return (
                <button
                  key={i}
                  onClick={() => setSelectedAdminDay(day)}
                  className={`py-2 rounded-xl text-center transition-all ${
                    isSelected ? "bg-indigo-500 text-white" : isToday ? "bg-gray-100 text-black" : "hover:bg-gray-50"
                  }`}
                >
                  <p className="text-[9px] font-bold uppercase">{format(day, "EEE", { locale: es })}</p>
                  <p className="text-sm font-bold">{format(day, "d")}</p>
                  {dayTotal > 0 && <p className={`text-[9px] font-bold ${isSelected ? "text-white/80" : "text-gray-400"}`}>{dayTotal}p</p>}
                </button>
              );
            })}
          </div>

          {/* Hour bars */}
          <div className="space-y-1">
            {HOURS.map((hour) => {
              const slotStart = setHours(setMinutes(refDay, 0), hour);
              const slotEnd = addHours(slotStart, 1);
              const slotBookings = bookings.filter((b) => b.start.startsWith(refDateStr));
              const count = countBookingsForSlot(slotStart, slotEnd, slotBookings);
              const pct = (count / MAX_CAPACITY) * 100;
              const barColor =
                count === 0
                  ? "bg-gray-100"
                  : pct >= 100
                    ? "bg-rose-500"
                    : pct >= 67
                      ? "bg-amber-500"
                      : pct >= 33
                        ? "bg-sky-500"
                        : "bg-emerald-500";
              const slotSpecificBookings = slotBookings.filter((b) => {
                const bStart = parseISO(b.start);
                const bEnd = parseISO(b.end);
                return isBefore(slotStart, bEnd) && isBefore(bStart, slotEnd);
              });
              return (
                <div
                  key={hour}
                  className="flex items-center gap-2 group"
                  title={slotSpecificBookings.map((b) => `${b.clientName} (${b.quantity || 1}p)`).join(", ")}
                >
                  <span className="text-[10px] font-mono text-gray-400 w-10 text-right shrink-0">
                    {String(hour).padStart(2, "0")}:00
                  </span>
                  <div className="flex-1 h-5 bg-gray-100 rounded-md overflow-hidden relative">
                    <div
                      className={`h-full ${barColor} rounded-md transition-all duration-500`}
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

        {/* Day bookings list */}
        {dayBookings.length > 0 && (
          <div className="border-t border-gray-100 px-4 py-3">
            <p className="text-xs font-bold text-gray-500 mb-2">Reservas del día ({dayBookings.length})</p>
            <div className="space-y-1.5 max-h-[200px] overflow-y-auto custom-scrollbar">
              {dayBookings.map((b) => (
                <div key={b.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    <UserIcon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{b.clientName}</p>
                    <p className="text-[10px] text-gray-400">
                      {format(parseISO(b.start), "HH:mm")} – {format(parseISO(b.end), "HH:mm")}
                      {(b.quantity || 1) > 1 && (
                        <span className="ml-1 text-indigo-500 font-semibold">{b.quantity}p</span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
