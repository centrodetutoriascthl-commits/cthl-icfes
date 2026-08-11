// cargar-datos.js
// Sube los CSV consolidados de Saber 11 (Bolívar 2021-2025 + benchmark nacional 2025) a Firestore.
// Correr con: node cargar-datos.js

const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const serviceAccount = require("./firebase-key.json");

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

// --- Utilidad simple para leer un CSV con comas y devolver objetos ---
async function leerCSV(rutaArchivo) {
  const filas = [];
  const rl = readline.createInterface({
    input: fs.createReadStream(rutaArchivo),
    crlfDelay: Infinity,
  });

  let encabezados = null;
  for await (const linea of rl) {
    if (!linea.trim()) continue;
    const valores = linea.split(",");
    if (!encabezados) {
      encabezados = valores;
      continue;
    }
    const fila = {};
    encabezados.forEach((col, i) => (fila[col] = valores[i]));
    filas.push(fila);
  }
  return filas;
}

function numero(v) {
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

async function main() {
  console.log("Leyendo archivos CSV...");

  const agregado = await leerCSV(path.join(__dirname, "agregado_colegio_anio_bolivar.csv"));
  const pctBajo = await leerCSV(path.join(__dirname, "pct_nivel_bajo_por_area.csv"));
  const depto = await leerCSV(path.join(__dirname, "promedio_departamental_bolivar.csv"));
  const nacional = await leerCSV(path.join(__dirname, "promedio_nacional_2025.csv"));

  console.log(`Colegio-año: ${agregado.length} filas`);
  console.log(`% nivel bajo: ${pctBajo.length} filas`);
  console.log(`Departamental: ${depto.length} filas`);
  console.log(`Nacional: ${nacional.length} filas`);

  // Indexar % nivel bajo por (codigo dane + año) para cruzarlo rápido
  const pctIndex = {};
  for (const fila of pctBajo) {
    const clave = `${fila.cole_cod_dane_establecimiento}_${fila.anio}`;
    pctIndex[clave] = fila;
  }

  // Indexar benchmarks por año
  const deptoIndex = {};
  for (const fila of depto) deptoIndex[fila.anio] = fila;
  const nacionalIndex = {};
  for (const fila of nacional) nacionalIndex[fila.anio] = fila;

  // --- 1. Subir benchmarks ---
  console.log("\nSubiendo benchmarks...");
  const aniosBenchmark = new Set([...Object.keys(deptoIndex), ...Object.keys(nacionalIndex)]);
  for (const anio of aniosBenchmark) {
    const d = deptoIndex[anio] || {};
    const n = nacionalIndex[anio] || {};
    await db.collection("benchmarks").doc(anio).set({
      anio: numero(anio),
      prom_departamental_global: numero(d.prom_global),
      prom_departamental_matematicas: numero(d.prom_matematicas),
      prom_departamental_lectura_critica: numero(d.prom_lectura_critica),
      prom_departamental_c_naturales: numero(d.prom_c_naturales),
      prom_departamental_sociales: numero(d.prom_sociales),
      prom_departamental_ingles: numero(d.prom_ingles),
      prom_nacional_global: numero(n.prom_global) ?? null,
      prom_nacional_matematicas: numero(n.prom_matematicas) ?? null,
      prom_nacional_lectura_critica: numero(n.prom_lectura_critica) ?? null,
      prom_nacional_c_naturales: numero(n.prom_c_naturales) ?? null,
      prom_nacional_sociales: numero(n.prom_sociales) ?? null,
      prom_nacional_ingles: numero(n.prom_ingles) ?? null,
    });
  }
  console.log(`Benchmarks subidos: ${aniosBenchmark.size} años`);

  // --- 2. Subir colegios + resultados por año ---
  console.log("\nSubiendo colegios y resultados (esto puede tardar varios minutos)...");

  const colegiosVistos = new Set();
  let contador = 0;

  for (const fila of agregado) {
    const codigo = fila.cole_cod_dane_establecimiento;
    if (!codigo) continue;

    // Documento del colegio (solo la primera vez que aparece)
    if (!colegiosVistos.has(codigo)) {
      colegiosVistos.add(codigo);
      await db.collection("colegios").doc(codigo).set({
        nombre: fila.cole_nombre_establecimiento,
        naturaleza: fila.cole_naturaleza,
        municipio: fila.cole_mcpio_ubicacion,
        departamento: "BOLIVAR",
      });
    }

    // Cruce con % en nivel bajo por área
    const claveP = `${codigo}_${fila.anio}`;
    const p = pctIndex[claveP] || {};

    await db
      .collection("colegios")
      .doc(codigo)
      .collection("resultados")
      .doc(fila.anio)
      .set({
        anio: numero(fila.anio),
        n_estudiantes: numero(fila.n_estudiantes),
        prom_global: numero(fila.prom_global),
        prom_matematicas: numero(fila.prom_matematicas),
        prom_lectura_critica: numero(fila.prom_lectura_critica),
        prom_c_naturales: numero(fila.prom_c_naturales),
        prom_sociales: numero(fila.prom_sociales),
        prom_ingles: numero(fila.prom_ingles),
        percentil_prom_global: numero(fila.percentil_prom_global),
        pct_nivel_bajo_matematicas: numero(p.matematicas),
        pct_nivel_bajo_lectura_critica: numero(p.lectura_critica),
        pct_nivel_bajo_c_naturales: numero(p.c_naturales),
        pct_nivel_bajo_sociales: numero(p.sociales),
        pct_nivel_bajo_ingles: numero(p.ingles),
      });

    contador++;
    if (contador % 200 === 0) console.log(`  ${contador} registros de resultados subidos...`);
  }

  console.log(`\nListo. Colegios únicos: ${colegiosVistos.size}. Registros de resultados: ${contador}.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Error subiendo datos:", err);
  process.exit(1);
});
