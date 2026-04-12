import { Settings, Clock, TrendingUp, Users, CheckCircle2 } from "lucide-react";
import { MAX_CAPACITY } from "../../constants";

interface ConfigSectionProps {
  isConnected: boolean;
  onConnect: () => void;
}

export default function ConfigSection({ isConnected, onConnect }: ConfigSectionProps) {
  return (
    <section id="sec-config">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-5 h-5 text-gray-500" />
        <h3 className="font-bold text-base">Configuración</h3>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm">Google Calendar</h4>
              <p className="text-xs text-gray-500 mt-0.5">Sincronizar disponibilidad y reservas</p>
            </div>
            {isConnected ? (
              <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Conectado
              </div>
            ) : (
              <button onClick={onConnect} className="bg-black text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors">
                Conectar
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 border border-gray-100 rounded-xl bg-gradient-to-br from-white to-blue-50/50 text-center">
            <Clock className="w-4 h-4 text-blue-500 mx-auto mb-2" />
            <p className="text-xs font-bold">Horarios</p>
            <p className="text-[10px] text-gray-400 mt-1">L-V: 08–20h</p>
            <p className="text-[10px] text-gray-400">Sáb: 09–14h</p>
          </div>
          <div className="p-4 border border-gray-100 rounded-xl bg-gradient-to-br from-white to-emerald-50/50 text-center">
            <TrendingUp className="w-4 h-4 text-emerald-500 mx-auto mb-2" />
            <p className="text-xs font-bold">Duración</p>
            <p className="text-xl font-bold mt-1">60<span className="text-[10px] text-gray-400 ml-0.5">min</span></p>
          </div>
          <div className="p-4 border border-gray-100 rounded-xl bg-gradient-to-br from-white to-violet-50/50 text-center">
            <Users className="w-4 h-4 text-violet-500 mx-auto mb-2" />
            <p className="text-xs font-bold">Capacidad</p>
            <p className="text-xl font-bold mt-1">{MAX_CAPACITY}<span className="text-[10px] text-gray-400 ml-0.5">/h</span></p>
          </div>
        </div>
      </div>
    </section>
  );
}
