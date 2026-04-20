/**
 * @namespace Nodos.PerdurarSuperestructura
 * @interface PerdurarSuperestructura
 * 
 * Define las operaciones necesarias para guardar, cargar, eliminar,
 * verificar existencia e imprimir una superestructura.
 * 
 * Cada clase que implemente esta interfaz deberá proveer
 * su propia lógica para cada método.
 * 
 * @since V3.3.0
 */
class PerdurarSuperestructura {
    static guardar() { throw new Error("Método guardar() debe ser implementado"); }
    static cargar() { throw new Error("Método cargar() debe ser implementado"); }
    static eliminar() { throw new Error("Método eliminar() debe ser implementado"); }
    static existe() { throw new Error("Método existencia() debe ser implementado"); }
    static imprimir() { throw new Error("Método imprimir() debe ser implementado"); }
}
export {PerdurarSuperestructura}