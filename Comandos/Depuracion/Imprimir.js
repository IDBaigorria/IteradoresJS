import { Comando } from '../Comando.js';
import { RegistroGlobal } from '../../Controlador/RegistroGlobal.js';
import { Entorno } from '../../Configuracion/Entorno.js';
import { Objeto } from '../../Nucleo/Objeto.js';

/**
 * Comando que imprime errores, alertas y la superestructura.
 *
 * Solo está disponible en entornos de desarrollo y pruebas.
 * No es reversible.
 *
 * @class ComandoDepuracionImprimir
 * @extends Comando
 * @since 1.3.1
 * @version 1.3.4
 */
export class ComandoDepuracionImprimir extends Comando {
    static nombre() { return 'depuracion:imprimir'; }
    static solo_desarrollo() { return true; }

    static descripcion() {
        return 'Muestra los registros de errores, alertas y la superestructura. Sin argumentos, muestra todo.';
    }

    static parametros() {
        return [
            { nombre: 'errores', tipo: 'bandera', obligatorio: false, defecto: false, descripcion: 'Muestra solo los errores.' },
            { nombre: 'alertas',  tipo: 'bandera', obligatorio: false, defecto: false, descripcion: 'Muestra solo las alertas.' },
            { nombre: 'super',   tipo: 'bandera', obligatorio: false, defecto: false, descripcion: 'Muestra solo la superestructura.' },
        ];
    }

    static ejemplos() {
        return ['depuracion:imprimir', 'depuracion:imprimir --errores --alertas', 'depuracion:imprimir --super'];
    }

    ejecutar(token, args) {
        if (!Entorno.permite_pruebas()) {
            const ctrl = RegistroGlobal.controlador();
            ctrl?.escribir_salida("Solo desarrollo/pruebas.");
            return false;
        }

        const banderas = args.banderas;
        const mostrar_todo = !banderas.errores && !banderas.alertas && !banderas.super;

        if (mostrar_todo || banderas.errores) Objeto.imprimir_errores();
        if (mostrar_todo || banderas.alertas) Objeto.imprimir_alertas();
        if (mostrar_todo || banderas.super) {
            const ctrl = RegistroGlobal.controlador();
            ctrl?.imprimir_superestructura();
        }

        if (!Entorno.es_consola()) {
            const cont_errores = document.getElementById('errores-log');
            const cont_alertas = document.getElementById('alertas-log');
            const cont_nodos   = document.getElementById('nodos-log');
            if (cont_errores) cont_errores.style.display = (mostrar_todo || banderas.errores) ? '' : 'none';
            if (cont_alertas) cont_alertas.style.display = (mostrar_todo || banderas.alertas) ? '' : 'none';
            if (cont_nodos)   cont_nodos.style.display   = (mostrar_todo || banderas.super)   ? '' : 'none';
        }

        return true;
    }

    reversa() { return null; }
}

// Autoencolación
RegistroGlobal.encolar_comando(ComandoDepuracionImprimir);