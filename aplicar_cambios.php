<?php
/**
 * Aplicador — Tanda X (bis): 3 pruebas del plugin + docs.
 *
 * Uso (raíz de iteradoresJS/): php aplicar_cambios.php
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;
$version_nueva = '1.5plugin.8f';
$htmls_a_bumpear = [];

$cambios = [
    // ============================================================
    // A) ConfiguracionApli.js: bump VERSION_APP y VERSION_PLUGIN.
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfiguracionApli.js',
        'descripcion' => 'Bump VERSION_APP a 1.5plugin.8f',
        'buscar' => ['export const VERSION_APP = "1.5plugin.8e";'],
        'reemplazar' => ['export const VERSION_APP = "1.5plugin.8f";'],
    ],
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfiguracionApli.js',
        'descripcion' => 'Bump VERSION_PLUGIN a 1.5plugin.8f',
        'buscar' => ['export const VERSION_PLUGIN = "1.5plugin.8e";'],
        'reemplazar' => ['export const VERSION_PLUGIN = "1.5plugin.8f";'],
    ],

    // ============================================================
    // B) Helper compartido (nuevo).
    // ============================================================
    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/_rendiciones_liquidaciones_helpers.js',
        'descripcion' => 'Helper de rendiciones/liquidaciones',
        'contenido' => [
            '/**',
            ' * Helpers compartidos por las pruebas del detalle de',
            ' * rendiciones y liquidaciones.',
            ' *',
            ' * Las pruebas de estas secciones ejecutan el flujo real',
            ' * del usuario: login, ir a la pestaña, elegir un dueño',
            ' * en el select, esperar a que la tabla cargue, hacer clic',
            ' * en "Ver detalle" y verificar que el modal se abre con',
            ' * contenido. No alcanza con un POST al backend: el bug',
            ' * v81i (frontend no mandaba `nombre_dueno` en el POST)',
            ' * solo se detecta con el flujo completo.',
            ' *',
            ' * @version 1.5plugin.8f',
            ' * @since 1.5plugin.8f',
            ' */',
            '',
            'import { CODIGO_SOPORTE } from "../ConfiguracionApli.js";',
            '',
            '/**',
            ' * Login como soporte.',
            ' *',
            ' * @param {Object} ctx',
            ' * @returns {Promise<void>}',
            ' */',
            'export async function login_soporte(ctx) {',
            '    await ctx.asegurar_login(CODIGO_SOPORTE);',
            '}',
            '',
            '/**',
            ' * Espera a que el select de dueño tenga más de una opción',
            ' * (la opción 0 es "Seleccione dueño..."). Devuelve true',
            ' * si tiene al menos un dueño real.',
            ' *',
            ' * @param {Object} ctx',
            ' * @param {string} selector',
            ' * @param {number} [timeout_ms=8000]',
            ' * @returns {Promise<boolean>}',
            ' */',
            'export async function esperar_opciones_dueno(ctx, selector, timeout_ms = 8000) {',
            '    const inicio = Date.now();',
            '    while (Date.now() - inicio < timeout_ms) {',
            '        const opciones = await ctx.leer_opciones(selector);',
            '        if (opciones.length > 1) return true;',
            '        await ctx.pausa(200);',
            '    }',
            '    return false;',
            '}',
            '',
            '/**',
            ' * Espera a que la tabla tenga al menos un botón de',
            ' * detalle, o a que el contenedor muestre el mensaje',
            ' * "Sin ... registradas". Devuelve:',
            ' *   { hay: true,  cantidad: N }   → hay datos.',
            ' *   { hay: false, cantidad: 0 }   → no hay datos.',
            ' *',
            ' * @param {Object} ctx',
            ' * @param {string} selector_boton',
            ' * @param {string} selector_vacio',
            ' * @param {number} [timeout_ms=20000]',
            ' * @returns {Promise<{hay: boolean, cantidad: number}>}',
            ' */',
            'export async function esperar_detalle_o_vacio(ctx, selector_boton, selector_vacio, timeout_ms = 20000) {',
            '    const inicio = Date.now();',
            '    while (Date.now() - inicio < timeout_ms) {',
            '        const cantidad = await ctx.contar(selector_boton);',
            '        if (cantidad > 0) return { hay: true, cantidad };',
            '        const texto = await ctx.texto(selector_vacio);',
            '        if (texto && /sin .* registrad/i.test(texto)) {',
            '            return { hay: false, cantidad: 0 };',
            '        }',
            '        await ctx.pausa(300);',
            '    }',
            '    return { hay: false, cantidad: 0 };',
            '}',
            '',
            '/**',
            ' * Hace clic en el primer botón "Ver detalle" de la tabla,',
            ' * espera a que se abra el modal genérico, y verifica que',
            ' * el contenido no esté vacío y contenga una palabra',
            ' * esperada ("Rendición" o "Liquidación").',
            ' *',
            ' * @param {Object} ctx',
            ' * @param {string} selector_boton',
            ' * @param {string} palabra_esperada',
            ' * @returns {Promise<string>}',
            ' */',
            'export async function abrir_primer_detalle(ctx, selector_boton, palabra_esperada) {',
            '    const btn = await ctx.esperar_visible(selector_boton, 5000);',
            '    if (!btn || !btn.exito) {',
            '        throw new Error("No apareció el botón " + selector_boton);',
            '    }',
            '    await ctx.clic(selector_boton);',
            '',
            '    const modal = await ctx.esperar_visible("#modal_generico", 8000);',
            '    if (!modal || !modal.exito) {',
            '        throw new Error("No se abrió el modal del detalle (" + palabra_esperada + ")");',
            '    }',
            '',
            '    const inicio = Date.now();',
            '    let contenido = null;',
            '    while (Date.now() - inicio < 5000) {',
            '        contenido = await ctx.texto("#modal_generico_contenido");',
            '        if (contenido && contenido.trim().length > 0) break;',
            '        await ctx.pausa(200);',
            '    }',
            '    if (!contenido || contenido.trim().length === 0) {',
            '        throw new Error("El modal se abrió pero el contenido está vacío");',
            '    }',
            '    if (contenido.indexOf(palabra_esperada) === -1) {',
            '        throw new Error(',
            '            "El modal no contiene la palabra \\"" + palabra_esperada + "\\". "',
            '            + "Primeros 200 chars: " + contenido.slice(0, 200)',
            '        );',
            '    }',
            '    return contenido;',
            '}',
        ],
    ],

    // ============================================================
    // C) Prueba 67: rendición detalle soporte.
    // ============================================================
    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_67_rendicion_detalle_soporte.js',
        'descripcion' => 'Prueba 67: rendición detalle soporte',
        'contenido' => [
            '/**',
            ' * Prueba: el detalle de una rendición se abre para el',
            ' * usuario soporte.',
            ' *',
            ' * Verifica el fix v81i: el frontend no mandaba',
            ' * `nombre_dueno` en el POST `rendiciones/obtener`, y el',
            ' * backend (carga parcial del soporte sin `usuarios`) no',
            ' * encontraba la rendición. Síntoma: "Rendición no',
            ' * encontrada" al hacer click en "Ver detalle".',
            ' *',
            ' * Flujo real del usuario:',
            ' *   1. Login soporte.',
            ' *   2. Ir a la pestaña Rendiciones.',
            ' *   3. Elegir un dueño en el select.',
            ' *   4. Esperar a que la tabla cargue.',
            ' *   5. Click en "Ver detalle" del primer resultado.',
            ' *   6. Verificar que el modal se abre con contenido.',
            ' *   7. Cerrar el modal.',
            ' *',
            ' * Precondición: el dueño elegido debe tener al menos',
            ' * una rendición creada. Si no, la prueba pasa con',
            ' * console.warn (lección 38 del prompt del plugin).',
            ' *',
            ' * @version 1.5plugin.8f',
            ' * @since 1.5plugin.8f',
            ' */',
            '',
            'import {',
            '    login_soporte,',
            '    esperar_opciones_dueno,',
            '    esperar_detalle_o_vacio,',
            '    abrir_primer_detalle',
            '} from "./_rendiciones_liquidaciones_helpers.js";',
            'import { cerrar_modales_si_abiertos, ir_a_tab } from "./_helpers.js";',
            '',
            'export const prueba = {',
            '    id: "rendicion_detalle_soporte",',
            '    nombre: "Rendiciones: detalle se abre para soporte",',
            '    descripcion: "Login soporte, pestaña Rendiciones, elegir un dueño, click en Ver detalle. Verifica que el modal se abre con contenido (fix v81i).",',
            '    async ejecutar(ctx) {',
            '        await cerrar_modales_si_abiertos(ctx);',
            '        await login_soporte(ctx);',
            '        await ir_a_tab(ctx, "rendiciones");',
            '',
            '        const hay_duenos = await esperar_opciones_dueno(ctx, "#selector_dueno_rendiciones", 8000);',
            '        if (!hay_duenos) {',
            '            console.warn("[P67] El soporte no tiene dueños asignados; se omite.");',
            '            return;',
            '        }',
            '',
            '        const r_sel = await ctx.seleccionar_indice("#selector_dueno_rendiciones", 1);',
            '        if (!r_sel || !r_sel.exito) {',
            '            throw new Error("No se pudo elegir un dueño en el select de Rendiciones");',
            '        }',
            '',
            '        const r_tabla = await esperar_detalle_o_vacio(',
            '            ctx, ".ver_detalle_rendicion",',
            '            "#tabla_rendiciones_container", 20000',
            '        );',
            '        if (!r_tabla.hay) {',
            '            console.warn("[P67] El dueño " + r_sel.texto + " no tiene rendiciones; se omite.");',
            '            return;',
            '        }',
            '',
            '        const contenido = await abrir_primer_detalle(ctx, ".ver_detalle_rendicion", "Rendición");',
            '        ctx.assert(contenido.length > 0, "Contenido del modal vacío");',
            '',
            '        await ctx.clic("#cerrar_modal_generico");',
            '        await ctx.pausa(300);',
            '    }',
            '};',
        ],
    ],

    // ============================================================
    // D) Prueba 68: liquidación detalle soporte.
    // ============================================================
    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_68_liquidacion_detalle_soporte.js',
        'descripcion' => 'Prueba 68: liquidación detalle soporte',
        'contenido' => [
            '/**',
            ' * Prueba: el detalle de una liquidación se abre para el',
            ' * usuario soporte. Espejo de la prueba 67.',
            ' *',
            ' * Cubre el fix v81i en `liquidaciones/obtener`.',
            ' *',
            ' * @version 1.5plugin.8f',
            ' * @since 1.5plugin.8f',
            ' */',
            '',
            'import {',
            '    login_soporte,',
            '    esperar_opciones_dueno,',
            '    esperar_detalle_o_vacio,',
            '    abrir_primer_detalle',
            '} from "./_rendiciones_liquidaciones_helpers.js";',
            'import { cerrar_modales_si_abiertos, ir_a_tab } from "./_helpers.js";',
            '',
            'export const prueba = {',
            '    id: "liquidacion_detalle_soporte",',
            '    nombre: "Liquidaciones: detalle se abre para soporte",',
            '    descripcion: "Login soporte, pestaña Liquidaciones, elegir un dueño, click en Ver detalle. Verifica que el modal se abre con contenido (fix v81i).",',
            '    async ejecutar(ctx) {',
            '        await cerrar_modales_si_abiertos(ctx);',
            '        await login_soporte(ctx);',
            '        await ir_a_tab(ctx, "liquidaciones");',
            '',
            '        const hay_duenos = await esperar_opciones_dueno(ctx, "#selector_dueno_liquidaciones", 8000);',
            '        if (!hay_duenos) {',
            '            console.warn("[P68] El soporte no tiene dueños asignados; se omite.");',
            '            return;',
            '        }',
            '',
            '        const r_sel = await ctx.seleccionar_indice("#selector_dueno_liquidaciones", 1);',
            '        if (!r_sel || !r_sel.exito) {',
            '            throw new Error("No se pudo elegir un dueño en el select de Liquidaciones");',
            '        }',
            '',
            '        const r_tabla = await esperar_detalle_o_vacio(',
            '            ctx, ".ver_detalle_liquidacion",',
            '            "#tabla_liquidaciones_container", 20000',
            '        );',
            '        if (!r_tabla.hay) {',
            '            console.warn("[P68] El dueño " + r_sel.texto + " no tiene liquidaciones; se omite.");',
            '            return;',
            '        }',
            '',
            '        const contenido = await abrir_primer_detalle(ctx, ".ver_detalle_liquidacion", "Liquidación");',
            '        ctx.assert(contenido.length > 0, "Contenido del modal vacío");',
            '',
            '        await ctx.clic("#cerrar_modal_generico");',
            '        await ctx.pausa(300);',
            '    }',
            '};',
        ],
    ],

    // ============================================================
    // E) Prueba 69: rendición detalle dueño (regresión).
    // ============================================================
    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_69_rendicion_detalle_dueno.js',
        'descripcion' => 'Prueba 69: rendición detalle dueño (regresión)',
        'contenido' => [
            '/**',
            ' * Prueba: el detalle de una rendición se abre para el',
            ' * dueño (regresión).',
            ' *',
            ' * Con dueño, el backend devolvía el nombre del solicitante',
            ' * solo (`_nombre_dueno_solicitante` rama nivel=dueno), así',
            ' * que el bug v81i no se manifestaba. Esta prueba verifica',
            ' * que el flujo del dueño sigue funcionando tras el fix.',
            ' *',
            ' * @version 1.5plugin.8f',
            ' * @since 1.5plugin.8f',
            ' */',
            '',
            'import { CODIGO_DUENO } from "../ConfiguracionApli.js";',
            'import {',
            '    esperar_detalle_o_vacio,',
            '    abrir_primer_detalle',
            '} from "./_rendiciones_liquidaciones_helpers.js";',
            'import { cerrar_modales_si_abiertos, ir_a_tab } from "./_helpers.js";',
            '',
            'export const prueba = {',
            '    id: "rendicion_detalle_dueno",',
            '    nombre: "Rendiciones: detalle se abre para el dueño",',
            '    descripcion: "Regresión tras el fix v81i: login dueño, pestaña Rendiciones, click en Ver detalle. Verifica que el modal se abre con contenido.",',
            '    async ejecutar(ctx) {',
            '        await cerrar_modales_si_abiertos(ctx);',
            '        await ctx.asegurar_login(CODIGO_DUENO);',
            '        await ir_a_tab(ctx, "rendiciones");',
            '',
            '        const r_tabla = await esperar_detalle_o_vacio(',
            '            ctx, ".ver_detalle_rendicion",',
            '            "#tabla_rendiciones_container", 20000',
            '        );',
            '        if (!r_tabla.hay) {',
            '            console.warn("[P69] El dueño no tiene rendiciones; se omite.");',
            '            return;',
            '        }',
            '',
            '        const contenido = await abrir_primer_detalle(ctx, ".ver_detalle_rendicion", "Rendición");',
            '        ctx.assert(contenido.length > 0, "Contenido del modal vacío");',
            '',
            '        await ctx.clic("#cerrar_modal_generico");',
            '        await ctx.pausa(300);',
            '    }',
            '};',
        ],
    ],

    // ============================================================
    // F) catalogo.js: imports de las 3 pruebas nuevas.
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'catalogo.js: imports de las 3 pruebas nuevas',
        'buscar' => [
            '// === Grafo ===',
            'import { prueba as eliminar_huerfanos_limpia_grafo } from "./prueba_56_eliminar_huerfanos_limpia_grafo.js";',
            'import { prueba as enlace_dueno_apunta_al_compartido } from "./prueba_57_enlace_dueno_apunta_al_compartido.js";',
        ],
        'reemplazar' => [
            '// === Grafo ===',
            'import { prueba as eliminar_huerfanos_limpia_grafo } from "./prueba_56_eliminar_huerfanos_limpia_grafo.js";',
            'import { prueba as enlace_dueno_apunta_al_compartido } from "./prueba_57_enlace_dueno_apunta_al_compartido.js";',
            '',
            '// === Rendiciones / Liquidaciones (v1.5plugin.8f) ===',
            'import { prueba as rendicion_detalle_soporte } from "./prueba_67_rendicion_detalle_soporte.js";',
            'import { prueba as liquidacion_detalle_soporte } from "./prueba_68_liquidacion_detalle_soporte.js";',
            'import { prueba as rendicion_detalle_dueno } from "./prueba_69_rendicion_detalle_dueno.js";',
        ],
    ],

    // ============================================================
    // G) catalogo.js: secciones rendiciones/liquidaciones con pruebas.
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'catalogo.js: secciones rendiciones/liquidaciones con pruebas',
        'buscar' => [
            '    {',
            '        id: "rendiciones",',
            '        nombre: "Rendiciones",',
            '        limpieza: [],',
            '        grupos: []',
            '    },',
            '    {',
            '        id: "liquidaciones",',
            '        nombre: "Liquidaciones",',
            '        limpieza: [],',
            '        grupos: []',
            '    },',
        ],
        'reemplazar' => [
            '    {',
            '        id: "rendiciones",',
            '        nombre: "Rendiciones",',
            '        limpieza: [],',
            '        grupos: [',
            '            {',
            '                id: "soporte",',
            '                nombre: "Soporte",',
            '                pruebas: [rendicion_detalle_soporte]',
            '            },',
            '            {',
            '                id: "dueno",',
            '                nombre: "Dueño",',
            '                pruebas: [rendicion_detalle_dueno]',
            '            }',
            '        ]',
            '    },',
            '    {',
            '        id: "liquidaciones",',
            '        nombre: "Liquidaciones",',
            '        limpieza: [],',
            '        grupos: [',
            '            {',
            '                id: "soporte",',
            '                nombre: "Soporte",',
            '                pruebas: [liquidacion_detalle_soporte]',
            '            }',
            '        ]',
            '    },',
        ],
    ],

    // ============================================================
    // H) catalogo.js: bump @version.
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'Bump @version de catalogo.js',
        'buscar' => [' * @version 1.5plugin.7w'],
        'reemplazar' => [' * @version 1.5plugin.8f'],
    ],

    // ============================================================
    // I) prompt_plugin_piloto.md §7: sumar rendiciones/liquidaciones.
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => '§7: secciones rendiciones/liquidaciones',
        'buscar' => [
            '  Las pruebas de la Fase 2 miden nodos con',
            '  `grafo/resumen` antes y después. Las de la Fase B2.4',
            '  navegan desde la raíz y comparan listados.',
            '',
            '---',
            '',
            '## 8. LECCIONES APRENDIDAS A LA FUERZA',
        ],
        'reemplazar' => [
            '  Las pruebas de la Fase 2 miden nodos con',
            '  `grafo/resumen` antes y después. Las de la Fase B2.4',
            '  navegan desde la raíz y comparan listados.',
            '- `rendiciones`: 2 pruebas (v1.5plugin.8f).',
            '  `rendicion_detalle_soporte`: login soporte, pestaña',
            '  Rendiciones, elegir dueño, click en "Ver detalle",',
            '  verificar modal. `rendicion_detalle_dueno`: regresión,',
            '  login dueño, click en "Ver detalle". Cubren el fix',
            '  v81i del piloto: el frontend no mandaba',
            '  `nombre_dueno` en `rendiciones/obtener` y el soporte',
            '  (carga parcial sin `usuarios`) recibía "Rendición no',
            '  encontrada". Si el dueño no tiene rendiciones, pasan',
            '  con `console.warn`.',
            '- `liquidaciones`: 1 prueba (v1.5plugin.8f).',
            '  `liquidacion_detalle_soporte`: espejo de la de',
            '  rendiciones con `liquidaciones/obtener`.',
            '',
            '---',
            '',
            '## 8. LECCIONES APRENDIDAS A LA FUERZA',
        ],
    ],

    // ============================================================
    // J) prompt_plugin_piloto.md §8: lección 67.
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => '§8: lección 67 (probar el flujo del usuario)',
        'buscar' => [
            '66. **Para configurar el framework antes de que un',
            '    módulo se auto-inicialice, usar un módulo separado',
            '    con la configuración como efecto de lado, importado',
            '    ANTES del módulo que la consume.** Los imports ES',
            '    se evalúan depth-first en orden de aparición.',
            '    Implementado en v8d con `arranque_config.js`.',
            '',
            '---',
            '',
            '## 10. REGLAS DE TRABAJO',
        ],
        'reemplazar' => [
            '66. **Para configurar el framework antes de que un',
            '    módulo se auto-inicialice, usar un módulo separado',
            '    con la configuración como efecto de lado, importado',
            '    ANTES del módulo que la consume.** Los imports ES',
            '    se evalúan depth-first en orden de aparición.',
            '    Implementado en v8d con `arranque_config.js`.',
            '',
            '67. **El flujo del usuario incluye el frontend, no',
            '    solo el backend.** Un POST directo al backend puede',
            '    pasar aunque el flujo real del usuario esté roto: si',
            '    el frontend no manda los parámetros que el backend',
            '    espera, el usuario ve un error aunque el endpoint',
            '    funcione con los parámetros correctos. Caso real',
            '    v81i: los POST `rendiciones/obtener`,',
            '    `rendiciones/aceptar_ajuste` y',
            '    `liquidaciones/obtener` existían y funcionaban si',
            '    se les pasaba `nombre_dueno`, pero el frontend del',
            '    piloto no lo mandaba, y el soporte veía "no',
            '    encontrada". Un test que solo hace POST al backend',
            '    con el parámetro correcto NO detecta el bug.',
            '    **Regla: las pruebas que verifican flujos del',
            '    usuario deben hacer el click del usuario** (botón',
            '    "Ver detalle"), no solo el POST. Verificar el',
            '    efecto en el DOM (modal abierto con contenido) es',
            '    parte del contrato.',
            '',
            '---',
            '',
            '## 10. REGLAS DE TRABAJO',
        ],
    ],

    // ============================================================
    // K) prompt_plugin_piloto.md §9: cabecera v8h.
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => '§9: cabecera v8h',
        'buscar' => [
            '## 9. DISCUSIÓN ACTUAL',
            '',
            '**Última actualización de este prompt:** v1.5plugin.8g.',
            'Cierre de la línea del grafo del plugin.',
        ],
        'reemplazar' => [
            '## 9. DISCUSIÓN ACTUAL',
            '',
            '**Última actualización de este prompt:** v1.5plugin.8h.',
            'Cierre de la línea del grafo del plugin + 3 pruebas',
            'nuevas de rendiciones/liquidaciones (v8h).',
        ],
    ],

    // ============================================================
    // L) prompt_plugin_piloto.md §9: bloque de cierre v8h.
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => '§9: cierre v8h',
        'buscar' => [
            '- **v8g** — Cierre de la línea.',
            '',
            '**Lecciones nuevas:** ver §8, items 64-66.',
        ],
        'reemplazar' => [
            '- **v8g** — Cierre de la línea.',
            '',
            '**Cierre de v8h — 3 pruebas del arco de los módulos',
            'menores:**',
            '',
            '- **Prueba 67** `rendicion_detalle_soporte`: login',
            '  soporte, pestaña Rendiciones, elegir dueño, click',
            '  en "Ver detalle", verificar modal. Cubre el fix',
            '  v81i del piloto (el frontend no mandaba',
            '  `nombre_dueno` en `rendiciones/obtener`).',
            '- **Prueba 68** `liquidacion_detalle_soporte`: idem',
            '  con Liquidaciones.',
            '- **Prueba 69** `rendicion_detalle_dueno`: regresión,',
            '  login dueño, click en "Ver detalle".',
            '- **Nuevo helper** `_rendiciones_liquidaciones_helpers.js`:',
            '  `login_soporte`, `esperar_opciones_dueno`,',
            '  `esperar_detalle_o_vacio`, `abrir_primer_detalle`.',
            '- **`catalogo.js`**: secciones `rendiciones` (grupos',
            '  soporte + dueño) y `liquidaciones` (grupo soporte)',
            '  llenas. Antes estaban vacías desde v7s.',
            '',
            '**Lecciones nuevas:** ver §8, items 64-67.',
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
$archivos_bump_js_css = [];
foreach ($archivos_a_escribir as $ruta_abs => $info) {
    $rel = substr($ruta_abs, strlen($raiz_proyecto) + 1);
    $ext = strtolower(pathinfo($ruta_abs, PATHINFO_EXTENSION));
    if ($ext === 'php' || $ext === 'js') $archivos_bump_php_js[] = $rel;
    if ($ext === 'js' || $ext === 'css') $archivos_bump_js_css[] = $rel;
}
foreach ($creaciones as $cr) {
    $ext = strtolower(pathinfo($cr['archivo'], PATHINFO_EXTENSION));
    if ($ext === 'php' || $ext === 'js') $archivos_bump_php_js[] = $cr['archivo'];
    if ($ext === 'js' || $ext === 'css') $archivos_bump_js_css[] = $cr['archivo'];
}

$bumps_atversion = 0;
$bumps_qv = 0;
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
        $bumps_detalle[] = "$archivo_rel  @version $viejo → $version_nueva";
    }

    foreach ($htmls_a_bumpear as $html_rel) {
        $html_abs = $raiz_proyecto . '/' . $html_rel;
        if (!file_exists($html_abs)) { $info_bumps[] = "$html_rel (no encontrado)"; continue; }
        if (isset($archivos_a_escribir[$html_abs])) {
            list($html, $eol) = $archivos_a_escribir[$html_abs];
        } else {
            $html_orig = file_get_contents($html_abs);
            $eol = detectar_eol($html_orig);
            $html = normalizar_a_unix($html_orig);
        }
        $html_antes = $html;
        foreach (array_unique($archivos_bump_js_css) as $archivo_rel) {
            $base = basename($archivo_rel);
            $base_esc = preg_quote($base, '/');
            $patron = '/(' . $base_esc . '\?v=)([^"\'\s>]+)/';
            $viejo_qv = '';
            $html = preg_replace_callback($patron, function($m) use ($version_nueva, &$viejo_qv) {
                $viejo_qv = $m[2];
                return $m[1] . $version_nueva;
            }, $html, 1, $c_qv);
            if ($c_qv > 0 && $viejo_qv !== $version_nueva) {
                $bumps_qv++;
                $bumps_detalle[] = "$html_rel  $base ?v= $viejo_qv → $version_nueva";
            }
        }
        if ($html !== $html_antes) {
            $archivos_a_escribir[$html_abs] = [normalizar_a_unix($html), $eol];
        }
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
    if (!file_exists($ruta_abs)) { echo "[INFO] " . $elim['archivo'] . " no existía.\n"; continue; }
    if (unlink($ruta_abs)) echo "[OK] " . $elim['archivo'] . " (eliminado)\n";
    else echo "[FALLO] No se pudo eliminar: " . $elim['archivo'] . "\n";
}

if ($bumpear && (!empty($bumps_detalle) || !empty($info_bumps))) {
    echo "\n--- Bumps ---\n";
    foreach ($bumps_detalle as $d) echo "[BUMP] $d\n";
    foreach ($info_bumps as $i) echo "[INFO] $i\n";
}

echo "\n=== Resumen ===\n";
echo "Bloques aplicados: $bloques_ok\n";
echo "Archivos escritos: $archivos_escritos\n";
if ($bumpear) {
    echo "Bumps @version:    $bumps_atversion\n";
    echo "Bumps ?v=:         $bumps_qv\n";
}
if (!empty($bloques_fallidos)) {
    echo "Fallos: " . count($bloques_fallidos) . "\n";
    foreach ($bloques_fallidos as $f) echo "  - $f\n";
}
echo "\nListo.\n";