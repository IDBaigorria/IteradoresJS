/**
 * Prueba intermedia v1.4.7 – Consola, HTML y Archivo
 *
 * @since 1.4.7
 * @version 1.4.7
 * @author Ignacio David Baigorria
 */
import { Senal } from './Controlador/Senal.js';
import { Consola } from './Comunicadores/Consola.js';
import { HTML } from './Comunicadores/HTML.js';
import { Archivo } from './Comunicadores/Archivo.js';

document.getElementById('iniciar').onclick = async () => {
    const consola = new Consola();
    const html = new HTML();

    // Enviar saludo por consola y HTML
    consola.enviar('', Senal.desde_bytes('Saludo desde Consola'));
    html.enviar('', Senal.desde_bytes('Saludo desde HTML'));

    // Leer archivo con Archivo (abre diálogo) y mostrar en HTML
    const archivo = new Archivo();
    try {
        const senal = await archivo.solicitar();
        if (senal) {
            html.enviar('', Senal.desde_bytes('Contenido del archivo:'));
            html.enviar('', senal);
        }
    } catch (e) {
        html.enviar('', Senal.desde_bytes('Error: ' + e.message));
    }
 };