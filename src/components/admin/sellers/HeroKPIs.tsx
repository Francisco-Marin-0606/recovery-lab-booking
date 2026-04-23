import { TrendingUp, TrendingDown, Target, Users, Flame, RefreshCw } from "lucide-react";

interface HeroKPIsProps {
  monthTotal: number;
  totalGoal: number;
  goalProgressPct: number;
  activeSellers: number;
  totalSellers: number;
  trend7dPct: number;
  repeatRatePct: number;
  topSeller: { name: string; code: string; count: number } | null;
}

function TrendBadge({ value }: { value: number }) {
  if (value === 0) {
    return <span className="text-[10px] font-semibold text-gray-400">sin cambios</span>;
  }
  const positive = value > 0;
  const Icon = positive ? TrendingUp : TrendingDown;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-bold ${
        positive ? "text-emerald-600" : "text-red-500"
      }`}
    >
      <Icon className="w-3 h-3" />
      {positive ? "+" : ""}
      {value}%
    </span>
  );
}

export default function HeroKPIs({
  monthTotal,
  totalGoal,
  goalProgressPct,
  activeSellers,
  totalSellers,
  trend7dPct,
  repeatRatePct,
  topSeller,
}: HeroKPIsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-sm transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
            <Target className="w-4 h-4 text-amber-600" />
          </div>
          <TrendBadge value={trend7dPct} />
        </div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Referidos del mes
        </p>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-2xl font-bold">{monthTotal}</span>
          {totalGoal > 0 && (
            <span className="text-xs text-gray-400">/ {totalGoal} meta</span>
          )}
        </div>
        {totalGoal > 0 && (
          <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                goalProgressPct >= 100
                  ? "bg-emerald-500"
                  : goalProgressPct >= 60
                  ? "bg-amber-500"
                  : "bg-red-400"
              }`}
              style={{ width: `${Math.min(goalProgressPct, 100)}%` }}
            />
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-sm transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-[10px] font-semibold text-gray-400">
            {totalSellers > 0 ? Math.round((activeSellers / totalSellers) * 100) : 0}% activos
          </span>
        </div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Vendedores activos
        </p>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-2xl font-bold">{activeSellers}</span>
          <span className="text-xs text-gray-400">/ {totalSellers}</span>
        </div>
        <p className="text-[10px] text-gray-400 mt-2">
          {totalSellers - activeSellers > 0
            ? `${totalSellers - activeSellers} sin referidos en 30 días`
            : "Todo el equipo activo"}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-sm transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
            <Flame className="w-4 h-4 text-orange-600" />
          </div>
          {topSeller && (
            <span className="text-[10px] font-mono font-bold text-gray-400">
              {topSeller.code}
            </span>
          )}
        </div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Top del mes
        </p>
        {topSeller ? (
          <>
            <p className="text-sm font-bold mt-1 truncate">{topSeller.name}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              <span className="font-bold text-orange-600">{topSeller.count}</span> referidos en 30 días
            </p>
          </>
        ) : (
          <p className="text-xs text-gray-400 mt-2">Aún sin referidos</p>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-sm transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
            <RefreshCw className="w-4 h-4 text-violet-600" />
          </div>
          <span
            className={`text-[10px] font-bold ${
              repeatRatePct >= 30 ? "text-emerald-600" : "text-gray-400"
            }`}
          >
            {repeatRatePct >= 30 ? "calidad alta" : repeatRatePct >= 15 ? "calidad media" : "crece"}
          </span>
        </div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Clientes que vuelven
        </p>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-2xl font-bold">{repeatRatePct}%</span>
        </div>
        <p className="text-[10px] text-gray-400 mt-2">
          Mide calidad, no solo cantidad
        </p>
      </div>
    </div>
  );
}
