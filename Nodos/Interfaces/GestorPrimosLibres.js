/**
 * Interfaz GestorPrimosLibres – Contrato para la gestión del pool de primos libres.
 *
 * Define los métodos estáticos que permiten administrar el conjunto de
 * {@link NodoPrimo} disponibles en cada fase. Estos nodos se utilizan como
 * representantes atómicos de acciones compuestas cuando ascienden de fase.
 *
 * Es implementada por {@link NodoPrimo}.
 *
 * ## Funcionamiento del pool
 *
 * - Cada fase tiene su propio pool de primos libres (instancias reutilizables).
 * - Se puede establecer un límite máximo de primos por fase con {@link inicializar_fase}.
 * - {@link siguiente_primo_libre} extrae un nodo del pool o crea uno nuevo.
 * - {@link devolver_primo_libre} retorna un nodo al pool para su reutilización.
 *
 * @interface
 * @package Iteradores.Nodos.Interfaces
 * @version 1.4.4
 * @since 1.4.4
 * @see NodoPrimo
 */
class GestorPrimosLibres {
    /**
     * Inicializa la reserva de primos libres para una fase determinada.
     *
     * @param {string} fase   Nombre de la fase.
     * @param {number} limite Cantidad máxima de primos libres en la fase.
     * @abstract
     */
    static inicializar_fase(fase, limite) {
        throw new Error('inicializar_fase() debe ser implementado.');
    }

    /**
     * Devuelve el siguiente NodoPrimo libre en la fase indicada.
     *
     * @param {string|null} [fase=null] Fase de trabajo (null = fase actual).
     * @returns {NodoPrimo|null} Un NodoPrimo listo para usar, o null si se agotó el límite.
     * @abstract
     */
    static siguiente_primo_libre(fase = null) {
        throw new Error('siguiente_primo_libre() debe ser implementado.');
    }

    /**
     * Devuelve un NodoPrimo al pool de libres de una fase.
     *
     * @param {NodoPrimo}   nodo Nodo a devolver al pool.
     * @param {string|null} [fase=null] Fase a la que se devuelve (null = fase actual).
     * @abstract
     */
    static devolver_primo_libre(nodo, fase = null) {
        throw new Error('devolver_primo_libre() debe ser implementado.');
    }
}

export { GestorPrimosLibres };