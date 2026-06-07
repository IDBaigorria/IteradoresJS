/**
 * Interfaz que define el manejo de pesos en los enlaces de un nodo.
 *
 * Permite asignar, consultar y ordenar pesos asociados a los enlaces
 * de un nodo. Los pesos pueden ser multidimensionales (diferentes claves).
 *
 * Estos métodos son implementados por la clase
 * {@link Nodos.NodoElectrico NodoElectrico}.
 *
 * La representación interna de los pesos es opaca para el usuario;
 * la interfaz garantiza el acceso uniforme.
 *
 * @interface
 * @since 1.2.9
 * @memberof Nodos.Interfaces
 */
class Peso {
    /**
     * Asigna o acumula peso en un enlace.
     *
     * Cuando `acumular` es `true` (comportamiento por defecto), suma el valor dado
     * al peso existente en la dimensión indicada. Si la dimensión no existía, se crea con
     * el valor proporcionado.
     * Cuando `acumular` es `false`, reemplaza cualquier valor previo por el nuevo peso.
     *
     * Si el enlace no tiene pesos, se realiza la migración perezosa a Enlace automáticamente.
     *
     * @param {string}      nombre_enlace Nombre del enlace.
     * @param {number}      peso          Valor a asignar o sumar (acepta negativos).
     * @param {string|null} [dimension=null] Dimensión. `null` para la dimensión por defecto.
     * @param {boolean}     [acumular=true]  `true` para acumular (por defecto), `false` para reemplazar.
     * @returns {number|null} Nuevo valor del peso, o `null` si el enlace no existe.
     *
     * @see peso
     * @see pesos
     * @since 1.2.9
     */
    _peso(nombre_enlace, peso, dimension = null, acumular = true) {
        throw new Error("Método _peso() debe ser implementado por la clase que herede.");
    }

    /**
     * Obtiene el peso de un enlace en una dimensión determinada.
     *
     * Si el enlace no tiene pesos asignados o no existe la dimensión solicitada,
     * devuelve `null`.
     *
     * @param {string}      nombre_enlace Nombre del enlace.
     * @param {string|null} [dimension=null] Dimensión del peso. Si es null, se usa la por defecto.
     * @returns {*|null} El peso almacenado, o `null` si no existe.
     *
     * @see _peso
     * @since 1.2.9
     */
    peso(nombre_enlace, dimension = null) {
        throw new Error("Método peso() debe ser implementado por la clase que herede.");
    }


    /**
     * Devuelve una copia de todos los pesos de un enlace.
     *
     * Retorna un objeto con todas las dimensiones y sus valores.
     * Si el enlace no tiene pesos, devuelve un objeto vacío.
     *
     * @param {string} nombre_enlace Nombre del enlace.
     * @returns {Object<string, *>} Mapa de pesos (dimensión => valor).
     *
     * @see _peso
     * @since 1.2.9
     */
    pesos(nombre_enlace) {
        throw new Error("Método pesos() debe ser implementado por la clase que herede.");
    }

    /**
     * Ordena los adyacentes de la fase actual según el valor del peso en una dimensión.
     *
     * Los enlaces que no poseen la dimensión de peso indicada se colocan al final,
     * conservando su orden original. Cada elemento del array devuelto contiene las propiedades
     * `nombre_enlace`, `nodo` y `peso` (este último puede ser `null` si no tiene el peso).
     *
     * @param {string|null} [dimension=null] Dimensión por la que ordenar. Si es null, se usa la por defecto.
     * @param {boolean}     [ascendente=true] `true` para orden ascendente, `false` para descendente.
     * @param {boolean}     [incluir_sin_peso=false] ``true` para que devuela al final del array los nodos sin peso en esa dimencion, `false` (por defecto) para que no los devuela
     * @returns {Array<{nombre_enlace: string, nodo: NodoElectrico, peso: *}>} Lista ordenada.
     *
     * @see peso
     * @since 1.2.9
     */
    adyacentes_ordenados_por_peso(dimension = null, ascendente = true, incluir_sin_peso = false) {
        throw new Error("Método adyacentes_ordenados_por_peso() debe ser implementado por la clase que herede.");
    }
}

export { Peso };