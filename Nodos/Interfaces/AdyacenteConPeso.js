import { Adyacentes } from './Adyacentes.js'; // Ajusta la ruta de importación si es necesario

/**
 * Interfaz que extiende Adyacentes con métodos para asignar adyacentes con peso.
 *
 * Combina la creación de un enlace adyacente y la asignación de un peso en un solo paso.
 * Estos métodos son implementados por la clase {@link Nodos.NodoElectrico NodoElectrico}.
 *
 * @interface
 * @extends Nodos.Interfaces.Adyacentes
 * @since 1.2.9
 * @memberof Nodos.Interfaces
 */
class AdyacenteConPeso extends Adyacentes {
    /**
     * Asigna un adyacente con nombre único y le asigna un peso.
     *
     * Genera automáticamente un nombre de enlace único basado en el id del nodo destino,
     * luego asigna el peso en la dimensión especificada (o en la dimensión por defecto
     * si no se indica ninguna).
     *
     * @param {NodoElectrico} un_nodo   Nodo que se desea enlazar.
     * @param {*}             peso      Peso a asignar al nuevo enlace.
     * @param {string|null}   [dimension=null] Dimensión del peso (null para la por defecto).
     * @returns {string|null} Nombre del enlace generado, o null si hubo error.
     *
     * @see _adyacente
     * @see _peso
     * @since 1.2.9
     */
    _adyacente_con_peso(un_nodo, peso, dimension = null) {
        throw new Error("Método _adyacente_con_peso() debe ser implementado por la clase que herede.");
    }

    /**
     * Establece un nodo adyacente con nombre de enlace específico y le asigna un peso.
     *
     * Si el enlace ya existía y se permite reemplazar, el peso se asigna al nuevo enlace.
     *
     * @param {NodoElectrico} un_nodo    Nodo a establecer como adyacente.
     * @param {string}        enlace     Nombre del enlace.
     * @param {*}             peso       Peso a asignar.
     * @param {string|null}   [dimension=null]  Dimensión del peso (null para la por defecto).
     * @param {boolean}       [reemplazar=false] Si true, reemplaza un enlace existente.
     * @returns {boolean} True si se creó/reemplazó correctamente, false si hubo error.
     *
     * @see _adyacente_en
     * @see _peso
     * @since 1.2.9
     */
    _adyacente_con_peso_en(un_nodo, enlace, peso, dimension = null, reemplazar = false) {
        throw new Error("Método _adyacente_con_peso_en() debe ser implementado por la clase que herede.");
    }
}

export { AdyacenteConPeso };