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
 * adyacentes_contexto y contextos.
 *
 * ## Esquema (V1.5i.8b)
 *
 * `nodos_contexto` identifica cada nodo por `id_fila`
 * (autoIncrement, estable entre sesiones). La columna
 * `id_especial` guarda el ID especial del framework cuando
 * el nodo lo tiene (undefined para los numéricos).
 *
 * `adyacentes_contexto` referencia sus dos extremos por
 * `idnodo_fila` / `idadyacente_fila`, no por los IDs del
 * framework.
 *
 * ## Mapa en memoria
 *
 * `#mapa_id_a_fila[$nombre][$id_nodo_framework] = $id_fila`
 * se llena al cargar y se consulta al guardar parcial.
 *
 * @author Ignacio David Baigorria
 * @version V1.5i.8c
 * @since 1.5i.7k
 */
class PerdurarSuperestructuraStringIndexedDB64 extends mezclar_clase_con_interfaces(Objeto, PerdurarSuperestructura, PerdurarSuperestructuraConContexto) {

    static #NOMBRE_BD = Conf.SUPERESTRUCTURA_NOMBRE_BD_INDEXEDDB + "_ctx";
    static #VERSION_BD = 2;

    static #ALMACEN_NODOS = "nodos_contexto";
    static #ALMACEN_ADYACENTES = "adyacentes_contexto";
    static #ALMACEN_CONTEXTOS = "contextos";

    static #token = "";

    /**
     * Mapa [idsuperestructura => {id_nodo_framework: id_fila}].
     * Llena al cargar, consulta al guardar parcial.
     * @type {Object<string, Object<string, number>>}
     */
    static #mapa_id_a_fila = {};

    static recibir_token(token) {
        this.#token = token;
    }

