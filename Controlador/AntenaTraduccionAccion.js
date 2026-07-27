import { Objeto } from '../Nucleo/Objeto.js';
import { SenalAccion } from '../Iteradores/SenalAccion.js';

/**
 * Antena de Traducción de Acción – Convierte verbos en señales de acción y viceversa.
 *
 * ## Responsabilidad
 * Actúa como puente entre el {@link Controlador} y el sistema interno de
 * {@link SenalAccion}. No es multifase ni mantiene estado; simplemente
 * traduce valores enteros de verbo a objetos {@link SenalAccion} y extrae
 * el verbo de señales recibidas.
 *
 * Pertenece al ámbito del Controlador, de forma análoga a
 * {@link AntenaTraduccion} para señales matriciales.
 *
 * ## Constructor
 * Recibe un `origen` que se asignará como {@link SenalAccion#fase_origen}
 * en todas las señales que emita.
 *
 * ## Métodos
 * - {@link AntenaTraduccionAccion#traducir_a_senal}: crea una {@link SenalAccion} a partir de un verbo.
 * - {@link AntenaTraduccionAccion#traducir_a_verbo}: extrae el verbo de una {@link SenalAccion}.
 *
 * @class AntenaTraduccionAccion
 * @extends Objeto
 * @since 1.4.9
 * @version 1.4.9
 * @see SenalAccion
 * @see AntenaTraduccion
 */
export class AntenaTraduccionAccion extends Objeto {
    /**
     * Identificador de origen para las señales emitidas.
     * @type {string}
     * @private
     */
    _origen;

    /**
     * Constructor.
     *
     * @param {string} origen Valor para {@link SenalAccion#fase_origen} de las señales emitidas.
     */
    constructor(origen) {
        super();
        this._origen = origen;
    }

    /**
     * Traduce un verbo entero a una señal de acción.
     *
     * @param {number} verbo Constante de verbo (ej. {@link Conf#VERBO_APRENDER}).
     * @returns {SenalAccion} Señal de acción lista para ser enviada al sistema.
     * @since 1.4.9
     */
    traducir_a_senal(verbo) {
        return new SenalAccion(verbo, this._origen);
    }

    /**
     * Extrae el verbo de una señal de acción.
     *
     * @param {SenalAccion} senal Señal de acción recibida.
     * @returns {number} Verbo contenido en la señal.
     * @since 1.4.9
     */
    traducir_a_verbo(senal) {
        return senal.verbo();
    }
}