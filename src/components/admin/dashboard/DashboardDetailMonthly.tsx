import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DAILY_GOAL, MONTHLY_GOAL, WORKING_DAYS_PER_MONTH } from "../../../constants";
import type { DashboardData } from "../../../types";

interface Props {
  data: DashboardData;
}

export default function DashboardDetailMonthly({ data }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-violet-50 rounded-2xl p-3 text-center">
          <p className="text-xl font-bold text-violet-600">{data.monthlyPeople}</p>
          <p className="text-[9px] text-violet-600/60 uppercase">Personas</p>
        </div>
        <div className="bg-indigo-50 rounded-2xl p-3 text-center">
          <p className="text-xl font-bold text-indigo-600">{data.monthBookingsCount}</p>
          <p className="text-[9px] text-indigo-600/60 uppercase">Reservas</p>
        </div>
        <div className="bg-emerald-50 rounded-2xl p-3 text-center">
          <p className="text-xl font-bold text-emerald-600">{data.avgPerDay}</p>
          <p className="text-[9px] text-emerald-600/60 uppercase">Prom/día</p>
        </div>
        <div className="bg-amber-50 rounded-2xl p-3 text-center">
          <p className="text-xl font-bold text-amber-600">{data.daysAboveGoal}</p>
          <p className="text-[9px] text-amber-600/60 uppercase">{"Días ≥ " + DAILY_GOAL}</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-bold text-sm">Personas por día</h4>
            <p className="text-[11px] text-gray-400 capitalize">{format(new Date(), "MMMM yyyy", { locale: es })}</p>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-gray-400">
            <div className="flex items-center gap-1"><div className="w-2.5 h-1.5 rounded-full bg-indigo-500" />Personas</div>
            <div className="flex items-center gap-1"><div className="w-4 h-0 border-t border-dashed border-rose-400" />Obj.</div>
          </div>
        </div>
        <div className="flex items-end gap-[3px] h-[200px] relative">
          <div className="absolute left-0 right-0 border-t-2 border-dashed border-rose-300/60 pointer-events-none" style={{ bottom: `${Math.min(100, (DAILY_GOAL / Math.max(DAILY_GOAL + 5, ...data.dailyBreakdown.map(d => d.people))) * 100)}%` }} />
          {data.dailyBreakdown.map((day) => {
            const maxVal = Math.max(DAILY_GOAL + 5, ...data.dailyBreakdown.map(d => d.people));
            const height = maxVal > 0 ? (day.people / maxVal) * 100 : 0;
            const meetsGoal = day.people >= DAILY_GOAL;
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-0.5 group" title={`Día ${day.label}: ${day.people} personas`}>
                <span className="text-[9px] font-bold text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">{day.people}</span>
                <div className="w-full flex-1 flex items-end">
                  <div className={`w-full rounded-t-sm transition-all duration-300 ${meetsGoal ? "bg-emerald-500" : day.people > 0 ? "bg-indigo-500" : "bg-gray-100"} group-hover:opacity-80`} style={{ height: `${Math.max(day.people > 0 ? 4 : 1, height)}%` }} />
                </div>
                <span className="text-[8px] text-gray-400">{day.label}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h4 className="font-bold">Progreso mensual</h4>
            <p className="text-xs text-white/50 mt-0.5">{MONTHLY_GOAL} personas · {WORKING_DAYS_PER_MONTH} días · {DAILY_GOAL}/día</p>
          </div>
          <div className="w-16 h-16 relative shrink-0">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none"
                stroke={data.monthlyPercent >= 80 ? "#34d399" : data.monthlyPercent >= 50 ? "#fbbf24" : "#f87171"}
                strokeWidth="3" strokeDasharray={`${data.monthlyPercent}, 100`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold">{data.monthlyPercent}%</span>
            </div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3 pt-3 border-t border-white/10">
          <div><p className="text-[10px] text-white/40">Logrado</p><p className="text-lg font-bold">{data.monthlyPeople}</p></div>
          <div><p className="text-[10px] text-white/40">Faltan</p><p className="text-lg font-bold">{Math.max(0, MONTHLY_GOAL - data.monthlyPeople)}</p></div>
          <div><p className="text-[10px] text-white/40">Únicos</p><p className="text-lg font-bold">{data.totalUniqueClients}</p></div>
        </div>
      </div>
    </div>
  );
}
