import { Objeto } from "../../Nucleo/index.js";
import { Nodo } from "../../Nodos/index.js";
import { Conf } from "../../Configuracion/index.js";
import { mezclar_clase_con_interfaces } from "../../miscelaneas/mixin.js";
import { PerdurarSuperestructura } from "./PerdurarSuperestructura.js";
import { PerdurarSuperestructuraConContexto } from "./PerdurarSuperestructuraConContexto.js";
console.log("PerdurarSuperestructuraStringIndexedDB64");

/**
 * Persistencia en IndexedDB con soporte de contextos (hasta 64).
 *
 * Espejo JS de PerdurarSuperestructuraStringSQL64 (PHP).
 * Usa una base de datos separada (mismo nombre + "_ctx")
 * con tres almacenes nuevos: nodos_contexto,
 * adyacentes_contexto y contextos. La base existente
 * (HyS) queda intacta, así los dos métodos coexisten sin
 * pisarse.
 *
 * Los contextos son los IDs especiales del grafo. Cada
 * nodo lleva un entero `_contexto_mascara` con los bits de
 * sus contextos alcanzantes.
 *
 * @author Ignacio David Baigorria
 * @version 1.5i.7k
 * @since 1.5i.7k
 */
class PerdurarSuperestructuraStringIndexedDB64 extends mezclar_clase_con_interfaces(Objeto, PerdurarSuperestructura, PerdurarSuperestructuraConContexto) {

    static #NOMBRE_BD = Conf.SUPERESTRUCTURA_NOMBRE_BD_INDEXEDDB + "_ctx";
    static #VERSION_BD = 1;

    static #ALMACEN_NODOS = "nodos_contexto";
    static #ALMACEN_ADYACENTES = "adyacentes_contexto";
    static #ALMACEN_CONTEXTOS = "contextos";

    static #token = "";

    /**
     * Recibe el token de seguridad desde la clase Controlador.
     * @param {string} token
     * @returns {void}
     */
    static recibir_token(token) {
        this.#token = token;
    }

