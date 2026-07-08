import { Objeto } from '../Nucleo/Objeto.js';
import { Matriz2x2 } from '../Nodos/Matriz2x2.js';
import { Senal } from './Senal.js';

/**
 * Antena: gestor del vocabulario (patrones) de una fase dentro de un dominio.
 *
 * Almacena un conjunto de patrones (NodoNumerico) y, ante una señal entrante,
 * intenta capturar la subsecuencia de matrices más larga que coincida exactamente
 * con la secuencia de alguno de sus patrones.
 *
 * A partir de la versión 1.4.7, la antena **no modifica la señal**. En su lugar
 * devuelve la longitud capturada y el patrón correspondiente. El avance del
 * índice de consumo y el registro de elementos procesados se trasladan al
 * {@link ProcesadorDeDominio} y al futuro Iterador.
 *
 * @class Antena
 * @extends Objeto
 * @since 1.4.5
 * @version 1.4.7
 */
export class Antena extends Objeto {
    /**
     * Fase a la que pertenece esta antena.
     * @type {string}
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
     * @param {string} fase Fase a la que pertenece la antena.
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
     * @param {NodoNumerico} nodo Nodo a registrar como patrón.
     * @returns {void}
     * @since 1.4.5
     */
    _patron(nodo) {
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
     * Intenta capturar una porción de la señal a partir de un índice dado.
     *
     * @param {Senal} senal         Señal sobre la que se intenta la captura.
     * @param {number} indice_actual Índice desde donde comenzar a buscar.
     * @returns {Array<number, NodoNumerico|null>} [longitud, patron] o [0, null].
     * @since 1.4.5
     * @version 1.4.7
     */
    intentar_capturar(senal, indice_actual) {
        const matrices = senal.matrices();
        const porcion = matrices.slice(indice_actual);
        const total = porcion.length;

        if (total === 0) return [0, null];

        const indices = this._patrones.map((_, i) => i);
        indices.sort((a, b) => this._secuencias[b].length - this._secuencias[a].length);

        const ultimoIndice = this._patrones.length - 1;

        for (const idx of indices) {
            if (idx === ultimoIndice) continue;

            const secuencia = this._secuencias[idx];
            const longitud = secuencia.length;
            if (longitud > total) continue;

            let coincide = true;
            for (let i = 0; i < longitud; i++) {
                if (!porcion[i].es_igual(secuencia[i])) {
                    coincide = false;
                    break;
                }
            }

            if (coincide) {
                return [longitud, this._patrones[idx]];
            }
        }

        return [0, null];
    }

    /**
     * Emite una señal a partir de una lista de p‑gramas registrados en esta antena.
     *
     * Busca cada p‑grama en el vocabulario, concatena las secuencias de matrices
     * de todos los patrones encontrados y devuelve una nueva señal con el resultado.
     * Si algún p‑grama no está registrado, la emisión falla y retorna null.
     *
     * El aprendizaje trivial asegura que todo byte de entrada tenga su patrón
     * elemental en fase 0, por lo que cualquier p‑grama bien formado podrá
     * ser traducido sin intervención adicional.
     *
     * @param {number[][]} pgramas Lista de p‑gramas a emitir (cada uno es un array de números).
     * @returns {Senal|null} Señal emitida o null si algún p‑grama no está registrado.
     * @since 1.4.7
     */
    emitir(pgramas) {
        const matrices = [];

        for (const pgrama of pgramas) {
            let encontrado = false;
            for (const patron of this._patrones) {
                if (this._comparar_pgramas(patron.pgrama(), pgrama)) {
                    // Leer la matriz original guardada en 'abajo'
                    const paqueteAbajo = patron.dato('abajo');
                    if (paqueteAbajo && paqueteAbajo.matriz_original) {
                        matrices.push(paqueteAbajo.matriz_original);
                    } else {
                        // Fallback
                        matrices.push(...patron.secuencia_de_matrices());
                    }
                    encontrado = true;
                    break;
                }
            }
            if (!encontrado) return null;
        }

        return new Senal(matrices);
    }

    /**
     * Compara dos p‑gramas elemento a elemento.
     *
     * @param {number[]} a
     * @param {number[]} b
     * @returns {boolean}
     * @private
     */
    _comparar_pgramas(a, b) {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    }

    /**
     * Devuelve la fase de la antena.
     * @returns {string}
     * @since 1.4.5
     */
    fase() {
        return this._fase;
    }

    /**
     * Devuelve la lista de patrones registrados.
     * @returns {NodoNumerico[]}
     * @since 1.4.5
     */
    patrones() {
        return this._patrones.slice();
    }
}