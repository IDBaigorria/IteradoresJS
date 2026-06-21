/**
 * Pruebas exhaustivas del RelojAstronomico v1.3.5.
 *
 * Ejecuta casos de prueba sobre el cálculo vectorial, determinismo,
 * ciclos temporales, caché, polos y normalización.
 *
 * @since 1.3.5
 */
import { RelojAstronomico } from '../Tiempo/RelojAstronomico.js';

// ═══════════════════════════════════════════
// HERRAMIENTAS
// ═══════════════════════════════════════════

let testPasados = 0;
let testFallidos = 0;

function assertIguales(obtenido, esperado, mensaje, tolerancia = 1e-9) {
    const ok = Math.abs(obtenido - esperado) < tolerancia;
    console.log((ok ? '✅' : '❌'), mensaje);
    if (!ok) console.log(`   Esperado: ${esperado}, Obtenido: ${obtenido} (tolerancia: ${tolerancia})`);
    ok ? testPasados++ : testFallidos++;
    return ok;
}

function assertVectorUnitario(v, mensaje) {
    const mag = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    return assertIguales(mag, 1.0, `${mensaje} (magnitud)`);
}

function assertSimilitudMayor(v1, v2, umbral, mensaje) {
    const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    const ok = dot > umbral;
    console.log((ok ? '✅' : '❌'), mensaje, `(similitud=${dot.toFixed(4)}, umbral=${umbral})`);
    ok ? testPasados++ : testFallidos++;
    return ok;
}

function assertSimilitudMenor(v1, v2, umbral, mensaje) {
    const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    const ok = dot < umbral;
    console.log((ok ? '✅' : '❌'), mensaje, `(similitud=${dot.toFixed(4)}, umbral=${umbral})`);
    ok ? testPasados++ : testFallidos++;
    return ok;
}

// ═══════════════════════════════════════════
// PRUEBAS
// ═══════════════════════════════════════════

console.log('══════════════════════════════════');
console.log(' PRUEBAS RELOJ ASTRONÓMICO (JS)');
console.log('══════════════════════════════════\n');

const ts = 1717200000; // 1-jun-2024 00:00:00 UTC

// --- 1. Determinismo ---
console.log('--- 1. Determinismo ---');
const v1 = RelojAstronomico.vector_gravitacional(-34.0, -64.0, ts);
const v2 = RelojAstronomico.vector_gravitacional(-34.0, -64.0, ts);
assertIguales(v1.x, v2.x, 'Mismo timestamp: x igual');
assertIguales(v1.y, v2.y, 'Mismo timestamp: y igual');
assertIguales(v1.z, v2.z, 'Mismo timestamp: z igual');

// --- 2. Normalización ---
console.log('\n--- 2. Normalización ---');
for (let d = 0; d < 365; d += 30) {
    const t = ts + d * 86400;
    const v = RelojAstronomico.vector_gravitacional(40.0, -3.0, t);
    assertVectorUnitario(v, `Día ${d}`);
}

// --- 3. Cercanía temporal (1 minuto) ---
console.log('\n--- 3. Cercanía temporal (1 min) ---');
const vc1 = RelojAstronomico.vector_gravitacional(0, 0, ts);
const vc2 = RelojAstronomico.vector_gravitacional(0, 0, ts + 60);
assertSimilitudMayor(vc1, vc2, 0.9999, '1 min de diferencia');

// --- 4. Lejanía temporal (12 horas) ---
console.log('\n--- 4. Lejanía temporal (12 h) ---');
const vl1 = RelojAstronomico.vector_gravitacional(0, 0, ts);
const vl2 = RelojAstronomico.vector_gravitacional(0, 0, ts + 43200);
assertSimilitudMenor(vl1, vl2, 0.5, '12 h de diferencia');

// --- 5. Ciclo diario (misma hora, días consecutivos) ---
console.log('\n--- 5. Ciclo diario ---');
const vd1 = RelojAstronomico.vector_gravitacional(45.0, 10.0, ts);
const vd2 = RelojAstronomico.vector_gravitacional(45.0, 10.0, ts + 86400);
assertSimilitudMayor(vd1, vd2, 0.95, '24 h después');

