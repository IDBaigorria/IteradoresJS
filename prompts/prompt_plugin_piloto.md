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

**Proyecto en v1.5plugin.3e.** El esqueleto del plugin está
armado y funcional, y ya tiene la primera prueba real (login
de admin). Archivos:

- `manifest.json` — manifiesto MV3 en la raíz.
- `Aplicacion/servicio.js` — service worker (module, imports
  estáticos).
- `Aplicacion/contenido.js` — script de contenido clásico, con
  comandos de visibilidad.
- `Aplicacion/ventana.html` / `ventana.js` — interfaz de la
  ventana (con reintentos de `sendMessage`).
- `Aplicacion/arranque.js` — arranque del framework en el SW.
- `Aplicacion/ConfPlugin.js` — configuración propia, URL del
  piloto y códigos de usuario.
- `Aplicacion/GrafoPlugin.js` — capa sobre el framework.
- `Aplicacion/pruebas/catalogo.js` — catálogo de pruebas.
- `Aplicacion/pruebas/prueba_01_arranque.js` — prueba de
  arranque.
- `Aplicacion/pruebas/prueba_02_login.js` — prueba de login.
- `Aplicacion/pruebas/_helpers.js` — helpers compartidos de
  las pruebas de venta.
- `Aplicacion/pruebas/prueba_03..17_venta_*.js` — 15 pruebas
  de venta y casos borde.
- `auditar_plugin.php` — auditoría con 6 secciones.

---

## 6. DISCUSIÓN ACTUAL

