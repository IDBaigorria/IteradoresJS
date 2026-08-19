/**
 * Reloj Astronómico — Iteradores Neuronales.
 *
 * Implementa {@link ProveedorVectorGravitacional} y proporciona un
 * **ramillete de espines** (vectores individuales por astro) que representan
 * de forma determinista la configuración del cielo local para cualquier
 * ubicación geográfica e instante de tiempo.
 *
 * A partir de la versión 1.5.1, el reloj abandona el vector único combinado
 * en favor de un conjunto independiente de espines gravitacionales. Cada astro
 * es una entrada autónoma en el Plano Cósmico, con su propia masa y dirección.
 * Esto allana el camino para la arquitectura de *Iteradores Neuronales*, donde
 * el contexto se organiza en planos ortogonales (Cósmico, Rítmico,
 * Estado×Acción).
 *
 * El cálculo utiliza un modelo geométrico simplificado con órbitas circulares
 * que genera ciclos día/noche, fases lunares, estaciones, la precesión nodal
 * lunar (18.6 años), el ciclo de Júpiter (~11.86 años) y el bamboleo del eje
 * terrestre (~25 800 años), sin necesidad de efemérides de alta precisión.
 *
 * ## Prisma geográfico simplificado (v1.5.1)
 *
 * Desde la versión 1.5.1, el prisma geográfico no es un operador externo
 * que transforme cada plano. Es un **espin adicional** en el ramillete:
 * `centro_tierra`, un vector que apunta desde el observador hacia el centro
 * de la Tierra, expresado en el marco inercial del sistema. Al sumarse
 * ponderadamente con los demás espines, distorsiona naturalmente el vector
 * de activación según la ubicación geográfica y la hora del día (vía LST).
 *
 * ## Rol en el sistema
 *
 * - Los iteradores obtienen el ramillete de espines a través del Controlador.
 * - Cada espin se usa para "marcar" las ramas que recorren (huella temporal).
 * - La distancia entre el espin almacenado y el espin actual mide la
 *   "antigüedad" relativa de ese recuerdo.
 * - Permite realizar predicciones buscando ramas cuyos espines sean cercanos
 *   a una configuración futura simulada.
 *
 * @class RelojAstronomico
 * @extends Objeto
 * @implements {ProveedorVectorGravitacional}
 * @author Ignacio David Baigorria
 * @since 1.3.5
 * @version 1.5.1
 */

import { Conf } from '../Configuracion/Configuracion.js';
import { Objeto } from "../Nucleo/index.js";
import { ProveedorVectorGravitacional } from './interfaces/index.js';
import { mezclar_clase_con_interfaces } from "../miscelaneas/mixin.js";

class RelojAstronomico extends mezclar_clase_con_interfaces(Objeto, ProveedorVectorGravitacional) {
    // ═══════════════════════════════════════════════════════
    // REGISTRO DE ASTROS (extensible)
    // ═══════════════════════════════════════════════════════

    /**
     * Astros registrados en el reloj con sus masas gravitacionales.
     *
     * Esta estructura permite agregar nuevos astros sin modificar la lógica
     * de cálculo central. Cada astro es una entrada independiente en el
     * Plano Cósmico.
     *
     * `centro_tierra` actúa como prisma geográfico: es el vector que apunta
     * desde el observador hacia el centro del planeta. Su dirección depende
     * de la latitud, longitud y el tiempo sidéreo local, de modo que dos
     * observadores en distintos lugares (o el mismo lugar en distintos
     * momentos) generan vectores de activación distintos.
     *
     * @type {Object.<string, {masa: number, tipo: string}>}
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     */
    static ASTROS = {
        sol:            { masa: 10.0, tipo: 'Astro' },
        luna:           { masa: 5.8,  tipo: 'Astro' },
        jupiter:        { masa: 7.3,  tipo: 'Astro' },
        eje_terrestre:  { masa: 8.0,  tipo: 'Eje' },
        centro_tierra:  { masa: 9.0,  tipo: 'Prisma' },
    };

    /**
     * Período orbital de Júpiter en años terrestres.
     *
     * @type {number}
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     */
    static PERIODO_JUPITER_ANIOS = 11.86;

    /**
     * Período de precesión del eje terrestre en años terrestres.
     *
     * @type {number}
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     */
    static PERIODO_PRECESION_ANIOS = 25800.0;

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
     * @type {number|null}
     * @private
     */
    _ultimo_timestamp = null;

    /**
     * Último vector de activación calculado (caché).
     * @type {{x: number, y: number, z: number}|null}
     * @private
     */
    _ultimo_vector = null;

    /**
     * Último ramillete de espines calculado (caché).
     * @type {Array<{nombre: string, tipo: string, masa: number, vector: {x: number, y: number, z: number}}>|null}
     * @private
     */
    _ultimo_espines = null;

