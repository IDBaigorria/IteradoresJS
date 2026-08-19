/**
 * Pool de Ventanas — Iteradores Neuronales.
 *
 * El `PoolVentanas` es el **tejido conectivo** del sistema. Es un mapa
 * global único en toda la instancia que almacena todas las ventanas
 * compuestas que han aparecido, indexadas por su matriz 2×2.
 *
 * ## Funciones
 *
 * - **Cuerpo calloso**: conecta nodos de distintos dominios que comparten
 *   la misma llave matricial, habilitando comunicación lateral (resonancia
 *   inter-dominio) sin pasar por un tálamo central.
 * - **Tironeo global**: cada ventana ajusta su `vector_promedio` hacia el
 *   contexto típico bajo el cual se usa.
 * - **Precarga predictiva**: cuando un nodo se activa bajo una llave, el
 *   Pool consulta los `nodos_afiliados` de otros dominios y les inyecta
 *   energía si la distancia espaciotemporal es menor que el umbral de
 *   resonancia.
 *
 * ## Estructura
 *
 * ```
 * PoolVentanas: Map<clave_matricial, VentanaGlobal>
 * ```
 *
 * @class PoolVentanas
 * @extends Objeto
 * @author Ignacio David Baigorria
 * @since 1.5.1
 * @version 1.5.1
 */

import { Objeto } from "../Nucleo/index.js";
import { Ventana } from "./Ventana.js";

class PoolVentanas extends Objeto {
    /**
     * Instancia singleton del pool.
     * @type {PoolVentanas|null}
     * @private
     */
    static _instancia = null;

    /**
     * Mapa de ventanas indexadas por clave matricial serializada.
     * @type {Map<string, Ventana>}
     * @private
     */
    _pool = new Map();

    /**
     * Umbral de distancia para resonancia inter-dominio.
     * @type {number}
     * @private
     */
    _umbral_resonancia = 0.5;

    /**
     * Factor de decaimiento para resonancia ($\lambda$).
     * @type {number}
     * @private
     */
    _lambda_resonancia = 1.0;

    /**
     * Coeficiente de tironeo global ($\beta_{global}$).
     * @type {number}
     * @private
     */
    _beta_global = 0.05;

    /**
     * Constructor privado (singleton).
     *
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     * @private
     */
    constructor() {
        super();
    }

    /**
     * Devuelve la instancia única del pool.
     *
     * @returns {PoolVentanas}
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     */
    static instancia() {
        if (PoolVentanas._instancia === null) {
            PoolVentanas._instancia = new PoolVentanas();
        }
        return PoolVentanas._instancia;
    }

    /**
     * Reinicia el singleton (útil para pruebas).
     *
     * @returns {void}
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     */
    static reiniciar() {
        PoolVentanas._instancia = null;
    }

    // ═══════════════════════════════════════════════════════
    // ACCESO AL POOL
    // ═══════════════════════════════════════════════════════

    /**
     * Obtiene una ventana del pool por su clave matricial.
     *
     * @param {{a: number, b: number, c: number, d: number}} matriz Matriz 2×2.
     * @returns {Ventana|null}
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     */
    obtener(matriz) {
        const clave = `${matriz.a},${matriz.b},${matriz.c},${matriz.d}`;
        return this._pool.get(clave) ?? null;
    }

    /**
     * Registra una ventana en el pool.
     *
     * Si la ventana ya existe (misma clave), no la reemplaza.
     *
     * @param {Ventana} ventana Ventana a registrar.
     * @returns {Ventana} La ventana registrada (la existente o la nueva).
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     */
    registrar(ventana) {
        const clave = ventana.clave();

        if (this._pool.has(clave)) {
            return this._pool.get(clave);
        }

        this._pool.set(clave, ventana);
        return ventana;
    }

    /**
     * Devuelve todas las ventanas del pool.
     *
     * @returns {Map<string, Ventana>}
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     */
    todas() {
        return new Map(this._pool);
    }

    /**
     * Devuelve la cantidad de ventanas almacenadas.
     *
     * @returns {number}
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     */
    cantidad() {
        return this._pool.size;
    }

    // ═══════════════════════════════════════════════════════
    // TIRONEO GLOBAL
    // ═══════════════════════════════════════════════════════

