<?php
/**
 * Aplicador — Tanda 7 (v2): actualización de prompts del plugin.
 *
 * Uso (raíz de iteradoresJS/): php aplicar_cambios.php
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;
$version_nueva = '1.5plugin.8g';

$htmls_a_bumpear = [];

$cambios = [
    // ============================================================
    // A) §2: reemplazar el listado completo por puntero
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => '§2: puntero a estructura_plugin.md',
        'buscar' => [
            '## 2. ESTRUCTURA DE ARCHIVOS',
            '',
            '**Raíz de `iteradoresJS/`:**',
            '',
            '- `manifest.json` — manifiesto MV3. **Debe estar en la raíz**',
            '  del directorio cargado como extensión; Chrome no acepta',
            '  manifiestos anidados.',
            '- Framework (`Nodos/`, `Iteradores/`, `Controlador/`,',
            '  `Configuracion/`, `miscelaneas/`, `Persistencia/`, etc.) —',
            '  sin tocar.',
            '- `index.html`, `index.js` — entrada web actual del framework.',
            '',
            '**`prompts/`:**',
            '',
            '- `prompt_plugin_piloto.md` — este archivo.',
            '',
            '**`Aplicacion/`:**',
            '',
            '- `servicio.js` — service worker. **Module** (`type: "module"`',
            '  en el manifest). Imports estáticos. Registra el listener',
            '  de mensajes al final.',
            '- `contenido.js` — script de contenido clásico. Se inyecta en',
            '  la página del piloto.',
            '- `ventana.html` / `ventana.js` — interfaz del popup. Renderiza',
            '  las pruebas agrupadas por sección.',
            '- `arranque.js` — arranque del framework en el SW.',
            '- `ConfPlugin.js` — configuración propia del plugin.',
            '- `GrafoPlugin.js` — capa fina sobre el framework.',
            '- `pruebas/` — catálogo de pruebas.',
            '  - `catalogo.js` — agrupa las pruebas en `SECCIONES`. Expone',
            '    `CATALOGO` como array aplanado para compatibilidad.',
            '  - `_helpers.js` — helpers compartidos.',
            '  - `prueba_NN_*.js` — una por prueba.',
        ],
        'reemplazar' => [
            '## 2. ESTRUCTURA DE ARCHIVOS',
            '',
            'La estructura completa del plugin (carpetas, archivos,',
            'responsabilidades de cada módulo, grafo persistido,',
            'mensajes del service worker, formato de prueba y',
            'agrupación) vive en `prompts/estructura_plugin.md`.',
            'Ese archivo es la fuente de verdad y se actualiza',
            'cuando cambia la estructura.',
            '',
            'Resumen rápido:',
            '',
            '- `manifest.json` en la raíz de `iteradoresJS/`. Chrome',
            '  no acepta manifiestos anidados.',
            '- Framework (`Nodos/`, `Iteradores/`, `Controlador/`,',
            '  `Configuracion/`, `Persistencia/`) sin tocar.',
            '- `miscelaneas/`: se le agregó `Arbol.js` (espejo del',
            '  `Arbol.php` del piloto).',
            '- Código del plugin en `Aplicacion/`.',
            '- Catálogo de pruebas en `Aplicacion/pruebas/`.',
            '- Prompts en `prompts/`: `prompt_plugin_piloto.md`',
            '  (este) y `estructura_plugin.md`.',
        ],
    ],

    // ============================================================
    // B) §3.3: arranque_config.js
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => '§3.3: arranque_config.js',
        'buscar' => [
            '### 3.3 Service worker en modo consola',
            '',
            'En un SW no existe `document`. Los caminos HTML del framework',
            '(`_imprimir_errores_html`, `html_errores`, etc.) romperían.',
            'Se evitan forzando `Entorno.es_consola()` en `arranque.js`.',
        ],
        'reemplazar' => [
            '### 3.3 Service worker en modo consola',
            '',
            'En un SW no existe `document`. Los caminos HTML del framework',
            '(`_imprimir_errores_html`, `html_errores`, etc.) romperían.',
            'Se evitan forzando `Entorno.es_consola()` en',
            '`arranque_config.js` (efecto de lado, importado antes del',
            'Controlador desde `arranque.js`).',
        ],
    ],

    // ============================================================
    // C) §4.2 y §4.3: punteros a estructura_plugin.md
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => '§4.2 y §4.3: punteros a estructura_plugin.md',
        'buscar' => [
            '### 4.2 Secciones',
            '',
            'En `catalogo.js` las pruebas se agrupan en `SECCIONES`:',
            '',
            '    export const SECCIONES = [',
            '        { id: "base", nombre: "Base", pruebas: [arranque, login] },',
            '        { id: "ventas", nombre: "Ventas", pruebas: [...] }',
            '    ];',
            '',
            'La ventana renderiza cada sección con un botón "Correr todas".',
            'Cuando se aprieta, la ventana itera las pruebas de la',
            'sección y manda `correr_prueba` una por una, mostrando el',
            'progreso en vivo: la prueba en curso se resalta y el',
            'resumen dice "Corriendo N/total...". El SW no tiene un caso',
            '`correr_seccion`; simplemente ejecuta cada prueba individual.',
            'Para agregar una sección nueva, sumar un objeto a `SECCIONES`.',
            '',
            '### 4.3 Resultado',
            '',
            'Cada corrida persiste un nodo en el grafo del plugin con:',
            '',
            '- `id_prueba`',
            '- `fecha_hora` (ISO)',
            '- `resultado` (`"ok"` / `"fallo"` / `"error"`)',
            '- `duracion_ms`',
            '- `detalle` (texto libre)',
        ],
        'reemplazar' => [
            '### 4.2 Secciones y grupos',
            '',
            '`catalogo.js` agrupa las pruebas en `SECCIONES` (pestañas',
            'temáticas) con `grupos` por rol. El detalle de la',
            'estructura (campos de `SECCIONES`, `grupos`, botones por',
            'pestaña y por grupo, `CATALOGO` aplanado, render del popup)',
            'vive en `estructura_plugin.md` §4.',
            '',
            '### 4.3 Resultado',
            '',
            'La estructura del grafo del plugin (nodos `corrida_<ts>`,',
            'mini-árbol por prueba, autoenlace `corriendo`, límite',
            '`CORRIDAS_POR_PRUEBA_MAX`) y el protocolo de mensajes del',
            'service worker (`estado_pruebas`, `corrida_iniciada`,',
            '`corrida_terminada`) viven en `estructura_plugin.md` §3 y §5.',
        ],
    ],

    // ============================================================
    // D) §6: URL_PILOTO vive en ConfiguracionApli.js
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => '§6: ConfiguracionApli.js',
        'buscar' => [
            '- **URL del piloto:** `http://localhost/iteradores/codigo.worktrees/v1.5i/`.',
            '  Vive en `Aplicacion/ConfPlugin.js` como `URL_PILOTO`.',
        ],
        'reemplazar' => [
            '- **URL del piloto:** `http://localhost/iteradores/codigo.worktrees/v1.5i/`.',
            '  Vive en `Aplicacion/ConfiguracionApli.js` como `URL_PILOTO`.',
        ],
    ],

    // ============================================================
    // E) §7: listado de archivos del estado actual
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => '§7: listado de archivos actualizado',
        'buscar' => [
            '- `Aplicacion/arranque.js` — arranque del framework en el SW.',
            '- `Aplicacion/ConfPlugin.js` — configuración propia + URL del',
            '  piloto + códigos de usuario.',
            '- `Aplicacion/GrafoPlugin.js` — capa sobre el framework.',
        ],
        'reemplazar' => [
            '- `Aplicacion/arranque.js` — arranque del framework en el',
            '  SW. Imports estáticos.',
            '- `Aplicacion/arranque_config.js` — configuración temprana',
            '  (efecto de lado, corre antes de la auto-inicialización',
            '  del Controlador).',
            '- `Aplicacion/ConfiguracionApli.js` — configuración propia',
            '  + URL del piloto + códigos de usuario (antes llamado',
            '  `ConfPlugin.js`).',
            '- `Aplicacion/GrafoPlugin.js` — capa sobre el framework.',
        ],
    ],

    // ============================================================
    // F) §8: agregar lecciones 64, 65, 66
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => '§8: lecciones 64, 65, 66',
        'buscar' => [
            '63. **Persistencia en `localStorage` es un paliativo.**',
            '    La pestaña activa del plugin se guarda en',
            "    `localStorage['plugin_tab_activa']`. Está anotado",
            '    en el código como `ANOTADO`: hay que migrarlo a',
            '    la persistencia del framework (IndexedDB del',
            '    contexto de la extensión).',
            '',
            '---',
        ],
        'reemplazar' => [
            '63. **Persistencia en `localStorage` es un paliativo.**',
            '    La pestaña activa del plugin se guarda en',
            "    `localStorage['plugin_tab_activa']`. Está anotado",
            '    en el código como `ANOTADO`: hay que migrarlo a',
            '    la persistencia del framework (IndexedDB del',
            '    contexto de la extensión).',
            '',
            '64. **`Object.entries(Map)` devuelve `[]`.** Para iterar',
            '    un Map, `for (const [k, v] of map)`. `Nodo.adyacentes()`',
            '    devuelve un Map; el bug era silencioso (no error,',
            '    simplemente no iteraba). Afectó a',
            '    `obtener_estado_por_prueba`, `_podar_si_excede`,',
            '    `limpiar_autoenlaces_colgados` y',
            '    `_destruir_contenedor_corridas_viejo` en',
            '    `GrafoPlugin.js`. Detectado en v8e.',
            '',
            '65. **En MV3, todos los imports del service worker',
            '    tienen que ser estáticos.** Cualquier `await',
            '    import(...)` que aparezca en el grafo de',
            '    dependencias del SW rompe cuando el SW se reinicia',
            '    por inactividad, aunque las primeras ejecuciones',
            '    funcionen por timing. Síntoma típico: las corridas',
            '    se persistían mientras el popup estaba abierto, y',
            '    se perdían después de un rato sin uso. Fix en v8d:',
            '    `arranque.js` pasó a imports estáticos.',
            '',
            '66. **Para configurar el framework antes de que un',
            '    módulo se auto-inicialice, usar un módulo separado',
            '    con la configuración como efecto de lado, importado',
            '    ANTES del módulo que la consume.** Los imports ES',
            '    se evalúan depth-first en orden de aparición.',
            '    Implementado en v8d con `arranque_config.js`.',
            '',
            '---',
        ],
    ],

    // ============================================================
    // G) §9: nota de cierre
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => '§9: nota de cierre',
        'buscar' => [
            '**Última actualización de este prompt:** v1.5plugin.7y.',
            'Cierre del arco de la interfaz del plugin.',
        ],
        'reemplazar' => [
            '**Última actualización de este prompt:** v1.5plugin.8g.',
            'Cierre de la línea del grafo del plugin.',
            '',
            '**Cierre de la línea del grafo (v8b-v8g):**',
            '',
            '- **v8b** — GrafoPlugin rediseñado. Estructura nueva:',
            '  `pruebas → <id_prueba> → (hmi → cadena con cierre)`.',
            '  Máximo 5 corridas por prueba. Autoenlace `corriendo`.',
            '  Migración automática desde el contenedor viejo',
            '  `corridas`. Adaptación de `servicio.js` (fuera',
            '  `chrome.storage.session`, entran los mensajes',
            '  `estado_pruebas`, `corrida_iniciada`,',
            '  `corrida_terminada`).',
            '- **v8c** — UI del popup. Indicador de estado por fila',
            '  (última corrida + corriendo). Click despliega el',
            '  historial (hasta 5 corridas). Refresco por broadcast.',
            '- **v8d** — Fix del import dinámico. `arranque.js` usaba',
            '  `await import(...)`, prohibido en MV3 SW. Nuevo',
            '  `arranque_config.js` con la configuración como efecto',
            '  de lado, importado estáticamente ANTES del Controlador.',
            '- **v8e** — Fix de iteración de `Map` en GrafoPlugin.',
            '  `Object.entries(x)` sobre un Map devuelve `[]`. Se',
            '  cambia por `for (const [k, v] of x)`. Afectaba a',
            '  `obtener_estado_por_prueba`, `_podar_si_excede`,',
            '  `limpiar_autoenlaces_colgados` y',
            '  `_destruir_contenedor_corridas_viejo`.',
            '- **v8f** — Documentación: §2, §3.3, §4.2, §4.3, §6,',
            '  §7, §8 y §10.3 del prompt corregidas. Nuevo archivo',
            '  `prompts/estructura_plugin.md` con la fuente de',
            '  verdad de la estructura.',
            '- **v8g** — Cierre de la línea.',
            '',
            '**Lecciones nuevas:** ver §8, items 64-66.',
        ],
    ],

    // ============================================================
    // H) §10.3: ConfiguracionApli.js
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => '§10.3: ConfiguracionApli.js',
        'buscar' => [
            '3. **Cada cambio al plugin incrementa la versión.** En',
            '   `ConfPlugin.js` (`VERSION_APP` y `VERSION_PLUGIN`) y en',
            '   `@version` de los archivos que se tocan. El `manifest.json`',
            '   no se bumpea en cada letra (ver sección 3.12).',
        ],
        'reemplazar' => [
            '3. **Cada cambio al plugin incrementa la versión.** En',
            '   `ConfiguracionApli.js` (`VERSION_APP` y `VERSION_PLUGIN`)',
            '   y en `@version` de los archivos que se tocan. El',
            '   `manifest.json` no se bumpea en cada letra (ver',
            '   sección 3.12).',
        ],
    ],

    // ============================================================
    // I) Nuevo archivo: estructura_plugin.md
    // ============================================================
    [
        'tipo' => 'crear',
        'archivo' => 'prompts/estructura_plugin.md',
        'descripcion' => 'Nuevo estructura_plugin.md',
        'contenido' => [
            '# Estructura del plugin de pruebas (Chrome MV3)',
            '',
            'Este archivo es la **fuente de verdad de la estructura**',
            'del plugin: carpetas, archivos, grafo persistido, mensajes',
            'del service worker, formato de pruebas y agrupación.',
            '',
            'Vive en `iteradoresJS/prompts/estructura_plugin.md`. Se',
            'actualiza cuando cambia la estructura (archivos nuevos,',
            'cambios del grafo, mensajes nuevos). El prompt del plugin',
            '(`prompt_plugin_piloto.md`) guarda el método, las',
            'decisiones técnicas y las lecciones; este archivo guarda',
            'la foto de la estructura.',
            '',
            'Última actualización: v1.5plugin.8g.',
            '',
            '---',
            '',
            '## 1. ÁRBOL DE ARCHIVOS',
            '',
            '**Raíz de `iteradoresJS/`:**',
            '',
            '- `manifest.json` — manifiesto MV3. **Debe estar en la raíz**',
            '  del directorio cargado como extensión; Chrome no acepta',
            '  manifiestos anidados.',
            '- Framework (`Nodos/`, `Iteradores/`, `Controlador/`,',
            '  `Configuracion/`, `Persistencia/`, `miscelaneas/`, etc.).',
            '- `index.html`, `index.js` — entrada web del framework.',
            '- `auditar_plugin.php` — auditoría del plugin.',
            '',
            '**`prompts/`:**',
            '',
            '- `prompt_plugin_piloto.md` — método, decisiones, lecciones.',
            '- `estructura_plugin.md` — este archivo.',
            '',
            '**`Aplicacion/`:**',
            '',
            '- `servicio.js` — service worker (module, imports estáticos).',
            '- `contenido.js` — script de contenido clásico.',
            '- `ventana.html` / `ventana.js` — popup.',
            '- `arranque.js` — arranque del framework en el SW.',
            '- `arranque_config.js` — configuración temprana (efecto de',
            '  lado, corre antes de la auto-inicialización del Controlador).',
            '- `ConfiguracionApli.js` — config propia + URL + códigos.',
            '- `GrafoPlugin.js` — capa sobre el framework.',
            '- `LimpiezaPrueba.js` — limpieza de datos de prueba.',
            '- `CopiarPasajeros.js` — copia la tabla del micro abierto.',
            '- `pruebas/`:',
            '  - `catalogo.js` — agrupa pruebas en secciones y grupos.',
            '  - `_helpers.js`, `_<tipo>_helpers.js` — helpers.',
            '  - `prueba_NN_*.js` — una por prueba.',
            '',
            '**`miscelaneas/`:**',
            '',
            '- `index.js` — barrel.',
            '- `generarUUID.js`.',
            '- `mixin.js`.',
            '- `Arbol.js` — operaciones de árbol (`hmi`/`hd`/`p`), espejo',
            '  del `Arbol.php` del piloto. Incluye `_arbol_nombres`,',
            '  `_hmi`, `_hd`, `hmi`, `hd`, `p`, `eliminar_hmi`,',
            '  `eliminar_hd`. Todas aceptan un parámetro opcional',
            '  `nombres` para enlaces alternativos.',
            '',
            '---',
            '',
            '## 2. RESPONSABILIDADES DE CADA MÓDULO',
            '',
            '**`servicio.js`** (service worker):',
            '',
            '- Registra el listener de mensajes.',
            '- Orquesta la ejecución de pruebas: crea el `ctx`, marca',
            '  `corrida_iniciada`, ejecuta, persiste la corrida, marca',
            '  `corrida_terminada`.',
            '- Cachea `nombre_solicitante` y `nombre_dueno` (se',
            '  invalidan en login/logout).',
            '- Expone helpers al `ctx` (DOM, fetch, MAIN world).',
            '',
            '**`contenido.js`** (content script):',
            '',
            '- Se inyecta en la página del piloto.',
            '- Recibe mensajes del SW y los ejecuta contra el DOM.',
            '- Hace el `fetch` multipart (las cookies del piloto viajan',
            '  solo desde el origen del piloto).',
            '',
            '**`ventana.js`** (popup):',
            '',
            '- No usa imports. Pide datos al SW por',
            '  `chrome.runtime.sendMessage`.',
            '- Renderiza pestañas, grupos y pruebas.',
            '- Muestra indicadores de estado y el historial de las',
            '  últimas 5 corridas por prueba.',
            '- Escucha `corrida_iniciada`, `corrida_terminada` y',
            '  `limpieza_progreso`.',
            '',
            '**`arranque.js`**:',
            '',
            '- Importa `./arranque_config.js` (efecto de lado) ANTES',
            '  de `../Controlador/index.js`.',
            '- Expone `obtener_controlador()`: espera a que el',
            '  Controlador termine de inicializar, fuerza el método',
            '  de persistencia a `IndexedDB`.',
            '',
            '**`arranque_config.js`**:',
            '',
            '- Configura `Entorno` (salida consola, modo desarrollo)',
            '  y aplica `configurar_conf(Conf)`.',
            '- Existe por orden de evaluación: los imports ES se',
            '  evalúan depth-first en orden de aparición.',
            '',
            '**`ConfiguracionApli.js`**:',
            '',
            '- Constantes del plugin (`NOMBRE_APP`, `VERSION_APP`,',
            '  `NOMBRE_GRAFO`, `VERSION_PLUGIN`, `CORRIDAS_POR_PRUEBA_MAX`).',
            '- Constantes del piloto (`URL_PILOTO`, códigos de usuario).',
            '- `configurar_conf(Conf)` aplica los valores al framework.',
            '',
            '**`GrafoPlugin.js`**:',
            '',
            '- Carga / guarda el grafo del plugin.',
            '- API: `asegurar_grafo_cargado()`, `registrar_corrida()`,',
            '  `marcar_en_vivo()`, `limpiar_en_vivo()`,',
            '  `limpiar_autoenlaces_colgados()`,',
            '  `obtener_estado_por_prueba()`.',
            '- Migración automática desde el contenedor viejo `corridas`.',
            '',
            '---',
            '',
            '## 3. GRAFO PERSISTIDO',
            '',
            '```',
            'plugin (especial)',
            '└── pruebas (contenedor principal)',
            '    ├── <id_prueba_1>          (contenedor del mini-árbol)',
            '    │   ├── corriendo          (autoenlace, si corre ahora)',
            '    │   └── hmi → corrida_<t5>',
            '    │       └── hd → corrida_<t4>',
            '    │           └── hd → ...',
            '    │               └── hd → <id_prueba_1>  (cierre)',
            '    └── <id_prueba_2>',
            '        └── hmi → corrida_<tN>',
            '```',
            '',
            'Cada nodo `corrida_<ts>` guarda:',
            '',
            '- `fecha_hora` (ISO).',
            '- `resultado` (`"ok"` / `"fallo"` / `"error"`).',
            '- `duracion_ms`.',
            '- `detalle` (opcional).',
            '',
            'Detalles:',
            '',
            '- El `id_prueba` se infiere del contenedor padre.',
            '- Máximo `CORRIDAS_POR_PRUEBA_MAX` (5) corridas por prueba.',
            '  Al insertar, si se supera, se destruye la más vieja.',
            '- Las corridas se insertan como `hmi` (la más nueva primero).',
            '- El último nodo de la cadena apunta al contenedor vía `hd`.',
            '- El autoenlace `corriendo` sirve doble: marca visual +',
            '  protección contra eliminación accidental.',
            '',
            '---',
            '',
            '## 4. CATÁLOGO DE PRUEBAS',
            '',
            '`catalogo.js` exporta:',
            '',
            '- `SECCIONES` — array de pestañas temáticas.',
            '  - `id`, `nombre`.',
            '  - `limpieza` — array de categorías que limpia su botón',
            '    "Limpiar pruebas" (puede ser `[]`).',
            '  - `grupos` — array de grupos por rol.',
            '    - `id`, `nombre`.',
            '    - `pruebas` — array de pruebas.',
            '- `CATALOGO` — array aplanado de todas las pruebas.',
            '',
            '**Estructura de una prueba:**',
            '',
            '```js',
            'export const prueba = {',
            '    id: "arranque",',
            '    nombre: "Arranque: plugin y script de contenido",',
            '    descripcion: "Verifica que el script de contenido...",',
            '    async ejecutar(ctx) {',
            '        // usar helpers de ctx',
            '    }',
            '};',
            '```',
            '',
            '**Render en el popup:**',
            '',
            '- Barra de pestañas (una por sección).',
            '- Pestaña activa: barra con "Ejecutar todos los roles" +',
            '  "Limpiar pruebas" + estado.',
            '- Grilla de 2 columnas con las tarjetas por grupo.',
            '- Cada tarjeta: header con nombre + botón "Correr todas";',
            '  filas por prueba con botón play, resultado en vivo,',
            '  indicador de estado (última corrida) e historial',
            '  desplegable.',
            '',
            '**Progreso al correr una pestaña o grupo:**',
            '',
            '- El popup itera las pruebas y manda `correr_prueba` una',
            '  por una, actualizando en vivo.',
            '- El SW no tiene caso `correr_seccion`.',
            '',
            '---',
            '',
            '## 5. MENSAJES DEL SERVICE WORKER',
            '',
            '**Popup → SW:**',
            '',
            '- `listar_secciones` → `{exito, secciones}`.',
            '- `listar_pruebas` → `{exito, pruebas}`.',
            '- `correr_prueba {id_prueba}` →',
            '  `{exito, resultado, detalle, duracion_ms}`.',
            '- `estado_pruebas` → `{exito, por_prueba}`. Reemplaza a',
            '  los viejos `estado_en_vivo` y `listar_corridas`.',
            '- `limpiar_datos_prueba` → limpieza total.',
            '- `limpiar_prueba_categoria {categorias}` → limpieza parcial.',
            '- `copiar_tabla_pasajeros` →',
            '  `{exito, tabla, cantidad_filas}`.',
            '- `refrescar_asientos_pagina`.',
            '',
            '**SW → popup (broadcasts):**',
            '',
            '- `limpieza_progreso {evento}`.',
            '- `corrida_iniciada {id_prueba}`.',
            '- `corrida_terminada {id_prueba, resultado, fecha_hora,',
            '  duracion_ms, detalle}`.',
            '',
            '---',
            '',
            '## 6. HELPERS DE `ctx`',
            '',
            'Ver prompt del plugin §5. Se mantiene ahí porque es la',
            'API del plugin (contrato con las pruebas), no la',
            'estructura interna del código.',
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

// --- Fase 1: aplicar reemplazos ---
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

// --- Fase 3: escribir ---
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

echo "\n=== Resumen ===\n";
echo "Bloques aplicados: $bloques_ok\n";
echo "Archivos escritos: $archivos_escritos\n";
if (!empty($bloques_fallidos)) {
    echo "Fallos: " . count($bloques_fallidos) . "\n";
    foreach ($bloques_fallidos as $f) echo "  - $f\n";
}
echo "\nListo.\n";