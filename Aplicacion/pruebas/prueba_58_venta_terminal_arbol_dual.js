/**
 * Prueba: una venta hecha por un terminal aparece en
 * AMBOS árboles paralelos.
 *
 * Verifica la Fase B2.3.4 (v1.5piloto.77e): al vender,
 * la venta se inserta en el árbol del dueño (enlaces
 * `hmi`/`hd`/`p`) Y en el árbol del compartido del terminal
 * (enlaces `hmi_<term>`/`hd_<term>`/`p_<term>`).
 *
 * Flujo: login terminal, vender un asiento, leer el id de
 * la última venta, login admin para consultar el grafo,
 * verificar enlaces, y login terminal para cancelar la
 * venta al final.
 *
 * @version 1.5plugin.5x
 */

import { CODIGO_ADMIN } from "../ConfiguracionApli.js";
import {
    login_terminal,
    ir_a_viajes_y_abrir_primero,
    abrir_primer_micro_con_libres,
    seleccionar_n_asientos,
    abrir_modal_confirmacion,
    setear_metodo_y_cuotas,
    setear_monto_pagado,
    confirmar_venta,
    obtener_id_ultima_venta,
    cancelar_venta,
    cerrar_form_venta_y_liberar,
    datos_comprador_aleatorio,
    datos_pasajero_aleatorio,
    llenar_comprador,
    llenar_pasajero
} from "./_helpers.js";

export const prueba = {
    id: "venta_terminal_arbol_dual",
    nombre: "Grafo: venta del terminal aparece en ambos árboles",
    descripcion: "Verifica que al vender un terminal, la venta se inserta en el árbol del dueño (hmi/hd/p) y en el árbol del compartido (hmi_<term>/hd_<term>/p_<term>). Fase B2.3.4, v1.5piloto.77e.",
    async ejecutar(ctx) {
        // 1. Login terminal y hacer una venta rápida.
        await login_terminal(ctx);

        await ir_a_viajes_y_abrir_primero(ctx);
        await abrir_primer_micro_con_libres(ctx);
        await seleccionar_n_asientos(ctx, 1);
        await abrir_modal_confirmacion(ctx);

        const comprador = datos_comprador_aleatorio();
        const pasajero = datos_pasajero_aleatorio(0);
        await llenar_comprador(ctx, comprador);
        await llenar_pasajero(ctx, 0, pasajero);

        await setear_metodo_y_cuotas(ctx, "efectivo", 1);
        await setear_monto_pagado(ctx, 1000);
        await confirmar_venta(ctx);

        const id_venta = await obtener_id_ultima_venta(ctx);
        if (!id_venta) throw new Error("No se obtuvo id_venta");

        const r_nombre_term = await ctx.nombre_usuario_actual();
        const nombre_term = r_nombre_term && r_nombre_term.exito ? r_nombre_term.nombre_usuario : "";
        ctx.assert(nombre_term !== "", "No se pudo leer el nombre del terminal");

        await cerrar_form_venta_y_liberar(ctx);

        // 2. Login admin para consultar el grafo.
        await ctx.asegurar_login(CODIGO_ADMIN);
        const r_nombre_admin = await ctx.nombre_usuario_actual();
        if (!r_nombre_admin || !r_nombre_admin.exito) {
            throw new Error("No se pudo leer el nombre del admin");
        }
        const nombre_admin = r_nombre_admin.nombre_usuario;

        const r_nodo = await ctx.pedir_post("index.php", {
            accion: "grafo/nodo",
            nombre_solicitante: nombre_admin,
            id: id_venta
        });
        if (!r_nodo || !r_nodo.exito) {
            throw new Error("Error de red al consultar el nodo venta: "
                + (r_nodo && r_nodo.error ? r_nodo.error : "(sin detalle)"));
        }
        if (!r_nodo.json || !r_nodo.json.exito) {
            throw new Error("grafo/nodo del venta devolvió error: "
                + (r_nodo.json && r_nodo.json.error ? r_nodo.json.error : "(sin detalle)"));
        }

        const adyacentes = (r_nodo.json.nodo && r_nodo.json.nodo.adyacentes) || [];

        // 3. Verificar enlace del árbol del dueño (default).
        const enlaces_default = adyacentes.filter(a =>
            a.enlace === "hmi" || a.enlace === "hd" || a.enlace === "p"
        );
        ctx.assert(enlaces_default.length > 0,
            "La venta no tiene ningún enlace del árbol del dueño (hmi/hd/p). "
            + "Enlaces actuales: " + adyacentes.map(a => a.enlace).join(", "));

        // 4. Verificar enlace del árbol del compartido (parametrizado).
        const sufijo = "_" + nombre_term;
        const enlaces_param = adyacentes.filter(a =>
            a.enlace === "hmi" + sufijo || a.enlace === "hd" + sufijo || a.enlace === "p" + sufijo
        );
        ctx.assert(enlaces_param.length > 0,
            "La venta no tiene ningún enlace del árbol del compartido (hmi_<term>/hd_<term>/p_<term>). "
            + "Enlaces actuales: " + adyacentes.map(a => a.enlace).join(", ")
            + ". Terminal: " + nombre_term);

        // 5. Login terminal de vuelta y cancelar la venta para limpiar.
        await login_terminal(ctx);
        await cancelar_venta(ctx, id_venta, "Cancelada por prueba automatica (arbol_dual)");
    }
};