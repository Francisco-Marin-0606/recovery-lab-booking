import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getOwnerTokens } from "../_lib/google-auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const tokens = await getOwnerTokens();
  res.json({ connected: !!tokens });
}
