import { CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface BookingStatusOverlayProps {
  status: "idle" | "loading" | "success" | "error";
}

export default function BookingStatusOverlay({ status }: BookingStatusOverlayProps) {
  return (
    <AnimatePresence>
      {status !== "idle" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={`
            p-6 rounded-3xl flex items-center gap-4 shadow-lg
            ${status === "loading" ? "bg-black text-white" : ""}
            ${status === "success" ? "bg-green-600 text-white" : ""}
            ${status === "error" ? "bg-red-600 text-white" : ""}
          `}
        >
          {status === "loading" && (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {status === "success" && <CheckCircle2 className="w-6 h-6" />}
          {status === "error" && <AlertCircle className="w-6 h-6" />}
          <span className="font-bold">
            {status === "loading" && "Procesando reserva..."}
            {status === "success" && "¡Turno agendado con éxito!"}
            {status === "error" && "Error al agendar. Intenta de nuevo."}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
