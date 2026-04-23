export const MAX_CAPACITY = 9;
export const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 7:00 - 21:00
export const DAILY_GOAL = 20;
export const WORKING_DAYS_PER_MONTH = 26;
export const MONTHLY_GOAL = DAILY_GOAL * WORKING_DAYS_PER_MONTH; // 520

export const COMPANY = {
  name: "Reset Lab",
  tagline: "Recover. Perform. Repeat.",
  shortDescription:
    "Centro de recuperación y performance deportiva. Ciencia, tecnología y un equipo médico que te devuelve a tu mejor versión.",
  phone: "+54 9 11 0000-0000",
  phoneHref: "+5491100000000",
  whatsapp: "5491100000000",
  whatsappMessage: "¡Hola! Quería consultar por un turno en Reset Lab.",
  email: "hola@resetlab.com",
  address: {
    street: "Av. Siempre Viva 1234",
    neighborhood: "Palermo",
    city: "Buenos Aires",
    zip: "C1425",
    country: "Argentina",
  },
  directions: {
    subway: "Subte Línea D — estación Scalabrini Ortiz (a 3 cuadras).",
    bus: "Colectivos 15, 39, 55, 93, 152 y 160.",
    parking: "Estacionamiento propio sin cargo para clientes.",
  },
  mapsEmbedUrl:
    "https://www.google.com/maps?q=Av.+Siempre+Viva+1234,+Buenos+Aires&output=embed",
  mapsLinkUrl:
    "https://www.google.com/maps/dir/?api=1&destination=Av.+Siempre+Viva+1234,+Buenos+Aires",
  socials: {
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
    tiktok: "https://tiktok.com/",
  },
} as const;

export interface ScheduleEntry {
  day: string;
  short: string;
  weekday: number; // 0 = domingo, 1 = lunes, ..., 6 = sábado
  open: string | null;
  close: string | null;
}

export const SCHEDULE: ScheduleEntry[] = [
  { day: "Lunes",     short: "Lun", weekday: 1, open: "07:00", close: "22:00" },
  { day: "Martes",    short: "Mar", weekday: 2, open: "07:00", close: "22:00" },
  { day: "Miércoles", short: "Mié", weekday: 3, open: "07:00", close: "22:00" },
  { day: "Jueves",    short: "Jue", weekday: 4, open: "07:00", close: "22:00" },
  { day: "Viernes",   short: "Vie", weekday: 5, open: "07:00", close: "22:00" },
  { day: "Sábado",    short: "Sáb", weekday: 6, open: "10:00", close: "18:00" },
  { day: "Domingo",   short: "Dom", weekday: 0, open: "10:00", close: "18:00" },
];
