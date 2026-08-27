/**
 * Pruebas exhaustivas v1.5i.2 – Interfaz Actual del Iterador
 *
 * @since 1.0
 * @version 1.5i.2
 * @author Ignacio David Baigorria
 */
import { Controlador } from '../Controlador/Controlador.js';
import { Nodo } from '../Nodos/Nodo.js';
import { Iterador } from '../Iteradores/Iterador.js';

// Helpers
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
console.log(' PRUEBAS v1.5i.2 – INTERFAZ ACTUAL');
console.log('══════════════════════════════════\n');

Controlador.ejecutar_prueba(function (token) {
    // 1. actual() sin nodo actual
    console.log('\n=== 1. actual() sin nodo actual ===');
    const iter = Iterador.crear('iter_actual');
    verificar_no_nulo(iter, 'crear() para pruebas');
    verificar_iguales(iter.actual(), null, 'actual() devuelve null si no hay nodo actual');

    // 2. _actual() con elemento no nodo
    console.log('\n=== 2. _actual() con elemento no nodo ===');
    let es_nodo = null;
    const resultado = iter._actual('valor_inicial', (es) => { es_nodo = es; });
    verificar_verdadero(resultado, '_actual() devuelve true al asignar');
    verificar_falso(es_nodo, 'es_nodo es false para elemento no nodo');
    const actual = iter.actual();
    verificar_no_nulo(actual, 'actual() devuelve un nodo');
    verificar_iguales(actual.dato(), 'valor_inicial', 'dato del nodo actual es correcto');

    // 3. _actual() con elemento que ya es Nodo
    console.log('\n=== 3. _actual() con elemento nodo ===');
    const nodo_pre = Nodo.crear_con_dato('soy_nodo');
    let es_nodo2 = null;
    const resultado2 = iter._actual(nodo_pre, (es) => { es_nodo2 = es; });
    verificar_verdadero(resultado2, '_actual() con nodo devuelve true');
    verificar_verdadero(es_nodo2, 'es_nodo es true para elemento nodo');
    const actual2 = iter.actual();
    verificar_verdadero(actual2 === nodo_pre, 'actual() devuelve exactamente el nodo pasado');

    // 4. _actual() sin elemento (crea nodo vacío)
    console.log('\n=== 4. _actual() sin elemento ===');
    let es_nodo3 = null;
    const resultado3 = iter._actual(null, (es) => { es_nodo3 = es; });
    verificar_verdadero(resultado3, '_actual() sin elemento devuelve true');
    verificar_falso(es_nodo3, 'es_nodo es false para null');
    const actual3 = iter.actual();
    verificar_no_nulo(actual3, 'actual() devuelve nodo vacío');
    verificar_iguales(actual3.dato(), null, 'dato del nodo vacío es null');

    // 5. Métodos sin ocupación
    console.log('\n=== 5. Métodos sin ocupación ===');
    iter.desocupar();
    verificar_falso(iter.actual(), 'actual() sin ocupar devuelve false');
    verificar_falso(iter._actual('algo'), '_actual() sin ocupar devuelve false');

    // 6. Limpieza final
    console.log('\n=== 6. Limpieza final ===');
    const iter2 = Iterador.cargar('iter_actual');
    verificar_verdadero(iter2.destruir(), 'destruir() del iterador recargado funciona');
});

console.log('\n══════════════════════════════════');
console.log(' PRUEBAS v1.5i.2 FINALIZADAS');
console.log('══════════════════════════════════');
Iterador.imprimir_alertas();
Iterador.imprimir_errores();