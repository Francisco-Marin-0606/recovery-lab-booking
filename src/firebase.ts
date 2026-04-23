import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onValue, set, remove, get, update } from "firebase/database";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBoPyka-3-CAyY2oNHVaWM2trcw_S8LKmU",
  authDomain: "prueba-juan-d40b0.firebaseapp.com",
  databaseURL: "https://prueba-juan-d40b0-default-rtdb.firebaseio.com",
  projectId: "prueba-juan-d40b0",
  storageBucket: "prueba-juan-d40b0.firebasestorage.app",
  messagingSenderId: "990095324916",
  appId: "1:990095324916:web:c46428a9847ccf143cd0a1",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

export {
  db,
  auth,
  ref,
  push,
  onValue,
  set,
  remove,
  get,
  update,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
};
export type { User };
