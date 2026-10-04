# Prompt de trabajo — Plugin de pruebas (Chrome MV3)

Este es un prompt autocontenido con todo lo que sabemos sobre el
**plugin piloto**: una extensión de Chrome (manifest v3) que corre
pruebas automatizadas sobre la página del piloto PHP, usando el
framework Iteradores JS para persistir su propia información.

Vive en el propio proyecto, en
`iteradoresJS/prompts/prompt_plugin_piloto.md`. El proyecto
`iteradoresJS/` es un repo independiente del proyecto PHP; el
prompt del framework Iteradores, el del piloto y el del sistema
de scripts viven en el proyecto PHP (`iteradores/prompts/`).

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
sobre la página del piloto PHP. El usuario abre la ventana del
plugin (popup), ve las pruebas agrupadas por secciones, y
aprieta un botón play en la que quiere correr, o un botón
"Correr todas" en una sección para correrla entera. La
extensión ejecuta las pruebas contra la pestaña activa del
piloto y guarda cada resultado en su propio grafo.

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
  contenido o desde código inyectado con `world: "MAIN"`).
- Inyectar código en el page context con
  `chrome.scripting.executeScript` y `world: "MAIN"`.

---

## 2. ESTRUCTURA DE ARCHIVOS

**Raíz de `iteradoresJS/`:**

- `manifest.json` — manifiesto MV3. **Debe estar en la raíz**
  del directorio cargado como extensión; Chrome no acepta
  manifiestos anidados.
- Framework (`Nodos/`, `Iteradores/`, `Controlador/`,
  `Configuracion/`, `miscelaneas/`, `Persistencia/`, etc.) —
  sin tocar.
- `index.html`, `index.js` — entrada web actual del framework.

**`prompts/`:**

- `prompt_plugin_piloto.md` — este archivo.

**`Aplicacion/`:**

- `servicio.js` — service worker. **Module** (`type: "module"`
  en el manifest). Imports estáticos. Registra el listener
  de mensajes al final.
- `contenido.js` — script de contenido clásico. Se inyecta en
  la página del piloto.
- `ventana.html` / `ventana.js` — interfaz del popup. Renderiza
  las pruebas agrupadas por sección.
- `arranque.js` — arranque del framework en el SW.
- `ConfPlugin.js` — configuración propia del plugin.
- `GrafoPlugin.js` — capa fina sobre el framework.
- `pruebas/` — catálogo de pruebas.
  - `catalogo.js` — agrupa las pruebas en `SECCIONES`. Expone
    `CATALOGO` como array aplanado para compatibilidad.
  - `_helpers.js` — helpers compartidos.
  - `prueba_NN_*.js` — una por prueba.

---

## 3. LIMITACIONES Y DECISIONES TÉCNICAS

### 3.1 Manifest en la raíz

Chrome MV3 exige que `manifest.json` esté en la raíz del
directorio que se carga como extensión. El código del plugin
vive en `Aplicacion/` y usa paths relativos a la raíz.

### 3.2 Service worker: imports ESTÁTICOS

Chrome prohíbe `import()` dinámico en service workers por
spec: "import() is disallowed on ServiceWorkerGlobalScope by
the HTML specification" (w3c/ServiceWorker#1356). Se decidió
throw on dynamic imports para prevenir que un SW funcione
online y rompa offline. **Todo import en `servicio.js` tiene
que ser estático.**

### 3.3 Service worker en modo consola

En un SW no existe `document`. Los caminos HTML del framework
(`_imprimir_errores_html`, `html_errores`, etc.) romperían.
Se evitan forzando `Entorno.es_consola()` en `arranque.js`.

### 3.4 Script de contenido clásico

Los content scripts de MV3 no pueden ser módulos ES. Se
comunican con el SW por `chrome.runtime.sendMessage` y
`chrome.tabs.sendMessage`. El SW hace de orquestador.

### 3.5 Permiso `scripting` y `world: "MAIN"`

Para ejecutar código en el page context (necesario para tocar
las variables del piloto), usar:

    chrome.scripting.executeScript({
        target: { tabId: pestana_id },
        world: "MAIN",
        func: mi_funcion,
        args: [arg1, arg2]
    })

Requiere el permiso `scripting` en el manifest. **No** usar
`<script>` inline en el DOM: la página del piloto tiene CSP
y bloquea scripts inline.

### 3.6 CSP de la página

La página del piloto tiene Content Security Policy. Bloquea
scripts inline. Por eso `chrome.scripting.executeScript` con
`world: "MAIN"` es la forma correcta (no pasa por el DOM).

