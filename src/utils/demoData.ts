import {
  addDays,
  addHours,
  eachDayOfInterval,
  setHours,
  setMinutes,
  setSeconds,
  setMilliseconds,
  subDays,
} from "date-fns";
import { MAX_CAPACITY } from "../constants";
import { generateSellerCode } from "./validation";
import type { Booking, Seller } from "../types";

const FIRST_NAMES = [
  "Lucas", "Martín", "Sofía", "Valentina", "Agustín", "Camila", "Nicolás",
  "Julieta", "Matías", "Florencia", "Tomás", "Mariana", "Joaquín", "Lucía",
  "Sebastián", "Carolina", "Federico", "Victoria", "Gonzalo", "Micaela",
  "Franco", "Delfina", "Ignacio", "Rocío", "Benjamín", "Abril", "Santiago",
  "Emilia", "Bruno", "Pilar", "Facundo", "Josefina", "Bautista", "Catalina",
];

const LAST_NAMES = [
  "García", "Rodríguez", "González", "Fernández", "López", "Martínez",
  "Pérez", "Sánchez", "Romero", "Álvarez", "Ruiz", "Torres", "Flores",
  "Acosta", "Benítez", "Molina", "Silva", "Castro", "Vega", "Ortiz",
  "Herrera", "Giménez", "Medina", "Rojas", "Suárez", "Méndez",
];

const SPORTS = [
  "Running", "Fútbol", "Padel", "Tenis", "Crossfit", "Ciclismo", "Natación",
  "Rugby", "Básquet", "Gimnasio", "Hockey", "Spinning", "Boxeo", "Escalada",
  "Triatlón", "Maratón", "Yoga", "Pilates",
];

const REASONS = [
  "Recuperación muscular post-entrenamiento",
  "Reducir inflamación por lesión",
  "Mejorar descanso y sueño",
  "Flexibilidad y movilidad",
  "Sesión de relajación",
  "Preparación pre-competencia",
  "Descanso activo",
  "Dolor muscular crónico",
  "Recuperación post-maratón",
  "Sesión semanal de mantenimiento",
  "",
];

const EMAIL_PROVIDERS = ["gmail.com", "hotmail.com", "outlook.com", "yahoo.com.ar", "icloud.com"];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function randomPerson() {
  const first = pick(FIRST_NAMES);
  const last = pick(LAST_NAMES);
  const name = `${first} ${last}`;
  const email = `${slugify(first)}.${slugify(last)}${randInt(1, 99)}@${pick(EMAIL_PROVIDERS)}`;
  return { name, email };
}

function randomPhone(): string {
  return `+54 11 ${randInt(4000, 7999)}-${randInt(1000, 9999)}`;
}

/**
 * Genera un set de vendedores de demostración.
 */
