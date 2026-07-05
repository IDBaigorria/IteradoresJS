import { NodoElectrico } from './NodoElectrico.js';
import { Matriz2x2 } from './Matriz2x2.js';
import { Conf } from '../Configuracion/Configuracion.js';
import { Entorno } from '../Configuracion/Entorno.js';

import { mezclar_clase_con_interfaces } from "../miscelaneas/mixin.js";

import { FabricaDeNodosNumericos, IdentidadNumerica} from "./Interfaces/index.js";


/**
 * NodoNumerico – Orquestador central de identidades numéricas.
 *
 * Clase base de la que heredan {@link NodoPrimo} y {@link NodoParalelo}.
 * Actúa como **punto de creación y reciclaje** de todos los nodos con
 * identidad matricial, y gestiona el ascenso y descenso entre fases.
 *
 * ## Responsabilidades principales
 *
 * 1. **Identidad única e inmutable**
 *    Cada instancia posee una {@link Matriz2x2} que la identifica de forma
 *    unívoca. Esta matriz se asigna en la creación y **no depende de la fase**.
 *
 * 2. **P‑grama único**
 *    El array `__pgrama` almacena la lista exacta de factores que componen
 *    el nodo. Es la **única fuente de verdad** sobre la identidad compuesta.
 *    Las marcas especiales al inicio del array indican el tipo:
 *    - `1`: paralelo (sincronización de componentes simultáneos).
 *    - `-1`: secuencia de deshacer (todos los factores son comandos destructivos).
 *    - Sin marca: secuencia de hacer (comandos constructivos).
 *
 * 3. **Caché global de primos**
 *    La lista estática `_primos_conocidos` crece con cada nuevo primo
 *    descubierto, compartida por todas las fases. Métodos como
 *    {@link es_numero_primo} y {@link siguiente_numero_primo} la consultan
 *    y expanden, evitando recalcular primalidad para números ya conocidos.
 *
 * 4. **Contador multifase de primos**
 *    El mapa `_ultimo_primo_positivo_por_fase` guarda el último primo asignado
 *    en cada fase para los comandos constructivos (positivos) y destructivos
 *    (negativos). Así cada fase posee su propio espacio de identidades
 *    independiente.
 *
 * 5. **Pool de nodos libres**
 *    Para evitar la creación innecesaria de instancias, la clase mantiene
 *    un conjunto de nodos reutilizables por fase (`_nodos_libres_por_fase`).
 *    Las fábricas obtienen nodos mediante {@link _tomar_nodo_libre} y los
 *    devuelven con {@link _devolver_nodo_libre} una vez que dejan de usarse
 *    (por ejemplo, tras ascender a otra fase).
 *
 * 6. **Registro de subclases**
 *    Para evitar dependencias circulares entre módulos, las subclases se
 *    registran en el objeto estático `_subclases`. Las fábricas invocan
 *    a las subclases a través de este registro en lugar de importarlas
 *    directamente.
 *
 * 7. **Ascenso y descenso entre fases**
 *    El método {@link ascender} promociona un nodo compuesto a la fase superior,
 *    guardando su p‑grama y el nombre de la fase actual en un {@link NodoPrimo}
 *    libre. No libera el nodo actual. El método estático {@link descender}
 *    reconstruye el nodo compuesto en la fase original a partir del p‑grama
 *    guardado. Las marcas `1` y `-1` determinan el tipo de composición.
 *
 * ## Identidad matricial inmutable
 *
 * A partir de la versión 1.4.5, la {@link Matriz2x2} es completamente inmutable
 * (`b = 0` fijo) y **única por nodo**. Ya no se mantienen identidades distintas
 * por fase.
 *
 * @class
 * @extends NodoElectrico
 * @implements {Nodos.Interfaces.IdentidadNumerica}
 * @implements {Nodos.Interfaces.FabricaDeNodosNumericos}
 * @version 1.4.5
 * @since 1.4.2
 * @author Ignacio David Baigorria
 * @see Matriz2x2
 * @see NodoPrimo
 * @see NodoParalelo
 */
class NodoNumerico extends  mezclar_clase_con_interfaces(NodoElectrico, IdentidadNumerica, FabricaDeNodosNumericos ) {
    /**
     * Identidad matricial del nodo (única).
     *
     * @type {Matriz2x2}
     * @protected
     * @see Matriz2x2
     */
    _identidad_matricial;

