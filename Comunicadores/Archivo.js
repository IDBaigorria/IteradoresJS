import { Comunicador } from './Comunicador.js';
import { Controlador } from '../Controlador/Controlador.js';
import { Entorno } from '../Configuracion/Entorno.js';
import { Conf } from '../Configuracion/Configuracion.js';
import { Objeto } from '../Nucleo/Objeto.js';

/**
 * Comunicador para lectura/escritura de archivos en el navegador.
 *
 * Usa la API de selección de archivos para leer y la generación de
 * Blobs para descargar. No tiene acceso al sistema de archivos real.
 *
 * @since 1.3.3
 */
export class Archivo extends Comunicador {
    static nombre() { return 'archivo'; }
    static solo_desarrollo() { return false; }
    static descripcion() { return 'Comunicador para leer y descargar archivos en el navegador.'; }

    /**
     * @param {string} destino   Nombre sugerido para la descarga.
     * @param {*}      mensaje   Contenido a descargar.
     * @param {Object} [opciones={}] Opciones adicionales.
     */
    enviar(destino = '', mensaje = null, opciones = {}) {
        const accion = opciones.accion || 'descargar';
        if (accion === 'descargar') {
            const blob = new Blob([String(mensaje)], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = destino || 'archivo.txt';
            a.click();
            URL.revokeObjectURL(url);
        }
    }

    /**
     * Lee un archivo seleccionado por el usuario.
     *
     * @param {string} destino   Ignorado (se usa el diálogo).
     * @param {*}      mensaje   Ignorado.
     * @param {Object} [opciones={}] Opciones.
     * @returns {Promise<string|null>}
     */
    solicitar(destino = '', mensaje = null, opciones = {}) {
        return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.onchange = () => {
                const file = input.files[0];
                if (!file) { resolve(null); return; }
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.readAsText(file);
            };
            input.click();
        });
    }

    /** @inheritdoc */
    escuchar(callback) {}

    /** @inheritdoc */
    cerrar() {}

    /** @inheritdoc */
    estado() { return 'activo'; }

    /** @inheritdoc */
    autenticar(opciones) {}

    /** @inheritdoc */
    establecer_credenciales(credenciales) {}
}
Controlador.encolar_comunicador(Archivo);