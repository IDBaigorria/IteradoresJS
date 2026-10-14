<?php
/**
 * Aplicador — Fase 2c.2a-1: migracion de pruebas 30, 31, 32, 33,
 * 37, 38, 39, 40, 41 a ctx.post_accion.
 *
 * Cada prueba usaba ctx.pedir_post("index.php", {accion, ...,
 * nombre_solicitante: nombre_admin, ...}). Como en todas
 * nombre_solicitante es el logueado (admin), se reemplaza por
 * ctx.post_accion(accion, {...}) que inyecta el del logueado y
 * cachea el nombre.
 *
 * No se toca el resto del codigo: los chequeos de error siguen
 * funcionando porque post_accion devuelve lo mismo que pedir_post.
 *
 * Uso (raiz del proyecto plugin): php aplicar_cambios.php
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;
$version_nueva = '1.5plugin.7e';

$htmls_a_bumpear = [];

$cambios = [

    // ============================================================
    // PRUEBA 30
    // ============================================================

    // 30.1: _contar_nodos
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_30_eliminar_viaje_limpia_nodos.js',
        'descripcion' => 'P30: _contar_nodos con post_accion',
        'buscar' => [
            'async function _contar_nodos(ctx, nombre_solicitante) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "grafo/resumen",',
            '        nombre_solicitante',
            '    });',
        ],
        'reemplazar' => [
            'async function _contar_nodos(ctx, nombre_solicitante) {',
            '    const r = await ctx.post_accion("grafo/resumen", {});',
        ],
    ],

    // 30.2: _primer_dueno
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_30_eliminar_viaje_limpia_nodos.js',
        'descripcion' => 'P30: _primer_dueno con post_accion',
        'buscar' => [
            'async function _primer_dueno(ctx, nombre_solicitante) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "administrador/listar_duenos",',
            '        nombre_solicitante',
            '    });',
        ],
        'reemplazar' => [
            'async function _primer_dueno(ctx, nombre_solicitante) {',
            '    const r = await ctx.post_accion("administrador/listar_duenos", {});',
        ],
    ],

    // 30.3: viajes/guardar
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_30_eliminar_viaje_limpia_nodos.js',
        'descripcion' => 'P30: viajes/guardar con post_accion',
        'buscar' => [
            '        const rc = await ctx.pedir_post("index.php", {',
            '            accion: "viajes/guardar",',
            '            nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '        const rc = await ctx.post_accion("viajes/guardar", {',
        ],
    ],

    // 30.4: viajes/eliminar
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_30_eliminar_viaje_limpia_nodos.js',
        'descripcion' => 'P30: viajes/eliminar con post_accion',
        'buscar' => [
            '        const rd = await ctx.pedir_post("index.php", {',
            '            accion: "viajes/eliminar",',
            '            nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '        const rd = await ctx.post_accion("viajes/eliminar", {',
        ],
    ],

    // ============================================================
    // PRUEBA 31
    // ============================================================

    // 31.1: _contar_nodos
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_31_eliminar_micro_limpia_nodos.js',
        'descripcion' => 'P31: _contar_nodos con post_accion',
        'buscar' => [
            'async function _contar_nodos(ctx, nombre_solicitante) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "grafo/resumen",',
            '        nombre_solicitante',
            '    });',
        ],
        'reemplazar' => [
            'async function _contar_nodos(ctx, nombre_solicitante) {',
            '    const r = await ctx.post_accion("grafo/resumen", {});',
        ],
    ],

    // 31.2: _primer_dueno
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_31_eliminar_micro_limpia_nodos.js',
        'descripcion' => 'P31: _primer_dueno con post_accion',
        'buscar' => [
            'async function _primer_dueno(ctx, nombre_solicitante) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "administrador/listar_duenos",',
            '        nombre_solicitante',
            '    });',
        ],
        'reemplazar' => [
            'async function _primer_dueno(ctx, nombre_solicitante) {',
            '    const r = await ctx.post_accion("administrador/listar_duenos", {});',
        ],
    ],

    // 31.3: _empresas_del_dueno
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_31_eliminar_micro_limpia_nodos.js',
        'descripcion' => 'P31: _empresas_del_dueno con post_accion',
        'buscar' => [
            'async function _empresas_del_dueno(ctx, nombre_solicitante, nombre_dueno) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "empresas/listar",',
            '        nombre_solicitante,',
            '        nombre_dueno',
            '    });',
        ],
        'reemplazar' => [
            'async function _empresas_del_dueno(ctx, nombre_solicitante, nombre_dueno) {',
            '    const r = await ctx.post_accion("empresas/listar", {',
            '        nombre_dueno',
            '    });',
        ],
    ],

    // 31.4: _vehiculos_de_empresa
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_31_eliminar_micro_limpia_nodos.js',
        'descripcion' => 'P31: _vehiculos_de_empresa con post_accion',
        'buscar' => [
            'async function _vehiculos_de_empresa(ctx, nombre_solicitante, nombre_dueno, nombre_empresa) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "vehiculos/listar",',
            '        nombre_solicitante,',
            '        nombre_dueno,',
            '        nombre_empresa',
            '    });',
        ],
        'reemplazar' => [
            'async function _vehiculos_de_empresa(ctx, nombre_solicitante, nombre_dueno, nombre_empresa) {',
            '    const r = await ctx.post_accion("vehiculos/listar", {',
            '        nombre_dueno,',
            '        nombre_empresa',
            '    });',
        ],
    ],

    // 31.5: viajes/guardar
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_31_eliminar_micro_limpia_nodos.js',
        'descripcion' => 'P31: viajes/guardar con post_accion',
        'buscar' => [
            '        const rc = await ctx.pedir_post("index.php", {',
            '            accion: "viajes/guardar",',
            '            nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '        const rc = await ctx.post_accion("viajes/guardar", {',
        ],
    ],

    // 31.6: viajes/agregar_micro
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_31_eliminar_micro_limpia_nodos.js',
        'descripcion' => 'P31: viajes/agregar_micro con post_accion',
        'buscar' => [
            '                const r_ag = await ctx.pedir_post("index.php", {',
            '                    accion: "viajes/agregar_micro",',
            '                    nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '                const r_ag = await ctx.post_accion("viajes/agregar_micro", {',
        ],
    ],

    // 31.7: viajes/eliminar_micro
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_31_eliminar_micro_limpia_nodos.js',
        'descripcion' => 'P31: viajes/eliminar_micro con post_accion',
        'buscar' => [
            '        const re = await ctx.pedir_post("index.php", {',
            '            accion: "viajes/eliminar_micro",',
            '            nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '        const re = await ctx.post_accion("viajes/eliminar_micro", {',
        ],
    ],

    // 31.8: viajes/eliminar (final)
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_31_eliminar_micro_limpia_nodos.js',
        'descripcion' => 'P31: viajes/eliminar con post_accion',
        'buscar' => [
            '        const rv = await ctx.pedir_post("index.php", {',
            '            accion: "viajes/eliminar",',
            '            nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '        const rv = await ctx.post_accion("viajes/eliminar", {',
        ],
    ],

    // ============================================================
    // PRUEBA 32
    // ============================================================

    // 32.1: _contar_nodos
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_32_eliminar_terminal_limpia_nodos.js',
        'descripcion' => 'P32: _contar_nodos con post_accion',
        'buscar' => [
            'async function _contar_nodos(ctx, nombre_solicitante) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "grafo/resumen",',
            '        nombre_solicitante',
            '    });',
        ],
        'reemplazar' => [
            'async function _contar_nodos(ctx, nombre_solicitante) {',
            '    const r = await ctx.post_accion("grafo/resumen", {});',
        ],
    ],

    // 32.2: _primer_dueno
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_32_eliminar_terminal_limpia_nodos.js',
        'descripcion' => 'P32: _primer_dueno con post_accion',
        'buscar' => [
            'async function _primer_dueno(ctx, nombre_solicitante) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "administrador/listar_duenos",',
            '        nombre_solicitante',
            '    });',
        ],
        'reemplazar' => [
            'async function _primer_dueno(ctx, nombre_solicitante) {',
            '    const r = await ctx.post_accion("administrador/listar_duenos", {});',
        ],
    ],

    // 32.3: _primera_terminal
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_32_eliminar_terminal_limpia_nodos.js',
        'descripcion' => 'P32: _primera_terminal con post_accion',
        'buscar' => [
            'async function _primera_terminal(ctx, nombre_solicitante, nombre_dueno) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "dueno/listar_terminales",',
            '        nombre_solicitante,',
            '        nombre_dueno',
            '    });',
        ],
        'reemplazar' => [
            'async function _primera_terminal(ctx, nombre_solicitante, nombre_dueno) {',
            '    const r = await ctx.post_accion("dueno/listar_terminales", {',
            '        nombre_dueno',
            '    });',
        ],
    ],

    // 32.4: viajes/guardar
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_32_eliminar_terminal_limpia_nodos.js',
        'descripcion' => 'P32: viajes/guardar con post_accion',
        'buscar' => [
            '        const rc = await ctx.pedir_post("index.php", {',
            '            accion: "viajes/guardar",',
            '            nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '        const rc = await ctx.post_accion("viajes/guardar", {',
        ],
    ],

    // 32.5: viajes/agregar_terminal
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_32_eliminar_terminal_limpia_nodos.js',
        'descripcion' => 'P32: viajes/agregar_terminal con post_accion',
        'buscar' => [
            '        const ra = await ctx.pedir_post("index.php", {',
            '            accion: "viajes/agregar_terminal",',
            '            nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '        const ra = await ctx.post_accion("viajes/agregar_terminal", {',
        ],
    ],

    // 32.6: viajes/eliminar_terminal
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_32_eliminar_terminal_limpia_nodos.js',
        'descripcion' => 'P32: viajes/eliminar_terminal con post_accion',
        'buscar' => [
            '        const rd = await ctx.pedir_post("index.php", {',
            '            accion: "viajes/eliminar_terminal",',
            '            nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '        const rd = await ctx.post_accion("viajes/eliminar_terminal", {',
        ],
    ],

    // 32.7: viajes/eliminar (final)
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_32_eliminar_terminal_limpia_nodos.js',
        'descripcion' => 'P32: viajes/eliminar con post_accion',
        'buscar' => [
            '        const rv = await ctx.pedir_post("index.php", {',
            '            accion: "viajes/eliminar",',
            '            nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '        const rv = await ctx.post_accion("viajes/eliminar", {',
        ],
    ],

    // ============================================================
    // PRUEBA 33
    // ============================================================

    // 33.1: _contar_nodos
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_33_editar_paradas_limpia_nodos.js',
        'descripcion' => 'P33: _contar_nodos con post_accion',
        'buscar' => [
            'async function _contar_nodos(ctx, nombre_solicitante) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "grafo/resumen",',
            '        nombre_solicitante',
            '    });',
        ],
        'reemplazar' => [
            'async function _contar_nodos(ctx, nombre_solicitante) {',
            '    const r = await ctx.post_accion("grafo/resumen", {});',
        ],
    ],

    // 33.2: _primer_dueno
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_33_editar_paradas_limpia_nodos.js',
        'descripcion' => 'P33: _primer_dueno con post_accion',
        'buscar' => [
            'async function _primer_dueno(ctx, nombre_solicitante) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "administrador/listar_duenos",',
            '        nombre_solicitante',
            '    });',
        ],
        'reemplazar' => [
            'async function _primer_dueno(ctx, nombre_solicitante) {',
            '    const r = await ctx.post_accion("administrador/listar_duenos", {});',
        ],
    ],

    // 33.3: _body_viaje (refactor de firma)
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_33_editar_paradas_limpia_nodos.js',
        'descripcion' => 'P33: refactor _body_viaje',
        'buscar' => [
            'function _body_viaje(nombre_admin, nombre_dueno, nombre_viaje, paradas, sufijo) {',
            '    return {',
            '        accion: "viajes/guardar",',
            '        nombre_solicitante: nombre_admin,',
            '        nombre_dueno,',
        ],
        'reemplazar' => [
            'function _body_viaje(nombre_dueno, nombre_viaje, paradas, sufijo) {',
            '    return {',
            '        nombre_dueno,',
        ],
    ],

    // 33.4: primera llamada a _body_viaje (crear viaje)
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_33_editar_paradas_limpia_nodos.js',
        'descripcion' => 'P33: crear viaje con post_accion',
        'buscar' => [
            '        const rc = await ctx.pedir_post("index.php",',
            '            _body_viaje(nombre_admin, nombre_dueno, nombre_viaje, paradas_abc, sufijo));',
        ],
        'reemplazar' => [
            '        const rc = await ctx.post_accion("viajes/guardar",',
            '            _body_viaje(nombre_dueno, nombre_viaje, paradas_abc, sufijo));',
        ],
    ],

    // 33.5: segunda llamada a _body_viaje (mismas paradas)
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_33_editar_paradas_limpia_nodos.js',
        'descripcion' => 'P33: editar viaje (mismas paradas) con post_accion',
        'buscar' => [
            '        const re = await ctx.pedir_post("index.php",',
            '            _body_viaje(nombre_admin, nombre_dueno, nombre_viaje, paradas_abc, sufijo));',
        ],
        'reemplazar' => [
            '        const re = await ctx.post_accion("viajes/guardar",',
            '            _body_viaje(nombre_dueno, nombre_viaje, paradas_abc, sufijo));',
        ],
    ],

    // 33.6: tercera llamada a _body_viaje (paradas nuevas)
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_33_editar_paradas_limpia_nodos.js',
        'descripcion' => 'P33: editar viaje (paradas nuevas) con post_accion',
        'buscar' => [
            '        const rx = await ctx.pedir_post("index.php",',
            '            _body_viaje(nombre_admin, nombre_dueno, nombre_viaje, paradas_xyz, sufijo));',
        ],
        'reemplazar' => [
            '        const rx = await ctx.post_accion("viajes/guardar",',
            '            _body_viaje(nombre_dueno, nombre_viaje, paradas_xyz, sufijo));',
        ],
    ],

    // 33.7: viajes/eliminar
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_33_editar_paradas_limpia_nodos.js',
        'descripcion' => 'P33: viajes/eliminar con post_accion',
        'buscar' => [
            '        const rv = await ctx.pedir_post("index.php", {',
            '            accion: "viajes/eliminar",',
            '            nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '        const rv = await ctx.post_accion("viajes/eliminar", {',
        ],
    ],

    // ============================================================
    // PRUEBA 37
    // ============================================================

    // 37.1: _resumen_grafo
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_37_eliminar_vehiculo_limpia_nodos.js',
        'descripcion' => 'P37: _resumen_grafo con post_accion',
        'buscar' => [
            'async function _resumen_grafo(ctx, nombre_solicitante) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "grafo/resumen",',
            '        nombre_solicitante',
            '    });',
        ],
        'reemplazar' => [
            'async function _resumen_grafo(ctx, nombre_solicitante) {',
            '    const r = await ctx.post_accion("grafo/resumen", {});',
        ],
    ],

    // 37.2: _primer_dueno
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_37_eliminar_vehiculo_limpia_nodos.js',
        'descripcion' => 'P37: _primer_dueno con post_accion',
        'buscar' => [
            'async function _primer_dueno(ctx, nombre_solicitante) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "administrador/listar_duenos",',
            '        nombre_solicitante',
            '    });',
        ],
        'reemplazar' => [
            'async function _primer_dueno(ctx, nombre_solicitante) {',
            '    const r = await ctx.post_accion("administrador/listar_duenos", {});',
        ],
    ],

    // 37.3: empresas/agregar
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_37_eliminar_vehiculo_limpia_nodos.js',
        'descripcion' => 'P37: empresas/agregar con post_accion',
        'buscar' => [
            '        const r_em = await ctx.pedir_post("index.php", {',
            '            accion: "empresas/agregar",',
            '            nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '        const r_em = await ctx.post_accion("empresas/agregar", {',
        ],
    ],

    // 37.4: vehiculos/agregar
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_37_eliminar_vehiculo_limpia_nodos.js',
        'descripcion' => 'P37: vehiculos/agregar con post_accion',
        'buscar' => [
            '        const r_ve = await ctx.pedir_post("index.php", {',
            '            accion: "vehiculos/agregar",',
            '            nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '        const r_ve = await ctx.post_accion("vehiculos/agregar", {',
        ],
    ],

    // 37.5: vehiculos/actualizar_configuracion
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_37_eliminar_vehiculo_limpia_nodos.js',
        'descripcion' => 'P37: vehiculos/actualizar_configuracion con post_accion',
        'buscar' => [
            '        const r_cf = await ctx.pedir_post("index.php", {',
            '            accion: "vehiculos/actualizar_configuracion",',
            '            nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '        const r_cf = await ctx.post_accion("vehiculos/actualizar_configuracion", {',
        ],
    ],

    // 37.6: vehiculos/eliminar
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_37_eliminar_vehiculo_limpia_nodos.js',
        'descripcion' => 'P37: vehiculos/eliminar con post_accion',
        'buscar' => [
            '        const r_del = await ctx.pedir_post("index.php", {',
            '            accion: "vehiculos/eliminar",',
            '            nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '        const r_del = await ctx.post_accion("vehiculos/eliminar", {',
        ],
    ],

    // 37.7: empresas/eliminar (limpieza)
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_37_eliminar_vehiculo_limpia_nodos.js',
        'descripcion' => 'P37: empresas/eliminar con post_accion',
        'buscar' => [
            '        await ctx.pedir_post("index.php", {',
            '            accion: "empresas/eliminar",',
            '            nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '        await ctx.post_accion("empresas/eliminar", {',
        ],
    ],

    // ============================================================
    // PRUEBA 38
    // ============================================================

    // 38.1: _resumen_grafo
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_38_eliminar_empresa_limpia_nodos.js',
        'descripcion' => 'P38: _resumen_grafo con post_accion',
        'buscar' => [
            'async function _resumen_grafo(ctx, nombre_solicitante) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "grafo/resumen",',
            '        nombre_solicitante',
            '    });',
        ],
        'reemplazar' => [
            'async function _resumen_grafo(ctx, nombre_solicitante) {',
            '    const r = await ctx.post_accion("grafo/resumen", {});',
        ],
    ],

    // 38.2: _primer_dueno
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_38_eliminar_empresa_limpia_nodos.js',
        'descripcion' => 'P38: _primer_dueno con post_accion',
        'buscar' => [
            'async function _primer_dueno(ctx, nombre_solicitante) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "administrador/listar_duenos",',
            '        nombre_solicitante',
            '    });',
        ],
        'reemplazar' => [
            'async function _primer_dueno(ctx, nombre_solicitante) {',
            '    const r = await ctx.post_accion("administrador/listar_duenos", {});',
        ],
    ],

    // 38.3: empresas/agregar
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_38_eliminar_empresa_limpia_nodos.js',
        'descripcion' => 'P38: empresas/agregar con post_accion',
        'buscar' => [
            '        const r_em = await ctx.pedir_post("index.php", {',
            '            accion: "empresas/agregar",',
            '            nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '        const r_em = await ctx.post_accion("empresas/agregar", {',
        ],
    ],

    // 38.4: vehiculos/agregar (dentro del for)
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_38_eliminar_empresa_limpia_nodos.js',
        'descripcion' => 'P38: vehiculos/agregar con post_accion',
        'buscar' => [
            '            const r_ve = await ctx.pedir_post("index.php", {',
            '                accion: "vehiculos/agregar",',
            '                nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '            const r_ve = await ctx.post_accion("vehiculos/agregar", {',
        ],
    ],

    // 38.5: vehiculos/actualizar_configuracion (dentro del for)
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_38_eliminar_empresa_limpia_nodos.js',
        'descripcion' => 'P38: vehiculos/actualizar_configuracion con post_accion',
        'buscar' => [
            '            const r_cf = await ctx.pedir_post("index.php", {',
            '                accion: "vehiculos/actualizar_configuracion",',
            '                nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '            const r_cf = await ctx.post_accion("vehiculos/actualizar_configuracion", {',
        ],
    ],

    // 38.6: empresas/eliminar
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_38_eliminar_empresa_limpia_nodos.js',
        'descripcion' => 'P38: empresas/eliminar con post_accion',
        'buscar' => [
            '        const r_del = await ctx.pedir_post("index.php", {',
            '            accion: "empresas/eliminar",',
            '            nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '        const r_del = await ctx.post_accion("empresas/eliminar", {',
        ],
    ],

    // ============================================================
    // PRUEBA 39
    // ============================================================

    // 39.1: _resumen_grafo
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_39_limpiar_viajes_prueba_limpia_nodos.js',
        'descripcion' => 'P39: _resumen_grafo con post_accion',
        'buscar' => [
            'async function _resumen_grafo(ctx, nombre_solicitante) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "grafo/resumen",',
            '        nombre_solicitante',
            '    });',
        ],
        'reemplazar' => [
            'async function _resumen_grafo(ctx, nombre_solicitante) {',
            '    const r = await ctx.post_accion("grafo/resumen", {});',
        ],
    ],

    // 39.2: _primer_dueno
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_39_limpiar_viajes_prueba_limpia_nodos.js',
        'descripcion' => 'P39: _primer_dueno con post_accion',
        'buscar' => [
            'async function _primer_dueno(ctx, nombre_solicitante) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "administrador/listar_duenos",',
            '        nombre_solicitante',
            '    });',
        ],
        'reemplazar' => [
            'async function _primer_dueno(ctx, nombre_solicitante) {',
            '    const r = await ctx.post_accion("administrador/listar_duenos", {});',
        ],
    ],

    // 39.3: viajes/guardar
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_39_limpiar_viajes_prueba_limpia_nodos.js',
        'descripcion' => 'P39: viajes/guardar con post_accion',
        'buscar' => [
            '        const rc = await ctx.pedir_post("index.php", {',
            '            accion: "viajes/guardar",',
            '            nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '        const rc = await ctx.post_accion("viajes/guardar", {',
        ],
    ],

    // 39.4: viajes/limpiar_prueba
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_39_limpiar_viajes_prueba_limpia_nodos.js',
        'descripcion' => 'P39: viajes/limpiar_prueba con post_accion',
        'buscar' => [
            '        const rl = await ctx.pedir_post("index.php", {',
            '            accion: "viajes/limpiar_prueba",',
            '            nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '        const rl = await ctx.post_accion("viajes/limpiar_prueba", {',
        ],
    ],

    // ============================================================
    // PRUEBA 40
    // ============================================================

    // 40.1: _resumen_grafo
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_40_eliminar_usuario_limpia_nodos.js',
        'descripcion' => 'P40: _resumen_grafo con post_accion',
        'buscar' => [
            'async function _resumen_grafo(ctx, nombre_solicitante) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "grafo/resumen",',
            '        nombre_solicitante',
            '    });',
        ],
        'reemplazar' => [
            'async function _resumen_grafo(ctx, nombre_solicitante) {',
            '    const r = await ctx.post_accion("grafo/resumen", {});',
        ],
    ],

    // 40.2: _primer_dueno
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_40_eliminar_usuario_limpia_nodos.js',
        'descripcion' => 'P40: _primer_dueno con post_accion',
        'buscar' => [
            'async function _primer_dueno(ctx, nombre_solicitante) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "administrador/listar_duenos",',
            '        nombre_solicitante',
            '    });',
        ],
        'reemplazar' => [
            'async function _primer_dueno(ctx, nombre_solicitante) {',
            '    const r = await ctx.post_accion("administrador/listar_duenos", {});',
        ],
    ],

    // 40.3: administrador/agregar_usuario
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_40_eliminar_usuario_limpia_nodos.js',
        'descripcion' => 'P40: administrador/agregar_usuario con post_accion',
        'buscar' => [
            '        const rc = await ctx.pedir_post("index.php", {',
            '            accion: "administrador/agregar_usuario",',
            '            nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '        const rc = await ctx.post_accion("administrador/agregar_usuario", {',
        ],
    ],

    // 40.4: administrador/eliminar_usuario
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_40_eliminar_usuario_limpia_nodos.js',
        'descripcion' => 'P40: administrador/eliminar_usuario con post_accion',
        'buscar' => [
            '        const rd = await ctx.pedir_post("index.php", {',
            '            accion: "administrador/eliminar_usuario",',
            '            nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '        const rd = await ctx.post_accion("administrador/eliminar_usuario", {',
        ],
    ],

    // ============================================================
    // PRUEBA 41
    // ============================================================

    // 41.1: _resumen_grafo
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_41_eliminar_pasajero_limpia_nodos.js',
        'descripcion' => 'P41: _resumen_grafo con post_accion',
        'buscar' => [
            'async function _resumen_grafo(ctx, nombre_solicitante) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "grafo/resumen",',
            '        nombre_solicitante',
            '    });',
        ],
        'reemplazar' => [
            'async function _resumen_grafo(ctx, nombre_solicitante) {',
            '    const r = await ctx.post_accion("grafo/resumen", {});',
        ],
    ],

    // 41.2: _primer_dueno
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_41_eliminar_pasajero_limpia_nodos.js',
        'descripcion' => 'P41: _primer_dueno con post_accion',
        'buscar' => [
            'async function _primer_dueno(ctx, nombre_solicitante) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "administrador/listar_duenos",',
            '        nombre_solicitante',
            '    });',
        ],
        'reemplazar' => [
            'async function _primer_dueno(ctx, nombre_solicitante) {',
            '    const r = await ctx.post_accion("administrador/listar_duenos", {});',
        ],
    ],

    // 41.3: pasajeros/crear
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_41_eliminar_pasajero_limpia_nodos.js',
        'descripcion' => 'P41: pasajeros/crear con post_accion',
        'buscar' => [
            '        const rc = await ctx.pedir_post("index.php", {',
            '            accion: "pasajeros/crear",',
            '            nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '        const rc = await ctx.post_accion("pasajeros/crear", {',
        ],
    ],

    // 41.4: pasajeros/eliminar
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_41_eliminar_pasajero_limpia_nodos.js',
        'descripcion' => 'P41: pasajeros/eliminar con post_accion',
        'buscar' => [
            '        const rd = await ctx.pedir_post("index.php", {',
            '            accion: "pasajeros/eliminar",',
            '            nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '        const rd = await ctx.post_accion("pasajeros/eliminar", {',
        ],
    ],

];

// ============================================================
// Runner v2
// ============================================================

echo "=== Aplicador ===\n\n";

function detectar_eol(string $c): string { return (strpos($c, "\r\n") !== false) ? "\r\n" : "\n"; }
function normalizar_a_unix(string $c): string { return str_replace("\r\n", "\n", $c); }
function normalizar_a_original(string $c, string $e): string { return $e === "\n" ? $c : str_replace("\n", "\r\n", $c); }
function contar_ocurrencias(string $c, string $b): int {
    if ($b === '') return 0;
    $n = 0; $o = 0;
    while (($p = strpos($c, $b, $o)) !== false) { $n++; $o = $p + strlen($b); }
    return $n;
}

if (!isset($htmls_a_bumpear) || !is_array($htmls_a_bumpear)) {
    $htmls_a_bumpear = ['aplicacion_GET.html'];
}
if (!isset($version_nueva)) $version_nueva = '';
$version_nueva = trim((string)$version_nueva);
$bumpear = ($version_nueva !== '');

$creaciones = [];
$eliminaciones = [];
$reemplazos_por_archivo = [];

foreach ($cambios as $cambio) {
    $tipo = $cambio['tipo'] ?? 'reemplazar';
    if ($tipo === 'crear') { $creaciones[] = $cambio; continue; }
    if ($tipo === 'eliminar') { $eliminaciones[] = $cambio; continue; }
    if (!isset($cambio['archivo']) || !isset($cambio['buscar']) || !isset($cambio['reemplazar'])) {
        echo "[FALLO] Cambio mal formado.\n"; exit(1);
    }
    $reemplazos_por_archivo[$cambio['archivo']][] = $cambio;
}

$total_reemplazos = 0;
foreach ($reemplazos_por_archivo as $l) $total_reemplazos += count($l);
echo "[INFO] " . count($reemplazos_por_archivo) . " archivo(s) a reemplazar, "
    . count($creaciones) . " a crear, " . count($eliminaciones) . " a eliminar.\n\n";

$archivos_a_escribir = [];
$bloques_ok = 0;
$bloques_fallidos = [];

foreach ($reemplazos_por_archivo as $archivo_rel => $lista) {
    $ruta_abs = $raiz_proyecto . '/' . $archivo_rel;
    if (!file_exists($ruta_abs)) { $bloques_fallidos[] = "Archivo no encontrado: $archivo_rel"; continue; }
    $contenido_original = file_get_contents($ruta_abs);
    if ($contenido_original === false) { $bloques_fallidos[] = "No se pudo leer: $archivo_rel"; continue; }
    $eol = detectar_eol($contenido_original);
    $contenido = normalizar_a_unix($contenido_original);
    $contenido_antes = $contenido;
    $hubo_error = false;
    foreach ($lista as $cambio) {
        $buscar_str = implode("\n", $cambio['buscar']);
        $reemplazar_str = implode("\n", $cambio['reemplazar']);
        $n = contar_ocurrencias($contenido, $buscar_str);
        if ($n === 0) { $bloques_fallidos[] = "$archivo_rel: no encontrado - {$cambio['descripcion']}"; $hubo_error = true; continue; }
        if ($n > 1) { $bloques_fallidos[] = "$archivo_rel: ambiguo ($n) - {$cambio['descripcion']}"; $hubo_error = true; continue; }
        $contenido = str_replace($buscar_str, $reemplazar_str, $contenido);
        $bloques_ok++;
    }
    if (!$hubo_error && $contenido !== $contenido_antes) {
        $archivos_a_escribir[$ruta_abs] = [$contenido, $eol];
    }
}

if ($modo_estricto && !empty($bloques_fallidos)) {
    echo "=== ABORTADO ===\n";
    foreach ($bloques_fallidos as $f) echo "  [FALLO] $f\n";
    exit(1);
}

$archivos_bump_php_js = [];
foreach ($archivos_a_escribir as $ruta_abs => $info) {
    $rel = substr($ruta_abs, strlen($raiz_proyecto) + 1);
    $ext = strtolower(pathinfo($ruta_abs, PATHINFO_EXTENSION));
    if ($ext === 'php' || $ext === 'js') $archivos_bump_php_js[] = $rel;
}

$bumps_atversion = 0;
$bumps_detalle = [];
$info_bumps = [];

if ($bumpear) {
    foreach (array_unique($archivos_bump_php_js) as $archivo_rel) {
        $ruta_abs = $raiz_proyecto . '/' . $archivo_rel;
        if (!file_exists($ruta_abs)) continue;
        if (isset($archivos_a_escribir[$ruta_abs])) {
            list($contenido, $eol) = $archivos_a_escribir[$ruta_abs];
        } else {
            $contenido_original = file_get_contents($ruta_abs);
            $eol = detectar_eol($contenido_original);
            $contenido = normalizar_a_unix($contenido_original);
        }
        $patron = '/(\*\s+@version\s+)(\S+)/';
        $viejo = '';
        $nuevo = preg_replace_callback($patron, function($m) use ($version_nueva, &$viejo) {
            $viejo = $m[2];
            return $m[1] . $version_nueva;
        }, $contenido, 1, $count);
        if ($count === 0) { $info_bumps[] = "$archivo_rel (sin @version)"; continue; }
        if ($viejo === $version_nueva) { continue; }
        $archivos_a_escribir[$ruta_abs] = [normalizar_a_unix($nuevo), $eol];
        $bumps_atversion++;
        $bumps_detalle[] = "$archivo_rel  @version $viejo -> $version_nueva";
    }
}

$archivos_escritos = 0;
foreach ($archivos_a_escribir as $ruta_abs => $info) {
    list($contenido_unix, $eol) = $info;
    $contenido_final = normalizar_a_original($contenido_unix, $eol);
    if (file_put_contents($ruta_abs, $contenido_final) === false) {
        echo "[FALLO] No se pudo escribir: " . substr($ruta_abs, strlen($raiz_proyecto) + 1) . "\n";
        continue;
    }
    $archivos_escritos++;
    echo "[OK] " . substr($ruta_abs, strlen($raiz_proyecto) + 1) . "\n";
}

if ($bumpear && (!empty($bumps_detalle) || !empty($info_bumps))) {
    echo "\n--- Bumps ---\n";
    foreach ($bumps_detalle as $d) echo "[BUMP] $d\n";
    foreach ($info_bumps as $i) echo "[INFO] $i\n";
}

echo "\n=== Resumen ===\n";
echo "Bloques aplicados: $bloques_ok\n";
echo "Archivos escritos: $archivos_escritos\n";
if ($bumpear) echo "Bumps @version:    $bumps_atversion\n";
if (!empty($bloques_fallidos)) {
    echo "Fallos: " . count($bloques_fallidos) . "\n";
    foreach ($bloques_fallidos as $f) echo "  - $f\n";
}
echo "\nListo.\n";