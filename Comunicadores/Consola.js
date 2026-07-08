import { Comunicador } from './Comunicador.js';
import { Talamo } from '../Controlador/Talamo.js';
import { Senal } from '../Controlador/Senal.js';
import { RegistroGlobal } from '../Controlador/RegistroGlobal.js';

/**
 * Comunicador del sistema para la consola (entrada/salida).
 *
 * En navegador, la salida se hace con `console.log` y la entrada
 * se simula mediante `prompt()`. En Node.js podría adaptarse a
 * `process.stdin`. La traducción entre bytes y señales se delega
 * en el {@link Talamo}.
 *
 * @class Consola
 * @extends Comunicador
 * @since 1.3.3 (anteriormente SalidaDepuracionConsola)
 * @version 1.4.7
 */
export class Consola extends Comunicador {
    /**
     * Buffer interno de mensajes.
     * @type {string[]}
     */
    buffer = [];

    /**
     * @returns {string}
     * @since 1.3.3
     */
    static nombre() { return 'consola'; }

    /**
     * @returns {boolean}
     * @since 1.3.3
     */
    static solo_desarrollo() { return false; }

    /**
     * @returns {string}
     * @since 1.3.3
     */
    static descripcion() { return 'Comunicador del sistema para entrada/salida por consola.'; }

    /**
     * Envía una señal a la consola del navegador.
     *
     * @param {string} destino Ignorado.
     * @param {Senal}  senal   Señal cuyos bytes se imprimirán.
     * @returns {void}
     * @since 1.3.3
     * @version 1.4.7
     */
    enviar(destino, senal) {
        const texto = Talamo.obtener().traducir_salida(senal);
        this.buffer.push(texto);
        console.log(texto);
    }

    /**
     * Simula la lectura de una línea desde la consola mediante `prompt`.
     *
     * @param {string} fuente Ignorado.
     * @returns {Senal} Señal con la cadena ingresada (vacía si se cancela).
     * @since 1.4.7
     */
    solicitar(fuente) {
        const entrada = prompt("Entrada de consola:");
        const texto = entrada !== null ? entrada : '';
        return Talamo.obtener().traducir_entrada(texto);
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
RegistroGlobal.encolar_comunicador(Consola);