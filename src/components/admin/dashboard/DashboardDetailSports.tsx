import type { DashboardData } from "../../../types";

interface Props {
  data: DashboardData;
}

const BAR_COLORS = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-pink-500",
  "bg-indigo-500",
];

export default function DashboardDetailSports({ data }: Props) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h4 className="font-bold text-sm mb-4">Distribución por deporte</h4>
        {data.topSports.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">Sin datos de deportes</p>
        ) : (
          <div className="space-y-3">
            {data.topSports.map((s, idx) => {
              const pct = data.totalPeopleAllTime > 0 ? (s.count / data.totalPeopleAllTime) * 100 : 0;
              const barPct = data.topSports[0].count > 0 ? (s.count / data.topSports[0].count) * 100 : 0;
              return (
                <div key={s.sport}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{s.sport}</span>
                    <span className="text-xs text-gray-400">{s.count}p · {Math.round(pct)}%</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${BAR_COLORS[idx % BAR_COLORS.length]}`}
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
