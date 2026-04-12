import { Repeat } from "lucide-react";
import type { DashboardData } from "../../types";

interface RecurringClientsProps {
  recurringClients: DashboardData["recurringClients"];
}

export default function RecurringClients({ recurringClients }: RecurringClientsProps) {
  if (recurringClients.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-5 text-white">
      <div className="flex items-center gap-2 mb-3">
        <Repeat className="w-5 h-5" />
        <h4 className="font-bold">Clientes recurrentes ({recurringClients.length})</h4>
      </div>
      <div className="space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar">
        {recurringClients.map((c) => (
          <div key={c.email} className="flex items-center gap-3 bg-white/15 rounded-xl p-3 backdrop-blur-sm">
            <div className="w-8 h-8 rounded-full bg-white/25 flex items-center justify-center font-bold text-sm shrink-0">
              {c.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{c.name}</p>
              <p className="text-[10px] text-white/70 truncate">{c.email}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-lg font-bold">{c.visits}</p>
              <p className="text-[9px] text-white/60">visitas</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
