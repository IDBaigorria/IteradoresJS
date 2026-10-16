/**
 * Logica de la ventana del plugin (popup de Chrome).
 *
 * Renderiza las pruebas agrupadas en PESTANAS tematicas.
 * Cada pestana tiene una barra con dos botones:
 *   - "Ejecutar todos los roles": corre todas las pruebas
 *     de la pestana, en todos los grupos.
 *   - "Limpiar pruebas": limpia los datos de prueba que
 *     corresponden a la pestana (por ejemplo, Viajes limpia
 *     viajes; Ventas limpia ventas y cancelaciones).
 *
 * La pestana activa se persiste en localStorage.
 *
 * No usa imports (no es module).
 *
 * @version 1.5plugin.7z
 */

document.addEventListener("DOMContentLoaded", () => {
    const contenedor = document.getElementById("contenedor_secciones");
    const estado = document.getElementById("mensaje_estado");
    const tabs_nav = document.getElementById("tabs");

    const LS_KEY_TAB_ACTIVA = "plugin_tab_activa";

    let secciones_cargadas = [];
    let limpieza_en_curso = false;

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

    chrome.runtime.onMessage.addListener((msg) => {
        if (msg && msg.tipo === "limpieza_progreso") {
            _procesar_progreso(msg.evento);
        }
        if (msg && msg.tipo === "estado_en_vivo_cambio") {
            _aplicar_cambio_estado(msg.estado);
        }
    });

    // ============================================================
    // Estado en vivo de la corrida
    // ============================================================
    //
    // El SW escribe el estado en chrome.storage.session y
    // nos notifica por mensaje. Al abrir el popup, pedimos
    // el estado para saber si hay algo corriendo.
    function _aplicar_cambio_estado(estado) {
        // Limpiar cualquier marca previa.
        document.querySelectorAll("li.corriendo").forEach((li) => {
            li.classList.remove("corriendo");
            const el = li.querySelector(".resultado");
            if (el && el.textContent === "Corriendo...") {
                el.textContent = "\u2014";
                el.className = "resultado";
            }
        });

        if (!estado || !estado.corriendo || !estado.id_prueba) return;

        // Buscar la li de la prueba en curso.
        const lis = document.querySelectorAll("li[data-id-prueba]");
        for (const li of lis) {
            if (li.dataset.idPrueba === estado.id_prueba) {
                li.classList.add("corriendo");
                const el = li.querySelector(".resultado");
                if (el) {
                    el.textContent = "Corriendo...";
                    el.className = "resultado";
                }
                break;
            }
        }
    }

    async function _cargar_estado_inicial() {
        let resp;
        try {
            resp = await enviar({ tipo: "estado_en_vivo" });
        } catch (e) {
            return;
        }
        if (resp && resp.exito) {
            _aplicar_cambio_estado(resp.estado);
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

        // Contar total de pruebas para progreso general.
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
                el.textContent = "—";
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
            '<button class="btn-correr-todas">▶ Correr todas</button>';
        card.appendChild(header);

        const ul = document.createElement("ul");
        grupo.pruebas.forEach((p) => {
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
        btn_ejecutar.textContent = "▶ Ejecutar todos los roles";
        barra.appendChild(btn_ejecutar);

        const btn_limpiar = document.createElement("button");
        btn_limpiar.type = "button";
        btn_limpiar.textContent = "🧹 Limpiar pruebas";
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

    async function _arrancar() {
        await renderizar();
        await _cargar_estado_inicial();
    }

    _arrancar();
});