import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAJxj5wovDutAvGDzx-GqGfXyg7DjlRpeI",
  authDomain: "cthl-icfes.firebaseapp.com",
  projectId: "cthl-icfes",
  storageBucket: "cthl-icfes.firebasestorage.app",
  messagingSenderId: "137360206642",
  appId: "1:137360206642:web:761a704dbd5dd906ce452b",
};

// Evita inicializar la app dos veces (Next.js recarga el módulo en desarrollo)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);