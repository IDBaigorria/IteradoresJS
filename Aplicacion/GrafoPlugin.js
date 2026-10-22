/**
 * Capa fina sobre el framework Iteradores para persistir el
 * grafo de corridas del plugin.
 *
 * Estructura del grafo:
 *
 *   plugin (especial)
 *   └── pruebas (contenedor principal)
 *       ├── <id_prueba_1>          (contenedor del mini-árbol)
 *       │   ├── corriendo          (autoenlace, si corre ahora)
 *       │   └── hmi → corrida_<t5>
 *       │       └── hd → corrida_<t4>
 *       │           └── hd → ...
 *       │               └── hd → <id_prueba_1>  (cierre)
 *       └── <id_prueba_2>
 *           └── hmi → corrida_<tN>
 *
 * Cada corrida guarda: resultado, fecha_hora, duracion_ms,
 * detalle (opcional). El id_prueba se infiere del contenedor
 * padre.
 *
 * Máximo CORRIDAS_POR_PRUEBA_MAX corridas por prueba. Al
 * insertar, si se supera, se destruye la más vieja.
 *
 * El autoenlace `corriendo` en el contenedor de la prueba
 * sirve doble: (a) marca visual en el popup, (b) protección
 * contra destrucción accidental del contenedor mientras la
 * prueba corre.
 *
 * @version 1.5plugin.9a
 * @since 1.5plugin.5t
 */

import { Nodo } from "../Nodos/index.js";
import { obtener_controlador } from "./arranque.js";
import { NOMBRE_GRAFO, CORRIDAS_POR_PRUEBA_MAX } from "./ConfiguracionApli.js";
import { _hmi, hmi, hd } from "../miscelaneas/index.js";

let _grafo_cargado = false;

/**
 * Carga el grafo del plugin si existe, o crea la estructura
 * inicial si es la primera vez. Idempotente mientras la
 * variable `_grafo_cargado` esté en true.
 *
 * Si el grafo existe y tiene la estructura vieja (contenedor
 * `corridas` plano), la migra a la nueva (`pruebas` con
 * mini-árboles por prueba).
 *
 * @returns {Promise<void>}
 */
export async function asegurar_grafo_cargado() {
    if (_grafo_cargado) return;

    const Controlador = await obtener_controlador();
    const existe = await Controlador.existe(NOMBRE_GRAFO);

    if (existe) {
        const ok = await Controlador.cargar(NOMBRE_GRAFO);
        if (!ok) {
            throw new Error("El grafo existe pero no se pudo cargar");
        }
        const migrado = _migrar_estructura_si_hace_falta();
        if (migrado) {
            await Controlador.guardar(NOMBRE_GRAFO);
        }
    } else {
        Nodo.vaciar_superestructura(Controlador.token);
        _crear_estructura_inicial();
        const ok = await Controlador.guardar(NOMBRE_GRAFO);
        if (!ok) {
            throw new Error("No se pudo guardar el grafo inicial");
        }
    }

    _grafo_cargado = true;
}

function _crear_estructura_inicial() {
    const raiz = Nodo.crear_con_id("plugin");
    const pruebas = Nodo.crear_con_dato("");
    raiz._adyacente_en(pruebas, "pruebas");
}

/**
 * Migración de la estructura vieja (contenedor `corridas`
 * colgando de `plugin`) a la nueva (contenedor `pruebas`).
 * Destruye el contenedor viejo y sus nodos. Crea el nuevo
 * si no existe. Devuelve true si hubo cambios que guardar.
 *
 * @returns {boolean}
 */
function _migrar_estructura_si_hace_falta() {
    const raiz = Nodo.nodo_por_id("plugin");
    if (!raiz) {
        _crear_estructura_inicial();
        return true;
    }

    let hubo_cambios = false;

    const corridas_viejo = raiz.adyacente("corridas");
    if (corridas_viejo) {
        _destruir_contenedor_corridas_viejo(raiz, corridas_viejo);
        hubo_cambios = true;
    }

    if (!raiz.adyacente("pruebas")) {
        const pruebas = Nodo.crear_con_dato("");
        raiz._adyacente_en(pruebas, "pruebas");
        hubo_cambios = true;
    }

    return hubo_cambios;
}

