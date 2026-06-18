import { Comando } from '../Comando.js';
import { RegistroGlobal } from '../../Controlador/RegistroGlobal.js';
import { Entorno } from '../../Configuracion/Entorno.js';
import { Objeto } from '../../Nucleo/Objeto.js';

/**
 * Comando que limpia las pilas de errores y alertas acumuladas.
 *
 * Sin argumentos, limpia ambas pilas. Se puede limitar la limpieza
 * a una de las dos mediante las banderas `--errores` o `--alertas`.
 *
 * **Entorno:** solo disponible en desarrollo y pruebas.
 * **Reversible:** No.
 *
 * @class ComandoDepuracionLimpiar
 * @extends Comando
 * @since 1.3.1
 * @version 1.3.4
 */
export class ComandoDepuracionLimpiar extends Comando {
    static nombre() { return 'depuracion:limpiar'; }
    static solo_desarrollo() { return true; }

    static descripcion() {
        return 'Limpia las pilas de errores y alertas acumuladas. Sin argumentos, limpia ambas.';
    }

    static parametros() {
        return [
            { nombre: 'errores', tipo: 'bandera', obligatorio: false, defecto: false, descripcion: 'Limpia solo los errores.' },
            { nombre: 'alertas',  tipo: 'bandera', obligatorio: false, defecto: false, descripcion: 'Limpia solo las alertas.' },
            { nombre: 'todo',    tipo: 'bandera', obligatorio: false, defecto: false, descripcion: 'Limpia ambas pilas (explícito).' },
        ];
    }

    static ejemplos() {
        return [
            'depuracion:limpiar',
            'depuracion:limpiar --errores',
            'depuracion:limpiar --alertas',
            'depuracion:limpiar --todo',
        ];
    }

    /**
     * Ejecuta la limpieza de pilas de errores y/o alertas.
     *
     * @param {string} token Token de seguridad.
     * @param {Object} args  Argumentos parseados (contiene `banderas`).
     * @returns {boolean} `true` si se ejecutó correctamente.
     */
    ejecutar(token, args) {
        if (!Entorno.permite_pruebas()) {
            const ctrl = RegistroGlobal.controlador();
            ctrl?.escribir_salida("El comando 'depuracion:limpiar' solo está disponible en desarrollo o pruebas.");
            return false;
        }

        const banderas = args.banderas;
        const limpiar_errores = banderas.errores || banderas.todo || (!banderas.errores && !banderas.alertas && !banderas.todo);
        const limpiar_alertas = banderas.alertas || banderas.todo || (!banderas.errores && !banderas.alertas && !banderas.todo);

        const ctrl = RegistroGlobal.controlador();

        if (limpiar_errores) {
            Objeto.limpiar_errores();
            ctrl?.escribir_salida('Pila de errores limpiada.');
        }
        if (limpiar_alertas) {
            Objeto.limpiar_alertas();
            ctrl?.escribir_salida('Pila de alertas limpiada.');
        }

        return true;
    }

    reversa() { return null; }
}

// ═══════════════════════════════════════════════════════════
// AUTOENCOLACIÓN
// ═══════════════════════════════════════════════════════════
RegistroGlobal.encolar_comando(ComandoDepuracionLimpiar);