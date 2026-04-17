import { format } from "date-fns";
import { es } from "date-fns/locale";
import { X, Users } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { TimeSlot, Seller } from "../../types";

interface ConfirmationModalProps {
  selectedSlot: TimeSlot | null;
  clientName: string;
  clientEmail: string;
  sport: string;
  reason: string;
  referredBy: string;
  matchedSeller: Seller | null;
  quantity: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationModal({
  selectedSlot,
  clientName,
  clientEmail,
  sport,
  reason,
  referredBy,
  matchedSeller,
  quantity,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  return (
    <AnimatePresence>
      {selectedSlot && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          onClick={onCancel}
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
                <p className="text-sm text-gray-500 mt-1">
                  Revisá los datos antes de confirmar
                </p>
              </div>
              <button
                onClick={onCancel}
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
              {sport.trim() && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Deporte</span>
                  <span className="font-semibold">{sport}</span>
                </div>
              )}
              {reason.trim() && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Motivo</span>
                  <span className="font-semibold text-right max-w-[200px]">{reason}</span>
                </div>
              )}
              {referredBy.trim() && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Referido por</span>
                  <span className="font-semibold">
                    {matchedSeller
                      ? `${matchedSeller.name} (${matchedSeller.code})`
                      : referredBy}
                  </span>
                </div>
              )}
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
                  {format(selectedSlot.start, "HH:mm")} -{" "}
                  {format(selectedSlot.end, "HH:mm")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Duración</span>
                <span className="font-semibold">60 minutos</span>
              </div>
              {quantity > 1 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Personas</span>
                  <span className="font-semibold flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {quantity} persona{quantity > 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-400 text-center mb-5">
              Se enviará una confirmación a <strong>{clientEmail}</strong>
            </p>

            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 px-4 py-3 rounded-xl bg-black text-white text-sm font-bold hover:bg-gray-800 transition-colors"
              >
                Confirmar reserva
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
