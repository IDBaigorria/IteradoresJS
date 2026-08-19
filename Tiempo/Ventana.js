/**
 * Ventana — Iteradores Neuronales.
 *
 * Representa una ventana de sintonía como entidad de primer nivel con
 * identidad matricial 2×2. Las ventanas pueden ser **atómicas** (un solo
 * primo, fase 0) o **compuestas** (producto de varias atómicas, fase > 0).
 *
 * Cada ventana vive en el **universo de spines**, separado del universo de
 * dominios operativos. Su clave es la matriz 2×2 resultante del producto
 * no conmutativo de las matrices canónicas de sus factores.
 *
 * ## Estructura
 *
 * - `matriz`: la matriz 2×2 $M(W)$ (entradas $a, b, c, d$).
 * - `p_grama`: secuencia ordenada de primos componentes.
 * - `fase_spin`: fase en el universo de spines (0 atómica, >0 compuesta).
 * - `frecuencia`: contador de nodos que referencian esta ventana.
 * - `energia_total`: suma de energías de nodos afiliados.
 * - `nodos_afiliados`: conjunto de identificadores de nodos.
 * - `vector_promedio`: promedio normalizado de vectores de activación
 *   bajo los cuales fue usada ($\hat{v}_{pool}$).
 *
 * @class Ventana
 * @extends Objeto
 * @author Ignacio David Baigorria
 * @since 1.5.1
 * @version 1.5.1
 */

import { Objeto } from "../Nucleo/index.js";

class Ventana extends Objeto {
    /**
     * Matriz 2×2 de la ventana.
     * @type {{a: number, b: number, c: number, d: number}}
     * @private
     */
    _matriz;

    /**
     * Secuencia ordenada de primos componentes.
     * @type {Array<number>}
     * @private
     */
    _p_grama;

    /**
     * Fase en el universo de spines.
     * @type {number}
     * @private
     */
    _fase_spin;

    /**
     * Contador de nodos que referencian esta ventana.
     * @type {number}
     * @private
     */
    _frecuencia = 0;

    /**
     * Suma de energías de nodos afiliados.
     * @type {number}
     * @private
     */
    _energia_total = 0.0;

    /**
     * Conjunto de identificadores de nodos afiliados.
     * @type {Set<string>}
     * @private
     */
    _nodos_afiliados = new Set();

    /**
     * Promedio normalizado de vectores de activación.
     * @type {{x: number, y: number, z: number}|null}
     * @private
     */
    _vector_promedio = null;

    /**
     * Construye una ventana atómica o compuesta.
     *
     * @param {{a: number, b: number, c: number, d: number}} matriz   Matriz 2×2.
     * @param {Array<number>}                                  p_grama   Primos componentes.
     * @param {number}                                         [fase_spin=0] Fase en el universo de spines.
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     */
    constructor(matriz, p_grama, fase_spin = 0) {
        super();
        this._matriz = matriz;
        this._p_grama = p_grama;
        this._fase_spin = fase_spin;
    }

    // ═══════════════════════════════════════════════════════
    // ACCESORES
    // ═══════════════════════════════════════════════════════

    /**
     * Devuelve la matriz 2×2.
     *
     * @returns {{a: number, b: number, c: number, d: number}}
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     */
    matriz() {
        return this._matriz;
    }

    /**
     * Devuelve la clave serializada de la matriz.
     *
     * Útil para indexar en mapas hash (PoolVentanas).
     *
     * @returns {string} Formato "a,b,c,d".
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     */
    clave() {
        return `${this._matriz.a},${this._matriz.b},${this._matriz.c},${this._matriz.d}`;
    }

    /**
     * Devuelve el p-grama.
     *
     * @returns {Array<number>}
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     */
    p_grama() {
        return [...this._p_grama];
    }

    /**
     * Devuelve la fase en el universo de spines.
     *
     * @returns {number}
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     */
    fase_spin() {
        return this._fase_spin;
    }

    /**
     * Devuelve la frecuencia de referencia.
     *
     * @returns {number}
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     */
    frecuencia() {
        return this._frecuencia;
    }

    /**
     * Devuelve la energía total acumulada.
     *
     * @returns {number}
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     */
    energia_total() {
        return this._energia_total;
    }

