/**
 * Prueba de login: entra con código de admin, verifica que
 * la app está visible y que el nivel mostrado es correcto.
 *
 * @version 1.5plugin.3
 */

import { CODIGO_ADMIN } from "../ConfPlugin.js";

export const prueba = {
    id: "login_admin",
    nombre: "Login: admin con código",
    descripcion: "Entra con el código del admin, verifica que #aplicacion esté visible y que el nivel sea admin.",

    async ejecutar(ctx) {
        // Asegurar que no queda sesión previa.
        await ctx.cerrar_sesion();

        // Login como admin.
        await ctx.asegurar_login(CODIGO_ADMIN);

        // La app debe estar visible.
        const app_visible = await ctx.esta_visible("#aplicacion");
        ctx.assert(app_visible, "La app no se mostró después del login");

        // El nivel debe decir admin.
        const nivel = await ctx.texto("#nivel_usuario_actual");
        ctx.assert(nivel !== null, "No se encontró #nivel_usuario_actual");
        ctx.assert(nivel.trim() === "admin", "El nivel mostrado no es admin: " + JSON.stringify(nivel));

        // Cerrar sesión para dejar el piloto limpio.
        const cerro = await ctx.cerrar_sesion();
        ctx.assert(cerro, "No se pudo cerrar la sesión");
    }
};