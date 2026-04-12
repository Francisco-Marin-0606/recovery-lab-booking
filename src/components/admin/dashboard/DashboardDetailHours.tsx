import { HOURS } from "../../../constants";
import type { DashboardData } from "../../../types";

interface Props {
  data: DashboardData;
}

export default function DashboardDetailHours({ data }: Props) {
  const maxHourVal = Math.max(...data.hourDistribution, 1);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h4 className="font-bold text-sm mb-1">Distribución horaria</h4>
        <p className="text-[11px] text-gray-400 mb-4">Personas totales por franja horaria (histórico)</p>
        <div className="space-y-2">
          {HOURS.map((hour, idx) => {
            const count = data.hourDistribution[idx];
            const pct = (count / maxHourVal) * 100;
            const isPeak = hour === data.peakHour;
            return (
              <div key={hour} className={`flex items-center gap-3 ${isPeak ? "bg-violet-50 -mx-2 px-2 py-1 rounded-xl" : ""}`}>
                <span className={`text-[10px] font-mono w-10 text-right shrink-0 ${isPeak ? "text-violet-600 font-bold" : "text-gray-400"}`}>
                  {String(hour).padStart(2, "0")}:00
                </span>
                <div className="flex-1 h-5 bg-gray-100 rounded-md overflow-hidden relative">
                  <div
                    className={`h-full rounded-md transition-all ${isPeak ? "bg-violet-500" : count > 0 ? "bg-indigo-400" : ""}`}
                    style={{ width: `${Math.max(count > 0 ? 6 : 0, pct)}%` }}
                  />
                  {count > 0 && (
                    <span className={`absolute inset-0 flex items-center text-[10px] font-bold ${pct >= 35 ? "justify-center text-white" : "pl-2 text-gray-600"}`}>
                      {count}
                    </span>
                  )}
                </div>
                {isPeak && <span className="text-[9px] font-bold text-violet-500 shrink-0">PICO</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
