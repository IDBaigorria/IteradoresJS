/**
 * Contrato para componentes que proporcionan vectores temporales.
 *
 * Dispone de una instancia de {@link RelojAstronomico} 
 * y la utiliza para devolver el vector  gravitacional asociado al 
 * instante actual (o a un timestamp arbitrario) y
 * a la ubicación configurada.
 *
 * Además, permite actualizar la ubicación del reloj interno de forma dinámica,
 * por ejemplo al recibir notificaciones de cambio de posición desde
 * {@link Entorno.escuchar_cambios}.
 *
 * ## Rol en el sistema
 *
 * Esta clase la extiende el {@link Controlador} para que los iteradores y otros
 * componentes puedan obtener la huella temporal del ciclo en curso sin
 * preocuparse de los detalles de obtención de la ubicación ni del modelo
 * astronómico.
 *
 * @class VectorGravitacional
 * @since 1.3.6
 */
class VectorGravitacional {
    /**
     * Devuelve el vector gravitacional correspondiente al instante dado.
     *
     * @param {number|null} [timestamp=null] Marca de tiempo Unix (segundos).
     *        Si es null, se usa el instante actual.
     * @returns {{x: number, y: number, z: number}|null} Vector unitario,
     *          o null si el reloj astronómico aún no se ha inicializado.
     */
    static vector_gravitacional_actual(timestamp = null) {
        throw new Error('Método vector_gravitacional_actual() debe ser implementado.');
    }

    /**
     * Actualiza la ubicación geográfica del reloj astronómico interno.
     *
     * @param {number} latitud  Nueva latitud en grados (-90 a 90).
     * @param {number} longitud Nueva longitud en grados (-180 a 180).
     * @returns {void}
     */
    static _actualizar_ubicacion(latitud, longitud) {
        throw new Error('Método _actualizar_ubicacion() debe ser implementado.');
    }
}

export {VectorGravitacional}