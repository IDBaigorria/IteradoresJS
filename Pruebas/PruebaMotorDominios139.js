import { Controlador } from '../Controlador/Controlador.js';
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

function assert_estado(esperado, mensaje) {
    const actual = Controlador._estado_motor;
    const ok = actual === esperado;
    console.log((ok ? '✅' : '❌'), mensaje, `(estado: ${actual})`);
    ok ? pruebas_pasadas++ : pruebas_fallidas++;
}

function forzar_estado(nuevo_estado) {
    Controlador._estado_motor = nuevo_estado;
}

// Limpiar colas y estado
Controlador._colas_comandos = {};
Controlador._dominio_actual = null;
forzar_estado(Controlador.MOTOR_DETENIDO);

console.log('══════════════════════════════════');
console.log(' PRUEBAS 1.3.9 (JS)');
console.log('══════════════════════════════════\n');

// --- 1. Encolar y ejecutar ---
console.log('--- 1. Encolar y ejecutar ---');
Controlador.encolar_comando_en_fase('0', 'depuracion:imprimir', '--errores');
const entrada = Controlador._siguiente_comando_en_fase('0');
assert_no_nulo(entrada, 'Comando encolado extraído');
assert_iguales(entrada[0], 'depuracion:imprimir', 'Nombre del comando correcto');

// --- 2. Modo dominio ---
console.log('\n--- 2. Modo dominio ---');
Controlador._colas_comandos = {};
Controlador.encolar_comando_en_fase('html:0', 'dominio:leer_byte');
Controlador.encolar_comando_en_fase('html:1', 'dominio:leer_byte');
Controlador.encolar_comando_en_fase('talamo:0', 'dominio:escribir_byte');

Controlador._activar_dominio('html');
let fase = Controlador._pendulo(null);
assert_iguales(fase, 'html:0', 'Modo html: primera fase html:0');
fase = Controlador._pendulo(fase);
assert_iguales(fase, 'html:1', 'Modo html: segunda fase html:1');
fase = Controlador._pendulo(fase);
assert_iguales(fase, 'html:0', 'Modo html: vuelve a html:0');

Controlador._desactivar_dominio();
fase = Controlador._pendulo(null);
assert_iguales(fase, 'html:0', 'Global: primera fase ordenada');

// --- 3. Detención automática ---
console.log('\n--- 3. Detención automática ---');
Controlador._colas_comandos = {};
forzar_estado(Controlador.MOTOR_ACTIVO);
Controlador._bucle_motor();
assert_estado(Controlador.MOTOR_DETENIDO, 'Motor se detiene automáticamente');

// --- 4. Reversa del motor ---
console.log('\n--- 4. Reversa del motor ---');
Controlador._colas_comandos = {};
Controlador._estado_motor = Controlador.MOTOR_ACTIVO;

Controlador.encolar_comando_en_fase('0', 'prueba:crear_nodo', 'Nodo de prueba');

// Ejecutar un ciclo del motor
Controlador._bucle_motor();

// Verificar que se detuvo
assert_estado(Controlador.MOTOR_DETENIDO, 'Motor detenido automáticamente');

const resultado_reversa = Controlador.deshacer_motor();
assert_no_nulo(resultado_reversa, 'deshacer_motor devuelve un resultado');
const ok_reversa = typeof resultado_reversa === 'string' && resultado_reversa.includes('eliminado por reversa');
console.log((ok_reversa ? '✅' : '❌'), 'La reversa eliminó el nodo correctamente');
if (!ok_reversa) console.log(`   Resultado obtenido: ${resultado_reversa}`);

console.log('\n══════════════════════════════════');
console.log(` PRUEBAS: ${pruebas_pasadas} ✅, ${pruebas_fallidas} ❌`);
console.log('══════════════════════════════════');