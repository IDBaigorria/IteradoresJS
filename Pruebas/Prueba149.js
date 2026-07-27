/**
 * Pruebas exhaustivas v1.4.9 – Verbos de Acción, AntenaAccion y Traducción
 *
 * Cubre: SenalAccion, AntenaAccion (singleton, multifase, emitir/recibir),
 *        AntenaTraduccionAccion, y constantes de verbos en Conf.
 *
 * @since 1.4.9
 * @version 1.4.9
 * @author Ignacio David Baigorria
 */
import { Controlador } from '../Controlador/Controlador.js';
import { Conf } from '../Configuracion/Configuracion.js';
import { NodoElectrico } from '../Nodos/NodoElectrico.js';
import { SenalAccion } from '../Iteradores/SenalAccion.js';
import { AntenaAccion } from '../Iteradores/AntenaAccion.js';
import { AntenaTraduccionAccion } from '../Controlador/AntenaTraduccionAccion.js';

// ─── Helpers ──────────────────────────────────────────
function verificar_iguales(a, b, mensaje, tolerancia = 1e-9) {
    let ok;
    if (a === b) {
        ok = true;
    } else if (typeof a === 'number' && typeof b === 'number') {
        ok = Math.abs(a - b) < tolerancia;
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

console.log('══════════════════════════════════');
console.log(' PRUEBAS 1.4.9 – VERBOS DE ACCIÓN Y ANTENAS');
console.log('══════════════════════════════════\n');

Controlador.ejecutar_prueba(function (token) {
    // ═══════════════════════════════════
    // 1. PRUEBAS DE CONSTANTES DE VERBOS
    // ═══════════════════════════════════
    console.log('=== 1. Constantes de Verbos en Conf ===');
    verificar_iguales(Conf.VERBO_CIERRE, 0, 'VERBO_CIERRE = 0');
    verificar_iguales(Conf.VERBO_APRENDER, 1, 'VERBO_APRENDER = 1');
    verificar_iguales(Conf.VERBO_EJECUTAR, 2, 'VERBO_EJECUTAR = 2');
    verificar_iguales(Conf.VERBO_CONTROLAR, 3, 'VERBO_CONTROLAR = 3');
    verificar_iguales(Conf.VERBO_CORREGIR, 4, 'VERBO_CORREGIR = 4');
    verificar_iguales(Conf.VERBO_PREDECIR, 5, 'VERBO_PREDECIR = 5');
    verificar_iguales(Conf.VERBO_IMAGINAR, 6, 'VERBO_IMAGINAR = 6');
    verificar_iguales(Conf.VERBO_SUPERVISAR, 7, 'VERBO_SUPERVISAR = 7');

    // ═══════════════════════════════════
    // 2. PRUEBAS DE SenalAccion
    // ═══════════════════════════════════
    console.log('\n=== 2. SenalAccion ===');

    console.log('--- 2.1 Creación con verbo y fase:');
    const senal = new SenalAccion(Conf.VERBO_APRENDER, 'Talamo:0');
    verificar_iguales(senal.verbo(), Conf.VERBO_APRENDER, 'verbo() retorna VERBO_APRENDER');
    verificar_iguales(senal.fase_origen(), 'Talamo:0', 'fase_origen() correcta');

    console.log('--- 2.2 Verbo de cierre:');
    const senal_cierre = new SenalAccion(Conf.VERBO_CIERRE, 'Origen:1');
    verificar_iguales(senal_cierre.verbo(), 0, 'verbo() retorna 0 para cierre');

    console.log('--- 2.3 Inmutabilidad:');
    const verbo_inicial = senal.verbo();
    const fase_inicial = senal.fase_origen();
    verificar_iguales(senal.verbo(), verbo_inicial, 'verbo() no cambia');
    verificar_iguales(senal.fase_origen(), fase_inicial, 'fase_origen() no cambia');

    // ═══════════════════════════════════
    // 3. PRUEBAS DE AntenaAccion
    // ═══════════════════════════════════
    console.log('\n=== 3. AntenaAccion ===');

    // Singleton
    console.log('--- 3.1 Singleton:');
    const aa1 = AntenaAccion.antena();
    const aa2 = AntenaAccion.antena();
    verificar_verdadero(aa1 === aa2, 'antena() devuelve la misma instancia');

    // reiniciar solo en pruebas
    console.log('--- 3.2 reiniciar:');
    AntenaAccion.reiniciar();
    const aa3 = AntenaAccion.antena();
    verificar_falso(aa1 === aa3, 'Tras reiniciar, nueva instancia');
    AntenaAccion.reiniciar(); // limpiar

    // Configurar fase
    const fase_test = 'Test:0';
    NodoElectrico._fase(token, fase_test);

    console.log('--- 3.3 emitir con verbo:');
    const antena = AntenaAccion.antena();
    const senal_emitida = antena.emitir(Conf.VERBO_APRENDER);
    verificar_no_nulo(senal_emitida, 'emitir() con verbo retorna SenalAccion');
    verificar_iguales(senal_emitida.verbo(), Conf.VERBO_APRENDER, 'verbo en señal emitida es VERBO_APRENDER');
    verificar_iguales(senal_emitida.fase_origen(), fase_test, 'fase_origen es la fase actual');

    console.log('--- 3.4 emitir sin verbo (acción actual):');
    const senal_actual = antena.emitir();
    verificar_no_nulo(senal_actual, 'emitir() sin verbo retorna acción actual');
    verificar_verdadero(senal_actual === senal_emitida, 'La acción actual es la última emitida');

    console.log('--- 3.5 emitir con verbo de cierre:');
    const senal_cierre_emitida = antena.emitir(Conf.VERBO_CIERRE);
    verificar_iguales(senal_cierre_emitida.verbo(), 0, 'emitir(CIERRE) crea señal con verbo 0');

    console.log('--- 3.6 recibir señal de acción:');
    const senal_recibida = new SenalAccion(Conf.VERBO_CONTROLAR, 'Otro:1');
    const verbo_retornado = antena.recibir(senal_recibida);
    verificar_iguales(verbo_retornado, Conf.VERBO_CONTROLAR, 'recibir() retorna el verbo correcto');
    const nueva_actual = antena.emitir();
    verificar_verdadero(nueva_actual === senal_recibida, 'Acción actual actualizada a la recibida');

    console.log('--- 3.7 recibir verbo de cierre:');
    const senal_cierre_rec = new SenalAccion(Conf.VERBO_CIERRE, 'Otro:1');
    const verbo_cierre = antena.recibir(senal_cierre_rec);
    verificar_iguales(verbo_cierre, 0, 'recibir() de cierre retorna 0');
    verificar_verdadero(antena.emitir() === senal_cierre_rec, 'Acción actual es la señal de cierre');

    console.log('--- 3.8 Multifase (cambio de fase):');
    const otra_fase = 'Otra:1';
    NodoElectrico._fase(token, otra_fase);
    const senal_otra = antena.emitir(Conf.VERBO_EJECUTAR);
    verificar_iguales(senal_otra.fase_origen(), otra_fase, 'Señal en otra fase tiene su fase_origen');
    verificar_iguales(senal_otra.verbo(), Conf.VERBO_EJECUTAR, 'Verbo correcto en otra fase');
    // volver a la fase original
    NodoElectrico._fase(token, fase_test);
    const senal_fase_orig = antena.emitir();
    verificar_verdadero(senal_fase_orig === senal_cierre_rec, 'Acción actual de fase original no fue alterada');

    // ═══════════════════════════════════
    // 4. PRUEBAS DE AntenaTraduccionAccion
    // ═══════════════════════════════════
    console.log('\n=== 4. AntenaTraduccionAccion ===');

    console.log('--- 4.1 Constructor y traducción a señal:');
    const traductor = new AntenaTraduccionAccion('Controlador:accion');
    const senal_trad = traductor.traducir_a_senal(Conf.VERBO_PREDECIR);
    verificar_no_nulo(senal_trad, 'traducir_a_senal() retorna SenalAccion');
    verificar_iguales(senal_trad.verbo(), Conf.VERBO_PREDECIR, 'Verbo correcto');
    verificar_iguales(senal_trad.fase_origen(), 'Controlador:accion', 'Fase origen coincide con constructor');

    console.log('--- 4.2 Traducción a verbo:');
    const senal_rec = new SenalAccion(Conf.VERBO_IMAGINAR, 'Origen:2');
    const verbo = traductor.traducir_a_verbo(senal_rec);
    verificar_iguales(verbo, Conf.VERBO_IMAGINAR, 'traducir_a_verbo() extrae verbo correcto');

    console.log('--- 4.3 Traducción de cierre:');
    const senal_cierre_trad = traductor.traducir_a_senal(Conf.VERBO_CIERRE);
    verificar_iguales(senal_cierre_trad.verbo(), 0, 'Traducción de CIERRE a señal con verbo 0');
    const verbo_cierre_trad = traductor.traducir_a_verbo(senal_cierre_trad);
    verificar_iguales(verbo_cierre_trad, 0, 'Traducción inversa de cierre a 0');
});

console.log('\n══════════════════════════════════');
console.log(' PRUEBAS 1.4.9 FINALIZADAS');
console.log('══════════════════════════════════');
NodoElectrico.imprimir_errores();
NodoElectrico.imprimir_alertas();