import type { VercelRequest, VercelResponse } from "@vercel/node";
import { google } from "googleapis";
import { getOAuth2Client, getOwnerTokens } from "../_lib/google-auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const tokens = await getOwnerTokens();
  if (!tokens) {
    return res.status(401).json({ error: "Google Calendar no conectado" });
  }

  const { summary, description, start, end } = req.body;

  try {
    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials(tokens);
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
}