### 3.7 `let` top-level NO crea propiedades en `window`

Esta es la trampa más grande del plugin. Las variables
top-level del piloto están declaradas con `let`:

- `usuario_actual`
- `viaje_seleccionado`
- `micro_seleccionado`
- `estados_asientos_actuales`

`let` NO crea propiedades en `window`. `window.usuario_actual`
es `undefined` aunque la variable exista. En código inyectado
con `world: "MAIN"`, hay que:

- Accederlas directamente: `usuario_actual`, no
  `window.usuario_actual`.
- Chequear con `typeof X !== "undefined"` por si no están en
  el scope.

Las funciones y `var` sí crean propiedades en `window`; las
declaraciones con `let`/`const` no.

### 3.8 `confirm()` nativo

Las extensiones no pueden manejar `confirm()` nativo. Para
apretar un botón que dispare `confirm()`, sobrescribir
temporalmente `window.confirm` con `() => true` antes del
click y restaurarlo después, desde `world: "MAIN"`.

### 3.9 Token de seguridad

El plugin **no maneja el token** del framework. El Controlador
lo recibe cuando el módulo `Controlador` se evalúa. Para
código que necesite el token: `Controlador.ejecutar_prueba(cb)`.

### 3.10 Motor (comandos + péndulo)

No se usa. Recordatorios:

- `MOTOR_MAX_CICLOS` — ciclos **totales** antes de detenerse.
  `0` = infinito.
- `MOTOR_QUANTUM` — comandos por ciclo.
- `MOTOR_CICLOS_POR_MINUTO` — frecuencia.

### 3.11 Geolocalización

`Controlador.inicializar()` intenta obtener coordenadas. En
el SW puede fallar. Tiene fallback. No es bloqueante.

### 3.12 Regla del manifest

**El `manifest.json` no se bumpea en cada letra.** Chrome en
modo desarrollador recarga siempre que se aprieta el botón
de la tarjeta, sin importar la versión. Solo hace falta
bumpear `manifest.version` cuando:

1. Se publica la extensión en la Chrome Web Store.
2. Cambia `manifest_version` (raro).
3. Hay que forzar una migración de IndexedDB (se hace con
   `VERSION_BD` de IndexedDB, no con `manifest.version`).

Mientras estemos en modo desarrollador, el manifest queda
fijo en `1.5.6`.

### 3.13 Vocabulario

Español para todo lo propio del plugin. Las palabras que
Chrome impone (`manifest.json`, claves del manifest, API de
`chrome.*`) quedan como están. En comentarios se aceptan los
términos técnicos del ecosistema: "service worker", "script
de contenido", "popup", "plugin". Los archivos propios:
`arranque.js`, `servicio.js`, `contenido.js`, `ventana.html`,
`ventana.js`.

---

## 4. FORMATO DE PRUEBA

### 4.1 Estructura

Cada prueba es un módulo ES con un objeto exportado:

    export const prueba = {
        id: "arranque",
        nombre: "Arranque: plugin y script de contenido",
        descripcion: "Verifica que el script de contenido...",
        async ejecutar(ctx) {
            // usar helpers de ctx
        }
    };

### 4.2 Secciones

En `catalogo.js` las pruebas se agrupan en `SECCIONES`:

    export const SECCIONES = [
        { id: "base", nombre: "Base", pruebas: [arranque, login] },
        { id: "ventas", nombre: "Ventas", pruebas: [...] }
    ];

La ventana renderiza cada sección con un botón "Correr todas".
Cuando se aprieta, la ventana itera las pruebas de la
sección y manda `correr_prueba` una por una, mostrando el
progreso en vivo: la prueba en curso se resalta y el
resumen dice "Corriendo N/total...". El SW no tiene un caso
`correr_seccion`; simplemente ejecuta cada prueba individual.
Para agregar una sección nueva, sumar un objeto a `SECCIONES`.

### 4.3 Resultado

Cada corrida persiste un nodo en el grafo del plugin con:

- `id_prueba`
- `fecha_hora` (ISO)
- `resultado` (`"ok"` / `"fallo"` / `"error"`)
- `duracion_ms`
- `detalle` (texto libre)

---

## 5. HELPERS DE `ctx`

`ctx` lo provee el service worker. Lista de helpers
disponibles:

**Navegación y sesión:**
- `ctx.url_base` — URL del piloto.
- `ctx.pestana_id` — id de la pestaña del piloto.
- `ctx.cerrar_sesion()` — cierra la sesión si hay una activa.
- `ctx.asegurar_login(codigo)` — cierra sesión y hace login.

