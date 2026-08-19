/**
 * Estado × Acción — Iteradores Neuronales.
 *
 * Implementa el **Plano de Estado y Acción** ($\mathcal{S} \times \mathcal{A}$)
 * de la arquitectura de Iteradores Neuronales. Este plano es ortogonal al
 * Cósmico y al Rítmico: captura el estado interno del sistema y la intención
 * del iterador en el momento presente.
 *
 * **Estado ($\mathcal{S}$)**: cada dominio operativo (Tálamo, Comandos,
 * Textos, Medios, Direcciones, Mensajes) genera un espin a partir de su
 * `NodoParalelo` más energético en la fase activa. Las entradas $(a, c)$ de la
 * matriz 2×2 se normalizan a un vector en $S^2$. La masa es $\log(1 + E)$,
 * donde $E$ es la energía del nodo.
 *
 * **Acción ($\mathcal{A}$)**: el verbo que el iterador está ejecutando.
 * Cada verbo es un vector fijo en $S^2$ con masa 1.0. Los verbos son:
 * - `APRENDER`   (fase 0)
 * - `PREDECIR`   (fase 1)
 * - `CORREGIR`   (fase 2)
 * - `CONTROLAR`  (fase 3)
 * - `ASCENDER`   (fase 4)
 * - `DESCENDER`  (fase 5)
 *
 * ## Rol en el sistema
 *
 * - El iterador registra el estado de cada dominio antes de cada pulso.
 * - El verbo actual se establece según la operación que se va a ejecutar.
 * - El ramillete de espines de Estado×Acción se compone matricialmente con
 *   los espines Cósmicos y Rítmicos para formar la llave contextual completa.
 * - Este plano es el único que el iterador controla directamente; los otros
 *   dos son externos (astros) o semi-externos (ciclos culturales).
 *
 * @class EstadoxAccion
 * @extends Objeto
 * @author Ignacio David Baigorria
 * @since 1.5.1
 * @version 1.5.1
 */

import { Objeto } from "../Nucleo/index.js";

class EstadoxAccion extends Objeto {
    // ═══════════════════════════════════════════════════════
    // VERBOS PREDEFINIDOS (vectores fijos en S²)
    // ═══════════════════════════════════════════════════════

    /**
     * Verbos de acción con sus vectores fijos en la esfera unitaria $S^2$.
     *
     * Los vectores forman un octaedro regular: seis direcciones ortogonales
     * por pares, completamente deterministas y simétricas. Cada verbo tiene
     * masa 1.0.
     *
     * @type {Object.<string, {vector: {x: number, y: number, z: number}, masa: number, fase: number}>}
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     */
    static VERBOS = {
        APRENDER: {
            vector: { x: 1.0,  y: 0.0,  z: 0.0 },
            masa: 1.0,
            fase: 0,
        },
        PREDECIR: {
            vector: { x: -1.0, y: 0.0,  z: 0.0 },
            masa: 1.0,
            fase: 1,
        },
        CORREGIR: {
            vector: { x: 0.0,  y: 1.0,  z: 0.0 },
            masa: 1.0,
            fase: 2,
        },
        CONTROLAR: {
            vector: { x: 0.0,  y: -1.0, z: 0.0 },
            masa: 1.0,
            fase: 3,
        },
        ASCENDER: {
            vector: { x: 0.0,  y: 0.0,  z: 1.0 },
            masa: 1.0,
            fase: 4,
        },
        DESCENDER: {
            vector: { x: 0.0,  y: 0.0,  z: -1.0 },
            masa: 1.0,
            fase: 5,
        },
    };

    // ═══════════════════════════════════════════════════════
    // ESTADO INTERNO
    // ═══════════════════════════════════════════════════════

    /**
     * Estado registrado por dominio.
     *
     * @type {Object.<string, {a: number, c: number, energia: number}>}
     * @private
     */
    _estados = {};

    /**
     * Verbo actual del iterador.
     * @type {string}
     * @private
     */
    _verbo_actual = 'APRENDER';

    /**
     * Último ramillete de espines calculado (caché).
     * @type {Array<{nombre: string, tipo: string, masa: number, vector: {x: number, y: number, z: number}}>|null}
     * @private
     */
    _ultimo_espines = null;

    /**
     * Último vector de activación calculado (caché).
     * @type {{x: number, y: number, z: number}|null}
     * @private
     */
    _ultimo_vector = null;

    /**
     * Construye el plano Estado×Acción con el verbo por defecto.
     *
     * @param {string} [verbo_inicial='APRENDER'] Verbo inicial.
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     */
    constructor(verbo_inicial = 'APRENDER') {
        super();
        this.establecer_verbo(verbo_inicial);
    }

