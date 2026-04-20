import { Objeto } from "../../Nucleo/index.js";
import { Nodo } from "../../Nodos/index.js";
import { Conf } from '../../Configuracion/index.js';
import { mezclar_clase_con_interfaces } from "../../miscelaneas/mixin.js";
import { PerdurarSuperestructura } from "./PerdurarSuperestructura.js";
console.log("PerdurarSuperestructuraStringIndexDB");
/**
 * Clase encargada de persistir la superestructura utilizando IndexedDB
 * como alternativa local al sistema SQL. 
 * 
 * Equivalente funcional de {@link PerdurarSuperestructuraStringSQL}.
 * 
 * @extends {Objeto}
 * @implements {PerdurarSuperestructura}
 */
class PerdurarSuperestructuraStringIndexedDB extends mezclar_clase_con_interfaces(Objeto, PerdurarSuperestructura){

    static #NOMBRE_BD = Conf.SUPERESTRUCTURA_NOMBRE_BD_INDEXEDDB;
    static #VERSION_BD = 1;

    // Almacenes
    static #ALMACEN_NODOS = 'nodos';
    static #ALMACEN_ADYACENTES = 'adyacentes';
    /**
     * @type {string} Token de seguridad recibido de la clase Nodo.
     */
    static #token = "";
    /**
     * Recibe el token de seguridad desde la clase Controlador
     *
     * @param {string} token Token de seguridad proporcionado por Nodo.
     * @return {void}
     */
    static recibir_token(token) {
        this.#token= token;
    }
    /**
     * Abre (y crea si es necesario) la base de datos de IndexedDB utilizada para
     * almacenar la superestructura de nodos y adyacentes.
     *
     * ---
     *
     * ### Descripción general
     * Este método gestiona la apertura asíncrona de la base de datos de persistencia
     * de nodos (`IndexedDB`). Si la base de datos o los almacenes no existen, los crea
     * durante el evento `onupgradeneeded`. En caso contrario, obtiene referencias
     * válidas a los `ObjectStore` ya existentes para poder manipularlos dentro de la
     * misma transacción de actualización.
     *
     * ---
     *
     * ### Detalles de implementación
     * - **Nombre de la base de datos:** definido en `this.#NOMBRE_BD`
     * - **Versión:** `this.#VERSION_BD` — si se incrementa este número,
     *   se dispara el evento `onupgradeneeded`, lo que permite actualizar
     *   la estructura interna (crear o modificar almacenes e índices).
     * - **Almacenes creados:**
     *   - `this.#ALMACEN_NODOS`: almacena los nodos individuales.
     *     - `keyPath`: `['idsuperestructura', 'idnodo']`
     *     - Índice: `'idsuperestructura'` (no único)
     *   - `this.#ALMACEN_ADYACENTES`: almacena las relaciones entre nodos.
     *     - `keyPath`: `['idsuperestructura', 'idnodo', 'enlace', 'idadyacente']`
     *     - Índice: `'idsuperestructura'` (no único)
     *
     * ---
     *
     * ### Lógica de seguridad y robustez
     * - Antes de crear cada almacén, se verifica su existencia mediante
     *   `db.objectStoreNames.contains(nombre)`.
     * - Si ya existe, se obtiene el `ObjectStore` actual desde la transacción de
     *   actualización (`event.target.transaction.objectStore(nombre)`).
     * - De esta manera, tanto los nuevos como los existentes son accesibles
     *   sin riesgo de que las variables `almacenNodos` o `almacenAdyacentes`
     *   queden `undefined`.
     * - Se comprueba también la existencia de los índices antes de crearlos,
     *   usando `objectStore.indexNames.contains(nombreIndice)` o, si no está
     *   disponible, convirtiendo `indexNames` en un array.
     *
     * ---
     *
     * ### Futuras mejoras posibles
     * - **Ampliación de índices:** se pueden añadir nuevos índices (por ejemplo,
     *   `por_idnodo`, `por_tipo`, `por_fecha`) incrementando `#VERSION_BD`.
     * - **Migraciones de esquema:** si en el futuro cambian los `keyPath` o el
     *   modelo de datos, se puede aprovechar `onupgradeneeded` para migrar los datos
     *   antiguos antes de eliminar o recrear los almacenes.
     * - **Compatibilidad incremental:** nunca se deben eliminar o renombrar
     *   `ObjectStore` o índices existentes sin antes manejar correctamente la
     *   migración en el mismo bloque `onupgradeneeded`.
     * - **Separación lógica:** se puede dividir la lógica de creación y verificación
     *   de almacenes en funciones privadas adicionales (`#crearAlmacenNodos`,
     *   `#crearAlmacenAdyacentes`) para mantener el método más limpio.
     *
     * ---
     *
     * ### Flujo de resolución de la Promesa
     * - Si la apertura es exitosa (`onsuccess`), se resuelve con la instancia de
     *   `IDBDatabase`.
     * - Si ocurre un error (`onerror`), la promesa se rechaza con un objeto `Error`.
     * - Si se necesita crear o actualizar la estructura, `onupgradeneeded`
     *   se ejecuta automáticamente antes de `onsuccess`.
     *
     * ---
     *
     * @private
     * @async
     * @returns {Promise<IDBDatabase>} Promesa que se resuelve con la instancia de
     * base de datos abierta y lista para operar.
     *
     * @throws {Error} Si no se puede abrir la base de datos.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
     * @see #VERSION_BD Para forzar actualizaciones de esquema.
     * @see #ALMACEN_NODOS
     * @see #ALMACEN_ADYACENTES
     *
     * @since v3.2.5
     */
static #abrir_BD() {
    return new Promise((resolve, reject) => {
        const solicitud = indexedDB.open(this.#NOMBRE_BD, this.#VERSION_BD);

        solicitud.onerror = () => reject(new Error("No se pudo abrir la base de datos"));
        solicitud.onsuccess = () => resolve(solicitud.result);

        solicitud.onupgradeneeded = (event) => {
            const db = event.target.result;
            const tx = event.target.transaction; // transacción de upgrade

            // Referencias a los almacenes (serán asignadas tanto si se crean como si ya existían)
            let almacenNodos;
            let almacenAdyacentes;

            // NODOS
            if (!db.objectStoreNames.contains(this.#ALMACEN_NODOS)) {
                // Crear si no existe
                almacenNodos = db.createObjectStore(this.#ALMACEN_NODOS, {
                    keyPath: ['idsuperestructura', 'idnodo']
                });
            } else {
                // Recuperar referencia desde la transacción de upgrade
                almacenNodos = tx.objectStore(this.#ALMACEN_NODOS);
            }

            // Crear índice en nodos si no existe
            // indexNames es un DOMStringList; usamos .contains si está disponible
            const indexName = 'idsuperestructura';
            const idxNamesNodos = almacenNodos.indexNames;
            const indexExisteNodos = (typeof idxNamesNodos.contains === 'function')
                ? idxNamesNodos.contains(indexName)
                : Array.from(idxNamesNodos).includes(indexName);

            if (!indexExisteNodos) {
                almacenNodos.createIndex(indexName, 'idsuperestructura', { unique: false });
            }

            // ADYACENTES
            if (!db.objectStoreNames.contains(this.#ALMACEN_ADYACENTES)) {
                almacenAdyacentes = db.createObjectStore(this.#ALMACEN_ADYACENTES, {
                    keyPath: ['idsuperestructura', 'idnodo', 'enlace', 'idadyacente']
                });
            } else {
                almacenAdyacentes = tx.objectStore(this.#ALMACEN_ADYACENTES);
            }

            // Crear índice en adyacentes si no existe
            const idxNamesAdyacentes = almacenAdyacentes.indexNames;
            const indexExisteAdyacentes = (typeof idxNamesAdyacentes.contains === 'function')
                ? idxNamesAdyacentes.contains(indexName)
                : Array.from(idxNamesAdyacentes).includes(indexName);

            if (!indexExisteAdyacentes) {
                almacenAdyacentes.createIndex(indexName, 'idsuperestructura', { unique: false });
            }
        };
    });
}

    /**
     * Crea la consulta de inserción para nodos en IndexedDB.
     * 
     * @usecase Preparar los datos de nodos para insertar en el almacén.
     * 
     * @param {string} nombre Identificador de la superestructura.
     * 
     * @return {Array} Array de objetos representando los nodos a insertar.
     * 
     * @notes Recorre todos los nodos y forma los objetos para IndexedDB.
     */
    static #crear_datos_insertar_nodos(nombre) {
        console.log("crear "+nombre);
        const datos = Nodo.por_cada_nodo_ejecutar(this.#token, (nodo) => nodo.dato(), null)||{};
        const nodos = [];

        for (let [id, dato] of Object.entries(datos)) {
            if (typeof dato !== 'string' && dato !== null && typeof dato !== 'number') {
                dato = null;
            }
            nodos.push({
                idsuperestructura: nombre,
                idnodo: id,
                dato: dato // No necesitamos utf8_encode en JavaScript
            });
        }

        return nodos;
    }

    /**
     * Crea la consulta de inserción para adyacentes en IndexedDB.
     * 
     * @usecase Preparar los datos de adyacentes para insertar en el almacén.
     * 
     * @param {string} nombre Identificador de la superestructura.
     * 
     * @return {Array} Array de objetos representando los adyacentes a insertar.
     * 
     * @notes Recorre todos los nodos y sus adyacentes para formar los objetos.
     */
    static #crear_datos_insertar_adyacentes(nombre) {
        const datos = Nodo.por_cada_nodo_ejecutar(this.#token, (nodo) => {
            const enlaces = {};
            nodo.por_cada_adyacente_ejecutar((adyacente, enlace) => {
                enlaces[enlace] = adyacente.id();
            });
            return enlaces;
        }, null) || {};

        const adyacentes = [];

        for (const [idnodo, enlaces] of Object.entries(datos)) {
            for (const [enlace, idadyacente] of Object.entries(enlaces)) {
                adyacentes.push({
                    idsuperestructura: nombre,
                    idnodo,
                    enlace,
                    idadyacente
                });
            }
        }

        return adyacentes;
    }

