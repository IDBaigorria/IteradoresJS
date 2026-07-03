import { Objeto } from '../Nucleo/Objeto.js';

/**
 * Matriz2x2 – Valor matricial con canvas de contexto mutable.
 *
 * Representa una matriz cuadrada de 2×2 con entradas enteras. Es la unidad
 * fundamental de identidad en el sistema de fases de Iteradores. Junto con
 * {@link NodoNumerico} y sus subclases, forma la base del mecanismo de
 * ascenso/descenso y entrelazamiento contextual.
 *
 * ## Espectro numérico
 *
 * El sistema de identidades numéricas se divide en dos espectros complementarios:
 *
 * | Tipo               | Forma canónica      | Uso                         |
 * |--------------------|---------------------|-----------------------------|
 * | **Prima positiva** | `[[p, 1], [1, 1]]`  | NodoPrimo (estructura)      |
 * | **Negativa prima** | `[[-p, 1], [1, 1]]` | NodoConjunto (significado)  |
 * | **Inicial**        | `[[1, 1], [1, 2]]`  | Semilla de NodoNumerico     |
 *
 * - Las matrices **positivas** identifican estructuras: secuencias, paralelos y
 *   primos atómicos. Su determinante está vinculado al producto de factores.
 * - Las matrices **negativas** identifican significados: conceptos o conjuntos
 *   semánticos. Su entrada `a` es negativa, lo que las diferencia algebraicamente
 *   de cualquier estructura positiva sin riesgo de colisión.
 *
 * ## No conmutatividad y orden
 *
 * El producto de matrices no es conmutativo: `M(A) × M(B) ≠ M(B) × M(A)`.
 * Esta propiedad es explotada por el sistema para **codificar el orden** en
 * las secuencias (p‑gramas). Dos secuencias con los mismos factores pero en
 * distinto orden producen matrices diferentes, aunque sus determinantes
 * coincidan.
 *
 * ## Canvas de contexto (entrada `b`)
 *
 * La entrada `b` es la **única mutable** de la matriz. Actúa como un canvas
 * donde se registran las pertenencias a conjuntos mediante **pintura**:
 *
 * - {@link pintar} multiplica `b` por un número primo, marcando la pertenencia
 *   a un contexto.
 * - {@link despintar} divide `b` por ese primo, eliminando la marca.
 * - Las entradas `a`, `c` y `d` permanecen inalteradas, preservando la
 *   identidad nuclear del nodo.
 * - La verificación de pertenencia es O(1): `b % primoContexto == 0`.
 *
 * ## Referencia al nodo portador
 *
 * Cada matriz mantiene una referencia al {@link NodoNumerico} que la utiliza
 * como identidad (propiedad `#nodo`). Esto permite que las operaciones de
 * pintura/despintura notifiquen directamente al nodo, sin necesidad de
 * búsquedas en índices externos.
 *
 * @class
 * @extends Objeto
 * @package Iteradores.Nodos
 * @version 1.4.3
 * @since 1.4.0
 * @author Ignacio David Baigorria
 * @see NodoNumerico
 * @see NodoPrimo
 * @see NodoConjunto
 */
class Matriz2x2 extends Objeto {
    /**
     * Entrada superior izquierda (inmutable).
     * @type {number}
     */
    a;

    /**
     * Entrada superior derecha — **canvas de contexto** (mutable).
     *
     * Es la única componente que puede modificarse tras la construcción.
     * Comienza en 1 para las formas canónicas y se multiplica o divide
     * para reflejar pertenencias.
     *
     * @type {number}
     */
    b;

    /**
     * Entrada inferior izquierda (inmutable).
     * @type {number}
     */
    c;

    /**
     * Entrada inferior derecha (inmutable).
     * @type {number}
     */
    d;

    /**
     * NodoNumerico que porta esta matriz como identidad.
     *
     * @type {NodoNumerico|null}
     * @private
     */
    #nodo = null;

    /**
     * Construye una nueva matriz 2×2.
     *
     * @param {number} a Fila 0, columna 0
     * @param {number} b Fila 0, columna 1 (canvas de contexto)
     * @param {number} c Fila 1, columna 0
     * @param {number} d Fila 1, columna 1
     */
    constructor(a, b, c, d) {
        super();
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
    }

    /**
     * Setter controlado de la entrada `b` (canvas de contexto).
     *
     * Permite reemplazar por completo el valor del canvas, por ejemplo
     * para restaurar un estado anterior.
     *
     * @param {number} b Nuevo valor del canvas.
     */
    _b(b) {
        this.b = b;
    }

    /**
     * Obtiene el NodoNumerico portador de esta matriz.
     *
     * @returns {NodoNumerico|null}
     */
    get nodo() {
        return this.#nodo;
    }

    /**
     * Asigna el NodoNumerico portador de esta matriz.
     *
     * @param {NodoNumerico} nodo Nodo que porta esta identidad.
     */
    _nodo(nodo) {
        this.#nodo = nodo;
    }

    /**
     * Matriz inicial (semilla) para un NodoNumerico recién creado.
     *
     * Forma: `[[1, 1], [1, 2]]`
     *
     * - Determinante = 1 (neutro multiplicativo, no altera productos).
     * - Canvas `b = 1` listo para recibir pinturas.
     * - No es una matriz prima; es el punto de partida antes de que el
     *   nodo reciba una identidad concreta.
     *
     * @returns {Matriz2x2}
     */
    static inicial() {
        return new Matriz2x2(1, 1, 1, 2);
    }