/**
 * Destruye el contenedor `corridas` viejo y todos sus
 * nodos hijos (con sus campos). Los datos viejos no son
 * compatibles con la estructura nueva; se descartan.
 */
function _destruir_contenedor_corridas_viejo(raiz, corridas) {
    const hijos = corridas.adyacentes();
    if (hijos) {
        for (const [nombre, nodo] of hijos) {
            const campos = nodo.adyacentes();
            if (campos) {
                for (const [nombre_campo, nodo_campo] of campos) {
                    nodo.eliminar_adyacente(nombre_campo);
                    Nodo.eliminar(nodo_campo);
                }
            }
            corridas.eliminar_adyacente(nombre);
            Nodo.eliminar(nodo);
        }
    }
    raiz.eliminar_adyacente("corridas");
    Nodo.eliminar(corridas);
}

/**
 * Asegura que exista el contenedor de la prueba con ese
 * id. Lo crea si no existe. Devuelve el nodo.
 *
 * @param {string} id_prueba
 * @returns {Nodo}
 */
function _asegurar_contenedor_prueba(id_prueba) {
    const raiz = Nodo.nodo_por_id("plugin");
    if (!raiz) throw new Error("No se encontró el nodo raíz del plugin");
    const pruebas = raiz.adyacente("pruebas");
    if (!pruebas) throw new Error("No se encontró el contenedor 'pruebas'");

    let cont = pruebas.adyacente(id_prueba);
    if (!cont) {
        cont = Nodo.crear_con_dato(id_prueba);
        pruebas._adyacente_en(cont, id_prueba);
    }
    return cont;
}

/**
 * Registra una corrida. Inserta la nueva corrida como hmi
 * del contenedor de la prueba, y poda si excede el límite.
 *
 * @param {Object} datos
 * @param {string} datos.id_prueba
 * @param {string} datos.fecha_hora  ISO
 * @param {string} datos.resultado   "ok" / "fallo" / "error"
 * @param {number} datos.duracion_ms
 * @param {string} [datos.detalle]
 * @returns {Promise<string>} id de la corrida creada.
 */
export async function registrar_corrida(datos) {
    await asegurar_grafo_cargado();

    const Controlador = await obtener_controlador();
    const cont = _asegurar_contenedor_prueba(datos.id_prueba);

    const id_corrida = "corrida_" + Date.now();
    const corrida = Nodo.crear_con_dato(id_corrida);
    corrida._adyacente_en(Nodo.crear_con_dato(String(datos.fecha_hora)), "fecha_hora");
    corrida._adyacente_en(Nodo.crear_con_dato(String(datos.resultado)), "resultado");
    corrida._adyacente_en(Nodo.crear_con_dato(String(datos.duracion_ms)), "duracion_ms");
    if (datos.detalle) {
        corrida._adyacente_en(Nodo.crear_con_dato(String(datos.detalle)), "detalle");
    }

    // Insertar como hmi. _hmi pone p al contenedor y hd al
    // antiguo hmi (si existía).
    const tenia_hmi = hmi(cont) !== null;
    _hmi(cont, corrida);

    // Cerrar ciclo: el último nodo de la cadena (el más viejo)
    // debe apuntar al contenedor vía hd.
    if (!tenia_hmi) {
        corrida._adyacente_en(cont, "hd");
    }

    _podar_si_excede(cont);

    const ok = await Controlador.guardar(NOMBRE_GRAFO);
    if (!ok) throw new Error("No se pudo guardar el grafo tras registrar la corrida");

    return id_corrida;
}

/**
 * Recorre la cadena de corridas desde el hmi hasta llegar
 * al contenedor (cierre). Devuelve el array de nodos, del
 * más nuevo al más viejo. Si `limite` está seteado, corta
 * al alcanzarlo.
 *
 * @param {Nodo} cont
 * @param {number} [limite=Infinity]
 * @returns {Nodo[]}
 */