    // ═══════════════════════════════════════════════════════
    // GESTIÓN DE ESTADO
    // ═══════════════════════════════════════════════════════

    /**
     * Registra el estado de un dominio operativo.
     *
     * El estado se deriva del `NodoParalelo` más energético del dominio en
     * la fase activa. Las entradas $(a, c)$ de su matriz 2×2 se normalizan
     * para formar la dirección del espin; la energía $E$ determina la masa
     * como $\log(1 + E)$.
     *
     * @param {string} dominio  Nombre del dominio (ej: 'Textos', 'Comandos').
     * @param {number} a        Entrada (0,0) de la matriz 2×2.
     * @param {number} c        Entrada (1,0) de la matriz 2×2.
     * @param {number} energia  Energía del nodo ($E \geq 0$).
     * @returns {void}
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     */
    registrar_estado(dominio, a, c, energia) {
        this._estados[dominio] = {
            a: a,
            c: c,
            energia: Math.max(0.0, energia),
        };
        this._invalidar_cache();
    }

    /**
     * Elimina el estado de un dominio.
     *
     * @param {string} dominio Nombre del dominio.
     * @returns {void}
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     */
    eliminar_estado(dominio) {
        delete this._estados[dominio];
        this._invalidar_cache();
    }

    /**
     * Devuelve el estado registrado de un dominio.
     *
     * @param {string} dominio Nombre del dominio.
     * @returns {{a: number, c: number, energia: number}|null}
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     */
    estado(dominio) {
        return this._estados[dominio] ?? null;
    }

    /**
     * Devuelve todos los estados registrados.
     *
     * @returns {Object.<string, {a: number, c: number, energia: number}>}
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     */
    estados_registrados() {
        return { ...this._estados };
    }

    // ═══════════════════════════════════════════════════════
    // GESTIÓN DE ACCIÓN
    // ═══════════════════════════════════════════════════════

    /**
     * Establece el verbo actual del iterador.
     *
     * El verbo determina la intención del pulso: aprender, predecir,
     * corregir, controlar, ascender o descender.
     *
     * @param {string} verbo Uno de: APRENDER, PREDECIR, CORREGIR,
     *   CONTROLAR, ASCENDER, DESCENDER.
     * @returns {void}
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     */
    establecer_verbo(verbo) {
        const v = verbo.toUpperCase();
        if (!EstadoxAccion.VERBOS[v]) {
            this._error(`Verbo '${verbo}' no reconocido. ` +
                `Use: APRENDER, PREDECIR, CORREGIR, CONTROLAR, ASCENDER, DESCENDER.`);
            return;
        }
        this._verbo_actual = v;
        this._invalidar_cache();
    }

    /**
     * Devuelve el verbo actual.
     *
     * @returns {string}
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     */
    verbo() {
        return this._verbo_actual;
    }

    /**
     * Devuelve la fase numérica del verbo actual.
     *
     * @returns {number} Fase entre 0 y 5.
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     */
    fase_verbo() {
        return EstadoxAccion.VERBOS[this._verbo_actual].fase;
    }

    /**
     * Devuelve todos los verbos disponibles.
     *
     * @returns {Object.<string, {vector: {x: number, y: number, z: number}, masa: number, fase: number}>}
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     */
    verbos_disponibles() {
        return { ...EstadoxAccion.VERBOS };
    }

    // ═══════════════════════════════════════════════════════
    // RAMILLETE DE ESPINES
    // ═══════════════════════════════════════════════════════

    /**
     * Devuelve el ramillete de espines del plano Estado×Acción.
     *
     * El ramillete contiene:
     * - Un espin por cada dominio registrado (tipo 'Estado').
     * - Un espin para el verbo actual (tipo 'Accion').
     *
     * @returns {Array<{nombre: string, tipo: string, masa: number, vector: {x: number, y: number, z: number}}>}
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     */
    espines() {
        if (this._ultimo_espines !== null) {
            return this._ultimo_espines;
        }

        this._ultimo_espines = [
            ...EstadoxAccion._calcular_espines_estado(this._estados),
            EstadoxAccion._calcular_espin_accion(this._verbo_actual),
        ];

        return this._ultimo_espines;
    }

    /**
     * Devuelve el espin de estado de un dominio específico.
     *
     * @param {string} dominio Nombre del dominio.
     * @returns {{nombre: string, tipo: string, masa: number, vector: {x: number, y: number, z: number}}|null}
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     */
    espin_estado(dominio) {
        if (!this._estados[dominio]) {
            this._error(`Dominio '${dominio}' no tiene estado registrado.`);
            return null;
        }

        return EstadoxAccion._construir_espin_estado(dominio, this._estados[dominio]);
    }

