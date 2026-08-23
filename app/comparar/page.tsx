"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
const COLOR_TEAL = "#24ACB5";
const COLOR_AZUL = "#1D74BB";
const COLOR_GRIS = "#757575";

type Colegio = {
  id: string;
  nombre: string;
  naturaleza: string;
  municipio: string;
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

type Slot = {
  colegio: Colegio | null;
  resultados: Resultado[];
  busqueda: string;
};

const slotVacio: Slot = { colegio: null, resultados: [], busqueda: "" };

const areas = [
  { clave: "matematicas", etiqueta: "Matemáticas" },
  { clave: "lectura_critica", etiqueta: "Lectura crítica" },
  { clave: "c_naturales", etiqueta: "C. Naturales" },
  { clave: "sociales", etiqueta: "Sociales" },
  { clave: "ingles", etiqueta: "Inglés" },
] as const;

export default function CompararPage() {
  const [colegios, setColegios] = useState<Colegio[]>([]);
  const [cargandoLista, setCargandoLista] = useState(true);
  const [slots, setSlots] = useState<Slot[]>([slotVacio, slotVacio]);
  const [vista, setVista] = useState<"tabla" | "grafica">("tabla");
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

  function actualizarBusqueda(index: number, texto: string) {
    setSlots((prev) => {
      const nuevo = [...prev];
      nuevo[index] = { ...nuevo[index], busqueda: texto };
      return nuevo;
    });
  }

  async function seleccionarColegio(index: number, colegio: Colegio) {
    const resSnap = await getDocs(collection(db, "colegios", colegio.id, "resultados"));
    const lista: Resultado[] = resSnap.docs.map((d) => d.data() as Resultado);
    lista.sort((a, b) => a.anio - b.anio);

    setSlots((prev) => {
      const nuevo = [...prev];
      nuevo[index] = { colegio, resultados: lista, busqueda: "" };
      return nuevo;
    });
  }

  function quitarColegio(index: number) {
    setSlots((prev) => {
      const nuevo = [...prev];
      nuevo[index] = slotVacio;
      return nuevo;
    });
  }

  const slotsConDatos = slots.filter((s) => s.colegio !== null);

  function ultimoResultado(slot: Slot): Resultado | null {
    if (slot.resultados.length === 0) return null;
    return slot.resultados[slot.resultados.length - 1];
  }

  // Determina cuál valor es el mejor entre los slots con datos, para resaltarlo
  function esMejor(valor: number | null | undefined, todos: (number | null | undefined)[]): boolean {
    if (valor === null || valor === undefined) return false;
    const validos = todos.filter((v): v is number => v !== null && v !== undefined);
    if (validos.length < 2) return false;
    return valor === Math.max(...validos);
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 md:px-6 md:py-10">
      <div className="mx-auto max-w-5xl">
        
          <a href="/"
          className="mb-4 inline-block text-sm font-medium hover:opacity-80"
          style={{ color: COLOR_AZUL }}
        >
          ← Volver al buscador
        </a>

        <h1 className="mb-2 text-2xl font-bold md:text-3xl" style={{ color: COLOR_AZUL }}>
          Comparar colegios
        </h1>
        <p className="mb-8 text-sm md:text-base" style={{ color: COLOR_GRIS }}>
          Selecciona dos colegios para ver su comparativo lado a lado.
        </p>

        {/* Selectores */}
        <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-2">
          {slots.map((slot, index) => (
            <div key={index} className="relative">
              {slot.colegio ? (
                <div className="flex items-center justify-between rounded-2xl border-2 bg-white px-5 py-4 shadow-sm" style={{ borderColor: COLOR_TEAL }}>
                  <div>
                    <p className="font-semibold" style={{ color: COLOR_AZUL }}>
                      {slot.colegio.nombre}
                    </p>
                    <p className="text-xs" style={{ color: COLOR_GRIS }}>
                      {slot.colegio.municipio} · {slot.colegio.naturaleza}
                    </p>
                  </div>
                  <button
                    onClick={() => quitarColegio(index)}
                    className="ml-3 text-sm font-medium text-red-500 hover:opacity-80"
                  >
                    Quitar
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    value={slot.busqueda}
                    onChange={(e) => actualizarBusqueda(index, e.target.value)}
                    placeholder={cargandoLista ? "Cargando colegios..." : `Colegio ${index + 1}...`}
                    disabled={cargandoLista}
                    className="w-full rounded-2xl border-2 px-5 py-4 text-base shadow-sm outline-none focus:ring-2"
                    style={{ borderColor: COLOR_TEAL }}
                  />
                  {slot.busqueda.trim().length >= 2 && (
                    <ul className="absolute z-10 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl">
                      {colegios
                        .filter((c) => c.nombre.toLowerCase().includes(slot.busqueda.toLowerCase()))
                        .slice(0, 10)
                        .map((c) => (
                          <li
                            key={c.id}
                            onClick={() => seleccionarColegio(index, c)}
                            className="cursor-pointer border-b border-gray-100 px-5 py-3 text-left text-sm last:border-0 hover:bg-cyan-50"
                          >
                            <span className="font-medium">{c.nombre}</span>{" "}
                            <span style={{ color: COLOR_GRIS }}>
                              · {c.municipio} · {c.naturaleza}
                            </span>
                          </li>
                        ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        {/* Tabla comparativa */}
        {slotsConDatos.length >= 2 && (
          <div className="rounded-2xl bg-white p-4 shadow-md md:p-6">
            <div className="mb-6 flex justify-center gap-2">
              <button
                onClick={() => setVista("tabla")}
                className="rounded-md px-4 py-2 text-sm font-medium"
                style={{
                  background: vista === "tabla" ? COLOR_AZUL : "#f3f4f6",
                  color: vista === "tabla" ? "#fff" : COLOR_GRIS,
                }}
              >
                Ver como tabla
              </button>
              <button
                onClick={() => setVista("grafica")}
                className="rounded-md px-4 py-2 text-sm font-medium"
                style={{
                  background: vista === "grafica" ? COLOR_AZUL : "#f3f4f6",
                  color: vista === "grafica" ? "#fff" : COLOR_GRIS,
                }}
              >
                Ver como gráfica
              </button>
            </div>

            {vista === "tabla" && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px] border-collapse text-sm md:text-base">
                  <thead>
                    <tr>
                      <th className="py-3 pr-4 text-left" style={{ color: COLOR_GRIS }}>
                        Indicador
                      </th>
                      {slotsConDatos.map((slot, i) => (
                        <th key={i} className="px-4 py-3 text-center font-bold" style={{ color: COLOR_AZUL }}>
                          {slot.colegio!.nombre}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t-2" style={{ borderColor: COLOR_TEAL }}>
                      <td className="py-3 pr-4 font-semibold">Puntaje global</td>
                      {slotsConDatos.map((slot, i) => {
                        const u = ultimoResultado(slot);
                        const todos = slotsConDatos.map((s) => ultimoResultado(s)?.prom_global);
                        const mejor = esMejor(u?.prom_global, todos);
                        return (
                          <td
                            key={i}
                            className="px-4 py-3 text-center text-lg font-bold"
                            style={{ color: mejor ? COLOR_TEAL : COLOR_AZUL }}
                          >
                            {u ? u.prom_global.toFixed(1) : "—"}
                            {u && ` (${u.anio})`}
                          </td>
                        );
                      })}
                    </tr>

                    {areas.map((a) => (
                      <tr key={a.clave} className="border-t border-gray-100">
                        <td className="py-3 pr-4" style={{ color: COLOR_GRIS }}>
                          {a.etiqueta}
                        </td>
                        {slotsConDatos.map((slot, i) => {
                          const u = ultimoResultado(slot);
                          const valor = u ? (u as any)[`prom_${a.clave}`] as number : null;
                          const todos = slotsConDatos.map((s) => {
                            const uu = ultimoResultado(s);
                            return uu ? (uu as any)[`prom_${a.clave}`] as number : null;
                          });
                          const mejor = esMejor(valor, todos);
                          return (
                            <td
                              key={i}
                              className="px-4 py-3 text-center font-medium"
                              style={{ color: mejor ? COLOR_TEAL : "inherit" }}
                            >
                              {valor !== null ? valor.toFixed(1) : "—"}
                            </td>
                          );
                        })}
                      </tr>
                    ))}

                    <tr className="border-t-2" style={{ borderColor: COLOR_TEAL }}>
                      <td className="py-3 pr-4 font-semibold">Municipio</td>
                      {slotsConDatos.map((slot, i) => (
                        <td key={i} className="px-4 py-3 text-center" style={{ color: COLOR_GRIS }}>
                          {slot.colegio!.municipio}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t border-gray-100">
                      <td className="py-3 pr-4 font-semibold">Sector</td>
                      {slotsConDatos.map((slot, i) => (
                        <td key={i} className="px-4 py-3 text-center" style={{ color: COLOR_GRIS }}>
                          {slot.colegio!.naturaleza}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {vista === "grafica" && (
              <div className="flex flex-col gap-10">
                <div>
                  <h3 className="mb-3 text-center text-base font-bold" style={{ color: COLOR_AZUL }}>
                    Comparativo por área
                  </h3>
                  <ResponsiveContainer width="100%" height={320}>
                    <RadarChart
                      data={areas.map((a) => {
                        const punto: any = { area: a.etiqueta };
                        slotsConDatos.forEach((slot) => {
                          const u = ultimoResultado(slot);
                          punto[slot.colegio!.nombre] = u ? (u as any)[`prom_${a.clave}`] : 0;
                        });
                        return punto;
                      })}
                    >
                      <PolarGrid />
                      <PolarAngleAxis dataKey="area" tick={{ fontSize: 11, fill: COLOR_GRIS }} />
                      <PolarRadiusAxis tick={{ fontSize: 10 }} />
                      {slotsConDatos.map((slot, i) => (
                        <Radar
                          key={i}
                          name={slot.colegio!.nombre}
                          dataKey={slot.colegio!.nombre}
                          stroke={i === 0 ? COLOR_AZUL : COLOR_TEAL}
                          fill={i === 0 ? COLOR_AZUL : COLOR_TEAL}
                          fillOpacity={0.25}
                        />
                      ))}
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h3 className="mb-3 text-center text-base font-bold" style={{ color: COLOR_AZUL }}>
                    Evolución del puntaje global
                  </h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart
                      data={(() => {
                        const anios = new Set<number>();
                        slotsConDatos.forEach((s) => s.resultados.forEach((r) => anios.add(r.anio)));
                        return Array.from(anios)
                          .sort()
                          .map((anio) => {
                            const punto: any = { anio };
                            slotsConDatos.forEach((slot) => {
                              const r = slot.resultados.find((r) => r.anio === anio);
                              punto[slot.colegio!.nombre] = r ? r.prom_global : null;
                            });
                            return punto;
                          });
                      })()}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="anio" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} domain={["auto", "auto"]} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      {slotsConDatos.map((slot, i) => (
                        <Line
                          key={i}
                          type="monotone"
                          dataKey={slot.colegio!.nombre}
                          stroke={i === 0 ? COLOR_AZUL : COLOR_TEAL}
                          strokeWidth={2.5}
                          connectNulls
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}

        {slotsConDatos.length < 2 && (
          <p className="text-center text-sm" style={{ color: COLOR_GRIS }}>
            Selecciona dos colegios arriba para ver la comparación.
          </p>
        )}
      </div>
    </main>
  );
}