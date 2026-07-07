import { Matriz2x2 } from '../Nodos/Matriz2x2.js';
import { NodoNumerico } from '../Nodos/NodoNumerico.js';
import { CompuertaDominio } from './CompuertaDominio.js';
// Senal se importa en el futuro si se necesita, aquí solo para JSDoc.

/**
 * Clase base para compuertas talámicas.
 *
 * Proporciona el mapeo byte↔primo (primeros 256 primos) y la
 * implementación común de {@link CompuertaDominio#recomponer}.
 *
 * Las compuertas concretas solo necesitan implementar
 * {@link CompuertaDominio#descomponer}.
 *
 * @class CompuertaBase
 * @extends CompuertaDominio
 * @since 1.4.6
 * @version 1.4.6
 */
export class CompuertaBase extends CompuertaDominio {
    /**
     * Mapa byte → número primo.
     * @type {number[]}
     * @private
     */
    static _primos_por_byte = [];

    /**
     * Mapa número primo → byte.
     * @type {Object.<number, number>}
     * @private
     */
    static _byte_por_primo = {};

    /**
     * Inicializa el mapeo byte↔primo a partir de la caché global de
     * {@link NodoNumerico}.
     *
     * Solo se ejecuta una vez.
     *
     * @returns {void}
     * @private
     */
    static _inicializar_mapeo() {
        if (this._primos_por_byte.length > 0) {
            return;
        }

        const primos = NodoNumerico._primos_conocidos;
        for (let b = 0; b < 256; b++) {
            const primo = primos[b];
            this._primos_por_byte[b] = primo;
            this._byte_por_primo[primo] = b;
        }
    }

    /**
     * Obtiene la matriz prima correspondiente a un byte.
     *
     * @param {number} byte Valor entre 0 y 255.
     * @returns {Matriz2x2|null} Matriz prima canónica, o null si el byte está fuera de rango.
     * @protected
     */
    _byte_a_matriz(byte) {
        this.constructor._inicializar_mapeo();
        const primo = this.constructor._primos_por_byte[byte];
        return primo !== undefined ? Matriz2x2.crear_prima(primo) : null;
    }

    /**
     * Obtiene el byte correspondiente a una matriz prima canónica.
     *
     * @param {Matriz2x2} matriz Matriz prima (positiva o negativa).
     * @returns {number|null} Byte asociado, o null si no se encuentra.
     * @protected
     */
    _matriz_a_byte(matriz) {
        this.constructor._inicializar_mapeo();
        const a = matriz.a;
        const primo = a > 0 ? a : -a;
        const b = this.constructor._byte_por_primo[primo];
        return b !== undefined ? b : null;
    }

    /**
     * Descompone recursivamente un nodo compuesto en comandos atómicos.
     *
     * @param {NodoNumerico} nodo Nodo a descomponer.
     * @returns {Array<Array>} Comandos atómicos (cada uno es un array [nombre, byte]).
     * @protected
     */
    _descomponer_patron(nodo) {
        const comandos = [];
        const pgrama = nodo.pgrama();

        // Quitar marcas de sincronización si existen.
        let inicio = 0;
        if (pgrama.length > 0 && (pgrama[0] === 1 || pgrama[0] === -1)) {
            inicio = 1;
        }

        for (let i = inicio; i < pgrama.length; i++) {
            const primo = pgrama[i];
            const nodoFactor = NodoNumerico.crear_primo(primo);

            if (!nodoFactor) {
                continue;
            }

            if (nodoFactor.es_primo()) {
                // Primo atómico → traducir a byte.
                const matriz = nodoFactor.identidad();
                const byte = this._matriz_a_byte(matriz);
                if (byte !== null && byte !== undefined) {
                    comandos.push(['escribir_byte', byte]);
                }
            } else {
                // Nodo compuesto → descomponer recursivamente.
                comandos.push(...this._descomponer_patron(nodoFactor));
            }
        }

        return comandos;
    }

    /**
     * Traduce datos nativos a señal. Debe ser implementado por la compuerta concreta.
     *
     * @param {*} entrada_nativa
     * @returns {Senal}
     * @abstract
     */
    descomponer(entrada_nativa) {
        throw new Error('Método descomponer() debe ser implementado.');
    }

    /**
     * Convierte una señal procesada en comandos atómicos del sistema.
     *
     * @param {Senal}  procesada Señal ya procesada por un dominio.
     * @param {string} fase      Fase de referencia para las identidades.
     * @returns {Array<Array>} Lista de comandos atómicos.
     */
    recomponer(procesada, fase) {
        const comandos = [];

        for (const item of procesada.obtener_elementos_procesados()) {
            if (item instanceof Matriz2x2) {
                const byte = this._matriz_a_byte(item);
                if (byte !== null && byte !== undefined) {
                    comandos.push(['escribir_byte', byte]);
                }
            } else if (item instanceof NodoNumerico) {
                comandos.push(...this._descomponer_patron(item));
            }
        }

        return comandos;
    }
}