    /**
     * P‑grama de factores (único).
     *
     * Almacena la lista exacta de identificadores primos que componen el nodo.
     * La presencia de un `1` al inicio indica un paralelo;
     * en caso contrario, se trata de una secuencia ordenada.
     *
     * - **Secuencia:** `[p₁, p₂, …, pₚ]`
     * - **Paralelo:** `[1, p₁, p₂, …, pₚ]` (primos en orden canónico)
     *
     * @type {number[]}
     * @protected
     */
    __pgrama;

    /**
     * Registro de subclases para evitar dependencias circulares.
     *
     * Cada subclase se registra a sí misma al final de su archivo:
     * ```
     * NodoNumerico._subclases.NodoPrimo = NodoPrimo;
     * NodoNumerico._subclases.NodoParalelo = NodoParalelo;
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
     * todas las fases. Los métodos {@link es_numero_primo} y
     * {@link siguiente_numero_primo} la consultan y expanden.
     *
     * @type {number[]}
     * @protected
     */
    static _primos_conocidos = [2, 3];

    /**
     * Último número primo asignado en cada fase.
     *
     * Usado por {@link siguiente_primo_positivo} para generar primos únicos,
     * tanto para comandos constructivos (positivos) como destructivos (negativos).
     *
     * @type {Map<string, number>}
     * @protected
     */
    static _ultimo_primo_positivo_por_fase = new Map();

    // ═══════════════════════════════════════════
    // POOL DE NODOS LIBRES
    // ═══════════════════════════════════════════

    /**
     * Nodos libres disponibles para reutilización, agrupados por fase.
     *
     * Cada entrada contiene un array de instancias de {@link NodoNumerico}
     * (o subclases) que pueden ser reasignadas en esa fase. Las fábricas
     * obtienen nodos mediante {@link _tomar_nodo_libre} y los devuelven
     * con {@link _devolver_nodo_libre}.
     *
     * @type {Map<string, NodoNumerico[]>}
     * @protected
     */
    static _nodos_libres_por_fase = new Map();

    /**
     * Constructor protegido.
     *
     * Inicializa la identidad con {@link Matriz2x2.inicial} y el p‑grama
     * como array vacío. Enlaza la matriz al nodo para sincronización directa.
     */
    constructor() {
        super();
        this._identidad_matricial = Matriz2x2.inicial();
        this._identidad_matricial._nodo(this);
        this.__pgrama = [];
    }

    // ═══════════════════════════════════════════
    // IDENTIDAD ÚNICA
    // ═══════════════════════════════════════════

    /**
     * Obtiene la identidad matricial del nodo.
     *
     * @returns {Matriz2x2}
     */
    identidad() {
        return this._identidad_matricial;
    }

    /**
     * Asigna la identidad matricial del nodo.
     *
     * Solo se permite en entorno de pruebas (ver {@link Entorno.permite_pruebas}).
     * Además de almacenar la matriz, establece la referencia inversa con
     * {@link Matriz2x2._nodo} para sincronización directa.
     *
     * @param {Matriz2x2} matriz
     */
    _identidad(matriz) {
        if (!Entorno.permite_pruebas()) {
            this.constructor._alerta('_identidad() solo disponible en entorno de pruebas.');
            return;
        }
        this._identidad_matricial = matriz;
        matriz._nodo(this);
    }

    // ═══════════════════════════════════════════
    // P-GRAMA ÚNICO
    // ═══════════════════════════════════════════

    /**
     * Obtiene el p‑grama de factores del nodo.
     *
     * @returns {number[]} Lista de identificadores, o array vacío si no tiene.
     */
    pgrama() {
        return this._;
    }

    /**
     * Asigna el p‑grama de factores.
     *
     * @param {number[]} pgrama Lista de identificadores.
     */
    _pgrama(pgrama) {
        this.__pgrama = pgrama;
    }

