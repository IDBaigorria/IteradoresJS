/**
 * Contrato para una compuerta talámica de comunicación.
 *
 * Una compuerta es el traductor entre el formato nativo de un medio
 * (bytes, streams, líneas de texto, etc.) y el lenguaje común de los
 * dominios: las señales compuestas de matrices 2×2.
 *
 * Cada comunicador incorpora dos compuertas –entrada y salida– que
 * implementan esta interfaz:
 *
 * - **Compuerta de entrada:** convierte los datos crudos del medio en
 *   una señal lista para ser procesada por un
 *   {@link ProcesadorDeDominio}.
 * - **Compuerta de salida:** toma una señal ya procesada y la traduce
 *   en comandos atómicos del sistema que el motor ejecutará en la fase
 *   de salida correspondiente.
 *
 * ## Responsabilidades
 *
 * - **descomponer:** analizar el formato nativo y mapear cada unidad
 *   atómica (byte, carácter, etc.) a su matriz prima canónica,
 *   construyendo una señal cruda.
 * - **recomponer:** recorrer los elementos procesados de una señal
 *   (matrices sueltas y patrones), descomponer recursivamente los
 *   patrones hasta sus primos atómicos, y generar comandos del sistema
 *   (p. ej. `['escribir_byte', 65]`) listos para ser encolados.
 *
 * @author Ignacio David Baigorria
 * 
 * @interface
 * @since 1.4.6
 * @version 1.4.6
 * @see Senal
 * @see ProcesadorDeDominio
 * @see Comunicador
 */
class CompuertaDominio {
    /**
     * Traduce datos nativos del comunicador a una señal matricial.
     *
     * @param {*} entrada_nativa Datos en el formato propio del comunicador.
     * @returns {Senal} Señal lista para ser procesada por un dominio.
     * @abstract
     */
    descomponer(entrada_nativa) {
        throw new Error('Método descomponer() debe ser implementado.');
    }

    /**
     * Convierte una señal procesada en comandos atómicos del sistema.
     *
     * @param {Senal}  procesada Señal ya procesada por un dominio.
     * @param {string} fase      Fase de referencia para obtener las
     *                           matrices de identidad de los patrones.
     * @returns {Array<Array>} Lista de comandos atómicos.
     * @abstract
     */
    recomponer(procesada, fase) {
        throw new Error('Método recomponer() debe ser implementado.');
    }
}

export { CompuertaDominio };