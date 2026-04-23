import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Clock, Calendar } from "lucide-react";
import { SCHEDULE } from "../../constants";

function parseHHMM(value: string): number {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

function isOpenNow(now: Date): boolean {
  const today = SCHEDULE.find((d) => d.weekday === now.getDay());
  if (!today || !today.open || !today.close) return false;
  const minutes = now.getHours() * 60 + now.getMinutes();
  return minutes >= parseHHMM(today.open) && minutes < parseHHMM(today.close);
}

export default function ScheduleSection() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const open = isOpenNow(now);
  const todayIdx = now.getDay();

  return (
    <section
      id="horarios"
      className="relative py-16 sm:py-28 bg-white scroll-mt-16 sm:scroll-mt-20"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-start">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5"
          >
            <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-gray-500">
              <Clock className="w-4 h-4 text-blue-500" />
              Horarios
            </span>
            <h2 className="mt-4 text-2xl sm:text-5xl font-bold tracking-tight leading-tight">
              Abierto cuando lo necesitás.
            </h2>
            <p className="mt-5 sm:mt-6 text-gray-600 text-sm sm:text-lg leading-relaxed">
              Atendemos todos los días: de lunes a viernes de 7 a 22 hs y los
              fines de semana de 10 a 18 hs. Reservá con anticipación para
              asegurar tu plaza en el horario que mejor se adapte a tu rutina.
            </p>

            <div
              className={`mt-8 inline-flex items-center gap-3 px-5 py-3 rounded-2xl border ${
                open
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-gray-50 border-gray-200 text-gray-600"
              }`}
            >
              <span
                className={`relative flex h-2.5 w-2.5 ${
                  open ? "" : "opacity-60"
                }`}
              >
                {open && (
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                )}
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    open ? "bg-emerald-500" : "bg-gray-400"
                  }`}
                />
              </span>
              <span className="text-sm font-semibold">
                {open ? "Abierto ahora" : "Cerrado en este momento"}
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-7 bg-[#F8F9FA] rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-gray-100"
          >
            <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-gray-400 mb-5">
              <Calendar className="w-4 h-4" />
              Horario semanal
            </div>

            <ul className="divide-y divide-gray-200">
              {SCHEDULE.map((entry) => {
                const isToday = entry.weekday === todayIdx;
                const closed = !entry.open || !entry.close;
                return (
                  <li
                    key={entry.day}
                    className={`flex items-center justify-between py-3.5 px-2 rounded-xl ${
                      isToday ? "bg-white shadow-sm border border-gray-100" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-1.5 h-6 rounded-full ${
                          isToday ? "bg-black" : "bg-transparent"
                        }`}
                      />
                      <span
                        className={`text-sm sm:text-base font-semibold ${
                          isToday ? "text-black" : "text-gray-700"
                        }`}
                      >
                        {entry.day}
                      </span>
                      {isToday && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black text-white">
                          Hoy
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-sm sm:text-base font-mono ${
                        closed
                          ? "text-gray-400 italic"
                          : "text-gray-900 font-medium"
                      }`}
                    >
                      {closed ? "Cerrado" : `${entry.open} — ${entry.close}`}
                    </span>
                  </li>
                );
              })}
            </ul>

            <p className="mt-6 text-xs text-gray-500 leading-relaxed">
              Los feriados nacionales pueden tener horario reducido. Te
              avisamos por email si tu turno cae en una fecha especial.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
