import { Comunicador } from './Comunicador.js';
import { Talamo } from '../Controlador/Talamo.js';
import { Senal } from '../Iteradores/Senal.js';
import { RegistroGlobal } from '../Controlador/RegistroGlobal.js';

/**
 * Comunicador del sistema para salida HTML en el navegador.
 *
 * Escribe el contenido de las señales en un contenedor con id
 * `salida-estandar`. No admite entrada. La traducción entre
 * bytes y señales se delega en el {@link Talamo}.
 *
 * @author Ignacio David Baigorria
 * 
 * @class HTML
 * @extends Comunicador
 * @since 1.3.3 (anteriormente SalidaDepuracionHTML)
 * @version 1.4.7
 */
export class HTML extends Comunicador {
    /**
     * Buffer interno de mensajes.
     * @type {string[]}
     */
    buffer = [];

    /**
     * @returns {string}
     * @since 1.3.3
     */
    static nombre() { return 'html'; }

    /**
     * @returns {boolean}
     * @since 1.3.3
     */
    static solo_desarrollo() { return false; }

    /**
     * @returns {string}
     * @since 1.3.3
     */
    static descripcion() { return 'Comunicador del sistema para salida HTML (solo envío).'; }

    /**
     * Envía una señal al DOM, dentro del contenedor `#salida-estandar`.
     *
     * @param {string} destino Ignorado.
     * @param {Senal}  senal   Señal cuyos bytes se mostrarán como texto.
     * @returns {void}
     * @since 1.3.3
     * @version 1.4.7
     */
    enviar(destino, senal) {
        const texto = Talamo.obtener().traducir_salida(senal);
        this.buffer.push(texto);
        let contenedor = document.getElementById('salida-estandar');
        if (!contenedor) {
            contenedor = document.createElement('div');
            contenedor.id = 'salida-estandar';
            contenedor.style.cssText = 'font-family: monospace; white-space: pre-wrap; margin: 1em 0;';
            document.body.appendChild(contenedor);
        }
        // Escapamos HTML para evitar inyección
        contenedor.innerHTML += texto.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '\n';
    }

    /**
     * Operación no soportada: HTML es solo de salida.
     *
     * @param {string} fuente Ignorado.
     * @throws {Error} Siempre.
     * @returns {never}
     * @since 1.4.7
     */
    solicitar(fuente) {
        throw new Error('El comunicador HTML no admite lectura.');
    }

    /**
     * @inheritdoc
     * @since 1.3.3
     */
    escuchar(callback) {}

    /**
     * @inheritdoc
     * @since 1.3.3
     */
    cerrar() { this.buffer = []; }

    /**
     * @returns {string}
     * @since 1.3.3
     */
    estado() { return 'abierto'; }

    /**
     * @inheritdoc
     * @since 1.3.3
     */
    autenticar(opciones) {}

    /**
     * @inheritdoc
     * @since 1.3.3
     */
    establecer_credenciales(credenciales) {}

    /**
     * Devuelve el contenido acumulado en el buffer.
     * @returns {string}
     * @since 1.3.3
     */
    obtener_buffer() { return this.buffer.join('\n'); }

    /**
     * Vacía el buffer interno.
     * @returns {void}
     * @since 1.3.3
     */
    limpiar_buffer() { this.buffer = []; }
}

// ═══════════════════════════════════════════════════════════
// AUTOENCOLACIÓN
// ═══════════════════════════════════════════════════════════
RegistroGlobal.encolar_comunicador(HTML);