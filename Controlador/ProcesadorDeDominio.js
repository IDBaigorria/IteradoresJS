import { Objeto } from '../Nucleo/Objeto.js';
import { Antena } from './Antena.js';
import { NodoElectrico } from '../Nodos/NodoElectrico.js';
import { NodoNumerico } from '../Nodos/NodoNumerico.js';
/**
 * Procesador de Dominio: coordina las antenas de un dominio y ejecuta
 * el bucle de captura jerárquico para reducir una señal.
 *
 * Gestiona múltiples antenas (una por fase) y aplica un algoritmo voraz
 * que comienza por las fases más altas. Cuando una antena captura una
 * porción de la señal, se reinicia el recorrido desde la fase máxima,
 * garantizando así que los bocados sean siempre lo más grandes posible.
 *
 * A partir de la versión 1.4.6, el procesador se asocia a un medio
 * y una dirección (entrada/salida). Las fases se prefijan con esta
 * información para evitar colisiones entre dominios y subdominios.
 *
 * @class ProcesadorDeDominio
 * @extends Objeto
 * @since 1.4.5
 * @version 1.4.6
 */
export class ProcesadorDeDominio extends Objeto {
    /**
     * Nombre del medio (ej. 'Archivo', 'Talamo').
     * @type {string}
     * @private
     */
    _medio;

    /**
     * Dirección del subdominio: 'entrada' o 'salida'.
     * @type {string}
     * @private
     */
    _direccion;

    /**
     * Antenas del procesador, indexadas por fase (solo el número).
     * @type {Object.<number, Antena>}
     * @private
     */
    _antenas;

    /**
     * Token de seguridad para operaciones restringidas.
     * @type {string}
     * @since 1.4.6
     */
    static _token = '';
    /**
     * Recibe el token de seguridad desde el Controlador.
     * @param {string} token
     * @since 1.4.6
     */
    static recibir_token(token) {
        this._token = token;
    }
    /**
     * Constructor.
     * @param {string} medio     Nombre del medio (ej. 'Archivo', 'Talamo').
     * @param {string} direccion 'entrada' o 'salida'.
     */
    constructor(medio, direccion) {
        super();
        this._medio = medio;
        this._direccion = direccion;
        this._antenas = {};
    }

    /**
     * Construye la clave de fase completa a partir del número de fase.
     * @param {number} fase Número de fase.
     * @returns {string} Clave de fase (ej. 'Archivo:entrada:0').
     * @private
     */
    _prefijar_fase(fase) {
        return `${this._medio}:${this._direccion}:${fase}`;
    }

    /**
     * Obtiene la antena para una fase específica, creándola si no existe.
     * @param {number} fase Número de fase (sin prefijo).
     * @returns {Antena}
     */
    antena(fase) {
        if (!this._antenas.hasOwnProperty(fase)) {
            const fase_completa = this._prefijar_fase(fase);
            this._antenas[fase] = new Antena(fase_completa);
        }
        return this._antenas[fase];
    }

    /**
     * Registra un nodo como patrón en la antena de la fase indicada.
     * Método de conveniencia que delega en Antena._patron().
     * @param {NodoNumerico} nodo Nodo a registrar como patrón.
     * @param {number}       fase Número de fase.
     * @returns {void}
     */
    _patron(nodo, fase) {
        const antena = this.antena(fase);
        antena._patron(nodo);
    }

    /**
     * Procesa una señal aplicando el bucle de captura voraz con reinicio.
     * @param {Senal} senal Señal a procesar (se modifica in-place).
     * @returns {void}
     */
    procesar(senal) {
        // Bucle voraz sobre las fases existentes
        const fases = Object.keys(this._antenas).map(Number);
        if (fases.length > 0) {
            fases.sort((a, b) => b - a);

            let huboCaptura = true;
            while (huboCaptura) {
                huboCaptura = false;
                for (const numFase of fases) {
                    const antena = this._antenas[numFase];
                    if (antena.intentar_capturar(senal)) {
                        huboCaptura = true;
                        break;
                    }
                }
            }
        }

        const restantes = senal.no_consumidas();
        if (restantes.length === 0) return;

        const faseAnterior = NodoElectrico.fase();
        const faseDominioCero = this._prefijar_fase(0);
        NodoElectrico._fase(NodoElectrico._token, faseDominioCero);

        // Inicializar contador de esta fase en 256 si es la primera vez
        if (!NodoNumerico.contador_fase_existe(faseDominioCero)) {
            NodoNumerico._inicializar_contador_fase(faseDominioCero, 256);
        }

        for (const matriz of restantes) {
            const numero = NodoNumerico.siguiente_primo_positivo(faseDominioCero);
            const primo = NodoNumerico.crear_primo(numero);
            if (!primo) continue;

            primo._dato({ matriz_original: matriz }, 'abajo');
            this.antena(0)._patron(primo);
            senal.consumir(1, primo);
        }

        NodoElectrico._fase(this.constructor._token, faseAnterior);
    }


    /**
     * Devuelve el nombre del medio.
     * @returns {string}
     */
    medio() {
        return this._medio;
    }

    /**
     * Devuelve la dirección del subdominio ('entrada' o 'salida').
     * @returns {string}
     */
    direccion() {
        return this._direccion;
    }

    /**
     * Devuelve todas las antenas del procesador.
     * @returns {Object.<number, Antena>}
     */
    antenas() {
        return Object.assign({}, this._antenas);
    }
}