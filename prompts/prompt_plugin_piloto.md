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

**Proyecto en v1.5plugin.5e.** El esqueleto del plugin está
armado y funcional, tiene 30 pruebas (base + autocompletado
+ puntos de venta + viajes + micros + ventas + grafo) y las agrupa
en secciones. Las pruebas de venta son independientes: cada
una cierra los modales al terminar, fuerza el refresh del
croquis y espera activamente por asientos libres. El viaje
de setup tiene 2 micros de 44 asientos cada uno (88 en
total). `ir_a_tab` no clickea la tab si ya está activa
(evita reiniciar la carga de datos). Timeouts: lista de
viajes 40s, modal del viaje 30s, micros 30s (subidos en 5d
para tolerar grafos grandes mientras el piloto se aliviana
con la limpieza de viajes de prueba de v74n). Archivos:

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
- `viajes`: `alta_viaje`.
- `micros`: 9 pruebas. `alta_micro` (flujo feliz) más
  validaciones: `micro_sin_empresa`, `micro_sin_vehiculo`,
  `micro_monto_vacio`, `micro_monto_negativo`,
  `micro_cancelar`, `micro_mismo_vehiculo_dos_veces`
  (verifica rechazo), `micro_vehiculo_sin_asientos`
  (verifica filtro del select) y `micro_colision_numeracion`
  (reproduce el bug de colisión al quitar del medio).
- `ventas`: 15 pruebas (básica, cuotas, transferencia,
  asientos múltiples, ligaduras, duplicado, corrección de
  DNI, montos inválidos, sin comprador, cancelar-reabrir,
  sin asientos).
- `grafo`: 1 prueba. `eliminar_viaje_limpia_nodos`
  verifica que `eliminar_viaje` del piloto (v1.5piloto.74r)
  destruye el subárbol completo del viaje. Mide nodos
  antes y después con `grafo/resumen` y compara.

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
30. **Verificar los selectores reales antes de escribir
    una prueba sobre un modal.** Los formularios embebidos
    en el HTML del piloto quedaron sin uso en v73g: el
    alta/edición de usuarios y terminales pasó a modales
    genéricos (`abrir_modal_agregar_usuario_generico` y
    `abrir_modal_editar_usuario_generico`, en
    `aplicacion.js`). Los IDs de los campos del modal
    tienen prefijo `modal_agregar_*` o `modal_editar_*`,
    no los IDs del formulario viejo (`nuevo_terminal_*`,
    `nuevo_*`). Antes de escribir un test que toque un
    modal, revisar el archivo del módulo
    (`Aplicacion/terminales.js`, `Aplicacion/admin.js`) y
    `aplicacion.js`. Los IDs viejos siguen existiendo en
    el HTML pero están ocultos; escribir en ellos no
    tiene efecto. Nota de riesgo: el usuario suele dar el
    HTML estático cuando se le pide "el archivo del
    módulo", y eso puede inducir a error.
31. **Sobrescribir `window.alert` con `Object.defineProperty`,
    no con asignación directa.** En el contexto de un page
    cargado con scripts clásicos, `window.alert = ...` no
    siempre reemplaza la referencia global (Chrome puede
    haber cacheado la implementación nativa). Usar
    `Object.defineProperty(window, "alert", { value: fn,
    writable: true, configurable: true })`. Y **verificar
    que el override se aplicó** comparando identidades:
    `window.alert === noop_fn`. El helper
    `ctx.sobrescribir_alertas()` retorna `{ exito, activo }`
    con ese chequeo.
    **Actualización v1.5plugin.4u:** aun con el override
    aplicado y verificado, en algunos contextos el alert
    nativo sigue apareciendo. No alcanza con sobrescribir
    `window.alert` desde `chrome.scripting.executeScript`:
    el alert() del piloto sigue disparándose. **Solución
    adoptada:** bandera de modo prueba en el propio piloto.
    El piloto expone `_mostrar_alerta_critica()` (en
    `aplicacion.js`, aplicado en v1.5piloto.74j) que
    chequea `window.__iteradores_modo_prueba` y, si está
    activo, loguea a consola en lugar de llamar a `alert()`.
    El plugin setea/limpia la bandera con
    `ctx.activar_modo_prueba()` / `ctx.desactivar_modo_prueba()`.
    Es la solución robusta cuando el override de `window.alert`
    no alcanza: no depende de reemplazar la referencia global,
    depende de que el propio código del piloto respete la
    bandera. Requiere tocar el piloto, por lo que se aplica
    con la regla de los dos scripts.
