/**
 * Contrato para el motor de ejecución del sistema.
 *
 * El motor es el componente encargado de planificar y ejecutar
 * periódicamente los comandos pendientes en cada fase del sistema.
 * Funciona con un ritmo configurable (ciclos por minuto), un
 * planificador round‑robin (péndulo) y soporte para pausas urgentes.
 *
 * ## Propósito de la interfaz
 *
 * Esta clase existe para documentar y homogeneizar los métodos
 * que el {@link Controlador} expone para controlar el ciclo de vida
 * del motor. Por ahora, solo el `Controlador` la extiende.
 *
 * @class Motor
 * @since 1.3.7
 * @version 1.3.8
 */
class Motor {
    /**
     * Inicia el motor de ejecución.
     *
     * Si el motor ya está activo o pausado, no hace nada.
     * Arranca el bucle principal que se ejecuta periódicamente
     * según {@link Conf.MOTOR_INTERVALO_MS}.
     *
     * @returns {void}
     */
    static _iniciar_motor() {
        throw new Error('Método _iniciar_motor() debe ser implementado.');
    }

    /**
     * Pausa el motor por solicitud explícita.
     *
     * @returns {void}
     */
    static _pausar_motor() {
        throw new Error('Método _pausar_motor() debe ser implementado.');
    }

    /**
     * Reanuda el motor tras una pausa explícita.
     *
     * @returns {void}
     */
    static _reanudar_motor() {
        throw new Error('Método _reanudar_motor() debe ser implementado.');
    }

    /**
     * Detiene el motor completamente.
     *
     * @returns {void}
     */
    static _detener_motor() {
        throw new Error('Método _detener_motor() debe ser implementado.');
    }

    /**
     * Pausa el motor de forma urgente.
     *
     * Se programa una reanudación automática tras
     * {@link Conf.MOTOR_PAUSA_URGENTE_TIMEOUT_S} segundos si la pausa
     * no se levanta antes.
     *
     * @param {string} [razon=''] Motivo de la pausa.
     * @returns {void}
     */
    static _pausar_urgente(razon = '') {
        throw new Error('Método _pausar_urgente() debe ser implementado.');
    }

    /**
     * Añade un comando a la cola de una fase.
     *
     * Si la fase no existe, se crea automáticamente.
     *
     * @param {string}   fase    Identificador de la fase.
     * @param {Function} comando Función a ejecutar.
     * @returns {void}
     * @since 1.3.8
     */
    static encolar_comando_en_fase(fase, comando) {
        throw new Error('Método encolar_comando_en_fase() debe ser implementado.');
    }
}
export {Motor}