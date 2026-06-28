// NodoPrimo.js
import { NodoNumerico } from './NodoNumerico.js';
import { Matriz2x2 } from './Matriz2x2.js';
import { Conf } from '../Configuracion/Configuracion.js';

class NodoPrimo extends NodoNumerico {
    #numero_primo;

    constructor(numero_primo) {
        super();
        this.#numero_primo = numero_primo;
        this.#ordenado = true;
        this.#identidad = Matriz2x2.crear_prima(numero_primo);
    }

    static _crear_interno(numero_primo, capacidad = Conf.CAPACIDAD_NODO_ELECTRICO, fuga = Conf.FUGA_NODO_ELECTRICO) {
        const nodo = new NodoPrimo(numero_primo);
        nodo.#capacidad = capacidad;
        nodo.#fuga = fuga;
        const fase = NodoNumerico.fase();
        if (!NodoNumerico.#primos_libres_por_fase.has(fase)) {
            NodoNumerico.#primos_libres_por_fase.set(fase, []);
        }
        NodoNumerico.#primos_libres_por_fase.get(fase).push(nodo);
        return nodo;
    }

    get numero_primo() { return this.#numero_primo; }
    es_primo() { return true; }
    factorizar() { this.constructor._error('Un NodoPrimo no puede factorizarse en su misma fase.'); }
}