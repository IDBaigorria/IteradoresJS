/**
 * Interfaz de impresión de un nodo.
 *
 * Define un único método `imprimir()` que se adapta automáticamente al tipo de
 * salida configurado en {@link Configuracion.Entorno Entorno} (HTML o consola).
 *
 * @interface
 * @memberof Nodos.Interfaces
 * @since V3.2.5
 */
class Impresion {
    /**
     * Imprime el nodo en el formato adecuado según el tipo de salida del entorno.
     *
     * **Restricción de entorno:** solo se ejecuta en desarrollo o pruebas.
     * En producción, emite una alerta y no genera salida, ya que este método está pensado
     * exclusivamente para depuración.
     * 
     * Si `Entorno.es_consola()` → salida texto plano (consola).
     * Si `Entorno.es_html()` → retorna un string HTML.
     *
     * @returns {void|string} En modo HTML devuelve el string; en modo consola imprime directamente.
     * @since 1.3 Unificado con entorno; desaparece imprimir2.
     */
    imprimir() {
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
/*    static imprimir_superestructura() {
        throw new Error("Método imprimir_superestructura() debe ser implementado por la clase que herede.");
    }*/

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
   /* static imprimir2() {
        throw new Error("Método imprimir2() debe ser implementado por la clase que herede.");
    }*/
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
 /*   static imprimir_superestructura2() {
        throw new Error("Método imprimir_superestructura2() debe ser implementado por la clase que herede.");
    }*/

}

export {Impresion}