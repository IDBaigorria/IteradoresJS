import { Matriz2x2 } from '../Matriz2x2.js';

/**
 * Interfaz IdentidadNumerica – Contrato para nodos con identidad matricial y p‑grama.
 *
 * Define los métodos que debe implementar cualquier clase que actúe como
 * un nodo con identidad numérica. En la práctica, la implementan
 * {@link NodoNumerico} y todas sus subclases.
 *
 * ## Responsabilidades
 *
 * - Proveer una **matriz identidad** 2×2 única e inmutable.
 * - Proveer el **p‑grama** (lista de factores primos) único del nodo.
 * - Permitir consultar si el nodo es atómico.
 *
 * @author Ignacio David Baigorria
 *
 * @interface
 * @package Iteradores.Nodos.Interfaces
 * @version 1.4.5
 * @since 1.4.2
 * @see Matriz2x2
 * @see NodoNumerico
 */
class IdentidadNumerica {
    /**
     * Obtiene la matriz identidad única del nodo.
     *
     * @returns {Matriz2x2}
     * @abstract
     */
    identidad() {
        throw new Error('Método identidad() debe ser implementado.');
    }

    /**
     * Obtiene el p‑grama único del nodo.
     *
     * @returns {number[]} Lista de identificadores, o array vacío.
     * @abstract
     */
    pgrama() {
        throw new Error('Método pgrama() debe ser implementado.');
    }

    /**
     * Indica si el nodo es un NodoPrimo (identidad atómica).
     *
     * @returns {boolean} `true` si el nodo es atómico, `false` si es compuesto.
     * @abstract
     */
    es_primo() {
        throw new Error('Método es_primo() debe ser implementado.');
    }
}

export { IdentidadNumerica };