import type { ReactNode } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Mail,
  Phone,
  Hash,
  Calendar,
  Copy,
  Check,
  Link2,
  TrendingUp,
  TrendingDown,
  Target,
  Users,
  RefreshCw,
  Flame,
} from "lucide-react";
import type { Booking, Seller, SellerMetrics } from "../../../types";
import Sparkline from "./Sparkline";

interface SellerDetailPanelProps {
  seller: Seller | null;
  metrics: SellerMetrics | null;
  bookings: Booking[];
  onClose: () => void;
  onCopyCode: (code: string) => void;
  onCopyLink: (code: string) => void;
  copiedCode: string | null;
}

export default function SellerDetailPanel({
  seller,
  metrics,
  bookings,
  onClose,
  onCopyCode,
  onCopyLink,
  copiedCode,
}: SellerDetailPanelProps) {
  const referredBookings = seller
    ? bookings
        .filter((b) => {
          const val = b.referredBy?.trim().toLowerCase();
          return (
            b.sellerCode === seller.code ||
            (val &&
              (val === seller.code.toLowerCase() ||
                val === seller.name.toLowerCase()))
          );
        })
        .sort((a, b) => parseISO(b.start).getTime() - parseISO(a.start).getTime())
    : [];

  return (
    <AnimatePresence>
      {seller && metrics && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.25 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl overflow-y-auto custom-scrollbar"
          >
            <div className="sticky top-0 z-10 bg-gradient-to-br from-gray-900 to-gray-800 text-white px-6 py-5">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-xl shrink-0">
                  {seller.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg truncate">{seller.name}</h3>
                  <p className="text-[11px] text-white/60 font-mono">{seller.code}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 mt-4">
                <button
                  onClick={() => onCopyCode(seller.code)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-semibold transition-colors"
                >
                  {copiedCode === seller.code ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Código copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copiar código
                    </>
                  )}
                </button>
                <button
                  onClick={() => onCopyLink(seller.code)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-400 text-gray-900 hover:bg-amber-300 rounded-lg text-xs font-bold transition-colors"
                >
                  {copiedCode === `link-${seller.code}` ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Link copiado
                    </>
                  ) : (
                    <>
                      <Link2 className="w-3.5 h-3.5" />
                      Copiar link personal
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="px-6 py-5 space-y-5">
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  {seller.email}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  {seller.phone}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Hash className="w-3.5 h-3.5 text-gray-400" />
                  Registrado {format(parseISO(seller.createdAt), "d MMM yyyy", { locale: es })}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Performance
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <StatBox
                    icon={<Target className="w-3.5 h-3.5 text-amber-600" />}
                    label="Meta del mes"
                    value={`${metrics.last30Days} / ${metrics.goal}`}
                    sub={`${Math.min(Math.round(metrics.goalProgress), 999)}% completado`}
                  />
                  <StatBox
                    icon={
                      metrics.trend7dPct >= 0 ? (
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                      )
                    }
                    label="Trend 7d"
                    value={`${metrics.trend7dPct > 0 ? "+" : ""}${metrics.trend7dPct}%`}
                    sub={`${metrics.last7Days} vs ${metrics.prev7Days} prev`}
                  />
                  <StatBox
                    icon={<Users className="w-3.5 h-3.5 text-blue-600" />}
                    label="Clientes únicos"
                    value={`${metrics.uniqueClients}`}
                    sub={`${metrics.repeatClients} volvieron`}
                  />
                  <StatBox
                    icon={<RefreshCw className="w-3.5 h-3.5 text-violet-600" />}
                    label="Tasa de retorno"
                    value={`${Math.round(metrics.repeatRate)}%`}
                    sub="clientes que vuelven"
                  />
                  <StatBox
                    icon={<Flame className="w-3.5 h-3.5 text-orange-600" />}
                    label="Racha actual"
                    value={`${metrics.streakDays}d`}
                    sub="días consecutivos"
                  />
                  <StatBox
                    icon={<Calendar className="w-3.5 h-3.5 text-gray-600" />}
                    label="Total histórico"
                    value={`${metrics.totalAllTime}`}
                    sub="referidos totales"
                  />
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Últimos 7 días
                </h4>
                <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{metrics.last7Days}</p>
                    <p className="text-[10px] text-gray-400">referidos esta semana</p>
                  </div>
                  <Sparkline
                    values={metrics.sparkline}
                    color={metrics.trend7dPct >= 0 ? "#10b981" : "#ef4444"}
                    width={120}
                    height={36}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Historial de referidos
                  </h4>
                  <span className="text-[10px] text-gray-400">
                    {referredBookings.length} reservas
                  </span>
                </div>
                {referredBookings.length === 0 ? (
                  <div className="bg-gray-50 rounded-xl py-6 text-center">
                    <p className="text-xs text-gray-400">Sin referidos aún</p>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-[360px] overflow-y-auto custom-scrollbar pr-1">
                    {referredBookings.map((b, i) => (
                      <div
                        key={b.id || i}
                        className="flex items-center gap-2.5 px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white font-bold text-[10px] shrink-0">
                          {b.clientName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate">{b.clientName}</p>
                          <p className="text-[10px] text-gray-400 truncate">
                            {format(parseISO(b.start), "EEE d MMM · HH:mm", { locale: es })}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-bold text-amber-600">×{b.quantity}</p>
                          {b.sport && (
                            <p className="text-[9px] text-gray-400 truncate max-w-[80px]">{b.sport}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function StatBox({
  icon,
  label,
  value,
  sub,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider truncate">
          {label}
        </span>
      </div>
      <p className="text-base font-bold">{value}</p>
      <p className="text-[10px] text-gray-400 truncate">{sub}</p>
    </div>
  );
}