    /**
     * Indica si el nodo es un {@link NodoPrimo} (identidad atómica).
     *
     * Por defecto retorna `false`. La subclase {@link NodoPrimo} sobrescribe
     * este método para devolver `true`.
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
     * Utiliza la caché global {@link _primos_conocidos}. Si el número no está
     * en la caché, se expande generando primos consecutivos hasta alcanzarlo
     * o descartarlo.
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
     * en la fase indicada.
     *
     * Avanza el contador correspondiente y actualiza la caché. El mismo
     * contador se usa para comandos constructivos (positivos) y destructivos
     * (negativos), ya que ambos comparten el mismo espacio de identidades
     * primas; el signo lo determina el llamante al crear la matriz.
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

    // ═══════════════════════════════════════════
    // POOL DE NODOS LIBRES
    // ═══════════════════════════════════════════

    /**
     * Toma un nodo libre del pool para la fase indicada.
     *
     * Si el pool está vacío, crea una nueva instancia llamando a
     * {@link NodoElectrico.crear}. Al tomar un nodo del pool, se limpian
     * su identidad y p‑grama anteriores por seguridad.
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
            // Limpiar identidad y p‑grama anteriores (por seguridad).
            nodo._identidad_matricial = Matriz2x2.inicial();
            nodo.__pgrama = [];
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
    // ASCENSO Y DESCENSO
    // ═══════════════════════════════════════════

    /**
     * Asciende el nodo compuesto a la fase superior.
     *
     * El proceso de ascenso:
     * 1. Recopila el p‑grama del nodo.
     * 2. Obtiene un {@link NodoPrimo} libre en la fase de destino usando
     *    {@link NodoPrimo.siguiente_primo_libre}.
     * 3. Guarda en el dato multidimensional del primo (dimensión `'abajo'`)
     *    un paquete con el p‑grama de factores y el nombre de la fase actual.
     * 4. No libera el nodo actual; esa responsabilidad es del iterador de aprendizaje.
     *
     * @param {string} fase_destino Nombre de la fase superior a la que ascender.
     * @returns {NodoPrimo} El NodoPrimo que representa al nodo compuesto en la fase superior.
     * @throws {Error} Si el nodo no tiene p‑grama.
     */
    ascender(fase_destino) {
        const fase_actual = this.constructor.fase();
        const factores = this.pgrama();
        if (factores.length === 0) {
            this.constructor._error('El nodo no tiene p‑grama para ascender.');
            throw new Error('El nodo no tiene p‑grama para ascender.');
        }

        // Usar la propiedad estática _fase_actual (protegida en NodoElectrico)
        this.constructor._fase_actual = fase_destino;
        const primo_superior = this.constructor._subclases.NodoPrimo.siguiente_primo_libre(fase_destino);
        this.constructor._fase_actual = fase_actual;

        if (primo_superior === null) {
            this.constructor._error('No hay NodoPrimo libre en la fase destino.');
            throw new Error('No hay NodoPrimo libre en la fase destino.');
        }

        // Guardar el p‑grama y el nombre de la fase actual en el primo superior.
        primo_superior._dato({
            factores: factores,
            fase_origen: fase_actual
        }, 'abajo');

        // El nodo actual NO se devuelve al pool; permanece activo para el iterador.

        return primo_superior;
    }

    /**
     * Desciende un nodo compuesto desde un NodoPrimo superior a la fase original.
     *
     * El proceso de descenso:
     * 1. Lee el dato `'abajo'` del {@link NodoPrimo} superior, que contiene
     *    el p‑grama de factores y el nombre de la fase origen (guardados por
     *    {@link ascender}).
     * 2. Determina el tipo de composición observando el primer elemento del
     *    p‑grama:
     *    - `1`: paralelo.
     *    - `-1`: secuencia de deshacer.
     *    - otro: secuencia de hacer.
     * 3. Crea los {@link NodoPrimo} correspondientes a cada factor y construye
     *    el nodo compuesto en la fase origen con la fábrica adecuada
     *    ({@link crear_numerico} o {@link crear_paralelo}).
     *
     * @param {NodoPrimo} primo_superior El NodoPrimo en la fase superior que
     *                                   contiene el p‑grama y la fase origen.
     * @returns {NodoNumerico} El nodo compuesto reconstruido en la fase origen.
     * @throws {Error} Si el dato 'abajo' no existe, no contiene factores
     *                 o no contiene el nombre de la fase origen.
     */
    static descender(primo_superior) {
        const paquete = primo_superior.dato('abajo');
        if (!paquete || !Array.isArray(paquete.factores) || !paquete.fase_origen) {
            this._error('El NodoPrimo no contiene un paquete de descenso válido (factores y fase_origen).');
            throw new Error('El NodoPrimo no contiene un paquete de descenso válido.');
        }

        const factores = paquete.factores;
        const fase_origen = paquete.fase_origen;

        // Determinar el tipo de composición según la marca inicial.
        const es_paralelo = factores[0] === 1;
        const es_deshacer = factores[0] === -1;
        if (es_paralelo || es_deshacer) {
            factores.shift(); // quitar la marca (1 o -1)
        }

        const componentes = [];
        for (const primo of factores) {
            componentes.push(this.crear_primo(primo));
        }

        const fase_actual = this.fase();
        this._fase_actual = fase_origen; // cambiar a fase origen

        let nodo;
        if (es_paralelo) {
            nodo = this.crear_paralelo(componentes);
        } else {
            nodo = this.crear_numerico(componentes);
        }

        this._fase_actual = fase_actual; // restaurar fase original
        return nodo;
    }

