/**
 * Script de contenido del plugin de pruebas.
 *
 * Se inyecta en la pagina del piloto (localhost / 127.0.0.1).
 * No puede ser module: la API de Chrome no lo permite para
 * scripts de contenido.
 *
 * Escucha mensajes del service worker y ejecuta operaciones
 * basicas sobre el DOM de la pagina. Todas las respuestas
 * son objetos `{ exito, ... }`.
 *
 * @version 1.5plugin.4g
 */

(function () {
    "use strict";

    function _query(selector) {
        return document.querySelector(selector);
    }

    function _es_visible(el) {
        if (!el) return false;
        const estilo = window.getComputedStyle(el);
        if (estilo.display === "none") return false;
        if (estilo.visibility === "hidden") return false;
        if (parseFloat(estilo.opacity) === 0) return false;
        // getBoundingClientRect funciona tambien para elementos
        // con position:fixed (en los que offsetParent es null
        // aunque esten visibles).
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) return false;
        return true;
    }

    function _disparar(el, tipo) {
        const ev = new Event(tipo, { bubbles: true, cancelable: true });
        el.dispatchEvent(ev);
    }

    function _esperar_condicion(predicado, timeout_ms) {
        return new Promise((resolve) => {
            if (predicado()) {
                resolve({ exito: true });
                return;
            }
            const inicio = Date.now();
            const intervalo = setInterval(() => {
                if (predicado()) {
                    clearInterval(intervalo);
                    resolve({ exito: true });
                } else if (Date.now() - inicio > timeout_ms) {
                    clearInterval(intervalo);
                    resolve({ exito: false, error: "timeout" });
                }
            }, 100);
        });
    }

    async function _manejar(tipo, datos) {
        switch (tipo) {
            case "saludo":
                return { exito: true, respuesta: true, url: location.href };

            case "clic": {
                const el = _query(datos.selector);
                if (!el) return { exito: false, error: "No existe: " + datos.selector };
                el.click();
                return { exito: true };
            }

            case "escribir": {
                const el = _query(datos.selector);
                if (!el) return { exito: false, error: "No existe: " + datos.selector };
                el.focus();
                el.value = datos.texto;
                _disparar(el, "input");
                _disparar(el, "change");
                return { exito: true };
            }

            case "esperar_elemento": {
                return await _esperar_condicion(
                    () => _query(datos.selector) !== null,
                    datos.timeout_ms || 5000
                );
            }

            case "esta_visible": {
                return { exito: true, visible: _es_visible(_query(datos.selector)) };
            }

            case "esperar_visible": {
                return await _esperar_condicion(
                    () => _es_visible(_query(datos.selector)),
                    datos.timeout_ms || 5000
                );
            }

            case "esperar_oculto": {
                return await _esperar_condicion(
                    () => !_es_visible(_query(datos.selector)),
                    datos.timeout_ms || 5000
                );
            }

            case "obtener_texto": {
                const el = _query(datos.selector);
                if (!el) return { exito: false, error: "No existe: " + datos.selector };
                return { exito: true, valor: el.textContent || "" };
            }

            case "obtener_valor": {
                const el = _query(datos.selector);
                if (!el) return { exito: false, error: "No existe: " + datos.selector };
                return { exito: true, valor: el.value !== undefined ? String(el.value) : (el.textContent || "") };
            }

            case "obtener_atributos": {
                const elementos = document.querySelectorAll(datos.selector);
                const valores = [];
                elementos.forEach(el => valores.push(el.getAttribute(datos.atributo) || ""));
                return { exito: true, valores };
            }

            case "leer_toast": {
                const el = document.getElementById("toast");
                return {
                    exito: true,
                    texto: el ? (el.textContent || "") : "",
                    visible: el ? el.classList.contains("show") : false
                };
            }

            case "obtener_html": {
                const el = _query(datos.selector);
                if (!el) return { exito: false, error: "No existe: " + datos.selector };
                return { exito: true, valor: el.outerHTML || "" };
            }

            case "pedir_post": {
                try {
                    const resp = await fetch(datos.url, {
                        method: "POST",
                        headers: { "Content-Type": "application/x-www-form-urlencoded" },
                        body: new URLSearchParams(datos.body || {}).toString(),
                        credentials: "same-origin"
                    });
                    const texto = await resp.text();
                    let json = null;
                    try { json = JSON.parse(texto); } catch (e) { /* no era JSON */ }
                    return { exito: true, status: resp.status, texto, json };
                } catch (e) {
                    return { exito: false, error: e.message };
                }
            }

            case "obtener_id_ultima_venta_terminal": {
                const el_nombre = document.getElementById("nombre_usuario_actual");
                const nombre = el_nombre ? el_nombre.textContent.trim() : "";
                if (!nombre) return { exito: false, error: "sin usuario logueado" };
                try {
                    const resp = await fetch("index.php", {
                        method: "POST",
                        headers: { "Content-Type": "application/x-www-form-urlencoded" },
                        body: new URLSearchParams({ accion: "ventas/listar", tipo: "terminal", nombre })
                    });
                    const datos_v = await resp.json();
                    if (!datos_v.exito) return { exito: false, error: datos_v.error || "error al listar ventas" };
                    const ventas = Array.isArray(datos_v.ventas) ? datos_v.ventas : [];
                    if (ventas.length === 0) return { exito: false, error: "no hay ventas para la terminal" };
                    return { exito: true, id_venta: ventas[0].id_venta };
                } catch (e) {
                    return { exito: false, error: e.message };
                }
            }

            default:
                return { exito: false, error: "Tipo desconocido: " + tipo };
        }
    }

    chrome.runtime.onMessage.addListener((mensaje, sender, sendResponse) => {
        if (!mensaje || !mensaje.tipo) return false;
        _manejar(mensaje.tipo, mensaje.datos || {}).then(sendResponse);
        return true; // respuesta asincrona
    });
})();