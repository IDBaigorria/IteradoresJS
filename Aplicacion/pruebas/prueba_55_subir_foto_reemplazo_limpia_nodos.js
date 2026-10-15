/**
 * Prueba: subir foto a un vehículo y reemplazarla.
 *
 * Verifica el fix v75a: al subir una foto nueva a un
 * vehículo que ya tenía una, la hoja `foto` vieja se
 * destruye (no queda huérfana).
 *
 * Flujo:
 *   1. Crear empresa + vehículo de prueba.
 *   2. Subir foto A (PNG).
 *   3. Medir huérfanos (H1).
 *   4. Subir foto B (otro PNG).
 *   5. Medir huérfanos (H2). H2 debe ser == H1.
 *   6. Verificar que el vehículo tiene la foto B.
 *   7. Limpieza: eliminar la empresa (arrastra el vehículo).
 *
 * @version 1.5plugin.7g
 * @since 1.5plugin.5u
 */

import { CODIGO_ADMIN } from "../ConfiguracionApli.js";
import { cerrar_modales_si_abiertos } from "./_helpers.js";
import { PNG_TRANSPARENTE_B64, PNG_ALTERNATIVO_B64 } from "./_pasajeros_helpers.js";
import { ir_a_micros_y_elegir_dueno, eliminar_empresa_por_post } from "./_empresas_helpers.js";

async function _contar_huerfanos(ctx, nombre_solicitante) {
    const r = await ctx.post_accion("grafo/resumen", {});
    if (!r || !r.exito || !r.json || !r.json.exito) {
        throw new Error("No se pudo consultar grafo/resumen: "
            + (r && r.json && r.json.error ? r.json.error : "(sin detalle)"));
    }
    return r.json.resumen.huerfanos;
}

export const prueba = {
    id: "subir_foto_reemplazo_limpia_nodos",
    nombre: "Vehículos: reemplazo de foto destruye la vieja",
    descripcion: "Verifica que subir una foto nueva destruye la hoja `foto` vieja (fix v75a).",
    async ejecutar(ctx) {
        await ctx.asegurar_login(CODIGO_ADMIN);
        await cerrar_modales_si_abiertos(ctx);

        const r_nombre = await ctx.nombre_usuario_actual();
        if (!r_nombre || !r_nombre.exito) {
            throw new Error("No se pudo leer el nombre del admin");
        }
        const nombre_admin = r_nombre.nombre_usuario;

        const { nombre_dueno } = await ir_a_micros_y_elegir_dueno(ctx);

        const sufijo = String(Date.now()).slice(-8);
        const nombre_empresa = "fotoauto" + sufijo;
        const nombre_vehiculo = "FOTO" + sufijo;

        const r_emp = await ctx.post_accion("empresas/agregar", {
            nombre_dueno,
            nombre_empresa,
            nombre_real: "Empresa Foto Test"
        });
        ctx.assert(r_emp && r_emp.exito && r_emp.json && r_emp.json.exito,
            "No se pudo crear la empresa: "
            + (r_emp && r_emp.json && r_emp.json.error ? r_emp.json.error : "(sin detalle)"));

        try {
            const r_veh = await ctx.post_accion("vehiculos/agregar", {
                nombre_dueno,
                nombre_empresa,
                nombre_vehiculo,
                nombre_real: "Vehiculo Foto Test"
            });
            ctx.assert(r_veh && r_veh.exito && r_veh.json && r_veh.json.exito,
                "No se pudo crear el vehículo: "
                + (r_veh && r_veh.json && r_veh.json.error ? r_veh.json.error : "(sin detalle)"));

            // 1. Subir foto A.
            const r_foto_a = await ctx.subir_archivo(
                "vehiculos/subir_foto",
                { nombre_empresa, nombre_vehiculo, nombre_dueno },
                { nombre: "fotoA_" + sufijo + ".png", tipo: "image/png", contenido_base64: PNG_TRANSPARENTE_B64, nombre_campo: "foto" }
            );
            ctx.assert(r_foto_a && r_foto_a.exito && r_foto_a.json && r_foto_a.json.exito,
                "Falló la subida de la foto A: "
                + (r_foto_a && r_foto_a.json && r_foto_a.json.error ? r_foto_a.json.error : "(sin detalle)"));

            // Capturar la ruta de la foto A. El backend guarda
            // con nombre derivado del vehículo + timestamp, no
            // con el nombre original del archivo. Para verificar
            // que la B reemplazó a la A, comparamos las rutas.
            const r_listar_a = await ctx.post_accion("vehiculos/listar", {
                nombre_dueno,
                nombre_empresa
            });
            ctx.assert(r_listar_a && r_listar_a.exito && r_listar_a.json && r_listar_a.json.exito,
                "No se pudieron listar los vehículos tras la foto A: "
                + (r_listar_a && r_listar_a.json && r_listar_a.json.error ? r_listar_a.json.error : "(sin detalle)"));
            const veh_a = (r_listar_a.json.vehiculos || []).find(v => v.nombre_vehiculo === nombre_vehiculo);
            ctx.assert(veh_a && veh_a.foto, "El vehículo no tiene foto tras subir la A.");
            const foto_a_path = veh_a.foto;

            const H1 = await _contar_huerfanos(ctx, nombre_admin);

            // 2. Subir foto B (reemplaza la A).
            const r_foto_b = await ctx.subir_archivo(
                "vehiculos/subir_foto",
                { nombre_empresa, nombre_vehiculo, nombre_dueno },
                { nombre: "fotoB_" + sufijo + ".png", tipo: "image/png", contenido_base64: PNG_ALTERNATIVO_B64, nombre_campo: "foto" }
            );
            ctx.assert(r_foto_b && r_foto_b.exito && r_foto_b.json && r_foto_b.json.exito,
                "Falló la subida de la foto B: "
                + (r_foto_b && r_foto_b.json && r_foto_b.json.error ? r_foto_b.json.error : "(sin detalle)"));

            const H2 = await _contar_huerfanos(ctx, nombre_admin);
            ctx.assert(H2 === H1,
                "Reemplazar la foto dejó huérfanos (el nodo viejo no se destruyó). "
                + "H1=" + H1 + ", H2=" + H2 + ", dif=" + (H2 - H1));

            // 3. Verificar que el vehículo tiene la foto B.
            const r_listar = await ctx.post_accion("vehiculos/listar", {
                nombre_dueno,
                nombre_empresa
            });
            ctx.assert(r_listar && r_listar.exito && r_listar.json && r_listar.json.exito,
                "No se pudieron listar los vehículos: "
                + (r_listar && r_listar.json && r_listar.json.error ? r_listar.json.error : "(sin detalle)"));
            const veh = (r_listar.json.vehiculos || []).find(v => v.nombre_vehiculo === nombre_vehiculo);
            ctx.assert(veh && veh.foto,
                "El vehículo no tiene foto tras la subida.");
            // La ruta debe haber cambiado respecto a la foto A.
            // El backend genera el nombre (vehículo + timestamp),
            // así que no se puede chequear contra el nombre
            // original del archivo. Comparamos rutas.
            ctx.assert(veh.foto !== foto_a_path,
                "La foto del vehículo no cambió tras subir la B. "
                + "Ruta actual: " + veh.foto
                + " (era: " + foto_a_path + ")");

        } finally {
            await eliminar_empresa_por_post(ctx, nombre_dueno, nombre_empresa);
        }
    }
};