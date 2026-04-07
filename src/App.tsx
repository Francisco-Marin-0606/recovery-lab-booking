import React, { useState, useEffect } from "react";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Settings,
  Mail,
  X
} from "lucide-react";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval,
  isBefore,
  startOfToday,
  addHours,
  setHours,
  setMinutes,
  parseISO
} from "date-fns";
import { es } from "date-fns/locale";
import { motion, AnimatePresence } from "motion/react";
import { db, ref, push, onValue, get } from "./firebase";

// --- Types ---
interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
}

interface Booking {
  id?: string;
  summary: string;
  description: string;
  start: string;
  end: string;
  createdAt: string;
  clientName: string;
  clientEmail: string;
}

// --- Components ---

export default function App() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [showAdmin, setShowAdmin] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [firebaseConnected, setFirebaseConnected] = useState(false);

  useEffect(() => {
    checkConnection();

    const bookingsRef = ref(db, "bookings");
    const unsubscribe = onValue(bookingsRef, (snapshot) => {
      const data = snapshot.val();
      setFirebaseConnected(true);
      if (data) {
        const list: Booking[] = Object.entries(data).map(([id, val]: [string, any]) => ({
          id,
          ...val,
        }));
        setBookings(list);
      } else {
        setBookings([]);
      }
    }, (error) => {
      console.error("Error de Firebase:", error);
      setFirebaseConnected(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isConnected) {
      fetchAvailability();
    } else {
      generateSlotsFromFirebase();
    }
  }, [selectedDate, isConnected, bookings]);

  const checkConnection = async () => {
    try {
      const res = await fetch("/api/calendar/status");
      const data = await res.json();
      setIsConnected(data.connected);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlotsFromFirebase = () => {
    const dayStart = setHours(setMinutes(selectedDate, 0), 8);
    const dayEnd = setHours(setMinutes(selectedDate, 0), 20);

    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const dayBookings = bookings.filter((b) => b.start.startsWith(dateStr));

    const daySlots: TimeSlot[] = [];
    let current = dayStart;

    while (isBefore(current, dayEnd)) {
      const slotEnd = addHours(current, 1);
      const isBooked = dayBookings.some((b) => {
        const bStart = parseISO(b.start);
        const bEnd = parseISO(b.end);
        return isBefore(current, bEnd) && isBefore(bStart, slotEnd);
      });

      daySlots.push({
        start: current,
        end: slotEnd,
        available: !isBooked && !isBefore(current, new Date()),
      });

      current = slotEnd;
    }

    setSlots(daySlots);
  };

  const fetchAvailability = async () => {
    const start = setHours(setMinutes(selectedDate, 0), 8);
    const end = setHours(setMinutes(selectedDate, 0), 20);
    
    try {
      const res = await fetch(`/api/calendar/availability?start=${start.toISOString()}&end=${end.toISOString()}`);
      const data = await res.json();
      
      const busy = data.calendars?.primary?.busy || [];
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const dayBookings = bookings.filter((b) => b.start.startsWith(dateStr));
      
      const daySlots: TimeSlot[] = [];
      let current = start;
      
      while (isBefore(current, end)) {
        const slotEnd = addHours(current, 1);
        const isBusy = busy.some((b: any) => {
          const bStart = parseISO(b.start);
          const bEnd = parseISO(b.end);
          return isBefore(current, bEnd) && isBefore(bStart, slotEnd);
        });

        const isBookedInFirebase = dayBookings.some((b) => {
          const bStart = parseISO(b.start);
          const bEnd = parseISO(b.end);
          return isBefore(current, bEnd) && isBefore(bStart, slotEnd);
        });
        
        daySlots.push({
          start: current,
          end: slotEnd,
          available: !isBusy && !isBookedInFirebase && !isBefore(current, new Date())
        });
        
        current = slotEnd;
      }
      
      setSlots(daySlots);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConnect = async () => {
    try {
      const res = await fetch("/api/auth/url");
      const { url } = await res.json();
      const authWindow = window.open(url, "google_auth", "width=600,height=700");
      
      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
          setIsConnected(true);
          window.removeEventListener('message', handleMessage);
        }
      };
      window.addEventListener('message', handleMessage);
    } catch (err) {
      console.error(err);
    }
  };

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSlotSelect = (slot: TimeSlot) => {
    if (!clientName.trim() || !clientEmail.trim() || !isValidEmail(clientEmail)) return;
    setSelectedSlot(slot);
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot || !clientName.trim() || !clientEmail.trim()) return;

    setBookingStatus('loading');
    setSelectedSlot(null);

    try {
      const bookingData: Omit<Booking, 'id'> = {
        summary: "Reserva Recovery Lab",
        description: `Turno agendado por ${clientName.trim()} (${clientEmail.trim()})`,
        start: selectedSlot.start.toISOString(),
        end: selectedSlot.end.toISOString(),
        createdAt: new Date().toISOString(),
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim(),
      };

      const bookingsRef = ref(db, "bookings");
      await push(bookingsRef, bookingData);

      if (isConnected) {
        try {
          await fetch("/api/calendar/book", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              summary: `Reserva - ${clientName.trim()}`,
              description: bookingData.description,
              start: selectedSlot.start.toISOString(),
              end: selectedSlot.end.toISOString(),
            }),
          });
        } catch (calErr) {
          console.error("No se pudo sincronizar con Google Calendar:", calErr);
        }
      }

      try {
        await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientName: clientName.trim(),
            clientEmail: clientEmail.trim(),
            date: format(selectedSlot.start, "EEEE d 'de' MMMM yyyy", { locale: es }),
            timeStart: format(selectedSlot.start, "HH:mm"),
            timeEnd: format(selectedSlot.end, "HH:mm"),
          }),
        });
      } catch (emailErr) {
        console.error("No se pudo enviar el email de confirmación:", emailErr);
      }

      setBookingStatus('success');
      setClientName("");
      setClientEmail("");
      setTimeout(() => setBookingStatus('idle'), 3000);
    } catch (err) {
      console.error("Error al guardar en Firebase:", err);
      setBookingStatus('error');
      setTimeout(() => setBookingStatus('idle'), 3000);
    }
  };

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between px-4 py-6">
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-gray-500 uppercase tracking-widest">
            {format(currentMonth, "yyyy")}
          </span>
          <h2 className="text-3xl font-bold text-gray-900 capitalize">
            {format(currentMonth, "MMMM", { locale: es })}
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    return (
      <div className="grid grid-cols-7 mb-2">
        {days.map((day) => (
          <div key={day} className="text-center text-xs font-bold text-gray-400 uppercase tracking-tighter">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
      start: startDate,
      end: endDate,
    });

    return (
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isPast = isBefore(day, startOfToday());

          return (
            <button
              key={day.toString()}
              disabled={isPast && !isSameDay(day, startOfToday())}
              onClick={() => setSelectedDate(day)}
              className={`
                relative h-14 flex flex-col items-center justify-center rounded-xl transition-all
                ${isSelected ? "bg-black text-white shadow-lg scale-105 z-10" : "hover:bg-gray-50"}
                ${!isCurrentMonth ? "text-gray-300" : "text-gray-700"}
                ${isPast && !isSameDay(day, startOfToday()) ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              <span className="text-sm font-semibold">{format(day, "d")}</span>
              {isSameDay(day, new Date()) && !isSelected && (
                <div className="absolute bottom-2 w-1 h-1 bg-red-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-gray-200 rounded-full mb-4" />
          <div className="h-4 w-32 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 font-sans selection:bg-black selection:text-white">
      {/* Header / Nav */}
      <nav className="max-w-5xl mx-auto px-6 py-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
            <CalendarIcon className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">App Juan</h1>
        </div>
        <button 
          onClick={() => setShowAdmin(!showAdmin)}
          className="p-2 hover:bg-white hover:shadow-sm rounded-full transition-all"
        >
          <Settings className="w-5 h-5 text-gray-500" />
        </button>
      </nav>

      <main className="max-w-5xl mx-auto px-6 pb-20">
        <AnimatePresence mode="wait">
          {showAdmin ? (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">Configuración del Centro</h2>
                <button 
                  onClick={() => setShowAdmin(false)}
                  className="text-sm font-medium text-gray-500 hover:text-black"
                >
                  Volver al Calendario
                </button>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg mb-1">Google Calendar</h3>
                      <p className="text-sm text-gray-500 max-w-md">
                        Conecta tu calendario de trabajo para sincronizar la disponibilidad y recibir las reservas automáticamente.
                      </p>
                    </div>
                    {isConnected ? (
                      <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        Conectado
                      </div>
                    ) : (
                      <button
                        onClick={handleConnect}
                        className="bg-black text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-gray-800 transition-colors"
                      >
                        Conectar
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 border border-gray-100 rounded-2xl">
                    <h4 className="font-bold mb-4">Horarios de Atención</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Lunes - Viernes</span>
                        <span className="font-medium">08:00 - 20:00</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Sábados</span>
                        <span className="font-medium">09:00 - 14:00</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 border border-gray-100 rounded-2xl">
                    <h4 className="font-bold mb-4">Duración de Turnos</h4>
                    <p className="text-sm text-gray-500 mb-4">Todos los turnos tienen una duración fija de 1 hora.</p>
                    <div className="inline-flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg text-sm font-bold">
                      <Clock className="w-4 h-4" />
                      60 minutos
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Calendar Section */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-7 bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
              >
                {renderHeader()}
                {renderDays()}
                {renderCells()}
              </motion.div>

              {/* Slots Section */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-5 flex flex-col gap-6"
              >
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex-1">
                  <div className="mb-6">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      Disponibilidad para el
                    </span>
                    <h3 className="text-xl font-bold capitalize">
                      {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                    </h3>
                  </div>

                  <div className="mb-4">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                      Tu nombre
                    </label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Ingresá tu nombre para reservar"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-sm"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                      Tu correo electrónico
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        placeholder="tu@email.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-sm"
                      />
                    </div>
                    {clientEmail && !isValidEmail(clientEmail) && (
                      <p className="text-xs text-red-500 mt-1">Ingresá un correo válido</p>
                    )}
                  </div>

                  {firebaseConnected && (
                    <div className="flex items-center gap-2 mb-4 text-xs text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      Conectado a Firebase en tiempo real
                    </div>
                  )}

                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {slots.length > 0 ? (
                        slots.map((slot, idx) => (
                          <button
                            key={idx}
                            disabled={!slot.available || bookingStatus === 'loading' || !clientName.trim() || !clientEmail.trim() || !isValidEmail(clientEmail)}
                            onClick={() => handleSlotSelect(slot)}
                            className={`
                              w-full p-4 rounded-2xl border transition-all flex items-center justify-between group
                              ${slot.available 
                                ? "border-gray-100 hover:border-black hover:shadow-md bg-white" 
                                : "bg-gray-50 border-transparent opacity-50 cursor-not-allowed"}
                            `}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`
                                w-10 h-10 rounded-xl flex items-center justify-center transition-colors
                                ${slot.available ? "bg-gray-100 group-hover:bg-black group-hover:text-white" : "bg-gray-200"}
                              `}>
                                <Clock className="w-5 h-5" />
                              </div>
                              <div className="text-left">
                                <p className="font-bold">{format(slot.start, "HH:mm")}</p>
                                <p className="text-xs text-gray-500">Sesión de 1 hora</p>
                              </div>
                            </div>
                            {slot.available && (
                              <span className="text-xs font-bold uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                                Reservar
                              </span>
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="text-center py-12 text-gray-400">
                          Cargando horarios...
                        </div>
                      )}
                    </div>
                </div>

                {/* Booking Status Overlay */}
                <AnimatePresence>
                  {bookingStatus !== 'idle' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={`
                        p-6 rounded-3xl flex items-center gap-4 shadow-lg
                        ${bookingStatus === 'loading' ? "bg-black text-white" : ""}
                        ${bookingStatus === 'success' ? "bg-green-600 text-white" : ""}
                        ${bookingStatus === 'error' ? "bg-red-600 text-white" : ""}
                      `}
                    >
                      {bookingStatus === 'loading' && (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      )}
                      {bookingStatus === 'success' && <CheckCircle2 className="w-6 h-6" />}
                      {bookingStatus === 'error' && <AlertCircle className="w-6 h-6" />}
                      <span className="font-bold">
                        {bookingStatus === 'loading' && "Procesando reserva..."}
                        {bookingStatus === 'success' && "¡Turno agendado con éxito!"}
                        {bookingStatus === 'error' && "Error al agendar. Intenta de nuevo."}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {selectedSlot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
            onClick={() => setSelectedSlot(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold">Confirmar reserva</h3>
                  <p className="text-sm text-gray-500 mt-1">Revisá los datos antes de confirmar</p>
                </div>
                <button
                  onClick={() => setSelectedSlot(null)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="bg-gray-50 rounded-2xl p-5 space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Nombre</span>
                  <span className="font-semibold">{clientName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Correo</span>
                  <span className="font-semibold">{clientEmail}</span>
                </div>
                <div className="border-t border-gray-200 my-1" />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Fecha</span>
                  <span className="font-semibold capitalize">
                    {format(selectedSlot.start, "EEEE d 'de' MMMM", { locale: es })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Horario</span>
                  <span className="font-semibold">
                    {format(selectedSlot.start, "HH:mm")} - {format(selectedSlot.end, "HH:mm")}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Duración</span>
                  <span className="font-semibold">60 minutos</span>
                </div>
              </div>

              <p className="text-xs text-gray-400 text-center mb-5">
                Se enviará una confirmación a <strong>{clientEmail}</strong>
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedSlot(null)}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmBooking}
                  className="flex-1 px-4 py-3 rounded-xl bg-black text-white text-sm font-bold hover:bg-gray-800 transition-colors"
                >
                  Confirmar reserva
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
