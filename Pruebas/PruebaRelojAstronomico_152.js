/**
 * Pruebas exhaustivas v1.5.2 – RelojAstronomico (ramillete de espines galáctico‑eclíptico)
 *
 * Cubre:
 *   - Instanciación y estructura del ramillete.
 *   - Unitariedad y tipado.
 *   - Caché por tiempo_unix.
 *   - Separación cósmico/geográfico.
 *   - Distancia temporal por escalas.
 *   - Distancia espacial.
 *   - Método espin() y determinismo.
 *
 * @since 1.5.2
 * @version 1.5.2
 * @author Ignacio David Baigorria
 */
import { Conf } from '../Configuracion/Configuracion.js';
import { RelojAstronomico } from '../Tiempo/RelojAstronomico.js';

function verificar_iguales(a, b, mensaje, tolerancia = 1e-9) {
    let ok;
    if (a === b) {
        ok = true;
    } else if (typeof a === 'number' && typeof b === 'number') {
        ok = Math.abs(a - b) < tolerancia;
    } else if (Array.isArray(a) && Array.isArray(b) && a.length === b.length) {
        ok = true;
        for (let i = 0; i < a.length; i++) {
            if (!verificar_iguales(a[i], b[i], '', tolerancia)) {
                ok = false;
                break;
            }
        }
    } else if (typeof a === 'object' && typeof b === 'object' && a !== null && b !== null) {
        ok = true;
        const claves = Object.keys(a);
        if (claves.length !== Object.keys(b).length) ok = false;
        else {
            for (const k of claves) {
                if (!verificar_iguales(a[k], b[k], '', tolerancia)) {
                    ok = false;
                    break;
                }
            }
        }
    } else {
        ok = false;
    }
    console.log((ok ? '✅ ' : '❌ ') + mensaje);
    if (!ok) console.log('   Esperado: ' + b + ', Obtenido: ' + a);
    return ok;
}

function verificar_vectores_iguales(a, b, mensaje, tolerancia = 1e-6) {
    const ok = Math.abs(a.x - b.x) < tolerancia &&
               Math.abs(a.y - b.y) < tolerancia &&
               Math.abs(a.z - b.z) < tolerancia;
    console.log((ok ? '✅ ' : '❌ ') + mensaje);
    if (!ok) {
        console.log('   a =', a);
        console.log('   b =', b);
    }
    return ok;
}

function verificar_no_nulo(v, mensaje) {
    const ok = v !== null && v !== undefined;
    console.log((ok ? '✅ ' : '❌ ') + mensaje);
    if (!ok) console.log('   Se esperaba valor no nulo.');
    return ok;
}

function verificar_verdadero(v, mensaje) {
    const ok = !!v;
    console.log((ok ? '✅ ' : '❌ ') + mensaje);
    return ok;
}

function verificar_falso(v, mensaje) {
    const ok = !v;
    console.log((ok ? '✅ ' : '❌ ') + mensaje);
    return ok;
}