32. **Un alert nativo congela el page context entero.**
    Mientras el alert está abierto, cualquier sendMessage o
    executeScript que toque ese page queda en cola. El
    popup del plugin pierde foco y se cierra (Chrome cierra
    los popups al perder foco); los resultados de la prueba
    se siguen persistiendo en IndexedDB, pero el usuario no
    los ve en vivo. Moraleja: las pruebas que disparan
    flujos con alert() deben evitarlo con override Y, si
    está disponible, con la bandera de modo prueba.
    **Actualización v1.5plugin.4v:** usar AMBOS métodos en
    conjunto (cinturón y tiradores). El override de
    `window.alert` fue el que funcionó en v4t; la bandera
    de modo prueba del piloto es un refuerzo adicional.
    Activarlos juntos y restaurarlos juntos en el finally.
    Ver aprendizaje 31.
33. **No todos los flujos del piloto disparan alert().**
    El alta de viaje (viajes-opciones.js,
    `abrir_modal_viaje`) solo usa `mostrar_aviso` / toast,
    nunca `alert()` ni `confirm()`. No necesita ni override
    ni bandera de modo prueba. Antes de escribir una
    prueba, revisar el flujo del piloto para saber qué
    protecciones hacen falta. Como regla práctica:
    `alert()` se dispara en el alta/edición de usuarios y
    terminales (código de acceso generado); `confirm()`
    se usa en eliminaciones (viajes, terminales, cupones)
    y en algunos subflujos (reiniciar selección). El resto
    de los flujos usa toast.
34. **Los `<select>` necesitan helpers específicos.** Un
    `ctx.clic` sobre un `<select>` abre el dropdown nativo,
    que la extensión no puede manejar. Y asignar
    `select.value = x` por sí solo no dispara el listener
    `onchange` del piloto. Los helpers correctos:
    `ctx.leer_opciones(sel)` devuelve `[{valor, texto}]`
    (para esperar a que un select se llene);
    `ctx.seleccionar_indice(sel, idx)` setea
    `selectedIndex`, dispara `change` y devuelve
    `{ exito, valor, texto }` con la opción elegida (para
    verificar por el value después). Los helpers van por
    `chrome.scripting.executeScript` en MAIN world, que
    sí dispara los listeners del page context.
35. **Las pruebas con dependencias encadenadas hacen su
    propio setup.** `alta_micro` necesita un viaje
    existente; `alta_viaje` ya crea uno, pero no queremos
    acoplar las pruebas entre sí. La prueba autocontenida
    crea el viaje, le agrega el micro y verifica. Ventaja:
    se puede correr sola, en cualquier orden. Desventaja:
    cada corrida deja más basura (viajes huérfanos). Se
    mitiga con prefijos distinguibles (`viajemicro` vs
    `viajeprueba`) para limpiar por tipo cuando moleste.
36. **Cuando 3+ pruebas comparten pasos de setup, extraer a
    un archivo de helpers.** El archivo va con prefijo `_`
    (`_micros_helpers.js`) para distinguirlo de las
    pruebas. Los helpers lanzan `Error` (no `ctx.assert`)
    cuando fallan, así la prueba que los usa aborta con
    mensaje claro. Los helpers NO importan nada de otras
    pruebas, solo usan `ctx`.
37. **Documentar el comportamiento del backend con pruebas
    también es útil.** `micro_mismo_vehiculo_dos_veces`
    verificaba que el backend PERMITE duplicados; después
    del fix v74k del piloto (que rechaza duplicados) se
    reescribió para verificar el rechazo. La prueba no es
    un contrato inmutable; es una foto del comportamiento
    observado, y se actualiza cuando el comportamiento
    cambia intencionalmente.
38. **Las pruebas que dependen de una precondición del
    entorno deben fallar con mensaje claro.**
    `micro_colision_numeracion` necesita 3 vehículos
    configurados en la misma empresa; si el dueño tiene
    menos, la prueba falla con un mensaje que dice cuántos
    encontró y qué hacer (cargar más vehículos o ajustar la
    prueba). `micro_vehiculo_sin_asientos`, en cambio, no
    puede forzar su precondición (vehículo sin asientos)
    desde el plugin. En ese caso, la prueba pasa con un
    `console.warn` si el entorno no la cumple. El criterio:
    si la precondición es creada por el usuario (cargar
    datos), fallar con mensaje; si es un estado aleatorio
    que puede no darse, pasar con advertencia.
