import { motion } from "motion/react";
import {
  Phone,
  Mail,
  MessageCircle,
  Instagram,
  Facebook,
  ArrowUpRight,
} from "lucide-react";
import { COMPANY } from "../../constants";

const CONTACT_CARDS = [
  {
    icon: Phone,
    label: "Teléfono",
    value: COMPANY.phone,
    href: `tel:${COMPANY.phoneHref}`,
    accent: "bg-blue-50 text-blue-600",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "Escribinos ahora",
    href: `https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent(
      COMPANY.whatsappMessage
    )}`,
    accent: "bg-emerald-50 text-emerald-600",
    external: true,
  },
  {
    icon: Mail,
    label: "Email",
    value: COMPANY.email,
    href: `mailto:${COMPANY.email}`,
    accent: "bg-rose-50 text-rose-600",
  },
];

export default function ContactFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      id="contacto"
      className="relative bg-gray-950 text-gray-200 scroll-mt-20"
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 0%, rgba(99,102,241,0.2), transparent 50%), radial-gradient(circle at 80% 100%, rgba(14,165,233,0.15), transparent 50%)",
        }}
      />
      <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-gray-400">
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            Contacto
          </span>
          <h2 className="mt-4 text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            Hablemos.
          </h2>
          <p className="mt-6 text-gray-400 text-base sm:text-lg leading-relaxed">
            ¿Tenés una consulta, querés pedir un turno particular o sumar a tu
            equipo? Escribinos por el canal que te resulte más cómodo.
          </p>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {CONTACT_CARDS.map(
            ({ icon: Icon, label, value, href, accent, external }) => (
              <motion.a
                key={label}
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4 }}
                className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-3xl p-6 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className={`w-11 h-11 rounded-2xl ${accent} flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-gray-500 group-hover:text-white group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="mt-5">
                  <div className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    {label}
                  </div>
                  <div className="mt-1 text-base sm:text-lg font-semibold text-white break-all">
                    {value}
                  </div>
                </div>
              </motion.a>
            )
          )}
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt={COMPANY.name}
              className="h-10 w-auto opacity-90"
            />
            <div className="text-sm text-gray-400">
              © {year} {COMPANY.name}. Todos los derechos reservados.
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={COMPANY.socials.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href={COMPANY.socials.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href={COMPANY.socials.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-xs font-bold transition-colors"
              aria-label="TikTok"
            >
              TT
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
