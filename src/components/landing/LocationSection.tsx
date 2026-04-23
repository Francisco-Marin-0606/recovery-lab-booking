import { motion } from "motion/react";
import {
  MapPin,
  TrainFront,
  Bus,
  Car,
  ExternalLink,
  Navigation,
} from "lucide-react";
import { COMPANY } from "../../constants";

export default function LocationSection() {
  const { address, directions } = COMPANY;

  return (
    <section
      id="ubicacion"
      className="relative py-16 sm:py-28 scroll-mt-16 sm:scroll-mt-20"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-gray-500">
            <MapPin className="w-4 h-4 text-rose-500" />
            Ubicación
          </span>
          <h2 className="mt-4 text-2xl sm:text-5xl font-bold tracking-tight leading-tight">
            Vení a conocernos.
          </h2>
          <p className="mt-5 sm:mt-6 text-gray-600 text-sm sm:text-lg leading-relaxed">
            Estamos ubicados en el corazón de {address.neighborhood}, con fácil
            acceso en transporte público y estacionamiento propio.
          </p>
        </div>

        <div className="mt-8 sm:mt-12 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5 flex flex-col gap-4"
          >
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-sm border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-black text-white flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Dirección</h3>
                  <p className="mt-1 text-gray-700 text-sm sm:text-base leading-relaxed">
                    {address.street}
                    <br />
                    {address.neighborhood}, {address.city}
                    <br />
                    {address.zip}, {address.country}
                  </p>
                  <a
                    href={COMPANY.mapsLinkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-black hover:underline"
                  >
                    <Navigation className="w-4 h-4" />
                    Cómo llegar
                    <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-sm border border-gray-100">
              <h3 className="font-bold text-lg mb-4">Cómo llegar</h3>
              <ul className="flex flex-col gap-4">
                <li className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <TrainFront className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      Subte
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {directions.subway}
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Bus className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      Colectivos
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {directions.bus}
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Car className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      En auto
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {directions.parking}
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-7 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm border border-gray-100 bg-white min-h-[260px] sm:min-h-[360px] lg:min-h-[480px] flex"
          >
            <iframe
              title={`Mapa de ${COMPANY.name}`}
              src={COMPANY.mapsEmbedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full min-h-[260px] sm:min-h-[360px] lg:min-h-[480px] border-0"
              allowFullScreen
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
