/**
 * Pruebas exhaustivas v1.5i.3 – Interfaz Adyacente del Iterador
 *
 * @since 1.0
 * @version 1.5i.3
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
console.log(' PRUEBAS v1.5i.3 – INTERFAZ ADYACENTE');
console.log('══════════════════════════════════\n');

Controlador.ejecutar_prueba(function (token) {
    // Estructura base
    const nodo_raiz = Nodo.crear_con_dato('raiz');
    const nodo_a1 = Nodo.crear_con_dato('A1');
    const nodo_a2 = Nodo.crear_con_dato('A2');
    const nodo_b1 = Nodo.crear_con_dato('B1');

    nodo_raiz._adyacente_en(nodo_a1, 'a');
    nodo_a1._adyacente_en(nodo_a2, 'a');
    nodo_a1._adyacente_en(nodo_b1, 'b');

    // 1. _adyacente_en
    console.log('\n=== 1. _adyacente_en ===');
    const iter = Iterador.crear('iter_adyacente', nodo_raiz);
    verificar_no_nulo(iter, 'crear iterador');

    let es_nodo = null;
    const nodo_nuevo = iter._adyacente_en('Nuevo', 'nuevo', null, (es) => { es_nodo = es; });
    verificar_no_nulo(nodo_nuevo, '_adyacente_en devuelve nodo');
    verificar_falso(es_nodo, 'es_nodo es false para elemento no nodo');
    verificar_iguales(nodo_nuevo.dato(), 'Nuevo', 'dato del nodo insertado correcto');
    verificar_verdadero(iter.actual() === nodo_raiz, 'la posición actual no cambia');

    const nodo_reemplazo = iter._adyacente_en('Reemplazo', 'nuevo');
    verificar_no_nulo(nodo_reemplazo, '_adyacente_en reemplaza y devuelve nodo');
    verificar_iguales(nodo_raiz.adyacente('nuevo').dato(), 'Reemplazo', 'el enlace fue actualizado');

    const nodo_con_camino = iter._adyacente_en('Camino', 'camino_enlace', 'a');
    verificar_no_nulo(nodo_con_camino, '_adyacente_en con camino devuelve nodo');
    verificar_iguales(nodo_a1.adyacente('camino_enlace').dato(), 'Camino', 'insertó en A1');
    verificar_verdadero(iter.actual() === nodo_raiz, 'la posición actual se restableció tras camino');

    const resultado_error = iter._adyacente_en('X', 123);
    verificar_iguales(resultado_error, null, '_adyacente_en con alias inválido devuelve null');

    // 2. _adyacente
    console.log('\n=== 2. _adyacente ===');
    let es_nodo2 = null;
    const nodo2 = iter._adyacente('otro_enlace', 'Elemento2', null, (es) => { es_nodo2 = es; });
    verificar_no_nulo(nodo2, '_adyacente devuelve nodo');
    verificar_falso(es_nodo2, 'es_nodo false');
    verificar_iguales(nodo_raiz.adyacente('otro_enlace').dato(), 'Elemento2', 'insertó correctamente');

    const nodo2b = iter._adyacente('enlace_b', 'DesdeCamino', 'a');
    verificar_no_nulo(nodo2b, '_adyacente con camino devuelve nodo');
    verificar_iguales(nodo_a1.adyacente('enlace_b').dato(), 'DesdeCamino', 'insertó en A1');

    // 3. _adyacentes
    console.log('\n=== 3. _adyacentes ===');
    const arreglo = {
        enlace_1: 'Valor1',
        enlace_2: 'Valor2',
        enlace_3: 'Valor3'
    };
    verificar_verdadero(iter._adyacentes(arreglo), '_adyacentes devuelve true');
    verificar_iguales(nodo_raiz.adyacente('enlace_1').dato(), 'Valor1', 'insertó enlace_1');
    verificar_iguales(nodo_raiz.adyacente('enlace_2').dato(), 'Valor2', 'insertó enlace_2');
    verificar_iguales(nodo_raiz.adyacente('enlace_3').dato(), 'Valor3', 'insertó enlace_3');

    const arreglo2 = { nuevo_enlace: 'ConCamino' };
    verificar_verdadero(iter._adyacentes(arreglo2, 'a'), '_adyacentes con camino devuelve true');
    verificar_iguales(nodo_a1.adyacente('nuevo_enlace').dato(), 'ConCamino', 'insertó en A1');

    verificar_falso(iter._adyacentes('no_arreglo'), '_adyacentes con no-array devuelve false');

    // 4. adyacentes
    console.log('\n=== 4. adyacentes ===');
    const todos = iter.adyacentes();
    verificar_no_nulo(todos, 'adyacentes devuelve Map');
    verificar_verdadero(todos.has('a'), "existe enlace 'a'");
    verificar_verdadero(todos.has('nuevo'), "existe enlace 'nuevo'");
    verificar_iguales(todos.get('a').dato(), 'A1', "adyacente 'a' correcto");

    const todos_a1 = iter.adyacentes('a');
    verificar_no_nulo(todos_a1, 'adyacentes con camino devuelve Map');
    verificar_verdadero(todos_a1.has('a'), "en A1 existe enlace 'a'");
    verificar_iguales(todos_a1.get('a').dato(), 'A2', "adyacente 'a' en A1 es A2");

    // 5. adyacente
    console.log('\n=== 5. adyacente ===');
    const un_ady = iter.adyacente('a');
    verificar_no_nulo(un_ady, "adyacente('a') devuelve nodo");
    verificar_iguales(un_ady.dato(), 'A1', 'dato correcto');

    const un_ady_camino = iter.adyacente('a', 'a');
    verificar_no_nulo(un_ady_camino, "adyacente('a','a') devuelve nodo");
    verificar_iguales(un_ady_camino.dato(), 'A2', 'dato correcto tras camino');

    verificar_iguales(iter.adyacente('no_existe'), null, 'adyacente inexistente devuelve null');

    // 6. eliminar_adyacente
    console.log('\n=== 6. eliminar_adyacente ===');
    const eliminado = iter.eliminar_adyacente('nuevo');
    verificar_no_nulo(eliminado, 'eliminar_adyacente devuelve nodo eliminado');
    verificar_iguales(eliminado.dato(), 'Reemplazo', 'dato del eliminado correcto');
    verificar_iguales(nodo_raiz.adyacente('nuevo'), null, 'el enlace fue eliminado');

    const eliminado2 = iter.eliminar_adyacente('a', 'a');
    verificar_no_nulo(eliminado2, 'eliminar_adyacente con camino devuelve nodo');
    verificar_iguales(eliminado2.dato(), 'A2', 'dato del eliminado correcto');
    verificar_iguales(nodo_a1.adyacente('a'), null, "en A1 ya no existe enlace 'a'");

    verificar_falso(iter.eliminar_adyacente('no_existe'), 'eliminar inexistente devuelve false');

    // 7. eliminar_adyacentes
    console.log('\n=== 7. eliminar_adyacentes ===');

    // Crear nodo temporal para no dañar la estructura principal
    const nodo_temp = Nodo.crear();
    nodo_temp._adyacente_en(Nodo.crear_con_dato('TempA'), 't1');
    nodo_temp._adyacente_en(Nodo.crear_con_dato('TempB'), 't2');

    const iter_temp = Iterador.crear('iter_temp', nodo_temp);
    verificar_verdadero(iter_temp.eliminar_adyacentes(), 'eliminar_adyacentes devuelve true con adyacentes');
    verificar_iguales(nodo_temp.adyacente('t1'), null, 't1 eliminado');
    verificar_iguales(nodo_temp.adyacente('t2'), null, 't2 eliminado');

    // Sin adyacentes (debe devolver false)
    verificar_falso(iter_temp.eliminar_adyacentes(), 'eliminar_adyacentes sin adyacentes devuelve false');
    iter_temp.destruir();

    // Con camino, usando otro nodo temporal
    const nodo_temp2 = Nodo.crear();
    const nodo_hijo = Nodo.crear_con_dato('Hijo');
    nodo_temp2._adyacente_en(nodo_hijo, 'a');

    const iter_temp2 = Iterador.crear('iter_temp2', nodo_temp2);
    iter_temp2._adyacentes({ temp_camino: 'TC' }, 'a');
    verificar_verdadero(iter_temp2.eliminar_adyacentes('a'), 'eliminar_adyacentes con camino devuelve true');
    verificar_iguales(nodo_hijo.adyacente('temp_camino'), null, 'se eliminó en hijo (tras avanzar y volver)');
    iter_temp2.destruir();

    // 8. _como_adyacente_de_nodo_en_alias
    console.log('\n=== 8. _como_adyacente_de_nodo_en_alias ===');
    iter._actual(nodo_raiz);
    const nodo_externo = Nodo.crear_con_dato('Externo');
    let es_nodo3 = null;
    const resultado8 = iter._como_adyacente_de_nodo_en_alias(nodo_externo, 'hacia_estructura', null, (es) => { es_nodo3 = es; });
    verificar_no_nulo(resultado8, '_como_adyacente_de_nodo_en_alias devuelve nodo');
    verificar_verdadero(es_nodo3, 'es_nodo true para elemento nodo');
    verificar_verdadero(nodo_externo.adyacente('hacia_estructura') === nodo_raiz, 'enlace desde externo hacia raíz');

    const nodo_externo2 = Nodo.crear_con_dato('Externo2');
    const resultado8b = iter._como_adyacente_de_nodo_en_alias(nodo_externo2, 'hacia_a1', 'a');
    verificar_no_nulo(resultado8b, '_como_adyacente_de_nodo_en_alias con camino devuelve nodo');
    verificar_verdadero(nodo_externo2.adyacente('hacia_a1') === nodo_a1, 'enlace desde externo2 hacia A1');

    // 9. _adyacente_inverso
    console.log('\n=== 9. _adyacente_inverso ===');
    iter._actual(nodo_raiz);
    let es_nodo4 = null;
    const resultado9 = iter._adyacente_inverso('inverso_enlace', 'InversoValor', null, (es) => { es_nodo4 = es; });
    verificar_no_nulo(resultado9, '_adyacente_inverso devuelve nodo');
    verificar_falso(es_nodo4, 'es_nodo false para elemento no nodo');
    verificar_iguales(resultado9.dato(), 'InversoValor', 'dato correcto');
    verificar_verdadero(resultado9.adyacente('inverso_enlace') === nodo_raiz, 'enlace inverso desde nodo creado hacia raíz');

    // 10. Limpieza final
    console.log('\n=== 10. Limpieza final ===');
    iter.destruir();
    verificar_verdadero(true, 'Iterador destruido');
});

console.log('\n══════════════════════════════════');
console.log(' PRUEBAS v1.5i.3 FINALIZADAS');
console.log('══════════════════════════════════');
Iterador.imprimir_alertas();
Iterador.imprimir_errores();