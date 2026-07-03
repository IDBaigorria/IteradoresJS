import { NodoNumerico } from './NodoNumerico.js';
import { Matriz2x2 } from './Matriz2x2.js';
import { Conf } from '../Configuracion/Configuracion.js';

/**
 * NodoParalelo – Sincronización de componentes simultáneos.
 *
 * Representa un **grupo de señales o comandos que ocurren en el mismo
 * instante lógico** (por ejemplo, todos los dominios activos en un único
 * pulso del Tálamo). A diferencia de una secuencia ordenada, los
 * componentes de un NodoParalelo no tienen un orden predefinido: el
 * sistema los trata como un conjunto simultáneo cuya identidad es
 * **conmutativa**.
 *
 * ## Identidad matricial
 *
 * La identidad de un NodoParalelo se construye como:
 * ```
 * M_marca × M(c₁) × M(c₂) × … × M(cₚ)
 * ```
 * donde los componentes se ordenan **canónicamente** (según la
 * representación textual de sus matrices identidad) antes de la
 * multiplicación. Esto garantiza que el producto sea el mismo
 * independientemente del orden en que se pasen los componentes a la
 * fábrica.
 *
 * ## Marca de sincronización
 *
 * La matriz `[[1, 1], [0, 1]]` (definida en {@link Conf.MATRIZ_MARCA_CONJUNTO})
 * se antepone al producto de los componentes para **marcar algebraicamente**
 * que este nodo es una sincronización y no una secuencia común.
 *
 * - La entrada `b = 1` permite que el nodo sea pintado posteriormente por
 *   conjuntos sin alterar su estructura.
 * - La entrada `c = 0` distingue la marca de las matrices canónicas de los
 *   primos (que siempre tienen `c = 1`).
 *
 * ## Cantidad prima de componentes
 *
 * Solo se permiten grupos cuya **cantidad de componentes sea un número
 * primo**. Esta restricción:
 *
 * - Mantiene la coherencia algebraica con el resto del sistema, que opera
 *   con p‑gramas primos.
 * - Evita la ambigüedad en la factorización: un grupo de 4 podría
 *   confundirse con dos grupos de 2, pero 3 o 5 no admiten esa ambigüedad.
 * - Facilita el ascenso de fase, ya que los primos son las unidades
 *   atómicas que ascienden.
 *
 * ## Relación con el resto de la jerarquía
 *
 * - Hereda de {@link NodoNumerico} e implementa la interfaz de identidad
 *   numérica a través de la herencia.
 * - Su propiedad `ordenado` es `false`, lo que lo distingue de las
 *   secuencias creadas con {@link NodoNumerico.crear_numerico}.
 * - Puede ser **pintado** por {@link NodoConjunto} a través del canvas `b`
 *   de su matriz identidad, igual que cualquier otro nodo.
 *
 * @class
 * @extends NodoNumerico
 * @version 1.4.3
 * @since 1.4.2
 * @author Ignacio David Baigorria
 * @see Matriz2x2
 * @see NodoConjunto
 * @see Conf.MATRIZ_MARCA_CONJUNTO
 */
class NodoParalelo extends NodoNumerico {
    /**
     * Constructor protegido.
     *
     * Inicializa el nodo con `_ordenado = false`, reflejando su naturaleza
     * de conjunto simultáneo sin orden preestablecido.
     */
    constructor() {
        super();
        this._ordenado = false;
    }

    /**
     * Crea internamente un NodoParalelo (invocado por {@link NodoNumerico.crear_paralelo}).
     *
     * ## Proceso de construcción
     *
     * 1. **Validación de cantidad prima:** si el número de componentes no es
     *    primo, se registra un error y se retorna `null`.
     * 2. **Ordenación canónica:** los componentes se ordenan según la
     *    representación textual de sus identidades matriciales. Esto asegura
     *    que el producto sea conmutativo.
     * 3. **Cálculo de la matriz identidad:** se multiplica la marca de
     *    sincronización ({@link Conf.MATRIZ_MARCA_CONJUNTO}) por las
     *    identidades de los componentes en orden canónico.
     * 4. **Asignación al nodo:** se crea la instancia, se le asigna la
     *    matriz resultante y se enlazan los componentes mediante adyacentes
     *    con nombres `componente_1`, `componente_2`, …, `componente_p`.
     *
     * @param {NodoNumerico[]} componentes Componentes del grupo (cantidad prima).
     * @param {number} [capacidad=Conf.CAPACIDAD_NODO_ELECTRICO] Capacidad máxima de energía.
     * @param {number} [fuga=Conf.FUGA_NODO_ELECTRICO] Fuga de energía por ciclo.
     * @returns {NodoParalelo|null} El nuevo nodo, o null si la cantidad no es prima.
     * @internal
     */
    static _crear_interno(componentes, capacidad = Conf.CAPACIDAD_NODO_ELECTRICO, fuga = Conf.FUGA_NODO_ELECTRICO) {
        const cantidad = componentes.length;
        if (!NodoNumerico.es_numero_primo(cantidad)) {
            this._error('La cantidad de componentes debe ser un número primo.');
            return null;
        }

        // Ordenar canónicamente por representación textual de la identidad.
        const ordenados = [...componentes].sort((a, b) =>
            a.identidad().toString().localeCompare(b.identidad().toString())
        );

        // Calcular matriz con marca.
        const marca = NodoParalelo._obtener_matriz_marca();
        let matriz = marca;
        for (const comp of ordenados) {
            matriz = matriz.multiplicar(comp.identidad());
        }

        const nodo = new NodoParalelo();
        nodo.capacidad = capacidad;
        nodo.fuga = fuga;
        nodo._identidad(matriz);

        // Enlazar componentes.
        for (let i = 0; i < cantidad; i++) {
            nodo._adyacente_en(ordenados[i], 'componente_' + (i + 1), true);
        }

        return nodo;
    }

    /**
     * Devuelve la marca de sincronización cacheada.
     *
     * La marca es la matriz `[[1, 1], [0, 1]]` definida en
     * {@link Conf.MATRIZ_MARCA_CONJUNTO}. Se cachea estáticamente para
     * evitar recrearla en cada llamada.
     *
     * @returns {Matriz2x2}
     * @private
     */
    static _obtener_matriz_marca() {
        if (!NodoParalelo._marca_cache) {
            const m = Conf.MATRIZ_MARCA_CONJUNTO;
            NodoParalelo._marca_cache = new Matriz2x2(m[0][0], m[0][1], m[1][0], m[1][1]);
        }
        return NodoParalelo._marca_cache;
    }

    /** @type {Matriz2x2|null} Cache de la marca de sincronización */
    static _marca_cache = null;
}

// Registro en NodoNumerico para evitar dependencia circular
NodoNumerico._subclases.NodoParalelo = NodoParalelo;

export { NodoParalelo };