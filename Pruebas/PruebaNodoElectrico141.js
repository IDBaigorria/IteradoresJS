/**
 * Pruebas exhaustivas de la versión 1.4.1 – NodoElectrico con dato multifase (JS).
 *
 * @since 1.4.1
 */
import { Controlador } from '../Controlador/Controlador.js';
import { NodoElectrico } from '../Nodos/NodoElectrico.js';
import { Conf } from '../Configuracion/Configuracion.js';

// ─── Helpers ──────────────────────────────────────────
let pruebas_pasadas = 0;
let pruebas_fallidas = 0;

function assert_iguales(obtenido, esperado, mensaje, tolerancia = 1e-9) {
    if (obtenido === esperado) {
        console.log('✅', mensaje);
        pruebas_pasadas++;
        return true;
    }
    if (typeof obtenido === 'number' && typeof esperado === 'number') {
        const ok = Math.abs(obtenido - esperado) < tolerancia;
        console.log((ok ? '✅' : '❌'), mensaje);
        if (!ok) console.log(`   Esperado: ${esperado}, Obtenido: ${obtenido}`);
        ok ? pruebas_pasadas++ : pruebas_fallidas++;
        return ok;
    }
    console.log('❌', mensaje);
    console.log(`   Esperado: ${esperado}, Obtenido: ${obtenido}`);
    pruebas_fallidas++;
    return false;
}

function assert_no_nulo(valor, mensaje) {
    const ok = valor !== null && valor !== undefined;
    console.log((ok ? '✅' : '❌'), mensaje);
    ok ? pruebas_pasadas++ : pruebas_fallidas++;
}

function assert_verdadero(valor, mensaje) {
    const ok = !!valor;
    console.log((ok ? '✅' : '❌'), mensaje);
    ok ? pruebas_pasadas++ : pruebas_fallidas++;
}

console.log('══════════════════════════════════');
console.log(' PRUEBAS 1.4.1 – NodoElectrico (JS)');
console.log('══════════════════════════════════\n');

