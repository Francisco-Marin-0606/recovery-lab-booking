import { format, startOfWeek, endOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import {
  Award,
  Trophy,
  User as UserIcon,
  Mail,
  Phone,
  Hash,
  Copy,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { isValidEmail } from "../../utils/validation";
import type { Booking, Seller, SellerRankings } from "../../types";

interface SellersSectionProps {
  sellers: Seller[];
  bookings: Booking[];
  newSellerName: string;
  onNewSellerNameChange: (v: string) => void;
  newSellerEmail: string;
  onNewSellerEmailChange: (v: string) => void;
  newSellerPhone: string;
  onNewSellerPhoneChange: (v: string) => void;
  showAddSeller: boolean;
  onToggleAddSeller: () => void;
  onAddSeller: () => void;
  onCopyCode: (code: string) => void;
  copiedCode: string | null;
  sellerRankingPeriod: "weekly" | "monthly";
  onRankingPeriodChange: (period: "weekly" | "monthly") => void;
  sellerRankings: SellerRankings;
}

export default function SellersSection({
  sellers,
  bookings,
  newSellerName,
  onNewSellerNameChange,
  newSellerEmail,
  onNewSellerEmailChange,
  newSellerPhone,
  onNewSellerPhoneChange,
  showAddSeller,
  onToggleAddSeller,
  onAddSeller,
  onCopyCode,
  copiedCode,
  sellerRankingPeriod,
  onRankingPeriodChange,
  sellerRankings,
}: SellersSectionProps) {
  const rankings =
    sellerRankingPeriod === "weekly"
      ? sellerRankings.weekly
      : sellerRankings.monthly;
  const totalRefs = rankings.reduce((s, r) => s + r.referrals, 0);
  const activeCount = rankings.filter((r) => r.referrals > 0).length;
  const medalEmojis = ["🥇", "🥈", "🥉"];
  const medalColors = [
    "from-amber-400 to-yellow-300",
    "from-gray-300 to-gray-200",
    "from-amber-600 to-amber-500",
  ];

  return (
    <section id="sec-vendedores">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-base">Vendedores</h3>
          <span className="text-xs text-gray-400">{sellers.length} registrados</span>
        </div>
        <button
          onClick={onToggleAddSeller}
          className="px-3 py-1.5 bg-black text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition-colors"
        >
          {showAddSeller ? "Cancelar" : "+ Nuevo vendedor"}
        </button>
      </div>

      <AnimatePresence>
        {showAddSeller && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4 space-y-3">
              <h4 className="font-bold text-sm">Registrar nuevo vendedor</h4>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Nombre completo</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={newSellerName} onChange={(e) => onNewSellerNameChange(e.target.value)} placeholder="Juan Pérez" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Correo electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" value={newSellerEmail} onChange={(e) => onNewSellerEmailChange(e.target.value)} placeholder="vendedor@email.com" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-sm" />
                </div>
                {newSellerEmail && !isValidEmail(newSellerEmail) && (
                  <p className="text-xs text-red-500 mt-1">Correo inválido</p>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Celular</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="tel" value={newSellerPhone} onChange={(e) => onNewSellerPhoneChange(e.target.value)} placeholder="+54 11 1234-5678" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-sm" />
                </div>
              </div>
              <button
                onClick={onAddSeller}
                disabled={!newSellerName.trim() || !newSellerEmail.trim() || !newSellerPhone.trim() || !isValidEmail(newSellerEmail)}
                className="w-full py-2.5 bg-black text-white font-bold text-sm rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Registrar vendedor (se generará código único)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Seller list */}
      {sellers.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-4">
          <div className="divide-y divide-gray-50 max-h-[300px] overflow-y-auto custom-scrollbar">
            {sellers.map((s) => {
              const totalReferrals = bookings
                .filter((b) => {
                  const val = b.referredBy?.trim().toLowerCase();
                  return (
                    b.sellerCode === s.code ||
                    (val && (val === s.code.toLowerCase() || val === s.name.toLowerCase()))
                  );
                })
                .reduce((sum, b) => sum + (b.quantity || 1), 0);
              return (
                <div key={s.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                    {s.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{s.name}</p>
                    <p className="text-[10px] text-gray-400 truncate">{s.email} · {s.phone}</p>
                  </div>
                  <button
                    onClick={() => onCopyCode(s.code)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors shrink-0"
                    title="Copiar código"
                  >
                    <Hash className="w-3 h-3 text-gray-500" />
                    <span className="text-xs font-mono font-bold text-gray-700">{s.code}</span>
                    {copiedCode === s.code ? (
                      <Check className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Copy className="w-3 h-3 text-gray-400" />
                    )}
                  </button>
                  <div className="text-center shrink-0 ml-1">
                    <p className="text-base font-bold text-amber-600">{totalReferrals}</p>
                    <p className="text-[9px] text-gray-400 uppercase">Referidos</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Rankings */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h4 className="font-bold">Ranking de vendedores</h4>
          </div>
          <div className="flex bg-white/10 rounded-lg p-0.5">
            <button
              onClick={() => onRankingPeriodChange("weekly")}
              className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
                sellerRankingPeriod === "weekly" ? "bg-white text-gray-900" : "text-white/60 hover:text-white"
              }`}
            >
              Semanal
            </button>
            <button
              onClick={() => onRankingPeriodChange("monthly")}
              className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
                sellerRankingPeriod === "monthly" ? "bg-white text-gray-900" : "text-white/60 hover:text-white"
              }`}
            >
              Mensual
            </button>
          </div>
        </div>

        <p className="text-[10px] text-white/40 mb-3 capitalize">
          {sellerRankingPeriod === "weekly"
            ? `Semana del ${format(startOfWeek(new Date(), { weekStartsOn: 1 }), "d MMM", { locale: es })} al ${format(endOfWeek(new Date(), { weekStartsOn: 1 }), "d MMM", { locale: es })}`
            : format(new Date(), "MMMM yyyy", { locale: es })}
        </p>

        {rankings.length === 0 ? (
          <p className="text-sm text-white/40 text-center py-4">No hay vendedores registrados</p>
        ) : (
          <div className="space-y-2">
            {rankings.map((s, idx) => (
              <div
                key={s.code}
                className={`flex items-center gap-3 rounded-xl p-3 transition-all ${
                  idx < 3 && s.referrals > 0 ? "bg-white/15 backdrop-blur-sm" : "bg-white/5"
                }`}
              >
                <div className="w-7 text-center shrink-0">
                  {idx < 3 && s.referrals > 0 ? (
                    <span className="text-lg">{medalEmojis[idx]}</span>
                  ) : (
                    <span className="text-xs font-bold text-white/30">{idx + 1}</span>
                  )}
                </div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    idx < 3 && s.referrals > 0
                      ? `bg-gradient-to-br ${medalColors[idx]} text-gray-900`
                      : "bg-white/20 text-white"
                  }`}
                >
                  {s.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{s.name}</p>
                  <p className="text-[10px] text-white/40 font-mono">{s.code}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold">{s.referrals}</p>
                  <p className="text-[9px] text-white/40">personas</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-3 gap-3">
          <div>
            <p className="text-[10px] text-white/40">Total referidos</p>
            <p className="text-lg font-bold">{totalRefs}</p>
          </div>
          <div>
            <p className="text-[10px] text-white/40">Vendedores activos</p>
            <p className="text-lg font-bold">{activeCount}</p>
          </div>
          <div>
            <p className="text-[10px] text-white/40">Promedio</p>
            <p className="text-lg font-bold">{sellers.length > 0 ? Math.round(totalRefs / sellers.length) : 0}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
