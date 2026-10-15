/**
 * Logica de la ventana del plugin (popup de Chrome).
 *
 * Renderiza las pruebas agrupadas por seccion. Cada seccion
 * tiene un boton "Correr todas" que ejecuta sus pruebas en
 * serie.
 *
 * No usa imports (no es module).
 *
 * @version 1.5plugin.7p
 */

document.addEventListener("DOMContentLoaded", () => {
    const contenedor = document.getElementById("contenedor_secciones");
    const estado = document.getElementById("mensaje_estado");

    function mostrar_estado(texto) {
        estado.textContent = texto;
    }

    async function enviar(mensaje, intentos = 5) {
        let ultimo_error = null;
        for (let i = 0; i < intentos; i++) {
            try {
                const resp = await chrome.runtime.sendMessage(mensaje);
                return resp;
            } catch (e) {
                ultimo_error = e;
                if (i < intentos - 1) {
                    await new Promise((r) => setTimeout(r, 200));
                }
            }
        }
        throw ultimo_error || new Error("No se pudo contactar al service worker");
    }

    // ============================================================
    // Limpieza de datos de prueba
    // ============================================================

    function _log_agregar(texto) {
        const log = document.getElementById("limpieza_log");
        if (!log) return;
        log.textContent += texto + "\n";
        log.scrollTop = log.scrollHeight;
    }

    function _procesar_progreso(evento) {
        if (!evento) return;
        if (evento.tipo === "dueno") {
            _log_agregar("");
            _log_agregar("=== Dueno: " + evento.nombre + " ===");
        } else if (evento.tipo === "ok") {
            let linea = "  [ok] " + evento.etiqueta + ": "
                + evento.borrados + " borrados";
            if (evento.extra && evento.extra > 0) {
                linea += " (+" + evento.extra + " vehiculos)";
            }
            if (evento.salteados && evento.salteados > 0) {
                linea += ", " + evento.salteados + " salteados";
            }
            _log_agregar(linea);
        } else if (evento.tipo === "warning") {
            _log_agregar("  [warn] " + evento.etiqueta + ": " + evento.error);
        }
    }

    function _mostrar_resumen(resp) {
        const ini = resp.res_ini || {};
        const fin = resp.res_fin || {};
        const t = resp.totales || {};
        const d_total = (fin.total || 0) - (ini.total || 0);
        const d_huer = (fin.huerfanos || 0) - (ini.huerfanos || 0);

        _log_agregar("");
        _log_agregar("=== RESUMEN ===");
        _log_agregar("Nodos:     " + (ini.total || 0) + " -> "
            + (fin.total || 0) + " (" + d_total + ")");
        _log_agregar("Huerfanos: " + (ini.huerfanos || 0) + " -> "
            + (fin.huerfanos || 0) + " (" + d_huer + ")");
        _log_agregar("");
        _log_agregar("Borrados por categoria:");
        _log_agregar("  ventas:        " + (t.ventas || 0));
        _log_agregar("  cancelaciones: " + (t.cancelaciones || 0));
        _log_agregar("  viajes:        " + (t.viajes || 0));
        _log_agregar("  pasajeros:     " + (t.pasajeros || 0));
        _log_agregar("  empresas:      " + (t.empresas || 0));
        _log_agregar("  vehiculos:     " + (t.vehiculos || 0));
        _log_agregar("  terminales:    " + (t.terminales || 0));
        _log_agregar("  usuarios:      " + (t.usuarios || 0));
        if (t.salteados > 0) {
            _log_agregar("  salteados:     " + t.salteados);
        }
    }

    async function limpiar_datos_de_prueba() {
        const ok = confirm(
            "Limpiar todos los datos de prueba?\n\n"
            + "Esta accion borra ventas, cancelaciones, viajes, "
            + "pasajeros, empresas, vehiculos y terminales de "
            + "prueba.\n\n"
            + "No toca datos reales."
        );
        if (!ok) return;

        const btn = document.getElementById("btn_limpiar_datos_prueba");
        const log = document.getElementById("limpieza_log");
        const estado_l = document.getElementById("limpieza_estado");

        btn.disabled = true;
        log.style.display = "block";
        log.textContent = "";
        estado_l.textContent = "Limpiando...";

        try {
            const resp = await enviar({ tipo: "limpiar_datos_prueba" });
            if (!resp || !resp.exito) {
                _log_agregar("");
                _log_agregar("ERROR: " + (resp && resp.error ? resp.error : "desconocido"));
                estado_l.textContent = "Error";
                return;
            }
            _mostrar_resumen(resp);
            estado_l.textContent = "Listo";
        } catch (e) {
            _log_agregar("");
            _log_agregar("ERROR: " + e.message);
            estado_l.textContent = "Error";
        } finally {
            btn.disabled = false;
        }
    }

    // ============================================================
    // Copiar tabla de pasajeros
    // ============================================================

    async function copiar_pasajeros() {
        const btn = document.getElementById("btn_copiar_pasajeros");
        const pre = document.getElementById("copiar_pre");
        const ta = document.getElementById("copiar_textarea");
        const est = document.getElementById("copiar_estado");

        btn.disabled = true;
        pre.style.display = "none";
        ta.style.display = "none";
        est.textContent = "Leyendo...";

        try {
            const resp = await enviar({ tipo: "copiar_tabla_pasajeros" });
            if (!resp || !resp.exito) {
                est.textContent = "Error: " + (resp && resp.error ? resp.error : "desconocido");
                return;
            }

            pre.textContent = resp.tabla;
            pre.style.display = "block";

            // Intentar copiar al portapapeles.
            let copiado = false;
            try {
                await navigator.clipboard.writeText(resp.tabla);
                copiado = true;
            } catch (e) {
                copiado = false;
            }

            if (copiado) {
                est.textContent = "Copiado (" + resp.cantidad_filas + " filas)";
                ta.style.display = "none";
            } else {
                // Fallback: mostrar la tabla en el textarea,
                // seleccionarla, pedirle al usuario Ctrl+C.
                ta.value = resp.tabla;
                ta.style.display = "block";
                ta.focus();
                ta.select();
                est.textContent = "Copiá con Ctrl+C (" + resp.cantidad_filas + " filas)";
            }
        } catch (e) {
            est.textContent = "Error: " + e.message;
        } finally {
            btn.disabled = false;
        }
    }

    (function _conectar_boton_copiar() {
        const btn = document.getElementById("btn_copiar_pasajeros");
        if (btn) btn.addEventListener("click", copiar_pasajeros);
    })();

    // Listener de progreso (broadcast desde el SW).
    chrome.runtime.onMessage.addListener((msg) => {
        if (msg && msg.tipo === "limpieza_progreso") {
            _procesar_progreso(msg.evento);
        }
    });

    // Conectar el boton directamente: estamos dentro del
    // handler de DOMContentLoaded original, asi que el DOM
    // ya esta listo. Un addEventListener("DOMContentLoaded")
    // anidado nunca dispararia.
    (function _conectar_boton_limpieza() {
        const btn = document.getElementById("btn_limpiar_datos_prueba");
        if (btn) btn.addEventListener("click", limpiar_datos_de_prueba);
    })();

    function aplicar_resultado(el, resp) {
        if (!resp || !resp.exito) {
            el.textContent = "Error: " + (resp && resp.error ? resp.error : "desconocido");
            el.className = "resultado resultado-error";
            return;
        }
        if (resp.resultado === "ok") {
            el.textContent = "OK (" + resp.duracion_ms + " ms)";
            el.className = "resultado resultado-ok";
        } else {
            el.textContent = "Fallo: " + (resp.detalle || "sin detalle");
            el.className = "resultado resultado-fallo";
        }
    }

    async function correr(id_prueba, li) {
        const el = li.querySelector(".resultado");
        el.textContent = "Corriendo...";
        el.className = "resultado";
        let resp;
        try {
            resp = await enviar({ tipo: "correr_prueba", id_prueba });
        } catch (e) {
            el.textContent = "Error: " + e.message;
            el.className = "resultado resultado-error";
            return;
        }
        aplicar_resultado(el, resp);
    }

    async function correr_seccion(seccion, resumen_el) {
        const boton = seccion.querySelector(".btn-correr-todas");
        const botones_prueba = seccion.querySelectorAll(".btn-correr-prueba");
        boton.disabled = true;
        botones_prueba.forEach((b) => { b.disabled = true; });

        const lis = Array.from(seccion.querySelectorAll("li[data-id-prueba]"));
        let ok = 0;
        let fallo = 0;
        const total = lis.length;

        lis.forEach((li) => {
            const el = li.querySelector(".resultado");
            el.textContent = "—";
            el.className = "resultado";
            li.classList.remove("corriendo");
        });

        for (let i = 0; i < lis.length; i++) {
            const li = lis[i];
            const id_prueba = li.dataset.idPrueba;
            const el = li.querySelector(".resultado");

            li.classList.add("corriendo");
            el.textContent = "Corriendo...";
            el.className = "resultado";
            resumen_el.textContent = `Corriendo ${i + 1}/${total}...`;
            resumen_el.className = "seccion-resumen";

            let resp;
            try {
                resp = await enviar({ tipo: "correr_prueba", id_prueba });
            } catch (e) {
                el.textContent = "Error: " + e.message;
                el.className = "resultado resultado-error";
                li.classList.remove("corriendo");
                fallo++;
                continue;
            }

            aplicar_resultado(el, resp);
            li.classList.remove("corriendo");

            if (resp && resp.exito && resp.resultado === "ok") ok++;
            else fallo++;
        }

        resumen_el.textContent = ok + "/" + total + " OK";
        resumen_el.className = "seccion-resumen " + (fallo === 0 ? "ok" : "fallo");
        boton.disabled = false;
        botones_prueba.forEach((b) => { b.disabled = false; });
    }

    function renderizar_seccion(seccion) {
        const div = document.createElement("div");
        div.className = "seccion";
        div.dataset.idSeccion = seccion.id;

        const header = document.createElement("div");
        header.className = "seccion-header";
        header.innerHTML =
            '<div><span class="seccion-nombre">' + seccion.nombre + '</span>' +
            '<span class="seccion-resumen"></span></div>' +
            '<button class="btn-correr-todas">▶ Correr todas</button>';
        div.appendChild(header);

        const ul = document.createElement("ul");
        seccion.pruebas.forEach((p) => {
            const li = document.createElement("li");
            li.dataset.idPrueba = p.id;
            li.innerHTML =
                '<div class="prueba-nombre">' + p.nombre + '</div>' +
                '<div class="prueba-desc">' + (p.descripcion || "") + '</div>' +
                '<div class="acciones">' +
                '  <button class="btn-correr-prueba">▶</button>' +
                '  <span class="resultado">—</span>' +
                '</div>';
            li.querySelector(".btn-correr-prueba").addEventListener("click", () => correr(p.id, li));
            ul.appendChild(li);
        });
        div.appendChild(ul);

        const resumen_el = header.querySelector(".seccion-resumen");
        header.querySelector(".btn-correr-todas").addEventListener("click", () => {
            correr_seccion(div, resumen_el);
        });

        return div;
    }

    async function renderizar() {
        let resp;
        try {
            resp = await enviar({ tipo: "listar_secciones" });
        } catch (e) {
            mostrar_estado("Error: " + e.message);
            return;
        }

        contenedor.innerHTML = "";

        if (!resp || !resp.exito) {
            mostrar_estado("Error: " + (resp && resp.error ? resp.error : "desconocido"));
            return;
        }

        const secciones = resp.secciones || [];
        mostrar_estado(secciones.length + " sección(es) disponibles");

        secciones.forEach((s) => {
            contenedor.appendChild(renderizar_seccion(s));
        });
    }

    renderizar();
});