import type { VercelRequest, VercelResponse } from "@vercel/node";
import { google } from "googleapis";
import { getOAuth2Client, getOwnerTokens } from "../_lib/google-auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const tokens = await getOwnerTokens();
  if (!tokens) {
    return res.status(401).json({ error: "Google Calendar no conectado" });
  }

  try {
    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials(tokens);
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
}
