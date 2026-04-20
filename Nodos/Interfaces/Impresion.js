/**
 * Interfaz que define los métodos de impresión que debe implementar un nodo.
 * 
 * Estos métodos son implementados por la clase {@link Nodos.Nodo Nodo}.
 * 
 * Proporciona una forma estandarizada de representar un nodo
 * tanto en formato HTML como en formato texto (tipo shell o consola).
 *
 * @interface
 * @memberof Nodos.Interfaces
 * @since V3.2.5
 */
class Impresion {

    /**
     * Imprime el nodo en el documento HTML.
     * 
     * Este método genera un bloque HTML que muestra:
     * - El identificador del nodo
     * - Si es especial
     * - Su dato (si es string o null)
     * - La lista de adyacentes (con enlaces)
     * - El número de referencias al nodo
     * 
     * Este método debería ser usado solo por programadores o
     * para depuración visual.
     * 
     * @function
     * @name Impresion.imprimir
     * @abstract
     * @throws {Error} Si el método no está implementado por la clase heredada.
     * @example
     * // Ejemplo de implementación en una clase Nodo:
     * imprimir() {
     *     console.log("Nodo representado en HTML");
     * }
     */
    static imprimir() {
        throw new Error("Método imprimir() debe ser implementado por la clase que herede.");
    }
    /**
     * Imprime todos los nodos de la superestructura.
     * 
     * Recorre la colección de nodos almacenada en la superestructura
     * e invoca {@link Nodos.Nodo#imprimir imprimir()} en cada uno de ellos.  
     * Está pensada únicamente para depuración visual.
     *
     * @function
     * @name AccesoASuperestructura.imprimir_superestructura
     * @abstract
     * @returns {boolean} `true` si se imprimieron nodos, `false` si la superestructura está vacía.
     * @since V3.2.5
     */
    static imprimir_superestructura() {
        throw new Error("Método imprimir_superestructura() debe ser implementado por la clase que herede.");
    }

    /**
     * Imprime el nodo en formato texto (tipo shell o consola).
     * 
     * Muestra una representación textual del nodo con:
     * - Su identificador
     * - Si es especial
     * - Su dato (texto, número o null)
     * - Sus adyacentes
     * - El número de referencias al nodo
     * 
     * Este método es útil para depuración en consola.
     * 
     * @function
     * @name Impresion.imprimir2
     * @abstract
     * @throws {Error} Si el método no está implementado por la clase que herede.
     * @example
     * // Ejemplo de implementación en una clase Nodo:
     * imprimir2() {
     *     console.log("Nodo representado en consola");
     * }
     */
    static imprimir2() {
        throw new Error("Método imprimir2() debe ser implementado por la clase que herede.");
    }
    /**
     * Imprime todos los nodos de la superestructura en formato de texto (modo consola).
     * 
     * Recorre la colección de nodos en la superestructura e invoca 
     * {@link Nodos.Nodo#imprimir2 imprimir2()} sobre cada uno.  
     * Su propósito es la depuración por consola o texto plano.
     *
     * @function
     * @name AccesoASuperestructura.imprimir_superestructura2
     * @abstract
     * @returns {boolean} `true` si se imprimieron nodos, `false` si la superestructura está vacía.
     * @since V3.2.5
     */
    static imprimir_superestructura2() {
        throw new Error("Método imprimir_superestructura2() debe ser implementado por la clase que herede.");
    }

}

export {Impresion}