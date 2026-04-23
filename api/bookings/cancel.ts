import type { VercelRequest, VercelResponse } from "@vercel/node";
import { google } from "googleapis";
import { fetchBooking, updateBooking } from "../_lib/firebase-rest.js";
import { getOAuth2Client, getOwnerTokens } from "../_lib/google-auth.js";

function resolveAppUrl(req: VercelRequest): string {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  const proto = (req.headers["x-forwarded-proto"] as string) || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  return `${proto}://${host}`;
}

function htmlResponse(opts: {
  title: string;
  message: string;
  redirectUrl?: string;
  countdownSeconds?: number;
}): string {
  const { title, message, redirectUrl, countdownSeconds = 4 } = opts;
  const redirectScript = redirectUrl
    ? `<script>setTimeout(function(){ window.location.href = ${JSON.stringify(
        redirectUrl
      )}; }, ${countdownSeconds * 1000});</script>`
    : "";
  const ctaButton = redirectUrl
    ? `<a href="${redirectUrl}" style="display:inline-block;background:#000;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:600;font-size:14px;margin-top:16px;">Elegir nuevo horario</a>`
    : "";

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${title} - Recovery Lab</title>
</head>
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
</body>
</html>`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = (req.query.id as string | undefined) || "";
  const token = (req.query.t as string | undefined) || "";
  const shouldRedirect = req.query.redirect !== "0";
  const appUrl = resolveAppUrl(req);
  const calendarUrl = `${appUrl}/`;

  if (!id) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(400).send(
      htmlResponse({
        title: "Enlace inválido",
        message: "No pudimos identificar la reserva a cancelar.",
      })
    );
  }

  try {
    const booking = await fetchBooking(id);

    if (!booking) {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.status(404).send(
        htmlResponse({
          title: "Reserva no encontrada",
          message: "No encontramos tu reserva. Puede que ya no exista o que el enlace haya expirado.",
          redirectUrl: shouldRedirect ? calendarUrl : undefined,
        })
      );
    }

    if (booking.cancelToken && token && booking.cancelToken !== token) {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.status(403).send(
        htmlResponse({
          title: "Enlace inválido",
          message: "El enlace de cancelación no es válido. Contactanos si necesitás ayuda.",
        })
      );
    }

    if (booking.cancelled) {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.status(200).send(
        htmlResponse({
          title: "Turno ya cancelado",
          message: "Este turno ya fue cancelado. Podés elegir un nuevo horario desde el calendario.",
          redirectUrl: shouldRedirect ? calendarUrl : undefined,
        })
      );
    }

    if (booking.calendarEventId) {
      try {
        const tokens = await getOwnerTokens();
        if (tokens) {
          const oauth2Client = getOAuth2Client();
          oauth2Client.setCredentials(tokens);
          const calendar = google.calendar({ version: "v3", auth: oauth2Client });
          await calendar.events.delete({
            calendarId: "primary",
            eventId: booking.calendarEventId,
          });
        }
      } catch (calErr) {
        console.error("No se pudo borrar el evento en Google Calendar:", calErr);
      }
    }

    await updateBooking(booking.id, {
      cancelled: true,
      cancelledAt: new Date().toISOString(),
    });

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(
      htmlResponse({
        title: "Turno cancelado",
        message: "Cancelamos tu turno. Te llevamos al calendario para que elijas un nuevo horario.",
        redirectUrl: shouldRedirect ? calendarUrl : undefined,
      })
    );
  } catch (error) {
    console.error("Error al cancelar reserva:", error);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(500).send(
      htmlResponse({
        title: "No pudimos cancelar tu turno",
        message: "Ocurrió un error procesando tu solicitud. Escribinos y lo resolvemos manualmente.",
      })
    );
  }
}
