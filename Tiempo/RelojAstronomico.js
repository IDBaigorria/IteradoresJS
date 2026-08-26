/**
 * Reloj Astronómico — Iteradores Neuronales.
 *
 * Genera un **ramillete de espines** (vectores individuales por astro) que
 * representan de forma determinista la configuración celeste para cualquier
 * ubicación geográfica e instante de tiempo.
 *
 * A partir de la versión 1.5.2, el marco de referencia es
 * **galáctico‑eclíptico**. Los espines cósmicos (Sol, Luna, Júpiter, eje
 * terrestre) se expresan en un marco común a todo el planeta, de modo que
 * dos observadores en distintos lugares comparten exactamente esos vectores.
 * La ubicación geográfica queda representada únicamente por el espin
 * `centro_tierra`, que apunta hacia el centro del planeta.
 *
 * @class RelojAstronomico
 * @extends Objeto
 * @author Ignacio David Baigorria
 * @since 1.3.5
 * @version 1.5.2
 */

import { Conf } from '../Configuracion/Configuracion.js';
import { Objeto } from "../Nucleo/index.js";
import { ProveedorEspines } from './interfaces/index.js';
import { mezclar_clase_con_interfaces } from "../miscelaneas/mixin.js";

class RelojAstronomico extends mezclar_clase_con_interfaces(Objeto, ProveedorEspines) {
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
     * Último tiempo Unix para el que se calculó el ramillete.
     * @type {number|null}
     * @private
     */
    _ultimo_tiempo_unix = null;

    /**
     * Último ramillete de espines calculado (caché).
     * @type {Array<{nombre: string, tipo: string, masa: number, vector: {x: number, y: number, z: number}}>|null}
     * @private
     */
    _ultimo_espines = null;

    /**
     * Escalas temporales y astros relevantes.
     * @type {Object<string, string[]>}
     * @since 1.5.2
     */
    static ESCALAS_TEMPORALES = {
        segundos: ['centro_tierra'],
        horas:    ['centro_tierra'],
        dias:     ['sol'],
        semanas:  ['sol'],
        meses:    ['sol'],
        anios:    ['jupiter'],
        decadas:  ['eje_terrestre'],
        siglos:   ['eje_terrestre'],
        milenios: ['eje_terrestre'],
    };

    /**
     * Constructor.
     *
     * @param {number} latitud  Latitud en grados.
     * @param {number} longitud Longitud en grados.
     */
    constructor(latitud, longitud) {
        super();
        this._latitud = latitud;
        this._longitud = longitud;
    }

    /**
     * Actualiza la ubicación geográfica del reloj.
     *
     * @param {number} latitud  Nueva latitud.
     * @param {number} longitud Nueva longitud.
     * @returns {void}
     */
    _ubicacion(latitud, longitud) {
        this._latitud = latitud;
        this._longitud = longitud;
        this._ultimo_tiempo_unix = null;
        this._ultimo_espines = null;
    }

    /**
     * Devuelve el ramillete de espines para todos los astros registrados.
     *
     * @param {number|null} [tiempo_unix=null] Tiempo Unix.
     * @returns {Array<{nombre: string, tipo: string, masa: number, vector: {x: number, y: number, z: number}}>}
     */
    espines(tiempo_unix = null) {
        const ts = tiempo_unix ?? Math.floor(Date.now() / 1000);

        if (this._ultimo_tiempo_unix === ts && this._ultimo_espines !== null) {
            return this._ultimo_espines;
        }

        this._ultimo_tiempo_unix = ts;
        this._ultimo_espines = RelojAstronomico._calcular_espines(this._latitud, this._longitud, ts);

        return this._ultimo_espines;
    }

    /**
     * Devuelve el espin de un astro específico.
     *
     * @param {string} astro Nombre del astro.
     * @param {number|null} [tiempo_unix=null] Tiempo Unix.
     * @returns {{nombre: string, tipo: string, masa: number, vector: {x: number, y: number, z: number}}|null}
     */
    espin(astro, tiempo_unix = null) {
        const ts = tiempo_unix ?? Math.floor(Date.now() / 1000);

        if (!Conf.RELOJ_ASTROS[astro]) {
            this.constructor._error(`Astro '${astro}' no está registrado en el reloj.`);
            return null;
        }

        const lat_rad = (this._latitud * Math.PI) / 180.0;
        const lon_rad = (this._longitud * Math.PI) / 180.0;
        const vector = RelojAstronomico._calcular_espin_astro(astro, ts, lat_rad, lon_rad);

        return {
            nombre: astro,
            tipo: Conf.RELOJ_ASTROS[astro].tipo,
            masa: Conf.RELOJ_ASTROS[astro].masa,
            vector: vector,
        };
    }

