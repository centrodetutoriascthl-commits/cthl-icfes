"use client";

import { ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { useUserData } from "./useUserData";

export default function AccessGate({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { user, loading: authLoading, logout, reenviarVerificacion } = useAuth();
  const { userData, loading: dataLoading } = useUserData();

  if (authLoading || dataLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

 // No ha iniciado sesión: mostramos el fallback si existe, si no bloqueamos
  if (!user) {
    return <>{fallback ?? null}</>;
  }

  // Inició sesión pero no ha verificado su correo
  if (!user.emailVerified) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm rounded-xl bg-white p-8 text-center shadow-md">
          <h1 className="mb-3 text-xl font-bold text-[#1D74BB]">
            Verifica tu correo
          </h1>
          <p className="mb-6 text-sm text-gray-600">
            Te enviamos un enlace de verificación a <strong>{user.email}</strong>.
            Revisa tu bandeja de entrada (y spam) y haz clic en el enlace.
          </p>
          <button
            onClick={reenviarVerificacion}
            className="mb-2 w-full rounded-md bg-[#1D74BB] py-2 font-medium text-white hover:opacity-90"
          >
            Reenviar correo
          </button>
          <button
            onClick={logout}
            className="w-full rounded-md border border-gray-300 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  // Verificó el correo, pero aún no lo aprueba el equipo
 // A partir de aquí, solo se deja pasar si el estado es explícitamente "aprobado".
  // Cualquier otro caso (pendiente, rechazado, o perfil inexistente) queda bloqueado.
  if (userData?.estado === "aprobado") {
    return <>{children}</>;
  }

  if (userData?.estado === "rechazado") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm rounded-xl bg-white p-8 text-center shadow-md">
          <h1 className="mb-3 text-xl font-bold text-red-600">
            Acceso no disponible
          </h1>
          <p className="mb-6 text-sm text-gray-600">
            Contáctanos si crees que esto es un error.
          </p>
          <button
            onClick={logout}
            className="w-full rounded-md border border-gray-300 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  // Pendiente, o perfil sin crear todavía: misma pantalla de espera
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 text-center shadow-md">
        <h1 className="mb-3 text-xl font-bold text-[#1D74BB]">
          Cuenta en revisión
        </h1>
        <p className="mb-6 text-sm text-gray-600">
          Tu cuenta está pendiente de aprobación por nuestro equipo.
          Te notificaremos por correo cuando esté lista.
        </p>
        <button
          onClick={logout}
          className="w-full rounded-md border border-gray-300 py-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}