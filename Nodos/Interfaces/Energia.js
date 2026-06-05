/**
 * @file Interfaz Energía
 * @version 1.3.0
 * @author Ignacio David Baigorria
 * @see {@link https://github.com/tu-repo/iteradores|Repositorio del proyecto}
 */

/**
 * Interfaz Energía
 *
 * Define el contrato para nodos que manejan energía, con capacidad, fuga,
 * callbacks de saturación y agotamiento (por fase y global), y gestión de tiempo real.
 *
 * Los callbacks reciben siempre como primer argumento la instancia del nodo.
 *
 * @interface
 * @since V1.3.0
 * @memberof Nodos.Interfaces
 */
class Energia {
    // ================== GETTERS BÁSICOS ==================

    /**
     * Devuelve la capacidad máxima del nodo (unidades de energía).
     *
     * Este valor se establece en la creación del nodo (a través de los métodos de fábrica)
     * y no puede modificarse durante la vida del nodo.
     *
     * @returns {number} Capacidad máxima (unidades de energía).
     *
     * @example
     * const nodo = NodoElectrico.crear(1000, 0.5);
     * console.log(nodo.capacidad()); // 1000
     */
    capacidad() {
        throw new Error("Método capacidad() debe ser implementado por la clase que herede.");
    }

    /**
     * Devuelve la fuga del nodo (unidades por ciclo de tiempo).
     *
     * Representa la cantidad de energía que el nodo pierde espontáneamente
     * en cada ciclo de simulación (definido por `Conf.TIEMPO_CICLO`).
     *
     * @returns {number} Fuga por ciclo.
     *
     * @example
     * const nodo = NodoElectrico.crear(1000, 0.5);
     * console.log(nodo.fuga()); // 0.5
     */
    fuga() {
        throw new Error("Método fuga() debe ser implementado por la clase que herede.");
    }

    /**
     * Devuelve la energía actual del nodo en la **fase activa**,
     * aplicando previamente todas las fugas pendientes según el tiempo real transcurrido.
     *
     * @returns {number} Energía actual (0 <= valor <= capacidad).
     *
     * @example
     * // Después de agregar energía y esperar un tiempo
     * console.log(nodo.energia());
     */
    energia() {
        throw new Error("Método energia() debe ser implementado por la clase que herede.");
    }

    // ================== MÉTODOS DE ENERGÍA ==================

    /**
     * Añade energía al nodo en la fase activa.
     *
     * **Secuencia de operaciones:**
     * 1. Aplica las fugas pendientes (llamando internamente a `fugar()`).
     * 2. Incrementa la energía de la fase actual con `cantidad_energia`.
     * 3. Si supera la capacidad, la ajusta y ejecuta el callback de saturación
     *    (según la configuración de reemplazo/complemento).
     * 4. Si queda en cero (o se vuelve cero), ejecuta el callback de agotamiento.
     *
     * @param {number} cantidad_energia - Cantidad de energía a sumar (puede ser negativa, pero se recomienda usar los mecanismos de fuga para decrementar).
     * @returns {void}
     *
     * @example
     * const nodo = NodoElectrico.crear(100, 0);
     * nodo._energia(50);   // energía = 50
     * nodo._energia(60);   // energía = 100 (se satura, dispara callback)
     */
    _energia(cantidad_energia) {
        throw new Error("Método _energia() debe ser implementado por la clase que herede.");
    }

    // ================== CALLBACKS POR INSTANCIA ==================

    /**
     * Registra un callback para cuando el nodo se satura (por instancia).
     *
     * **Modos de ejecución:**
     * - `reemplazar = true` (por defecto): este callback **reemplaza** al callback por defecto de la fase.
     *   Solo se ejecutará este, a menos que sea null, en cuyo caso se ejecuta el de fase.
     * - `reemplazar = false`: este callback **complementa** al de fase. Se ejecutan ambos,
     *   primero el de instancia y luego el de fase (si existe).
     *
     * @param {Function} funcion - Callback que recibirá el nodo como único argumento.
     * @param {boolean} [reemplazar=true] - Si `true`, reemplaza el callback por defecto de la fase;
     *                                      si `false`, lo complementa.
     * @returns {void}
     *
     * @example
     * // Reemplazar el callback de fase
     * nodo._ejecutar_cuando_satura((n) => console.log("Saturación propia"));
     *
     * // Complementar (ejecutar ambos)
     * nodo._ejecutar_cuando_satura((n) => console.log("Adicional"), false);
     */
    _ejecutar_cuando_satura(funcion, reemplazar = true) {
        throw new Error("Método _ejecutar_cuando_satura debe ser implementado por la clase que herede.");
    }

    /**
     * Devuelve el callback de saturación registrado para la instancia (fase actual)
     * junto con el indicador de si reemplaza o complementa.
     *
     * @returns {{ callback: Function|null, reemplazar: boolean }}
     *
     * @example
     * const { callback, reemplazar } = nodo.ejecutar_cuando_satura();
     * if (callback) {
     *     console.log(`Callback registrado, modo: ${reemplazar ? "reemplazar" : "complementar"}`);
     * }
     */
    ejecutar_cuando_satura() {
        throw new Error("Método ejecutar_cuando_satura debe ser implementado por la clase que herede.");
    }