**Acciones sobre el DOM:**
- `ctx.clic(sel)`
- `ctx.escribir(sel, texto)`
- `ctx.esperar(sel, timeout)` — espera a que exista el
  elemento.
- `ctx.esperar_visible(sel, timeout)`
- `ctx.esperar_oculto(sel, timeout)`
- `ctx.esta_visible(sel)` → bool.

**Lectura del DOM:**
- `ctx.texto(sel)` → textContent o null.
- `ctx.valor(sel)` → value del input o null.
- `ctx.html(sel)` → outerHTML o null.
- `ctx.obtener_atributos(sel, attr)` → array de valores.
- `ctx.leer_aviso()` → texto del toast actual.

**Fetch y datos:**
- `ctx.pedir_post(url, body)` → {exito, status, texto, json}.
- `ctx.enviar(tipo, datos)` — mensaje crudo al content script.

**Datos del page (via `chrome.scripting.executeScript` en
MAIN world):**
- `ctx.crear_pasajero_de_prueba(datos)` — crea un pasajero con
  el dueño resuelto del page.
- `ctx.liberar_asientos_propios()` — aprieta "Reiniciar
  selección".
- `ctx.refrescar_asientos_pagina()` — refresca el croquis.

**Utilidades:**
- `ctx.pausa(ms)` — espera.
- `ctx.dni_unico()` — DNI único.
- `ctx.texto_unico(prefijo)` — texto único.
- `ctx.assert(cond, msg)` — lanza Error si `cond` es falsy.

---

## 6. ENTORNO DE PRUEBAS

- **URL del piloto:** `http://localhost/iteradores/codigo.worktrees/v1.5i/`.
  Vive en `Aplicacion/ConfPlugin.js` como `URL_PILOTO`.
- **Códigos de usuario del piloto** (son códigos de acceso,
  **no** nombres de usuario):
  - admin:    `IDB`
  - dueño:    `carmen1`
  - terminal: `carmen2`
  - terminal: `lujan2`
  - soporte:  `manolo3`

**El nombre de usuario del dueño NO se conoce de antemano.**
Para crear pasajeros de prueba se resuelve desde el page con
`ctx.crear_pasajero_de_prueba`, que lee
`usuario_actual.dueno`.

---

## 7. ESTADO ACTUAL

**Proyecto en v1.5plugin.4r.** El esqueleto del plugin está
armado y funcional, tiene 19 pruebas (base + autocompletado
+ puntos de venta + ventas) y las agrupa en secciones. Archivos:

- `manifest.json` — manifiesto MV3 en la raíz.
- `Aplicacion/servicio.js` — service worker (module, imports
  estáticos).
- `Aplicacion/contenido.js` — script de contenido clásico.
- `Aplicacion/ventana.html` / `ventana.js` — interfaz del
  popup con secciones.
- `Aplicacion/arranque.js` — arranque del framework en el SW.
- `Aplicacion/ConfPlugin.js` — configuración propia + URL del
  piloto + códigos de usuario.
- `Aplicacion/GrafoPlugin.js` — capa sobre el framework.
- `Aplicacion/pruebas/catalogo.js` — catálogo con secciones.
- `Aplicacion/pruebas/_helpers.js` — helpers compartidos.
- `Aplicacion/pruebas/prueba_01..17_*.js` — 17 pruebas.
- `auditar_plugin.php` — auditoría con 6 secciones.

**Secciones actuales:**

- `base`: `arranque`, `login`.
- `autocompletado`: `autocompletado_dni_terminal_clientes`.
- `puntos_de_venta`: `alta_terminal`.
- `ventas`: 15 pruebas (básica, cuotas, transferencia,
  asientos múltiples, ligaduras, duplicado, corrección de
  DNI, montos inválidos, sin comprador, cancelar-reabrir,
  sin asientos).

---

## 8. LECCIONES APRENDIDAS A LA FUERZA

Cada una costó al menos un ciclo de debugging. Van agrupadas
por tema.

### 8.1 Service worker

1. **Imports estáticos siempre.** Chrome prohíbe `import()`
   dinámico en SW.
2. **"unknown error when fetching the script"** al registrar
   un SW module casi siempre es un import roto en la cadena.
   Diagnóstico: reducir `servicio.js` a un `console.log` y
   agregar imports de a uno hasta que rompa.
