import { Users } from "lucide-react";
import type { Booking } from "../../types";

interface PatientsSectionProps {
  bookings: Booking[];
}

export default function PatientsSection({ bookings }: PatientsSectionProps) {
  const clientMap = new Map<
    string,
    { name: string; email: string; totalBookings: number; totalPeople: number; lastVisit: string }
  >();
  bookings.forEach((b) => {
    const existing = clientMap.get(b.clientEmail);
    if (existing) {
      existing.totalBookings += 1;
      existing.totalPeople += b.quantity || 1;
      if (b.start > existing.lastVisit) existing.lastVisit = b.start;
    } else {
      clientMap.set(b.clientEmail, {
        name: b.clientName,
        email: b.clientEmail,
        totalBookings: 1,
        totalPeople: b.quantity || 1,
        lastVisit: b.start,
      });
    }
  });
  const clients = Array.from(clientMap.values()).sort((a, b) => b.totalBookings - a.totalBookings);

  return (
    <section id="sec-pacientes">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-violet-500" />
        <h3 className="font-bold text-base">Pacientes</h3>
        <span className="text-xs text-gray-400 ml-auto">{clients.length} clientes</span>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {clients.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-10 h-10 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No hay pacientes aún</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto custom-scrollbar">
            {clients.map((c) => (
              <div key={c.email} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{c.name}</p>
                  <p className="text-[10px] text-gray-400 truncate">{c.email}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-center">
                    <p className="text-base font-bold text-gray-800">{c.totalBookings}</p>
                    <p className="text-[9px] text-gray-400 uppercase">Turnos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-base font-bold text-indigo-600">{c.totalPeople}</p>
                    <p className="text-[9px] text-gray-400 uppercase">Personas</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
