import { Objeto } from '../Nucleo/Objeto.js';
import { Antena } from './Antena.js';
import { NodoElectrico } from '../Nodos/NodoElectrico.js';
import { NodoNumerico } from '../Nodos/NodoNumerico.js';

/**
 * Procesador de Dominio: coordina las antenas de un dominio y ejecuta
 * el bucle de captura jerárquico para reducir una señal.
 *
 * A partir de la versión 1.4.7, el procesador mantiene internamente
 * el índice de consumo y la lista de p‑gramas capturados. La señal ya
 * no es modificada; en su lugar, el procesador registra los elementos
 * procesados y permite emitir una nueva señal con {@link emitir_senal}.
 *
 * @class ProcesadorDeDominio
 * @extends Objeto
 * @since 1.4.5
 * @version 1.4.7
 */
export class ProcesadorDeDominio extends Objeto {
    /** @type {string} */
    _medio;

    /** @type {string} */
    _direccion;

    /** @type {Object.<number, Antena>} */
    _antenas;

    /**
     * Fase máxima permitida para el ascenso (null = sin límite).
     * @type {number|null}
     * @since 1.4.7
     */
    _maxima_fase = null;

    /**
     * Lista de p‑gramas capturados durante el último procesamiento.
     * @type {number[][]}
     * @since 1.4.7
     */
    _elementos_procesados = [];

    /** @type {string} */
    static _token = '';

    /** @inheritdoc */
    static recibir_token(token) { this._token = token; }

    /**
     * @param {string} medio
     * @param {string} direccion
     */
    constructor(medio, direccion) {
        super();
        this._medio = medio;
        this._direccion = direccion;
        this._antenas = {};
    }

    /**
     * @param {number} fase
     * @returns {string}
     * @private
     */
    _prefijar_fase(fase) {
        return `${this._medio}:${this._direccion}:${fase}`;
    }

    /**
     * @param {number} fase
     * @returns {Antena}
     */
    antena(fase) {
        if (!this._antenas.hasOwnProperty(fase)) {
            this._antenas[fase] = new Antena(this._prefijar_fase(fase));
        }
        return this._antenas[fase];
    }

    /**
     * @param {NodoNumerico} nodo
     * @param {number} fase
     */
    _patron(nodo, fase) {
        this.antena(fase)._patron(nodo);
    }

    /**
     * @param {number|null} fase
     * @since 1.4.7
     */
    establecer_maxima_fase(fase) {
        this._maxima_fase = fase;
    }

    /**
     * Procesa una señal con bucle voraz y aprendizaje trivial.
     * @param {Senal} senal
     * @version 1.4.7
     */
    procesar(senal) {
        this._elementos_procesados = [];
        const matrices = senal.matrices();
        const total = matrices.length;
        let i = 0;

        while (i < total) {
            const fases = Object.keys(this._antenas).map(Number);
            fases.sort((a, b) => b - a);

            let capturado = false;

            for (const numFase of fases) {
                if (this._maxima_fase !== null && numFase > this._maxima_fase) continue;

                const antena = this._antenas[numFase];
                const [longitud, patron] = antena.intentar_capturar(senal, i);

                if (longitud > 0 && patron !== null) {
                    this._elementos_procesados.push(patron.pgrama());
                    i += longitud;
                    capturado = true;
                    break;
                }
            }

            if (!capturado) {
                // Aprendizaje trivial
                const faseAnterior = NodoElectrico.fase();
                const faseDominioCero = this._prefijar_fase(0);
                NodoElectrico._fase(this.constructor._token, faseDominioCero);

                if (!NodoNumerico.contador_fase_existe(faseDominioCero)) {
                    NodoNumerico._inicializar_contador_fase(faseDominioCero, 256);
                }

                const numero = NodoNumerico.siguiente_primo_positivo(faseDominioCero);
                const primo = NodoNumerico.crear_primo(numero);
                if (primo) {
                    primo._dato({ matriz_original: matrices[i] }, 'abajo');
                    this.antena(0)._patron(primo);
                    this._elementos_procesados.push(primo.pgrama());
                }

                NodoElectrico._fase(this.constructor._token, faseAnterior);
                i++;
            }
        }
    }

    /**
     * @returns {number[][]}
     * @since 1.4.7
     */
    elementos_procesados() {
        return this._elementos_procesados.slice();
    }

    /**
     * @returns {Senal|null}
     * @since 1.4.7
     */
    emitir_senal() {
        return this.antena(0).emitir(this._elementos_procesados);
    }

    /** @returns {string} */
    medio() { return this._medio; }

    /** @returns {string} */
    direccion() { return this._direccion; }

    /** @returns {Object.<number, Antena>} */
    antenas() { return Object.assign({}, this._antenas); }
}