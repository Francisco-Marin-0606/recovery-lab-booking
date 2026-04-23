import type { VercelRequest, VercelResponse } from "@vercel/node";
import nodemailer from "nodemailer";
import { fetchAllBookings, updateBooking, type StoredBooking } from "./_lib/firebase-rest.js";

const REMINDER_MINUTES_BEFORE = 60;
const REMINDER_WINDOW_MINUTES = 75;

function buildReminderHtml(params: {
  clientName: string;
  dateLabel: string;
  timeRange: string;
  cancelUrl: string;
  rescheduleUrl: string;
}): string {
  const { clientName, dateLabel, timeRange, cancelUrl, rescheduleUrl } = params;
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #f8f9fa; border-radius: 16px;">
      <div style="background: #000; color: #fff; padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
        <h1 style="margin: 0; font-size: 22px; font-weight: 700;">Recovery Lab</h1>
        <p style="margin: 8px 0 0; opacity: 0.7; font-size: 14px;">Recordatorio de sesión</p>
      </div>
      <div style="background: #fff; padding: 24px; border-radius: 12px; border: 1px solid #e5e7eb;">
        <p style="margin: 0 0 16px; font-size: 16px;">Hola <strong>${clientName}</strong>,</p>
        <p style="margin: 0 0 20px; color: #374151; font-size: 14px;">Te recordamos que en aproximadamente <strong>1 hora</strong> comienza tu sesión en Recovery Lab.</p>
        <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Fecha</td>
              <td style="padding: 8px 0; font-weight: 600; text-align: right;">${dateLabel}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Horario</td>
              <td style="padding: 8px 0; font-weight: 600; text-align: right;">${timeRange}</td>
            </tr>
          </table>
        </div>
        <p style="margin: 0 0 16px; color: #6b7280; font-size: 13px; text-align: center;">
          ¿No podés asistir? Podés cancelar o reprogramar tu turno con un solo clic.
        </p>
        <div style="text-align: center; margin-top: 20px;">
          <a href="${rescheduleUrl}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; border-radius: 999px; text-decoration: none; font-weight: 600; font-size: 14px; margin: 4px;">
            Cancelar o reprogramar
          </a>
        </div>
        <p style="margin: 24px 0 0; color: #9ca3af; font-size: 12px; text-align: center;">
          Al hacer clic, tu turno se cancelará y te llevaremos al calendario para que elijas una nueva fecha.
        </p>
      </div>
      <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 16px;">Recovery Lab &copy; ${new Date().getFullYear()}</p>
    </div>
  `;
}

function resolveAppUrl(req: VercelRequest): string {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  const proto = (req.headers["x-forwarded-proto"] as string) || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  return `${proto}://${host}`;
}

function formatDateLabel(date: Date): string {
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const expectedSecret = process.env.CRON_SECRET?.trim();
  if (expectedSecret) {
    const provided =
      (req.headers["authorization"] as string | undefined) ||
      (req.query.secret as string | undefined);
    const token = provided?.replace(/^Bearer\s+/i, "").trim();
    if (token !== expectedSecret) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  }

  try {
    const appUrl = resolveAppUrl(req);
    const now = Date.now();
    const lowerBound = now + (REMINDER_MINUTES_BEFORE - 15) * 60 * 1000;
    const upperBound = now + REMINDER_WINDOW_MINUTES * 60 * 1000;

    const bookings = await fetchAllBookings();

    const pending = bookings.filter((b) => {
      if (!b?.start) return false;
      if (b.cancelled) return false;
      if (b.reminderSent) return false;
      if (!b.clientEmail) return false;
      const startMs = Date.parse(b.start);
      if (Number.isNaN(startMs)) return false;
      return startMs >= lowerBound && startMs <= upperBound;
    });

    if (pending.length === 0) {
      return res.json({ sent: 0, message: "No hay turnos dentro de la próxima hora." });
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER || "juanisasti7@gmail.com",
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const results: Array<{ id: string; ok: boolean; error?: string }> = [];

    for (const booking of pending) {
      try {
        await sendReminder(booking, transporter, appUrl);
        await updateBooking(booking.id, {
          reminderSent: true,
          reminderSentAt: new Date().toISOString(),
        });
        results.push({ id: booking.id, ok: true });
      } catch (err) {
        console.error(`Error enviando recordatorio de ${booking.id}:`, err);
        results.push({ id: booking.id, ok: false, error: String(err) });
      }
    }

    const sent = results.filter((r) => r.ok).length;
    res.json({ sent, total: pending.length, results });
  } catch (error) {
    console.error("Error al procesar recordatorios:", error);
    res.status(500).json({ error: "Error al procesar recordatorios", detail: String(error) });
  }
}

async function sendReminder(
  booking: StoredBooking,
  transporter: nodemailer.Transporter,
  appUrl: string
): Promise<void> {
  const startDate = new Date(booking.start);
  const endDate = new Date(booking.end);
  const dateLabel = formatDateLabel(startDate);
  const timeRange = `${formatTime(startDate)} - ${formatTime(endDate)}`;
  const tokenParam = booking.cancelToken ? `&t=${encodeURIComponent(booking.cancelToken)}` : "";
  const rescheduleUrl = `${appUrl}/api/bookings/cancel?id=${encodeURIComponent(booking.id)}${tokenParam}&redirect=1`;
  const cancelUrl = rescheduleUrl;

  await transporter.sendMail({
    from: `"Recovery Lab" <${process.env.GMAIL_USER || "juanisasti7@gmail.com"}>`,
    to: booking.clientEmail,
    subject: "Tu sesión comienza en 1 hora - Recovery Lab",
    html: buildReminderHtml({
      clientName: booking.clientName || "",
      dateLabel,
      timeRange,
      cancelUrl,
      rescheduleUrl,
    }),
  });
}

export const config = {
  maxDuration: 60,
};