    /**
     * Guarda la superestructura en IndexedDB.
     * 
     * @usecase Persistir toda la superestructura en IndexedDB.
     * 
     * @preconditions Debe existir al menos un nodo en la superestructura.
     * 
     * @param {string} nombre Identificador único para guardar la superestructura.
     * 
     * @return {Promise<boolean>} Promesa que resuelve a `true` si la operación fue exitosa, `false` en caso contrario.
     * 
     * @notes 
     * - Elimina cualquier versión previa con el mismo nombre
     * - Ejecuta inserciones tanto para nodos como para adyacentes
     */
    static async guardar(nombre) {
        if (!Nodo.hay_nodos_en_superestructura()) {
            this._error("error en guardar, no existe ningun nodo en la superestructura");
            return false;
        }

        try {
            console.log("guardar "+nombre);
            const db = await this.#abrir_BD();

            // Eliminar datos existentes con el mismo nombre
            await this.#eliminar_por_superestructura(db, nombre);

            // Insertar nodos
            const nodos = this.#crear_datos_insertar_nodos(nombre);
            await this.#insertar_en_almacen(db, this.#ALMACEN_NODOS, nodos);

            // Insertar adyacentes
            const adyacentes = this.#crear_datos_insertar_adyacentes(nombre);
            await this.#insertar_en_almacen(db, this.#ALMACEN_ADYACENTES, adyacentes);

            db.close();
            return true;
        } catch (error) {
            this._error("Error en guardar: " + error.message);
            return false;
        }
    }