3. **"Could not establish connection. Receiving end does not
   exist"** significa que el listener del SW NO está
   registrado. Primer chequeo: que `servicio.js` no esté
   comentado.
4. **Verificar el nombre exacto del archivo en disco antes
   de commitear.** Un archivo creado como `arranqu.js` (sin
   la "e") da el mismo error genérico que un import roto.
5. **Al renombrar un archivo, hacer un grep del nombre viejo
   en todo `Aplicacion/`.** Actualizar **todas** las
   referencias, no solo las de los archivos que se tocan
   en la tanda.
6. **`auditar_plugin.php` después de cada tanda que agregue
   o renombre archivos.** Detecta imports rotos, paths de
   manifest que no resuelven, y archivos sospechosamente
   vacíos.

### 8.2 Script de contenido y MAIN world

7. **No usar `<script>` inline en el DOM.** La página del
   piloto tiene CSP y bloquea scripts inline.
8. **Usar `chrome.scripting.executeScript` con
   `world: "MAIN"`** para tocar las variables del page.
   Requiere el permiso `scripting` en el manifest.
9. **`let` y `const` top-level NO crean propiedades en
   `window`.** Acceder directamente y chequear con
   `typeof X !== "undefined"`. Las variables top-level del
   piloto (`usuario_actual`, `viaje_seleccionado`,
   `micro_seleccionado`, `estados_asientos_actuales`) son
   `let`.
10. **`confirm()` nativo no se puede manejar desde la
    extensión.** Sobrescribir `window.confirm` con
    `() => true` por el tiempo del click, desde MAIN world.

### 8.3 Formularios y autocompletado del piloto

11. **Los helpers que llenan formularios con autocompletado
    por DNI deben esperar a que la búsqueda se resuelva**
    antes de escribir el resto. El piloto limpia los campos
    del pasajero cuando el DNI no está registrado.
    Esperar a que el aviso diga "no registrado" o "Datos
    actualizados...".
12. **No leer un valor después de un fetch con una pausa
    fija.** El fetch del DNI tarda un tiempo variable. Usar
    polling (`esperar_valor`, `esperar_valor_vacio`) hasta
    que el valor sea el esperado.

### 8.4 Timing y polling

13. **Evitar timeouts fijos entre acciones del piloto.** El
    piloto hace un `fetch` por cada clic. Esperar a que el
    DOM refleje el cambio (polling de clase o atributo).
14. **Cuando un clic puede perderse por condiciones de
    carrera, usar reintentos con verificación previa.**
    Verificar si ya está seleccionado antes de reintentar
    el clic, para no deseleccionar.

### 8.5 Navegación entre pestañas

15. **No navegar de pestaña durante una prueba.**
    `activar_pestana` en el piloto llama a
    `ocultar_detalle_viaje`, que cierra el modal del viaje
    y mata el polling. Si una prueba necesita leer datos de
    otra pestaña, mejor pedirlos por POST.
16. **El botón "Cancelar" del formulario de venta no
    deselecciona los asientos.** Después de cerrar, apretar
    "Reiniciar selección".

### 8.6 Datos de prueba

17. **Los datos generados deben pasar los validadores del
    piloto.** Apellidos y nombres con
    `/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü'\- \t]+$/`: solo letras,
    espacios, apóstrofes y guiones. Nada de números, ni
    siquiera como sufijo ("Pasajero0" no pasa).
18. **No adivinar nombres de usuario ni datos del entorno.**
    Los códigos de acceso no son nombres de usuario. Si un
    helper necesita un dato del page, pedirlo desde el page
    vía `chrome.scripting.executeScript` en MAIN world.

### 8.7 Verificación

19. **Preferir verificar por backend antes que por DOM.**
    Cuando una prueba necesita confirmar algo del estado de
    la app, pedir el detalle por POST (`ventas/obtener`,
    etc.) en lugar de leer el DOM de otra pestaña.
20. **`offsetParent` no sirve para chequear visibilidad de
    elementos `position: fixed`.** En un overlay con
    `position: fixed`, `offsetParent` es `null` aunque el
    elemento esté visible. Usar `getComputedStyle` +
    `getBoundingClientRect`.

### 8.8 Estructura del código

21. **Bumps de versión en archivos tocados y `?v=` en HTML.**
22. **No bumpear el manifest en cada letra.**
23. **Un `aplicar_cambios.php` por tanda y por proyecto.**
24. **Cuando un bloque `buscar` falla, copiarlo textual del
    archivo real, no de memoria.**