function _recorrer_corridas(cont, limite = Infinity) {
    const corridas = [];
    let actual = hmi(cont);
    let contador = 0;
    while (actual && actual !== cont && contador < limite) {
        corridas.push(actual);
        actual = hd(actual);
        contador++;
        if (contador > 1000) break;
    }
    return corridas;
}

/**
 * Si la cadena de corridas excede el máximo, destruye las
 * más viejas. Reasigna el hd del penúltimo al contenedor
 * (cierre) antes de destruir el sobrante.
 *
 * @param {Nodo} cont
 * @param {number} [max=CORRIDAS_POR_PRUEBA_MAX]
 */
function _podar_si_excede(cont, max = CORRIDAS_POR_PRUEBA_MAX) {
    const corridas = _recorrer_corridas(cont);
    if (corridas.length <= max) return;

    for (let i = max; i < corridas.length; i++) {
        const sobrante = corridas[i];
        const anterior = corridas[i - 1];
        const siguiente = hd(sobrante);

        // El anterior apunta ahora al siguiente del sobrante
        // (que es otro nodo de la cadena o el contenedor).
        anterior._adyacente_en(siguiente, "hd", true);

        // Destruir los campos de datos del sobrante.
        const campos = sobrante.adyacentes();
        if (campos) {
            for (const [nombre, nodo_campo] of campos) {
                if (nombre === "hd" || nombre === "p") continue;
                sobrante.eliminar_adyacente(nombre);
                Nodo.eliminar(nodo_campo);
            }
        }
        sobrante.eliminar_adyacente("hd");
        sobrante.eliminar_adyacente("p");
        Nodo.eliminar(sobrante);
    }
}

// ============================================================
// Estado "en vivo" (autoenlace `corriendo` en el contenedor)
// ============================================================

/**
 * Marca la prueba como corriendo: agrega un autoenlace
 * `corriendo` en su contenedor. Idempotente.
 *
 * @param {string} id_prueba
 * @returns {Promise<void>}
 */
export async function marcar_en_vivo(id_prueba) {
    await asegurar_grafo_cargado();
    const Controlador = await obtener_controlador();
    const cont = _asegurar_contenedor_prueba(id_prueba);

    if (!cont.adyacente("corriendo")) {
        cont._adyacente_en(cont, "corriendo");
        const ok = await Controlador.guardar(NOMBRE_GRAFO);
        if (!ok) throw new Error("No se pudo marcar la prueba como en vivo");
    }
}

/**
 * Quita la marca `corriendo` del contenedor de la prueba.
 * Idempotente: si no está marcado, no hace nada.
 *
 * @param {string} id_prueba
 * @returns {Promise<void>}
 */
export async function limpiar_en_vivo(id_prueba) {
    await asegurar_grafo_cargado();
    const Controlador = await obtener_controlador();
    const raiz = Nodo.nodo_por_id("plugin");
    if (!raiz) return;
    const pruebas = raiz.adyacente("pruebas");
    if (!pruebas) return;
    const cont = pruebas.adyacente(id_prueba);
    if (!cont) return;
    if (cont.adyacente("corriendo")) {
        cont.eliminar_adyacente("corriendo");
        await Controlador.guardar(NOMBRE_GRAFO);
    }
}

/**
 * Limpia todos los autoenlaces `corriendo` colgados de
 * cualquier contenedor de prueba. Se llama al arrancar
 * el service worker, para no dejar marcas de una corrida
 * anterior interrumpida (por ejemplo, si el SW murió por
 * inactividad a mitad de una prueba).
 *
 * @returns {Promise<number>} cuántos se limpiaron.
 */
export async function limpiar_autoenlaces_colgados() {
    await asegurar_grafo_cargado();
    const Controlador = await obtener_controlador();
    const raiz = Nodo.nodo_por_id("plugin");
    if (!raiz) return 0;
    const pruebas = raiz.adyacente("pruebas");
    if (!pruebas) return 0;

    let limpiados = 0;
    const ady = pruebas.adyacentes();
    if (ady) {
        for (const [nombre, cont] of ady) {
            if (cont.adyacente("corriendo")) {
                cont.eliminar_adyacente("corriendo");
                limpiados++;
            }
        }
    }
    if (limpiados > 0) {
        await Controlador.guardar(NOMBRE_GRAFO);
    }
    return limpiados;
}

