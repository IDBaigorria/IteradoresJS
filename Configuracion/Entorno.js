/**
 * Gestión del entorno de ejecución.
 *
 * Centraliza la configuración del contexto en el que corre la aplicación,
 * incluyendo el modo de ejecución (desarrollo, pruebas, producción),
 * el tipo de salida esperado (consola o HTML) y el método de persistencia
 * activo para la superestructura (sql, json, xml, etc.).
 *
 * Esta clase actúa como fuente única de verdad para todos los componentes
 * que necesiten adaptar su comportamiento al entorno actual.
 *
 * @author Ignacio David Baigorria
 * @version 1.0.1
 * @since 1.2.6
 * @module Configuracion/Entorno
 */
export const Entorno = {
    // ──────────────────────────────────────────────
    // Constantes de modo de ejecución
    // ──────────────────────────────────────────────
    /** @type {string} */
    MODO_DESARROLLO: 'desarrollo',
    /** @type {string} */
    MODO_PRUEBAS: 'pruebas',
    /** @type {string} */
    MODO_PRODUCCION: 'produccion',

    // ──────────────────────────────────────────────
    // Constantes de tipo de salida
    // ──────────────────────────────────────────────
    /** @type {string} */
    SALIDA_CONSOLA: 'consola',
    /** @type {string} */
    SALIDA_HTML: 'html',

    // ──────────────────────────────────────────────
    // Constantes de método de persistencia
    // ──────────────────────────────────────────────
    /** @type {string} */
    PERSISTENCIA_INDEXEDBD: 'indexedbd',
    /** @type {string} */
    PERSISTENCIA_JSON: 'json',
    /** @type {string} */
    PERSISTENCIA_XML: 'xml',

    // ──────────────────────────────────────────────
    // Propiedades privadas
    // ──────────────────────────────────────────────
    /** @type {string} */
    _modo: null,
    /** @type {string} */
    _salida: null,
    /** @type {string} */
    _persistencia: null,

    /**
     * Inicializa el entorno con valores por defecto detectados del sistema.
     *
     * Intenta leer el modo desde variables de entorno (Node.js o navegador).
     * Si no se encuentra, usa 'desarrollo'.
     * El tipo de salida se infiere del contexto (consola si es Node.js sin navegador,
     * HTML en caso contrario).
     * El método de persistencia por defecto es 'sql'.
     *
     * @returns {void}
     */
    inicializar() {
        // Detectar modo
        let modo = null;
        if (typeof process !== 'undefined' && process.env?.NODE_ENV) {
            modo = process.env.NODE_ENV;
        } else if (typeof window !== 'undefined' && window.APP_ENV) {
            modo = window.APP_ENV;
        }
        if (!modo) modo = this.MODO_DESARROLLO;
        this.establecer_modo(modo);

        // Detectar tipo de salida
        if (!this._salida) {
            if (typeof process !== 'undefined' && typeof window === 'undefined') {
                this._salida = this.SALIDA_CONSOLA;
            } else {
                this._salida = this.SALIDA_HTML;
            }
        }

        // Persistencia por defecto
        if (!this._persistencia) {
            this._persistencia = this.PERSISTENCIA_INDEXEDBD;
        }
    },

    // ══════════════════════════════════════════════
    // MODO DE EJECUCIÓN
    // ══════════════════════════════════════════════

    /**
     * Define el modo de ejecución de la aplicación.
     *
     * @param {string} modo 'desarrollo', 'pruebas' o 'produccion'.
     * @returns {boolean}
     */
    establecer_modo(modo) {
        const valor = modo.toLowerCase().trim();
        if ([this.MODO_DESARROLLO, this.MODO_PRUEBAS, this.MODO_PRODUCCION].includes(valor)) {
            this._modo = valor;
            return true;
        }
        console.warn(`Modo de ejecución inválido: '${modo}'. Se mantiene el anterior.`);
        return false;
    },

    /**
     * Obtiene el modo de ejecución actual.
     * @returns {string}
     */
    modo() {
        if (!this._modo) this.inicializar();
        return this._modo;
    },

    /**
     * Verifica si el modo actual es desarrollo.
     * @returns {boolean}
     */
    es_desarrollo() {
        return this.modo() === this.MODO_DESARROLLO;
    },

    /**
     * Verifica si el modo actual es pruebas.
     * @returns {boolean}
     */
    es_pruebas() {
        return this.modo() === this.MODO_PRUEBAS;
    },

    /**
     * Verifica si el modo actual es producción.
     * @returns {boolean}
     */
    es_produccion() {
        return this.modo() === this.MODO_PRODUCCION;
    },

    /**
     * Indica si el modo actual permite ejecutar pruebas.
     * @returns {boolean}
     */
    permite_pruebas() {
        return this.modo() !== this.MODO_PRODUCCION;
    },

    // ══════════════════════════════════════════════
    // TIPO DE SALIDA
    // ══════════════════════════════════════════════

    /**
     * Define el tipo de salida para impresión/logging.
     *
     * @param {string} tipo 'consola' o 'html'.
     * @returns {boolean}
     */
    establecer_salida(tipo) {
        const valor = tipo.toLowerCase().trim();
        if ([this.SALIDA_CONSOLA, this.SALIDA_HTML].includes(valor)) {
            this._salida = valor;
            return true;
        }
        console.warn(`Tipo de salida inválido: '${tipo}'. Debe ser 'consola' o 'html'.`);
        return false;
    },

    /**
     * Obtiene el tipo de salida configurado.
     * @returns {string}
     */
    salida() {
        if (!this._salida) this.inicializar();
        return this._salida;
    },

    /**
     * Comprueba si la salida es para consola.
     * @returns {boolean}
     */
    es_consola() {
        return this.salida() === this.SALIDA_CONSOLA;
    },

    /**
     * Comprueba si la salida es para HTML.
     * @returns {boolean}
     */
    es_html() {
        return this.salida() === this.SALIDA_HTML;
    },

    // ══════════════════════════════════════════════
    // MÉTODO DE PERSISTENCIA
    // ══════════════════════════════════════════════

    /**
     * Establece el método de persistencia activo para la superestructura.
     *
     * @param {string} metodo 'sql', 'json' o 'xml'.
     * @returns {boolean}
     */
    establecer_persistencia(metodo) {
        const valor = metodo.toLowerCase().trim();
        if ([this.PERSISTENCIA_INDEXEDBD, this.PERSISTENCIA_JSON, this.PERSISTENCIA_XML].includes(valor)) {
            this._persistencia = valor;
            return true;
        }
        console.warn(`Método de persistencia inválido: '${metodo}'. Use 'sql', 'json' o 'xml'.`);
        return false;
    },

    /**
     * Devuelve el método de persistencia activo.
     * @returns {string}
     */
    persistencia() {
        if (!this._persistencia) this.inicializar();
        return this._persistencia;
    },

    /**
     * Verifica si la persistencia es SQL.
     * @returns {boolean}
     */
    es_persistencia_sql() {
        return this.persistencia() === this.PERSISTENCIA_INDEXEDBD;
    },

    /**
     * Verifica si la persistencia es JSON.
     * @returns {boolean}
     */
    es_persistencia_json() {
        return this.persistencia() === this.PERSISTENCIA_JSON;
    },

    /**
     * Verifica si la persistencia es XML.
     * @returns {boolean}
     */
    es_persistencia_xml() {
        return this.persistencia() === this.PERSISTENCIA_XML;
    }
};