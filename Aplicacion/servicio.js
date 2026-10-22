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
 * - `estado_pruebas`  -> devuelve el estado consolidado por prueba.
 *
 * @version 1.5plugin.9l
 */

import { URL_PILOTO } from "./ConfiguracionApli.js";
import { registrar_corrida, marcar_en_vivo, limpiar_en_vivo, limpiar_autoenlaces_colgados, obtener_estado_por_prueba,
         registrar_migracion, actualizar_paso_migracion, finalizar_migracion, obtener_estado_migracion } from "./GrafoPlugin.js";
import { CATALOGO, SECCIONES } from "./pruebas/catalogo.js";
import { limpiar_datos_de_prueba } from "./LimpiezaPrueba.js";
import { copiar_pasajeros_del_micro } from "./CopiarPasajeros.js";
import { PASOS_MIGRACION, ejecutar_migracion, drenar_buzon } from "./Migraciones.js";

// URLs del piloto validas. `_es_url_piloto` las usa para
// identificar la pestana del piloto. NO depende de la URL
// activa configurada en ConfiguracionApli.js: es la lista
// de dominios donde el plugin puede actuar.
//
// v1.5plugin.9l: en localhost, restringir a la ruta
// `/iteradores/` (antes era `http://localhost/` genérico,
// que matcheaba phpMyAdmin, XAMPP dashboard, etc.). Bug
// detectado cuando el plugin seleccionó phpMyAdmin como
// "pestaña del piloto" y el drenado del buzón falló al
// no encontrar #codigo_acceso.
const URLS_PILOTO = [
    "http://localhost/iteradores/",
    "http://127.0.0.1/iteradores/",
    "https://viajespquiadelcarmen.rf.gd/",
    "http://viajespquiadelcarmen.rf.gd/",
    "https://viajespquiadelcarmen.infy.click/",
    "http://viajespquiadelcarmen.infy.click/",
];

// ============================================================
// Cache del solicitante y del dueno
// ============================================================
//
// `ctx.post_accion` inyecta automaticamente `nombre_solicitante`
// (y opcionalmente `nombre_dueno`) en cada POST. Ambos se leen
// del page context con `chrome.scripting.executeScript` (MAIN
// world), que es costoso. Con 65 pruebas x varios POST cada
// una, el costo se nota. Cacheamos en variables de modulo y
// las invalidamos cuando cambia la sesion (login / logout).
let _cache_nombre_solicitante = null;
let _cache_dueno_actual = null;

// Flag de cancelación de migración (v1.5plugin.9a).
// El popup manda "cancelar_migracion" y el ejecutor
// lo consulta entre pasos para abortar.
let _migracion_cancelada = false;

// ============================================================
// Notificaciones a la ventana
// ============================================================
//
// El estado "en vivo" (qué prueba corre ahora) vive en el
// grafo, como autoenlace `corriendo` en el contenedor de
// cada prueba. Acá solo mandamos notificaciones para que
// el popup actualice en vivo sin tener que releer todo.
function _notificar_migracion(payload) {
    try {
        chrome.runtime.sendMessage(payload).catch(function () { /* nadie escuchando */ });
    } catch (e) { /* ignorar */ }
}

