import type { DashboardData } from "../../../types";

interface Props {
  data: DashboardData;
}

export default function DashboardDetailReferrals({ data }: Props) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h4 className="font-bold text-sm mb-4">Ranking de referidos</h4>
        {data.topReferrals.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No hay referidos registrados</p>
        ) : (
          <div className="space-y-3">
            {data.topReferrals.map((r, idx) => {
              const barPct = data.topReferrals[0].count > 0 ? (r.count / data.topReferrals[0].count) * 100 : 0;
              return (
                <div key={r.name} className="flex items-center gap-3">
                  <div className="w-6 text-center shrink-0">
                    {idx < 3 ? (
                      <span className="text-sm">{["🥇","🥈","🥉"][idx]}</span>
                    ) : (
                      <span className="text-xs font-bold text-gray-300">{idx + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate">{r.name}</span>
                      <span className="text-xs font-bold text-amber-600 shrink-0 ml-2">{r.count}p</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-amber-400 transition-all duration-500" style={{ width: `${barPct}%` }} />
                    </div>
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
