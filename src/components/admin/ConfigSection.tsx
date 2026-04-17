import { Settings, Clock, TrendingUp, Users, CheckCircle2, RefreshCw, FlaskConical } from "lucide-react";
import { MAX_CAPACITY } from "../../constants";
import { useDemo } from "../../contexts/DemoContext";

interface ConfigSectionProps {
  isConnected: boolean;
  onConnect: () => void;
}

export default function ConfigSection({ isConnected, onConnect }: ConfigSectionProps) {
  const demo = useDemo();

  return (
    <section id="sec-config">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-5 h-5 text-gray-500" />
        <h3 className="font-bold text-base">Configuración</h3>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        {/* Modo demostración */}
        <div
          className={`p-4 rounded-xl border transition-colors ${
            demo.enabled
              ? "bg-gradient-to-br from-violet-50 to-indigo-50 border-violet-200"
              : "bg-gray-50 border-gray-100"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <FlaskConical
                  className={`w-4 h-4 ${demo.enabled ? "text-violet-600" : "text-gray-500"}`}
                />
                <h4 className="font-bold text-sm">Modo demostración</h4>
                {demo.enabled && (
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-violet-600 text-white">
                    activo
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Simula datos aleatorios (~15 personas/día, turnos completos e intermedios,
                vendedores con referidos) para mostrar el sistema sin afectar Firebase.
              </p>
              {demo.enabled && (
                <p className="text-[11px] text-violet-700 mt-2 font-medium">
                  {demo.bookings.length} reservas · {demo.sellers.length} vendedores generados
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <button
                type="button"
                role="switch"
                aria-checked={demo.enabled}
                aria-label="Activar modo demostración"
                onClick={demo.toggle}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-400 ${
                  demo.enabled
                    ? "bg-violet-600 border-violet-600"
                    : "bg-gray-200 border-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ${
                    demo.enabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <span
                className={`text-[10px] font-bold uppercase tracking-widest ${
                  demo.enabled ? "text-violet-700" : "text-gray-400"
                }`}
              >
                {demo.enabled ? "On" : "Off"}
              </span>
              {demo.enabled && (
                <button
                  onClick={demo.regenerate}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-violet-700 bg-white border border-violet-200 hover:bg-violet-50 transition-colors"
                >
                  <span className="inline-flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" />
                    Regenerar
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

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
