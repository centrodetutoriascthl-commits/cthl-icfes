"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendEmailVerification,
  User,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

interface DatosRegistro {
  nombre: string;
  colegio: string;
  cargo: string;
  telefono: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginEmail: (email: string, password: string) => Promise<void>;
  registerEmail: (email: string, password: string, datos: DatosRegistro) => Promise<void>;
  loginGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  reenviarVerificacion: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function crearPerfilSiNoExiste(user: User, datos?: Partial<DatosRegistro>) {
  const ref = doc(db, "usuarios", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      email: user.email,
      nombre: datos?.nombre || user.displayName || "",
      colegio: datos?.colegio || "",
      cargo: datos?.cargo || "",
      telefono: datos?.telefono || "",
      estado: "pendiente",
      rol: "basico",
      gestionColegio: false,
      colegioId: "",
      fechaRegistro: serverTimestamp(),
    });
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const registerEmail = async (email: string, password: string, datos: DatosRegistro) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await crearPerfilSiNoExiste(cred.user, datos);
    await sendEmailVerification(cred.user);
  };

  const loginGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    await crearPerfilSiNoExiste(cred.user);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const reenviarVerificacion = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginEmail,
        registerEmail,
        loginGoogle,
        logout,
        reenviarVerificacion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}