/**
 * Logica de la ventana del plugin (popup de Chrome).
 *
 * Pide al service worker la lista de pruebas, las renderiza
 * con un boton play cada una, y muestra el resultado de la
 * corrida al lado. No usa imports (no es module).
 *
 * @version 1.5plugin.2
 */

document.addEventListener("DOMContentLoaded", () => {
    const lista = document.getElementById("lista_pruebas");
    const estado = document.getElementById("mensaje_estado");

    function mostrar_estado(texto) {
        estado.textContent = texto;
    }

    async function correr(id, li) {
        const el = li.querySelector(".resultado");
        el.textContent = "Corriendo...";
        el.className = "resultado";

        const resp = await chrome.runtime.sendMessage({
            tipo: "correr_prueba",
            id_prueba: id
        });

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

    async function renderizar() {
        const resp = await chrome.runtime.sendMessage({ tipo: "listar_pruebas" });
        lista.innerHTML = "";

        if (!resp || !resp.exito) {
            mostrar_estado("Error: " + (resp && resp.error ? resp.error : "desconocido"));
            return;
        }

        mostrar_estado(resp.pruebas.length + " prueba(s) disponibles");

        resp.pruebas.forEach((p) => {
            const li = document.createElement("li");
            li.innerHTML =
                '<div class="prueba-nombre">' + p.nombre + '</div>' +
                '<div class="prueba-desc">' + (p.descripcion || "") + '</div>' +
                '<div class="acciones">' +
                '  <button data-id="' + p.id + '">▶</button>' +
                '  <span class="resultado">—</span>' +
                '</div>';
            li.querySelector("button").addEventListener("click", () => correr(p.id, li));
            lista.appendChild(li);
        });
    }

    renderizar();
});