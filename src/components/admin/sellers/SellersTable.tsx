import { useMemo, useState } from "react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Search, Download, ArrowUpDown, ChevronDown } from "lucide-react";
import type { Seller, SellerMetrics } from "../../../types";

type FilterKey = "all" | "active" | "cold" | "no-goal" | "above-goal";
type SortKey = "name" | "month" | "week" | "total" | "trend";

interface SellersTableProps {
  sellers: Seller[];
  metricsMap: Map<string, SellerMetrics>;
  onOpenDetail: (seller: Seller) => void;
}

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "active", label: "Activos" },
  { key: "cold", label: "Fríos / Inactivos" },
  { key: "above-goal", label: "Superaron meta" },
  { key: "no-goal", label: "Sin meta" },
];

export default function SellersTable({
  sellers,
  metricsMap,
  onOpenDetail,
}: SellersTableProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sortKey, setSortKey] = useState<SortKey>("month");
  const [sortAsc, setSortAsc] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = sellers
      .map((s) => ({
        seller: s,
        metrics:
          metricsMap.get(s.code) || {
            code: s.code,
            totalAllTime: 0,
            last7Days: 0,
            prev7Days: 0,
            last30Days: 0,
            prev30Days: 0,
            trend7dPct: 0,
            trend30dPct: 0,
            uniqueClients: 0,
            repeatClients: 0,
            repeatRate: 0,
            lastActivity: null,
            streakDays: 0,
            sparkline: [],
            goal: 0,
            goalProgress: 0,
            status: "no-activity" as const,
          },
      }))
      .filter(({ seller, metrics }) => {
        if (q) {
          const hay = `${seller.name} ${seller.email} ${seller.code}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        if (filter === "active") return metrics.last30Days > 0;
        if (filter === "cold")
          return metrics.status === "cold" || metrics.status === "idle" || metrics.status === "no-activity";
        if (filter === "above-goal") return metrics.goalProgress >= 100;
        if (filter === "no-goal") return !seller.monthlyGoal || seller.monthlyGoal === 0;
        return true;
      });

    out.sort((a, b) => {
      let va: number | string = 0;
      let vb: number | string = 0;
      if (sortKey === "name") {
        va = a.seller.name.toLowerCase();
        vb = b.seller.name.toLowerCase();
      } else if (sortKey === "month") {
        va = a.metrics.last30Days;
        vb = b.metrics.last30Days;
      } else if (sortKey === "week") {
        va = a.metrics.last7Days;
        vb = b.metrics.last7Days;
      } else if (sortKey === "total") {
        va = a.metrics.totalAllTime;
        vb = b.metrics.totalAllTime;
      } else if (sortKey === "trend") {
        va = a.metrics.trend7dPct;
        vb = b.metrics.trend7dPct;
      }
      if (va < vb) return sortAsc ? -1 : 1;
      if (va > vb) return sortAsc ? 1 : -1;
      return 0;
    });
    return out;
  }, [sellers, metricsMap, query, filter, sortKey, sortAsc]);

  const exportCSV = () => {
    const header = [
      "Nombre",
      "Email",
      "Teléfono",
      "Código",
      "Meta mensual",
      "Referidos 30d",
      "Referidos 7d",
      "Trend 7d %",
      "Clientes únicos",
      "Tasa retorno %",
      "Total histórico",
      "Última actividad",
    ];
    const lines = rows.map(({ seller, metrics }) =>
      [
        seller.name,
        seller.email,
        seller.phone,
        seller.code,
        seller.monthlyGoal ?? "",
        metrics.last30Days,
        metrics.last7Days,
        metrics.trend7dPct,
        metrics.uniqueClients,
        Math.round(metrics.repeatRate),
        metrics.totalAllTime,
        metrics.lastActivity ?? "",
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vendedores-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((v) => !v);
    else {
      setSortKey(key);
      setSortAsc(key === "name");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3 border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <h4 className="font-bold text-sm">Tabla operativa</h4>
          <span className="text-[10px] text-gray-400">
            {rows.length} de {sellers.length}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${
            collapsed ? "-rotate-90" : ""
          }`}
        />
      </button>

      {!collapsed && (
        <>
          <div className="px-5 py-3 border-b border-gray-100 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre, email o código…"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-xs"
              />
            </div>
            <div className="flex items-center gap-1 overflow-x-auto">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-colors ${
                    filter === f.key
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <button
              onClick={exportCSV}
              disabled={rows.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors text-xs font-semibold disabled:opacity-40"
              title="Exportar CSV"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50/60 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  <SortTh label="Vendedor" sortKey="name" active={sortKey} asc={sortAsc} onClick={toggleSort} align="left" />
                  <th className="px-3 py-2 text-left">Contacto</th>
                  <th className="px-3 py-2 text-left">Código</th>
                  <SortTh label="30d" sortKey="month" active={sortKey} asc={sortAsc} onClick={toggleSort} />
                  <SortTh label="7d" sortKey="week" active={sortKey} asc={sortAsc} onClick={toggleSort} />
                  <SortTh label="Trend" sortKey="trend" active={sortKey} asc={sortAsc} onClick={toggleSort} />
                  <SortTh label="Total" sortKey="total" active={sortKey} asc={sortAsc} onClick={toggleSort} />
                  <th className="px-3 py-2 text-left">Últ. actividad</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-10 text-center text-gray-400 text-xs">
                      Sin coincidencias con los filtros aplicados
                    </td>
                  </tr>
                ) : (
                  rows.map(({ seller, metrics }) => {
                    const trendPositive = metrics.trend7dPct > 0;
                    return (
                      <tr
                        key={seller.id || seller.code}
                        className="border-t border-gray-50 hover:bg-gray-50/60 cursor-pointer transition-colors"
                        onClick={() => onOpenDetail(seller)}
                      >
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-[10px] shrink-0">
                              {seller.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold truncate max-w-[120px]">{seller.name}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-gray-500 truncate max-w-[160px]">{seller.email}</td>
                        <td className="px-3 py-2.5 font-mono font-bold text-gray-600">{seller.code}</td>
                        <td className="px-3 py-2.5 text-center font-bold">
                          {metrics.last30Days}
                          {seller.monthlyGoal ? (
                            <span className="text-[9px] text-gray-400 font-normal">/{seller.monthlyGoal}</span>
                          ) : null}
                        </td>
                        <td className="px-3 py-2.5 text-center">{metrics.last7Days}</td>
                        <td className="px-3 py-2.5 text-center">
                          {metrics.trend7dPct === 0 ? (
                            <span className="text-gray-400">—</span>
                          ) : (
                            <span
                              className={`font-bold ${
                                trendPositive ? "text-emerald-600" : "text-red-500"
                              }`}
                            >
                              {trendPositive ? "+" : ""}
                              {metrics.trend7dPct}%
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-center text-gray-600">{metrics.totalAllTime}</td>
                        <td className="px-3 py-2.5 text-gray-500">
                          {metrics.lastActivity
                            ? formatDistanceToNow(parseISO(metrics.lastActivity), {
                                locale: es,
                                addSuffix: true,
                              })
                            : "—"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function SortTh({
  label,
  sortKey,
  active,
  asc,
  onClick,
  align = "center",
}: {
  label: string;
  sortKey: SortKey;
  active: SortKey;
  asc: boolean;
  onClick: (k: SortKey) => void;
  align?: "left" | "center";
}) {
  const isActive = active === sortKey;
  return (
    <th className={`px-3 py-2 ${align === "left" ? "text-left" : "text-center"}`}>
      <button
        onClick={() => onClick(sortKey)}
        className={`inline-flex items-center gap-1 hover:text-gray-700 transition-colors ${
          isActive ? "text-gray-900" : ""
        }`}
      >
        {label}
        <ArrowUpDown
          className={`w-2.5 h-2.5 ${isActive ? "opacity-80" : "opacity-30"} ${
            isActive && asc ? "rotate-180" : ""
          } transition-transform`}
        />
      </button>
    </th>
  );
}