async function _ejecutar_migraciones(opciones, pasos_ya_ok) {
    const pestana = await _obtener_pestana_piloto();
    if (!pestana) {
        return { exito: false, error: "No hay una pestaña del piloto abierta. Abrí " + URL_PILOTO + " en una pestaña del navegador y reintentá." };
    }
    if (!pestana.url || !pestana.url.startsWith(URL_PILOTO)) {
        return { exito: false, error: "La pestaña seleccionada apunta a " + (pestana.url || "(desconocida)") + " en lugar de " + URL_PILOTO + ". Abrí el piloto en una pestaña y reintentá." };
    }
    const ctx = _crear_ctx(pestana.id);

    const es_local = URL_PILOTO.indexOf("localhost") !== -1
                  || URL_PILOTO.indexOf("127.0.0.1") !== -1;
    const entorno = es_local ? "local" : "remoto";

    _migracion_cancelada = false;

    let id_corrida;
    try {
        id_corrida = await registrar_migracion({
            fecha_inicio: new Date().toISOString(),
            entorno: entorno,
            estado_global: "en_curso",
            opciones: opciones,
            resultados: [],
        });
    } catch (e) {
        return { exito: false, error: "No se pudo registrar: " + e.message };
    }

    _notificar_migracion({ tipo: "migracion_iniciada", id_corrida: id_corrida, opciones: opciones, entorno: entorno });

    async function al_progreso(evento) {
        _notificar_migracion({
            tipo: "migracion_progreso",
            id_corrida: id_corrida,
            paso_id: evento.paso_id,
            estado: evento.estado,
            mensaje: evento.mensaje,
            duracion_ms: evento.duracion_ms,
        });
        try {
            await actualizar_paso_migracion(id_corrida, evento.paso_id, evento);
        } catch (e) {
            console.error("Error persistiendo paso:", e);
        }
    }

    const debe_cancelar = () => _migracion_cancelada;

    try {
        const r = await ejecutar_migracion(ctx, opciones, al_progreso, debe_cancelar, pasos_ya_ok || {});
        const resultado_final = r.cancelada ? "cancelada" : (r.exito ? "completa" : "error");
        await finalizar_migracion(id_corrida, {
            estado_global: resultado_final,
            fecha_fin: new Date().toISOString(),
        }).catch(function (e) { console.error(e); });
        if (!r.exito) {
            console.error("[Migración] Falló:", r.error || "(sin detalle)");
            const paso_fallido = (r.resultados || []).find(function (p) { return p.estado === "error"; });
            if (paso_fallido && paso_fallido.output) {
                console.error("[Migración] Output del paso " + paso_fallido.paso + ":");
                console.error(paso_fallido.output);
            }
        }
        _notificar_migracion({
            tipo: "migracion_terminada",
            id_corrida: id_corrida,
            estado_global: resultado_final,
            resultados: r.resultados,
            error: r.error,
        });
        return { exito: r.exito, id_corrida: id_corrida, estado_global: resultado_final, resultados: r.resultados, error: r.error };
    } catch (e) {
        await finalizar_migracion(id_corrida, {
            estado_global: "error",
            fecha_fin: new Date().toISOString(),
        }).catch(function () {});
        _notificar_migracion({
            tipo: "migracion_terminada",
            id_corrida: id_corrida,
            estado_global: "error",
            error: e.message,
        });
        return { exito: false, id_corrida: id_corrida, error: e.message };
    }
}

function _notificar_corrida_iniciada(id_prueba) {
    try {
        chrome.runtime.sendMessage(
            { tipo: "corrida_iniciada", id_prueba }
        ).catch(function () { /* nadie escuchando */ });
    } catch (e) { /* ignorar */ }
}

function _notificar_corrida_terminada(payload) {
    try {
        chrome.runtime.sendMessage(
            Object.assign({ tipo: "corrida_terminada" }, payload)
        ).catch(function () { /* nadie escuchando */ });
    } catch (e) { /* ignorar */ }
}

function _es_url_piloto(url) {
    if (!url) return false;
    return URLS_PILOTO.some((prefijo) => url.startsWith(prefijo));
}

// Al arrancar el SW, limpiar cualquier autoenlace `corriendo`
// que haya quedado colgado de una corrida anterior. Si el SW
// se reinicio por inactividad a mitad de una prueba, el nodo
// queda marcado sin que nadie lo haya terminado.
(async () => {
    try {
        await limpiar_autoenlaces_colgados();
    } catch (e) { /* ignorar */ }
})();

