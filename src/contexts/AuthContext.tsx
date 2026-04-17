import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type UserRole = "admin";

interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  displayName?: string;
}

interface AuthContextType {
  user: { uid: string; email: string } | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}

// ── CREDENCIALES HARDCODEADAS (temporal para testing) ──
const HARDCODED_USERS: Record<string, { password: string; profile: UserProfile }> = {
  "admin@recoverylab.com": {
    password: "admin123",
    profile: { uid: "admin-001", email: "admin@recoverylab.com", role: "admin", displayName: "Admin Recovery" },
  },
};

const SESSION_KEY = "recovery_lab_session";

function getSavedSession(): UserProfile | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserProfile;
    if (parsed.role !== "admin") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = getSavedSession();
    if (saved) setProfile(saved);
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const entry = HARDCODED_USERS[email.toLowerCase()];
    if (!entry || entry.password !== password) {
      throw { code: "auth/invalid-credential" };
    }
    if (entry.profile.role !== "admin") {
      throw { code: "auth/not-admin" };
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(entry.profile));
    setProfile(entry.profile);
  };

  const logout = async () => {
    localStorage.removeItem(SESSION_KEY);
    setProfile(null);
  };

  const user = profile ? { uid: profile.uid, email: profile.email } : null;
  const isAdmin = profile?.role === "admin";

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}
