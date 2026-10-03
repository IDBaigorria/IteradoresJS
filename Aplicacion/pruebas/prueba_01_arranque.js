/**
 * Prueba de arranque: verifica que la extension habla con el
 * script de contenido y que la pagina del piloto esta cargada.
 *
 * @version 1.5plugin.2
 */

export const prueba = {
    id: "arranque",
    nombre: "Arranque: plugin y script de contenido",
    descripcion: "Verifica que el script de contenido responde al saludo y que la pantalla de login existe.",

    async ejecutar(ctx) {
        const saludo = await ctx.enviar("saludo", {});
        ctx.assert(saludo && saludo.exito, "El script de contenido no respondio al saludo: " + (saludo && saludo.error ? saludo.error : ""));
        ctx.assert(saludo.respuesta === true, "El script de contenido devolvio una respuesta inesperada");

        const login = await ctx.esperar("#pantalla_login", 3000);
        ctx.assert(login && login.exito, "No se encontro #pantalla_login en la pagina del piloto");
    }
};