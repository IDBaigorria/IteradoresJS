import { NodoNumerico } from './NodoNumerico.js';
import { Matriz2x2 } from './Matriz2x2.js';
import { Conf } from '../Configuracion/Configuracion.js';

/**
 * NodoPrimo – Identidad prima canónica e indivisible.
 *
 * Representa la **unidad atómica** del grafo de aprendizaje. Cada NodoPrimo
 * encapsula un número primo y lo expresa matricialmente mediante la forma
 * canónica `[[p, 1], [1, 1]]` (ver {@link Matriz2x2.crear_prima}).
 *
 * Estos nodos constituyen el **alfabeto** de cada fase:
 * - En la fase 0 son los bytes (valores 0‑255).
 * - En fases superiores son conceptos que han ascendido desde una fase
 *   inferior y se representan con un nuevo número primo.
 *
 * ## Responsabilidades principales
 *
 * 1. **Identidad prima inmutable (salvo canvas `b`)**
 *    Las entradas `a`, `c` y `d` de su {@link Matriz2x2} son fijas. Solo la
 *    entrada `b` (canvas de pertenencia) puede modificarse para reflejar
 *    la pertenencia a conjuntos, sin alterar la identidad nuclear del nodo.
 *
 * 2. **Pool de primos libres por fase**
 *    Para optimizar el ascenso de nodos compuestos, la clase mantiene un
 *    conjunto de instancias reutilizables por fase (`_primos_libres_por_fase`).
 *    Los métodos {@link siguiente_primo_libre} y {@link devolver_primo_libre}
 *    gestionan este pool.
 *
 * 3. **Factorización bloqueada en su propia fase**
 *    Un NodoPrimo no puede descomponerse dentro de la misma fase. El método
 *    {@link factorizar} lanza un error. La factorización solo tiene
 *    sentido al descender de fase, donde se recupera la matriz compuesta
 *    original desde el dato `'abajo'`.
 *
 * ## Herencia y polimorfismo
 *
 * Sobrescribe {@link NodoNumerico#es_primo} para devolver `true`. Esto
 * permite consultar la naturaleza atómica de cualquier nodo de la jerarquía
 * sin necesidad de verificar su clase concreta.
 *
 * ## Relación con el canvas de contexto
 *
 * El canvas `b` de su matriz identidad puede ser pintado por {@link NodoConjunto}
 * para indicar pertenencia. A su vez, el NodoPrimo puede pintar a los conjuntos
 * a los que pertenece, creando un **entrelazamiento de conjunto** verificable
 * en O(1) mediante el operador módulo.
 *
 * @class
 * @extends NodoNumerico
 * @version 1.4.3
 * @since 1.4.2
 * @author Ignacio David Baigorria
 * @see Matriz2x2
 * @see NodoConjunto
 */
class NodoPrimo extends NodoNumerico {
    /**
     * Número primo representado por este nodo.
     *
     * @type {number}
     * @protected
     */
    _numero_primo;

    /**
     * Pool de primos libres disponibles para reutilización, indexado por fase.
     *
     * Cada entrada es un array de instancias de NodoPrimo que pueden ser
     * reclamadas mediante {@link siguiente_primo_libre}.
     *
     * @type {Map<string, NodoPrimo[]>}
     * @protected
     */
    static _primos_libres_por_fase = new Map();

    /**
     * Límite máximo de primos libres que se permite generar en cada fase.
     *
     * Se configura con {@link inicializar_fase}. Si no se establece un
     * límite, se asume `Infinity` (sin límite).
     *
     * @type {Map<string, number>}
     * @protected
     */
    static _limites_por_fase = new Map();

    /**
     * Constructor protegido.
     *
     * Inicializa el nodo con el número primo indicado, asigna la matriz
     * canónica correspondiente y marca el nodo como ordenado (aunque un
     * primo no es una secuencia, internamente se trata como componente
     * unitario ordenado).
     *
     * @param {number} numero_primo Número primo a encapsular.
     */
    constructor(numero_primo) {
        super();
        this._numero_primo = numero_primo;
        this._ordenado = true;
        this._identidad(Matriz2x2.crear_prima(numero_primo));
    }

