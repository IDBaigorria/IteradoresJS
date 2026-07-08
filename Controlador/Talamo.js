import { ProcesadorDeDominio } from './ProcesadorDeDominio.js';
import { Senal } from './Senal.js';
import { Matriz2x2 } from '../Nodos/Matriz2x2.js';
import { NodoNumerico } from '../Nodos/NodoNumerico.js';

/**
 * Tálamo: dominio de traducción entre bytes y el alfabeto universal de matrices.
 *
 * Es un {@link ProcesadorDeDominio} limitado a la fase 0 y precargado con
 * los 256 patrones byte↔matriz. Singleton gestionado por el {@link Controlador}.
 *
 * @class Talamo
 * @extends ProcesadorDeDominio
 * @since 1.4.7
 */
export class Talamo extends ProcesadorDeDominio {
    /** @type {Talamo|null} */
    static _instancia = null;

    /**
     * @private
     */
    constructor() {
        super('Talamo', 'entrada');
        this.establecer_maxima_fase(0);
    }

    /**
     * Obtiene la instancia única del Tálamo.
     * @returns {Talamo}
     */
    static obtener() {
        if (!Talamo._instancia) {
            Talamo._instancia = new Talamo();
        }
        return Talamo._instancia;
    }

    /**
     * Precarga los 256 patrones byte↔matriz mediante aprendizaje trivial.
     * @returns {void}
     */
    precargar() {
        if (this.antena(0).patrones().length >= 256) return;

        const matrices = [];
        for (let b = 0; b < 256; b++) {
            const primo = NodoNumerico.primos_conocidos[b];
            matrices.push(Matriz2x2.crear_prima(primo));
        }
        const senal = new Senal(matrices);
        this.procesar(senal);
    }

    /**
     * Traduce una cadena de bytes a una señal.
     * @param {string|Uint8Array|ArrayBuffer} bytes
     * @returns {Senal}
     */
    traducir_entrada(bytes) {
        // Normalizar a array de bytes
        let arr = [];
        if (bytes instanceof ArrayBuffer || bytes instanceof Uint8Array) {
            arr = Array.from(new Uint8Array(bytes));
        } else if (typeof bytes === 'string') {
            for (let i = 0; i < bytes.length; i++) {
                arr.push(bytes.charCodeAt(i));
            }
        }

        const matrices = [];
        for (const byte of arr) {
            const primo = NodoNumerico.primos_conocidos[byte];
            if (primo !== undefined) {
                matrices.push(Matriz2x2.crear_prima(primo));
            }
        }
        const senal = new Senal(matrices);
        this.procesar(senal);
        return this.emitir_senal();
    }

    /**
     * Traduce una señal a una cadena de bytes.
     * @param {Senal} senal
     * @returns {string}
     */
    traducir_salida(senal) {
        this.procesar(senal);
        const pgramas = this.elementos_procesados();
        let bytes = '';
        for (const pgrama of pgramas) {
            const primo = pgrama[0];
            const byte = NodoNumerico.primos_conocidos.indexOf(primo);
            if (byte !== -1) {
                bytes += String.fromCharCode(byte);
            }
        }
        return bytes;
    }
}