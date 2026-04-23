import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { google } from "googleapis";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const FIREBASE_DB_URL =
  process.env.FIREBASE_DATABASE_URL ||
  "https://prueba-juan-d40b0-default-rtdb.firebaseio.com";

const app = express();
const PORT = 3000;

app.use(express.json());

// Google OAuth Setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || `${process.env.APP_URL}/auth/google/callback`
);

// In-memory storage for the owner's tokens (in a real app, use a DB)
let ownerTokens: any = null;

app.get("/api/auth/url", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/calendar"],
  });
  res.json({ url });
});

app.get("/auth/google/callback", async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code as string);
    ownerTokens = tokens;
    oauth2Client.setCredentials(tokens);
    
    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Conexión exitosa con Google Calendar. Esta ventana se cerrará automáticamente.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Error exchanging code for tokens:", error);
    res.status(500).send("Error de autenticación");
  }
});

app.get("/api/calendar/status", (req, res) => {
  res.json({ connected: !!ownerTokens });
});

app.get("/api/calendar/availability", async (req, res) => {
  if (!ownerTokens) {
    return res.status(401).json({ error: "Google Calendar no conectado" });
  }

  try {
    oauth2Client.setCredentials(ownerTokens);
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    
    const { start, end } = req.query;
    
    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: start as string,
        timeMax: end as string,
        items: [{ id: "primary" }],
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching availability:", error);
    res.status(500).json({ error: "Error al obtener disponibilidad" });
  }
});

app.post("/api/calendar/book", async (req, res) => {
  if (!ownerTokens) {
    return res.status(401).json({ error: "Google Calendar no conectado" });
  }

  const { summary, description, start, end } = req.body;

  try {
    oauth2Client.setCredentials(ownerTokens);
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const event = {
      summary,
      description,
      start: { dateTime: start, timeZone: "UTC" },
      end: { dateTime: end, timeZone: "UTC" },
    };

    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error booking event:", error);
    res.status(500).json({ error: "Error al agendar el turno" });
  }
});

async function fetchBookingsFromFirebase(): Promise<any[]> {
  const r = await fetch(`${FIREBASE_DB_URL}/bookings.json`);
  if (!r.ok) throw new Error(`Firebase fetch failed: ${r.status}`);
  const data = (await r.json()) as Record<string, any> | null;
  if (!data) return [];
  return Object.entries(data).map(([id, val]) => ({ id, ...(val as any) }));
}

async function fetchBookingFromFirebase(id: string): Promise<any | null> {
  const r = await fetch(`${FIREBASE_DB_URL}/bookings/${id}.json`);
  if (!r.ok) return null;
  const data = await r.json();
  if (!data) return null;
  return { id, ...data };
}

async function patchBookingInFirebase(id: string, patch: any): Promise<void> {
  const r = await fetch(`${FIREBASE_DB_URL}/bookings/${id}.json`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`Firebase update failed: ${r.status} ${t}`);
  }
}

function resolveAppUrlFromReq(req: express.Request): string {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  const proto = (req.headers["x-forwarded-proto"] as string) || req.protocol || "http";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  return `${proto}://${host}`;
}

