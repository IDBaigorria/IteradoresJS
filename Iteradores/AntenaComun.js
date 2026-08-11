import { Objeto } from '../Nucleo/Objeto.js';
import { Matriz2x2 } from '../Nodos/Matriz2x2.js';
import { NodoNumerico } from '../Nodos/NodoNumerico.js';
import { NodoPrimo } from '../Nodos/NodoPrimo.js';
import { NodoElectrico } from '../Nodos/NodoElectrico.js';
import { Senal } from './Senal.js';
import { Entorno } from '../Configuracion/Entorno.js';

/**
 * Antena Común – Comunicación multifase de una sola matriz.
 *
 * ## Responsabilidad
 * Gestiona el vocabulario de **señales comunes** (señales de una única matriz,
 * `marcado = false`) a lo largo de todas las fases del sistema.
 * Es un **singleton**: existe una única instancia global accesible mediante
 * {@link AntenaComun#antena}.
 *
 * ## Dipolos multifase
 * Los dipolos se almacenan en un objeto de dos niveles:
 * ```
 * dipolos[fase][par] = Array<{matrices: Matriz2x2[], nodo: NodoNumerico}>
 * ```
 * - **`fase`**: fase global actual (ej. `'Talamo:0'`), obtenida de {@link NodoElectrico#fase}.
 * - **`par`**: fase de origen/destino de la señal (ej. `'Talamo:0'`).
 * Cada par puede contener múltiples asociaciones (matriz única → nodo).
 *
 * ## Almacenamiento de la señal (solo en aprendizaje)
 * La señal completa se guarda en el dato `'contenido'` del {@link NodoPrimo}
 * **exclusivamente durante el aprendizaje trivial en recepción**. Una vez
 * aprendida, la asociación matriz→nodo es inmutable y no se sobrescribe.
 *
 * ## Aprendizaje trivial bidireccional automático
 * - **Recepción:** si una matriz no está registrada en el par, se crea un nuevo
 *   {@link NodoPrimo} con {@link NodoPrimo#siguiente_primo_libre} (fase actual),
 *   se añade el dipolo y se guarda la señal original en `'contenido'` del nodo.
 * - **Emisión:** si el nodo no está en el par destino, se crea un dipolo con la
 *   matriz de identidad del nodo (sin almacenar señal en el nodo). Luego se emite
 *   una señal con dicha matriz.
 *
 * ## Validación de tipo de señal
 * Solo acepta señales con `marcado === false`. Si recibe una señal marcada,
 * retorna `null`.
 *
 * ## Singleton
 * - {@link AntenaComun#antena} devuelve la instancia única.
 * - {@link AntenaComun#reiniciar} la destruye (solo en entorno de pruebas).
 *
 * @author Ignacio David Baigorria
 *
 * @class AntenaComun
 * @extends Objeto
 * @since 1.4.8
 * @version 1.4.8
 */
export class AntenaComun extends Objeto {
    /**
     * Instancia única del singleton.
     * @type {AntenaComun|null}
     * @private
     */
    static _instancia = null;

    /**
     * Dipolos organizados por fase y par.
     *
     * Estructura:
     * {
     *   'Talamo:0': {
     *     'Talamo:1': [
     *       { matrices: Matriz2x2[], nodo: NodoNumerico },
     *       ...
     *     ],
     *     ...
     *   },
     *   ...
     * }
     *
     * @type {Object<string, Object<string, Array<{matrices: Matriz2x2[], nodo: NodoNumerico}>>>}
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
     * Devuelve la instancia única de la Antena Común.
     *
     * @returns {AntenaComun}
     * @since 1.4.8
     */
    static antena() {
        if (!AntenaComun._instancia) {
            AntenaComun._instancia = new AntenaComun();
        }
        return AntenaComun._instancia;
    }

