<?php
/**
 * Aplicador de cambios automáticos — Plugin de pruebas (iteradoresJS).
 *
 * Tanda V1.5plugin.5k:
 *   - Pruebas espejo de v1.5piloto.74y:
 *     * eliminar_vehiculo_limpia_nodos.
 *     * eliminar_empresa_limpia_nodos.
 *   - Sección "grafo" pasa a 9 pruebas.
 *   - Bump de ConfPlugin, catálogo y prompt.
 *
 * Uso:
 *   php aplicar_cambios.php
 *
 * Correr parado en la raíz de iteradoresJS/.
 */

// ============================================================
// Configuración
// ============================================================

$modo_estricto = true;
$raiz_proyecto = __DIR__;

// ============================================================
// Cambios a aplicar
// ============================================================

$cambios = [

    // --------------------------------------------------------
    // ConfPlugin.js
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'Bump VERSION_APP a 5k',
        'buscar' => [
            '    Conf.VERSION_APP = "1.5plugin.5j";',
        ],
        'reemplazar' => [
            '    Conf.VERSION_APP = "1.5plugin.5k";',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'Bump VERSION_PLUGIN a 5k',
        'buscar' => [
            'export const VERSION_PLUGIN = "1.5plugin.5j";',
        ],
        'reemplazar' => [
            'export const VERSION_PLUGIN = "1.5plugin.5k";',
        ],
    ],

    // --------------------------------------------------------
    // catalogo.js
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'Bump @version de catalogo.js a 5k',
        'buscar' => [
            ' * @version 1.5plugin.5j',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.5k',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'Agregar imports de las pruebas 37 y 38',
        'buscar' => [
            'import { prueba as cambiar_micro_a_mitad_limpia_nodos } from "./prueba_36_cambiar_micro_a_mitad_limpia_nodos.js";',
            '',
            'export const SECCIONES = [',
        ],
        'reemplazar' => [
            'import { prueba as cambiar_micro_a_mitad_limpia_nodos } from "./prueba_36_cambiar_micro_a_mitad_limpia_nodos.js";',
            'import { prueba as eliminar_vehiculo_limpia_nodos } from "./prueba_37_eliminar_vehiculo_limpia_nodos.js";',
            'import { prueba as eliminar_empresa_limpia_nodos } from "./prueba_38_eliminar_empresa_limpia_nodos.js";',
            '',
            'export const SECCIONES = [',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'Agregar pruebas 37 y 38 a la sección grafo',
        'buscar' => [
            '        pruebas: [',
            '            eliminar_viaje_limpia_nodos,',
            '            eliminar_micro_limpia_nodos,',
            '            eliminar_terminal_limpia_nodos,',
            '            editar_paradas_limpia_nodos,',
            '            cancelar_venta_limpia_nodos,',
            '            deseleccionar_asiento_limpia_nodos,',
            '            cambiar_micro_a_mitad_limpia_nodos',
            '        ]',
        ],
        'reemplazar' => [
            '        pruebas: [',
            '            eliminar_viaje_limpia_nodos,',
            '            eliminar_micro_limpia_nodos,',
            '            eliminar_terminal_limpia_nodos,',
            '            editar_paradas_limpia_nodos,',
            '            cancelar_venta_limpia_nodos,',
            '            deseleccionar_asiento_limpia_nodos,',
            '            cambiar_micro_a_mitad_limpia_nodos,',
            '            eliminar_vehiculo_limpia_nodos,',
            '            eliminar_empresa_limpia_nodos',
            '        ]',
        ],
    ],

    // --------------------------------------------------------
    // Prompt del plugin
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'Prompt plugin: estado a 5k con 38 pruebas',
        'buscar' => [
            '**Proyecto en v1.5plugin.5j.** El esqueleto del plugin está',
            'armado y funcional, tiene 36 pruebas (base + autocompletado',
            '+ puntos de venta + viajes + micros + ventas + grafo) y las agrupa',
            'en secciones.',
        ],
        'reemplazar' => [
            '**Proyecto en v1.5plugin.5k.** El esqueleto del plugin está',
            'armado y funcional, tiene 38 pruebas (base + autocompletado',
            '+ puntos de venta + viajes + micros + ventas + grafo) y las agrupa',
            'en secciones.',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'Prompt plugin: agregar pruebas 37 y 38 a la lista grafo',
        'buscar' => [
            '  - `cambiar_micro_a_mitad_limpia_nodos`:',
            '    `seleccionar_asiento_micro` (v1.5piloto.74x), en el',
            '    bloque de cambio de micro a mitad de selección',
            '    (`limpiar_lista = true`), destruye los',
            '    asientos-en-venta viejos. Requiere un viaje con 2',
            '    micros.',
        ],
        'reemplazar' => [
            '  - `cambiar_micro_a_mitad_limpia_nodos`:',
            '    `seleccionar_asiento_micro` (v1.5piloto.74x), en el',
            '    bloque de cambio de micro a mitad de selección',
            '    (`limpiar_lista = true`), destruye los',
            '    asientos-en-venta viejos. Requiere un viaje con 2',
            '    micros.',
            '  - `eliminar_vehiculo_limpia_nodos`: `eliminar_vehiculo`',
            '    (v1.5piloto.74y) destruye el vehículo completo',
            '    (asientos, pisos, listas circulares de asientos,',
            '    campos).',
            '  - `eliminar_empresa_limpia_nodos`: `eliminar_empresa`',
            '    (v1.5piloto.74y) destruye la empresa y todos sus',
            '    vehículos completos.',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'Prompt plugin: última actualización a 5k',
        'buscar' => [
            '**Última actualización de este prompt:** v1.5plugin.5j',
        ],
        'reemplazar' => [
            '**Última actualización de este prompt:** v1.5plugin.5k',
            '(pruebas espejo de v1.5piloto.74y:',
            '`eliminar_vehiculo_limpia_nodos` y',
            '`eliminar_empresa_limpia_nodos`. Verifican que',
            '`eliminar_vehiculo` destruye el vehículo completo, y que',
            '`eliminar_empresa` destruye la empresa con todos sus',
            'vehículos. Miden huérfanos con `grafo/resumen`. La',
            'sección "grafo" pasa a 9 pruebas.).',
            'Antes: v1.5plugin.5j',
        ],
    ],

    // --------------------------------------------------------
    // Prueba 37
    // --------------------------------------------------------

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_37_eliminar_vehiculo_limpia_nodos.js',
        'descripcion' => 'Prueba 37: eliminar vehículo limpia nodos',
        'contenido' => [
            '/**',
            ' * Prueba: eliminar_vehiculo limpia el subárbol del vehículo.',
            ' *',
            ' * Verifica la Fase 2 del plan de optimización del grafo',
            ' * (v1.5piloto.74y). Antes, `eliminar_vehiculo` solo',
            ' * desenlazaba el vehículo del contenedor de la empresa:',
            ' * el nodo vehículo, su contenedor de asientos, sus pisos',
            ' * y todas sus listas circulares de asientos quedaban',
            ' * huérfanos (~100 nodos por vehículo).',
            ' *',
            ' * Mide huérfanos con `grafo/resumen`:',
            ' *   H0: antes de nada.',
            ' *   H1: después de crear empresa + vehículo + configurar',
            ' *       asientos. Assert H1 === H0.',
            ' *   H2: después de eliminar el vehículo. Assert H2 === H0.',
            ' *',
            ' * La prueba deja la empresa (sin vehículos) al final y la',
            ' * elimina en el paso de limpieza.',
            ' *',
            ' * Requisitos de entorno: solo un dueño existente.',
            ' *',
            ' * @version 1.5plugin.5k',
            ' */',
            '',
            'import { CODIGO_ADMIN } from "../ConfPlugin.js";',
            '',
            '// ============================================================',
            '// Helpers internos',
            '// ============================================================',
            '',
            'async function _resumen_grafo(ctx, nombre_solicitante) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "grafo/resumen",',
            '        nombre_solicitante',
            '    });',
            '    if (!r || !r.exito) {',
            '        throw new Error("Error de red al consultar grafo/resumen: " + (r && r.error ? r.error : "(sin detalle)"));',
            '    }',
            '    if (!r.json || !r.json.exito) {',
            '        throw new Error("grafo/resumen devolvió error: " + (r.json && r.json.error ? r.json.error : "(sin detalle)"));',
            '    }',
            '    const j = r.json.resumen || {};',
            '    if (typeof j.huerfanos !== "number" || typeof j.total !== "number") {',
            '        throw new Error("grafo/resumen no devolvió huerfanos/total. Respuesta: " + JSON.stringify(j).slice(0, 200));',
            '    }',
            '    return j;',
            '}',
            '',
            'async function _primer_dueno(ctx, nombre_solicitante) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "administrador/listar_duenos",',
            '        nombre_solicitante',
            '    });',
            '    if (!r || !r.exito || !r.json || !r.json.exito) {',
            '        throw new Error("No se pudo listar dueños: "',
            '            + ((r && r.json && r.json.error) ? r.json.error : "(sin detalle)"));',
            '    }',
            '    const lista = r.json.duenos || [];',
            '    if (!Array.isArray(lista) || lista.length === 0) {',
            '        throw new Error("No hay dueños disponibles.");',
            '    }',
            '    const primero = lista[0];',
            '    const nombre = typeof primero === "string"',
            '        ? primero',
            '        : (primero.nombre_usuario || primero.nombre || primero.usuario);',
            '    if (!nombre) {',
            '        throw new Error("No se pudo determinar el nombre del dueño: "',
            '            + JSON.stringify(primero).slice(0, 200));',
            '    }',
            '    return nombre;',
            '}',
            '',
            '// Configuración de asientos 2x2 (4 asientos). Devuelve el',
            '// JSON que espera vehiculos/actualizar_configuracion.',
            'function _config_asientos_2x2() {',
            '    return JSON.stringify({',
            '        pisos: [{',
            '            filas: 2,',
            '            columnas: 2,',
            '            asientos: [',
            '                { fila: "1", columna: "1", numero: "1" },',
            '                { fila: "1", columna: "2", numero: "2" },',
            '                { fila: "2", columna: "1", numero: "3" },',
            '                { fila: "2", columna: "2", numero: "4" }',
            '            ]',
            '        }]',
            '    });',
            '}',
            '',
            '// ============================================================',
            '// Prueba',
            '// ============================================================',
            '',
            'export const prueba = {',
            '    id: "eliminar_vehiculo_limpia_nodos",',
            '    nombre: "Grafo: eliminar vehículo limpia los nodos",',
            '    descripcion: "Verifica que eliminar un vehículo destruye su subárbol completo (Fase 2 del plan de optimización, v1.5piloto.74y). Mide huérfanos con grafo/resumen antes, después de crear, y después de eliminar.",',
            '    async ejecutar(ctx) {',
            '        await ctx.asegurar_login(CODIGO_ADMIN);',
            '',
            '        const r_nombre = await ctx.nombre_usuario_actual();',
            '        if (!r_nombre || !r_nombre.exito) {',
            '            throw new Error("No se pudo leer el nombre de usuario del admin: "',
            '                + (r_nombre && r_nombre.error ? r_nombre.error : "(sin detalle)"));',
            '        }',
            '        const nombre_admin = r_nombre.nombre_usuario;',
            '',
            '        const nombre_dueno = await _primer_dueno(ctx, nombre_admin);',
            '',
            '        const H0 = (await _resumen_grafo(ctx, nombre_admin)).huerfanos;',
            '',
            '        const sufijo = String(Date.now()).slice(-8);',
            '        const nombre_empresa = "emprevgraf" + sufijo;',
            '        const nombre_vehiculo = "vehgraf" + sufijo;',
            '',
            '        // 1. Crear empresa.',
            '        const r_em = await ctx.pedir_post("index.php", {',
            '            accion: "empresas/agregar",',
            '            nombre_solicitante: nombre_admin,',
            '            nombre_dueno,',
            '            nombre_empresa,',
            '            nombre_real: "Empresa prueba grafo"',
            '        });',
            '        if (!r_em || !r_em.exito || !r_em.json || !r_em.json.exito) {',
            '            throw new Error("No se pudo crear la empresa: "',
            '                + ((r_em && r_em.json && r_em.json.error) ? r_em.json.error : "(sin detalle)"));',
            '        }',
            '',
            '        // 2. Crear vehículo.',
            '        const r_ve = await ctx.pedir_post("index.php", {',
            '            accion: "vehiculos/agregar",',
            '            nombre_solicitante: nombre_admin,',
            '            nombre_empresa,',
            '            nombre_vehiculo,',
            '            nombre_real: "Vehículo prueba grafo"',
            '        });',
            '        if (!r_ve || !r_ve.exito || !r_ve.json || !r_ve.json.exito) {',
            '            throw new Error("No se pudo crear el vehículo: "',
            '                + ((r_ve && r_ve.json && r_ve.json.error) ? r_ve.json.error : "(sin detalle)"));',
            '        }',
            '',
            '        // 3. Configurar asientos.',
            '        const r_cf = await ctx.pedir_post("index.php", {',
            '            accion: "vehiculos/actualizar_configuracion",',
            '            nombre_solicitante: nombre_admin,',
            '            nombre_empresa,',
            '            nombre_vehiculo,',
            '            configuracion: _config_asientos_2x2()',
            '        });',
            '        if (!r_cf || !r_cf.exito || !r_cf.json || !r_cf.json.exito) {',
            '            throw new Error("No se pudo configurar el vehículo: "',
            '                + ((r_cf && r_cf.json && r_cf.json.error) ? r_cf.json.error : "(sin detalle)"));',
            '        }',
            '',
            '        const H1 = (await _resumen_grafo(ctx, nombre_admin)).huerfanos;',
            '        const dif_crear = H1 - H0;',
            '        ctx.assert(H1 === H0,',
            '            "Crear empresa + vehículo + configuración dejó huérfanos. "',
            '            + "H0=" + H0 + ", H1=" + H1 + ", diferencia=" + dif_crear + ".");',
            '',
            '        // 4. Eliminar vehículo.',
            '        const r_del = await ctx.pedir_post("index.php", {',
            '            accion: "vehiculos/eliminar",',
            '            nombre_solicitante: nombre_admin,',
            '            nombre_empresa,',
            '            nombre_vehiculo',
            '        });',
            '        if (!r_del || !r_del.exito || !r_del.json || !r_del.json.exito) {',
            '            throw new Error("No se pudo eliminar el vehículo: "',
            '                + ((r_del && r_del.json && r_del.json.error) ? r_del.json.error : "(sin detalle)"));',
            '        }',
            '',
            '        const H2 = (await _resumen_grafo(ctx, nombre_admin)).huerfanos;',
            '        const dif_eliminar = H2 - H0;',
            '        ctx.assert(H2 === H0,',
            '            "eliminar_vehiculo dejó nodos huérfanos. "',
            '            + "H0=" + H0 + ", H1=" + H1 + ", H2=" + H2',
            '            + ", diferencia vs H0=" + dif_eliminar + "."',
            '            + (dif_eliminar > 0 ? " Quedaron " + dif_eliminar + " nodos huérfanos." : " Algo inesperado."));',
            '',
            '        // 5. Limpieza: eliminar la empresa.',
            '        await ctx.pedir_post("index.php", {',
            '            accion: "empresas/eliminar",',
            '            nombre_solicitante: nombre_admin,',
            '            nombre_dueno,',
            '            nombre_empresa',
            '        });',
            '    }',
            '};',
        ],
    ],

    // --------------------------------------------------------
    // Prueba 38
    // --------------------------------------------------------

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_38_eliminar_empresa_limpia_nodos.js',
        'descripcion' => 'Prueba 38: eliminar empresa limpia nodos',
        'contenido' => [
            '/**',
            ' * Prueba: eliminar_empresa limpia el subárbol completo.',
            ' *',
            ' * Verifica la Fase 2 del plan de optimización del grafo',
            ' * (v1.5piloto.74y). Antes, `eliminar_empresa` solo',
            ' * desenlazaba la empresa del contenedor del dueño y los',
            ' * vehículos de su contenedor: el nodo empresa, su contenedor',
            ' * `vehiculos`, y cada vehículo con sus pisos y listas',
            ' * circulares de asientos quedaban huérfanos',
            ' * (N × ~100 nodos por empresa).',
            ' *',
            ' * Mide huérfanos con `grafo/resumen`:',
            ' *   H0: antes de nada.',
            ' *   H1: después de crear empresa + 2 vehículos configurados.',
            ' *       Assert H1 === H0.',
            ' *   H2: después de eliminar la empresa. Assert H2 === H0.',
            ' *',
            ' * Requisitos de entorno: solo un dueño existente.',
            ' *',
            ' * @version 1.5plugin.5k',
            ' */',
            '',
            'import { CODIGO_ADMIN } from "../ConfPlugin.js";',
            '',
            '// ============================================================',
            '// Helpers internos',
            '// ============================================================',
            '',
            'async function _resumen_grafo(ctx, nombre_solicitante) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "grafo/resumen",',
            '        nombre_solicitante',
            '    });',
            '    if (!r || !r.exito) {',
            '        throw new Error("Error de red al consultar grafo/resumen: " + (r && r.error ? r.error : "(sin detalle)"));',
            '    }',
            '    if (!r.json || !r.json.exito) {',
            '        throw new Error("grafo/resumen devolvió error: " + (r.json && r.json.error ? r.json.error : "(sin detalle)"));',
            '    }',
            '    const j = r.json.resumen || {};',
            '    if (typeof j.huerfanos !== "number" || typeof j.total !== "number") {',
            '        throw new Error("grafo/resumen no devolvió huerfanos/total. Respuesta: " + JSON.stringify(j).slice(0, 200));',
            '    }',
            '    return j;',
            '}',
            '',
            'async function _primer_dueno(ctx, nombre_solicitante) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "administrador/listar_duenos",',
            '        nombre_solicitante',
            '    });',
            '    if (!r || !r.exito || !r.json || !r.json.exito) {',
            '        throw new Error("No se pudo listar dueños: "',
            '            + ((r && r.json && r.json.error) ? r.json.error : "(sin detalle)"));',
            '    }',
            '    const lista = r.json.duenos || [];',
            '    if (!Array.isArray(lista) || lista.length === 0) {',
            '        throw new Error("No hay dueños disponibles.");',
            '    }',
            '    const primero = lista[0];',
            '    const nombre = typeof primero === "string"',
            '        ? primero',
            '        : (primero.nombre_usuario || primero.nombre || primero.usuario);',
            '    if (!nombre) {',
            '        throw new Error("No se pudo determinar el nombre del dueño: "',
            '            + JSON.stringify(primero).slice(0, 200));',
            '    }',
            '    return nombre;',
            '}',
            '',
            'function _config_asientos_2x2() {',
            '    return JSON.stringify({',
            '        pisos: [{',
            '            filas: 2,',
            '            columnas: 2,',
            '            asientos: [',
            '                { fila: "1", columna: "1", numero: "1" },',
            '                { fila: "1", columna: "2", numero: "2" },',
            '                { fila: "2", columna: "1", numero: "3" },',
            '                { fila: "2", columna: "2", numero: "4" }',
            '            ]',
            '        }]',
            '    });',
            '}',
            '',
            '// ============================================================',
            '// Prueba',
            '// ============================================================',
            '',
            'export const prueba = {',
            '    id: "eliminar_empresa_limpia_nodos",',
            '    nombre: "Grafo: eliminar empresa limpia los nodos",',
            '    descripcion: "Verifica que eliminar una empresa destruye su subárbol completo (empresa + N vehículos con asientos) (Fase 2 del plan de optimización, v1.5piloto.74y). Mide huérfanos con grafo/resumen antes, después de crear, y después de eliminar.",',
            '    async ejecutar(ctx) {',
            '        await ctx.asegurar_login(CODIGO_ADMIN);',
            '',
            '        const r_nombre = await ctx.nombre_usuario_actual();',
            '        if (!r_nombre || !r_nombre.exito) {',
            '            throw new Error("No se pudo leer el nombre de usuario del admin: "',
            '                + (r_nombre && r_nombre.error ? r_nombre.error : "(sin detalle)"));',
            '        }',
            '        const nombre_admin = r_nombre.nombre_usuario;',
            '',
            '        const nombre_dueno = await _primer_dueno(ctx, nombre_admin);',
            '',
            '        const H0 = (await _resumen_grafo(ctx, nombre_admin)).huerfanos;',
            '',
            '        const sufijo = String(Date.now()).slice(-8);',
            '        const nombre_empresa = "emprevgraf" + sufijo;',
            '        const vehiculos = ["vehgrafA" + sufijo, "vehgrafB" + sufijo];',
            '',
            '        // 1. Crear empresa.',
            '        const r_em = await ctx.pedir_post("index.php", {',
            '            accion: "empresas/agregar",',
            '            nombre_solicitante: nombre_admin,',
            '            nombre_dueno,',
            '            nombre_empresa,',
            '            nombre_real: "Empresa prueba grafo"',
            '        });',
            '        if (!r_em || !r_em.exito || !r_em.json || !r_em.json.exito) {',
            '            throw new Error("No se pudo crear la empresa: "',
            '                + ((r_em && r_em.json && r_em.json.error) ? r_em.json.error : "(sin detalle)"));',
            '        }',
            '',
            '        // 2. Crear 2 vehículos, cada uno con su configuración.',
            '        for (const nombre_vehiculo of vehiculos) {',
            '            const r_ve = await ctx.pedir_post("index.php", {',
            '                accion: "vehiculos/agregar",',
            '                nombre_solicitante: nombre_admin,',
            '                nombre_empresa,',
            '                nombre_vehiculo,',
            '                nombre_real: "Vehículo prueba grafo"',
            '            });',
            '            if (!r_ve || !r_ve.exito || !r_ve.json || !r_ve.json.exito) {',
            '                throw new Error("No se pudo crear el vehículo " + nombre_vehiculo + ": "',
            '                    + ((r_ve && r_ve.json && r_ve.json.error) ? r_ve.json.error : "(sin detalle)"));',
            '            }',
            '',
            '            const r_cf = await ctx.pedir_post("index.php", {',
            '                accion: "vehiculos/actualizar_configuracion",',
            '                nombre_solicitante: nombre_admin,',
            '                nombre_empresa,',
            '                nombre_vehiculo,',
            '                configuracion: _config_asientos_2x2()',
            '            });',
            '            if (!r_cf || !r_cf.exito || !r_cf.json || !r_cf.json.exito) {',
            '                throw new Error("No se pudo configurar el vehículo " + nombre_vehiculo + ": "',
            '                    + ((r_cf && r_cf.json && r_cf.json.error) ? r_cf.json.error : "(sin detalle)"));',
            '            }',
            '        }',
            '',
            '        const H1 = (await _resumen_grafo(ctx, nombre_admin)).huerfanos;',
            '        const dif_crear = H1 - H0;',
            '        ctx.assert(H1 === H0,',
            '            "Crear empresa + 2 vehículos con configuración dejó huérfanos. "',
            '            + "H0=" + H0 + ", H1=" + H1 + ", diferencia=" + dif_crear + ".");',
            '',
            '        // 3. Eliminar empresa.',
            '        const r_del = await ctx.pedir_post("index.php", {',
            '            accion: "empresas/eliminar",',
            '            nombre_solicitante: nombre_admin,',
            '            nombre_dueno,',
            '            nombre_empresa',
            '        });',
            '        if (!r_del || !r_del.exito || !r_del.json || !r_del.json.exito) {',
            '            throw new Error("No se pudo eliminar la empresa: "',
            '                + ((r_del && r_del.json && r_del.json.error) ? r_del.json.error : "(sin detalle)"));',
            '        }',
            '',
            '        const H2 = (await _resumen_grafo(ctx, nombre_admin)).huerfanos;',
            '        const dif_eliminar = H2 - H0;',
            '        ctx.assert(H2 === H0,',
            '            "eliminar_empresa dejó nodos huérfanos. "',
            '            + "H0=" + H0 + ", H1=" + H1 + ", H2=" + H2',
            '            + ", diferencia vs H0=" + dif_eliminar + "."',
            '            + (dif_eliminar > 0 ? " Quedaron " + dif_eliminar + " nodos huérfanos." : " Algo inesperado."));',
            '    }',
            '};',
        ],
    ],

];

