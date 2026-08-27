/**
 * Pruebas exhaustivas v1.5i.1 – Manejo de ALIAS del Iterador
 *
 * Cubre: _alias, eliminar_alias, _varios_alias, eliminar_todos_los_alias,
 *        enlace, alias, y validaciones _es_alias_valido / _es_enlace_valido.
 *
 * @since 1.0
 * @version 1.5i.1
 * @author Ignacio David Baigorria
 */
import { Controlador } from '../Controlador/Controlador.js';
import { Nodo } from '../Nodos/Nodo.js';
import { Iterador } from '../Iteradores/Iterador.js';

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
console.log(' PRUEBAS v1.5i.1 – MANEJO DE ALIAS DEL ITERADOR');
console.log('══════════════════════════════════\n');

Controlador.ejecutar_prueba(function (token) {
    // 1. Validaciones base
    console.log('\n=== 1. Validaciones base ===');
    const iter = Iterador.crear('iter_alias');
    verificar_no_nulo(iter, 'crear() para pruebas de alias');

    verificar_verdadero(Iterador._es_alias_valido('alias_valido', iter), '_es_alias_valido() acepta string');
    verificar_falso(Iterador._es_alias_valido(123, iter), '_es_alias_valido() rechaza entero');
    verificar_verdadero(Iterador._es_enlace_valido('enlace', iter), '_es_enlace_valido() acepta string');
    verificar_verdadero(Iterador._es_enlace_valido(42, iter), '_es_enlace_valido() acepta número');
    verificar_falso(Iterador._es_enlace_valido([1,2], iter), '_es_enlace_valido() rechaza array');

    // 2. Asignación simple
    console.log('\n=== 2. Asignación simple de alias ===');
    verificar_verdadero(iter._alias('enlace_original', 'mi_alias'), '_alias() asigna alias correctamente');
    verificar_iguales(iter.enlace('mi_alias'), 'enlace_original', 'enlace(alias) devuelve el enlace');
    verificar_iguales(iter.alias('enlace_original'), 'mi_alias', 'alias(enlace) devuelve el alias');

    // 3. Reemplazo
    console.log('\n=== 3. Reemplazo de alias existente ===');
    verificar_verdadero(iter._alias('nuevo_enlace', 'mi_alias'), '_alias() reasigna alias a otro enlace');
    verificar_iguales(iter.enlace('mi_alias'), 'nuevo_enlace', 'enlace(alias) refleja el nuevo enlace');
    verificar_iguales(iter.alias('nuevo_enlace'), 'mi_alias', 'alias(enlace) refleja el nuevo enlace');
    verificar_iguales(iter.alias('enlace_original'), 'enlace_original', 'alias() del enlace antiguo devuelve el propio enlace');

    // 4. Varios alias
    console.log('\n=== 4. Varios alias a la vez ===');
    const varios = {
        alias_1: 'enlace_1',
        alias_2: 'enlace_2',
        alias_3: '33'
    };
    verificar_verdadero(iter._varios_alias(varios), '_varios_alias() asigna varios correctamente');
    verificar_iguales(iter.enlace('alias_1'), 'enlace_1', 'enlace(alias_1) correcto');
    verificar_iguales(iter.enlace('alias_2'), 'enlace_2', 'enlace(alias_2) correcto');
    verificar_iguales(iter.enlace('alias_3'), '33', 'enlace(alias_3) correcto (número)');
    verificar_iguales(iter.alias('enlace_2'), 'alias_2', 'alias(enlace_2) correcto');

    // 5. Eliminación individual
    console.log('\n=== 5. Eliminación de un alias individual ===');
    verificar_verdadero(iter.eliminar_alias('alias_2'), 'eliminar_alias() devuelve true');
    verificar_iguales(iter.enlace('alias_2'), 'alias_2', 'enlace(alias_2) tras eliminar devuelve el propio alias');
    verificar_iguales(iter.alias('enlace_2'), 'enlace_2', 'alias(enlace_2) tras eliminar devuelve el propio enlace');

    // 6. Eliminación total
    console.log('\n=== 6. Eliminación de todos los alias ===');
    verificar_verdadero(iter.eliminar_todos_los_alias(), 'eliminar_todos_los_alias() devuelve true');
    verificar_iguales(iter.enlace('mi_alias'), 'mi_alias', 'enlace() tras limpiar devuelve el alias');
    verificar_iguales(iter.alias('nuevo_enlace'), 'nuevo_enlace', 'alias() tras limpiar devuelve el enlace');

    // 7. Validación de ocupación
    console.log('\n=== 7. Validación de ocupación ===');
    iter.desocupar();
    verificar_falso(iter._alias('x', 'y'), '_alias() sin ocupar devuelve false');
    verificar_falso(iter._varios_alias({ a: 'b' }), '_varios_alias() sin ocupar devuelve false');
    verificar_falso(iter.eliminar_alias('a'), 'eliminar_alias() sin ocupar devuelve false');
    verificar_falso(iter.eliminar_todos_los_alias(), 'eliminar_todos_los_alias() sin ocupar devuelve false');
    verificar_falso(iter.enlace('a'), 'enlace() sin ocupar devuelve false');
    verificar_falso(iter.alias('b'), 'alias() sin ocupar devuelve false');

    // 8. Limpieza final
    console.log('\n=== 8. Limpieza final ===');
    const iter2 = Iterador.cargar('iter_alias');
    verificar_verdadero(iter2.destruir(), 'destruir() del iterador recargado funciona');
});

console.log('\n══════════════════════════════════');
console.log(' PRUEBAS v1.5i.1 FINALIZADAS');
console.log('══════════════════════════════════');
Iterador.imprimir_alertas();
Iterador.imprimir_errores();