/**
 * Contrato para la gestión de dominios en el sistema.
 *
 * Permite activar y desactivar el modo exclusivo de un dominio,
 * haciendo que el péndulo del motor solo itere sobre fases de ese dominio.
 *
 * ## Propósito de la interfaz
 *
 * Esta clase existe para documentar y homogeneizar los métodos
 * que el {@link Controlador} expone para controlar los dominios.
 * Por ahora, solo el `Controlador` la extiende.
 *
 * @class Dominios
 * @since 1.3.9
 */
export class Dominios {
    /**
     * Activa el modo exclusivo para un dominio.
     *
     * Mientras un dominio está activo, el péndulo solo itera sobre fases
     * cuyo nombre comience por el prefijo del dominio (ej. 'html:').
     *
     * @param {string} dominio Nombre del dominio (sin ':').
     * @returns {void}
     */
    static activar_dominio(dominio) {
        throw new Error('Método activar_dominio() debe ser implementado.');
    }

    /**
     * Desactiva el modo exclusivo de dominio.
     *
     * El péndulo vuelve a considerar todas las fases activas.
     *
     * @returns {void}
     */
    static desactivar_dominio() {
        throw new Error('Método desactivar_dominio() debe ser implementado.');
    }
}