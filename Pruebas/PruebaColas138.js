import { Controlador } from '../Controlador/Controlador.js';

let pruebas_pasadas = 0;
let pruebas_fallidas = 0;

function assert_iguales(obtenido, esperado, mensaje, tolerancia = 1e-9) {
    // Igualdad estricta primero (funciona con strings, números, booleanos, etc.)
    if (obtenido === esperado) {
        console.log('✅', mensaje);
        pruebas_pasadas++;
        return true;
    }
    // Si no son estrictamente iguales, intentar comparación numérica con tolerancia
    if (typeof obtenido === 'number' && typeof esperado === 'number') {
        const ok = Math.abs(obtenido - esperado) < tolerancia;
        console.log((ok ? '✅' : '❌'), mensaje);
        if (!ok) console.log(`   Esperado: ${esperado}, Obtenido: ${obtenido} (tolerancia: ${tolerancia})`);
        ok ? pruebas_pasadas++ : pruebas_fallidas++;
        return ok;
    }
    // Si no son números y no son estrictamente iguales, es un fallo
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

// Limpiar colas
Controlador._colas_comandos = {};

console.log('══════════════════════════════════');
console.log(' PRUEBAS COLAS 1.3.8 (JS)');
console.log('══════════════════════════════════\n');

// --- 1. Encolar y extraer ---
console.log('--- 1. Encolar y extraer ---');
let ejecutado = false;
const cmd = () => { ejecutado = true; return 'ok'; };
Controlador.encolar_comando_en_fase('0', cmd);
const extraido = Controlador._siguiente_comando_en_fase('0');
assert_no_nulo(extraido, 'Se extrae comando encolado');
const resultado = extraido();
assert_iguales(resultado, 'ok', 'Comando se ejecuta correctamente');
assert_iguales(ejecutado, true, 'Efecto del comando confirmado');

// --- 2. Cola vacía ---
console.log('\n--- 2. Cola vacía ---');
const vacio = Controlador._siguiente_comando_en_fase('0');
assert_iguales(vacio, null, 'Cola vacía devuelve null');

// --- 3. Múltiples fases ---
console.log('\n--- 3. Múltiples fases ---');
let contador = 0;
Controlador.encolar_comando_en_fase('0', () => { contador++; });
Controlador.encolar_comando_en_fase('0', () => { contador++; });
Controlador.encolar_comando_en_fase('1', () => { contador += 10; });
const cmd1 = Controlador._siguiente_comando_en_fase('0'); cmd1();
const cmd2 = Controlador._siguiente_comando_en_fase('0'); cmd2();
assert_iguales(contador, 2, 'Dos comandos en fase 0 incrementan contador a 2');
const cmd3 = Controlador._siguiente_comando_en_fase('0');
assert_iguales(cmd3, null, 'Fase 0 ya no existe tras vaciarse');
const cmd4 = Controlador._siguiente_comando_en_fase('1'); cmd4();
assert_iguales(contador, 12, 'Comando en fase 1 suma 10');

// --- 4. Péndulo dinámico ---
console.log('\n--- 4. Péndulo dinámico ---');
Controlador.encolar_comando_en_fase('b', () => {});
Controlador.encolar_comando_en_fase('a', () => {});
Controlador.encolar_comando_en_fase('c', () => {});
let fase = Controlador._pendulo(null);
assert_iguales(fase, 'a', 'Primera fase: a');
fase = Controlador._pendulo(fase);
assert_iguales(fase, 'b', 'Segunda fase: b');
fase = Controlador._pendulo(fase);
assert_iguales(fase, 'c', 'Tercera fase: c');
fase = Controlador._pendulo(fase);
assert_iguales(fase, 'a', 'Vuelta a empezar: a');

console.log('\n══════════════════════════════════');
console.log(` PRUEBAS: ${pruebas_pasadas} ✅, ${pruebas_fallidas} ❌`);
console.log('══════════════════════════════════');