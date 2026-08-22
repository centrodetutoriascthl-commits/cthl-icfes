"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "./AuthContext";

export interface UserData {
  email: string;
  nombre: string;
  colegio: string;
  cargo: string;
  telefono: string;
  estado: "pendiente" | "aprobado" | "rechazado";
  rol: "basico" | "premium" | "institucional" | "admin";
}

export function useUserData() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setUserData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const ref = doc(db, "usuarios", user.uid);
    const unsubscribe = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setUserData(snap.data() as UserData);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  async function actualizarPerfil(datos: { colegio: string; cargo: string; telefono: string }) {
    if (!user) return;
    const ref = doc(db, "usuarios", user.uid);
    await updateDoc(ref, datos);
  }

  return { userData, loading, actualizarPerfil };
}