    /**
     * Devuelve los nodos afiliados.
     *
     * @returns {Array<string>}
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     */
    nodos_afiliados() {
        return Array.from(this._nodos_afiliados);
    }

    /**
     * Devuelve el vector promedio.
     *
     * @returns {{x: number, y: number, z: number}|null}
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     */
    vector_promedio() {
        return this._vector_promedio;
    }

    // ═══════════════════════════════════════════════════════
    // MUTADORES (gestión de afiliación y aprendizaje)
    // ═══════════════════════════════════════════════════════

    /**
     * Afilia un nodo a esta ventana.
     *
     * Incrementa la frecuencia y acumula la energía del nodo.
     *
     * @param {string} id_nodo Identificador único del nodo.
     * @param {number} energia Energía del nodo al momento de afiliar.
     * @returns {void}
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     */
    afiliar(id_nodo, energia) {
        this._nodos_afiliados.add(id_nodo);
        this._frecuencia++;
        this._energia_total += energia;
    }

    /**
     * Desafilia un nodo de esta ventana.
     *
     * @param {string} id_nodo Identificador único del nodo.
     * @returns {void}
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     */
    desafiliar(id_nodo) {
        this._nodos_afiliados.delete(id_nodo);
    }

    /**
     * Actualiza el vector promedio mediante tironeo global.
     *
     * $$\hat{v}_{pool} \leftarrow \hat{v}_{pool} + \beta_{global}(\hat{V}_{actual} - \hat{v}_{pool})$$
     *
     * @param {{x: number, y: number, z: number}} vector_actual Vector de activación del pulso.
     * @param {number} [beta=0.1] Tasa de aprendizaje global (0 < β ≤ 1).
     * @returns {void}
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     */
    tironear(vector_actual, beta = 0.1) {
        if (this._vector_promedio === null) {
            this._vector_promedio = { ...vector_actual };
            return;
        }

        const vx = this._vector_promedio.x + beta * (vector_actual.x - this._vector_promedio.x);
        const vy = this._vector_promedio.y + beta * (vector_actual.y - this._vector_promedio.y);
        const vz = this._vector_promedio.z + beta * (vector_actual.z - this._vector_promedio.z);

        const magnitud = Math.sqrt(vx * vx + vy * vy + vz * vz);
        if (magnitud < 1e-9) {
            this._vector_promedio = { x: 0.0, y: 0.0, z: 1.0 };
            return;
        }

        this._vector_promedio = {
            x: vx / magnitud,
            y: vy / magnitud,
            z: vz / magnitud,
        };
    }

    // ═══════════════════════════════════════════════════════
    // ÁLGEBRA MATRICIAL ESTÁTICA
    // ═══════════════════════════════════════════════════════

    /**
     * Construye la matriz canónica para un número primo.
     *
     * $$M(p) = \begin{pmatrix} p & 0 \\ 1 & 1 \end{pmatrix}$$
     *
     * @param {number} primo Número primo (positivo o negativo).
     * @returns {{a: number, b: number, c: number, d: number}}
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     */
    static matriz_canonica(primo) {
        return {
            a: primo,
            b: 0,
            c: 1,
            d: 1,
        };
    }

    /**
     * Multiplica dos matrices 2×2.
     *
     * El producto es no conmutativo: $M_1 \cdot M_2 \neq M_2 \cdot M_1$.
     *
     * @param {{a: number, b: number, c: number, d: number}} m1
     * @param {{a: number, b: number, c: number, d: number}} m2
     * @returns {{a: number, b: number, c: number, d: number}}
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     */
    static producto(m1, m2) {
        return {
            a: m1.a * m2.a + m1.b * m2.c,
            b: m1.a * m2.b + m1.b * m2.d,
            c: m1.c * m2.a + m1.d * m2.c,
            d: m1.c * m2.b + m1.d * m2.d,
        };
    }

    /**
     * Determinante de una matriz 2×2.
     *
     * @param {{a: number, b: number, c: number, d: number}} m
     * @returns {number}
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     */
    static determinante(m) {
        return m.a * m.d - m.b * m.c;
    }
}

export { Ventana };
