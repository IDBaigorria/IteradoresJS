import { Conf } from '../Configuracion/Configuracion.js';
import { Objeto } from "../Nucleo/index.js";
import { ProveedorVectorGravitacional } from './interfaces/index.js'; 
import { mezclar_clase_con_interfaces } from "../miscelaneas/mixin.js";

/**
 * Reloj Astronómico del framework.
 *
 * Implementa {@link ProveedorVectorGravitacional} y proporciona un vector
 * gravitacional normalizado (x, y, z) que representa de forma determinista
 * la configuración del cielo local (Sol y Luna) para cualquier ubicación
 * geográfica e instante de tiempo (pasado, presente o futuro).
 *
 * El cálculo utiliza un modelo geométrico simplificado con órbitas circulares
 * que genera ciclos día/noche, fases lunares, estaciones y la precesión nodal
 * lunar (18.6 años) sin necesidad de efemérides de alta precisión.
 *
 * ## Rol en el sistema
 *
 * - Los iteradores obtienen el vector actual a través del Controlador y lo
 *   usan para "marcar" los pesos de las aristas que recorren (huella temporal).
 * - La distancia entre el vector almacenado en un peso y el vector actual
 *   mide la "antigüedad" relativa de ese recuerdo.
 * - Permite realizar predicciones buscando en el grafo pesos cuyos vectores
 *   sean cercanos a una configuración futura simulada.
 *
 * @class RelojAstronomico
 * @extends Objeto
 * @implements {ProveedorVectorGravitacional}
 * @since 1.3.5
 */
class RelojAstronomico extends mezclar_clase_con_interfaces(Objeto, ProveedorVectorGravitacional) {
    // ═══════════════════════════════════════════════════════
    // ESTADO INTERNO PARA CACHÉ DE CÓMPUTOS
    // ═══════════════════════════════════════════════════════

    /**
     * Latitud configurada para esta instancia (en grados, -90 a 90).
     * @type {number}
     * @private
     */
    _latitud;

    /**
     * Longitud configurada para esta instancia (en grados, -180 a 180).
     * @type {number}
     * @private
     */
    _longitud;

    /**
     * Último timestamp para el que se calculó el vector (Unix).
     * Se usa para la caché de instancia. `null` si no se ha calculado ninguno.
     * @type {number|null}
     * @private
     */
    _ultimo_timestamp = null;

    /**
     * Último vector calculado (caché). Se invalida al cambiar la ubicación
     * o al consultar con un timestamp distinto.
     * @type {{x: number, y: number, z: number}|null}
     * @private
     */
    _ultimo_vector = null;

    /**
     * Construye un reloj con estado ligado a una ubicación fija.
     *
     * @param {number} latitud  Latitud en grados (-90 a 90).
     * @param {number} longitud Longitud en grados (-180 a 180).
     */
    constructor(latitud, longitud) {
        super(); // Llama al constructor de la clase base (mezcla de Objeto + ProveedorVectorGravitacional)
        this._latitud = latitud;
        this._longitud = longitud;
    }

    // ═══════════════════════════════════════════════════════
    // MÉTODOS PÚBLICOS (Interfaz ProveedorVectorGravitacional)
    // ═══════════════════════════════════════════════════════

    /**
     * Devuelve el vector gravitacional para el instante dado (con caché).
     *
     * Si se llama dos veces con el mismo timestamp, devuelve el valor cacheado.
     *
     * @param {number|null} [timestamp=null] Marca de tiempo Unix (segundos). Si es null, se usa Date.now()/1000.
     * @returns {{x: number, y: number, z: number}} Vector unitario.
     */
    vector(timestamp = null) {
        const ts = timestamp ?? Math.floor(Date.now() / 1000);

        // Usar caché si el timestamp no ha cambiado
        if (this._ultimo_timestamp === ts && this._ultimo_vector !== null) {
            return this._ultimo_vector;
        }

        this._ultimo_timestamp = ts;
        this._ultimo_vector = RelojAstronomico._calcular_vector(this._latitud, this._longitud, ts);

        return this._ultimo_vector;
    }

