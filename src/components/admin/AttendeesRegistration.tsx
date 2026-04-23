import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  ClipboardList,
  Users,
  Mail,
  Phone,
  Activity,
  User as UserIcon,
  CheckCircle2,
  Save,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { Attendee, Booking } from "../../types";
import { isValidEmail } from "../../utils/validation";

interface AttendeesRegistrationProps {
  bookings: Booking[];
  onSaveAttendees: (bookingId: string, attendees: Attendee[]) => Promise<void>;
}

type AttendeeDraft = {
  name: string;
  email: string;
  phone: string;
  sport: string;
};

function emptyAttendee(): AttendeeDraft {
  return { name: "", email: "", phone: "", sport: "" };
}

function attendeeToDraft(a: Attendee): AttendeeDraft {
  return {
    name: a.name || "",
    email: a.email || "",
    phone: a.phone || "",
    sport: a.sport || "",
  };
}

function attendeeIsComplete(a: AttendeeDraft): boolean {
  return (
    a.email.trim().length > 0 &&
    isValidEmail(a.email.trim()) &&
    a.phone.trim().length > 0 &&
    a.sport.trim().length > 0
  );
}

export function getPendingBookings(bookings: Booking[]): Booking[] {
  const now = Date.now();
  return bookings
    .filter((b) => {
      const qty = b.quantity || 1;
      if (qty <= 1) return false;
      const needed = qty - 1;
      const current = (b.attendees || []).length;
      if (current >= needed) return false;
      try {
        const endMs = parseISO(b.end).getTime();
        if (!Number.isFinite(endMs)) return true;
        return endMs > now - 24 * 60 * 60 * 1000;
      } catch {
        return true;
      }
    })
    .sort((a, b) => a.start.localeCompare(b.start));
}

