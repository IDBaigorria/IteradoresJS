/**
 * Reloj Artificial — Iteradores Neuronales.
 *
 * Provee el **Plano Rítmico** de la arquitectura. Genera un ramillete de
 * espines correspondiente a ciclos culturales y artificiales expresados en
 * tiempo universal coordinado (UTC). A diferencia del {@link RelojAstronomico},
 * este reloj no depende de la ubicación geográfica: sus ritmos son globales.
 *
 * Cada ciclo vive en el círculo unitario $S^1$ y se representa como un vector
 * bidimensional proyectado en $z=0$:
 *
 * \[
 * \mathbf{v}(t) = ( \cos(\theta(t)), \sin(\theta(t)), 0 )
 * \]
 *
 * donde $\theta(t) = \phi_0 + 2\pi \frac{t \bmod T}{T}$.
 *
 * La localización geográfica no es responsabilidad de este reloj. La hora
 * local, el día local o el inicio de la semana surgen al combinar estos
 * espines rítmicos con el espín geográfico `centro_tierra` del plano cósmico
 * en el {@link CompositorVentanas}.
 *
 * ## Ciclos puente de largo plazo
 *
 * Para cubrir escalas temporales mayores sin aliasing, se incluyen ciclos
 * puente con períodos de 128 años, década, siglo, milenio y precesión.
 * Estos ciclos permiten medir distancias temporales de forma monótona
 * en rangos que van desde minutos hasta milenios.
 *
 * @class RelojArtificial
 * @extends Objeto
 * @since 1.5.1
 * @version 1.5.2
 */

import { Conf } from '../Configuracion/Configuracion.js';
import { Objeto } from "../Nucleo/index.js";
import { ProveedorEspines } from './interfaces/index.js';
import { mezclar_clase_con_interfaces } from "../miscelaneas/mixin.js";

class RelojArtificial extends mezclar_clase_con_interfaces(Objeto, ProveedorEspines) {
    /**
     * Ciclos rítmicos registrados.
     * @type {Object<string, {periodo: number, fase: number, masa: number, tipo: string}>}
     * @private
     */
    _ciclos;

    /**
     * Último tiempo Unix para el que se calculó el ramillete.
     * @type {number|null}
     * @private
     */
    _ultimo_tiempo_unix = null;

    /**
     * Último ramillete de espines calculado.
     * @type {Array<{nombre: string, tipo: string, masa: number, vector: {x: number, y: number, z: number}}>|null}
     * @private
     */
    _ultimo_espines = null;

    /**
     * Escalas temporales y ciclos relevantes.
     * @type {Object<string, string[]>}
     * @since 1.5.2
     */
    static ESCALAS_TEMPORALES = {
        segundos: ['minuto'],
        minutos:  ['hora'],
        horas:    ['dia_noche'],
        dias:     ['semana'],
        semanas:  ['mes'],
        meses:    ['anno'],
        anios:    ['ciclo_128'],
        decadas:  ['ciclo_siglo'],
        siglos:   ['ciclo_milenio'],
        milenios: ['ciclo_precesion'],
    };

    /**
     * Constructor.
     * Inicializa los ciclos de fábrica desde {@link Conf.RELOJ_CICLOS_RITMICOS}.
     *
     * @since 1.5.1
     * @version 1.5.2
     */
    constructor() {
        super();
        this._ciclos = { ...Conf.RELOJ_CICLOS_RITMICOS };
    }

    /**
     * Actualiza la ubicación geográfica del proveedor.
     *
     * Este reloj no utiliza ubicación, por lo que el método no produce
     * ningún efecto. Se mantiene por compatibilidad con la interfaz.
     *
     * @param {number} latitud  Ignorada.
     * @param {number} longitud Ignorada.
     * @returns {void}
     * @since 1.5.2
     */
    _ubicacion(latitud, longitud) {
        // Este proveedor es global y no depende de la ubicación.
    }

    /**
     * Devuelve el ramillete de espines rítmicos para el instante dado.
     *
     * @param {number|null} [tiempo_unix=null] Tiempo Unix en segundos.
     * @returns {Array<{nombre: string, tipo: string, masa: number, vector: {x: number, y: number, z: number}}>}
     * @since 1.5.1
     * @version 1.5.2
     */
    espines(tiempo_unix = null) {
        const ts = tiempo_unix ?? Math.floor(Date.now() / 1000);

        if (this._ultimo_tiempo_unix === ts && this._ultimo_espines !== null) {
            return this._ultimo_espines;
        }

        const espines = [];
        for (const nombre of Object.keys(this._ciclos)) {
            espines.push(this._calcular_espin_ciclo(nombre, ts));
        }

        this._ultimo_tiempo_unix = ts;
        this._ultimo_espines = espines;

        return espines;
    }

