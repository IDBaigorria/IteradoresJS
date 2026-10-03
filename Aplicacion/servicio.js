/**
 * Service worker del plugin de pruebas.
 *
 * Escucha mensajes de la ventana del plugin (popup):
 * - `listar_pruebas`  -> devuelve el catalogo.
 * - `correr_prueba`   -> ejecuta una prueba y persiste el resultado.
 * - `listar_corridas` -> devuelve las ultimas corridas del grafo.
 *
 * @version 1.5plugin.2
 */

import { obtener_controlador } from "./arranque.js";
import { registrar_corrida, listar_ultimas_corridas } from "./GrafoPlugin.js";
import { CATALOGO } from "./pruebas/catalogo.js";

const URLS_PILOTO = ["http://localhost/", "http://127.0.0.1/"];

function _es_url_piloto(url) {
    if (!url) return false;
    return URLS_PILOTO.some((prefijo) => url.startsWith(prefijo));
}

async function _obtener_pestana_piloto() {
    const pestanas = await chrome.tabs.query({});
    return pestanas.find((t) => _es_url_piloto(t.url)) || null;
}

async function _enviar_a_pestana(pestana_id, tipo, datos) {
    try {
        return await chrome.tabs.sendMessage(pestana_id, { tipo, datos });
    } catch (e) {
        return {
            exito: false,
            error: "No se pudo contactar al script de contenido: " + e.message +
                   " (probá recargar la pestaña del piloto)"
        };
    }
}

/**
 * Construye el objeto `ctx` que reciben las pruebas.
 */

function _crear_ctx(pestana_id) {
    async function enviar(tipo, datos) {
        return await _enviar_a_pestana(pestana_id, tipo, datos);
    }
    return {
        pestana_id,
        enviar,
        clic: (sel) => enviar("clic", { selector: sel }),
        escribir: (sel, txt) => enviar("escribir", { selector: sel, texto: txt }),
        esperar: (sel, timeout_ms = 5000) => enviar("esperar_elemento", { selector: sel, timeout_ms }),
        texto: (sel) => enviar("obtener_texto", { selector: sel }),
        html: (sel) => enviar("obtener_html", { selector: sel }),
        pedir_post: (url, body) => enviar("pedir_post", { url, body }),
        assert(cond, msg) {
            if (!cond) throw new Error(msg || "Aserción fallida");
        }
    };
}

async function _correr_prueba(id_prueba) {
    const prueba = CATALOGO.find((p) => p.id === id_prueba);
    if (!prueba) {
        return { exito: false, error: "Prueba no encontrada: " + id_prueba };
    }

    const pestana = await _obtener_pestana_piloto();
    if (!pestana) {
        return { exito: false, error: "No hay una pestaña del piloto abierta" };
    }

    const ctx = _crear_ctx(pestana.id);
    const inicio = Date.now();
    let resultado = "ok";
    let detalle = "";

    try {
        await prueba.ejecutar(ctx);
    } catch (e) {
        resultado = "fallo";
        detalle = e && e.message ? e.message : String(e);
    }

    const duracion_ms = Date.now() - inicio;

    try {
        await registrar_corrida({
            id_prueba,
            fecha_hora: new Date().toISOString(),
            resultado,
            duracion_ms,
            detalle
        });
    } catch (e) {
        console.error("No se pudo persistir la corrida:", e);
    }

    return { exito: true, resultado, detalle, duracion_ms };
}

chrome.runtime.onMessage.addListener((mensaje, sender, sendResponse) => {
    if (!mensaje || !mensaje.tipo) return false;

    (async () => {
        try {
            switch (mensaje.tipo) {
                case "listar_pruebas":
                    sendResponse({
                        exito: true,
                        pruebas: CATALOGO.map((p) => ({
                            id: p.id,
                            nombre: p.nombre,
                            descripcion: p.descripcion || ""
                        }))
                    });
                    break;

                case "correr_prueba":
                    sendResponse(await _correr_prueba(mensaje.id_prueba));
                    break;

                case "listar_corridas":
                    await obtener_controlador();
                    const corridas = await listar_ultimas_corridas(mensaje.limite || 20);
                    sendResponse({ exito: true, corridas });
                    break;

                default:
                    sendResponse({ exito: false, error: "Mensaje desconocido: " + mensaje.tipo });
            }
        } catch (e) {
            sendResponse({ exito: false, error: e && e.message ? e.message : String(e) });
        }
    })();

    return true; // mantener canal abierto para respuesta async
});