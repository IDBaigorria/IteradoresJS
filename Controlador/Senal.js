import { Objeto } from '../Nucleo/Objeto.js';
import { Matriz2x2 } from '../Nodos/Matriz2x2.js';
// NodoNumerico se importa donde se necesite, aquí solo para JSDoc

/**
 * Señal: estructura ligera de comunicación entre dominios.
 *
 * Encapsula una sucesión de matrices de identidad (Matriz2x2) y mantiene
 * un índice de consumo que indica cuántas matrices crudas ya han sido
 * procesadas por las antenas.
 *
 * La señal es mutable; las capturas realizadas por Antena modifican la
 * misma instancia, avanzando el índice y registrando los patrones o
 * matrices consumidas.
 *
 * @class Senal
 * @extends Objeto
 * @since 1.4.5
 * @version 1.4.5
 */
export class Senal extends Objeto {
    /**
     * Lista original de matrices que componen la señal.
     * @type {Matriz2x2[]}
     * @private
     */
    _matrices_crudas;

    /**
     * Cantidad de matrices crudas que ya han sido consumidas.
     * @type {number}
     * @private
     */
    _indice_comido;

    /**
     * Ítems ya procesados. Cada elemento puede ser:
     *   - Matriz2x2: cuando no fue capturada por ningún patrón.
     *   - NodoNumerico: cuando un patrón capturó una subsecuencia.
     * @type {Array<Matriz2x2|NodoNumerico>}
     * @private
     */
    _elementos_procesados;

    /**
     * Constructor.
     * @param {Matriz2x2[]} [matrices=[]] Matrices crudas iniciales.
     */
    constructor(matrices = []) {
        super();
        this._matrices_crudas = matrices.slice(); // copia defensiva
        this._indice_comido = 0;
        this._elementos_procesados = [];
    }

    /**
     * Añade una matriz al final de la señal cruda.
     * @param {Matriz2x2} matriz
     * @returns {void}
     */
    _matriz(matriz) {
        this._matrices_crudas.push(matriz);
    }

    /**
     * Devuelve el total de matrices crudas (sin importar cuántas se han consumido).
     * @returns {number}
     */
    longitud_cruda() {
        return this._matrices_crudas.length;
    }

    /**
     * Devuelve la cantidad de matrices crudas que aún no han sido consumidas.
     * @returns {number}
     */
    longitud_no_consumida() {
        return this._matrices_crudas.length - this._indice_comido;
    }

    /**
     * Obtiene la porción no consumida de las matrices crudas.
     * @returns {Matriz2x2[]}
     */
    no_consumidas() {
        return this._matrices_crudas.slice(this._indice_comido);
    }

    /**
     * Consume una cantidad de matrices crudas, registrando el patrón que las capturó.
     *
     * Si se proporciona un patrón (NodoNumerico), se añade ese nodo como un único
     * elemento procesado. En caso contrario, se añaden individualmente las matrices
     * consumidas como elementos procesados.
     *
     * @param {number} longitud Cantidad de matrices a consumir.
     * @param {NodoNumerico|null} [patron=null] Patrón que capturó la subsecuencia.
     * @returns {void}
     */
    consumir(longitud, patron = null) {
        const disponibles = this.longitud_no_consumida();
        if (longitud > disponibles) {
            // Uso de _error heredado de Objeto (estático)
            this.constructor._error(
                `No se pueden consumir ${longitud} matrices. Solo hay ${disponibles} disponibles.`
            );
            return;
        }

        if (patron !== null) {
            // Captura realizada por un patrón
            this._elementos_procesados.push(patron);
        } else {
            // Sin patrón, se agregan las matrices crudas una a una
            const porcion = this._matrices_crudas.slice(
                this._indice_comido,
                this._indice_comido + longitud
            );
            this._elementos_procesados.push(...porcion);
        }

        this._indice_comido += longitud;
    }

    /**
     * Devuelve el índice actual de consumo.
     * @returns {number}
     */
    indice_consumido() {
        return this._indice_comido;
    }

    /**
     * Devuelve todos los elementos procesados hasta el momento.
     * @returns {Array<Matriz2x2|NodoNumerico>}
     */
    elementos_procesados() {
        return this._elementos_procesados.slice(); // copia para evitar mutación externa
    }

    /**
     * Devuelve las matrices crudas completas (incluye las ya consumidas).
     * @returns {Matriz2x2[]}
     */
    crudas() {
        return this._matrices_crudas.slice();
    }

    /**
     * Construye una nueva señal a partir de los elementos procesados.
     *
     * Las matrices crudas de la nueva señal serán las matrices de identidad
     * de cada elemento: para un patrón, su identidad_por_fase en la fase actual;
     * para una matriz suelta, ella misma.
     *
     * @param {number} fase Fase en la que se obtienen las matrices de identidad de los patrones.
     * @returns {Senal}
     * @since 1.4.5
     * @todo Implementar una vez que el enrutamiento entre dominios esté activo.
     */
    generar_senal_de_salida(fase) {
        const matrices_salida = [];
        for (const item of this._elementos_procesados) {
            if (item.constructor && item.constructor.name === 'NodoNumerico') {
                // TODO: validar que el nodo tenga identidad en la fase dada
                matrices_salida.push(item.identidad(fase));
            } else {
                matrices_salida.push(item);
            }
        }
        return new Senal(matrices_salida);
    }
}