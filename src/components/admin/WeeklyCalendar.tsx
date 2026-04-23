import { useEffect, useMemo, useRef, useState } from "react";
import {
  format,
  addDays,
  addWeeks,
  subWeeks,
  startOfWeek,
  isSameDay,
  isBefore,
  parseISO,
  differenceInMinutes,
  startOfDay,
} from "date-fns";
import { es } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
  Clock,
  X,
  Users,
  Dumbbell,
  Mail,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { HOURS } from "../../constants";
import type { Booking } from "../../types";
import { localDateKey } from "../../utils/date";

const HOUR_HEIGHT = 56; // px por hora
const DAY_START_HOUR = HOURS[0]; // 8
const DAY_END_HOUR = HOURS[HOURS.length - 1] + 1; // 20
const TOTAL_HOURS = DAY_END_HOUR - DAY_START_HOUR;

// Paleta de colores tipo Google Calendar — asignada por hash del cliente
const EVENT_PALETTE = [
  { bg: "bg-indigo-50", bar: "bg-indigo-500", text: "text-indigo-900", ring: "ring-indigo-300", solid: "bg-indigo-500" },
  { bg: "bg-emerald-50", bar: "bg-emerald-500", text: "text-emerald-900", ring: "ring-emerald-300", solid: "bg-emerald-500" },
  { bg: "bg-amber-50", bar: "bg-amber-500", text: "text-amber-900", ring: "ring-amber-300", solid: "bg-amber-500" },
  { bg: "bg-sky-50", bar: "bg-sky-500", text: "text-sky-900", ring: "ring-sky-300", solid: "bg-sky-500" },
  { bg: "bg-rose-50", bar: "bg-rose-500", text: "text-rose-900", ring: "ring-rose-300", solid: "bg-rose-500" },
  { bg: "bg-violet-50", bar: "bg-violet-500", text: "text-violet-900", ring: "ring-violet-300", solid: "bg-violet-500" },
  { bg: "bg-teal-50", bar: "bg-teal-500", text: "text-teal-900", ring: "ring-teal-300", solid: "bg-teal-500" },
  { bg: "bg-fuchsia-50", bar: "bg-fuchsia-500", text: "text-fuchsia-900", ring: "ring-fuchsia-300", solid: "bg-fuchsia-500" },
];

function colorForBooking(b: Booking) {
  const key = (b.clientEmail || b.clientName || b.id || "").toLowerCase();
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return EVENT_PALETTE[hash % EVENT_PALETTE.length];
}

interface LaidEvent {
  booking: Booking;
  startMin: number; // minutos desde DAY_START_HOUR
  endMin: number;
  lane: number;
  lanes: number;
}

// Distribuye eventos en carriles para que los solapamientos aparezcan en paralelo
function layoutDayEvents(events: Booking[]): LaidEvent[] {
  const sorted = [...events]
    .map((b) => {
      const s = parseISO(b.start);
      const e = parseISO(b.end);
      const dayRef = startOfDay(s);
      const startMin = Math.max(
        0,
        (s.getTime() - dayRef.getTime()) / 60000 - DAY_START_HOUR * 60
      );
      const endMin = Math.min(
        TOTAL_HOURS * 60,
        (e.getTime() - dayRef.getTime()) / 60000 - DAY_START_HOUR * 60
      );
      return { booking: b, startMin, endMin };
    })
    .filter((e) => e.endMin > 0 && e.startMin < TOTAL_HOURS * 60)
    .sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin);

  const laneEnds: number[] = [];
  const laid: (LaidEvent & { _group: number })[] = [];
  let groupId = 0;
  let groupMaxEnd = -Infinity;

  for (const ev of sorted) {
    if (ev.startMin >= groupMaxEnd) {
      groupId++;
      laneEnds.length = 0;
      groupMaxEnd = ev.endMin;
    } else {
      groupMaxEnd = Math.max(groupMaxEnd, ev.endMin);
    }
    let lane = laneEnds.findIndex((end) => end <= ev.startMin);
    if (lane === -1) {
      laneEnds.push(ev.endMin);
      lane = laneEnds.length - 1;
    } else {
      laneEnds[lane] = ev.endMin;
    }
    laid.push({ ...ev, lane, lanes: 0, _group: groupId });
  }

  // El número de carriles para un evento = total de carriles usados en su grupo
  const groupLaneCount = new Map<number, number>();
  for (const ev of laid) {
    const cur = groupLaneCount.get(ev._group) || 0;
    if (ev.lane + 1 > cur) groupLaneCount.set(ev._group, ev.lane + 1);
  }
  return laid.map(({ _group, ...rest }) => ({
    ...rest,
    lanes: groupLaneCount.get(_group) || 1,
  }));
}