    /**
     * Construye un reloj con estado ligado a una ubicación fija.
     *
     * @param {number} latitud  Latitud en grados (-90 a 90).
     * @param {number} longitud Longitud en grados (-180 a 180).
     * @author Ignacio David Baigorria
     * @since 1.3.5
     * @version 1.5.1
     */
    constructor(latitud, longitud) {
        super();
        this._latitud = latitud;
        this._longitud = longitud;
    }

    // ═══════════════════════════════════════════════════════
    // MÉTODOS PÚBLICOS
    // ═══════════════════════════════════════════════════════

    /**
     * Devuelve el vector de activación combinado para el instante dado.
     *
     * @param {number|null} [timestamp=null] Marca de tiempo Unix. Si es null,
     *   usa `Date.now() / 1000`.
     * @returns {{x: number, y: number, z: number}} Vector unitario.
     * @author Ignacio David Baigorria
     * @since 1.3.5
     * @version 1.5.1
     */
    vector(timestamp = null) {
        const ts = timestamp ?? Math.floor(Date.now() / 1000);

        if (this._ultimo_timestamp === ts && this._ultimo_vector !== null) {
            return this._ultimo_vector;
        }

        this._ultimo_timestamp = ts;
        this._ultimo_vector = RelojAstronomico._calcular_vector(this._latitud, this._longitud, ts);
        this._ultimo_espines = null;

        return this._ultimo_vector;
    }

    /**
     * Método estático para obtener el vector de activación sin estado.
     *
     * @param {number} latitud   Latitud en grados.
     * @param {number} longitud  Longitud en grados.
     * @param {number|null} [timestamp=null] Marca de tiempo Unix.
     * @returns {{x: number, y: number, z: number}} Vector unitario.
     * @author Ignacio David Baigorria
     * @since 1.3.5
     * @version 1.5.1
     */
    static vector_gravitacional(latitud, longitud, timestamp = null) {
        const ts = timestamp ?? Math.floor(Date.now() / 1000);
        return this._calcular_vector(latitud, longitud, ts);
    }

    /**
     * Actualiza la ubicación geográfica del reloj.
     *
     * @param {number} latitud  Nueva latitud.
     * @param {number} longitud Nueva longitud.
     * @returns {void}
     * @author Ignacio David Baigorria
     * @since 1.3.5
     * @version 1.5.1
     */
    _ubicacion(latitud, longitud) {
        this._latitud = latitud;
        this._longitud = longitud;
        this._ultimo_timestamp = null;
        this._ultimo_vector = null;
        this._ultimo_espines = null;
    }

    // ═══════════════════════════════════════════════════════
    // RAMILLETE DE ESPINES (nuevo en 1.5.1)
    // ═══════════════════════════════════════════════════════

    /**
     * Devuelve el ramillete de espines para todos los astros registrados.
     *
     * Cada espin es un objeto con:
     * - `nombre`: identificador del astro.
     * - `tipo`: categoría (ej: 'Astro', 'Eje', 'Prisma').
     * - `masa`: masa gravitacional del astro.
     * - `vector`: vector unitario en el marco inercial (x, y, z).
     *
     * El espin `centro_tierra` representa la orientación geográfica local:
     * el vector que apunta desde el observador hacia el centro de la Tierra.
     * Su dirección depende de la latitud, longitud y LST, distorsionando
     * naturalmente el vector de activación por lugar geográfico.
     *
     * @param {number|null} [timestamp=null] Marca de tiempo Unix.
     * @returns {Array<{nombre: string, tipo: string, masa: number, vector: {x: number, y: number, z: number}}>}
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     */
    espines(timestamp = null) {
        const ts = timestamp ?? Math.floor(Date.now() / 1000);

        if (this._ultimo_timestamp === ts && this._ultimo_espines !== null) {
            return this._ultimo_espines;
        }

        this._ultimo_timestamp = ts;
        this._ultimo_espines = RelojAstronomico._calcular_espines(this._latitud, this._longitud, ts);
        this._ultimo_vector = null;

        return this._ultimo_espines;
    }

    /**
     * Devuelve el espin de un astro específico.
     *
     * @param {string} astro     Nombre del astro.
     * @param {number|null} [timestamp=null] Marca de tiempo Unix.
     * @returns {{nombre: string, tipo: string, masa: number, vector: {x: number, y: number, z: number}}|null}
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     */
    espin(astro, timestamp = null) {
        const ts = timestamp ?? Math.floor(Date.now() / 1000);

        if (!RelojAstronomico.ASTROS[astro]) {
            this._error(`Astro '${astro}' no está registrado en el reloj.`);
            return null;
        }

        const lat_rad = (this._latitud * Math.PI) / 180.0;
        const lon_rad = (this._longitud * Math.PI) / 180.0;
        const lst = RelojAstronomico._tiempo_sidereo_local(ts, lon_rad);
        const vector = RelojAstronomico._calcular_espin_astro(astro, ts, lat_rad, lon_rad, lst);

        return {
            nombre: astro,
            tipo: RelojAstronomico.ASTROS[astro].tipo,
            masa: RelojAstronomico.ASTROS[astro].masa,
            vector: vector,
        };
    }

