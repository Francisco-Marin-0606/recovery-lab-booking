import { format, startOfWeek, endOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import { Trophy } from "lucide-react";
import type { SellerWithReferrals } from "../../../types";

interface PodiumProps {
  rankings: SellerWithReferrals[];
  period: "weekly" | "monthly";
  onPeriodChange: (p: "weekly" | "monthly") => void;
}

export default function Podium({ rankings, period, onPeriodChange }: PodiumProps) {
  const top3 = rankings.filter((r) => r.referrals > 0).slice(0, 3);
  const first = top3[0];
  const second = top3[1];
  const third = top3[2];

  const periodLabel =
    period === "weekly"
      ? `Semana del ${format(startOfWeek(new Date(), { weekStartsOn: 1 }), "d MMM", {
          locale: es,
        })} al ${format(endOfWeek(new Date(), { weekStartsOn: 1 }), "d MMM", {
          locale: es,
        })}`
      : format(new Date(), "MMMM yyyy", { locale: es });

  const strategicMsg = (() => {
    if (!first) return "Nadie tiene referidos todavía en este período.";
    if (!second) return `${first.name} lidera solo — el resto del equipo está en cero.`;
    const diff = first.referrals - second.referrals;
    if (diff === 0)
      return `Empate en la cima: ${first.name} y ${second.name} con ${first.referrals} referidos.`;
    return `A ${second.name} le ${diff === 1 ? "falta" : "faltan"} ${diff} ${
      diff === 1 ? "referido" : "referidos"
    } para superar a ${first.name}.`;
  })();

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-6 text-white relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />

      <div className="relative flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h4 className="font-bold text-sm">Podio de vendedores</h4>
        </div>
        <div className="flex bg-white/10 rounded-lg p-0.5">
          <button
            onClick={() => onPeriodChange("weekly")}
            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
              period === "weekly" ? "bg-white text-gray-900" : "text-white/60 hover:text-white"
            }`}
          >
            Semanal
          </button>
          <button
            onClick={() => onPeriodChange("monthly")}
            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
              period === "monthly" ? "bg-white text-gray-900" : "text-white/60 hover:text-white"
            }`}
          >
            Mensual
          </button>
        </div>
      </div>
      <p className="text-[10px] text-white/40 capitalize relative mb-5">{periodLabel}</p>

      {top3.length === 0 ? (
        <div className="relative py-10 text-center">
          <p className="text-sm text-white/50">Nadie referenció todavía en este período</p>
          <p className="text-[11px] text-white/30 mt-1">Cuando alguien use un código, aparecerá acá</p>
        </div>
      ) : (
        <div className="relative grid grid-cols-3 gap-3 items-end">
          <PodiumSlot
            seller={second}
            rank={2}
            heightClass="h-24"
            medal="🥈"
            gradient="from-gray-200 to-gray-400"
          />
          <PodiumSlot
            seller={first}
            rank={1}
            heightClass="h-32"
            medal="🥇"
            gradient="from-amber-300 to-yellow-500"
            featured
          />
          <PodiumSlot
            seller={third}
            rank={3}
            heightClass="h-20"
            medal="🥉"
            gradient="from-amber-600 to-amber-800"
          />
        </div>
      )}

      {top3.length > 0 && (
        <div className="relative mt-5 pt-4 border-t border-white/10">
          <p className="text-[11px] text-white/70 text-center italic">
            {strategicMsg}
          </p>
        </div>
      )}
    </div>
  );
}

interface PodiumSlotProps {
  seller: SellerWithReferrals | undefined;
  rank: number;
  heightClass: string;
  medal: string;
  gradient: string;
  featured?: boolean;
}

function PodiumSlot({
  seller,
  rank,
  heightClass,
  medal,
  gradient,
  featured,
}: PodiumSlotProps) {
  if (!seller) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="text-3xl opacity-20">{medal}</div>
        <div
          className={`w-full ${heightClass} bg-white/5 rounded-t-xl flex items-center justify-center`}
        >
          <span className="text-xs text-white/30">—</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-gray-900 font-bold text-base shadow-lg ${
          featured ? "ring-2 ring-amber-300/40 ring-offset-2 ring-offset-gray-900" : ""
        }`}
      >
        {seller.name.charAt(0).toUpperCase()}
      </div>
      <div className="text-center">
        <p
          className={`font-bold truncate max-w-[100px] ${
            featured ? "text-sm" : "text-xs"
          }`}
        >
          {seller.name.split(" ")[0]}
        </p>
        <p className="text-[9px] text-white/40 font-mono">{seller.code}</p>
      </div>
      <div
        className={`w-full ${heightClass} rounded-t-xl flex flex-col items-center justify-end pb-2 ${
          featured
            ? "bg-gradient-to-t from-amber-500/30 to-amber-500/5 border border-amber-400/20"
            : "bg-white/5 border border-white/5"
        }`}
      >
        <div className="text-2xl mb-1">{medal}</div>
        <p className={`font-bold ${featured ? "text-xl" : "text-lg"}`}>{seller.referrals}</p>
        <p className="text-[9px] text-white/40">#{rank}</p>
      </div>
    </div>
  );
}
