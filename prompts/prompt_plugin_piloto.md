# Prompt de trabajo — Plugin de pruebas (Chrome MV3)

Este es un prompt autocontenido con todo lo que sabemos sobre el
**plugin piloto**: una extensión de Chrome (manifest v3) que corre
pruebas automatizadas sobre la página del piloto PHP, usando el
framework Iteradores JS para persistir su propia información.

Vive en el propio proyecto, en
`iteradoresJS/prompts/prompt_plugin_piloto.md`. El proyecto
`iteradoresJS/` es un repo independiente del proyecto PHP; el
prompt del framework Iteradores y el del sistema de scripts
siguen viviendo en el proyecto PHP (`iteradores/prompts/`).

Se actualiza con **cada tanda de código**. La sección
**Discusión actual** (al final) es la fuente de verdad sobre
dónde quedamos.

Los scripts de aplicación de cambios se corren parados en la
raíz de `iteradoresJS/` y usan el mismo formato y runner que en
el proyecto PHP (ver `prompt_sistema_scripts.md` en el proyecto
PHP).

---

## 1. VISIÓN DEL PLUGIN

### 1.1 Objetivo

Extensión de Chrome que permite correr pruebas automatizadas
sobre la página del piloto PHP (agencia de viajes). El usuario
abre la ventana del plugin (popup), ve una lista de pruebas
disponibles, y aprieta un botón play en la que quiere correr.
La extensión ejecuta la prueba contra la pestaña activa del
piloto, y guarda el resultado en su propio grafo.

### 1.2 Objetivos secundarios

- Servir de ejercicio real del framework Iteradores JS
  (persistido en IndexedDB del contexto de la extensión).
- Aprovechar el sistema de comandos y el motor (comandos +
  péndulo) cuando haga falta ejecución por fases.
- Ser la base de una herramienta más amplia: inspeccionar el
  grafo del piloto, generar reportes, correr tandas completas.

### 1.3 Relación con el piloto PHP

El plugin **no modifica** el piloto PHP. Solo lo observa y lo
maneja como un usuario. Puede:

- Leer el DOM de la página.
- Hacer clics, escribir, esperar.
- Hacer `fetch` a `index.php` con la sesión del usuario actual
  (las cookies viajan por estar en el mismo origen que la
  pestaña, siempre que el `fetch` se haga desde el script de
  contenido).

---

## 2. ESTRUCTURA DE ARCHIVOS

**Raíz de `iteradoresJS/`:**

- `manifest.json` — manifiesto MV3. **Debe estar en la raíz**
  del directorio cargado como extensión; Chrome no acepta
  manifiestos anidados. El código apunta a `Aplicacion/...`
  vía paths relativos.
- Framework (`Nodos/`, `Iteradores/`, `Controlador/`,
  `Configuracion/`, `miscelaneas/`, `Persistencia/`, etc.) —
  sin tocar.
- `index.html`, `index.js` — entrada web actual del framework,
  sin tocar.

**`prompts/`:**

- `prompt_plugin_piloto.md` — este archivo.

**`Aplicacion/`:**

- `servicio.js` — service worker. **Module** (`type: "module"`
  en el manifest). Arranca el framework, importa el catálogo
  de pruebas y las corre por pedido de la ventana.
- `contenido.js` — script de contenido clásico. Se inyecta en
  la página del piloto. Expone funciones vía mensajería.
- `ventana.html` / `ventana.js` — interfaz de la ventana
  (popup de Chrome). Lista las pruebas, muestra el resultado
  de la última corrida.
- `arranque.js` — arranque del framework en el service worker.
  Fuerza `Entorno` a modo consola y `salida=consola`, y
  configura `ConfPlugin`.
- `ConfPlugin.js` — configuración propia del plugin (nombre de
  app, nombre de la BD IndexedDB).
- `GrafoPlugin.js` — capa fina sobre el framework: persistir
  corridas, leer historial, etc.
- `pruebas/` — catálogo de pruebas. Cada prueba es un módulo ES
  que exporta un objeto `{id, nombre, descripcion, ejecutar}`.
  `pruebas/catalogo.js` las lista.

---

## 3. LIMITACIONES Y DECISIONES TÉCNICAS

### 3.1 Manifest en la raíz

Chrome MV3 exige que `manifest.json` esté en la raíz del
directorio que se carga como extensión. Como el plugin necesita
importar `../Nodos/Nodo.js` y demás archivos del framework, el
manifest tiene que estar un nivel arriba de `Aplicacion/`,
esto es, en la raíz del proyecto `iteradoresJS/`.

Los paths del manifest son relativos a esa raíz:

    "background": { "service_worker": "Aplicacion/servicio.js", "type": "module" }
    "action":     { "default_popup":    "Aplicacion/ventana.html" }
    "content_scripts": [{ "js": ["Aplicacion/contenido.js"] }]

### 3.2 Service worker en modo consola

En un service worker no existe `document`. Los caminos HTML del
framework (`_imprimir_errores_html`, `html_errores`,
`_imprimir_alertas_html`, `html_alertas`, `Nodo._imprimir_html`,
`Controlador.imprimir_superestructura`) tocan `document` y
romperían. Se evitan asegurando que `Entorno.es_consola()`
devuelva `true` en el arranque del SW.

