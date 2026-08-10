import { IteradorElectrico } from './IteradorElectrico.js';

/**
 * Itera sobre nodos numéricos y gestiona el ascenso de patrones.
 *
 * @class IteradorNumerico
 * @extends IteradorElectrico
 * @since 1.5.0
 * @version 1.5.0
 */
export class IteradorNumerico extends IteradorElectrico {
    /**
     * Constructor.
     * @param {NodoNumerico} nodo Nodo numérico inicial.
     */
    constructor(nodo) {
        super(nodo);
    }

	//********************************************************************************
	//------------------------------------------------------------------------------->
	//---------------------- Interfaz de creación de nodos y validacion de elementos >
	//------------------------------------------------------------------------------->
    /**
     * Verifica si un elemento es válido para este iterador numérico.
     *
     * Solo acepta instancias de {@link NodoNumerico} (o subclases).
     *
     * @param {*} elemento
     * @param {function(NodoNumerico, boolean)=} callback
     * @returns {boolean} `true` si el elemento es un NodoNumerico.
     * @since 1.5.0
     */
    static es_elemento_valido(elemento, callback = null) {
        const es_nodo = elemento instanceof NodoNumerico;
        if (callback) callback(elemento, es_nodo);
        return es_nodo;
    }
    
    /**
     * Crea un nodo numérico con el dato proporcionado.
     *
     * @param {*} dato Dato a encapsular.
     * @returns {NodoNumerico}
     * @since 1.5.0
     * @protected
     */
    _crear_nodo_con_dato(dato) {
        return NodoNumerico.nodo(dato);
    }
}