// ============================================================
// Estado consolidado por prueba
// ============================================================

/**
 * Devuelve, para cada prueba, el estado consolidado:
 *   {
 *     ultima: { resultado, fecha_hora, duracion_ms, detalle } | null,
 *     historial: [ ...hasta CORRIDAS_POR_PRUEBA_MAX ],
 *     corriendo: bool
 *   }
 *
 * Si una prueba no tiene corridas, no aparece en el resultado.
 * Las corridas del historial van de la más reciente a la más
 * vieja.
 *
 * @param {number} [limite=CORRIDAS_POR_PRUEBA_MAX]
 * @returns {Promise<Object>}  { [id_prueba]: { ... } }
 */
export async function obtener_estado_por_prueba(limite = CORRIDAS_POR_PRUEBA_MAX) {
    await asegurar_grafo_cargado();

    const raiz = Nodo.nodo_por_id("plugin");
    if (!raiz) return {};
    const pruebas = raiz.adyacente("pruebas");
    if (!pruebas) return {};

    const resultado = {};
    const ady = pruebas.adyacentes();
    if (!ady) return resultado;

    for (const [id_prueba, cont] of ady) {
        const corridas = _recorrer_corridas(cont, limite);
        const historial = corridas.map((nodo) => ({
            resultado: _dato_adyacente(nodo, "resultado"),
            fecha_hora: _dato_adyacente(nodo, "fecha_hora"),
            duracion_ms: _dato_adyacente(nodo, "duracion_ms"),
            detalle: _dato_adyacente(nodo, "detalle"),
        }));
        const corriendo = cont.adyacente("corriendo") !== null;
        resultado[id_prueba] = {
            ultima: historial.length > 0 ? historial[0] : null,
            historial,
            corriendo,
        };
    }
    return resultado;
}

/**
 * Lee el dato de un adyacente con nombre, como string.
 * Devuelve "" si no existe.
 *
 * @param {Nodo} nodo
 * @param {string} enlace
 * @returns {string}
 */
function _dato_adyacente(nodo, enlace) {
    const hijo = nodo.adyacente(enlace);
    if (!hijo) return "";
    const d = hijo.dato();
    return d === null || d === undefined ? "" : String(d);
}

// ============================================================
// Migraciones (v1.5plugin.9a)
// ============================================================
//
// Estructura en el grafo:
//   plugin
//   └── migraciones
//       ├── actual → corrida_<ts>  (autoenlace, el más reciente)
//       └── corrida_<ts>           (una corrida)
//           ├── fecha_inicio
//           ├── fecha_fin
//           ├── entorno ("local" | "remoto")
//           ├── estado_global ("en_curso" | "completa" | "error" | "cancelada" | "abandonada")
//           ├── opciones → (sub-nodo)
//           │   ├── migrar_a_sql64 → "1"/"0"
//           │   ├── ... (una por paso)
//           │   └── drenar_buzon → "1"/"0"
//           ├── paso_<id> → (sub-nodo)
//           │   ├── estado
//           │   ├── mensaje
//           │   ├── output
//           │   └── duracion_ms
//           └── ...
//
// Se conservan las últimas 10 corridas.

const MIGRACION_CORRIDAS_MAX = 10;

/**
 * Registra el inicio de una corrida de migración. Devuelve el id.
 */