    /**
     * Registra un callback para cuando el nodo se agota (energía llega a 0) por instancia.
     *
     * **Modos de ejecución:**
     * - `reemplazar = true`: reemplaza al callback por defecto de la fase.
     * - `reemplazar = false`: complementa (se ejecutan ambos, primero este).
     *
     * @param {Function} funcion - Callback que recibirá el nodo como único argumento.
     * @param {boolean} [reemplazar=true] - Si `true`, reemplaza; si `false`, complementa.
     * @returns {void}
     *
     * @example
     * nodo._ejecutar_cuando_agota((n) => console.log("Sin energía"), false);
     */
    _ejecutar_cuando_agota(funcion, reemplazar = true) {
        throw new Error("Método _ejecutar_cuando_agota debe ser implementado por la clase que herede.");
    }

    /**
     * Devuelve el callback de agotamiento de la instancia (fase actual) y el modo.
     *
     * @returns {{ callback: Function|null, reemplazar: boolean }}
     */
    ejecutar_cuando_agota() {
        throw new Error("Método ejecutar_cuando_agota debe ser implementado por la clase que herede.");
    }

    // ================== CALLBACKS POR FASE (ESTÁTICOS) ==================

    /**
     * Registra un callback por defecto para saturación en una fase determinada.
     *
     * Este callback se ejecutará cuando un nodo en esa fase se sature,
     * **siempre que no exista un callback de instancia que lo reemplace**.
     *
     * @param {Function} funcion - Callback que recibirá el nodo como argumento.
     * @param {string|null} [fase=null] - Nombre de la fase. Si es `null`, se usa la fase actual del sistema.
     * @returns {void}
     *
     * @example
     * // Callback para la fase actual
     * NodoElectrico._ejecutar_cuando_satura_por_fase((n) => console.log("Saturación por fase"));
     *
     * // Callback para una fase específica
     * NodoElectrico._ejecutar_cuando_satura_por_fase((n) => console.log("Fase beta"), "beta");
     */
    static _ejecutar_cuando_satura_por_fase(funcion, fase = null) {
        throw new Error("Método estático _ejecutar_cuando_satura_por_fase debe ser implementado por la clase que herede.");
    }

    /**
     * Obtiene el callback por defecto de saturación registrado para una fase.
     *
     * @param {string|null} [fase=null] - Nombre de la fase. Si es `null`, se usa la fase actual.
     * @returns {Function|null} El callback, o `null` si no hay ninguno registrado.
     */
    static ejecutar_cuando_satura_por_fase(fase = null) {
        throw new Error("Método estático ejecutar_cuando_satura_por_fase debe ser implementado por la clase que herede.");
    }

    /**
     * Registra un callback por defecto para agotamiento en una fase determinada.
     *
     * @param {Function} funcion - Callback que recibirá el nodo como argumento.
     * @param {string|null} [fase=null] - Nombre de la fase. Si es `null`, se usa la fase actual.
     * @returns {void}
     */
    static _ejecutar_cuando_agota_por_fase(funcion, fase = null) {
        throw new Error("Método estático _ejecutar_cuando_agota_por_fase debe ser implementado por la clase que herede.");
    }

    /**
     * Obtiene el callback por defecto de agotamiento registrado para una fase.
     *
     * @param {string|null} [fase=null] - Nombre de la fase. Si es `null`, se usa la fase actual.
     * @returns {Function|null}
     */
    static ejecutar_cuando_agota_por_fase(fase = null) {
        throw new Error("Método estático ejecutar_cuando_agota_por_fase debe ser implementado por la clase que herede.");
    }

    // ================== CALLBACK GLOBAL (TODAS LAS FASES) ==================

    /**
     * Registra un callback global que se ejecutará cuando **todas las fases**
     * del nodo se queden sin energía (energía = 0).
     *
     * Este callback es útil para detectar que el nodo ha quedado completamente inactivo.
     *
     * @param {Function} funcion - Callback que recibirá el nodo como argumento.
     * @returns {void}
     *
     * @example
     * NodoElectrico._ejecutar_cuando_agota_global((nodo) => {
     *     console.log(`El nodo ${nodo.id()} ya no tiene energía en ninguna fase`);
     * });
     */
    static _ejecutar_cuando_agota_global(funcion) {
        throw new Error("Método estático _ejecutar_cuando_agota_global debe ser implementado por la clase que herede.");
    }

    /**
     * Obtiene el callback global de agotamiento (si está registrado).
     *
     * @returns {Function|null}
     */
    static ejecutar_cuando_agota_global() {
        throw new Error("Método estático ejecutar_cuando_agota_global debe ser implementado por la clase que herede.");
    }
}

export {Energia}