25. **Cuando un flujo largo necesita progreso, iterarlo desde
    el lado que dibuja la UI.** Al correr una sección completa,
    la ventana itera las pruebas y manda `correr_prueba` una
    por una, actualizando el estado después de cada respuesta.
    Si el SW corriera todo y devolviera al final, la UI no
    podría mostrar progreso intermedio sin mensajería
    bidireccional. Bug en v1.5plugin.4m: "Correr todas"
    mostraba todo recién al final. Fix en v1.5plugin.4n.
26. **Las pestañas del piloto se generan dinámicamente.** No
    hay selector DOM estable para clickearlas. Para activar
    una pestaña, usar `chrome.scripting.executeScript` con
    `world: "MAIN"` e invocar la función `activar_pestana`
    del page directamente. El helper
    `ctx.activar_pestana_piloto(nombre)` encapsula esto.
    (Va temáticamente con 8.5, pero se numera acá para no
    romper la numeración de esa sección.)
27. **`ctx.obtener_atributos` devuelve `[null]` si el
    atributo no existe, no `[]`.** El helper hace un match
    por selector y devuelve un array con el valor del
    atributo por cada match (null si no está). Para
    chequear "el atributo no está en ningún match", usar
    `.every(v => v === null)`. En general, preferir
    chequear el valor observable (que el campo tenga el
    contenido esperado) antes que atributos de estado.
    Un assert mal planteado da falsos negativos que
    cuestan tiempo de debugging. (Va temáticamente con
    8.7.)
28. **Los bloques `buscar` del `aplicar_cambios.php`
    deben incluir la línea completa, no un prefijo.** Un
    `return (r && r[0] && r[0].result) ? ... : ...` no
    matchea con un `return { exito: false }`. Cuando se
    arma un bloque, verificarlo contra el archivo real,
    no contra el recuerdo de lo que uno escribió. Si el
    bloque falla, pedir el fragmento exacto del archivo
    al usuario antes de ajustar.
29. **`window.alert` y `window.confirm` nativos bloquean
    la extensión.** Para flujos que disparan dialogs
    nativos (por ejemplo, el alta de terminal muestra
    `alert()` con el código generado), sobrescribir ambos
    antes de la acción y restaurarlos al final. Los
    helpers `ctx.sobrescribir_alertas()` y
    `ctx.restaurar_alertas()` encapsulan esto. La
    sobrescritura tiene que estar activa durante toda la
    operación, no solo durante el click: el `alert` puede
    dispararse después de que el fetch resuelva. Ver
    también el aprendizaje 10 (confirm nativo).

---

## 10. REGLAS DE TRABAJO

Reglas del método que aplican específicamente a este
proyecto.

1. **Cada `aplicar_cambios.php` va acompañado de un commit
   sugerido.** Siempre, sin excepción, tanto en este repo
   (`iteradoresJS/`) como en el repo del piloto
   (`iteradores/`). El título del commit arranca con
   `V1.5plugin.XX:` acá y con `V1.5piloto.XX:` allá.

2. **Este proyecto no arranca tandas por su cuenta cuando el
   cambio es en el piloto.** Cada cambio del piloto PHP lleva
   su espejo acá: la tanda del piloto entrega DOS
   `aplicar_cambios.php` (uno por repo) y DOS commits (uno por
   repo). El del plugin agrega las pruebas que verifican el
   cambio hecho en el piloto. El plugin sí puede arrancar
   tandas propias cuando el cambio es solo suyo (por ejemplo,
   refactor interno del SW o de la ventana).

3. **Cada cambio al plugin incrementa la versión.** En
   `ConfPlugin.js` (`VERSION_APP` y `VERSION_PLUGIN`) y en
   `@version` de los archivos que se tocan. El `manifest.json`
   no se bumpea en cada letra (ver sección 3.12).

4. **Los bloques `buscar` del `aplicar_cambios.php` deben
   matchear exactamente el archivo en disco.** No alcanza con
   el recuerdo de lo que uno escribió. Si un bloque falla,
   pedir el fragmento exacto del archivo al usuario antes de
   ajustarlo. Ver sección 8.8, aprendizaje 28.

---

## 9. DISCUSIÓN ACTUAL

