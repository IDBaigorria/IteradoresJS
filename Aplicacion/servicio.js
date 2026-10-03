/**
 * Service worker del plugin de pruebas.
 *
 * Este archivo NO usa imports estaticos de modulos del plugin.
 * Registra el listener de mensajes primero y carga los
 * modulos dinamicamente. Asi el listener siempre esta
 * disponible, aunque algun modulo tarde o falle.
 *
 * Mensajes que atiende:
 * - `listar_pruebas`  -> devuelve el catalogo.
 * - `correr_prueba`   -> ejecuta una prueba y persiste el resultado.
 * - `listar_corridas` -> devuelve las ultimas corridas del grafo.
 *
 * @version 1.5plugin.3
 */

import { URL_PILOTO } from "./ConfPlugin.js";

const _estado = {
    modulos: null,
    cargando: null,
    error: null
};

function _cargar_modulos() {
    if (_estado.cargando) return _estado.cargando;
    _estado.cargando = (async () => {
        console.log(">>> cargando modulos del plugin...");
        const arranque = await import("./arranque.js");
        console.log(">>> arranque.js OK");
        const grafo = await import("./GrafoPlugin.js");
        console.log(">>> GrafoPlugin.js OK");
        const catalogo = await import("./pruebas/catalogo.js");
        console.log(">>> catalogo.js OK");
        _estado.modulos = { arranque, grafo, catalogo };
        console.log(">>> modulos cargados");
        return _estado.modulos;
    })().catch((e) => {
        console.error(">>> ERROR cargando modulos:", e);
        _estado.error = e;
        throw e;
    });
    return _estado.cargando;
}

_cargar_modulos().catch(() => {});

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
        // === comandos básicos ===
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

        // === helpers de sesión ===
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
                throw new Error("Login falló. El código puede ser inválido o el usuario está bloqueado.");
            }
        },

        // === helpers de datos únicos ===
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
    const modulos = await _cargar_modulos();
    const { catalogo, grafo } = modulos;

    const prueba = catalogo.CATALOGO.find((p) => p.id === id_prueba);
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
        await grafo.registrar_corrida({
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
                case "listar_pruebas": {
                    const modulos = await _cargar_modulos();
                    const pruebas = modulos.catalogo.CATALOGO.map((p) => ({
                        id: p.id,
                        nombre: p.nombre,
                        descripcion: p.descripcion || ""
                    }));
                    sendResponse({ exito: true, pruebas });
                    break;
                }

                case "correr_prueba":
                    sendResponse(await _correr_prueba(mensaje.id_prueba));
                    break;

                case "listar_corridas": {
                    const modulos = await _cargar_modulos();
                    const corridas = await modulos.grafo.listar_ultimas_corridas(mensaje.limite || 20);
                    sendResponse({ exito: true, corridas });
                    break;
                }

                default:
                    sendResponse({ exito: false, error: "Mensaje desconocido: " + mensaje.tipo });
            }
        } catch (e) {
            sendResponse({ exito: false, error: e && e.message ? e.message : String(e) });
        }
    })();

    return true;
});