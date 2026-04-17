import {
  Mail,
  Activity,
  User as UserIcon,
  Users,
  Minus,
  Plus,
  CheckCircle2,
  Check,
} from "lucide-react";
import { MAX_CAPACITY } from "../../constants";
import { isValidEmail } from "../../utils/validation";
import type { Seller } from "../../types";

interface BookingFormProps {
  clientName: string;
  onClientNameChange: (v: string) => void;
  clientEmail: string;
  onClientEmailChange: (v: string) => void;
  sport: string;
  onSportChange: (v: string) => void;
  reason: string;
  onReasonChange: (v: string) => void;
  referredBy: string;
  onReferredByChange: (v: string) => void;
  quantity: number;
  onQuantityChange: (v: number) => void;
  matchedSeller: Seller | null;
  isAdmin: boolean;
  profile: { displayName?: string; email?: string } | null;
  firebaseConnected: boolean;
}

export default function BookingForm({
  clientName,
  onClientNameChange,
  clientEmail,
  onClientEmailChange,
  sport,
  onSportChange,
  reason,
  onReasonChange,
  referredBy,
  onReferredByChange,
  quantity,
  onQuantityChange,
  matchedSeller,
  isAdmin,
  profile,
  firebaseConnected,
}: BookingFormProps) {
  return (
    <>
      <div className="mb-4">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
          Tu nombre
        </label>
        <input
          type="text"
          value={clientName}
          onChange={(e) => onClientNameChange(e.target.value)}
          placeholder="Ingresá tu nombre para reservar"
          readOnly={!isAdmin && !!profile?.displayName}
          className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-sm ${
            !isAdmin && profile?.displayName ? "bg-gray-50 text-gray-600" : ""
          }`}
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
            onChange={(e) => onClientEmailChange(e.target.value)}
            placeholder="tu@email.com"
            readOnly={!isAdmin && !!profile?.email}
            className={`w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-sm ${
              !isAdmin && profile?.email ? "bg-gray-50 text-gray-600" : ""
            }`}
          />
        </div>
        {clientEmail && !isValidEmail(clientEmail) && (
          <p className="text-xs text-red-500 mt-1">Ingresá un correo válido</p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
          Deporte que practicás (opcional)
        </label>
        <div className="relative">
          <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={sport}
            onChange={(e) => onSportChange(e.target.value)}
            placeholder="Ej: Fútbol, Running, Tenis..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-sm"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
          Motivo de la consulta (opcional)
        </label>
        <textarea
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
          placeholder="¿Por qué estás tomando este turno?"
          rows={2}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-sm resize-none"
        />
      </div>

      <div className="mb-4">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
          Referido por (opcional)
        </label>
        <div className="relative">
          <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={referredBy}
            onChange={(e) => onReferredByChange(e.target.value)}
            placeholder="Nombre del vendedor o código de referido"
            className={`w-full pl-10 pr-10 py-3 rounded-xl border outline-none transition-all text-sm ${
              matchedSeller
                ? "border-emerald-400 bg-emerald-50/50 focus:ring-1 focus:ring-emerald-400"
                : "border-gray-200 focus:border-black focus:ring-1 focus:ring-black"
            }`}
          />
          {matchedSeller && (
            <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
          )}
        </div>
        {matchedSeller && (
          <div className="flex items-center gap-2 mt-1.5 px-1">
            <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-emerald-600" />
            </div>
            <span className="text-xs text-emerald-600 font-medium">
              Vendedor: {matchedSeller.name} ({matchedSeller.code})
            </span>
          </div>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
          Cantidad de personas
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-30"
            disabled={quantity <= 1}
          >
            <Minus className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl min-w-[80px] justify-center">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="font-bold text-lg">{quantity}</span>
          </div>
          <button
            type="button"
            onClick={() => onQuantityChange(Math.min(MAX_CAPACITY, quantity + 1))}
            className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-30"
            disabled={quantity >= MAX_CAPACITY}
          >
            <Plus className="w-4 h-4" />
          </button>
          <span className="text-xs text-gray-400 ml-1">máx. {MAX_CAPACITY}</span>
        </div>
      </div>

      {firebaseConnected && (
        <div className="flex items-center gap-2 mb-4 text-xs text-green-600">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Conectado a Firebase en tiempo real
        </div>
      )}
    </>
  );
}
