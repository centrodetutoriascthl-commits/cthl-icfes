"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import AccessGate from "./context/AccessGate";
import { useAuth } from "./context/AuthContext";
import { useUserData } from "./context/useUserData";
// Paleta oficial — Manual de Marca Hilder Lapeira / CTHL
const COLOR_TEAL = "#24ACB5";
const COLOR_AZUL = "#1D74BB";
const COLOR_AZUL_CLARO = "#11ABE0";
const COLOR_GRIS = "#757575";

type Colegio = {
  id: string;
  nombre: string;
  naturaleza: string;
  municipio: string;
  departamento: string;
};

type Resultado = {
  anio: number;
  n_estudiantes: number;
  prom_global: number;
  prom_matematicas: number;
  prom_lectura_critica: number;
  prom_c_naturales: number;
  prom_sociales: number;
  prom_ingles: number;
  pct_nivel_bajo_matematicas: number | null;
  pct_nivel_bajo_lectura_critica: number | null;
  pct_nivel_bajo_c_naturales: number | null;
  pct_nivel_bajo_sociales: number | null;
  pct_nivel_bajo_ingles: number | null;
};

type Benchmark = {
  anio: number;
  prom_departamental_global: number;
  prom_nacional_global: number | null;
  prom_departamental_matematicas: number;
  prom_nacional_matematicas: number | null;
  prom_departamental_lectura_critica: number;
  prom_nacional_lectura_critica: number | null;
  prom_departamental_c_naturales: number;
  prom_nacional_c_naturales: number | null;
  prom_departamental_sociales: number;
  prom_nacional_sociales: number | null;
  prom_departamental_ingles: number;
  prom_nacional_ingles: number | null;
};