// ============================================================
// Runner
// ============================================================

echo "=== Aplicador de cambios ===\n\n";

function detectar_eol(string $contenido): string {
    return (strpos($contenido, "\r\n") !== false) ? "\r\n" : "\n";
}
function normalizar_a_unix(string $contenido): string {
    return str_replace("\r\n", "\n", $contenido);
}
function normalizar_a_original(string $contenido, string $eol): string {
    if ($eol === "\n") return $contenido;
    return str_replace("\n", "\r\n", $contenido);
}
function contar_ocurrencias(string $contenido, string $bloque): int {
    if ($bloque === '') return 0;
    $count = 0;
    $offset = 0;
    while (($pos = strpos($contenido, $bloque, $offset)) !== false) {
        $count++;
        $offset = $pos + strlen($bloque);
    }
    return $count;
}

$creaciones = [];
$eliminaciones = [];
$reemplazos_por_archivo = [];

foreach ($cambios as $cambio) {
    $tipo = $cambio['tipo'] ?? 'reemplazar';
    if ($tipo === 'crear') { $creaciones[] = $cambio; continue; }
    if ($tipo === 'eliminar') { $eliminaciones[] = $cambio; continue; }
    if (!isset($cambio['archivo']) || !isset($cambio['buscar']) || !isset($cambio['reemplazar'])) {
        echo "[FALLO] Cambio mal formado (faltan campos).\n";
        exit(1);
    }
    $reemplazos_por_archivo[$cambio['archivo']][] = $cambio;
}

