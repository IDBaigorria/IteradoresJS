import { Objeto } from '../Nucleo/Objeto.js';
import { NodoNumerico } from '../Nodos/NodoNumerico.js';
import { NodoPrimo } from '../Nodos/NodoPrimo.js';
import { NodoElectrico } from '../Nodos/NodoElectrico.js';
import { Senal } from './Senal.js';
import { Entorno } from '../Configuracion/Entorno.js';

/**
 * Antena de Marcado – Empaqueta múltiples matrices como un único NodoPrimo.
 *
 * ## Responsabilidad
 * Gestiona las **señales de marcado** (`marcado = true`) a lo largo de
 * todas las fases del sistema. Cada par (fase de origen/destino) se asocia
 * con un **único {@link NodoPrimo} fijo** que actúa como contenedor del
 * contenido de la señal. El contenido se guarda como dato multidimensional
 * del nodo, en la dimensión `'contenido'`.
 *
 * Es un **singleton**: la instancia única se obtiene con {@link AntenaDeMarcado#antena}.
 *
 * ## Dipolos multifase
 * Los dipolos se almacenan en un objeto de dos niveles:
 * ```
 * dipolos[fase][par] = NodoPrimo
 * ```
 * - **`fase`**: fase global actual (ej. `'Talamo:0'`), obtenida de {@link NodoElectrico#fase}.
 * - **`par`**: fase de origen/destino de la señal (ej. `'Talamo:0'`).
 * Cada par tiene un único NodoPrimo marcador. No se almacenan secuencias de
 * matrices en la antena; el contenido reside dentro del propio nodo.
 *
 * ## Aprendizaje trivial bidireccional automático
 * - **Recepción:** si no existe un marcador para el par, se obtiene un nuevo
 *   {@link NodoPrimo} con {@link NodoPrimo#siguiente_primo_libre} (fase actual)
 *   y se asigna permanentemente. Luego se guarda el contenido de la señal en
 *   `'contenido'` del nodo.
 * - **Emisión:** si el nodo no está registrado en el par destino, se asigna
 *   automáticamente (aprendizaje inverso). Luego se emite una señal con el
 *   contenido almacenado en `'contenido'` del nodo.
 *
 * ## Validación de tipo de señal
 * Solo acepta señales con `marcado === true`. Si recibe una señal común,
 * retorna `null`.
 *
 * ## Singleton
 * - {@link AntenaDeMarcado#antena} devuelve la instancia única.
 * - {@link AntenaDeMarcado#reiniciar} la destruye (solo en entorno de pruebas,
 *   verificado con {@link Entorno#permite_pruebas}).
 *
 * @class AntenaDeMarcado
 * @extends Objeto
 * @see AntenaComun
 * @see NodoPrimo
 * @since 1.4.8
 * @version 1.4.8
 */
export class AntenaDeMarcado extends Objeto {
    /**
     * Instancia única del singleton.
     * @type {AntenaDeMarcado|null}
     * @private
     * @static
     */
    static _instancia = null;

    /**
     * Dipolos organizados por fase y par.
     *
     * Estructura:
     * {
     *   'Talamo:0': {
     *     'Talamo:1': NodoPrimo,
     *     ...
     *   },
     *   ...
     * }
     *
     * @type {Object<string, Object<string, NodoPrimo>>}
     * @private
     */
    _dipolos = {};

    /**
     * Constructor privado (singleton).
     * @private
     */
    constructor() {
        super();
    }

    /**
     * Devuelve la instancia única de la Antena de Marcado.
     *
     * @returns {AntenaDeMarcado}
     * @static
     * @since 1.4.8
     */
    static antena() {
        if (!AntenaDeMarcado._instancia) {
            AntenaDeMarcado._instancia = new AntenaDeMarcado();
        }
        return AntenaDeMarcado._instancia;
    }

    /**
     * Destruye la instancia actual (solo en entorno de pruebas).
     *
     * @returns {void}
     * @static
     * @since 1.4.8
     */
    static reiniciar() {
        if (!Entorno.permite_pruebas()) {
            AntenaDeMarcado._error(
                'AntenaDeMarcado.reiniciar() solo está disponible en entorno de pruebas.'
            );
            return;
        }
        AntenaDeMarcado._instancia = null;
    }

    /**
     * Devuelve la fase global actual.
     *
     * @returns {string}
     * @private
     * @since 1.4.8
     */
    _fase_actual() {
        return NodoElectrico.fase();
    }

    // ═══════════════════════════════════════════
    // RECEPCIÓN CON APRENDIZAJE TRIVIAL
    // ═══════════════════════════════════════════

    /**
     * Recibe una señal de marcado y la almacena completa en el NodoPrimo del par.
     *
     * Solo procesa señales con `marcado === true`. Si el par no tiene
     * marcador, se crea uno nuevo con {@link NodoPrimo#siguiente_primo_libre}
     * y se asigna permanentemente. Luego se guarda la **señal completa**
     * en la dimensión `'contenido'` del nodo.
     *
     * @param {Senal} senal Señal recibida (debe tener `marcado === true`).
     * @returns {?NodoPrimo}
     */
    recibir(senal) {
        if (senal.marcado() !== true) return null;

        const fase = this._fase_actual();
        const par = senal.fase_origen();

        if (!this._dipolos[fase]) {
            this._dipolos[fase] = {};
        }

        if (!this._dipolos[fase][par]) {
            const nodo = NodoPrimo.siguiente_primo_libre();
            if (!nodo) {
                AntenaDeMarcado._error('No se pudo obtener un NodoPrimo libre para marcado.');
                return null;
            }
            this._dipolos[fase][par] = nodo;
        }

        const nodo_marcador = this._dipolos[fase][par];
        nodo_marcador._dato(senal, 'contenido');

        return nodo_marcador;
    }

    // ═══════════════════════════════════════════
    // EMISIÓN CON APRENDIZAJE TRIVIAL INVERSO
    // ═══════════════════════════════════════════

    /**
     * Emite una señal de marcado a partir del contenido del nodo.
     *
     * La señal emitida tendrá `marcado = true`. Si el nodo no está registrado
     * en el par destino, se asigna automáticamente. Luego se recupera la señal
     * almacenada en `'contenido'` y se retorna tal cual.
     *
     * @param {NodoNumerico} nodo
     * @param {string} fase_destino
     * @returns {?Senal}
     */
    emitir(nodo, fase_destino) {
        const fase = this._fase_actual();
        const par = fase_destino;

        if (!this._dipolos[fase]) {
            this._dipolos[fase] = {};
        }

        if (!this._dipolos[fase][par]) {
            this._dipolos[fase][par] = nodo;
        }

        const contenido = nodo.dato('contenido');
        if (!(contenido instanceof Senal)) {
            AntenaDeMarcado._error('El nodo no contiene una señal válida en "contenido".');
            return null;
        }

        return contenido;
    }
}