39. **Los modales del piloto no se cierran solos entre
    pruebas.** El `activar_pestana` del piloto solo cierra
    el modal del viaje cuando la pestaña destino NO es
    "viajes". Si la prueba anterior dejó el modal abierto
    y la siguiente activa la misma pestaña, el modal sigue
    ahí, tapando la lista de viajes, y el estado se
    acumula. Tampoco se cierra al hacer logout. Regla:
    cada prueba debe llamar a `cerrar_modales_si_abiertos(ctx)`
    al empezar (o el helper `ir_a_tab` lo hace por
    nosotros) y al terminar (`cerrar_form_venta_y_liberar`
    lo hace).
40. **El croquis de asientos no se actualiza solo al
    abrir un micro.** El piloto arranca un polling de 15s
    (`SYNC_INTERVALO_MS`) que se pausa por inactividad. Si
    el croquis quedó con estado viejo (por ejemplo, tras
    una cancelación reciente), no alcanza con esperar 8s a
    que aparezca `.seat.seat-libre`: hay que forzar el
    refresh con `ctx.refrescar_asientos_pagina()`. Ese
    helper lee `viaje_seleccionado` y `micro_seleccionado`
    del page, hace un fetch a `viajes/estado_asientos` y
    actualiza el DOM. Sin esto, las pruebas ven menos
    asientos libres de los que hay y se agotan antes.
41. **Un recurso compartido entre pruebas se agota si
    nadie lo repone.** El viaje de setup de las pruebas
    de venta empezó con 1 micro de 44 asientos y 9 libres.
    Con 15 pruebas × 1-3 asientos por prueba, no alcanza.
    Solución: 2 micros (88 asientos). Además, aunque las
    pruebas cancelen al final, la cancelación no libera
    los asientos en el croquis del frontend hasta el
    próximo polling, así que las pruebas siguientes ven
    el estado viejo. Combinación: pool grande + refresh
    forzado + espera activa.
42. **El primer load del viaje puede tardar 10-15s.** El
    grafo acumula viajes, micros, ventas y asientos de
    corridas anteriores. `formatear_viaje` itera todos
    los micros y todos los asientos para calcular los
    contadores al vuelo, así que la respuesta de
    `viajes/listar_por_terminal` se pone lenta cuando el
    grafo crece. Un timeout de 8s es corto. Regla: 25s
    para el primer load de la lista, y no clickear la tab
    si ya está activa (el piloto la activa solo después
    del login y arranca `cargar_viajes` — clickear de
    nuevo limpia la lista y reinicia el fetch).
43. **El flujo de confirmación de venta tiene dos fetch
    en serie.** Después de mostrar el toast "Venta
    confirmada", el piloto hace `solicitar_estado_asientos`
    y después `refrescar_contadores_viaje_actual`, y recién
    después muestra el panel `#opciones_impresion`. Con el
    grafo grande, cada fetch puede tardar 5-10s. Regla:
    esperar el panel con timeout de 25s, y aceptar el toast
    como señal alternativa (el toast aparece antes). Si el
    toast aparece pero el panel no, hacer una espera corta
    extra para que el panel termine de aparecer y
    `obtener_id_ultima_venta` lo pueda cerrar.
44. **Los timeouts largos son una curita, no una solución.**
    Cada vez que subimos timeouts (5b, 5c, 5d) es porque el
    piloto se puso más lento por acumulación de datos en el
    grafo. La causa raíz está en `formatear_viaje` del
    piloto: escala con V × W (viajes × ventas), porque por
    cada viaje recorre todas las ventas del dueño dos veces
    (`viaje_tiene_ventas` y `vendidos_por_micro`). Con 21
    viajes × 24 ventas, eso son ~500 iteraciones por cada
    listado. La limpieza de viajes de prueba (v74n del
    piloto) alivia el problema. La optimización real
    (índice de ventas por viaje, cacheo de contadores) es
    una tanda aparte del piloto. Regla del plugin: aceptar
    timeouts largos como paliativo, pero anotar la causa
    raíz cuando se identifique.

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