Controlador.ejecutar_prueba((token) => {
    // ─── 1. dato() sin dimensión (compatibilidad hacia atrás) ───
    console.log('--- 1. dato() sin dimensión ---');
    NodoElectrico._fase(token, 'prueba1');
    const nodo = NodoElectrico.crear_con_dato("Hola");
    assert_iguales(nodo.dato(), "Hola", "dato() devuelve lo asignado en la fase actual");

    nodo._dato("Mundo");
    assert_iguales(nodo.dato(), "Mundo", "_dato(valor) sobrescribe el dato por defecto");

    // ─── 2. Cambio de fase ────────────────────────────────
    console.log('\n--- 2. Cambio de fase ---');
    NodoElectrico._fase(token, 'fase_a');
    const nodoA = NodoElectrico.crear_con_dato("Dato en fase A");
    assert_iguales(nodoA.dato(), "Dato en fase A", "Dato en fase A");

    NodoElectrico._fase(token, 'fase_b');
    assert_iguales(nodoA.dato(), null, "En fase B, el nodo no tiene dato aún");
    nodoA._dato("Dato en fase B");
    assert_iguales(nodoA.dato(), "Dato en fase B", "Ahora tiene dato en fase B");

    NodoElectrico._fase(token, 'fase_a');
    assert_iguales(nodoA.dato(), "Dato en fase A", "En fase A, el dato original sigue intacto");

    // ─── 3. dato con dimensión explícita ──────────────────
    console.log('\n--- 3. dato con dimensión ---');
    NodoElectrico._fase(token, 'fase_dim');
    const nodoB = NodoElectrico.crear();
    nodoB._dato("abajo_val", 'abajo');
    nodoB._dato("arriba_val", 'arriba');
    nodoB._dato("default_val"); // sin dimensión

    assert_iguales(nodoB.dato('abajo'), "abajo_val", "dato('abajo') correcto");
    assert_iguales(nodoB.dato('arriba'), "arriba_val", "dato('arriba') correcto");
    assert_iguales(nodoB.dato(), "default_val", "dato() sin dimensión correcto");
    assert_iguales(nodoB.dato('inexistente'), null, "dato('inexistente') es null");

    // ─── 4. Múltiples dimensiones en la misma fase ────────
    console.log('\n--- 4. Múltiples dimensiones ---');
    const nodoC = NodoElectrico.crear();
    nodoC._dato(10, 'peso');
    nodoC._dato(20, 'altura');
    nodoC._dato(30); // default
    assert_iguales(nodoC.dato('peso'), 10, "dimensión 'peso'");
    assert_iguales(nodoC.dato('altura'), 20, "dimensión 'altura'");
    assert_iguales(nodoC.dato(), 30, "dimensión por defecto");

    // ─── 5. Factories y asignación de dato ────────────────
    console.log('\n--- 5. Factories con dato multifase ---');
    NodoElectrico._fase(token, 'fase_fact');
    const nodoD = NodoElectrico.crear_con_dato_e_id("dato especial", "id_especial");
    assert_iguales(nodoD.dato(), "dato especial", "crear_con_dato_e_id asigna el dato en fase actual");
    assert_iguales(nodoD.id(), "id_especial", "id correcto");

    const nodoE = NodoElectrico.crear();
    assert_iguales(nodoE.dato(), null, "crear() sin dato no asigna nada en la fase actual");

    // Prueba del factory nodo() corregido
    const nodoF = NodoElectrico.nodo("nuevo dato");
    assert_iguales(nodoF.dato(), "nuevo dato", "nodo() con dato nuevo asigna en fase actual");

    const nodoG = NodoElectrico.crear_con_dato("original");
    const nodoH = NodoElectrico.nodo(nodoG);
    assert_iguales(nodoH.dato(), "original", "nodo() no modifica el dato de un nodo existente (devuelve el mismo)");

    // ─── 6. Independencia entre fases ─────────────────────
    console.log('\n--- 6. Independencia entre fases ---');
    NodoElectrico._fase(token, 'indep_a');
    const nodoI = NodoElectrico.crear();
    nodoI._dato("A");
    nodoI._dato("extra_a", 'extra');

    NodoElectrico._fase(token, 'indep_b');
    nodoI._dato("B");
    nodoI._dato("extra_b", 'extra');

    NodoElectrico._fase(token, 'indep_a');
    assert_iguales(nodoI.dato(), "A", "Fase indep_a mantiene 'A'");
    assert_iguales(nodoI.dato('extra'), "extra_a", "Fase indep_a mantiene 'extra_a'");

    NodoElectrico._fase(token, 'indep_b');
    assert_iguales(nodoI.dato(), "B", "Fase indep_b mantiene 'B'");
    assert_iguales(nodoI.dato('extra'), "extra_b", "Fase indep_b mantiene 'extra_b'");

    // ─── 7. Impresión global de la superestructura ────────
    console.log('\n--- 7. Impresión global con Controlador.imprimir_superestructura() ---');
    NodoElectrico._fase(token, 'impresion');
    // Creamos un par de nodos para que la superestructura no esté vacía
    const nodoJ = NodoElectrico.crear();
    nodoJ._dato("principal");
    nodoJ._dato("subordinado", 'abajo');
    nodoJ._adyacente(NodoElectrico.crear_con_dato("vecino"));

    Controlador.imprimir_superestructura();
    // Depuración: mostrar el HTML generado y la fase actual
    console.log('Fase actual antes de imprimir:', NodoElectrico.fase());
    

    // Verificamos que el contenedor HTML contiene los datos esperados
    const contenedor = document.getElementById(Conf.NODOS_CONTENEDOR_ID);
   // console.log('Contenido del contenedor:', contenedor.innerHTML);
    assert_no_nulo(contenedor, "El contenedor de nodos existe");
    if (contenedor) {
        const html = contenedor.innerHTML;
        assert_verdadero(html.includes('NODO ELÉCTRICO'), "Contiene nodos eléctricos");
        assert_verdadero(html.includes('[(defecto)] =&gt; principal'), "Contiene dimensión por defecto");
        assert_verdadero(html.includes('[abajo] =&gt; subordinado'), "Contiene dimensión 'abajo'");
    }
});

console.log('\n══════════════════════════════════');
console.log(` PRUEBAS: ${pruebas_pasadas} ✅, ${pruebas_fallidas} ❌`);
console.log('══════════════════════════════════');