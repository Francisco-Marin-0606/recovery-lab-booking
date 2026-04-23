import type { ReactNode } from "react";
import { motion } from "motion/react";
import { CalendarCheck } from "lucide-react";
import PublicNavbar from "../components/layout/PublicNavbar";
import HeroSection from "../components/landing/HeroSection";
import AboutSection from "../components/landing/AboutSection";
import ScheduleSection from "../components/landing/ScheduleSection";
import LocationSection from "../components/landing/LocationSection";
import ContactFooter from "../components/landing/ContactFooter";

interface LandingPageProps {
  children: ReactNode;
}

export default function LandingPage({ children }: LandingPageProps) {
  return (
    <div className="flex flex-col">
      <PublicNavbar />

      <HeroSection />
      <AboutSection />
      <ScheduleSection />
      <LocationSection />

      <section id="reservar" className="relative py-16 sm:py-28 bg-[#F8F9FA] scroll-mt-16 sm:scroll-mt-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mb-8 sm:mb-10 px-1"
          >
            <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-gray-500">
              <CalendarCheck className="w-4 h-4 text-black" />
              Reservá tu turno
            </span>
            <h2 className="mt-4 text-2xl sm:text-5xl font-bold tracking-tight leading-tight">
              Elegí el día y el horario que mejor te queda.
            </h2>
            <p className="mt-5 sm:mt-6 text-gray-600 text-sm sm:text-lg leading-relaxed">
              Completá tus datos, seleccioná tu horario y recibí la confirmación
              al instante. Podés cancelar o reprogramar hasta 24 horas antes.
            </p>
          </motion.div>

          {children}
        </div>
      </section>

      <ContactFooter />
    </div>
  );
}
