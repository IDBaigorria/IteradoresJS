import { NodoElectrico } from './NodoElectrico.js';
import { Matriz2x2 } from './Matriz2x2.js';
import { Conf } from '../Configuracion/Configuracion.js';

/**
 * NodoNumerico – Nodo eléctrico con identidad matricial 2×2.
 *
 * Representa tanto **secuencias ordenadas** como **conjuntos desordenados**
 * dentro del grafo de aprendizaje. Es la base de la inteligencia emergente
 * del framework Iteradores.
 *
 * ## Visión general: del léxico al concepto
 *
 * La arquitectura de fases permite que el sistema escale en comprensión:
 *
 * - **Nivel Léxico (Fase 0 y 1):** Se detectan p-gramas de bytes, donde p es
 *   un número primo pequeño (2, 3, 5, 7...). Los NodoNumerico con `ordenado = true`
 *   representan concatenaciones de exactamente p factores.
 *
 * - **Nivel Morfológico (Fases intermedias):** Se agrupan nodos por rol en
 *   NodoNumerico con `ordenado = false` (conjuntos). La matriz incluye una
 *   **marca de conjunto** que la distingue de cualquier secuencia.
 *
 * - **Nivel Conceptual (Fases altas):** Los conjuntos ascienden y se combinan
 *   para formar conceptos abstractos (sílabas, palabras, significados).
 *
 * ## p-gramas primos
 *
 * El sistema opera con p-gramas donde p es primo pequeño. Esto evita la
 * explosión binaria al permitir aplanar estructuras: un trigrama (p=3) no
 * necesita ser una jerarquía de bigramas; puede ser un solo nodo con tres
 * factores directos.
 *
 * @class
 * @extends NodoElectrico
 * @version 1.4.2
 * @since 1.4.2
 */
class NodoNumerico extends NodoElectrico {
    /** @type {boolean} */
    #ordenado;

    /** @type {Matriz2x2} */
    #identidad;

    /** @type {Map<string, NodoNumerico>} */
    static #indice_identidad = new Map();

    /** @type {Map<string, NodoPrimo[]>} */
    static #primos_libres_por_fase = new Map();

    /** @type {Map<string, number>} */
    static #limites_por_fase = new Map();

    /** @type {Map<string, number>} */
    static #siguiente_primo_a_crear = new Map();
    constructor() {
        super();
    }

    /** @type {Matriz2x2|null} */
    static #matriz_marca_conjunto = null;

    /**
     * Devuelve la matriz de marca de conjunto (cacheada).
     * @returns {Matriz2x2}
     */
    static #obtener_matriz_marca() {
        if (!this.#matriz_marca_conjunto) {
            const m = Conf.MATRIZ_MARCA_CONJUNTO;
            this.#matriz_marca_conjunto = new Matriz2x2(m[0][0], m[0][1], m[1][0], m[1][1]);
        }
        return this.#matriz_marca_conjunto;
    }

    /**
     * @returns {boolean}
     */
    get ordenado() {
        return this.#ordenado;
    }

    /**
     * @returns {Matriz2x2}
     */
    get identidad() {
        return this.#identidad;
    }
    
    /**
     * Asigna la matriz identidad al nodo (solo para uso en pruebas).
     *
     * @param {Matriz2x2} identidad
     * @since 1.4.2
     */
    _identidad(identidad) {
        if (!Entorno.permite_pruebas()) {
            this.constructor._alerta('_identidad() solo está disponible en entorno de pruebas.');
            return;
        }
        if (identidad instanceof Matriz2x2) {
            this.#identidad = identidad;
        } else {
            this.constructor._alerta('El valor debe ser una instancia de Matriz2x2.');
        }
    }

    /**
     * @param {number} n
     * @returns {boolean}
     * @private
     */
    static #es_primo(n) {
        if (n < 2) return false;
        if (n === 2) return true;
        if (n % 2 === 0) return false;
        for (let i = 3; i * i <= n; i += 2) {
            if (n % i === 0) return false;
        }
        return true;
    }

    /**
     * Crea una secuencia ordenada de p factores (p primo).
     * @param {NodoNumerico[]} factores
     * @returns {NodoNumerico}
     */
    static crear_secuencia(factores, capacidad = Conf.CAPACIDAD_NODO_ELECTRICO, fuga = Conf.FUGA_NODO_ELECTRICO) {
        const cantidad = factores.length;
        if (!this.#es_primo(cantidad)) {
            this._error('La cantidad de factores debe ser un número primo.');
        }

        let matriz = factores[0].identidad;
        for (let i = 1; i < cantidad; i++) {
            matriz = matriz.multiplicar(factores[i].identidad);
        }

        const clave = matriz.toString();
        if (this.#indice_identidad.has(clave)) {
            return this.#indice_identidad.get(clave);
        }

        // Llamar al factory base que registra en superestructura
        const nodo = super.crear(capacidad, fuga);  // NodoElectrico.crear()
        nodo.#ordenado = true;
        nodo.#identidad = matriz;

        for (let i = 0; i < cantidad; i++) {
            nodo._adyacente_en(factores[i], 'factor_' + (i + 1), true);
        }

        this.#indice_identidad.set(clave, nodo);
        return nodo;
    }

    /**
     * Crea un conjunto desordenado de p componentes (p primo).
     * @param {NodoNumerico[]} componentes
     * @returns {NodoNumerico}
     */
    static crear_conjunto(componentes, capacidad = Conf.CAPACIDAD_NODO_ELECTRICO, fuga = Conf.FUGA_NODO_ELECTRICO) {
        const cantidad = componentes.length;
        if (!this.#es_primo(cantidad)) {
            this._error('La cantidad de componentes debe ser un número primo.');
        }

        const ordenados = [...componentes].sort((a, b) =>
            a.identidad.toString().localeCompare(b.identidad.toString())
        );

        const marca = NodoNumerico.#obtener_matriz_marca();
        let matriz = marca;
        for (const comp of ordenados) {
            matriz = matriz.multiplicar(comp.identidad);
        }

        const clave = matriz.toString();
        if (this.#indice_identidad.has(clave)) {
            return this.#indice_identidad.get(clave);
        }

        const nodo = super.crear(capacidad, fuga);
        nodo.#ordenado = false;
        nodo.#identidad = matriz;

        for (let i = 0; i < cantidad; i++) {
            nodo._adyacente_en(ordenados[i], 'componente_' + (i + 1), true);
        }

        this.#indice_identidad.set(clave, nodo);
        return nodo;
    }

    /**
     * Obtiene un nodo por su identidad matricial.
     * @param {Matriz2x2} identidad
     * @returns {NodoNumerico|null}
     */
    static nodo_por_identidad(identidad) {
        return this.#indice_identidad.get(identidad.toString()) ?? null;
    }

    /**
     * Devuelve el siguiente NodoPrimo libre en la fase.
     * @param {string} [fase]
     * @returns {NodoPrimo|null}
     */
    static siguiente_primo_libre(fase) {
        // TODO 1.4.2
    }

    /**
     * Inicializa la reserva de primos para una fase.
     * @param {string} fase
     * @param {number} limite
     */
    static inicializar_fase(fase, limite) {
        // TODO 1.4.2
    }
}

export { NodoNumerico };