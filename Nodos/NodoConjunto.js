// NodoConjunto.js
import { NodoNumerico } from './NodoNumerico.js';
import { Matriz2x2 } from './Matriz2x2.js';
import { Conf } from '../Configuracion/Configuracion.js';

class NodoConjunto extends NodoNumerico {
    static #diccionario = new Map();
    static #siguiente_negativo = -1;

    constructor() {
        super();
        this.#ordenado = false;
    }

    static _crear_interno(capacidad = Conf.CAPACIDAD_NODO_ELECTRICO, fuga = Conf.FUGA_NODO_ELECTRICO) {
        const identidad = Matriz2x2.crear_negativa(NodoConjunto.#siguiente_negativo);
        NodoConjunto.#siguiente_negativo--;

        const nodo = new NodoConjunto();
        nodo.#capacidad = capacidad;
        nodo.#fuga = fuga;
        nodo.#identidad = identidad;
        return nodo;
    }

    _nombre(nombre) {
        if (NodoConjunto.#diccionario.has(nombre)) {
            this.constructor._error(`El concepto '${nombre}' ya existe.`);
            return;
        }
        this._dato(nombre, 'nombre_concepto');
        NodoConjunto.#diccionario.set(nombre, this);
    }

    nombre() {
        return this.dato('nombre_concepto') ?? 'sin_nombre';
    }

    agregar_miembro(miembro) {
        this._adyacente_con_peso(miembro, 'miembro_' + miembro.id(), 1.0, 'pertenencia');
        miembro._adyacente_con_peso(this, 'conjunto_' + this.id(), 1.0, 'pertenencia');
    }

    quitar_miembro(miembro) {
        this.eliminar_adyacente('miembro_' + miembro.id());
        miembro.eliminar_adyacente('conjunto_' + this.id());
    }

    miembros() {
        const ady = this.adyacentes();
        if (!ady) return [];
        return Array.from(ady.entries())
            .filter(([n]) => n.startsWith('miembro_'))
            .map(([, nodo]) => nodo);
    }

    static obtener(nombre) {
        return NodoConjunto.#diccionario.get(nombre) ?? null;
    }

    static listar_todos() {
        return new Map(NodoConjunto.#diccionario);
    }
}