$total_reemplazos = 0;
foreach ($reemplazos_por_archivo as $lista) { $total_reemplazos += count($lista); }

echo "[INFO] " . count($creaciones) . " archivo(s) a crear, "
    . $total_reemplazos . " reemplazo(s) en "
    . count($reemplazos_por_archivo) . " archivo(s), "
    . count($eliminaciones) . " archivo(s) a eliminar.\n\n";

$archivos_a_escribir = [];
$bloques_ok = 0;
$bloques_fallidos = [];

foreach ($reemplazos_por_archivo as $archivo_rel => $lista_cambios) {
    $ruta_abs = $raiz_proyecto . '/' . $archivo_rel;
    if (!file_exists($ruta_abs)) {
        $bloques_fallidos[] = "Archivo no encontrado: $archivo_rel";
        foreach ($lista_cambios as $c) $bloques_fallidos[] = "  - {$c['descripcion']}";
        continue;
    }
    $contenido_original = file_get_contents($ruta_abs);
    if ($contenido_original === false) { $bloques_fallidos[] = "No se pudo leer: $archivo_rel"; continue; }

    $eol = detectar_eol($contenido_original);
    $contenido = normalizar_a_unix($contenido_original);
    $contenido_antes = $contenido;
    $hubo_error = false;

    foreach ($lista_cambios as $cambio) {
        $buscar_str = implode("\n", $cambio['buscar']);
        $reemplazar_str = implode("\n", $cambio['reemplazar']);
        $ocurrencias = contar_ocurrencias($contenido, $buscar_str);
        if ($ocurrencias === 0) {
            $bloques_fallidos[] = "$archivo_rel: bloque no encontrado - {$cambio['descripcion']}";
            $hubo_error = true; continue;
        }
        if ($ocurrencias > 1) {
            $bloques_fallidos[] = "$archivo_rel: bloque ambiguo ($ocurrencias ocurrencias) - {$cambio['descripcion']}";
            $hubo_error = true; continue;
        }
        $contenido = str_replace($buscar_str, $reemplazar_str, $contenido);
        $bloques_ok++;
    }
    if (!$hubo_error && $contenido !== $contenido_antes) {
        $archivos_a_escribir[$ruta_abs] = normalizar_a_original($contenido, $eol);
    }
}