    /**
     * Método estático para obtener el vector gravitacional sin estado.
     *
     * @param {number} latitud   Latitud en grados.
     * @param {number} longitud  Longitud en grados.
     * @param {number|null} [timestamp=null] Marca de tiempo Unix (segundos). Si es null, se usa Date.now()/1000.
     * @returns {{x: number, y: number, z: number}} Vector unitario.
     */
    static vector_gravitacional(latitud, longitud, timestamp = null) {
        const ts = timestamp ?? Math.floor(Date.now() / 1000);
        return this._calcular_vector(latitud, longitud, ts);
    }

    /**
     * Actualiza la ubicación geográfica del reloj.
     *
     * Invalida la caché interna para que el próximo cálculo use las nuevas coordenadas.
     *
     * @param {number} latitud  Nueva latitud en grados (-90 a 90).
     * @param {number} longitud Nueva longitud en grados (-180 a 180).
     * @returns {void}
     */
    _ubicacion(latitud, longitud) {
        this._latitud = latitud;
        this._longitud = longitud;

        // Invalidar caché para forzar recálculo con las nuevas coordenadas
        this._ultimo_timestamp = null;
        this._ultimo_vector = null;
    }

    // ═══════════════════════════════════════════════════════
    // CÁLCULOS INTERNOS
    // ═══════════════════════════════════════════════════════

    /**
     * Calcula el vector gravitacional combinado (Sol + Luna) para una
     * ubicación e instante dados.
     *
     * @param {number} latitud  Latitud en grados.
     * @param {number} longitud Longitud en grados.
     * @param {number} ts       Timestamp Unix (segundos).
     * @returns {{x: number, y: number, z: number}} Vector unitario.
     * @private
     */
    static _calcular_vector(latitud, longitud, ts) {
        const lat_rad = (latitud * Math.PI) / 180.0;
        const lon_rad = (longitud * Math.PI) / 180.0;

        const lst = this._tiempo_sidereo_local(ts, lon_rad);

        const vector_sol  = this._vector_astro(ts, lat_rad, lst, true);
        const vector_luna = this._vector_astro(ts, lat_rad, lst, false);

        const alfa = Conf.RELOJ_ALFA_SOL;
        const beta = Conf.RELOJ_BETA_LUNA;

        let x = alfa * vector_sol.x + beta * vector_luna.x;
        let y = alfa * vector_sol.y + beta * vector_luna.y;
        let z = alfa * vector_sol.z + beta * vector_luna.z;

        const magnitud = Math.sqrt(x * x + y * y + z * z);
        if (magnitud < 1e-9) {
            return { x: 0.0, y: 0.0, z: 1.0 }; // vector neutro hacia arriba
        }

        return {
            x: x / magnitud,
            y: y / magnitud,
            z: z / magnitud,
        };
    }

    /**
     * Calcula el Tiempo Sidéreo Local (LST) en radianes.
     *
     * El LST es el ángulo horario del punto vernal para un observador
     * en una longitud dada. Se utiliza para convertir coordenadas ecuatoriales
     * en coordenadas horizontales locales.
     *
     * @param {number} ts      Timestamp Unix (segundos).
     * @param {number} lon_rad Longitud del observador en radianes.
     * @returns {number} LST en radianes (0 a 2π).
     * @private
     */
    static _tiempo_sidereo_local(ts, lon_rad) {
        const dias_desde_j2000 = (ts / Conf.RELOJ_SEGUNDOS_POR_DIA) - 10957.5;
        let gmst_deg = (280.46061837 + 360.98564736629 * dias_desde_j2000) % 360.0;
        if (gmst_deg < 0) gmst_deg += 360.0;
        const gmst_rad = (gmst_deg * Math.PI) / 180.0;

        let lst = (gmst_rad + lon_rad) % (2.0 * Math.PI);
        return lst < 0 ? lst + 2.0 * Math.PI : lst;
    }