    /**
     * Devuelve el ramillete filtrado por escala temporal.
     *
     * @param {string} escala Escala temporal.
     * @param {number|null} [tiempo_unix=null] Tiempo Unix.
     * @returns {Array}
     */
    espines_por_escala(escala, tiempo_unix = null) {
        const espines = this.espines(tiempo_unix);
        const nombres = RelojAstronomico.ESCALAS_TEMPORALES[escala] || Object.keys(Conf.RELOJ_ASTROS);
        return espines.filter(e => nombres.includes(e.nombre));
    }

    // ═══════════════════════════════════════════════════════════
    // CÁLCULOS INTERNOS
    // ═══════════════════════════════════════════════════════════

    /**
     * @param {number} latitud
     * @param {number} longitud
     * @param {number} ts
     * @returns {Array}
     * @private
     */
    static _calcular_espines(latitud, longitud, ts) {
        const lat_rad = (latitud * Math.PI) / 180.0;
        const lon_rad = (longitud * Math.PI) / 180.0;

        const espines = [];
        for (const [nombre, config] of Object.entries(Conf.RELOJ_ASTROS)) {
            const vector = this._calcular_espin_astro(nombre, ts, lat_rad, lon_rad);
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
     * @returns {{x: number, y: number, z: number}}
     * @private
     */
    static _calcular_espin_astro(nombre, ts, lat_rad, lon_rad) {
        switch (nombre) {
            case 'sol':
                return this._transformar_a_galactico(this._calcular_vector_sol_ecliptico(ts));
            case 'luna':
                return this._transformar_a_galactico(this._calcular_vector_luna_ecliptico(ts));
            case 'jupiter':
                return this._transformar_a_galactico(this._calcular_vector_jupiter_ecliptico(ts));
            case 'eje_terrestre':
                return this._transformar_a_galactico(this._calcular_vector_eje_terrestre_ecliptico(ts));
            case 'centro_tierra':
                return this._transformar_a_galactico(
                    this._calcular_vector_centro_tierra_ecliptico(lat_rad, lon_rad, ts)
                );
            default:
                RelojAstronomico._error(`Astro '${nombre}' no implementado.`);
                return { x: 0.0, y: 0.0, z: 1.0 };
        }
    }

    // ═══════════════════════════════════════════════════════════
    // MARCO GALÁCTICO‑ECLÍPTICO
    // ═══════════════════════════════════════════════════════════

    /**
     * @param {{x: number, y: number, z: number}} v
     * @returns {{x: number, y: number, z: number}}
     * @private
     */
    static _transformar_a_galactico(v) {
        const lon_gal = (Conf.RELOJ_GALACTICO_LONGITUD * Math.PI) / 180.0;

        const e1 = [Math.cos(lon_gal), Math.sin(lon_gal), 0.0];
        const e3 = [0.0, 0.0, 1.0];
        const e2 = [-Math.sin(lon_gal), Math.cos(lon_gal), 0.0];

        const resultado = [
            v.x * e1[0] + v.y * e1[1] + v.z * e1[2],
            v.x * e2[0] + v.y * e2[1] + v.z * e2[2],
            v.x * e3[0] + v.y * e3[1] + v.z * e3[2],
        ];

        return this._normalizar(resultado);
    }

    /**
     * @param {number[]} v
     * @returns {{x: number, y: number, z: number}}
     * @private
     */
    static _normalizar(v) {
        const magnitud = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
        if (magnitud < 1e-9) {
            return { x: 0.0, y: 0.0, z: 1.0 };
        }
        return {
            x: v[0] / magnitud,
            y: v[1] / magnitud,
            z: v[2] / magnitud,
        };
    }

    /**
     * @param {number} longitud
     * @param {number} latitud
     * @returns {{x: number, y: number, z: number}}
     * @private
     */
    static _vector_ecliptico(longitud, latitud) {
        return this._normalizar([
            Math.cos(latitud) * Math.cos(longitud),
            Math.cos(latitud) * Math.sin(longitud),
            Math.sin(latitud),
        ]);
    }

    // ═══════════════════════════════════════════════════════════
    // MODELOS ORBITALES SIMPLIFICADOS
    // ═══════════════════════════════════════════════════════════

    static _calcular_vector_sol_ecliptico(ts) {
        const angulo_anual = 2.0 * Math.PI * (ts % Conf.RELOJ_SEGUNDOS_POR_ANIO)
            / Conf.RELOJ_SEGUNDOS_POR_ANIO;
        const longitud = angulo_anual % (2.0 * Math.PI);
        return this._vector_ecliptico(longitud, 0.0);
    }

    static _calcular_vector_luna_ecliptico(ts) {
        const angulo_sinodico = 2.0 * Math.PI * (ts % Conf.RELOJ_SEGUNDOS_POR_MES_SINODICO)
            / Conf.RELOJ_SEGUNDOS_POR_MES_SINODICO;
        const angulo_nodal = 2.0 * Math.PI * (ts % (Conf.RELOJ_PERIODO_PRECESION_NODAL * Conf.RELOJ_SEGUNDOS_POR_ANIO))
            / (Conf.RELOJ_PERIODO_PRECESION_NODAL * Conf.RELOJ_SEGUNDOS_POR_ANIO);

        const longitud = angulo_sinodico % (2.0 * Math.PI);
        const latitud = (Conf.RELOJ_INCLINACION_LUNAR * Math.PI / 180.0)
            * Math.sin(angulo_sinodico)
            * Math.cos(angulo_nodal);

        return this._vector_ecliptico(longitud, latitud);
    }

    static _calcular_vector_jupiter_ecliptico(ts) {
        const periodo_jupiter = Conf.RELOJ_SEGUNDOS_POR_ANIO * Conf.RELOJ_PERIODO_JUPITER_ANIOS;
        const angulo_tierra = 2.0 * Math.PI * (ts % Conf.RELOJ_SEGUNDOS_POR_ANIO)
            / Conf.RELOJ_SEGUNDOS_POR_ANIO;
        const angulo_jupiter = 2.0 * Math.PI * (ts % periodo_jupiter)
            / periodo_jupiter;

        const tierra = [Math.cos(angulo_tierra), Math.sin(angulo_tierra), 0.0];
        const jupiter = [5.2 * Math.cos(angulo_jupiter), 5.2 * Math.sin(angulo_jupiter), 0.0];

        const relativo = [
            jupiter[0] - tierra[0],
            jupiter[1] - tierra[1],
            0.0,
        ];

        return this._normalizar(relativo);
    }

    static _calcular_vector_eje_terrestre_ecliptico(ts) {
        const periodo_precesion = Conf.RELOJ_SEGUNDOS_POR_ANIO * Conf.RELOJ_PERIODO_PRECESION_ANIOS;
        const theta = 2.0 * Math.PI * (ts % periodo_precesion) / periodo_precesion;

        const longitud = Math.PI / 2.0 + theta;
        const latitud = Math.PI / 2.0 - (Conf.RELOJ_INCLINACION_ECLIPTICA * Math.PI / 180.0);

        return this._vector_ecliptico(longitud, latitud);
    }

    static _calcular_vector_centro_tierra_ecliptico(lat_rad, lon_rad, ts) {
        const eje_planetario = this._calcular_vector_eje_terrestre_ecliptico(ts);

        // Convertir a array numérico para operaciones vectoriales
        const eje = [eje_planetario.x, eje_planetario.y, eje_planetario.z];
        const z_ecliptica = [0.0, 0.0, 1.0];

        // Producto vectorial y normalización
        let e1_eq = this._normalizar(this._producto_vectorial(eje, z_ecliptica));

        // ⚠️ Convertir e1_eq a array numérico para usar índices
        e1_eq = [e1_eq.x, e1_eq.y, e1_eq.z];

        const e2_eq = this._producto_vectorial(eje, e1_eq);

        const theta = this._tiempo_sidereo_local(ts, lon_rad);

        const arriba = [
            Math.cos(lat_rad) * Math.cos(theta) * e1_eq[0]
                + Math.cos(lat_rad) * Math.sin(theta) * e2_eq[0]
                + Math.sin(lat_rad) * eje[0],
            Math.cos(lat_rad) * Math.cos(theta) * e1_eq[1]
                + Math.cos(lat_rad) * Math.sin(theta) * e2_eq[1]
                + Math.sin(lat_rad) * eje[1],
            Math.cos(lat_rad) * Math.cos(theta) * e1_eq[2]
                + Math.cos(lat_rad) * Math.sin(theta) * e2_eq[2]
                + Math.sin(lat_rad) * eje[2],
        ];

        const centro = [-arriba[0], -arriba[1], -arriba[2]];
        return this._normalizar(centro);
    }

    static _producto_vectorial(a, b) {
        return [
            a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0],
        ];
    }

    // ═══════════════════════════════════════════════════════════
    // TIEMPO SIDÉREO LOCAL
    // ═══════════════════════════════════════════════════════════

    static _tiempo_sidereo_local(ts, lon_rad) {
        const dias_desde_j2000 = (ts / Conf.RELOJ_SEGUNDOS_POR_DIA) - 10957.5;
        let gmst_deg = (280.46061837 + 360.98564736629 * dias_desde_j2000) % 360.0;
        if (gmst_deg < 0) gmst_deg += 360.0;
        const gmst_rad = (gmst_deg * Math.PI) / 180.0;

        let lst = (gmst_rad + lon_rad) % (2.0 * Math.PI);
        return lst < 0 ? lst + 2.0 * Math.PI : lst;
    }
}

export { RelojAstronomico };