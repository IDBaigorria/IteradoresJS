import { Comando } from '../Comando.js';
import { Controlador } from '../../Controlador/Controlador.js';
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
 * @since 1.3.1
 * @version 1.3.2
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

    ejecutar(token, args) {
        if (!Entorno.permite_pruebas()) {
            console.log("El comando 'depuracion:limpiar' solo está disponible en desarrollo o pruebas.");
            return false;
        }

        const banderas = args.banderas;
        const limpiarErrores = banderas.errores || banderas.todo || (!banderas.errores && !banderas.alertas && !banderas.todo);
        const limpiarAlertas = banderas.alertas || banderas.todo || (!banderas.errores && !banderas.alertas && !banderas.todo);

        if (limpiarErrores) {
            Objeto.limpiar_errores();
            console.log('Pila de errores limpiada.');
        }
        if (limpiarAlertas) {
            Objeto.limpiar_alertas();
            console.log('Pila de alertas limpiada.');
        }

        return true;
    }

    reversa() { return null; }
}

// ═══════════════════════════════════════════════════════════
// AUTOENCOLACIÓN
// ═══════════════════════════════════════════════════════════
Controlador.encolar_comando(ComandoDepuracionLimpiar);