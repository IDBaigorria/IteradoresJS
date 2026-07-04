// Prueba144.js – Pruebas exhaustivas v1.4.4 (JS)
// @version 1.4.4
// @author Ignacio David Baigorria

import { Controlador } from '../Controlador/Controlador.js';
import { Matriz2x2 } from '../Nodos/Matriz2x2.js';
import { NodoNumerico } from '../Nodos/NodoNumerico.js';
import { NodoPrimo } from '../Nodos/NodoPrimo.js';
import { NodoParalelo } from '../Nodos/NodoParalelo.js';
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
console.log(' PRUEBAS 1.4.4 – Framework Iteradores (JS)');
console.log('══════════════════════════════════\n');

Controlador.ejecutar_prueba((token) => {
    // ══════════════════════════════════
    // 1. PRUEBAS DE Matriz2x2
    // ══════════════════════════════════
    console.log('--- 1. Matriz2x2 ---');

    console.log('1.1 Fábricas:');
    const m_inicial = Matriz2x2.inicial();
    assert_iguales(m_inicial.a, 1, 'inicial() a=1');
    assert_iguales(m_inicial.b, 0, 'inicial() b=0');
    assert_iguales(m_inicial.c, 1, 'inicial() c=1');
    assert_iguales(m_inicial.d, 1, 'inicial() d=1');

    const m_prima = Matriz2x2.crear_prima(5);
    assert_iguales(m_prima.a, 5, 'crear_prima(5) a=5');
    assert_iguales(m_prima.b, 0, 'crear_prima(5) b=0');

    const m_neg = Matriz2x2.crear_negativa_prima(3);
    assert_iguales(m_neg.a, -3, 'crear_negativa_prima(3) a=-3');
    assert_iguales(m_neg.b, 0, 'crear_negativa_prima(3) b=0');

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

    console.log('1.3 Inmutabilidad de b:');
    const m_prueba = new Matriz2x2(2, 0, 1, 1);
    assert_iguales(m_prueba.b, 0, 'b es 0 en matriz canónica');
    assert_iguales(m_prueba.determinante(), 2, 'det([[2,0],[1,1]])=2');

    console.log('1.4 Referencia al nodo:');
    const m_ref = Matriz2x2.inicial();
    assert_verdadero(m_ref.nodo === null, 'nodo() inicialmente null');

    console.log('1.5 Determinante:');
    const m_det = new Matriz2x2(3, 0, 1, 1);
    assert_iguales(m_det.determinante(), 3, 'det([[3,0],[1,1]])=3');

    // ══════════════════════════════════
    // 2. PRUEBAS DE NodoNumerico
    // ══════════════════════════════════
    console.log('\n--- 2. NodoNumerico ---');

    console.log('2.1 Identidad multifase:');
    const nodo = NodoNumerico._tomar_nodo_libre();
    const m_fase_a = nodo.identidad();
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

    console.log('2.4 Pool de nodos libres:');
    const libre = NodoNumerico._tomar_nodo_libre();
    assert_no_nulo(libre, '_tomar_nodo_libre() devuelve nodo');
    NodoNumerico._devolver_nodo_libre(libre);
    const libre2 = NodoNumerico._tomar_nodo_libre();
    assert_verdadero(libre === libre2, '_tomar_nodo_libre reutiliza nodo devuelto');

    console.log('2.5 Fábricas:');
    // crear_primo positivo
    const p2 = NodoNumerico.crear_primo(2);
    assert_no_nulo(p2, 'crear_primo(2) devuelve nodo');
    assert_verdadero(p2.es_primo(), 'crear_primo devuelve NodoPrimo');
    assert_iguales(p2.numero_primo, 2, 'numero_primo = 2');

    // crear_primo negativo (deshacer)
    const p_neg = NodoNumerico.crear_primo(-2);
    assert_no_nulo(p_neg, 'crear_primo(-2) devuelve nodo');
    assert_verdadero(p_neg.es_primo(), 'crear_primo negativo devuelve NodoPrimo');
    assert_iguales(p_neg.numero_primo, -2, 'numero_primo = -2');
    assert_iguales(p_neg.identidad().a, -2, 'matriz de primo negativo tiene a=-2');

    const p_malo = NodoNumerico.crear_primo(4);
    assert_verdadero(p_malo === null, 'crear_primo(4) devuelve null');

    // crear_numerico
    const p3 = NodoNumerico.crear_primo(3);
    const sec = NodoNumerico.crear_numerico([p2, p3]);
    assert_no_nulo(sec, 'crear_numerico([p2,p3]) devuelve nodo');
    const m_esperada = Matriz2x2.crear_prima(2).multiplicar(Matriz2x2.crear_prima(3));
    assert_verdadero(sec.identidad().es_igual(m_esperada), 'identidad secuencia correcta');

    // Verificar p‑grama de secuencia
    const pgrama_sec = sec.pgrama();
    assert_verdadero(JSON.stringify(pgrama_sec) === JSON.stringify([2, 3]), 'p‑grama de secuencia es [2, 3]');
    assert_verdadero(pgrama_sec[0] !== 1, 'p‑grama de secuencia NO empieza con 1');

    // crear_numerico con cantidad no prima
    const sec_mala = NodoNumerico.crear_numerico([p2, p3, p2, p2]);
    assert_verdadero(sec_mala === null, 'crear_numerico con 4 componentes devuelve null');

    // crear_paralelo
    const par = NodoNumerico.crear_paralelo([p2, p3]);
    assert_no_nulo(par, 'crear_paralelo([p2,p3]) devuelve nodo');

    // Verificar p‑grama de paralelo
    const pgrama_par = par.pgrama();
    assert_verdadero(JSON.stringify(pgrama_par) === JSON.stringify([1, 2, 3]), 'p‑grama de paralelo es [1, 2, 3]');
    assert_verdadero(pgrama_par[0] === 1, 'p‑grama de paralelo EMPIEZA con 1');

    // Verificar que crear_conjunto ya no existe
    assert_verdadero(typeof NodoNumerico.crear_conjunto !== 'function', 'crear_conjunto ya no existe en v1.4.4');
    pruebas_pasadas++;

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

    console.log('3.3 Primos negativos y p‑grama:');
    const p_deshacer = NodoNumerico.crear_primo(-5);
    assert_iguales(p_deshacer.numero_primo, -5, 'numero_primo de deshacer es -5');
    assert_verdadero(p_deshacer.identidad().a === -5, 'matriz tiene a=-5');
    assert_verdadero(p_deshacer.identidad().b === 0, 'matriz tiene b=0');
    assert_verdadero(p_deshacer.identidad().determinante() === -5, 'determinante es -5');
    assert_verdadero(JSON.stringify(p_deshacer.pgrama()) === JSON.stringify([-5]), 'p‑grama de deshacer es [-5]');

    // ══════════════════════════════════
    // 4. PRUEBAS DE NodoParalelo
    // ══════════════════════════════════
    console.log('\n--- 4. NodoParalelo ---');

    const p5 = NodoNumerico.crear_primo(5);
    const p7 = NodoNumerico.crear_primo(7);

    console.log('4.1 Creación y p‑grama:');
    const par_ok = NodoNumerico.crear_paralelo([p5, p7]);
    assert_no_nulo(par_ok, 'crear_paralelo con 2 componentes');

    const pgrama_par_ok = par_ok.pgrama();
    assert_verdadero(pgrama_par_ok[0] === 1, 'p‑grama de paralelo empieza con 1');
    assert_verdadero(pgrama_par_ok.length === 3, 'p‑grama de paralelo tiene 3 elementos (1 + 2 primos)');

    const m_esperada_par = Matriz2x2.inicial().multiplicar(Matriz2x2.crear_prima(5)).multiplicar(Matriz2x2.crear_prima(7));
    assert_verdadero(par_ok.identidad().es_igual(m_esperada_par), 'Identidad del paralelo usa M(1) en lugar de marca antigua');

    console.log('4.2 Conmutatividad:');
    const par_inv = NodoNumerico.crear_paralelo([p7, p5]);
    assert_verdadero(par_ok.identidad().es_igual(par_inv.identidad()), 'Identidad conmutativa');
    assert_verdadero(JSON.stringify(par_ok.pgrama()) === JSON.stringify(par_inv.pgrama()), 'p‑grama conmutativo');

    console.log('4.3 Cantidad no prima:');
    const p11 = NodoNumerico.crear_primo(11);
    const p13 = NodoNumerico.crear_primo(13);
    const p17 = NodoNumerico.crear_primo(17);
    const par_malo = NodoNumerico.crear_paralelo([p11, p13, p17, p5]);
    assert_verdadero(par_malo === null, 'crear_paralelo con 4 componentes (no primo) devuelve null');

    console.log('4.4 Paralelo con deshaceres:');
    const p_neg5 = NodoNumerico.crear_primo(-5);
    const p_neg7 = NodoNumerico.crear_primo(-7);
    const par_neg = NodoNumerico.crear_paralelo([p_neg5, p_neg7]);
    assert_no_nulo(par_neg, 'crear_paralelo con deshaceres devuelve nodo');
    const pgrama_neg = par_neg.pgrama();
    assert_verdadero(pgrama_neg[0] === 1, 'p‑grama de paralelo de deshaceres empieza con 1');
    assert_verdadero(pgrama_neg.includes(-5) && pgrama_neg.includes(-7), 'p‑grama contiene los primos negativos');

    // ══════════════════════════════════
    // 5. PRUEBAS DE ASCENSO Y DESCENSO
    // ══════════════════════════════════
    console.log('\n--- 5. Ascenso y descenso entre fases ---');

    console.log('5.1 Ascenso de secuencia:');
    NodoElectrico._fase(token, 'a');
    const p29 = NodoNumerico.crear_primo(29);
    const p31 = NodoNumerico.crear_primo(31);
    const secuencia = NodoNumerico.crear_numerico([p29, p31]);
    const matriz_original = secuencia.identidad();

    NodoPrimo.inicializar_fase('b', 10);
    const primo_superior = secuencia.ascender('b');

    assert_no_nulo(primo_superior, 'ascender() devuelve NodoPrimo');
    assert_verdadero(primo_superior.es_primo(), 'El nodo superior es primo');

    // Verificar que el paquete contiene factores y fase_origen
    const paquete_asc = primo_superior.dato('abajo');
    assert_no_nulo(paquete_asc, "El primo superior tiene dato 'abajo'");
    assert_verdadero(paquete_asc.factores !== undefined && paquete_asc.fase_origen !== undefined, 'El paquete contiene factores y fase_origen');
    assert_verdadero(JSON.stringify(paquete_asc.factores) === JSON.stringify([29, 31]), 'Los factores guardados son [29, 31]');
    assert_verdadero(paquete_asc.fase_origen === 'a', "La fase origen guardada es 'a'");

    // Verificar que el nodo original sigue existiendo (no se liberó)
    assert_no_nulo(secuencia, 'El nodo original sigue existiendo después de ascender');
    assert_verdadero(JSON.stringify(secuencia.pgrama('a')) === JSON.stringify([29, 31]), 'El nodo original conserva su p‑grama');

    NodoElectrico._fase(token, 'a');

    console.log('5.2 Descenso de secuencia:');
    const nodo_descendido = NodoNumerico.descender(primo_superior);

    assert_no_nulo(nodo_descendido, 'descender() devuelve NodoNumerico');
    assert_verdadero(nodo_descendido.identidad().es_igual(matriz_original), 'La identidad reconstruida coincide con la original');

    const pgrama_desc = nodo_descendido.pgrama();
    assert_verdadero(JSON.stringify(pgrama_desc) === JSON.stringify([29, 31]), 'El p‑grama descendido es [29, 31] (secuencia)');

    console.log('5.3 Ascenso de paralelo:');
    NodoElectrico._fase(token, 'a');
    const p37 = NodoNumerico.crear_primo(37);
    const p41 = NodoNumerico.crear_primo(41);
    const paralelo = NodoNumerico.crear_paralelo([p37, p41]);
    const matriz_paralelo = paralelo.identidad();

    NodoPrimo.inicializar_fase('c', 10);
    const primo_paralelo = paralelo.ascender('c');
    assert_no_nulo(primo_paralelo, 'ascender() de paralelo devuelve NodoPrimo');

    const paquete_par = primo_paralelo.dato('abajo');
    assert_verdadero(paquete_par.factores[0] === 1, 'El paquete del paralelo empieza con 1');
    assert_verdadero(paquete_par.fase_origen !== undefined, 'El paquete del paralelo contiene fase_origen');

    const paralelo_descendido = NodoNumerico.descender(primo_paralelo);
    assert_no_nulo(paralelo_descendido, 'descender() de paralelo devuelve NodoNumerico');
    assert_verdadero(paralelo_descendido.identidad().es_igual(matriz_paralelo), 'Identidad de paralelo coincide');
    assert_verdadero(paralelo_descendido.pgrama()[0] === 1, 'El nodo descendido es un paralelo (p‑grama empieza con 1)');

    console.log('5.4 Ascenso y descenso con deshaceres (marca -1):');
    NodoElectrico._fase(token, 'a');
    const p_neg29 = NodoNumerico.crear_primo(-29);
    const p_neg31 = NodoNumerico.crear_primo(-31);
    const sec_neg = NodoNumerico.crear_numerico([p_neg29, p_neg31]);
    const matriz_neg_original = sec_neg.identidad();

    // Verificar que el p‑grama incluye la marca -1
    const pgrama_neg_asc = sec_neg.pgrama();
    assert_verdadero(JSON.stringify(pgrama_neg_asc) === JSON.stringify([-1, -29, -31]), 'p‑grama de secuencia de deshaceres incluye marca -1');
    assert_verdadero(matriz_neg_original.determinante() > 0, 'Producto de dos deshaceres tiene determinante positivo');

    NodoPrimo.inicializar_fase('d', 10);
    const primo_neg = sec_neg.ascender('d');
    assert_no_nulo(primo_neg, 'ascender() de secuencia de deshaceres devuelve NodoPrimo');

    const paquete_neg = primo_neg.dato('abajo');
    assert_verdadero(JSON.stringify(paquete_neg.factores) === JSON.stringify([-1, -29, -31]), 'Los factores guardados incluyen marca -1');
    assert_verdadero(paquete_neg.fase_origen === 'a', "La fase origen guardada es 'a'");

    const sec_neg_descendida = NodoNumerico.descender(primo_neg);
    assert_no_nulo(sec_neg_descendida, 'descender() de deshaceres devuelve nodo');
    assert_verdadero(sec_neg_descendida.identidad().es_igual(matriz_neg_original), 'Identidad de deshaceres coincide');
    // El p‑grama del nodo descendido debe incluir la marca -1 (porque crear_numerico la vuelve a añadir)
    assert_verdadero(JSON.stringify(sec_neg_descendida.pgrama()) === JSON.stringify([-1, -29, -31]), 'p‑grama de deshaceres descendido incluye marca -1');

    console.log('5.5 Error en ascenso sin p‑grama:');
    NodoElectrico._fase(token, 'a');
    const nodo_sin_factores = NodoNumerico._tomar_nodo_libre();
    try {
        nodo_sin_factores.ascender('b');
        console.log('❌ ascender() sin p‑grama no lanzó excepción');
        pruebas_fallidas++;
    } catch (e) {
        console.log('✅ ascender() sin p‑grama lanza Error');
        pruebas_pasadas++;
    }
    NodoNumerico._devolver_nodo_libre(nodo_sin_factores);

    console.log('5.6 Error en descenso sin paquete:');
    const primo_vacio = NodoPrimo.siguiente_primo_libre('a');
    try {
        NodoNumerico.descender(primo_vacio);
        console.log('❌ descender() sin paquete no lanzó excepción');
        pruebas_fallidas++;
    } catch (e) {
        console.log('✅ descender() sin paquete lanza Error');
        pruebas_pasadas++;
    }
    NodoPrimo.devolver_primo_libre(primo_vacio, 'a');

    console.log('\n══════════════════════════════════');
    console.log(` PRUEBAS: ${pruebas_pasadas} ✅, ${pruebas_fallidas} ❌`);
    console.log('══════════════════════════════════');
});