### 3.3 Script de contenido clásico

Los scripts de contenido de MV3 no pueden ser módulos ES. Se
comunican con el service worker por mensajería:

- SW → contenido: `chrome.tabs.sendMessage(pestana_id, { tipo, datos })`.
- Contenido → SW: `chrome.runtime.sendMessage({ tipo, datos })`.

El SW hace de orquestador: importa las pruebas, coordina las
llamadas al script de contenido, persiste resultados.

### 3.4 Token de seguridad

El plugin **no maneja el token** del framework. El Controlador
lo recibe automáticamente cuando el módulo `Controlador` se
evalúa (vía `Nodo.registrar_controlador`). Para código que
necesite el token, se usa:

    await Controlador.ejecutar_prueba((token) => {
        // usar token
    });

### 3.5 Motor (comandos + péndulo)

El motor y el sistema de comandos **no se usan en la primera
versión**. Quedan disponibles para cuando haga falta ejecución
por fases. Recordatorio sobre la config:

- `MOTOR_MAX_CICLOS` — ciclos **totales** que ejecuta el motor
  antes de detenerse. `0` = infinito.
- `MOTOR_QUANTUM` — comandos ejecutados por ciclo.
- `MOTOR_CICLOS_POR_MINUTO` — frecuencia.

### 3.6 Geolocalización

`Controlador.inicializar()` intenta obtener coordenadas
(navegador → IP → fallback). En el SW puede fallar. Ya tiene
fallback a coordenadas predeterminadas en `Conf`, así que no
es bloqueante.

### 3.7 Vocabulario

Preferimos español para todo lo propio del plugin. Las palabras
que Chrome impone (`manifest.json`, claves del manifest, API de
`chrome.*`) quedan como están. En comentarios se aceptan los
términos técnicos del ecosistema: "service worker", "script de
contenido" (o "content script"), "popup" (o "ventana"),
"plugin". Los archivos propios llevan nombres en español:
`arranque.js`, `servicio.js`, `contenido.js`, `ventana.html`,
`ventana.js`.

---

## 4. FORMATO DE PRUEBA

Cada prueba es un módulo ES con un objeto exportado:

    export const prueba = {
        id: "arranque",
        nombre: "Arranque: plugin y script de contenido",
        descripcion: "Verifica que el script de contenido responde...",
        async ejecutar(ctx) {
            // ctx.pestana_id  -> id de la pestaña del piloto
            // ctx.enviar      -> envía un mensaje crudo al script de contenido
            // ctx.clic        -> click sobre un selector
            // ctx.escribir    -> escribe en un input
            // ctx.esperar     -> espera a que exista un selector
            // ctx.texto       -> devuelve el textContent de un selector
            // ctx.html        -> devuelve el outerHTML de un selector
            // ctx.pedir_post  -> POST urlencoded a index.php
            // ctx.assert      -> aserción simple
        }
    };

`ctx` lo provee el service worker. La prueba no habla
directamente con la API de Chrome; todo pasa por `ctx`.

### 4.1 Resultado

Cada corrida persiste un nodo en el grafo del plugin con:

- `id_prueba`
- `fecha_hora` (ISO)
- `resultado` (`"ok"` / `"fallo"` / `"error"`)
- `duracion_ms`
- `detalle` (texto libre)

---

## 5. ESTADO ACTUAL

**Proyecto en v1.5plugin.2.** El esqueleto del plugin está
armado y funcional, con nombres en español. Archivos:

- `manifest.json` — manifiesto MV3 en la raíz.
- `Aplicacion/servicio.js` — service worker (module).
- `Aplicacion/contenido.js` — script de contenido clásico.
- `Aplicacion/ventana.html` / `ventana.js` — interfaz de la
  ventana.
- `Aplicacion/arranque.js` — arranque del framework en el SW.
- `Aplicacion/ConfPlugin.js` — configuración propia.
- `Aplicacion/GrafoPlugin.js` — capa sobre el framework.
- `Aplicacion/pruebas/catalogo.js` — catálogo de pruebas.
- `Aplicacion/pruebas/prueba_01_arranque.js` — primera prueba.

---

## 6. DISCUSIÓN ACTUAL

**Última actualización de este prompt:** v1.5plugin.3 (infra
mínima del catálogo + primera prueba real: `ConfPlugin.js`
centraliza `URL_PILOTO` y los códigos de usuario; `contenido.js`
suma comandos de visibilidad; `ctx` gana `url_base`, `login`,
`cerrar_sesion`, `dni_unico`, `texto_unico`, `esta_visible`,
`esperar_visible`, `esperar_oculto`; nueva prueba `login_admin`.
La auditoría ahora chequea que `URL_PILOTO` esté cubierta por
`host_permissions` y `content_scripts.matches` del manifest.).

**Decisiones tomadas:**

