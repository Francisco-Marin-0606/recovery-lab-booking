/**
 * Script para crear el primer usuario administrador.
 * 
 * Uso:
 *   npx tsx scripts/create-admin.ts <email> <password> <nombre>
 * 
 * Ejemplo:
 *   npx tsx scripts/create-admin.ts admin@recoverylab.com MiPassword123 "Juan Admin"
 */

import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBoPyka-3-CAyY2oNHVaWM2trcw_S8LKmU",
  authDomain: "prueba-juan-d40b0.firebaseapp.com",
  databaseURL: "https://prueba-juan-d40b0-default-rtdb.firebaseio.com",
  projectId: "prueba-juan-d40b0",
  storageBucket: "prueba-juan-d40b0.firebasestorage.app",
  messagingSenderId: "990095324916",
  appId: "1:990095324916:web:c46428a9847ccf143cd0a1",
};

const [email, password, displayName] = process.argv.slice(2);

if (!email || !password || !displayName) {
  console.error("Uso: npx tsx scripts/create-admin.ts <email> <password> <nombre>");
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

async function main() {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await set(ref(db, `users/${cred.user.uid}`), {
      email,
      displayName,
      role: "admin",
    });
    console.log(`Admin creado exitosamente: ${email} (uid: ${cred.user.uid})`);
    process.exit(0);
  } catch (err: any) {
    console.error("Error al crear admin:", err.message);
    process.exit(1);
  }
}

main();
