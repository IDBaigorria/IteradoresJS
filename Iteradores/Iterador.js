import { Objeto } from '../Nucleo/Objeto.js';

/**
 * Iterador – Navegador y manipulador de estructuras enlazadas.
 *
 * Un Iterador es una herramienta para recorrer, construir, modificar y
 * gestionar estructuras de nodos interconectados mediante **alias** (nombres
 * simbólicos que apuntan a enlaces concretos). Su diseño original, forjado a
 * lo largo de múltiples versiones desde 2013, ha sido refinado para
 * integrarse en el ecosistema del framework *Iteradores*.
 *
 * ## Responsabilidades principales
 *
 * 1. **Gestión del ciclo de vida**: crear una estructura nueva, cargar una
 *    previamente persistida y destruirla cuando ya no sea necesaria.
 * 2. **Alias y navegación**: asignar alias a enlaces, y recorrer la estructura
 *    siguiendo caminos de alias. El nodo actual actúa como cursor de lectura
 *    y escritura.
 * 3. **Manipulación de datos**: leer y escribir datos en los nodos alcanzables
 *    a través de rutas de alias, tanto en la estructura principal como en
 *    almacenes auxiliares (datos individuales).
 * 4. **Construcción desde cadenas**: interpretar una cadena con formato
 *    específico para generar automáticamente una estructura de nodos, y
 *    también serializar una estructura existente de vuelta a cadena.
 * 5. **Clonación**: crear una copia profunda de la estructura interna,
 *    opcionalmente excluyendo ciertos datos individuales.
 * 6. **Control de concurrencia**: marcar un iterador como ocupado para evitar
 *    que dos instancias manipulen simultáneamente la misma estructura
 *    persistida.
 * 7. **Historial de navegación**: registrar opcionalmente los nodos visitados
 *    durante el recorrido, permitiendo volver a posiciones anteriores o
 *    reiniciar el camino.
 *
 * ## Historial de versiones
 *
 * La clase `Iterador` original fue desarrollada por Ignacio David Baigorria
 * a partir de 2013. Alcanzó su madurez conceptual en la versión 2.0 (según
 * la numeración antigua) con un conjunto completo de funcionalidades para
 * navegación, alias, construcción desde cadenas y control de concurrencia.
 * Para el framework *Iteradores* actual, esa versión se considera la **1.0**
 * y sirve como punto de partida para una refactorización completa que la
 * adapte a las convenciones de nomenclatura, la herencia de {@link Objeto}
 * y la integración con el sistema de fases, energía y antenas.
 *
 * A partir de la versión 1.5.0, esta clase base se extenderá en
 * {@link IteradorElectrico} e {@link IteradorNumerico}.
 *
 * @class Iterador
 * @extends Objeto
 * @since 1.0 (versión original consolidada)
 * @version 1.5.0 (inicio de refactorización)
 * @author Ignacio David Baigorria
 */
export class Iterador extends Objeto {
	//********************************************************************************
	//------------------------------------------------------------------------------->
	//---------------------- Interfaz de creación de nodos y validacion de elementos >
	//------------------------------------------------------------------------------->
    /**
     * Verifica si un elemento es válido para ser iterado.
     *
     * En la clase base **todo elemento es válido** (incluyendo `null`, `false` o `0`).
     * Este método está diseñado para ser **sobrescrito en las subclases** cuando
     * se necesite restringir los tipos de elementos que el iterador puede procesar.
     *
     * @param {*}                          elemento Elemento a verificar.
     * @param {function(Nodo, boolean)=}   callback Función opcional que recibe el elemento y un booleano
     *                                             indicando si es un {@link Nodo}.
     * @returns {boolean} Siempre `true` en Iterador. Las subclases pueden devolver `false`.
     *
     * @since 1.5.0
     *
     * @see Iterador#nodo
     */
    static es_elemento_valido(elemento, callback = null) {
        const es_nodo = elemento instanceof Nodo;
        if (callback) callback(elemento, es_nodo);
        return true;
    }

    /**
     * Garantiza que el elemento entregado sea un nodo válido.
     *
     * Comportamiento análogo a {@link Nodo.nodo}, pero con la restricción adicional
     * impuesta por {@link Iterador#es_elemento_valido} y creando el tipo de nodo
     * adecuado mediante {@link Iterador#_crear_nodo_con_dato}.
     *
     * @param {*} [elemento=null]               Valor a encapsular o nodo existente.
     * @param {function(Nodo, boolean)=} callback Función opcional que recibe el nodo creado y un booleano
     *                                           indicando si el parámetro original ya era un nodo.
     * @returns {Nodo|null} Nodo válido o `null` si el elemento no es válido.
     *
     * @since 1.5.0
     *
     * @example
     * // Caso 1: elemento no nodo
     * const iterador = new Iterador();
     * const nodo = iterador.nodo("texto", (nodo, esNodo) => {
     *     console.log(esNodo); // false
     * });
     *
     * // Caso 2: elemento ya es nodo
     * const nodoExistente = Nodo.nodo(42);
     * const nodo = iterador.nodo(nodoExistente, (nodo, esNodo) => {
     *     console.log(esNodo); // true
     * });
     *
     * // Caso 3: elemento inválido (en subclase restrictiva)
     * // Si IteradorNumerico requiere NodoNumerico, pasar un Nodo normal
     * // provocará un error y retornará null.
     */
    nodo(elemento = null, callback = null) {
        let es_nodo = false;

        // Una sola llamada que valida y captura si el elemento es un nodo
        const es_valido = this.constructor.es_elemento_valido(elemento, (el, es) => {
            es_nodo = es;
        });

        if (!es_valido) {
            this.constructor._error("Iterador.nodo: el elemento no es válido");
            return null;
        }

        if (es_nodo) {
            if (callback) callback(elemento, true);
            return elemento;
        }

        // Crear un nuevo nodo del tipo adecuado
        const nodo_creado = this._crear_nodo_con_dato(elemento);
        if (callback) callback(nodo_creado, false);
        return nodo_creado;
    }

    /**
     * Crea un nodo del tipo adecuado con el dato proporcionado.
     *
     * Este método es invocado por {@link nodo} cuando el elemento no es un nodo
     * pero sí es válido. Las subclases deben sobrescribirlo para retornar
     * instancias de su tipo de nodo específico.
     *
     * @param {*} dato Dato con el que se creará el nodo.
     * @returns {Nodo} Nueva instancia de Nodo (o subclase) que encapsula `dato`.
     *
     * @since 1.5.0
     * @protected
     */
    _crear_nodo_con_dato(dato) {
        return Nodo.nodo(dato);
    }
}