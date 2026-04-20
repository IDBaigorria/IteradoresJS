import { Objeto } from "../../Nucleo/index.js";
import { Nodo } from "../../Nodos/index.js";
import { Conf } from '../../Configuracion/index.js';
import { mezclar_clase_con_interfaces } from "../../miscelaneas/mixin.js";
import { PerdurarSuperestructura } from "./PerdurarSuperestructura.js";
console.log("PerdurarSuperestructuraStringJSON");

/**
 * Clase PerdurarSuperestructuraJSON
 * 
 * @version 1.0.0 (Última revisión: 28/10/2025)
 * @author ...
 * 
 * @extends Objeto
 * @implements PerdurarSuperestructura
 * 
 * @description
 * Clase responsable de la persistencia de la superestructura en archivos JSON.
 * Se encarga de generar y descargar archivos JSON con la estructura completa
 * de nodos y sus relaciones, permitiendo al usuario guardar y cargar superestructuras.
 * 
 * @history
 * - 01/09/2025: Implementación inicial con almacenamiento mediante descarga/upload
 * 
 * @notes
 * Esta clase utiliza una estructura JSON más natural para representar
 * nodos con sus adyacentes, en contraste con el enfoque relacional de SQL.
 * En el entorno del navegador, los archivos se descargan y cargan mediante
 * interacción directa con el usuario.
 */
class PerdurarSuperestructuraStringJSON extends mezclar_clase_con_interfaces(Objeto, PerdurarSuperestructura) {

    /**
     * @type {string}
     * @private
     */
    static #ULTIMO_NOMBRE_GUARDADO = '';
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
 * Construye la estructura de datos para guardar en JSON.
 * 
 * @usecase Recopilar todos los nodos y sus relaciones en una estructura serializable.
 * 
 * @return {Object} Estructura de datos lista para convertir a JSON.
 * 
 * @notes
 * La estructura incluye todos los nodos con sus datos y adyacentes,
 * manteniendo las referencias entre ellos.
 */
static #construir_estructura_json() {
    const estructura = {
        metadata: {
            fecha_creacion: new Date().toISOString(),
            total_nodos: 0
        },
        nodos: []
    };

    // Recorremos todos los nodos existentes en la superestructura
    const todos = Nodo.por_cada_nodo_ejecutar(this.#token, (nodo)=>{return nodo}); // O el método equivalente que devuelva todos los nodos

    for (const [id, nodo] of Object.entries(todos)) {
        const dato = nodo.dato();

        // Cada nodo se representa con su id, dato y lista de adyacentes
        const nodo_obj = {
            id: id,
            dato: dato,
            adyacentes: {}
        };

        // Si el nodo tiene adyacentes, los recorremos
        const adyacentes = nodo.adyacentes(); // Map<string, Nodo>
        if (adyacentes instanceof Map && adyacentes.size > 0) {
            for (const [enlace, nodo_adyacente] of adyacentes.entries()) {
                // Guardamos el id del adyacente en lugar del objeto
                nodo_obj.adyacentes[enlace] = nodo_adyacente.id();
            }
        }

        // Agregamos el nodo a la estructura
        estructura.nodos.push(nodo_obj);
    }

    estructura.metadata.total_nodos = estructura.nodos.length;

    return estructura;
}

    /**
     * Descarga un archivo JSON con la superestructura.
     * 
     * @usecase Generar y descargar un archivo JSON con la estructura completa.
     * 
     * @param {string} nombre Nombre del archivo (sin extensión).
     * @param {Object} estructura Estructura de datos a serializar.
     * 
     * @return {boolean} `true` si la descarga fue exitosa, `false` en caso contrario.
     * 
     * @notes
     * Crea un Blob con el contenido JSON y genera un enlace de descarga
     * que se activa programáticamente.
     */
    static #descargar_archivo_json(nombre, estructura) {
        try {
            const json = JSON.stringify(estructura, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const enlace = document.createElement('a');
            enlace.href = url;
            enlace.download = `${nombre}.json`;
            
            document.body.appendChild(enlace);
            enlace.click();
            document.body.removeChild(enlace);
            
            URL.revokeObjectURL(url);
            return true;
        } catch (error) {
            console.error('Error al descargar archivo JSON:', error);
            return false;
        }
    }

