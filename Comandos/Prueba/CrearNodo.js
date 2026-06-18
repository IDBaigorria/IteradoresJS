import { Comando } from '../Comando.js';
import { RegistroGlobal } from '../../Controlador/RegistroGlobal.js';
import { NodoElectrico } from '../../Nodos/index.js';

/**
 * Comando de prueba que crea un nodo eléctrico y permite deshacer la creación.
 *
 * Acepta un argumento posicional `dato` obligatorio y las opciones
 * `--capacidad` y `--fuga` opcionales.
 *
 * **Reversible:** Sí – elimina el nodo creado.
 *
 * @class ComandoPruebaCrearNodo
 * @extends Comando
 * @since 1.3.2
 * @version 1.3.4
 */
export class ComandoPruebaCrearNodo extends Comando {
    /** @type {number|null} ID del nodo creado, para la reversa. */
    nodo_creado_id = null;

    static nombre() { return 'prueba:crear_nodo'; }
    static solo_desarrollo() { return false; }

    static descripcion() {
        return 'Crea un nodo eléctrico con el dato indicado. (Comando de prueba reversible)';
    }

    static parametros() {
        return [
            { nombre: 'dato', tipo: 'posicional', obligatorio: true, descripcion: 'Dato a encapsular en el nuevo nodo.' },
            { nombre: 'capacidad', tipo: 'opcion', obligatorio: false, defecto: 100, descripcion: 'Capacidad máxima (por defecto 100).' },
            { nombre: 'fuga', tipo: 'opcion', obligatorio: false, defecto: 0, descripcion: 'Fuga de energía por ciclo (por defecto 0).' },
        ];
    }

    static ejemplos() {
        return [
            "prueba:crear_nodo 'Sensor'",
            "prueba:crear_nodo 'Motor' --capacidad=200 --fuga=0.5",
        ];
    }

    /**
     * Crea un nodo eléctrico con los parámetros indicados.
     *
     * @param {string} token Token de seguridad.
     * @param {Object} args  Argumentos parseados (contiene `posicionales` y `opciones`).
     * @returns {string} Mensaje con el ID del nodo creado.
     */
    ejecutar(token, args) {
        const dato = args.posicionales?.[0] ?? 'Nodo de prueba';
        const capacidad = parseInt(args.opciones?.capacidad ?? 100);
        const fuga = parseFloat(args.opciones?.fuga ?? 0);

        const nodo = NodoElectrico.crear_con_dato(dato, false, capacidad, fuga);
        this.nodo_creado_id = nodo.id();

        return `Nodo creado con id: ${this.nodo_creado_id}`;
    }

    /**
     * Proporciona la función de reversa que elimina el nodo creado.
     *
     * @returns {Function} Callback que recibe token y args, y deshace la creación.
     */
    reversa() {
        const id = this.nodo_creado_id;
        return (token, args) => {
            const nodo = NodoElectrico.existe(id) ? NodoElectrico.nodo_por_id(id) : null;
            if (!nodo) {
                return `El nodo ${id} ya no existe.`;
            }
            NodoElectrico.eliminar(nodo);
            return `Nodo ${id} eliminado por reversa.`;
        };
    }
}

// ═══════════════════════════════════════════════════════════
// AUTOENCOLACIÓN
// ═══════════════════════════════════════════════════════════
RegistroGlobal.encolar_comando(ComandoPruebaCrearNodo);