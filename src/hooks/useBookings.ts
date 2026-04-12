import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { db, ref, push, onValue } from "../firebase";
import type { Booking, Seller, TimeSlot } from "../types";

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
  setBookingStatus: (status: "idle" | "loading" | "success" | "error") => void;
}

export function useBookings(): UseBookingsReturn {
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

      try {
        const bookingData: Omit<Booking, "id"> = {
          summary: "Reserva Recovery Lab",
          description: `Turno agendado por ${clientName.trim()} (${clientEmail.trim()}) - ${quantity} persona${quantity > 1 ? "s" : ""} - Deporte: ${sport.trim()} - Motivo: ${reason.trim()}${referredBy.trim() ? ` - Referido por: ${matchedSeller ? `${matchedSeller.name} (${matchedSeller.code})` : referredBy.trim()}` : ""}`,
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
        };

        const bookingsRef = ref(db, "bookings");
        await push(bookingsRef, bookingData);

        if (isConnected) {
          try {
            await fetch("/api/calendar/book", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                summary: `Reserva - ${clientName.trim()} (${quantity}p)`,
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

        setBookingStatus("success");
        setTimeout(() => setBookingStatus("idle"), 3000);
      } catch (err) {
        console.error("Error al guardar en Firebase:", err);
        setBookingStatus("error");
        setTimeout(() => setBookingStatus("idle"), 3000);
      }
    },
    []
  );

  return { bookings, firebaseConnected, bookingStatus, handleConfirmBooking, setBookingStatus };
}
