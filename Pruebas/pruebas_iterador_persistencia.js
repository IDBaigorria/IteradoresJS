/**
 * Pruebas exhaustivas v1.5i.4 – Persistencia del Iterador
 *
 * @since 1.0
 * @version 1.5i.4
 */
import { Controlador } from '../Controlador/Controlador.js';
import { Nodo } from '../Nodos/Nodo.js';
import { Iterador } from '../Iteradores/Iterador.js';

function verificar_iguales(a, b, mensaje, tolerancia = 1e-9) {
    let ok;
    if (a === b) {
        ok = true;
    } else if (String(a) === String(b)) {
        // Los datos del framework viajan como strings (consistencia
        // con SQL/JSON en PHP). Aceptamos que "2" y 2 sean
        // equivalentes a nivel de test.
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
console.log(' PRUEBAS v1.5i.4 – PERSISTENCIA DEL ITERADOR');
console.log('══════════════════════════════════\n');

(async () => {
    try {
        await Controlador.ejecutar_prueba(async function (token) {
    // Cambiar método a SQL (IndexedDB en realidad ya está activo por defecto)
    Controlador.establecer_metodo('IndexedDB');

    // 1. Crear lista enlazada 0→1→2→3→4
    const nodos = [];
    for (let i = 0; i < 5; i++) {
        nodos.push(Nodo.crear_con_dato(i));
    }
    for (let i = 0; i < 4; i++) {
        nodos[i]._adyacente_en(nodos[i + 1], 'siguiente');
    }

    // 2. Crear iterador apuntando al nodo 0
    const nombre_iter = 'iter_persistencia';
    const iter = Iterador.crear(nombre_iter, nodos[0]);
    verificar_no_nulo(iter, 'Iterador creado');
    verificar_iguales(iter.dato(), 0, 'dato inicial es 0');

    // 3. Avanzar dos posiciones por 'siguiente'
    const actual = iter.avanzar('siguiente;siguiente');
    verificar_no_nulo(actual, 'avanzar devuelve nodo');
    verificar_iguales(actual.dato(), 2, 'tras avanzar 2, dato actual es 2');

    // 3.1 Desocupar el iterador antes de guardar (conserva posición actual)
    verificar_verdadero(iter.desocupar(), 'desocupar iterador antes de guardar');

    // 4. Guardar superestructura
    const guardado = await Controlador.guardar('persistencia_iterador_test');
    verificar_verdadero(guardado, 'guardar superestructura devuelve true');

    // 5. Cargar superestructura guardada
    const cargado = await Controlador.cargar('persistencia_iterador_test');
    verificar_verdadero(cargado, 'cargar superestructura devuelve true');

    // 6. Recuperar iterador cargado
    const iter_cargado = Iterador.cargar(nombre_iter);
    verificar_no_nulo(iter_cargado, 'iterador cargado correctamente');

    // 7. Verificar posición actual
    const actual_cargado = iter_cargado.actual();
    verificar_no_nulo(actual_cargado, 'nodo actual no nulo');
    verificar_iguales(actual_cargado.dato(), 2, 'dato del nodo actual es 2');
    verificar_iguales(iter_cargado.dato(), 2, 'método dato() devuelve 2');

    // 8. Verificar enlace siguiente desde actual
    const siguiente = actual_cargado.adyacente('siguiente');
    verificar_no_nulo(siguiente, "existe enlace 'siguiente' desde actual");
    verificar_iguales(siguiente.dato(), 3, 'el siguiente nodo tiene dato 3');

    // 9. Limpiar
    iter_cargado.destruir();
    await Controlador.eliminar('persistencia_iterador_test');
    verificar_verdadero(true, 'Limpieza final completada');
        });
    } catch (e) {
        console.error('Excepción durante el test:', e);
    } finally {
        console.log('\n══════════════════════════════════');
        console.log(' PRUEBAS v1.5i.4 FINALIZADAS');
        console.log('══════════════════════════════════');
        _diagnosticar_iterador();
        Iterador.imprimir_alertas();
        Iterador.imprimir_errores();
    }
})();

/**
 * Diagnóstico del grafo del iterador tras la carga.
 *
 * Recorre paso a paso la cadena que usa Iterador._cargar_interno
 * e imprime dónde se rompe (o si todos los pasos están OK).
 */
function _diagnosticar_iterador() {
    console.log('\n=== DIAGNOSTICO DEL ITERADOR ===');
    const iteradores = Nodo.nodo_por_id('iteradores');
    console.log('iteradores:', iteradores ? 'OK' : 'NULL');
    if (!iteradores) { console.log('=== FIN DIAGNOSTICO ==='); return; }
    const nclase = iteradores.adyacente('Iterador');
    console.log('nclase (Iterador):', nclase ? ('OK id=' + nclase.id() + ' dato=' + nclase.dato()) : 'NULL');
    if (!nclase) { console.log('=== FIN DIAGNOSTICO ==='); return; }
    const nits = nclase.adyacente('iteradores');
    console.log('nits (inner iteradores):', nits ? ('OK id=' + nits.id()) : 'NULL');
    if (!nits) { console.log('=== FIN DIAGNOSTICO ==='); return; }
    const cuerpo = nits.adyacente('iter_persistencia');
    console.log('cuerpo (iter_persistencia):', cuerpo ? ('OK id=' + cuerpo.id() + ' dato=' + cuerpo.dato()) : 'NULL');
    if (!cuerpo) {
        console.log('   Adyacentes de nits:');
        const ady = nits.adyacentes();
        if (ady) {
            for (const [enlace, nodo] of ady) {
                console.log('     ' + enlace + ' -> id=' + nodo.id() + ' dato=' + nodo.dato());
            }
        }
        console.log('=== FIN DIAGNOSTICO ===');
        return;
    }
    const clase = cuerpo.adyacente('clase');
    console.log('clase:', clase ? ('OK dato=' + clase.dato()) : 'NULL');
    const actual = cuerpo.adyacente('actual');
    console.log('actual:', actual ? ('OK id=' + actual.id() + ' dato=' + actual.dato()) : 'NULL');
    console.log('=== FIN DIAGNOSTICO ===');
}