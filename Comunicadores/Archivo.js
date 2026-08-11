import { Comunicador } from './Comunicador.js';
import { RegistroGlobal } from '../Controlador/RegistroGlobal.js';
import { Talamo } from '../Controlador/Talamo.js';
import { Senal } from '../Iteradores/Senal.js';

/**
 * Comunicador para lectura/escritura de archivos en el navegador.
 *
 * Usa la API de selección de archivos (`<input type="file">`) para leer
 * y genera Blobs/descargas para escribir. No tiene acceso al sistema
 * de archivos real.
 *
 * A partir de la versión 1.4.7, la conversión entre bytes y {@link Senal}
 * se delega en el {@link Talamo}.
 *
 * @author Ignacio David Baigorria
 * 
 * @class Archivo
 * @extends Comunicador
 * @since 1.3.3
 * @version 1.4.7
 */
export class Archivo extends Comunicador {
    /**
     * @returns {string}
     * @since 1.3.3
     */
    static nombre() { return 'archivo'; }

    /**
     * @returns {boolean}
     * @since 1.3.3
     */
    static solo_desarrollo() { return false; }

    /**
     * @returns {string}
     * @since 1.3.3
     */
    static descripcion() { return 'Comunicador para leer y descargar archivos en el navegador.'; }

    /**
     * Descarga una señal como archivo.
     *
     * @param {string} destino Nombre sugerido para la descarga.
     * @param {Senal}  senal   Señal cuyos bytes se descargarán.
     * @returns {void}
     * @since 1.3.3
     * @version 1.4.7
     */
    enviar(destino = '', senal) {
        const bytes = Talamo.obtener().traducir_salida(senal);
        const blob = new Blob([bytes], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = destino || 'archivo.bin';
        a.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Lee un archivo seleccionado por el usuario y lo devuelve como una señal.
     *
     * @param {string} [fuente=''] Ignorado (se usa para mantener la interfaz uniforme).
     * @returns {Promise<Senal|null>} Señal con el contenido o `null` si se cancela.
     * @since 1.3.3
     * @version 1.4.7
     */
    solicitar(fuente = '') {
        return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.onchange = () => {
                const file = input.files[0];
                if (!file) {
                    resolve(null);
                    return;
                }
                const reader = new FileReader();
                reader.onload = () => {
                    // reader.result es ArrayBuffer
                    const senal = Talamo.obtener().traducir_entrada(reader.result);
                    resolve(senal);
                };
                reader.readAsArrayBuffer(file);
            };
            input.click();
        });
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
    cerrar() {}

    /**
     * @returns {string}
     * @since 1.3.3
     */
    estado() { return 'activo'; }

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
}

// ═══════════════════════════════════════════════════════════
// AUTOENCOLACIÓN
// ═══════════════════════════════════════════════════════════
RegistroGlobal.encolar_comunicador(Archivo);