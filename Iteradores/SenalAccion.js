import { Objeto } from '../Nucleo/Objeto.js';

/**
 * Señal de Acción – Comunica la intención de un Iterador.
 *
 * A diferencia de la {@link Senal}, que transporta matrices de identidad,
 * una Señal de Acción porta únicamente un **verbo** (número entero constante)
 * y la fase de origen. Este verbo indica al Iterador receptor qué operación
 * debe prepararse para ejecutar (por ejemplo, {@link Conf#VERBO_APRENDER},
 * {@link Conf#VERBO_EJECUTAR}, o el cierre {@link Conf#VERBO_CIERRE}).
 *
 * Las señales de acción son generadas y consumidas exclusivamente por la
 * {@link AntenaAccion}, que mantiene un registro de la acción actual en
 * cada fase. No contienen matrices ni se procesan por las antenas comunes
 * o de marcado.
 *
 * ## Propiedades
 * - `verbo` (number): constante de acción definida en {@link Conf}.
 * - `fase_origen` (string): fase completa desde la que se emite la señal.
 *
 * @author Ignacio David Baigorria
 *
 * @class SenalAccion
 * @extends Objeto
 * @since 1.4.9
 * @version 1.4.9
 * @see AntenaAccion
 * @see Conf
 */
export class SenalAccion extends Objeto {
    /**
     * Verbo de acción (constante entera).
     * @type {number}
     * @private
     */
    _verbo;

    /**
     * Fase completa desde la que fue emitida esta señal
     * (ej. `'Talamo:0'`).
     * @type {string}
     * @private
     */
    _fase_origen;

    /**
     * Constructor.
     *
     * @param {number} verbo       Verbo de acción (constante definida en {@link Conf}).
     * @param {string} fase_origen Fase desde la que se emite la señal (formato `dominio:numero`).
     */
    constructor(verbo, fase_origen) {
        super();
        this._verbo       = verbo;
        this._fase_origen = fase_origen;
    }

    /**
     * Devuelve el verbo de acción.
     *
     * @returns {number} Verbo constante.
     * @since 1.4.9
     */
    verbo() {
        return this._verbo;
    }

    /**
     * Devuelve la fase de origen de la señal.
     *
     * @returns {string} Fase completa (ej. `'Talamo:0'`).
     * @since 1.4.9
     */
    fase_origen() {
        return this._fase_origen;
    }
}