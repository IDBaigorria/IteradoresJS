import { Matriz2x2 } from "../Nodos/Matriz2x2.js";
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

function assert_verdadero(valor, mensaje) {
    const ok = !!valor;
    console.log((ok ? '✅' : '❌'), mensaje);
    ok ? pruebas_pasadas++ : pruebas_fallidas++;
}

function assert_excepcion(funcion, mensaje) {
    try {
        funcion();
        console.log('❌', mensaje, '— no se lanzó excepción');
        pruebas_fallidas++;
        return false;
    } catch (e) {
        console.log('✅', mensaje, '(excepción capturada)');
        pruebas_pasadas++;
        return true;
    }
}

console.log('══════════════════════════════════');
console.log(' PRUEBAS Matriz2x2 1.4.0 (JS)');
console.log('══════════════════════════════════\n');

// ─── 1. Constructor y getters ─────────────────────────
console.log('--- 1. Constructor y acceso a componentes ---');
const m = new Matriz2x2(2, 0, 1, 1);
assert_iguales(m.a, 2, 'a = 2');
assert_iguales(m.b, 0, 'b = 0');
assert_iguales(m.c, 1, 'c = 1');
assert_iguales(m.d, 1, 'd = 1');

// ─── 2. Fábrica neutra() ─────────────────────────────
console.log('\n--- 2. Matriz neutra ---');
const neutra = Matriz2x2.neutra();
assert_iguales(neutra.a, 1, 'neutra a = 1');
assert_iguales(neutra.d, 1, 'neutra d = 1');
assert_iguales(neutra.b, 0, 'neutra b = 0');
assert_iguales(neutra.c, 0, 'neutra c = 0');
assert_verdadero(neutra.es_igual(new Matriz2x2(1,0,0,1)), 'neutra es igual a [[1,0],[0,1]]');

// ─── 3. crear_prima() ─────────────────────────────────
console.log('\n--- 3. Matriz canónica de primo ---');
const p2 = Matriz2x2.crear_prima(2);
assert_iguales(p2.a, 2, 'primo 2: a');
assert_iguales(p2.b, 0, 'primo 2: b');
assert_iguales(p2.c, 1, 'primo 2: c');
assert_iguales(p2.d, 1, 'primo 2: d');

const p3 = Matriz2x2.crear_prima(3);
assert_iguales(p3.a, 3, 'primo 3: a');

// ─── 4. desde_array() ─────────────────────────────────
console.log('\n--- 4. Fábrica desde_array ---');
const arr = Matriz2x2.desde_array([5,1,2,3]);
assert_iguales(arr.a, 5, 'desde_array a');
assert_iguales(arr.d, 3, 'desde_array d');

// Caso inválido
assert_excepcion(() => Matriz2x2.desde_array([1,2,3]), 'desde_array con 3 elementos lanza excepción');

// ─── 5. multiplicar() ─────────────────────────────────
console.log('\n--- 5. Multiplicación ---');
const A = new Matriz2x2(1, 2, 3, 4);
const B = new Matriz2x2(5, 6, 7, 8);
const C = A.multiplicar(B);
assert_iguales(C.a, 19, 'producto a');
assert_iguales(C.b, 22, 'producto b');
assert_iguales(C.c, 43, 'producto c');
assert_iguales(C.d, 50, 'producto d');

// No conmutatividad
const m2 = Matriz2x2.crear_prima(2);
const m3 = Matriz2x2.crear_prima(3);
const m23 = m2.multiplicar(m3);
const m32 = m3.multiplicar(m2);
assert_iguales(m23.determinante(), 6, 'det(2*3) = 6');
assert_iguales(m32.determinante(), 6, 'det(3*2) = 6');
assert_verdadero(!m23.es_igual(m32), 'M(2)*M(3) != M(3)*M(2)');
assert_iguales(m23.c, 4, '2*3 entrada c');
assert_iguales(m32.c, 3, '3*2 entrada c');

// Multiplicación por neutra
const prod = A.multiplicar(neutra);
assert_verdadero(prod.es_igual(A), 'A * neutra = A');
const prod2 = neutra.multiplicar(A);
assert_verdadero(prod2.es_igual(A), 'neutra * A = A');

// ─── 6. determinante() ────────────────────────────────
console.log('\n--- 6. Determinante ---');
assert_iguales(neutra.determinante(), 1, 'det(neutra) = 1');
assert_iguales(m2.determinante(), 2, 'det(primo 2) = 2');
const m6a = m2.multiplicar(m3);
assert_iguales(m6a.determinante(), 6, 'det(2*3) = 6');
const mDiag = new Matriz2x2(10, 0, 0, 5);
assert_iguales(mDiag.determinante(), 50, 'det diagonal 10,0,0,5 = 50');

// ─── 7. es_igual() ────────────────────────────────────
console.log('\n--- 7. Igualdad ---');
assert_verdadero(new Matriz2x2(1,2,3,4).es_igual(new Matriz2x2(1,2,3,4)), 'Matrices iguales');
assert_verdadero(!new Matriz2x2(1,2,3,4).es_igual(new Matriz2x2(1,2,3,5)), 'Matrices diferentes');

// ─── 8. toString() ────────────────────────────────────
console.log('\n--- 8. Representación en string ---');
let str = m2.toString();
assert_iguales(str, '[[2,0],[1,1]]', 'toString M(2)');
str = m23.toString();
assert_iguales(str, '[[6,0],[4,1]]', 'toString M(2)*M(3)');

// ─── 9. siguiente_numero_primo() ──────────────────────
console.log('\n--- 9. Siguiente número primo ---');
assert_iguales(Matriz2x2.siguiente_numero_primo(1), 2, 'después de 1 -> 2');
assert_iguales(Matriz2x2.siguiente_numero_primo(2), 3, 'después de 2 -> 3');
assert_iguales(Matriz2x2.siguiente_numero_primo(3), 5, 'después de 3 -> 5');
assert_iguales(Matriz2x2.siguiente_numero_primo(10), 11, 'después de 10 -> 11');
assert_iguales(Matriz2x2.siguiente_numero_primo(100), 101, 'después de 100 -> 101');

// ─── 10. Estabilidad ──────────────────────────────────
console.log('\n--- 10. Pruebas de estabilidad ---');
const p97 = Matriz2x2.siguiente_numero_primo(96);
assert_iguales(p97, 97, 'primo después de 96 es 97');

const neg = new Matriz2x2(-1, 0, 0, 1);
assert_iguales(neg.determinante(), -1, 'det con entrada negativa');

console.log('\n══════════════════════════════════');
console.log(` PRUEBAS: ${pruebas_pasadas} ✅, ${pruebas_fallidas} ❌`);
console.log('══════════════════════════════════');