interface WeeklyCalendarProps {
  bookings: Booking[];
}

export default function WeeklyCalendar({ bookings }: WeeklyCalendarProps) {
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [now, setNow] = useState(() => new Date());
  const scrollRef = useRef<HTMLDivElement>(null);

  // Refrescar la línea de "ahora" cada minuto
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  // Scroll inicial a las 08:00 aprox (ya es el inicio del día). Opcional: 9:00.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: HOUR_HEIGHT * 0 });
  }, []);

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const weekBookings = useMemo(() => {
    const weekEnd = addDays(weekStart, 7);
    return bookings.filter((b) => {
      const d = parseISO(b.start);
      return !isBefore(d, weekStart) && isBefore(d, weekEnd);
    });
  }, [bookings, weekStart]);

  const totalPeople = weekBookings.reduce((s, b) => s + (b.quantity || 1), 0);
  const totalBookings = weekBookings.length;
  const avgPerDay = totalPeople > 0 ? Math.round(totalPeople / 7) : 0;

  const nowInWeek =
    !isBefore(now, weekStart) && isBefore(now, addDays(weekStart, 7));
  const nowTopPx = nowInWeek
    ? ((now.getHours() - DAY_START_HOUR) * 60 + now.getMinutes()) *
      (HOUR_HEIGHT / 60)
    : -1;

  const eventsByDay = useMemo(() => {
    return weekDays.map((day) => {
      const dayStr = format(day, "yyyy-MM-dd");
      const dayEvents = bookings.filter((b) => localDateKey(b.start) === dayStr);
      return layoutDayEvents(dayEvents);
    });
  }, [bookings, weekDays]);

  return (
    <section id="sec-calendario">
      <div className="flex items-center gap-2 mb-4">
        <CalendarIcon className="w-5 h-5 text-indigo-500" />
        <h3 className="font-bold text-base">Calendario semanal</h3>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {/* Stats */}
        <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white p-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-[10px] text-white/60 uppercase">Personas</p>
              <p className="text-xl font-bold">{totalPeople}</p>
            </div>
            <div>
              <p className="text-[10px] text-white/60 uppercase">Reservas</p>
              <p className="text-xl font-bold">{totalBookings}</p>
            </div>
            <div>
              <p className="text-[10px] text-white/60 uppercase">Prom/día</p>
              <p className="text-xl font-bold">{avgPerDay}</p>
            </div>
          </div>
        </div>

        {/* Toolbar estilo Google Calendar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))
              }
              className="px-3 py-1.5 text-xs font-semibold border border-gray-200 hover:bg-gray-50 rounded-full transition-colors"
            >
              Hoy
            </button>
            <div className="flex items-center">
              <button
                onClick={() => setWeekStart(subWeeks(weekStart, 1))}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Semana anterior"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => setWeekStart(addWeeks(weekStart, 1))}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Semana siguiente"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <h4 className="text-base font-semibold text-gray-800 capitalize">
              {format(weekStart, "MMMM yyyy", { locale: es })}
            </h4>
          </div>
          <div className="text-[11px] text-gray-400 hidden sm:block">
            {format(weekStart, "d MMM", { locale: es })} –{" "}
            {format(addDays(weekStart, 6), "d MMM", { locale: es })}
          </div>
        </div>

        {/* Cabecera de días */}
        <div
          className="grid border-b border-gray-100"
          style={{ gridTemplateColumns: "56px repeat(7, minmax(0, 1fr))" }}
        >
          <div className="border-r border-gray-100 bg-white" />
          {weekDays.map((day, idx) => {
            const isToday = isSameDay(day, now);
            const stripe = idx % 2 === 0 ? "bg-white" : "bg-gray-50";
            return (
              <div
                key={day.toISOString()}
                className={`border-r border-gray-100 last:border-r-0 px-2 py-2 text-center ${
                  isToday ? "bg-indigo-50" : stripe
                }`}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  {format(day, "EEE", { locale: es })}
                </p>
                <div className="flex justify-center mt-0.5">
                  <div
                    className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold ${
                      isToday
                        ? "bg-indigo-600 text-white"
                        : "text-gray-800"
                    }`}
                  >
                    {format(day, "d")}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Cuerpo del calendario (rejilla de horas) */}
        <div
          ref={scrollRef}
          className="relative overflow-y-auto custom-scrollbar"
          style={{ maxHeight: 560 }}
        >
          <div
            className="grid relative"
            style={{
              gridTemplateColumns: "56px repeat(7, minmax(0, 1fr))",
              height: HOUR_HEIGHT * TOTAL_HOURS,
            }}
          >
            {/* Columna de horas (gutter izquierdo) */}
            <div className="relative border-r border-gray-100 bg-white">
              {HOURS.map((h, idx) => (
                <div
                  key={h}
                  className="absolute right-2 -translate-y-1/2 text-[10px] font-medium text-gray-400 tabular-nums"
                  style={{ top: idx * HOUR_HEIGHT }}
                >
                  {idx === 0 ? "" : `${String(h).padStart(2, "0")}:00`}
                </div>
              ))}
            </div>

            {/* Columnas de días */}
            {weekDays.map((day, dayIdx) => {
              const isToday = isSameDay(day, now);
              const dayEvents = eventsByDay[dayIdx];
              const stripe = dayIdx % 2 === 0 ? "bg-white" : "bg-gray-50";
              return (
                <div
                  key={day.toISOString()}
                  className={`relative border-r border-gray-100 last:border-r-0 ${
                    isToday ? "bg-indigo-50/60" : stripe
                  }`}
                >
                  {/* Líneas horarias */}
                  {HOURS.map((_, idx) => (
                    <div
                      key={idx}
                      className="absolute left-0 right-0 border-t border-gray-100"
                      style={{ top: idx * HOUR_HEIGHT }}
                    />
                  ))}
                  {/* Línea de media hora (punteada) */}
                  {HOURS.map((_, idx) => (
                    <div
                      key={`half-${idx}`}
                      className="absolute left-0 right-0 border-t border-dashed border-gray-100"
                      style={{ top: idx * HOUR_HEIGHT + HOUR_HEIGHT / 2 }}
                    />
                  ))}

                  {/* Eventos */}
                  {dayEvents.map(({ booking, startMin, endMin, lane, lanes }) => {
                    const top = (startMin / 60) * HOUR_HEIGHT;
                    const rawHeight = ((endMin - startMin) / 60) * HOUR_HEIGHT;
                    const height = Math.max(22, rawHeight - 2);
                    const gapPx = lanes >= 4 ? 1 : 2;
                    const widthPct = 100 / lanes;
                    const leftPct = widthPct * lane;
                    const color = colorForBooking(booking);
                    const isShort = rawHeight < 40;
                    const isSelected =
                      selectedBooking?.id && selectedBooking.id === booking.id;

                    // Niveles de densidad para que los bloques sean legibles
                    // cuando hay muchos turnos paralelos (hasta 9 por hora)
                    const density: "full" | "compact" | "tight" | "mini" =
                      lanes <= 2 ? "full" : lanes <= 3 ? "compact" : lanes <= 5 ? "tight" : "mini";

                    const nameFull = booking.clientName || "Sin nombre";
                    const firstName = nameFull.split(" ")[0];
                    const initial = nameFull.charAt(0).toUpperCase() || "?";
                    const timeLabel = `${format(parseISO(booking.start), "HH:mm")}–${format(parseISO(booking.end), "HH:mm")}`;
                    const tooltip = `${nameFull} · ${timeLabel}${booking.quantity ? ` · ${booking.quantity}p` : ""}`;

                    return (
                      <button
                        key={booking.id || `${booking.start}-${booking.clientEmail}`}
                        onClick={() => setSelectedBooking(booking)}
                        className={`absolute overflow-hidden rounded-md text-left border border-white/70 shadow-sm hover:shadow-md hover:brightness-95 transition-all ${color.bg} ${color.text} ${
                          isSelected ? `ring-2 ${color.ring} z-20` : "z-10"
                        }`}
                        style={{
                          top,
                          height,
                          left: `calc(${leftPct}% + ${gapPx}px)`,
                          width: `calc(${widthPct}% - ${gapPx * 2}px)`,
                        }}
                        title={tooltip}
                      >
                        {density === "mini" ? (
                          // Columna ultra angosta: solo barra + inicial centrada
                          <div className={`flex h-full w-full items-center justify-center ${color.bar} text-white`}>
                            <span className="text-[10px] font-bold leading-none">
                              {initial}
                            </span>
                          </div>
                        ) : (
                          <div className="flex h-full">
                            <div className={`${density === "tight" ? "w-0.5" : "w-1"} shrink-0 ${color.bar}`} />
                            <div
                              className={`flex-1 min-w-0 flex flex-col ${
                                density === "tight" ? "px-1 py-0.5" : "px-1.5 py-1"
                              }`}
                            >
                              <p
                                className={`font-semibold leading-tight truncate ${
                                  density === "tight" ? "text-[10px]" : "text-[11px]"
                                }`}
                              >
                                {density === "full"
                                  ? nameFull
                                  : density === "compact"
                                    ? nameFull
                                    : firstName}
                                {density === "full" && (booking.quantity || 1) > 1 && (
                                  <span className="ml-1 opacity-70">
                                    · {booking.quantity}p
                                  </span>
                                )}
                              </p>
                              {density === "full" && !isShort && (
                                <p className="text-[10px] opacity-70 leading-tight mt-0.5 truncate">
                                  {timeLabel}
                                  {booking.sport ? ` · ${booking.sport}` : ""}
                                </p>
                              )}
                              {density === "compact" && !isShort && (
                                <p className="text-[10px] opacity-70 leading-tight truncate">
                                  {timeLabel}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}

                  {/* Línea de "ahora" */}
                  {isToday && nowTopPx >= 0 && nowTopPx <= HOUR_HEIGHT * TOTAL_HOURS && (
                    <div
                      className="absolute left-0 right-0 z-30 pointer-events-none"
                      style={{ top: nowTopPx }}
                    >
                      <div className="relative">
                        <div className="absolute -left-1.5 -top-1.5 w-3 h-3 rounded-full bg-rose-500 shadow" />
                        <div className="h-[2px] bg-rose-500" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Panel de detalle del evento seleccionado */}
      <AnimatePresence>
        {selectedBooking && (
          <EventDetails
            booking={selectedBooking}
            onClose={() => setSelectedBooking(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

function EventDetails({
  booking,
  onClose,
}: {
  booking: Booking;
  onClose: () => void;
}) {
  const color = colorForBooking(booking);
  const start = parseISO(booking.start);
  const end = parseISO(booking.end);
  const duration = Math.max(0, differenceInMinutes(end, start));

  return (
    <>
      {/* Overlay para cerrar en móvil */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 24 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        className="fixed right-4 top-4 lg:top-6 bottom-4 w-[calc(100%-2rem)] sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 flex flex-col overflow-hidden"
      >
        <div className={`h-1.5 ${color.solid}`} />
        <div className="flex items-start justify-between px-5 pt-4 pb-2">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Reserva
            </p>
            <h4 className="text-lg font-bold text-gray-900 truncate">
              {booking.clientName || "Sin nombre"}
            </h4>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors shrink-0"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="px-5 pb-5 space-y-3 overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-3 text-sm text-gray-700">
            <Clock className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="capitalize">
              {format(start, "EEEE d 'de' MMMM", { locale: es })}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-700">
            <CalendarIcon className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="tabular-nums">
              {format(start, "HH:mm")} – {format(end, "HH:mm")}{" "}
              <span className="text-gray-400">({duration} min)</span>
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-700">
            <Users className="w-4 h-4 text-gray-400 shrink-0" />
            <span>
              {booking.quantity || 1}{" "}
              {(booking.quantity || 1) === 1 ? "persona" : "personas"}
            </span>
          </div>
          {booking.sport && (
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <Dumbbell className="w-4 h-4 text-gray-400 shrink-0" />
              <span>{booking.sport}</span>
            </div>
          )}
          {booking.clientEmail && (
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <Mail className="w-4 h-4 text-gray-400 shrink-0" />
              <a
                href={`mailto:${booking.clientEmail}`}
                className="truncate text-indigo-600 hover:underline"
              >
                {booking.clientEmail}
              </a>
            </div>
          )}
          {booking.reason && (
            <div className="text-sm text-gray-700">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
                Motivo
              </p>
              <p className="bg-gray-50 rounded-lg p-2 text-xs">
                {booking.reason}
              </p>
            </div>
          )}
          {booking.referredBy && (
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <UserIcon className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="text-xs">
                Referido por{" "}
                <span className="font-semibold">{booking.referredBy}</span>
              </span>
            </div>
          )}
          {booking.sellerCode && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Código vendedor
              </p>
              <p className="text-sm font-mono">{booking.sellerCode}</p>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
