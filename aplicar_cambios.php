<?php
/**
 * Aplicador de cambios automáticos — proyecto iteradoresJS (plugin Chrome).
 *
 * Tanda v1.5plugin.4y: validaciones del alta de micro.
 *
 * - Aplicacion/pruebas/_micros_helpers.js: nuevo archivo con helpers de
 *   setup compartidos (crear viaje, abrir detalle, abrir formulario de
 *   micro, elegir empresa/vehículo, forzar valor de input).
 * - Aplicacion/pruebas/prueba_21_alta_micro.js: refactor para usar los
 *   helpers.
 * - 6 pruebas nuevas de validación: sin empresa, sin vehículo, monto
 *   vacío, monto negativo, cancelar, mismo vehículo dos veces.
 * - servicio.js: nuevos helpers ctx.contar(sel) y
 *   ctx.forzar_valor(sel, valor).
 *
 * Uso (parado en la raíz de iteradoresJS/):
 *   php aplicar_cambios.php
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;

$cambios = [

    // ========================================================
    // Archivo nuevo: _micros_helpers.js
    // ========================================================

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/_micros_helpers.js',
        'descripcion' => 'Helpers compartidos para pruebas de micros',
        'contenido' => [
            "/**",
            " * Helpers compartidos por las pruebas que tocan el alta de",
            " * micros dentro de un viaje (viajes-micros.js del piloto).",
            " *",
            " * Todos los helpers usan `ctx` (el objeto del service worker)",
            " * y son async. Lanzan Error si algo falla, para que la prueba",
            " * que los usa no siga adelante con datos inconsistentes.",
            " *",
            " * @version 1.5plugin.4y",
            " */",
            "",
            "/**",
            " * Crea un viaje de prueba. Escribe el nombre, la fecha, la",
            " * hora, origen y destino, guarda, y espera a que el viaje",
            " * aparezca en #lista_viajes.",
            " *",
            " * Devuelve { nombre_viaje, sufijo }.",
            " *",
            " * @param {object} ctx",
            " * @param {string} prefijo Prefijo del nombre del viaje.",
            " */",
            "export async function crear_viaje_de_prueba(ctx, prefijo = \"viajeprueba\") {",
            "    const sufijo = String(Date.now()).slice(-8);",
            "    const nombre_viaje = prefijo + sufijo;",
            "",
            "    await ctx.clic(\"#boton_agregar_viaje\");",
            "    const espera = await ctx.esperar(\"#modal_viaje_nombre\", 5000);",
            "    if (!(espera && espera.exito)) throw new Error(\"No apareció el modal de alta de viaje\");",
            "",
            "    const fecha_futura = new Date(Date.now() + 24 * 60 * 60 * 1000);",
            "    const fecha_str = fecha_futura.getFullYear() + '-'",
            "        + String(fecha_futura.getMonth() + 1).padStart(2, '0') + '-'",
            "        + String(fecha_futura.getDate()).padStart(2, '0');",
            "",
            "    await ctx.escribir(\"#modal_viaje_nombre\", nombre_viaje);",
            "    await ctx.escribir(\"#modal_viaje_fecha\", fecha_str);",
            "    await ctx.escribir(\"#modal_viaje_hora\", \"08:00\");",
            "    await ctx.escribir(\"#modal_viaje_origen\", \"Origen Test\");",
            "    await ctx.escribir(\"#modal_viaje_destino\", \"Destino Test\");",
            "    await ctx.clic(\"#guardar_modal_viaje\");",
            "",
            "    let ok = false;",
            "    const inicio = Date.now();",
            "    while (Date.now() - inicio < 15000) {",
            "        const html = await ctx.html(\"#lista_viajes\");",
            "        if (html && html.includes(nombre_viaje)) { ok = true; break; }",
            "        await ctx.pausa(300);",
            "    }",
            "    if (!ok) throw new Error(\"El viaje de setup (\" + nombre_viaje + \") no apareció en #lista_viajes\");",
            "",
            "    return { nombre_viaje, sufijo };",
            "}",
            "",
            "/**",
            " * Abre el detalle de un viaje y espera a que aparezca el botón",
            " * de agregar micro.",
            " *",
            " * @param {object} ctx",
            " * @param {string} nombre_viaje",
            " */",
            "export async function abrir_detalle_viaje(ctx, nombre_viaje) {",
            "    const sel = '.btn-detalle-viaje[data-viaje=\"' + nombre_viaje + '\"]';",
            "    const espera = await ctx.esperar(sel, 3000);",
            "    if (!(espera && espera.exito)) throw new Error(\"No apareció el botón Ver detalle del viaje \" + nombre_viaje);",
            "",
            "    await ctx.clic(sel);",
            "    const espera_detalle = await ctx.esperar(\"#boton_agregar_micro_viaje\", 6000);",
            "    if (!(espera_detalle && espera_detalle.exito)) throw new Error(\"No apareció #boton_agregar_micro_viaje dentro del detalle\");",
            "}",
            "",
            "/**",
            " * Abre el formulario de agregar micro (modal apilado) y espera a",
            " * que el select de empresas se llene con al menos 2 opciones",
            " * (placeholder + una empresa real).",
            " *",
            " * @param {object} ctx",
            " */",
            "export async function abrir_formulario_agregar_micro(ctx) {",
            "    await ctx.clic(\"#boton_agregar_micro_viaje\");",
            "    const espera = await ctx.esperar(\"#selector_empresa_micro_viaje\", 5000);",
            "    if (!(espera && espera.exito)) throw new Error(\"No apareció el formulario de agregar micro\");",
            "",
            "    let empresas = [];",
            "    const inicio = Date.now();",
            "    while (Date.now() - inicio < 8000) {",
            "        empresas = await ctx.leer_opciones(\"#selector_empresa_micro_viaje\");",
            "        if (Array.isArray(empresas) && empresas.length >= 2) break;",
            "        await ctx.pausa(300);",
            "    }",
            "    if (!(Array.isArray(empresas) && empresas.length >= 2)) {",
            "        throw new Error(\"El select de empresas no se llenó. El dueño de prueba no tiene empresas con vehículos configurados.\");",
            "    }",
            "}",
            "",
            "/**",
            " * Elige la empresa y el vehículo en el formulario de agregar",
            " * micro. Espera a que el select de vehículos se llene después",
            " * de elegir empresa (el onchange del piloto lo dispara).",
            " *",
            " * Devuelve { empresa_valor, patente }.",
            " *",
            " * @param {object} ctx",
            " * @param {number} idx_empresa Índice de la empresa (0 es placeholder).",
            " * @param {number} idx_vehiculo Índice del vehículo (0 es placeholder).",
            " */",
            "export async function elegir_empresa_y_vehiculo(ctx, idx_empresa = 1, idx_vehiculo = 1) {",
            "    const sel_emp = await ctx.seleccionar_indice(\"#selector_empresa_micro_viaje\", idx_empresa);",
            "    if (!(sel_emp && sel_emp.exito)) throw new Error(\"No se pudo seleccionar empresa: \" + (sel_emp && sel_emp.error ? sel_emp.error : \"sin detalle\"));",
            "",
            "    let vehiculos = [];",
            "    const inicio = Date.now();",
            "    while (Date.now() - inicio < 8000) {",
            "        vehiculos = await ctx.leer_opciones(\"#selector_vehiculo_micro_viaje\");",
            "        if (Array.isArray(vehiculos) && vehiculos.length >= 2) break;",
            "        await ctx.pausa(300);",
            "    }",
            "    if (!(Array.isArray(vehiculos) && vehiculos.length >= 2)) {",
            "        throw new Error(\"La empresa seleccionada no tiene vehículos.\");",
            "    }",
            "",
            "    const sel_veh = await ctx.seleccionar_indice(\"#selector_vehiculo_micro_viaje\", idx_vehiculo);",
            "    if (!(sel_veh && sel_veh.exito)) throw new Error(\"No se pudo seleccionar vehículo: \" + (sel_veh && sel_veh.error ? sel_veh.error : \"sin detalle\"));",
            "",
            "    return { empresa_valor: sel_emp.valor, patente: sel_veh.valor };",
            "}",
            "",
            "/**",
            " * Cierra el modal apilado si quedó abierto (por ejemplo, si una",
            " * prueba anterior falló a mitad de camino). Idempotente.",
            " *",
            " * @param {object} ctx",
            " */",
            "export async function cerrar_modal_apilado_si_abierto(ctx) {",
            "    try {",
            "        const visible = await ctx.esta_visible(\"#cerrar_modal_apilado\");",
            "        if (visible) await ctx.clic(\"#cerrar_modal_apilado\");",
            "    } catch (e) { /* no hacer nada */ }",
            "}",
            "",
            "/**",
            " * Verifica el mensaje del toast actual. Devuelve el texto",
            " * (puede ser string vacío si no hay aviso visible).",
            " *",
            " * @param {object} ctx",
            " */",
            "export async function leer_aviso_actual(ctx) {",
            "    const texto = await ctx.leer_aviso();",
            "    return (texto || \"\").trim();",
            "}",
        ],
    ],

    // ========================================================
    // Refactor: prueba_21_alta_micro.js
    // ========================================================

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_21_alta_micro.js',
        'descripcion' => 'Refactor: alta_micro usa los helpers',
        'contenido' => [
            "/**",
            " * Prueba: agregar un micro a un viaje (dueño).",
            " *",
            " * Autocontenida: crea un viaje nuevo, le agrega un micro y",
            " * verifica que aparezca en la lista de micros del viaje.",
            " *",
            " * Precondición: el dueño debe tener al menos una empresa con",
            " * un vehículo configurado. Si no, la prueba falla en el paso",
            " * de seleccionar empresa, con mensaje claro.",
            " *",
            " * @version 1.5plugin.4y",
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
            '    id: "alta_micro",',
            '    nombre: "Agregar micro a un viaje (dueño)",',
            '    descripcion: "Crea un viaje, le agrega un micro (empresa + vehículo + monto) y verifica que aparezca en la lista de micros del viaje. Requiere que el dueño tenga al menos una empresa con un vehículo configurado. Cada corrida crea un viaje nuevo (prefijo viajemicro).",',
            "",
            "    async ejecutar(ctx) {",
            "        await ctx.asegurar_login(CODIGO_DUENO);",
            "",
            '        const activacion = await ctx.activar_pestana_piloto("viajes");',
            '        ctx.assert(activacion && activacion.exito, "No se pudo activar la pestaña Viajes: " + (activacion && activacion.error ? activacion.error : "sin detalle"));',
            "",
            "        const espera_boton = await ctx.esperar(\"#boton_agregar_viaje\", 5000);",
            "        ctx.assert(espera_boton && espera_boton.exito, \"No apareció el botón #boton_agregar_viaje\");",
            "",
            "        try {",
            '            const { nombre_viaje } = await crear_viaje_de_prueba(ctx, "viajemicro");',
            "            await abrir_detalle_viaje(ctx, nombre_viaje);",
            "            await abrir_formulario_agregar_micro(ctx);",
            "",
            "            const { patente } = await elegir_empresa_y_vehiculo(ctx, 1, 1);",
            '            await ctx.escribir("#monto_micro_viaje", "1000");',
            "            await ctx.clic(\"#boton_confirmar_micro\");",
            "",
            "            let micro_agregado = false;",
            "            let monto_ok = false;",
            "            const inicio = Date.now();",
            "            while (Date.now() - inicio < 15000) {",
            "                const html_micros = await ctx.html(\"#lista_micros_viaje\");",
            "                if (html_micros && html_micros.includes(patente)) {",
            "                    micro_agregado = true;",
            '                    monto_ok = html_micros.includes("1000");',
            "                    break;",
            "                }",
            "                await ctx.pausa(300);",
            "            }",
            "",
            "            ctx.assert(micro_agregado, \"El micro (patente \" + patente + \") no apareció en #lista_micros_viaje después del alta\");",
            "            ctx.assert(monto_ok, \"El micro se agregó pero el monto 1000 no se refleja en #lista_micros_viaje\");",
            "        } finally {",
            "            await cerrar_modal_apilado_si_abierto(ctx);",
            "        }",
            "    }",
            "};",
        ],
    ],

    // ========================================================
    // Pruebas nuevas de validación
    // ========================================================

    // --- 22: sin empresa ---
    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_22_micro_sin_empresa.js',
        'descripcion' => 'Prueba 22: confirmar sin empresa ni vehículo',
        'contenido' => [
            "/**",
            " * Prueba: confirmar el alta de micro sin elegir empresa ni",
            " * vehículo. El frontend debe rechazarlo con un toast y no",
            " * agregar nada al viaje.",
            " *",
            " * @version 1.5plugin.4y",
            " */",
            "",
            'import { CODIGO_DUENO } from "../ConfPlugin.js";',
            'import {',
            '    crear_viaje_de_prueba,',
            '    abrir_detalle_viaje,',
            '    abrir_formulario_agregar_micro,',
            '    cerrar_modal_apilado_si_abierto,',
            '    leer_aviso_actual',
            '} from "./_micros_helpers.js";',
            "",
            "export const prueba = {",
            '    id: "micro_sin_empresa",',
            '    nombre: "Micro: confirmar sin empresa ni vehículo",',
            '    descripcion: "Con el formulario de agregar micro abierto y sin seleccionar nada, apretar Confirmar. Debe rechazar con aviso y no agregar nada.",',
            "",
            "    async ejecutar(ctx) {",
            "        await ctx.asegurar_login(CODIGO_DUENO);",
            '        await ctx.activar_pestana_piloto("viajes");',
            "        await ctx.esperar(\"#boton_agregar_viaje\", 5000);",
            "",
            "        try {",
            "            const { nombre_viaje } = await crear_viaje_de_prueba(ctx, \"viajeval\");",
            "            await abrir_detalle_viaje(ctx, nombre_viaje);",
            "            await abrir_formulario_agregar_micro(ctx);",
            "",
            "            // No elegir nada. Confirmar directo.",
            "            const micros_antes = await ctx.contar(\"#lista_micros_viaje .micro-item\");",
            "            await ctx.clic(\"#boton_confirmar_micro\");",
            "            await ctx.pausa(800);",
            "",
            "            // El modal apilado debe seguir abierto.",
            "            const modal_abierto = await ctx.esta_visible(\"#selector_empresa_micro_viaje\");",
            "            ctx.assert(modal_abierto, \"El modal de agregar micro se cerró pese a que no se eligió nada\");",
            "",
            "            // El toast debe tener el aviso.",
            "            const aviso = await leer_aviso_actual(ctx);",
            "            ctx.assert(",
            "                aviso.toLowerCase().includes(\"empresa\") || aviso.toLowerCase().includes(\"veh\"),",
            "                \"El toast no menciona empresa/vehículo. Aviso actual: '\" + aviso + \"'\"",
            "            );",
            "",
            "            // No debe haberse agregado ningún micro.",
            "            const micros_despues = await ctx.contar(\"#lista_micros_viaje .micro-item\");",
            "            ctx.assert(micros_despues === micros_antes, \"La cantidad de micros cambió: antes=\" + micros_antes + \" despues=\" + micros_despues);",
            "        } finally {",
            "            await cerrar_modal_apilado_si_abierto(ctx);",
            "        }",
            "    }",
            "};",
        ],
    ],

    // --- 23: sin vehículo ---
    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_23_micro_sin_vehiculo.js',
        'descripcion' => 'Prueba 23: elegir empresa, sin vehículo',
        'contenido' => [
            "/**",
            " * Prueba: elegir empresa pero no vehículo, confirmar. El",
            " * frontend debe rechazarlo igual que sin empresa.",
            " *",
            " * @version 1.5plugin.4y",
            " */",
            "",
            'import { CODIGO_DUENO } from "../ConfPlugin.js";',
            'import {',
            '    crear_viaje_de_prueba,',
            '    abrir_detalle_viaje,',
            '    abrir_formulario_agregar_micro,',
            '    cerrar_modal_apilado_si_abierto,',
            '    leer_aviso_actual',
            '} from "./_micros_helpers.js";',
            "",
            "export const prueba = {",
            '    id: "micro_sin_vehiculo",',
            '    nombre: "Micro: elegir empresa pero no vehículo",',
            '    descripcion: "Elegir empresa, dejar el vehículo en blanco, apretar Confirmar. Debe rechazar con aviso y no agregar nada.",',
            "",
            "    async ejecutar(ctx) {",
            "        await ctx.asegurar_login(CODIGO_DUENO);",
            '        await ctx.activar_pestana_piloto("viajes");',
            "        await ctx.esperar(\"#boton_agregar_viaje\", 5000);",
            "",
            "        try {",
            "            const { nombre_viaje } = await crear_viaje_de_prueba(ctx, \"viajeval\");",
            "            await abrir_detalle_viaje(ctx, nombre_viaje);",
            "            await abrir_formulario_agregar_micro(ctx);",
            "",
            "            // Elegir empresa (dispara la carga de vehículos) pero no",
            "            // seleccionar vehículo: dejamos selectedIndex = 0",
            "            // (placeholder).",
            "            const sel_emp = await ctx.seleccionar_indice(\"#selector_empresa_micro_viaje\", 1);",
            "            ctx.assert(sel_emp && sel_emp.exito, \"No se pudo seleccionar empresa\");",
            "",
            "            // Esperar a que se llenen los vehículos (para que el",
            "            // test sea realista).",
            "            let vehiculos = [];",
            "            const inicio = Date.now();",
            "            while (Date.now() - inicio < 8000) {",
            "                vehiculos = await ctx.leer_opciones(\"#selector_vehiculo_micro_viaje\");",
            "                if (Array.isArray(vehiculos) && vehiculos.length >= 2) break;",
            "                await ctx.pausa(300);",
            "            }",
            "            ctx.assert(Array.isArray(vehiculos) && vehiculos.length >= 2, \"No se llenó el select de vehículos\");",
            "",
            "            // Dejar el vehículo en el placeholder (índice 0).",
            "            await ctx.seleccionar_indice(\"#selector_vehiculo_micro_viaje\", 0);",
            "",
            "            const micros_antes = await ctx.contar(\"#lista_micros_viaje .micro-item\");",
            "            await ctx.clic(\"#boton_confirmar_micro\");",
            "            await ctx.pausa(800);",
            "",
            "            const modal_abierto = await ctx.esta_visible(\"#selector_empresa_micro_viaje\");",
            "            ctx.assert(modal_abierto, \"El modal se cerró pese a que no se eligió vehículo\");",
            "",
            "            const aviso = await leer_aviso_actual(ctx);",
            "            ctx.assert(",
            "                aviso.toLowerCase().includes(\"empresa\") || aviso.toLowerCase().includes(\"veh\"),",
            "                \"El toast no menciona empresa/vehículo. Aviso actual: '\" + aviso + \"'\"",
            "            );",
            "",
            "            const micros_despues = await ctx.contar(\"#lista_micros_viaje .micro-item\");",
            "            ctx.assert(micros_despues === micros_antes, \"La cantidad de micros cambió: antes=\" + micros_antes + \" despues=\" + micros_despues);",
            "        } finally {",
            "            await cerrar_modal_apilado_si_abierto(ctx);",
            "        }",
            "    }",
            "};",
        ],
    ],

    // --- 24: monto vacío ---
    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_24_micro_monto_vacio.js',
        'descripcion' => 'Prueba 24: empresa + vehículo, monto vacío',
        'contenido' => [
            "/**",
            " * Prueba: empresa y vehículo elegidos, monto vacío. El",
            " * frontend debe rechazarlo.",
            " *",
            " * @version 1.5plugin.4y",
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
            '    id: "micro_monto_vacio",',
            '    nombre: "Micro: empresa + vehículo, monto vacío",',
            '    descripcion: "Con empresa y vehículo elegidos, dejar el monto vacío y Confirmar. Debe rechazar con aviso.",',
            "",
            "    async ejecutar(ctx) {",
            "        await ctx.asegurar_login(CODIGO_DUENO);",
            '        await ctx.activar_pestana_piloto("viajes");',
            "        await ctx.esperar(\"#boton_agregar_viaje\", 5000);",
            "",
            "        try {",
            "            const { nombre_viaje } = await crear_viaje_de_prueba(ctx, \"viajeval\");",
            "            await abrir_detalle_viaje(ctx, nombre_viaje);",
            "            await abrir_formulario_agregar_micro(ctx);",
            "            await elegir_empresa_y_vehiculo(ctx, 1, 1);",
            "",
            "            // No escribir monto. Confirmar.",
            "            const micros_antes = await ctx.contar(\"#lista_micros_viaje .micro-item\");",
            "            await ctx.clic(\"#boton_confirmar_micro\");",
            "            await ctx.pausa(800);",
            "",
            "            const modal_abierto = await ctx.esta_visible(\"#selector_empresa_micro_viaje\");",
            "            ctx.assert(modal_abierto, \"El modal se cerró pese a que el monto estaba vacío\");",
            "",
            "            const aviso = await leer_aviso_actual(ctx);",
            "            ctx.assert(",
            "                aviso.toLowerCase().includes(\"monto\"),",
            "                \"El toast no menciona el monto. Aviso actual: '\" + aviso + \"'\"",
            "            );",
            "",
            "            const micros_despues = await ctx.contar(\"#lista_micros_viaje .micro-item\");",
            "            ctx.assert(micros_despues === micros_antes, \"La cantidad de micros cambió: antes=\" + micros_antes + \" despues=\" + micros_despues);",
            "        } finally {",
            "            await cerrar_modal_apilado_si_abierto(ctx);",
            "        }",
            "    }",
            "};",
        ],
    ],

    // --- 25: monto negativo ---
    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_25_micro_monto_negativo.js',
        'descripcion' => 'Prueba 25: empresa + vehículo, monto negativo',
        'contenido' => [
            "/**",
            " * Prueba: monto negativo. El frontend debe rechazarlo. Se",
            " * usa ctx.forzar_valor para setear -100 a pesar del",
            " * min=\"0\" del input.",
            " *",
            " * @version 1.5plugin.4y",
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
            '    id: "micro_monto_negativo",',
            '    nombre: "Micro: empresa + vehículo, monto negativo",',
            '    descripcion: "Con empresa y vehículo elegidos, forzar monto -100 y Confirmar. Debe rechazar con aviso.",',
            "",
            "    async ejecutar(ctx) {",
            "        await ctx.asegurar_login(CODIGO_DUENO);",
            '        await ctx.activar_pestana_piloto("viajes");',
            "        await ctx.esperar(\"#boton_agregar_viaje\", 5000);",
            "",
            "        try {",
            "            const { nombre_viaje } = await crear_viaje_de_prueba(ctx, \"viajeval\");",
            "            await abrir_detalle_viaje(ctx, nombre_viaje);",
            "            await abrir_formulario_agregar_micro(ctx);",
            "            await elegir_empresa_y_vehiculo(ctx, 1, 1);",
            "",
            "            // Forzar -100 (el input tiene min=\"0\").",
            "            await ctx.forzar_valor(\"#monto_micro_viaje\", \"-100\");",
            "",
            "            const micros_antes = await ctx.contar(\"#lista_micros_viaje .micro-item\");",
            "            await ctx.clic(\"#boton_confirmar_micro\");",
            "            await ctx.pausa(800);",
            "",
            "            const modal_abierto = await ctx.esta_visible(\"#selector_empresa_micro_viaje\");",
            "            ctx.assert(modal_abierto, \"El modal se cerró pese a que el monto era negativo\");",
            "",
            "            const aviso = await leer_aviso_actual(ctx);",
            "            ctx.assert(",
            "                aviso.toLowerCase().includes(\"monto\"),",
            "                \"El toast no menciona el monto. Aviso actual: '\" + aviso + \"'\"",
            "            );",
            "",
            "            const micros_despues = await ctx.contar(\"#lista_micros_viaje .micro-item\");",
            "            ctx.assert(micros_despues === micros_antes, \"La cantidad de micros cambió: antes=\" + micros_antes + \" despues=\" + micros_despues);",
            "        } finally {",
            "            await cerrar_modal_apilado_si_abierto(ctx);",
            "        }",
            "    }",
            "};",
        ],
    ],

    // --- 26: cancelar ---
    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_26_micro_cancelar.js',
        'descripcion' => 'Prueba 26: cancelar el formulario',
        'contenido' => [
            "/**",
            " * Prueba: con empresa, vehículo y monto cargados, apretar",
            " * Cancelar. El modal debe cerrarse sin agregar nada al viaje.",
            " *",
            " * @version 1.5plugin.4y",
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
            '    id: "micro_cancelar",',
            '    nombre: "Micro: cancelar el formulario",',
            '    descripcion: "Con todos los datos cargados, apretar Cancelar. El modal debe cerrarse sin agregar nada.",',
            "",
            "    async ejecutar(ctx) {",
            "        await ctx.asegurar_login(CODIGO_DUENO);",
            '        await ctx.activar_pestana_piloto("viajes");',
            "        await ctx.esperar(\"#boton_agregar_viaje\", 5000);",
            "",
            "        try {",
            "            const { nombre_viaje } = await crear_viaje_de_prueba(ctx, \"viajeval\");",
            "            await abrir_detalle_viaje(ctx, nombre_viaje);",
            "            await abrir_formulario_agregar_micro(ctx);",
            "            await elegir_empresa_y_vehiculo(ctx, 1, 1);",
            '            await ctx.escribir("#monto_micro_viaje", "500");',
            "",
            "            const micros_antes = await ctx.contar(\"#lista_micros_viaje .micro-item\");",
            "",
            "            // Cancelar.",
            "            await ctx.clic(\"#boton_cancelar_micro\");",
            "            await ctx.pausa(500);",
            "",
            "            // El modal debe haberse cerrado.",
            "            const modal_abierto = await ctx.esta_visible(\"#selector_empresa_micro_viaje\");",
            "            ctx.assert(!modal_abierto, \"El modal de agregar micro sigue abierto después de Cancelar\");",
            "",
            "            // Nada se agregó.",
            "            const micros_despues = await ctx.contar(\"#lista_micros_viaje .micro-item\");",
            "            ctx.assert(micros_despues === micros_antes, \"La cantidad de micros cambió: antes=\" + micros_antes + \" despues=\" + micros_despues);",
            "        } finally {",
            "            await cerrar_modal_apilado_si_abierto(ctx);",
            "        }",
            "    }",
            "};",
        ],
    ],

    // --- 27: mismo vehículo dos veces ---
    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_27_micro_mismo_vehiculo.js',
        'descripcion' => 'Prueba 27: mismo vehículo dos veces (documenta el comportamiento)',
        'contenido' => [
            "/**",
            " * Prueba: agregar dos veces el mismo vehículo al mismo viaje.",
            " *",
            " * DOCUMENTA EL COMPORTAMIENTO ACTUAL del backend:",
            " * `agregar_micro_a_viaje` no rechaza vehículos duplicados en",
            " * el mismo viaje; crea `micro_1` y `micro_2` con copias del",
            " * mismo vehículo. Si en el futuro el backend cambia y los",
            " * rechaza, esta prueba va a fallar y habrá que decidir qué",
            " * hacer (actualizarla o agregar la validación).",
            " *",
            " * @version 1.5plugin.4y",
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
            '    id: "micro_mismo_vehiculo_dos_veces",',
            '    nombre: "Micro: mismo vehículo dos veces (documenta backend)",',
            '    descripcion: "Agrega el mismo vehículo dos veces al mismo viaje. El backend actual lo permite: se crean micro_1 y micro_2. La prueba verifica ese comportamiento. Si el backend cambia a rechazar duplicados, esta prueba falla.",',
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
            "            // Primer alta.",
            "            await abrir_formulario_agregar_micro(ctx);",
            "            const info1 = await elegir_empresa_y_vehiculo(ctx, 1, 1);",
            '            await ctx.escribir("#monto_micro_viaje", "700");',
            "            await ctx.clic(\"#boton_confirmar_micro\");",
            "",
            "            // Esperar a que se agregue (1 .micro-item).",
            "            let items1 = 0;",
            "            const inicio1 = Date.now();",
            "            while (Date.now() - inicio1 < 10000) {",
            "                items1 = await ctx.contar(\"#lista_micros_viaje .micro-item\");",
            "                if (items1 >= 1) break;",
            "                await ctx.pausa(300);",
            "            }",
            "            ctx.assert(items1 === 1, \"Se esperaba 1 micro tras el primer alta, hay \" + items1);",
            "",
            "            // Segundo alta: mismo vehículo.",
            "            await abrir_formulario_agregar_micro(ctx);",
            "            await elegir_empresa_y_vehiculo(ctx, 1, 1);",
            '            await ctx.escribir("#monto_micro_viaje", "700");',
            "            await ctx.clic(\"#boton_confirmar_micro\");",
            "",
            "            // Esperar a que se agregue el segundo (2 .micro-item).",
            "            let items2 = 0;",
            "            const inicio2 = Date.now();",
            "            while (Date.now() - inicio2 < 10000) {",
            "                items2 = await ctx.contar(\"#lista_micros_viaje .micro-item\");",
            "                if (items2 >= 2) break;",
            "                await ctx.pausa(300);",
            "            }",
            "",
            "            ctx.assert(",
            "                items2 === 2,",
            "                \"El backend no permitió el segundo alta con el mismo vehículo (patente \" + info1.patente + \"). Si esto es intencional, actualizar esta prueba. Micros actuales: \" + items2",
            "            );",
            "        } finally {",
            "            await cerrar_modal_apilado_si_abierto(ctx);",
            "        }",
            "    }",
            "};",
        ],
    ],

    // ========================================================
    // servicio.js — nuevos helpers contar y forzar_valor
    // ========================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'servicio: helpers contar y forzar_valor',
        'buscar' => [
            '        leer_opciones: async (selector) => {',
        ],
        'reemplazar' => [
            '        contar: async (selector) => {',
            '            // Cuenta cuántos elementos matchean el selector. Se usa',
            '            // para verificar listas (por ejemplo, cantidad de',
            '            // .micro-item en #lista_micros_viaje).',
            '            try {',
            '                const r = await chrome.scripting.executeScript({',
            '                    target: { tabId: pestana_id },',
            '                    world: "MAIN",',
            '                    func: (sel) => {',
            '                        return document.querySelectorAll(sel).length;',
            '                    },',
            '                    args: [selector]',
            '                });',
            '                return (r && r[0] && typeof r[0].result === "number") ? r[0].result : 0;',
            '            } catch (e) {',
            '                return 0;',
            '            }',
            '        },',
            '        forzar_valor: async (selector, valor) => {',
            '            // Setea el value de un input/select y dispara input +',
            '            // change. Necesario para forzar valores que el input',
            '            // rechazaría por sus restricciones (por ejemplo, monto',
            '            // negativo en un input con min="0").',
            '            try {',
            '                const r = await chrome.scripting.executeScript({',
            '                    target: { tabId: pestana_id },',
            '                    world: "MAIN",',
            '                    func: (sel, val) => {',
            '                        const el = document.querySelector(sel);',
            '                        if (!el) return { exito: false, error: "no existe " + sel };',
            '                        el.value = val;',
            '                        el.dispatchEvent(new Event("input", { bubbles: true }));',
            '                        el.dispatchEvent(new Event("change", { bubbles: true }));',
            '                        return { exito: true, valor: el.value };',
            '                    },',
            '                    args: [selector, valor]',
            '                });',
            '                return (r && r[0] && r[0].result) ? r[0].result : { exito: false, error: "sin resultado" };',
            '            } catch (e) {',
            '                return { exito: false, error: e.message };',
            '            }',
            '        },',
            '        leer_opciones: async (selector) => {',
        ],
    ],

    // --------------------------------------------------------
    // servicio.js — bump de version
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'servicio: bump @version a 1.5plugin.4y',
        'buscar' => [
            ' * @version 1.5plugin.4x',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4y',
        ],
    ],

    // ========================================================
    // catalogo.js — imports de las 6 pruebas nuevas
    // ========================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'catalogo: imports de las pruebas 22-27',
        'buscar' => [
            'import { prueba as alta_micro } from "./prueba_21_alta_micro.js";',
        ],
        'reemplazar' => [
            'import { prueba as alta_micro } from "./prueba_21_alta_micro.js";',
            'import { prueba as micro_sin_empresa } from "./prueba_22_micro_sin_empresa.js";',
            'import { prueba as micro_sin_vehiculo } from "./prueba_23_micro_sin_vehiculo.js";',
            'import { prueba as micro_monto_vacio } from "./prueba_24_micro_monto_vacio.js";',
            'import { prueba as micro_monto_negativo } from "./prueba_25_micro_monto_negativo.js";',
            'import { prueba as micro_cancelar } from "./prueba_26_micro_cancelar.js";',
            'import { prueba as micro_mismo_vehiculo_dos_veces } from "./prueba_27_micro_mismo_vehiculo.js";',
        ],
    ],

    // ========================================================
    // catalogo.js — sección Micros ampliada
    // ========================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'catalogo: seccion Micros ampliada con 7 pruebas',
        'buscar' => [
            '    {',
            '        id: "micros",',
            '        nombre: "Micros",',
            '        pruebas: [',
            '            alta_micro',
            '        ]',
            '    },',
        ],
        'reemplazar' => [
            '    {',
            '        id: "micros",',
            '        nombre: "Micros",',
            '        pruebas: [',
            '            alta_micro,',
            '            micro_sin_empresa,',
            '            micro_sin_vehiculo,',
            '            micro_monto_vacio,',
            '            micro_monto_negativo,',
            '            micro_cancelar,',
            '            micro_mismo_vehiculo_dos_veces',
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
        'descripcion' => 'catalogo: bump @version a 1.5plugin.4y',
        'buscar' => [
            ' * @version 1.5plugin.4x',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4y',
        ],
    ],

    // ========================================================
    // ConfPlugin.js — bumps
    // ========================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'ConfPlugin: bump VERSION_APP a 1.5plugin.4y',
        'buscar' => [
            '    Conf.NOMBRE_APP = "IteradoresPluginPruebas";',
            '    Conf.VERSION_APP = "1.5plugin.4x";',
        ],
        'reemplazar' => [
            '    Conf.NOMBRE_APP = "IteradoresPluginPruebas";',
            '    Conf.VERSION_APP = "1.5plugin.4y";',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'ConfPlugin: bump VERSION_PLUGIN a 1.5plugin.4y',
        'buscar' => [
            'export const VERSION_PLUGIN = "1.5plugin.4x";',
        ],
        'reemplazar' => [
            'export const VERSION_PLUGIN = "1.5plugin.4y";',
        ],
    ],

    // ========================================================
    // prompt_plugin_piloto.md — §7
    // ========================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt: §7 bump a 4y con 27 pruebas',
        'buscar' => [
            '**Proyecto en v1.5plugin.4x.** El esqueleto del plugin está',
            'armado y funcional, tiene 21 pruebas (base + autocompletado',
            '+ puntos de venta + viajes + micros + ventas) y las agrupa',
            'en secciones.',
        ],
        'reemplazar' => [
            '**Proyecto en v1.5plugin.4y.** El esqueleto del plugin está',
            'armado y funcional, tiene 27 pruebas (base + autocompletado',
            '+ puntos de venta + viajes + micros + ventas) y las agrupa',
            'en secciones.',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt: §7 actualizar seccion Micros',
        'buscar' => [
            '- `micros`: `alta_micro`.',
        ],
        'reemplazar' => [
            '- `micros`: 7 pruebas. `alta_micro` (flujo feliz) más',
            '  validaciones: `micro_sin_empresa`, `micro_sin_vehiculo`,',
            '  `micro_monto_vacio`, `micro_monto_negativo`,',
            '  `micro_cancelar`, `micro_mismo_vehiculo_dos_veces`.',
        ],
    ],

    // ========================================================
    // prompt_plugin_piloto.md — §8.8 aprendizajes 36 y 37
    // ========================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt: §8.8 agregar aprendizajes 36 y 37',
        'buscar' => [
            '35. **Las pruebas con dependencias encadenadas hacen su',
            '    propio setup.** `alta_micro` necesita un viaje',
            '    existente; `alta_viaje` ya crea uno, pero no queremos',
            '    acoplar las pruebas entre sí. La prueba autocontenida',
            '    crea el viaje, le agrega el micro y verifica. Ventaja:',
            '    se puede correr sola, en cualquier orden. Desventaja:',
            '    cada corrida deja más basura (viajes huérfanos). Se',
            '    mitiga con prefijos distinguibles (`viajemicro` vs',
            '    `viajeprueba`) para limpiar por tipo cuando moleste.',
        ],
        'reemplazar' => [
            '35. **Las pruebas con dependencias encadenadas hacen su',
            '    propio setup.** `alta_micro` necesita un viaje',
            '    existente; `alta_viaje` ya crea uno, pero no queremos',
            '    acoplar las pruebas entre sí. La prueba autocontenida',
            '    crea el viaje, le agrega el micro y verifica. Ventaja:',
            '    se puede correr sola, en cualquier orden. Desventaja:',
            '    cada corrida deja más basura (viajes huérfanos). Se',
            '    mitiga con prefijos distinguibles (`viajemicro` vs',
            '    `viajeprueba`) para limpiar por tipo cuando moleste.',
            '36. **Cuando 3+ pruebas comparten pasos de setup, extraer a',
            '    un archivo de helpers.** El archivo va con prefijo `_`',
            '    (`_micros_helpers.js`) para distinguirlo de las',
            '    pruebas. Los helpers lanzan `Error` (no `ctx.assert`)',
            '    cuando fallan, así la prueba que los usa aborta con',
            '    mensaje claro. Los helpers NO importan nada de otras',
            '    pruebas, solo usan `ctx`.',
            '37. **Documentar el comportamiento del backend con pruebas',
            '    también es útil.** `micro_mismo_vehiculo_dos_veces`',
            '    verifica que el backend actual PERMITE duplicados. Si',
            '    en el futuro el backend cambia a rechazarlos, la prueba',
            '    falla y hay que decidir: actualizar la prueba o revertir',
            '    el cambio. La prueba no es un contrato inmutable; es una',
            '    foto del comportamiento observado, con un comentario',
            '    que lo aclara.',
        ],
    ],

    // ========================================================
    // prompt_plugin_piloto.md — §9 cabecera
    // ========================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt: §9 cabecera bump a 4y',
        'buscar' => [
            '**Última actualización de este prompt:** v1.5plugin.4x (nueva',
            'prueba `alta_micro`: crea un viaje de setup, le agrega un',
            'micro (empresa + vehículo + monto) y verifica. Nueva',
            'sección "Micros" en la ventana. Se agregan los helpers',
            '`ctx.leer_opciones(sel)` y `ctx.seleccionar_indice(sel,',
            'idx)` para interactuar con `<select>`. Nuevos aprendizajes',
            '34 y 35).',
        ],
        'reemplazar' => [
            '**Última actualización de este prompt:** v1.5plugin.4y (seis',
            'pruebas nuevas de validación del alta de micro: sin',
            'empresa, sin vehículo, monto vacío, monto negativo,',
            'cancelar y mismo vehículo dos veces. Nuevo archivo',
            '`_micros_helpers.js` con las funciones de setup compartidas;',
            '`alta_micro` refactorizada para usarlas. Se agregan los',
            'helpers `ctx.contar(sel)` y `ctx.forzar_valor(sel, valor)`',
            'al service worker. Nuevos aprendizajes 36 y 37).',
            'Antes: v1.5plugin.4x (nueva',
            'prueba `alta_micro`: crea un viaje de setup, le agrega un',
            'micro (empresa + vehículo + monto) y verifica. Nueva',
            'sección "Micros" en la ventana. Se agregan los helpers',
            '`ctx.leer_opciones(sel)` y `ctx.seleccionar_indice(sel,',
            'idx)` para interactuar con `<select>`. Nuevos aprendizajes',
            '34 y 35).',
        ],
    ],

    // ========================================================
    // prompt_plugin_piloto.md — §9 estado de la conversación
    // ========================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt: §9 agregar entrada de la tanda 4y',
        'buscar' => [
            '- El plugin tiene 21 pruebas que corren OK contra el piloto',
            '  PHP. Las más recientes son `autocompletado_dni_terminal_clientes`',
            '  (v1.5plugin.4p); `alta_terminal` (v1.5plugin.4v);',
            '  `alta_viaje` (v1.5plugin.4w); y `alta_micro` (v1.5plugin.4x),',
            '  que crea un viaje de setup y le agrega un micro.',
        ],
        'reemplazar' => [
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