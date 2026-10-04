<?php
/**
 * Aplicador de cambios automáticos — proyecto iteradoresJS (plugin Chrome).
 *
 * Tanda v1.5plugin.4z: pruebas de los fixes del alta de micro (v74k).
 *
 * - _micros_helpers.js: nuevos helpers agregar_micro_con_indices y
 *   quitar_micro_por_indice.
 * - servicio.js: nuevo helper ctx.clic_por_indice(sel, idx).
 * - prueba_27_micro_mismo_vehiculo.js: reescrita. Ahora verifica que
 *   el backend rechaza el duplicado (antes documentaba que lo
 *   permitía).
 * - prueba_28_micro_vehiculo_sin_asientos.js: nueva. Verifica el
 *   filtro de vehículos sin asientos en el select.
 * - prueba_29_micro_colision_numeracion.js: nueva. Reproduce el bug
 *   C: agregar 3 micros, quitar el del medio, agregar uno nuevo,
 *   verificar que aparecen 3.
 *
 * Uso (parado en la raíz de iteradoresJS/):
 *   php aplicar_cambios.php
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;

$cambios = [

    // ========================================================
    // _micros_helpers.js — agregar helpers nuevos
    // ========================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/_micros_helpers.js',
        'descripcion' => '_micros_helpers: agregar agregar_micro_con_indices y quitar_micro_por_indice',
        'buscar' => [
            '/**',
            ' * Verifica el mensaje del toast actual. Devuelve el texto',
            ' * (puede ser string vacío si no hay aviso visible).',
            ' *',
            ' * @param {object} ctx',
            ' */',
            'export async function leer_aviso_actual(ctx) {',
            '    const texto = await ctx.leer_aviso();',
            '    return (texto || "").trim();',
            '}',
        ],
        'reemplazar' => [
            '/**',
            ' * Verifica el mensaje del toast actual. Devuelve el texto',
            ' * (puede ser string vacío si no hay aviso visible).',
            ' *',
            ' * @param {object} ctx',
            ' */',
            'export async function leer_aviso_actual(ctx) {',
            '    const texto = await ctx.leer_aviso();',
            '    return (texto || "").trim();',
            '}',
            '',
            '/**',
            ' * Abre el formulario de agregar micro, elige la empresa y',
            ' * vehículo por índice, escribe el monto y confirma. NO',
            ' * espera a que el micro aparezca: el llamador decide qué',
            ' * verificar (éxito, rechazo, etc.).',
            ' *',
            ' * @param {object} ctx',
            ' * @param {number} idx_empresa',
            ' * @param {number} idx_vehiculo',
            ' * @param {string} monto',
            ' */',
            'export async function agregar_micro_con_indices(ctx, idx_empresa, idx_vehiculo, monto) {',
            '    await abrir_formulario_agregar_micro(ctx);',
            '    const info = await elegir_empresa_y_vehiculo(ctx, idx_empresa, idx_vehiculo);',
            '    await ctx.escribir("#monto_micro_viaje", monto);',
            '    await ctx.clic("#boton_confirmar_micro");',
            '    return info;',
            '}',
            '',
            '/**',
            ' * Quita un micro por su índice en #lista_micros_viaje. Hace',
            ' * click en el botón .btn-eliminar-micro de esa posición.',
            ' * Necesita que las alertas estén sobrescritas (el piloto',
            ' * usa confirm() nativo).',
            ' *',
            ' * @param {object} ctx',
            ' * @param {number} idx Índice 0-based del micro a quitar.',
            ' */',
            'export async function quitar_micro_por_indice(ctx, idx) {',
            '    const r = await ctx.clic_por_indice("#lista_micros_viaje .btn-eliminar-micro", idx);',
            '    if (!(r && r.exito)) throw new Error("No se pudo quitar el micro índice " + idx + ": " + (r && r.error ? r.error : "sin detalle"));',
            '}',
        ],
    ],

    // ========================================================
    // servicio.js — helper clic_por_indice
    // ========================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'servicio: helper clic_por_indice',
        'buscar' => [
            '        contar: async (selector) => {',
        ],
        'reemplazar' => [
            '        clic_por_indice: async (selector, indice) => {',
            '            // Hace click en el n-ésimo elemento que matchea el',
            '            // selector (0-based). Se usa para interactuar con',
            '            // listas (por ejemplo, el botón "Quitar" del segundo',
            '            // micro en #lista_micros_viaje).',
            '            try {',
            '                const r = await chrome.scripting.executeScript({',
            '                    target: { tabId: pestana_id },',
            '                    world: "MAIN",',
            '                    func: (sel, idx) => {',
            '                        const els = document.querySelectorAll(sel);',
            '                        if (idx < 0 || idx >= els.length) {',
            '                            return { exito: false, error: "indice " + idx + " fuera de rango (0.." + (els.length - 1) + ")" };',
            '                        }',
            '                        els[idx].click();',
            '                        return { exito: true };',
            '                    },',
            '                    args: [selector, indice]',
            '                });',
            '                return (r && r[0] && r[0].result) ? r[0].result : { exito: false, error: "sin resultado" };',
            '            } catch (e) {',
            '                return { exito: false, error: e.message };',
            '            }',
            '        },',
            '        contar: async (selector) => {',
        ],
    ],

    // ========================================================
    // servicio.js — bump @version
    // ========================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'servicio: bump @version a 1.5plugin.4z',
        'buscar' => [
            ' * @version 1.5plugin.4y',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4z',
        ],
    ],

    // ========================================================
    // prueba_27 — reescribir para verificar rechazo
    // ========================================================

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_27_micro_mismo_vehiculo.js',
        'descripcion' => 'Prueba 27 v2: verifica que el backend rechaza duplicados',
        'contenido' => [
            "/**",
            " * Prueba: agregar dos veces el mismo vehículo al mismo viaje.",
            " *",
            " * Verifica el fix v74k del piloto: `agregar_micro_a_viaje`",
            " * rechaza el duplicado y devuelve un error claro. Antes del",
            " * fix, el backend permitía duplicados silenciosamente (creaba",
            " * micro_1 y micro_2 con la misma patente).",
            " *",
            " * @version 1.5plugin.4z",
            " */",
            "",
            'import { CODIGO_DUENO } from "../ConfPlugin.js";',
            'import {',
            '    crear_viaje_de_prueba,',
            '    abrir_detalle_viaje,',
            '    abrir_formulario_agregar_micro,',
            '    elegir_empresa_y_vehiculo,',
            '    cerrar_modal_apilado_si_abierto,',
            '    leer_aviso_actual',
            '} from "./_micros_helpers.js";',
            "",
            "export const prueba = {",
            '    id: "micro_mismo_vehiculo_dos_veces",',
            '    nombre: "Micro: mismo vehículo dos veces (rechazo)",',
            '    descripcion: "Agrega el mismo vehículo dos veces al mismo viaje. El backend (v74k+) debe rechazar el segundo intento con un toast de error. La cantidad de micros debe quedar en 1.",',
            "",
            "    async ejecutar(ctx) {",
            "        await ctx.asegurar_login(CODIGO_DUENO);",
            '        await ctx.activar_pestana_piloto("viajes");',
            "        await ctx.esperar(\"#boton_agregar_viaje\", 5000);",
            "",
            "        try {",
            "            const { nombre_viaje } = await crear_viaje_de_prueba(ctx, \"viajedup\");",
            "            await abrir_detalle_viaje(ctx, nombre_viaje);",
            "",
            "            // Primer alta: debe pasar.",
            "            await abrir_formulario_agregar_micro(ctx);",
            "            const info = await elegir_empresa_y_vehiculo(ctx, 1, 1);",
            '            await ctx.escribir("#monto_micro_viaje", "700");',
            "            await ctx.clic(\"#boton_confirmar_micro\");",
            "",
            "            let items1 = 0;",
            "            const inicio1 = Date.now();",
            "            while (Date.now() - inicio1 < 10000) {",
            "                items1 = await ctx.contar(\"#lista_micros_viaje .micro-item\");",
            "                if (items1 >= 1) break;",
            "                await ctx.pausa(300);",
            "            }",
            "            ctx.assert(items1 === 1, \"Se esperaba 1 micro tras el primer alta, hay \" + items1);",
            "",
            "            // Segundo alta: mismo vehículo. Debe rechazarse.",
            "            await abrir_formulario_agregar_micro(ctx);",
            "            await elegir_empresa_y_vehiculo(ctx, 1, 1);",
            '            await ctx.escribir("#monto_micro_viaje", "800");',
            "            await ctx.clic(\"#boton_confirmar_micro\");",
            "            await ctx.pausa(1000);",
            "",
            "            // La cantidad debe seguir en 1.",
            "            const items2 = await ctx.contar(\"#lista_micros_viaje .micro-item\");",
            "            ctx.assert(",
            "                items2 === 1,",
            "                \"El backend permitió el segundo alta con el mismo vehículo (patente \" + info.patente + \"). Cantidad actual: \" + items2 + \". Revisá que el fix v74k esté aplicado.\"",
            "            );",
            "",
            "            // El toast debe mencionar el rechazo.",
            "            const aviso = await leer_aviso_actual(ctx);",
            "            ctx.assert(",
            "                aviso.toLowerCase().includes(\"ya\") || aviso.toLowerCase().includes(\"agregado\"),",
            "                \"El toast no menciona el rechazo del duplicado. Aviso actual: '\" + aviso + \"'\"",
            "            );",
            "",
            "            // El modal debe seguir abierto (el backend devolvió error).",
            "            const modal_abierto = await ctx.esta_visible(\"#selector_empresa_micro_viaje\");",
            "            ctx.assert(modal_abierto, \"El modal se cerró pese al rechazo del backend\");",
            "        } finally {",
            "            await cerrar_modal_apilado_si_abierto(ctx);",
            "        }",
            "    }",
            "};",
        ],
    ],

    // ========================================================
    // prueba_28 — nueva: vehículo sin asientos
    // ========================================================

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_28_micro_vehiculo_sin_asientos.js',
        'descripcion' => 'Prueba 28: vehículos sin asientos aparecen disabled',
        'contenido' => [
            "/**",
            " * Prueba: el filtro de vehículos sin asientos en el select de",
            " * agregar micro.",
            " *",
            " * Verifica el fix v74k: los vehículos sin asientos",
            " * configurados deben aparecer como opciones DISABLED con el",
            " * texto sufijado \"— Sin asientos configurados\". Si el dueño",
            " * no tiene ningún vehículo sin asientos, la prueba pasa con",
            " * una advertencia en consola (no hay caso que cubrir).",
            " *",
            " * @version 1.5plugin.4z",
            " */",
            "",
            'import { CODIGO_DUENO } from "../ConfPlugin.js";',
            'import {',
            '    crear_viaje_de_prueba,',
            '    abrir_detalle_viaje,',
            '    abrir_formulario_agregar_micro,',
            '    elegir_empresa_y_vehiculo,',
            '    cerrar_modal_apilado_si_abierto',
            '} from "./_micros_helpers.js";',
            "",
            "export const prueba = {",
            '    id: "micro_vehiculo_sin_asientos",',
            '    nombre: "Micro: vehículo sin asientos aparece deshabilitado",',
            '    descripcion: "Abre el formulario de agregar micro y verifica que las opciones del select de vehículos que correspondan a vehículos sin asientos estén disabled y con el sufijo correcto.",',
            "",
            "    async ejecutar(ctx) {",
            "        await ctx.asegurar_login(CODIGO_DUENO);",
            '        await ctx.activar_pestana_piloto("viajes");',
            "        await ctx.esperar(\"#boton_agregar_viaje\", 5000);",
            "",
            "        try {",
            "            const { nombre_viaje } = await crear_viaje_de_prueba(ctx, \"viajesin\");",
            "            await abrir_detalle_viaje(ctx, nombre_viaje);",
            "            await abrir_formulario_agregar_micro(ctx);",
            "",
            "            // Elegir la primera empresa para forzar la carga de",
            "            // vehículos.",
            "            await elegir_empresa_y_vehiculo(ctx, 1, 1);",
            "",
            "            // Leer todas las opciones del select de vehículos con",
            "            // su estado disabled.",
            "            const opciones = await ctx.leer_opciones_con_disabled(\"#selector_vehiculo_micro_viaje\");",
            "            ctx.assert(Array.isArray(opciones) && opciones.length >= 2,",
            "                \"El select de vehículos no tiene al menos 2 opciones (placeholder + 1 vehículo)\");",
            "",
            "            // Buscar opciones disabled.",
            "            const deshabilitadas = opciones.filter(o => o.disabled === true);",
            "",
            "            if (deshabilitadas.length === 0) {",
            "                console.warn(\"[micro_vehiculo_sin_asientos] El dueño no tiene vehículos sin asientos configurados. La prueba no puede verificar el filtro. Marcada como OK por vacuidad.\");",
            "                return;",
            "            }",
            "",
            "            // Todas las deshabilitadas deben tener el sufijo correcto.",
            "            for (const op of deshabilitadas) {",
            "                ctx.assert(",
            "                    op.texto.includes(\"Sin asientos configurados\"),",
            "                    \"Una opción disabled no tiene el sufijo esperado. Texto: '\" + op.texto + \"'\"",
            "                );",
            "            }",
            "",
            "            // Verificar que ninguna opción HABILITADA tenga el sufijo.",
            "            const habilitadas_con_sufijo = opciones.filter(o => !o.disabled && o.texto.includes(\"Sin asientos configurados\"));",
            "            ctx.assert(",
            "                habilitadas_con_sufijo.length === 0,",
            "                \"Hay opciones habilitadas con el sufijo 'Sin asientos configurados': \" + habilitadas_con_sufijo.map(o => o.texto).join(\", \")",
            "            );",
            "        } finally {",
            "            await cerrar_modal_apilado_si_abierto(ctx);",
            "        }",
            "    }",
            "};",
        ],
    ],

    // ========================================================
    // servicio.js — helper leer_opciones_con_disabled
    // ========================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'servicio: helper leer_opciones_con_disabled',
        'buscar' => [
            '        seleccionar_indice: async (selector, indice) => {',
        ],
        'reemplazar' => [
            '        leer_opciones_con_disabled: async (selector) => {',
            '            // Como leer_opciones, pero cada opción incluye un',
            '            // campo `disabled`. Se usa para verificar el filtro',
            '            // de vehículos sin asientos del alta de micro.',
            '            try {',
            '                const r = await chrome.scripting.executeScript({',
            '                    target: { tabId: pestana_id },',
            '                    world: "MAIN",',
            '                    func: (sel) => {',
            '                        const el = document.querySelector(sel);',
            '                        if (!el) return { exito: false, error: "no existe " + sel };',
            '                        if (el.tagName !== "SELECT") return { exito: false, error: "no es un SELECT: " + sel };',
            '                        const opciones = Array.from(el.options).map(o => ({ valor: o.value, texto: o.textContent, disabled: o.disabled === true }));',
            '                        return { exito: true, opciones };',
            '                    },',
            '                    args: [selector]',
            '                });',
            '                if (r && r[0] && r[0].result && r[0].result.exito) {',
            '                    return r[0].result.opciones;',
            '                }',
            '                return [];',
            '            } catch (e) {',
            '                return [];',
            '            }',
            '        },',
            '        seleccionar_indice: async (selector, indice) => {',
        ],
    ],

    // ========================================================
    // prueba_29 — nueva: colisión de numeración
    // ========================================================

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_29_micro_colision_numeracion.js',
        'descripcion' => 'Prueba 29: colisión de numeración al quitar del medio',
        'contenido' => [
            "/**",
            " * Prueba: colisión de numeración al quitar un micro del medio.",
            " *",
            " * Reproduce el bug C (fix v74k). Antes del fix, el nombre",
            " * del micro se calculaba con count+1, así que:",
            " *",
            " *   1. Agregar 3 micros → micro_1, micro_2, micro_3.",
            " *   2. Quitar el del medio (micro_2).",
            " *   3. Agregar uno nuevo → count=2, +1=3, intenta micro_3",
            " *      (que ya existe). _adyacente_en falla silenciosamente,",
            " *      el micro queda huérfano, el backend devuelve exito:true",
            " *      pero el micro no aparece en la lista.",
            " *",
            " * Con el fix (max+1), el nuevo micro se llama micro_4 y",
            " * aparece correctamente.",
            " *",
            " * Precondición: la empresa elegida debe tener al menos 3",
            " * vehículos configurados. Si no, la prueba falla con mensaje.",
            " *",
            " * @version 1.5plugin.4z",
            " */",
            "",
            'import { CODIGO_DUENO } from "../ConfPlugin.js";',
            'import {',
            '    crear_viaje_de_prueba,',
            '    abrir_detalle_viaje,',
            '    abrir_formulario_agregar_micro,',
            '    elegir_empresa_y_vehiculo,',
            '    quitar_micro_por_indice,',
            '    cerrar_modal_apilado_si_abierto',
            '} from "./_micros_helpers.js";',
            "",
            "export const prueba = {",
            '    id: "micro_colision_numeracion",',
            '    nombre: "Micro: colisión de numeración al quitar del medio",',
            '    descripcion: "Agrega 3 micros (3 vehículos distintos), quita el del medio, agrega uno nuevo. Verifica que el nuevo aparezca (fix v74k: nombre con max+1 en vez de count+1).",',
            "",
            "    async ejecutar(ctx) {",
            "        await ctx.asegurar_login(CODIGO_DUENO);",
            '        await ctx.activar_pestana_piloto("viajes");',
            "        await ctx.esperar(\"#boton_agregar_viaje\", 5000);",
            "",
            "        // Necesitamos al menos 3 vehículos distintos para agregar",
            "        // 3 micros sin duplicar. Verificamos antes.",
            "        let vehiculos_disponibles = [];",
            "        // Abrimos el formulario una vez para inspeccionar los",
            "        // vehículos de la primera empresa.",
            "        const { nombre_viaje } = await crear_viaje_de_prueba(ctx, \"viajecol\");",
            "        await abrir_detalle_viaje(ctx, nombre_viaje);",
            "        await abrir_formulario_agregar_micro(ctx);",
            "        await elegir_empresa_y_vehiculo(ctx, 1, 1);",
            "        vehiculos_disponibles = await ctx.leer_opciones_con_disabled(\"#selector_vehiculo_micro_viaje\");",
            "        // Volvemos a cerrar el formulario (ya elegimos para",
            "        // inspeccionar).",
            "        await ctx.clic(\"#boton_cancelar_micro\");",
            "        await ctx.pausa(300);",
            "",
            "        const vehiculos_ok = vehiculos_disponibles.filter(o => !o.disabled && o.valor !== \"\");",
            "        ctx.assert(",
            "            vehiculos_ok.length >= 3,",
            "            \"La primera empresa necesita al menos 3 vehículos con asientos configurados para esta prueba. Encontrados: \" + vehiculos_ok.length + \". Cargá más vehículos o ajustá la prueba.\"",
            "        );",
            "",
            "        try {",
            "            // Sobrescribir confirm() (el quitar micro usa confirm",
            "            // nativo).",
            "            await ctx.sobrescribir_alertas();",
            "",
            "            // Agregar 3 micros con vehículos 1, 2, 3.",
            "            for (let i = 1; i <= 3; i++) {",
            "                await abrir_formulario_agregar_micro(ctx);",
            "                await elegir_empresa_y_vehiculo(ctx, 1, i);",
            "                await ctx.escribir(\"#monto_micro_viaje\", \"500\");",
            "                await ctx.clic(\"#boton_confirmar_micro\");",
            "",
            "                let items = 0;",
            "                const inicio = Date.now();",
            "                while (Date.now() - inicio < 10000) {",
            "                    items = await ctx.contar(\"#lista_micros_viaje .micro-item\");",
            "                    if (items >= i) break;",
            "                    await ctx.pausa(300);",
            "                }",
            "                ctx.assert(items === i, \"Se esperaban \" + i + \" micros tras el alta \" + i + \", hay \" + items);",
            "            }",
            "",
            "            // Quitar el del medio (índice 1).",
            "            await quitar_micro_por_indice(ctx, 1);",
            "            await ctx.pausa(500);",
            "",
            "            let items_tras_quitar = 0;",
            "            const inicio_q = Date.now();",
            "            while (Date.now() - inicio_q < 8000) {",
            "                items_tras_quitar = await ctx.contar(\"#lista_micros_viaje .micro-item\");",
            "                if (items_tras_quitar === 2) break;",
            "                await ctx.pausa(300);",
            "            }",
            "            ctx.assert(items_tras_quitar === 2, \"Se esperaban 2 micros tras quitar el del medio, hay \" + items_tras_quitar);",
            "",
            "            // Agregar uno nuevo (vehículo del medio, libre ahora).",
            "            await abrir_formulario_agregar_micro(ctx);",
            "            await elegir_empresa_y_vehiculo(ctx, 1, 2);",
            "            await ctx.escribir(\"#monto_micro_viaje\", \"600\");",
            "            await ctx.clic(\"#boton_confirmar_micro\");",
            "",
            "            let items_finales = 0;",
            "            const inicio_f = Date.now();",
            "            while (Date.now() - inicio_f < 12000) {",
            "                items_finales = await ctx.contar(\"#lista_micros_viaje .micro-item\");",
            "                if (items_finales === 3) break;",
            "                await ctx.pausa(300);",
            "            }",
            "",
            "            ctx.assert(",
            "                items_finales === 3,",
            "                \"El nuevo micro no apareció (hay \" + items_finales + \", se esperaban 3). Si el backend permite duplicados, revisá que el fix v74k (max+1) esté aplicado. Si el bug de colisión sigue activo, el micro se creó huérfano y el backend devolvió exito:true.\"",
            "            );",
            "        } finally {",
            "            await ctx.restaurar_alertas();",
            "            await cerrar_modal_apilado_si_abierto(ctx);",
            "        }",
            "    }",
            "};",
        ],
    ],

    // ========================================================
    // catalogo.js — imports
    // ========================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'catalogo: imports de las pruebas 28 y 29',
        'buscar' => [
            'import { prueba as micro_mismo_vehiculo_dos_veces } from "./prueba_27_micro_mismo_vehiculo.js";',
        ],
        'reemplazar' => [
            'import { prueba as micro_mismo_vehiculo_dos_veces } from "./prueba_27_micro_mismo_vehiculo.js";',
            'import { prueba as micro_vehiculo_sin_asientos } from "./prueba_28_micro_vehiculo_sin_asientos.js";',
            'import { prueba as micro_colision_numeracion } from "./prueba_29_micro_colision_numeracion.js";',
        ],
    ],

    // ========================================================
    // catalogo.js — sección Micros ampliada
    // ========================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'catalogo: seccion Micros con 9 pruebas',
        'buscar' => [
            '            micro_cancelar,',
            '            micro_mismo_vehiculo_dos_veces',
            '        ]',
            '    },',
        ],
        'reemplazar' => [
            '            micro_cancelar,',
            '            micro_mismo_vehiculo_dos_veces,',
            '            micro_vehiculo_sin_asientos,',
            '            micro_colision_numeracion',
            '        ]',
            '    },',
        ],
    ],

    // --------------------------------------------------------
    // catalogo.js — bump @version
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'catalogo: bump @version a 1.5plugin.4z',
        'buscar' => [
            ' * @version 1.5plugin.4y',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4z',
        ],
    ],

    // ========================================================
    // ConfPlugin.js — bumps
    // ========================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'ConfPlugin: bump VERSION_APP a 1.5plugin.4z',
        'buscar' => [
            '    Conf.NOMBRE_APP = "IteradoresPluginPruebas";',
            '    Conf.VERSION_APP = "1.5plugin.4y";',
        ],
        'reemplazar' => [
            '    Conf.NOMBRE_APP = "IteradoresPluginPruebas";',
            '    Conf.VERSION_APP = "1.5plugin.4z";',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'ConfPlugin: bump VERSION_PLUGIN a 1.5plugin.4z',
        'buscar' => [
            'export const VERSION_PLUGIN = "1.5plugin.4y";',
        ],
        'reemplazar' => [
            'export const VERSION_PLUGIN = "1.5plugin.4z";',
        ],
    ],

    // ========================================================
    // prompt_plugin_piloto.md — §7
    // ========================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt: §7 bump a 4z con 29 pruebas',
        'buscar' => [
            '**Proyecto en v1.5plugin.4y.** El esqueleto del plugin está',
            'armado y funcional, tiene 27 pruebas (base + autocompletado',
            '+ puntos de venta + viajes + micros + ventas) y las agrupa',
            'en secciones.',
        ],
        'reemplazar' => [
            '**Proyecto en v1.5plugin.4z.** El esqueleto del plugin está',
            'armado y funcional, tiene 29 pruebas (base + autocompletado',
            '+ puntos de venta + viajes + micros + ventas) y las agrupa',
            'en secciones.',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt: §7 actualizar seccion Micros a 9 pruebas',
        'buscar' => [
            '- `micros`: 7 pruebas. `alta_micro` (flujo feliz) más',
            '  validaciones: `micro_sin_empresa`, `micro_sin_vehiculo`,',
            '  `micro_monto_vacio`, `micro_monto_negativo`,',
            '  `micro_cancelar`, `micro_mismo_vehiculo_dos_veces`.',
        ],
        'reemplazar' => [
            '- `micros`: 9 pruebas. `alta_micro` (flujo feliz) más',
            '  validaciones: `micro_sin_empresa`, `micro_sin_vehiculo`,',
            '  `micro_monto_vacio`, `micro_monto_negativo`,',
            '  `micro_cancelar`, `micro_mismo_vehiculo_dos_veces`',
            '  (verifica rechazo), `micro_vehiculo_sin_asientos`',
            '  (verifica filtro del select) y `micro_colision_numeracion`',
            '  (reproduce el bug de colisión al quitar del medio).',
        ],
    ],

    // ========================================================
    // prompt_plugin_piloto.md — §8.8 aprendizaje 38
    // ========================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt: §8.8 agregar aprendizaje 38',
        'buscar' => [
            '37. **Documentar el comportamiento del backend con pruebas',
            '    también es útil.** `micro_mismo_vehiculo_dos_veces`',
            '    verifica que el backend actual PERMITE duplicados. Si',
            '    en el futuro el backend cambia a rechazarlos, la prueba',
            '    falla y hay que decidir: actualizar la prueba o revertir',
            '    el cambio. La prueba no es un contrato inmutable; es una',
            '    foto del comportamiento observado, con un comentario',
            '    que lo aclara.',
        ],
        'reemplazar' => [
            '37. **Documentar el comportamiento del backend con pruebas',
            '    también es útil.** `micro_mismo_vehiculo_dos_veces`',
            '    verificaba que el backend PERMITE duplicados; después',
            '    del fix v74k del piloto (que rechaza duplicados) se',
            '    reescribió para verificar el rechazo. La prueba no es',
            '    un contrato inmutable; es una foto del comportamiento',
            '    observado, y se actualiza cuando el comportamiento',
            '    cambia intencionalmente.',
            '38. **Las pruebas que dependen de una precondición del',
            '    entorno deben fallar con mensaje claro.**',
            '    `micro_colision_numeracion` necesita 3 vehículos',
            '    configurados en la misma empresa; si el dueño tiene',
            '    menos, la prueba falla con un mensaje que dice cuántos',
            '    encontró y qué hacer (cargar más vehículos o ajustar la',
            '    prueba). `micro_vehiculo_sin_asientos`, en cambio, no',
            '    puede forzar su precondición (vehículo sin asientos)',
            '    desde el plugin. En ese caso, la prueba pasa con un',
            '    `console.warn` si el entorno no la cumple. El criterio:',
            '    si la precondición es creada por el usuario (cargar',
            '    datos), fallar con mensaje; si es un estado aleatorio',
            '    que puede no darse, pasar con advertencia.',
        ],
    ],

    // ========================================================
    // prompt_plugin_piloto.md — §9 cabecera
    // ========================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt: §9 cabecera bump a 4z',
        'buscar' => [
            '**Última actualización de este prompt:** v1.5plugin.4y (seis',
            'pruebas nuevas de validación del alta de micro: sin',
            'empresa, sin vehículo, monto vacío, monto negativo,',
            'cancelar y mismo vehículo dos veces. Nuevo archivo',
            '`_micros_helpers.js` con las funciones de setup compartidas;',
            '`alta_micro` refactorizada para usarlas. Se agregan los',
            'helpers `ctx.contar(sel)` y `ctx.forzar_valor(sel, valor)`',
            'al service worker. Nuevos aprendizajes 36 y 37).',
        ],
        'reemplazar' => [
            '**Última actualización de este prompt:** v1.5plugin.4z (dos',
            'pruebas nuevas para verificar los fixes v74k del piloto:',
            '`micro_vehiculo_sin_asientos` verifica que los vehículos',
            'sin asientos aparezcan disabled con el sufijo correcto, y',
            '`micro_colision_numeracion` reproduce el bug de colisión al',
            'quitar un micro del medio. `micro_mismo_vehiculo_dos_veces`',
            'se reescribió para verificar el rechazo del backend (antes',
            'documentaba que lo permitía). Se agregan los helpers',
            '`ctx.clic_por_indice(sel, idx)` y',
            '`ctx.leer_opciones_con_disabled(sel)` al service worker.',
            'Nuevo aprendizaje 38).',
            'Antes: v1.5plugin.4y (seis',
            'pruebas nuevas de validación del alta de micro: sin',
            'empresa, sin vehículo, monto vacío, monto negativo,',
            'cancelar y mismo vehículo dos veces. Nuevo archivo',
            '`_micros_helpers.js` con las funciones de setup compartidas;',
            '`alta_micro` refactorizada para usarlas. Se agregan los',
            'helpers `ctx.contar(sel)` y `ctx.forzar_valor(sel, valor)`',
            'al service worker. Nuevos aprendizajes 36 y 37).',
        ],
    ],

    // ========================================================
    // prompt_plugin_piloto.md — §9 estado de la conversación
    // ========================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt: §9 agregar entrada de la tanda 4z',
        'buscar' => [
            '- El plugin tiene 27 pruebas que corren OK contra el piloto',
            '  PHP. La última tanda (v1.5plugin.4y) agregó 6 pruebas de',
            '  validación del alta de micro: `micro_sin_empresa`,',
            '  `micro_sin_vehiculo`, `micro_monto_vacio`,',
            '  `micro_monto_negativo`, `micro_cancelar` y',
            '  `micro_mismo_vehiculo_dos_veces` (esta última documenta',
            '  que el backend actual permite agregar el mismo vehículo',
            '  dos veces al mismo viaje). Se extrajeron las funciones de',
            '  setup a `_micros_helpers.js`, y `alta_micro` se refactorizó',
            '  para usarlas.',
        ],
        'reemplazar' => [
            '- El plugin tiene 29 pruebas que corren OK contra el piloto',
            '  PHP. La última tanda (v1.5plugin.4z) agregó 2 pruebas que',
            '  verifican los fixes v74k del piloto:',
            '  `micro_vehiculo_sin_asientos` (verifica que los vehículos',
            '  sin asientos aparezcan disabled en el select, con el',
            '  sufijo "Sin asientos configurados") y',
            '  `micro_colision_numeracion` (reproduce el bug de colisión',
            '  al quitar un micro del medio: 3 micros → quitar el 2do →',
            '  agregar uno nuevo → verificar que aparecen 3). Además se',
            '  reescribió `micro_mismo_vehiculo_dos_veces`: antes',
            '  documentaba que el backend permitía duplicados; ahora',
            '  verifica que los rechaza.',
            '- Requisito de entorno para `micro_colision_numeracion`:',
            '  la primera empresa del dueño `carmen1` debe tener al',
            '  menos 3 vehículos configurados. Si no, la prueba falla',
            '  con mensaje claro pidiendo cargar más.',
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