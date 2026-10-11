/**
 * Prueba: el enlace `dueno` de un terminal apunta a un
 * nodo marcado con `_es_compartido`.
 *
 * Verifica la Fase B2.3.5a (v1.5piloto.77f): después del
 * repuntado, el enlace `dueno` del terminal apunta al
 * contenedor `compartido_con_us_termX`, no al nodo del
 * dueño real. Además, el compartido tiene `dato` =
 * nombre del dueño (opción A) y el marcador `_es_compartido`.
 *
 * Flujo: login terminal para leer su nombre de usuario,
 * después login admin (porque `grafo/nodo` exige nivel
 * admin/soporte) para consultar el grafo.
 *
 * @version 1.5plugin.5x
 */

import { CODIGO_ADMIN } from "../ConfiguracionApli.js";
import { login_terminal } from "./_helpers.js";

export const prueba = {
    id: "enlace_dueno_apunta_al_compartido",
    nombre: "Grafo: enlace dueno del terminal apunta al compartido",
    descripcion: "Verifica que después del repuntado (v1.5piloto.77f), el enlace `dueno` de cada terminal apunta a un nodo con el marcador `_es_compartido` y con `dato` = nombre del dueño.",
    async ejecutar(ctx) {
        // 1. Login terminal para leer su nombre de usuario.
        await login_terminal(ctx);
        const r_nombre_term = await ctx.nombre_usuario_actual();
        if (!r_nombre_term || !r_nombre_term.exito) {
            throw new Error("No se pudo leer el nombre del terminal: "
                + (r_nombre_term && r_nombre_term.error ? r_nombre_term.error : "(sin detalle)"));
        }
        const nombre_term = r_nombre_term.nombre_usuario;

        // 2. Login admin (porque grafo/nodo exige admin o soporte).
        await ctx.asegurar_login(CODIGO_ADMIN);
        const r_nombre_admin = await ctx.nombre_usuario_actual();
        if (!r_nombre_admin || !r_nombre_admin.exito) {
            throw new Error("No se pudo leer el nombre del admin");
        }
        const nombre_admin = r_nombre_admin.nombre_usuario;

        // 3. Consultar el nodo del terminal.
        const r_nodo = await ctx.pedir_post("index.php", {
            accion: "grafo/nodo",
            nombre_solicitante: nombre_admin,
            id: "us_" + nombre_term
        });
        if (!r_nodo || !r_nodo.exito) {
            throw new Error("Error de red al consultar el terminal: "
                + (r_nodo && r_nodo.error ? r_nodo.error : "(sin detalle)"));
        }
        if (!r_nodo.json || !r_nodo.json.exito) {
            throw new Error("grafo/nodo del terminal devolvió error: "
                + (r_nodo.json && r_nodo.json.error ? r_nodo.json.error : "(sin detalle)"));
        }

        const adyacentes = (r_nodo.json.nodo && r_nodo.json.nodo.adyacentes) || [];
        const enlace_dueno = adyacentes.find(a => a.enlace === "dueno");
        ctx.assert(enlace_dueno,
            "El terminal us_" + nombre_term + " no tiene enlace `dueno`.");

        // 4. Consultar el nodo destino del enlace `dueno`.
        const r_destino = await ctx.pedir_post("index.php", {
            accion: "grafo/nodo",
            nombre_solicitante: nombre_admin,
            id: enlace_dueno.id_destino
        });
        if (!r_destino || !r_destino.exito || !r_destino.json || !r_destino.json.exito) {
            throw new Error("No se pudo consultar el nodo destino del enlace `dueno`");
        }

        const nodo_destino = r_destino.json.nodo;
        const ady_destino = nodo_destino.adyacentes || [];

        // 5. Verificar que el destino tenga `_es_compartido`.
        const tiene_marcador = ady_destino.some(a => a.enlace === "_es_compartido");
        ctx.assert(tiene_marcador,
            "El nodo destino del enlace `dueno` no tiene el marcador `_es_compartido`. "
            + "¿Corriste la migración ?repuntar_terminales_compartido=1 (v77f)?");

        // 6. Verificar que el compartido tenga `dato` = nombre del dueño (opción A).
        ctx.assert(nodo_destino.dato && nodo_destino.dato !== "",
            "El compartido no tiene `dato` = nombre del dueño (opción A). Dato actual: "
            + JSON.stringify(nodo_destino.dato));

        // 7. Verificar que el compartido tenga el sub-contenedor `ventas`.
        const tiene_ventas = ady_destino.some(a => a.enlace === "ventas");
        ctx.assert(tiene_ventas,
            "El compartido no tiene el sub-contenedor `ventas`.");
    }
};