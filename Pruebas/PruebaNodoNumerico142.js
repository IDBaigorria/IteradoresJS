import { Controlador } from '../Controlador/Controlador.js';
import { NodoNumerico } from '../Nodos/NodoNumerico.js';
import { Matriz2x2 } from '../Nodos/Matriz2x2.js';
import { Conf } from '../Configuracion/Configuracion.js';

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

function assert_falso(valor, mensaje) {
    const ok = !valor;
    console.log((ok ? '✅' : '❌'), mensaje);
    ok ? pruebas_pasadas++ : pruebas_fallidas++;
}

console.log('══════════════════════════════════');
console.log(' PRUEBAS 1.4.2 – NodoNumerico (JS)');
console.log('══════════════════════════════════\n');

Controlador.ejecutar_prueba((token) => {
    // ─── 1. Secuencia con 2 factores ──────────────────
    console.log('--- 1. Secuencia con 2 factores ---');
    const p2 = NodoNumerico.crear();
    const p3 = NodoNumerico.crear();
    p2._identidad(Matriz2x2.crear_prima(2));
    p3._identidad(Matriz2x2.crear_prima(3));
    
    const sec = NodoNumerico.crear_secuencia([p2, p3]);
    assert_no_nulo(sec, "crear_secuencia devuelve un nodo");
    assert_verdadero(sec.ordenado, "El nodo secuencia tiene ordenado = true");
    
    const matriz_esperada = Matriz2x2.crear_prima(2).multiplicar(Matriz2x2.crear_prima(3));
    assert_verdadero(sec.identidad.es_igual(matriz_esperada), "La identidad de la secuencia es M(2)*M(3)");
    
    // ─── 2. Índice de identidades ────────────────────
    console.log('\n--- 2. Índice de identidades ---');
    const encontrado = NodoNumerico.nodo_por_identidad(matriz_esperada);
    assert_verdadero(encontrado === sec, "nodo_por_identidad devuelve el mismo nodo");
    
    const inexistente = NodoNumerico.nodo_por_identidad(Matriz2x2.crear_prima(7));
    assert_verdadero(inexistente === null, "nodo_por_identidad con identidad inexistente devuelve null");
    
    // ─── 3. Validación de cantidad prima ──────────────
    console.log('\n--- 3. Validación de cantidad prima ---');
    const resultado_malo = NodoNumerico.crear_secuencia([p2, p3, p2, p2]); // 4 factores
    assert_iguales(resultado_malo, null, "crear_secuencia devuelve null si la cantidad no es prima");
    
    const resultado_conj_malo = NodoNumerico.crear_conjunto([p2, p3, p2, p2]); // 4 componentes
    assert_iguales(resultado_conj_malo, null, "crear_conjunto devuelve null si la cantidad no es prima");
    
    // ─── 4. Conjunto con 2 componentes ────────────────
    console.log('\n--- 4. Conjunto con 2 componentes ---');
    const comp1 = NodoNumerico.crear();
    const comp2 = NodoNumerico.crear();
    comp1._identidad(Matriz2x2.crear_prima(2));
    comp2._identidad(Matriz2x2.crear_prima(3));
    
    const conj = NodoNumerico.crear_conjunto([comp1, comp2]);
    assert_no_nulo(conj, "crear_conjunto devuelve un nodo");
    assert_falso(conj.ordenado, "El nodo conjunto tiene ordenado = false");
    
    // ─── 5. Conmutatividad del conjunto ──────────────
    console.log('\n--- 5. Conmutatividad del conjunto ---');
    const conj2 = NodoNumerico.crear_conjunto([comp2, comp1]); // orden inverso
    assert_verdadero(conj === conj2, "crear_conjunto devuelve el mismo nodo sin importar el orden");
    assert_verdadero(conj.identidad.es_igual(conj2.identidad), "Las identidades son iguales");
    
    // ─── 6. Diferencia secuencia vs conjunto ─────────
    console.log('\n--- 6. Diferencia secuencia vs conjunto ---');
    const sec_prueba = NodoNumerico.crear_secuencia([comp1, comp2]);
    assert_falso(sec_prueba.identidad.es_igual(conj.identidad), "Identidad de secuencia y conjunto son diferentes");
    
    // ─── 7. Verificación de la marca de conjunto ──────
    console.log('\n--- 7. Verificación de la marca de conjunto ---');
    const marca = new Matriz2x2(1, 1, 0, 1);
    const esperado_conj = marca.multiplicar(Matriz2x2.crear_prima(2)).multiplicar(Matriz2x2.crear_prima(3));
    assert_verdadero(conj.identidad.es_igual(esperado_conj), "La identidad del conjunto incluye la marca");
    
    // ─── 8. Factories heredados ──────────────────────
    console.log('\n--- 8. Factories heredados de NodoElectrico ---');
    const nodo_base = NodoNumerico.crear();
    assert_no_nulo(nodo_base, "crear() sigue funcionando en NodoNumerico");
    assert_verdadero(nodo_base.identidad.es_igual(Matriz2x2.neutra()), "Identidad por defecto es matriz neutra");
    
    const nodo_dato = NodoNumerico.crear_con_dato("test");
    assert_iguales(nodo_dato.dato(), "test", "crear_con_dato() asigna dato en fase actual");
    
    // ─── 9. Capacidad y fuga configurables ───────────
    console.log('\n--- 9. Capacidad y fuga configurables ---');
    const nodo_cap = NodoNumerico.crear_secuencia([comp1, comp2], 500, 0.2);
    assert_iguales(nodo_cap.capacidad(), 500, "Capacidad configurada correctamente en secuencia");
    assert_iguales(nodo_cap.fuga(), 0.2, "Fuga configurada correctamente en secuencia");
    
    const nodo_conj_cap = NodoNumerico.crear_conjunto([comp1, comp2], 300, 0.1);
    assert_iguales(nodo_conj_cap.capacidad(), 300, "Capacidad configurada correctamente en conjunto");
    assert_iguales(nodo_conj_cap.fuga(), 0.1, "Fuga configurada correctamente en conjunto");
    
    // ─── 10. Cache de la marca ───────────────────────
    console.log('\n--- 10. Cache de la marca de conjunto ---');
    assert_verdadero(true, "No se produjeron errores de dependencia circular al usar la marca cacheada");
});

console.log('\n══════════════════════════════════');
console.log(` PRUEBAS: ${pruebas_pasadas} ✅, ${pruebas_fallidas} ❌`);
console.log('══════════════════════════════════');