    /**
     * Crea la matriz canónica de un nodo primo positivo.
     *
     * Forma: `[[p, 1], [1, 1]]`
     *
     * Representa una estructura atómica (un NodoPrimo) con número primo `p`.
     *
     * @param {number} p Número primo que identifica al nodo.
     * @returns {Matriz2x2}
     * @see NodoPrimo
     */
    static crear_prima(p) {
        return new Matriz2x2(p, 1, 1, 1);
    }

    /**
     * Crea la matriz canónica negativa para un concepto / conjunto.
     *
     * Forma: `[[-p, 1], [1, 1]]`
     *
     * La entrada `a = -p` sitúa la matriz en el **espectro negativo**,
     * reservado para significados (NodoConjunto). El valor `p` es el
     * **primo de contexto** que se usará para pintar a los miembros.
     *
     * @param {number} p Número primo (positivo) que actúa como pintor de contexto.
     * @returns {Matriz2x2}
     * @see NodoConjunto
     */
    static crear_negativa_prima(p) {
        return new Matriz2x2(-p, 1, 1, 1);
    }

    /**
     * Matriz identidad algebraica clásica.
     *
     * Forma: `[[1, 0], [0, 1]]`
     *
     * **No se usa en el sistema de identidades** porque `b = 0` anula el
     * canvas de contexto (cualquier pintura lo mantendría en 0). Se conserva
     * para posibles cálculos auxiliares (rotaciones, transformaciones
     * lineales, etc.) ajenos al mecanismo de pertenencia.
     *
     * @returns {Matriz2x2}
     */
    static identidad_algebraica() {
        return new Matriz2x2(1, 0, 0, 1);
    }

    /**
     * Construye una matriz a partir de un array [a, b, c, d].
     *
     * @param {number[]} arr Array de exactamente 4 elementos.
     * @returns {Matriz2x2|null} Matriz o null si el array no es válido.
     */
    static desde_array(arr) {
        if (!Array.isArray(arr) || arr.length !== 4) {
            this._error('El array debe contener exactamente 4 elementos.');
            return null;
        }
        return new Matriz2x2(
            Math.trunc(arr[0]),
            Math.trunc(arr[1]),
            Math.trunc(arr[2]),
            Math.trunc(arr[3])
        );
    }

    /**
     * Multiplica esta matriz por otra (this × otra).
     *
     * El orden es fundamental: `M(A) × M(B)` no es igual a `M(B) × M(A)`.
     * Esta **no conmutatividad** permite que las secuencias de factores
     * preserven el orden en su identidad matricial.
     *
     * @param {Matriz2x2} otra Matriz a la derecha del producto.
     * @returns {Matriz2x2} Nueva matriz resultado.
     */
    multiplicar(otra) {
        return new Matriz2x2(
            this.a * otra.a + this.b * otra.c,
            this.a * otra.b + this.b * otra.d,
            this.c * otra.a + this.d * otra.c,
            this.c * otra.b + this.d * otra.d
        );
    }

    /**
     * Calcula el determinante de la matriz en tiempo real.
     *
     * `det = a*d - b*c`
     *
     * No se cachea porque `b` es mutable y el coste de cálculo es trivial
     * (dos multiplicaciones y una resta).
     *
     * @returns {number}
     */
    determinante() {
        return this.a * this.d - this.b * this.c;
    }

    /**
     * Compara esta matriz con otra por igualdad exacta de sus cuatro componentes.
     *
     * @param {Matriz2x2} otra
     * @returns {boolean}
     */
    es_igual(otra) {
        return this.a === otra.a
            && this.b === otra.b
            && this.c === otra.c
            && this.d === otra.d;
    }

    /**
     * Representación canónica en string.
     *
     * Formato: `"[[a,b],[c,d]]"`. Utilizada como clave en índices y para
     * ordenación canónica de componentes en {@link NodoParalelo}.
     *
     * @returns {string}
     */
    a_texto() {
        return `[[${this.a},${this.b}],[${this.c},${this.d}]]`;
    }

    /**
     * Representación en string (delega en {@link a_texto}).
     *
     * @returns {string}
     */
    toString() {
        return this.a_texto();
    }

    /**
     * "Pinta" el canvas de contexto multiplicando `b` por un factor primo.
     *
     * Esta operación es el núcleo del **entrelazamiento de conjunto** entre
     * nodos y conceptos. Codifica la pertenencia sin alterar las entradas
     * `a`, `c`, `d` de la identidad nuclear.
     *
     * @param {number} primo Factor a multiplicar en `b`.
     * @see despintar
     */
    pintar(primo) {
        this.b *= primo;
    }

    /**
     * "Despinta" el canvas de contexto dividiendo `b` por un factor primo.
     *
     * Si el primo no divide exactamente a `b`, emite un error del sistema
     * y no modifica la matriz. Esto puede ocurrir si se intenta quitar un
     * miembro que no pertenecía al conjunto.
     *
     * @param {number} primo Factor a eliminar de `b`.
     * @see pintar
     */
    despintar(primo) {
        if (this.b % primo !== 0) {
            this.constructor._error(`El primo ${primo} no está presente en b.`);
            return;
        }
        this.b /= primo;
    }
}

export { Matriz2x2 };