// --- 6. Ciclo anual (mismo día/hora, año siguiente) ---
console.log('\n--- 6. Ciclo anual ---');
const va1 = RelojAstronomico.vector_gravitacional(23.0, -102.0, ts);
const va2 = RelojAstronomico.vector_gravitacional(23.0, -102.0, ts + 365.25 * 86400);
// Verificar que NO son idénticos
assertSimilitudMenor(va1, va2, 0.999, '1 año después (no debe ser idéntico)');
// Pero todavía hay algo de correlación estacional
assertSimilitudMayor(va1, va2, 0.3, '1 año después (algo de similitud estacional)');

// --- 7. Latitudes extremas (polos) ---
console.log('\n--- 7. Polos ---');
const vNorte = RelojAstronomico.vector_gravitacional(89.9, 0.0, ts);
const vSur   = RelojAstronomico.vector_gravitacional(-89.9, 0.0, ts);
assertVectorUnitario(vNorte, 'Polo Norte');
assertVectorUnitario(vSur, 'Polo Sur');
// La componente z debe ser cercana a sin(declinación solar) ≈ 0.375
assertIguales(Math.abs(vNorte.z), 0.375, 'Polo Norte: |z| ≈ sin(declinación solar)', 0.1);
assertIguales(Math.abs(vSur.z), 0.375, 'Polo Sur: |z| ≈ sin(declinación solar)', 0.1);

// --- 8. Timestamps extremos (pasado/futuro) ---
console.log('\n--- 8. Timestamps extremos ---');
const vp = RelojAstronomico.vector_gravitacional(0, 0, -157766400); // 1965
const vf = RelojAstronomico.vector_gravitacional(0, 0, 2524608000); // 2050
assertVectorUnitario(vp, 'Año 1965');
assertVectorUnitario(vf, 'Año 2050');

// --- 9. Caché de estado ---
console.log('\n--- 9. Caché de estado ---');
const reloj = new RelojAstronomico(-34.0, -64.0);
const vCa1 = reloj.vector(ts);
const vCa2 = reloj.vector(ts);
assertIguales(vCa1.x, vCa2.x, 'Caché: mismo timestamp, mismo vector (x)');
assertIguales(vCa1.y, vCa2.y, 'Caché: mismo timestamp, mismo vector (y)');
assertIguales(vCa1.z, vCa2.z, 'Caché: mismo timestamp, mismo vector (z)');
// Nuevo timestamp
const vCa3 = reloj.vector(ts + 3600);
const dif = Math.abs(vCa1.x - vCa3.x) + Math.abs(vCa1.y - vCa3.y) + Math.abs(vCa1.z - vCa3.z);
const okCache = dif > 0.001;
console.log((okCache ? '✅' : '❌'), 'Caché: nuevo timestamp produce vector distinto');
okCache ? testPasados++ : testFallidos++;

// --- 10. Cambio de ubicación ---
console.log('\n--- 10. Cambio de ubicación ---');
const reloj2 = new RelojAstronomico(-34.0, -64.0);
const vU1 = reloj2.vector(ts);

// Cambiar a otra ciudad (Madrid)
reloj2._ubicacion(40.4168, -3.7038);
const vU2 = reloj2.vector(ts);

const dot = vU1.x * vU2.x + vU1.y * vU2.y + vU1.z * vU2.z;
const ok = dot < 0.999;
console.log((ok ? '✅' : '❌'), `Cambio de ubicación produce vector distinto (similitud=${dot.toFixed(4)})`);
ok ? testPasados++ : testFallidos++;

const vU3 = reloj2.vector(ts);
assertIguales(vU2.x, vU3.x, 'Tras cambio de ubicación, mismo timestamp devuelve nuevo vector (x)');

// ═══════════════════════════════════════════
// RESUMEN
// ═══════════════════════════════════════════
console.log('\n══════════════════════════════════');
console.log(` PRUEBAS: ${testPasados} ✅, ${testFallidos} ❌`);
console.log('══════════════════════════════════');