function formatDateLabelEs(date: Date): string {
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatTimeEs(date: Date): string {
  return new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function buildReminderHtml(params: {
  clientName: string;
  dateLabel: string;
  timeRange: string;
  rescheduleUrl: string;
}): string {
  const { clientName, dateLabel, timeRange, rescheduleUrl } = params;
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

const REMINDER_MINUTES_BEFORE = 60;
const REMINDER_WINDOW_MINUTES = 75;

app.all("/api/send-reminders", async (req, res) => {
  const expectedSecret = process.env.CRON_SECRET;
  if (expectedSecret) {
    const provided =
      (req.headers["authorization"] as string | undefined) ||
      (req.query.secret as string | undefined);
    const token = provided?.replace(/^Bearer\s+/i, "");
    if (token !== expectedSecret) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  }

  try {
    const appUrl = resolveAppUrlFromReq(req);
    const now = Date.now();
    const lowerBound = now + (REMINDER_MINUTES_BEFORE - 15) * 60 * 1000;
    const upperBound = now + REMINDER_WINDOW_MINUTES * 60 * 1000;

    const bookings = await fetchBookingsFromFirebase();
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

    const results: any[] = [];
    for (const booking of pending) {
      try {
        const startDate = new Date(booking.start);
        const endDate = new Date(booking.end);
        const tokenParam = booking.cancelToken ? `&t=${encodeURIComponent(booking.cancelToken)}` : "";
        const rescheduleUrl = `${appUrl}/api/bookings/cancel?id=${encodeURIComponent(booking.id)}${tokenParam}&redirect=1`;

        await smtpTransporter.sendMail({
          from: `"Recovery Lab" <${process.env.GMAIL_USER || "juanisasti7@gmail.com"}>`,
          to: booking.clientEmail,
          subject: "Tu sesión comienza en 1 hora - Recovery Lab",
          html: buildReminderHtml({
            clientName: booking.clientName || "",
            dateLabel: formatDateLabelEs(startDate),
            timeRange: `${formatTimeEs(startDate)} - ${formatTimeEs(endDate)}`,
            rescheduleUrl,
          }),
        });

        await patchBookingInFirebase(booking.id, {
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
  } catch (err) {
    console.error("Error procesando recordatorios:", err);
    res.status(500).json({ error: "Error procesando recordatorios", detail: String(err) });
  }
});

function cancelHtmlResponse(opts: {
  title: string;
  message: string;
  redirectUrl?: string;
  countdownSeconds?: number;
}): string {
  const { title, message, redirectUrl, countdownSeconds = 4 } = opts;
  const redirectScript = redirectUrl
    ? `<script>setTimeout(function(){ window.location.href = ${JSON.stringify(redirectUrl)}; }, ${countdownSeconds * 1000});</script>`
    : "";
  const ctaButton = redirectUrl
    ? `<a href="${redirectUrl}" style="display:inline-block;background:#000;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:600;font-size:14px;margin-top:16px;">Elegir nuevo horario</a>`
    : "";
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><title>${title} - Recovery Lab</title></head>
<body style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#F8F9FA;">
  <div style="max-width:520px;margin:48px auto;padding:32px;">
    <div style="background:#000;color:#fff;padding:24px;border-radius:12px;text-align:center;margin-bottom:24px;">
      <h1 style="margin:0;font-size:22px;font-weight:700;">Recovery Lab</h1>
    </div>
    <div style="background:#fff;padding:24px;border-radius:12px;border:1px solid #e5e7eb;text-align:center;">
      <h2 style="margin:0 0 12px;font-size:18px;">${title}</h2>
      <p style="margin:0;color:#374151;font-size:14px;line-height:1.5;">${message}</p>
      ${ctaButton}
      ${redirectUrl ? `<p style="margin-top:16px;color:#9ca3af;font-size:12px;">Te redirigiremos automáticamente en ${countdownSeconds} segundos…</p>` : ""}
    </div>
  </div>
  ${redirectScript}
</body></html>`;
}

app.get("/api/bookings/cancel", async (req, res) => {
  const id = (req.query.id as string | undefined) || "";
  const token = (req.query.t as string | undefined) || "";
  const shouldRedirect = req.query.redirect !== "0";
  const appUrl = resolveAppUrlFromReq(req);
  const calendarUrl = `${appUrl}/`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");

  if (!id) {
    return res.status(400).send(
      cancelHtmlResponse({ title: "Enlace inválido", message: "No pudimos identificar la reserva a cancelar." })
    );
  }

  try {
    const booking = await fetchBookingFromFirebase(id);
    if (!booking) {
      return res.status(404).send(
        cancelHtmlResponse({
          title: "Reserva no encontrada",
          message: "No encontramos tu reserva. Puede que ya no exista o que el enlace haya expirado.",
          redirectUrl: shouldRedirect ? calendarUrl : undefined,
        })
      );
    }

    if (booking.cancelToken && token && booking.cancelToken !== token) {
      return res.status(403).send(
        cancelHtmlResponse({ title: "Enlace inválido", message: "El enlace de cancelación no es válido." })
      );
    }

    if (booking.cancelled) {
      return res.status(200).send(
        cancelHtmlResponse({
          title: "Turno ya cancelado",
          message: "Este turno ya fue cancelado. Podés elegir un nuevo horario desde el calendario.",
          redirectUrl: shouldRedirect ? calendarUrl : undefined,
        })
      );
    }

    if (booking.calendarEventId && ownerTokens) {
      try {
        oauth2Client.setCredentials(ownerTokens);
        const calendar = google.calendar({ version: "v3", auth: oauth2Client });
        await calendar.events.delete({ calendarId: "primary", eventId: booking.calendarEventId });
      } catch (calErr) {
        console.error("No se pudo borrar el evento en Google Calendar:", calErr);
      }
    }

    await patchBookingInFirebase(booking.id, {
      cancelled: true,
      cancelledAt: new Date().toISOString(),
    });

    return res.status(200).send(
      cancelHtmlResponse({
        title: "Turno cancelado",
        message: "Cancelamos tu turno. Te llevamos al calendario para que elijas un nuevo horario.",
        redirectUrl: shouldRedirect ? calendarUrl : undefined,
      })
    );
  } catch (error) {
    console.error("Error al cancelar reserva:", error);
    return res.status(500).send(
      cancelHtmlResponse({
        title: "No pudimos cancelar tu turno",
        message: "Ocurrió un error procesando tu solicitud. Escribinos y lo resolvemos manualmente.",
      })
    );
  }
});

const smtpTransporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER || "juanisasti7@gmail.com",
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

app.post("/api/send-email", async (req, res) => {
  const { clientName, clientEmail, date, timeStart, timeEnd } = req.body;

  if (!clientEmail || !clientName || !date || !timeStart) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }

  if (!process.env.GMAIL_APP_PASSWORD) {
    console.error("GMAIL_APP_PASSWORD no está configurada");
    return res.status(500).json({ error: "Servidor de email no configurado" });
  }

  const gmailUser = process.env.GMAIL_USER || "juanisasti7@gmail.com";

  const textBody = [
    `Hola ${clientName},`,
    ``,
    `Tu turno en Recovery Lab fue reservado con éxito.`,
    ``,
    `Fecha: ${date}`,
    `Horario: ${timeStart} - ${timeEnd}`,
    `Duración: 60 minutos`,
    ``,
    `Si necesitás cancelar o reprogramar, contactanos con anticipación.`,
    ``,
    `Recovery Lab`,
  ].join("\n");

  try {
    const info = await smtpTransporter.sendMail({
      from: `"Recovery Lab" <${gmailUser}>`,
      sender: gmailUser,
      replyTo: `"Recovery Lab" <${gmailUser}>`,
      to: clientEmail,
      subject: "Confirmación de tu reserva - Recovery Lab",
      text: textBody,
      headers: {
        "X-Entity-Ref-ID": `recovery-lab-${Date.now()}`,
        "X-Mailer": "Recovery Lab Booking",
      },
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #f8f9fa; border-radius: 16px;">
          <div style="background: #000; color: #fff; padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
            <h1 style="margin: 0; font-size: 22px; font-weight: 700;">Recovery Lab</h1>
            <p style="margin: 8px 0 0; opacity: 0.7; font-size: 14px;">Confirmación de Reserva</p>
          </div>
          <div style="background: #fff; padding: 24px; border-radius: 12px; border: 1px solid #e5e7eb;">
            <p style="margin: 0 0 16px; font-size: 16px;">Hola <strong>${clientName}</strong>,</p>
            <p style="margin: 0 0 20px; color: #6b7280; font-size: 14px;">Tu turno ha sido reservado con éxito. Aquí están los detalles:</p>
            <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">Fecha</td>
                  <td style="padding: 8px 0; font-weight: 600; text-align: right;">${date}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">Horario</td>
                  <td style="padding: 8px 0; font-weight: 600; text-align: right;">${timeStart} - ${timeEnd}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">Duración</td>
                  <td style="padding: 8px 0; font-weight: 600; text-align: right;">60 minutos</td>
                </tr>
              </table>
            </div>
            <p style="margin: 0; color: #6b7280; font-size: 13px; text-align: center;">Si necesitas cancelar o reprogramar, contáctanos con anticipación.</p>
          </div>
          <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 16px;">Recovery Lab &copy; ${new Date().getFullYear()}</p>
        </div>
      `,
    });

    console.log("Email enviado:", info.messageId, "->", clientEmail);
    res.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error("Error enviando email:", error);
    res.status(500).json({
      error: "Error al enviar el correo de confirmación",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
});

// Vite middleware for development
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
