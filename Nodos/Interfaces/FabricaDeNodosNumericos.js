import { FabricaDeNodosElectricos } from './FabricaDeNodosElectricos.js';
import { Conf } from '../../Configuracion/Configuracion.js';

/**
 * Interfaz que define las fábricas centralizadas de nodos numéricos.
 *
 * Extiende {@link FabricaDeNodosElectricos} y es implementada por
 * {@link NodoNumerico}, que actúa como orquestador de sus tres subclases.
 *
 * @interface
 * @extends FabricaDeNodosElectricos
 * @since 1.4.2
 */
class FabricaDeNodosNumericos extends FabricaDeNodosElectricos {
    /**
     * Crea un nodo numérico con una identidad no prima.
     *
     * @param {Matriz2x2} identidad
     * @param {number} [capacidad=Conf.CAPACIDAD_NODO_ELECTRICO]
     * @param {number} [fuga=Conf.FUGA_NODO_ELECTRICO]
     * @returns {NodoNumerico|null}
     */
    static crear_numerico(identidad, capacidad = Conf.CAPACIDAD_NODO_ELECTRICO, fuga = Conf.FUGA_NODO_ELECTRICO) {
        throw new Error('crear_numerico() debe ser implementado.');
    }

    /**
     * Crea (o recupera) un nodo primo.
     *
     * @param {number} primo
     * @param {number} [capacidad=Conf.CAPACIDAD_NODO_ELECTRICO]
     * @param {number} [fuga=Conf.FUGA_NODO_ELECTRICO]
     * @returns {NodoPrimo|null}
     */
    static crear_primo(primo, capacidad = Conf.CAPACIDAD_NODO_ELECTRICO, fuga = Conf.FUGA_NODO_ELECTRICO) {
        throw new Error('crear_primo() debe ser implementado.');
    }

    /**
     * Crea un nodo de sincronización.
     *
     * @param {NodoNumerico[]} componentes
     * @param {number} [capacidad=Conf.CAPACIDAD_NODO_ELECTRICO]
     * @param {number} [fuga=Conf.FUGA_NODO_ELECTRICO]
     * @returns {NodoParalelo|null}
     */
    static crear_paralelo(componentes, capacidad = Conf.CAPACIDAD_NODO_ELECTRICO, fuga = Conf.FUGA_NODO_ELECTRICO) {
        throw new Error('crear_paralelo() debe ser implementado.');
    }

    /**
     * Crea un nuevo concepto semántico.
     *
     * @param {number} [capacidad=Conf.CAPACIDAD_NODO_ELECTRICO]
     * @param {number} [fuga=Conf.FUGA_NODO_ELECTRICO]
     * @returns {NodoConjunto}
     */
    static crear_conjunto(capacidad = Conf.CAPACIDAD_NODO_ELECTRICO, fuga = Conf.FUGA_NODO_ELECTRICO) {
        throw new Error('crear_conjunto() debe ser implementado.');
    }

    /**
     * Recupera un nodo del índice global por su identidad.
     *
     * @param {Matriz2x2} identidad
     * @returns {NodoNumerico|null}
     */
    static nodo_por_identidad(identidad) {
        throw new Error('nodo_por_identidad() debe ser implementado.');
    }
}

export { FabricaDeNodosNumericos };