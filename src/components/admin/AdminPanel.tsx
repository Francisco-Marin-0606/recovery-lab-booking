import { useState, useRef, type ReactNode } from "react";
import {
  Calendar as CalendarIcon,
  LayoutDashboard,
  List,
  Users,
  Award,
  Settings,
  ArrowLeft,
  CalendarPlus,
  LogOut,
  Shield,
  PanelLeftClose,
} from "lucide-react";
import type { Booking, DashboardData, Seller, SellerRankings } from "../../types";

import DashboardOverview from "./dashboard/DashboardOverview";
import DashboardDetailToday from "./dashboard/DashboardDetailToday";
import DashboardDetailMonthly from "./dashboard/DashboardDetailMonthly";
import DashboardDetailPace from "./dashboard/DashboardDetailPace";
import DashboardDetailClients from "./dashboard/DashboardDetailClients";
import DashboardDetailSports from "./dashboard/DashboardDetailSports";
import DashboardDetailHours from "./dashboard/DashboardDetailHours";
import DashboardDetailReferrals from "./dashboard/DashboardDetailReferrals";
import WeeklyCalendar from "./WeeklyCalendar";
import BookingsList from "./BookingsList";
import PatientsSection from "./PatientsSection";
import RecurringClients from "./RecurringClients";
import SellersSection from "./SellersSection";
import ConfigSection from "./ConfigSection";

interface AdminPanelProps {
  profile: { displayName?: string; email: string; role: string } | null;
  onClose: () => void;
  onLogout: () => void;
  dashboardData: DashboardData;
  bookings: Booking[];
  sellers: Seller[];
  isConnected: boolean;
  onConnect: () => void;
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
  bookingContent: ReactNode;
}

const DASHBOARD_TITLES: Record<string, string> = {
  today: "Detalle de hoy",
  monthly: "Resumen mensual",
  pace: "Análisis de ritmo",
  clients: "Clientes recurrentes",
  sports: "Deportes",
  hours: "Distribución horaria",
  referrals: "Referidos",
};

type TabId = "reservar" | "dashboard" | "calendario" | "turnos" | "pacientes" | "vendedores" | "config";

const NAV_ITEMS: { id: TabId; icon: typeof LayoutDashboard; label: string }[] = [
  { id: "reservar", icon: CalendarPlus, label: "Reservar" },
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "calendario", icon: CalendarIcon, label: "Calendario" },
  { id: "turnos", icon: List, label: "Turnos" },
  { id: "pacientes", icon: Users, label: "Pacientes" },
  { id: "vendedores", icon: Award, label: "Vendedores" },
  { id: "config", icon: Settings, label: "Config" },
];

