import { Comando } from '../Comando.js';
import { Controlador } from '../../Controlador/Controlador.js';
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
 * @since 1.3.1
 * @version 1.3.2
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

    ejecutar(token, args) {
        if (!Entorno.permite_pruebas()) {
            console.log("El comando 'depuracion:recoleccion' solo está disponible en desarrollo o pruebas.");
            return false;
        }

        const posicionales = args.posicionales;
        const banderas = args.banderas;
        const accion = posicionales[0] ?? null;
        const afectarErrores = banderas.errores || (!banderas.errores && !banderas.alertas);
        const afectarAlertas = banderas.alertas || (!banderas.errores && !banderas.alertas);

        if (accion === 'activar') {
            if (afectarErrores) {
                Objeto.activar_errores();
                console.log('Recolección de errores activada.');
            }
            if (afectarAlertas) {
                Objeto.activar_alertas();
                console.log('Recolección de alertas activada.');
            }
        } else if (accion === 'desactivar') {
            if (afectarErrores) {
                Objeto.desactivar_errores();
                console.log('Recolección de errores desactivada.');
            }
            if (afectarAlertas) {
                Objeto.desactivar_alertas();
                console.log('Recolección de alertas desactivada.');
            }
        } else {
            console.log(`Acción no reconocida: '${accion}'. Use 'activar' o 'desactivar'.`);
            return false;
        }

        return true;
    }

    reversa() { return null; }
}

// ═══════════════════════════════════════════════════════════
// AUTOENCOLACIÓN
// ═══════════════════════════════════════════════════════════
Controlador.encolar_comando(ComandoDepuracionRecoleccion);