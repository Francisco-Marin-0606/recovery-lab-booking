import type { DashboardData } from "../../../types";

interface Props {
  data: DashboardData;
}

export default function DashboardDetailClients({ data }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-amber-50 rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-amber-600">{data.recurringClients.length}</p>
          <p className="text-xs text-amber-600/60 mt-1">Recurrentes</p>
        </div>
        <div className="bg-gray-100 rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-gray-700">{data.totalUniqueClients}</p>
          <p className="text-xs text-gray-500 mt-1">Únicos totales</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {data.recurringClients.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">No hay clientes recurrentes aún</div>
        ) : (
          <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto custom-scrollbar">
            {data.recurringClients.map((c, idx) => (
              <div key={c.email} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className="w-7 text-center shrink-0">
                  {idx < 3 ? <span className="text-sm">{["🥇","🥈","🥉"][idx]}</span> : <span className="text-xs font-bold text-gray-300">{idx + 1}</span>}
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-xs shrink-0">{c.name.charAt(0).toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{c.name}</p>
                  <p className="text-[10px] text-gray-400 truncate">{c.email}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-center">
                    <p className="text-base font-bold">{c.visits}</p>
                    <p className="text-[9px] text-gray-400 uppercase">Visitas</p>
                  </div>
                  <div className="text-center">
                    <p className="text-base font-bold text-amber-600">{c.totalPeople}</p>
                    <p className="text-[9px] text-gray-400 uppercase">Personas</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
