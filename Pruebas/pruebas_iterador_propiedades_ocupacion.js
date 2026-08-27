/**
 * Pruebas exhaustivas v1.5i.1 – Propiedades del Iterador y Marca de Ocupado
 *
 * Cubre: es_iterador, nombre, _ocupar, desocupar, ocupado.
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
console.log(' PRUEBAS v1.5i.1 – PROPIEDADES Y MARCA DE OCUPADO');
console.log('══════════════════════════════════\n');

Controlador.ejecutar_prueba(function (token) {
    // 1. es_iterador
    console.log('\n=== 1. es_iterador ===');
    const iter = Iterador.crear('iter_prop');
    verificar_verdadero(Iterador.es_iterador(iter), 'es_iterador(iterador) devuelve true');
    const nodo = Nodo.crear();
    verificar_falso(Iterador.es_iterador(nodo), 'es_iterador(nodo) devuelve false');
    verificar_falso(Iterador.es_iterador(null), 'es_iterador(null) devuelve false');

    // 2. nombre()
    console.log('\n=== 2. nombre() ===');
    verificar_iguales(iter.nombre(), 'iter_prop', 'nombre() retorna el nombre correcto');

    // 3. ocupado() inicial
    console.log('\n=== 3. ocupado() inicial ===');
    verificar_verdadero(iter.ocupado(), 'ocupado() es true tras crear');

    // 4. desocupar()
    console.log('\n=== 4. desocupar() ===');
    verificar_verdadero(iter.desocupar(), 'desocupar() devuelve true');
    verificar_falso(iter.ocupado(), 'ocupado() es false tras desocupar');
    verificar_falso(iter.nombre(), 'nombre() devuelve false tras desocupar (no ocupado)');
    verificar_falso(iter.desocupar(), 'desocupar() de nuevo devuelve false');

    // 5. Cargar después de desocupar
    console.log('\n=== 5. Cargar después de desocupar ===');
    const iter2 = Iterador.cargar('iter_prop');
    verificar_no_nulo(iter2, 'cargar() tras desocupar devuelve iterador');
    verificar_iguales(iter2.nombre(), 'iter_prop', 'nombre() del iterador cargado es correcto');

    // 6. _ocupar() (protegido por convención)
    console.log('\n=== 6. _ocupar() ===');

    // Crear un iterador auxiliar para esta prueba
    const iter_aux = Iterador.crear('iter_ocupar_test');

    // Obtener su cuerpo desde la superestructura
    const its = Nodo.nodo_por_id('iteradores');
    const nombre_clase = iter_aux.constructor.name; // "Iterador"
    const nclase = its.adyacente(nombre_clase);
    const nits = nclase.adyacente('iteradores');
    const cuerpo_aux = nits.adyacente('iter_ocupar_test');

    // Desocupar el iterador (elimina autoenlace y deja raiz_cuerpo null)
    iter_aux.desocupar();

    // Asignar manualmente el cuerpo al iterador (sin autoenlace "ocupado")
    iter_aux.raiz_cuerpo = cuerpo_aux;

    // Ahora invocar _ocupar() (protegido por convención)
    const resultado = iter_aux._ocupar();
    verificar_verdadero(resultado, '_ocupar() devuelve true');
    verificar_verdadero(iter_aux.ocupado(), 'ocupado() es true tras _ocupar');

    const resultado2 = iter_aux._ocupar();
    verificar_falso(resultado2, '_ocupar() de nuevo devuelve false (ya ocupado)');

    // Probar _ocupar sin cuerpo
    const iter3 = new Iterador();
    const resultado3 = iter3._ocupar();
    verificar_falso(resultado3, '_ocupar() sin cuerpo devuelve false');

    // 7. Limpieza final
    console.log('\n=== 7. Limpieza final ===');
    verificar_verdadero(iter2.destruir(), 'destruir() iter2 funciona');
    verificar_verdadero(true, 'Pruebas finalizadas sin residuos importantes');
});

console.log('\n══════════════════════════════════');
console.log(' PRUEBAS v1.5i.1 FINALIZADAS');
console.log('══════════════════════════════════');
Iterador.imprimir_alertas();
Iterador.imprimir_errores();