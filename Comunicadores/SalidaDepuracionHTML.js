import { Comunicador } from './Comunicador.js';
import { Controlador } from '../Controlador/Controlador.js';
import { Entorno } from '../Configuracion/Entorno.js';
import { Conf } from '../Configuracion/Configuracion.js';
import { Objeto } from '../Nucleo/Objeto.js';

/**
 * Comunicador de salida HTML para depuración.
 *
 * @since 1.3.3
 */
export class SalidaDepuracionHTML extends Comunicador {
    buffer = [];

    static nombre() { return 'salida_depuracion_html'; }
    static solo_desarrollo() { return false; }
    static descripcion() { return 'Comunicador de salida HTML para depuración.'; }

    enviar(destino = '', mensaje = null, opciones = {}) {
        const texto = String(mensaje ?? '');
        this.buffer.push(texto);
        let contenedor = document.getElementById('salida-estandar');
        if (!contenedor) {
            contenedor = document.createElement('div');
            contenedor.id = 'salida-estandar';
            contenedor.style.cssText = 'font-family: monospace; white-space: pre-wrap; margin: 1em 0;';
            document.body.appendChild(contenedor);
        }
        contenedor.innerHTML += texto + '\n';
    }

    solicitar(destino, mensaje = null, opciones = {}) {
        this.enviar(destino, mensaje, opciones);
        return null;
    }

    escuchar(callback) {}
    cerrar() { this.buffer = []; }
    estado() { return 'abierto'; }
    autenticar(opciones) {}
    establecer_credenciales(credenciales) {}

    obtener_buffer() { return this.buffer.join('\n'); }
    limpiar_buffer() { this.buffer = []; }
}

// ═══════════════════════════════════════════════════════════
// AUTOENCOLACIÓN
// ═══════════════════════════════════════════════════════════
Controlador.encolar_comunicador(SalidaDepuracionHTML);