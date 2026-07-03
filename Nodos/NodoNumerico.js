import { NodoElectrico } from './NodoElectrico.js';
import { Matriz2x2 } from './Matriz2x2.js';
import { Conf } from '../Configuracion/Configuracion.js';
import { Entorno } from '../Configuracion/Entorno.js';

/**
 * NodoNumerico – Orquestador central de identidades numéricas.
 *
 * Clase base de la que heredan {@link NodoPrimo}, {@link NodoParalelo} y
 * {@link NodoConjunto}. Actúa como **punto de creación y reciclaje** de
 * todos los nodos con identidad matricial dentro del framework.
 *
 * ## Responsabilidades principales
 *
 * 1. **Identidad multifase**
 *    Cada instancia mantiene un mapa `_identidad_por_fase` que asocia una
 *    {@link Matriz2x2} distinta a cada fase de trabajo. Esto permite que un
 *    mismo nodo represente una secuencia en la fase `a`, un conjunto en la
 *    fase `b` y un primo en la fase `c`, sin que las mutaciones del canvas
 *    `b` en una fase interfieran en las demás.
 *
 * 2. **Caché global de primos**
 *    La lista estática `_primos_conocidos` crece con cada nuevo primo
 *    descubierto, compartida por todas las fases. Métodos como
 *    {@link es_numero_primo} y {@link siguiente_numero_primo} la consultan
 *    y expanden, evitando recalcular primalidad para números ya conocidos.
 *
 * 3. **Contadores multifase de primos**
 *    Dos mapas `_ultimo_primo_positivo_por_fase` y
 *    `_ultimo_primo_negativo_por_fase` guardan el último primo asignado en
 *    cada fase para los espectros positivo (nodos primos) y negativo
 *    (conjuntos). Así cada fase posee su propio espacio de identidades
 *    independiente, esencial para el ascenso/descenso jerárquico.
 *
 * 4. **Pool de nodos libres**
 *    Para evitar la creación innecesaria de instancias, la clase mantiene
 *    un conjunto de nodos reutilizables por fase (`_nodos_libres_por_fase`).
 *    Las fábricas obtienen nodos mediante `_tomar_nodo_libre()` y los
 *    devuelven con `_devolver_nodo_libre()` una vez que dejan de usarse
 *    (por ejemplo, tras ascender a otra fase).
 *
 * 5. **Registro de subclases**
 *    Para evitar dependencias circulares entre módulos, las subclases se
 *    registran en el objeto estático `_subclases`. Las fábricas invocan
 *    a las subclases a través de este registro en lugar de importarlas
 *    directamente.
 *
 * ## Entrelazamiento de conjunto (pintura)
 *
 * La entrada `b` de la {@link Matriz2x2} actúa como **canvas de
 * pertenencia**. Cuando un {@link NodoConjunto} agrega un miembro, ambos
 * se «pintan» mutuamente: el miembro multiplica su `b` por el primo de
 * contexto del conjunto, y el conjunto multiplica su `b` por el número
 * primo del miembro. La verificación de pertenencia es O(1) mediante el
 * operador módulo, sin necesidad de índices externos.
 *
 * @class
 * @extends NodoElectrico
 * @version 1.4.3
 * @since 1.4.2
 * @author Ignacio David Baigorria
 * @see Matriz2x2
 * @see NodoPrimo
 * @see NodoParalelo
 * @see NodoConjunto
 */
class NodoNumerico extends NodoElectrico {
    /**
     * Indica si el nodo representa una secuencia ordenada.
     *
     * - `true`  → secuencia (producto no conmutativo de factores).
     * - `false` → conjunto o paralelo (producto conmutativo con marca).
     *
     * @type {boolean}
     * @protected
     */
    _ordenado;

    /**
     * Identidad matricial del nodo, indexada por fase.
     *
     * Estructura:
     * ```
     * Map {
     *   'fase_a' => Matriz2x2,
     *   'fase_b' => Matriz2x2,
     *   ...
     * }
     * ```
     *
     * @type {Map<string, Matriz2x2>}
     * @protected
     * @see Matriz2x2
     */
    _identidad_por_fase = new Map();

    /**
     * Registro de subclases para evitar dependencias circulares.
     *
     * Cada subclase se registra a sí misma al final de su archivo:
     * ```
     * NodoNumerico._subclases.NodoPrimo = NodoPrimo;
     * ```
     *
     * @type {Object}
     */
    static _subclases = {};

    // ═══════════════════════════════════════════
    // CACHÉ DE PRIMOS (GLOBAL)
    // ═══════════════════════════════════════════

