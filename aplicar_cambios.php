<?php
/**
 * Aplicador de cambios automáticos — Plugin de pruebas (iteradoresJS).
 *
 * Tanda V1.5plugin.5j:
 *   - Pruebas espejo de v1.5piloto.74x:
 *     * deseleccionar_asiento_limpia_nodos.
 *     * cambiar_micro_a_mitad_limpia_nodos.
 *   - Sección "grafo" pasa a 7 pruebas.
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
        'descripcion' => 'Bump VERSION_APP a 5j',
        'buscar' => [
            '    Conf.VERSION_APP = "1.5plugin.5i";',
        ],
        'reemplazar' => [
            '    Conf.VERSION_APP = "1.5plugin.5j";',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'Bump VERSION_PLUGIN a 5j',
        'buscar' => [
            'export const VERSION_PLUGIN = "1.5plugin.5i";',
        ],
        'reemplazar' => [
            'export const VERSION_PLUGIN = "1.5plugin.5j";',
        ],
    ],

    // --------------------------------------------------------
    // catalogo.js
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'Bump @version de catalogo.js a 5j',
        'buscar' => [
            ' * @version 1.5plugin.5i',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.5j',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'Agregar imports de las pruebas 35 y 36',
        'buscar' => [
            'import { prueba as cancelar_venta_limpia_nodos } from "./prueba_34_cancelar_venta_limpia_nodos.js";',
            '',
            'export const SECCIONES = [',
        ],
        'reemplazar' => [
            'import { prueba as cancelar_venta_limpia_nodos } from "./prueba_34_cancelar_venta_limpia_nodos.js";',
            'import { prueba as deseleccionar_asiento_limpia_nodos } from "./prueba_35_deseleccionar_asiento_limpia_nodos.js";',
            'import { prueba as cambiar_micro_a_mitad_limpia_nodos } from "./prueba_36_cambiar_micro_a_mitad_limpia_nodos.js";',
            '',
            'export const SECCIONES = [',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'Agregar pruebas 35 y 36 a la sección grafo',
        'buscar' => [
            '        pruebas: [',
            '            eliminar_viaje_limpia_nodos,',
            '            eliminar_micro_limpia_nodos,',
            '            eliminar_terminal_limpia_nodos,',
            '            editar_paradas_limpia_nodos,',
            '            cancelar_venta_limpia_nodos',
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
            '            cambiar_micro_a_mitad_limpia_nodos',
            '        ]',
        ],
    ],

    // --------------------------------------------------------
    // Prompt del plugin
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'Prompt plugin: estado a 5j con 36 pruebas',
        'buscar' => [
            '**Proyecto en v1.5plugin.5i.** El esqueleto del plugin está',
            'armado y funcional, tiene 34 pruebas (base + autocompletado',
            '+ puntos de venta + viajes + micros + ventas + grafo) y las agrupa',
            'en secciones.',
        ],
        'reemplazar' => [
            '**Proyecto en v1.5plugin.5j.** El esqueleto del plugin está',
            'armado y funcional, tiene 36 pruebas (base + autocompletado',
            '+ puntos de venta + viajes + micros + ventas + grafo) y las agrupa',
            'en secciones.',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'Prompt plugin: agregar pruebas 35 y 36 a la lista grafo',
        'buscar' => [
            '  - `cancelar_venta_limpia_nodos`: `cancelar_venta` del',
            '    piloto (v1.5piloto.74v) destruye el subárbol de la',
            '    venta: asientos-en-venta (la lista cuelga con',
            '    `primer`/`siguiente`, no con `hmi`/`hd`, así que',
            '    `eliminar_hmi` no los alcanzaba), cupones con sus',
            '    campos, campos hoja del nodo venta, y el sub-nodo',
            '    `opciones_cobro` con sus 4 hijos.',
        ],
        'reemplazar' => [
            '  - `cancelar_venta_limpia_nodos`: `cancelar_venta` del',
            '    piloto (v1.5piloto.74v) destruye el subárbol de la',
            '    venta: asientos-en-venta (la lista cuelga con',
            '    `primer`/`siguiente`, no con `hmi`/`hd`, así que',
            '    `eliminar_hmi` no los alcanzaba), cupones con sus',
            '    campos, campos hoja del nodo venta, y el sub-nodo',
            '    `opciones_cobro` con sus 4 hijos.',
            '  - `deseleccionar_asiento_limpia_nodos`:',
            '    `deseleccionar_asiento_micro` (v1.5piloto.74x)',
            '    destruye el asiento-en-venta del asiento que se',
            '    deselecciona (antes se filtraba fuera de la lista',
            '    sin destruirlo).',
            '  - `cambiar_micro_a_mitad_limpia_nodos`:',
            '    `seleccionar_asiento_micro` (v1.5piloto.74x), en el',
            '    bloque de cambio de micro a mitad de selección',
            '    (`limpiar_lista = true`), destruye los',
            '    asientos-en-venta viejos. Requiere un viaje con 2',
            '    micros.',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'Prompt plugin: última actualización a 5j',
        'buscar' => [
            '**Última actualización de este prompt:** v1.5plugin.5i',
        ],
        'reemplazar' => [
            '**Última actualización de este prompt:** v1.5plugin.5j',
            '(pruebas espejo de v1.5piloto.74x:',
            '`deseleccionar_asiento_limpia_nodos` y',
            '`cambiar_micro_a_mitad_limpia_nodos`. Verifican que',
            '`deseleccionar_asiento_micro` destruye el asiento-en-venta',
            'deseleccionado, y que `seleccionar_asiento_micro` destruye',
            'los asientos-en-venta viejos al cambiar de micro a mitad',
            'de selección. Miden huérfanos con `grafo/resumen`. La',
            'sección "grafo" pasa a 7 pruebas.).',
            'Antes: v1.5plugin.5i',
        ],
    ],

    // --------------------------------------------------------
    // Prueba 35
    // --------------------------------------------------------

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_35_deseleccionar_asiento_limpia_nodos.js',
        'descripcion' => 'Prueba 35: deseleccionar asiento limpia nodos',
        'contenido' => [
            '/**',
            ' * Prueba: deseleccionar_asiento_micro limpia el nodo del',
            ' * asiento-en-venta.',
            ' *',
            ' * Verifica la Fase 2 del plan de optimización del grafo',
            ' * (v1.5piloto.74x). Antes, `deseleccionar_asiento_micro`',
            ' * filtraba el nodo asiento-en-venta del asiento',
            ' * deseleccionado fuera de la lista pero no lo destruía:',
            ' * quedaba huérfano con sus campos (`punto_subida_bajada`,',
            ' * `hora_subida_bajada`).',
            ' *',
            ' * Mide huérfanos con `grafo/resumen`:',
            ' *   H0: antes de nada.',
            ' *   Después: seleccionar 1 asiento y deseleccionarlo.',
            ' *   H1: después del deseleccionar. Assert H1 === H0.',
            ' *',
            ' * Nota: la prueba deja la venta_actual colgada de la',
            ' * terminal (con los campos viaje y micro apuntando al viaje',
            ' * de prueba). Es alcanzable desde la terminal, no es un',
            ' * huérfano. No se limpia el viaje al final para no dejar',
            ' * la venta_actual con referencias colgando.',
            ' *',
            ' * Requisitos de entorno: el dueño elegido debe tener al',
            ' * menos una terminal y una empresa con un vehículo con',
            ' * asientos configurados.',
            ' *',
            ' * @version 1.5plugin.5j',
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
            'async function _empresas_del_dueno(ctx, nombre_solicitante, nombre_dueno) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "empresas/listar",',
            '        nombre_solicitante,',
            '        nombre_dueno',
            '    });',
            '    if (!r || !r.exito || !r.json || !r.json.exito) return [];',
            '    const lista = r.json.empresas || [];',
            '    return lista.map(function (e) {',
            '        if (typeof e === "string") return e;',
            '        return e.nombre_usuario || e.nombre_empresa || e.nombre || null;',
            '    }).filter(function (n) { return !!n; });',
            '}',
            '',
            'async function _vehiculos_de_empresa(ctx, nombre_solicitante, nombre_empresa) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "vehiculos/listar",',
            '        nombre_solicitante,',
            '        nombre_empresa',
            '    });',
            '    if (!r || !r.exito || !r.json || !r.json.exito) return [];',
            '    const lista = r.json.vehiculos || [];',
            '    return lista.map(function (v) {',
            '        if (typeof v === "string") return v;',
            '        return v.patente || v.nombre_vehiculo || v.nombre || null;',
            '    }).filter(function (n) { return !!n; });',
            '}',
            '',
            'function _fecha_manana() {',
            '    const d = new Date(Date.now() + 24 * 60 * 60 * 1000);',
            '    return d.getFullYear() + "-"',
            '        + String(d.getMonth() + 1).padStart(2, "0") + "-"',
            '        + String(d.getDate()).padStart(2, "0");',
            '}',
            '',
            'async function _primer_asiento_libre(ctx, nombre_solicitante, nombre_dueno, nombre_viaje, nombre_micro) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "viajes/estado_asientos",',
            '        nombre_solicitante,',
            '        nombre_dueno,',
            '        nombre_viaje,',
            '        nombre_micro',
            '    });',
            '    if (!r || !r.exito || !r.json || !r.json.exito) {',
            '        throw new Error("No se pudieron leer los asientos: "',
            '            + ((r && r.json && r.json.error) ? r.json.error : "(sin detalle)"));',
            '    }',
            '    const asientos = r.json.asientos || [];',
            '    for (const a of asientos) {',
            '        if (a.estado === "libre") {',
            '            return { fila: String(a.fila), columna: String(a.columna) };',
            '        }',
            '    }',
            '    throw new Error("No hay asientos libres en el micro " + nombre_micro);',
            '}',
            '',
            '// ============================================================',
            '// Prueba',
            '// ============================================================',
            '',
            'export const prueba = {',
            '    id: "deseleccionar_asiento_limpia_nodos",',
            '    nombre: "Grafo: deseleccionar asiento limpia los nodos",',
            '    descripcion: "Verifica que deseleccionar un asiento destruye su nodo asiento-en-venta (Fase 2 del plan de optimización, v1.5piloto.74x). Mide huérfanos con grafo/resumen antes y después.",',
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
            '        const H0 = (await _resumen_grafo(ctx, nombre_admin)).huerfanos;',
            '',
            '        // 1. Crear viaje de prueba.',
            '        const sufijo = String(Date.now()).slice(-8);',
            '        const nombre_viaje = "viajedeselegraf" + sufijo;',
            '',
            '        const rc = await ctx.pedir_post("index.php", {',
            '            accion: "viajes/guardar",',
            '            nombre_solicitante: nombre_admin,',
            '            nombre_dueno,',
            '            nombre_viaje,',
            '            nombre: "Viaje de prueba (deseleccionar)",',
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
            '        // 2. Agregar micro.',
            '        const empresas = await _empresas_del_dueno(ctx, nombre_admin, nombre_dueno);',
            '        if (empresas.length === 0) {',
            '            throw new Error("El dueño " + nombre_dueno + " no tiene empresas.");',
            '        }',
            '        let nombre_micro = null;',
            '        let ultimo_error = "";',
            '        for (const empresa of empresas) {',
            '            const vehiculos = await _vehiculos_de_empresa(ctx, nombre_admin, empresa);',
            '            for (const patente of vehiculos) {',
            '                const r_ag = await ctx.pedir_post("index.php", {',
            '                    accion: "viajes/agregar_micro",',
            '                    nombre_solicitante: nombre_admin,',
            '                    nombre_dueno,',
            '                    nombre_viaje,',
            '                    nombre_empresa: empresa,',
            '                    nombre_vehiculo: patente,',
            '                    monto: "1000"',
            '                });',
            '                if (r_ag && r_ag.json && r_ag.json.exito) {',
            '                    nombre_micro = r_ag.json.nombre_micro;',
            '                    break;',
            '                }',
            '                ultimo_error = (r_ag && r_ag.json && r_ag.json.error) ? r_ag.json.error : "(sin detalle)";',
            '            }',
            '            if (nombre_micro) break;',
            '        }',
            '        if (!nombre_micro) {',
            '            throw new Error("Ningún vehículo pudo agregarse como micro. Último error: " + ultimo_error);',
            '        }',
            '',
            '        // 3. Seleccionar un asiento.',
            '        const asiento = await _primer_asiento_libre(ctx, nombre_admin, nombre_dueno, nombre_viaje, nombre_micro);',
            '        const rs = await ctx.pedir_post("index.php", {',
            '            accion: "viajes/seleccionar_asiento",',
            '            nombre_solicitante: nombre_admin,',
            '            nombre_dueno,',
            '            nombre_viaje,',
            '            nombre_micro,',
            '            fila: asiento.fila,',
            '            columna: asiento.columna,',
            '            nombre_terminal',
            '        });',
            '        if (!rs || !rs.exito || !rs.json || !rs.json.exito) {',
            '            throw new Error("No se pudo seleccionar el asiento: "',
            '                + ((rs && rs.json && rs.json.error) ? rs.json.error : "(sin detalle)"));',
            '        }',
            '',
            '        // 4. Deseleccionar el mismo asiento.',
            '        const rd = await ctx.pedir_post("index.php", {',
            '            accion: "viajes/deseleccionar_asiento",',
            '            nombre_solicitante: nombre_admin,',
            '            nombre_dueno,',
            '            nombre_viaje,',
            '            nombre_micro,',
            '            fila: asiento.fila,',
            '            columna: asiento.columna,',
            '            nombre_terminal',
            '        });',
            '        if (!rd || !rd.exito || !rd.json || !rd.json.exito) {',
            '            throw new Error("No se pudo deseleccionar el asiento: "',
            '                + ((rd && rd.json && rd.json.error) ? rd.json.error : "(sin detalle)"));',
            '        }',
            '',
            '        const H1 = (await _resumen_grafo(ctx, nombre_admin)).huerfanos;',
            '        const dif = H1 - H0;',
            '        ctx.assert(H1 === H0,',
            '            "deseleccionar_asiento_micro dejó nodos huérfanos. "',
            '            + "H0=" + H0 + ", H1=" + H1 + ", diferencia=" + dif + "."',
            '            + (dif > 0 ? " Quedaron " + dif + " nodos huérfanos." : " Algo inesperado."));',
            '    }',
            '};',
        ],
    ],

    // --------------------------------------------------------
    // Prueba 36
    // --------------------------------------------------------

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_36_cambiar_micro_a_mitad_limpia_nodos.js',
        'descripcion' => 'Prueba 36: cambiar micro a mitad limpia nodos',
        'contenido' => [
            '/**',
            ' * Prueba: cambiar de micro a mitad de selección limpia los',
            ' * asientos-en-venta viejos.',
            ' *',
            ' * Verifica la Fase 2 del plan de optimización del grafo',
            ' * (v1.5piloto.74x). Antes, `seleccionar_asiento_micro` con',
            ' * `limpiar_lista = true` (cuando la terminal selecciona un',
            ' * asiento de otro micro) solo desenlazaba el `primer` de la',
            ' * cabeza de la lista de asientos-en-venta. Los nodos viejos',
            ' * quedaban huérfanos con sus campos.',
            ' *',
            ' * Mide huérfanos con `grafo/resumen`:',
            ' *   H0: antes de nada.',
            ' *   Después: crear viaje + 2 micros, seleccionar 1 asiento',
            ' *            del micro 1, y seleccionar 1 asiento del micro 2.',
            ' *            El segundo dispara `limpiar_lista = true`.',
            ' *   H1: después del segundo seleccionar. Assert H1 === H0.',
            ' *',
            ' * Nota: la prueba deja la venta_actual colgada de la terminal',
            ' * con el último asiento seleccionado. Es alcanzable, no es',
            ' * huérfano. No se limpia el viaje al final para no dejar',
            ' * referencias colgando.',
            ' *',
            ' * Requisitos de entorno: el dueño elegido debe tener al menos',
            ' * una terminal, y al menos DOS vehículos con asientos',
            ' * configurados (en una o más empresas). Si solo hay uno,',
            ' * la prueba falla con mensaje claro.',
            ' *',
            ' * @version 1.5plugin.5j',
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
            'async function _empresas_del_dueno(ctx, nombre_solicitante, nombre_dueno) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "empresas/listar",',
            '        nombre_solicitante,',
            '        nombre_dueno',
            '    });',
            '    if (!r || !r.exito || !r.json || !r.json.exito) return [];',
            '    const lista = r.json.empresas || [];',
            '    return lista.map(function (e) {',
            '        if (typeof e === "string") return e;',
            '        return e.nombre_usuario || e.nombre_empresa || e.nombre || null;',
            '    }).filter(function (n) { return !!n; });',
            '}',
            '',
            'async function _vehiculos_de_empresa(ctx, nombre_solicitante, nombre_empresa) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "vehiculos/listar",',
            '        nombre_solicitante,',
            '        nombre_empresa',
            '    });',
            '    if (!r || !r.exito || !r.json || !r.json.exito) return [];',
            '    const lista = r.json.vehiculos || [];',
            '    return lista.map(function (v) {',
            '        if (typeof v === "string") return v;',
            '        return v.patente || v.nombre_vehiculo || v.nombre || null;',
            '    }).filter(function (n) { return !!n; });',
            '}',
            '',
            'function _fecha_manana() {',
            '    const d = new Date(Date.now() + 24 * 60 * 60 * 1000);',
            '    return d.getFullYear() + "-"',
            '        + String(d.getMonth() + 1).padStart(2, "0") + "-"',
            '        + String(d.getDate()).padStart(2, "0");',
            '}',
            '',
            'async function _primer_asiento_libre(ctx, nombre_solicitante, nombre_dueno, nombre_viaje, nombre_micro) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "viajes/estado_asientos",',
            '        nombre_solicitante,',
            '        nombre_dueno,',
            '        nombre_viaje,',
            '        nombre_micro',
            '    });',
            '    if (!r || !r.exito || !r.json || !r.json.exito) {',
            '        throw new Error("No se pudieron leer los asientos: "',
            '            + ((r && r.json && r.json.error) ? r.json.error : "(sin detalle)"));',
            '    }',
            '    const asientos = r.json.asientos || [];',
            '    for (const a of asientos) {',
            '        if (a.estado === "libre") {',
            '            return { fila: String(a.fila), columna: String(a.columna) };',
            '        }',
            '    }',
            '    throw new Error("No hay asientos libres en el micro " + nombre_micro);',
            '}',
            '',
            '// ============================================================',
            '// Prueba',
            '// ============================================================',
            '',
            'export const prueba = {',
            '    id: "cambiar_micro_a_mitad_limpia_nodos",',
            '    nombre: "Grafo: cambiar de micro limpia los asientos-en-venta viejos",',
            '    descripcion: "Verifica que cambiar de micro a mitad de selección destruye los asientos-en-venta viejos (Fase 2 del plan de optimización, v1.5piloto.74x). Requiere un viaje con 2 micros. Mide huérfanos con grafo/resumen antes y después.",',
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
            '        // Requisito: al menos 2 vehículos con asientos.',
            '        const empresas = await _empresas_del_dueno(ctx, nombre_admin, nombre_dueno);',
            '        if (empresas.length === 0) {',
            '            throw new Error("El dueño " + nombre_dueno + " no tiene empresas.");',
            '        }',
            '        const candidatos = [];  // {empresa, patente}',
            '        for (const empresa of empresas) {',
            '            const vehiculos = await _vehiculos_de_empresa(ctx, nombre_admin, empresa);',
            '            for (const patente of vehiculos) {',
            '                candidatos.push({ empresa, patente });',
            '            }',
            '        }',
            '        if (candidatos.length < 2) {',
            '            throw new Error("Se necesitan al menos 2 vehículos configurados en las empresas del dueño " + nombre_dueno + ". Encontrados: " + candidatos.length + ". Cargá más vehículos o ajustá la prueba.");',
            '        }',
            '',
            '        const H0 = (await _resumen_grafo(ctx, nombre_admin)).huerfanos;',
            '',
            '        // Crear viaje de prueba.',
            '        const sufijo = String(Date.now()).slice(-8);',
            '        const nombre_viaje = "viajecambiomicro" + sufijo;',
            '',
            '        const rc = await ctx.pedir_post("index.php", {',
            '            accion: "viajes/guardar",',
            '            nombre_solicitante: nombre_admin,',
            '            nombre_dueno,',
            '            nombre_viaje,',
            '            nombre: "Viaje de prueba (cambiar micro)",',
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
            '        // Agregar los dos primeros micros.',
            '        const micros = [];',
            '        for (let i = 0; i < 2; i++) {',
            '            const c = candidatos[i];',
            '            const r_ag = await ctx.pedir_post("index.php", {',
            '                accion: "viajes/agregar_micro",',
            '                nombre_solicitante: nombre_admin,',
            '                nombre_dueno,',
            '                nombre_viaje,',
            '                nombre_empresa: c.empresa,',
            '                nombre_vehiculo: c.patente,',
            '                monto: "1000"',
            '            });',
            '            if (!r_ag || !r_ag.exito || !r_ag.json || !r_ag.json.exito) {',
            '                throw new Error("No se pudo agregar el micro " + c.patente + ": "',
            '                    + ((r_ag && r_ag.json && r_ag.json.error) ? r_ag.json.error : "(sin detalle)"));',
            '            }',
            '            micros.push(r_ag.json.nombre_micro);',
            '        }',
            '',
            '        // Seleccionar un asiento del primer micro.',
            '        const a1 = await _primer_asiento_libre(ctx, nombre_admin, nombre_dueno, nombre_viaje, micros[0]);',
            '        const rs1 = await ctx.pedir_post("index.php", {',
            '            accion: "viajes/seleccionar_asiento",',
            '            nombre_solicitante: nombre_admin,',
            '            nombre_dueno,',
            '            nombre_viaje,',
            '            nombre_micro: micros[0],',
            '            fila: a1.fila,',
            '            columna: a1.columna,',
            '            nombre_terminal',
            '        });',
            '        if (!rs1 || !rs1.exito || !rs1.json || !rs1.json.exito) {',
            '            throw new Error("No se pudo seleccionar el primer asiento: "',
            '                + ((rs1 && rs1.json && rs1.json.error) ? rs1.json.error : "(sin detalle)"));',
            '        }',
            '',
            '        // Seleccionar un asiento del segundo micro. Esto dispara',
            '        // limpiar_lista = true en seleccionar_asiento_micro, porque',
            '        // el micro de la venta_actual cambia.',
            '        const a2 = await _primer_asiento_libre(ctx, nombre_admin, nombre_dueno, nombre_viaje, micros[1]);',
            '        const rs2 = await ctx.pedir_post("index.php", {',
            '            accion: "viajes/seleccionar_asiento",',
            '            nombre_solicitante: nombre_admin,',
            '            nombre_dueno,',
            '            nombre_viaje,',
            '            nombre_micro: micros[1],',
            '            fila: a2.fila,',
            '            columna: a2.columna,',
            '            nombre_terminal',
            '        });',
            '        if (!rs2 || !rs2.exito || !rs2.json || !rs2.json.exito) {',
            '            throw new Error("No se pudo seleccionar el segundo asiento: "',
            '                + ((rs2 && rs2.json && rs2.json.error) ? rs2.json.error : "(sin detalle)"));',
            '        }',
            '',
            '        const H1 = (await _resumen_grafo(ctx, nombre_admin)).huerfanos;',
            '        const dif = H1 - H0;',
            '        ctx.assert(H1 === H0,',
            '            "Cambiar de micro a mitad de selección dejó nodos huérfanos. "',
            '            + "H0=" + H0 + ", H1=" + H1 + ", diferencia=" + dif + "."',
            '            + (dif > 0 ? " Quedaron " + dif + " nodos huérfanos de los asientos-en-venta viejos." : " Algo inesperado."));',
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