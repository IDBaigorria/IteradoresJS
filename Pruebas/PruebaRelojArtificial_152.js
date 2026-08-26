/**
 * Pruebas exhaustivas v1.5.2 – RelojArtificial (Plano Rítmico UTC)
 *
 * Cubre:
 *   - Instanciación y estructura del ramillete.
 *   - Unitariedad de vectores.
 *   - Caché por tiempo_unix.
 *   - Independencia de la ubicación geográfica.
 *   - Distancia temporal por escalas (segundos, minutos, horas, días,
 *     semanas, meses, años, décadas, siglos, milenios).
 *   - Agregar/eliminar ciclos y descubrimiento automático.
 *   - Método espin() y determinismo.
 *
 * @since 1.5.2
 * @version 1.5.2
 * @author Ignacio David Baigorria
 */
import { Conf } from '../Configuracion/Configuracion.js';
import { RelojArtificial } from '../Tiempo/RelojArtificial.js';

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

console.log('══════════════════════════════════');
console.log(' PRUEBAS 1.5.2 – RELOJ ARTIFICIAL');
console.log('══════════════════════════════════\n');

// 1. Instanciación y ramillete
console.log('=== 1. Instanciación y ramillete básico ===');
const reloj = new RelojArtificial();
const tiempo_base = Math.floor(Date.UTC(2026, 6, 15, 12, 0, 0) / 1000);
const espines = reloj.espines(tiempo_base);

verificar_no_nulo(espines, 'espines() retorna un array');
verificar_verdadero(Array.isArray(espines), 'espines() es array');
verificar_iguales(espines.length, Object.keys(Conf.RELOJ_CICLOS_RITMICOS).length, 'Cantidad de espines coincide con ciclos registrados');

