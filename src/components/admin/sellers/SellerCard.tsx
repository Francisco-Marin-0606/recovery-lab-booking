import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import {
  Check,
  Copy,
  Flame,
  Link2,
  MoreVertical,
  Pencil,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import type { Seller, SellerMetrics } from "../../../types";
import Sparkline from "./Sparkline";

interface SellerCardProps {
  seller: Seller;
  metrics: SellerMetrics;
  copiedCode: string | null;
  onCopyCode: (code: string) => void;
  onCopyLink: (code: string) => void;
  onEditGoal: (seller: Seller) => void;
  onDelete: (seller: Seller) => void;
  onOpenDetail: (seller: Seller) => void;
}

const STATUS_CONFIG: Record<
  SellerMetrics["status"],
  { label: string; dotClass: string; textClass: string; bgClass: string }
> = {
  hot: {
    label: "En racha",
    dotClass: "bg-orange-500",
    textClass: "text-orange-700",
    bgClass: "bg-orange-50 border-orange-100",
  },
  "on-track": {
    label: "En objetivo",
    dotClass: "bg-emerald-500",
    textClass: "text-emerald-700",
    bgClass: "bg-emerald-50 border-emerald-100",
  },
  cold: {
    label: "Frío",
    dotClass: "bg-amber-500",
    textClass: "text-amber-700",
    bgClass: "bg-amber-50 border-amber-100",
  },
  idle: {
    label: "Inactivo",
    dotClass: "bg-gray-400",
    textClass: "text-gray-600",
    bgClass: "bg-gray-50 border-gray-100",
  },
  "no-activity": {
    label: "Sin actividad",
    dotClass: "bg-gray-300",
    textClass: "text-gray-500",
    bgClass: "bg-gray-50 border-gray-100",
  },
};

export default function SellerCard({
  seller,
  metrics,
  copiedCode,
  onCopyCode,
  onCopyLink,
  onEditGoal,
  onDelete,
  onOpenDetail,
}: SellerCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const status = STATUS_CONFIG[metrics.status];
  const trendPositive = metrics.trend7dPct > 0;
  const trendZero = metrics.trend7dPct === 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-all group relative">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
          {seller.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate">{seller.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[9px] font-semibold ${status.bgClass} ${status.textClass}`}
            >
              <span className={`w-1 h-1 rounded-full ${status.dotClass}`} />
              {status.label}
            </span>
            {metrics.streakDays >= 3 && (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-orange-600">
                <Flame className="w-2.5 h-2.5" />
                {metrics.streakDays}d
              </span>
            )}
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Opciones"
          >
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-7 z-20 bg-white border border-gray-100 rounded-xl shadow-lg py-1 min-w-[160px]">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onEditGoal(seller);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 transition-colors w-full text-left"
                >
                  <Pencil className="w-3.5 h-3.5 text-gray-500" />
                  Editar meta
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenDetail(seller);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 transition-colors w-full text-left"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                  Ver detalle
                </button>
                <div className="h-px bg-gray-100 my-1" />
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(seller);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Eliminar vendedor
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-end gap-3 mb-3">
        <div className="flex-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold">{metrics.last30Days}</span>
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
              en 30d
            </span>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            {trendZero ? (
              <span className="text-[10px] text-gray-400">sin cambios vs 7d previos</span>
            ) : (
              <span
                className={`inline-flex items-center gap-0.5 text-[10px] font-bold ${
                  trendPositive ? "text-emerald-600" : "text-red-500"
                }`}
              >
                {trendPositive ? (
                  <TrendingUp className="w-2.5 h-2.5" />
                ) : (
                  <TrendingDown className="w-2.5 h-2.5" />
                )}
                {trendPositive ? "+" : ""}
                {metrics.trend7dPct}% vs 7d previos
              </span>
            )}
          </div>
        </div>
        <div className="shrink-0">
          <Sparkline
            values={metrics.sparkline}
            color={trendPositive ? "#10b981" : trendZero ? "#9ca3af" : "#ef4444"}
            width={72}
            height={28}
          />
        </div>
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1">
            <Target className="w-3 h-3 text-gray-400" />
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              Meta mensual
            </span>
          </div>
          <span className="text-[11px] font-bold text-gray-700">
            {Math.min(Math.round(metrics.goalProgress), 999)}%
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              metrics.goalProgress >= 100
                ? "bg-emerald-500"
                : metrics.goalProgress >= 60
                ? "bg-amber-500"
                : "bg-red-400"
            }`}
            style={{ width: `${Math.min(metrics.goalProgress, 100)}%` }}
          />
        </div>
        <p className="text-[10px] text-gray-400 mt-1">
          {metrics.goalProgress >= 100
            ? `Superó la meta de ${metrics.goal}`
            : `${Math.max(metrics.goal - Math.round((metrics.goal * metrics.goalProgress) / 100), 0)} para llegar a ${metrics.goal}`}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-1 mb-3 pb-3 border-b border-gray-50">
        <div>
          <p className="text-[9px] text-gray-400 uppercase">Únicos</p>
          <p className="text-xs font-bold">{metrics.uniqueClients}</p>
        </div>
        <div>
          <p className="text-[9px] text-gray-400 uppercase">Vuelven</p>
          <p className="text-xs font-bold">{Math.round(metrics.repeatRate)}%</p>
        </div>
        <div>
          <p className="text-[9px] text-gray-400 uppercase">Últ. act.</p>
          <p className="text-xs font-bold">
            {metrics.lastActivity
              ? formatDistanceToNow(new Date(metrics.lastActivity), { locale: es, addSuffix: false })
              : "—"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onCopyCode(seller.code)}
          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-[10px] font-mono font-bold text-gray-700"
          title="Copiar código"
        >
          #{seller.code}
          {copiedCode === seller.code ? (
            <Check className="w-3 h-3 text-emerald-500" />
          ) : (
            <Copy className="w-3 h-3 text-gray-400" />
          )}
        </button>
        <button
          onClick={() => onCopyLink(seller.code)}
          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-black text-white hover:bg-gray-800 rounded-lg transition-colors text-[10px] font-bold"
          title="Copiar link personalizado"
        >
          {copiedCode === `link-${seller.code}` ? (
            <>
              <Check className="w-3 h-3" />
              Link copiado
            </>
          ) : (
            <>
              <Link2 className="w-3 h-3" />
              Copiar link
            </>
          )}
        </button>
      </div>
    </div>
  );
}