export function generateDemoSellers(count = 6): Seller[] {
  const list: Seller[] = [];
  for (let i = 0; i < count; i++) {
    const { name, email } = randomPerson();
    const code = generateSellerCode(list);
    list.push({
      id: `demo-seller-${i + 1}`,
      name,
      email: email.replace(/@.*/, "@resetlab.com"),
      phone: randomPhone(),
      code,
      createdAt: subDays(new Date(), randInt(30, 180)).toISOString(),
      monthlyGoal: pick([10, 15, 15, 20, 25, 30]),
      active: true,
    });
  }
  return list;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Para un día dado, genera una distribución de reservas horarias:
 * - Objetivo ~15 personas/día (rango 10-20)
 * - Entre 0 y 2 turnos "completos" (9 personas)
 * - Varios turnos parciales (1-6 personas)
 * - Algunos turnos vacíos
 * Devuelve { hour: bookings[] } donde cada hora puede contener varias reservas sumando hasta 9.
 */
function generateDayDistribution(
  day: Date,
  sellers: Seller[]
): Booking[] {
  const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8..19
  const peakHours = new Set([10, 11, 17, 18, 19]);

  const targetPeople = randInt(10, 20);
  const fullSlotsCount = Math.random() < 0.45 ? 1 : Math.random() < 0.2 ? 2 : 0;

  const shuffled = shuffle(hours);
  const fullHours = new Set<number>();
  for (let i = 0; i < fullSlotsCount; i++) {
    fullHours.add(shuffled[i]);
  }

  const hourOccupancy = new Map<number, number>();
  hours.forEach((h) => hourOccupancy.set(h, 0));
  fullHours.forEach((h) => hourOccupancy.set(h, MAX_CAPACITY));

  let remaining = targetPeople - fullHours.size * MAX_CAPACITY;
  if (remaining < 0) remaining = 0;

  const available = hours.filter((h) => !fullHours.has(h));
  const weightedPool = shuffle(
    available.flatMap((h) => (peakHours.has(h) ? [h, h, h] : [h]))
  );

  let idx = 0;
  while (remaining > 0 && idx < weightedPool.length * 3) {
    const h = weightedPool[idx % weightedPool.length];
    const current = hourOccupancy.get(h) || 0;
    if (current >= MAX_CAPACITY) {
      idx++;
      continue;
    }
    const space = MAX_CAPACITY - current;
    const add = Math.min(space, remaining, randInt(1, 4));
    hourOccupancy.set(h, current + add);
    remaining -= add;
    idx++;
  }

  const bookings: Booking[] = [];

  hourOccupancy.forEach((occupancy, hour) => {
    if (occupancy <= 0) return;

    let left = occupancy;
    let safety = 0;
    while (left > 0 && safety < 20) {
      safety++;
      const qty = Math.min(left, randInt(1, Math.min(4, left)));
      const { name, email } = randomPerson();

      const slotStart = setMilliseconds(
        setSeconds(setMinutes(setHours(day, hour), 0), 0),
        0
      );
      const slotEnd = addHours(slotStart, 1);

      // ~65% de las reservas tienen referido
      const hasReferral = Math.random() < 0.65 && sellers.length > 0;
      let referredBy = "";
      let sellerCode = "";
      if (hasReferral) {
        const seller = pick(sellers);
        // 50% usan código, 50% usan el nombre
        referredBy = Math.random() < 0.5 ? seller.code : seller.name;
        sellerCode = seller.code;
      }

      const sport = Math.random() < 0.85 ? pick(SPORTS) : "";
      const reason = pick(REASONS);

      bookings.push({
        id: `demo-booking-${day.toISOString().slice(0, 10)}-${hour}-${safety}`,
        summary: "Reserva Recovery Lab",
        description: `Turno agendado por ${name} (${email}) - ${qty} persona${qty > 1 ? "s" : ""}${sport ? ` - Deporte: ${sport}` : ""}${reason ? ` - Motivo: ${reason}` : ""}${referredBy ? ` - Referido por: ${referredBy}` : ""}`,
        start: slotStart.toISOString(),
        end: slotEnd.toISOString(),
        createdAt: subDays(slotStart, randInt(0, 10)).toISOString(),
        clientName: name,
        clientEmail: email,
        quantity: qty,
        sport,
        reason,
        referredBy,
        sellerCode,
      });

      left -= qty;
    }
  });

  return bookings;
}

/**
 * Genera reservas de demostración para un rango de días.
 * Por defecto: 45 días hacia atrás y 7 hacia adelante.
 */
export function generateDemoBookings(
  sellers: Seller[],
  daysBack = 45,
  daysForward = 7
): Booking[] {
  const today = new Date();
  const from = subDays(today, daysBack);
  const to = addDays(today, daysForward);
  const days = eachDayOfInterval({ start: from, end: to });

  const all: Booking[] = [];
  days.forEach((day) => {
    const weekday = day.getDay();
    // Domingo cerrado
    if (weekday === 0) return;
    // Sábado con probabilidad reducida
    if (weekday === 6 && Math.random() < 0.4) return;

    // ~15% de los días laborables quedan sin reservas (feriados, baja ocupación)
    if (weekday !== 0 && Math.random() < 0.1) return;

    all.push(...generateDayDistribution(day, sellers));
  });

  // Insertamos algunos clientes recurrentes visitando múltiples días
  injectRecurringClients(all, sellers);

  return all;
}

/**
 * Selecciona ~8 emails y los convierte en clientes recurrentes replicando su identidad
 * en varias reservas que ya existen.
 */
function injectRecurringClients(bookings: Booking[], sellers: Seller[]): void {
  if (bookings.length < 20) return;

  const pool: { name: string; email: string }[] = [];
  for (let i = 0; i < 8; i++) pool.push(randomPerson());

  // Reemplazamos ~25% de los clientes con identidades del pool
  const targetCount = Math.floor(bookings.length * 0.25);
  const indices = shuffle(bookings.map((_, i) => i)).slice(0, targetCount);

  indices.forEach((idx) => {
    const person = pick(pool);
    const b = bookings[idx];
    b.clientName = person.name;
    b.clientEmail = person.email;
    // 30% probabilidad de refrescar referido
    if (sellers.length > 0 && Math.random() < 0.3) {
      const s = pick(sellers);
      b.referredBy = Math.random() < 0.5 ? s.code : s.name;
      b.sellerCode = s.code;
    }
  });
}

/**
 * Atajo: genera todo (vendedores + reservas) con una sola llamada.
 */
export function generateDemoDataset(): { sellers: Seller[]; bookings: Booking[] } {
  const sellers = generateDemoSellers(6);
  const bookings = generateDemoBookings(sellers);
  return { sellers, bookings };
}
