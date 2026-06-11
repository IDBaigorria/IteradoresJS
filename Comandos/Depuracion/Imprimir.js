import { Comando } from '../Comando.js';
import { Controlador } from '../../Controlador/Controlador.js';
import { Entorno } from '../../Configuracion/Entorno.js';
import { Conf } from '../../Configuracion/Configuracion.js';
import { Objeto } from '../../Nucleo/Objeto.js';

/**
 * Comando que imprime errores, alertas y la superestructura.
 *
 * Solo está disponible en entornos de desarrollo y pruebas.
 * No es reversible.
 *
 * @since 1.3.1
 */
export class ComandoDepuracionImprimir extends Comando {
    static nombre() {
        return 'debug:imprimir';
    }

    static solo_desarrollo() {
        return true;
    }

    ejecutar(token, ...args) {
        if (!Entorno.permite_pruebas()) {
            console.log("El comando 'debug:imprimir' solo está disponible en desarrollo o pruebas.");
            return false;
        }

        console.log("%c--- ERRORES ---", `color: ${Conf.ERRORES_COLORES.texto}; background: ${Conf.ERRORES_COLORES.fondo};`);
        Objeto.imprimir_errores();
        console.log("%c--- ALERTAS ---", `color: ${Conf.ALERTAS_COLORES.texto}; background: ${Conf.ALERTAS_COLORES.fondo};`);
        Objeto.imprimir_alertas();
        console.log("%c--- SUPERESTRUCTURA ---", `color: ${Conf.NODOS_COLORES.texto}; background: ${Conf.NODOS_COLORES.fondo};`);
        Controlador.imprimir_superestructura(token);
        return true;
    }

    reversa() {
        return null;
    }
}

// ═══════════════════════════════════════════════════════════
// AUTOENCOLACIÓN: No debe faltar esta línea
// ═══════════════════════════════════════════════════════════
Controlador.encolar_comando(ComandoDepuracionImprimir);
// ✅ Ahora (sin ciclo)
/*import('../../Controlador/Controlador.js').then(module => {
    module.Controlador.encolar_comando(ComandoDepuracionImprimir);
});*/