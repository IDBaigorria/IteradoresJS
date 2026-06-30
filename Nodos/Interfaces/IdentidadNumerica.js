import { Matriz2x2 } from '../Matriz2x2.js';

/**
 * Interfaz IdentidadNumerica.
 *
 * Define el contrato para cualquier nodo que posea una identidad
 * matricial 2×2 y pueda indicar si representa una secuencia ordenada
 * o una estructura no ordenada.
 *
 * Las clases que implementan esta interfaz deben sobreescribir los
 * métodos `identidad()` y `ordenado()`.
 *
 * ## Uso típico
 * ```javascript
 * if (nodo instanceof IdentidadNumerica) {
 *     const matriz = nodo.identidad();
 *     if (nodo.ordenado()) {
 *         // procesar como secuencia
 *     }
 * }
 * ```
 * ## ¿Por qué una matriz 2×2 y no un identificador plano?
 *
 * Un identificador plano —como un entero o un string hash— **no puede
 * capturar el orden de composición** de los factores que forman un nodo
 * compuesto. En nuestro sistema, la secuencia "A seguido de B" **no es
 * lo mismo** que "B seguido de A". Un entero que represente el producto
 * de los primos A y B pierde esa distinción porque la multiplicación de
 * enteros es conmutativa: `2×3 = 3×2 = 6`.
 *
 * Para preservar el orden necesitamos una estructura **no conmutativa**.
 * Una matriz 2×2 con la forma canónica `[[p, 0], [1, 1]]` resuelve
 * exactamente este problema:
 *
 * ```
 * M(2) × M(3) = [[2,0],[1,1]] × [[3,0],[1,1]] = [[6,0],[4,1]]
 * M(3) × M(2) = [[3,0],[1,1]] × [[2,0],[1,1]] = [[6,0],[3,1]]
 * ```
 *
 * Ambas matrices tienen el mismo determinante (6), pero **son matrices
 * diferentes**. La entrada `c` (inferior izquierda) codifica el orden de
 * los factores.
 *
 * ## El espectro numérico: positivos y negativos
 *
 * Para mantener la coherencia algebraica y evitar colisiones semánticas,
 * el framework divide el espectro de identidades en dos:
 *
 * | Rango                                      | Uso                                                   | Ejemplo                               |
 * |------------------------------------------- |-------------------------------------------------------|---------------------------------------|
 * | **Positivos** (p ≥ 2, primo o compuesto)   | Estructura: secuencias ordenadas, sincronizaciones    | `[[6,0],[4,1]]` (cadena "ma")         |
 * | **Negativos** (n ≤ -1)                     | Significado: conceptos semánticos, marca de color     | `[[-1,0],[1,1]]` (letras vocales)     |
 *
 * Un NodoConjunto que representa el concepto "vocales" no usa una
 * matriz positiva derivada de sus miembros (porque los miembros pueden
 * cambiar), sino una **matriz negativa inmutable** generada por un contador
 * global. Esto garantiza que el concepto conserve su identidad aunque se
 * agreguen o quiten miembros.
 *
 * ## Ventajas de las identidades matriciales
 *
 * | Ventaja                                | Descripción                                                                                                               |
 * |----------------------------------------|---------------------------------------------------------------------------------------------------------------------------|
 * | **No conmutatividad**                  | Distingue secuencias "A→B" de "B→A".                                                                                      |
 * | **Determinante acotado**               | Al ascender de fase, el determinante se reinicia como un nuevo primo, evitando la explosión numérica.                     |
 * | **Unicidad**                           | Cada composición tiene una matriz única, permitiendo un índice global O(1).                                               |
 * | **Álgebra unificada**                  | La misma operación (multiplicación de matrices) sirve para secuencias, paralelos y conceptos (con marcas adicionales).    |
 * | **Ascenso / descenso**                 | La matriz completa puede guardarse como dato en una fase superior, preservando toda la información de orden.              |
 * | **Separación estructura/significado**  | Los positivos representan cómo se combinan las cosas; los negativos representan qué son.                                  |
 *
 * ## Jerarquía de implementación
 *
 * @interface
 * @since 1.4.2
 */
class IdentidadNumerica {
    /**
     * Obtiene la matriz identidad del nodo.
     *
     * @returns {Matriz2x2}
     * @abstract
     */
    identidad() {
        throw new Error('Método identidad() debe ser implementado.');
    }

    /**
     * Indica si el nodo representa una secuencia ordenada.
     *
     * @returns {boolean}
     * @abstract
     */
    ordenado() {
        throw new Error('Método ordenado() debe ser implementado.');
    }
}

export { IdentidadNumerica };