export default function Home() {
  const [colegios, setColegios] = useState<Colegio[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargandoLista, setCargandoLista] = useState(true);

  const [colegioSeleccionado, setColegioSeleccionado] = useState<Colegio | null>(null);
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [benchmark, setBenchmark] = useState<Benchmark | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const { user, logout } = useAuth();
  const { userData } = useUserData();
  useEffect(() => {
    async function cargarColegios() {
      const snap = await getDocs(collection(db, "colegios"));
      const lista: Colegio[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Colegio, "id">),
      }));
      lista.sort((a, b) => a.nombre.localeCompare(b.nombre));
      setColegios(lista);
      setCargandoLista(false);
    }
    cargarColegios();
  }, []);

  const coincidencias =
    busqueda.trim().length < 2
      ? []
      : colegios
          .filter((c) => c.nombre.toLowerCase().includes(busqueda.toLowerCase()))
          .slice(0, 15);

  async function seleccionarColegio(colegio: Colegio) {
    setColegioSeleccionado(colegio);
    setBusqueda("");
    setCargandoDetalle(true);

    const resSnap = await getDocs(collection(db, "colegios", colegio.id, "resultados"));
    const lista: Resultado[] = resSnap.docs.map((d) => d.data() as Resultado);
    lista.sort((a, b) => a.anio - b.anio);
    setResultados(lista);

    const ultimoAnio = lista.length ? Math.max(...lista.map((r) => r.anio)) : null;
    if (ultimoAnio) {
      const benchSnap = await getDoc(doc(db, "benchmarks", String(ultimoAnio)));
      setBenchmark(benchSnap.exists() ? (benchSnap.data() as Benchmark) : null);
    } else {
      setBenchmark(null);
    }

    setCargandoDetalle(false);
  }

  const ultimo = resultados.length ? resultados[resultados.length - 1] : null;

  const areas = [
    { clave: "matematicas", etiqueta: "Matemáticas" },
    { clave: "lectura_critica", etiqueta: "Lectura crítica" },
    { clave: "c_naturales", etiqueta: "C. Naturales" },
    { clave: "sociales", etiqueta: "Sociales" },
    { clave: "ingles", etiqueta: "Inglés" },
  ] as const;

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      {/* Encabezado de marca */}
      <header
        className="w-full py-12 px-6 flex flex-col items-center text-center"
        style={{ background: `linear-gradient(135deg, ${COLOR_AZUL} 0%, #123f6e 100%)` }}
      >
        <div className="bg-white rounded-2xl px-6 py-3 shadow-lg mb-5">
          <img src="/logo-cthl.png" alt="Hilder Lapeira - Centro de Tutorías" className="h-44 md:h-56" />
        </div>
        <h1 className="text-2xl md:text-4xl font-bold text-white tracking-tight text-center">
          Diagnóstico Integral · Pruebas Saber
        </h1>
        <p className="text-lg md:text-xl font-medium mt-1 text-white/90">
          Establecimientos Educativos
        </p>
        <p className="text-base md:text-lg mt-3" style={{ color: COLOR_AZUL_CLARO }}>
          Bolívar · histórico 2021–2025 · comparado con el promedio departamental y nacional
        </p>
         </header>

      <div className="max-w-4xl mx-auto px-6 py-10 md:py-14">
        {user && (
          <div className="mb-6 flex items-center justify-between rounded-xl bg-white px-5 py-3 shadow-sm">
            <span className="text-sm" style={{ color: COLOR_GRIS }}>
              Sesión iniciada: <strong>{user.email}</strong>
            </span>
                        <div className="flex items-center gap-4">
              {userData?.rol === "admin" && (
                <a href="/admin" className="text-sm font-medium hover:opacity-80" style={{ color: COLOR_TEAL }}>
                  Panel admin
                </a>
              )}
              <button
                onClick={logout}
                className="text-sm font-medium hover:opacity-80"
                style={{ color: COLOR_AZUL }}
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        )}
     <div className="mb-6 flex justify-center">
          <a href="/comparar" className="rounded-md px-5 py-2.5 text-sm font-medium text-white hover:opacity-90" style={{ background: COLOR_TEAL }}>
            Comparar colegios
          </a>
      </div>
        {/* Buscador */}
        <div className="relative mb-12">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder={cargandoLista ? "Cargando colegios..." : "Escribe el nombre del colegio..."}
            disabled={cargandoLista}
            className="w-full border-2 rounded-2xl px-6 py-5 text-lg md:text-xl text-center focus:outline-none focus:ring-2 shadow-md bg-white"
            style={{ borderColor: COLOR_TEAL }}
          />
          {coincidencias.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-2xl mt-2 shadow-2xl max-h-80 overflow-y-auto">
              {coincidencias.map((c) => (
                <li
                  key={c.id}
                  onClick={() => seleccionarColegio(c)}
                  className="px-6 py-4 hover:bg-cyan-50 cursor-pointer text-base border-b border-gray-100 last:border-0 text-left"
                >
                  <span className="font-medium">{c.nombre}</span>{" "}
                  <span style={{ color: COLOR_GRIS }}>
                    · {c.municipio} · {c.naturaleza}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cargandoDetalle && <p className="text-center" style={{ color: COLOR_GRIS }}>Cargando datos del colegio...</p>}

        {colegioSeleccionado && !cargandoDetalle && (
          <div>
            <div className="mb-8 text-center">
              <h2 className="text-2xl md:text-3xl font-bold" style={{ color: COLOR_AZUL }}>
                {colegioSeleccionado.nombre}
              </h2>
              <p className="text-sm md:text-base mt-1" style={{ color: COLOR_GRIS }}>
                {colegioSeleccionado.municipio} · {colegioSeleccionado.naturaleza} · código DANE{" "}
                {colegioSeleccionado.id}
              </p>
            </div>

            {resultados.length === 0 && (
              <p className="text-center" style={{ color: COLOR_GRIS }}>
                Este colegio no tiene resultados registrados en el rango 2021–2025.
              </p>
            )}

            {ultimo && (
              <>
                {/* Tarjetas comparativo global */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
                  <div className="bg-white rounded-2xl shadow-md p-6 text-center border-t-4" style={{ borderColor: COLOR_AZUL }}>
                    <p className="text-sm mb-1" style={{ color: COLOR_GRIS }}>Puntaje global {ultimo.anio}</p>
                    <p className="text-4xl font-bold" style={{ color: COLOR_AZUL }}>
                      {ultimo.prom_global?.toFixed(1)}
                    </p>
                  </div>
                  <div className="bg-white rounded-2xl shadow-md p-6 text-center border-t-4" style={{ borderColor: COLOR_TEAL }}>
                    <p className="text-sm mb-1" style={{ color: COLOR_GRIS }}>
                      Vs. Bolívar ({benchmark?.prom_departamental_global?.toFixed(1) ?? "—"})
                    </p>
                    <p
                      className="text-4xl font-bold"
                      style={{
                        color:
                          ultimo.prom_global - (benchmark?.prom_departamental_global ?? 0) < 0
                            ? "#c0392b"
                            : COLOR_TEAL,
                      }}
                    >
                      {benchmark ? (ultimo.prom_global - benchmark.prom_departamental_global).toFixed(1) : "—"}
                    </p>
                  </div>
                  <div className="bg-white rounded-2xl shadow-md p-6 text-center border-t-4" style={{ borderColor: COLOR_TEAL }}>
                    <p className="text-sm mb-1" style={{ color: COLOR_GRIS }}>
                      Vs. nacional ({benchmark?.prom_nacional_global?.toFixed(1) ?? "—"})
                    </p>
                    <p
                      className="text-4xl font-bold"
                      style={{
                        color:
                          ultimo.prom_global - (benchmark?.prom_nacional_global ?? 0) < 0
                            ? "#c0392b"
                            : COLOR_TEAL,
                      }}
                    >
                      {benchmark?.prom_nacional_global
                        ? (ultimo.prom_global - benchmark.prom_nacional_global).toFixed(1)
                        : "—"}
                    </p>
                  </div>
                </div>
<AccessGate
                  fallback={
                    <div className="bg-white rounded-2xl shadow-md p-8 text-center">
                      <h3 className="text-lg font-bold mb-2" style={{ color: COLOR_AZUL }}>
                        Diagnóstico completo disponible con cuenta
                      </h3>
                      <p className="text-sm md:text-base mb-5" style={{ color: COLOR_GRIS }}>
                        Inicia sesión para ver el histórico completo por área, el desglose
                        de niveles de desempeño y los comparativos detallados de este colegio.
                      </p>
                      <a href="/login" className="inline-block rounded-md px-6 py-3 font-medium text-white hover:opacity-90" style={{ background: COLOR_AZUL }}>
                        Iniciar sesión
                      </a>
                    </div>
                  }
                >
                  {/* Histórico por área */}
                  <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 mb-10">
                    <h3 className="text-lg font-bold mb-4" style={{ color: COLOR_AZUL }}>
                      Histórico por área
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm md:text-base border-collapse">
                        <thead>
                          <tr className="text-left border-b-2" style={{ borderColor: COLOR_TEAL }}>
                            <th className="py-3 pr-4">Año</th>
                            {areas.map((a) => (
                              <th key={a.clave} className="py-3 pr-4">
                                {a.etiqueta}
                              </th>
                            ))}
                            <th className="py-3 pr-4">Global</th>
                            <th className="py-3 pr-4">Estudiantes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {resultados.map((r) => (
                            <tr key={r.anio} className="border-b border-gray-100">
                              <td className="py-3 pr-4 font-semibold">{r.anio}</td>
                              {areas.map((a) => (
                                <td key={a.clave} className="py-3 pr-4">
                                  {(r as any)[`prom_${a.clave}`]?.toFixed(1) ?? "—"}
                                </td>
                              ))}
                              <td className="py-3 pr-4 font-semibold" style={{ color: COLOR_AZUL }}>
                                {r.prom_global?.toFixed(1)}
                              </td>
                              <td className="py-3 pr-4" style={{ color: COLOR_GRIS }}>{r.n_estudiantes}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* % nivel bajo por área */}
                  <div className="bg-white rounded-2xl shadow-md p-6 md:p-8">
                    <h3 className="text-lg font-bold mb-5" style={{ color: COLOR_AZUL }}>
                      % de estudiantes en nivel bajo por área ({ultimo.anio})
                    </h3>
                    <div className="space-y-4">
                      {areas.map((a) => {
                        const valor = (ultimo as any)[`pct_nivel_bajo_${a.clave}`] as number | null;
                        return (
                          <div key={a.clave} className="flex items-center gap-4">
                            <span className="w-36 text-sm md:text-base shrink-0 font-medium" style={{ color: COLOR_GRIS }}>
                              {a.etiqueta}
                            </span>
                            <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                              <div
                                className="h-6 rounded-full transition-all"
                                style={{
                                  width: `${valor ?? 0}%`,
                                  background: `linear-gradient(90deg, ${COLOR_AZUL_CLARO}, ${COLOR_TEAL})`,
                                }}
                              />
                            </div>
                            <span className="w-14 text-base text-right font-bold" style={{ color: COLOR_AZUL }}>
                              {valor !== null && valor !== undefined ? `${valor.toFixed(0)}%` : "—"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </AccessGate>
              </>
            )}
          </div>
        )}

        {!colegioSeleccionado && !cargandoLista && (
          <p className="text-sm md:text-base text-center" style={{ color: COLOR_GRIS }}>
            Escribe al menos 2 letras del nombre del colegio para empezar a buscar. Hay {colegios.length} colegios
            de Bolívar disponibles.
          </p>
        )}
      </div>
    </main>
  );
}
