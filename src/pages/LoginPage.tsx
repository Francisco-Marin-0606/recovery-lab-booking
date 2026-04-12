import React, { useState } from "react";
import { Eye, EyeOff, ArrowRight, UserPlus, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";

export default function LoginPage() {
  const { login, register, user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-surface-dark rounded-full mb-4" />
          <div className="h-4 w-32 bg-surface-dark rounded" />
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (isRegister) {
        if (!name.trim()) {
          setError("Ingresá tu nombre");
          setSubmitting(false);
          return;
        }
        await register(email, password, name.trim());
      } else {
        await login(email, password);
      }
      navigate("/");
    } catch (err: any) {
      const code = err?.code || "";
      if (code === "auth/user-not-found" || code === "auth/invalid-credential") {
        setError("Correo o contraseña incorrectos");
      } else if (code === "auth/email-already-in-use") {
        setError("Este correo ya está registrado");
      } else if (code === "auth/weak-password") {
        setError("La contraseña debe tener al menos 6 caracteres");
      } else if (code === "auth/invalid-email") {
        setError("El correo no es válido");
      } else {
        setError("Ocurrió un error. Intentá de nuevo.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="bg-dark-accent rounded-2xl p-5 mb-4 shadow-lg">
            <img
              src="/logo.png"
              alt="Reset Lab"
              className="h-24 w-auto"
            />
          </div>
          <p className="text-sm text-text-muted mt-1">Sistema de reservas</p>
        </div>

        {/* Card */}
        <div className="bg-surface rounded-3xl p-8 shadow-sm border border-border-subtle">
          {/* Tab switcher */}
          <div className="flex bg-surface-alt rounded-xl p-1 mb-8">
            <button
              onClick={() => { setIsRegister(false); setError(""); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                !isRegister ? "bg-brand-green text-white shadow-md" : "text-text-muted hover:text-text-secondary"
              }`}
            >
              <LogIn className="w-4 h-4" />
              Iniciar sesión
            </button>
            <button
              onClick={() => { setIsRegister(true); setError(""); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                isRegister ? "bg-brand-green text-white shadow-md" : "text-text-muted hover:text-text-secondary"
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Registrarse
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {isRegister && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre"
                    className="w-full px-4 py-3 rounded-xl bg-surface-alt border border-border-subtle text-text-primary focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none transition-all text-sm"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="w-full px-4 py-3 rounded-xl bg-surface-alt border border-border-subtle text-text-primary focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-surface-alt border border-border-subtle text-text-primary focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-surface-dark rounded-lg transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-text-muted" />
                  ) : (
                    <Eye className="w-4 h-4 text-text-muted" />
                  )}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-xl"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand-green text-white py-3.5 rounded-xl font-bold text-sm hover:bg-brand-green-light transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-green/25"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isRegister ? "Crear cuenta" : "Ingresar"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-text-muted mt-6">
          {isRegister
            ? "Al registrarte, podrás reservar turnos en línea."
            : "Ingresá con tu cuenta para acceder al sistema."}
        </p>
      </motion.div>
    </div>
  );
}
