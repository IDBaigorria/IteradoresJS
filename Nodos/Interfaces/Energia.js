/**
 * Interfaz que define el manejo de energia en un nodo.
 *
 *
 * @interface
 * @since V1.2.0
 * @memberof Nodos.Interfaces
 */
class Energia {

	/**
	 * Da energia al nodo para que este la sume a su energia
	 * 
	 * 
	 * @param {number} cantidad_energia puede ser positiva o negativa
	 * @return {number}
	 */
	 _energia(cantidad_energia){
        throw new Error("Método _energia() debe ser implementado por la clase que herede.");        
     };

    /**
	 * Retorna el nivel de energia del nodo
	 * 
	 * @return {number}
	 */
	energia(){
        throw new Error("Método energia() debe ser implementado por la clase que herede.");        
     };

    //──────────────────────────────────────────────
    // Métodos de configuración de callbacks
    //──────────────────────────────────────────────
    /**
	 * Asigna la funcion a ejecutar cuando el nodo se satura de energia
	 * @param {Function} funcion
	 */
	_ejecutar_cuando_agota(funcion){
        throw new Error("Método _ejecutar_cuando_agota() debe ser implementado por la clase que herede.");        
     };
    /**
	 * devuelve la funcion a ejecutar cuando se satura el nodo de energia
	 * @return {Function}
	 */
	ejecutar_cuando_agota(){
        throw new Error("Método ejecutar_cuando_agota() debe ser implementado por la clase que herede.");        
    }
	/**
	 * Asigna la funcion a ejecutar cuando el nodo se satura de energia
	 * @param {Function} funcion
	 */
	_ejecutar_cuando_satura(funcion){
        throw new Error("Método _ejecutar_cuando_satura() debe ser implementado por la clase que herede.");        
    }

	/**
	 * devuelve la funcion a ejecutar cuando se satura el nodo de energia
	 * @return {Function}
	 */
	ejecutar_cuando_satura(){
        throw new Error("Método ejecutar_cuando_agota() debe ser implementado por la clase que herede.");        
    }

}


export {Energia}