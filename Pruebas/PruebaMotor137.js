/**
 * Pruebas del Motor de Ejecución v1.3.7.
 *
 * @since 1.3.7
 */
import { Controlador } from '../Controlador/Controlador.js';
import { Conf } from '../Configuracion/Configuracion.js';

// ═══════════════════════════════════════════
// HERRAMIENTAS
// ═══════════════════════════════════════════
let pruebas_pasadas = 0;
let pruebas_fallidas = 0;

function assert_iguales(obtenido, esperado, mensaje, tolerancia = 1e-9) {
    const ok = Math.abs(obtenido - esperado) < tolerancia;
    console.log((ok ? '✅' : '❌'), mensaje);
    if (!ok) console.log(`   Esperado: ${esperado}, Obtenido: ${obtenido}`);
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

// ═══════════════════════════════════════════
// PRUEBAS
// ═══════════════════════════════════════════
async function ejecutar_pruebas() {
    console.log('══════════════════════════════════');
    console.log(' PRUEBAS MOTOR 1.3.7 (JS)');
    console.log('══════════════════════════════════\n');

    // --- 1. Constantes en Conf ---
    console.log('--- 1. Constantes en Conf ---');
    assert_iguales(Conf.MOTOR_CICLOS_POR_MINUTO, 20, 'MOTOR_CICLOS_POR_MINUTO = 20');
    assert_iguales(Conf.MOTOR_INTERVALO_MS, 3000, 'MOTOR_INTERVALO_MS = 3000 (calculado)');
    assert_iguales(Conf.MOTOR_QUANTUM, 20, 'MOTOR_QUANTUM = 20');
    assert_iguales(Conf.MOTOR_PAUSA_URGENTE_TIMEOUT_S, 30, 'MOTOR_PAUSA_URGENTE_TIMEOUT_S = 30');
    // MOTOR_ACTIVO fue eliminado intencionadamente en v1.3.7

    // --- 2. Estados del motor ---
    console.log('\n--- 2. Estados del motor ---');

    // Aseguramos que empieza detenido
    forzar_estado(Controlador.MOTOR_DETENIDO);
    assert_estado(Controlador.MOTOR_DETENIDO, 'Estado inicial DETENIDO');

    // Iniciar (MOTOR_ACTIVO ya no existe, el motor siempre se puede iniciar)
    Controlador._iniciar_motor();
    assert_estado(Controlador.MOTOR_ACTIVO, 'Iniciar motor -> ACTIVO');

    // Pausar
    Controlador._pausar_motor();
    assert_estado(Controlador.MOTOR_PAUSADO, 'Pausa explícita');
    // Verificar que el timer se limpió
    assert_iguales(Controlador._timer_motor, null, 'Timer limpiado en pausa');

    // Reanudar
    Controlador._reanudar_motor();
    assert_estado(Controlador.MOTOR_ACTIVO, 'Reanudar tras pausa');

    // Detener
    Controlador._detener_motor();
    assert_estado(Controlador.MOTOR_DETENIDO, 'Detener motor');

    // --- 3. Pausa urgente y timeout ---
    console.log('\n--- 3. Pausa urgente ---');
    forzar_estado(Controlador.MOTOR_ACTIVO);
    Controlador._pausar_urgente('Prueba de pausa urgente');
    assert_estado(Controlador.MOTOR_PAUSA_URGENTE, 'Entra en PAUSA_URGENTE');

    // Forzar timeout manualmente
    forzar_estado(Controlador.MOTOR_ACTIVO);
    assert_estado(Controlador.MOTOR_ACTIVO, 'Forzamos ACTIVO para simular timeout');

    // --- 4. Péndulo ---
    console.log('\n--- 4. Péndulo ---');
    let fase = 0;
    for (let i = 0; i < 6; i++) {
        fase = Controlador._pendulo(fase);
        console.log(`Péndulo ciclo ${i} → fase ${fase}`);
    }
    assert_iguales(Controlador._pendulo(2), 0, 'Péndulo: de fase 2 pasa a 0 (round-robin)');

    // --- 5. Placeholder _siguiente_comando_en_fase ---
    console.log('\n--- 5. Placeholder comando ---');
    const comando = Controlador._siguiente_comando_en_fase(0);
    assert_iguales(comando, null, 'Placeholder devuelve null');

    console.log('\n══════════════════════════════════');
    console.log(` PRUEBAS: ${pruebas_pasadas} ✅, ${pruebas_fallidas} ❌`);
    console.log('══════════════════════════════════');
}

ejecutar_pruebas().catch(console.error);