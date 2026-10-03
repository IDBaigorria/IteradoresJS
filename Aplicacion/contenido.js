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
 * @version 1.5plugin.2
 */

(function () {
    "use strict";

    function _query(selector) {
        return document.querySelector(selector);
    }

    function _disparar(el, tipo) {
        const ev = new Event(tipo, { bubbles: true, cancelable: true });
        el.dispatchEvent(ev);
    }

    function _esperar_elemento(selector, timeout_ms) {
        return new Promise((resolve) => {
            const existente = _query(selector);
            if (existente) {
                resolve({ exito: true });
                return;
            }
            const inicio = Date.now();
            const intervalo = setInterval(() => {
                const el = _query(selector);
                if (el) {
                    clearInterval(intervalo);
                    resolve({ exito: true });
                } else if (Date.now() - inicio > timeout_ms) {
                    clearInterval(intervalo);
                    resolve({ exito: false, error: "timeout esperando " + selector });
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

            case "esperar_elemento":
                return await _esperar_elemento(datos.selector, datos.timeout_ms || 5000);

            case "obtener_texto": {
                const el = _query(datos.selector);
                if (!el) return { exito: false, error: "No existe: " + datos.selector };
                return { exito: true, valor: el.textContent || "" };
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