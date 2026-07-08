import { Objeto } from '../Nucleo/Objeto.js';
import { Matriz2x2 } from '../Nodos/Matriz2x2.js';
import { MapeoBytesMatrices } from '../Controlador/MapeoBytesMatrices.js';

/**
 * Señal: portadora mínima de matrices de identidad.
 *
 * A partir de v1.4.7, su responsabilidad se reduce a encapsular una
 * lista de {@link Matriz2x2} y permitir su conversión a/desde bytes.
 * La lógica de consumo, índice de avance y registro de patrones
 * procesados se ha trasladado a {@link Antena} y será gestionada
 * por el futuro Iterador.
 *
 * @class Senal
 * @extends Objeto
 * @since 1.4.5
 * @version 1.4.7
 */
export class Senal extends Objeto {
    /**
     * Lista de matrices que componen la señal.
     * @type {Matriz2x2[]}
     * @private
     */
    _matrices;

    /**
     * Constructor.
     * @param {Matriz2x2[]} [matrices=[]] Matrices iniciales.
     */
    constructor(matrices = []) {
        super();
        this._matrices = matrices.slice(); // copia defensiva
    }

    /**
     * Añade una matriz al final de la señal.
     * @param {Matriz2x2} matriz
     * @returns {void}
     */
    _matriz(matriz) {
        this._matrices.push(matriz);
    }

    /**
     * Devuelve la cantidad de matrices contenidas.
     * @returns {number}
     */
    longitud() {
        return this._matrices.length;
    }

    /**
     * Devuelve todas las matrices de la señal.
     * @returns {Matriz2x2[]}
     */
    matrices() {
        return this._matrices.slice();
    }

    // ═══════════════════════════════════════════
    // V 1.4.6 – CONVERSIÓN BYTES ↔ SEÑAL
    // ═══════════════════════════════════════════

    /**
     * Construye una señal a partir de una cadena de bytes, un ArrayBuffer
     * o un Uint8Array.
     *
     * @param {string|ArrayBuffer|Uint8Array|number[]} bytes Datos de entrada.
     * @returns {Senal} Nueva señal con las matrices primas correspondientes.
     * @since 1.4.6
     * @version 1.4.7
     */
    static desde_bytes(bytes) {
        let arr = [];
        if (bytes instanceof ArrayBuffer || bytes instanceof Uint8Array) {
            arr = Array.from(new Uint8Array(bytes));
        } else if (typeof bytes === 'string') {
            for (let i = 0; i < bytes.length; i++) {
                arr.push(bytes.charCodeAt(i));
            }
        } else if (Array.isArray(bytes)) {
            arr = bytes;
        }

        const matrices = [];
        for (const byte of arr) {
            const matriz = MapeoBytesMatrices.byte_a_matriz(byte);
            if (matriz) {
                matrices.push(matriz);
            }
        }
        return new Senal(matrices);
    }

    /**
     * Convierte una señal en una cadena de bytes.
     *
     * @param {Senal} senal Señal a convertir.
     * @returns {string} Cadena de bytes lista para ser escrita o enviada.
     * @since 1.4.6
     * @version 1.4.7
     */
    static a_bytes(senal) {
        return senal.matrices()
            .map(m => MapeoBytesMatrices.matriz_a_byte(m))
            .filter(b => b !== null && b !== undefined)
            .map(b => String.fromCharCode(b))
            .join('');
    }
}