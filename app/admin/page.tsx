"use client";

import AdminGate from "../context/AdminGate";
import { useAdminUsuarios } from "../context/useAdminUsuarios";

const COLOR_AZUL = "#1D74BB";
const COLOR_TEAL = "#24ACB5";
const COLOR_GRIS = "#757575";

function PanelAdmin() {
  const { usuarios, loading, cambiarEstado } = useAdminUsuarios();

  const pendientes = usuarios.filter((u) => u.estado === "pendiente");
  const aprobados = usuarios.filter((u) => u.estado === "aprobado");
  const rechazados = usuarios.filter((u) => u.estado === "rechazado");

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p style={{ color: COLOR_GRIS }}>Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
            <div className="mx-auto max-w-4xl">
        
          <a href="/"
          className="mb-4 inline-block text-sm font-medium hover:opacity-80"
          style={{ color: COLOR_AZUL }}
        >
          ← Volver al buscador
        </a>
        <h1 className="mb-2 text-2xl font-bold" style={{ color: COLOR_AZUL }}>
          Panel de administración
        </h1>
        <p className="mb-8 text-sm" style={{ color: COLOR_GRIS }}>
          {pendientes.length} pendiente(s) · {aprobados.length} aprobado(s) · {rechazados.length} rechazado(s)
        </p>

        <h2 className="mb-3 text-lg font-bold" style={{ color: COLOR_AZUL }}>
          Pendientes de aprobación
        </h2>

        {pendientes.length === 0 && (
          <p className="mb-8 text-sm" style={{ color: COLOR_GRIS }}>
            No hay usuarios pendientes por ahora.
          </p>
        )}

        <div className="mb-10 flex flex-col gap-4">
          {pendientes.map((u) => (
            <div key={u.id} className="rounded-xl bg-white p-5 shadow-sm">
              <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-bold">{u.nombre || "(sin nombre)"}</p>
                  <p className="text-sm" style={{ color: COLOR_GRIS }}>
                    {u.email}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => cambiarEstado(u.id, "aprobado")}
                    className="rounded-md px-4 py-1.5 text-sm font-medium text-white hover:opacity-90"
                    style={{ background: COLOR_TEAL }}
                  >
                    Aprobar
                  </button>
                  <button
                    onClick={() => cambiarEstado(u.id, "rechazado")}
                    className="rounded-md border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Rechazar
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-3" style={{ color: COLOR_GRIS }}>
                <p><strong>Colegio:</strong> {u.colegio || "—"}</p>
                <p><strong>Cargo:</strong> {u.cargo || "—"}</p>
                <p><strong>Teléfono:</strong> {u.telefono || "—"}</p>
              </div>
            </div>
          ))}
        </div>

        <h2 className="mb-3 text-lg font-bold" style={{ color: COLOR_AZUL }}>
          Historial ({aprobados.length + rechazados.length})
        </h2>
        <div className="flex flex-col gap-2">
          {[...aprobados, ...rechazados].map((u) => (
            <div
              key={u.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white px-4 py-2 text-sm shadow-sm"
            >
              <span>
                <strong>{u.nombre || "(sin nombre)"}</strong> · {u.email} · {u.colegio || "—"}
              </span>
              <span
                className="rounded-full px-3 py-0.5 text-xs font-medium text-white"
                style={{
                  background: u.estado === "aprobado" ? COLOR_TEAL : "#c0392b",
                }}
              >
                {u.estado}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default function AdminPage() {
  return (
    <AdminGate>
      <PanelAdmin />
    </AdminGate>
  );
}