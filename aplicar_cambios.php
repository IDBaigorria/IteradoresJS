<?php
/**
 * Aplicador de cambios automáticos — Plugin de pruebas (iteradoresJS).
 *
 * Tanda v1.5plugin.0 — bootstrap del proyecto.
 *
 * Deja asentado el prompt del plugin y prepara la estructura de
 * carpetas para las próximas tandas. No incluye código ejecutable
 * todavía (manifest, service worker, content script, popup); eso
 * va en v1.5plugin.1.
 *
 * Uso:
 *   php aplicar_cambios.php
 *
 * Si PHP no está en el PATH del sistema:
 *   C:\xampp\php\php.exe aplicar_cambios.php
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

    // ============================================================
    // prompts/prompt_plugin_piloto.md — archivo nuevo
    // ============================================================

    [
        'tipo' => 'crear',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'Prompt del plugin piloto',
        'contenido' => [
            '# Prompt de trabajo — Plugin de pruebas (Chrome MV3)',
            '',
            'Este es un prompt autocontenido con todo lo que sabemos sobre el',
            '**plugin piloto**: una extensión de Chrome (manifest v3) que corre',
            'pruebas automatizadas sobre la página del piloto PHP, usando el',
            'framework Iteradores JS para persistir su propia información.',
            '',
            'Vive en el propio proyecto, en',
            '`iteradoresJS/prompts/prompt_plugin_piloto.md`. El proyecto',
            '`iteradoresJS/` es un repo independiente del proyecto PHP; el',
            'prompt del framework Iteradores y el del sistema de scripts',
            'siguen viviendo en el proyecto PHP (`iteradores/prompts/`).',
            '',
            'Se actualiza con **cada tanda de código**. La sección',
            '**Discusión actual** (al final) es la fuente de verdad sobre',
            'dónde quedamos.',
            '',
            'Los scripts de aplicación de cambios se corren parados en la',
            'raíz de `iteradoresJS/` y usan el mismo formato y runner que en',
            'el proyecto PHP (ver `prompt_sistema_scripts.md` en el proyecto',
            'PHP).',
            '',
            '---',
            '',
            '## 1. VISIÓN DEL PLUGIN',
            '',
            '### 1.1 Objetivo',
            '',
            'Extensión de Chrome que permite correr pruebas automatizadas',
            'sobre la página del piloto PHP (agencia de viajes). El usuario',
            'abre el popup de la extensión, ve una lista de pruebas',
            'disponibles, y aprieta un botón play en la que quiere correr.',
            'La extensión ejecuta la prueba contra la pestaña activa (o',
            'contra una pestaña del piloto que se abra al efecto), y guarda',
            'el resultado en su propio grafo.',
            '',
            '### 1.2 Objetivos secundarios',
            '',
            '- Servir de ejercicio real del framework Iteradores JS',
            '  (indexado por IndexedDB del contexto de la extensión).',
            '- Aprovechar el sistema de comandos y el motor (comandos +',
            '  péndulo) cuando haga falta ejecución por fases.',
            '- Ser la base de una herramienta más amplia: inspeccionar el',
            '  grafo del piloto, generar reportes, correr tandas completas,',
            '  etc.',
            '',
            '### 1.3 Relación con el piloto PHP',
            '',
            'El plugin **no modifica** el piloto PHP. Solo lo observa y lo',
            'maneja como un usuario. Puede:',
            '',
            '- Leer el DOM de la página.',
            '- Hacer clicks, escribir, esperar.',
            '- Hacer `fetch` a `index.php` con la sesión del usuario actual',
            '  (las cookies viajan por estar en el mismo origen que la',
            '  pestaña, siempre que el `fetch` se haga desde el content',
            '  script).',
            '',
            '---',
            '',
            '## 2. ESTRUCTURA DE ARCHIVOS',
            '',
            '**Raíz de `iteradoresJS/`:**',
            '',
            '- `manifest.json` — manifiesto MV3. **Debe estar en la raíz**',
            '  del directorio cargado como extensión; Chrome no acepta',
            '  manifiestos anidados. El código apunta a `Aplicacion/...`',
            '  vía paths relativos.',
            '- Framework (`Nodos/`, `Iteradores/`, `Controlador/`,',
            '  `Configuracion/`, `miscelaneas/`, `Persistencia/`, etc.) —',
            '  sin tocar.',
            '- `index.html`, `index.js` — entrada web actual del framework,',
            '  sin tocar.',
            '',
            '**`prompts/`:**',
            '',
            '- `prompt_plugin_piloto.md` — este archivo.',
            '',
            '**`Aplicacion/`:**',
            '',
            '- `background.js` — service worker. **Module** (`type: "module"`',
            '  en el manifest). Bootstrap-ea el framework, importa el',
            '  catálogo de pruebas y las corre por pedido del popup.',
            '- `content.js` — content script clásico. Se inyecta en la',
            '  página del piloto. Expone funciones vía mensajes de Chrome',
            '  (`chrome.runtime.onMessage`).',
            '- `popup.html` / `popup.js` — interfaz del popup. Lista las',
            '  pruebas, muestra el resultado de la última corrida.',
            '- `bootstrap.js` — arranque del framework en el service worker.',
            '  Fuerza `Entorno` a modo consola y `salida=consola`, y',
            '  configura `ConfPlugin`.',
            '- `ConfPlugin.js` — subclase de `Conf` con valores propios del',
            '  plugin (nombre de app, nombre de la BD IndexedDB).',
            '- `GrafoPlugin.js` — capa fina sobre el framework: persistir',
            '  corridas, leer historial, etc.',
            '- `pruebas/` — catálogo de pruebas. Cada prueba es un módulo ES',
            '  que exporta un objeto `{id, nombre, descripcion, ejecutar}`.',
            '  `pruebas/catalogo.js` las lista.',
            '',
            '---',
            '',
            '## 3. LIMITACIONES Y DECISIONES TÉCNICAS',
            '',
            '### 3.1 Manifest en la raíz',
            '',
            'Chrome MV3 exige que `manifest.json` esté en la raíz del',
            'directorio que se carga como extensión. Como el plugin necesita',
            'importar `../Nodos/Nodo.js` y demás archivos del framework, el',
            'manifest tiene que estar un nivel arriba de `Aplicacion/`,',
            'esto es, en la raíz del proyecto `iteradoresJS/`.',
            '',
            'Los paths del manifest son relativos a esa raíz:',
            '',
            '    "background": { "service_worker": "Aplicacion/background.js", "type": "module" }',
            '    "action":     { "default_popup":    "Aplicacion/popup.html" }',
            '    "content_scripts": [{ "js": ["Aplicacion/content.js"] }]',
            '',
            '### 3.2 Service worker en modo consola',
            '',
            'En un service worker no existe `document`. Los caminos HTML del',
            'framework (`_imprimir_errores_html`, `html_errores`,',
            '`_imprimir_alertas_html`, `html_alertas`, `Nodo._imprimir_html`,',
            '`Controlador.imprimir_superestructura`) tocan `document` y',
            'romperían. Se evitan asegurando que `Entorno.es_consola()`',
            'devuelva `true` en el arranque del SW:',
            '',
            '    import { Entorno } from "../Configuracion/index.js";',
            '    Entorno.establecer_salida(Entorno.SALIDA_CONSOLA);',
            '',
            '### 3.3 Content script clásico',
            '',
            'Los content scripts de MV3 no pueden ser módulos ES. Se',
            'comunican con el service worker por mensajería:',
            '',
            '- SW → content: `chrome.tabs.sendMessage(tabId, { tipo, datos })`.',
            '- Content → SW: `chrome.runtime.sendMessage({ tipo, datos })`.',
            '',
            'El SW hace de orquestador: importa las pruebas, coordina las',
            'llamadas al content script, persiste resultados.',
            '',
            '### 3.4 Token de seguridad',
            '',
            'El plugin **no maneja el token** del framework. El Controlador',
            'lo recibe automáticamente cuando el módulo `Controlador` se',
            'evalúa (vía `Nodo.registrar_controlador`). Para código que',
            'necesite el token, se usa:',
            '',
            '    await Controlador.ejecutar_prueba((token) => {',
            '        // usar token',
            '    });',
            '',
            '### 3.5 Motor (comandos + péndulo)',
            '',
            'El motor y el sistema de comandos **no se usan en la primera',
            'versión**. Quedan disponibles para cuando haga falta ejecución',
            'por fases. Recordatorio sobre la config:',
            '',
            '- `MOTOR_MAX_CICLOS` — ciclos **totales** que ejecuta el motor',
            '  antes de detenerse. `0` = infinito.',
            '- `MOTOR_QUANTUM` — comandos ejecutados por ciclo.',
            '- `MOTOR_CICLOS_POR_MINUTO` — frecuencia.',
            '',
            '### 3.6 Geolocalización',
            '',
            '`Controlador.inicializar()` intenta obtener coordenadas',
            '(navegador → IP → fallback). En el SW puede fallar. Ya tiene',
            'fallback a coordenadas predeterminadas en `Conf`, así que no',
            'es bloqueante.',
            '',
            '---',
            '',
            '## 4. FORMATO DE PRUEBA',
            '',
            'Cada prueba es un módulo ES con un objeto exportado:',
            '',
            '    export const prueba = {',
            '        id: "smoke_login",',
            '        nombre: "Smoke: login",',
            '        descripcion: "Verifica que la pantalla de login carga y acepta credenciales",',
            '        async ejecutar(ctx) {',
            '            // ctx.tab       → API del content script (click, escribir, esperar)',
            '            // ctx.fetch     → fetch a la página del piloto (con cookies)',
            '            // ctx.assert    → helper de aserción',
            '            // ctx.persistir → guarda el resultado en el grafo del plugin',
            '        }',
            '    };',
            '',
            '`ctx` lo provee el service worker. La prueba no habla',
            'directamente con la API de Chrome; todo pasa por `ctx`.',
            '',
            '### 4.1 Resultado',
            '',
            'Cada corrida persiste un nodo en el grafo del plugin con:',
            '',
            '- `id_prueba`',
            '- `fecha_hora` (ISO)',
            '- `resultado` (`"ok"` / `"fallo"` / `"error"`)',
            '- `duracion_ms`',
            '- `detalle` (texto libre)',
            '- `captura_dom` (opcional, fragmento del DOM como string)',
            '',
            '---',
            '',
            '## 5. ESTADO ACTUAL',
            '',
            '**Proyecto en v1.5plugin.0.** La estructura de carpetas está',
            'creada. El prompt del plugin está asentado. Todavía no hay',
            'código ejecutable.',
            '',
            'Los archivos que se van a crear en la próxima tanda:',
            '',
            '- `manifest.json`',
            '- `Aplicacion/background.js`',
            '- `Aplicacion/content.js`',
            '- `Aplicacion/popup.html`',
            '- `Aplicacion/popup.js`',
            '- `Aplicacion/bootstrap.js`',
            '- `Aplicacion/ConfPlugin.js`',
            '- `Aplicacion/GrafoPlugin.js`',
            '- `Aplicacion/pruebas/catalogo.js`',
            '- `Aplicacion/pruebas/prueba_01_smoke.js`',
            '',
            '---',
            '',
            '## 6. DISCUSIÓN ACTUAL',
            '',
            '**Última actualización de este prompt:** v1.5plugin.0 (creación',
            'de la estructura, prompt inicial).',
            '',
            '**Decisiones tomadas:**',
            '',
            '- Manifest en la raíz de `iteradoresJS/` (opción A).',
            '- Código del plugin en `Aplicacion/`.',
            '- Persistencia con `PerdurarSuperestructuraStringIndexedDB`.',
            '- Salida en modo consola dentro del service worker.',
            '- Content script clásico, comunicación por mensajería.',
            '- Formato de prueba declarativo con objeto `{id, nombre,',
            '  ejecutar(ctx)}`.',
            '- El motor y los comandos no se usan en la primera versión.',
            '- Nombre de app del plugin: `IteradoresPluginPruebas`.',
            '- Prefijo de versión del plugin: `v1.5plugin.*`.',
            '',
            '**Permisos del manifest (borrador):**',
            '',
            '- `host_permissions`: `http://localhost/*` y',
            '  `http://127.0.0.1/*`. Si se prueba contra producción, se',
            '  agrega el dominio.',
            '- `permissions`: `activeTab`, `scripting`, `tabs`.',
            '',
            '**Pendiente:**',
            '',
            '- Escribir el código del plugin (v1.5plugin.1).',
            '- Definir el catálogo inicial de pruebas.',
            '- Definir el comportamiento del popup (layout, selección de',
            '  pestaña, ver resultado).',
            '',
            '---',
            '',
            '**FIN DEL PROMPT**',
        ],
    ],

    // ============================================================
    // .gitkeep para que existan las carpetas vacías
    // ============================================================

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/.gitkeep',
        'descripcion' => 'Mantener carpeta Aplicacion/',
        'contenido' => [''],
    ],

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/.gitkeep',
        'descripcion' => 'Mantener carpeta Aplicacion/pruebas/',
        'contenido' => [''],
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