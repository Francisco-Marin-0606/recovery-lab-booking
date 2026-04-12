import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Target,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Repeat,
  Activity,
  Zap,
  Trophy,
} from "lucide-react";
import { DAILY_GOAL, MONTHLY_GOAL, WORKING_DAYS_PER_MONTH } from "../../../constants";
import type { DashboardData } from "../../../types";

interface DashboardOverviewProps {
  data: DashboardData;
  onNavigate: (view: string) => void;
}

export default function DashboardOverview({ data, onNavigate }: DashboardOverviewProps) {
  return (
    <>
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <button onClick={() => onNavigate("today")} className="bg-white rounded-2xl border border-gray-100 p-4 text-left hover:shadow-lg hover:border-blue-200 hover:-translate-y-0.5 transition-all group cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <Target className="w-5 h-5 text-blue-500" />
            </div>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              data.todayPeople >= DAILY_GOAL ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
            }`}>{data.dailyPercent}%</span>
          </div>
          <p className="text-2xl font-bold">{data.todayPeople}<span className="text-sm text-gray-400 font-normal ml-1">/ {DAILY_GOAL}</span></p>
          <p className="text-[11px] text-gray-400 mt-0.5">Personas hoy</p>
          <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-700 ${
              data.dailyPercent >= 100 ? "bg-emerald-500" : data.dailyPercent >= 60 ? "bg-blue-500" : data.dailyPercent >= 30 ? "bg-amber-500" : "bg-rose-400"
            }`} style={{ width: `${data.dailyPercent}%` }} />
          </div>
          <p className="text-[10px] text-blue-500 font-semibold mt-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">Ver detalle <ArrowUpRight className="w-3 h-3" /></p>
        </button>

        <button onClick={() => onNavigate("monthly")} className="bg-white rounded-2xl border border-gray-100 p-4 text-left hover:shadow-lg hover:border-violet-200 hover:-translate-y-0.5 transition-all group cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center group-hover:bg-violet-100 transition-colors">
              <TrendingUp className="w-5 h-5 text-violet-500" />
            </div>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              data.monthlyPercent >= 80 ? "bg-emerald-100 text-emerald-700" : data.monthlyPercent >= 50 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
            }`}>{data.monthlyPercent}%</span>
          </div>
          <p className="text-2xl font-bold">{data.monthlyPeople}<span className="text-sm text-gray-400 font-normal ml-1">/ {MONTHLY_GOAL}</span></p>
          <p className="text-[11px] text-gray-400 mt-0.5">Personas este mes</p>
          <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-700 ${
              data.monthlyPercent >= 80 ? "bg-violet-500" : data.monthlyPercent >= 50 ? "bg-amber-500" : "bg-rose-400"
            }`} style={{ width: `${data.monthlyPercent}%` }} />
          </div>
          <p className="text-[10px] text-violet-500 font-semibold mt-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">Ver detalle <ArrowUpRight className="w-3 h-3" /></p>
        </button>

        <button onClick={() => onNavigate("pace")} className="bg-white rounded-2xl border border-gray-100 p-4 text-left hover:shadow-lg hover:border-emerald-200 hover:-translate-y-0.5 transition-all group cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${data.paceGap >= 0 ? "bg-emerald-50 group-hover:bg-emerald-100" : "bg-rose-50 group-hover:bg-rose-100"}`}>
              {data.paceGap >= 0 ? <ArrowUpRight className="w-5 h-5 text-emerald-500" /> : <ArrowDownRight className="w-5 h-5 text-rose-500" />}
            </div>
          </div>
          <p className="text-2xl font-bold">{data.paceGap >= 0 ? "+" : ""}{data.paceGap}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">vs ritmo ideal ({data.idealPace})</p>
          <p className={`text-[11px] font-semibold mt-1 ${data.paceGap >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
            {data.paceGap >= 0 ? "Por encima del objetivo" : `Faltan ${Math.abs(data.paceGap)} para el ritmo`}
          </p>
          <p className={`text-[10px] font-semibold mt-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${data.paceGap >= 0 ? "text-emerald-500" : "text-rose-500"}`}>Ver detalle <ArrowUpRight className="w-3 h-3" /></p>
        </button>

        <button onClick={() => onNavigate("clients")} className="bg-white rounded-2xl border border-gray-100 p-4 text-left hover:shadow-lg hover:border-amber-200 hover:-translate-y-0.5 transition-all group cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
              <Repeat className="w-5 h-5 text-amber-500" />
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">{data.totalUniqueClients} únicos</span>
          </div>
          <p className="text-2xl font-bold">{data.recurringClients.length}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Clientes recurrentes (+1 visita)</p>
          <p className="text-[10px] text-amber-500 font-semibold mt-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">Ver detalle <ArrowUpRight className="w-3 h-3" /></p>
        </button>
      </div>

      {/* Insight Cards */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <button onClick={() => onNavigate("sports")} className="bg-white rounded-2xl border border-gray-100 p-3 text-left hover:shadow-md hover:border-blue-200 hover:-translate-y-0.5 transition-all cursor-pointer">
          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center mb-2">
            <Activity className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <p className="text-sm font-bold truncate">{data.topSports[0]?.sport || "—"}</p>
          <p className="text-[10px] text-gray-400">Deporte top</p>
          {data.topSports[0] && <p className="text-[10px] font-bold text-blue-500 mt-1">{data.topSports[0].count}p</p>}
        </button>
        <button onClick={() => onNavigate("hours")} className="bg-white rounded-2xl border border-gray-100 p-3 text-left hover:shadow-md hover:border-violet-200 hover:-translate-y-0.5 transition-all cursor-pointer">
          <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center mb-2">
            <Zap className="w-3.5 h-3.5 text-violet-500" />
          </div>
          <p className="text-sm font-bold">{data.peakHour >= 0 ? `${String(data.peakHour).padStart(2, "0")}:00` : "—"}</p>
          <p className="text-[10px] text-gray-400">Hora pico</p>
          {data.peakHour >= 0 && <p className="text-[10px] font-bold text-violet-500 mt-1">{data.hourDistribution[data.peakHour - 8]}p</p>}
        </button>
        <button onClick={() => onNavigate("referrals")} className="bg-white rounded-2xl border border-gray-100 p-3 text-left hover:shadow-md hover:border-amber-200 hover:-translate-y-0.5 transition-all cursor-pointer">
          <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center mb-2">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <p className="text-sm font-bold truncate">{data.topReferrals[0]?.name || "—"}</p>
          <p className="text-[10px] text-gray-400">Top referido</p>
          {data.topReferrals[0] && <p className="text-[10px] font-bold text-amber-500 mt-1">{data.topReferrals[0].count}p</p>}
        </button>
      </div>

      {/* Daily chart */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-bold text-sm">Personas por día</h4>
            <p className="text-[11px] text-gray-400 capitalize">{format(new Date(), "MMMM yyyy", { locale: es })}</p>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-gray-400">
            <div className="flex items-center gap-1"><div className="w-2.5 h-1.5 rounded-full bg-indigo-500" />Personas</div>
            <div className="flex items-center gap-1"><div className="w-4 h-0 border-t border-dashed border-rose-400" />Obj. ({DAILY_GOAL})</div>
          </div>
        </div>
        <div className="flex items-end gap-[2px] h-[140px] relative">
          <div
            className="absolute left-0 right-0 border-t-2 border-dashed border-rose-300/60 pointer-events-none"
            style={{ bottom: `${Math.min(100, (DAILY_GOAL / Math.max(DAILY_GOAL + 5, ...data.dailyBreakdown.map(d => d.people))) * 100)}%` }}
          />
          {data.dailyBreakdown.map((day) => {
            const maxVal = Math.max(DAILY_GOAL + 5, ...data.dailyBreakdown.map(d => d.people));
            const height = maxVal > 0 ? (day.people / maxVal) * 100 : 0;
            const meetsGoal = day.people >= DAILY_GOAL;
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-0.5 group" title={`${day.label}: ${day.people} personas`}>
                <span className="text-[9px] font-bold text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">{day.people}</span>
                <div className="w-full flex-1 flex items-end">
                  <div className={`w-full rounded-t-sm transition-all duration-300 ${meetsGoal ? "bg-emerald-500" : day.people > 0 ? "bg-indigo-500" : "bg-gray-100"} group-hover:opacity-80`}
                    style={{ height: `${Math.max(day.people > 0 ? 4 : 1, height)}%` }} />
                </div>
                <span className="text-[8px] text-gray-400">{day.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly summary */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h4 className="font-bold">Objetivo mensual</h4>
            <p className="text-xs text-white/50 mt-0.5">{MONTHLY_GOAL} personas · {WORKING_DAYS_PER_MONTH} días · {DAILY_GOAL}/día</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-2xl font-bold">{data.monthlyPeople}</p>
              <p className="text-[10px] text-white/40">de {MONTHLY_GOAL}</p>
            </div>
            <div className="w-14 h-14 relative shrink-0">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none"
                  stroke={data.monthlyPercent >= 80 ? "#34d399" : data.monthlyPercent >= 50 ? "#fbbf24" : "#f87171"}
                  strokeWidth="3" strokeDasharray={`${data.monthlyPercent}, 100`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold">{data.monthlyPercent}%</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3 pt-3 border-t border-white/10">
          <div>
            <p className="text-[10px] text-white/40">Reservas</p>
            <p className="text-lg font-bold">{data.monthBookingsCount}</p>
          </div>
          <div>
            <p className="text-[10px] text-white/40">Únicos</p>
            <p className="text-lg font-bold">{data.totalUniqueClients}</p>
          </div>
          <div>
            <p className="text-[10px] text-white/40">Faltan</p>
            <p className="text-lg font-bold">{Math.max(0, MONTHLY_GOAL - data.monthlyPeople)}</p>
          </div>
        </div>
      </div>
    </>
  );
}
