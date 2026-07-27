import { Objeto } from '../Nucleo/Objeto.js';

/**
 * Matriz2x2 – Identidad matricial compacta e inmutable para p-gramas.
 *
 * Representa una matriz cuadrada de 2×2 con entradas enteras. Es la unidad
 * fundamental de identidad en el sistema de fases de Iteradores. Junto con
 * {@link NodoNumerico} y sus subclases, forma la base del mecanismo de
 * ascenso/descenso y de la codificación no conmutativa de secuencias.
 *
 * ## Espectro numérico
 *
 * El signo de la entrada `a` distingue el tipo de comando que representa
 * la matriz:
 *
 * | Tipo               | Forma canónica      | Uso                         |
 * |--------------------|---------------------|-----------------------------|
 * | **Prima positiva** | `[[p, 0], [1, 1]]` | Comando constructivo (hacer)|
 * | **Prima negativa** | `[[-p, 0], [1, 1]]`| Comando destructivo (deshacer)|
 * | **Inicial**        | `[[1, 0], [1, 1]]` | Semilla de NodoNumerico     |
 * | **Cero**           | `[[0, 0], [1, 1]]` | Delimitador de fin de secuencia (det = 0) |
 *
 * - Las matrices **positivas** representan acciones constructivas.
 * - Las matrices **negativas** representan las correspondientes acciones
 *   destructivas (deshaceres), permitiendo revertir cualquier operación.
 * - La **Matriz Cero** se utiliza como marcador de fin de transmisión
 *   en las comunicaciones nodo a nodo.
 *
 * ## No conmutatividad y orden
 *
 * El producto de matrices no es conmutativo: `M(A) × M(B) ≠ M(B) × M(A)`.
 * Esta propiedad es explotada por el sistema para **codificar el orden** en
 * las secuencias (p‑gramas). Dos secuencias con los mismos factores pero en
 * distinto orden producen matrices diferentes, aunque sus determinantes
 * coincidan.
 *
 * ## Inmutabilidad
 *
 * Las cuatro entradas de la matriz son inmutables una vez construida la
 * instancia. En particular, `b = 0` es fijo para todas las formas canónicas,
 * lo que garantiza que la matriz solo codifica la identidad estructural de la
 * acción, sin mezclarla con información contextual.
 *
 * ## Referencia al NodoNumerico portador
 *
 * Cada matriz mantiene una referencia al {@link NodoNumerico} que la utiliza
 * como identidad. Esto permite la sincronización directa durante el ascenso y
 * descenso de fase, sin necesidad de búsquedas en índices externos.
 *
 * @class
 * @extends Objeto
 * @package Iteradores.Nodos
 * @version 1.4.8
 * @since 1.4.0
 * @author Ignacio David Baigorria
 * @see NodoNumerico
 * @see NodoPrimo
 * @see NodoParalelo
 */
class Matriz2x2 extends Objeto {
    /**
     * Entrada superior izquierda (inmutable).
     *
     * Para las formas canónicas primas, su valor es `p` (positivo) o `-p`
     * (negativo), determinando si la matriz representa un comando
     * constructivo o destructivo.
     *
     * @type {number}
     */
    a;

    /**
     * Entrada superior derecha (inmutable).
     *
     * Fijada a 0 en todas las formas canónicas del sistema. Al no ser
     * mutable, la matriz solo codifica la identidad estructural de la
     * acción, sin interferencias externas.
     *
     * @type {number}
     */
    b;

    /**
     * Entrada inferior izquierda (inmutable).
     *
     * @type {number}
     */
    c;

    /**
     * Entrada inferior derecha (inmutable).
     *
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
     * Construye una nueva matriz 2×2 inmutable.
     *
     * @param {number} a Fila 0, columna 0
     * @param {number} b Fila 0, columna 1 (siempre 0 en las formas canónicas)
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
     * Forma: `[[1, 0], [1, 1]]`
     *
     * - Determinante = 1 (neutro multiplicativo, no altera productos).
     * - `b = 0` fijo, como en el resto de formas canónicas.
     * - No es una matriz prima; es el punto de partida antes de que el
     *   nodo reciba una identidad concreta.
     *
     * @returns {Matriz2x2}
     */
    static inicial() {
        return new Matriz2x2(1, 0, 1, 1);
    }

    /**
     * Crea la matriz canónica de un comando constructivo (primo positivo).
     *
     * Forma: `[[p, 0], [1, 1]]`
     *
     * Representa una acción atómica (un NodoPrimo) con número primo `p`.
     *
     * @param {number} p Número primo que identifica al comando.
     * @returns {Matriz2x2}
     * @see NodoPrimo
     */
    static crear_prima(p) {
        return new Matriz2x2(p, 0, 1, 1);
    }

    /**
     * Crea la matriz canónica de un comando destructivo (primo negativo).
     *
     * Forma: `[[-p, 0], [1, 1]]`
     *
     * La entrada `a = -p` sitúa la matriz en el **espectro negativo**,
     * reservado para acciones de deshacer. El valor absoluto `p` es el
     * mismo que el del comando constructivo correspondiente.
     *
     * @param {number} p Número primo (positivo) cuyo negativo representa el deshacer.
     * @returns {Matriz2x2}
     * @see NodoPrimo
     */
    static crear_negativa_prima(p) {
        return new Matriz2x2(-p, 0, 1, 1);
    }

    /**
     * Matriz identidad algebraica clásica.
     *
     * Forma: `[[1, 0], [0, 1]]`
     *
     * **No se usa en el sistema de identidades** porque su entrada `c = 0`
     * la hace conmutativa con cualquier otra matriz. Se conserva para
     * posibles cálculos auxiliares (rotaciones, transformaciones lineales,
     * etc.) ajenos al mecanismo de secuencias.
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
     * Matriz Cero utilizada como delimitador de fin de secuencia.
     *
     * Forma: `[[0, 0], [1, 1]]` – determinante 0.
     *
     * @returns {Matriz2x2}
     * @since 1.4.8
     */
    static cero() {
        return new Matriz2x2(0, 0, 1, 1);
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
     * Calcula el determinante de la matriz.
     *
     * `det = a*d - b*c`
     *
     * Para las formas canónicas del sistema (`b = 0`), el determinante se
     * reduce a `a*d`, simplificando los cálculos.
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
}

export { Matriz2x2 };