    /**
     * Devuelve el espin de un ciclo específico.
     *
     * @param {string} nombre      Nombre del ciclo.
     * @param {number|null} [tiempo_unix=null] Tiempo Unix.
     * @returns {{nombre: string, tipo: string, masa: number, vector: {x: number, y: number, z: number}}|null}
     * @since 1.5.1
     * @version 1.5.2
     */
    espin(nombre, tiempo_unix = null) {
        if (!this._ciclos[nombre]) {
            return null;
        }

        const ts = tiempo_unix ?? Math.floor(Date.now() / 1000);
        return this._calcular_espin_ciclo(nombre, ts);
    }

    /**
     * Devuelve el ramillete filtrado por escala temporal.
     *
     * @param {string} escala      Una de: 'segundos', 'minutos', 'horas', 'dias', 'semanas', 'meses', 'anios', 'decadas', 'siglos', 'milenios'.
     * @param {number|null} [tiempo_unix=null] Tiempo Unix.
     * @returns {Array<{nombre: string, tipo: string, masa: number, vector: {x: number, y: number, z: number}}>}
     * @since 1.5.2
     */
    espines_por_escala(escala, tiempo_unix = null) {
        const espines = this.espines(tiempo_unix);
        const nombres = RelojArtificial.ESCALAS_TEMPORALES[escala] || Object.keys(this._ciclos);
        return espines.filter(e => nombres.includes(e.nombre));
    }

    /**
     * Agrega un nuevo ciclo rítmico.
     *
     * @param {string} nombre  Nombre único del ciclo.
     * @param {number} periodo Período en segundos (mayor que 0).
     * @param {number} [fase=0.0] Fase inicial en radianes.
     * @param {number} [masa=1.0] Peso contextual.
     * @param {string} [tipo='Ritmo'] Categoría del ritmo.
     * @returns {void}
     * @since 1.5.1
     * @version 1.5.2
     */
    agregar_ciclo(nombre, periodo, fase = 0.0, masa = 1.0, tipo = 'Ritmo') {
        if (periodo <= 0.0) {
            this._error(`El período del ciclo '${nombre}' debe ser mayor que cero.`);
            return;
        }

        this._ciclos[nombre] = {
            periodo: periodo,
            fase: fase % (2.0 * Math.PI),
            masa: masa,
            tipo: tipo,
        };

        this._invalidar_cache();
    }

    /**
     * Elimina un ciclo rítmico.
     *
     * @param {string} nombre Nombre del ciclo.
     * @returns {void}
     * @since 1.5.1
     * @version 1.5.2
     */
    eliminar_ciclo(nombre) {
        delete this._ciclos[nombre];
        this._invalidar_cache();
    }

    /**
     * Devuelve la configuración de un ciclo.
     *
     * @param {string} nombre Nombre del ciclo.
     * @returns {{periodo: number, fase: number, masa: number, tipo: string}|null}
     * @since 1.5.1
     * @version 1.5.2
     */
    ciclo(nombre) {
        return this._ciclos[nombre] ?? null;
    }

    /**
     * Devuelve todos los ciclos registrados.
     *
     * @returns {Object<string, {periodo: number, fase: number, masa: number, tipo: string}>}
     * @since 1.5.1
     * @version 1.5.2
     */
    ciclos_registrados() {
        return { ...this._ciclos };
    }

    /**
     * Descubre un nuevo ciclo a partir de un período estimado.
     *
     * @param {string} nombre            Nombre propuesto.
     * @param {number} periodo           Período estimado en segundos.
     * @param {number} tiempo_referencia Tiempo Unix de referencia.
     * @param {number} [masa_inicial=1.0] Masa inicial.
     * @returns {void}
     * @since 1.5.1
     * @version 1.5.2
     */
    descubrir_ciclo(nombre, periodo, tiempo_referencia, masa_inicial = 1.0) {
        const fase = (tiempo_referencia % periodo) / periodo * 2.0 * Math.PI;
        this.agregar_ciclo(nombre, periodo, fase, masa_inicial, 'RitmoDescubierto');
    }

    /**
     * Calcula el espín de un ciclo en un instante dado.
     *
     * @param {string} nombre Nombre del ciclo.
     * @param {number} ts     Tiempo Unix.
     * @returns {{nombre: string, tipo: string, masa: number, vector: {x: number, y: number, z: number}}}
     * @private
     */
    _calcular_espin_ciclo(nombre, ts) {
        const config  = this._ciclos[nombre];
        const periodo = config.periodo;
        const fase    = config.fase;
        const masa    = config.masa;
        const tipo    = config.tipo;

        const angulo = fase + ((ts % periodo) / periodo) * 2.0 * Math.PI;

        return {
            nombre: nombre,
            tipo: tipo,
            masa: masa,
            vector: {
                x: Math.cos(angulo),
                y: Math.sin(angulo),
                z: 0.0,
            },
        };
    }

    /**
     * Invalida la caché interna.
     *
     * @returns {void}
     * @private
     */
    _invalidar_cache() {
        this._ultimo_tiempo_unix = null;
        this._ultimo_espines = null;
    }
}

export { RelojArtificial };