export async function registrar_migracion(datos) {
    await asegurar_grafo_cargado();
    const Controlador = await obtener_controlador();

    const raiz = Nodo.nodo_por_id("plugin");
    if (!raiz) throw new Error("Sin raíz del plugin");

    let migraciones = raiz.adyacente("migraciones");
    if (!migraciones) {
        migraciones = Nodo.crear_con_dato("");
        raiz._adyacente_en(migraciones, "migraciones");
    }

    // Quitar el autoenlace "actual" previo.
    if (migraciones.adyacente("actual")) {
        migraciones.eliminar_adyacente("actual");
    }

    const id_corrida = "corrida_" + Date.now();
    const corrida = Nodo.crear_con_dato(id_corrida);
    migraciones._adyacente_en(corrida, id_corrida);
    migraciones._adyacente_en(corrida, "actual");

    corrida._adyacente_en(Nodo.crear_con_dato(datos.fecha_inicio), "fecha_inicio");
    corrida._adyacente_en(Nodo.crear_con_dato(datos.entorno), "entorno");
    corrida._adyacente_en(Nodo.crear_con_dato(datos.estado_global), "estado_global");

    const opciones = Nodo.crear_con_dato("");
    for (const [k, v] of Object.entries(datos.opciones.pasos || {})) {
        opciones._adyacente_en(Nodo.crear_con_dato(v ? "1" : "0"), k);
    }
    opciones._adyacente_en(Nodo.crear_con_dato(datos.opciones.drenar_buzon ? "1" : "0"), "drenar_buzon");
    corrida._adyacente_en(opciones, "opciones");

    // Pre-crear los pasos con estado "pendiente".
    for (const res of datos.resultados || []) {
        const paso = Nodo.crear_con_dato("");
        paso._adyacente_en(Nodo.crear_con_dato(res.estado), "estado");
        if (res.mensaje) paso._adyacente_en(Nodo.crear_con_dato(res.mensaje), "mensaje");
        if (res.output) paso._adyacente_en(Nodo.crear_con_dato(String(res.output).slice(0, 2000)), "output");
        if (res.duracion_ms !== undefined) paso._adyacente_en(Nodo.crear_con_dato(String(res.duracion_ms)), "duracion_ms");
        corrida._adyacente_en(paso, "paso_" + res.paso);
    }

    _podar_migraciones(migraciones);

    const ok = await Controlador.guardar(NOMBRE_GRAFO);
    if (!ok) throw new Error("No se pudo guardar la corrida");
    return id_corrida;
}

/**
 * Actualiza el estado de un paso.
 */
export async function actualizar_paso_migracion(id_corrida, paso_id, datos) {
    await asegurar_grafo_cargado();
    const Controlador = await obtener_controlador();

    const raiz = Nodo.nodo_por_id("plugin");
    if (!raiz) return;
    const migraciones = raiz.adyacente("migraciones");
    if (!migraciones) return;
    const corrida = migraciones.adyacente(id_corrida);
    if (!corrida) return;

    let paso = corrida.adyacente("paso_" + paso_id);
    if (!paso) {
        paso = Nodo.crear_con_dato("");
        corrida._adyacente_en(paso, "paso_" + paso_id);
    }

    let n = paso.adyacente("estado");
    if (n) n._dato(datos.estado);
    else paso._adyacente_en(Nodo.crear_con_dato(datos.estado), "estado");

    if (datos.mensaje) {
        n = paso.adyacente("mensaje");
        if (n) n._dato(datos.mensaje);
        else paso._adyacente_en(Nodo.crear_con_dato(datos.mensaje), "mensaje");
    }

    if (datos.duracion_ms !== undefined) {
        const s = String(datos.duracion_ms);
        n = paso.adyacente("duracion_ms");
        if (n) n._dato(s);
        else paso._adyacente_en(Nodo.crear_con_dato(s), "duracion_ms");
    }

    await Controlador.guardar(NOMBRE_GRAFO);
}

/**
 * Actualiza el estado global y opcionalmente la fecha_fin.
 */