    /**
     * Crea un input invisible y un botón temporal para permitir
     * la carga del archivo JSON mediante una acción del usuario.
     * 
     * @usecase Permitir al usuario seleccionar un archivo JSON para cargar.
     * 
     * @return {Promise<Object>} Promesa que resuelve con la estructura cargada.
     * 
     * @notes
     * Debido a restricciones de seguridad del navegador, el diálogo
     * de selección de archivo debe activarse por una acción del usuario
     * (click real). Por eso, se inserta un botón temporal en el DOM.
     */
    static #crear_input_carga() {
        return new Promise((resolve, reject) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.style.display = 'none'; // permanece oculto
            document.body.appendChild(input);

            const boton = document.createElement('button');
            boton.textContent = '📂 Cargar superestructura JSON';
            boton.style.position = 'fixed';
            boton.style.bottom = '10px';
            boton.style.right = '10px';
            boton.style.zIndex = '9999';
            boton.style.padding = '8px 12px';
            boton.style.borderRadius = '6px';
            boton.style.background = '#0088ff';
            boton.style.color = 'white';
            boton.style.cursor = 'pointer';
            boton.style.border = 'none';
            boton.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
            document.body.appendChild(boton);

            // cuando el usuario hace clic en el botón, se dispara el diálogo
            boton.onclick = () => input.click();

            input.onchange = (event) => {
                const archivo = event.target.files[0];
                if (!archivo) {
                    reject(new Error('No se seleccionó ningún archivo'));
                    limpiar();
                    return;
                }

                const lector = new FileReader();
                lector.onload = (e) => {
                    try {
                        const estructura = JSON.parse(e.target.result);
                        resolve(estructura);
                    } catch (error) {
                        reject(new Error('Error al parsear el archivo JSON: ' + error.message));
                    } finally {
                        limpiar();
                    }
                };

                lector.onerror = () => {
                    reject(new Error('Error al leer el archivo'));
                    limpiar();
                };

                lector.readAsText(archivo);
            };

            // función de limpieza
            function limpiar() {
                if (input.parentNode) input.parentNode.removeChild(input);
                if (boton.parentNode) boton.parentNode.removeChild(boton);
            }
        });
    }


    /**
     * Guarda la superestructura en un archivo JSON descargable.
     * 
     * @interface PerdurarSuperestructura
     * 
     * @usecase Persistir toda la superestructura en formato JSON.
     * 
     * @preconditions Debe existir al menos un nodo en la superestructura.
     * 
     * @param {string} nombre Identificador único para guardar la superestructura.
     * 
     * @return {boolean} `true` si la operación fue exitosa, `false` en caso contrario.
     * 
     * @notes 
     * - Genera un archivo JSON con toda la estructura de nodos y enlaces
     * - Descarga el archivo automáticamente al navegador del usuario
     */
    static guardar(nombre) {
        if (!Nodo.hay_nodos_en_superestructura()) {
            this._error("error en guardar, no existe ningun nodo en la superestructura");
            return false;
        }

        const estructura = this.#construir_estructura_json();
        const exito = this.#descargar_archivo_json(nombre, estructura);
        
        if (exito) {
            this.#ULTIMO_NOMBRE_GUARDADO = nombre;
        } else {
            this._error("Error al descargar el archivo JSON");
        }
        
        return exito;
    }

    /**
     * Elimina una superestructura guardada en JSON.
     * 
     * @interface PerdurarSuperestructura
     * 
     * @usecase En entorno web, este método no es aplicable directamente.
     * 
     * @param {string} nombre Identificador de la superestructura a eliminar.
     * 
     * @return {boolean|null} Siempre devuelve `false` ya que no se puede eliminar archivos del usuario.
     * 
     * @notes
     * En el entorno del navegador, no tenemos acceso al sistema de archivos
     * del usuario para eliminar archivos. El usuario debe eliminarlo manualmente.
     */
    static eliminar(nombre) {
        if (typeof nombre !== 'string') {
            this._error("eliminar: el identificador pasado como parametro no es un string");
            return null;
        }

        this._alerta("En el entorno web, los archivos deben eliminarse manualmente por el usuario");
        return false;
    }

    /**
     * Carga una superestructura desde un archivo JSON seleccionado por el usuario.
     * 
     * @interface PerdurarSuperestructura
     * 
     * @usecase Recuperar una superestructura desde un archivo JSON.
     * 
     * @preconditions El usuario debe seleccionar un archivo JSON válido.
     * 
     * @param {string} nombre Este parámetro se ignora en el entorno web.
     * 
     * @return {Promise<boolean|null>} Promesa que resuelve a `true` si la carga fue exitosa, `false` si no se seleccionó archivo, `null` en caso de error.
     * 
     * @postconditions La superestructura queda cargada en memoria.
     * 
     * @notes Reconstruye los nodos y sus relaciones desde el archivo JSON.
     */
    static async cargar(nombre) {
        // El parámetro 'nombre' se ignora en el entorno web
        // ya que el usuario selecciona el archivo directamente
        
        try {
            const estructura = await this.#crear_input_carga();
            
            // Limpiar la superestructura actual antes de cargar
            Nodo.vaciar_superestructura(this.#token);

            const equivalencias = {};

            // Primero crear todos los nodos
            for (const nodo_data of estructura.nodos) {
                const id = nodo_data.id;
                const dato = nodo_data.dato;

                if (this.es_id_especial(id)) {
                    let naux = Nodo.nodo_por_id(id);
                    if (!naux) {
                        Nodo.crear_con_dato_e_id(dato, id);
                    } else {
                        naux._dato(dato);
                    }
                } else {
                    const idnuevo = Nodo.crear_con_dato(dato).id();
                    equivalencias[id] = idnuevo;
                }
            }

            // Luego establecer las relaciones de adyacencia
            for (const nodo_data of estructura.nodos) {
                const id_original = nodo_data.id;
                const adyacentes = nodo_data.adyacentes || {};

                // Determinar el ID real del nodo (puede haber cambiado por equivalencias)
                const id_nodo = this.es_id_especial(id_original) ? 
                              id_original : 
                              (equivalencias[id_original] || id_original);
                const nodo = Nodo.nodo_por_id(id_nodo);

                if (nodo && Object.keys(adyacentes).length > 0) {
                    for (const [enlace, id_adyacente_original] of Object.entries(adyacentes)) {
                        // Determinar el ID real del adyacente
                        const id_adyacente = this.es_id_especial(id_adyacente_original) ? 
                                           id_adyacente_original : 
                                           (equivalencias[id_adyacente_original] || id_adyacente_original);
                        
                        const nodo_adyacente = Nodo.nodo_por_id(id_adyacente);
                        if (nodo_adyacente) {
                            nodo._adyacente_en(nodo_adyacente, enlace);
                        }
                    }
                }
            }

            return true;
        } catch (error) {
            this._error("Error en cargar: " + error.message);
            return null;
        }
    }

    /**
     * Verifica la existencia de una superestructura en archivo JSON.
     * 
     * @interface PerdurarSuperestructura
     * 
     * @usecase En entorno web, este método no es aplicable directamente.
     * 
     * @param {string} nombre Identificador de la superestructura a verificar.
     * 
     * @return {boolean|null} Siempre devuelve `null` ya que no se puede verificar la existencia.
     * 
     * @notes
     * En el entorno del navegador, no tenemos acceso al sistema de archivos
     * del usuario para verificar la existencia de archivos.
     */
    static existe(nombre) {
        if (typeof nombre !== 'string') {
            this._error("existe: el identificador pasado como parametro no es un string");
            return null;
        }

        this._alerta("En el entorno web, no se puede verificar la existencia de archivos");
        return null;
    }

    /**
     * Obtiene el nombre del último archivo guardado.
     * 
     * @usecase Recuperar el nombre de la última superestructura guardada.
     * 
     * @return {string} Nombre del último archivo guardado.
     */
    static obtener_ultimo_nombre_guardado() {
        return this.#ULTIMO_NOMBRE_GUARDADO;
    }

    /**
     * Carga una superestructura desde un objeto JSON existente.
     * 
     * @usecase Cargar una superestructura desde datos JSON en memoria.
     * 
     * @param {Object} estructura Objeto JSON con la estructura de la superestructura.
     * 
     * @return {boolean} `true` si la carga fue exitosa, `false` en caso contrario.
     * 
     * @notes
     * Útil para cargar superestructuras desde fuentes externas
     * o datos previamente cargados en memoria.
     */
    static cargar_desde_objeto(estructura) {
        try {
            // Limpiar la superestructura actual antes de cargar
            Nodo.vaciar_superestructura();

            const equivalencias = {};

            // Primero crear todos los nodos
            for (const nodo_data of estructura.nodos) {
                const id = nodo_data.id;
                const dato = nodo_data.dato;

                if (this.es_id_especial(id)) {
                    let naux = Nodo.nodo_por_id(id);
                    if (!naux) {
                        Nodo.crear_con_dato_e_id(dato, id);
                    } else {
                        naux._dato(dato);
                    }
                } else {
                    const idnuevo = Nodo.crear_con_dato(dato).id();
                    equivalencias[id] = idnuevo;
                }
            }

            // Luego establecer las relaciones de adyacencia
            for (const nodo_data of estructura.nodos) {
                const id_original = nodo_data.id;
                const adyacentes = nodo_data.adyacentes || {};

                // Determinar el ID real del nodo
                const id_nodo = this.es_id_especial(id_original) ? 
                              id_original : 
                              (equivalencias[id_original] || id_original);
                const nodo = Nodo.nodo_por_id(id_nodo);

                if (nodo && Object.keys(adyacentes).length > 0) {
                    for (const [enlace, id_adyacente_original] of Object.entries(adyacentes)) {
                        const id_adyacente = this.es_id_especial(id_adyacente_original) ? 
                                           id_adyacente_original : 
                                           (equivalencias[id_adyacente_original] || id_adyacente_original);
                        
                        const nodo_adyacente = Nodo.nodo_por_id(id_adyacente);
                        if (nodo_adyacente) {
                            nodo._adyacente_en(nodo_adyacente, enlace);
                        }
                    }
                }
            }

            return true;
        } catch (error) {
            this._error("Error en cargar_desde_objeto: " + error.message);
            return false;
        }
    }

}

export {PerdurarSuperestructuraStringJSON}