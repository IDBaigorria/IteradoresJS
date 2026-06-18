import { Comando } from '../Comando.js';
import { RegistroGlobal } from '../../Controlador/RegistroGlobal.js';
import { Entorno } from '../../Configuracion/Entorno.js';
import { Objeto } from '../../Nucleo/Objeto.js';

/**
 * Comando que activa o desactiva la recolección de errores y alertas.
 *
 * El primer argumento posicional debe ser 'activar' o 'desactivar'.
 * Sin banderas adicionales, afecta a ambos sistemas. Se puede limitar
 * el efecto a uno de los dos usando `--errores` o `--alertas`.
 *
 * **Entorno:** solo disponible en desarrollo y pruebas.
 * **Reversible:** No.
 *
 * @class ComandoDepuracionRecoleccion
 * @extends Comando
 * @since 1.3.1
 * @version 1.3.4
 */
export class ComandoDepuracionRecoleccion extends Comando {
    static nombre() { return 'depuracion:recoleccion'; }
    static solo_desarrollo() { return true; }

    static descripcion() {
        return 'Activa o desactiva la recolección de errores y alertas.';
    }

    static parametros() {
        return [
            {
                nombre: 'accion',
                tipo: 'posicional',
                obligatorio: true,
                descripcion: 'Acción a realizar: "activar" o "desactivar".',
                valores: ['activar', 'desactivar'],
            },
            { nombre: 'errores', tipo: 'bandera', obligatorio: false, defecto: false, descripcion: 'Afecta solo a la recolección de errores.' },
            { nombre: 'alertas',  tipo: 'bandera', obligatorio: false, defecto: false, descripcion: 'Afecta solo a la recolección de alertas.' },
        ];
    }

    static ejemplos() {
        return [
            'depuracion:recoleccion activar',
            'depuracion:recoleccion desactivar --errores',
            'depuracion:recoleccion activar --alertas',
            'depuracion:recoleccion desactivar',
        ];
    }

    /**
     * Ejecuta la activación o desactivación de la recolección.
     *
     * @param {string} token Token de seguridad.
     * @param {Object} args  Argumentos parseados (contiene `posicionales` y `banderas`).
     * @returns {boolean} `true` si se ejecutó correctamente.
     */
    ejecutar(token, args) {
        if (!Entorno.permite_pruebas()) {
            const ctrl = RegistroGlobal.controlador();
            ctrl?.escribir_salida("El comando 'depuracion:recoleccion' solo está disponible en desarrollo o pruebas.");
            return false;
        }

        const posicionales = args.posicionales;
        const banderas = args.banderas;
        const accion = posicionales[0] ?? null;
        const afectar_errores = banderas.errores || (!banderas.errores && !banderas.alertas);
        const afectar_alertas = banderas.alertas || (!banderas.errores && !banderas.alertas);

        const ctrl = RegistroGlobal.controlador();

        if (accion === 'activar') {
            if (afectar_errores) {
                Objeto.activar_errores();
                ctrl?.escribir_salida('Recolección de errores activada.');
            }
            if (afectar_alertas) {
                Objeto.activar_alertas();
                ctrl?.escribir_salida('Recolección de alertas activada.');
            }
        } else if (accion === 'desactivar') {
            if (afectar_errores) {
                Objeto.desactivar_errores();
                ctrl?.escribir_salida('Recolección de errores desactivada.');
            }
            if (afectar_alertas) {
                Objeto.desactivar_alertas();
                ctrl?.escribir_salida('Recolección de alertas desactivada.');
            }
        } else {
            ctrl?.escribir_salida(`Acción no reconocida: '${accion}'. Use 'activar' o 'desactivar'.`);
            return false;
        }

        return true;
    }

    reversa() { return null; }
}

// ═══════════════════════════════════════════════════════════
// AUTOENCOLACIÓN
// ═══════════════════════════════════════════════════════════
RegistroGlobal.encolar_comando(ComandoDepuracionRecoleccion);