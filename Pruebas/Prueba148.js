/**
 * Pruebas exhaustivas v1.4.8 – Nuevas Antenas y Señal (JavaScript)
 *
 * Cubre: Senal, AntenaComun, AntenaDeMarcado, AntenaTraduccion,
 *        aprendizaje trivial bidireccional, multifase, validación de marcado,
 *        y almacenamiento de señales completas.
 *
 * @since 1.4.8
 * @version 1.4.8
 * @author Ignacio David Baigorria
 */
import { Controlador } from '../Controlador/Controlador.js';
import { Conf, Entorno } from '../Configuracion/index.js';
import { Matriz2x2 } from '../Nodos/Matriz2x2.js';
import { NodoElectrico } from '../Nodos/NodoElectrico.js';
import { NodoNumerico } from '../Nodos/NodoNumerico.js';
import { NodoPrimo } from '../Nodos/NodoPrimo.js';
import { Senal } from '../Iteradores/Senal.js';
import { AntenaComun } from '../Iteradores/AntenaComun.js';
import { AntenaDeMarcado } from '../Iteradores/AntenaDeMarcado.js';
import { AntenaTraduccion } from '../Controlador/AntenaTraduccion.js';

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
console.log(' PRUEBAS 1.4.8 – NUEVAS ANTENAS Y SEÑAL');
console.log('══════════════════════════════════\n');

// Inicializar caché de primos para las traducciones
NodoNumerico.inicializar_cache_primos();

