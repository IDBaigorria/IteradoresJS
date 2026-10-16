# Estructura del plugin de pruebas (Chrome MV3)

Este archivo es la **fuente de verdad de la estructura**
del plugin: carpetas, archivos, grafo persistido, mensajes
del service worker, formato de pruebas y agrupación.

Vive en `iteradoresJS/prompts/estructura_plugin.md`. Se
actualiza cuando cambia la estructura (archivos nuevos,
cambios del grafo, mensajes nuevos). El prompt del plugin
(`prompt_plugin_piloto.md`) guarda el método, las
decisiones técnicas y las lecciones; este archivo guarda
la foto de la estructura.

Última actualización: v1.5plugin.8g.

---

## 1. ÁRBOL DE ARCHIVOS

**Raíz de `iteradoresJS/`:**

- `manifest.json` — manifiesto MV3. **Debe estar en la raíz**
  del directorio cargado como extensión; Chrome no acepta
  manifiestos anidados.
- Framework (`Nodos/`, `Iteradores/`, `Controlador/`,
  `Configuracion/`, `Persistencia/`, `miscelaneas/`, etc.).
- `index.html`, `index.js` — entrada web del framework.
- `auditar_plugin.php` — auditoría del plugin.

**`prompts/`:**

- `prompt_plugin_piloto.md` — método, decisiones, lecciones.
- `estructura_plugin.md` — este archivo.

**`Aplicacion/`:**

- `servicio.js` — service worker (module, imports estáticos).
- `contenido.js` — script de contenido clásico.
- `ventana.html` / `ventana.js` — popup.
- `arranque.js` — arranque del framework en el SW.
- `arranque_config.js` — configuración temprana (efecto de
  lado, corre antes de la auto-inicialización del Controlador).
- `ConfiguracionApli.js` — config propia + URL + códigos.
- `GrafoPlugin.js` — capa sobre el framework.
- `LimpiezaPrueba.js` — limpieza de datos de prueba.
- `CopiarPasajeros.js` — copia la tabla del micro abierto.
- `pruebas/`:
  - `catalogo.js` — agrupa pruebas en secciones y grupos.
  - `_helpers.js`, `_<tipo>_helpers.js` — helpers.
  - `prueba_NN_*.js` — una por prueba.

**`miscelaneas/`:**

- `index.js` — barrel.
- `generarUUID.js`.
- `mixin.js`.
- `Arbol.js` — operaciones de árbol (`hmi`/`hd`/`p`), espejo
  del `Arbol.php` del piloto. Incluye `_arbol_nombres`,
  `_hmi`, `_hd`, `hmi`, `hd`, `p`, `eliminar_hmi`,
  `eliminar_hd`. Todas aceptan un parámetro opcional
  `nombres` para enlaces alternativos.

---

## 2. RESPONSABILIDADES DE CADA MÓDULO

**`servicio.js`** (service worker):

- Registra el listener de mensajes.
- Orquesta la ejecución de pruebas: crea el `ctx`, marca
  `corrida_iniciada`, ejecuta, persiste la corrida, marca
  `corrida_terminada`.
- Cachea `nombre_solicitante` y `nombre_dueno` (se
  invalidan en login/logout).
- Expone helpers al `ctx` (DOM, fetch, MAIN world).

**`contenido.js`** (content script):

- Se inyecta en la página del piloto.
- Recibe mensajes del SW y los ejecuta contra el DOM.
- Hace el `fetch` multipart (las cookies del piloto viajan
  solo desde el origen del piloto).

**`ventana.js`** (popup):

- No usa imports. Pide datos al SW por
  `chrome.runtime.sendMessage`.
- Renderiza pestañas, grupos y pruebas.
- Muestra indicadores de estado y el historial de las
  últimas 5 corridas por prueba.
- Escucha `corrida_iniciada`, `corrida_terminada` y
  `limpieza_progreso`.

**`arranque.js`**:

- Importa `./arranque_config.js` (efecto de lado) ANTES
  de `../Controlador/index.js`.
- Expone `obtener_controlador()`: espera a que el
  Controlador termine de inicializar, fuerza el método
  de persistencia a `IndexedDB`.

**`arranque_config.js`**:

- Configura `Entorno` (salida consola, modo desarrollo)
  y aplica `configurar_conf(Conf)`.
- Existe por orden de evaluación: los imports ES se
  evalúan depth-first en orden de aparición.

**`ConfiguracionApli.js`**:

