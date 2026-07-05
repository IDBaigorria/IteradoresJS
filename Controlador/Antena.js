import { Objeto } from '../Nucleo/Objeto.js';
import { Matriz2x2 } from '../Nodos/Matriz2x2.js';
import { Senal } from './Senal.js';
// NodoNumerico y Senal se importan en el futuro cuando se necesiten referencias circulares,
// pero aquí las documentamos con JSDoc.

/**
 * Antena: gestor del vocabulario (patrones) de una fase dentro de un dominio.
 *
 * Almacena un conjunto de patrones (NodoNumerico) y, ante una señal entrante,
 * intenta capturar la subsecuencia de matrices crudas más larga que coincida
 * exactamente con la secuencia de matrices de alguno de sus patrones.
 *
 * La captura es voraz y no modifica la señal salvo para avanzar el índice
 * de consumo; nunca inserta nuevas matrices en la señal.
 *
 * @class Antena
 * @extends Objeto
 * @since 1.4.5
 * @version 1.4.5
 */
export class Antena extends Objeto {
    /**
     * Fase a la que pertenece esta antena.
     * @type {number}
     * @private
     */
    _fase;

    /**
     * Lista de patrones registrados en esta antena.
     * @type {NodoNumerico[]}
     * @private
     */
    _patrones;

    /**
     * Caché de las secuencias de matrices de cada patrón,
     * en el mismo orden que _patrones.
     * @type {Matriz2x2[][]}
     * @private
     */
    _secuencias;

    /**
     * Constructor.
     * @param {number} fase Fase a la que pertenece la antena.
     */
    constructor(fase) {
        super();
        this._fase = fase;
        this._patrones = [];
        this._secuencias = [];
    }

    /**
     * Registra un nodo numérico como patrón en esta antena.
     *
     * Verifica que el nodo tenga identidad (es decir, que su matriz de identidad
     * no sea la inicial) y precalcula su secuencia de matrices para acelerar
     * las capturas.
     *
     * @param {NodoNumerico} nodo Nodo a registrar como patrón.
     * @returns {void}
     */
    registrar_patron(nodo) {
        // Validar que el nodo tenga identidad real.
        const identidad = nodo.identidad();
        if (identidad.es_igual(Matriz2x2.inicial())) {
            this.constructor._error(
                `El nodo no tiene identidad real. No se registra.`
            );
            return;
        }

        const secuencia = nodo.secuencia_de_matrices();
        if (!secuencia || secuencia.length === 0) {
            this.constructor._error(
                "La secuencia de matrices del patrón está vacía. No se registra."
            );
            return;
        }

        this._patrones.push(nodo);
        this._secuencias.push(secuencia);
    }

    /**
     * Intenta capturar una porción de la señal usando el vocabulario de patrones.
     *
     * @param {Senal} senal Señal sobre la que se intenta la captura.
     * @returns {boolean} true si se realizó una captura, false en caso contrario.
     */
    intentar_capturar(senal) {
        const no_consumidas = senal.no_consumidas();
        const total = no_consumidas.length;

        if (total === 0) {
            return false;
        }

        // Crear array de índices y ordenar de mayor a menor longitud de secuencia.
        const indices = this._patrones.map((_, i) => i);
        indices.sort((a, b) => this._secuencias[b].length - this._secuencias[a].length);

        for (const idx of indices) {
            const secuencia = this._secuencias[idx];
            const longitud = secuencia.length;

            if (longitud > total) {
                continue;
            }

            // Comparar elemento a elemento con el prefijo de la señal.
            let coincide = true;
            for (let i = 0; i < longitud; i++) {
                if (!no_consumidas[i].es_igual(secuencia[i])) {
                    coincide = false;
                    break;
                }
            }

            if (coincide) {
                const patron = this._patrones[idx];
                senal.consumir(longitud, patron);
                return true;
            }
        }

        return false;
    }

    /**
     * Devuelve la fase de la antena.
     * @returns {number}
     */
    fase() {
        return this._fase;
    }

    /**
     * Devuelve la lista de patrones registrados.
     * @returns {NodoNumerico[]}
     */
    patrones() {
        return this._patrones.slice();
    }
}