import { Conf } from "./index.js";
/**
 * Gestión del entorno de ejecución y conciencia geográfica.
 *
 * Centraliza la configuración del contexto en el que corre la aplicación:
 * modo de ejecución (desarrollo, pruebas, producción), tipo de salida
 * (consola o HTML), método de persistencia activo para la superestructura
 * (IndexedDB, JSON, XML) y la ubicación geográfica del dispositivo.
 *
 * La ubicación se obtiene de forma automática utilizando la mejor fuente
 * disponible (geolocalización del navegador o coordenadas predefinidas)
 * y puede notificar cambios en tiempo real a través de {@link escuchar_cambios}.
 *
 * Esta clase actúa como fuente única de verdad para todos los componentes
 * que necesiten adaptar su comportamiento al entorno actual.
 *
 * @author Ignacio David Baigorria
 * @version 1.3.6
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
     * Caché de coordenadas para evitar múltiples consultas externas.
     *
     * @type {{latitud: number, longitud: number}|null}
     * @private
     * @since 1.3.6
     */
    _coordenadas_cacheadas: null,

    /**
     * Inicializa el entorno con valores por defecto detectados del sistema.
     *
     * Intenta leer el modo desde variables de entorno (Node.js o navegador).
     * Si no se encuentra, usa 'desarrollo'.
     * El tipo de salida se infiere del contexto (consola si es Node.js sin navegador,
     * HTML en caso contrario).
     * El método de persistencia por defecto es IndexedDB.
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
     * @param {string} metodo 'indexedbd', 'json' o 'xml'.
     * @returns {boolean}
     */
    establecer_persistencia(metodo) {
        const valor = metodo.toLowerCase().trim();
        if ([this.PERSISTENCIA_INDEXEDBD, this.PERSISTENCIA_JSON, this.PERSISTENCIA_XML].includes(valor)) {
            this._persistencia = valor;
            return true;
        }
        console.warn(`Método de persistencia inválido: '${metodo}'. Use 'indexedbd', 'json' o 'xml'.`);
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
     * Verifica si la persistencia es IndexedDB.
     * @returns {boolean}
     */
    es_persistencia_indexeddb() {
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
    },

   // ═══════════════════════════════════════════════════════════
    // UBICACIÓN GEOGRÁFICA (v1.3.6)
    // ═══════════════════════════════════════════════════════════

    /**
     * Obtiene las coordenadas geográficas actuales utilizando la mejor
     * fuente disponible.
     *
     * Orden de prioridad:
     * 1. Geolocalización del navegador (requiere permiso y contexto seguro).
     * 2. Detección por IP mediante servicio externo configurable.
     * 3. Coordenadas predefinidas en {@link Conf.LATITUD_PREDETERMINADA}.
     *
     * Para facilitar las pruebas, se pueden inyectar dependencias a través
     * del parámetro `opciones`, pero **solo en entorno de pruebas**. En
     * producción, cualquier valor en `opciones.geolocalizacion`,
     * `opciones.fetch` u `opciones.forzar` será ignorado y se registrará
     * un error.
     *
     * @param {Object} [opciones={}] Opciones adicionales (solo para testing).
     * @param {Object} [opciones.geolocalizacion] Mock de `navigator.geolocation`.
     * @param {Function} [opciones.fetch] Mock de `fetch`.
     * @param {boolean} [opciones.forzar] Si es true, ignora la caché.
     * @returns {Promise<{latitud: number, longitud: number}>}
     * @since 1.3.6
     */
    async obtener_coordenadas(opciones = {}) {
        // Bloquear inyección de dependencias fuera de pruebas
        const tiene_mocks = opciones.geolocalizacion || opciones.fetch || opciones.forzar;
        if (tiene_mocks && !this.permite_pruebas()) {
            console.warn('obtener_coordenadas: los parámetros de mock solo están permitidos en entorno de pruebas.');
            opciones = {}; // resetear para continuar con flujo normal
        }

        // Si ya están cacheadas y no se fuerza recarga, se devuelven
        if (this._coordenadas_cacheadas && !opciones.forzar) {
            return this._coordenadas_cacheadas;
        }

        // Permitimos inyectar un mock de geolocalización (solo pruebas)
        const geolocalizacion = opciones.geolocalizacion ||
            (typeof navigator !== 'undefined' && navigator.geolocation ? navigator.geolocation : null);

        // Permitimos inyectar un mock de fetch (solo pruebas)
        const fetch_fn = opciones.fetch || (typeof fetch !== 'undefined' ? fetch : null);

        // Intento 1: Geolocalización
        if (geolocalizacion) {
            try {
                const posicion = await new Promise((resolve, reject) => {
                    geolocalizacion.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: false,
                        timeout: 5000,
                        maximumAge: 300000
                    });
                });
                const coords = {
                    latitud: posicion.coords.latitude,
                    longitud: posicion.coords.longitude,
                };
                this._coordenadas_cacheadas = coords;
                return coords;
            } catch (error) {
                console.warn('Geolocalización no disponible o denegada:', error.message);
            }
        }

        // Intento 2: IP
        if (fetch_fn) {
            try {
                const respuesta = await fetch_fn(Conf.GEOLOCALIZACION_URL);
                if (respuesta.ok) {
                    const data = await respuesta.json();
                    if (data && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
                        const coords = { latitud: data.latitude, longitud: data.longitude };
                        this._coordenadas_cacheadas = coords;
                        return coords;
                    }
                }
            } catch (error) {
                console.warn('Detección por IP fallida:', error.message);
            }
        }

        // Fallback
        const coords = {
            latitud: Conf.LATITUD_PREDETERMINADA,
            longitud: Conf.LONGITUD_PREDETERMINADA,
        };
        this._coordenadas_cacheadas = coords;
        return coords;
    },

    /**
     * Registra un callback para ser notificado cuando cambie la ubicación.
     *
     * Para facilitar las pruebas, se puede inyectar un mock de
     * `navigator.geolocation` a través de `opciones.geolocalizacion`,
     * **solo en entorno de pruebas**. En producción, cualquier mock será
     * ignorado y se registrará un error.
     *
     * @param {Function} callback Función que recibirá (latitud, longitud).
     * @param {Object} [opciones={}] Opciones adicionales (solo para testing).
     * @param {Object} [opciones.geolocalizacion] Mock con `watchPosition`.
     * @returns {number|null} ID del watcher, o null si no está disponible.
     * @since 1.3.6
     */
    escuchar_cambios(callback, opciones = {}) {
        // Bloquear inyección de dependencias fuera de pruebas
        if (opciones.geolocalizacion && !this.permite_pruebas()) {
            console.warn('escuchar_cambios: el parámetro geolocalizacion solo está permitido en entorno de pruebas.');
            opciones = {};
        }

        const geolocalizacion = opciones.geolocalizacion ||
            (typeof navigator !== 'undefined' && navigator.geolocation ? navigator.geolocation : null);

        if (!geolocalizacion || typeof geolocalizacion.watchPosition !== 'function') {
            return null;
        }

        const watcher_id = geolocalizacion.watchPosition(
            (posicion) => {
                const coords = {
                    latitud: posicion.coords.latitude,
                    longitud: posicion.coords.longitude,
                };
                this._coordenadas_cacheadas = coords;
                callback(coords.latitud, coords.longitud);
            },
            (error) => {
                console.warn('Error al escuchar cambios de ubicación:', error.message);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
        return watcher_id;
    }
};