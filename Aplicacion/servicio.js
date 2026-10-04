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
 * @version 1.5plugin.4z
 */

import { URL_PILOTO } from "./ConfPlugin.js";
import { registrar_corrida, listar_ultimas_corridas } from "./GrafoPlugin.js";
import { CATALOGO, SECCIONES } from "./pruebas/catalogo.js";

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

// Funcion que se ejecuta en el page context (main world) via
// `chrome.scripting.executeScript`. Tiene que ser autocontenida:
// no puede referenciar variables del service worker. Lee y
// escribe los globales del page (window.viaje_seleccionado,
// window.estados_asientos_actuales, etc.).
function _refresh_asientos_main_world() {
    return (async function () {
        try {
            if (typeof viaje_seleccionado === "undefined" || !viaje_seleccionado) {
                return { exito: false, error: "sin viaje abierto" };
            }
            if (typeof micro_seleccionado === "undefined" || !micro_seleccionado) {
                return { exito: false, error: "sin micro abierto" };
            }
            const viaje = viaje_seleccionado;
            const micro = micro_seleccionado;
            const resp = await fetch("index.php", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    accion: "viajes/estado_asientos",
                    nombre_viaje: viaje.nombre_viaje,
                    nombre_micro: micro,
                    nombre_dueno: viaje.dueno
                })
            });
            const datos = await resp.json();
            if (datos.exito && Array.isArray(datos.asientos)) {
                estados_asientos_actuales = datos.asientos;
                if (typeof actualizar_colores_asientos === "function") {
                    actualizar_colores_asientos(datos.asientos);
                }
                if (typeof refrescar_info_asientos_propios === "function") {
                    refrescar_info_asientos_propios(true);
                }
                return { exito: true };
            }
            return { exito: false, error: "respuesta inesperada" };
        } catch (e) {
            return { exito: false, error: String(e) };
        }
    })();
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
        valor: async (sel) => {
            const r = await enviar("obtener_valor", { selector: sel });
            return r && r.exito ? r.valor : null;
        },
        obtener_atributos: async (sel, attr) => {
            const r = await enviar("obtener_atributos", { selector: sel, atributo: attr });
            return r && r.exito ? r.valores : [];
        },
        leer_aviso: async () => {
            const r = await enviar("leer_toast", {});
            return r && r.exito ? r.texto : "";
        },
        pausa: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
        html: async (sel) => {
            const r = await enviar("obtener_html", { selector: sel });
            return r && r.exito ? r.valor : null;
        },
        pedir_post: (url, body) => enviar("pedir_post", { url, body }),
        crear_pasajero_de_prueba: async (datos) => {
            // Crea un pasajero de prueba. El dueño lo resuelve el
            // page (`window.usuario_actual.dueno` para terminal).
            // Necesario porque el plugin no conoce el nombre de
            // usuario del dueño de las terminales de prueba.
            try {
                const r = await chrome.scripting.executeScript({
                    target: { tabId: pestana_id },
                    world: "MAIN",
                    func: (args) => {
                        return (async () => {
                            try {
                                if (typeof usuario_actual === "undefined" || !usuario_actual) {
                                    return { exito: false, error: "sin usuario_actual en el page" };
                                }
                                const usuario = usuario_actual;
                                const dueno = usuario.dueno || usuario.nombre_usuario;
                                if (!dueno) return { exito: false, error: "sin dueno en el usuario del page" };
                                const body = Object.assign({}, args, {
                                    accion: "pasajeros/crear",
                                    nombre_dueno: dueno
                                });
                                const resp = await fetch("index.php", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                                    body: new URLSearchParams(body)
                                });
                                const datos = await resp.json();
                                return datos;
                            } catch (e) {
                                return { exito: false, error: String(e) };
                            }
                        })();
                    },
                    args: [datos]
                });
                return (r && r[0] && r[0].result) ? r[0].result : { exito: false, error: "sin resultado" };
            } catch (e) {
                return { exito: false, error: e.message };
            }
        },
        liberar_asientos_propios: async () => {
            // Aprieta "Reiniciar seleccion" en el piloto. El boton
            // llama a `reiniciar_seleccion_propia`, que usa
            // `confirm()` nativo. Las extensiones no pueden manejar
            // dialogs nativos, asi que sobrescribimos `window.confirm`
            // con `() => true` por el tiempo del click.
            try {
                const r = await chrome.scripting.executeScript({
                    target: { tabId: pestana_id },
                    world: "MAIN",
                    func: () => {
                        const confirm_orig = window.confirm;
                        window.confirm = () => true;
                        try {
                            const btn = document.getElementById("boton_reiniciar_seleccion");
                            if (!btn) return { exito: false, error: "boton reiniciar no existe" };
                            if (btn.offsetParent === null) return { exito: false, error: "boton reiniciar no visible" };
                            btn.click();
                        } finally {
                            window.confirm = confirm_orig;
                        }
                        return { exito: true };
                    }
                });
                return (r && r[0] && r[0].result) ? r[0].result : { exito: false, error: "sin resultado" };
            } catch (e) {
                return { exito: false, error: e.message };
            }
        },
        refrescar_asientos_pagina: async () => {
            try {
                const r = await chrome.scripting.executeScript({
                    target: { tabId: pestana_id },
                    world: "MAIN",
                    func: _refresh_asientos_main_world
                });
                return (r && r[0] && r[0].result) ? r[0].result : { exito: false, error: "sin resultado" };
            } catch (e) {
                return { exito: false, error: e.message };
            }
        },
        activar_pestana_piloto: async (nombre) => {
            // Activa una pestaña del piloto desde el page context.
            // Las pestañas se generan dinámicamente, así que no hay
            // un selector estable; se llama a `activar_pestana`
            // (global del piloto) vía chrome.scripting en MAIN world.
            try {
                const r = await chrome.scripting.executeScript({
                    target: { tabId: pestana_id },
                    world: "MAIN",
                    func: (n) => {
                        if (typeof activar_pestana === "function") {
                            activar_pestana(n);
                            return { exito: true };
                        }
                        return { exito: false, error: "activar_pestana no existe en el page" };
                    },
                    args: [nombre]
                });
                return (r && r[0] && r[0].result) ? r[0].result : { exito: false, error: "sin resultado" };
            } catch (e) {
                return { exito: false, error: e.message };
            }
        },
        activar_modo_prueba: async () => {
            // Setea window.__iteradores_modo_prueba = true en el
            // page context. El piloto PHP chequea esa bandera en
            // _mostrar_alerta_critica() y no dispara alert()
            // cuando está activa (loguea a consola en su lugar).
            //
            // Es la forma limpia de evitar los alerts nativos que
            // bloquean el page context: el override de window.alert
            // no siempre reemplaza la referencia global, pero la
            // bandera la lee el propio código del piloto. Requiere
            // que el piloto tenga el helper _mostrar_alerta_critica
            // (aplicado en v1.5piloto.74j).
            try {
                const r = await chrome.scripting.executeScript({
                    target: { tabId: pestana_id },
                    world: "MAIN",
                    func: () => {
                        window.__iteradores_modo_prueba = true;
                        return { exito: true };
                    }
                });
                return (r && r[0] && r[0].result) ? r[0].result : { exito: false, error: "sin resultado" };
            } catch (e) {
                return { exito: false, error: e.message };
            }
        },
        desactivar_modo_prueba: async () => {
            // Limpia la bandera de modo prueba. Idempotente.
            try {
                const r = await chrome.scripting.executeScript({
                    target: { tabId: pestana_id },
                    world: "MAIN",
                    func: () => {
                        delete window.__iteradores_modo_prueba;
                        return { exito: true };
                    }
                });
                return (r && r[0] && r[0].result) ? r[0].result : { exito: false, error: "sin resultado" };
            } catch (e) {
                return { exito: false, error: e.message };
            }
        },
        sobrescribir_alertas: async () => {
            // Sobrescribe window.alert y window.confirm del page
            // con no-ops. Necesario para flujos que disparan
            // dialogs nativos (por ejemplo, el alta de terminal
            // muestra alert() con el código generado). La
            // sobrescritura tiene que estar activa durante toda
            // la operación, no solo durante el click: el alert
            // se dispara después de que el fetch resuelve.
            //
            // Se usa Object.defineProperty en lugar de asignación
            // directa: en el contexto de un page cargado con
            // scripts clásicos, `window.alert = ...` no siempre
            // reemplaza la referencia global (Chrome puede haber
            // cacheado la implementación nativa).
            //
            // Idempotente: guarda los originales la primera vez y
            // no los pisa en llamadas sucesivas.
            // Retorna { exito, activo } para que el test pueda
            // verificar que el override se aplicó.
            try {
                const r = await chrome.scripting.executeScript({
                    target: { tabId: pestana_id },
                    world: "MAIN",
                    func: () => {
                        // Guardar los originales solo la primera vez.
                        if (!window.__plugin_alert_override) {
                            window.__plugin_alert_override = {
                                alert: window.alert,
                                confirm: window.confirm
                            };
                        }
                        const noop_alert = function () {};
                        const noop_confirm = function () { return true; };
                        try {
                            Object.defineProperty(window, "alert", {
                                value: noop_alert,
                                writable: true,
                                configurable: true
                            });
                            Object.defineProperty(window, "confirm", {
                                value: noop_confirm,
                                writable: true,
                                configurable: true
                            });
                        } catch (e) {
                            return { exito: false, error: "defineProperty fallo: " + e.message };
                        }
                        const activo = (window.alert === noop_alert);
                        return { exito: true, activo: activo };
                    }
                });
                return (r && r[0] && r[0].result) ? r[0].result : { exito: false, error: "sin resultado" };
            } catch (e) {
                return { exito: false, error: e.message };
            }
        },
        restaurar_alertas: async () => {
            // Restaura window.alert y window.confirm originales.
            // Idempotente: si no había override activo, no hace
            // nada.
            try {
                const r = await chrome.scripting.executeScript({
                    target: { tabId: pestana_id },
                    world: "MAIN",
                    func: () => {
                        if (window.__plugin_alert_override) {
                            try {
                                Object.defineProperty(window, "alert", {
                                    value: window.__plugin_alert_override.alert,
                                    writable: true,
                                    configurable: true
                                });
                                Object.defineProperty(window, "confirm", {
                                    value: window.__plugin_alert_override.confirm,
                                    writable: true,
                                    configurable: true
                                });
                            } catch (e) {
                                return { exito: false, error: "defineProperty fallo al restaurar: " + e.message };
                            }
                            delete window.__plugin_alert_override;
                        }
                        return { exito: true };
                    }
                });
                return (r && r[0] && r[0].result) ? r[0].result : { exito: false, error: "sin resultado" };
            } catch (e) {
                return { exito: false, error: e.message };
            }
        },

        clic_por_indice: async (selector, indice) => {
            // Hace click en el n-ésimo elemento que matchea el
            // selector (0-based). Se usa para interactuar con
            // listas (por ejemplo, el botón "Quitar" del segundo
            // micro en #lista_micros_viaje).
            try {
                const r = await chrome.scripting.executeScript({
                    target: { tabId: pestana_id },
                    world: "MAIN",
                    func: (sel, idx) => {
                        const els = document.querySelectorAll(sel);
                        if (idx < 0 || idx >= els.length) {
                            return { exito: false, error: "indice " + idx + " fuera de rango (0.." + (els.length - 1) + ")" };
                        }
                        els[idx].click();
                        return { exito: true };
                    },
                    args: [selector, indice]
                });
                return (r && r[0] && r[0].result) ? r[0].result : { exito: false, error: "sin resultado" };
            } catch (e) {
                return { exito: false, error: e.message };
            }
        },
        contar: async (selector) => {
            // Cuenta cuántos elementos matchean el selector. Se usa
            // para verificar listas (por ejemplo, cantidad de
            // .micro-item en #lista_micros_viaje).
            try {
                const r = await chrome.scripting.executeScript({
                    target: { tabId: pestana_id },
                    world: "MAIN",
                    func: (sel) => {
                        return document.querySelectorAll(sel).length;
                    },
                    args: [selector]
                });
                return (r && r[0] && typeof r[0].result === "number") ? r[0].result : 0;
            } catch (e) {
                return 0;
            }
        },
        forzar_valor: async (selector, valor) => {
            // Setea el value de un input/select y dispara input +
            // change. Necesario para forzar valores que el input
            // rechazaría por sus restricciones (por ejemplo, monto
            // negativo en un input con min="0").
            try {
                const r = await chrome.scripting.executeScript({
                    target: { tabId: pestana_id },
                    world: "MAIN",
                    func: (sel, val) => {
                        const el = document.querySelector(sel);
                        if (!el) return { exito: false, error: "no existe " + sel };
                        el.value = val;
                        el.dispatchEvent(new Event("input", { bubbles: true }));
                        el.dispatchEvent(new Event("change", { bubbles: true }));
                        return { exito: true, valor: el.value };
                    },
                    args: [selector, valor]
                });
                return (r && r[0] && r[0].result) ? r[0].result : { exito: false, error: "sin resultado" };
            } catch (e) {
                return { exito: false, error: e.message };
            }
        },
        leer_opciones: async (selector) => {
            // Devuelve un array de {valor, texto} con las opciones
            // actuales del <select>. Útil para esperar a que un
            // select se llene y para elegir opciones por índice.
            try {
                const r = await chrome.scripting.executeScript({
                    target: { tabId: pestana_id },
                    world: "MAIN",
                    func: (sel) => {
                        const el = document.querySelector(sel);
                        if (!el) return { exito: false, error: "no existe " + sel };
                        if (el.tagName !== "SELECT") return { exito: false, error: "no es un SELECT: " + sel };
                        const opciones = Array.from(el.options).map(o => ({ valor: o.value, texto: o.textContent }));
                        return { exito: true, opciones };
                    },
                    args: [selector]
                });
                if (r && r[0] && r[0].result && r[0].result.exito) {
                    return r[0].result.opciones;
                }
                return [];
            } catch (e) {
                return [];
            }
        },
        leer_opciones_con_disabled: async (selector) => {
            // Como leer_opciones, pero cada opción incluye un
            // campo `disabled`. Se usa para verificar el filtro
            // de vehículos sin asientos del alta de micro.
            try {
                const r = await chrome.scripting.executeScript({
                    target: { tabId: pestana_id },
                    world: "MAIN",
                    func: (sel) => {
                        const el = document.querySelector(sel);
                        if (!el) return { exito: false, error: "no existe " + sel };
                        if (el.tagName !== "SELECT") return { exito: false, error: "no es un SELECT: " + sel };
                        const opciones = Array.from(el.options).map(o => ({ valor: o.value, texto: o.textContent, disabled: o.disabled === true }));
                        return { exito: true, opciones };
                    },
                    args: [selector]
                });
                if (r && r[0] && r[0].result && r[0].result.exito) {
                    return r[0].result.opciones;
                }
                return [];
            } catch (e) {
                return [];
            }
        },
        seleccionar_indice: async (selector, indice) => {
            // Setea el <select> a la opción del índice indicado y
            // dispara el evento change. Devuelve { exito, valor,
            // texto } con la opción elegida.
            //
            // Necesario porque ctx.clic sobre un <select> abre el
            // dropdown nativo (que la extensión no puede manejar),
            // y asignar el value directamente no dispara el
            // listener onchange del piloto.
            try {
                const r = await chrome.scripting.executeScript({
                    target: { tabId: pestana_id },
                    world: "MAIN",
                    func: (sel, idx) => {
                        const el = document.querySelector(sel);
                        if (!el) return { exito: false, error: "no existe " + sel };
                        if (el.tagName !== "SELECT") return { exito: false, error: "no es un SELECT: " + sel };
                        if (idx < 0 || idx >= el.options.length) {
                            return { exito: false, error: "indice " + idx + " fuera de rango (0.." + (el.options.length - 1) + ")" };
                        }
                        el.selectedIndex = idx;
                        el.dispatchEvent(new Event("change", { bubbles: true }));
                        return { exito: true, valor: el.value, texto: el.options[idx].textContent };
                    },
                    args: [selector, indice]
                });
                return (r && r[0] && r[0].result) ? r[0].result : { exito: false, error: "sin resultado" };
            } catch (e) {
                return { exito: false, error: e.message };
            }
        },

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

                case "listar_secciones":
                    sendResponse({
                        exito: true,
                        secciones: SECCIONES.map((s) => ({
                            id: s.id,
                            nombre: s.nombre,
                            pruebas: s.pruebas.map((p) => ({
                                id: p.id,
                                nombre: p.nombre,
                                descripcion: p.descripcion || ""
                            }))
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

                case "refrescar_asientos_pagina": {
                    const pestana = await _obtener_pestana_piloto();
                    if (!pestana) { sendResponse({ exito: false, error: "no hay pestaña del piloto" }); break; }
                    try {
                        const r = await chrome.scripting.executeScript({
                            target: { tabId: pestana.id },
                            world: "MAIN",
                            func: _refresh_asientos_main_world
                        });
                        sendResponse((r && r[0] && r[0].result) ? r[0].result : { exito: false, error: "sin resultado" });
                    } catch (e) {
                        sendResponse({ exito: false, error: e.message });
                    }
                    break;
                }

                default:
                    sendResponse({ exito: false, error: "Mensaje desconocido: " + mensaje.tipo });
            }
        } catch (e) {
            sendResponse({ exito: false, error: e && e.message ? e.message : String(e) });
        }
    })();

    return true; // mantener canal abierto para respuesta async
});