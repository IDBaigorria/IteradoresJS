// NodoParalelo.js
import { NodoNumerico } from './NodoNumerico.js';
import { Matriz2x2 } from './Matriz2x2.js';
import { Conf } from '../Configuracion/Configuracion.js';

class NodoParalelo extends NodoNumerico {
    constructor() {
        super();
        this.#ordenado = false;
    }

    static _crear_interno(componentes, capacidad = Conf.CAPACIDAD_NODO_ELECTRICO, fuga = Conf.FUGA_NODO_ELECTRICO) {
        const cantidad = componentes.length;
        if (!NodoNumerico.#es_primo(cantidad)) {
            NodoNumerico._error('La cantidad de componentes debe ser un número primo.');
            return null;
        }

        const ordenados = [...componentes].sort((a, b) =>
            a.identidad.toString().localeCompare(b.identidad.toString())
        );

        const marca = NodoParalelo.#obtener_matriz_marca_sincronizacion();
        let matriz = marca;
        for (const comp of ordenados) {
            matriz = matriz.multiplicar(comp.identidad);
        }

        const clave = matriz.toString();
        if (NodoNumerico.#indice_identidad.has(clave)) {
            return NodoNumerico.#indice_identidad.get(clave);
        }

        const nodo = new NodoParalelo();
        nodo.#capacidad = capacidad;
        nodo.#fuga = fuga;
        nodo.#identidad = matriz;

        for (let i = 0; i < cantidad; i++) {
            nodo._adyacente_en(ordenados[i], 'componente_' + (i + 1), true);
        }

        NodoNumerico.#indice_identidad.set(clave, nodo);
        return nodo;
    }

    static #obtener_matriz_marca_sincronizacion() {
        if (!NodoParalelo.#marca_cache) {
            const m = Conf.MATRIZ_MARCA_CONJUNTO;
            NodoParalelo.#marca_cache = new Matriz2x2(m[0][0], m[0][1], m[1][0], m[1][1]);
        }
        return NodoParalelo.#marca_cache;
    }
    static #marca_cache = null;
}