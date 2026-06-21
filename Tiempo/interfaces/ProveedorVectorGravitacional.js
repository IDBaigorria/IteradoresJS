/**
 * Contrato para proveedores de vectores gravitacionales.
 *
 * Un proveedor de vector gravitacional es cualquier clase capaz de
 * devolver un vector tridimensional unitario (x, y, z) que represente
 * de forma determinista la configuración del cielo (Sol, Luna, etc.)
 * para una ubicación geográfica y un instante dado.
 *
 * Este vector puede ser utilizado por los iteradores para "marcar"
 * temporalmente los pesos de las aristas del grafo, permitiendo que
 * el sistema detecte ciclos, mida cercanía temporal y realice
 * predicciones basadas en configuraciones astronómicas pasadas o futuras.
 *
 * ## Propósito de la clase
 *
 * Esta clase actúa como **documentación ejecutable** para facilitar
 * el entendimiento del sistema tanto a desarrolladores humanos como
 * a inteligencias artificiales. Por ahora, la única clase que la
 * extiende es {@link RelojAstronomico}. En el futuro podrían añadirse
 * otros proveedores (por ejemplo, uno que incluya más astros o que
 * use efemérides de alta precisión).
 *
 * ## Métodos que deben implementarse
 *
 * - {@link ProveedorVectorGravitacional#vector}: Obtiene el vector para un instante (instancia).
 * - {@link ProveedorVectorGravitacional#_ubicacion}: Actualiza la ubicación geográfica.
 * - {@link ProveedorVectorGravitacional.vector_gravitacional}: Obtiene el vector (estático).
 *
 * ## Notas de implementación
 *
 * - El vector devuelto debe ser siempre unitario (magnitud 1), salvo
 *   casos extremos donde se puede devolver un vector neutro {x:0, y:0, z:1}.
 * - La implementación puede incluir caché para optimizar consultas
 *   repetidas con el mismo timestamp.
 * - El método {@link ProveedorVectorGravitacional#_ubicacion} debe invalidar
 *   cualquier caché interna para forzar el recálculo con las nuevas coordenadas.
 *
 * @class ProveedorVectorGravitacional
 * @since 1.3.5
 */
export class ProveedorVectorGravitacional {
    /**
     * Devuelve el vector gravitacional para el instante dado.
     *
     * @param {number|null} [timestamp=null] Marca de tiempo Unix (segundos). Si es null, se usa el instante actual.
     * @returns {{x: number, y: number, z: number}} Vector unitario.
     * @throws {Error} Si no se implementa en la subclase.
     */
    vector(timestamp = null) {
        throw new Error('Método vector() debe ser implementado.');
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

    /**
     * Método estático para obtener el vector gravitacional sin necesidad
     * de instanciar un objeto.
     *
     * Es útil cuando no se requiere caché de estado o cuando se necesita
     * un vector para una ubicación distinta a la configurada en la instancia.
     *
     * @param {number} latitud   Latitud en grados.
     * @param {number} longitud  Longitud en grados.
     * @param {number|null} [timestamp=null] Marca de tiempo Unix (segundos). Si es null, se usa el instante actual.
     * @returns {{x: number, y: number, z: number}} Vector unitario.
     * @throws {Error} Si no se implementa en la subclase.
     */
    static vector_gravitacional(latitud, longitud, timestamp = null) {
        throw new Error('Método estático vector_gravitacional() debe ser implementado.');
    }
}