**Última actualización de este prompt:** v1.5plugin.4i (helpers
`esperar_valor` y `esperar_valor_vacio` que hacen polling
hasta que el valor del input sea el esperado. Usados en las
4 pruebas que dependen del fetch del DNI (ligadura x2,
corrección de DNI x2). Antes leían `ctx.valor` una sola vez
tras una pausa fija de 800 ms, y fallaban intermitentemente
cuando el fetch tardaba más).
Antes: v1.5plugin.4h (verificar
cupones por backend, no por DOM. La prueba `venta_cuotas`
leía la tarjeta de la venta en el DOM, pero como en v4f
dejamos de navegar a Vendidos, la tarjeta ya no está en el
DOM. Ahora se pide el detalle de la venta por POST
(`ventas/obtener`) y se verifican los cupones en el JSON.
Nuevo helper `obtener_venta_por_id(ctx, id_venta)`).
Antes: v1.5plugin.4g (cambio
de técnica para refrescar el croquis: el `<script>` inline
chocaba con el CSP de la página. Ahora se usa
`chrome.scripting.executeScript` con `world: "MAIN"` desde
el service worker, que no pasa por el DOM y no lo bloquea
el CSP. Requiere el permiso `scripting` en el manifest).
Antes: v1.5plugin.4f (no
navegar a la pestaña Vendidos desde el helper
`obtener_id_ultima_venta`: ahora pide el id por POST. Antes
navegar cerraba el modal del viaje y mataba el polling,
dejando el croquis congelado tras cancelar. Además,
`cancelar_venta` ahora dispara un mensaje
`refrescar_asientos_pagina` que inyecta un script en el
page context para actualizar los colores del croquis).
Antes: v1.5plugin.4e (reintento
defensivo en `seleccionar_un_asiento_con_reintentos`: si un
clic no queda registrado en el DOM al primer intento,
reintenta hasta 3 veces. Verifica primero si ya está
seleccionado, para no deseleccionar. Causa raíz del fallo:
condición de carrera en el piloto entre el polling de asientos
y el clic (corregida en piloto v1.5piloto.74e). Antes: v1.5plugin.4d (robustez
de `seleccionar_n_asientos`: espera a que aparezcan N asientos
con `seat-libre` antes de elegir, y verifica que cada asiento
esté libre antes de hacer clic. Tolerante al bug del piloto
donde el croquis tarda en actualizarse tras cancelar una venta
— corregido en piloto v1.5piloto.74d, pero el plugin debe ser
robusto igual). Antes: v1.5plugin.4c (fix de
timing en `seleccionar_n_asientos`: después de cada clic espera
a que el asiento pase a `seat-seleccionado-propio`. Antes
esperaba 300 ms fijos y con 2+ asientos el segundo clic podía
pisar el primero, fallando con "No apareció el botón Vender").
Antes: v1.5plugin.4b (fix de
apellidos en `datos_pasajero_aleatorio`: el helper generaba
"Pasajero0", "Pasajero1", etc. y el validador del piloto
rechaza números en apellidos. Ahora usa apellidos reales sin
tildes ni números de un array rotativo). Antes: v1.5plugin.4a (fix de
timing en `_helpers.js`: `llenar_pasajero` y `llenar_comprador`
ahora esperan a que la búsqueda del DNI se resuelva antes de
escribir el resto de los campos. Antes se escribían a los 600ms
y si el fetch tardaba más, el piloto limpiaba los campos al
recibir "no registrado", dejando apellido vacío y la venta
fallando con "Apellido: Este campo es obligatorio").
Antes: v1.5plugin.4 (pruebas de
venta: 15 pruebas nuevas que cubren ventas básicas, cuotas,
transferencia, múltiples asientos, ligaduras comprador-pasajero,
DNI duplicado, corrección de DNI, montos inválidos, cancelar y
reabrir. Antes: v1.5plugin.3f (fix de
`_es_visible` para elementos `position:fixed`. La prueba de
login fallaba con "No se pudo cerrar la sesión" porque el
overlay de login tiene `position:fixed` y `offsetParent`
devuelve `null` aunque esté visible). Infra de v1.5plugin.3e:
mínima del catálogo + primera prueba real `login_admin` +
fix de `servicio.js`: había usado `import()` dinámico,
prohibido en service workers por spec. Volvió a imports
estáticos. `CODIGO_ADMIN` corregido a "IDB". Regla nueva:
el manifest no se bumpea en cada letra.).

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
- `venta_basica` — 1 asiento, efectivo, pago total.
- `venta_cuotas` — 1 asiento, efectivo, 2 cuotas, pago parcial.
- `venta_transferencia` — 1 asiento por transferencia.
- `venta_dos_asientos` — 2 asientos, 2 pasajeros.
- `venta_tres_asientos` — 3 asientos, 3 pasajeros.
- `venta_ligadura_dni_igual` — comprador y pasajero mismo DNI.
- `venta_comprador_lleno_pasajero_vacio` — pasajero primero.
- `venta_dni_duplicado` — dos pasajeros mismo DNI.
- `venta_correccion_dni_pasajero` — DNI registrado → no registrado.
- `venta_correccion_dni_comprador` — idem comprador.
- `venta_monto_mayor_total` — rechazo por monto.
- `venta_monto_cero` — rechazo por monto cero.
- `venta_sin_comprador` — rechazo por falta de datos.
- `venta_cancelar_reabrir` — cancelar y reabrir el form.
- `venta_sin_asientos` — botón Vender oculto.

**Pendiente:**

- **v1.5plugin.5 (opcional):** pruebas de altas (pasajero, viaje,
  micro, terminal autorizada). Menos críticas ahora que las de
  venta están.
- **v1.5plugin.6 (opcional):** historial de corridas en la
  ventana del plugin.
- Revisar los permisos del manifest cuando se pruebe contra
  un dominio real (hoy solo `localhost` / `127.0.0.1`).

**Notas sobre las pruebas de venta:**

- Usan el terminal `carmen2` (código `carmen2`).
- El dueño de las terminales de prueba debe ser `carmen1`.
  Si el nombre de usuario del dueño es distinto, ajustar
  `NOMBRE_DUENO_PRUEBA` en `Aplicacion/ConfPlugin.js`.
- Todas las ventas se cancelan al final (Opción B).
- La prueba `venta_correccion_dni_pasajero` crea un pasajero
  de prueba antes de empezar. La prueba `venta_correccion_dni_comprador`
  también.

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
- **Los service workers de Chrome (MV3) NO permiten `import()`**
  **dinámico.** La spec lo prohíbe: "import() is disallowed on
  ServiceWorkerGlobalScope by the HTML specification"
  (https://github.com/w3c/ServiceWorker/issues/1356). Se decidió
  "throw on dynamic imports" para prevenir que un SW funcione
  online y rompa offline. Los imports deben ser ESTÁTICOS.
- **Regla de diseño (v1.5plugin.3b):** el service worker usa
  imports estáticos. La defensa contra archivos comentados es
  la auditoría (sección 5: archivos sospechosamente vacíos).
  No hay forma de registrar el listener antes de los imports
  en un SW con módulos.
- **Si `chrome.runtime.sendMessage` devuelve "Could not establish
  connection. Receiving end does not exist", el listener del
  service worker NO está registrado.** Primer chequeo: que
  `Aplicacion/servicio.js` no esté comentado. En v1.5plugin.2b
  un bloque de diagnóstico quedó pegado y comentó todo el
  archivo; el SW se registraba sin error pero nunca llamaba a
  `onMessage.addListener`, y el popup recibía el error de
  conexión.
- **Nunca leer un valor después de un fetch con una pausa
  fija.** El fetch del DNI en el piloto tarda un tiempo
  variable (JIT, carga del servidor, red). Leer después de
  una pausa de 800 ms falla intermitentemente. Usar polling
  (`esperar_valor`, `esperar_valor_vacio`) hasta que el valor
  sea el esperado, con timeout de 5 s. Bug en v1.5plugin.4h:
  las pruebas de ligadura y de corrección de DNI leían
  `ctx.valor` una sola vez y fallaban intermitentemente.
  Fix en v1.5plugin.4i.
- **Preferir verificar por backend antes que por DOM.** Cuando
  una prueba necesita confirmar algo del estado de la app
  (por ejemplo, que una venta tiene cupones pendientes),
  conviene pedir el detalle por POST (`ventas/obtener`, etc.)
  en lugar de leer el DOM de otra pestaña. Evita depender de
  la UI y de la navegación entre pestañas. Bug en
  v1.5plugin.4g: la prueba `venta_cuotas` leía la tarjeta
  de la venta en el DOM, pero ya no navegábamos a Vendidos.
  Fix en v1.5plugin.4h: helper `obtener_venta_por_id`.
- **No navegar de pestaña durante una prueba.** `activar_pestana`
  en el piloto llama a `ocultar_detalle_viaje`, que cierra el
  modal del viaje y mata el polling. Si una prueba necesita
  leer datos de otra pestaña, mejor pedirlos por POST desde
  el content script. Bug en v1.5plugin.4: el helper
  `obtener_id_ultima_venta` navegaba a Vendidos y dejaba el
  croquis congelado. Fix en v1.5plugin.4f: pedir el id por
  POST.
- **Para ejecutar código en el page context, usar
  `chrome.scripting.executeScript` con `world: "MAIN"`.**
  El content script no puede tocar las variables globales
  del page por el aislamiento de mundos. La opción de
  inyectar un `<script>` inline en el DOM falla si la página
  tiene CSP (bug en v1.5plugin.4f: "Executing inline script
  violates the following Content Security Policy directive").
  Fix en v1.5plugin.4g: `chrome.scripting.executeScript` con
  `world: "MAIN"` desde el service worker, que no pasa por
  el DOM. Requiere el permiso `scripting` en el manifest.
- **Cuando un clic puede perderse por condiciones de carrera**
  **del piloto, usar reintentos con verificación previa.** El
  bug del polling de asientos (v1.5piloto.74e) hacía que un
  asiento recién seleccionado volviera a verse libre. Si el
  clic se da por perdido, reintentar; pero antes verificar si
  ya está seleccionado, para no deseleccionar por accidente.
- **El plugin debe ser robusto ante bugs del piloto.** Cuando
  el piloto tiene un bug (por ejemplo, el croquis no se
  actualiza tras cancelar una venta — corregido en
  piloto v1.5piloto.74d), las pruebas igual deben poder
  esperar a que el estado se estabilice antes de fallar.
  Los helpers usan polling de clases del DOM con timeouts
  largos (5-10s) en lugar de timeouts fijos cortos.
- **Evitar timeouts fijos entre acciones del piloto.** El piloto
  hace un `fetch` por cada clic en un asiento. Los `pausa(300)`
  fijos no alcanzan cuando el fetch tarda más. En cambio,
  esperar a que el DOM refleje el cambio (polling de clase o
  atributo). Bug en v1.5plugin.4: `seleccionar_n_asientos`
  fallaba intermitentemente. Fix en v1.5plugin.4c:
  `esperar_asiento_seleccionado` hace polling de la clase
  `seat-seleccionado-propio` con timeout de 5 s.
- **Los datos generados por el plugin deben pasar los validadores
  del piloto.** El piloto valida apellidos y nombres con
  `/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü'\- \t]+$/`: solo letras, espacios,
  apóstrofes y guiones. Nada de números, ni siquiera como sufijo
  ("Pasajero0" no pasa). Los helpers deben generar datos que
  pasen. Bug en v1.5plugin.4: `datos_pasajero_aleatorio` generaba
  `"Pasajero" + index`. Fix en v1.5plugin.4b: array rotativo de
  apellidos sin tildes.
- **Los helpers que llenan formularios con autocompletado por
  DNI deben esperar a que la búsqueda se resuelva antes de
  escribir el resto.** El piloto limpia los campos del pasajero
  cuando el DNI no está registrado (`_limpiar_campos_pasajero`).
  Si el helper escribe el apellido antes de que vuelva el fetch,
  el piloto lo borra y la venta falla con "Apellido: Este campo
  es obligatorio". Fix en v1.5plugin.4a: helper
  `esperar_aviso_dni` que espera a que el aviso diga
  "no registrado" o "Datos actualizados...".
- **`offsetParent` no sirve para chequear visibilidad de
  elementos `position:fixed`.** Un elemento con
  `position: fixed` tiene `offsetParent === null` aunque
  esté perfectamente visible. El helper `_es_visible` no debe
  usar `offsetParent`; usar `getComputedStyle` (display,
  visibility, opacity) + `getBoundingClientRect` (width/height
  > 0). Los overlays tipo login casi siempre son
  `position: fixed`.
- **Regla del manifest (v1.5plugin.3e):** el `manifest.json`
  **no se bumpea en cada letra**. Chrome en modo desarrollador
  recarga siempre que se aprieta el botón de la tarjeta, sin
  importar la versión. Solo hace falta bumpear el manifest
  cuando:
  1. Se publica la extensión en la Chrome Web Store.
  2. Cambia `manifest_version` (raro).
  3. Hay que forzar una migración de IndexedDB en el usuario
     (se hace con `VERSION_BD` de IndexedDB, no con
     `manifest.version`).
  Mientras estemos en modo desarrollador, el manifest queda
  fijo en `1.5.6`.
- **`auditar_plugin.php` tiene una sección que detecta archivos
  sospechosamente vacíos** (sección 5). Después de quitar
  comentarios de línea y de bloque, si el archivo queda sin
  líneas de código, lo reporta. También tiene la sección 6
  que cruza `URL_PILOTO` con `host_permissions` y
  `content_scripts.matches` del manifest.

---

**FIN DEL PROMPT**