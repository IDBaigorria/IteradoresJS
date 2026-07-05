import { Objeto } from '../Nucleo/Objeto.js';
import { Antena } from './Antena.js';
// NodoNumerico y Senal se documentan con JSDoc para evitar dependencias circulares.

/**
 * Procesador de Dominio: coordina las antenas de un dominio y ejecuta
 * el bucle de captura jerárquico para reducir una señal.
 *
 * Gestiona múltiples antenas (una por fase) y aplica un algoritmo voraz
 * que comienza por las fases más altas. Cuando una antena captura una
 * porción de la señal, se reinicia el recorrido desde la fase máxima,
 * garantizando así que los bocados sean siempre lo más grandes posible.
 *
 * @class ProcesadorDeDominio
 * @extends Objeto
 * @since 1.4.5
 * @version 1.4.5
 */
export class ProcesadorDeDominio extends Objeto {
    /**
     * Nombre identificador del dominio (ej. 'texto:entrada', 'algebra').
     * @type {string}
     * @private
     */
    _nombre_dominio;

    /**
     * Antenas del dominio, indexadas por fase (string o número).
     * @type {Object.<(string|number), Antena>}
     * @private
     */
    _antenas;

    /**
     * Orden de creación de las fases. La última fase añadida se considera
     * la más alta y tendrá prioridad en el procesamiento.
     * @type {(string|number)[]}
     * @private
     */
    _orden_fases;

    /**
     * Constructor.
     * @param {string} nombre_dominio Nombre identificador del dominio.
     */
    constructor(nombre_dominio) {
        super();
        this._nombre_dominio = nombre_dominio;
        this._antenas = {};
        this._orden_fases = [];
    }

    /**
     * Obtiene la antena para una fase específica, creándola si no existe.
     *
     * @param {(string|number)} fase Identificador de la fase.
     * @returns {Antena}
     */
    antena(fase) {
        if (!this._antenas.hasOwnProperty(fase)) {
            this._antenas[fase] = new Antena(fase);
            this._orden_fases.push(fase);
        }
        return this._antenas[fase];
    }

    /**
     * Registra un nodo como patrón en la antena de la fase indicada.
     *
     * Método de conveniencia que delega en Antena.registrar_patron().
     *
     * @param {NodoNumerico} nodo Nodo a registrar como patrón.
     * @param {(string|number)} fase Fase en la que se registrará.
     * @returns {void}
     */
    _patron(nodo, fase) {
        const antena = this.antena(fase);
        antena.registrar_patron(nodo);
    }

    /**
     * Procesa una señal aplicando el bucle de captura voraz con reinicio.
     *
     * Recorre las fases en orden inverso al de creación (la última fase
     * creada se considera la más alta). Si una antena logra capturar una
     * subsecuencia, se reinicia el recorrido desde la fase más alta.
     * El proceso finaliza cuando ninguna fase puede realizar capturas.
     *
     * @param {Senal} senal Señal a procesar (se modifica in-place).
     * @returns {void}
     */
    procesar(senal) {
        if (this._orden_fases.length === 0) {
            return;
        }

        // Orden inverso al de creación: última fase añadida = más alta.
        const fases = this._orden_fases.slice().reverse();

        let huboCaptura = true;
        while (huboCaptura) {
            huboCaptura = false;
            for (const fase of fases) {
                const antena = this._antenas[fase];
                if (antena.intentar_capturar(senal)) {
                    huboCaptura = true;
                    break; // Reinicia el while desde la fase más alta.
                }
            }
        }
    }

    /**
     * Devuelve el nombre del dominio.
     * @returns {string}
     */
    nombre_dominio() {
        return this._nombre_dominio;
    }

    /**
     * Devuelve todas las antenas del dominio.
     * @returns {Object.<(string|number), Antena>}
     */
    antenas() {
        return Object.assign({}, this._antenas);
    }
}