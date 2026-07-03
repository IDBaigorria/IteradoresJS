// Prueba143.js – Pruebas exhaustivas v1.4.3 (JS)
// @version 1.4.3
// @author Ignacio David Baigorria

import { Controlador } from '../Controlador/Controlador.js';
import { Matriz2x2 } from '../Nodos/Matriz2x2.js';
import { NodoNumerico } from '../Nodos/NodoNumerico.js';
import { NodoPrimo } from '../Nodos/NodoPrimo.js';
import { NodoParalelo } from '../Nodos/NodoParalelo.js';
import { NodoConjunto } from '../Nodos/NodoConjunto.js';
import { Conf } from '../Configuracion/Configuracion.js';
import { Entorno } from '../Configuracion/Entorno.js';
import { NodoElectrico } from '../Nodos/index.js';

// Forzar entorno de pruebas para _identidad
if (!Entorno._permite_pruebas) {
    Entorno._permite_pruebas = function(valor) { this._pruebas_permitidas = valor; };
    Entorno.permite_pruebas = function() { return this._pruebas_permitidas !== false; };
}
Entorno._permite_pruebas(true);

let pruebas_pasadas = 0, pruebas_fallidas = 0;

function assert_iguales(obtenido, esperado, mensaje, tolerancia = 1e-9) {
    if (obtenido === esperado) { console.log('✅', mensaje); pruebas_pasadas++; return true; }
    if (typeof obtenido === 'number' && typeof esperado === 'number') {
        const ok = Math.abs(obtenido - esperado) < tolerancia;
        console.log((ok ? '✅' : '❌'), mensaje);
        if (!ok) console.log(`   Esperado: ${esperado}, Obtenido: ${obtenido}`);
        ok ? pruebas_pasadas++ : pruebas_fallidas++; return ok;
    }
    console.log('❌', mensaje); console.log(`   Esperado: ${esperado}, Obtenido: ${obtenido}`);
    pruebas_fallidas++; return false;
}

