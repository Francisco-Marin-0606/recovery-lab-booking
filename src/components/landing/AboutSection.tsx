import { motion } from "motion/react";
import { Stethoscope, Dumbbell, HeartPulse, BadgeCheck } from "lucide-react";

const VALUES = [
  {
    icon: Stethoscope,
    title: "Criterio médico",
    desc: "Cada sesión la supervisa un profesional formado en medicina del deporte y kinesiología.",
  },
  {
    icon: Dumbbell,
    title: "Performance",
    desc: "Protocolos diseñados para atletas amateurs y de élite: movés mejor, rendís más.",
  },
  {
    icon: HeartPulse,
    title: "Recuperación real",
    desc: "Tecnología de contraste, compresión y terapia manual para acortar tus tiempos de recuperación.",
  },
];

export default function AboutSection() {
  return (
    <section
      id="nosotros"
      className="relative py-16 sm:py-28 scroll-mt-16 sm:scroll-mt-20"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5"
          >
            <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-gray-500">
              <BadgeCheck className="w-4 h-4 text-emerald-500" />
              Sobre nosotros
            </span>
            <h2 className="mt-4 text-2xl sm:text-5xl font-bold tracking-tight leading-tight">
              Un laboratorio dedicado a que vuelvas más fuerte.
            </h2>
            <p className="mt-5 sm:mt-6 text-gray-600 text-sm sm:text-lg leading-relaxed">
              En Reset Lab combinamos medicina del deporte, kinesiología y tecnología
              de recuperación en un mismo espacio. Trabajamos con deportistas
              amateurs y profesionales que buscan volver a entrenar antes, reducir
              lesiones y sostener su rendimiento a lo largo de la temporada.
            </p>
            <p className="mt-4 text-gray-600 text-sm sm:text-lg leading-relaxed">
              Nuestra filosofía es simple: cada cuerpo necesita un protocolo
              distinto. Por eso evaluamos, diseñamos un plan y medimos resultados
              sesión a sesión.
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              {[
                "Medicina deportiva",
                "Kinesiología",
                "Fisiatría",
                "Readaptación",
              ].map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-100 text-gray-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
          >
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-black text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="mt-3 sm:mt-4 font-bold text-base sm:text-lg">{title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}

            <div className="sm:col-span-2 rounded-2xl sm:rounded-3xl p-5 sm:p-8 bg-gradient-to-br from-gray-900 to-black text-white shadow-sm">
              <div className="flex items-start gap-4">
                <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-white/10 items-center justify-center shrink-0">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg sm:text-xl">
                    Equipo médico propio
                  </h3>
                  <p className="mt-2 text-sm sm:text-base text-gray-300 leading-relaxed">
                    Médicos deportólogos, kinesiólogos y preparadores físicos
                    trabajando juntos en el mismo espacio. Un equipo
                    interdisciplinario enfocado 100% en tu recuperación y
                    rendimiento.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