- Constantes del plugin (`NOMBRE_APP`, `VERSION_APP`,
  `NOMBRE_GRAFO`, `VERSION_PLUGIN`, `CORRIDAS_POR_PRUEBA_MAX`).
- Constantes del piloto (`URL_PILOTO`, códigos de usuario).
- `configurar_conf(Conf)` aplica los valores al framework.

**`GrafoPlugin.js`**:

- Carga / guarda el grafo del plugin.
- API: `asegurar_grafo_cargado()`, `registrar_corrida()`,
  `marcar_en_vivo()`, `limpiar_en_vivo()`,
  `limpiar_autoenlaces_colgados()`,
  `obtener_estado_por_prueba()`.
- Migración automática desde el contenedor viejo `corridas`.

---

## 3. GRAFO PERSISTIDO

```
plugin (especial)
└── pruebas (contenedor principal)
    ├── <id_prueba_1>          (contenedor del mini-árbol)
    │   ├── corriendo          (autoenlace, si corre ahora)
    │   └── hmi → corrida_<t5>
    │       └── hd → corrida_<t4>
    │           └── hd → ...
    │               └── hd → <id_prueba_1>  (cierre)
    └── <id_prueba_2>
        └── hmi → corrida_<tN>
```

Cada nodo `corrida_<ts>` guarda:

- `fecha_hora` (ISO).
- `resultado` (`"ok"` / `"fallo"` / `"error"`).
- `duracion_ms`.
- `detalle` (opcional).

Detalles:

- El `id_prueba` se infiere del contenedor padre.
- Máximo `CORRIDAS_POR_PRUEBA_MAX` (5) corridas por prueba.
  Al insertar, si se supera, se destruye la más vieja.
- Las corridas se insertan como `hmi` (la más nueva primero).
- El último nodo de la cadena apunta al contenedor vía `hd`.
- El autoenlace `corriendo` sirve doble: marca visual +
  protección contra eliminación accidental.

---

## 4. CATÁLOGO DE PRUEBAS

`catalogo.js` exporta:

- `SECCIONES` — array de pestañas temáticas.
  - `id`, `nombre`.
  - `limpieza` — array de categorías que limpia su botón
    "Limpiar pruebas" (puede ser `[]`).
  - `grupos` — array de grupos por rol.
    - `id`, `nombre`.
    - `pruebas` — array de pruebas.
- `CATALOGO` — array aplanado de todas las pruebas.

**Estructura de una prueba:**

```js
export const prueba = {
    id: "arranque",
    nombre: "Arranque: plugin y script de contenido",
    descripcion: "Verifica que el script de contenido...",
    async ejecutar(ctx) {
        // usar helpers de ctx
    }
};
```

**Render en el popup:**

- Barra de pestañas (una por sección).
- Pestaña activa: barra con "Ejecutar todos los roles" +
  "Limpiar pruebas" + estado.
- Grilla de 2 columnas con las tarjetas por grupo.
- Cada tarjeta: header con nombre + botón "Correr todas";
  filas por prueba con botón play, resultado en vivo,
  indicador de estado (última corrida) e historial
  desplegable.

**Progreso al correr una pestaña o grupo:**

- El popup itera las pruebas y manda `correr_prueba` una
  por una, actualizando en vivo.
- El SW no tiene caso `correr_seccion`.

---

## 5. MENSAJES DEL SERVICE WORKER

**Popup → SW:**

- `listar_secciones` → `{exito, secciones}`.
- `listar_pruebas` → `{exito, pruebas}`.
- `correr_prueba {id_prueba}` →
  `{exito, resultado, detalle, duracion_ms}`.
- `estado_pruebas` → `{exito, por_prueba}`. Reemplaza a
  los viejos `estado_en_vivo` y `listar_corridas`.
- `limpiar_datos_prueba` → limpieza total.
- `limpiar_prueba_categoria {categorias}` → limpieza parcial.
- `copiar_tabla_pasajeros` →
  `{exito, tabla, cantidad_filas}`.
- `refrescar_asientos_pagina`.

**SW → popup (broadcasts):**

- `limpieza_progreso {evento}`.
- `corrida_iniciada {id_prueba}`.
- `corrida_terminada {id_prueba, resultado, fecha_hora,
  duracion_ms, detalle}`.

---

## 6. HELPERS DE `ctx`

Ver prompt del plugin §5. Se mantiene ahí porque es la
API del plugin (contrato con las pruebas), no la
estructura interna del código.