**Última actualización de este prompt:** v1.5plugin.4r (nueva
prueba `alta_terminal`: login dueño, pestaña Puntos de
venta, alta de terminal con datos únicos, verificación en
la tabla. Nueva sección "Puntos de venta" en la ventana.
Se agregan los helpers `ctx.sobrescribir_alertas()` y
`ctx.restaurar_alertas()` al service worker para flujos que
disparan dialogs nativos. Nuevo aprendizaje 29).
Antes: v1.5plugin.4q (nueva
sección 10 "Reglas de trabajo": cada `aplicar_cambios.php` va
con su commit sugerido, y cada cambio del piloto PHP trae su
espejo de pruebas acá).
Antes: v1.5plugin.4p (se
quita el check de `disabled` de la prueba
`autocompletado_dni_terminal_clientes`: el helper
`obtener_atributos` devuelve `[null]` cuando el atributo no
existe, no `[]`; el check no aportaba valor y daba falso
negativo. Además, la prueba se mueve a una sección propia
`autocompletado` en la ventana).
Antes: v1.5plugin.4o (nueva
prueba `autocompletado_dni_terminal_clientes`: login como
terminal, ir a la pestaña Pasajeros/Clientes, crear un
pasajero de prueba, abrir el modal de alta, escribir el DNI
y verificar que apellido y nombres se autocompletan. Cubre
el fix v74h del piloto PHP. Se agrega el helper
`ctx.activar_pestana_piloto(nombre)` al service worker, que
invoca `activar_pestana` del page context vía
`chrome.scripting.executeScript` en MAIN world).
Antes: v1.5plugin.4n (progreso
en vivo al correr una sección: la ventana itera las pruebas
y manda `correr_prueba` una por una, actualizando el estado
después de cada una. El SW ya no corre la sección entera;
el caso `correr_seccion` se eliminó. Se agrega estilo
`.corriendo` para la prueba en curso).
Antes: v1.5plugin.4m (secciones
en la ventana con botón "Correr todas"; prompt reescrito
completo con todo lo aprendido a la fuerza).

**Estado de la conversación:**

- El plugin tiene 19 pruebas que corren OK contra el piloto
  PHP. Las más recientes son `autocompletado_dni_terminal_clientes`
  (v1.5plugin.4p), que verifica el fix v74h del piloto (el
  autocompletado por DNI desde la pestaña Clientes con usuario
  terminal), y `alta_terminal` (v1.5plugin.4r), que cubre el
  alta de terminal desde la pestaña Puntos de venta.
- Nota sobre `alta_terminal`: cada corrida crea una terminal
  nueva con prefijo `termprueba`. El test NO la elimina;
  limpiar manualmente cuando molesten. Se puede agregar la
  eliminación al final del test cuando tengamos el selector
  del botón de eliminar de cada fila.
- En el proceso se encontraron y arreglaron varios bugs del
  piloto: v74d (refresco del croquis tras cancelar venta),
  v74e (condición de carrera en el polling de asientos),
  v74f (modal del viaje abierto al cambiar de pestaña).
- La ventana agrupa las pruebas en secciones y tiene botón
  "Correr todas" por sección.

**Decisiones tomadas:**

- Manifest en la raíz de `iteradoresJS/`.
- Código del plugin en `Aplicacion/`.
- Persistencia con `PerdurarSuperestructuraStringIndexedDB`.
- Salida en modo consola dentro del service worker.
- Script de contenido clásico, comunicación por mensajería.
- `chrome.scripting.executeScript` con `world: "MAIN"` para
  tocar el page context (el `<script>` inline lo bloquea
  CSP).
- Formato de prueba declarativo con objeto
  `{id, nombre, descripcion, ejecutar(ctx)}`.
- Secciones en `catalogo.js` como array de
  `{id, nombre, pruebas}`.
- El motor y los comandos no se usan.
- Nombre de app del plugin: `IteradoresPluginPruebas`.
- Prefijo de versión del plugin: `v1.5plugin.*`.
- Español para nombres propios del plugin. "Plugin" se
  mantiene. Palabras del ecosistema Chrome se aceptan.
- El manifest no se bumpea en cada letra.

**Pendiente:**

- Más pruebas (altas de pasajero, viaje, micro, terminal).
- Historial de corridas en la ventana.
- Revisar los permisos del manifest cuando se pruebe contra
  un dominio real (hoy solo `localhost` / `127.0.0.1`).
- Explorar el sistema de comandos y el motor para ejecución
  por fases (opcional, si hace falta).

**Para el asistente de la próxima sesión:**

- Leer la sección "LECCIONES APRENDIDAS A LA FUERZA" antes de
  escribir código. La mitad de las trampas están ahí.
- Cuando un bloque `buscar` falle, pedir el fragmento exacto
  del archivo y copiarlo textual.
- No asumir indentación. Copiar del pegado real.

---

**FIN DEL PROMPT**