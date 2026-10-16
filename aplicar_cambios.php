<?php
/**
 * Aplicador — Tanda 2+3: rediseño de GrafoPlugin.js + adaptación de servicio.js.
 *
 * Uso (raíz de iteradoresJS/): php aplicar_cambios.php
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;
$version_nueva = '1.5plugin.8b';

// El plugin no usa ?v= en HTML.
$htmls_a_bumpear = [];

$cambios = [
    // ============================================================
    // A) ConfiguracionApli.js: VERSION_APP
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfiguracionApli.js',
        'descripcion' => 'VERSION_APP a 1.5plugin.8b',
        'buscar' => [
            'export const VERSION_APP = "1.5plugin.7aa";',
        ],
        'reemplazar' => [
            'export const VERSION_APP = "1.5plugin.8b";',
        ],
    ],

    // ============================================================
    // B) ConfiguracionApli.js: VERSION_PLUGIN
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfiguracionApli.js',
        'descripcion' => 'VERSION_PLUGIN a 1.5plugin.8b',
        'buscar' => [
            'export const VERSION_PLUGIN = "1.5plugin.7aa";',
        ],
        'reemplazar' => [
            'export const VERSION_PLUGIN = "1.5plugin.8b";',
        ],
    ],

    // ============================================================
    // C) ConfiguracionApli.js: agregar CORRIDAS_POR_PRUEBA_MAX
    //    justo después del VERSION_PLUGIN (ya en 8b por el bloque B).
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfiguracionApli.js',
        'descripcion' => 'Agregar CORRIDAS_POR_PRUEBA_MAX',
        'buscar' => [
            'export const NOMBRE_GRAFO = "plugin_pruebas";',
            'export const VERSION_PLUGIN = "1.5plugin.8b";',
        ],
        'reemplazar' => [
            'export const NOMBRE_GRAFO = "plugin_pruebas";',
            'export const VERSION_PLUGIN = "1.5plugin.8b";',
            '',
            '// Maximo de corridas guardadas por prueba. Al insertar',
            '// una nueva, si se supera, se destruye la mas vieja.',
            'export const CORRIDAS_POR_PRUEBA_MAX = 5;',
        ],
    ],

    // ============================================================
    // D) GrafoPlugin.js: reescritura completa
    // ============================================================
    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/GrafoPlugin.js',
        'descripcion' => 'GrafoPlugin.js rediseñado (nueva estructura)',
        'contenido' => [
            '/**',
            ' * Capa fina sobre el framework Iteradores para persistir el',
            ' * grafo de corridas del plugin.',
            ' *',
            ' * Estructura del grafo:',
            ' *',
            ' *   plugin (especial)',
            ' *   └── pruebas (contenedor principal)',
            ' *       ├── <id_prueba_1>          (contenedor del mini-árbol)',
            ' *       │   ├── corriendo          (autoenlace, si corre ahora)',
            ' *       │   └── hmi → corrida_<t5>',
            ' *       │       └── hd → corrida_<t4>',
            ' *       │           └── hd → ...',
            ' *       │               └── hd → <id_prueba_1>  (cierre)',
            ' *       └── <id_prueba_2>',
            ' *           └── hmi → corrida_<tN>',
            ' *',
            ' * Cada corrida guarda: resultado, fecha_hora, duracion_ms,',
            ' * detalle (opcional). El id_prueba se infiere del contenedor',
            ' * padre.',
            ' *',
            ' * Máximo CORRIDAS_POR_PRUEBA_MAX corridas por prueba. Al',
            ' * insertar, si se supera, se destruye la más vieja.',
            ' *',
            ' * El autoenlace `corriendo` en el contenedor de la prueba',
            ' * sirve doble: (a) marca visual en el popup, (b) protección',
            ' * contra destrucción accidental del contenedor mientras la',
            ' * prueba corre.',
            ' *',
            ' * @version 1.5plugin.8b',
            ' * @since 1.5plugin.5t',
            ' */',
            '',
            'import { Nodo } from "../Nodos/index.js";',
            'import { obtener_controlador } from "./arranque.js";',
            'import { NOMBRE_GRAFO, CORRIDAS_POR_PRUEBA_MAX } from "./ConfiguracionApli.js";',
            'import { _hmi, hmi, hd } from "../miscelaneas/index.js";',
            '',
            'let _grafo_cargado = false;',
            '',
            '/**',
            ' * Carga el grafo del plugin si existe, o crea la estructura',
            ' * inicial si es la primera vez. Idempotente mientras la',
            ' * variable `_grafo_cargado` esté en true.',
            ' *',
            ' * Si el grafo existe y tiene la estructura vieja (contenedor',
            ' * `corridas` plano), la migra a la nueva (`pruebas` con',
            ' * mini-árboles por prueba).',
            ' *',
            ' * @returns {Promise<void>}',
            ' */',
            'export async function asegurar_grafo_cargado() {',
            '    if (_grafo_cargado) return;',
            '',
            '    const Controlador = await obtener_controlador();',
            '    const existe = await Controlador.existe(NOMBRE_GRAFO);',
            '',
            '    if (existe) {',
            '        const ok = await Controlador.cargar(NOMBRE_GRAFO);',
            '        if (!ok) {',
            '            throw new Error("El grafo existe pero no se pudo cargar");',
            '        }',
            '        const migrado = _migrar_estructura_si_hace_falta();',
            '        if (migrado) {',
            '            await Controlador.guardar(NOMBRE_GRAFO);',
            '        }',
            '    } else {',
            '        Nodo.vaciar_superestructura(Controlador.token);',
            '        _crear_estructura_inicial();',
            '        const ok = await Controlador.guardar(NOMBRE_GRAFO);',
            '        if (!ok) {',
            '            throw new Error("No se pudo guardar el grafo inicial");',
            '        }',
            '    }',
            '',
            '    _grafo_cargado = true;',
            '}',
            '',
            'function _crear_estructura_inicial() {',
            '    const raiz = Nodo.crear_con_id("plugin");',
            '    const pruebas = Nodo.crear_con_dato("");',
            '    raiz._adyacente_en(pruebas, "pruebas");',
            '}',
            '',
            '/**',
            ' * Migración de la estructura vieja (contenedor `corridas`',
            ' * colgando de `plugin`) a la nueva (contenedor `pruebas`).',
            ' * Destruye el contenedor viejo y sus nodos. Crea el nuevo',
            ' * si no existe. Devuelve true si hubo cambios que guardar.',
            ' *',
            ' * @returns {boolean}',
            ' */',
            'function _migrar_estructura_si_hace_falta() {',
            '    const raiz = Nodo.nodo_por_id("plugin");',
            '    if (!raiz) {',
            '        _crear_estructura_inicial();',
            '        return true;',
            '    }',
            '',
            '    let hubo_cambios = false;',
            '',
            '    const corridas_viejo = raiz.adyacente("corridas");',
            '    if (corridas_viejo) {',
            '        _destruir_contenedor_corridas_viejo(raiz, corridas_viejo);',
            '        hubo_cambios = true;',
            '    }',
            '',
            '    if (!raiz.adyacente("pruebas")) {',
            '        const pruebas = Nodo.crear_con_dato("");',
            '        raiz._adyacente_en(pruebas, "pruebas");',
            '        hubo_cambios = true;',
            '    }',
            '',
            '    return hubo_cambios;',
            '}',
            '',
            '/**',
            ' * Destruye el contenedor `corridas` viejo y todos sus',
            ' * nodos hijos (con sus campos). Los datos viejos no son',
            ' * compatibles con la estructura nueva; se descartan.',
            ' */',
            'function _destruir_contenedor_corridas_viejo(raiz, corridas) {',
            '    const hijos = corridas.adyacentes();',
            '    if (hijos) {',
            '        for (const [nombre, nodo] of Object.entries(hijos)) {',
            '            const campos = nodo.adyacentes();',
            '            if (campos) {',
            '                for (const [nombre_campo, nodo_campo] of Object.entries(campos)) {',
            '                    nodo.eliminar_adyacente(nombre_campo);',
            '                    Nodo.eliminar(nodo_campo);',
            '                }',
            '            }',
            '            corridas.eliminar_adyacente(nombre);',
            '            Nodo.eliminar(nodo);',
            '        }',
            '    }',
            '    raiz.eliminar_adyacente("corridas");',
            '    Nodo.eliminar(corridas);',
            '}',
            '',
            '/**',
            ' * Asegura que exista el contenedor de la prueba con ese',
            ' * id. Lo crea si no existe. Devuelve el nodo.',
            ' *',
            ' * @param {string} id_prueba',
            ' * @returns {Nodo}',
            ' */',
            'function _asegurar_contenedor_prueba(id_prueba) {',
            '    const raiz = Nodo.nodo_por_id("plugin");',
            '    if (!raiz) throw new Error("No se encontró el nodo raíz del plugin");',
            '    const pruebas = raiz.adyacente("pruebas");',
            '    if (!pruebas) throw new Error("No se encontró el contenedor \'pruebas\'");',
            '',
            '    let cont = pruebas.adyacente(id_prueba);',
            '    if (!cont) {',
            '        cont = Nodo.crear_con_dato(id_prueba);',
            '        pruebas._adyacente_en(cont, id_prueba);',
            '    }',
            '    return cont;',
            '}',
            '',
            '/**',
            ' * Registra una corrida. Inserta la nueva corrida como hmi',
            ' * del contenedor de la prueba, y poda si excede el límite.',
            ' *',
            ' * @param {Object} datos',
            ' * @param {string} datos.id_prueba',
            ' * @param {string} datos.fecha_hora  ISO',
            ' * @param {string} datos.resultado   "ok" / "fallo" / "error"',
            ' * @param {number} datos.duracion_ms',
            ' * @param {string} [datos.detalle]',
            ' * @returns {Promise<string>} id de la corrida creada.',
            ' */',
            'export async function registrar_corrida(datos) {',
            '    await asegurar_grafo_cargado();',
            '',
            '    const Controlador = await obtener_controlador();',
            '    const cont = _asegurar_contenedor_prueba(datos.id_prueba);',
            '',
            '    const id_corrida = "corrida_" + Date.now();',
            '    const corrida = Nodo.crear_con_dato(id_corrida);',
            '    corrida._adyacente_en(Nodo.crear_con_dato(String(datos.fecha_hora)), "fecha_hora");',
            '    corrida._adyacente_en(Nodo.crear_con_dato(String(datos.resultado)), "resultado");',
            '    corrida._adyacente_en(Nodo.crear_con_dato(String(datos.duracion_ms)), "duracion_ms");',
            '    if (datos.detalle) {',
            '        corrida._adyacente_en(Nodo.crear_con_dato(String(datos.detalle)), "detalle");',
            '    }',
            '',
            '    // Insertar como hmi. _hmi pone p al contenedor y hd al',
            '    // antiguo hmi (si existía).',
            '    const tenia_hmi = hmi(cont) !== null;',
            '    _hmi(cont, corrida);',
            '',
            '    // Cerrar ciclo: el último nodo de la cadena (el más viejo)',
            '    // debe apuntar al contenedor vía hd.',
            '    if (!tenia_hmi) {',
            '        corrida._adyacente_en(cont, "hd");',
            '    }',
            '',
            '    _podar_si_excede(cont);',
            '',
            '    const ok = await Controlador.guardar(NOMBRE_GRAFO);',
            '    if (!ok) throw new Error("No se pudo guardar el grafo tras registrar la corrida");',
            '',
            '    return id_corrida;',
            '}',
            '',
            '/**',
            ' * Recorre la cadena de corridas desde el hmi hasta llegar',
            ' * al contenedor (cierre). Devuelve el array de nodos, del',
            ' * más nuevo al más viejo. Si `limite` está seteado, corta',
            ' * al alcanzarlo.',
            ' *',
            ' * @param {Nodo} cont',
            ' * @param {number} [limite=Infinity]',
            ' * @returns {Nodo[]}',
            ' */',
            'function _recorrer_corridas(cont, limite = Infinity) {',
            '    const corridas = [];',
            '    let actual = hmi(cont);',
            '    let contador = 0;',
            '    while (actual && actual !== cont && contador < limite) {',
            '        corridas.push(actual);',
            '        actual = hd(actual);',
            '        contador++;',
            '        if (contador > 1000) break;',
            '    }',
            '    return corridas;',
            '}',
            '',
            '/**',
            ' * Si la cadena de corridas excede el máximo, destruye las',
            ' * más viejas. Reasigna el hd del penúltimo al contenedor',
            ' * (cierre) antes de destruir el sobrante.',
            ' *',
            ' * @param {Nodo} cont',
            ' * @param {number} [max=CORRIDAS_POR_PRUEBA_MAX]',
            ' */',
            'function _podar_si_excede(cont, max = CORRIDAS_POR_PRUEBA_MAX) {',
            '    const corridas = _recorrer_corridas(cont);',
            '    if (corridas.length <= max) return;',
            '',
            '    for (let i = max; i < corridas.length; i++) {',
            '        const sobrante = corridas[i];',
            '        const anterior = corridas[i - 1];',
            '        const siguiente = hd(sobrante);',
            '',
            '        // El anterior apunta ahora al siguiente del sobrante',
            '        // (que es otro nodo de la cadena o el contenedor).',
            '        anterior._adyacente_en(siguiente, "hd", true);',
            '',
            '        // Destruir los campos de datos del sobrante.',
            '        const campos = sobrante.adyacentes();',
            '        if (campos) {',
            '            for (const [nombre, nodo_campo] of Object.entries(campos)) {',
            '                if (nombre === "hd" || nombre === "p") continue;',
            '                sobrante.eliminar_adyacente(nombre);',
            '                Nodo.eliminar(nodo_campo);',
            '            }',
            '        }',
            '        sobrante.eliminar_adyacente("hd");',
            '        sobrante.eliminar_adyacente("p");',
            '        Nodo.eliminar(sobrante);',
            '    }',
            '}',
            '',
            '// ============================================================',
            '// Estado "en vivo" (autoenlace `corriendo` en el contenedor)',
            '// ============================================================',
            '',
            '/**',
            ' * Marca la prueba como corriendo: agrega un autoenlace',
            ' * `corriendo` en su contenedor. Idempotente.',
            ' *',
            ' * @param {string} id_prueba',
            ' * @returns {Promise<void>}',
            ' */',
            'export async function marcar_en_vivo(id_prueba) {',
            '    await asegurar_grafo_cargado();',
            '    const Controlador = await obtener_controlador();',
            '    const cont = _asegurar_contenedor_prueba(id_prueba);',
            '',
            '    if (!cont.adyacente("corriendo")) {',
            '        cont._adyacente_en(cont, "corriendo");',
            '        const ok = await Controlador.guardar(NOMBRE_GRAFO);',
            '        if (!ok) throw new Error("No se pudo marcar la prueba como en vivo");',
            '    }',
            '}',
            '',
            '/**',
            ' * Quita la marca `corriendo` del contenedor de la prueba.',
            ' * Idempotente: si no está marcado, no hace nada.',
            ' *',
            ' * @param {string} id_prueba',
            ' * @returns {Promise<void>}',
            ' */',
            'export async function limpiar_en_vivo(id_prueba) {',
            '    await asegurar_grafo_cargado();',
            '    const Controlador = await obtener_controlador();',
            '    const raiz = Nodo.nodo_por_id("plugin");',
            '    if (!raiz) return;',
            '    const pruebas = raiz.adyacente("pruebas");',
            '    if (!pruebas) return;',
            '    const cont = pruebas.adyacente(id_prueba);',
            '    if (!cont) return;',
            '    if (cont.adyacente("corriendo")) {',
            '        cont.eliminar_adyacente("corriendo");',
            '        await Controlador.guardar(NOMBRE_GRAFO);',
            '    }',
            '}',
            '',
            '/**',
            ' * Limpia todos los autoenlaces `corriendo` colgados de',
            ' * cualquier contenedor de prueba. Se llama al arrancar',
            ' * el service worker, para no dejar marcas de una corrida',
            ' * anterior interrumpida (por ejemplo, si el SW murió por',
            ' * inactividad a mitad de una prueba).',
            ' *',
            ' * @returns {Promise<number>} cuántos se limpiaron.',
            ' */',
            'export async function limpiar_autoenlaces_colgados() {',
            '    await asegurar_grafo_cargado();',
            '    const Controlador = await obtener_controlador();',
            '    const raiz = Nodo.nodo_por_id("plugin");',
            '    if (!raiz) return 0;',
            '    const pruebas = raiz.adyacente("pruebas");',
            '    if (!pruebas) return 0;',
            '',
            '    let limpiados = 0;',
            '    const ady = pruebas.adyacentes();',
            '    if (ady) {',
            '        for (const [nombre, cont] of Object.entries(ady)) {',
            '            if (cont.adyacente("corriendo")) {',
            '                cont.eliminar_adyacente("corriendo");',
            '                limpiados++;',
            '            }',
            '        }',
            '    }',
            '    if (limpiados > 0) {',
            '        await Controlador.guardar(NOMBRE_GRAFO);',
            '    }',
            '    return limpiados;',
            '}',
            '',
            '// ============================================================',
            '// Estado consolidado por prueba',
            '// ============================================================',
            '',
            '/**',
            ' * Devuelve, para cada prueba, el estado consolidado:',
            ' *   {',
            ' *     ultima: { resultado, fecha_hora, duracion_ms, detalle } | null,',
            ' *     historial: [ ...hasta CORRIDAS_POR_PRUEBA_MAX ],',
            ' *     corriendo: bool',
            ' *   }',
            ' *',
            ' * Si una prueba no tiene corridas, no aparece en el resultado.',
            ' * Las corridas del historial van de la más reciente a la más',
            ' * vieja.',
            ' *',
            ' * @param {number} [limite=CORRIDAS_POR_PRUEBA_MAX]',
            ' * @returns {Promise<Object>}  { [id_prueba]: { ... } }',
            ' */',
            'export async function obtener_estado_por_prueba(limite = CORRIDAS_POR_PRUEBA_MAX) {',
            '    await asegurar_grafo_cargado();',
            '',
            '    const raiz = Nodo.nodo_por_id("plugin");',
            '    if (!raiz) return {};',
            '    const pruebas = raiz.adyacente("pruebas");',
            '    if (!pruebas) return {};',
            '',
            '    const resultado = {};',
            '    const ady = pruebas.adyacentes();',
            '    if (!ady) return resultado;',
            '',
            '    for (const [id_prueba, cont] of Object.entries(ady)) {',
            '        const corridas = _recorrer_corridas(cont, limite);',
            '        const historial = corridas.map((nodo) => ({',
            '            resultado: _dato_adyacente(nodo, "resultado"),',
            '            fecha_hora: _dato_adyacente(nodo, "fecha_hora"),',
            '            duracion_ms: _dato_adyacente(nodo, "duracion_ms"),',
            '            detalle: _dato_adyacente(nodo, "detalle"),',
            '        }));',
            '        const corriendo = cont.adyacente("corriendo") !== null;',
            '        resultado[id_prueba] = {',
            '            ultima: historial.length > 0 ? historial[0] : null,',
            '            historial,',
            '            corriendo,',
            '        };',
            '    }',
            '    return resultado;',
            '}',
            '',
            '/**',
            ' * Lee el dato de un adyacente con nombre, como string.',
            ' * Devuelve "" si no existe.',
            ' *',
            ' * @param {Nodo} nodo',
            ' * @param {string} enlace',
            ' * @returns {string}',
            ' */',
            'function _dato_adyacente(nodo, enlace) {',
            '    const hijo = nodo.adyacente(enlace);',
            '    if (!hijo) return "";',
            '    const d = hijo.dato();',
            '    return d === null || d === undefined ? "" : String(d);',
            '}',
        ],
    ],

    // ============================================================
    // E) servicio.js: comentario del header (mensajes que atiende)
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'Actualizar comentario del header',
        'buscar' => [
            ' * - `listar_corridas` -> devuelve las ultimas corridas del grafo.',
        ],
        'reemplazar' => [
            ' * - `estado_pruebas`  -> devuelve el estado consolidado por prueba.',
        ],
    ],

    // ============================================================
    // F) servicio.js: import de GrafoPlugin
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'Actualizar import de GrafoPlugin',
        'buscar' => [
            'import { registrar_corrida, listar_ultimas_corridas } from "./GrafoPlugin.js";',
        ],
        'reemplazar' => [
            'import { registrar_corrida, marcar_en_vivo, limpiar_en_vivo, limpiar_autoenlaces_colgados, obtener_estado_por_prueba } from "./GrafoPlugin.js";',
        ],
    ],

    // ============================================================
    // G) servicio.js: reemplazar la sección de chrome.storage.session
    //    por helpers de notificación a la ventana.
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'Eliminar session, dejar solo notificaciones',
        'buscar' => [
            '// ============================================================',
            '// Estado en vivo de la corrida',
            '// ============================================================',
            '//',
            '// Vive en chrome.storage.session: sobrevive al cierre del',
            '// popup (mientras el navegador este abierto), pero muere al',
            '// cerrar Chrome. El SW lo escribe cuando arranca una prueba',
            '// y lo limpia cuando termina. El popup lo lee al abrirse y',
            '// escucha las notificaciones para actualizar en vivo.',
            'const ESTADO_EN_VIVO_KEY = "plugin_estado_en_vivo";',
            '',
            'async function _guardar_estado_en_vivo(estado) {',
            '    try {',
            '        await chrome.storage.session.set({ [ESTADO_EN_VIVO_KEY]: estado });',
            '    } catch (e) {',
            '        console.warn("No se pudo guardar el estado en vivo:", e);',
            '    }',
            '}',
            '',
            'async function _leer_estado_en_vivo() {',
            '    try {',
            '        const r = await chrome.storage.session.get([ESTADO_EN_VIVO_KEY]);',
            '        return r[ESTADO_EN_VIVO_KEY] || null;',
            '    } catch (e) {',
            '        console.warn("No se pudo leer el estado en vivo:", e);',
            '        return null;',
            '    }',
            '}',
            '',
            'async function _limpiar_estado_en_vivo() {',
            '    try {',
            '        await chrome.storage.session.remove([ESTADO_EN_VIVO_KEY]);',
            '    } catch (e) {',
            '        console.warn("No se pudo limpiar el estado en vivo:", e);',
            '    }',
            '}',
            '',
            'function _notificar_estado_en_vivo(estado) {',
            '    try {',
            '        chrome.runtime.sendMessage(',
            '            { tipo: "estado_en_vivo_cambio", estado }',
            '        ).catch(function () { /* nadie escuchando */ });',
            '    } catch (e) { /* ignorar */ }',
            '}',
        ],
        'reemplazar' => [
            '// ============================================================',
            '// Notificaciones a la ventana',
            '// ============================================================',
            '//',
            '// El estado "en vivo" (qué prueba corre ahora) vive en el',
            '// grafo, como autoenlace `corriendo` en el contenedor de',
            '// cada prueba. Acá solo mandamos notificaciones para que',
            '// el popup actualice en vivo sin tener que releer todo.',
            'function _notificar_corrida_iniciada(id_prueba) {',
            '    try {',
            '        chrome.runtime.sendMessage(',
            '            { tipo: "corrida_iniciada", id_prueba }',
            '        ).catch(function () { /* nadie escuchando */ });',
            '    } catch (e) { /* ignorar */ }',
            '}',
            '',
            'function _notificar_corrida_terminada(payload) {',
            '    try {',
            '        chrome.runtime.sendMessage(',
            '            Object.assign({ tipo: "corrida_terminada" }, payload)',
            '        ).catch(function () { /* nadie escuchando */ });',
            '    } catch (e) { /* ignorar */ }',
            '}',
        ],
    ],

    // ============================================================
    // H) servicio.js: IIFE inicial que limpiaba session
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'IIFE inicial: limpiar autoenlaces colgados',
        'buscar' => [
            '// Al arrancar el SW, limpiar cualquier estado en vivo',
            '// colgado de una corrida anterior. Si el SW se reinicio',
            '// por inactividad a mitad de una prueba, el estado queda',
            '// con corriendo: true sin que nadie lo haya terminado.',
            '// Solo limpiamos; el usuario vera el popup sin marcas.',
            '(async () => {',
            '    try {',
            '        const estado = await _leer_estado_en_vivo();',
            '        if (estado && estado.corriendo) {',
            '            await _limpiar_estado_en_vivo();',
            '        }',
            '    } catch (e) { /* ignorar */ }',
            '})();',
        ],
        'reemplazar' => [
            '// Al arrancar el SW, limpiar cualquier autoenlace `corriendo`',
            '// que haya quedado colgado de una corrida anterior. Si el SW',
            '// se reinicio por inactividad a mitad de una prueba, el nodo',
            '// queda marcado sin que nadie lo haya terminado.',
            '(async () => {',
            '    try {',
            '        await limpiar_autoenlaces_colgados();',
            '    } catch (e) { /* ignorar */ }',
            '})();',
        ],
    ],

    // ============================================================
    // I) servicio.js: _correr_prueba (marcar / limpiar + broadcasts)
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => '_correr_prueba: usar marcar/limpiar_en_vivo',
        'buscar' => [
            '    const ctx = _crear_ctx(pestana.id);',
            '    const inicio = Date.now();',
            '    let resultado = "ok";',
            '    let detalle = "";',
            '',
            '    // Estado en vivo: marcar "corriendo".',
            '    await _guardar_estado_en_vivo({ corriendo: true, id_prueba, inicio });',
            '    _notificar_estado_en_vivo({ corriendo: true, id_prueba, inicio });',
            '',
            '    try {',
            '        await prueba.ejecutar(ctx);',
            '    } catch (e) {',
            '        resultado = "fallo";',
            '        detalle = e && e.message ? e.message : String(e);',
            '    }',
            '',
            '    const duracion_ms = Date.now() - inicio;',
            '',
            '    try {',
            '        await registrar_corrida({',
            '            id_prueba,',
            '            fecha_hora: new Date().toISOString(),',
            '            resultado,',
            '            duracion_ms,',
            '            detalle',
            '        });',
            '    } catch (e) {',
            '        console.error("No se pudo persistir la corrida:", e);',
            '    }',
            '',
            '    // Estado en vivo: marcar "terminada".',
            '    await _limpiar_estado_en_vivo();',
            '    _notificar_estado_en_vivo({ corriendo: false, id_prueba, duracion_ms, resultado });',
            '',
            '    return { exito: true, resultado, detalle, duracion_ms };',
        ],
        'reemplazar' => [
            '    const ctx = _crear_ctx(pestana.id);',
            '    const inicio = Date.now();',
            '    let resultado = "ok";',
            '    let detalle = "";',
            '',
            '    // Marcar la prueba como corriendo en el grafo.',
            '    try {',
            '        await marcar_en_vivo(id_prueba);',
            '    } catch (e) {',
            '        console.warn("No se pudo marcar la prueba como en vivo:", e);',
            '    }',
            '    _notificar_corrida_iniciada(id_prueba);',
            '',
            '    try {',
            '        await prueba.ejecutar(ctx);',
            '    } catch (e) {',
            '        resultado = "fallo";',
            '        detalle = e && e.message ? e.message : String(e);',
            '    }',
            '',
            '    const duracion_ms = Date.now() - inicio;',
            '    const fecha_hora = new Date().toISOString();',
            '',
            '    try {',
            '        await registrar_corrida({',
            '            id_prueba,',
            '            fecha_hora,',
            '            resultado,',
            '            duracion_ms,',
            '            detalle',
            '        });',
            '    } catch (e) {',
            '        console.error("No se pudo persistir la corrida:", e);',
            '    }',
            '',
            '    // Quitar la marca de "corriendo" del grafo.',
            '    try {',
            '        await limpiar_en_vivo(id_prueba);',
            '    } catch (e) {',
            '        console.warn("No se pudo limpiar la marca en vivo:", e);',
            '    }',
            '    _notificar_corrida_terminada({ id_prueba, resultado, fecha_hora, duracion_ms, detalle });',
            '',
            '    return { exito: true, resultado, detalle, duracion_ms };',
        ],
    ],

    // ============================================================
    // J) servicio.js: switch — reemplazar estado_en_vivo y listar_corridas
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'Switch: estado_pruebas en lugar de estado_en_vivo/listar_corridas',
        'buscar' => [
            '                case "estado_en_vivo": {',
            '                    const estado_ev = await _leer_estado_en_vivo();',
            '                    sendResponse({ exito: true, estado: estado_ev });',
            '                    break;',
            '                }',
            '',
            '',
            '                case "listar_corridas":',
            '                    const corridas = await listar_ultimas_corridas(mensaje.limite || 20);',
            '                    sendResponse({ exito: true, corridas });',
            '                    break;',
        ],
        'reemplazar' => [
            '                case "estado_pruebas": {',
            '                    const por_prueba = await obtener_estado_por_prueba();',
            '                    sendResponse({ exito: true, por_prueba });',
            '                    break;',
            '                }',
        ],
    ],
];

// ============================================================
// Runner v2 (copiar textual de §14 del prompt_sistema_scripts_v2)
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

// --- Fase 2: bumps automáticos ---
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

foreach ($eliminaciones as $elim) {
    $ruta_abs = $raiz_proyecto . '/' . $elim['archivo'];
    if (!file_exists($ruta_abs)) { echo "[INFO] " . $elim['archivo'] . " no existía.\n"; continue; }
    if (unlink($ruta_abs)) echo "[OK] " . $elim['archivo'] . " (eliminado)\n";
    else echo "[FALLO] No se pudo eliminar: " . $elim['archivo'] . "\n";
}

// --- Reporte de bumps ---
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