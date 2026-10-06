/**
 * Capa fina sobre el framework Iteradores para persistir el
 * grafo de corridas del plugin.
 *
 * Estructura del grafo:
 *
 *   plugin (especial)
 *   └── corridas (contenedor)
 *       └── corrida_<timestamp> (por cada corrida)
 *           ├── id_prueba
 *           ├── fecha_hora
 *           ├── resultado
 *           ├── duracion_ms
 *           └── detalle (opcional)
 *
 * @version 1.5plugin.5t
 */

import { Nodo } from "../Nodos/index.js";
import { obtener_controlador } from "./arranque.js";
import { NOMBRE_GRAFO } from "./ConfiguracionApli.js";

let _grafo_cargado = false;

/**
 * Carga el grafo del plugin si existe, o crea la estructura
 * inicial si es la primera vez. Idempotente mientras la
 * variable `_grafo_cargado` este en true.
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
    const corridas = Nodo.crear_con_dato("");
    raiz._adyacente_en(corridas, "corridas");
}

/**
 * Registra una corrida en el grafo. La fecha_hora se guarda
 * como string ISO. Todos los datos se guardan como strings
 * (convencion del framework).
 *
 * @param {Object} datos
 * @param {string} datos.id_prueba
 * @param {string} datos.fecha_hora
 * @param {string} datos.resultado  "ok" / "fallo" / "error"
 * @param {number} datos.duracion_ms
 * @param {string} [datos.detalle]
 * @returns {Promise<string>} id de la corrida creada.
 */
export async function registrar_corrida(datos) {
    await asegurar_grafo_cargado();

    const Controlador = await obtener_controlador();
    const raiz = Nodo.nodo_por_id("plugin");
    if (!raiz) throw new Error("No se encontro el nodo raiz del plugin");

    const corridas = raiz.adyacente("corridas");
    if (!corridas) throw new Error("No se encontro el contenedor de corridas");

    const id_corrida = "corrida_" + Date.now();
    const nodo = Nodo.crear_con_dato(id_corrida);
    nodo._adyacente_en(Nodo.crear_con_dato(String(datos.id_prueba)), "id_prueba");
    nodo._adyacente_en(Nodo.crear_con_dato(String(datos.fecha_hora)), "fecha_hora");
    nodo._adyacente_en(Nodo.crear_con_dato(String(datos.resultado)), "resultado");
    nodo._adyacente_en(Nodo.crear_con_dato(String(datos.duracion_ms)), "duracion_ms");
    if (datos.detalle) {
        nodo._adyacente_en(Nodo.crear_con_dato(String(datos.detalle)), "detalle");
    }
    corridas._adyacente_en(nodo, id_corrida);

    const ok = await Controlador.guardar(NOMBRE_GRAFO);
    if (!ok) throw new Error("No se pudo guardar el grafo tras registrar la corrida");

    return id_corrida;
}

/**
 * Devuelve las ultimas corridas registradas (mas recientes
 * primero). Pensado para el popup.
 *
 * @param {number} [limite=20]
 * @returns {Promise<Array>}
 */
export async function listar_ultimas_corridas(limite = 20) {
    await asegurar_grafo_cargado();

    const raiz = Nodo.nodo_por_id("plugin");
    if (!raiz) return [];
    const corridas = raiz.adyacente("corridas");
    if (!corridas) return [];

    const items = [];
    const ady = corridas.adyacentes();
    if (!ady) return [];

    for (const [id, nodo] of ady) {
        items.push({
            id,
            id_prueba: nodo.adyacente("id_prueba") ? nodo.adyacente("id_prueba").dato() : "",
            fecha_hora: nodo.adyacente("fecha_hora") ? nodo.adyacente("fecha_hora").dato() : "",
            resultado: nodo.adyacente("resultado") ? nodo.adyacente("resultado").dato() : "",
            duracion_ms: nodo.adyacente("duracion_ms") ? nodo.adyacente("duracion_ms").dato() : "",
            detalle: nodo.adyacente("detalle") ? nodo.adyacente("detalle").dato() : ""
        });
    }

    items.sort((a, b) => String(b.fecha_hora).localeCompare(String(a.fecha_hora)));
    return items.slice(0, limite);
}