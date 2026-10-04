/**
 * Logica de la ventana del plugin (popup de Chrome).
 *
 * Renderiza las pruebas agrupadas por seccion. Cada seccion
 * tiene un boton "Correr todas" que ejecuta sus pruebas en
 * serie.
 *
 * No usa imports (no es module).
 *
 * @version 1.5plugin.4n
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