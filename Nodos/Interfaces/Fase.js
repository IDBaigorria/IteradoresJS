/**
 * Interfaz que define el manejo de fase en un nodo.
 *
 *
 * @interface
 * @since V1.2.0
 * @memberof Nodos.Interfaces
 */
class Fase {
    //ESTATICOS/////////////////////////////////////////////////////////////
    /**
     * Establece la fase en la que van a trabajar todos los nodos
     * 
     * Se necesita acceso autorizado por token
     * @param {String} token autorizacion
     * @param {String} fase nombre de la fase
     */
    establecer_fase(token, fase){
        throw new Error("Método establecer_fase() debe ser implementado por la clase que herede.");        
    }

    //INSTANCIA////////////////////////////////////////////////////////////////////
/**
     * Ejecuta una función por cada fase registrada en el nodo (Interfaz Fase).
     *
     * 🔗 Interfaz:
     * - {@link Nodos.Interfaces.Fase Fase}
     *
     * Permite iterar sobre todas las fases registradas en el nodo ejecutando una función
     * callback en cada una. Requiere token de seguridad por ser una operación sensible.
     * 
     * ---
     * 🔗 Métodos relacionados:
     * - {@link Nodos.Interfaces.Fase#method_establecer_fase establecer_fase}
     *
     * ---
     * Ejemplo de uso:
     * ```php
     * $nodo->por_cada_fase_ejecutar($token, function($fase) {
     *     echo "Procesando fase: $fase";
     * });
     * ```
     *
     * @note Requiere token de seguridad válido.
     * @param {String} token Token de autorización
     * @param {Function}callable Función a ejecutar en cada fase
     * @return void
     * @public
     * @since 1.2.0
     */
    por_cada_fase_ejecutar(token, funcion){
        throw new Error("Método por_cada_fase_ejecutar() debe ser implementado por la clase que herede.");
    }
}

export {Fase}
