import type { VercelRequest, VercelResponse } from "@vercel/node";
import nodemailer from "nodemailer";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { clientName, clientEmail, date, timeStart, timeEnd } = req.body;

  if (!clientEmail || !clientName || !date || !timeStart) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }

  const gmailUser = process.env.GMAIL_USER || "juanisasti7@gmail.com";
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (!gmailPass) {
    console.error("GMAIL_APP_PASSWORD no está configurada");
    return res.status(500).json({ error: "Servidor de email no configurado" });
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: gmailUser,
      pass: gmailPass,
    },
  });

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
    const info = await transporter.sendMail({
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
}