    /**
     * Calcula el vector unitario de un astro (Sol o Luna) en el sistema
     * de coordenadas horizontales locales.
     *
     * El vector resultante está orientado de modo que:
     * - `x` apunta hacia el Este.
     * - `y` apunta hacia el Norte.
     * - `z` apunta hacia el Cenit (arriba).
     *
     * @param {number}  ts      Timestamp Unix (segundos).
     * @param {number}  lat_rad Latitud del observador en radianes.
     * @param {number}  lst     Tiempo Sidéreo Local en radianes.
     * @param {boolean} es_sol  `true` para el Sol, `false` para la Luna.
     * @returns {{x: number, y: number, z: number}} Vector unitario.
     * @private
     */
    static _vector_astro(ts, lat_rad, lst, es_sol) {
        let ar, declinacion;

        if (es_sol) {
            const angulo_anual = 2.0 * Math.PI * (ts % Conf.RELOJ_SEGUNDOS_POR_ANIO) / Conf.RELOJ_SEGUNDOS_POR_ANIO;
            ar = angulo_anual % (2.0 * Math.PI);
            declinacion = (Conf.RELOJ_INCLINACION_ECLIPTICA * Math.PI / 180.0) * Math.sin(angulo_anual);
        } else {
            const angulo_sinodico = 2.0 * Math.PI * (ts % Conf.RELOJ_SEGUNDOS_POR_MES_SINODICO) / Conf.RELOJ_SEGUNDOS_POR_MES_SINODICO;
            const angulo_nodal = 2.0 * Math.PI * (ts % (Conf.RELOJ_PERIODO_PRECESION_NODAL * Conf.RELOJ_SEGUNDOS_POR_ANIO))
                / (Conf.RELOJ_PERIODO_PRECESION_NODAL * Conf.RELOJ_SEGUNDOS_POR_ANIO);
            const longitud_ecliptica = angulo_sinodico;
            const declinacion_max = (Conf.RELOJ_INCLINACION_ECLIPTICA + Conf.RELOJ_INCLINACION_LUNAR) * Math.PI / 180.0;
            declinacion = declinacion_max * Math.sin(longitud_ecliptica) * Math.cos(angulo_nodal);
            ar = longitud_ecliptica;
        }

        let angulo_horario = (lst - ar) % (2.0 * Math.PI);
        if (angulo_horario < 0) angulo_horario += 2.0 * Math.PI;

        const sin_alt = Math.sin(declinacion) * Math.sin(lat_rad)
                      + Math.cos(declinacion) * Math.cos(lat_rad) * Math.cos(angulo_horario);
        const altitud = Math.asin(Math.max(-1.0, Math.min(1.0, sin_alt)));

        const cos_alt = Math.cos(altitud);
        if (Math.abs(cos_alt) < 1e-9) {
            return { x: 0.0, y: 0.0, z: sin_alt > 0 ? 1.0 : -1.0 };
        }

        const sin_az = -Math.cos(declinacion) * Math.sin(angulo_horario) / cos_alt;
        const cos_az = (Math.sin(declinacion) - Math.sin(lat_rad) * Math.sin(altitud)) / (Math.cos(lat_rad) * cos_alt);
        const azimut = Math.atan2(sin_az, cos_az);

        let x = Math.cos(altitud) * Math.sin(azimut);  // Este
        let y = Math.cos(altitud) * Math.cos(azimut);  // Norte
        let z = Math.sin(altitud);                      // Arriba

        const magnitud = Math.sqrt(x * x + y * y + z * z);
        if (magnitud < 1e-9) {
            return { x: 0.0, y: 0.0, z: 1.0 };
        }

        return {
            x: x / magnitud,
            y: y / magnitud,
            z: z / magnitud,
        };
    }
}

export { RelojAstronomico };