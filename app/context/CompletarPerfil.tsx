"use client";

import { useState } from "react";
import { useAuth } from "./AuthContext";
import { useUserData } from "./useUserData";

export default function CompletarPerfil() {
  const { logout } = useAuth();
  const { actualizarPerfil } = useUserData();

  const [colegio, setColegio] = useState("");
  const [cargo, setCargo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await actualizarPerfil({ colegio, cargo, telefono });
    } catch (err) {
      setError("No se pudo guardar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-md">
        <h1 className="mb-2 text-center text-xl font-bold text-[#1D74BB]">
          Completa tu perfil
        </h1>
        <p className="mb-6 text-center text-sm text-gray-500">
          Necesitamos estos datos antes de continuar.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Colegio / Institución"
            value={colegio}
            onChange={(e) => setColegio(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-[#24ACB5]"
            required
          />
          <input
            type="text"
            placeholder="Cargo (rector, coordinador, docente...)"
            value={cargo}
            onChange={(e) => setCargo(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-[#24ACB5]"
            required
          />
          <input
            type="tel"
            placeholder="Teléfono / WhatsApp"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-[#24ACB5]"
            required
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-[#1D74BB] py-2 font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Guardar y continuar"}
          </button>
        </form>

        <button
          onClick={logout}
          className="mt-4 w-full text-center text-sm text-gray-500 hover:underline"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}