import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { google } from "googleapis";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

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

  try {
    await smtpTransporter.sendMail({
      from: `"Recovery Lab" <${process.env.GMAIL_USER || "juanisasti7@gmail.com"}>`,
      to: clientEmail,
      subject: "Confirmación de tu reserva - Recovery Lab",
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

    res.json({ success: true });
  } catch (error) {
    console.error("Error enviando email:", error);
    res.status(500).json({ error: "Error al enviar el correo de confirmación" });
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
