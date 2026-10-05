<?php
/**
 * Aplicador de cambios automáticos — Plugin de pruebas (iteradoresJS).
 *
 * Tanda V1.5plugin.5h:
 *   - Pruebas espejo de v1.5piloto.74u (Fase 2 del grafo, flujos
 *     3 y 4): eliminar_terminal_limpia_nodos y
 *     editar_paradas_limpia_nodos.
 *   - Sección "grafo" pasa a 4 pruebas.
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
        'descripcion' => 'Bump VERSION_APP a 5h',
        'buscar' => [
            '    Conf.VERSION_APP = "1.5plugin.5g";',
        ],
        'reemplazar' => [
            '    Conf.VERSION_APP = "1.5plugin.5h";',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'Bump VERSION_PLUGIN a 5h',
        'buscar' => [
            'export const VERSION_PLUGIN = "1.5plugin.5g";',
        ],
        'reemplazar' => [
            'export const VERSION_PLUGIN = "1.5plugin.5h";',
        ],
    ],

    // --------------------------------------------------------
    // catalogo.js
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'Bump @version de catalogo.js a 5h',
        'buscar' => [
            ' * @version 1.5plugin.5g',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.5h',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'Agregar imports de las pruebas 32 y 33',
        'buscar' => [
            'import { prueba as eliminar_micro_limpia_nodos } from "./prueba_31_eliminar_micro_limpia_nodos.js";',
            '',
            'export const SECCIONES = [',
        ],
        'reemplazar' => [
            'import { prueba as eliminar_micro_limpia_nodos } from "./prueba_31_eliminar_micro_limpia_nodos.js";',
            'import { prueba as eliminar_terminal_limpia_nodos } from "./prueba_32_eliminar_terminal_limpia_nodos.js";',
            'import { prueba as editar_paradas_limpia_nodos } from "./prueba_33_editar_paradas_limpia_nodos.js";',
            '',
            'export const SECCIONES = [',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'Agregar pruebas 32 y 33 a la sección grafo',
        'buscar' => [
            '        id: "grafo",',
            '        nombre: "Grafo",',
            '        pruebas: [',
            '            eliminar_viaje_limpia_nodos,',
            '            eliminar_micro_limpia_nodos',
            '        ]',
            '    }',
            '];',
        ],
        'reemplazar' => [
            '        id: "grafo",',
            '        nombre: "Grafo",',
            '        pruebas: [',
            '            eliminar_viaje_limpia_nodos,',
            '            eliminar_micro_limpia_nodos,',
            '            eliminar_terminal_limpia_nodos,',
            '            editar_paradas_limpia_nodos',
            '        ]',
            '    }',
            '];',
        ],
    ],

    // --------------------------------------------------------
    // Prompt del plugin
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'Prompt plugin: estado a 5h con 33 pruebas',
        'buscar' => [
            '**Proyecto en v1.5plugin.5g.** El esqueleto del plugin está',
            'armado y funcional, tiene 31 pruebas (base + autocompletado',
            '+ puntos de venta + viajes + micros + ventas + grafo) y las agrupa',
            'en secciones.',
        ],
        'reemplazar' => [
            '**Proyecto en v1.5plugin.5h.** El esqueleto del plugin está',
            'armado y funcional, tiene 33 pruebas (base + autocompletado',
            '+ puntos de venta + viajes + micros + ventas + grafo) y las agrupa',
            'en secciones.',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'Prompt plugin: lista grafo a 4 pruebas',
        'buscar' => [
            '- `grafo`: 2 pruebas. `eliminar_viaje_limpia_nodos`',
            '  verifica que `eliminar_viaje` del piloto (v1.5piloto.74r)',
            '  destruye el subárbol completo del viaje.',
            '  `eliminar_micro_limpia_nodos` verifica que',
            '  `eliminar_micro_de_viaje` del piloto (v1.5piloto.74s)',
            '  destruye el micro completo (copia de vehículo, pisos,',
            '  asientos, campos). Ambas miden nodos con',
            '  `grafo/resumen` antes y después, y comparan.',
        ],
        'reemplazar' => [
            '- `grafo`: 4 pruebas. Cada una verifica la Fase 2 del',
            '  plan de optimización del grafo:',
            '  - `eliminar_viaje_limpia_nodos`: `eliminar_viaje` del',
            '    piloto (v1.5piloto.74r) destruye el subárbol completo',
            '    del viaje.',
            '  - `eliminar_micro_limpia_nodos`: `eliminar_micro_de_viaje`',
            '    (v1.5piloto.74s) destruye el micro completo (copia de',
            '    vehículo, pisos, asientos, campos).',
            '  - `eliminar_terminal_limpia_nodos`: `eliminar_terminal_autorizada`',
            '    (v1.5piloto.74u) destruye el TerminalViaje.',
            '  - `editar_paradas_limpia_nodos`: `_guardar_paradas_intermedias`',
            '    (v1.5piloto.74u) destruye las paradas viejas que no se',
            '    reutilizan al editar el viaje.',
            '  Todas miden nodos con `grafo/resumen` antes y después,',
            '  y comparan.',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'Prompt plugin: Última actualización a 5h',
        'buscar' => [
            '**Última actualización de este prompt:** v1.5plugin.5g',
        ],
        'reemplazar' => [
            '**Última actualización de este prompt:** v1.5plugin.5h',
            '(pruebas espejo de v1.5piloto.74u: `eliminar_terminal_limpia_nodos`',
            'y `editar_paradas_limpia_nodos`. La primera verifica que',
            '`eliminar_terminal_autorizada` destruye el TerminalViaje; la',
            'segunda, que `_guardar_paradas_intermedias` destruye las paradas',
            'viejas no reutilizadas al editar el viaje. Requisito de entorno',
            'para la primera: el dueño elegido debe tener al menos una terminal',
            'autorizable. La sección "grafo" pasa a 4 pruebas.).',
            'Antes: v1.5plugin.5g',
        ],
    ],

    // --------------------------------------------------------
    // Prueba 32
    // --------------------------------------------------------

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_32_eliminar_terminal_limpia_nodos.js',
        'descripcion' => 'Prueba 32: eliminar terminal limpia nodos',
        'contenido' => [
            '/**',
            ' * Prueba: eliminar_terminal_autorizada limpia el TerminalViaje.',
            ' *',
            ' * Verifica la Fase 2 del plan de optimización del grafo',
            ' * (v1.5piloto.74u). Antes, `eliminar_terminal_autorizada`',
            ' * desenlazaba el TerminalViaje del contenedor',
            ' * `terminales_autorizadas` pero no lo destruía. El nodo',
            ' * TerminalViaje (con sus campos: terminal,',
            ' * cambiar_punto_predeterminado, overrides de pago) quedaba',
            ' * huérfano. Ahora lo destruye reutilizando',
            ' * `_destruir_terminal_viaje`.',
            ' *',
            ' * Requisito de entorno: el dueño elegido debe tener al',
            ' * menos una terminal (creada con `dueno/agregar_terminal`).',
            ' * Si no la tiene, la prueba falla con mensaje claro',
            ' * pidiendo crearla.',
            ' *',
            ' * @version 1.5plugin.5h',
            ' */',
            '',
            'import { CODIGO_ADMIN } from "../ConfPlugin.js";',
            '',
            '// ============================================================',
            '// Helpers internos',
            '// ============================================================',
            '',
            'async function _contar_nodos(ctx, nombre_solicitante) {',
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
            '    const j = r.json;',
            '    let total = null;',
            '    if (j.resumen && typeof j.resumen.total_nodos === "number") total = j.resumen.total_nodos;',
            '    else if (typeof j.resumen.total === "number") total = j.resumen.total;',
            '    else if (typeof j.total_nodos === "number") total = j.total_nodos;',
            '    else if (typeof j.total === "number") total = j.total;',
            '    if (total === null || total <= 0) {',
            '        throw new Error("No se pudo leer el total de nodos. Respuesta: " + JSON.stringify(j).slice(0, 200));',
            '    }',
            '    return total;',
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
            'async function _primera_terminal(ctx, nombre_solicitante, nombre_dueno) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "dueno/listar_terminales",',
            '        nombre_solicitante,',
            '        nombre_dueno',
            '    });',
            '    if (!r || !r.exito || !r.json || !r.json.exito) {',
            '        throw new Error("No se pudo listar terminales: "',
            '            + ((r && r.json && r.json.error) ? r.json.error : "(sin detalle)"));',
            '    }',
            '    const lista = r.json.terminales || [];',
            '    if (!Array.isArray(lista) || lista.length === 0) {',
            '        throw new Error("El dueño " + nombre_dueno + " no tiene terminales."',
            '            + " Creá una desde la pestaña Puntos de venta antes de correr esta prueba.");',
            '    }',
            '    const primera = lista[0];',
            '    const nombre = typeof primera === "string"',
            '        ? primera',
            '        : (primera.nombre_usuario || primera.nombre || primera.usuario);',
            '    if (!nombre) {',
            '        throw new Error("No se pudo determinar el nombre de la terminal: "',
            '            + JSON.stringify(primera).slice(0, 200));',
            '    }',
            '    return nombre;',
            '}',
            '',
            'function _fecha_manana() {',
            '    const d = new Date(Date.now() + 24 * 60 * 60 * 1000);',
            '    return d.getFullYear() + "-"',
            '        + String(d.getMonth() + 1).padStart(2, "0") + "-"',
            '        + String(d.getDate()).padStart(2, "0");',
            '}',
            '',
            '// ============================================================',
            '// Prueba',
            '// ============================================================',
            '',
            'export const prueba = {',
            '    id: "eliminar_terminal_limpia_nodos",',
            '    nombre: "Grafo: eliminar terminal limpia los nodos",',
            '    descripcion: "Verifica que eliminar_terminal_autorizada destruye el TerminalViaje (Fase 2 del plan de optimización, v1.5piloto.74u). Mide nodos con grafo/resumen antes y después.",',
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
            '        const nombre_terminal = await _primera_terminal(ctx, nombre_admin, nombre_dueno);',
            '',
            '        const N0 = await _contar_nodos(ctx, nombre_admin);',
            '',
            '        // Crear viaje de prueba.',
            '        const sufijo = String(Date.now()).slice(-8);',
            '        const nombre_viaje = "viajetermgraf" + sufijo;',
            '',
            '        const rc = await ctx.pedir_post("index.php", {',
            '            accion: "viajes/guardar",',
            '            nombre_solicitante: nombre_admin,',
            '            nombre_dueno,',
            '            nombre_viaje,',
            '            nombre: "Viaje de prueba (eliminar terminal)",',
            '            fecha: _fecha_manana(),',
            '            hora: "08:00",',
            '            origen: "Origen Test",',
            '            destino: "Destino Test",',
            '            restriccion_edad: "0",',
            '            edad_minima: "18",',
            '            edad_maxima: "80",',
            '            permite_efectivo: "1",',
            '            cuotas_efectivo_max: "3",',
            '            permite_transferencia: "1",',
            '            cuotas_transferencia_max: "1",',
            '            mostrar_dj_en_terminales: "0"',
            '        });',
            '        if (!rc || !rc.exito || !rc.json || !rc.json.exito) {',
            '            throw new Error("No se pudo crear el viaje: "',
            '                + ((rc && rc.json && rc.json.error) ? rc.json.error : "(sin detalle)"));',
            '        }',
            '',
            '        const N1 = await _contar_nodos(ctx, nombre_admin);',
            '        ctx.assert(N1 > N0, "Crear el viaje no agregó nodos (N0=" + N0 + ", N1=" + N1 + ").");',
            '',
            '        // Autorizar la terminal.',
            '        const ra = await ctx.pedir_post("index.php", {',
            '            accion: "viajes/agregar_terminal",',
            '            nombre_solicitante: nombre_admin,',
            '            nombre_dueno,',
            '            nombre_viaje,',
            '            nombre_terminal',
            '        });',
            '        if (!ra || !ra.exito || !ra.json || !ra.json.exito) {',
            '            throw new Error("No se pudo autorizar la terminal: "',
            '                + ((ra && ra.json && ra.json.error) ? ra.json.error : "(sin detalle)"));',
            '        }',
            '',
            '        const N2 = await _contar_nodos(ctx, nombre_admin);',
            '        ctx.assert(N2 > N1,',
            '            "Autorizar la terminal no agregó nodos (N1=" + N1 + ", N2=" + N2 + ").");',
            '',
            '        // Desautorizar la terminal.',
            '        const rd = await ctx.pedir_post("index.php", {',
            '            accion: "viajes/eliminar_terminal",',
            '            nombre_solicitante: nombre_admin,',
            '            nombre_dueno,',
            '            nombre_viaje,',
            '            nombre_terminal',
            '        });',
            '        if (!rd || !rd.exito || !rd.json || !rd.json.exito) {',
            '            throw new Error("No se pudo desautorizar la terminal: "',
            '                + ((rd && rd.json && rd.json.error) ? rd.json.error : "(sin detalle)"));',
            '        }',
            '',
            '        const N3 = await _contar_nodos(ctx, nombre_admin);',
            '        const dif = N3 - N1;',
            '        ctx.assert(N3 === N1,',
            '            "eliminar_terminal_autorizada no limpió los nodos del TerminalViaje. "',
            '            + "N1=" + N1 + ", N2=" + N2 + ", N3=" + N3',
            '            + ", diferencia vs N1=" + dif + "."',
            '            + (dif > 0 ? " Quedaron " + dif + " nodos huérfanos." : " Algo inesperado."));',
            '',
            '        // Limpieza: eliminar el viaje.',
            '        const rv = await ctx.pedir_post("index.php", {',
            '            accion: "viajes/eliminar",',
            '            nombre_solicitante: nombre_admin,',
            '            nombre_dueno,',
            '            nombre_viaje',
            '        });',
            '        if (!rv || !rv.exito || !rv.json || !rv.json.exito) {',
            '            throw new Error("No se pudo eliminar el viaje de limpieza: "',
            '                + ((rv && rv.json && rv.json.error) ? rv.json.error : "(sin detalle)"));',
            '        }',
            '',
            '        const N4 = await _contar_nodos(ctx, nombre_admin);',
            '        ctx.assert(N4 === N0,',
            '            "El flujo completo no volvió al estado inicial. "',
            '            + "N0=" + N0 + ", N4=" + N4 + ", diferencia=" + (N4 - N0) + ".");',
            '    }',
            '};',
        ],
    ],

    // --------------------------------------------------------
    // Prueba 33
    // --------------------------------------------------------

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_33_editar_paradas_limpia_nodos.js',
        'descripcion' => 'Prueba 33: editar paradas limpia nodos',
        'contenido' => [
            '/**',
            ' * Prueba: editar las paradas de un viaje limpia las viejas.',
            ' *',
            ' * Verifica la Fase 2 del plan de optimización del grafo',
            ' * (v1.5piloto.74u). Antes, `_guardar_paradas_intermedias`',
            ' * vaciaba la lista de paradas pero dejaba los nodos viejos',
            ' * vivos ("los nodos en sí quedan vivos hasta que se',
            ' * reutilicen o queden huérfanos"). Cada edición con paradas',
            ' * distintas dejaba huérfanas las que ya no se usaban.',
            ' * Ahora las destruye.',
            ' *',
            ' * Diseño:',
            ' *   N0: antes de crear nada.',
            ' *   N1: después de crear el viaje con 3 paradas (A, B, C).',
            ' *   N2: después de editar con las MISMAS 3 paradas.',
            ' *       Assert N2 === N1 (no debe crecer).',
            ' *   N3: después de editar con 3 paradas DISTINTAS (X, Y, Z).',
            ' *       Assert N3 === N1 (destruyó 3 viejas, creó 3 nuevas).',
            ' *       Si hay fuga, N3 = N1 + 3.',
            ' *   N4: después de eliminar el viaje. Assert N4 === N0.',
            ' *',
            ' * @version 1.5plugin.5h',
            ' */',
            '',
            'import { CODIGO_ADMIN } from "../ConfPlugin.js";',
            '',
            '// ============================================================',
            '// Helpers internos',
            '// ============================================================',
            '',
            'async function _contar_nodos(ctx, nombre_solicitante) {',
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
            '    const j = r.json;',
            '    let total = null;',
            '    if (j.resumen && typeof j.resumen.total_nodos === "number") total = j.resumen.total_nodos;',
            '    else if (typeof j.resumen.total === "number") total = j.resumen.total;',
            '    else if (typeof j.total_nodos === "number") total = j.total_nodos;',
            '    else if (typeof j.total === "number") total = j.total;',
            '    if (total === null || total <= 0) {',
            '        throw new Error("No se pudo leer el total de nodos. Respuesta: " + JSON.stringify(j).slice(0, 200));',
            '    }',
            '    return total;',
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
            'function _fecha_manana() {',
            '    const d = new Date(Date.now() + 24 * 60 * 60 * 1000);',
            '    return d.getFullYear() + "-"',
            '        + String(d.getMonth() + 1).padStart(2, "0") + "-"',
            '        + String(d.getDate()).padStart(2, "0");',
            '}',
            '',
            '// Arma el body de viajes/guardar con paradas.',
            'function _body_viaje(nombre_admin, nombre_dueno, nombre_viaje, paradas, sufijo) {',
            '    return {',
            '        accion: "viajes/guardar",',
            '        nombre_solicitante: nombre_admin,',
            '        nombre_dueno,',
            '        nombre_viaje,',
            '        nombre: "Viaje de prueba (paradas) " + sufijo,',
            '        fecha: _fecha_manana(),',
            '        hora: "08:00",',
            '        origen: "Origen Test",',
            '        destino: "Destino Test",',
            '        restriccion_edad: "0",',
            '        edad_minima: "18",',
            '        edad_maxima: "80",',
            '        permite_efectivo: "1",',
            '        cuotas_efectivo_max: "3",',
            '        permite_transferencia: "1",',
            '        cuotas_transferencia_max: "1",',
            '        mostrar_dj_en_terminales: "0",',
            '        paradas_intermedias: JSON.stringify(paradas)',
            '    };',
            '}',
            '',
            '// ============================================================',
            '// Prueba',
            '// ============================================================',
            '',
            'export const prueba = {',
            '    id: "editar_paradas_limpia_nodos",',
            '    nombre: "Grafo: editar paradas limpia los nodos viejos",',
            '    descripcion: "Verifica que editar las paradas de un viaje destruye las viejas no reutilizadas (Fase 2 del plan de optimización, v1.5piloto.74u). Mide nodos en 4 estados con grafo/resumen.",',
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
            '        const N0 = await _contar_nodos(ctx, nombre_admin);',
            '',
            '        const sufijo = String(Date.now()).slice(-8);',
            '        const nombre_viaje = "viajeparadgraf" + sufijo;',
            '',
            '        // 1. Crear viaje con 3 paradas: A, B, C.',
            '        const paradas_abc = ["Parada A", "Parada B", "Parada C"];',
            '        const rc = await ctx.pedir_post("index.php",',
            '            _body_viaje(nombre_admin, nombre_dueno, nombre_viaje, paradas_abc, sufijo));',
            '        if (!rc || !rc.exito || !rc.json || !rc.json.exito) {',
            '            throw new Error("No se pudo crear el viaje: "',
            '                + ((rc && rc.json && rc.json.error) ? rc.json.error : "(sin detalle)"));',
            '        }',
            '',
            '        const N1 = await _contar_nodos(ctx, nombre_admin);',
            '        ctx.assert(N1 > N0, "Crear el viaje no agregó nodos (N0=" + N0 + ", N1=" + N1 + ").");',
            '',
            '        // 2. Editar con las MISMAS 3 paradas. Debe reutilizar los',
            '        //    nodos existentes, sin cambiar el total.',
            '        const re = await ctx.pedir_post("index.php",',
            '            _body_viaje(nombre_admin, nombre_dueno, nombre_viaje, paradas_abc, sufijo));',
            '        if (!re || !re.exito || !re.json || !re.json.exito) {',
            '            throw new Error("No se pudo editar el viaje (mismas paradas): "',
            '                + ((re && re.json && re.json.error) ? re.json.error : "(sin detalle)"));',
            '        }',
            '',
            '        const N2 = await _contar_nodos(ctx, nombre_admin);',
            '        ctx.assert(N2 === N1,',
            '            "Editar con las mismas paradas no debe cambiar el total de nodos. "',
            '            + "N1=" + N1 + ", N2=" + N2 + ", diferencia=" + (N2 - N1) + ".");',
            '',
            '        // 3. Editar con 3 paradas DISTINTAS: X, Y, Z. Debe destruir',
            '        //    las 3 viejas y crear 3 nuevas. Total debe quedar igual.',
            '        const paradas_xyz = ["Parada X", "Parada Y", "Parada Z"];',
            '        const rx = await ctx.pedir_post("index.php",',
            '            _body_viaje(nombre_admin, nombre_dueno, nombre_viaje, paradas_xyz, sufijo));',
            '        if (!rx || !rx.exito || !rx.json || !rx.json.exito) {',
            '            throw new Error("No se pudo editar el viaje (paradas nuevas): "',
            '                + ((rx && rx.json && rx.json.error) ? rx.json.error : "(sin detalle)"));',
            '        }',
            '',
            '        const N3 = await _contar_nodos(ctx, nombre_admin);',
            '        const dif = N3 - N1;',
            '        ctx.assert(N3 === N1,',
            '            "Editar con 3 paradas distintas no debe cambiar el total de nodos (destruye 3, crea 3). "',
            '            + "N1=" + N1 + ", N3=" + N3 + ", diferencia=" + dif + "."',
            '            + (dif > 0',
            '                ? " Quedaron " + dif + " nodos huérfanos de las paradas viejas."',
            '                : " Algo inesperado."));',
            '',
            '        // 4. Limpieza.',
            '        const rv = await ctx.pedir_post("index.php", {',
            '            accion: "viajes/eliminar",',
            '            nombre_solicitante: nombre_admin,',
            '            nombre_dueno,',
            '            nombre_viaje',
            '        });',
            '        if (!rv || !rv.exito || !rv.json || !rv.json.exito) {',
            '            throw new Error("No se pudo eliminar el viaje de limpieza: "',
            '                + ((rv && rv.json && rv.json.error) ? rv.json.error : "(sin detalle)"));',
            '        }',
            '',
            '        const N4 = await _contar_nodos(ctx, nombre_admin);',
            '        ctx.assert(N4 === N0,',
            '            "El flujo completo no volvió al estado inicial. "',
            '            + "N0=" + N0 + ", N4=" + N4 + ", diferencia=" + (N4 - N0) + ".");',
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