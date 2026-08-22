"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export interface UsuarioAdmin {
  id: string;
  email: string;
  nombre: string;
  colegio: string;
  cargo: string;
  telefono: string;
  estado: "pendiente" | "aprobado" | "rechazado";
  rol: "basico" | "premium" | "admin";
}

export function useAdminUsuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ref = collection(db, "usuarios");
    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        const lista: UsuarioAdmin[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<UsuarioAdmin, "id">),
        }));
        setUsuarios(lista);
        setLoading(false);
      },
      () => {
        // Si falla (por ejemplo, no es admin), dejamos la lista vacía
        setUsuarios([]);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  async function cambiarEstado(uid: string, nuevoEstado: "aprobado" | "rechazado") {
    const ref = doc(db, "usuarios", uid);
    await updateDoc(ref, { estado: nuevoEstado });
  }

  return { usuarios, loading, cambiarEstado };
}