if ($modo_estricto && !empty($bloques_fallidos)) {
    echo "=== ABORTADO ===\n";
    echo "Se detectaron " . count($bloques_fallidos) . " problema(s). No se escribió ningún archivo.\n\n";
    foreach ($bloques_fallidos as $f) echo "  [FALLO] $f\n";
    echo "\nSugerencia: revisá que el bloque a buscar coincida exactamente con el archivo actual.\n";
    exit(1);
}

foreach ($archivos_a_escribir as $ruta_abs => $contenido_final) {
    if (file_put_contents($ruta_abs, $contenido_final) === false) {
        echo "[FALLO] No se pudo escribir: " . substr($ruta_abs, strlen($raiz_proyecto) + 1) . "\n";
        continue;
    }
    echo "[OK] " . substr($ruta_abs, strlen($raiz_proyecto) + 1) . "\n";
}

foreach ($creaciones as $creacion) {
    $ruta_abs = $raiz_proyecto . '/' . $creacion['archivo'];
    $dir_destino = dirname($ruta_abs);
    if (!is_dir($dir_destino)) mkdir($dir_destino, 0777, true);
    $contenido_nuevo = implode("\n", $creacion['contenido']);
    $ya_existia = file_exists($ruta_abs);
    if (file_put_contents($ruta_abs, $contenido_nuevo) === false) {
        echo "[FALLO] No se pudo crear: {$creacion['archivo']}\n"; continue;
    }
    $accion = $ya_existia ? 'sobrescrito' : 'creado';
    echo "[OK] {$creacion['archivo']} ($accion)\n";
}

foreach ($eliminaciones as $elim) {
    $ruta_abs = $raiz_proyecto . '/' . $elim['archivo'];
    if (!file_exists($ruta_abs)) {
        echo "[INFO] " . $elim['archivo'] . " no existía (nada que eliminar).\n";
        continue;
    }
    if (unlink($ruta_abs)) {
        echo "[OK] " . $elim['archivo'] . " (eliminado)\n";
    } else {
        echo "[FALLO] No se pudo eliminar: " . $elim['archivo'] . "\n";
    }
}

echo "\n=== Resumen ===\n";
echo "Bloques aplicados: $bloques_ok\n";
echo "Archivos nuevos:   " . count($creaciones) . "\n";
if (!empty($bloques_fallidos)) {
    echo "Fallos: " . count($bloques_fallidos) . "\n";
    foreach ($bloques_fallidos as $f) echo "  - $f\n";
}
echo "\nListo.\n";