import { Conf } from '../../Configuracion/Configuracion.js';

/**
 * Interfaz FabricaDeNodosNumericos – Contrato para la creación de nodos numéricos.
 *
 * Centraliza las fábricas estáticas que permiten construir los distintos tipos
 * de nodos con identidad matricial: primos, secuencias compuestas y paralelos.
 *
 * Es implementada por {@link NodoNumerico}, que actúa como orquestador de todas
 * las creaciones.
 *
 * @author Ignacio David Baigorria
 *
 * @interface
 * @package Iteradores.Nodos.Interfaces
 * @version 1.4.4
 * @since 1.4.2
 * @see NodoNumerico
 * @see NodoPrimo
 * @see NodoParalelo
 */
class FabricaDeNodosNumericos {
    /**
     * Crea un nodo primo.
     *
     * @param {number} primo Número primo (positivo o negativo).
     * @param {number} [capacidad=Conf.CAPACIDAD_NODO_ELECTRICO]
     * @param {number} [fuga=Conf.FUGA_NODO_ELECTRICO]
     * @returns {NodoPrimo|null}
     * @abstract
     */
    static crear_primo(primo, capacidad = Conf.CAPACIDAD_NODO_ELECTRICO, fuga = Conf.FUGA_NODO_ELECTRICO) {
        throw new Error('crear_primo() debe ser implementado.');
    }

    /**
     * Crea un nodo numérico compuesto (secuencia ordenada).
     *
     * @param {NodoNumerico[]} componentes
     * @param {number} [capacidad=Conf.CAPACIDAD_NODO_ELECTRICO]
     * @param {number} [fuga=Conf.FUGA_NODO_ELECTRICO]
     * @returns {NodoNumerico|null}
     * @abstract
     */
    static crear_numerico(componentes, capacidad = Conf.CAPACIDAD_NODO_ELECTRICO, fuga = Conf.FUGA_NODO_ELECTRICO) {
        throw new Error('crear_numerico() debe ser implementado.');
    }

    /**
     * Crea un nodo de sincronización (paralelo).
     *
     * @param {NodoNumerico[]} componentes
     * @param {number} [capacidad=Conf.CAPACIDAD_NODO_ELECTRICO]
     * @param {number} [fuga=Conf.FUGA_NODO_ELECTRICO]
     * @returns {NodoParalelo|null}
     * @abstract
     */
    static crear_paralelo(componentes, capacidad = Conf.CAPACIDAD_NODO_ELECTRICO, fuga = Conf.FUGA_NODO_ELECTRICO) {
        throw new Error('crear_paralelo() debe ser implementado.');
    }
}

export { FabricaDeNodosNumericos };