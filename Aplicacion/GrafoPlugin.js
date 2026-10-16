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
 * @version 1.5plugin.8e
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