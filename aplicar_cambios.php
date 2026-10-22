<?php
/**
 * Aplicador — v1.5plugin.9h: fix de asegurar_login.
 *
 * Uso (raíz de iteradoresJS/): php aplicar_cambios.php
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;
$version_nueva = '1.5plugin.9h';
$htmls_a_bumpear = [];

$cambios = [

    // ============================================================
    // 1. servicio.js: asegurar_login reforzado
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'servicio.js: asegurar_login espera salir() y llama ingresar_con_codigo',
        'buscar' => [
            '        async asegurar_login(codigo) {',
            '            // Invalidar el cache del solicitante antes de',
            '            // loguear: si ya habia sesion, el usuario que',
            '            // entra es otro.',
            '            _cache_nombre_solicitante = null;',
            '            _cache_dueno_actual = null;',
            '',
            '            await this.esperar("#pantalla_login, #aplicacion", 8000);',
            '            const app_visible = await this.esta_visible("#aplicacion");',
            '            if (app_visible) {',
            '                await this.clic("#boton_salir");',
            '                await this.esperar_visible("#pantalla_login", 5000);',
            '            }',
            '            await this.escribir("#codigo_acceso", codigo);',
            '            await this.clic("#boton_ingresar");',
            '            const r = await this.esperar_visible("#aplicacion", 8000);',
            '            if (!r || !r.exito) {',
            '                throw new Error("Login fallo. El codigo puede ser invalido o el usuario esta bloqueado.");',
            '            }',
            '        },',
        ],
        'reemplazar' => [
            '        async asegurar_login(codigo) {',
            '            // v1.5plugin.9h: reescrito para eliminar la race',
            '            // condition entre salir() y escribir el código.',
            '            // salir() del piloto limpia #codigo_acceso.value',
            '            // DESPUÉS del fetch de sesiones/cerrar. Si escribíamos',
            '            // el código mientras salir() seguía corriendo, salir()',
            '            // lo borraba. Ahora se llama salir() desde el page',
            '            // context, se espera a que termine, y recién ahí se',
            '            // escribe el código y se dispara el login.',
            '            _cache_nombre_solicitante = null;',
            '            _cache_dueno_actual = null;',
            '',
            '            console.log("[asegurar_login] inicio, código:", codigo);',
            '',
            '            // 1. Esperar a que el DOM esté estable.',
            '            try {',
            '                await this.esperar("#pantalla_login, #aplicacion", 8000);',
            '            } catch (e) {',
            '                console.warn("[asegurar_login] esperar inicial falló:", e);',
            '            }',
            '',
            '            // 2. Si hay sesión abierta, cerrarla esperando a que termine.',
            '            const app_visible = await this.esta_visible("#aplicacion");',
            '            console.log("[asegurar_login] app visible:", app_visible);',
            '            if (app_visible) {',
            '                try {',
            '                    const r_salir = await chrome.scripting.executeScript({',
            '                        target: { tabId: pestana_id },',
            '                        world: "MAIN",',
            '                        func: async () => {',
            '                            if (typeof salir === "function") {',
            '                                try { await salir(); } catch (e) { console.error("[salir]", e); }',
            '                            }',
            '                            const pantalla = document.getElementById("pantalla_login");',
            '                            const app = document.getElementById("aplicacion");',
            '                            return {',
            '                                login_visible: !!(pantalla && !pantalla.classList.contains("hidden")),',
            '                                app_visible: !!(app && !app.classList.contains("hidden")),',
            '                            };',
            '                        }',
            '                    });',
            '                    const r_res = (r_salir && r_salir[0] && r_salir[0].result) ? r_salir[0].result : null;',
            '                    console.log("[asegurar_login] resultado salir:", r_res);',
            '                    if (!r_res || !r_res.login_visible) {',
            '                        await this.esperar_visible("#pantalla_login", 8000);',
            '                    }',
            '                } catch (e) {',
            '                    console.error("[asegurar_login] salir() falló:", e);',
            '                    throw new Error("No se pudo cerrar la sesión anterior: " + e.message);',
            '                }',
            '            }',
            '',
            '            // 3. Asegurar que el subpanel de código esté visible.',
            '            const user_panel_visible = await this.esta_visible("#login_por_usuario");',
            '            const code_panel_visible = await this.esta_visible("#login_por_codigo");',
            '            console.log("[asegurar_login] subpanel usuario:", user_panel_visible, "subpanel código:", code_panel_visible);',
            '            if (user_panel_visible || !code_panel_visible) {',
            '                try {',
            '                    await chrome.scripting.executeScript({',
            '                        target: { tabId: pestana_id },',
            '                        world: "MAIN",',
            '                        func: () => {',
            '                            if (typeof mostrar_login_por_codigo === "function") {',
            '                                mostrar_login_por_codigo();',
            '                                return { exito: true, via: "funcion" };',
            '                            }',
            '                            const link = document.getElementById("link_login_codigo");',
            '                            if (link) { link.click(); return { exito: true, via: "link" }; }',
            '                            return { exito: false, error: "no hay toggle" };',
            '                        }',
            '                    });',
            '                    await this.pausa(300);',
            '                } catch (e) {',
            '                    console.warn("[asegurar_login] toggle falló:", e);',
            '                }',
            '            }',
            '',
            '            // 4. Escribir el código con verificación.',
            '            await this.escribir("#codigo_acceso", codigo);',
            '            const val_escrito = await this.valor("#codigo_acceso");',
            '            console.log("[asegurar_login] valor escrito:", val_escrito);',
            '            if (val_escrito !== codigo) {',
            '                throw new Error("No se pudo escribir el código en #codigo_acceso (esperado: \\"" + codigo + "\\", obtenido: \\"" + val_escrito + "\\").");',
            '            }',
            '',
            '            // 5. Disparar el login (llamando a ingresar_con_codigo del piloto).',
            '            try {',
            '                const r_login = await chrome.scripting.executeScript({',
            '                    target: { tabId: pestana_id },',
            '                    world: "MAIN",',
            '                    func: async () => {',
            '                        if (typeof ingresar_con_codigo === "function") {',
            '                            try {',
            '                                await ingresar_con_codigo();',
            '                            } catch (e) {',
            '                                return { exito: false, error: String(e) };',
            '                            }',
            '                            return { exito: true, via: "funcion" };',
            '                        }',
            '                        const btn = document.getElementById("boton_ingresar");',
            '                        if (!btn) return { exito: false, error: "no existe #boton_ingresar" };',
            '                        btn.click();',
            '                        return { exito: true, via: "click" };',
            '                    }',
            '                });',
            '                const r_login_res = (r_login && r_login[0] && r_login[0].result) ? r_login[0].result : null;',
            '                console.log("[asegurar_login] resultado login:", r_login_res);',
            '                if (!r_login_res || !r_login_res.exito) {',
            '                    throw new Error("Login falló al dispararse: " + ((r_login_res && r_login_res.error) || "desconocido"));',
            '                }',
            '            } catch (e) {',
            '                console.error("[asegurar_login] error disparando login:", e);',
            '                throw e;',
            '            }',
            '',
            '            // 6. Esperar a que la app sea visible.',
            '            const r = await this.esperar_visible("#aplicacion", 20000);',
            '            console.log("[asegurar_login] app visible después del login:", r && r.exito);',
            '            if (!r || !r.exito) {',
            '                const nivel = await this.texto("#nivel_usuario_actual");',
            '                throw new Error("Login enviado pero la app no se hizo visible en 20s. Verificá que el código sea válido y que el usuario no esté bloqueado. (nivel detectado: " + (nivel || "vacío") + ")");',
            '            }',
            '            console.log("[asegurar_login] OK");',
            '        },',
        ],
    ],

    // ============================================================
    // 2. ConfiguracionApli.js: bump a 9h
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfiguracionApli.js',
        'descripcion' => 'ConfiguracionApli.js: bump VERSION_APP a 9h',
        'buscar' => [
            'export const VERSION_APP = "1.5plugin.9g";',
        ],
        'reemplazar' => [
            'export const VERSION_APP = "1.5plugin.9h";',
        ],
    ],
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfiguracionApli.js',
        'descripcion' => 'ConfiguracionApli.js: bump VERSION_PLUGIN a 9h',
        'buscar' => [
            'export const VERSION_PLUGIN = "1.5plugin.9g";',
        ],
        'reemplazar' => [
            'export const VERSION_PLUGIN = "1.5plugin.9h";',
        ],
    ],

];

// ============================================================
// Runner v2 (estándar)
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

if (!isset($htmls_a_bumpear) || !is_array($htmls_a_bumpear)) { $htmls_a_bumpear = []; }
if (!isset($version_nueva)) $version_nueva = '';
$version_nueva = trim((string)$version_nueva);
$bumpear = ($version_nueva !== '');

$creaciones = []; $eliminaciones = []; $reemplazos_por_archivo = [];
foreach ($cambios as $cambio) {
    $tipo = $cambio['tipo'] ?? 'reemplazar';
    if ($tipo === 'crear') { $creaciones[] = $cambio; continue; }
    if ($tipo === 'eliminar') { $eliminaciones[] = $cambio; continue; }
    if (!isset($cambio['buscar']) || !isset($cambio['reemplazar'])) continue;
    $reemplazos_por_archivo[$cambio['archivo']][] = $cambio;
}

echo "[INFO] " . count($reemplazos_por_archivo) . " archivo(s) a reemplazar, "
    . count($creaciones) . " a crear, " . count($eliminaciones) . " a eliminar.\n\n";

$archivos_a_escribir = []; $bloques_ok = 0; $bloques_fallidos = [];

foreach ($reemplazos_por_archivo as $archivo_rel => $lista) {
    $ruta_abs = $raiz_proyecto . '/' . $archivo_rel;
    if (!file_exists($ruta_abs)) { $bloques_fallidos[] = "Archivo no encontrado: $archivo_rel"; continue; }
    $contenido_original = file_get_contents($ruta_abs);
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

$archivos_bump = [];
foreach ($archivos_a_escribir as $ruta_abs => $info) {
    $ext = strtolower(pathinfo($ruta_abs, PATHINFO_EXTENSION));
    if ($ext === 'php' || $ext === 'js') $archivos_bump[] = substr($ruta_abs, strlen($raiz_proyecto) + 1);
}

$bumps = 0; $bumps_detalle = []; $info_bumps = [];
if ($bumpear) {
    foreach (array_unique($archivos_bump) as $archivo_rel) {
        $ruta_abs = $raiz_proyecto . '/' . $archivo_rel;
        if (!file_exists($ruta_abs)) continue;
        if (isset($archivos_a_escribir[$ruta_abs])) { list($contenido, $eol) = $archivos_a_escribir[$ruta_abs]; }
        else { $contenido = normalizar_a_unix(file_get_contents($ruta_abs)); $eol = detectar_eol($contenido); }
        $viejo = '';
        $nuevo = preg_replace_callback('/(\*\s+@version\s+)(\S+)/', function($m) use ($version_nueva, &$viejo) {
            $viejo = $m[2]; return $m[1] . $version_nueva;
        }, $contenido, 1, $count);
        if ($count === 0) { $info_bumps[] = "$archivo_rel (sin @version)"; continue; }
        if ($viejo === $version_nueva) continue;
        $archivos_a_escribir[$ruta_abs] = [normalizar_a_unix($nuevo), $eol];
        $bumps++; $bumps_detalle[] = "$archivo_rel  @version $viejo → $version_nueva";
    }
}

$archivos_escritos = 0;
foreach ($archivos_a_escribir as $ruta_abs => $info) {
    list($contenido_unix, $eol) = $info;
    if (file_put_contents($ruta_abs, normalizar_a_original($contenido_unix, $eol)) === false) {
        echo "[FALLO] No se pudo escribir: " . substr($ruta_abs, strlen($raiz_proyecto) + 1) . "\n"; continue;
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
if ($bumpear) echo "Bumps @version:    $bumps\n";
if (!empty($bloques_fallidos)) {
    echo "Fallos: " . count($bloques_fallidos) . "\n";
    foreach ($bloques_fallidos as $f) echo "  - $f\n";
}
echo "\nListo.\n";