    /**
     * Calcula el vector de activación a partir del ramillete de espines.
     *
     * @param {number|null} [timestamp=null] Marca de tiempo Unix.
     * @returns {{x: number, y: number, z: number}} Vector unitario.
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     */
    vector_activacion(timestamp = null) {
        const ts = timestamp ?? Math.floor(Date.now() / 1000);
        const espines = RelojAstronomico._calcular_espines(this._latitud, this._longitud, ts);
        return RelojAstronomico._activacion_desde_espines(espines);
    }

    // ═══════════════════════════════════════════════════════
    // CÁLCULOS INTERNOS
    // ═══════════════════════════════════════════════════════

    /**
     * @param {number} latitud
     * @param {number} longitud
     * @param {number} ts
     * @returns {{x: number, y: number, z: number}}
     * @author Ignacio David Baigorria
     * @since 1.3.5
     * @version 1.5.1
     * @private
     */
    static _calcular_vector(latitud, longitud, ts) {
        const espines = this._calcular_espines(latitud, longitud, ts);
        return this._activacion_desde_espines(espines);
    }

    /**
     * @param {number} latitud
     * @param {number} longitud
     * @param {number} ts
     * @returns {Array<{nombre: string, tipo: string, masa: number, vector: {x: number, y: number, z: number}}>}
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     * @private
     */
    static _calcular_espines(latitud, longitud, ts) {
        const lat_rad = (latitud * Math.PI) / 180.0;
        const lon_rad = (longitud * Math.PI) / 180.0;
        const lst = this._tiempo_sidereo_local(ts, lon_rad);

        const espines = [];
        for (const [nombre, config] of Object.entries(this.ASTROS)) {
            const vector = this._calcular_espin_astro(nombre, ts, lat_rad, lon_rad, lst);
            espines.push({
                nombre: nombre,
                tipo: config.tipo,
                masa: config.masa,
                vector: vector,
            });
        }

        return espines;
    }

    /**
     * @param {string} nombre
     * @param {number} ts
     * @param {number} lat_rad
     * @param {number} lon_rad
     * @param {number} lst
     * @returns {{x: number, y: number, z: number}}
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     * @private
     */
    static _calcular_espin_astro(nombre, ts, lat_rad, lon_rad, lst) {
        switch (nombre) {
            case 'sol':
                return this._calcular_vector_sol(ts, lat_rad, lst);
            case 'luna':
                return this._calcular_vector_luna(ts, lat_rad, lst);
            case 'jupiter':
                return this._calcular_vector_jupiter(ts, lat_rad, lst);
            case 'eje_terrestre':
                return this._calcular_vector_eje_terrestre(ts, lat_rad);
            case 'centro_tierra':
                return this._calcular_vector_centro_tierra(lat_rad, lon_rad, lst);
            default:
                this._error(`Astro '${nombre}' no implementado.`);
                return { x: 0.0, y: 0.0, z: 1.0 };
        }
    }

    /**
     * @param {Array} espines
     * @returns {{x: number, y: number, z: number}}
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
            return { x: 0.0, y: 0.0, z: 1.0 };
        }

        return {
            x: x / magnitud,
            y: y / magnitud,
            z: z / magnitud,
        };
    }

    /**
     * @param {number} ts
     * @param {number} lon_rad
     * @returns {number}
     * @author Ignacio David Baigorria
     * @since 1.3.5
     * @version 1.5.1
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
     * @param {number} ts
     * @param {number} lat_rad
     * @param {number} lst
     * @returns {{x: number, y: number, z: number}}
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     * @private
     */
    static _calcular_vector_sol(ts, lat_rad, lst) {
        const angulo_anual = 2.0 * Math.PI * (ts % Conf.RELOJ_SEGUNDOS_POR_ANIO) / Conf.RELOJ_SEGUNDOS_POR_ANIO;
        const ar = angulo_anual % (2.0 * Math.PI);
        const declinacion = (Conf.RELOJ_INCLINACION_ECLIPTICA * Math.PI / 180.0) * Math.sin(angulo_anual);

        return this._vector_horizontal(ar, declinacion, lat_rad, lst);
    }

