import { Objeto } from '../Nucleo/Objeto.js';
import { Matriz2x2 } from '../Nodos/Matriz2x2.js';
import { NodoNumerico } from '../Nodos/NodoNumerico.js';
import { Senal } from '../Iteradores/Senal.js';
import { Conf } from '../Configuracion/Configuracion.js';

/**
 * Antena de Traducción – Convierte entre bytes y señales matriciales.
 *
 * ## Responsabilidad
 * Traduce una cadena de **bytes del mundo exterior** a una {@link Senal}
 * compuesta por las matrices de identidad de los {@link NodoPrimo}
 * correspondientes (según el mapeo fijo de {@link Conf#PRIMOS_PRECARGADOS}),
 * y viceversa.
 *
 * A diferencia de {@link AntenaComun} y {@link AntenaDeMarcado}, **no es
 * multifase ni singleton**. Se instancia una vez por cada dirección de
 * comunicación que requiera traducción (normalmente 4 instancias en el
 * {@link Controlador}).
 *
 * ## Mapeo byte ↔ matriz
 * Utiliza los primeros 256 primos de {@link Conf#PRIMOS_PRECARGADOS}:
 * - El byte `0` se corresponde con el primo en la posición `0` del array,
 *   el byte `1` con la posición `1`, y así sucesivamente.
 * - Para obtener el NodoPrimo se usa {@link NodoNumerico#crear_primo},
 *   que gestiona una caché interna de instancias.
 *
 * ## Constructor
 * Recibe un `origen` que se usará como {@link Senal#fase_origen} en todas
 * las señales que emita. Esto permite al receptor identificar la antena
 * concreta que generó la señal.
 *
 * ## Emisión de señales marcadas
 * Las señales producidas por esta antena son de tipo **marcado**
 * (`marcado = true`), porque están destinadas a ser procesadas por la
 * {@link AntenaDeMarcado} del Tálamo.
 *
 * @class AntenaTraduccion
 * @extends Objeto
 * @since 1.4.8
 * @version 1.4.8
 * @see AntenaComun
 * @see AntenaDeMarcado
 * @see Conf#PRIMOS_PRECARGADOS
 */
export class AntenaTraduccion extends Objeto {
    /**
     * Identificador de origen que se asignará a las señales emitidas.
     * @type {string}
     * @private
     */
    _origen;

    /**
     * Constructor.
     *
     * @param {string} origen Valor para {@link Senal#fase_origen} de las señales emitidas.
     */
    constructor(origen) {
        super();
        this._origen = origen;
    }

    /**
     * Emite una señal matricial a partir de una cadena de bytes.
     *
     * Recorre cada byte, obtiene el número primo correspondiente de
     * {@link Conf#PRIMOS_PRECARGADOS}, crea (o recupera de la caché) el
     * {@link NodoPrimo} y añade su matriz identidad a la señal.
     *
     * La señal resultante tiene `marcado = true` y su fase de origen es
     * el valor asignado en el constructor.
     *
     * @param {string} bytes Cadena de bytes a traducir.
     * @returns {Senal} Señal con tantas matrices como bytes tenía la cadena.
     * @since 1.4.8
     */
    emitir(bytes) {
        const matrices = [];
        const primos_precargados = Conf.PRIMOS_PRECARGADOS;

        for (let i = 0; i < bytes.length; i++) {
            const byte = bytes.charCodeAt(i);
            const primo = primos_precargados[byte];

            if (primo === undefined) {
                AntenaTraduccion._error(
                    `No se encontró un primo precargado para el byte ${byte}.`
                );
                continue;
            }

            const nodo_primo = NodoNumerico.crear_primo(primo);
            if (nodo_primo) {
                matrices.push(nodo_primo.identidad());
            }
        }

        return new Senal(matrices, this._origen, true);
    }

    /**
     * Recibe una señal matricial y la convierte de vuelta a una cadena de bytes.
     *
     * Recorre las matrices de la señal, extrae el número primo de cada una
     * (valor absoluto de `a`), busca su índice en
     * {@link Conf#PRIMOS_PRECARGADOS} y lo convierte al carácter correspondiente.
     *
     * @param {Senal} senal Señal cuyas matrices representan bytes.
     * @returns {string} Cadena de bytes decodificada.
     * @since 1.4.8
     */
    recibir(senal) {
        const matrices = senal.matrices();
        const primos_precargados = Conf.PRIMOS_PRECARGADOS;
        let bytes = '';

        for (const matriz of matrices) {
            const primo = Math.abs(matriz.a);
            const byte = primos_precargados.indexOf(primo);

            if (byte === -1) {
                AntenaTraduccion._error(
                    `No se encontró un byte para el primo ${primo}.`
                );
                continue;
            }

            bytes += String.fromCharCode(byte);
        }

        return bytes;
    }
}