    /**
     * Caché global de números primos conocidos.
     *
     * Se inicializa con `[2, 3]` y crece bajo demanda. Compartida por
     * todas las fases.
     *
     * @type {number[]}
     * @protected
     */
    static _primos_conocidos = [2, 3];

    /**
     * Último número primo positivo asignado en cada fase.
     *
     * Usado por {@link siguiente_primo_positivo} para generar primos
     * únicos en el espectro positivo (nodos primos).
     *
     * @type {Map<string, number>}
     * @protected
     */
    static _ultimo_primo_positivo_por_fase = new Map();

    /**
     * Último número primo (positivo) usado para crear identidades
     * negativas de conjuntos en cada fase.
     *
     * Usado por {@link siguiente_primo_negativo} para generar primos
     * únicos en el espectro negativo (conjuntos).
     *
     * @type {Map<string, number>}
     * @protected
     */
    static _ultimo_primo_negativo_por_fase = new Map();

    // ═══════════════════════════════════════════
    // POOL DE NODOS LIBRES
    // ═══════════════════════════════════════════

    /**
     * Nodos libres disponibles para reutilización, agrupados por fase.
     *
     * Cada entrada contiene un array de instancias de {@link NodoNumerico}
     * (o subclases) que pueden ser reasignadas en esa fase.
     *
     * @type {Map<string, NodoNumerico[]>}
     * @protected
     */
    static _nodos_libres_por_fase = new Map();

    /**
     * Constructor protegido.
     *
     * Inicializa la identidad de la fase actual con
     * {@link Matriz2x2.inicial} y enlaza la matriz al nodo para
     * sincronización directa.
     */
    constructor() {
        super();
        this._identidad_por_fase.set(this.constructor.fase(), Matriz2x2.inicial());
        this._identidad_por_fase.get(this.constructor.fase())._nodo(this);
    }

    /**
     * Indica si el nodo representa una secuencia ordenada.
     *
     * @returns {boolean}
     */
    get ordenado() { return this._ordenado; }

    // _ordenado(val) eliminado – la asignación directa a la propiedad
    // es válida y se usa en las subclases.

    /**
     * Obtiene la identidad matricial del nodo en la fase indicada.
     *
     * Si no existe una matriz para la fase solicitada, devuelve
     * {@link Matriz2x2.inicial} (matriz semilla `[[1,1],[1,2]]`).
     *
     * @param {string|null} [fase=null] Fase de trabajo (null = fase actual).
     * @returns {Matriz2x2}
     */
    identidad(fase = null) {
        fase = fase ?? this.constructor.fase();
        return this._identidad_por_fase.get(fase) ?? Matriz2x2.inicial();
    }

    /**
     * Asigna la identidad matricial del nodo en la fase indicada.
     *
     * Solo se permite en entorno de pruebas (ver
     * {@link Entorno.permite_pruebas}). Además de almacenar la matriz,
     * establece la referencia inversa con {@link Matriz2x2._nodo} para
     * sincronización directa.
     *
     * @param {Matriz2x2} matriz
     * @param {string|null} [fase=null]
     */
    _identidad(matriz, fase = null) {
        if (!Entorno.permite_pruebas()) {
            this.constructor._alerta('_identidad() solo disponible en entorno de pruebas.');
            return;
        }
        fase = fase ?? this.constructor.fase();
        this._identidad_por_fase.set(fase, matriz);
        matriz._nodo(this);
    }

    /**
     * Indica si el nodo es un {@link NodoPrimo} (identidad atómica).
     *
     * Por defecto retorna `false`. La subclase {@link NodoPrimo}
     * sobrescribe este método para devolver `true`.
     *
     * @returns {boolean}
     */
    es_primo() { return false; }

    // ═══════════════════════════════════════════
    // PRIMALIDAD (CACHÉ GLOBAL)
    // ═══════════════════════════════════════════

    /**
     * Verifica si un número entero es primo.
     *
     * Utiliza la caché global {@link _primos_conocidos}. Si el número
     * no está en la caché, se expande generando primos consecutivos
     * hasta alcanzarlo o descartarlo.
     *
     * @param {number} numero Número a evaluar.
     * @returns {boolean} `true` si es primo, `false` en caso contrario.
     * @see siguiente_numero_primo
     */
    static es_numero_primo(numero) {
        if (numero < 2) return false;
        if (this._primos_conocidos.includes(numero)) return true;
        let max = this._primos_conocidos[this._primos_conocidos.length - 1];
        while (max < numero) {
            max = this._calcular_siguiente_primo(max);
            this._primos_conocidos.push(max);
            if (max === numero) return true;
        }
        return false;
    }