function magnitud_vector(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

function distancia_espines(a, b) {
    return Math.sqrt(
        (a.x - b.x) ** 2 +
        (a.y - b.y) ** 2 +
        (a.z - b.z) ** 2
    );
}

function distancia_ramilletes(r1, r2) {
    const n = Math.min(r1.length, r2.length);
    if (n === 0) return 0.0;
    let suma = 0.0;
    for (let i = 0; i < n; i++) {
        suma += distancia_espines(r1[i].vector, r2[i].vector);
    }
    return suma / n;
}

function distancia_por_nombre(r1, r2, nombre) {
    let e1 = null, e2 = null;
    for (const espin of r1) if (espin.nombre === nombre) e1 = espin.vector;
    for (const espin of r2) if (espin.nombre === nombre) e2 = espin.vector;
    if (!e1 || !e2) return -1.0;
    return distancia_espines(e1, e2);
}

console.log('══════════════════════════════════');
console.log(' PRUEBAS 1.5.2 – RELOJ ASTRONÓMICO');
console.log('══════════════════════════════════\n');

// 1. Instanciación y ramillete
console.log('=== 1. Instanciación y ramillete básico ===');
const lat = Conf.LATITUD_PREDETERMINADA;
const lon = Conf.LONGITUD_PREDETERMINADA;
const reloj = new RelojAstronomico(lat, lon);
const tiempo_base = Math.floor(Date.UTC(2026, 6, 15, 12, 0, 0) / 1000);
const espines = reloj.espines(tiempo_base);

verificar_no_nulo(espines, 'espines() retorna un array');
verificar_verdadero(Array.isArray(espines), 'espines() es array');
verificar_iguales(espines.length, Object.keys(Conf.RELOJ_ASTROS).length, 'Cantidad de espines coincide con astros registrados');

const nombres_obtenidos = espines.map(e => e.nombre);
for (const nombre of Object.keys(Conf.RELOJ_ASTROS)) {
    verificar_verdadero(nombres_obtenidos.includes(nombre), `El ramillete contiene '${nombre}'`);
}

// 2. Unitariedad
console.log('\n=== 2. Unitariedad de vectores ===');
for (const espin of espines) {
    verificar_iguales(magnitud_vector(espin.vector), 1.0, `Vector de ${espin.nombre} es unitario`, 1e-6);
}

// 3. Caché
console.log('\n=== 3. Caché por tiempo_unix ===');
const c1 = reloj.espines(tiempo_base);
const c2 = reloj.espines(tiempo_base);
verificar_verdadero(c1 === c2, 'Dos llamadas con el mismo tiempo devuelven la misma referencia');
const c3 = reloj.espines(tiempo_base + 60);
verificar_falso(c1 === c3, 'Con otro tiempo se recalcula');

// 4. Separación cósmico/geográfico
console.log('\n=== 4. Separación cósmico/geográfico ===');
const reloj_ba = new RelojAstronomico(-34.6, -58.4);
const reloj_mad = new RelojAstronomico(40.4, -3.7);

const esp_ba = reloj_ba.espines(tiempo_base);
const esp_mad = reloj_mad.espines(tiempo_base);

for (const astro of ['sol', 'luna', 'jupiter', 'eje_terrestre']) {
    let v1 = null, v2 = null;
    for (const e of esp_ba) if (e.nombre === astro) v1 = e.vector;
    for (const e of esp_mad) if (e.nombre === astro) v2 = e.vector;
    verificar_vectores_iguales(v1, v2, `Espín cósmico '${astro}' es idéntico para BA y Madrid`);
}

let ct_ba = null, ct_mad = null;
for (const e of esp_ba) if (e.nombre === 'centro_tierra') ct_ba = e.vector;
for (const e of esp_mad) if (e.nombre === 'centro_tierra') ct_mad = e.vector;

const dist_geo_ba_mad = distancia_espines(ct_ba, ct_mad);
verificar_verdadero(dist_geo_ba_mad > 0.0, 'Espín centro_tierra es diferente entre BA y Madrid');
console.log('Distancia centro_tierra BA ↔ Madrid: ' + dist_geo_ba_mad.toFixed(6));

const dist_completa_ba_mad = distancia_ramilletes(esp_ba, esp_mad);
verificar_verdadero(dist_completa_ba_mad > 0.0, 'Distancia del ramillete completo > 0');
console.log('Distancia ramillete completo BA ↔ Madrid: ' + dist_completa_ba_mad.toFixed(6));

// 5. Distancia temporal por escala
console.log('\n=== 5. Distancia temporal por escala ===');
reloj._ubicacion(lat, lon);

const t0 = tiempo_base;
const t_1s = t0 + 1;
const t_1h = t0 + 3600;
const t_6h = t0 + 21600;
const t_1d = t0 + 86400;
const t_15d = t0 + 1296000;
const t_30d = t0 + 2592000;
const t_1a = t0 + 31557600;
const t_5a = t0 + 157788000;
const t_100a = t0 + 3155760000;
const t_1000a = t0 + 31557600000;

const seg0 = reloj.espines_por_escala('segundos', t0);
const seg1s = reloj.espines_por_escala('segundos', t_1s);
const seg1h = reloj.espines_por_escala('segundos', t_1h);
const seg6h = reloj.espines_por_escala('segundos', t_6h);

const d_seg1s = distancia_ramilletes(seg0, seg1s);
const d_seg1h = distancia_ramilletes(seg0, seg1h);
const d_seg6h = distancia_ramilletes(seg0, seg6h);

console.log('Escala segundos (centro_tierra):');
console.log(' 1 s: ' + d_seg1s.toFixed(6));
console.log(' 1 h: ' + d_seg1h.toFixed(6));
console.log(' 6 h: ' + d_seg6h.toFixed(6));
verificar_verdadero(d_seg1s < d_seg1h, 'Segundos: 1 s < 1 h');
verificar_verdadero(d_seg1h < d_seg6h, 'Segundos: 1 h < 6 h');

const dia0 = reloj.espines_por_escala('dias', t0);
const dia1 = reloj.espines_por_escala('dias', t_1d);
const dia15 = reloj.espines_por_escala('dias', t_15d);
const dia30 = reloj.espines_por_escala('dias', t_30d);

const d_dia1 = distancia_ramilletes(dia0, dia1);
const d_dia15 = distancia_ramilletes(dia0, dia15);
const d_dia30 = distancia_ramilletes(dia0, dia30);

console.log('Escala días (sol):');
console.log(' 1 d: ' + d_dia1.toFixed(6));
console.log(' 15 d: ' + d_dia15.toFixed(6));
console.log(' 30 d: ' + d_dia30.toFixed(6));
verificar_verdadero(d_dia1 < d_dia15, 'Días: 1 d < 15 d');
verificar_verdadero(d_dia15 < d_dia30, 'Días: 15 d < 30 d');

const anio0 = reloj.espines_por_escala('anios', t0);
const anio1 = reloj.espines_por_escala('anios', t_1a);
const anio5 = reloj.espines_por_escala('anios', t_5a);

const d_anio1 = distancia_ramilletes(anio0, anio1);
const d_anio5 = distancia_ramilletes(anio0, anio5);

console.log('Escala años (júpiter):');
console.log(' 1 año: ' + d_anio1.toFixed(6));
console.log(' 5 años: ' + d_anio5.toFixed(6));
verificar_verdadero(d_anio1 < d_anio5, 'Años: 1 año < 5 años');

const sig0 = reloj.espines_por_escala('siglos', t0);
const sig100 = reloj.espines_por_escala('siglos', t_100a);
const sig1000 = reloj.espines_por_escala('siglos', t_1000a);

const d_sig100 = distancia_ramilletes(sig0, sig100);
const d_sig1000 = distancia_ramilletes(sig0, sig1000);

console.log('Escala siglos (eje_terrestre):');
console.log(' 100 años: ' + d_sig100.toFixed(6));
console.log(' 1000 años: ' + d_sig1000.toFixed(6));
verificar_verdadero(d_sig100 < d_sig1000, 'Siglos: 100 años < 1000 años');

// 6. Distancia espacial
console.log('\n=== 6. Distancia espacial ===');
const reloj_ba2 = new RelojAstronomico(-34.6, -58.4);
const reloj_mad2 = new RelojAstronomico(40.4, -3.7);
const reloj_sidney2 = new RelojAstronomico(-33.9, 151.2);

const esp_ba2 = reloj_ba2.espines(t0);
const esp_mad2 = reloj_mad2.espines(t0);
const esp_sidney2 = reloj_sidney2.espines(t0);

const dist_ct_ba_mad = distancia_por_nombre(esp_ba2, esp_mad2, 'centro_tierra');
const dist_ct_ba_sid = distancia_por_nombre(esp_ba2, esp_sidney2, 'centro_tierra');

console.log('Distancia centro_tierra BA ↔ Madrid: ' + dist_ct_ba_mad.toFixed(6));
console.log('Distancia centro_tierra BA ↔ Sidney: ' + dist_ct_ba_sid.toFixed(6));

verificar_verdadero(dist_ct_ba_mad > 0, 'Distancia espacial Madrid > 0');
verificar_verdadero(dist_ct_ba_sid > 0, 'Distancia espacial Sidney > 0');

// 7. Método espin()
console.log('\n=== 7. Método espin() ===');
const sol = reloj.espin('sol', t0);
verificar_no_nulo(sol, "espin('sol') retorna espin");
verificar_iguales(sol.nombre, 'sol', "Nombre 'sol'");
verificar_iguales(magnitud_vector(sol.vector), 1.0, 'Vector unitario', 1e-6);
const marte = reloj.espin('marte', t0);
verificar_falso(marte !== null, "espin('marte') devuelve null");

// 8. Determinismo
console.log('\n=== 8. Determinismo ===');
const reloj2 = new RelojAstronomico(lat, lon);
const esp2 = reloj2.espines(t0);
verificar_iguales(JSON.stringify(esp2), JSON.stringify(espines), 'Dos relojes generan el mismo ramillete');

console.log('\n══════════════════════════════════');
console.log(' PRUEBAS 1.5.2 FINALIZADAS');
console.log('══════════════════════════════════');

RelojAstronomico.imprimir_alertas();
RelojAstronomico.imprimir_errores();