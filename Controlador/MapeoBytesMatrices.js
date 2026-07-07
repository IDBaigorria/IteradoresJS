import { Matriz2x2 } from '../Nodos/Matriz2x2.js';
import { NodoNumerico } from '../Nodos/NodoNumerico.js';

/**
 * Mapeo directo entre bytes (0‑255) y matrices 2×2 canónicas.
 *
 * Utiliza los primeros 256 números primos de la caché global de
 * {@link NodoNumerico} para generar las matrices primas, sin
 * necesidad de crear nodos intermedios.
 *
 * ## Uso
 *
 * - {@link inicializar} debe invocarse una vez durante el arranque
 *   del sistema (p. ej. desde {@link Controlador.inicializar}).
 * - {@link byte_a_matriz} convierte un byte en su matriz.
 * - {@link matriz_a_byte} convierte una matriz prima de vuelta a byte.
 *
 * @class MapeoBytesMatrices
 * @since 1.4.6
 * @version 1.4.6
 */
export class MapeoBytesMatrices {
    /** @type {Matriz2x2[]} */
    static _byte_a_matriz = [];

    /** @type {Object.<number, number>} */
    static _matriz_a_byte = {};

    /**
     * Inicializa los mapas a partir de la caché pública de primos.
     * @returns {void}
     */
    static inicializar() {
        if (this._byte_a_matriz.length > 0) return;

        const primos = NodoNumerico.primos_conocidos;
        for (let byte = 0; byte < 256; byte++) {
            const primo = primos[byte];
            const matriz = Matriz2x2.crear_prima(primo);
            this._byte_a_matriz[byte] = matriz;
            this._matriz_a_byte[primo] = byte;
        }
    }

    /**
     * Devuelve la matriz prima correspondiente a un byte.
     *
     * @param {number} byte Valor entre 0 y 255.
     * @returns {Matriz2x2|null}
     */
    static byte_a_matriz(byte) {
        return this._byte_a_matriz[byte] ?? null;
    }

    /**
     * Devuelve el byte correspondiente a una matriz prima canónica.
     *
     * @param {Matriz2x2} matriz
     * @returns {number|null}
     */
    static matriz_a_byte(matriz) {
        const primo = Math.abs(matriz.a);
        const byte = this._matriz_a_byte[primo];
        return byte !== undefined ? byte : null;
    }
}