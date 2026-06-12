import { Comando } from '../Comando.js';
import { Controlador } from '../../Controlador/Controlador.js';
import { NodoElectrico } from '../../Nodos/index.js';

/**
 * Comando de prueba que crea un nodo eléctrico y permite deshacer la creación.
 *
 * Acepta un argumento posicional `dato` obligatorio y las opciones
 * `--capacidad` y `--fuga` opcionales.
 *
 * **Reversible:** Sí – elimina el nodo creado.
 *
 * @since 1.3.2
 */
export class ComandoPruebaCrearNodo extends Comando {
    /** @type {number} */
    nodo_creado_id;

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

    ejecutar(token, args) {
        const dato = args.posicionales?.[0] ?? 'Nodo de prueba';
        const capacidad = parseInt(args.opciones?.capacidad ?? 100);
        const fuga = parseFloat(args.opciones?.fuga ?? 0);

        const nodo = NodoElectrico.crear_con_dato(dato, false, capacidad, fuga);
        this.nodo_creado_id = nodo.id();

        return `Nodo creado con id: ${this.nodo_creado_id}`;
    }

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

Controlador.encolar_comando(ComandoPruebaCrearNodo);