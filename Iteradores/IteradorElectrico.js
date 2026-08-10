import { Iterador } from './Iterador.js';

/**
 * Itera sobre nodos eléctricos en el grafo.
 *
 * @class IteradorElectrico
 * @extends Iterador
 * @since 1.5.0
 * @version 1.5.0
 */
export class IteradorElectrico extends Iterador {
    /**
     * Constructor.
     * @param {NodoElectrico} nodo Nodo eléctrico inicial.
     */
    constructor(nodo) {
        super(nodo);
    }

	//********************************************************************************
	//------------------------------------------------------------------------------->
	//---------------------- Interfaz de creación de nodos y validacion de elementos >
	//------------------------------------------------------------------------------->
     /**
     * Verifica si un elemento es válido para este iterador eléctrico.
     *
     * Solo acepta instancias de {@link NodoElectrico} (o subclases).
     *
     * @param {*} elemento
     * @param {function(NodoElectrico, boolean)=} callback
     * @returns {boolean} `true` si el elemento es un NodoElectrico.
     * @since 1.5.0
     */
    static es_elemento_valido(elemento, callback = null) {
        const es_nodo = elemento instanceof NodoElectrico;
        if (callback) callback(elemento, es_nodo);
        return es_nodo;
    }

    /**
     * Crea un nodo eléctrico con el dato proporcionado.
     *
     * @param {*} dato Dato a encapsular.
     * @returns {NodoElectrico}
     * @since 1.5.0
     * @protected
     */
    _crear_nodo_con_dato(dato) {
        return NodoElectrico.nodo(dato);
    }

    
}