export async function finalizar_migracion(id_corrida, datos) {
    await asegurar_grafo_cargado();
    const Controlador = await obtener_controlador();

    const raiz = Nodo.nodo_por_id("plugin");
    if (!raiz) return;
    const migraciones = raiz.adyacente("migraciones");
    if (!migraciones) return;
    const corrida = migraciones.adyacente(id_corrida);
    if (!corrida) return;

    let n = corrida.adyacente("estado_global");
    if (n) n._dato(datos.estado_global);
    else corrida._adyacente_en(Nodo.crear_con_dato(datos.estado_global), "estado_global");

    if (datos.fecha_fin) {
        n = corrida.adyacente("fecha_fin");
        if (n) n._dato(datos.fecha_fin);
        else corrida._adyacente_en(Nodo.crear_con_dato(datos.fecha_fin), "fecha_fin");
    }

    await Controlador.guardar(NOMBRE_GRAFO);
}

/**
 * Devuelve { actual, historial }.
 */
export async function obtener_estado_migracion() {
    await asegurar_grafo_cargado();
    const raiz = Nodo.nodo_por_id("plugin");
    if (!raiz) return { actual: null, historial: [] };
    const migraciones = raiz.adyacente("migraciones");
    if (!migraciones) return { actual: null, historial: [] };

    let actual = null;
    const historial = [];
    const ady = migraciones.adyacentes();
    if (ady) {
        for (const [nombre, corrida] of ady) {
            if (nombre === "actual") {
                actual = _formatear_corrida_mig(nombre, corrida);
                continue;
            }
            if (!nombre.startsWith("corrida_")) continue;
            historial.push(_formatear_corrida_mig(nombre, corrida));
        }
    }

    historial.sort((a, b) => (b.fecha_inicio || "").localeCompare(a.fecha_inicio || ""));
    return { actual, historial: historial.slice(0, 5) };
}

function _formatear_corrida_mig(nombre, corrida) {
    const datos = {
        id: nombre,
        fecha_inicio: _dato_adyacente(corrida, "fecha_inicio"),
        fecha_fin: _dato_adyacente(corrida, "fecha_fin"),
        entorno: _dato_adyacente(corrida, "entorno"),
        estado_global: _dato_adyacente(corrida, "estado_global"),
        opciones: {},
        pasos: {},
    };

    const opciones = corrida.adyacente("opciones");
    if (opciones) {
        const ady_opc = opciones.adyacentes();
        if (ady_opc) {
            for (const [k, v] of ady_opc) {
                datos.opciones[k] = v.dato() === "1";
            }
        }
    }

    const ady_c = corrida.adyacentes();
    if (ady_c) {
        for (const [nombre_p, paso] of ady_c) {
            if (!nombre_p.startsWith("paso_")) continue;
            datos.pasos[nombre_p.substring(5)] = {
                estado: _dato_adyacente(paso, "estado"),
                mensaje: _dato_adyacente(paso, "mensaje"),
                duracion_ms: _dato_adyacente(paso, "duracion_ms"),
            };
        }
    }

    return datos;
}

function _podar_migraciones(migraciones) {
    const actual = migraciones.adyacente("actual");
    const todas = [];
    const ady = migraciones.adyacentes();
    if (!ady) return;
    for (const [nombre, corrida] of ady) {
        if (nombre === "actual") continue;
        if (!nombre.startsWith("corrida_")) continue;
        todas.push({ nombre: nombre, corrida: corrida });
    }
    if (todas.length <= MIGRACION_CORRIDAS_MAX) return;

    todas.sort((a, b) => b.nombre.localeCompare(a.nombre));
    for (let i = MIGRACION_CORRIDAS_MAX; i < todas.length; i++) {
        if (actual && todas[i].corrida.id() === actual.id()) continue;
        _destruir_corrida_mig(migraciones, todas[i]);
    }
}

function _destruir_corrida_mig(migraciones, item) {
    const corrida = item.corrida;
    const ady = corrida.adyacentes();
    if (ady) {
        for (const [nombre, hijo] of ady) {
            const ady_h = hijo.adyacentes();
            if (ady_h) {
                for (const [nh, n] of ady_h) {
                    hijo.eliminar_adyacente(nh);
                    Nodo.eliminar(n);
                }
            }
            corrida.eliminar_adyacente(nombre);
            Nodo.eliminar(hijo);
        }
    }
    migraciones.eliminar_adyacente(item.nombre);
    Nodo.eliminar(corrida);
}