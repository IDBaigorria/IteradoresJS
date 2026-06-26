import { Datos } from './Datos.js';

/**
 * Interfaz que define el manejo de datos **multifase** y **multidimensional**
 * implementado por {@link Nodos.NodoElectrico}.
 *
 * Extiende la interfaz {@link Datos} para reflejar el comportamiento real del
 * sistema eléctrico:
 * - Los datos se almacenan **en la fase activa** del sistema (obtenida internamente).
 * - Dentro de cada fase, los datos se organizan en **dimensiones con nombre**.
 * - Si no se especifica dimensión, se usa una clave vacía (`''`) como
 *   "dimensión por defecto", que corresponde al dato plano tradicional.
 *
 * Esta interfaz es una **extracción** del trabajo realizado en la versión 1.4.1.
 *
 * @interface
 * @extends Datos
 * @memberof Nodos.Interfaces
 * @since 1.4.1
 */
class DatosElectrico extends Datos {
    /**
     * Asigna un dato en la **fase actual** y **dimensión** especificada.
     *
     * @param {*} valor
     * @param {string|null} [dimension=null] Nombre de la dimensión.
     *   Si es `null` se usa la dimensión por defecto (clave `''`).
     * @returns {void}
     *
     * @example
     * nodo._dato("principal");               // dimensión por defecto
     * nodo._dato(matriz, 'abajo');           // dimensión 'abajo'
     */
    _dato(valor, dimension = null) {
        throw new Error("Método _dato(valor, dimension) debe ser implementado.");
    }

    /**
     * Recupera un dato de la **fase actual** y **dimensión** indicada.
     *
     * @param {string|null} [dimension=null] Nombre de la dimensión.
     *   Si es `null` se devuelve el dato de la dimensión por defecto.
     * @returns {*|null} El valor almacenado, o `null` si no existe en la fase activa.
     *
     * @example
     * const valor = nodo.dato();               // dimensión por defecto
     * const matriz = nodo.dato('compuesta');   // dimensión 'compuesta'
     */
    dato(dimension = null) {
        throw new Error("Método dato(dimension) debe ser implementado.");
    }
}

export { DatosElectrico };