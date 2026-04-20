/**
 * Interfaz que define el manejo de datos en un nodo.
 *
 * Permite establecer y recuperar un valor almacenado en el nodo.
 * Estos métodos son implementados por la clase {@link Nodos.Nodo Nodo}.
 *
 * @interface
 * @since V3.2.1
 * @memberof Nodos.Interfaces
 */
class Datos {
    /**
     * Asigna un dato al nodo.
     * 
     * Este método encapsula un dato pasado por parametro en un nodo de clase {@link Nodos.Nodo Nodo}, 
     * para ser accedido luego con {@link Nodos.Interfaces.Datos#dato dato()}. 
     *
     * @param {*} dato El valor a almacenar (puede ser cualquier tipo).
     * @returns {void}
     *
     */
    _dato(dato){
        throw new Error("Método _dato() debe ser implementado por la clase que herede.");
    }

    /**
     * Devuelve el dato almacenado en el nodo. 
     * 
     * Este método retorna el valor previamente encapsulado mediante 
     * {@link Nodos.Interfaces.Datos#_dato _dato()}
     * en una instancia de la clase {@link Nodos.Nodo Nodo}. 
     * Si no existe ningún dato, devuelve null.
     *
     * @returns {*|null} El dato almacenado o null si no hay valor asignado.
     *
     */
    dato(){
        throw new Error("Método dato() debe ser implementado por la clase que herede.");
    }
}

export {Datos}