async function _obtener_pestana_piloto() {
    const pestanas = await chrome.tabs.query({});
    const encontrada = pestanas.find((t) => _es_url_piloto(t.url)) || null;
    if (!encontrada) {
        // v1.5plugin.9l: log de URLs para diagnóstico.
        // Si el plugin dice "No hay pestaña del piloto", acá
        // se ve qué pestañas hay abiertas.
        console.warn("[piloto] no se encontró pestaña del piloto. Pestañas abiertas:");
        pestanas.forEach(function (t) { console.warn("  - " + (t.url || "(sin url)")); });
        console.warn("[piloto] URLs válidas: " + URLS_PILOTO.join(", "));
    } else {
        console.log("[piloto] pestaña seleccionada: " + encontrada.url + " (id=" + encontrada.id + ")");
    }
    return encontrada;
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
        subir_archivo: async (accion, campos, archivo_info) => {
            // Sube un archivo vía multipart al piloto. El fetch
            // lo hace el content script (no el SW) porque las
            // cookies del piloto solo viajan desde el origen
            // del piloto.
            //
            // `archivo_info` es { nombre, tipo, contenido_base64 }.
            try {
                const r = await enviar("subir_archivo", {
                    accion,
                    campos: campos || {},
                    archivo: archivo_info
                });
                return r || { exito: false, error: "sin respuesta" };
            } catch (e) {
                return { exito: false, error: e.message };
            }
        },
        nombre_usuario_actual: async () => {
            // Lee el nombre de usuario del usuario logueado
            // desde el page context. Necesario para pasar
            // `nombre_solicitante` en los POST que lo exigen
            // (módulos administrador y grafo, y el chequeo
            // global de permiso sobre dueño).
            //
            // El nombre de usuario no se conoce de antemano:
            // los códigos de acceso del prompt (§6) NO son
            // nombres de usuario. Se resuelve desde el page,
            // igual que crear_pasajero_de_prueba resuelve el
            // dueño desde usuario_actual.dueno.
            try {
                const r = await chrome.scripting.executeScript({
                    target: { tabId: pestana_id },
                    world: "MAIN",
                    func: () => {
                        if (typeof usuario_actual === "undefined" || !usuario_actual) {
                            return { exito: false, error: "sin usuario_actual en el page" };
                        }
                        const nombre = usuario_actual.nombre_usuario;
                        if (!nombre) {
                            return { exito: false, error: "usuario_actual no tiene nombre_usuario" };
                        }
                        return { exito: true, nombre_usuario: nombre };
                    }
                });
                return (r && r[0] && r[0].result) ? r[0].result : { exito: false, error: "sin resultado" };
            } catch (e) {
                return { exito: false, error: e.message };
            }
        },
        dueno_actual: async () => {
            // Lee el nombre del dueno activo desde el page
            // context. Para un dueno, es su propio nombre;
            // para un terminal, es el de su dueno. Se usa
            // para inyectar `nombre_dueno` en los POST que
            // lo requieren sin que la prueba tenga que
            // pasarlo a mano.
            try {
                const r = await chrome.scripting.executeScript({
                    target: { tabId: pestana_id },
                    world: "MAIN",
                    func: () => {
                        if (typeof usuario_actual === "undefined" || !usuario_actual) {
                            return { exito: false, error: "sin usuario_actual en el page" };
                        }
                        const dueno = usuario_actual.dueno || usuario_actual.nombre_usuario;
                        if (!dueno) {
                            return { exito: false, error: "usuario_actual sin dueno ni nombre_usuario" };
                        }
                        return { exito: true, dueno: dueno };
                    }
                });
                return (r && r[0] && r[0].result) ? r[0].result : { exito: false, error: "sin resultado" };
            } catch (e) {
                return { exito: false, error: e.message };
            }
        },
        refrescar_solicitante: () => {
            // Fuerza la relectura del solicitante y del dueno
            // en la proxima llamada a post_accion. Se llama
            // automaticamente desde asegurar_login /
            // cerrar_sesion; queda expuesto por si algun
            // test necesita forzarlo.
            _cache_nombre_solicitante = null;
            _cache_dueno_actual = null;
            return { exito: true };
        },
        async post_accion(accion, params = {}, opts = {}) {
            // POST generico con inyeccion de `nombre_solicitante`
            // y (opcionalmente) `nombre_dueno`. Centraliza el
            // patron que estaba repetido a mano en varias
            // pruebas y helpers.
            //
            // opts:
            //   - sin_solicitante (bool): no inyectar.
            //   - sin_dueno (bool): no inyectar.
            //   - (devolver_crudo / lanzar_en_error_backend los
            //     maneja el wrapper _post en _helpers.js, no
            //     este metodo).
            //
            // Devuelve la respuesta cruda de pedir_post:
            //   { exito, status, texto, json } o
            //   { exito: false, error: "..." } si falla la red.
            // Prioridad: params.nombre_solicitante si viene. Un
            // test puede querer operar como otro usuario (por
            // ejemplo, admin vendiendo como terminal); en ese
            // caso pasa `nombre_solicitante` explicito y NO
            // queremos que se pise con el del logueado. Mismo
            // criterio que `nombre_dueno` mas abajo.
            const tiene_solicitante = params
                && params.nombre_solicitante !== undefined
                && params.nombre_solicitante !== "";
            let nombre_solicitante = null;
            if (!opts.sin_solicitante && !tiene_solicitante) {
                if (_cache_nombre_solicitante === null) {
                    const r_nombre = await this.nombre_usuario_actual();
                    if (!r_nombre || !r_nombre.exito || !r_nombre.nombre_usuario) {
                        throw new Error("No se pudo resolver el nombre de usuario del solicitante");
                    }
                    _cache_nombre_solicitante = r_nombre.nombre_usuario;
                }
                nombre_solicitante = _cache_nombre_solicitante;
            }

            const tiene_dueno = params
                && params.nombre_dueno !== undefined
                && params.nombre_dueno !== "";
            let nombre_dueno = null;
            if (!opts.sin_dueno && !tiene_dueno) {
                if (_cache_dueno_actual === null) {
                    const r_dueno = await this.dueno_actual();
                    if (r_dueno && r_dueno.exito) {
                        _cache_dueno_actual = r_dueno.dueno;
                    }
                }
                nombre_dueno = _cache_dueno_actual;
            }

            const body = Object.assign({}, params);
            body.accion = accion;
            if (nombre_solicitante) body.nombre_solicitante = nombre_solicitante;
            if (nombre_dueno) body.nombre_dueno = nombre_dueno;

            return await enviar("pedir_post", { url: "index.php", body });
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
            // Invalidar el cache del solicitante y del dueno:
            // la sesion puede cambiar con el login siguiente.
            _cache_nombre_solicitante = null;
            _cache_dueno_actual = null;

            const app_visible = await this.esta_visible("#aplicacion");
            if (!app_visible) return true;
            await this.clic("#boton_salir");
            const r = await this.esperar_visible("#pantalla_login", 5000);
            return r && r.exito === true;
        },
        async asegurar_login(codigo) {
            // v1.5plugin.9k: asegurar_login 100% con
            // chrome.scripting.executeScript en world: "MAIN".
            // Cero dependencia del content script. El content
            // script estaba fallando después del logout
            // (devolvía null al leer #codigo_acceso, y esta_visible
            // devolvía false aunque #aplicacion estuviera visible),
            // lo que hacía que salir() NUNCA se llamara y el login
            // fallara con un DOM en estado inconsistente.
            //
            // El flujo es equivalente al que usan las pruebas
            // (login_terminal -> asegurar_login), pero el logout
            // se invoca SIEMPRE (no condicionado a esta_visible),
            // porque en el contexto del drenado (después de 9
            // migraciones) el DOM puede estar en cualquier estado.
            _cache_nombre_solicitante = null;
            _cache_dueno_actual = null;

            console.log("[asegurar_login] inicio, código:", codigo);

            // v1.5plugin.9l: verificar que la pestaña apunte al
            // piloto antes de cualquier executeScript. Si el
            // usuario navegó a otra URL (por ejemplo, phpMyAdmin)
            // en la pestaña que el plugin tiene como "del piloto",
            // los executeScript corren sobre el DOM equivocado y
            // fallan con mensajes confusos.
            try {
                const tab = await chrome.tabs.get(pestana_id);
                if (!tab || !tab.url || !tab.url.startsWith(URL_PILOTO)) {
                    throw new Error(
                        "La pestaña del plugin apunta a " +
                        (tab && tab.url ? tab.url : "(desconocida)") +
                        " en lugar de " + URL_PILOTO +
                        ". Abrí el piloto en una pestaña del navegador y reintentá."
                    );
                }
            } catch (e) {
                if (e.message && e.message.indexOf("La pestaña del plugin apunta a") !== -1) {
                    throw e;
                }
                throw new Error("No se pudo acceder a la pestaña del piloto (id=" + pestana_id + "): " + (e.message || e));
            }

            // 1. Logout SIEMPRE con executeScript, sin chequear
            // primero si la app está visible. salir() del piloto
            // es idempotente: si no hay sesión, limpia el DOM
            // igual (localStorage, #aplicacion, #pantalla_login).
            try {
                const r_salir = await chrome.scripting.executeScript({
                    target: { tabId: pestana_id },
                    world: "MAIN",
                    func: async () => {
                        try {
                            if (typeof salir === "function") {
                                await salir();
                            }
                        } catch (e) {
                            console.error("[salir]", e);
                        }
                        const pantalla = document.getElementById("pantalla_login");
                        const app = document.getElementById("aplicacion");
                        return {
                            login_visible: !!(pantalla && !pantalla.classList.contains("hidden")),
                            app_visible: !!(app && !app.classList.contains("hidden")),
                        };
                    }
                });
                const r_res = (r_salir && r_salir[0] && r_salir[0].result) ? r_salir[0].result : null;
                console.log("[asegurar_login] resultado salir:", r_res);
            } catch (e) {
                console.error("[asegurar_login] salir() falló:", e);
            }
            await this.pausa(800);

            // 2. Diagnóstico completo del DOM + toggle al subpanel
            // de código. Si #codigo_acceso no existe, el error
            // incluye el diagnóstico para saber qué pasó.
            let r_t = null;
            try {
                const r_toggle = await chrome.scripting.executeScript({
                    target: { tabId: pestana_id },
                    world: "MAIN",
                    func: () => {
                        if (typeof mostrar_login_por_codigo === "function") {
                            try { mostrar_login_por_codigo(); } catch (e) { /* fallback */ }
                        }
                        const input = document.getElementById("codigo_acceso");
                        const code_panel = document.getElementById("login_por_codigo");
                        const user_panel = document.getElementById("login_por_usuario");
                        const pantalla = document.getElementById("pantalla_login");
                        const app = document.getElementById("aplicacion");
                        return {
                            url: location.href,
                            input_existe: !!input,
                            input_visible: !!(input && input.offsetParent !== null),
                            code_panel_visible: !!(code_panel && !code_panel.classList.contains("hidden")),
                            user_panel_visible: !!(user_panel && !user_panel.classList.contains("hidden")),
                            pantalla_login_existe: !!pantalla,
                            pantalla_login_visible: !!(pantalla && !pantalla.classList.contains("hidden")),
                            app_existe: !!app,
                            app_visible: !!(app && !app.classList.contains("hidden")),
                            body_len: document.body ? document.body.innerHTML.length : 0,
                            input_ids: Array.from(document.querySelectorAll("input[id]")).map(e => e.id),
                        };
                    }
                });
                r_t = r_toggle && r_toggle[0] && r_toggle[0].result;
                console.log("[asegurar_login] estado del DOM:", r_t);
            } catch (e) {
                console.error("[asegurar_login] executeScript del toggle falló:", e);
                throw new Error("executeScript falló al inspeccionar el DOM: " + e.message);
            }

            if (!r_t) {
                throw new Error("executeScript no devolvió resultado al inspeccionar el DOM. Esto suele pasar si la pestaña del piloto no está cargada o la URL cambió. Abrí el piloto y reintentá.");
            }
            if (!r_t.input_existe) {
                throw new Error("El input #codigo_acceso no está en el DOM. Diagnóstico: url=" + r_t.url + ", pantalla_login_existe=" + r_t.pantalla_login_existe + ", pantalla_login_visible=" + r_t.pantalla_login_visible + ", app_visible=" + r_t.app_visible + ", body_len=" + r_t.body_len + ", inputs=" + (r_t.input_ids || []).join(","));
            }

            await this.pausa(200);

            // 3. Escribir el código con executeScript directo.
            const r_escribir = await chrome.scripting.executeScript({
                target: { tabId: pestana_id },
                world: "MAIN",
                func: (cod) => {
                    const input = document.getElementById("codigo_acceso");
                    if (!input) return { exito: false, error: "no existe #codigo_acceso" };
                    input.value = cod;
                    input.dispatchEvent(new Event("input", { bubbles: true }));
                    input.dispatchEvent(new Event("change", { bubbles: true }));
                    return { exito: true, valor: input.value };
                },
                args: [codigo]
            });
            const r_e = r_escribir && r_escribir[0] && r_escribir[0].result;
            console.log("[asegurar_login] escritura:", r_e);
            if (!r_e || !r_e.exito) {
                throw new Error("No se pudo escribir el código: " + ((r_e && r_e.error) || "desconocido"));
            }
            if (r_e.valor !== codigo) {
                throw new Error("El código escrito no coincide: esperado=\"" + codigo + "\", obtenido=\"" + r_e.valor + "\"");
            }

            // 4. Disparar el login con executeScript directo.
            const r_login = await chrome.scripting.executeScript({
                target: { tabId: pestana_id },
                world: "MAIN",
                func: async () => {
                    if (typeof ingresar_con_codigo === "function") {
                        try {
                            await ingresar_con_codigo();
                            return { exito: true, via: "funcion" };
                        } catch (e) {
                            return { exito: false, error: String(e) };
                        }
                    }
                    const btn = document.getElementById("boton_ingresar");
                    if (!btn) return { exito: false, error: "no existe #boton_ingresar" };
                    btn.click();
                    return { exito: true, via: "click" };
                }
            });
            const r_l = r_login && r_login[0] && r_login[0].result;
            console.log("[asegurar_login] login:", r_l);
            if (!r_l || !r_l.exito) {
                throw new Error("Login falló al dispararse: " + ((r_l && r_l.error) || "desconocido"));
            }

            // 5. Esperar a que #aplicacion sea visible (polling en
            // MAIN world, sin content script).
            const inicio = Date.now();
            let app_visible = false;
            while (Date.now() - inicio < 20000) {
                try {
                    const r_poll = await chrome.scripting.executeScript({
                        target: { tabId: pestana_id },
                        world: "MAIN",
                        func: () => {
                            const app = document.getElementById("aplicacion");
                            const visible = !!(app && !app.classList.contains("hidden"));
                            const nivel = document.getElementById("nivel_usuario_actual");
                            return { visible: visible, nivel: nivel ? nivel.textContent : "" };
                        }
                    });
                    const r_p = r_poll && r_poll[0] && r_poll[0].result;
                    if (r_p && r_p.visible) {
                        console.log("[asegurar_login] app visible, nivel:", r_p.nivel);
                        app_visible = true;
                        break;
                    }
                } catch (e) { /* ignorar y reintentar */ }
                await this.pausa(300);
            }
            if (!app_visible) {
                throw new Error("Login enviado pero la app no se hizo visible en 20s. Verificá que el código sea válido y que el usuario no esté bloqueado.");
            }
            console.log("[asegurar_login] OK");
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

    // Marcar la prueba como corriendo en el grafo.
    try {
        await marcar_en_vivo(id_prueba);
    } catch (e) {
        console.warn("No se pudo marcar la prueba como en vivo:", e);
    }
    _notificar_corrida_iniciada(id_prueba);

    try {
        await prueba.ejecutar(ctx);
    } catch (e) {
        resultado = "fallo";
        detalle = e && e.message ? e.message : String(e);
    }

    const duracion_ms = Date.now() - inicio;
    const fecha_hora = new Date().toISOString();

    try {
        await registrar_corrida({
            id_prueba,
            fecha_hora,
            resultado,
            duracion_ms,
            detalle
        });
    } catch (e) {
        console.error("No se pudo persistir la corrida:", e);
    }

    // Quitar la marca de "corriendo" del grafo.
    try {
        await limpiar_en_vivo(id_prueba);
    } catch (e) {
        console.warn("No se pudo limpiar la marca en vivo:", e);
    }
    _notificar_corrida_terminada({ id_prueba, resultado, fecha_hora, duracion_ms, detalle });

    return { exito: true, resultado, detalle, duracion_ms };
}

/**
 * Ejecuta la limpieza de datos de prueba en la pestana
 * activa del piloto. Manda eventos de progreso a la
 * ventana por broadcast (chrome.runtime.sendMessage).
 * Si no hay ventana escuchando, el sendMessage falla y
 * se traga el error (es best-effort).
 */
async function _ejecutar_limpieza(categorias) {
    const pestana = await _obtener_pestana_piloto();
    if (!pestana) {
        return { exito: false, error: "No hay una pestana del piloto abierta" };
    }
    const ctx = _crear_ctx(pestana.id);

    function al_progreso(evento) {
        try {
            chrome.runtime.sendMessage(
                { tipo: "limpieza_progreso", evento: evento }
            ).catch(function () { /* nadie escuchando */ });
        } catch (e) { /* ignorar */ }
    }

    try {
        return await limpiar_datos_de_prueba(ctx, al_progreso, { categorias });
    } catch (e) {
        return { exito: false, error: e.message };
    }
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
                            limpieza: s.limpieza || [],
                            grupos: (s.grupos || []).map((g) => ({
                                id: g.id,
                                nombre: g.nombre,
                                pruebas: g.pruebas.map((p) => ({
                                    id: p.id,
                                    nombre: p.nombre,
                                    descripcion: p.descripcion || ""
                                }))
                            }))
                        }))
                    });
                    break;

                case "correr_prueba":
                    sendResponse(await _correr_prueba(mensaje.id_prueba));
                    break;

                case "estado_pruebas": {
                    const por_prueba = await obtener_estado_por_prueba();
                    sendResponse({ exito: true, por_prueba });
                    break;
                }

                case "limpiar_datos_prueba":
                    sendResponse(await _ejecutar_limpieza());
                    break;

                case "limpiar_prueba_categoria":
                    sendResponse(await _ejecutar_limpieza(mensaje.categorias || []));
                    break;

                case "copiar_tabla_pasajeros": {
                    const pestana_cp = await _obtener_pestana_piloto();
                    if (!pestana_cp) {
                        sendResponse({ exito: false, error: "No hay una pestana del piloto abierta" });
                        break;
                    }
                    const ctx_cp = _crear_ctx(pestana_cp.id);
                    try {
                        sendResponse(await copiar_pasajeros_del_micro(ctx_cp));
                    } catch (e) {
                        sendResponse({ exito: false, error: e.message });
                    }
                    break;
                }

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

                case "listar_pasos_migracion": {
                    sendResponse({
                        exito: true,
                        pasos: PASOS_MIGRACION.map(p => ({
                            id: p.id,
                            nombre: p.nombre,
                            peligroso: !!p.peligroso,
                            default: !!p.default,
                            tooltip: p.tooltip || "",
                        })),
                    });
                    break;
                }

                case "estado_migracion": {
                    try {
                        const estado_mig = await obtener_estado_migracion();
                        sendResponse({ exito: true, estado: estado_mig });
                    } catch (e) {
                        sendResponse({ exito: false, error: e.message });
                    }
                    break;
                }

                case "entorno_actual": {
                    const es_local = URL_PILOTO.indexOf("localhost") !== -1
                                  || URL_PILOTO.indexOf("127.0.0.1") !== -1;
                    sendResponse({ exito: true, entorno: es_local ? "local" : "remoto" });
                    break;
                }

                case "correr_migraciones": {
                    const opciones = mensaje.opciones || {};
                    const pasos_ya_ok = mensaje.pasos_ya_ok || {};
                    const r_mig = await _ejecutar_migraciones(opciones, pasos_ya_ok);
                    sendResponse(r_mig);
                    break;
                }

                case "cancelar_migracion": {
                    _migracion_cancelada = true;
                    sendResponse({ exito: true });
                    break;
                }

                case "abandonar_migracion": {
                    const id_ab = mensaje.id_corrida;
                    if (!id_ab) { sendResponse({ exito: false, error: "falta id_corrida" }); break; }
                    try {
                        await finalizar_migracion(id_ab, {
                            estado_global: "abandonada",
                            fecha_fin: new Date().toISOString(),
                        });
                        sendResponse({ exito: true });
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

// ============================================================
// Handler global para debug desde la consola del SW.
// ============================================================
//
// `await globalThis.limpiar_prueba()` ejecuta la misma
// rutina que el boton del popup. En MV3 no se puede hacer
// import() dinamico desde la consola del SW, por eso
// exponerlo en globalThis es la via.
globalThis.limpiar_prueba = async () => {
    return await _ejecutar_limpieza();
};

// Copia la tabla de pasajeros del micro abierto. Mismo
// mecanismo que el boton del popup, para la consola del
// SW.
globalThis.copiar_pasajeros = async () => {
    const pestana = await _obtener_pestana_piloto();
    if (!pestana) return { exito: false, error: "No hay una pestana del piloto abierta" };
    const ctx = _crear_ctx(pestana.id);
    return await copiar_pasajeros_del_micro(ctx);
};