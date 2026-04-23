import { useEffect, useState } from "react";
import { Menu, X, CalendarCheck } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import ThemeToggle from "./ThemeToggle";

const NAV_LINKS = [
  { href: "#inicio", label: "Inicio" },
  { href: "#nosotros", label: "Nosotros" },
  { href: "#horarios", label: "Horarios" },
  { href: "#ubicacion", label: "Ubicación" },
  { href: "#contacto", label: "Contacto" },
];

export default function PublicNavbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 safe-pt ${
        scrolled
          ? "bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto max-w-6xl px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        <a
          href="#inicio"
          className="flex items-center gap-2 shrink-0 active:scale-95 transition-transform"
          aria-label="Ir al inicio"
        >
          <img src="/logo.png" alt="Reset Lab" className="h-8 sm:h-9 w-auto" />
        </a>

        <ul className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:text-black hover:bg-gray-100 transition-colors"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle variant="ghost" />
          <a
            href="#reservar"
            className="hidden sm:inline-flex items-center gap-2 bg-black text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-sm hover:shadow-md hover:bg-gray-800 active:scale-95 transition-all"
          >
            <CalendarCheck className="w-4 h-4" />
            Reservar
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden w-11 h-11 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="md:hidden fixed inset-0 top-14 bg-black/20 backdrop-blur-sm"
              aria-hidden
            />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="md:hidden absolute inset-x-0 top-full border-t border-gray-100 bg-white/98 backdrop-blur-xl shadow-lg"
            >
              <ul className="mx-auto max-w-6xl px-4 py-3 flex flex-col gap-1 safe-pb">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="block px-4 py-4 rounded-2xl text-base font-medium text-gray-800 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
                <li>
                  <a
                    href="#reservar"
                    onClick={() => setOpen(false)}
                    className="sm:hidden flex items-center justify-center gap-2 mt-2 bg-black text-white text-base font-semibold px-5 py-4 rounded-2xl active:scale-[0.98] transition-transform"
                  >
                    <CalendarCheck className="w-5 h-5" />
                    Reservar turno
                  </a>
                </li>
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
