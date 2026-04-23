import { LogOut, Shield, User as UserIcon, PanelLeftOpen, PanelLeftClose } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

interface NavbarProps {
  profile: { displayName?: string; email: string; role: string } | null;
  isAdmin: boolean;
  showAdmin: boolean;
  onToggleAdmin: () => void;
  onLogout: () => void;
}

export default function Navbar({
  profile,
  isAdmin,
  showAdmin,
  onToggleAdmin,
  onLogout,
}: NavbarProps) {
  return (
    <nav className="mx-auto px-6 pt-6 pb-4 flex flex-col items-center max-w-5xl gap-4">
      <img src="/logo.png" alt="Reset Lab" className="h-20 w-auto" />
      <div className="w-full flex justify-end items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 bg-white border border-gray-100 rounded-full px-4 py-2 shadow-sm">
          {isAdmin ? (
            <Shield className="w-4 h-4 text-amber-600" />
          ) : (
            <UserIcon className="w-4 h-4 text-gray-500" />
          )}
          <span className="text-sm font-medium text-gray-700 max-w-[150px] truncate">
            {profile?.displayName || profile?.email}
          </span>
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
              isAdmin
                ? "bg-amber-100 text-amber-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {profile?.role}
          </span>
        </div>
        <ThemeToggle variant="ghost" />
        {isAdmin && (
          <button
            onClick={onToggleAdmin}
            className={`p-2 rounded-full transition-all ${
              showAdmin
                ? "bg-gray-900 text-white shadow-lg"
                : "hover:bg-white hover:shadow-sm text-gray-500"
            }`}
            title={showAdmin ? "Cerrar panel" : "Abrir panel de administración"}
          >
            {showAdmin ? (
              <PanelLeftClose className="w-5 h-5" />
            ) : (
              <PanelLeftOpen className="w-5 h-5" />
            )}
          </button>
        )}
        <button
          onClick={onLogout}
          className="p-2 hover:bg-red-50 hover:text-red-600 rounded-full transition-all text-gray-500"
          title="Cerrar sesión"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
}