**Última actualización de este prompt:** v1.5plugin.5e
(prueba espejo de v1.5piloto.74r: `eliminar_viaje_limpia_nodos`,
primera prueba de la sección "grafo". Verifica que eliminar
un viaje destruye el subárbol completo, midiendo nodos
antes y después con `grafo/resumen`. Corre toda con admin,
sin cambio de sesión, todo POST. Nuevo aprendizaje 45:
los comandos del grafo permiten verificar fugas de nodos
desde las pruebas del plugin.).
Antes: v1.5plugin.5c (suben
los timeouts del flujo de venta. `confirmar_venta` espera
hasta 25s al panel `#opciones_impresion` y acepta el toast
"Venta confirmada" como señal alternativa. `abrir_modal_confirmacion`
15s, botón Vender 12s. Nuevo aprendizaje 43).
Antes: v1.5plugin.5b (la
carga de la lista de viajes pasa a ser más robusta.
`ir_a_tab` no clickea la tab si ya está activa, así no
reinicia `cargar_viajes` ni descarta la carga en curso.
Timeouts del primer load subidos a 25s para la lista, 10s
para el modal del viaje y 15s para la lista de micros.
Nuevo aprendizaje 42).
Antes: v1.5plugin.5a (las
pruebas de venta pasan a ser independientes. Nuevo helper
`cerrar_modales_si_abiertos(ctx)` en `_helpers.js` que se
llama al inicio y al final de cada prueba. `ir_a_tab`
cierra modales antes de cambiar de pestaña.
`abrir_primer_micro_con_libres` fuerza un refresh del
croquis y espera activamente por asientos libres.
`cerrar_form_venta_y_liberar` cierra también el modal del
viaje. Nuevos aprendizajes 39-41).
Antes: v1.5plugin.4z (dos
pruebas nuevas para verificar los fixes v74k del piloto:
`micro_vehiculo_sin_asientos` verifica que los vehículos
sin asientos aparezcan disabled con el sufijo correcto, y
`micro_colision_numeracion` reproduce el bug de colisión al
quitar un micro del medio. `micro_mismo_vehiculo_dos_veces`
se reescribió para verificar el rechazo del backend (antes
documentaba que lo permitía). Se agregan los helpers
`ctx.clic_por_indice(sel, idx)` y
`ctx.leer_opciones_con_disabled(sel)` al service worker.
Nuevo aprendizaje 38).
Antes: v1.5plugin.4y (seis
pruebas nuevas de validación del alta de micro: sin
empresa, sin vehículo, monto vacío, monto negativo,
cancelar y mismo vehículo dos veces. Nuevo archivo
`_micros_helpers.js` con las funciones de setup compartidas;
`alta_micro` refactorizada para usarlas. Se agregan los
helpers `ctx.contar(sel)` y `ctx.forzar_valor(sel, valor)`
al service worker. Nuevos aprendizajes 36 y 37).
Antes: v1.5plugin.4x (nueva
prueba `alta_micro`: crea un viaje de setup, le agrega un
micro (empresa + vehículo + monto) y verifica. Nueva
sección "Micros" en la ventana. Se agregan los helpers
`ctx.leer_opciones(sel)` y `ctx.seleccionar_indice(sel,
idx)` para interactuar con `<select>`. Nuevos aprendizajes
34 y 35).
Antes: v1.5plugin.4w (nueva
prueba `alta_viaje`: login dueño, pestaña Viajes, alta de
viaje con datos únicos, verificación en la lista. Nueva
sección "Viajes" en la ventana. Nota: el alta de viaje NO
dispara alert(), solo toast, así que la prueba no necesita
override ni bandera de modo prueba. Nuevo aprendizaje 33).
Antes: v1.5plugin.4v (la
prueba `alta_terminal` usa AMBOS métodos juntos para
suprimir el alert del código de acceso:
`ctx.sobrescribir_alertas()` (el que funcionó en v4t) y
`ctx.activar_modo_prueba()` (bandera del piloto, refuerzo).
Timeouts holgados: 25s para la verificación en la tabla,
polling cada 500ms).
Antes: v1.5plugin.4u (modo
prueba del piloto: el override de `window.alert` no alcanza,
el alert nativo sigue apareciendo y bloquea el page context.
Solución: el piloto PHP respeta una bandera
`window.__iteradores_modo_prueba` (helper
`_mostrar_alerta_critica()` en `aplicacion.js`, aplicado en
v1.5piloto.74j). El plugin setea/limpia la bandera con
`ctx.activar_modo_prueba()` / `ctx.desactivar_modo_prueba()`.
La prueba `alta_terminal` usa ese modo. Nuevos aprendizajes
31 (actualizado) y 32).
Antes: v1.5plugin.4t (fix
del override de alert/confirm: se usa `Object.defineProperty`
en lugar de asignación directa, y `sobrescribir_alertas`
verifica que el override se aplicó antes de continuar. La
prueba `alta_terminal` agrega un assert temprano sobre
`activo === true` y pasa a ser tolerante: si el modal no se
cierra pero la tabla se actualizó, cuenta como OK. Nuevo
aprendizaje 31).
Antes: v1.5plugin.4s (fix
de la prueba `alta_terminal`: los selectores del formulario
de alta eran los del modal genérico (`modal_agregar_*`),
no los del formulario embebido sin uso (`nuevo_terminal_*`).
Se agrega el aprendizaje 30 sobre verificar selectores
reales antes de escribir una prueba sobre un modal).
Antes: v1.5plugin.4r (nueva
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

- El plugin tiene 29 pruebas. Hasta v1.5plugin.4z las
  pruebas de venta fallaban en cascada por acumulación de
  estado (los modales no se cerraban entre pruebas, el
  croquis quedaba desactualizado y el pool de asientos se
  agotaba). En v1.5plugin.5a se corrigió: nuevo helper
  `cerrar_modales_si_abiertos`, refresh forzado del
  croquis, espera activa por asientos libres y cierre del
  modal del viaje al final de cada prueba. El viaje de
  setup ahora tiene 2 micros de 44 asientos cada uno.
- Nota: el pool (los 2 micros) se agrega manualmente una
  vez desde la pestaña Viajes del piloto. Si se vuelve a
  agotar, hay que agregar un tercer micro o limpiar
  ventas viejas desde la pestaña Vendidos.
- En v1.5plugin.5b, después de aplicar el fix, la prueba
  `venta_basica` seguía fallando con "No hay viajes
  disponibles". Diagnóstico: la lista tarda 10-15s en
  cargar (el grafo acumuló mucho dato) y `ir_a_tab`
  clickeaba la tab aunque ya estuviera activa, reiniciando
  `cargar_viajes`. Se subieron los timeouts a 25s y se
  evitó el click redundante. Con eso, la primera carga
  tiene tiempo de terminar.
- Requisito de entorno para `micro_colision_numeracion`:
  la primera empresa del dueño `carmen1` debe tener al
  menos 3 vehículos configurados. Si no, la prueba falla
  con mensaje claro pidiendo cargar más.
- Notas sobre limpieza acumulada:
  - `alta_terminal`: crea terminales con prefijo
    `termprueba`. Limpiar desde la pestaña Puntos de venta.
  - `alta_viaje`: crea viajes con prefijo `viajeprueba`.
    Limpiar desde la pestaña Viajes.
  - `alta_micro`: crea viajes con prefijo `viajemicro`, y
    en cada uno agrega un micro. Limpiar desde la pestaña
    Viajes (hay que abrir el viaje y quitar el micro, o
    eliminar el viaje entero).
- Requisito de entorno para `alta_micro`: el dueño de prueba
  (`carmen1`) debe tener al menos una empresa con un vehículo
  configurado. Si no lo tiene, la prueba falla con mensaje
  claro en el paso de seleccionar empresa.
- Nota sobre `alta_terminal`: cada corrida crea una terminal
  nueva con prefijo `termprueba`. El test NO la elimina;
  limpiar manualmente cuando molesten. Se puede agregar la
  eliminación al final del test cuando tengamos el selector
  del botón de eliminar de cada fila (hoy:
  `button.btn_eliminar_terminal[data-usuario="..."]`, con
  `confirm()` nativo).
- Fix v1.5plugin.4s: la prueba `alta_terminal` escribía en
  los inputs del formulario embebido en el HTML
  (`#nuevo_terminal_*`), que quedaron sin uso desde v73g
  del piloto. El botón de alta abre un modal genérico con
  IDs `#modal_agregar_*`; la prueba se corrigió para usar
  esos. Aprendizaje 30 en §8.8.
- Fix v1.5plugin.4t: el override de `window.alert` con
  asignación directa no reemplazaba la referencia global
  en el page context. Se cambió a `Object.defineProperty`
  y se agregó verificación (`activo === true`). Además, la
  prueba `alta_terminal` pasa a ser tolerante: si el modal
  no se cierra pero la tabla se actualizó, cuenta como OK.
  Aprendizaje 31 en §8.8.
- Fix v1.5plugin.4u: aun con `Object.defineProperty` y
  `activo === true`, el alert nativo sigue apareciendo en
  algunos contextos. Se adopta la bandera de modo prueba
  del piloto (`window.__iteradores_modo_prueba`), que el
  propio `_mostrar_alerta_critica()` del piloto respeta.
  La prueba `alta_terminal` activa el modo antes de
  cualquier acción que dispare alert. Aprendizajes 31
  (actualizado) y 32 en §8.8.
- Fix v1.5plugin.4v: el override de `window.alert` (v4t)
  sí funcionaba; la bandera de modo prueba (v4u) fue
  insuficiente por sí sola. Se combinan AMBOS:
  `sobrescribir_alertas()` + `activar_modo_prueba()`. El
  piloto mantiene `_mostrar_alerta_critica()` y la
  bandera, pero la prueba no depende de ellos. Se suben
  los timeouts (25s) por si la red del backend tarda.
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