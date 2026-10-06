/**
 * Prueba: bloqueo por intentos fallidos y expiración.
 *
 * Verifica el rate limiting de autenticación con el tiempo
 * de bloqueo conmutable (ConfiguracionApli::
 * bloqueo_autenticacion_segundos() = 2s en modo pruebas).
 *
 * Flujo:
 *   1. Crear un usuario de prueba con contraseña conocida.
 *   2. Hacer 5 intentos fallidos consecutivos (llega al máximo).
 *   3. Verificar que el login correcto falla (bloqueado).
 *   4. Esperar 3s a que expire el bloqueo.
 *   5. Verificar que el login correcto ahora pasa.
 *   6. Limpiar: eliminar el usuario de prueba.
 *
 * No mide huérfanos: el fix de `bloqueado_hasta` vive en
 * el grafo de credenciales, y `grafo/resumen` solo mide la
 * app. La verificación de que la hoja se destruye queda
 * pendiente (requiere endpoint de credenciales).
 *
 * @version 1.5plugin.5u
 * @since 1.5plugin.5u
 */

import { CODIGO_ADMIN } from "../ConfiguracionApli.js";
import { cerrar_modales_si_abiertos } from "./_helpers.js";

export const prueba = {
    id: "bloqueo_expirado_permite_login",
    nombre: "Autenticación: bloqueo expira y permite login",
    descripcion: "Verifica que tras N intentos fallidos el usuario queda bloqueado, y que tras el tiempo de bloqueo (2s en modo pruebas) puede loguearse de nuevo.",
    async ejecutar(ctx) {
        await ctx.asegurar_login(CODIGO_ADMIN);
        await cerrar_modales_si_abiertos(ctx);

        const r_nombre = await ctx.nombre_usuario_actual();
        if (!r_nombre || !r_nombre.exito) {
            throw new Error("No se pudo leer el nombre del admin");
        }
        const nombre_admin = r_nombre.nombre_usuario;

        const sufijo = String(Date.now()).slice(-8);
        const nombre_prueba = "bloq" + sufijo;
        const contrasena_correcta = "testpass1234";

        // El alta de usuario puede disparar alert() con el
        // código asignado. Activar modo prueba + override.
        await ctx.sobrescribir_alertas();
        await ctx.activar_modo_prueba();

        try {
            // 1. Crear usuario de prueba.
            const r_crear = await ctx.pedir_post("index.php", {
                accion: "administrador/agregar_usuario",
                nombre_solicitante: nombre_admin,
                nombre_usuario: nombre_prueba,
                contrasena: contrasena_correcta,
                nivel: "dueno",
                nombre_real: "Prueba Bloqueo"
            });
            ctx.assert(r_crear && r_crear.exito && r_crear.json && r_crear.json.exito,
                "No se pudo crear el usuario de prueba: "
                + (r_crear && r_crear.json && r_crear.json.error ? r_crear.json.error : "(sin detalle)"));

            // 2. Cinco intentos fallidos consecutivos.
            const intentos_maximos = 5;
            for (let i = 0; i < intentos_maximos; i++) {
                const r = await ctx.pedir_post("index.php", {
                    accion: "autenticar/verificar",
                    usuario: nombre_prueba,
                    contrasena: "mala_" + i + "_" + sufijo
                });
                ctx.assert(r && r.exito && r.json && r.json.exito === false,
                    "El intento fallido " + (i + 1) + " no devolvió error.");
            }

            // 3. Con el bloqueo activo, el login correcto debe fallar.
            const r_bloqueado = await ctx.pedir_post("index.php", {
                accion: "autenticar/verificar",
                usuario: nombre_prueba,
                contrasena: contrasena_correcta
            });
            ctx.assert(r_bloqueado && r_bloqueado.exito && r_bloqueado.json && r_bloqueado.json.exito === false,
                "El usuario bloqueado pudo loguearse: el rate limiting no funciona.");

            // 4. Esperar a que expire el bloqueo (2s + margen).
            await ctx.pausa(3000);

            // 5. Ahora sí, el login correcto debe pasar.
            const r_ok = await ctx.pedir_post("index.php", {
                accion: "autenticar/verificar",
                usuario: nombre_prueba,
                contrasena: contrasena_correcta
            });
            ctx.assert(r_ok && r_ok.exito && r_ok.json && r_ok.json.exito === true,
                "El login falló tras esperar el bloqueo: "
                + (r_ok && r_ok.json && r_ok.json.error ? r_ok.json.error : "(sin detalle)"));

        } finally {
            // 6. Limpieza.
            try {
                await ctx.pedir_post("index.php", {
                    accion: "administrador/eliminar_usuario",
                    nombre_solicitante: nombre_admin,
                    nombre_usuario: nombre_prueba
                });
            } catch (e) {
                console.warn("No se pudo eliminar el usuario de prueba:", e);
            }
            await ctx.restaurar_alertas();
            await ctx.desactivar_modo_prueba();
        }
    }
};