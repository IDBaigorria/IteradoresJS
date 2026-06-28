import { Objeto } from '../Nucleo/Objeto.js';

/**
 * Clase Matriz2x2
 *
 * Valor inmutable que representa una matriz cuadrada de 2×2 con entradas enteras.
 *
 * Esta clase es la piedra angular del sistema de identidades numéricas no conmutativas.
 * Permite representar números primos y compuestos como matrices, de modo que el producto
 * preserve el orden de los factores. Junto con `NodoNumerico` y `NodoPrimo`,
 * forma la base del mecanismo de ascenso/descenso por fases.
 *
 * ## Uso como identidad
 * Cada nodo del framework posee una `Matriz2x2` que lo identifica de manera única.
 * Dos nodos con matrices diferentes representan composiciones distintas, incluso si
 * sus determinantes coinciden (por ejemplo, `[[6,0],[4,1]]` vs `[[6,0],[3,1]]`).
 *
 * ## Inmutabilidad
 * Las propiedades son de solo lectura. Una vez construida, la matriz no cambia.
 * Esto permite usarla como clave de índice sin riesgo de efectos colaterales.
 *
 * ## Factoría de primos
 * El método estático `crear_prima()` construye la matriz canónica asociada a un
 * número primo `p`: `[[p, 0], [1, 1]]`. Esta forma garantiza la no conmutatividad
 * del producto:
 * - `M(2) * M(3) = [[6,0],[4,1]]`
 * - `M(3) * M(2) = [[6,0],[3,1]]`
 *
 * ## Rendimiento
 * El determinante y la representación en cadena se precalculan en el constructor.
 *
 * @class
 * @extends Objeto
 * @package Iteradores.Nodos
 * @version 1.4.0
 * @since 1.4.0
 * @author Ignacio David Baigorria
 * @see NodoNumerico
 * @see NodoPrimo
 */
class Matriz2x2 extends Objeto {
    /** @type {number} Entrada superior izquierda */
    a;
    /** @type {number} Entrada superior derecha */
    b;
    /** @type {number} Entrada inferior izquierda */
    c;
    /** @type {number} Entrada inferior derecha */
    d;
    /** @type {number} Determinante precalculado */
    _determinante;
    /** @type {string} Representación en cadena precalculada */
    _cadena;

    /**
     * Construye una nueva matriz 2×2 inmutable.
     *
     * Precalcula el determinante y la cadena de representación para acceso rápido.
     *
     * @param {number} a - Fila 0, columna 0
     * @param {number} b - Fila 0, columna 1
     * @param {number} c - Fila 1, columna 0
     * @param {number} d - Fila 1, columna 1
     */
    constructor(a, b, c, d) {
        super();
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this._determinante = this.a * this.d - this.b * this.c;
        this._cadena = `[[${this.a},${this.b}],[${this.c},${this.d}]]`;
        Object.freeze(this);
    }

    /**
     * Devuelve la matriz neutra (neutro multiplicativo).
     *
     * `[[1, 0], [0, 1]]`
     *
     * @returns {Matriz2x2}
     */
    static neutra() {
        return new Matriz2x2(1, 0, 0, 1);
    }

    /**
     * Crea la matriz canónica para un número primo.
     *
     * Forma: `[[p, 0], [1, 1]]`
     *
     * @param {number} p - Número primo (no se verifica aquí)
     * @returns {Matriz2x2}
     * @see NodoPrimo
     */
    static crear_prima(p) {
        return new Matriz2x2(p, 0, 1, 1);
    }

    /**
     * Construye una matriz a partir de un array [a, b, c, d].
     *
     * @param {number[]} arr - Array de 4 números
     * @returns {Matriz2x2}
     * @throws {Error} si el array no tiene 4 elementos
     */
    static desde_array(arr) {
        if (!Array.isArray(arr) || arr.length !== 4) {
            throw new Error('El array debe contener exactamente 4 elementos.');
        }
        return new Matriz2x2(
            Math.trunc(arr[0]),
            Math.trunc(arr[1]),
            Math.trunc(arr[2]),
            Math.trunc(arr[3])
        );
    }

    /**
     * Multiplica esta matriz por otra (this * otra).
     *
     * El orden de la multiplicación es fundamental para la no conmutatividad.
     *
     * @param {Matriz2x2} otra - Matriz a la derecha del producto
     * @returns {Matriz2x2} Nueva matriz resultado
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
     * Devuelve el determinante precalculado de la matriz.
     *
     * `det = a*d - b*c`
     *
     * @returns {number}
     */
    determinante() {
        return this._determinante;
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
     * Representación canónica en string, precalculada en el constructor.
     *
     * Formato: `"[[a,b],[c,d]]"`
     *
     * @returns {string}
     */
    toString() {
        return this._cadena;
    }

    /**
     * Encuentra el menor número primo estrictamente mayor que n.
     *
     * Utiliza una prueba de divisibilidad simple (división hasta √candidato).
     * Es adecuada para los números pequeños (hasta unos pocos miles) que maneja el framework.
     *
     * @param {number} n - Valor de partida
     * @returns {number} Siguiente número primo después de n
     * @since 1.4.0
     */
    static siguiente_numero_primo(n) {
        let candidato = n + 1;
        while (true) {
            if (Matriz2x2._es_primo(candidato)) {
                return candidato;
            }
            candidato++;
        }
    }

    /**
     * Verifica si un número entero positivo es primo.
     *
     * @param {number} numero
     * @returns {boolean}
     * @private
     */
    static _es_primo(numero) {
        if (numero < 2) return false;
        if (numero === 2) return true;
        if (numero % 2 === 0) return false;
        const limite = Math.sqrt(numero);
        for (let i = 3; i <= limite; i += 2) {
            if (numero % i === 0) return false;
        }
        return true;
    }

    static crear_negativa(n) {
        return new Matriz2x2(n, 0, 1, 1);
    }
}

export {Matriz2x2};