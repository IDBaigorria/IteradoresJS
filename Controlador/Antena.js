import { Objeto } from '../Nucleo/Objeto.js';
import { Matriz2x2 } from '../Nodos/Matriz2x2.js';
import { Senal } from '../Iteradores/Senal.js';

/**
 * Antena: gestor del vocabulario de una fase dentro de un dominio.
 *
 * Mantiene un diccionario de **dipolos**: asociaciones directas entre un
 * fragmento de señal externa (array de {@link Matriz2x2}) y el
 * {@link NodoNumerico} que lo representa internamente en esta fase.
 *
 * La antena no modifica la señal. Ante una señal entrante, intenta capturar
 * la mayor subsecuencia de matrices que coincida exactamente con la de alguno
 * de sus dipolos, devolviendo la longitud capturada y el nodo correspondiente.
 * Para la emisión, proporciona métodos que construyen una nueva {@link Senal}
 * a partir de las matrices de identidad de los nodos, asignando como fase de
 * origen la fase completa de la antena.
 *
 * @class Antena
 * @extends Objeto
 * @since 1.4.5
 * @version 1.4.8
 */
export class Antena extends Objeto {
    /**
     * Fase a la que pertenece esta antena.
     * @type {string}
     * @private
     */
    _fase;

    /**
     * Lista de dipolos registrados, ordenada de mayor a menor longitud de
     * la secuencia de matrices.
     *
     * Cada elemento es un objeto con:
     *   - matrices: Matriz2x2[]   (fragmento de señal original)
     *   - nodo:     NodoNumerico  (símbolo interno en esta fase)
     *
     * @type {Array<{matrices: Matriz2x2[], nodo: NodoNumerico}>}
     * @private
     */
    _dipolos;

    /**
     * Constructor.
     * @param {string} fase Identificador de la fase (ej. '0', 'texto:entrada:1').
     */
    constructor(fase) {
        super();
        this._fase = fase;
        this._dipolos = [];
    }

    /**
     * Registra un nuevo dipolo en esta antena.
     *
     * Asocia un fragmento de señal (array de matrices) con el nodo numérico
     * que lo representa. La inserción mantiene la lista ordenada de mayor a
     * menor longitud de secuencia, lo que garantiza capturas voraces eficientes.
     *
     * @param {Matriz2x2[]}  matrices Secuencia de matrices que forman el dipolo.
     * @param {NodoNumerico} nodo     Nodo numérico que nombra el fragmento.
     * @returns {void}
     * @since 1.4.5
     * @version 1.4.8
     */
    _dipolo(matrices, nodo) {
        if (!matrices || matrices.length === 0) {
            this.constructor._error('Intento de registrar dipolo con secuencia vacía.');
            return;
        }

        // Verificar que el nodo tenga una identidad real
        const identidad = nodo.identidad();
        if (identidad.es_igual(Matriz2x2.inicial())) {
            this.constructor._error('El nodo no posee una identidad real. Dipolo no registrado.');
            return;
        }

        const nueva_longitud = matrices.length;
        let insertado = false;

        for (let i = 0; i < this._dipolos.length; i++) {
            if (nueva_longitud > this._dipolos[i].matrices.length) {
                this._dipolos.splice(i, 0, { matrices: matrices.slice(), nodo: nodo });
                insertado = true;
                break;
            }
        }

        if (!insertado) {
            this._dipolos.push({ matrices: matrices.slice(), nodo: nodo });
        }
    }

    /**
     * Intenta capturar una porción de la señal desde un índice dado.
     *
     * Recorre los dipolos (ya ordenados de mayor a menor longitud) y devuelve
     * la primera coincidencia exacta con el prefijo de la señal.
     * Ignora siempre el último dipolo registrado para evitar auto‑capturas
     * durante el aprendizaje.
     *
     * @param {Senal}  senal         Señal sobre la que se intenta la captura.
     * @param {number} indice_actual Índice de inicio en la señal.
     * @returns {Array<number, NodoNumerico|null>} [longitud capturada, nodo capturado]
     *         o [0, null] si no hubo coincidencia.
     * @since 1.4.5
     * @version 1.4.8
     */
    intentar_capturar(senal, indice_actual) {
        const matrices = senal.matrices();
        const porcion  = matrices.slice(indice_actual);
        const total    = porcion.length;

        if (total === 0) {
            return [0, null];
        }

        const ultimo_indice = this._dipolos.length - 1;

        for (let idx = 0; idx < this._dipolos.length; idx++) {
            // Ignorar el último dipolo (auto‑captura)
            if (idx === ultimo_indice) {
                continue;
            }

            const dipolo    = this._dipolos[idx];
            const secuencia = dipolo.matrices;
            const longitud  = secuencia.length;

            if (longitud > total) {
                continue;
            }

            let coincide = true;
            for (let i = 0; i < longitud; i++) {
                if (!porcion[i].es_igual(secuencia[i])) {
                    coincide = false;
                    break;
                }
            }

            if (coincide) {
                return [longitud, dipolo.nodo];
            }
        }

        return [0, null];
    }

    /**
     * Emite una señal que contiene únicamente la matriz de identidad del nodo dado.
     *
     * Construye un nuevo objeto {@link Senal} con una sola matriz (la identidad
     * del nodo) y le asigna como fase de origen la fase completa de esta antena.
     * No realiza ninguna comprobación sobre dipolos.
     *
     * @param {NodoNumerico} nodo Nodo cuya identidad se desea emitir.
     * @returns {Senal} Señal recién creada con fase de origen establecida.
     * @since 1.4.8
     */
    emitir(nodo) {
        const matriz_identidad = nodo.identidad();
        return new Senal([matriz_identidad], this._fase);
    }

    /**
     * Emite una señal que contiene las matrices de identidad de todos los nodos
     * proporcionados en el array.
     *
     * Construye un nuevo objeto {@link Senal} concatenando las matrices de
     * identidad de cada nodo en el orden dado y le asigna como fase de origen
     * la fase completa de esta antena. No realiza ninguna comprobación sobre
     * dipolos.
     *
     * @param {NodoNumerico[]} nodos Lista de nodos cuyas identidades se emitirán.
     * @returns {Senal} Señal recién creada con fase de origen establecida.
     * @since 1.4.8
     */
    emitir_varios(nodos) {
        const matrices = [];
        for (const nodo of nodos) {
            matrices.push(nodo.identidad());
        }
        return new Senal(matrices, this._fase);
    }

    /**
     * Devuelve la fase a la que pertenece la antena.
     * @returns {string}
     * @since 1.4.5
     */
    fase() {
        return this._fase;
    }

    /**
     * Devuelve la lista de nodos (símbolos internos) conocidos por esta antena.
     * @returns {NodoNumerico[]}
     * @since 1.4.5
     * @version 1.4.8
     */
    dipolos() {
        return this._dipolos.map(d => d.nodo);
    }
}