import { motion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";
import { COMPANY } from "../../constants";

export default function HeroSection() {
  return (
    <section
      id="inicio"
      className="relative overflow-hidden bg-gradient-to-br from-black via-gray-900 to-slate-800 text-white scroll-mt-16"
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(99,102,241,0.25), transparent 40%), radial-gradient(circle at 80% 30%, rgba(236,72,153,0.18), transparent 45%), radial-gradient(circle at 50% 90%, rgba(14,165,233,0.2), transparent 50%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6 pt-20 pb-24 sm:pt-28 sm:pb-32 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-sm text-xs font-medium tracking-wide uppercase"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          Ciencia aplicada a tu recuperación
        </motion.div>

        <motion.img
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          src="/logo.png"
          alt={COMPANY.name}
          className="h-24 sm:h-32 w-auto mt-8 drop-shadow-[0_10px_40px_rgba(255,255,255,0.15)]"
        />

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-8 text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]"
        >
          {COMPANY.tagline}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-6 max-w-2xl text-base sm:text-lg text-gray-300"
        >
          {COMPANY.shortDescription}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-3"
        >
          <a
            href="#reservar"
            className="group inline-flex items-center gap-2 bg-white text-black text-sm sm:text-base font-semibold px-7 py-3.5 rounded-full shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Reservar turno
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </a>
          <a
            href="#nosotros"
            className="inline-flex items-center gap-2 text-sm sm:text-base font-medium text-white/80 hover:text-white px-5 py-3.5 rounded-full border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all"
          >
            Conocé más
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 grid grid-cols-3 gap-4 sm:gap-10 text-left w-full max-w-2xl"
        >
          {[
            { n: "+500", l: "Atletas recuperados" },
            { n: "9", l: "Plazas por turno" },
            { n: "6", l: "Días por semana" },
          ].map((s) => (
            <div key={s.l} className="border-l border-white/15 pl-4">
              <div className="text-2xl sm:text-3xl font-bold">{s.n}</div>
              <div className="text-xs sm:text-sm text-gray-400 mt-1">{s.l}</div>
            </div>
          ))}
        </motion.div>
      </div>

      <div
        aria-hidden
        className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-b from-transparent to-[#F8F9FA]"
      />
    </section>
  );
}