    /**
     * Devuelve el espin de acción (verbo actual).
     *
     * @returns {{nombre: string, tipo: string, masa: number, vector: {x: number, y: number, z: number}}}
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     */
    espin_accion() {
        return EstadoxAccion._calcular_espin_accion(this._verbo_actual);
    }

    /**
     * Calcula el vector de activación del plano Estado×Acción.
     *
     * Es la suma ponderada por masa de todos los espines de estado más el
     * espin de acción, normalizada a unitario.
     *
     * @returns {{x: number, y: number, z: number}} Vector unitario.
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     */
    vector_activacion() {
        if (this._ultimo_vector !== null) {
            return this._ultimo_vector;
        }

        const espines = this.espines();
        this._ultimo_vector = EstadoxAccion._activacion_desde_espines(espines);

        return this._ultimo_vector;
    }

    /**
     * Alias de `vector_activacion()` para consistencia con los demás relojes.
     *
     * @returns {{x: number, y: number, z: number}} Vector unitario.
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     */
    vector() {
        return this.vector_activacion();
    }

    // ═══════════════════════════════════════════════════════
    // CÁLCULOS INTERNOS
    // ═══════════════════════════════════════════════════════

    /**
     * Calcula los espines de estado para todos los dominios registrados.
     *
     * @param {Object.<string, {a: number, c: number, energia: number}>} estados
     * @returns {Array<{nombre: string, tipo: string, masa: number, vector: {x: number, y: number, z: number}}>}
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     * @private
     */
    static _calcular_espines_estado(estados) {
        const espines = [];
        for (const [dominio, datos] of Object.entries(estados)) {
            espines.push(this._construir_espin_estado(dominio, datos));
        }
        return espines;
    }

    /**
     * Construye un espin de estado a partir de los datos de un dominio.
     *
     * Las entradas $(a, c)$ de la matriz 2×2 se normalizan:
     * $$\hat{s}_{D,F} = \left(\frac{a}{\sqrt{a^2+c^2}}, \; \frac{c}{\sqrt{a^2+c^2}}, \; 0\right)$$
     *
     * La masa es $m_{D,F} = \log(1 + E_{D,F})$.
     *
     * @param {string} dominio Nombre del dominio.
     * @param {{a: number, c: number, energia: number}} datos
     * @returns {{nombre: string, tipo: string, masa: number, vector: {x: number, y: number, z: number}}}
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     * @private
     */
    static _construir_espin_estado(dominio, datos) {
        const a = datos.a;
        const c = datos.c;
        const energia = datos.energia;

        const norm = Math.sqrt(a * a + c * c);
        let vector;
        if (norm < 1e-9) {
            vector = { x: 1.0, y: 0.0, z: 0.0 };
        } else {
            vector = {
                x: a / norm,
                y: c / norm,
                z: 0.0,
            };
        }

        const masa = Math.log(1.0 + energia);

        return {
            nombre: dominio,
            tipo: 'Estado',
            masa: masa,
            vector: vector,
        };
    }

    /**
     * Calcula el espin de acción para un verbo dado.
     *
     * @param {string} verbo Nombre del verbo.
     * @returns {{nombre: string, tipo: string, masa: number, vector: {x: number, y: number, z: number}}}
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     * @private
     */
    static _calcular_espin_accion(verbo) {
        const config = this.VERBOS[verbo];
        return {
            nombre: verbo,
            tipo: 'Accion',
            masa: config.masa,
            vector: config.vector,
        };
    }

    /**
     * Calcula el vector de activación a partir de un ramillete de espines.
     *
     * @param {Array} espines Ramillete de espines.
     * @returns {{x: number, y: number, z: number}} Vector unitario.
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     * @private
     */
    static _activacion_desde_espines(espines) {
        let x = 0.0, y = 0.0, z = 0.0;

        for (const espin of espines) {
            const m = espin.masa;
            const v = espin.vector;
            x += m * v.x;
            y += m * v.y;
            z += m * v.z;
        }

        const magnitud = Math.sqrt(x * x + y * y + z * z);
        if (magnitud < 1e-9) {
            return { x: 1.0, y: 0.0, z: 0.0 };
        }

        return {
            x: x / magnitud,
            y: y / magnitud,
            z: z / magnitud,
        };
    }

    /**
     * Invalida la caché interna.
     *
     * Se invoca automáticamente al registrar/eliminar estados o cambiar el verbo.
     *
     * @returns {void}
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     * @private
     */
    _invalidar_cache() {
        this._ultimo_espines = null;
        this._ultimo_vector = null;
    }
}

export { EstadoxAccion };
