import { google } from "googleapis";
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, set, get } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBoPyka-3-CAyY2oNHVaWM2trcw_S8LKmU",
  authDomain: "prueba-juan-d40b0.firebaseapp.com",
  databaseURL: "https://prueba-juan-d40b0-default-rtdb.firebaseio.com",
  projectId: "prueba-juan-d40b0",
  storageBucket: "prueba-juan-d40b0.firebasestorage.app",
  messagingSenderId: "990095324916",
  appId: "1:990095324916:web:c46428a9847ccf143cd0a1",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getDatabase(app);

export function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || `${process.env.APP_URL}/api/auth/callback`
  );
}

export async function saveOwnerTokens(tokens: any) {
  await set(ref(db, "owner_tokens"), tokens);
}

export async function getOwnerTokens(): Promise<any | null> {
  const snapshot = await get(ref(db, "owner_tokens"));
  return snapshot.exists() ? snapshot.val() : null;
}