const nombres_obtenidos = espines.map(e => e.nombre);
for (const nombre of Object.keys(Conf.RELOJ_CICLOS_RITMICOS)) {
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

// 4. Independencia de ubicación
console.log('\n=== 4. Independencia de ubicación ===');
const reloj_ba = new RelojArtificial();
const reloj_mad = new RelojArtificial();
const esp_ba = reloj_ba.espines(tiempo_base);
const esp_mad = reloj_mad.espines(tiempo_base);
verificar_iguales(JSON.stringify(esp_ba), JSON.stringify(esp_mad), 'Ramilletes idénticos para distintas instancias');

// 5. Distancia temporal por escala
console.log('\n=== 5. Distancia temporal por escala ===');
const t0 = tiempo_base;

// Escala segundos (minuto)
const s0  = reloj.espines_por_escala('segundos', t0);
const s1  = reloj.espines_por_escala('segundos', t0 + 1);
const s10 = reloj.espines_por_escala('segundos', t0 + 10);
const s20 = reloj.espines_por_escala('segundos', t0 + 20);

const d_s1  = distancia_ramilletes(s0, s1);
const d_s10 = distancia_ramilletes(s0, s10);
const d_s20 = distancia_ramilletes(s0, s20);

console.log('Escala segundos (minuto):');
console.log(' 1 s: ' + d_s1.toFixed(6));
console.log(' 10 s: ' + d_s10.toFixed(6));
console.log(' 20 s: ' + d_s20.toFixed(6));
verificar_verdadero(d_s1 < d_s10, 'Segundos: 1 s < 10 s');
verificar_verdadero(d_s10 < d_s20, 'Segundos: 10 s < 20 s');

// Escala minutos (hora)
const m0  = reloj.espines_por_escala('minutos', t0);
const m1  = reloj.espines_por_escala('minutos', t0 + 60);
const m10 = reloj.espines_por_escala('minutos', t0 + 600);
const m20 = reloj.espines_por_escala('minutos', t0 + 1200);

const d_m1  = distancia_ramilletes(m0, m1);
const d_m10 = distancia_ramilletes(m0, m10);
const d_m20 = distancia_ramilletes(m0, m20);

console.log('Escala minutos (hora):');
console.log(' 1 min: ' + d_m1.toFixed(6));
console.log(' 10 min: ' + d_m10.toFixed(6));
console.log(' 20 min: ' + d_m20.toFixed(6));
verificar_verdadero(d_m1 < d_m10, 'Minutos: 1 min < 10 min');
verificar_verdadero(d_m10 < d_m20, 'Minutos: 10 min < 20 min');

// Escala horas (dia_noche)
const h0  = reloj.espines_por_escala('horas', t0);
const h1  = reloj.espines_por_escala('horas', t0 + 3600);
const h6  = reloj.espines_por_escala('horas', t0 + 21600);
const h12 = reloj.espines_por_escala('horas', t0 + 43200);

const d_h1  = distancia_ramilletes(h0, h1);
const d_h6  = distancia_ramilletes(h0, h6);
const d_h12 = distancia_ramilletes(h0, h12);

console.log('Escala horas (dia_noche):');
console.log(' 1 h: ' + d_h1.toFixed(6));
console.log(' 6 h: ' + d_h6.toFixed(6));
console.log(' 12 h: ' + d_h12.toFixed(6));
verificar_verdadero(d_h1 < d_h6, 'Horas: 1 h < 6 h');
verificar_verdadero(d_h6 < d_h12, 'Horas: 6 h < 12 h');

// Escala días (semana)
const d0  = reloj.espines_por_escala('dias', t0);
const d1  = reloj.espines_por_escala('dias', t0 + 86400);
const d2  = reloj.espines_por_escala('dias', t0 + 172800);
const d3  = reloj.espines_por_escala('dias', t0 + 259200);

const d_d1 = distancia_ramilletes(d0, d1);
const d_d2 = distancia_ramilletes(d0, d2);
const d_d3 = distancia_ramilletes(d0, d3);

console.log('Escala días (semana):');
console.log(' 1 d: ' + d_d1.toFixed(6));
console.log(' 2 d: ' + d_d2.toFixed(6));
console.log(' 3 d: ' + d_d3.toFixed(6));
verificar_verdadero(d_d1 < d_d2, 'Días: 1 d < 2 d');
verificar_verdadero(d_d2 < d_d3, 'Días: 2 d < 3 d');

// Escala semanas (mes)
const w0  = reloj.espines_por_escala('semanas', t0);
const w1  = reloj.espines_por_escala('semanas', t0 + 604800);
const w2  = reloj.espines_por_escala('semanas', t0 + 1209600);

const d_w1 = distancia_ramilletes(w0, w1);
const d_w2 = distancia_ramilletes(w0, w2);

console.log('Escala semanas (mes):');
console.log(' 1 sem: ' + d_w1.toFixed(6));
console.log(' 2 sem: ' + d_w2.toFixed(6));
verificar_verdadero(d_w1 < d_w2, 'Semanas: 1 sem < 2 sem');

// Escala meses (anno)
const me0  = reloj.espines_por_escala('meses', t0);
const me1  = reloj.espines_por_escala('meses', t0 + 2592000);
const me2  = reloj.espines_por_escala('meses', t0 + 5184000);
const me3  = reloj.espines_por_escala('meses', t0 + 7776000);

const d_me1 = distancia_ramilletes(me0, me1);
const d_me2 = distancia_ramilletes(me0, me2);
const d_me3 = distancia_ramilletes(me0, me3);

console.log('Escala meses (anno):');
console.log(' 1 mes: ' + d_me1.toFixed(6));
console.log(' 2 meses: ' + d_me2.toFixed(6));
console.log(' 3 meses: ' + d_me3.toFixed(6));
verificar_verdadero(d_me1 < d_me2, 'Meses: 1 mes < 2 meses');
verificar_verdadero(d_me2 < d_me3, 'Meses: 2 meses < 3 meses');

// Escala años (ciclo_128)
const a0  = reloj.espines_por_escala('anios', t0);
const a1  = reloj.espines_por_escala('anios', t0 + 31557600);
const a5  = reloj.espines_por_escala('anios', t0 + 157788000);
const a10 = reloj.espines_por_escala('anios', t0 + 315576000);

const d_a1  = distancia_ramilletes(a0, a1);
const d_a5  = distancia_ramilletes(a0, a5);
const d_a10 = distancia_ramilletes(a0, a10);

console.log('Escala años (ciclo_128):');
console.log(' 1 año: ' + d_a1.toFixed(6));
console.log(' 5 años: ' + d_a5.toFixed(6));
console.log(' 10 años: ' + d_a10.toFixed(6));
verificar_verdadero(d_a1 < d_a5, 'Años: 1 año < 5 años');
verificar_verdadero(d_a5 < d_a10, 'Años: 5 años < 10 años');

// Escala décadas (ciclo_siglo)
const dec0  = reloj.espines_por_escala('decadas', t0);
const dec10 = reloj.espines_por_escala('decadas', t0 + 315576000);
const dec20 = reloj.espines_por_escala('decadas', t0 + 631152000);
const dec30 = reloj.espines_por_escala('decadas', t0 + 946728000);

const d_dec10 = distancia_ramilletes(dec0, dec10);
const d_dec20 = distancia_ramilletes(dec0, dec20);
const d_dec30 = distancia_ramilletes(dec0, dec30);

console.log('Escala décadas (ciclo_siglo):');
console.log(' 10 años: ' + d_dec10.toFixed(6));
console.log(' 20 años: ' + d_dec20.toFixed(6));
console.log(' 30 años: ' + d_dec30.toFixed(6));
verificar_verdadero(d_dec10 < d_dec20, 'Décadas: 10 años < 20 años');
verificar_verdadero(d_dec20 < d_dec30, 'Décadas: 20 años < 30 años');

// Escala siglos (ciclo_milenio)
const sig0   = reloj.espines_por_escala('siglos', t0);
const sig100 = reloj.espines_por_escala('siglos', t0 + 3155760000);
const sig200 = reloj.espines_por_escala('siglos', t0 + 6311520000);
const sig300 = reloj.espines_por_escala('siglos', t0 + 9467280000);

const d_sig100 = distancia_ramilletes(sig0, sig100);
const d_sig200 = distancia_ramilletes(sig0, sig200);
const d_sig300 = distancia_ramilletes(sig0, sig300);

console.log('Escala siglos (ciclo_milenio):');
console.log(' 100 años: ' + d_sig100.toFixed(6));
console.log(' 200 años: ' + d_sig200.toFixed(6));
console.log(' 300 años: ' + d_sig300.toFixed(6));
verificar_verdadero(d_sig100 < d_sig200, 'Siglos: 100 años < 200 años');
verificar_verdadero(d_sig200 < d_sig300, 'Siglos: 200 años < 300 años');

// Escala milenios (ciclo_precesion)
const mil0    = reloj.espines_por_escala('milenios', t0);
const mil1000 = reloj.espines_por_escala('milenios', t0 + 31557600000);
const mil2000 = reloj.espines_por_escala('milenios', t0 + 63115200000);
const mil3000 = reloj.espines_por_escala('milenios', t0 + 94672800000);

const d_mil1000 = distancia_ramilletes(mil0, mil1000);
const d_mil2000 = distancia_ramilletes(mil0, mil2000);
const d_mil3000 = distancia_ramilletes(mil0, mil3000);

console.log('Escala milenios (ciclo_precesion):');
console.log(' 1000 años: ' + d_mil1000.toFixed(6));
console.log(' 2000 años: ' + d_mil2000.toFixed(6));
console.log(' 3000 años: ' + d_mil3000.toFixed(6));
verificar_verdadero(d_mil1000 < d_mil2000, 'Milenios: 1000 años < 2000 años');
verificar_verdadero(d_mil2000 < d_mil3000, 'Milenios: 2000 años < 3000 años');

// 6. Agregar y eliminar ciclos
console.log('\n=== 6. Agregar y eliminar ciclos ===');
const reloj_mod = new RelojArtificial();
const esp_antes = reloj_mod.espines(t0);

reloj_mod.agregar_ciclo('siesta', 3600.0, 0.0, 2.5, 'Ritmo');
const esp_despues = reloj_mod.espines(t0);

verificar_verdadero(esp_despues.length === esp_antes.length + 1, 'agregar_ciclo agrega un espin');
verificar_verdadero(
    Object.prototype.hasOwnProperty.call(reloj_mod.ciclos_registrados(), 'siesta'),
    'El nuevo ciclo aparece registrado'
);

reloj_mod.eliminar_ciclo('siesta');
const esp_final = reloj_mod.espines(t0);
verificar_iguales(esp_final.length, esp_antes.length, 'eliminar_ciclo restaura cantidad original');

// 7. Descubrir ciclo
console.log('\n=== 7. Descubrir ciclo ===');
const reloj_desc = new RelojArtificial();
const periodo_desc = 7200.0;
const tiempo_referencia = t0;
reloj_desc.descubrir_ciclo('ritmo_2h', periodo_desc, tiempo_referencia, 1.0);

const espin_desc = reloj_desc.espin('ritmo_2h', tiempo_referencia);
verificar_no_nulo(espin_desc, 'descubrir_ciclo crea un espin');
verificar_iguales(espin_desc.tipo, 'RitmoDescubierto', "El tipo del ciclo descubierto es 'RitmoDescubierto'");

// 8. Método espin()
console.log('\n=== 8. Método espin() ===');
const espin_hora = reloj.espin('hora', t0);
verificar_no_nulo(espin_hora, "espin('hora') retorna espin");
verificar_iguales(espin_hora.nombre, 'hora', 'Nombre correcto');
verificar_iguales(magnitud_vector(espin_hora.vector), 1.0, 'Vector unitario', 1e-6);

const espin_invalido = reloj.espin('no_existe', t0);
verificar_falso(espin_invalido !== null, "espin('no_existe') devuelve null");

// 9. Determinismo
console.log('\n=== 9. Determinismo ===');
const reloj2 = new RelojArtificial();
const esp2 = reloj2.espines(t0);
verificar_iguales(JSON.stringify(esp2), JSON.stringify(espines), 'Dos relojes generan el mismo ramillete');

console.log('\n══════════════════════════════════');
console.log(' PRUEBAS 1.5.2 FINALIZADAS');
console.log('══════════════════════════════════');

RelojArtificial.imprimir_alertas();
RelojArtificial.imprimir_errores();