import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { motion } from "motion/react";
import { FlaskConical, X } from "lucide-react";
import { useAuth } from "./contexts/AuthContext";
import { useDemo } from "./contexts/DemoContext";
import { isValidEmail } from "./utils/validation";

import { useCalendarConnection } from "./hooks/useCalendarConnection";
import { useBookings } from "./hooks/useBookings";
import { useSellers } from "./hooks/useSellers";
import { useSlots } from "./hooks/useSlots";
import { useDashboardData } from "./hooks/useDashboardData";

import LoadingScreen from "./components/layout/LoadingScreen";
import Navbar from "./components/layout/Navbar";
import CalendarPanel from "./components/calendar/CalendarPanel";
import BookingForm from "./components/booking/BookingForm";
import TimeSlotList from "./components/booking/TimeSlotList";
import BookingStatusOverlay from "./components/booking/BookingStatusOverlay";
import ConfirmationModal from "./components/booking/ConfirmationModal";
import AdminPanel from "./components/admin/AdminPanel";
import LandingPage from "./pages/LandingPage";

import type { TimeSlot } from "./types";

interface AppProps {
  mode?: "public" | "admin";
}

export default function App({ mode = "public" }: AppProps) {
  const { profile, logout, isAdmin } = useAuth();
  const demo = useDemo();
  const isAdminMode = mode === "admin" && isAdmin;

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAdmin, setShowAdmin] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [sport, setSport] = useState("");
  const [reason, setReason] = useState("");
  const [referredBy, setReferredBy] = useState("");

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const refParam = searchParams.get("ref");
    if (refParam && !referredBy) {
      setReferredBy(refParam);
      const next = new URLSearchParams(searchParams);
      next.delete("ref");
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, referredBy, setSearchParams]);

  const { isConnected, isLoading, handleConnect } = useCalendarConnection();
  const {
    bookings,
    firebaseConnected,
    bookingStatus,
    handleConfirmBooking,
    handleSaveAttendees,
  } = useBookings();
  const sellerHook = useSellers(bookings);
  const { slots, emptyReason } = useSlots(selectedDate, isConnected, bookings);
  const dashboardData = useDashboardData(bookings);

  const matchedSeller = useMemo(
    () => sellerHook.matchSeller(referredBy),
    [sellerHook.matchSeller, referredBy]
  );

  const handleSlotSelect = (slot: TimeSlot) => {
    if (!clientName.trim() || !clientEmail.trim() || !isValidEmail(clientEmail)) return;
    const remainingSpots = slot.capacity - slot.bookedCount;
    if (quantity > remainingSpots) return;
    setSelectedSlot(slot);
  };

  const handleConfirm = async () => {
    if (!selectedSlot) return;
    setSelectedSlot(null);
    await handleConfirmBooking({
      selectedSlot,
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim(),
      quantity,
      sport: sport.trim(),
      reason: reason.trim(),
      referredBy: referredBy.trim(),
      matchedSeller,
      isConnected,
    });
    setClientName("");
    setClientEmail("");
    setQuantity(1);
    setSport("");
    setReason("");
    setReferredBy("");
  };

  if (isLoading) return <LoadingScreen />;

  const bookingView = (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
      <CalendarPanel
        currentMonth={currentMonth}
        selectedDate={selectedDate}
        onMonthChange={setCurrentMonth}
        onDateSelect={setSelectedDate}
      />

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="lg:col-span-5 flex flex-col gap-4 sm:gap-6"
      >
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-sm border border-gray-100 flex-1">
          <div className="mb-5 sm:mb-6">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Disponibilidad para el
            </span>
            <h3 className="text-lg sm:text-xl font-bold capitalize">
              {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
            </h3>
          </div>

          <BookingForm
            clientName={clientName}
            onClientNameChange={setClientName}
            clientEmail={clientEmail}
            onClientEmailChange={setClientEmail}
            sport={sport}
            onSportChange={setSport}
            reason={reason}
            onReasonChange={setReason}
            referredBy={referredBy}
            onReferredByChange={setReferredBy}
            quantity={quantity}
            onQuantityChange={setQuantity}
            matchedSeller={matchedSeller}
            isAdmin={isAdminMode}
            profile={isAdminMode ? profile : null}
            firebaseConnected={firebaseConnected}
          />

          <TimeSlotList
            slots={slots}
            quantity={quantity}
            bookingStatus={bookingStatus}
            clientName={clientName}
            clientEmail={clientEmail}
            sport={sport}
            reason={reason}
            emptyReason={emptyReason}
            onSlotSelect={handleSlotSelect}
          />
        </div>

        <BookingStatusOverlay status={bookingStatus} />
      </motion.div>
    </div>
  );

  const showAdminLayout = isAdminMode && showAdmin;

  const demoBanner = demo.enabled ? (
    <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 text-white text-xs font-medium shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center gap-3">
        <FlaskConical className="w-3.5 h-3.5 shrink-0" />
        <span className="flex-1">
          <strong className="font-bold">Modo demostración activo.</strong>{" "}
          Los datos mostrados son ficticios y no se guardan en Firebase.
        </span>
        {isAdminMode && (
          <button
            onClick={demo.disable}
            title="Desactivar modo demostración"
            className="p-1 rounded-full hover:bg-white/15 transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  ) : null;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 font-sans selection:bg-black selection:text-white flex flex-col">
      {demoBanner}
      {showAdminLayout ? (
        <AdminPanel
          profile={profile}
          onClose={() => setShowAdmin(false)}
          onLogout={logout}
          dashboardData={dashboardData}
          bookings={bookings}
          sellers={sellerHook.sellers}
          isConnected={isConnected}
          onConnect={handleConnect}
          newSellerName={sellerHook.newSellerName}
          onNewSellerNameChange={sellerHook.setNewSellerName}
          newSellerEmail={sellerHook.newSellerEmail}
          onNewSellerEmailChange={sellerHook.setNewSellerEmail}
          newSellerPhone={sellerHook.newSellerPhone}
          onNewSellerPhoneChange={sellerHook.setNewSellerPhone}
          newSellerGoal={sellerHook.newSellerGoal}
          onNewSellerGoalChange={sellerHook.setNewSellerGoal}
          showAddSeller={sellerHook.showAddSeller}
          onToggleAddSeller={() => sellerHook.setShowAddSeller(!sellerHook.showAddSeller)}
          onAddSeller={sellerHook.handleAddSeller}
          onCopyCode={sellerHook.handleCopyCode}
          onCopyLink={sellerHook.handleCopyLink}
          copiedCode={sellerHook.copiedCode}
          sellerRankingPeriod={sellerHook.sellerRankingPeriod}
          onRankingPeriodChange={sellerHook.setSellerRankingPeriod}
          sellerRankings={sellerHook.sellerRankings}
          sellerMetrics={sellerHook.sellerMetrics}
          teamMetrics={sellerHook.teamMetrics}
          onUpdateSeller={sellerHook.handleUpdateSeller}
          onDeleteSeller={sellerHook.handleDeleteSeller}
          onSaveAttendees={handleSaveAttendees}
          bookingContent={bookingView}
        />
      ) : isAdminMode ? (
        <>
          <Navbar
            profile={profile}
            isAdmin={isAdminMode}
            showAdmin={showAdmin}
            onToggleAdmin={() => setShowAdmin(true)}
            onLogout={logout}
          />
          <main className="mx-auto px-4 sm:px-6 pb-16 sm:pb-20 max-w-5xl w-full">
            {bookingView}
          </main>
        </>
      ) : (
        <LandingPage>{bookingView}</LandingPage>
      )}

      <ConfirmationModal
        selectedSlot={selectedSlot}
        clientName={clientName}
        clientEmail={clientEmail}
        sport={sport}
        reason={reason}
        referredBy={referredBy}
        matchedSeller={matchedSeller}
        quantity={quantity}
        onConfirm={handleConfirm}
        onCancel={() => setSelectedSlot(null)}
      />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E5E7EB;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #D1D5DB;
        }
      `}</style>
    </div>
  );
}