    /**
     * Destruye la instancia actual (solo en entorno de pruebas).
     *
     * @returns {void}
     * @since 1.4.8
     */
    static reiniciar() {
        if (!Entorno.permite_pruebas()) {
            this._error('reiniciar() solo está disponible en entorno de pruebas.');
            return;
        }
        AntenaComun._instancia = null;
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

    /**
     * Registra un nuevo dipolo en una fase y par concretos.
     *
     * @param {string}        fase     Fase global.
     * @param {string}        par      Identificador del par (fase origen/destino).
     * @param {Matriz2x2[]}   matrices Secuencia de matrices (exactamente una).
     * @param {NodoNumerico}  nodo     Nodo asociado.
     * @returns {void}
     * @since 1.4.8
     */
    _dipolo(fase, par, matrices, nodo) {
        if (!this._dipolos[fase]) {
            this._dipolos[fase] = {};
        }
        if (!this._dipolos[fase][par]) {
            this._dipolos[fase][par] = [];
        }
        this._dipolos[fase][par].push({ matrices: matrices.slice(), nodo });
    }

    // ═══════════════════════════════════════════
    // RECEPCIÓN
    // ═══════════════════════════════════════════

    /**
     * Recibe una señal común y devuelve el nodo asociado.
     *
     * Solo procesa señales con `marcado === false`. Utiliza la fase global
     * actual para indexar los dipolos y la fase de origen de la señal como
     * par de recepción.
     *
     * Si no encuentra coincidencia, activa el aprendizaje trivial: crea un
     * nuevo NodoPrimo con {@link NodoPrimo#siguiente_primo_libre}, registra
     * el dipolo y guarda la señal completa en el dato `'contenido'` del nodo.
     * Si ya existe, **no** modifica el contenido previamente guardado.
     *
     * @param {Senal} senal Señal recibida (debe tener `marcado === false`).
     * @returns {?NodoNumerico} Nodo encontrado o aprendido, o null si falla.
     */
    recibir(senal) {
        if (senal.marcado() !== false) return null;

        const matrices = senal.matrices();
        if (!matrices.length) return null;

        const matriz = matrices[0];
        const fase   = this._fase_actual();
        const par    = senal.fase_origen();

        if (this._dipolos[fase]?.[par]) {
            for (const dipolo of this._dipolos[fase][par]) {
                if (dipolo.matrices[0].es_igual(matriz)) {
                    // No se actualiza la señal guardada
                    return dipolo.nodo;
                }
            }
        }

        const nodo_primo = NodoPrimo.siguiente_primo_libre();
        if (!nodo_primo) {
            AntenaComun._error('No se pudo obtener un NodoPrimo libre para aprendizaje trivial.');
            return null;
        }

        // Guardar la señal completa SOLO en el aprendizaje
        nodo_primo._dato(senal, 'contenido');

        if (!this._dipolos[fase]) this._dipolos[fase] = {};
        if (!this._dipolos[fase][par]) this._dipolos[fase][par] = [];
        this._dipolos[fase][par].push({ matrices: [matriz], nodo: nodo_primo });

        return nodo_primo;
    }

    // ═══════════════════════════════════════════
    // EMISIÓN
    // ═══════════════════════════════════════════

    /**
     * Emite una señal común hacia una fase destino.
     *
     * La señal emitida siempre tendrá `marcado = false`. Utiliza la fase
     * global actual como fase de origen de la señal.
     *
     * - Si el nodo es un **NodoPrimo**, fue aprendido por aprendizaje trivial
     *   y contiene una señal completa en `'contenido'`. Esa señal se retorna
     *   directamente.
     * - Si el nodo **no es primo** (es un nodo compuesto), se construye una
     *   nueva señal con su {@link NodoNumerico#identidad}, se registra el
     *   dipolo en el par destino y se retorna esa señal. No se modifica el nodo.
     *
     * @param {NodoNumerico} nodo         Nodo a transmitir.
     * @param {string}       fase_destino Fase de destino (formato `dominio:numero`).
     * @returns {?Senal} Señal lista para enviar, o null si el nodo no tiene identidad.
     * @since 1.4.8
     */
    emitir(nodo, fase_destino) {
        const fase = this._fase_actual();
        const par  = fase_destino;

        // Caso 1: NodoPrimo → señal aprendida en recepción
        if (nodo.es_primo()) {
            const senal_guardada = nodo.dato('contenido');
            if (senal_guardada instanceof Senal) {
                return senal_guardada;
            }
            AntenaComun._error('El NodoPrimo no contiene una señal en "contenido".');
            return null;
        }

        // Caso 2: Nodo compuesto (no primo)
        const matriz_identidad = nodo.identidad();
        if (!matriz_identidad) {
            AntenaComun._error('El nodo no tiene identidad matricial.');
            return null;
        }

        // Crear señal (sin guardar en el nodo)
        const senal_nueva = new Senal([matriz_identidad], fase, false);

        // Registrar dipolo para futuras referencias
        if (!this._dipolos[fase]) this._dipolos[fase] = {};
        if (!this._dipolos[fase][par]) this._dipolos[fase][par] = [];
        this._dipolos[fase][par].push({ matrices: [matriz_identidad], nodo });

        return senal_nueva;
    }
}