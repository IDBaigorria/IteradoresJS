/**
 * Logica de la ventana del plugin (popup de Chrome).
 *
 * Renderiza las pruebas agrupadas en PESTANAS tematicas.
 * Cada pestana tiene una barra con dos botones:
 *   - "Ejecutar todos los roles": corre todas las pruebas
 *     de la pestana, en todos los grupos.
 *   - "Limpiar pruebas": limpia los datos de prueba que
 *     corresponden a la pestana.
 *
 * La pestana activa se persiste en localStorage.
 *
 * Cada fila de prueba muestra un INDICADOR DE ESTADO con la
 * ultima corrida (persistida en el grafo del plugin):
 * resultado + fecha. Click en el indicador despliega el
 * historial de las ultimas 5 corridas.
 *
 * El popup NO carga el framework. Pide el estado al SW por
 * mensajeria (`estado_pruebas`) y escucha broadcasts en vivo
 * (`corrida_iniciada`, `corrida_terminada`).
 *
 * No usa imports (no es module).
 *
 * @version 1.5plugin.9f
 */

document.addEventListener("DOMContentLoaded", () => {
    const contenedor = document.getElementById("contenedor_secciones");
    const estado = document.getElementById("mensaje_estado");
    const tabs_nav = document.getElementById("tabs");

    const LS_KEY_TAB_ACTIVA = "plugin_tab_activa";

    let secciones_cargadas = [];
    let limpieza_en_curso = false;

    // Estado persistente por prueba (viene del SW).
    // { id_prueba: { ultima, historial: [...], corriendo } }
    let estado_pruebas = {};

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

    function _escapar_html(s) {
        return String(s)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function _formatear_fecha(iso) {
        if (!iso) return "";
        const d = new Date(iso);
        if (isNaN(d.getTime())) return "";
        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const hh = String(d.getHours()).padStart(2, "0");
        const mi = String(d.getMinutes()).padStart(2, "0");
        return dd + "/" + mm + " " + hh + ":" + mi;
    }

    // ============================================================
    // Indicadores de estado por prueba
    // ============================================================

    function _renderizar_indicador(id_prueba) {
        const li = document.querySelector('li[data-id-prueba="' + id_prueba + '"]');
        if (!li) return;
        const el = li.querySelector(".indicador-estado");
        if (!el) return;

        const est = estado_pruebas[id_prueba];
        el.classList.remove("indicador-ok", "indicador-fallo",
            "indicador-error", "indicador-corriendo", "indicador-sin");

        if (!est || (!est.ultima && !est.corriendo)) {
            el.textContent = "\u2014";
            el.classList.add("indicador-sin");
            return;
        }

        if (est.corriendo) {
            el.textContent = "Corriendo...";
            el.classList.add("indicador-corriendo");
            return;
        }

        const u = est.ultima;
        const fecha = _formatear_fecha(u.fecha_hora);
        if (u.resultado === "ok") {
            el.textContent = "[OK " + fecha + "]";
            el.classList.add("indicador-ok");
        } else if (u.resultado === "fallo") {
            el.textContent = "[Fallo " + fecha + "]";
            el.classList.add("indicador-fallo");
        } else {
            el.textContent = "[Error " + fecha + "]";
            el.classList.add("indicador-error");
        }
    }

    function _renderizar_indicadores_todos() {
        document.querySelectorAll("li[data-id-prueba]").forEach((li) => {
            _renderizar_indicador(li.dataset.idPrueba);
        });
    }

    function _toggle_historial(id_prueba, li) {
        const div = li.querySelector(".historial-prueba");
        if (!div) return;

        if (div.style.display === "block") {
            div.style.display = "none";
            return;
        }

        const est = estado_pruebas[id_prueba];
        if (!est || !est.historial || est.historial.length === 0) {
            div.innerHTML = '<div class="historial-vacio">(sin corridas registradas)</div>';
        } else {
            div.innerHTML = est.historial.map((c) => {
                const fecha = _formatear_fecha(c.fecha_hora);
                let cls = "hist-item";
                if (c.resultado === "ok") cls += " hist-ok";
                else if (c.resultado === "fallo") cls += " hist-fallo";
                else cls += " hist-error";
                let det = c.detalle ? " \u00b7 " + _escapar_html(c.detalle) : "";
                return '<div class="' + cls + '">' +
                    '<span class="hist-res">' + _escapar_html(c.resultado) + '</span>' +
                    " \u00b7 " + fecha +
                    " \u00b7 " + _escapar_html(c.duracion_ms) + " ms" +
                    det +
                    "</div>";
            }).join("");
        }
        div.style.display = "block";
    }

    // ============================================================
    // Copiar tabla de pasajeros (unico boton global)
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
                ta.value = resp.tabla;
                ta.style.display = "block";
                ta.focus();
                ta.select();
                est.textContent = "Copia con Ctrl+C (" + resp.cantidad_filas + " filas)";
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

    // ============================================================
    // Limpieza (por categoria)
    // ============================================================

    function _log_agregar(texto) {
        const log = document.getElementById("limpieza_log");
        if (!log) return;
        log.textContent += texto + "\n";
        log.scrollTop = log.scrollHeight;
    }

    function _log_empezar() {
        const log = document.getElementById("limpieza_log");
        if (!log) return;
        log.style.display = "block";
        log.textContent = "";
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

    function _mostrar_resumen(resp, est_el) {
        const ini = resp.res_ini || {};
        const fin = resp.res_fin || {};
        const t = resp.totales || {};
        const d_total = (fin.total || 0) - (ini.total || 0);
        const d_huer = (fin.huerfanos || 0) - (ini.huerfanos || 0);

        _log_agregar("");
        _log_agregar("=== RESUMEN ===");
        _log_agregar("Categorias: " + (resp.categorias || []).join(", "));
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
        _log_agregar("  huerfanos:     " + (t.huerfanos || 0));
        if (t.salteados > 0) {
            _log_agregar("  salteados:     " + t.salteados);
        }

        if (est_el) {
            const total_b = (t.ventas || 0) + (t.cancelaciones || 0)
                + (t.viajes || 0) + (t.pasajeros || 0)
                + (t.empresas || 0) + (t.vehiculos || 0)
                + (t.terminales || 0) + (t.usuarios || 0)
                + (t.huerfanos || 0);
            est_el.textContent = "Listo (" + total_b + " borrados)";
        }
    }

    async function limpiar_categoria(seccion, est_el, btn_el) {
        if (limpieza_en_curso) {
            if (est_el) est_el.textContent = "Ya hay una limpieza en curso";
            return;
        }

        const categorias = seccion.limpieza || [];
        if (categorias.length === 0) return;

        const ok = confirm(
            "Limpiar datos de prueba de esta pestana?\n\n"
            + "Categorias: " + categorias.join(", ") + "\n\n"
            + "No toca datos reales."
        );
        if (!ok) return;

        limpieza_en_curso = true;
        if (btn_el) btn_el.disabled = true;
        _log_empezar();
        if (est_el) est_el.textContent = "Limpiando...";

        try {
            const resp = await enviar({
                tipo: "limpiar_prueba_categoria",
                categorias: categorias
            });
            if (!resp || !resp.exito) {
                _log_agregar("");
                _log_agregar("ERROR: " + (resp && resp.error ? resp.error : "desconocido"));
                if (est_el) est_el.textContent = "Error";
                return;
            }
            _mostrar_resumen(resp, est_el);
        } catch (e) {
            _log_agregar("");
            _log_agregar("ERROR: " + e.message);
            if (est_el) est_el.textContent = "Error";
        } finally {
            limpieza_en_curso = false;
            if (btn_el) btn_el.disabled = false;
        }
    }

    async function limpiar_todas(est_el, btn_el) {
        if (limpieza_en_curso) {
            if (est_el) est_el.textContent = "Ya hay una limpieza en curso";
            return;
        }

        const ok = confirm(
            "Limpiar TODAS las pruebas?\n\n"
            + "Esta accion borra ventas, cancelaciones, viajes, "
            + "pasajeros, empresas, vehiculos y terminales de "
            + "prueba de todos los duenos.\n\n"
            + "No toca datos reales."
        );
        if (!ok) return;

        limpieza_en_curso = true;
        if (btn_el) btn_el.disabled = true;
        _log_empezar();
        if (est_el) est_el.textContent = "Limpiando...";

        try {
            const resp = await enviar({ tipo: "limpiar_datos_prueba" });
            if (!resp || !resp.exito) {
                _log_agregar("");
                _log_agregar("ERROR: " + (resp && resp.error ? resp.error : "desconocido"));
                if (est_el) est_el.textContent = "Error";
                return;
            }
            _mostrar_resumen(resp, est_el);
        } catch (e) {
            _log_agregar("");
            _log_agregar("ERROR: " + e.message);
            if (est_el) est_el.textContent = "Error";
        } finally {
            limpieza_en_curso = false;
            if (btn_el) btn_el.disabled = false;
        }
    }

    (function _conectar_boton_limpiar_todas() {
        const btn = document.getElementById("btn_limpiar_todas");
        const est = document.getElementById("limpiar_todas_estado");
        if (btn) btn.addEventListener("click", () => limpiar_todas(est, btn));
    })();

    // ============================================================
    // Mensajes entrantes del SW
    // ============================================================

    chrome.runtime.onMessage.addListener((msg) => {
        if (!msg) return;
        if (msg.tipo === "limpieza_progreso") {
            _procesar_progreso(msg.evento);
            return;
        }
        if (msg.tipo === "corrida_iniciada") {
            _aplicar_corrida_iniciada(msg.id_prueba);
            return;
        }
        if (msg.tipo === "corrida_terminada") {
            _aplicar_corrida_terminada(msg);
            return;
        }
    });

    function _aplicar_corrida_iniciada(id_prueba) {
        if (!id_prueba) return;
        if (!estado_pruebas[id_prueba]) {
            estado_pruebas[id_prueba] = { ultima: null, historial: [], corriendo: true };
        } else {
            estado_pruebas[id_prueba].corriendo = true;
        }
        _renderizar_indicador(id_prueba);
    }

    function _aplicar_corrida_terminada(payload) {
        const id_prueba = payload && payload.id_prueba;
        if (!id_prueba) return;
        const nueva = {
            resultado: payload.resultado || "",
            fecha_hora: payload.fecha_hora || "",
            duracion_ms: payload.duracion_ms != null ? String(payload.duracion_ms) : "",
            detalle: payload.detalle || "",
        };
        if (!estado_pruebas[id_prueba]) {
            estado_pruebas[id_prueba] = { ultima: nueva, historial: [nueva], corriendo: false };
        } else {
            estado_pruebas[id_prueba].ultima = nueva;
            estado_pruebas[id_prueba].historial = [nueva].concat(estado_pruebas[id_prueba].historial).slice(0, 5);
            estado_pruebas[id_prueba].corriendo = false;
        }
        _renderizar_indicador(id_prueba);
    }

    async function _cargar_estado_inicial() {
        let resp;
        try {
            resp = await enviar({ tipo: "estado_pruebas" });
        } catch (e) {
            return;
        }
        if (resp && resp.exito && resp.por_prueba) {
            estado_pruebas = resp.por_prueba;
            _renderizar_indicadores_todos();
        }
    }

    // ============================================================
    // Sistema de pestanas
    // ============================================================

    function _leer_tab_recordada() {
        try { return localStorage.getItem(LS_KEY_TAB_ACTIVA) || ""; }
        catch (e) { return ""; }
    }

    function _guardar_tab_recordada(id) {
        try { localStorage.setItem(LS_KEY_TAB_ACTIVA, id); }
        catch (e) { /* ignorar */ }
    }

    function activar_tab(id_seccion) {
        tabs_nav.querySelectorAll("button").forEach((b) => {
            b.classList.toggle("active", b.dataset.idSeccion === id_seccion);
        });
        contenedor.querySelectorAll(".pestana").forEach((div) => {
            div.style.display = (div.dataset.idSeccion === id_seccion) ? "" : "none";
        });
        _guardar_tab_recordada(id_seccion);
    }

    function renderizar_tabs(secciones) {
        tabs_nav.innerHTML = "";
        secciones.forEach((s) => {
            const b = document.createElement("button");
            b.type = "button";
            b.textContent = s.nombre;
            b.dataset.idSeccion = s.id;
            b.addEventListener("click", () => activar_tab(s.id));
            tabs_nav.appendChild(b);
        });
    }

    // ============================================================
    // Render de grupos y pruebas
    // ============================================================

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
        _renderizar_indicador(id_prueba);
    }

    async function correr_grupo(card, resumen_el) {
        const boton = card.querySelector(".btn-correr-todas");
        if (boton) boton.disabled = true;
        const botones_prueba = card.querySelectorAll(".btn-correr-prueba");
        botones_prueba.forEach((b) => { b.disabled = true; });

        const lis = Array.from(card.querySelectorAll("li[data-id-prueba]"));
        let ok = 0;
        let fallo = 0;
        const total = lis.length;

        lis.forEach((li) => {
            const el = li.querySelector(".resultado");
            el.textContent = "\u2014";
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
            if (resumen_el) {
                resumen_el.textContent = `Corriendo ${i + 1}/${total}...`;
                resumen_el.className = "grupo-resumen";
            }

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
            _renderizar_indicador(id_prueba);

            if (resp && resp.exito && resp.resultado === "ok") ok++;
            else fallo++;
        }

        if (resumen_el) {
            resumen_el.textContent = ok + "/" + total + " OK";
            resumen_el.className = "grupo-resumen " + (fallo === 0 ? "ok" : "fallo");
        }
        if (boton) boton.disabled = false;
        botones_prueba.forEach((b) => { b.disabled = false; });
    }

    async function correr_todos_los_grupos(pestana_div, est_el, btn_el) {
        const cards = Array.from(pestana_div.querySelectorAll(".grupo-card"));
        if (cards.length === 0) return;

        if (btn_el) btn_el.disabled = true;

        let total_global = 0;
        let ok_global = 0;
        let fallo_global = 0;
        cards.forEach((c) => { total_global += c.querySelectorAll("li[data-id-prueba]").length; });

        let contador = 0;

        for (const card of cards) {
            const resumen_el = card.querySelector(".grupo-resumen");
            const lis = Array.from(card.querySelectorAll("li[data-id-prueba]"));
            if (lis.length === 0) continue;

            const boton = card.querySelector(".btn-correr-todas");
            if (boton) boton.disabled = true;
            const botones_prueba = card.querySelectorAll(".btn-correr-prueba");
            botones_prueba.forEach((b) => { b.disabled = true; });

            lis.forEach((li) => {
                const el = li.querySelector(".resultado");
                el.textContent = "\u2014";
                el.className = "resultado";
                li.classList.remove("corriendo");
            });

            for (const li of lis) {
                contador++;
                const id_prueba = li.dataset.idPrueba;
                const el = li.querySelector(".resultado");

                li.classList.add("corriendo");
                el.textContent = "Corriendo...";
                el.className = "resultado";
                if (est_el) est_el.textContent = `Corriendo ${contador}/${total_global}...`;

                let resp;
                try {
                    resp = await enviar({ tipo: "correr_prueba", id_prueba });
                } catch (e) {
                    el.textContent = "Error: " + e.message;
                    el.className = "resultado resultado-error";
                    li.classList.remove("corriendo");
                    fallo_global++;
                    continue;
                }

                aplicar_resultado(el, resp);
                li.classList.remove("corriendo");
                _renderizar_indicador(id_prueba);

                if (resp && resp.exito && resp.resultado === "ok") ok_global++;
                else fallo_global++;
            }

            if (resumen_el) {
                resumen_el.textContent = "Corrido";
                resumen_el.className = "grupo-resumen";
            }
            if (boton) boton.disabled = false;
            botones_prueba.forEach((b) => { b.disabled = false; });
        }

        if (est_el) {
            est_el.textContent = "Pestana: " + ok_global + "/" + total_global + " OK"
                + (fallo_global === 0 ? "" : " (" + fallo_global + " fallos)");
        }
        if (btn_el) btn_el.disabled = false;
    }

    function renderizar_grupo(grupo) {
        const card = document.createElement("div");
        card.className = "grupo-card";
        card.dataset.idGrupo = grupo.id;

        const header = document.createElement("div");
        header.className = "grupo-header";
        header.innerHTML =
            '<div><span class="grupo-nombre">' + grupo.nombre + '</span>' +
            '<span class="grupo-resumen"></span></div>' +
            '<button class="btn-correr-todas">\u25b6 Correr todas</button>';
        card.appendChild(header);

        const ul = document.createElement("ul");
        grupo.pruebas.forEach((p) => {
            const li = document.createElement("li");
            li.dataset.idPrueba = p.id;
            li.innerHTML =
                '<div class="prueba-nombre">' + p.nombre + '</div>' +
                '<div class="prueba-desc">' + (p.descripcion || "") + '</div>' +
                '<div class="acciones">' +
                '  <button class="btn-correr-prueba">\u25b6</button>' +
                '  <span class="resultado">\u2014</span>' +
                '  <span class="indicador-estado indicador-sin">\u2014</span>' +
                '</div>' +
                '<div class="historial-prueba" style="display:none"></div>';
            li.querySelector(".btn-correr-prueba").addEventListener("click", () => correr(p.id, li));
            li.querySelector(".indicador-estado").addEventListener("click", () => _toggle_historial(p.id, li));
            ul.appendChild(li);
        });
        card.appendChild(ul);

        const resumen_el = header.querySelector(".grupo-resumen");
        const btn_todas = header.querySelector(".btn-correr-todas");
        if (grupo.pruebas.length === 0) {
            btn_todas.disabled = true;
        } else {
            btn_todas.addEventListener("click", () => {
                correr_grupo(card, resumen_el);
            });
        }

        return card;
    }

    function renderizar_pestana(seccion) {
        const div = document.createElement("div");
        div.className = "pestana";
        div.dataset.idSeccion = seccion.id;

        // Barra de botones de la pestana.
        const barra = document.createElement("div");
        barra.className = "pestana-acciones";

        const btn_ejecutar = document.createElement("button");
        btn_ejecutar.type = "button";
        btn_ejecutar.textContent = "\u25b6 Ejecutar todos los roles";
        barra.appendChild(btn_ejecutar);

        const btn_limpiar = document.createElement("button");
        btn_limpiar.type = "button";
        btn_limpiar.textContent = "\ud83e\uddf9 Limpiar pruebas";
        barra.appendChild(btn_limpiar);

        const est_el = document.createElement("span");
        est_el.className = "pestana-estado";
        barra.appendChild(est_el);

        div.appendChild(barra);

        // Habilitar o deshabilitar segun haya pruebas/limpieza.
        const grupos_con_pruebas = (seccion.grupos || []).filter(
            (g) => g.pruebas && g.pruebas.length > 0
        );
        if (grupos_con_pruebas.length === 0) {
            btn_ejecutar.disabled = true;
        }
        const tiene_limpieza = Array.isArray(seccion.limpieza) && seccion.limpieza.length > 0;
        if (!tiene_limpieza) {
            btn_limpiar.disabled = true;
            btn_limpiar.title = "Sin limpieza especifica para esta pestana";
        }

        btn_ejecutar.addEventListener("click", () => {
            correr_todos_los_grupos(div, est_el, btn_ejecutar);
        });
        btn_limpiar.addEventListener("click", () => {
            limpiar_categoria(seccion, est_el, btn_limpiar);
        });

        // Contenido: grilla de grupos o aviso de pestana vacia.
        if (grupos_con_pruebas.length === 0) {
            const vacia = document.createElement("div");
            vacia.className = "grupo-vacio";
            vacia.textContent = "(sin pruebas por ahora)";
            div.appendChild(vacia);
            return div;
        }

        const grid = document.createElement("div");
        grid.className = "grid-grupos";
        grupos_con_pruebas.forEach((g) => {
            grid.appendChild(renderizar_grupo(g));
        });
        div.appendChild(grid);

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
        tabs_nav.innerHTML = "";

        if (!resp || !resp.exito) {
            mostrar_estado("Error: " + (resp && resp.error ? resp.error : "desconocido"));
            return;
        }

        secciones_cargadas = resp.secciones || [];
        const total_pruebas = secciones_cargadas.reduce(
            (acc, s) => acc + (s.grupos || []).reduce(
                (a, g) => a + (g.pruebas ? g.pruebas.length : 0), 0), 0);
        mostrar_estado(total_pruebas + " pruebas en "
            + secciones_cargadas.length + " pestanas");

        renderizar_tabs(secciones_cargadas);

        secciones_cargadas.forEach((s) => {
            contenedor.appendChild(renderizar_pestana(s));
        });

        const recordada = _leer_tab_recordada();
        const existe_recordada = secciones_cargadas.some((s) => s.id === recordada);
        const inicial = existe_recordada ? recordada
            : (secciones_cargadas[0] ? secciones_cargadas[0].id : null);
        if (inicial) activar_tab(inicial);
    }

    // ============================================================
    // Migraciones (v1.5plugin.9a)
    // ============================================================

    let _migraciones_panel_abierto = false;
    let _pasos_migracion = [];

    async function _toggle_migraciones() {
        _migraciones_panel_abierto = !_migraciones_panel_abierto;
        const panel = document.getElementById("migraciones_panel");
        if (_migraciones_panel_abierto) {
            panel.style.display = "block";
            await _renderizar_migraciones();
        } else {
            panel.style.display = "none";
        }
    }

    async function _renderizar_migraciones() {
        const panel = document.getElementById("migraciones_panel");
        if (!panel) return;
        panel.innerHTML = '<div class="estado">Cargando estado...</div>';

        let resp;
        try {
            resp = await enviar({ tipo: "estado_migracion" });
        } catch (e) {
            panel.innerHTML = '<div class="estado">Error: ' + e.message + '</div>';
            return;
        }

        if (!resp || !resp.exito) {
            panel.innerHTML = '<div class="estado">Error: ' + (resp && resp.error ? resp.error : "desconocido") + '</div>';
            return;
        }

        const estado = resp.estado;
        const actual = estado.actual;
        const historial = estado.historial || [];
        const en_curso = actual && actual.estado_global === "en_curso";

        // Obtener pasos desde el SW o usar los del catálogo
        if (_pasos_migracion.length === 0) {
            try {
                const r_pasos = await enviar({ tipo: "listar_pasos_migracion" });
                if (r_pasos && r_pasos.exito && r_pasos.pasos) {
                    _pasos_migracion = r_pasos.pasos;
                }
            } catch (e) { /* fallback: no listar */ }
        }

        let html = "";

        if (en_curso) {
            html += '<div class="migracion-aviso">';
            html += '<strong>Migración en curso</strong> iniciada el ' + _formatear_fecha(actual.fecha_inicio) + '.';
            html += ' Si cerraste el popup, el proceso sigue en el SW.';
            html += '</div>';

            html += '<ul class="migracion-lista-pasos">';
            const pasos_e = actual.pasos || {};
            for (let i = 0; i < _pasos_migracion.length; i++) {
                const p = _pasos_migracion[i];
                const pe = pasos_e[p.id] || { estado: "pendiente" };
                html += '<li class="migracion-paso">';
                html += '<span style="flex:1">' + (i+1) + '. ' + p.nombre + '</span>';
                html += '<span class="estado estado-' + pe.estado + '">' + pe.estado + '</span>';
                if (pe.estado === "error" && pe.output) {
                    html += '<button class="btn-ver-output" data-paso-id="' + p.id + '" title="Ver output" style="font-size:10px; padding:1px 6px;">ver</button>';
                }
                html += '</li>';
            }
            const pe_dr = pasos_e["drenar_buzon"] || { estado: "pendiente" };
            html += '<li class="migracion-paso"><span style="flex:1">10. Drenar buzón</span>';
            html += '<span class="estado estado-' + pe_dr.estado + '">' + pe_dr.estado + '</span></li>';
            html += '</ul>';

            html += '<div class="migracion-botones">';
            html += '<button id="btn_continuar_migracion" class="btn-correr-todas">▶ Continuar</button>';
            html += '<button id="btn_abandonar_migracion">Abandonar</button>';
            html += '</div>';
        } else {
            html += '<div class="migracion-aviso">';
            html += '<strong>⚠️ No usar la app durante la migración.</strong> Tarda 1-3 minutos. ';
            html += 'Si cerrás el popup, el proceso sigue en el SW. ';
            html += 'El drenado del buzón (si está tildado) hace logout + login + logout: al final quedás deslogueado.';
            html += '</div>';

            html += '<h3>Configurar migración</h3>';
            html += '<ul class="migracion-lista-pasos">';
            for (let i = 0; i < _pasos_migracion.length; i++) {
                const p = _pasos_migracion[i];
                const chk = p.default ? ' checked' : '';
                html += '<li class="migracion-paso' + (p.peligroso ? ' migracion-paso-peligroso' : '') + '">';
                html += '<label>';
                html += '<input type="checkbox" class="migracion-check" data-paso="' + p.id + '"' + chk + '>';
                html += '<span>' + (i+1) + '. ' + p.nombre + '</span>';
                if (p.peligroso) html += '<span class="tooltip-icon" title="' + (p.tooltip || "") + '">⚠️</span>';
                html += '</label>';
                html += '</li>';
            }
            html += '<li class="migracion-paso">';
            html += '<label>';
            html += '<input type="checkbox" id="migracion_check_drenar" checked>';
            html += '<span>10. Drenar buzón al final</span>';
            html += '<span class="tooltip-icon" title="Login como dueño con el código configurado. Si falla, drenar manualmente.">⚠️</span>';            html += '</label>';
            html += '</li>';
            html += '</ul>';

            html += '<div class="migracion-botones">';
            html += '<button id="btn_correr_migracion" class="btn-correr-todas">▶ Correr migraciones</button>';
            html += '</div>';

            if (actual && actual.estado_global !== "en_curso") {
                html += '<h3>Última migración</h3>';
                html += '<div class="migracion-hist-item">';
                html += '<span>' + _formatear_fecha(actual.fecha_inicio) + ' · ' + (actual.entorno || "") + '</span>';
                html += '<span class="migracion-hist-estado-' + actual.estado_global + '">' + actual.estado_global + '</span>';
                html += '</div>';

                // v1.5plugin.9f: mostrar todos los pasos con sus
                // estados y, si hubo errores, sus mensajes y
                // outputs. Antes solo se veía el resumen de una
                // línea y los detalles se perdían al re-renderizar.
                const pasos_c = actual.pasos || {};
                const total_pasos = _pasos_migracion.length + 1; // + drenar
                const ok_count = Object.values(pasos_c).filter(function(p) { return p.estado === "ok"; }).length;
                const salt_count = Object.values(pasos_c).filter(function(p) { return p.estado === "saltado"; }).length;
                const err_count = Object.values(pasos_c).filter(function(p) { return p.estado === "error"; }).length;
                html += '<div class="migracion-hist-item" style="background:#f8f9fa;">';
                html += '<span>' + ok_count + ' OK · ' + salt_count + ' saltados · ' + err_count + ' errores</span>';
                html += '</div>';

                if (err_count > 0 || (actual.estado_global === "error")) {
                    html += '<div class="migracion-aviso" style="margin-top:8px;">';
                    html += '<strong>Detalle de errores:</strong>';
                    for (let i = 0; i < _pasos_migracion.length; i++) {
                        const p = _pasos_migracion[i];
                        const pe = pasos_c[p.id];
                        if (!pe || pe.estado !== "error") continue;
                        html += '<div style="margin-top:6px;"><b>' + (i+1) + '. ' + _escapar_html(p.nombre) + ':</b> ';
                        html += _escapar_html(pe.mensaje || "(sin mensaje)");
                        html += '</div>';
                        if (pe.output) {
                            html += '<pre style="background:#1e1e1e; color:#d4d4d4; padding:6px; border-radius:4px; max-height:200px; overflow:auto; font-size:10px; white-space:pre-wrap; margin:4px 0 0 0;">' + _escapar_html(pe.output) + '</pre>';
                        }
                    }
                    const pe_dr = pasos_c["drenar_buzon"];
                    if (pe_dr && pe_dr.estado === "error") {
                        html += '<div style="margin-top:6px;"><b>10. Drenar buzón:</b> ';
                        html += _escapar_html(pe_dr.mensaje || "(sin mensaje)");
                        html += '</div>';
                    }
                    html += '</div>';
                }
            }

            if (historial.length > 1) {
                html += '<h3>Historial</h3>';
                for (const h of historial.slice(0, 5)) {
                    html += '<div class="migracion-hist-item">';
                    html += '<span>' + _formatear_fecha(h.fecha_inicio) + ' · ' + (h.entorno || "") + '</span>';
                    html += '<span class="migracion-hist-estado-' + h.estado_global + '">' + h.estado_global + '</span>';
                    html += '</div>';
                }
            }
        }

        panel.innerHTML = html;

        if (en_curso) {
            document.getElementById("btn_continuar_migracion").addEventListener("click", () => _continuar_migracion(actual));
            document.getElementById("btn_abandonar_migracion").addEventListener("click", () => _abandonar_migracion(actual.id));
            document.querySelectorAll(".btn-ver-output").forEach(function (btn) {
                btn.addEventListener("click", function () {
                    const pid = btn.dataset.pasoId;
                    const pe = (actual.pasos || {})[pid];
                    if (!pe || !pe.output) return;
                    const msg = (pe.mensaje ? "Mensaje: " + pe.mensaje + "\n\n" : "") + pe.output;
                    alert(msg);
                });
            });
        } else {
            document.getElementById("btn_correr_migracion").addEventListener("click", _correr_migracion);
        }
    }

    async function _correr_migracion() {
        const checks = document.querySelectorAll(".migracion-check");
        const pasos = {};
        for (const chk of checks) pasos[chk.dataset.paso] = chk.checked;
        if (Object.values(pasos).every(v => !v)) {
            alert("Seleccioná al menos un paso.");
            return;
        }
        const drenar = document.getElementById("migracion_check_drenar").checked;

        let es_local = true;
        try {
            const r_env = await enviar({ tipo: "entorno_actual" });
            es_local = r_env && r_env.entorno === "local";
        } catch (e) { /* asumir remoto por seguridad */ es_local = false; }

        if (es_local) {
            if (!confirm("¿Correr las migraciones seleccionadas?\n\nNo usar la app durante el proceso.\nTarda 1-3 minutos.")) return;
        } else {
            const resp = prompt("ATENCION: entorno REMOTO (posiblemente produccion).\n\nEl paso 1 reemplaza SQL64 con lo que hay en SQL.\n\nEscribi MIGRAR (mayusculas) para confirmar:");
            if (resp !== "MIGRAR") return;
        }

        _renderizar_progreso_migracion();
        try {
            const r = await enviar({
                tipo: "correr_migraciones",
                opciones: { pasos: pasos, drenar_buzon: drenar },
            });
            if (!r || !r.exito) {
                await _renderizar_migraciones();
                _mostrar_output_pasos_fallidos(r);
            }
        } catch (e) {
            alert("Error: " + e.message);
        } finally {
            await _renderizar_migraciones();
        }
    }

    function _mostrar_output_pasos_fallidos(respuesta) {
        const resultados = respuesta && respuesta.resultados ? respuesta.resultados : [];
        // v1.5plugin.9f: mostrar TODOS los errores, tengan o no
        // output. El drenado no hace GET, así que su error solo
        // tiene mensaje. Antes se filtraba por p.output, y el
        // error del drenado quedaba invisible.
        const fallidos = resultados.filter(function (p) { return p.estado === "error"; });
        if (fallidos.length === 0) {
            const err = respuesta && respuesta.error ? respuesta.error : "(sin detalle)";
            alert("Migración falló.\n\n" + err + "\n\nAbrí la consola del SW (chrome://extensions → plugin → Service Worker) para más detalle.");
            return;
        }
        // Alert principal con la lista de errores.
        let txt = "Migración terminó con errores:\n";
        for (const f of fallidos) {
            txt += "\n• " + f.paso + ": " + (f.mensaje || "(sin detalle)");
        }
        alert(txt);

        // Además, insertar los outputs (si los hay) en el panel.
        const con_output = fallidos.filter(function (f) { return f.output; });
        if (con_output.length === 0) return;
        const panel = document.getElementById("migraciones_panel");
        if (!panel) return;
        let html = '<h3>Output de pasos fallidos</h3>';
        for (const f of con_output) {
            html += '<div class="migracion-aviso">';
            html += '<strong>Paso: ' + _escapar_html(f.paso) + '</strong>';
            if (f.mensaje) html += '<br>' + _escapar_html(f.mensaje);
            html += '</div>';
            html += '<pre style="background:#1e1e1e; color:#d4d4d4; padding:8px; border-radius:4px; max-height:300px; overflow:auto; font-size:11px; white-space:pre-wrap; margin-bottom:12px;">' + _escapar_html(f.output) + '</pre>';
        }
        panel.insertAdjacentHTML("beforeend", html);
    }

    async function _continuar_migracion(actual) {
        const opciones = actual.opciones || { pasos: {}, drenar_buzon: true };
        const pasos_ya_ok = {};
        for (const [pid, pe] of Object.entries(actual.pasos || {})) {
            if (pe.estado === "ok" || pe.estado === "saltado") pasos_ya_ok[pid] = true;
        }
        if (!confirm("¿Continuar la migración desde donde quedó?")) return;

        _renderizar_progreso_migracion();
        try {
            const r = await enviar({
                tipo: "correr_migraciones",
                opciones: opciones,
                pasos_ya_ok: pasos_ya_ok,
            });
            if (!r || !r.exito) {
                alert("Error: " + (r && r.error ? r.error : "desconocido"));
            }
        } catch (e) {
            alert("Error: " + e.message);
        } finally {
            await _renderizar_migraciones();
        }
    }

    async function _abandonar_migracion(id_corrida) {
        if (!confirm("¿Abandonar la migración en curso? Los pasos que ya corrieron no se deshacen.")) return;
        try {
            await enviar({ tipo: "abandonar_migracion", id_corrida: id_corrida });
        } catch (e) {
            alert("Error: " + e.message);
        }
        await _renderizar_migraciones();
    }

    function _renderizar_progreso_migracion() {
        const panel = document.getElementById("migraciones_panel");
        if (!panel) return;
        let html = '<div class="migracion-aviso">Migración en curso. No cerrar el popup.</div>';
        html += '<ul class="migracion-lista-pasos">';
        for (let i = 0; i < _pasos_migracion.length; i++) {
            const p = _pasos_migracion[i];
            html += '<li class="migracion-paso" id="migracion_paso_' + p.id + '">';
            html += '<span style="flex:1">' + (i+1) + '. ' + p.nombre + '</span>';
            html += '<span class="estado estado-pendiente">pendiente</span></li>';
        }
        html += '<li class="migracion-paso" id="migracion_paso_drenar_buzon">';
        html += '<span style="flex:1">10. Drenar buzón</span>';
        html += '<span class="estado estado-pendiente">pendiente</span></li>';
        html += '</ul>';
        html += '<div class="migracion-botones"><button id="btn_cancelar_migracion">Cancelar</button></div>';
        panel.innerHTML = html;
        document.getElementById("btn_cancelar_migracion").addEventListener("click", async () => {
            try { await enviar({ tipo: "cancelar_migracion" }); }
            catch (e) { /* ignorar */ }
        });
    }

    function _actualizar_paso_migracion_ui(payload) {
        const li = document.getElementById("migracion_paso_" + payload.paso_id);
        if (!li) return;
        const span = li.querySelector(".estado");
        if (!span) return;
        span.className = "estado estado-" + payload.estado;
        span.textContent = payload.estado;
    }

    (function _conectar_boton_migraciones() {
        const btn = document.getElementById("btn_toggle_migraciones");
        if (btn) btn.addEventListener("click", _toggle_migraciones);
    })();

    // Listener de broadcasts
    const _listener_original = chrome.runtime.onMessage.hasListeners ? null : null;
    chrome.runtime.onMessage.addListener((msg) => {
        if (!msg) return;
        if (msg.tipo === "migracion_progreso") { _actualizar_paso_migracion_ui(msg); return; }
        if (msg.tipo === "migracion_terminada") {
            if (_migraciones_panel_abierto) _renderizar_migraciones();
            return;
        }
    });

    async function _arrancar() {
        await renderizar();
        await _cargar_estado_inicial();
    }

    _arrancar();
});