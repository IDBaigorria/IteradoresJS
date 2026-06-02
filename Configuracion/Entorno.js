/**
 * Gestión del entorno de ejecución.
 *
 * Permite definir y consultar en qué etapa se encuentra la aplicación:
 * desarrollo, pruebas o producción. Esto condiciona comportamientos
 * sensibles (como la disponibilidad de métodos de prueba).
 *
 * @author Ignacio David Baigorria
 * @version 1.0.0
 * @since 1.2
 * @module Configuracion/Entorno
 */
export const Entorno = {
    /**
     * Entorno de desarrollo.
     * @type {string}
     * @constant
     */
    DESARROLLO: 'desarrollo',

    /**
     * Entorno de pruebas (testing).
     * @type {string}
     * @constant
     */
    PRUEBAS: 'pruebas',

    /**
     * Entorno de producción.
     * @type {string}
     * @constant
     */
    PRODUCCION: 'produccion',

    /**
     * Entorno actual (privado).
     * @type {string}
     */
    _entorno: null,

    /**
     * Inicializa el entorno basándose en variables de entorno o configuración global.
     *
     * En Node.js, lee de `process.env.NODE_ENV`.
     * En el navegador, puede leer de una variable global `window.APP_ENV` o
     * de un meta tag. Si no se encuentra, por defecto usa 'desarrollo'.
     *
     * Se recomienda llamar a este método al inicio de la aplicación.
     *
     * @returns {void}
     *
     * @example
     * ```javascript
     * import { Entorno } from './Configuracion/Entorno.js';
     * Entorno.inicializar();
     * console.log(Entorno.actual()); // 'desarrollo' (por defecto)
     * ```
     */
    inicializar() {
        let env = null;
        // Entorno Node.js
        if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV) {
            env = process.env.NODE_ENV;
        }
        // Entorno navegador (variable global)
        else if (typeof window !== 'undefined' && window.APP_ENV) {
            env = window.APP_ENV;
        }
        // Si no se definió, usar desarrollo por defecto
        if (!env) {
            env = this.DESARROLLO;
        }
        this.establecer(env);
    },

    /**
     * Establece el entorno actual.
     *
     * Solo se permiten los valores definidos en las constantes de la clase.
     *
     * @param {string} entorno Nombre del entorno (desarrollo, pruebas, produccion).
     * @returns {boolean} True si se estableció correctamente, false si el valor no es válido.
     */
    establecer(entorno) {
        const valor = entorno.toLowerCase().trim();
        if ([this.DESARROLLO, this.PRUEBAS, this.PRODUCCION].includes(valor)) {
            this._entorno = valor;
            return true;
        }
        console.warn(`Entorno inválido: '${entorno}'. Usando el anterior.`);
        return false;
    },

    /**
     * Obtiene el entorno actual.
     *
     * @returns {string}
     */
    actual() {
        if (!this._entorno) this.inicializar();
        return this._entorno;
    },

    /**
     * Verifica si el entorno actual es desarrollo.
     *
     * @returns {boolean}
     */
    es_desarrollo() {
        return this.actual() === this.DESARROLLO;
    },

    /**
     * Verifica si el entorno actual es pruebas.
     *
     * @returns {boolean}
     */
    es_pruebas() {
        return this.actual() === this.PRUEBAS;
    },

    /**
     * Verifica si el entorno actual es producción.
     *
     * @returns {boolean}
     */
    es_produccion() {
        return this.actual() === this.PRODUCCION;
    },

    /**
     * Verifica si el entorno actual permite funciones de depuración/prueba.
     *
     * Este método es útil para condicionar la ejecución de código sensible,
     * como el método Controlador.ejecutarPrueba().
     *
     * @returns {boolean} True si el entorno NO es producción (es decir, desarrollo o pruebas).
     */
    permite_pruebas() {
        return this.actual() !== this.PRODUCCION;
    }
};

// Inicialización automática opcional (si se importa el módulo)
// Entorno.inicializar();