<?php
/**
 * Aplicador — Fase 2c.2a-2: migracion de pruebas 34, 35, 36,
 * 42, 43 a ctx.post_accion.
 *
 * Misma tecnica que 2c.2a-1: helpers internos y POSTs directos
 * pasan por ctx.post_accion(accion, params), que inyecta el
 * nombre_solicitante del logueado.
 *
 * Casos especiales:
 *   - prueba_34 y 35: la venta se hace "como" un terminal
 *     (nombre_terminal en params), pero el solicitante sigue
 *     siendo el admin logueado. post_accion lo maneja bien.
 *   - prueba_36: setup condicional (crea empresa/vehiculo si
 *     faltan). El finally limpia todo.
 *   - prueba_42 y 43: _body_viaje se refactoriza para no
 *     incluir `accion` ni `nombre_solicitante`; las llamadas
 *     pasan de pedir_post("index.php", body) a
 *     post_accion("viajes/guardar", body).
 *
 * Uso (raiz del proyecto plugin): php aplicar_cambios.php
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;
$version_nueva = '1.5plugin.7f';

$htmls_a_bumpear = [];

$cambios = [

    // ============================================================
    // PRUEBA 34
    // ============================================================

    // 34.1: _resumen_grafo
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_34_cancelar_venta_limpia_nodos.js',
        'descripcion' => 'P34: _resumen_grafo con post_accion',
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

    // 34.2: _primer_dueno
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_34_cancelar_venta_limpia_nodos.js',
        'descripcion' => 'P34: _primer_dueno con post_accion',
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

    // 34.3: _primera_terminal
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_34_cancelar_venta_limpia_nodos.js',
        'descripcion' => 'P34: _primera_terminal con post_accion',
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

    // 34.4: _empresas_del_dueno
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_34_cancelar_venta_limpia_nodos.js',
        'descripcion' => 'P34: _empresas_del_dueno con post_accion',
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

    // 34.5: _vehiculos_de_empresa
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_34_cancelar_venta_limpia_nodos.js',
        'descripcion' => 'P34: _vehiculos_de_empresa con post_accion',
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

    // 34.6: _primer_asiento_libre
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_34_cancelar_venta_limpia_nodos.js',
        'descripcion' => 'P34: _primer_asiento_libre con post_accion',
        'buscar' => [
            'async function _primer_asiento_libre(ctx, nombre_solicitante, nombre_dueno, nombre_viaje, nombre_micro) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "viajes/estado_asientos",',
            '        nombre_solicitante,',
            '        nombre_dueno,',
            '        nombre_viaje,',
            '        nombre_micro',
            '    });',
        ],
        'reemplazar' => [
            'async function _primer_asiento_libre(ctx, nombre_solicitante, nombre_dueno, nombre_viaje, nombre_micro) {',
            '    const r = await ctx.post_accion("viajes/estado_asientos", {',
            '        nombre_dueno,',
            '        nombre_viaje,',
            '        nombre_micro',
            '    });',
        ],
    ],

    // 34.7: reiniciar_seleccion_completa (inicio del try)
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_34_cancelar_venta_limpia_nodos.js',
        'descripcion' => 'P34: reiniciar_seleccion_completa (inicio) con post_accion',
        'buscar' => [
            '        await ctx.pedir_post("index.php", {',
            '            accion: "viajes/reiniciar_seleccion_completa",',
            '            nombre_solicitante: nombre_admin,',
            '            nombre_terminal',
            '        });',
            '',
            '        const H0 = (await _resumen_grafo(ctx, nombre_admin)).huerfanos;',
        ],
        'reemplazar' => [
            '        await ctx.post_accion("viajes/reiniciar_seleccion_completa", {',
            '            nombre_terminal',
            '        });',
            '',
            '        const H0 = (await _resumen_grafo(ctx, nombre_admin)).huerfanos;',
        ],
    ],

    // 34.8: viajes/guardar
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_34_cancelar_venta_limpia_nodos.js',
        'descripcion' => 'P34: viajes/guardar con post_accion',
        'buscar' => [
            '        const rc = await ctx.pedir_post("index.php", {',
            '            accion: "viajes/guardar",',
            '            nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '        const rc = await ctx.post_accion("viajes/guardar", {',
        ],
    ],

    // 34.9: viajes/agregar_micro
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_34_cancelar_venta_limpia_nodos.js',
        'descripcion' => 'P34: viajes/agregar_micro con post_accion',
        'buscar' => [
            '                const r_ag = await ctx.pedir_post("index.php", {',
            '                    accion: "viajes/agregar_micro",',
            '                    nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '                const r_ag = await ctx.post_accion("viajes/agregar_micro", {',
        ],
    ],

    // 34.10: viajes/agregar_terminal
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_34_cancelar_venta_limpia_nodos.js',
        'descripcion' => 'P34: viajes/agregar_terminal con post_accion',
        'buscar' => [
            '        const rT = await ctx.pedir_post("index.php", {',
            '            accion: "viajes/agregar_terminal",',
            '            nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '        const rT = await ctx.post_accion("viajes/agregar_terminal", {',
        ],
    ],

    // 34.11: viajes/seleccionar_asiento
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_34_cancelar_venta_limpia_nodos.js',
        'descripcion' => 'P34: viajes/seleccionar_asiento con post_accion',
        'buscar' => [
            '        const rs = await ctx.pedir_post("index.php", {',
            '            accion: "viajes/seleccionar_asiento",',
            '            nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '        const rs = await ctx.post_accion("viajes/seleccionar_asiento", {',
        ],
    ],

    // 34.12: ventas/confirmar
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_34_cancelar_venta_limpia_nodos.js',
        'descripcion' => 'P34: ventas/confirmar con post_accion',
        'buscar' => [
            '        const rv = await ctx.pedir_post("index.php", {',
            '            accion: "ventas/confirmar",',
            '            nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '        const rv = await ctx.post_accion("ventas/confirmar", {',
        ],
    ],

    // 34.13: ventas/cancelar
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_34_cancelar_venta_limpia_nodos.js',
        'descripcion' => 'P34: ventas/cancelar con post_accion',
        'buscar' => [
            '        const rcan = await ctx.pedir_post("index.php", {',
            '            accion: "ventas/cancelar",',
            '            nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '        const rcan = await ctx.post_accion("ventas/cancelar", {',
        ],
    ],

    // 34.14: reiniciar_seleccion_completa (finally)
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_34_cancelar_venta_limpia_nodos.js',
        'descripcion' => 'P34: reiniciar_seleccion_completa (finally) con post_accion',
        'buscar' => [
            '            try {',
            '                await ctx.pedir_post("index.php", {',
            '                    accion: "viajes/reiniciar_seleccion_completa",',
            '                    nombre_solicitante: nombre_admin,',
            '                    nombre_terminal',
            '                });',
            '            } catch (e) { /* best-effort */ }',
        ],
        'reemplazar' => [
            '            try {',
            '                await ctx.post_accion("viajes/reiniciar_seleccion_completa", {',
            '                    nombre_terminal',
            '                });',
            '            } catch (e) { /* best-effort */ }',
        ],
    ],

    // 34.15: viajes/eliminar (finally)
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_34_cancelar_venta_limpia_nodos.js',
        'descripcion' => 'P34: viajes/eliminar (finally) con post_accion',
        'buscar' => [
            '                try {',
            '                    await ctx.pedir_post("index.php", {',
            '                        accion: "viajes/eliminar",',
            '                        nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '                try {',
            '                    await ctx.post_accion("viajes/eliminar", {',
        ],
    ],

    // ============================================================
    // PRUEBA 35
    // ============================================================

    // 35.1: _resumen_grafo
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_35_deseleccionar_asiento_limpia_nodos.js',
        'descripcion' => 'P35: _resumen_grafo con post_accion',
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

    // 35.2: _primer_dueno
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_35_deseleccionar_asiento_limpia_nodos.js',
        'descripcion' => 'P35: _primer_dueno con post_accion',
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

    // 35.3: _primera_terminal
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_35_deseleccionar_asiento_limpia_nodos.js',
        'descripcion' => 'P35: _primera_terminal con post_accion',
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

    // 35.4: _empresas_del_dueno
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_35_deseleccionar_asiento_limpia_nodos.js',
        'descripcion' => 'P35: _empresas_del_dueno con post_accion',
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

    // 35.5: _vehiculos_de_empresa
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_35_deseleccionar_asiento_limpia_nodos.js',
        'descripcion' => 'P35: _vehiculos_de_empresa con post_accion',
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

    // 35.6: _primer_asiento_libre
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_35_deseleccionar_asiento_limpia_nodos.js',
        'descripcion' => 'P35: _primer_asiento_libre con post_accion',
        'buscar' => [
            'async function _primer_asiento_libre(ctx, nombre_solicitante, nombre_dueno, nombre_viaje, nombre_micro) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "viajes/estado_asientos",',
            '        nombre_solicitante,',
            '        nombre_dueno,',
            '        nombre_viaje,',
            '        nombre_micro',
            '    });',
        ],
        'reemplazar' => [
            'async function _primer_asiento_libre(ctx, nombre_solicitante, nombre_dueno, nombre_viaje, nombre_micro) {',
            '    const r = await ctx.post_accion("viajes/estado_asientos", {',
            '        nombre_dueno,',
            '        nombre_viaje,',
            '        nombre_micro',
            '    });',
        ],
    ],

    // 35.7: reiniciar_seleccion_completa (inicio)
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_35_deseleccionar_asiento_limpia_nodos.js',
        'descripcion' => 'P35: reiniciar_seleccion_completa (inicio) con post_accion',
        'buscar' => [
            '        await ctx.pedir_post("index.php", {',
            '            accion: "viajes/reiniciar_seleccion_completa",',
            '            nombre_solicitante: nombre_admin,',
            '            nombre_terminal',
            '        });',
            '',
            '        const H0 = (await _resumen_grafo(ctx, nombre_admin)).huerfanos;',
        ],
        'reemplazar' => [
            '        await ctx.post_accion("viajes/reiniciar_seleccion_completa", {',
            '            nombre_terminal',
            '        });',
            '',
            '        const H0 = (await _resumen_grafo(ctx, nombre_admin)).huerfanos;',
        ],
    ],

    // 35.8: viajes/guardar
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_35_deseleccionar_asiento_limpia_nodos.js',
        'descripcion' => 'P35: viajes/guardar con post_accion',
        'buscar' => [
            '        const rc = await ctx.pedir_post("index.php", {',
            '            accion: "viajes/guardar",',
            '            nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '        const rc = await ctx.post_accion("viajes/guardar", {',
        ],
    ],

    // 35.9: viajes/agregar_micro
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_35_deseleccionar_asiento_limpia_nodos.js',
        'descripcion' => 'P35: viajes/agregar_micro con post_accion',
        'buscar' => [
            '                const r_ag = await ctx.pedir_post("index.php", {',
            '                    accion: "viajes/agregar_micro",',
            '                    nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '                const r_ag = await ctx.post_accion("viajes/agregar_micro", {',
        ],
    ],

    // 35.10: viajes/agregar_terminal
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_35_deseleccionar_asiento_limpia_nodos.js',
        'descripcion' => 'P35: viajes/agregar_terminal con post_accion',
        'buscar' => [
            '        const rT = await ctx.pedir_post("index.php", {',
            '            accion: "viajes/agregar_terminal",',
            '            nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '        const rT = await ctx.post_accion("viajes/agregar_terminal", {',
        ],
    ],

    // 35.11: viajes/seleccionar_asiento
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_35_deseleccionar_asiento_limpia_nodos.js',
        'descripcion' => 'P35: viajes/seleccionar_asiento con post_accion',
        'buscar' => [
            '        const rs = await ctx.pedir_post("index.php", {',
            '            accion: "viajes/seleccionar_asiento",',
            '            nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '        const rs = await ctx.post_accion("viajes/seleccionar_asiento", {',
        ],
    ],

    // 35.12: viajes/deseleccionar_asiento
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_35_deseleccionar_asiento_limpia_nodos.js',
        'descripcion' => 'P35: viajes/deseleccionar_asiento con post_accion',
        'buscar' => [
            '        const rd = await ctx.pedir_post("index.php", {',
            '            accion: "viajes/deseleccionar_asiento",',
            '            nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '        const rd = await ctx.post_accion("viajes/deseleccionar_asiento", {',
        ],
    ],

    // 35.13: reiniciar_seleccion_completa (finally)
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_35_deseleccionar_asiento_limpia_nodos.js',
        'descripcion' => 'P35: reiniciar_seleccion_completa (finally) con post_accion',
        'buscar' => [
            '            try {',
            '                await ctx.pedir_post("index.php", {',
            '                    accion: "viajes/reiniciar_seleccion_completa",',
            '                    nombre_solicitante: nombre_admin,',
            '                    nombre_terminal',
            '                });',
            '            } catch (e) { /* best-effort */ }',
        ],
        'reemplazar' => [
            '            try {',
            '                await ctx.post_accion("viajes/reiniciar_seleccion_completa", {',
            '                    nombre_terminal',
            '                });',
            '            } catch (e) { /* best-effort */ }',
        ],
    ],

    // 35.14: viajes/eliminar (finally)
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_35_deseleccionar_asiento_limpia_nodos.js',
        'descripcion' => 'P35: viajes/eliminar (finally) con post_accion',
        'buscar' => [
            '                try {',
            '                    await ctx.pedir_post("index.php", {',
            '                        accion: "viajes/eliminar",',
            '                        nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '                try {',
            '                    await ctx.post_accion("viajes/eliminar", {',
        ],
    ],

    // ============================================================
    // PRUEBA 36
    // ============================================================

    // 36.1: _resumen_grafo
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_36_cambiar_micro_a_mitad_limpia_nodos.js',
        'descripcion' => 'P36: _resumen_grafo con post_accion',
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

    // 36.2: _primer_dueno
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_36_cambiar_micro_a_mitad_limpia_nodos.js',
        'descripcion' => 'P36: _primer_dueno con post_accion',
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

    // 36.3: _primera_terminal
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_36_cambiar_micro_a_mitad_limpia_nodos.js',
        'descripcion' => 'P36: _primera_terminal con post_accion',
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

    // 36.4: _empresas_del_dueno
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_36_cambiar_micro_a_mitad_limpia_nodos.js',
        'descripcion' => 'P36: _empresas_del_dueno con post_accion',
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

    // 36.5: _vehiculos_de_empresa
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_36_cambiar_micro_a_mitad_limpia_nodos.js',
        'descripcion' => 'P36: _vehiculos_de_empresa con post_accion',
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

    // 36.6: _primer_asiento_libre
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_36_cambiar_micro_a_mitad_limpia_nodos.js',
        'descripcion' => 'P36: _primer_asiento_libre con post_accion',
        'buscar' => [
            'async function _primer_asiento_libre(ctx, nombre_solicitante, nombre_dueno, nombre_viaje, nombre_micro) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "viajes/estado_asientos",',
            '        nombre_solicitante,',
            '        nombre_dueno,',
            '        nombre_viaje,',
            '        nombre_micro',
            '    });',
        ],
        'reemplazar' => [
            'async function _primer_asiento_libre(ctx, nombre_solicitante, nombre_dueno, nombre_viaje, nombre_micro) {',
            '    const r = await ctx.post_accion("viajes/estado_asientos", {',
            '        nombre_dueno,',
            '        nombre_viaje,',
            '        nombre_micro',
            '    });',
        ],
    ],

    // 36.7: reiniciar_seleccion_completa (inicio)
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_36_cambiar_micro_a_mitad_limpia_nodos.js',
        'descripcion' => 'P36: reiniciar_seleccion_completa (inicio) con post_accion',
        'buscar' => [
            '        await ctx.pedir_post("index.php", {',
            '            accion: "viajes/reiniciar_seleccion_completa",',
            '            nombre_solicitante: nombre_admin,',
            '            nombre_terminal',
            '        });',
            '',
            '        // Requisito: al menos 2 vehículos con asientos.',
        ],
        'reemplazar' => [
            '        await ctx.post_accion("viajes/reiniciar_seleccion_completa", {',
            '            nombre_terminal',
            '        });',
            '',
            '        // Requisito: al menos 2 vehículos con asientos.',
        ],
    ],

    // 36.8: empresas/agregar (setup condicional)
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_36_cambiar_micro_a_mitad_limpia_nodos.js',
        'descripcion' => 'P36: empresas/agregar (setup) con post_accion',
        'buscar' => [
            '            const r_emp = await ctx.pedir_post("index.php", {',
            '                accion: "empresas/agregar",',
            '                nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '            const r_emp = await ctx.post_accion("empresas/agregar", {',
        ],
    ],

    // 36.9: vehiculos/agregar (setup condicional)
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_36_cambiar_micro_a_mitad_limpia_nodos.js',
        'descripcion' => 'P36: vehiculos/agregar (setup) con post_accion',
        'buscar' => [
            '            const r_veh = await ctx.pedir_post("index.php", {',
            '                accion: "vehiculos/agregar",',
            '                nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '            const r_veh = await ctx.post_accion("vehiculos/agregar", {',
        ],
    ],

    // 36.10: vehiculos/actualizar_configuracion (setup)
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_36_cambiar_micro_a_mitad_limpia_nodos.js',
        'descripcion' => 'P36: vehiculos/actualizar_configuracion (setup) con post_accion',
        'buscar' => [
            '            const r_cf = await ctx.pedir_post("index.php", {',
            '                accion: "vehiculos/actualizar_configuracion",',
            '                nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '            const r_cf = await ctx.post_accion("vehiculos/actualizar_configuracion", {',
        ],
    ],

    // 36.11: viajes/guardar
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_36_cambiar_micro_a_mitad_limpia_nodos.js',
        'descripcion' => 'P36: viajes/guardar con post_accion',
        'buscar' => [
            '        const rc = await ctx.pedir_post("index.php", {',
            '            accion: "viajes/guardar",',
            '            nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '        const rc = await ctx.post_accion("viajes/guardar", {',
        ],
    ],

    // 36.12: viajes/agregar_micro
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_36_cambiar_micro_a_mitad_limpia_nodos.js',
        'descripcion' => 'P36: viajes/agregar_micro con post_accion',
        'buscar' => [
            '            const r_ag = await ctx.pedir_post("index.php", {',
            '                accion: "viajes/agregar_micro",',
            '                nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '            const r_ag = await ctx.post_accion("viajes/agregar_micro", {',
        ],
    ],

    // 36.13: viajes/agregar_terminal
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_36_cambiar_micro_a_mitad_limpia_nodos.js',
        'descripcion' => 'P36: viajes/agregar_terminal con post_accion',
        'buscar' => [
            '        const rT = await ctx.pedir_post("index.php", {',
            '            accion: "viajes/agregar_terminal",',
            '            nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '        const rT = await ctx.post_accion("viajes/agregar_terminal", {',
        ],
    ],

    // 36.14: viajes/seleccionar_asiento (primer micro)
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_36_cambiar_micro_a_mitad_limpia_nodos.js',
        'descripcion' => 'P36: seleccionar_asiento (1) con post_accion',
        'buscar' => [
            '        const rs1 = await ctx.pedir_post("index.php", {',
            '            accion: "viajes/seleccionar_asiento",',
            '            nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '        const rs1 = await ctx.post_accion("viajes/seleccionar_asiento", {',
        ],
    ],

    // 36.15: viajes/seleccionar_asiento (segundo micro)
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_36_cambiar_micro_a_mitad_limpia_nodos.js',
        'descripcion' => 'P36: seleccionar_asiento (2) con post_accion',
        'buscar' => [
            '        const rs2 = await ctx.pedir_post("index.php", {',
            '            accion: "viajes/seleccionar_asiento",',
            '            nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '        const rs2 = await ctx.post_accion("viajes/seleccionar_asiento", {',
        ],
    ],

    // 36.16: reiniciar_seleccion_completa (finally)
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_36_cambiar_micro_a_mitad_limpia_nodos.js',
        'descripcion' => 'P36: reiniciar_seleccion_completa (finally) con post_accion',
        'buscar' => [
            '            try {',
            '                await ctx.pedir_post("index.php", {',
            '                    accion: "viajes/reiniciar_seleccion_completa",',
            '                    nombre_solicitante: nombre_admin,',
            '                    nombre_terminal',
            '                });',
            '            } catch (e) { /* best-effort */ }',
        ],
        'reemplazar' => [
            '            try {',
            '                await ctx.post_accion("viajes/reiniciar_seleccion_completa", {',
            '                    nombre_terminal',
            '                });',
            '            } catch (e) { /* best-effort */ }',
        ],
    ],

    // 36.17: viajes/eliminar (finally)
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_36_cambiar_micro_a_mitad_limpia_nodos.js',
        'descripcion' => 'P36: viajes/eliminar (finally) con post_accion',
        'buscar' => [
            '                try {',
            '                    await ctx.pedir_post("index.php", {',
            '                        accion: "viajes/eliminar",',
            '                        nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '                try {',
            '                    await ctx.post_accion("viajes/eliminar", {',
        ],
    ],

    // 36.18: vehiculos/eliminar (finally, setup)
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_36_cambiar_micro_a_mitad_limpia_nodos.js',
        'descripcion' => 'P36: vehiculos/eliminar (finally) con post_accion',
        'buscar' => [
            '                try {',
            '                    await ctx.pedir_post("index.php", {',
            '                        accion: "vehiculos/eliminar",',
            '                        nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '                try {',
            '                    await ctx.post_accion("vehiculos/eliminar", {',
        ],
    ],

    // 36.19: empresas/eliminar (finally, setup)
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_36_cambiar_micro_a_mitad_limpia_nodos.js',
        'descripcion' => 'P36: empresas/eliminar (finally) con post_accion',
        'buscar' => [
            '                try {',
            '                    await ctx.pedir_post("index.php", {',
            '                        accion: "empresas/eliminar",',
            '                        nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '                try {',
            '                    await ctx.post_accion("empresas/eliminar", {',
        ],
    ],

    // ============================================================
    // PRUEBA 42
    // ============================================================

    // 42.1: _resumen_grafo
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_42_editar_paradas_sin_hora_limpia_nodos.js',
        'descripcion' => 'P42: _resumen_grafo con post_accion',
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

    // 42.2: _primer_dueno
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_42_editar_paradas_sin_hora_limpia_nodos.js',
        'descripcion' => 'P42: _primer_dueno con post_accion',
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

    // 42.3: refactor _body_viaje
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_42_editar_paradas_sin_hora_limpia_nodos.js',
        'descripcion' => 'P42: refactor _body_viaje',
        'buscar' => [
            'function _body_viaje(nombre_admin, nombre_dueno, nombre_viaje, paradas) {',
            '    return {',
            '        accion: "viajes/guardar",',
            '        nombre_solicitante: nombre_admin,',
            '        nombre_dueno,',
        ],
        'reemplazar' => [
            'function _body_viaje(nombre_dueno, nombre_viaje, paradas) {',
            '    return {',
            '        nombre_dueno,',
        ],
    ],

    // 42.4: crear viaje
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_42_editar_paradas_sin_hora_limpia_nodos.js',
        'descripcion' => 'P42: crear viaje con post_accion',
        'buscar' => [
            '        const rc = await ctx.pedir_post("index.php",',
            '            _body_viaje(nombre_admin, nombre_dueno, nombre_viaje, paradas_con_hora));',
        ],
        'reemplazar' => [
            '        const rc = await ctx.post_accion("viajes/guardar",',
            '            _body_viaje(nombre_dueno, nombre_viaje, paradas_con_hora));',
        ],
    ],

    // 42.5: editar viaje
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_42_editar_paradas_sin_hora_limpia_nodos.js',
        'descripcion' => 'P42: editar viaje con post_accion',
        'buscar' => [
            '        const re = await ctx.pedir_post("index.php",',
            '            _body_viaje(nombre_admin, nombre_dueno, nombre_viaje, paradas_sin_hora));',
        ],
        'reemplazar' => [
            '        const re = await ctx.post_accion("viajes/guardar",',
            '            _body_viaje(nombre_dueno, nombre_viaje, paradas_sin_hora));',
        ],
    ],

    // 42.6: viajes/eliminar (limpieza)
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_42_editar_paradas_sin_hora_limpia_nodos.js',
        'descripcion' => 'P42: viajes/eliminar con post_accion',
        'buscar' => [
            '        await ctx.pedir_post("index.php", {',
            '            accion: "viajes/eliminar",',
            '            nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '        await ctx.post_accion("viajes/eliminar", {',
        ],
    ],

    // ============================================================
    // PRUEBA 43
    // ============================================================

    // 43.1: _primer_dueno
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_43_listar_viajes_indice_comportamiento.js',
        'descripcion' => 'P43: _primer_dueno con post_accion',
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

    // 43.2: _primera_terminal
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_43_listar_viajes_indice_comportamiento.js',
        'descripcion' => 'P43: _primera_terminal con post_accion',
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

    // 43.3: _empresas_del_dueno
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_43_listar_viajes_indice_comportamiento.js',
        'descripcion' => 'P43: _empresas_del_dueno con post_accion',
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

    // 43.4: _vehiculos_de_empresa
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_43_listar_viajes_indice_comportamiento.js',
        'descripcion' => 'P43: _vehiculos_de_empresa con post_accion',
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

    // 43.5: _primer_asiento_libre
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_43_listar_viajes_indice_comportamiento.js',
        'descripcion' => 'P43: _primer_asiento_libre con post_accion',
        'buscar' => [
            'async function _primer_asiento_libre(ctx, nombre_solicitante, nombre_dueno, nombre_viaje, nombre_micro) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "viajes/estado_asientos",',
            '        nombre_solicitante,',
            '        nombre_dueno,',
            '        nombre_viaje,',
            '        nombre_micro',
            '    });',
        ],
        'reemplazar' => [
            'async function _primer_asiento_libre(ctx, nombre_solicitante, nombre_dueno, nombre_viaje, nombre_micro) {',
            '    const r = await ctx.post_accion("viajes/estado_asientos", {',
            '        nombre_dueno,',
            '        nombre_viaje,',
            '        nombre_micro',
            '    });',
        ],
    ],

    // 43.6: refactor _body_viaje
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_43_listar_viajes_indice_comportamiento.js',
        'descripcion' => 'P43: refactor _body_viaje',
        'buscar' => [
            'function _body_viaje(nombre_admin, nombre_dueno, nombre_viaje) {',
            '    return {',
            '        accion: "viajes/guardar",',
            '        nombre_solicitante: nombre_admin,',
            '        nombre_dueno,',
        ],
        'reemplazar' => [
            'function _body_viaje(nombre_dueno, nombre_viaje) {',
            '    return {',
            '        nombre_dueno,',
        ],
    ],

    // 43.7: crear viaje A
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_43_listar_viajes_indice_comportamiento.js',
        'descripcion' => 'P43: crear viaje A con post_accion',
        'buscar' => [
            '        const rA = await ctx.pedir_post("index.php",',
            '            _body_viaje(nombre_admin, nombre_dueno, viaje_a));',
        ],
        'reemplazar' => [
            '        const rA = await ctx.post_accion("viajes/guardar",',
            '            _body_viaje(nombre_dueno, viaje_a));',
        ],
    ],

    // 43.8: crear viaje B
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_43_listar_viajes_indice_comportamiento.js',
        'descripcion' => 'P43: crear viaje B con post_accion',
        'buscar' => [
            '        const rB = await ctx.pedir_post("index.php",',
            '            _body_viaje(nombre_admin, nombre_dueno, viaje_b));',
        ],
        'reemplazar' => [
            '        const rB = await ctx.post_accion("viajes/guardar",',
            '            _body_viaje(nombre_dueno, viaje_b));',
        ],
    ],

    // 43.9: viajes/agregar_terminal
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_43_listar_viajes_indice_comportamiento.js',
        'descripcion' => 'P43: viajes/agregar_terminal con post_accion',
        'buscar' => [
            '        const rT = await ctx.pedir_post("index.php", {',
            '            accion: "viajes/agregar_terminal",',
            '            nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '        const rT = await ctx.post_accion("viajes/agregar_terminal", {',
        ],
    ],

    // 43.10: viajes/agregar_micro
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_43_listar_viajes_indice_comportamiento.js',
        'descripcion' => 'P43: viajes/agregar_micro con post_accion',
        'buscar' => [
            '                const r_ag = await ctx.pedir_post("index.php", {',
            '                    accion: "viajes/agregar_micro",',
            '                    nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '                const r_ag = await ctx.post_accion("viajes/agregar_micro", {',
        ],
    ],

    // 43.11: viajes/seleccionar_asiento
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_43_listar_viajes_indice_comportamiento.js',
        'descripcion' => 'P43: viajes/seleccionar_asiento con post_accion',
        'buscar' => [
            '        const rs = await ctx.pedir_post("index.php", {',
            '            accion: "viajes/seleccionar_asiento",',
            '            nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '        const rs = await ctx.post_accion("viajes/seleccionar_asiento", {',
        ],
    ],

    // 43.12: ventas/confirmar
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_43_listar_viajes_indice_comportamiento.js',
        'descripcion' => 'P43: ventas/confirmar con post_accion',
        'buscar' => [
            '        const rv = await ctx.pedir_post("index.php", {',
            '            accion: "ventas/confirmar",',
            '            nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '        const rv = await ctx.post_accion("ventas/confirmar", {',
        ],
    ],

    // 43.13: viajes/listar_por_dueno
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_43_listar_viajes_indice_comportamiento.js',
        'descripcion' => 'P43: viajes/listar_por_dueno con post_accion',
        'buscar' => [
            '        const rl = await ctx.pedir_post("index.php", {',
            '            accion: "viajes/listar_por_dueno",',
            '            nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '        const rl = await ctx.post_accion("viajes/listar_por_dueno", {',
        ],
    ],

    // 43.14: viajes/listar_por_terminal
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_43_listar_viajes_indice_comportamiento.js',
        'descripcion' => 'P43: viajes/listar_por_terminal con post_accion',
        'buscar' => [
            '        const rt = await ctx.pedir_post("index.php", {',
            '            accion: "viajes/listar_por_terminal",',
            '            nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '        const rt = await ctx.post_accion("viajes/listar_por_terminal", {',
        ],
    ],

    // 43.15: ventas/cancelar (limpieza)
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_43_listar_viajes_indice_comportamiento.js',
        'descripcion' => 'P43: ventas/cancelar (limpieza) con post_accion',
        'buscar' => [
            '        await ctx.pedir_post("index.php", {',
            '            accion: "ventas/cancelar",',
            '            nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '        await ctx.post_accion("ventas/cancelar", {',
        ],
    ],

    // 43.16: viajes/eliminar A (limpieza)
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_43_listar_viajes_indice_comportamiento.js',
        'descripcion' => 'P43: viajes/eliminar A (limpieza) con post_accion',
        'buscar' => [
            '        await ctx.pedir_post("index.php", {',
            '            accion: "viajes/eliminar",',
            '            nombre_solicitante: nombre_admin,',
            '            nombre_dueno,',
            '            nombre_viaje: viaje_a',
            '        });',
        ],
        'reemplazar' => [
            '        await ctx.post_accion("viajes/eliminar", {',
            '            nombre_dueno,',
            '            nombre_viaje: viaje_a',
            '        });',
        ],
    ],

    // 43.17: viajes/eliminar B (limpieza)
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_43_listar_viajes_indice_comportamiento.js',
        'descripcion' => 'P43: viajes/eliminar B (limpieza) con post_accion',
        'buscar' => [
            '        await ctx.pedir_post("index.php", {',
            '            accion: "viajes/eliminar",',
            '            nombre_solicitante: nombre_admin,',
            '            nombre_dueno,',
            '            nombre_viaje: viaje_b',
            '        });',
        ],
        'reemplazar' => [
            '        await ctx.post_accion("viajes/eliminar", {',
            '            nombre_dueno,',
            '            nombre_viaje: viaje_b',
            '        });',
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