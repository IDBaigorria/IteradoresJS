/**
 * Pruebas exhaustivas v1.5i.4 – Interfaces Dato y Liberar
 *
 * @since 1.0
 * @version 1.5i.4
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
console.log(' PRUEBAS v1.5i.4 – DATO Y LIBERAR');
console.log('══════════════════════════════════\n');

Controlador.ejecutar_prueba(function (token) {
    // 1. _dato simple
    const nodo_raiz = Nodo.crear_con_dato('raiz');
    const iter = Iterador.crear('iter_dato_liberar', nodo_raiz);

    console.log('\n=== 1. _dato simple ===');
    const res = iter._dato('nuevo_valor');
    verificar_no_nulo(res, '_dato() retorna nodo');
    verificar_iguales(res.dato(), 'nuevo_valor', 'dato asignado correctamente');
    verificar_iguales(iter.dato(), 'nuevo_valor', 'dato() retorna el nuevo valor');

    // 2. _dato con camino
    console.log('\n=== 2. _dato con camino ===');
    const nodo_hijo = Nodo.crear_con_dato('hijo');
    nodo_raiz._adyacente_en(nodo_hijo, 'a');
    const res2 = iter._dato('dato_en_hijo', 'a');
    verificar_no_nulo(res2, '_dato() con camino retorna nodo');
    verificar_iguales(nodo_hijo.dato(), 'dato_en_hijo', 'dato asignado en hijo');
    verificar_verdadero(iter.actual() === nodo_raiz, 'posición actual restaurada');

    // 3. _dato rechaza nodo
    console.log('\n=== 3. _dato rechaza nodo ===');
    const otro_nodo = Nodo.crear();
    verificar_iguales(iter._dato(otro_nodo), null, '_dato(nodo) devuelve null');

    // 4. dato con camino
    console.log('\n=== 4. dato con camino ===');
    verificar_iguales(iter.dato('a'), 'dato_en_hijo', "dato('a') devuelve el dato del hijo");

    // 5. liberar
    console.log('\n=== 5. liberar ===');
    const actual_antes = iter.actual();
    const liberado = iter.liberar();
    verificar_verdadero(liberado === actual_antes, 'liberar() retorna el nodo que era actual');
    verificar_verdadero(iter.actual() === iter.raiz_cuerpo, 'el actual ahora es el cuerpo');
    verificar_iguales(iter.liberar(), null, 'liberar() de nuevo devuelve null (ya liberado)');

    // 6. limpieza
    iter.destruir();
});

console.log('\n══════════════════════════════════');
console.log(' PRUEBAS v1.5i.4 FINALIZADAS');
console.log('══════════════════════════════════');
Iterador.imprimir_alertas();
Iterador.imprimir_errores();