Controlador.ejecutar_prueba(function (token) {
    // ═══════════════════════════════════════════
    // 1. PRUEBAS DE Senal
    // ═══════════════════════════════════════════
    console.log('=== 1. Señal (Senal) ===');

    console.log('--- 1.1 Creación con valores predeterminados:');
    const senal_vacia = new Senal();
    verificar_iguales(senal_vacia.longitud(), 0, 'Señal vacía tiene longitud 0');
    verificar_iguales(senal_vacia.fase_origen(), '', 'Fase origen vacía por defecto');
    verificar_falso(senal_vacia.marcado(), 'Marcado es false por defecto');

    console.log('--- 1.2 Creación con parámetros:');
    const m1 = Matriz2x2.crear_prima(2);
    const m2 = Matriz2x2.crear_prima(3);
    const senal = new Senal([m1, m2], 'Talamo:0', true);
    verificar_iguales(senal.longitud(), 2, 'Longitud 2 con matrices iniciales');
    verificar_iguales(senal.fase_origen(), 'Talamo:0', 'Fase origen correcta');
    verificar_verdadero(senal.marcado(), 'Marcado true cuando se indica');

    console.log('--- 1.3 Acceso a matrices (copia defensiva):');
    let matrices = senal.matrices();
    verificar_iguales(matrices.length, 2, 'matrices() devuelve array de 2');
    verificar_verdadero(matrices[0].es_igual(m1), 'Primera matriz correcta');
    verificar_verdadero(matrices[1].es_igual(m2), 'Segunda matriz correcta');
    // Verificar que modificar el array devuelto no afecta a la señal
    matrices[0] = Matriz2x2.inicial();
    verificar_verdadero(senal.matrices()[0].es_igual(m1), 'La señal original no se modifica');

    console.log('--- 1.4 Señal común (marcado false):');
    const senal_comun = new Senal([m1], 'Test:1', false);
    verificar_falso(senal_comun.marcado(), 'Señal común tiene marcado false');

    console.log('--- 1.5 Inmutabilidad tras construcción:');
    const senal_fija = new Senal([Matriz2x2.crear_prima(5)], 'Fijo:0', true);
    verificar_iguales(senal_fija.longitud(), 1, 'Longitud inicial 1');
    verificar_iguales(senal_fija.fase_origen(), 'Fijo:0', 'Fase inicial Fijo:0');
    verificar_verdadero(senal_fija.marcado(), 'Marcado inicial true');

    // ═══════════════════════════════════════════
    // 2. PRUEBAS DE AntenaComun
    // ═══════════════════════════════════════════
    console.log('\n=== 2. AntenaComun ===');

    // Singleton
    console.log('--- 2.1 Singleton:');
    const ac1 = AntenaComun.antena();
    const ac2 = AntenaComun.antena();
    verificar_verdadero(ac1 === ac2, 'antena() devuelve la misma instancia');

    // reiniciar solo en pruebas (asumimos entorno de pruebas activo)
    console.log('--- 2.2 reiniciar en entorno de pruebas:');
    AntenaComun.reiniciar();
    const ac3 = AntenaComun.antena();
    verificar_falso(ac1 === ac3, 'Tras reiniciar, se obtiene una nueva instancia');

    // Configurar fase para las pruebas de recepción/emisión
    const fase_test = 'Test:0';
    NodoElectrico._fase(token, fase_test);

    console.log('--- 2.3 Recibir señal común (aprendizaje trivial):');
    const antena_comun = AntenaComun.antena();
    const matriz_a = Matriz2x2.crear_prima(101);
    const senal_a = new Senal([matriz_a], 'Talamo:0', false);
    const nodo_a = antena_comun.recibir(senal_a);
    verificar_no_nulo(nodo_a, 'recibir() devuelve nodo tras aprendizaje trivial');
    verificar_verdadero(nodo_a.es_primo(), 'El nodo aprendido es un NodoPrimo');
    verificar_verdadero(nodo_a.dato('contenido') instanceof Senal, 'El contenido del nodo es una Señal');
    verificar_verdadero(nodo_a.dato('contenido') === senal_a, 'El contenido es la misma señal recibida');

    console.log('--- 2.4 Recibir la misma matriz de nuevo (sin modificar contenido):');
    const senal_a2 = new Senal([matriz_a], 'Talamo:0', false);
    const nodo_a2 = antena_comun.recibir(senal_a2);
    verificar_verdadero(nodo_a2 === nodo_a, 'Devuelve el mismo nodo para la misma matriz');
    verificar_verdadero(nodo_a2.dato('contenido') === senal_a, 'El contenido sigue siendo la señal original (no se actualiza)');

    console.log('--- 2.5 Recibir señal marcada (debe ignorar):');
    const senal_marcada = new Senal([matriz_a], 'Talamo:0', true);
    const nodo_ignorado = antena_comun.recibir(senal_marcada);
    verificar_falso(nodo_ignorado !== null, 'recibir() retorna null para señal marcada');

    console.log('--- 2.6 Emitir NodoPrimo (aprendido):');
    const senal_emitida = antena_comun.emitir(nodo_a, 'Talamo:1');
    verificar_no_nulo(senal_emitida, 'emitir() con NodoPrimo devuelve señal');
    verificar_verdadero(senal_emitida.marcado() === false, 'La señal emitida es común');
    verificar_verdadero(senal_emitida === senal_a, 'La señal emitida es exactamente la almacenada en contenido');

    console.log('--- 2.7 Emitir nodo compuesto (no primo):');
    const p_x = NodoNumerico.crear_primo(307);
    const p_y = NodoNumerico.crear_primo(311);
    const nodo_compuesto = NodoNumerico.crear_numerico([p_x, p_y]);
    verificar_no_nulo(nodo_compuesto, 'Nodo compuesto creado');
    verificar_falso(nodo_compuesto.es_primo(), 'El nodo compuesto no es primo');

    const senal_comp = antena_comun.emitir(nodo_compuesto, 'Talamo:1');
    verificar_no_nulo(senal_comp, 'emitir() con nodo compuesto devuelve señal');
    verificar_iguales(senal_comp.longitud(), 1, 'Señal de una matriz (identidad del compuesto)');
    verificar_verdadero(senal_comp.matrices()[0].es_igual(nodo_compuesto.identidad()), 'La matriz es la identidad del compuesto');
    verificar_falso(nodo_compuesto.dato('contenido') instanceof Senal, 'El nodo compuesto NO tiene contenido guardado');

    console.log('--- 2.8 Multifase (cambio de fase global):');
    const otra_fase = 'Otra:1';
    NodoElectrico._fase(token, otra_fase);
    const matriz_b = Matriz2x2.crear_prima(202);
    const senal_b = new Senal([matriz_b], 'Talamo:0', false);
    const nodo_b = antena_comun.recibir(senal_b);
    verificar_no_nulo(nodo_b, 'Aprendizaje en otra fase crea nodo');
    verificar_verdadero(nodo_b !== nodo_a, 'Nodo distinto al de la fase anterior');
    // Volver a la fase original y verificar que el nodo a sigue ahí
    NodoElectrico._fase(token, fase_test);
    const nodo_a_otravez = antena_comun.recibir(new Senal([matriz_a], 'Talamo:0', false));
    verificar_verdadero(nodo_a_otravez === nodo_a, 'En la fase original, el nodo aprendido sigue siendo el mismo');

    // Limpiar singleton para las siguientes pruebas
    AntenaComun.reiniciar();

    // ═══════════════════════════════════════════
    // 3. PRUEBAS DE AntenaDeMarcado
    // ═══════════════════════════════════════════
    console.log('\n=== 3. AntenaDeMarcado ===');

    console.log('--- 3.1 Singleton:');
    const adm1 = AntenaDeMarcado.antena();
    const adm2 = AntenaDeMarcado.antena();
    verificar_verdadero(adm1 === adm2, 'antena() devuelve la misma instancia');

    AntenaDeMarcado.reiniciar();
    const adm3 = AntenaDeMarcado.antena();
    verificar_falso(adm1 === adm3, 'Tras reiniciar, nueva instancia');

    // Volver a la fase test
    NodoElectrico._fase(token, fase_test);

    console.log('--- 3.2 Recibir señal marcada (aprendizaje trivial):');
    const antena_marcado = AntenaDeMarcado.antena();
    const senal_m1 = new Senal([Matriz2x2.crear_prima(501)], 'Origen:0', true);
    const nodo_m1 = antena_marcado.recibir(senal_m1);
    verificar_no_nulo(nodo_m1, 'recibir() señal marcada crea nodo marcador');
    verificar_verdadero(nodo_m1.es_primo(), 'Es un NodoPrimo');
    verificar_verdadero(nodo_m1.dato('contenido') === senal_m1, 'Contenido es la señal completa');

    console.log('--- 3.3 Recibir otra señal en el mismo par (sobrescribir contenido):');
    const senal_m2 = new Senal([Matriz2x2.crear_prima(502), Matriz2x2.crear_prima(503)], 'Origen:0', true);
    const nodo_m2 = antena_marcado.recibir(senal_m2);
    verificar_verdadero(nodo_m2 === nodo_m1, 'Mismo nodo marcador para el mismo par');
    verificar_verdadero(nodo_m2.dato('contenido') === senal_m2, 'Contenido actualizado a la nueva señal');

    console.log('--- 3.4 Recibir señal común (ignorar):');
    const senal_comun_m = new Senal([Matriz2x2.crear_prima(601)], 'Origen:0', false);
    const nodo_ignorado_m = antena_marcado.recibir(senal_comun_m);
    verificar_falso(nodo_ignorado_m !== null, 'Señal común devuelve null');

    console.log('--- 3.5 Emitir desde nodo marcador:');
    const senal_emitida_m = antena_marcado.emitir(nodo_m2, 'Destino:0');
    verificar_no_nulo(senal_emitida_m, 'emitir() devuelve señal');
    verificar_verdadero(senal_emitida_m === senal_m2, 'La señal emitida es la misma que la última almacenada');
    verificar_verdadero(senal_emitida_m.marcado(), 'La señal emitida es marcada');

    console.log('--- 3.6 Emitir sin contenido (error):');
    const nodo_primo_vacio = NodoPrimo.siguiente_primo_libre();
    nodo_primo_vacio._dato(null, 'contenido'); // borrar contenido
    const sin_contenido = antena_marcado.emitir(nodo_primo_vacio, 'Destino:1');
    verificar_falso(sin_contenido !== null, 'Devuelve null si no hay contenido');

    console.log('--- 3.7 Multifase:');
    NodoElectrico._fase(token, otra_fase);
    const senal_m3 = new Senal([Matriz2x2.crear_prima(701)], 'Origen:0', true);
    const nodo_m3 = antena_marcado.recibir(senal_m3);
    verificar_no_nulo(nodo_m3, 'En otra fase, crea nodo distinto');
    verificar_verdadero(nodo_m3 !== nodo_m2, 'Nodo diferente al de la fase anterior');
    // Volver y verificar que el original sigue
    NodoElectrico._fase(token, fase_test);
    const nodo_m2_otravez = antena_marcado.recibir(new Senal([Matriz2x2.crear_prima(501)], 'Origen:0', true));
    verificar_verdadero(nodo_m2_otravez === nodo_m2, 'En fase original, mismo nodo');

    AntenaDeMarcado.reiniciar();

    // ═══════════════════════════════════════════
    // 4. PRUEBAS DE AntenaTraduccion
    // ═══════════════════════════════════════════
    console.log('\n=== 4. AntenaTraduccion ===');

    console.log('--- 4.1 Constructor y origen:');
    const at = new AntenaTraduccion('Controlador:traduccion_entrada');

    console.log('--- 4.2 emitir() – bytes a señal:');
    const bytes_entrada = 'AB';
    const senal_trad = at.emitir(bytes_entrada);
    verificar_no_nulo(senal_trad, 'emitir() devuelve señal');
    verificar_verdadero(senal_trad.marcado(), 'La señal es de tipo marcado');
    verificar_iguales(senal_trad.fase_origen(), 'Controlador:traduccion_entrada', 'Fase origen coincide con el constructor');
    verificar_iguales(senal_trad.longitud(), 2, 'Longitud 2 para 2 bytes');
    // Verificar que las matrices corresponden a los bytes 'A' y 'B' (65 y 66)
    const primo_a = Conf.PRIMOS_PRECARGADOS['A'.charCodeAt(0)];
    const primo_b = Conf.PRIMOS_PRECARGADOS['B'.charCodeAt(0)];
    verificar_verdadero(senal_trad.matrices()[0].es_igual(Matriz2x2.crear_prima(primo_a)), 'Primera matriz es la del byte A');
    verificar_verdadero(senal_trad.matrices()[1].es_igual(Matriz2x2.crear_prima(primo_b)), 'Segunda matriz es la del byte B');

    console.log('--- 4.3 recibir() – señal a bytes:');
    const bytes_salida = at.recibir(senal_trad);
    verificar_iguales(bytes_salida, 'AB', "recibir() decodifica correctamente a 'AB'");

    console.log('--- 4.4 Traducción completa con caracteres no imprimibles:');
    const bytes_ext = String.fromCharCode(0) + String.fromCharCode(255);
    const senal_ext = at.emitir(bytes_ext);
    verificar_iguales(senal_ext.longitud(), 2, 'Longitud correcta para bytes extremos');
    const bytes_ext_salida = at.recibir(senal_ext);
    verificar_iguales(bytes_ext_salida, bytes_ext, 'Recupera bytes extremos correctamente');

    console.log('--- 4.5 Emisión de cadena vacía:');
    const senal_vacia_emit = at.emitir('');
    verificar_iguales(senal_vacia_emit.longitud(), 0, 'Señal vacía para cadena vacía');

    console.log('--- 4.6 Recepción de señal vacía:');
    const bytes_vacios = at.recibir(new Senal([], '', true));
    verificar_iguales(bytes_vacios, '', 'Cadena vacía para señal sin matrices');
});

console.log('\n══════════════════════════════════');
console.log(' PRUEBAS 1.4.8 FINALIZADAS');
console.log('══════════════════════════════════');
NodoElectrico.imprimir_errores();
NodoElectrico.imprimir_alertas();
