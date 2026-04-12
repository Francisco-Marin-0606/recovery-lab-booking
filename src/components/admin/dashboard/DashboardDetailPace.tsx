import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { DAILY_GOAL, MONTHLY_GOAL } from "../../../constants";
import type { DashboardData } from "../../../types";

interface Props {
  data: DashboardData;
}

export default function DashboardDetailPace({ data }: Props) {
  const positive = data.paceGap >= 0;

  return (
    <div className="space-y-4">
      <div className={`rounded-2xl p-5 ${positive ? "bg-emerald-50" : "bg-rose-50"}`}>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${positive ? "bg-emerald-100" : "bg-rose-100"}`}>
            {positive ? <ArrowUpRight className="w-6 h-6 text-emerald-600" /> : <ArrowDownRight className="w-6 h-6 text-rose-600" />}
          </div>
          <div>
            <p className={`text-3xl font-bold ${positive ? "text-emerald-700" : "text-rose-700"}`}>
              {positive ? "+" : ""}{data.paceGap}
            </p>
            <p className={`text-xs ${positive ? "text-emerald-600/60" : "text-rose-600/60"}`}>
              {positive ? "Por encima del ritmo ideal" : "Por debajo del ritmo ideal"}
            </p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h4 className="font-bold text-sm mb-1">Ritmo acumulado vs ideal</h4>
        <p className="text-[11px] text-gray-400 mb-4">Línea punteada = ritmo ideal ({DAILY_GOAL}/día)</p>
        {(() => {
          const dd = data.dailyBreakdown;
          if (dd.length === 0) return <p className="text-sm text-gray-400 text-center py-6">Sin datos</p>;
          let cumActual = 0;
          const points = dd.map((d, i) => {
            cumActual += d.people;
            return { day: i, actual: cumActual, ideal: DAILY_GOAL * (i + 1), label: d.label };
          });
          const maxVal = Math.max(points[points.length - 1].ideal, points[points.length - 1].actual, 1);
          const w = 300;
          const h = 150;
          const pad = 30;
          const chartW = w - pad;
          const chartH = h - 20;
          const toX = (i: number) => pad + (i / (dd.length - 1 || 1)) * chartW;
          const toY = (v: number) => chartH - (v / maxVal) * (chartH - 10);
          const actualLine = points.map((p, i) => `${toX(i)},${toY(p.actual)}`).join(" ");
          const idealLine = points.map((p, i) => `${toX(i)},${toY(p.ideal)}`).join(" ");
          return (
            <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 200 }}>
              <polyline points={idealLine} fill="none" stroke="#e5e7eb" strokeWidth="1.5" strokeDasharray="4,3" />
              <polyline points={actualLine} fill="none" stroke={positive ? "#10b981" : "#f43f5e"} strokeWidth="2" strokeLinejoin="round" />
              {points.map((p, i) => (
                <circle key={i} cx={toX(i)} cy={toY(p.actual)} r="2.5" fill={positive ? "#10b981" : "#f43f5e"} />
              ))}
              {points.filter((_, i) => i % 5 === 0 || i === points.length - 1).map((p) => (
                <text key={p.day} x={toX(p.day)} y={h - 2} textAnchor="middle" className="fill-gray-400" style={{ fontSize: 8 }}>{p.label}</text>
              ))}
            </svg>
          );
        })()}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-[10px] text-gray-400 uppercase">Ideal hoy</p>
            <p className="text-xl font-bold">{data.idealPace}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase">Real</p>
            <p className="text-xl font-bold">{data.monthlyPeople}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase">Meta mes</p>
            <p className="text-xl font-bold">{MONTHLY_GOAL}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
