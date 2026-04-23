import { useEffect, useState } from "react";
import { Menu, X, CalendarCheck } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

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

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
        <a
          href="#inicio"
          className="flex items-center gap-2 shrink-0"
          aria-label="Ir al inicio"
        >
          <img src="/logo.png" alt="Reset Lab" className="h-9 w-auto" />
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

        <div className="flex items-center gap-2">
          <a
            href="#reservar"
            className="hidden sm:inline-flex items-center gap-2 bg-black text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-sm hover:shadow-md hover:bg-gray-800 transition-all"
          >
            <CalendarCheck className="w-4 h-4" />
            Reservar
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-xl"
          >
            <ul className="mx-auto max-w-6xl px-4 py-3 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#reservar"
                  onClick={() => setOpen(false)}
                  className="sm:hidden flex items-center justify-center gap-2 mt-2 bg-black text-white text-sm font-semibold px-5 py-3 rounded-xl"
                >
                  <CalendarCheck className="w-4 h-4" />
                  Reservar turno
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
