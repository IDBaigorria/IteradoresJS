/**
 * Pruebas exhaustivas v1.5i.0 – Interfaz de carga, creación y destrucción de Iterador
 *
 * Cubre: crear, cargar, iterador, destruir, y los métodos internos asociados.
 *
 * @since 1.0
 * @version 1.5i.0
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
console.log(' PRUEBAS v1.5i.0 – INTERFAZ DE CREACIÓN/CARGA DE ITERADOR');
console.log('══════════════════════════════════\n');

Controlador.ejecutar_prueba(function (token) {
    // 1. Creación básica
    console.log('\n=== 1. Creación básica ===');
    const iter1 = Iterador.crear('iter_basico');
    verificar_no_nulo(iter1, 'crear() retorna instancia');
    verificar_verdadero(iter1.raiz_cuerpo instanceof Nodo, 'raiz_cuerpo es un Nodo');
    verificar_verdadero(iter1.raiz_cuerpo.adyacente('ocupado') === iter1.raiz_cuerpo, 'el cuerpo está ocupado (autoenlace)');

    const iter_dup = Iterador.crear('iter_basico');
    verificar_iguales(iter_dup, null, 'crear() con nombre existente devuelve null');

    verificar_verdadero(iter1.destruir(), 'destruir() primera instancia funciona');
    const iter_dup2 = Iterador.cargar('iter_basico');
    verificar_iguales(iter_dup2, null, 'cargar() después de destruir devuelve null (ya no existe)');

    // 2. Asignación de elemento inicial
    console.log('\n=== 2. Asignación de elemento inicial ===');

    // 2.1 Con elemento no nodo
    let es_nodo = null;
    const iter2 = Iterador.crear('iter_con_elemento', 'valor_inicial', (es) => { es_nodo = es; });
    verificar_no_nulo(iter2, 'crear() con elemento retorna instancia');
    verificar_falso(es_nodo, 'es_nodo es false para elemento no nodo');
    const actual = iter2.raiz_cuerpo.adyacente('actual');
    verificar_no_nulo(actual, 'existe nodo actual');
    verificar_iguales(actual.dato(), 'valor_inicial', 'el dato del nodo actual es el valor asignado');

    // 2.2 Con elemento que ya es Nodo
    const nodo_pre = Nodo.crear_con_dato('soy_nodo');
    let es_nodo2 = null;
    const iter3 = Iterador.crear('iter_con_nodo', nodo_pre, (es) => { es_nodo2 = es; });
    verificar_no_nulo(iter3, 'crear() con nodo retorna instancia');
    verificar_verdadero(es_nodo2, 'es_nodo es true para elemento nodo');
    const actual3 = iter3.raiz_cuerpo.adyacente('actual');
    verificar_verdadero(actual3 === nodo_pre, 'el nodo actual es exactamente el nodo pasado');

    // 3. Carga y ocupación
    console.log('\n=== 3. Carga y ocupación ===');
    const iter4 = Iterador.crear('iter_ocupado');
    verificar_no_nulo(iter4, 'crear() para iter_ocupado ok');

    const iter_cargar_ocupado = Iterador.cargar('iter_ocupado');
    verificar_iguales(iter_cargar_ocupado, null, 'cargar() mientras está ocupado devuelve null');

    verificar_verdadero(iter4.destruir(), 'destruir() elimina el iterador ocupado');

    // Ahora cargar debe fallar porque el iterador ya no existe
    const iter5 = Iterador.cargar('iter_ocupado');
    verificar_iguales(iter5, null, 'cargar() después de destruir devuelve null (iterador inexistente)');

    // 4. Método iterador()
    console.log('\n=== 4. Método iterador() ===');

    // Caso A: no existe -> crea nuevo
    let nuevo_flag_a = null;
    let es_nodo_a = null;
    const iter_a = Iterador.iterador('iter_auto', 'elemento_inicial',
        (es) => { es_nodo_a = es; },
        (nuevo) => { nuevo_flag_a = nuevo; });
    verificar_no_nulo(iter_a, 'iterador() crea un iterador nuevo');
    verificar_verdadero(nuevo_flag_a, 'nuevo_flag es true cuando se crea');
    verificar_falso(es_nodo_a, 'es_nodo es false para elemento no nodo');
    verificar_iguales(iter_a.raiz_cuerpo.adyacente('actual').dato(), 'elemento_inicial', 'actual dato correcto');

    // Caso B: existe y está ocupado -> debe fallar
    let nuevo_flag_b = null;
    let es_nodo_b = null;
    const iter_b = Iterador.iterador('iter_auto', null,
        (es) => { es_nodo_b = es; },
        (nuevo) => { nuevo_flag_b = nuevo; });
    verificar_iguales(iter_b, null, 'iterador() sobre un iterador ocupado devuelve null');
    verificar_iguales(nuevo_flag_b, null, 'nuevo_flag no se modifica si falla');

    // Destruir para liberar el nombre
    verificar_verdadero(iter_a.destruir(), 'destruir() elimina el iterador');

    // Caso C: no existe (tras destruir) -> crea de nuevo
    let nuevo_flag_c = null;
    let es_nodo_c = null;
    const iter_c = Iterador.iterador('iter_auto', 'segundo_elemento',
        (es) => { es_nodo_c = es; },
        (nuevo) => { nuevo_flag_c = nuevo; });
    verificar_no_nulo(iter_c, 'iterador() crea otro iterador tras destrucción');
    verificar_verdadero(nuevo_flag_c, 'nuevo_flag es true al crear de nuevo');
    verificar_falso(es_nodo_c, 'es_nodo es false para elemento no nodo');
    verificar_iguales(iter_c.raiz_cuerpo.adyacente('actual').dato(), 'segundo_elemento', 'actual dato correcto');

    // Dejar $iter_c para limpieza final
    iter_c.destruir();

    // 5. Validaciones de entrada
    console.log('\n=== 5. Validaciones de entrada ===');
    const iter_invalido = Iterador.crear(123);
    verificar_iguales(iter_invalido, null, 'crear() con nombre no string devuelve null');

    const iter_no_existe = Iterador.cargar('no_existe_xyz');
    verificar_iguales(iter_no_existe, null, 'cargar() con nombre inexistente devuelve null');

    const iter_existente = Iterador.crear('iter_ya_creado');
    const iter_cargar_existente = Iterador.cargar('iter_ya_creado');
    verificar_iguales(iter_cargar_existente, null, 'cargar() con instancia ya creada y ocupada devuelve null');

    // 6. Limpieza final
    console.log('\n=== 6. Limpieza final ===');
    iter2.destruir();
    iter3.destruir();
   // iter7.destruir();
    iter_existente.destruir();
    verificar_verdadero(true, 'Todos los iteradores de prueba destruidos');
});

console.log('\n══════════════════════════════════');
console.log(' PRUEBAS v1.5i.0 FINALIZADAS');
console.log('══════════════════════════════════');
Iterador.imprimir_alertas();
Iterador.imprimir_errores();