    /**
     * Actualiza el vector promedio de una ventana mediante tironeo global.
     *
     * Si la ventana no está en el pool, la registra primero.
     *
     * @param {Ventana} ventana Ventana compuesta.
     * @param {{x: number, y: number, z: number}} vector Vector de activación actual.
     * @returns {Ventana} La ventana actualizada.
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     */
    tironear(ventana, vector) {
        const existente = this.registrar(ventana);
        existente.tironear(vector, this._beta_global);
        return existente;
    }

    /**
     * Aplica tironeo de campo sobre un subconjunto aleatorio de ventanas.
     *
     * Cada ventana seleccionada se ajusta sutilmente hacia el vector actual,
     * con fuerza decreciente según la distancia entre su `vector_promedio` y
     * el momento presente.
     *
     * $$\hat{w} \leftarrow \hat{w} + \gamma \cdot f(m_w, d_w) \cdot (\hat{V}_{actual} - \hat{w})$$
     *
     * @param {{x: number, y: number, z: number}} vector_actual Vector de activación.
     * @param {number} [gamma=0.01] Tasa de tironeo de campo.
     * @param {number} [muestra=100] Tamaño del subconjunto.
     * @returns {void}
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     */
    tironeo_campo(vector_actual, gamma = 0.01, muestra = 100) {
        const ventanas = Array.from(this._pool.values());
        const total = ventanas.length;

        if (total === 0) return;

        const tam = Math.min(muestra, total);
        const seleccionadas = [];
        const usados = new Set();

        while (seleccionadas.length < tam) {
            const idx = Math.floor(Math.random() * total);
            if (!usados.has(idx)) {
                usados.add(idx);
                seleccionadas.push(ventanas[idx]);
            }
        }

        for (const v of seleccionadas) {
            const vp = v.vector_promedio();
            if (vp === null) continue;

            const dx = vector_actual.x - vp.x;
            const dy = vector_actual.y - vp.y;
            const dz = vector_actual.z - vp.z;
            const distancia = Math.sqrt(dx * dx + dy * dy + dz * dz);

            const f = v.energia_total() / (1.0 + this._lambda_resonancia * distancia * distancia);
            v.tironear(vector_actual, gamma * f);
        }
    }

    // ═══════════════════════════════════════════════════════
    // RESONANCIA INTER-DOMINIO
    // ═══════════════════════════════════════════════════════

    /**
     * Consulta nodos afiliados de otros dominios bajo la misma llave.
     *
     * Cuando un nodo $N$ se activa con energía $E_N$ bajo la llave $M(W)$,
     * el sistema obtiene los nodos afiliados de la ventana. Para cada nodo
     * $N'$ en un dominio diferente, si la distancia espaciotemporal $d$ es
     * menor que el umbral, se inyecta energía:
     *
     * $$E_{N'} \leftarrow E_{N'} + \alpha \cdot E_N \cdot e^{-\lambda d}$$
     *
     * @param {Ventana} ventana      Ventana compuesta actual.
     * @param {string}  dominio_origen Dominio del nodo que se activa.
     * @param {number}  energia      Energía del nodo activado.
     * @param {number}  [alfa=0.1]   Coeficiente de resonancia.
     * @returns {Object.<string, number>} Mapa de id_nodo => energía inyectada.
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     */
    resonar(ventana, dominio_origen, energia, alfa = 0.1) {
        const existente = this.obtener(ventana.matriz());
        if (existente === null) {
            return {};
        }

        const inyectado = {};
        for (const id_nodo of existente.nodos_afiliados()) {
            const partes = id_nodo.split('::', 2);
            const dominio_nodo = partes[0] ?? '';

            if (dominio_nodo === dominio_origen || dominio_nodo === '') {
                continue;
            }

            const d = 0.0; // Distancia espaciotemporal simplificada
            if (d < this._umbral_resonancia) {
                const energia_inyectada = alfa * energia * Math.exp(-this._lambda_resonancia * d);
                inyectado[id_nodo] = energia_inyectada;
            }
        }

        return inyectado;
    }

    // ═══════════════════════════════════════════════════════
    // CONFIGURACIÓN
    // ═══════════════════════════════════════════════════════

    /**
     * Establece el umbral de resonancia.
     *
     * @param {number} umbral
     * @returns {void}
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     */
    umbral_resonancia(umbral) {
        this._umbral_resonancia = umbral;
    }

    /**
     * Establece el coeficiente de tironeo global.
     *
     * @param {number} beta
     * @returns {void}
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     */
    beta_global(beta) {
        this._beta_global = beta;
    }
}

export { PoolVentanas };
