import { Comunicador } from './Comunicador.js';
import { RegistroGlobal } from '../Controlador/RegistroGlobal.js';
import { Entorno } from '../Configuracion/Entorno.js';
import { Conf } from '../Configuracion/Configuracion.js';
import { Objeto } from '../Nucleo/Objeto.js';

/**
 * Comunicador de salida para consola (depuración).
 *
 * Acumula los mensajes en un buffer interno y los imprime directamente
 * en la consola al invocar {@link enviar}.
 *
 * @class SalidaDepuracionConsola
 * @extends Comunicador
 * @since 1.3.3
 * @version 1.3.4
 */
export class SalidaDepuracionConsola extends Comunicador {
    /** @type {string[]} Buffer interno de mensajes. */
    buffer = [];

    static nombre() { return 'salida_depuracion_consola'; }
    static solo_desarrollo() { return false; }
    static descripcion() { return 'Comunicador de salida para consola (depuración).'; }

    /**
     * Envía un mensaje al buffer y lo imprime en `console.log`.
     *
     * @param {string} [destino=''] Ignorado.
     * @param {*}      [mensaje=null] Contenido a mostrar.
     * @param {Object} [opciones={}] Opciones adicionales.
     * @returns {void}
     */
    enviar(destino = '', mensaje = null, opciones = {}) {
        const texto = String(mensaje ?? '');
        this.buffer.push(texto);
        console.log(texto);
    }

    /** @inheritdoc */
    solicitar(destino, mensaje = null, opciones = {}) {
        this.enviar(destino, mensaje, opciones);
        return null;
    }

    /** @inheritdoc */
    escuchar(callback) { /* No aplica */ }

    /** @inheritdoc */
    cerrar() { this.buffer = []; }

    /** @inheritdoc */
    estado() { return 'abierto'; }

    /** @inheritdoc */
    autenticar(opciones) { /* Sin autenticación */ }

    /** @inheritdoc */
    establecer_credenciales(credenciales) { /* Sin credenciales */ }

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
RegistroGlobal.encolar_comunicador(SalidaDepuracionConsola);