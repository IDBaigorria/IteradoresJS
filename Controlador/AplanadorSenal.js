import { Matriz2x2 } from '../Nodos/Matriz2x2.js';
import { NodoNumerico } from '../Nodos/NodoNumerico.js';

/**
 * Aplanador de señales procesadas.
 *
 * Convierte una {@link Senal} que ya ha sido procesada por un
 * {@link ProcesadorDeDominio} en una lista plana de {@link Matriz2x2}
 * del tálamo, apta para ser traducida a bytes por
 * {@link MapeoBytesMatrices}.
 *
 * ## Responsabilidad
 *
 * Recorrer los elementos procesados de la señal y, para cada
 * {@link NodoNumerico} (patrón compuesto), descender recursivamente
 * a través de su p‑grama hasta alcanzar los primos atómicos. De cada
 * primo atómico se extrae la matriz original del tálamo (almacenada
 * en el dato multidimensional `'abajo'` durante el ascenso de fase)
 * o, en su defecto, la propia matriz identidad del primo.
 *
 * ## Uso típico
 *
 * ```javascript
 * const senal = new Senal(...);
 * proc.procesar(senal);
 * const matrices = AplanadorSenal.aplanar(senal);
 * for (const m of matrices) {
 *     const byte = MapeoBytesMatrices.matriz_a_byte(m);
 *     ...
 * }
 * ```
 *
 * @author Ignacio David Baigorria
 *
 * @class AplanadorSenal
 * @since 1.4.6
 * @version 1.4.6
 * @see Senal
 * @see ProcesadorDeDominio
 * @see MapeoBytesMatrices
 */
export class AplanadorSenal {
    /**
     * Aplana una señal procesada en una secuencia de matrices del tálamo.
     *
     * ## Algoritmo
     *
     * 1. Recorre los elementos procesados de la señal (ver
     *    {@link Senal#elementos_procesados}).
     * 2. Para cada elemento:
     *    - Si es una {@link Matriz2x2} suelta, la agrega directamente
     *      al resultado.
     *    - Si es un {@link NodoNumerico}, invoca
     *      {@link _descender_nodo} para aplanarlo recursivamente.
     *
     * @param {Senal} senal Señal ya procesada por un dominio.
     * @returns {Matriz2x2[]} Lista de matrices del tálamo.
     */
    static aplanar(senal) {
        const resultado = [];

        for (const elemento of senal.elementos_procesados()) {  
            if (elemento instanceof Matriz2x2) {
                // Matriz suelta → directa.
                resultado.push(elemento);
            } else if (elemento instanceof NodoNumerico) {
                // Patrón compuesto → descender.
                this._descender_nodo(elemento, resultado);
            }
        }

        return resultado;
    }

    /**
     * Desciende recursivamente un nodo compuesto y acumula las matrices
     * del tálamo en el array de resultado.
     *
     * ## Cómo se asegura el uso de los primos correctos por fase
     *
     * Para cada factor del p‑grama se invoca
     * {@link NodoNumerico.crear_primo}. Este método devuelve el nodo
     * que corresponde a ese número primo en el dominio, respetando la
     * fase en la que fue creado. Si el nodo no existe, se crea uno
     * nuevo en la fase activa actual (la fase de salida del dominio).
     *
     * ## Algoritmo
     *
     * 1. Obtiene el p‑grama del nodo.
     * 2. Omite la marca de tipo (`1` para paralelo, `-1` para deshacer)
     *    si está presente al inicio del array.
     * 3. Para cada factor restante:
     *    a. Obtiene el nodo del dominio con
     *       {@link NodoNumerico.crear_primo}.
     *    b. Si es un primo atómico, intenta extraer la matriz original
     *       del dato `'abajo'`. Si no existe, usa la propia identidad
     *       del primo.
     *    c. Si es un nodo compuesto, se llama recursivamente.
     *
     * @param {NodoNumerico} nodo      Nodo compuesto a descender.
     * @param {Matriz2x2[]}  resultado Array donde se acumulan las matrices.
     * @private
     */
    static _descender_nodo(nodo, resultado) {
        // 1. Obtener el p‑grama del nodo.
        const pgrama = nodo.pgrama();
        // Si el nodo no tiene p‑grama, no hay nada que descender
        if (!Array.isArray(pgrama) || pgrama.length === 0) {
            return;
        }
        // 2. Omitir la marca de tipo (1 = paralelo, -1 = deshacer).
        const inicio = (pgrama.length > 0 && (pgrama[0] === 1 || pgrama[0] === -1)) ? 1 : 0;

        // 3. Recorrer los factores reales.
        for (let i = inicio; i < pgrama.length; i++) {
            const primo = pgrama[i];

            // a. Obtener el nodo del dominio para este factor.
            const nodoFactor = NodoNumerico.crear_primo(primo);
            if (!nodoFactor) {
                continue;
            }

            // b. ¿Es un primo atómico?
            if (nodoFactor.es_primo()) {
                // Intentar leer la matriz original del tálamo guardada en 'abajo'.
                const paqueteAbajo = nodoFactor.dato('abajo');
                if (paqueteAbajo && paqueteAbajo.matriz_original instanceof Matriz2x2) {
                    resultado.push(paqueteAbajo.matriz_original);
                } else {
                    // No hay 'abajo' → usar la propia identidad del primo.
                    resultado.push(nodoFactor.identidad());
                }
            } else {
                // c. Nodo compuesto → recursión.
                this._descender_nodo(nodoFactor, resultado);
            }
        }
    }
}