    /**
     * Devuelve el menor número primo estrictamente mayor que `n`.
     *
     * Utiliza y expande la caché global si es necesario.
     *
     * @param {number} n Valor de partida.
     * @returns {number} Siguiente número primo.
     */
    static siguiente_numero_primo(n) {
        for (const p of this._primos_conocidos) {
            if (p > n) return p;
        }
        let candidato = this._primos_conocidos[this._primos_conocidos.length - 1];
        while (candidato <= n) {
            candidato = this._calcular_siguiente_primo(candidato);
            this._primos_conocidos.push(candidato);
        }
        return candidato;
    }

    /**
     * Calcula el primo inmediatamente superior a `n` sin utilizar caché.
     *
     * @param {number} n
     * @returns {number}
     * @private
     */
    static _calcular_siguiente_primo(n) {
        let candidato = n + 1;
        while (true) {
            if (this._es_primo_simple(candidato)) return candidato;
            candidato++;
        }
    }

    /**
     * Test de primalidad simple (sin caché), para uso interno.
     *
     * @param {number} num Número a evaluar.
     * @returns {boolean}
     * @private
     */
    static _es_primo_simple(num) {
        if (num < 2) return false;
        if (num === 2) return true;
        if (num % 2 === 0) return false;
        const lim = Math.sqrt(num);
        for (let i = 3; i <= lim; i += 2) {
            if (num % i === 0) return false;
        }
        return true;
    }

    // ═══════════════════════════════════════════
    // CONTADORES MULTIFASE
    // ═══════════════════════════════════════════

    /**
     * Devuelve el siguiente número primo disponible para **nodos primos**
     * (espectro positivo) en la fase indicada.
     *
     * Avanza el contador correspondiente y actualiza la caché.
     *
     * @param {string|null} [fase=null] Fase de trabajo (null = fase actual).
     * @returns {number} Nuevo número primo.
     * @see NodoPrimo
     */
    static siguiente_primo_positivo(fase = null) {
        fase = fase ?? this.fase();
        const ultimo = this._ultimo_primo_positivo_por_fase.get(fase) ?? 2;
        const nuevo = this.siguiente_numero_primo(ultimo);
        this._ultimo_primo_positivo_por_fase.set(fase, nuevo);
        return nuevo;
    }

    /**
     * Devuelve el siguiente número primo (positivo) para crear identidades
     * negativas de **conjuntos** en la fase indicada.
     *
     * @param {string|null} [fase=null]
     * @returns {number} Nuevo número primo (positivo) para un conjunto negativo.
     * @see NodoConjunto
     */
    static siguiente_primo_negativo(fase = null) {
        fase = fase ?? this.fase();
        const ultimo = this._ultimo_primo_negativo_por_fase.get(fase) ?? 2;
        const nuevo = this.siguiente_numero_primo(ultimo);
        this._ultimo_primo_negativo_por_fase.set(fase, nuevo);
        return nuevo;
    }

    // ═══════════════════════════════════════════
    // POOL DE NODOS LIBRES
    // ═══════════════════════════════════════════

    /**
     * Toma un nodo libre del pool para la fase indicada.
     *
     * Si el pool está vacío, crea una nueva instancia llamando a
     * {@link NodoElectrico.crear}. Al tomar un nodo del pool, se
     * limpia su identidad anterior en esa fase por seguridad.
     *
     * @param {string|null} [fase=null]
     * @returns {NodoNumerico} Nodo reutilizado o recién creado.
     */
    static _tomar_nodo_libre(fase = null) {
        fase = fase ?? this.fase();
        if (!this._nodos_libres_por_fase.has(fase)) {
            this._nodos_libres_por_fase.set(fase, []);
        }
        const pool = this._nodos_libres_por_fase.get(fase);
        if (pool.length > 0) {
            const nodo = pool.shift();
            nodo._identidad_por_fase.delete(fase); // limpiar identidad anterior
            return nodo;
        }
        return super.crear();
    }

    /**
     * Devuelve un nodo al pool de libres de la fase para su futura
     * reutilización.
     *
     * @param {NodoNumerico} nodo
     * @param {string|null} [fase=null]
     */
    static _devolver_nodo_libre(nodo, fase = null) {
        fase = fase ?? this.fase();
        if (!this._nodos_libres_por_fase.has(fase)) {
            this._nodos_libres_por_fase.set(fase, []);
        }
        this._nodos_libres_por_fase.get(fase).push(nodo);
    }

