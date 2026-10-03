/**
 * Service worker del plugin de pruebas.
 *
 * Importante: los service workers de Chrome (MV3) NO permiten
 * `import()` dinamico ("import() is disallowed on
 * ServiceWorkerGlobalScope by the HTML specification"). Por eso
 * este archivo usa imports ESTATICOS.
 *
 * El listener de mensajes se registra al final del archivo. Si
 * alguno de los imports estaticos falla, el service worker no
 * se registra en absoluto (Chrome muestra "unknown error when
 * fetching the script"). Para detectar ese tipo de problemas
 * esta `auditar_plugin.php` (seccion 5, archivos sospechosamente
 * vacios; seccion 3, imports rotos).
 *
 * Mensajes que atiende:
 * - `listar_pruebas`  -> devuelve el catalogo.
 * - `correr_prueba`   -> ejecuta una prueba y persiste el resultado.
 * - `listar_corridas` -> devuelve las ultimas corridas del grafo.
 *
 * @version 1.5plugin.3e
 */

import { URL_PILOTO } from "./ConfPlugin.js";
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

function _crear_ctx(pestana_id) {
    async function enviar(tipo, datos) {
        return await _enviar_a_pestana(pestana_id, tipo, datos);
    }
    return {
        pestana_id,
        url_base: URL_PILOTO,
        enviar,
        // === comandos basicos ===
        clic: (sel) => enviar("clic", { selector: sel }),
        escribir: (sel, txt) => enviar("escribir", { selector: sel, texto: txt }),
        esperar: (sel, timeout_ms = 5000) => enviar("esperar_elemento", { selector: sel, timeout_ms }),
        esta_visible: async (sel) => {
            const r = await enviar("esta_visible", { selector: sel });
            return r && r.exito ? r.visible === true : false;
        },
        esperar_visible: (sel, timeout_ms = 5000) => enviar("esperar_visible", { selector: sel, timeout_ms }),
        esperar_oculto: (sel, timeout_ms = 5000) => enviar("esperar_oculto", { selector: sel, timeout_ms }),
        texto: async (sel) => {
            const r = await enviar("obtener_texto", { selector: sel });
            return r && r.exito ? r.valor : null;
        },
        html: async (sel) => {
            const r = await enviar("obtener_html", { selector: sel });
            return r && r.exito ? r.valor : null;
        },
        pedir_post: (url, body) => enviar("pedir_post", { url, body }),

        // === helpers de sesion ===
        async cerrar_sesion() {
            const app_visible = await this.esta_visible("#aplicacion");
            if (!app_visible) return true;
            await this.clic("#boton_salir");
            const r = await this.esperar_visible("#pantalla_login", 5000);
            return r && r.exito === true;
        },
        async asegurar_login(codigo) {
            await this.esperar("#pantalla_login, #aplicacion", 8000);
            const app_visible = await this.esta_visible("#aplicacion");
            if (app_visible) {
                await this.clic("#boton_salir");
                await this.esperar_visible("#pantalla_login", 5000);
            }
            await this.escribir("#codigo_acceso", codigo);
            await this.clic("#boton_ingresar");
            const r = await this.esperar_visible("#aplicacion", 8000);
            if (!r || !r.exito) {
                throw new Error("Login fallo. El codigo puede ser invalido o el usuario esta bloqueado.");
            }
        },

        // === helpers de datos unicos ===
        dni_unico: () => {
            const base = Date.now() % 90000000;
            return String(base + 10000000);
        },
        texto_unico: (prefijo = "TEST") => prefijo + "_" + Date.now(),

        // === aserciones ===
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