    // ═══════════════════════════════════════════
    // FÁBRICAS
    // ═══════════════════════════════════════════

    /**
     * Crea un nodo numérico compuesto (secuencia ordenada de p‑grama).
     *
     * La cantidad de componentes debe ser un número primo. La identidad
     * resultante es el **producto matricial no conmutativo** de las identidades
     * de los componentes en el orden proporcionado.
     *
     * Si todos los componentes son deshaceres (primos negativos), se antepone
     * la marca `-1` al p‑grama.
     *
     * Se toma un nodo del pool (o se crea uno nuevo) y se le asignan la
     * matriz, el p‑grama y la capacidad/fuga en la fase actual.
     * **No se crean enlaces internos**; esa es responsabilidad del iterador.
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
        const factores = [];
        let es_deshacer = true;
        for (const comp of componentes) {
            if (comp.es_primo()) {
                factores.push(comp.numero_primo);
                if (comp.numero_primo > 0) {
                    es_deshacer = false;
                }
            }
        }
        for (let i = 1; i < cantidad; i++) {
            matriz = matriz.multiplicar(componentes[i].identidad());
        }

        // Si todos los componentes son deshaceres, anteponer marca -1.
        if (es_deshacer && factores.length > 0) {
            factores.unshift(-1);
        }

        const nodo = this._tomar_nodo_libre();
        nodo._identidad(matriz);
        nodo._pgrama(factores);
        nodo.capacidad = capacidad;
        nodo.fuga = fuga;
        return nodo;
    }

    /**
     * Crea un nodo primo con el número primo indicado.
     *
     * @param {number} primo Número primo (positivo para comando constructivo,
     *                       negativo para destructivo).
     * @param {number} [capacidad=Conf.CAPACIDAD_NODO_ELECTRICO] Capacidad máxima de energía.
     * @param {number} [fuga=Conf.FUGA_NODO_ELECTRICO] Fuga de energía por ciclo.
     * @returns {NodoPrimo|null} El NodoPrimo creado, o `null` si el valor absoluto no es primo.
     * @see NodoPrimo
     */
    static crear_primo(primo, capacidad = Conf.CAPACIDAD_NODO_ELECTRICO, fuga = Conf.FUGA_NODO_ELECTRICO) {
        if (!this.es_numero_primo(Math.abs(primo))) {
            this._error(`El valor absoluto de ${primo} no es primo.`);
            return null;
        }
        return this._subclases.NodoPrimo._crear_interno(primo, capacidad, fuga);
    }

    /**
     * Crea un nodo de sincronización (paralelo) con los componentes dados.
     *
     * La cantidad de componentes debe ser un número primo. La identidad es
     * el producto conmutativo (orden canónico) con la marca `1` antepuesta
     * en el p‑grama.
     *
     * Delega completamente en {@link NodoParalelo._crear_interno}.
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

    // ═══════════════════════════════════════════
    // V 1.4.5
    // ═══════════════════════════════════════════

    /**
     * Devuelve la secuencia de matrices de identidad correspondientes a los
     * factores primos del p‑grama en el orden canónico, omitiendo las marcas
     * de sincronización (1, -1).
     *
     * @returns {Matriz2x2[]} Secuencia de matrices del nodo.
     * @since 1.4.5
     */
    secuencia_de_matrices() {
        const matrices = [];

        for (const p of this.__pgrama) {
            if (p === 1 || p === -1) {
                continue;
            }
            if (p > 0) {
                matrices.push(Matriz2x2.crear_prima(p));
            } else {
                matrices.push(Matriz2x2.crear_negativa_prima(-p));
            }
        }

        return matrices;
    }
}

export { NodoNumerico };