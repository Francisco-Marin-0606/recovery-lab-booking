import { useState } from "react";
import { Award, Mail, Phone, Target, User as UserIcon, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { isValidEmail } from "../../utils/validation";
import type { Booking, Seller, SellerMetrics, SellerRankings } from "../../types";
import HeroKPIs from "./sellers/HeroKPIs";
import Podium from "./sellers/Podium";
import SellerCard from "./sellers/SellerCard";
import SellerDetailPanel from "./sellers/SellerDetailPanel";
import SellersTable from "./sellers/SellersTable";

interface SellersSectionProps {
  sellers: Seller[];
  bookings: Booking[];
  newSellerName: string;
  onNewSellerNameChange: (v: string) => void;
  newSellerEmail: string;
  onNewSellerEmailChange: (v: string) => void;
  newSellerPhone: string;
  onNewSellerPhoneChange: (v: string) => void;
  newSellerGoal: number;
  onNewSellerGoalChange: (v: number) => void;
  showAddSeller: boolean;
  onToggleAddSeller: () => void;
  onAddSeller: () => void;
  onCopyCode: (code: string) => void;
  onCopyLink: (code: string) => void;
  copiedCode: string | null;
  sellerRankingPeriod: "weekly" | "monthly";
  onRankingPeriodChange: (period: "weekly" | "monthly") => void;
  sellerRankings: SellerRankings;
  sellerMetrics: Map<string, SellerMetrics>;
  teamMetrics: {
    monthTotal: number;
    totalGoal: number;
    goalProgressPct: number;
    activeSellers: number;
    totalSellers: number;
    trend7dPct: number;
    repeatRatePct: number;
    topSeller: { name: string; code: string; count: number } | null;
  };
  onUpdateSeller: (id: string, patch: Partial<Seller>) => void;
  onDeleteSeller: (id: string) => void;
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
  newSellerGoal,
  onNewSellerGoalChange,
  showAddSeller,
  onToggleAddSeller,
  onAddSeller,
  onCopyCode,
  onCopyLink,
  copiedCode,
  sellerRankingPeriod,
  onRankingPeriodChange,
  sellerRankings,
  sellerMetrics,
  teamMetrics,
  onUpdateSeller,
  onDeleteSeller,
}: SellersSectionProps) {
  const [detailSeller, setDetailSeller] = useState<Seller | null>(null);
  const [editingGoalSeller, setEditingGoalSeller] = useState<Seller | null>(null);
  const [editingGoalValue, setEditingGoalValue] = useState<number>(15);
  const [deletingSeller, setDeletingSeller] = useState<Seller | null>(null);

  const openEditGoal = (seller: Seller) => {
    setEditingGoalSeller(seller);
    setEditingGoalValue(seller.monthlyGoal ?? 15);
  };

  const saveGoal = () => {
    if (editingGoalSeller?.id) {
      onUpdateSeller(editingGoalSeller.id, { monthlyGoal: editingGoalValue });
    }
    setEditingGoalSeller(null);
  };

  const confirmDelete = () => {
    if (deletingSeller?.id) {
      onDeleteSeller(deletingSeller.id);
    }
    setDeletingSeller(null);
  };

  const cardsRanking = sellerRankingPeriod === "weekly"
    ? sellerRankings.weekly
    : sellerRankings.monthly;

  const orderedSellers = cardsRanking
    .map((r) => sellers.find((s) => s.code === r.code))
    .filter((s): s is Seller => Boolean(s));

  return (
    <section id="sec-vendedores" className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-base">Equipo comercial</h3>
          <span className="text-xs text-gray-400">
            {sellers.length} {sellers.length === 1 ? "vendedor" : "vendedores"}
          </span>
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
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
              <h4 className="font-bold text-sm">Registrar nuevo vendedor</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Nombre completo
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={newSellerName}
                      onChange={(e) => onNewSellerNameChange(e.target.value)}
                      placeholder="Juan Pérez"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Meta mensual (referidos)
                  </label>
                  <div className="relative">
                    <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      min={0}
                      value={newSellerGoal}
                      onChange={(e) => onNewSellerGoalChange(Number(e.target.value) || 0)}
                      placeholder="15"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={newSellerEmail}
                      onChange={(e) => onNewSellerEmailChange(e.target.value)}
                      placeholder="vendedor@email.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-sm"
                    />
                  </div>
                  {newSellerEmail && !isValidEmail(newSellerEmail) && (
                    <p className="text-xs text-red-500 mt-1">Correo inválido</p>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Celular
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={newSellerPhone}
                      onChange={(e) => onNewSellerPhoneChange(e.target.value)}
                      placeholder="+54 11 1234-5678"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-sm"
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={onAddSeller}
                disabled={
                  !newSellerName.trim() ||
                  !newSellerEmail.trim() ||
                  !newSellerPhone.trim() ||
                  !isValidEmail(newSellerEmail)
                }
                className="w-full py-2.5 bg-black text-white font-bold text-sm rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Registrar vendedor (se generará código único)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <HeroKPIs {...teamMetrics} />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2">
          <Podium
            rankings={cardsRanking}
            period={sellerRankingPeriod}
            onPeriodChange={onRankingPeriodChange}
          />
        </div>
        <div className="lg:col-span-3">
          {orderedSellers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center h-full flex flex-col items-center justify-center">
              <Award className="w-10 h-10 text-gray-300 mb-3" />
              <p className="text-sm font-semibold text-gray-500">
                Todavía no hay vendedores registrados
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Creá el primero para empezar a medir referidos
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {orderedSellers.map((seller) => {
                const fallback: SellerMetrics = {
                  code: seller.code,
                  totalAllTime: 0,
                  last7Days: 0,
                  prev7Days: 0,
                  last30Days: 0,
                  prev30Days: 0,
                  trend7dPct: 0,
                  trend30dPct: 0,
                  uniqueClients: 0,
                  repeatClients: 0,
                  repeatRate: 0,
                  lastActivity: null,
                  streakDays: 0,
                  sparkline: [],
                  goal: seller.monthlyGoal ?? 15,
                  goalProgress: 0,
                  status: "no-activity",
                };
                const metrics = sellerMetrics.get(seller.code) ?? fallback;
                return (
                  <div key={seller.id || seller.code}>
                    <SellerCard
                      seller={seller}
                      metrics={metrics}
                      copiedCode={copiedCode}
                      onCopyCode={onCopyCode}
                      onCopyLink={onCopyLink}
                      onEditGoal={openEditGoal}
                      onDelete={setDeletingSeller}
                      onOpenDetail={setDetailSeller}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {sellers.length > 0 && (
        <SellersTable
          sellers={sellers}
          metricsMap={sellerMetrics}
          onOpenDetail={(s) => setDetailSeller(s)}
        />
      )}

      <SellerDetailPanel
        seller={detailSeller}
        metrics={detailSeller ? sellerMetrics.get(detailSeller.code) || null : null}
        bookings={bookings}
        onClose={() => setDetailSeller(null)}
        onCopyCode={onCopyCode}
        onCopyLink={onCopyLink}
        copiedCode={copiedCode}
      />

      <AnimatePresence>
        {editingGoalSeller && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setEditingGoalSeller(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 shadow-2xl z-50 w-[90%] max-w-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-base">Editar meta mensual</h4>
                <button
                  onClick={() => setEditingGoalSeller(null)}
                  className="p-1 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Meta para <strong>{editingGoalSeller.name}</strong>
              </p>
              <div className="relative mb-4">
                <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min={0}
                  value={editingGoalValue}
                  onChange={(e) => setEditingGoalValue(Number(e.target.value) || 0)}
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-sm"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingGoalSeller(null)}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveGoal}
                  className="flex-1 py-2 rounded-xl text-sm font-bold bg-black text-white hover:bg-gray-800 transition-colors"
                >
                  Guardar meta
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deletingSeller && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setDeletingSeller(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 shadow-2xl z-50 w-[90%] max-w-sm"
            >
              <h4 className="font-bold text-base mb-2">Eliminar vendedor</h4>
              <p className="text-xs text-gray-500 mb-4">
                Esta acción eliminará a <strong>{deletingSeller.name}</strong>{" "}
                (<span className="font-mono">{deletingSeller.code}</span>) del listado.
                Las reservas ya referidas no se modifican. ¿Seguro que querés continuar?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeletingSeller(null)}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-2 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