export default function AttendeesRegistration({
  bookings,
  onSaveAttendees,
}: AttendeesRegistrationProps) {
  const pending = useMemo(() => getPendingBookings(bookings), [bookings]);
  const [expanded, setExpanded] = useState<string | null>(() => pending[0]?.id || null);
  const [drafts, setDrafts] = useState<Record<string, AttendeeDraft[]>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);

  const getDraftsFor = (booking: Booking): AttendeeDraft[] => {
    if (drafts[booking.id!]) return drafts[booking.id!];
    const needed = (booking.quantity || 1) - 1;
    const current = (booking.attendees || []).map(attendeeToDraft);
    const padded = [
      ...current,
      ...Array.from({ length: Math.max(0, needed - current.length) }, emptyAttendee),
    ];
    return padded;
  };

  const setDraftsFor = (bookingId: string, next: AttendeeDraft[]) => {
    setDrafts((prev) => ({ ...prev, [bookingId]: next }));
    setSavedId(null);
    setErrorId(null);
  };

  const updateAttendee = (
    bookingId: string,
    idx: number,
    patch: Partial<AttendeeDraft>,
    current: AttendeeDraft[]
  ) => {
    const next = current.map((a, i) => (i === idx ? { ...a, ...patch } : a));
    setDraftsFor(bookingId, next);
  };

  const handleSave = async (booking: Booking) => {
    if (!booking.id) return;
    const current = getDraftsFor(booking);
    const validOnes = current.filter(attendeeIsComplete);
    if (validOnes.length === 0) {
      setErrorId(booking.id);
      return;
    }
    setSavingId(booking.id);
    setErrorId(null);
    try {
      const attendees: Attendee[] = validOnes.map((a) => ({
        name: a.name.trim(),
        email: a.email.trim(),
        phone: a.phone.trim(),
        sport: a.sport.trim(),
      }));
      await onSaveAttendees(booking.id, attendees);
      setSavedId(booking.id);
      setTimeout(() => setSavedId(null), 2500);
    } catch {
      setErrorId(booking.id);
    } finally {
      setSavingId(null);
    }
  };

  if (pending.length === 0) {
    return (
      <section>
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList className="w-5 h-5 text-emerald-500" />
          <h3 className="font-bold text-base">Registro de asistentes</h3>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          </div>
          <p className="text-sm font-semibold text-gray-800">Todo al día</p>
          <p className="text-xs text-gray-400 mt-1">
            No hay reservas grupales con datos pendientes de completar.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <ClipboardList className="w-5 h-5 text-amber-500" />
        <h3 className="font-bold text-base">Registro de asistentes</h3>
        <span className="text-xs text-gray-400 ml-auto">
          {pending.length} reserva{pending.length !== 1 ? "s" : ""} pendiente{pending.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5 flex gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <p className="font-semibold mb-1">Hay reservas grupales con acompañantes por registrar.</p>
          <p className="text-amber-800">
            Cuando el grupo llega al local, completá los datos (email, celular y deporte) de cada
            persona para que queden en la base de datos.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {pending.map((booking) => {
          const id = booking.id!;
          const isOpen = expanded === id;
          const bDate = parseISO(booking.start);
          const bEnd = parseISO(booking.end);
          const needed = (booking.quantity || 1) - 1;
          const currentDrafts = getDraftsFor(booking);
          const completedCount = currentDrafts.filter(attendeeIsComplete).length;
          const savedCount = (booking.attendees || []).length;
          const missing = Math.max(0, needed - savedCount);

          return (
            <div
              key={id}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {booking.clientName}{" "}
                    <span className="text-gray-400 font-normal">· {booking.quantity}p</span>
                  </p>
                  <p className="text-[11px] text-gray-400 truncate">
                    {format(bDate, "EEE d MMM", { locale: es })} · {format(bDate, "HH:mm")}–
                    {format(bEnd, "HH:mm")} · {booking.clientEmail}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                      missing === 0
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {savedCount}/{needed} cargados
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50/40">
                  <div className="mb-3 text-[11px] text-gray-500 flex items-center gap-2">
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>
                      Titular:{" "}
                      <span className="font-medium text-gray-700">{booking.clientName}</span>{" "}
                      <span className="text-gray-400">({booking.clientEmail})</span>
                    </span>
                  </div>

                  <div className="space-y-3">
                    {currentDrafts.map((a, idx) => {
                      const isComplete = attendeeIsComplete(a);
                      const emailInvalid =
                        a.email.trim().length > 0 && !isValidEmail(a.email.trim());
                      return (
                        <div
                          key={idx}
                          className={`rounded-xl border p-3 transition-colors ${
                            isComplete
                              ? "border-emerald-200 bg-emerald-50/40"
                              : "border-gray-200 bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                              Acompañante {idx + 1}
                            </span>
                            {isComplete && (
                              <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                                <CheckCircle2 className="w-3 h-3" />
                                Completo
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div className="relative">
                              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                              <input
                                type="text"
                                value={a.name}
                                onChange={(e) =>
                                  updateAttendee(id, idx, { name: e.target.value }, currentDrafts)
                                }
                                placeholder="Nombre (opcional)"
                                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-xs"
                              />
                            </div>

                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                              <input
                                type="email"
                                value={a.email}
                                onChange={(e) =>
                                  updateAttendee(id, idx, { email: e.target.value }, currentDrafts)
                                }
                                placeholder="Email *"
                                className={`w-full pl-9 pr-3 py-2 rounded-lg border outline-none transition-all text-xs ${
                                  emailInvalid
                                    ? "border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                    : "border-gray-200 focus:border-black focus:ring-1 focus:ring-black"
                                }`}
                              />
                            </div>

                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                              <input
                                type="tel"
                                value={a.phone}
                                onChange={(e) =>
                                  updateAttendee(id, idx, { phone: e.target.value }, currentDrafts)
                                }
                                placeholder="Celular *"
                                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-xs"
                              />
                            </div>

                            <div className="relative">
                              <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                              <input
                                type="text"
                                value={a.sport}
                                onChange={(e) =>
                                  updateAttendee(id, idx, { sport: e.target.value }, currentDrafts)
                                }
                                placeholder="Deporte *"
                                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-xs"
                              />
                            </div>
                          </div>

                          {emailInvalid && (
                            <p className="text-[10px] text-red-500 mt-1.5">
                              Ingresá un email válido.
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between gap-3 mt-4">
                    <div className="text-[11px] text-gray-500">
                      {completedCount} de {needed} acompañante
                      {needed !== 1 ? "s" : ""} listo{completedCount !== 1 ? "s" : ""} para guardar
                    </div>
                    <div className="flex items-center gap-2">
                      {savedId === id && (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Guardado
                        </span>
                      )}
                      {errorId === id && (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-red-600">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Error al guardar
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleSave(booking)}
                        disabled={savingId === id || completedCount === 0}
                        className="flex items-center gap-1.5 bg-black text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Save className="w-3.5 h-3.5" />
                        {savingId === id ? "Guardando..." : "Guardar datos"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