    static #abrir_BD() {
        return new Promise((resolve, reject) => {
            const solicitud = indexedDB.open(this.#NOMBRE_BD, this.#VERSION_BD);

            solicitud.onerror = () => reject(new Error("No se pudo abrir la base de datos de contextos"));
            solicitud.onsuccess = () => resolve(solicitud.result);

            solicitud.onupgradeneeded = (event) => {
                const db = event.target.result;

                // El esquema cambia: borrar y recrear los almacenes.
                // Los datos del grafo del plugin se pierden. Es aceptable:
                // la fuente real es MySQL del piloto.
                for (const nombre of [this.#ALMACEN_NODOS, this.#ALMACEN_ADYACENTES, this.#ALMACEN_CONTEXTOS]) {
                    if (db.objectStoreNames.contains(nombre)) {
                        db.deleteObjectStore(nombre);
                    }
                }

                // NODOS_CONTEXTO: id_fila autoIncrement como keyPath.
                const almacenNodos = db.createObjectStore(this.#ALMACEN_NODOS, {
                    keyPath: "id_fila",
                    autoIncrement: true
                });
                almacenNodos.createIndex("idsuperestructura", "idsuperestructura", { unique: false });
                // Índice único [idsuperestructura, id_especial].
                // undefined no se indexa: los nodos sin ID especial no
                // colisionan entre sí. Réplica del UNIQUE KEY de MySQL
                // con NULLs.
                almacenNodos.createIndex("uq_especial", ["idsuperestructura", "id_especial"], { unique: true });

                // ADYACENTES_CONTEXTO: por id_fila.
                const almacenAdy = db.createObjectStore(this.#ALMACEN_ADYACENTES, {
                    keyPath: ["idsuperestructura", "idnodo_fila", "enlace", "idadyacente_fila"]
                });
                almacenAdy.createIndex("idsuperestructura", "idsuperestructura", { unique: false });
                almacenAdy.createIndex("idx_ady_dest", ["idsuperestructura", "idadyacente_fila"], { unique: false });

                // CONTEXTOS
                const almacenCtx = db.createObjectStore(this.#ALMACEN_CONTEXTOS, {
                    keyPath: ["idsuperestructura", "bit"]
                });
                almacenCtx.createIndex("idsuperestructura", "idsuperestructura", { unique: false });
            };
        });
    }

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

    static async #calcular_y_registrar_contextos(db, nombre) {
        const especiales = [];
        Nodo.por_cada_nodo_ejecutar(this.#token, (nodo) => {
            const id = String(nodo.id());
            if (isNaN(Number(id))) {
                especiales.push(id);
            }
        }, null);
        especiales.sort();

        const bits_por_contexto = await this.#obtener_contextos_registrados(db, nombre);
        let siguiente_bit = 0;
        for (const b of bits_por_contexto.values()) {
            if (b >= siguiente_bit) siguiente_bit = b + 1;
        }

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

    static async guardar(nombre) {
        if (!Nodo.hay_nodos_en_superestructura()) {
            this._error("IndexedDB64::guardar: no hay nodos.");
            return false;
        }
        let db = null;
        try {
            db = await this.#abrir_BD();
            return await this.#guardar_con_filtro(db, nombre, 0);
        } catch (error) {
            this._error("Error en guardar (IndexedDB64): " + error.message);
            return false;
        } finally {
            if (db) { try { db.close(); } catch (e) { /* ignorar */ } }
        }
    }

    static async #guardar_con_filtro(db, nombre, mascara_filtro) {
        const mascaras = await this.#calcular_y_registrar_contextos(db, nombre);
        if (mascaras === null) return false;

        // Con filtro, unir con la máscara previa del nodo.
        if (mascara_filtro !== 0) {
            Nodo.por_cada_nodo_ejecutar(this.#token, (nodo) => {
                const id = String(nodo.id());
                const m_previa = Number(nodo.contexto_mascara() || 0) | 0;
                const m_bfs = Number(mascaras.get(id) || 0) | 0;
                mascaras.set(id, (m_previa | m_bfs) | 0);
            }, null);
        }

        // Snapshot del mapa (id_nodo_framework -> id_fila).
        const mapa_previo = Object.assign({}, this.#mapa_id_a_fila[nombre] || {});

        // Propagar máscaras a nodos nuevos (los que no están
        // en el mapa previo) a partir de enlaces entrantes.
        // Iterar hasta punto fijo. Fix V1.5i.8c.
        if (mascara_filtro !== 0 && Object.keys(mapa_previo).length > 0) {
            const nuevos = new Set();
            Nodo.por_cada_nodo_ejecutar(this.#token, (nodo) => {
                const id = String(nodo.id());
                if (!(id in mapa_previo)) {
                    nuevos.add(id);
                }
            }, null);
            if (nuevos.size > 0) {
                let cambio = true;
                let iter = 0;
                while (cambio && iter < 10) {
                    cambio = false;
                    iter++;
                    Nodo.por_cada_nodo_ejecutar(this.#token, (nodo) => {
                        const id_origen = String(nodo.id());
                        const m_origen = Number(mascaras.get(id_origen) || 0) | 0;
                        if (m_origen === 0) return;
                        const ady = nodo.adyacentes();
                        if (!ady) return;
                        for (const [, dest] of ady) {
                            const id_dest = String(dest.id());
                            if (!nuevos.has(id_dest)) continue;
                            const m_dest = Number(mascaras.get(id_dest) || 0) | 0;
                            const m_nueva = (m_dest | m_origen) | 0;
                            if (m_nueva !== m_dest) {
                                mascaras.set(id_dest, m_nueva);
                                cambio = true;
                            }
                        }
                    }, null);
                }
            }
        }

        // Filas cargadas (para el DELETE parcial).
        const filas_cargadas = [];
        if (mascara_filtro !== 0) {
            for (const v of Object.values(mapa_previo)) {
                if (!filas_cargadas.includes(v)) filas_cargadas.push(v);
            }
        }

        // Nodos a insertar (uno por uno para capturar la clave).
        const nodos_a_insertar = [];
        Nodo.por_cada_nodo_ejecutar(this.#token, (nodo) => {
            const id = String(nodo.id());
            const m = Number(mascaras.get(id) || 0) | 0;
            if (mascara_filtro !== 0 && (m & mascara_filtro) === 0) return;
            nodos_a_insertar.push({
                id_nodo: id,
                dato: nodo.dato(),
                contexto_mascara: m,
                es_especial: this.es_id_especial(id)
            });
        }, null);

        return await this.#reemplazar_en_transaccion(db, nombre, nodos_a_insertar, mascaras, mascara_filtro, filas_cargadas, mapa_previo);
    }

    static #reemplazar_en_transaccion(db, nombre, nodos_a_insertar, mascaras, mascara_filtro, filas_cargadas, mapa_previo) {
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
            const self = this;

            // 1. DELETE.
            let pendientes_borrado = 2;
            const al_terminar_borrado = () => {
                pendientes_borrado--;
                if (pendientes_borrado !== 0) return;
                self.#insertar_todo(almacen_nodos, almacen_ady, nombre, nodos_a_insertar, mascaras, mascara_filtro, mapa_previo);
            };

            const cursor_nodos = almacen_nodos.index("idsuperestructura").openCursor(rango);
            cursor_nodos.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    if (mascara_filtro === 0) {
                        cursor.delete();
                    } else {
                        const id_fila = Number(cursor.value.id_fila);
                        if (filas_cargadas.includes(id_fila)) cursor.delete();
                    }
                    cursor.continue();
                } else {
                    al_terminar_borrado();
                }
            };

            const cursor_ady = almacen_ady.index("idsuperestructura").openCursor(rango);
            cursor_ady.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    if (mascara_filtro === 0) {
                        cursor.delete();
                    } else {
                        const fo = Number(cursor.value.idnodo_fila);
                        const fd = Number(cursor.value.idadyacente_fila);
                        if (filas_cargadas.includes(fo) && filas_cargadas.includes(fd)) {
                            cursor.delete();
                        }
                    }
                    cursor.continue();
                } else {
                    al_terminar_borrado();
                }
            };

            tx.oncomplete = () => resolve(true);
            tx.onerror = (event) => reject(event.target.error || new Error("Error en transacción"));
            tx.onabort = () => reject(new Error("Transacción abortada"));
        });
    }

    static #insertar_todo(almacen_nodos, almacen_ady, nombre, nodos_a_insertar, mascaras, mascara_filtro, mapa_previo) {
        const self = this;
        const mapa_actual = {};

        // INSERT de nodos: uno por uno.
        let i = 0;
        const siguiente_nodo = () => {
            if (i >= nodos_a_insertar.length) {
                self.#insertar_aristas(almacen_ady, nombre, mascaras, mascara_filtro, mapa_actual);
                return;
            }
            const n = nodos_a_insertar[i++];
            const id_especial = n.es_especial ? n.id_nodo : undefined;
            const dato = (n.dato === null || n.dato === undefined) ? "" : String(n.dato);
            const registro = {
                idsuperestructura: String(nombre),
                id_especial: id_especial,
                dato: dato,
                contexto_mascara: n.contexto_mascara
            };
            if (Object.prototype.hasOwnProperty.call(mapa_previo, n.id_nodo)) {
                registro.id_fila = Number(mapa_previo[n.id_nodo]);
            }
            const req = almacen_nodos.add(registro);
            req.onsuccess = () => {
                mapa_actual[n.id_nodo] = Number(req.result);
                siguiente_nodo();
            };
            req.onerror = () => { siguiente_nodo(); };
        };
        siguiente_nodo();

        // Actualizar el mapa estático (asincrónico, se resuelve luego).
        setTimeout(() => {
            self.#mapa_id_a_fila[nombre] = mapa_actual;
        }, 0);
    }

    static #insertar_aristas(almacen_ady, nombre, mascaras, mascara_filtro, mapa_actual) {
        Nodo.por_cada_nodo_ejecutar(this.#token, (nodo) => {
            const id_origen = String(nodo.id());
            const m_o = Number(mascaras.get(id_origen) || 0) | 0;
            if (mascara_filtro !== 0 && (m_o & mascara_filtro) === 0) return;
            if (!Object.prototype.hasOwnProperty.call(mapa_actual, id_origen)) return;
            const fo = Number(mapa_actual[id_origen]);
            const ady = nodo.adyacentes();
            if (!ady) return;
            for (const [enlace, adyacente] of ady) {
                const id_dest = String(adyacente.id());
                const m_d = Number(mascaras.get(id_dest) || 0) | 0;
                if (mascara_filtro !== 0 && (m_d & mascara_filtro) === 0) continue;
                if (!Object.prototype.hasOwnProperty.call(mapa_actual, id_dest)) continue;
                const fd = Number(mapa_actual[id_dest]);
                try {
                    almacen_ady.add({
                        idsuperestructura: String(nombre),
                        idnodo_fila: fo,
                        enlace: String(enlace),
                        idadyacente_fila: fd
                    });
                } catch (e) { /* duplicado, ignorar */ }
            }
        }, null);
    }

    static async cargar(nombre) {
        if (typeof nombre !== "string") {
            this._error("cargar (IndexedDB64): el identificador no es string.");
            return false;
        }
        this.#mapa_id_a_fila[nombre] = {};

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
                const id_fila = Number(nodo.id_fila);
                const id_especial = nodo.id_especial;
                const mascara = Number(nodo.contexto_mascara) | 0;
                if (id_especial !== undefined && id_especial !== null && id_especial !== "") {
                    let naux = Nodo.nodo_por_id(id_especial);
                    if (!naux) naux = Nodo.crear_con_dato_e_id(nodo.dato, id_especial);
                    else naux._dato(nodo.dato);
                    if (naux) {
                        naux._establecer_contexto_mascara(mascara);
                        this.#mapa_id_a_fila[nombre][naux.id()] = id_fila;
                        equivalencias[id_fila] = naux.id();
                    }
                } else {
                    const nuevo = Nodo.crear_con_dato(nodo.dato);
                    nuevo._establecer_contexto_mascara(mascara);
                    this.#mapa_id_a_fila[nombre][nuevo.id()] = id_fila;
                    equivalencias[id_fila] = nuevo.id();
                }
            }
            const adyacentes = await this.#obtener_adyacentes_por_superestructura(db, nombre);
            for (const ady of adyacentes) {
                const fo = Number(ady.idnodo_fila);
                const fd = Number(ady.idadyacente_fila);
                if (!Object.prototype.hasOwnProperty.call(equivalencias, fo)) continue;
                if (!Object.prototype.hasOwnProperty.call(equivalencias, fd)) continue;
                const nodo = Nodo.nodo_por_id(equivalencias[fo]);
                const nodoady = Nodo.nodo_por_id(equivalencias[fd]);
                if (nodo && nodoady) nodo._adyacente_en(nodoady, ady.enlace);
            }
            return true;
        } catch (error) {
            this._error("Error en cargar (IndexedDB64): " + error.message);
            return null;
        } finally {
            if (db) { try { db.close(); } catch (e) { /* ignorar */ } }
        }
    }

    static async cargar_parcial(nombre, contextos) {
        if (typeof nombre !== "string") {
            this._error("cargar_parcial (IndexedDB64): el identificador no es string.");
            return false;
        }
        this.#mapa_id_a_fila[nombre] = {};

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
                const id_fila = Number(nodo.id_fila);
                const id_especial = nodo.id_especial;
                const mascara = Number(nodo.contexto_mascara) | 0;
                if (id_especial !== undefined && id_especial !== null && id_especial !== "") {
                    let naux = Nodo.nodo_por_id(id_especial);
                    if (!naux) naux = Nodo.crear_con_dato_e_id(nodo.dato, id_especial);
                    else naux._dato(nodo.dato);
                    if (naux) {
                        naux._establecer_contexto_mascara(mascara);
                        this.#mapa_id_a_fila[nombre][naux.id()] = id_fila;
                        equivalencias[id_fila] = naux.id();
                    }
                } else {
                    const nuevo = Nodo.crear_con_dato(nodo.dato);
                    nuevo._establecer_contexto_mascara(mascara);
                    this.#mapa_id_a_fila[nombre][nuevo.id()] = id_fila;
                    equivalencias[id_fila] = nuevo.id();
                }
            }
            const adyacentes = await this.#obtener_adyacentes_por_superestructura(db, nombre);
            for (const ady of adyacentes) {
                const fo = Number(ady.idnodo_fila);
                const fd = Number(ady.idadyacente_fila);
                if (!Object.prototype.hasOwnProperty.call(equivalencias, fo)) continue;
                if (!Object.prototype.hasOwnProperty.call(equivalencias, fd)) continue;
                const nodo = Nodo.nodo_por_id(equivalencias[fo]);
                const nodoady = Nodo.nodo_por_id(equivalencias[fd]);
                if (nodo && nodoady) nodo._adyacente_en(nodoady, ady.enlace);
            }
            return true;
        } catch (error) {
            this._error("Error en cargar_parcial (IndexedDB64): " + error.message);
            return null;
        } finally {
            if (db) { try { db.close(); } catch (e) { /* ignorar */ } }
        }
    }

    static async guardar_parcial(nombre, contextos) {
        if (typeof nombre !== "string") {
            this._error("guardar_parcial (IndexedDB64): el identificador no es string.");
            return false;
        }
        if (!Array.isArray(contextos) || contextos.length === 0) {
            this._error("guardar_parcial (IndexedDB64): no se especificaron contextos.");
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
                    this._error("guardar_parcial (IndexedDB64): contexto '" + ctx_str + "' no registrado en '" + nombre + "'.");
                    return false;
                }
                mascara_pedida |= (1 << bits_registrados.get(ctx_str));
            }
            return await this.#guardar_con_filtro(db, nombre, mascara_pedida);
        } catch (error) {
            this._error("Error en guardar_parcial (IndexedDB64): " + error.message);
            return false;
        } finally {
            if (db) { try { db.close(); } catch (e) { /* ignorar */ } }
        }
    }

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
            if (db) { try { db.close(); } catch (e) { /* ignorar */ } }
        }
    }

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
            delete this.#mapa_id_a_fila[nombre];
            return true;
        } catch (error) {
            this._error("Error en eliminar (IndexedDB64): " + error.message);
            return null;
        } finally {
            if (db) { try { db.close(); } catch (e) { /* ignorar */ } }
        }
    }

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
            if (db) { try { db.close(); } catch (e) { /* ignorar */ } }
        }
    }

    static #eliminar_por_superestructura(db, nombre) {
        return new Promise((resolve, reject) => {
            let tx;
            try {
                tx = db.transaction([this.#ALMACEN_NODOS, this.#ALMACEN_ADYACENTES, this.#ALMACEN_CONTEXTOS], "readwrite");
            } catch (e) { reject(e); return; }
            const rango = IDBKeyRange.only(String(nombre));
            for (const almacen_nombre of [this.#ALMACEN_NODOS, this.#ALMACEN_ADYACENTES, this.#ALMACEN_CONTEXTOS]) {
                const almacen = tx.objectStore(almacen_nombre);
                const index = almacen.index("idsuperestructura");
                const cursor = index.openCursor(rango);
                cursor.onsuccess = (event) => {
                    const c = event.target.result;
                    if (c) { c.delete(); c.continue(); }
                };
            }
            tx.oncomplete = () => resolve();
            tx.onerror = (event) => reject(event.target.error);
            tx.onabort = () => reject(new Error("Transacción abortada (eliminar)"));
        });
    }

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