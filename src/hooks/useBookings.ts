import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { db, ref, push, onValue, update } from "../firebase";
import { useDemo } from "../contexts/DemoContext";
import type { Attendee, Booking, Seller, TimeSlot } from "../types";

function generateCancelToken(): string {
  const bytes = new Uint8Array(16);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

interface UseBookingsReturn {
  bookings: Booking[];
  firebaseConnected: boolean;
  bookingStatus: "idle" | "loading" | "success" | "error";
  handleConfirmBooking: (params: {
    selectedSlot: TimeSlot;
    clientName: string;
    clientEmail: string;
    quantity: number;
    sport: string;
    reason: string;
    referredBy: string;
    matchedSeller: Seller | null;
    isConnected: boolean;
  }) => Promise<void>;
  handleSaveAttendees: (bookingId: string, attendees: Attendee[]) => Promise<void>;
  setBookingStatus: (status: "idle" | "loading" | "success" | "error") => void;
}

export function useBookings(): UseBookingsReturn {
  const demo = useDemo();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [firebaseConnected, setFirebaseConnected] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    const bookingsRef = ref(db, "bookings");
    const unsubscribe = onValue(
      bookingsRef,
      (snapshot) => {
        const data = snapshot.val();
        setFirebaseConnected(true);
        if (data) {
          const list: Booking[] = Object.entries(data).map(
            ([id, val]: [string, any]) => ({ id, ...val })
          );
          setBookings(list);
        } else {
          setBookings([]);
        }
      },
      (error) => {
        console.error("Error de Firebase:", error);
        setFirebaseConnected(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleConfirmBooking = useCallback(
    async (params: {
      selectedSlot: TimeSlot;
      clientName: string;
      clientEmail: string;
      quantity: number;
      sport: string;
      reason: string;
      referredBy: string;
      matchedSeller: Seller | null;
      isConnected: boolean;
    }) => {
      const {
        selectedSlot,
        clientName,
        clientEmail,
        quantity,
        sport,
        reason,
        referredBy,
        matchedSeller,
        isConnected,
      } = params;

      setBookingStatus("loading");

      const sendConfirmationEmail = async () => {
        try {
          const emailRes = await fetch("/api/send-email", {
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
          if (!emailRes.ok) {
            const errorBody = await emailRes.text().catch(() => "");
            console.error(
              `Email endpoint respondió ${emailRes.status}:`,
              errorBody
            );
          } else {
            const emailData = await emailRes.json().catch(() => null);
            console.log("Email de confirmación enviado:", emailData);
          }
        } catch (emailErr) {
          console.error("No se pudo enviar el email de confirmación:", emailErr);
        }
      };

      try {
        const cancelToken = generateCancelToken();

        const bookingData: Omit<Booking, "id"> = {
          summary: "Reserva Recovery Lab",
          description: `Turno agendado por ${clientName.trim()} (${clientEmail.trim()}) - ${quantity} persona${quantity > 1 ? "s" : ""}${sport.trim() ? ` - Deporte: ${sport.trim()}` : ""}${reason.trim() ? ` - Motivo: ${reason.trim()}` : ""}${referredBy.trim() ? ` - Referido por: ${matchedSeller ? `${matchedSeller.name} (${matchedSeller.code})` : referredBy.trim()}` : ""}`,
          start: selectedSlot.start.toISOString(),
          end: selectedSlot.end.toISOString(),
          createdAt: new Date().toISOString(),
          clientName: clientName.trim(),
          clientEmail: clientEmail.trim(),
          quantity,
          sport: sport.trim(),
          reason: reason.trim(),
          referredBy: referredBy.trim(),
          sellerCode: matchedSeller?.code || "",
          reminderSent: false,
          cancelled: false,
          cancelToken,
        };

        if (demo.enabled) {
          console.info(
            "[Recovery Lab] Modo DEMO: la reserva se guarda solo en localStorage (no en Firebase ni Calendar), pero el email de confirmación SÍ se envía."
          );
          demo.addBooking({
            id: `demo-booking-local-${Date.now()}`,
            ...bookingData,
          });
          await sendConfirmationEmail();
          setBookingStatus("success");
          setTimeout(() => setBookingStatus("idle"), 3000);
          return;
        }

        const bookingsRef = ref(db, "bookings");
        const newBookingRef = await push(bookingsRef, bookingData);
        const newBookingId = newBookingRef.key;

        if (isConnected) {
          try {
            const calRes = await fetch("/api/calendar/book", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                summary: `Reserva - ${clientName.trim()} (${quantity}p)`,
                description: bookingData.description,
                start: selectedSlot.start.toISOString(),
                end: selectedSlot.end.toISOString(),
              }),
            });
            if (calRes.ok && newBookingId) {
              const calData = await calRes.json().catch(() => null);
              if (calData?.id) {
                await update(ref(db, `bookings/${newBookingId}`), {
                  calendarEventId: calData.id,
                });
              }
            }
          } catch (calErr) {
            console.error("No se pudo sincronizar con Google Calendar:", calErr);
          }
        }

        await sendConfirmationEmail();

        setBookingStatus("success");
        setTimeout(() => setBookingStatus("idle"), 3000);
      } catch (err) {
        console.error("Error al guardar en Firebase:", err);
        setBookingStatus("error");
        setTimeout(() => setBookingStatus("idle"), 3000);
      }
    },
    [demo]
  );

  const handleSaveAttendees = useCallback(
    async (bookingId: string, attendees: Attendee[]) => {
      if (!bookingId) return;

      const normalized: Attendee[] = attendees.map((a) => ({
        name: a.name?.trim() || "",
        email: a.email.trim(),
        phone: a.phone.trim(),
        sport: a.sport.trim(),
        addedAt: a.addedAt || new Date().toISOString(),
      }));

      if (demo.enabled) {
        demo.updateBooking(bookingId, { attendees: normalized });
        return;
      }

      try {
        const bookingRef = ref(db, `bookings/${bookingId}`);
        await update(bookingRef, { attendees: normalized });
      } catch (err) {
        console.error("Error guardando asistentes en Firebase:", err);
        throw err;
      }
    },
    [demo]
  );

  const effectiveBookings = demo.enabled ? demo.bookings : bookings;
  const effectiveConnected = demo.enabled ? true : firebaseConnected;

  return {
    bookings: effectiveBookings,
    firebaseConnected: effectiveConnected,
    bookingStatus,
    handleConfirmBooking,
    handleSaveAttendees,
    setBookingStatus,
  };
}
