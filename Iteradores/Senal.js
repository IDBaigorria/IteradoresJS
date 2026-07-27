import { Objeto } from '../Nucleo/Objeto.js';
import { Matriz2x2 } from '../Nodos/Matriz2x2.js';

/**
 * Señal – Portadora mínima de matrices de identidad.
 *
 * Encapsula una secuencia de {@link Matriz2x2} e indica la fase de origen
 * y el **tipo de antena** que la emitió. Esta información basta para que
 * cualquier antena receptora determine si la señal le pertenece
 * (común vs. marcado) y desde qué fase fue enviada.
 *
 * ## Campo `marcado`
 *
 * - `true`  : la señal fue emitida por una {@link AntenaDeMarcado}.
 * - `false` : la señal fue emitida por una {@link AntenaComun}.
 *
 * Las antenas receptoras comparan este valor con su propio tipo antes de
 * procesar la señal.
 *
 * ## Campo `fase_origen`
 *
 * Formato `dominio:numero_fase` (ej. `'Talamo:0'`). Es la fase completa
 * desde la que se emitió la señal. En recepción, este valor se utiliza
 * directamente como **par** para indexar los dipolos de la antena.
 *
 * ## Conversiones desde/hacia bytes
 *
 * Las traducciones byte ↔ matriz son responsabilidad exclusiva del
 * {@link Controlador} (a través de sus antenas de traducción) y del
 * Tálamo.
 *
 * @class Senal
 * @extends Objeto
 * @since 1.4.5
 * @version 1.4.8
 */
export class Senal extends Objeto {
    /**
     * Lista de matrices que componen la señal.
     * @type {Matriz2x2[]}
     * @private
     */
    _matrices;

    /**
     * Fase completa desde la que fue emitida esta señal
     * (ej. `'Talamo:0'`).
     * @type {string}
     * @private
     * @since 1.4.8
     */
    _fase_origen;

    /**
     * Indica si la señal fue emitida por una Antena de Marcado.
     *
     * - `true`  → {@link AntenaDeMarcado}
     * - `false` → {@link AntenaComun}
     *
     * @type {boolean}
     * @private
     * @since 1.4.8
     */
    _marcado;

    /**
     * Constructor.
     *
     * @param {Matriz2x2[]} [matrices=[]]    Matrices que transporta la señal.
     * @param {string}      [fase_origen=''] Fase desde la que se emite (formato `dominio:numero`).
     * @param {boolean}     [marcado=false]  `true` si fue emitida por una Antena de Marcado,
     *                                       `false` si fue emitida por una Antena Común.
     */
    constructor(matrices = [], fase_origen = '', marcado = false) {
        super();
        this._matrices    = matrices.slice(); // copia defensiva
        this._fase_origen = fase_origen;
        this._marcado     = marcado;
    }

    /**
     * Devuelve la cantidad de matrices contenidas.
     * @returns {number}
     * @since 1.4.5
     */
    longitud() {
        return this._matrices.length;
    }

    /**
     * Devuelve todas las matrices de la señal.
     * @returns {Matriz2x2[]}
     * @since 1.4.5
     */
    matrices() {
        return this._matrices.slice();
    }

    /**
     * Devuelve la fase de origen de la señal.
     * @returns {string} Fase completa (ej. `'Talamo:0'`).
     * @since 1.4.8
     */
    fase_origen() {
        return this._fase_origen;
    }

    /**
     * Indica si la señal fue emitida por una Antena de Marcado.
     * @returns {boolean} `true` para marcado, `false` para común.
     * @since 1.4.8
     */
    marcado() {
        return this._marcado;
    }
}