    /**
     * Elimina una superestructura de IndexedDB.
     * 
     * @usecase Remover una superestructura persistida por nombre.
     * 
     * @preconditions Debe existir una superestructura guardada con el nombre especificado.
     * 
     * @param {string} nombre Identificador de la superestructura a eliminar.
     * 
     * @return {Promise<boolean|null>} Promesa que resuelve a `true` si fue eliminada, `false` si no existía, `null` en caso de error.
     * 
     * @postconditions La superestructura con ese nombre queda eliminada de la BD.
     */
    static async eliminar(nombre) {
        if (typeof nombre !== 'string') {
            this._error("eliminar: el identificador pasado como parametro no es un string");
            return null;
        }

        try {
            const db = await this.#abrir_BD();
            const existia = await this.#existe_superestructura(db, nombre);
            if (existia) {
                await this.#eliminar_por_superestructura(db, nombre);
                db.close();
                return true;
            } else {
                this._error("eliminar: no existe superestructura con ese nombre");
                db.close();
                return false;
            }
        } catch (error) {
            this._error("Error en eliminar: " + error.message);
            return null;
        }
    }

    /**
     * Carga una superestructura desde IndexedDB.
     * 
     * @usecase Recuperar una superestructura persistida por nombre.
     * 
     * @preconditions Debe existir una superestructura guardada con el nombre especificado.
     * 
     * @param {string} nombre Identificador de la superestructura a cargar.
     * 
     * @return {Promise<boolean|null>} Promesa que resuelve a `true` si la carga fue exitosa, `false` si no existe, `null` en caso de error.
     * 
     * @postconditions La superestructura queda cargada en memoria.
     * 
     * @notes Maneja equivalencias de IDs y reconstruye las relaciones entre nodos.
     */
    static async cargar(nombre) {
        if (typeof nombre !== 'string') {
            this._error("cargar: el identificador pasado como parametro no es un string");
            return false;
        }

        try {
            const db = await this.#abrir_BD();

            // Verificar existencia
            if (!(await this.#existe_superestructura(db, nombre))) {
                this._alerta("alerta al cargar, no existe superestructura con el identificador pasado como parametro");
                db.close();
                return false;
            }
            console.log("gg"+this.#token);
            await Nodo.vaciar_superestructura(this.#token);
            // Cargar nodos
            const nodos = await this.#obtener_nodos_por_superestructura(db, nombre);
            const equivalencias = {};

            for (const nodo of nodos) {
                const id = nodo.idnodo;
                if (this.es_id_especial(id)) {
                    let naux = Nodo.nodo_por_id(id);
                    if (!naux) {
                        Nodo.crear_con_dato_e_id(nodo.dato, id);
                    } else {
                        naux._dato(nodo.dato);
                    }
                } else {
                    const idnuevo = Nodo.crear_con_dato(nodo.dato).id();
                    equivalencias[id] = idnuevo;
                }
            }

            // Cargar adyacentes
            const adyacentes = await this.#obtener_adyacentes_por_superestructura(db, nombre);

            for (const ady of adyacentes) {
                let idnod = ady.idnodo;
                if (!this.es_id_especial(idnod)) {
                    idnod = equivalencias[idnod];
                }
                const nodo = Nodo.nodo_por_id(idnod);

                let idady = ady.idadyacente;
             //   if (this.es_id_especial(idady)) {
                    idady = equivalencias[idady];
              //  }
                const nodoady = Nodo.nodo_por_id(idady);

                nodo._adyacente_en(nodoady, ady.enlace);
            }

            db.close();
            return true;
        } catch (error) {
            this._error("Error en cargar: " + error.message);
            return null;
        }
    }

    /**
     * Verifica la existencia de una superestructura en IndexedDB.
     * 
     * @usecase Consultar si existe una superestructura persistida por nombre.
     * 
     * @param {string} nombre Identificador de la superestructura a verificar.
     * 
     * @return {Promise<boolean|null>} Promesa que resuelve a `true` si existe, `false` si no existe, `null` en caso de error.
     */
    static async existe(nombre) {
        if (typeof nombre !== 'string') {
            this._error("existe: el identificador pasado como parametro no es un string");
            return null;
        }

        try {
            const db = await this.#abrir_BD();
            const existe = await this.#existe_superestructura(db, nombre);
            db.close();
            return existe;
        } catch (error) {
            this._error("Error en existe: " + error.message);
            return null;
        }
    }

    // Métodos privados auxiliares para IndexedDB

/**
 * Elimina todos los registros (nodos y adyacentes) asociados a una superestructura en IndexedDB.
 *
 * Este método recorre ambos almacenes (`#ALMACEN_NODOS` y `#ALMACEN_ADYACENTES`)
 * y borra todos los registros que tengan el mismo identificador de superestructura.
 * 
 * ⚠️ IMPORTANTE:
 * - La eliminación se realiza recorriendo los cursores de cada índice.
 * - No es instantánea ni atómica; se espera a que ambos recorridos finalicen.
 * - La promesa solo se resuelve cuando *todas* las eliminaciones se completan correctamente.
 *
 * @param {IDBDatabase} db - Conexión abierta a la base de datos.
 * @param {string} nombre - Identificador de la superestructura a eliminar.
 * 
 * @returns {Promise<void>} Promesa que se resuelve cuando la eliminación finaliza correctamente.
 */
static #eliminar_por_superestructura(db, nombre) {
    return new Promise((resolve, reject) => {
        try {
            const transaccion = db.transaction(
                [this.#ALMACEN_NODOS, this.#ALMACEN_ADYACENTES],
                'readwrite'
            );

            const almacenNodos = transaccion.objectStore(this.#ALMACEN_NODOS);
            const almacenAdyacentes = transaccion.objectStore(this.#ALMACEN_ADYACENTES);

            const indexNodos = almacenNodos.index('idsuperestructura');
            const indexAdyacentes = almacenAdyacentes.index('idsuperestructura');

            const rango = IDBKeyRange.only(nombre);

            // --- Control de finalización ---
            let pendientes = 2; // uno por cada cursor
            const checkDone = () => {
                pendientes--;
                if (pendientes === 0) {
                    resolve(); // Solo resolvemos cuando ambos terminaron
                }
            };

            // --- Eliminación de nodos ---
            const solicitudNodos = indexNodos.openCursor(rango);
            solicitudNodos.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    cursor.delete(); // Elimina el registro actual
                    cursor.continue(); // Continúa con el siguiente
                } else {
                    checkDone(); // Cursor agotado
                }
            };
            solicitudNodos.onerror = (event) => {
                console.error("Error al eliminar nodos:", event.target.error);
                reject(event.target.error);
            };

            // --- Eliminación de adyacentes ---
            const solicitudAdyacentes = indexAdyacentes.openCursor(rango);
            solicitudAdyacentes.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    cursor.delete();
                    cursor.continue();
                } else {
                    checkDone();
                }
            };
            solicitudAdyacentes.onerror = (event) => {
                console.error("Error al eliminar adyacentes:", event.target.error);
                reject(event.target.error);
            };

            // --- Errores de la transacción ---
            transaccion.onerror = (event) => {
                console.error("Error en la transacción de eliminación:", event.target.error);
                reject(event.target.error);
            };

        } catch (e) {
            console.error("Error interno en #eliminar_por_superestructura:", e);
            reject(e);
        }
    });
}



    /**
     * Inserta un array de objetos en un almacén.
     * 
     * @param {IDBDatabase} db Conexión a la base de datos.
     * @param {string} almacen Nombre del almacén.
     * @param {Array} datos Array de objetos a insertar.
     * 
     * @return {Promise} Promesa que se resuelve cuando se completan todas las inserciones.
     */
    static #insertar_en_almacen(db, almacen, datos) {
        return new Promise((resolve, reject) => {
            const transaccion = db.transaction([almacen], 'readwrite');
            const almacenObj = transaccion.objectStore(almacen);

            for (const dato of datos) {
                almacenObj.add(dato);
            }

            transaccion.oncomplete = () => resolve();
            transaccion.onerror = () => reject(transaccion.error);
        });
    }

/**
 * Verifica si existe una superestructura con el nombre especificado dentro del almacén IndexedDB.
 *
 * @private
 * @param {IDBDatabase} db - Instancia abierta de la base de datos.
 * @param {string} nombre - Nombre de la superestructura que se desea comprobar.
 * @returns {Promise<boolean>} Promesa que se resuelve con `true` si existe al menos una coincidencia, `false` si no existe.
 *
 * @description
 * Esta función realiza una búsqueda en el almacén `#ALMACEN_NODOS` utilizando el índice `idsuperestructura`.
 * 
 * Internamente:
 * 1. Crea una transacción de solo lectura sobre el almacén.
 * 2. Accede al índice `idsuperestructura` (que debe estar previamente definido al crear el almacén).
 * 3. Usa `index.count(IDBKeyRange.only(nombre))` para contar las coincidencias exactas.
 * 4. Resuelve la promesa con `true` si el conteo es mayor a 0.
 *
 * ⚠️ **Notas importantes y posibles mejoras:**
 * - Si el índice no existe, la función lanza una excepción y rechaza la promesa.
 * - Si `nombre` no coincide exactamente (mayúsculas, minúsculas o espacios), el resultado será `false`.
 * - Si el índice está mal configurado o apunta a otra propiedad, el resultado puede ser incorrecto (por ejemplo, siempre `true`).
 *
 * 💡 **Recomendaciones para mejorar la implementación futura:**
 * - Validar que `index` realmente existe y es un `IDBIndex` antes de usar `index.count()`.
 * - Permitir búsquedas parciales usando `IDBKeyRange.bound()` o `openCursor()` si se necesita coincidencia flexible.
 * - Agregar logs de depuración para verificar el valor exacto de `cantidad` y `nombre`.
 * - Incluir control de errores en `transaccion.onabort` y `transaccion.onerror` para mayor robustez.
 *
 * Ejemplo de uso:
 * ```js
 * const existe = await MiClase.#existe_superestructura(db, "superestructura_1");
 * if (existe) {
 *     console.log("Ya existe la superestructura.");
 * } else {
 *     console.log("No existe, se puede crear una nueva.");
 * }
 * ```
 */
static async #existe_superestructura(db, nombre) {
    return new Promise((resolve, reject) => {
        const transaccion = db.transaction([this.#ALMACEN_NODOS], 'readonly');
        const almacen = transaccion.objectStore(this.#ALMACEN_NODOS);
        let index;

        try {
            index = almacen.index('idsuperestructura');
            if (!index) throw new Error("El índice 'idsuperestructura' no fue encontrado.");
        } catch (e) {
            console.error("Error accediendo al índice 'idsuperestructura':", e);
            reject(e);
            return;
        }

        console.log("🧩 Buscando en índice 'idsuperestructura' el valor:", nombre);

        // Usamos cursor para ver las claves reales
        const solicitud = index.openCursor();

        let encontrado = false;

        solicitud.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                console.log("🔑 Clave encontrada en índice:", cursor.key);
                console.log("🗃️ Valor del registro:", cursor.value);
                if (cursor.key === nombre) {
                    console.log("✅ Coincidencia exacta con:", nombre);
                    encontrado = true;
                }
                cursor.continue();
            } else {
                console.log("🚦 Fin del recorrido. Resultado final:", encontrado);
                resolve(encontrado);
            }
        };

        solicitud.onerror = () => {
            console.error("❌ Error al iterar sobre índice:", solicitud.error);
            reject(solicitud.error);
        };
    });
}