    // ═══════════════════════════════════════════
    // FÁBRICAS (usan registro _subclases)
    // ═══════════════════════════════════════════

    /**
     * Crea un nodo numérico compuesto (secuencia ordenada de p‑grama).
     *
     * La cantidad de componentes debe ser un número primo. La identidad
     * resultante es el **producto matricial no conmutativo** de las
     * identidades de los componentes en el orden proporcionado.
     *
     * Se toma un nodo del pool (o se crea uno nuevo) y se le enlazan los
     * componentes mediante adyacentes `factor_1`, `factor_2`, etc.
     *
     * @param {NodoNumerico[]} componentes Componentes de la secuencia (cantidad prima).
     * @param {number} [capacidad=Conf.CAPACIDAD_NODO_ELECTRICO] Capacidad máxima de energía.
     * @param {number} [fuga=Conf.FUGA_NODO_ELECTRICO] Fuga de energía por ciclo.
     * @returns {NodoNumerico|null} El nuevo nodo, o `null` si la cantidad no es prima.
     * @see NodoParalelo
     */
    static crear_numerico(componentes, capacidad = Conf.CAPACIDAD_NODO_ELECTRICO, fuga = Conf.FUGA_NODO_ELECTRICO) {
        const cantidad = componentes.length;
        if (!this.es_numero_primo(cantidad)) {
            this._error('La cantidad de componentes debe ser un número primo.');
            return null;
        }

        let matriz = componentes[0].identidad();
        for (let i = 1; i < cantidad; i++) {
            matriz = matriz.multiplicar(componentes[i].identidad());
        }

        const nodo = this._tomar_nodo_libre();
        nodo._identidad(matriz);
        nodo._ordenado=true;
        nodo.capacidad = capacidad;
        nodo.fuga = fuga;

        for (let i = 0; i < cantidad; i++) {
            nodo._adyacente_en(componentes[i], 'factor_' + (i + 1), true);
        }

        return nodo;
    }

    /**
     * Crea un nodo primo con el número primo indicado.
     *
     * @param {number} primo Número primo.
     * @param {number} [capacidad=Conf.CAPACIDAD_NODO_ELECTRICO] Capacidad máxima de energía.
     * @param {number} [fuga=Conf.FUGA_NODO_ELECTRICO] Fuga de energía por ciclo.
     * @returns {NodoPrimo|null} El NodoPrimo creado, o `null` si el número no es primo.
     * @see NodoPrimo
     */
    static crear_primo(primo, capacidad = Conf.CAPACIDAD_NODO_ELECTRICO, fuga = Conf.FUGA_NODO_ELECTRICO) {
        if (!this.es_numero_primo(primo)) {
            this._error(`El número ${primo} no es primo.`);
            return null;
        }
        return this._subclases.NodoPrimo._crear_interno(primo, capacidad, fuga);
    }

    /**
     * Crea un nodo de sincronización (paralelo) con los componentes dados.
     *
     * La cantidad de componentes debe ser un número primo. La identidad
     * es el producto conmutativo (orden canónico) antecedido por la
     * marca de sincronización {@link Conf.MATRIZ_MARCA_CONJUNTO}.
     *
     * @param {NodoNumerico[]} componentes Componentes (cantidad prima).
     * @param {number} [capacidad=Conf.CAPACIDAD_NODO_ELECTRICO]
     * @param {number} [fuga=Conf.FUGA_NODO_ELECTRICO]
     * @returns {NodoParalelo|null}
     * @see NodoParalelo
     */
    static crear_paralelo(componentes, capacidad = Conf.CAPACIDAD_NODO_ELECTRICO, fuga = Conf.FUGA_NODO_ELECTRICO) {
        return this._subclases.NodoParalelo._crear_interno(componentes, capacidad, fuga);
    }

    /**
     * Crea un nuevo concepto semántico (conjunto) vacío.
     *
     * El conjunto nace sin miembros; se irá poblando mediante pintura
     * a través de {@link NodoConjunto#agregar_miembro}.
     *
     * @param {number} [capacidad=Conf.CAPACIDAD_NODO_ELECTRICO] Capacidad máxima de energía.
     * @param {number} [fuga=Conf.FUGA_NODO_ELECTRICO] Fuga de energía por ciclo.
     * @returns {NodoConjunto}
     * @see NodoConjunto
     */
    static crear_conjunto(capacidad = Conf.CAPACIDAD_NODO_ELECTRICO, fuga = Conf.FUGA_NODO_ELECTRICO) {
        return this._subclases.NodoConjunto._crear_interno(capacidad, fuga);
    }
}

export { NodoNumerico };