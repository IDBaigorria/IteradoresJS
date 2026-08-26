/**
 * Contrato para proveedores de espines.
 *
 * Un proveedor de espines es cualquier clase capaz de devolver, para una
 * ubicación geográfica y un instante dado, un **ramillete de espines**.
 * Cada espin es una entidad individual que combina:
 * - `nombre`: identificador del astro o componente.
 * - `tipo`: categoría ('Astro', 'Eje', 'Prisma', etc.).
 * - `masa`: masa gravitacional o peso contextual.
 * - `vector`: vector unitario en el marco de referencia inercial.
 *
 * A partir de la versión 1.5.2, esta clase reemplaza a la antigua
 * `ProveedorVectorGravitacional`. Los proveedores ya no devuelven un único
 * vector combinado; en su lugar, exponen el ramillete completo de espines,
 * permitiendo que el sistema componga llaves matriciales con todos los
 * componentes disponibles.
 *
 * ## Propósito de la clase
 *
 * Esta clase actúa como **documentación ejecutable** para facilitar
 * el entendimiento del sistema tanto a desarrolladores humanos como
 * a inteligencias artificiales. La primera implementación es
 * {@link RelojAstronomico}.
 *
 * ## Métodos que deben implementarse
 *
 * - {@link ProveedorEspines#espines}: Obtiene el ramillete de espines.
 * - {@link ProveedorEspines#espin}: Obtiene el espin de un astro específico.
 * - {@link ProveedorEspines#_ubicacion}: Actualiza la ubicación geográfica.
 *
 * ## Notas de implementación
 *
 * - Cada espin debe contener un vector unitario (magnitud 1), salvo
 *   casos extremos donde se puede devolver un vector neutro {x:0, y:0, z:1}.
 * - La implementación puede incluir caché para optimizar consultas
 *   repetidas con el mismo `tiempo_unix`.
 * - El método {@link ProveedorEspines#_ubicacion} debe invalidar cualquier
 *   caché interna para forzar el recálculo con las nuevas coordenadas.
 *
 * @author Ignacio David Baigorria
 * @class ProveedorEspines
 * @since 1.5.2
 * @version 1.5.2
 */
export class ProveedorEspines {
    /**
     * Devuelve el ramillete de espines para el instante dado.
     *
     * @param {number|null} [tiempo_unix=null] Tiempo Unix en segundos. Si es null, se usa el instante actual.
     * @returns {Array<{nombre: string, tipo: string, masa: number, vector: {x: number, y: number, z: number}}>}
     * @throws {Error} Si no se implementa en la subclase.
     */
    espines(tiempo_unix = null) {
        throw new Error('Método espines() debe ser implementado.');
    }

    /**
     * Devuelve el espin de un astro específico.
     *
     * @param {string} astro       Nombre del astro o componente.
     * @param {number|null} [tiempo_unix=null] Tiempo Unix en segundos. Si es null, se usa el instante actual.
     * @returns {{nombre: string, tipo: string, masa: number, vector: {x: number, y: number, z: number}}|null}
     * @throws {Error} Si no se implementa en la subclase.
     */
    espin(astro, tiempo_unix = null) {
        throw new Error('Método espin() debe ser implementado.');
    }

    /**
     * Actualiza la ubicación geográfica del proveedor.
     *
     * @param {number} latitud  Nueva latitud en grados (-90 a 90).
     * @param {number} longitud Nueva longitud en grados (-180 a 180).
     * @returns {void}
     * @throws {Error} Si no se implementa en la subclase.
     */
    _ubicacion(latitud, longitud) {
        throw new Error('Método _ubicacion() debe ser implementado.');
    }
}