    /**
     * Obtiene todos los nodos de una superestructura.
     * 
     * @param {IDBDatabase} db Conexión a la base de datos.
     * @param {string} nombre Identificador de la superestructura.
     * 
     * @return {Promise<Array>} Promesa que resuelve a un array de nodos.
     */
    static #obtener_nodos_por_superestructura(db, nombre) {
        return new Promise((resolve, reject) => {
            const transaccion = db.transaction([this.#ALMACEN_NODOS], 'readonly');
            const almacen = transaccion.objectStore(this.#ALMACEN_NODOS);
            const index = almacen.index('idsuperestructura');
            const solicitud = index.getAll(IDBKeyRange.only(nombre));

            solicitud.onsuccess = () => resolve(solicitud.result);
            solicitud.onerror = () => reject(solicitud.error);
        });
    }

    /**
     * Obtiene todos los adyacentes de una superestructura.
     * 
     * @param {IDBDatabase} db Conexión a la base de datos.
     * @param {string} nombre Identificador de la superestructura.
     * 
     * @return {Promise<Array>} Promesa que resuelve a un array de adyacentes.
     */
    static #obtener_adyacentes_por_superestructura(db, nombre) {
        return new Promise((resolve, reject) => {
            const transaccion = db.transaction([this.#ALMACEN_ADYACENTES], 'readonly');
            const almacen = transaccion.objectStore(this.#ALMACEN_ADYACENTES);
            const index = almacen.index('idsuperestructura');
            const solicitud = index.getAll(IDBKeyRange.only(nombre));

            solicitud.onsuccess = () => resolve(solicitud.result);
            solicitud.onerror = () => reject(solicitud.error);
        });
    }



}

export {PerdurarSuperestructuraStringIndexedDB}