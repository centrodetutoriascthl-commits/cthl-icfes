"use client";

import { ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { useUserData } from "./useUserData";

export default function AdminGate({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { userData, loading: dataLoading } = useUserData();

  if (authLoading || dataLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  if (!user || userData?.rol !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm rounded-xl bg-white p-8 text-center shadow-md">
          <h1 className="mb-3 text-xl font-bold text-red-600">
            Acceso restringido
          </h1>
          <p className="text-sm text-gray-600">
            Esta sección es solo para administradores.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}