export default function AdminPanel({
  profile,
  onClose,
  onLogout,
  dashboardData,
  bookings,
  sellers,
  isConnected,
  onConnect,
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
  bookingContent,
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>("reservar");
  const [dashboardView, setDashboardView] = useState<string | null>(null);
  const panelScrollRef = useRef<HTMLDivElement>(null);

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    setDashboardView(null);
    panelScrollRef.current?.scrollTo({ top: 0 });
  };

  const sectionTitle = (): string => {
    if (activeTab === "reservar") return "Reservar turno";
    if (activeTab === "dashboard")
      return dashboardView ? (DASHBOARD_TITLES[dashboardView] || "Dashboard") : "Dashboard";
    if (activeTab === "calendario") return "Calendario semanal";
    if (activeTab === "turnos") return "Todos los turnos";
    if (activeTab === "pacientes") return "Pacientes";
    if (activeTab === "vendedores") return "Vendedores";
    if (activeTab === "config") return "Configuración";
    return "";
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar — fixed height, no scroll */}
      <nav className="w-[68px] shrink-0 bg-gray-900 flex flex-col items-center py-4 gap-1 h-screen overflow-hidden">
        {/* Logo */}
        <div className="mb-4 px-1">
          <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden">
            <img src="/logo.png" alt="Reset Lab" className="w-9 h-9 object-contain" />
          </div>
        </div>

        <div className="w-8 border-t border-white/10 mb-2" />

        {/* Tab icons */}
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              title={item.label}
              onClick={() => handleTabChange(item.id)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative ${
                isActive
                  ? "bg-white/15 text-white"
                  : "text-gray-500 hover:text-white hover:bg-white/10"
              }`}
            >
              <item.icon className="w-[18px] h-[18px]" />
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-white rounded-r-full" />
              )}
            </button>
          );
        })}

        {/* Bottom section: user + close + logout */}
        <div className="mt-auto flex flex-col items-center gap-1.5">
          {/* User avatar */}
          <div
            className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-xs shrink-0"
            title={profile?.displayName || profile?.email}
          >
            {(profile?.displayName || profile?.email || "A").charAt(0).toUpperCase()}
          </div>

          <div className="w-8 border-t border-white/10 my-1" />

          {/* Close admin */}
          <button
            onClick={onClose}
            title="Cerrar panel admin"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all"
          >
            <PanelLeftClose className="w-[18px] h-[18px]" />
          </button>

          {/* Logout */}
          <button
            onClick={onLogout}
            title="Cerrar sesión"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-[18px] h-[18px]" />
          </button>
        </div>
      </nav>

      {/* Content area — this scrolls */}
      <div ref={panelScrollRef} className="flex-1 overflow-y-auto custom-scrollbar bg-[#F8F9FA]">
        {/* Section header */}
        <div className="sticky top-0 z-10 bg-[#F8F9FA]/80 backdrop-blur-md border-b border-gray-200/60 px-8 py-4">
          <div className="flex items-center gap-2 max-w-6xl mx-auto">
            {activeTab === "dashboard" && dashboardView && (
              <button
                onClick={() => setDashboardView(null)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors -ml-1"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="flex-1">
              <h2 className="text-lg font-bold">{sectionTitle()}</h2>
              <p className="text-[11px] text-gray-400">
                Panel de Administración — Recovery Lab
              </p>
            </div>
            {/* User badge in header */}
            <div className="hidden sm:flex items-center gap-2 bg-white border border-gray-100 rounded-full px-3 py-1.5 shadow-sm">
              <Shield className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-xs font-medium text-gray-700 max-w-[120px] truncate">
                {profile?.displayName || profile?.email}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                admin
              </span>
            </div>
          </div>
        </div>

        {/* Tab content */}
        <div className="px-8 py-6 max-w-6xl mx-auto">
          <div className="space-y-6">
            {activeTab === "reservar" && bookingContent}

            {activeTab === "dashboard" && (
              <>
                {!dashboardView && (
                  <DashboardOverview data={dashboardData} onNavigate={setDashboardView} />
                )}
                {dashboardView === "today" && <DashboardDetailToday data={dashboardData} />}
                {dashboardView === "monthly" && <DashboardDetailMonthly data={dashboardData} />}
                {dashboardView === "pace" && <DashboardDetailPace data={dashboardData} />}
                {dashboardView === "clients" && <DashboardDetailClients data={dashboardData} />}
                {dashboardView === "sports" && <DashboardDetailSports data={dashboardData} />}
                {dashboardView === "hours" && <DashboardDetailHours data={dashboardData} />}
                {dashboardView === "referrals" && <DashboardDetailReferrals data={dashboardData} />}
              </>
            )}

            {activeTab === "calendario" && <WeeklyCalendar bookings={bookings} />}
            {activeTab === "turnos" && <BookingsList bookings={bookings} />}

            {activeTab === "pacientes" && (
              <>
                <PatientsSection bookings={bookings} />
                <RecurringClients recurringClients={dashboardData.recurringClients} />
              </>
            )}

            {activeTab === "vendedores" && (
              <SellersSection
                sellers={sellers}
                bookings={bookings}
                newSellerName={newSellerName}
                onNewSellerNameChange={onNewSellerNameChange}
                newSellerEmail={newSellerEmail}
                onNewSellerEmailChange={onNewSellerEmailChange}
                newSellerPhone={newSellerPhone}
                onNewSellerPhoneChange={onNewSellerPhoneChange}
                showAddSeller={showAddSeller}
                onToggleAddSeller={onToggleAddSeller}
                onAddSeller={onAddSeller}
                onCopyCode={onCopyCode}
                copiedCode={copiedCode}
                sellerRankingPeriod={sellerRankingPeriod}
                onRankingPeriodChange={onRankingPeriodChange}
                sellerRankings={sellerRankings}
              />
            )}

            {activeTab === "config" && (
              <ConfigSection isConnected={isConnected} onConnect={onConnect} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
