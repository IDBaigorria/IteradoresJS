/**
 * Prueba: cancelar una venta del terminal la quita de
 * AMBOS árboles paralelos.
 *
 * Simétrica de la prueba 58 (`venta_terminal_arbol_dual`).
 *
 * @version 1.5plugin.6g
 */

import { CODIGO_TERMINAL1 } from "../ConfiguracionApli.js";
import {
    login_terminal,
    ir_a_viajes_y_abrir_primero,
    abrir_primer_micro_con_libres,
    seleccionar_n_asientos,
    abrir_modal_confirmacion,
    setear_metodo_y_cuotas,
    confirmar_venta,
    obtener_id_ultima_venta,
    cancelar_venta,
    cerrar_form_venta_y_liberar,
    datos_comprador_aleatorio,
    datos_pasajero_aleatorio,
    llenar_comprador,
    llenar_pasajero
} from "./_helpers.js";

async function _en_ambos(ctx, id_venta, nombre_dueno, nombre_term) {
    const r_d = await ctx.pedir_post("index.php", {
        accion: "ventas/listar", tipo: "dueno", nombre: nombre_dueno
    });
    const r_t = await ctx.pedir_post("index.php", {
        accion: "ventas/listar", tipo: "terminal", nombre: nombre_term
    });
    const v_d = (r_d && r_d.json && r_d.json.ventas) || [];
    const v_t = (r_t && r_t.json && r_t.json.ventas) || [];
    return {
        dueno: v_d.some(v => v && v.id_venta === id_venta),
        terminal: v_t.some(v => v && v.id_venta === id_venta)
    };
}

export const prueba = {
    id: "cancelar_venta_arbol_dual",
    nombre: "Grafo: cancelar venta la quita de ambos árboles",
    descripcion: "Vende un asiento con un terminal, verifica que la venta aparece en los dos listados (dueño y terminal), la cancela y verifica que ya no aparece en ninguno. Simétrica de la prueba 58.",
    async ejecutar(ctx) {
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
        await confirmar_venta(ctx);

        const id_venta = await obtener_id_ultima_venta(ctx);
        if (!id_venta) throw new Error("No se obtuvo id_venta");

        const r_nombre_term = await ctx.nombre_usuario_actual();
        if (!r_nombre_term || !r_nombre_term.exito) {
            throw new Error("No se pudo leer el nombre del terminal");
        }
        const nombre_term = r_nombre_term.nombre_usuario;

        const r_perfil = await ctx.pedir_post("index.php", {
            accion: "usuarios/mi_perfil",
            nombre_solicitante: nombre_term
        });
        if (!r_perfil || !r_perfil.json || !r_perfil.json.exito) {
            throw new Error("No se pudo leer el perfil del terminal");
        }
        const nombre_dueno = r_perfil.json.perfil.dueno || "";
        ctx.assert(nombre_dueno !== "", "El perfil no incluye dueño.");

        const antes = await _en_ambos(ctx, id_venta, nombre_dueno, nombre_term);
        ctx.assert(antes.dueno,
            "Antes de cancelar: la venta NO aparece en el árbol del dueño.");
        ctx.assert(antes.terminal,
            "Antes de cancelar: la venta NO aparece en el árbol del terminal.");

        await cerrar_form_venta_y_liberar(ctx);
        await cancelar_venta(ctx, id_venta, "Cancelada por prueba 60");

        const despues = await _en_ambos(ctx, id_venta, nombre_dueno, nombre_term);
        ctx.assert(!despues.dueno,
            "Después de cancelar: la venta TODAVÍA aparece en el árbol del dueño.");
        ctx.assert(!despues.terminal,
            "Después de cancelar: la venta TODAVÍA aparece en el árbol del terminal.");
    }
};