- Manifest en la raíz de `iteradoresJS/` (opción A).
- Código del plugin en `Aplicacion/`.
- Persistencia con `PerdurarSuperestructuraStringIndexedDB`.
- Salida en modo consola dentro del service worker.
- Script de contenido clásico, comunicación por mensajería.
- Formato de prueba declarativo con objeto `{id, nombre,
  ejecutar(ctx)}`.
- El motor y los comandos no se usan en la primera versión.
- Nombre de app del plugin: `IteradoresPluginPruebas`.
- Prefijo de versión del plugin: `v1.5plugin.*`.
- Español para nombres propios del plugin. "Plugin" se mantiene
  (nombre muy conocido). Las palabras del ecosistema Chrome
  (`manifest`, `service worker`, `content script`, `popup`)
  se aceptan en comentarios y en el manifest.

**Entorno de pruebas (v1.5plugin.3):**

- **URL del piloto:** `http://localhost/iteradores/codigo.worktrees/v1.5i/`.
  Vive en `Aplicacion/ConfPlugin.js` como `URL_PILOTO`.
- **Códigos de usuario del piloto:**
  - admin:    `IBD`
  - dueño:    `carmen1`
  - terminal: `carmen2`
  - terminal: `lujan2`
  - soporte:  `manolo3`
- **Permisos del manifest:**
  - `host_permissions`: `http://localhost/*` y
    `http://127.0.0.1/*`. Cubre la URL del piloto.
  - `permissions`: `activeTab`, `tabs`.

**Vocabulario consolidado (v1.5plugin.2):**

| Concepto | Nombre en el proyecto |
|---|---|
| Archivo de arranque | `arranque.js` |
| Service worker | archivo `servicio.js` |
| Content script | archivo `contenido.js` |
| Popup | archivo `ventana.html` / `ventana.js` |
| Mensaje de saludo SW→contenido | `"saludo"` (respuesta `respuesta`) |
| Clic desde ctx | `ctx.clic(sel)` |
| POST desde ctx | `ctx.pedir_post(url, body)` |
| Prueba inicial | id `"arranque"` |

**Catálogo actual:**

- `arranque` — verifica SW ↔ contenido ↔ página.
- `login_admin` — entra con código del admin, verifica nivel.

**Pendiente:**

- **v1.5plugin.4:** pruebas de altas (pasajero, viaje, micro,
  terminal autorizada) con datos únicos. Cada prueba limpia lo
  que crea.
- **v1.5plugin.5:** pruebas de ventas y casos borde (ligaduras
  comprador↔pasajero, DNI duplicado, cupones, deshabilitar
  método). Es el objetivo que motivó el plugin.
- **v1.5plugin.6 (opcional):** historial de corridas en la
  ventana del plugin.
- Revisar los permisos del manifest cuando se pruebe contra
  un dominio real (hoy solo `localhost` / `127.0.0.1`).

**Lecciones aprendidas:**

- Al renombrar un archivo del plugin, hacer un grep del nombre
  viejo en todo `Aplicacion/` y actualizar **todas** las
  referencias, no solo las de los archivos que se tocan en la
  tanda. `GrafoPlugin.js` quedó apuntando a `./bootstrap.js`
  tras el rename de v1.5plugin.2.
- **Verificar el nombre exacto del archivo en disco antes de
  commitear.** `arranque.js` se creó como `arranqu.js` (sin la
  "e") y los imports apuntaban al nombre correcto. Chrome no
  podía resolver la cadena y daba el mismo error genérico que
  un import roto.
- **Correr `auditar_plugin.php` tras cada tanda que agregue o
  renombre archivos.** Detecta imports rotos, paths del
  manifest que no resuelven, y referencias a nombres viejos
  en comentarios y strings. Es rápido y evita perder tiempo
  con el error genérico de Chrome.
- Si Chrome muestra "unknown error when fetching the script" al
  registrar un service worker module, casi siempre es un import
  que no se puede resolver en la cadena (nombre mal escrito,
  archivo faltante). Diagnóstico rápido: reducir `servicio.js`
  a un `console.log` y agregar imports de a uno hasta que
  rompa.
- **Si `chrome.runtime.sendMessage` devuelve "Could not establish
  connection. Receiving end does not exist", el listener del
  service worker NO está registrado.** Primer chequeo: que
  `Aplicacion/servicio.js` no esté comentado. En v1.5plugin.2b
  un bloque de diagnóstico quedó pegado y comentó todo el
  archivo; el SW se registraba sin error pero nunca llamaba a
  `onMessage.addListener`, y el popup recibía el error de
  conexión.
- **Regla de diseño (v1.5plugin.2c):** el service worker
  registra el listener de mensajes PRIMERO y carga los módulos
  del plugin con `await import()` después. Así el listener
  siempre está disponible y cualquier fallo de carga se
  reporta al popup en texto claro, en vez de morir con el
  "unknown error" genérico de Chrome.
- **`auditar_plugin.php` tiene una sección que detecta archivos
  sospechosamente vacíos** (sección 5). Después de quitar
  comentarios de línea y de bloque, si el archivo queda sin
  líneas de código, lo reporta. También tiene la sección 6
  que cruza `URL_PILOTO` con `host_permissions` y
  `content_scripts.matches` del manifest.

---

**FIN DEL PROMPT**