    /**
     * Crea internamente un NodoPrimo **sin añadirlo al pool de libres**.
     *
     * Este método es invocado por {@link NodoNumerico.crear_primo} y por
     * {@link siguiente_primo_libre} cuando el pool está vacío. El nodo
     * creado no se registra automáticamente en el pool; si se desea
     * reciclarlo más tarde, debe llamarse explícitamente a
     * {@link devolver_primo_libre}.
     *
     * @param {number} numero_primo Número primo validado.
     * @param {number} [capacidad=Conf.CAPACIDAD_NODO_ELECTRICO] Capacidad máxima de energía.
     * @param {number} [fuga=Conf.FUGA_NODO_ELECTRICO] Fuga de energía por ciclo.
     * @returns {NodoPrimo}
     * @internal
     */
    static _crear_interno(numero_primo, capacidad = Conf.CAPACIDAD_NODO_ELECTRICO, fuga = Conf.FUGA_NODO_ELECTRICO) {
        const nodo = new NodoPrimo(numero_primo);
        nodo.capacidad = capacidad;
        nodo.fuga = fuga;
        return nodo;
    }

    /**
     * Devuelve el número primo encapsulado por el nodo.
     *
     * @returns {number}
     */
    get numero_primo() { return this._numero_primo; }

    /**
     * Indica que el nodo es un NodoPrimo (identidad atómica).
     *
     * Sobrescribe {@link NodoNumerico#es_primo} para devolver `true`.
     *
     * @returns {boolean}
     */
    es_primo() { return true; }

    /**
     * Intento de factorización bloqueado a nivel de la misma fase.
     *
     * Los NodoPrimo no pueden descomponerse dentro de su propia fase.
     * La factorización solo es posible al descender de fase, donde se
     * utiliza la información almacenada en el dato multidimensional
     * (por ejemplo, `dato('matriz_compuesta', 'abajo')`).
     *
     * @throws {Error} Siempre lanza este error.
     */
    factorizar() {
        throw new Error('Un NodoPrimo no puede factorizarse en su misma fase.');
    }

    // ═══════════════════════════════════════════
    // GESTIÓN DE PRIMOS LIBRES
    // ═══════════════════════════════════════════

    /**
     * Inicializa la reserva de primos libres para una fase determinada.
     *
     * Establece el límite máximo de primos que se pueden generar en esa fase
     * y asegura que el pool exista (aunque esté vacío).
     *
     * @param {string} fase  Nombre de la fase.
     * @param {number} limite Cantidad máxima de primos libres en la fase.
     */
    static inicializar_fase(fase, limite) {
        this._limites_por_fase.set(fase, limite);
        if (!this._primos_libres_por_fase.has(fase)) {
            this._primos_libres_por_fase.set(fase, []);
        }
    }

    /**
     * Devuelve el siguiente NodoPrimo libre en la fase indicada.
     *
     * El algoritmo de selección es:
     * 1. Si hay nodos disponibles en el pool de la fase, extrae y retorna
     *    el primero (FIFO).
     * 2. Si el pool está vacío pero no se ha alcanzado el límite de primos
     *    configurado para la fase, crea un nuevo NodoPrimo usando
     *    {@link NodoNumerico.siguiente_primo_positivo} y lo retorna
     *    **sin añadirlo al pool**.
     * 3. Si se ha alcanzado el límite, retorna `null`.
     *
     * @param {string|null} [fase=null] Fase de trabajo (null = fase actual).
     * @returns {NodoPrimo|null} Un NodoPrimo listo para usar, o null si se
     *                           agotó el límite de primos en la fase.
     */
    static siguiente_primo_libre(fase = null) {
        fase = fase ?? this.fase();

        if (!this._primos_libres_por_fase.has(fase)) {
            this._primos_libres_por_fase.set(fase, []);
        }

        const pool = this._primos_libres_por_fase.get(fase);
        if (pool.length > 0) {
            return pool.shift(); // quitar del pool
        }

        const limite = this._limites_por_fase.get(fase) ?? Infinity;
        if (limite > 0) {
            const primo = NodoNumerico.siguiente_primo_positivo(fase);
            return this._crear_interno(primo); // no se añade al pool
        }

        return null;
    }

    /**
     * Devuelve un NodoPrimo al pool de libres de una fase.
     *
     * Tras invocar este método, el nodo podrá ser reclamado nuevamente por
     * {@link siguiente_primo_libre} en la misma fase. Es útil para reciclar
     * primos que ya no están en uso (por ejemplo, tras descender un nodo
     * compuesto a su fase original).
     *
     * @param {NodoPrimo} nodo Nodo a devolver al pool.
     * @param {string|null} [fase=null] Fase a la que se devuelve (null = fase actual).
     */
    static devolver_primo_libre(nodo, fase = null) {
        fase = fase ?? this.fase();
        if (!this._primos_libres_por_fase.has(fase)) {
            this._primos_libres_por_fase.set(fase, []);
        }
        this._primos_libres_por_fase.get(fase).push(nodo);
    }
}

// Registro en NodoNumerico para evitar dependencia circular
NodoNumerico._subclases.NodoPrimo = NodoPrimo;

export { NodoPrimo };