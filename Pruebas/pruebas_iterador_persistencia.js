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

Controlador.ejecutar_prueba(function (token) {
    const nodos = [];
    for (let i = 0; i < 5; i++) {
        nodos.push(Nodo.crear_con_dato(i));
    }
    for (let i = 0; i < 4; i++) {
        nodos[i]._adyacente_en(nodos[i + 1], 'siguiente');
    }

    const nombre_iter = 'iter_persistencia';
    const iter = Iterador.crear(nombre_iter, nodos[0]);
    verificar_no_nulo(iter, 'Iterador creado');
    verificar_iguales(iter.dato(), 0, 'dato inicial es 0');

    const actual = iter.avanzar('siguiente;siguiente');
    verificar_no_nulo(actual, 'avanzar devuelve nodo');
    verificar_iguales(actual.dato(), 2, 'tras avanzar 2, dato actual es 2');

    const guardado = Controlador.guardar('persistencia_iterador_test');
    verificar_verdadero(guardado, 'guardar superestructura devuelve true');

    // Vaciar superestructura en JS, si existe el método
    if (typeof Nodo.vaciar_superestructura === 'function') {
        Nodo.vaciar_superestructura(token);
    } else {
        iter.destruir();
    }
    verificar_falso(Iterador.existe(nombre_iter), 'tras vaciar, el iterador ya no existe');

    const cargado = Controlador.cargar('persistencia_iterador_test');
    verificar_verdadero(cargado, 'cargar superestructura devuelve true');

    const iter_cargado = Iterador.cargar(nombre_iter);
    verificar_no_nulo(iter_cargado, 'iterador cargado correctamente');

    const actual_cargado = iter_cargado.actual();
    verificar_no_nulo(actual_cargado, 'nodo actual no nulo');
    verificar_iguales(actual_cargado.dato(), 2, 'dato del nodo actual es 2');
    verificar_iguales(iter_cargado.dato(), 2, 'método dato() devuelve 2');

    const siguiente = actual_cargado.adyacente('siguiente');
    verificar_no_nulo(siguiente, "existe enlace 'siguiente' desde actual");
    verificar_iguales(siguiente.dato(), 3, 'el siguiente nodo tiene dato 3');

    iter_cargado.destruir();
    Controlador.eliminar('persistencia_iterador_test');
    verificar_verdadero(true, 'Limpieza final completada');
});

console.log('\n══════════════════════════════════');
console.log(' PRUEBAS v1.5i.4 FINALIZADAS');
console.log('══════════════════════════════════');
Iterador.imprimir_alertas();
Iterador.imprimir_errores();