import { Objeto } from '../Nucleo/Objeto.js';
import { NodoElectrico } from '../Nodos/NodoElectrico.js';
import { Entorno } from '../Configuracion/Entorno.js';
import { SenalAccion } from './SenalAccion.js';

/**
 * Antena de Acción – Propaga verbos de intención entre Iteradores.
 *
 * ## Responsabilidad
 * Gestiona las **señales de acción** ({@link SenalAccion}) a lo largo de
 * todas las fases del sistema. Cada fase tiene una **acción actual**,
 * que es la última señal de acción recibida en esa fase.
 *
 * Es un **singleton multifase**: la instancia única se obtiene con
 * {@link AntenaAccion#antena}.
 *
 * ## Funcionamiento
 * - **Recepción:** guarda la señal como acción actual de la fase y
 *   devuelve el número de verbo. Si el verbo es {@link Conf#VERBO_CIERRE}
 *   (0), solo deja un placeholder para que el futuro Iterador ejecute
 *   las tareas de cierre.
 * - **Emisión:** si se proporciona un verbo, crea una nueva señal, la
 *   almacena como acción actual y la retorna. Si no se proporciona
 *   verbo, retorna la acción actual de la fase (si existe).
 *
 * ## Placeholder para Iterador
 * Los métodos `recibir` y `emitir` contienen marcadores `// TODO: Iterador`
 * donde en el futuro se enganchará la lógica de procesamiento.
 *
 * ## Singleton
 * - {@link AntenaAccion#antena} devuelve la instancia única.
 * - {@link AntenaAccion#reiniciar} la destruye (solo en entorno de pruebas).
 *
 * @author Ignacio David Baigorria
 *
 * @class AntenaAccion
 * @extends Objeto
 * @since 1.4.9
 * @version 1.4.9
 * @see SenalAccion
 * @see Conf
 */
export class AntenaAccion extends Objeto {
    /** @type {AntenaAccion|null} */
    static _instancia = null;

    /**
     * Acción actual por fase.
     *
     * Estructura: `{ 'Talamo:0': SenalAccion, ... }`
     *
     * @type {Object<string, SenalAccion>}
     * @private
     */
    _accion_actual = {};

    constructor() {
        super();
    }

    /**
     * Devuelve la instancia única de la Antena de Acción.
     *
     * @returns {AntenaAccion}
     * @static
     * @since 1.4.9
     */
    static antena() {
        if (!AntenaAccion._instancia) {
            AntenaAccion._instancia = new AntenaAccion();
        }
        return AntenaAccion._instancia;
    }

    /**
     * Destruye la instancia actual (solo en entorno de pruebas).
     *
     * @returns {void}
     * @static
     * @since 1.4.9
     */
    static reiniciar() {
        if (!Entorno.permite_pruebas()) {
            AntenaAccion._error(
                'AntenaAccion.reiniciar() solo está disponible en entorno de pruebas.'
            );
            return;
        }
        AntenaAccion._instancia = null;
    }

    /**
     * Devuelve la fase global actual.
     *
     * @returns {string}
     * @private
     * @since 1.4.9
     */
    _fase_actual() {
        return NodoElectrico.fase();
    }

    // ═══════════════════════════════════════════
    // RECEPCIÓN
    // ═══════════════════════════════════════════

    /**
     * Recibe una señal de acción y actualiza la acción actual de la fase.
     *
     * Guarda la señal en {@link _accion_actual} para la fase actual y
     * devuelve el verbo. Si el verbo es `0` (cierre), se deja un
     * placeholder para que el futuro Iterador ejecute las tareas de cierre.
     *
     * @param {SenalAccion} senal Señal de acción recibida.
     * @returns {number} Verbo recibido (constante definida en {@link Conf}).
     * @since 1.4.9
     */
    recibir(senal) {
        const fase = this._fase_actual();
        this._accion_actual[fase] = senal;

        const verbo = senal.verbo();

        // TODO: Iterador – cuando el verbo es 0 (cierre), ejecutar tareas de finalización.

        return verbo;
    }

    // ═══════════════════════════════════════════
    // EMISIÓN
    // ═══════════════════════════════════════════

    /**
     * Emite una señal de acción.
     *
     * - Si se proporciona un verbo, crea una nueva {@link SenalAccion}, la
     *   almacena como acción actual de la fase y la retorna.
     * - Si no se proporciona verbo, retorna la acción actual de la fase
     *   (si existe), o `null` si no hay acción registrada.
     *
     * @param {number|null} [verbo=null] Verbo a emitir (constante definida en {@link Conf}), o null para obtener la acción actual.
     * @returns {?SenalAccion} Señal de acción emitida, o null si no hay acción actual.
     * @since 1.4.9
     */
    emitir(verbo = null) {
        const fase = this._fase_actual();

        if (verbo !== null) {
            const senal = new SenalAccion(verbo, fase);
            this._accion_actual[fase] = senal;

            // TODO: Iterador – aquí se podría notificar que se ha emitido una acción.

            return senal;
        }

        return this._accion_actual[fase] ?? null;
    }
}