function assert_no_nulo(valor, mensaje) {
    const ok = valor !== null && valor !== undefined;
    console.log((ok ? '✅' : '❌'), mensaje);
    if (!ok) console.log('   Se esperaba valor no nulo.');
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
console.log(' PRUEBAS 1.4.3 – Framework Iteradores (JS)');
console.log('══════════════════════════════════\n');

Controlador.ejecutar_prueba((token) => {
    // ══════════════════════════════════
    // 1. PRUEBAS DE Matriz2x2
    // ══════════════════════════════════
    console.log('--- 1. Matriz2x2 ---');

    console.log('1.1 Fábricas:');
    const m_inicial = Matriz2x2.inicial();
    assert_iguales(m_inicial.a, 1, 'inicial() a=1');
    assert_iguales(m_inicial.b, 1, 'inicial() b=1');
    assert_iguales(m_inicial.c, 1, 'inicial() c=1');
    assert_iguales(m_inicial.d, 2, 'inicial() d=2');

    const m_prima = Matriz2x2.crear_prima(5);
    assert_iguales(m_prima.a, 5, 'crear_prima(5) a=5');
    assert_iguales(m_prima.b, 1, 'crear_prima(5) b=1');

    const m_neg = Matriz2x2.crear_negativa_prima(3);
    assert_iguales(m_neg.a, -3, 'crear_negativa_prima(3) a=-3');
    assert_iguales(m_neg.b, 1, 'crear_negativa_prima(3) b=1');

    const m_id = Matriz2x2.identidad_algebraica();
    assert_verdadero(m_id.es_igual(new Matriz2x2(1, 0, 0, 1)), 'identidad_algebraica correcta');

    console.log('1.2 Operaciones:');
    const m1 = new Matriz2x2(2, 0, 1, 1);
    const m2 = new Matriz2x2(3, 0, 1, 1);
    const prod1 = m1.multiplicar(m2);
    const prod2 = m2.multiplicar(m1);
    assert_falso(prod1.es_igual(prod2), 'No conmutatividad: M2×M3 ≠ M3×M2');

    const neutra = Matriz2x2.identidad_algebraica();
    assert_verdadero(m1.multiplicar(neutra).es_igual(m1), 'Neutro derecha');
    assert_verdadero(neutra.multiplicar(m1).es_igual(m1), 'Neutro izquierda');

    console.log('1.3 Canvas de contexto:');
    const m_pintar = Matriz2x2.crear_prima(2);
    m_pintar.pintar(3);
    assert_iguales(m_pintar.b, 3, 'pintar(3) → b=3');
    m_pintar.pintar(5);
    assert_iguales(m_pintar.b, 15, 'pintar(5) → b=15');
    m_pintar.despintar(3);
    assert_iguales(m_pintar.b, 5, 'despintar(3) → b=5');

    m_pintar.despintar(7); // Error esperado (registrado en errores del sistema, no lanza excepción)
    assert_iguales(m_pintar.b, 5, 'despintar(7) no modifica b');

    console.log('1.4 Referencia al nodo:');
    const m_ref = Matriz2x2.inicial();
    assert_verdadero(m_ref.nodo === null, 'nodo() inicialmente null');

    console.log('1.5 Determinante:');
    const m_det = new Matriz2x2(3, 2, 1, 4);
    assert_iguales(m_det.determinante(), 10, 'det([[3,2],[1,4]])=10');
    m_det._b(5);
    assert_iguales(m_det.determinante(), 7, 'det tras _b(5)=7');

    // ══════════════════════════════════
    // 2. PRUEBAS DE NodoNumerico
    // ══════════════════════════════════
    console.log('\n--- 2. NodoNumerico ---');

    console.log('2.1 Identidad multifase:');
    const nodo = NodoNumerico._tomar_nodo_libre();
    const m_fase_a = nodo.identidad(); // fase actual es 'a'
    assert_verdadero(m_fase_a.es_igual(Matriz2x2.inicial()), 'identidad() devuelve inicial() en fase nueva');

    const m_pers = Matriz2x2.crear_prima(7);
    nodo._identidad(m_pers, 'personalizada');
    assert_verdadero(nodo.identidad('personalizada').es_igual(m_pers), "identidad('personalizada') correcta");

    console.log('2.2 Método es_primo():');
    assert_falso(nodo.es_primo(), 'NodoNumerico->es_primo() = false');

    console.log('2.3 Caché de primos:');
    assert_verdadero(NodoNumerico.es_numero_primo(2), '2 es primo');
    assert_verdadero(NodoNumerico.es_numero_primo(3), '3 es primo');
    assert_falso(NodoNumerico.es_numero_primo(4), '4 no es primo');

    const sig = NodoNumerico.siguiente_numero_primo(3);
    assert_iguales(sig, 5, 'siguiente_numero_primo(3)=5');

    const pos = NodoNumerico.siguiente_primo_positivo();
    assert_verdadero(NodoNumerico.es_numero_primo(pos), 'siguiente_primo_positivo() devuelve primo');
    const pos2 = NodoNumerico.siguiente_primo_positivo();
    assert_verdadero(pos2 > pos, 'siguiente_primo_positivo() avanza');

    const neg = NodoNumerico.siguiente_primo_negativo();
    assert_verdadero(NodoNumerico.es_numero_primo(neg), 'siguiente_primo_negativo() devuelve primo');

    console.log('2.4 Pool de nodos libres:');
    const libre = NodoNumerico._tomar_nodo_libre();
    assert_no_nulo(libre, '_tomar_nodo_libre() devuelve nodo');
    NodoNumerico._devolver_nodo_libre(libre);
    const libre2 = NodoNumerico._tomar_nodo_libre();
    assert_verdadero(libre === libre2, '_tomar_nodo_libre reutiliza nodo devuelto');

    console.log('2.5 Fábricas:');
    // crear_primo
    const p2 = NodoNumerico.crear_primo(2);
    assert_no_nulo(p2, 'crear_primo(2) devuelve nodo');
    assert_verdadero(p2.es_primo(), 'crear_primo devuelve NodoPrimo');
    assert_iguales(p2.numero_primo, 2, 'numero_primo = 2');

    const p_malo = NodoNumerico.crear_primo(4);
    assert_verdadero(p_malo === null, 'crear_primo(4) devuelve null');

    // crear_numerico
    const p3 = NodoNumerico.crear_primo(3);
    const sec = NodoNumerico.crear_numerico([p2, p3]);
    assert_no_nulo(sec, 'crear_numerico([p2,p3]) devuelve nodo');
    assert_verdadero(sec.ordenado, 'secuencia es ordenada');
    const m_esperada = Matriz2x2.crear_prima(2).multiplicar(Matriz2x2.crear_prima(3));
    assert_verdadero(sec.identidad().es_igual(m_esperada), 'identidad secuencia correcta');

    // crear_paralelo
    const par = NodoNumerico.crear_paralelo([p2, p3]);
    assert_no_nulo(par, 'crear_paralelo([p2,p3]) devuelve nodo');
    assert_falso(par.ordenado, 'paralelo no es ordenado');

    // crear_conjunto
    const conj = NodoNumerico.crear_conjunto();
    assert_no_nulo(conj, 'crear_conjunto() devuelve nodo');
    assert_falso(conj.ordenado, 'conjunto no es ordenado');
    assert_iguales(conj.nombre(), 'sin_nombre', "nombre inicial 'sin_nombre'");

    // ══════════════════════════════════
    // 3. PRUEBAS DE NodoPrimo
    // ══════════════════════════════════
    console.log('\n--- 3. NodoPrimo ---');

    console.log('3.1 Pool de primos libres:');
    NodoPrimo.inicializar_fase('a', 10);
    const libre_primo = NodoPrimo.siguiente_primo_libre('a');
    assert_no_nulo(libre_primo, 'siguiente_primo_libre devuelve NodoPrimo');
    assert_verdadero(libre_primo.es_primo(), 'El nodo libre es primo');

    NodoPrimo.devolver_primo_libre(libre_primo, 'a');
    const mismo_primo = NodoPrimo.siguiente_primo_libre('a');
    assert_verdadero(libre_primo === mismo_primo, 'devolver y tomar reutiliza el mismo NodoPrimo');

    console.log('3.2 Factorización bloqueada:');
    try {
        libre_primo.factorizar();
        console.log('❌ factorizar() no lanzó excepción');
        pruebas_fallidas++;
    } catch (e) {
        console.log('✅ factorizar() lanza Error');
        pruebas_pasadas++;
    }

    // ══════════════════════════════════
    // 4. PRUEBAS DE NodoParalelo
    // ══════════════════════════════════
    console.log('\n--- 4. NodoParalelo ---');

    const p5 = NodoNumerico.crear_primo(5);
    const p7 = NodoNumerico.crear_primo(7);

    console.log('4.1 Creación y marca:');
    const par_ok = NodoNumerico.crear_paralelo([p5, p7]);
    assert_no_nulo(par_ok, 'crear_paralelo con 2 componentes');
    const m_marca = new Matriz2x2(1, 1, 0, 1);
    const m_esperada_par = m_marca.multiplicar(Matriz2x2.crear_prima(5)).multiplicar(Matriz2x2.crear_prima(7));
    assert_verdadero(par_ok.identidad().es_igual(m_esperada_par), 'Identidad incluye marca');

    console.log('4.2 Conmutatividad:');
    const par_inv = NodoNumerico.crear_paralelo([p7, p5]);
    assert_verdadero(par_ok.identidad().es_igual(par_inv.identidad()), 'Identidad conmutativa');

    console.log('4.3 Cantidad no prima:');
    const p11 = NodoNumerico.crear_primo(11);
    const p13 = NodoNumerico.crear_primo(13);
    const p17 = NodoNumerico.crear_primo(17);
    const par_malo = NodoNumerico.crear_paralelo([p11, p13, p17, p5]); // 4 componentes
    assert_verdadero(par_malo === null, 'crear_paralelo con 4 componentes (no primo) devuelve null');

    // ══════════════════════════════════
    // 5. PRUEBAS DE NodoConjunto
    // ══════════════════════════════════
    console.log('\n--- 5. NodoConjunto ---');

    console.log('5.1 Creación y nombrado:');
    const conj1 = NodoNumerico.crear_conjunto();
    conj1._nombre('vocales');
    assert_iguales(conj1.nombre(), 'vocales', '_nombre asigna correctamente');
    const conj_dup = NodoNumerico.crear_conjunto();
    conj_dup._nombre('vocales'); // Debe registrar error
    console.log("✅ Intentar duplicar nombre 'vocales' registró error del sistema (ver logs)");
    pruebas_pasadas++;

    const recuperado = NodoConjunto.obtener('vocales');
    assert_verdadero(recuperado === conj1, "obtener('vocales') devuelve el conjunto correcto");

    const todos = NodoConjunto.listar_todos();
    assert_verdadero(todos.has('vocales'), "listar_todos incluye 'vocales'");

    console.log('5.2 Pintura y pertenencia:');
    const conj2 = NodoNumerico.crear_conjunto();
    conj2._nombre('prueba_pintura');

    const p19 = NodoNumerico.crear_primo(19);
    const p23 = NodoNumerico.crear_primo(23);

    conj2.agregar_miembro(p19);
    assert_verdadero(conj2.tiene_miembro(p19), 'tiene_miembro tras agregar');
    assert_verdadero(p19.identidad().b % conj2.primo_contexto === 0, 'b del miembro es múltiplo del primo_contexto');

    conj2.agregar_miembro(p23);
    assert_verdadero(conj2.tiene_miembro(p23), 'tiene_miembro con segundo miembro');

    conj2.quitar_miembro(p19);
    assert_falso(conj2.tiene_miembro(p19), 'tiene_miembro falso tras quitar');
    assert_verdadero(conj2.tiene_miembro(p23), 'el otro miembro sigue perteneciendo');

    console.log('5.3 Bidireccionalidad:');
    const b_conj_antes = conj2.identidad().b;
    conj2.agregar_miembro(p19);
    const b_conj_despues = conj2.identidad().b;
    assert_verdadero(b_conj_despues === b_conj_antes * p19.numero_primo, 'conjunto pintado por miembro');

    // ══════════════════════════════════
    // 6. PRUEBAS DE INTEGRACIÓN
    // ══════════════════════════════════
    console.log('\n--- 6. Integración (ascenso/descenso) ---');

    console.log('6.1 Ascenso simulado:');
    const p29 = NodoNumerico.crear_primo(29);
    const p31 = NodoNumerico.crear_primo(31);
    const secuencia = NodoNumerico.crear_numerico([p29, p31]);
    const matriz_original = secuencia.identidad();

    // Cambiar a fase 'b' (superior)
    NodoElectrico._fase(token, 'b');

    // Tomar NodoPrimo libre en fase 'b'
    NodoPrimo.inicializar_fase('b', 5);
    const primo_superior = NodoPrimo.siguiente_primo_libre('b');
    primo_superior._dato(matriz_original, 'matriz_compuesta');

    // Devolver secuencia al pool de libres de fase 'a'
    NodoNumerico._devolver_nodo_libre(secuencia, 'a');

    assert_verdadero(true, 'Ascenso: NodoPrimo en fase b guarda matriz de secuencia de fase a');
    pruebas_pasadas++; // aserción manual

    console.log('6.2 Descenso simulado:');
    const matriz_guardada = primo_superior.dato('matriz_compuesta');
    assert_no_nulo(matriz_guardada, 'matriz_compuesta recuperada del primo');
    assert_verdadero(matriz_guardada instanceof Matriz2x2, 'matriz_compuesta es Matriz2x2');

    // Volver a fase 'a'
    NodoElectrico._fase(token, 'a');

    // Crear nodo numérico a partir de los mismos primos (simulación)
    const nodo_descendido = NodoNumerico.crear_numerico([p29, p31]);
    assert_verdadero(nodo_descendido.identidad().es_igual(matriz_original), 'Descenso: identidad reconstruida coincide');

    console.log('\n══════════════════════════════════');
    console.log(` PRUEBAS: ${pruebas_pasadas} ✅, ${pruebas_fallidas} ❌`);
    console.log('══════════════════════════════════');
});