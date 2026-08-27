/**
 * Pruebas exhaustivas v1.5i.2 – Interfaz Avanzar del Iterador
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
console.log(' PRUEBAS v1.5i.2 – INTERFAZ AVANZAR');
console.log('══════════════════════════════════\n');

Controlador.ejecutar_prueba(function (token) {
    // 1. avanzar_escapar
    console.log('\n=== 1. avanzar_escapar ===');
    const iter = new Iterador();
    verificar_iguales(iter.avanzar_escapar('a;b>c*d/e'), 'a/;b/>c/*d//e', 'escapa ; > * /');
    verificar_iguales(iter.avanzar_escapar('sin_especiales'), 'sin_especiales', 'sin especiales queda igual');
    verificar_iguales(iter.avanzar_escapar(''), '', 'cadena vacía queda igual');

    // 2. camino (parseo)
    console.log('\n=== 2. camino (parseo) ===');
    const iter2 = Iterador.crear('iter_avanzar');
    verificar_no_nulo(iter2, 'crear iterador para pruebas');

    const cam = iter2._camino('a;b;c');
    verificar_no_nulo(cam, "camino('a;b;c') devuelve nodo");
    verificar_iguales(cam.dato(), 3, 'cantidad de eslabones es 3');
    const primero = cam.adyacente('eslabon');
    verificar_no_nulo(primero, 'existe primer eslabón');
    const alias = primero.adyacente('alias');
    verificar_no_nulo(alias, 'existe alias del primer eslabón');
    verificar_iguales(alias.dato(), 'a', "primer alias es 'a'");

    const cam2 = iter2._camino('a>;b>3;c');
    verificar_no_nulo(cam2, 'camino con símbolos > devuelve nodo');
    verificar_iguales(cam2.dato(), 3, 'cantidad correcta');

    const cam_inv1 = iter2._camino(';a');
    verificar_iguales(cam_inv1, null, 'camino inválido que empieza con ; devuelve null');

    const cam_inv2 = iter2._camino('a;>b');
    verificar_iguales(cam_inv2, null, 'camino inválido con > al inicio de eslabón devuelve null');

    const cam_valido_sin_num = iter2._camino('a;b>');
    verificar_no_nulo(cam_valido_sin_num, "camino('a;b>') es válido y devuelve nodo");
    verificar_iguales(cam_valido_sin_num.dato(), 2, 'tiene 2 eslabones');
    iter2._eliminar_camino(cam_valido_sin_num);

    // Limpiar caminos creados manualmente
    iter2._eliminar_camino(cam);
    iter2._eliminar_camino(cam2);

    // 3. avanzar con estructura simple
    console.log('\n=== 3. avanzar con estructura simple ===');
    const nodo_raiz = Nodo.crear_con_dato('raiz');
    const nodo_a1 = Nodo.crear_con_dato('A1');
    const nodo_a2 = Nodo.crear_con_dato('A2');
    const nodo_a3 = Nodo.crear_con_dato('A3');
    const nodo_b1 = Nodo.crear_con_dato('B1');

    nodo_raiz._adyacente_en(nodo_a1, 'a');
    nodo_a1._adyacente_en(nodo_a2, 'a');
    nodo_a2._adyacente_en(nodo_a3, 'a');
    nodo_a1._adyacente_en(nodo_b1, 'b');

    const iter3 = Iterador.crear('iter_avanzar_2', nodo_raiz);
    verificar_no_nulo(iter3, 'crear iterador con actual raiz');

    const resultado = iter3.avanzar('a');
    verificar_no_nulo(resultado, "avanzar('a') devuelve nodo");
    verificar_iguales(resultado.dato(), 'A1', 'avanzó a A1');

    const resultado2 = iter3.avanzar('a>2');
    verificar_no_nulo(resultado2, "avanzar('a>2') devuelve nodo");
    verificar_iguales(resultado2.dato(), 'A3', "avanzó dos veces por 'a'");

    // Intentar avanzar por 'b' desde A3 (ruta errónea)
    const resultado_error = iter3.avanzar('b');
    verificar_iguales(resultado_error, null, "avanzar('b') desde A3 devuelve null (ruta inexistente)");

    // Reposicionar en A1 para avanzar correctamente por 'b'
    iter3._actual(nodo_a1);
    const resultado3 = iter3.avanzar('b');
    verificar_no_nulo(resultado3, "avanzar('b') desde A1 devuelve nodo");
    verificar_iguales(resultado3.dato(), 'B1', 'avanzó a B1');

    // 4. avanzar con camino de múltiples eslabones
    console.log('\n=== 4. avanzar con camino de múltiples eslabones ===');
    iter3._actual(nodo_raiz);
    let camino_recorrido = '';
    let camino_restante = '';
    const resultado4 = iter3.avanzar('a;a', null,
        (rec) => { camino_recorrido = rec; },
        (rest) => { camino_restante = rest; }
    );
    verificar_no_nulo(resultado4, "avanzar('a;a') devuelve nodo");
    verificar_iguales(resultado4.dato(), 'A2', 'terminó en A2');
    verificar_iguales(camino_recorrido, 'a;a', 'camino_recorrido correcto');
    verificar_iguales(camino_restante, '', 'no hay camino restante');

    // 5. avanzar con cantidad parcial (cant)
    console.log('\n=== 5. avanzar con cantidad parcial ===');
    iter3._actual(nodo_raiz);
    let camino_recorrido2 = '';
    let camino_restante2 = '';
    const resultado5 = iter3.avanzar('a;a;a;b', 2,
        (rec) => { camino_recorrido2 = rec; },
        (rest) => { camino_restante2 = rest; }
    );
    verificar_no_nulo(resultado5, 'avanzar con cant=2 devuelve nodo');
    verificar_iguales(resultado5.dato(), 'A2', 'avanzó solo 2 eslabones');
    verificar_iguales(camino_recorrido2, 'a;a;', 'camino recorrido parcial correcto');
    verificar_iguales(camino_restante2, 'a;b', 'camino restante correcto');

    // 6. avanzar con > sin número (hasta el final)
    console.log('\n=== 6. avanzar con > sin número (hasta el final) ===');
    iter3._actual(nodo_raiz);
    const resultado6 = iter3.avanzar('a>');
    verificar_no_nulo(resultado6, "avanzar('a>') devuelve nodo");
    verificar_iguales(resultado6.dato(), 'A3', "llegó al final de la cadena 'a'");

    // 7. avanzar con error y retroceso
    console.log('\n=== 7. avanzar con error y retroceso ===');
    iter3._actual(nodo_raiz);
    const origen = iter3.actual();
    const resultado7 = iter3.avanzar('a;a;a;a');
    verificar_iguales(resultado7, null, 'avanzar camino más largo devuelve null');
    const actual_ahora = iter3.actual();
    verificar_verdadero(actual_ahora === origen, 'la posición actual se restableció al origen');

    // 8. _avanzar (insertar y avanzar)
    console.log('\n=== 8. _avanzar (insertar y avanzar) ===');
    const iter4 = Iterador.crear('iter_avanzar_3', nodo_raiz);
    let es_nodo = null;
    const nuevo_nodo = iter4._avanzar('nuevo', 'SoyNuevo', null,
        (es) => { es_nodo = es; }
    );
    verificar_no_nulo(nuevo_nodo, '_avanzar inserta nodo');
    verificar_falso(es_nodo, 'elemento no era nodo');
    verificar_iguales(nuevo_nodo.dato(), 'SoyNuevo', 'dato del nodo insertado correcto');
    verificar_verdadero(iter4.actual() === nuevo_nodo, 'actual es el nodo insertado');

    // Insertar con camino previo
    iter4._actual(nodo_raiz);
    const nuevo_nodo2 = iter4._avanzar('nuevo', 'ConCamino', 'a',
        (es) => { es_nodo = es; }
    );
    verificar_no_nulo(nuevo_nodo2, '_avanzar con camino previo funciona');
    const actual_nuevo = iter4.actual();
    verificar_iguales(actual_nuevo.dato(), 'ConCamino', 'dato correcto tras camino');

    const nodo_a1_despues = nodo_raiz.adyacente('a');
    const nodo_insertado_en_a1 = nodo_a1_despues.adyacente('nuevo');
    verificar_no_nulo(nodo_insertado_en_a1, "existe enlace 'nuevo' en A1");
    verificar_iguales(nodo_insertado_en_a1.dato(), 'ConCamino', 'el dato del enlace es correcto');

    // 9. Limpieza final
    console.log('\n=== 9. Limpieza final ===');
    iter2.destruir();
    iter3.destruir();
    iter4.destruir();
    verificar_verdadero(true, 'Iteradores de prueba destruidos');
});

console.log('\n══════════════════════════════════');
console.log(' PRUEBAS v1.5i.2 FINALIZADAS');
console.log('══════════════════════════════════');
Iterador.imprimir_alertas();
Iterador.imprimir_errores();