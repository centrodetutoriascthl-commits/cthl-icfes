"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function RegistroPage() {
  const { registerEmail, loginGoogle } = useAuth();
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [colegio, setColegio] = useState("");
  const [cargo, setCargo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await registerEmail(email, password, { nombre, colegio, cargo, telefono });
      router.push("/");
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setError("Ese correo ya está registrado. Intenta iniciar sesión.");
      } else if (err.code === "auth/weak-password") {
        setError("La contraseña debe tener al menos 6 caracteres.");
      } else {
        setError("No se pudo crear la cuenta. Verifica los datos.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await loginGoogle();
      router.push("/");
    } catch (err) {
      setError("No se pudo iniciar sesión con Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-[#1D74BB]">
          Crear cuenta · CTHL
        </h1>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-[#24ACB5]"
            required
          />
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
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-[#24ACB5]"
            required
          />
          <input
            type="password"
            placeholder="Contraseña (mínimo 6 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-[#24ACB5]"
            required
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-[#1D74BB] py-2 font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <div className="my-4 flex items-center gap-2">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-400">o</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full rounded-md border border-gray-300 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Continuar con Google
        </button>

        <p className="mt-5 text-center text-sm text-gray-500">
          ¿Ya tienes cuenta?{" "}
          <a href="/login" className="font-medium text-[#1D74BB] hover:underline">
            Inicia sesión
          </a>
        </p>
      </div>
    </div>
  );
}