    /**
     * Abre (y crea si es necesario) la base de datos de IndexedDB
     * para la persistencia con contextos.
     *
     * @private
     * @returns {Promise<IDBDatabase>}
     */
    static #abrir_BD() {
        return new Promise((resolve, reject) => {
            const solicitud = indexedDB.open(this.#NOMBRE_BD, this.#VERSION_BD);

            solicitud.onerror = () => reject(new Error("No se pudo abrir la base de datos de contextos"));
            solicitud.onsuccess = () => resolve(solicitud.result);

            solicitud.onupgradeneeded = (event) => {
                const db = event.target.result;
                const tx = event.target.transaction;

                const indexName = "idsuperestructura";

                // NODOS_CONTEXTO
                let almacenNodos;
                if (!db.objectStoreNames.contains(this.#ALMACEN_NODOS)) {
                    almacenNodos = db.createObjectStore(this.#ALMACEN_NODOS, {
                        keyPath: ["idsuperestructura", "idnodo"]
                    });
                } else {
                    almacenNodos = tx.objectStore(this.#ALMACEN_NODOS);
                }
                const idxNodos = almacenNodos.indexNames;
                const existeIdxNodos = (typeof idxNodos.contains === "function")
                    ? idxNodos.contains(indexName)
                    : Array.from(idxNodos).includes(indexName);
                if (!existeIdxNodos) {
                    almacenNodos.createIndex(indexName, "idsuperestructura", { unique: false });
                }

                // ADYACENTES_CONTEXTO
                let almacenAdy;
                if (!db.objectStoreNames.contains(this.#ALMACEN_ADYACENTES)) {
                    almacenAdy = db.createObjectStore(this.#ALMACEN_ADYACENTES, {
                        keyPath: ["idsuperestructura", "idnodo", "enlace", "idadyacente"]
                    });
                } else {
                    almacenAdy = tx.objectStore(this.#ALMACEN_ADYACENTES);
                }
                const idxAdy = almacenAdy.indexNames;
                const existeIdxAdy = (typeof idxAdy.contains === "function")
                    ? idxAdy.contains(indexName)
                    : Array.from(idxAdy).includes(indexName);
                if (!existeIdxAdy) {
                    almacenAdy.createIndex(indexName, "idsuperestructura", { unique: false });
                }

                // CONTEXTOS
                let almacenCtx;
                if (!db.objectStoreNames.contains(this.#ALMACEN_CONTEXTOS)) {
                    almacenCtx = db.createObjectStore(this.#ALMACEN_CONTEXTOS, {
                        keyPath: ["idsuperestructura", "bit"]
                    });
                } else {
                    almacenCtx = tx.objectStore(this.#ALMACEN_CONTEXTOS);
                }
                const idxCtx = almacenCtx.indexNames;
                const existeIdxCtx = (typeof idxCtx.contains === "function")
                    ? idxCtx.contains(indexName)
                    : Array.from(idxCtx).includes(indexName);
                if (!existeIdxCtx) {
                    almacenCtx.createIndex(indexName, "idsuperestructura", { unique: false });
                }
            };
        });
    }

    /**
     * Carga los contextos ya registrados para una superestructura.
     * Devuelve un Map { nombre → bit }.
     *
     * @private
     * @param {IDBDatabase} db
     * @param {string} nombre
     * @returns {Promise<Map<string, number>>}
     */
    static #obtener_contextos_registrados(db, nombre) {
        return new Promise((resolve, reject) => {
            const tx = db.transaction([this.#ALMACEN_CONTEXTOS], "readonly");
            const almacen = tx.objectStore(this.#ALMACEN_CONTEXTOS);
            const index = almacen.index("idsuperestructura");
            const solicitud = index.getAll(IDBKeyRange.only(String(nombre)));

            solicitud.onsuccess = () => {
                const mapa = new Map();
                for (const fila of solicitud.result) {
                    mapa.set(String(fila.nombre), Number(fila.bit));
                }
                resolve(mapa);
            };
            solicitud.onerror = () => reject(solicitud.error);
        });
    }

    /**
     * Calcula la máscara de cada nodo por BFS multi-fuente desde
     * los IDs especiales. También registra los contextos nuevos.
     *
     * @private
     * @param {IDBDatabase} db
     * @param {string} nombre
     * @returns {Promise<Map<string, number>|null>}
     */
    static async #calcular_y_registrar_contextos(db, nombre) {
        // 1. IDs especiales en memoria, ordenados alfabéticamente.
        const especiales = [];
        Nodo.por_cada_nodo_ejecutar(this.#token, (nodo) => {
            const id = String(nodo.id());
            if (isNaN(Number(id))) {
                especiales.push(id);
            }
        }, null);
        especiales.sort();

        // 2. Contextos ya registrados.
        const bits_por_contexto = await this.#obtener_contextos_registrados(db, nombre);
        let siguiente_bit = 0;
        for (const b of bits_por_contexto.values()) {
            if (b >= siguiente_bit) siguiente_bit = b + 1;
        }

        // 3. Registrar contextos nuevos.
        const nuevos_contextos = [];
        for (const id of especiales) {
            if (!bits_por_contexto.has(id)) {
                if (siguiente_bit >= 64) {
                    this._error("IndexedDB64: límite de 64 contextos alcanzado.");
                    return null;
                }
                const bit = siguiente_bit;
                bits_por_contexto.set(id, bit);
                nuevos_contextos.push({ id, bit });
                siguiente_bit++;
            }
        }

        if (nuevos_contextos.length > 0) {
            await this.#insertar_contextos(db, nombre, nuevos_contextos);
        }

        // 4. BFS multi-fuente.
        const mascaras = new Map();
        const cola = [];
        for (const id of especiales) {
            mascaras.set(id, 1 << bits_por_contexto.get(id));
            cola.push(id);
        }
        while (cola.length > 0) {
            const id = cola.shift();
            if (!Nodo.existe(id)) continue;
            const nodo = Nodo.nodo_por_id(id);
            if (!nodo) continue;
            const adyacentes = nodo.adyacentes();
            if (!adyacentes) continue;
            for (const [, destino] of adyacentes) {
                const id_dest = String(destino.id());
                const actual = mascaras.get(id_dest) || 0;
                const nueva = actual | mascaras.get(id);
                if (nueva !== actual) {
                    mascaras.set(id_dest, nueva);
                    cola.push(id_dest);
                }
            }
        }
        return mascaras;
    }

    /**
     * Inserta contextos nuevos en el almacén `contextos`.
     *
     * @private
     * @param {IDBDatabase} db
     * @param {string} nombre
     * @param {Array<{id: string, bit: number}>} nuevos
     * @returns {Promise<void>}
     */
    static #insertar_contextos(db, nombre, nuevos) {
        return new Promise((resolve, reject) => {
            const tx = db.transaction([this.#ALMACEN_CONTEXTOS], "readwrite");
            const almacen = tx.objectStore(this.#ALMACEN_CONTEXTOS);
            for (const c of nuevos) {
                almacen.add({
                    idsuperestructura: String(nombre),
                    bit: c.bit,
                    nombre: c.id
                });
            }
            tx.oncomplete = () => resolve();
            tx.onerror = (event) => reject(event.target.error || new Error("Error insertando contextos"));
            tx.onabort = () => reject(new Error("Transacción abortada (contextos)"));
        });
    }

    /**
     * Guarda la superestructura calculando y persistiendo el
     * bitmask de cada nodo.
     *
     * @param {string} nombre
     * @returns {Promise<boolean>}
     */
    static async guardar(nombre) {
        if (!Nodo.hay_nodos_en_superestructura()) {
            this._error("IndexedDB64::guardar: no hay nodos.");
            return false;
        }

        let db = null;
        try {
            db = await this.#abrir_BD();

            const mascaras = await this.#calcular_y_registrar_contextos(db, nombre);
            if (mascaras === null) {
                return false;
            }

            const nodos = this.#crear_datos_insertar_nodos(nombre, mascaras);
            const adyacentes = this.#crear_datos_insertar_adyacentes(nombre);

            await this.#reemplazar_en_transaccion(db, nombre, nodos, adyacentes);
            return true;
        } catch (error) {
            this._error("Error en guardar (IndexedDB64): " + error.message);
            return false;
        } finally {
            if (db) {
                try { db.close(); } catch (e) { /* ignorar */ }
            }
        }
    }

    /**
     * Prepara los nodos para insertar, incluyendo la máscara.
     *
     * @private
     * @param {string} nombre
     * @param {Map<string, number>} mascaras
     * @returns {Array}
     */
    static #crear_datos_insertar_nodos(nombre, mascaras) {
        const datos = Nodo.por_cada_nodo_ejecutar(this.#token, (nodo) => nodo.dato(), null) || {};
        const nodos = [];

        for (let [id, dato] of Object.entries(datos)) {
            if (dato === null || dato === undefined) {
                dato = "";
            } else {
                dato = String(dato);
            }
            const mascara = mascaras.get(String(id)) || 0;
            nodos.push({
                idsuperestructura: String(nombre),
                idnodo: String(id),
                dato: dato,
                contexto_mascara: mascara
            });
        }

        return nodos;
    }

    /**
     * Prepara los adyacentes para insertar.
     *
     * @private
     * @param {string} nombre
     * @returns {Array}
     */
    static #crear_datos_insertar_adyacentes(nombre) {
        const datos = Nodo.por_cada_nodo_ejecutar(this.#token, (nodo) => {
            const enlaces = {};
            const ady = nodo.adyacentes();
            if (ady) {
                for (const [enlace, adyacente] of ady) {
                    enlaces[enlace] = adyacente.id();
                }
            }
            return enlaces;
        }, null) || {};

        const adyacentes = [];
        for (const [idnodo, enlaces] of Object.entries(datos)) {
            for (const [enlace, idadyacente] of Object.entries(enlaces)) {
                adyacentes.push({
                    idsuperestructura: String(nombre),
                    idnodo: String(idnodo),
                    enlace: String(enlace),
                    idadyacente: String(idadyacente)
                });
            }
        }
        return adyacentes;
    }

    /**
     * Reemplaza (borra e inserta) todos los nodos y adyacentes de una
     * superestructura en una sola transacción atómica.
     *
     * @private
     * @param {IDBDatabase} db
     * @param {string} nombre
     * @param {Array} nodos
     * @param {Array} adyacentes
     * @returns {Promise<void>}
     */
    static #reemplazar_en_transaccion(db, nombre, nodos, adyacentes) {
        return new Promise((resolve, reject) => {
            let tx;
            try {
                tx = db.transaction([this.#ALMACEN_NODOS, this.#ALMACEN_ADYACENTES], "readwrite");
            } catch (e) {
                reject(e);
                return;
            }

            const almacen_nodos = tx.objectStore(this.#ALMACEN_NODOS);
            const almacen_ady = tx.objectStore(this.#ALMACEN_ADYACENTES);
            const rango = IDBKeyRange.only(String(nombre));

            let pendientes_borrado = 2;
            const al_terminar_borrado = () => {
                pendientes_borrado--;
                if (pendientes_borrado !== 0) return;
                for (const n of nodos) almacen_nodos.add(n);
                for (const a of adyacentes) almacen_ady.add(a);
            };

            const cursor_nodos = almacen_nodos.index("idsuperestructura").openCursor(rango);
            cursor_nodos.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    cursor.delete();
                    cursor.continue();
                } else {
                    al_terminar_borrado();
                }
            };

            const cursor_ady = almacen_ady.index("idsuperestructura").openCursor(rango);
            cursor_ady.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    cursor.delete();
                    cursor.continue();
                } else {
                    al_terminar_borrado();
                }
            };

            tx.oncomplete = () => resolve();
            tx.onerror = (event) => reject(event.target.error || new Error("Error en transacción"));
            tx.onabort = () => reject(new Error("Transacción abortada"));
        });
    }

    /**
     * Carga una superestructura completa desde IndexedDB64.
     * El bitmask se asigna a cada nodo en memoria.
     *
     * @param {string} nombre
     * @returns {Promise<boolean|null>}
     */
    static async cargar(nombre) {
        if (typeof nombre !== "string") {
            this._error("cargar (IndexedDB64): el identificador no es string.");
            return false;
        }

        let db = null;
        try {
            db = await this.#abrir_BD();

            if (!(await this.#existe_superestructura(db, nombre))) {
                this._alerta("cargar (IndexedDB64): no existe superestructura con ese nombre.");
                return false;
            }

            const nodos = await this.#obtener_nodos_por_superestructura(db, nombre);
            const equivalencias = {};

            for (const nodo of nodos) {
                const id = String(nodo.idnodo);
                const mascara = Number(nodo.contexto_mascara) | 0;
                if (this.es_id_especial(id)) {
                    let naux = Nodo.nodo_por_id(id);
                    if (!naux) {
                        naux = Nodo.crear_con_dato_e_id(nodo.dato, id);
                    } else {
                        naux._dato(nodo.dato);
                    }
                    if (naux) naux._establecer_contexto_mascara(mascara);
                } else {
                    const nuevo = Nodo.crear_con_dato(nodo.dato);
                    nuevo._establecer_contexto_mascara(mascara);
                    equivalencias[id] = nuevo.id();
                }
            }

            const adyacentes = await this.#obtener_adyacentes_por_superestructura(db, nombre);
            for (const ady of adyacentes) {
                let idnod = String(ady.idnodo);
                if (!this.es_id_especial(idnod)) {
                    if (!equivalencias.hasOwnProperty(idnod)) continue;
                    idnod = equivalencias[idnod];
                }
                let idady = String(ady.idadyacente);
                if (!this.es_id_especial(idady)) {
                    if (!equivalencias.hasOwnProperty(idady)) continue;
                    idady = equivalencias[idady];
                }
                const nodo = Nodo.nodo_por_id(idnod);
                const nodoady = Nodo.nodo_por_id(idady);
                if (nodo && nodoady) {
                    nodo._adyacente_en(nodoady, ady.enlace);
                }
            }

            return true;
        } catch (error) {
            this._error("Error en cargar (IndexedDB64): " + error.message);
            return null;
        } finally {
            if (db) {
                try { db.close(); } catch (e) { /* ignorar */ }
            }
        }
    }

    /**
     * Carga solo los nodos que pertenecen a alguno de los
     * contextos pedidos.
     *
     * Los enlaces a nodos fuera del filtro se descartan
     * silenciosamente.
     *
     * @param {string} nombre
     * @param {string[]} contextos
     * @returns {Promise<boolean|null>}
     */
    static async cargar_parcial(nombre, contextos) {
        if (typeof nombre !== "string") {
            this._error("cargar_parcial (IndexedDB64): el identificador no es string.");
            return false;
        }

        let db = null;
        try {
            db = await this.#abrir_BD();

            const bits_registrados = await this.#obtener_contextos_registrados(db, nombre);
            let mascara_pedida = 0;
            for (const ctx of contextos) {
                const ctx_str = String(ctx);
                if (!bits_registrados.has(ctx_str)) {
                    this._error("IndexedDB64::cargar_parcial: contexto '" + ctx_str + "' no registrado en '" + nombre + "'.");
                    return false;
                }
                mascara_pedida |= (1 << bits_registrados.get(ctx_str));
            }

            const nodos_todos = await this.#obtener_nodos_por_superestructura(db, nombre);
            const nodos = nodos_todos.filter(n => (Number(n.contexto_mascara) | 0) & mascara_pedida);

            const equivalencias = {};
            for (const nodo of nodos) {
                const id = String(nodo.idnodo);
                const mascara = Number(nodo.contexto_mascara) | 0;
                if (this.es_id_especial(id)) {
                    let naux = Nodo.nodo_por_id(id);
                    if (!naux) {
                        naux = Nodo.crear_con_dato_e_id(nodo.dato, id);
                    } else {
                        naux._dato(nodo.dato);
                    }
                    if (naux) naux._establecer_contexto_mascara(mascara);
                } else {
                    const nuevo = Nodo.crear_con_dato(nodo.dato);
                    nuevo._establecer_contexto_mascara(mascara);
                    equivalencias[id] = nuevo.id();
                }
            }

            const adyacentes = await this.#obtener_adyacentes_por_superestructura(db, nombre);
            for (const ady of adyacentes) {
                let idnod = String(ady.idnodo);
                if (!this.es_id_especial(idnod)) {
                    if (!equivalencias.hasOwnProperty(idnod)) continue;
                    idnod = equivalencias[idnod];
                }
                let idady = String(ady.idadyacente);
                if (!this.es_id_especial(idady)) {
                    if (!equivalencias.hasOwnProperty(idady)) continue;
                    idady = equivalencias[idady];
                }
                const nodo = Nodo.nodo_por_id(idnod);
                const nodoady = Nodo.nodo_por_id(idady);
                if (nodo && nodoady) {
                    nodo._adyacente_en(nodoady, ady.enlace);
                }
            }

            return true;
        } catch (error) {
            this._error("Error en cargar_parcial (IndexedDB64): " + error.message);
            return null;
        } finally {
            if (db) {
                try { db.close(); } catch (e) { /* ignorar */ }
            }
        }
    }

    /**
     * Guarda solo el subgrafo en memoria filtrando por contextos.
     * STUB en fase 2: devuelve error.
     *
     * @param {string} nombre
     * @param {string[]} contextos
     * @returns {Promise<boolean>}
     */
    static async guardar_parcial(nombre, contextos) {
        this._error("IndexedDB64::guardar_parcial: aún no implementado (fase 2).");
        return false;
    }

    /**
     * Lista los contextos registrados bajo un nombre.
     *
     * @param {string} nombre
     * @returns {Promise<string[]|null>}
     */
    static async listar_contextos(nombre) {
        if (typeof nombre !== "string") {
            this._error("listar_contextos (IndexedDB64): el identificador no es string.");
            return null;
        }

        let db = null;
        try {
            db = await this.#abrir_BD();
            const bits = await this.#obtener_contextos_registrados(db, nombre);
            const entradas = Array.from(bits.entries()).sort((a, b) => a[1] - b[1]);
            return entradas.map(e => e[0]);
        } catch (error) {
            this._error("Error en listar_contextos (IndexedDB64): " + error.message);
            return null;
        } finally {
            if (db) {
                try { db.close(); } catch (e) { /* ignorar */ }
            }
        }
    }

    /**
     * Elimina una superestructura de IndexedDB64 (las tres tablas).
     *
     * @param {string} nombre
     * @returns {Promise<boolean|null>}
     */
    static async eliminar(nombre) {
        if (typeof nombre !== "string") {
            this._error("eliminar (IndexedDB64): el identificador no es string.");
            return null;
        }

        let db = null;
        try {
            db = await this.#abrir_BD();
            const existia = await this.#existe_superestructura(db, nombre);
            if (!existia) {
                this._error("eliminar (IndexedDB64): no existe superestructura con ese nombre.");
                return false;
            }
            await this.#eliminar_por_superestructura(db, nombre);
            return true;
        } catch (error) {
            this._error("Error en eliminar (IndexedDB64): " + error.message);
            return null;
        } finally {
            if (db) {
                try { db.close(); } catch (e) { /* ignorar */ }
            }
        }
    }

    /**
     * Verifica la existencia de una superestructura en IndexedDB64.
     *
     * @param {string} nombre
     * @returns {Promise<boolean|null>}
     */
    static async existe(nombre) {
        if (typeof nombre !== "string") {
            this._error("existe (IndexedDB64): el identificador no es string.");
            return null;
        }

        let db = null;
        try {
            db = await this.#abrir_BD();
            return await this.#existe_superestructura(db, nombre);
        } catch (error) {
            this._error("Error en existe (IndexedDB64): " + error.message);
            return null;
        } finally {
            if (db) {
                try { db.close(); } catch (e) { /* ignorar */ }
            }
        }
    }

    // ─────────────────────────────────────────────────────
    // Helpers privados
    // ─────────────────────────────────────────────────────

    /**
     * Elimina todos los registros asociados a una superestructura
     * en los tres almacenes, en una sola transacción.
     *
     * @private
     * @param {IDBDatabase} db
     * @param {string} nombre
     * @returns {Promise<void>}
     */
    static #eliminar_por_superestructura(db, nombre) {
        return new Promise((resolve, reject) => {
            let tx;
            try {
                tx = db.transaction([this.#ALMACEN_NODOS, this.#ALMACEN_ADYACENTES, this.#ALMACEN_CONTEXTOS], "readwrite");
            } catch (e) {
                reject(e);
                return;
            }

            const rango = IDBKeyRange.only(String(nombre));

            for (const almacen_nombre of [this.#ALMACEN_NODOS, this.#ALMACEN_ADYACENTES, this.#ALMACEN_CONTEXTOS]) {
                const almacen = tx.objectStore(almacen_nombre);
                const index = almacen.index("idsuperestructura");
                const cursor = index.openCursor(rango);
                cursor.onsuccess = (event) => {
                    const c = event.target.result;
                    if (c) {
                        c.delete();
                        c.continue();
                    }
                };
            }

            tx.oncomplete = () => resolve();
            tx.onerror = (event) => reject(event.target.error);
            tx.onabort = () => reject(new Error("Transacción abortada (eliminar)"));
        });
    }

    /**
     * Verifica si existe una superestructura con ese nombre.
     *
     * @private
     * @param {IDBDatabase} db
     * @param {string} nombre
     * @returns {Promise<boolean>}
     */
    static #existe_superestructura(db, nombre) {
        return new Promise((resolve, reject) => {
            const tx = db.transaction([this.#ALMACEN_NODOS], "readonly");
            const almacen = tx.objectStore(this.#ALMACEN_NODOS);
            const index = almacen.index("idsuperestructura");
            const solicitud = index.count(IDBKeyRange.only(String(nombre)));
            solicitud.onsuccess = () => resolve(solicitud.result > 0);
            solicitud.onerror = () => reject(solicitud.error);
        });
    }

    /**
     * Obtiene todos los nodos de una superestructura.
     *
     * @private
     * @param {IDBDatabase} db
     * @param {string} nombre
     * @returns {Promise<Array>}
     */
    static #obtener_nodos_por_superestructura(db, nombre) {
        return new Promise((resolve, reject) => {
            const tx = db.transaction([this.#ALMACEN_NODOS], "readonly");
            const almacen = tx.objectStore(this.#ALMACEN_NODOS);
            const index = almacen.index("idsuperestructura");
            const solicitud = index.getAll(IDBKeyRange.only(String(nombre)));
            solicitud.onsuccess = () => resolve(solicitud.result);
            solicitud.onerror = () => reject(solicitud.error);
        });
    }

    /**
     * Obtiene todos los adyacentes de una superestructura.
     *
     * @private
     * @param {IDBDatabase} db
     * @param {string} nombre
     * @returns {Promise<Array>}
     */
    static #obtener_adyacentes_por_superestructura(db, nombre) {
        return new Promise((resolve, reject) => {
            const tx = db.transaction([this.#ALMACEN_ADYACENTES], "readonly");
            const almacen = tx.objectStore(this.#ALMACEN_ADYACENTES);
            const index = almacen.index("idsuperestructura");
            const solicitud = index.getAll(IDBKeyRange.only(String(nombre)));
            solicitud.onsuccess = () => resolve(solicitud.result);
            solicitud.onerror = () => reject(solicitud.error);
        });
    }
}

export { PerdurarSuperestructuraStringIndexedDB64 };