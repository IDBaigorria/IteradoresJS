import { Comunicador } from './Comunicador.js';
import { RegistroGlobal } from '../Controlador/RegistroGlobal.js';
import { Entorno } from '../Configuracion/Entorno.js';
import { Conf } from '../Configuracion/Configuracion.js';
import { Objeto } from '../Nucleo/Objeto.js';

/**
 * Comunicador de salida HTML para depuración.
 *
 * Acumula los mensajes en un buffer y los muestra en un contenedor
 * dentro del DOM (`#salida-estandar`).
 *
 * @class SalidaDepuracionHTML
 * @extends Comunicador
 * @since 1.3.3
 * @version 1.3.4
 */
export class SalidaDepuracionHTML extends Comunicador {
    /** @type {string[]} Buffer interno de mensajes. */
    buffer = [];

    static nombre() { return 'salida_depuracion_html'; }
    static solo_desarrollo() { return false; }
    static descripcion() { return 'Comunicador de salida HTML para depuración.'; }

    /**
     * Añade un mensaje al contenedor HTML de salida.
     *
     * @param {string} [destino=''] Ignorado.
     * @param {*}      [mensaje=null] Contenido a mostrar.
     * @param {Object} [opciones={}] Opciones adicionales.
     * @returns {void}
     */
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

    /** @inheritdoc */
    solicitar(destino, mensaje = null, opciones = {}) {
        this.enviar(destino, mensaje, opciones);
        return null;
    }

    /** @inheritdoc */
    escuchar(callback) {}

    /** @inheritdoc */
    cerrar() { this.buffer = []; }

    /** @inheritdoc */
    estado() { return 'abierto'; }

    /** @inheritdoc */
    autenticar(opciones) {}

    /** @inheritdoc */
    establecer_credenciales(credenciales) {}

    /**
     * Devuelve el contenido acumulado en el buffer.
     * @returns {string}
     */
    obtener_buffer() { return this.buffer.join('\n'); }

    /**
     * Vacía el buffer interno.
     * @returns {void}
     */
    limpiar_buffer() { this.buffer = []; }
}

// ═══════════════════════════════════════════════════════════
// AUTOENCOLACIÓN
// ═══════════════════════════════════════════════════════════
RegistroGlobal.encolar_comunicador(SalidaDepuracionHTML);