    /**
     * @param {number} ts
     * @param {number} lat_rad
     * @param {number} lst
     * @returns {{x: number, y: number, z: number}}
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     * @private
     */
    static _calcular_vector_luna(ts, lat_rad, lst) {
        const angulo_sinodico = 2.0 * Math.PI * (ts % Conf.RELOJ_SEGUNDOS_POR_MES_SINODICO) / Conf.RELOJ_SEGUNDOS_POR_MES_SINODICO;
        const angulo_nodal = 2.0 * Math.PI * (ts % (Conf.RELOJ_PERIODO_PRECESION_NODAL * Conf.RELOJ_SEGUNDOS_POR_ANIO))
            / (Conf.RELOJ_PERIODO_PRECESION_NODAL * Conf.RELOJ_SEGUNDOS_POR_ANIO);
        const longitud_ecliptica = angulo_sinodico;
        const declinacion_max = (Conf.RELOJ_INCLINACION_ECLIPTICA + Conf.RELOJ_INCLINACION_LUNAR) * Math.PI / 180.0;
        const declinacion = declinacion_max * Math.sin(longitud_ecliptica) * Math.cos(angulo_nodal);
        const ar = longitud_ecliptica;

        return this._vector_horizontal(ar, declinacion, lat_rad, lst);
    }

    /**
     * @param {number} ts
     * @param {number} lat_rad
     * @param {number} lst
     * @returns {{x: number, y: number, z: number}}
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     * @private
     */
    static _calcular_vector_jupiter(ts, lat_rad, lst) {
        const periodo = Conf.RELOJ_SEGUNDOS_POR_ANIO * this.PERIODO_JUPITER_ANIOS;
        const angulo = 2.0 * Math.PI * (ts % periodo) / periodo;
        const ar = angulo % (2.0 * Math.PI);
        const declinacion = (Conf.RELOJ_INCLINACION_ECLIPTICA * Math.PI / 180.0) * Math.sin(angulo);

        return this._vector_horizontal(ar, declinacion, lat_rad, lst);
    }

    /**
     * @param {number} ts
     * @param {number} lat_rad
     * @returns {{x: number, y: number, z: number}}
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     * @private
     */
    static _calcular_vector_eje_terrestre(ts, lat_rad) {
        const periodo = Conf.RELOJ_SEGUNDOS_POR_ANIO * this.PERIODO_PRECESION_ANIOS;
        const theta = 2.0 * Math.PI * (ts % periodo) / periodo;

        let x = Math.sin(theta) * Math.cos(lat_rad);
        let y = Math.cos(theta) * Math.cos(lat_rad);
        let z = Math.sin(lat_rad);

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

    /**
     * Calcula el vector unitario del centro de la Tierra (prisma geográfico).
     *
     * Este espin representa la orientación geográfica local del observador.
     * Es el vector que apunta desde el observador hacia el centro de la
     * Tierra, expresado en el marco inercial del sistema.
     *
     * En el modelo simplificado, asumimos que el eje de rotación terrestre
     * está alineado con el eje Z del marco inercial. Entonces el vector
     * "abajo" del observador depende de su latitud y de su longitud efectiva
     * (longitud + LST):
     *
     * $$\hat{u}_{centro} = (-\cos\phi \cos\theta, \; -\cos\phi \sin\theta, \; -\sin\phi)$$
     *
     * donde $\phi$ es la latitud y $\theta = \lambda + \text{LST}$ es la
     * longitud efectiva en el marco inercial.
     *
     * Al sumarse ponderadamente con los demás espines, este vector distorsiona
     * naturalmente el vector de activación según la ubicación geográfica,
     * eliminando la necesidad de un operador prisma externo.
     *
     * @param {number} lat_rad Latitud en radianes.
     * @param {number} lon_rad Longitud en radianes.
     * @param {number} lst     Tiempo Sidéreo Local en radianes.
     * @returns {{x: number, y: number, z: number}} Vector unitario.
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     * @private
     */
    static _calcular_vector_centro_tierra(lat_rad, lon_rad, lst) {
        const theta = lon_rad + lst;

        let x = -Math.cos(lat_rad) * Math.cos(theta);
        let y = -Math.cos(lat_rad) * Math.sin(theta);
        let z = -Math.sin(lat_rad);

        const magnitud = Math.sqrt(x * x + y * y + z * z);
        if (magnitud < 1e-9) {
            return { x: 0.0, y: 0.0, z: -1.0 };
        }

        return {
            x: x / magnitud,
            y: y / magnitud,
            z: z / magnitud,
        };
    }

    /**
     * @param {number} ar
     * @param {number} declinacion
     * @param {number} lat_rad
     * @param {number} lst
     * @returns {{x: number, y: number, z: number}}
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     * @private
     */
    static _vector_horizontal(ar, declinacion, lat_rad, lst) {
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

        let x = Math.cos(altitud) * Math.sin(azimut);
        let y = Math.cos(altitud) * Math.cos(azimut);
        let z = Math.sin(altitud);

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
