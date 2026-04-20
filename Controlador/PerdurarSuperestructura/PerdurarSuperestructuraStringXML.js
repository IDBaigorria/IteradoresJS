import { Objeto } from "../../Nucleo/index.js";
import { Nodo } from "../../Nodos/index.js";
import { Conf } from '../../Configuracion/index.js';
import { mezclar_clase_con_interfaces } from "../../miscelaneas/mixin.js";
import { PerdurarSuperestructura } from "./PerdurarSuperestructura.js";
console.log("PerdurarSuperestructuraStringJSON");

/**
 * Clase PerdurarSuperestructuraXML
 * 
 * @version 1.0.0 (Última revisión: 28/10/2025)
 * @author ...
 * 
 * @extends Objeto
 * @implements PerdurarSuperestructura
 * 
 * @description
 * Clase responsable de la persistencia de la superestructura en archivos XML.
 * Se encarga de generar y descargar archivos XML con la estructura completa
 * de nodos y sus relaciones, permitiendo al usuario guardar y cargar superestructuras.
 * 
 * @history
 * - 28/10/2025: Implementación inicial con almacenamiento mediante descarga/upload
 * 
 * @notes
 * Esta clase utiliza una estructura XML para representar
 * nodos con sus adyacentes, alternativa al formato JSON.
 * En el entorno del navegador, los archivos se descargan y cargan mediante
 * interacción directa con el usuario.
 */
class PerdurarSuperestructuraStringXML extends mezclar_clase_con_interfaces(Objeto, PerdurarSuperestructura) {

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
        this.#token = token;
    }

    /**
     * Construye la estructura de datos para guardar en XML.
     * 
     * @usecase Recopilar todos los nodos y sus relaciones en una estructura XML serializable.
     * 
     * @return {string} Estructura de datos en formato XML lista para guardar.
     * 
     * @notes
     * La estructura incluye todos los nodos con sus datos y adyacentes,
     * manteniendo las referencias entre ellos en formato XML.
     */
    static #construir_estructura_xml() {
        // Recorremos todos los nodos existentes en la superestructura
        const todos = Nodo.por_cada_nodo_ejecutar(this.#token, (nodo) => { return nodo; });
        
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<superestructura>\n';
        xml += '  <metadata>\n';
        xml += `    <fecha_creacion>${new Date().toISOString()}</fecha_creacion>\n`;
        xml += `    <total_nodos>${Object.keys(todos).length}</total_nodos>\n`;
        xml += '  </metadata>\n';
        xml += '  <nodos>\n';

        for (const [id, nodo] of Object.entries(todos)) {
            const dato = nodo.dato();
            
            // Escapar caracteres especiales XML
            const datoEscapado = this.#escapar_xml(dato);
            
            xml += `    <nodo id="${this.#escapar_xml(id)}">\n`;
            xml += `      <dato>${datoEscapado}</dato>\n`;
            xml += '      <adyacentes>\n';

            // Si el nodo tiene adyacentes, los recorremos
            const adyacentes = nodo.adyacentes();
            if (adyacentes instanceof Map && adyacentes.size > 0) {
                for (const [enlace, nodo_adyacente] of adyacentes.entries()) {
                    xml += `        <adyacente enlace="${this.#escapar_xml(enlace)}">${this.#escapar_xml(nodo_adyacente.id())}</adyacente>\n`;
                }
            }

            xml += '      </adyacentes>\n';
            xml += '    </nodo>\n';
        }

        xml += '  </nodos>\n';
        xml += '</superestructura>';

        return xml;
    }

    /**
     * Escapa caracteres especiales para XML
     * 
     * @param {string} texto Texto a escapar
     * @return {string} Texto escapado
     * @private
     */
    static #escapar_xml(texto) {
        if (texto === null || texto === undefined) return '';
        
        return texto.toString()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    /**
     * Descarga un archivo XML con la superestructura.
     * 
     * @usecase Generar y descargar un archivo XML con la estructura completa.
     * 
     * @param {string} nombre Nombre del archivo (sin extensión).
     * @param {string} xml Estructura de datos en formato XML.
     * 
     * @return {boolean} `true` si la descarga fue exitosa, `false` en caso contrario.
     * 
     * @notes
     * Crea un Blob con el contenido XML y genera un enlace de descarga
     * que se activa programáticamente.
     */
    static #descargar_archivo_xml(nombre, xml) {
        try {
            const blob = new Blob([xml], { type: 'application/xml' });
            const url = URL.createObjectURL(blob);
            
            const enlace = document.createElement('a');
            enlace.href = url;
            enlace.download = `${nombre}.xml`;
            
            document.body.appendChild(enlace);
            enlace.click();
            document.body.removeChild(enlace);
            
            URL.revokeObjectURL(url);
            return true;
        } catch (error) {
            console.error('Error al descargar archivo XML:', error);
            return false;
        }
    }

    /**
     * Crea un input invisible y un botón temporal para permitir
     * la carga del archivo XML mediante una acción del usuario.
     * 
     * @usecase Permitir al usuario seleccionar un archivo XML para cargar.
     * 
     * @return {Promise<Document>} Promesa que resuelve con el documento XML cargado.
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
            input.accept = '.xml';
            input.style.display = 'none';
            document.body.appendChild(input);

            const boton = document.createElement('button');
            boton.textContent = '📂 Cargar superestructura XML';
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
                        const parser = new DOMParser();
                        const xmlDoc = parser.parseFromString(e.target.result, 'application/xml');
                        
                        // Verificar si hay errores en el parsing
                        const parseError = xmlDoc.getElementsByTagName('parsererror')[0];
                        if (parseError) {
                            reject(new Error('Error al parsear el archivo XML: ' + parseError.textContent));
                            return;
                        }
                        
                        resolve(xmlDoc);
                    } catch (error) {
                        reject(new Error('Error al parsear el archivo XML: ' + error.message));
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
     * Procesa un documento XML y extrae la estructura de nodos.
     * 
     * @param {Document} xmlDoc Documento XML parseado
     * @return {Object} Estructura de nodos en formato similar a JSON
     * @private
     */
    static #procesar_xml(xmlDoc) {
        const estructura = {
            metadata: {
                fecha_creacion: '',
                total_nodos: 0
            },
            nodos: []
        };

        // Extraer metadata
        const fechaElem = xmlDoc.querySelector('metadata > fecha_creacion');
        const totalElem = xmlDoc.querySelector('metadata > total_nodos');
        
        if (fechaElem) estructura.metadata.fecha_creacion = fechaElem.textContent;
        if (totalElem) estructura.metadata.total_nodos = parseInt(totalElem.textContent) || 0;

        // Procesar nodos
        const nodos = xmlDoc.querySelectorAll('nodo');
        nodos.forEach(nodoElem => {
            const id = nodoElem.getAttribute('id');
            const datoElem = nodoElem.querySelector('dato');
            const dato = datoElem ? datoElem.textContent : '';
            
            const nodoObj = {
                id: id,
                dato: dato,
                adyacentes: {}
            };

            // Procesar adyacentes
            const adyacentes = nodoElem.querySelectorAll('adyacentes > adyacente');
            adyacentes.forEach(adyElem => {
                const enlace = adyElem.getAttribute('enlace');
                const idAdyacente = adyElem.textContent;
                if (enlace && idAdyacente) {
                    nodoObj.adyacentes[enlace] = idAdyacente;
                }
            });

            estructura.nodos.push(nodoObj);
        });

        return estructura;
    }

    /**
     * Guarda la superestructura en un archivo XML descargable.
     * 
     * @interface PerdurarSuperestructura
     * 
     * @usecase Persistir toda la superestructura en formato XML.
     * 
     * @preconditions Debe existir al menos un nodo en la superestructura.
     * 
     * @param {string} nombre Identificador único para guardar la superestructura.
     * 
     * @return {boolean} `true` si la operación fue exitosa, `false` en caso contrario.
     * 
     * @notes 
     * - Genera un archivo XML con toda la estructura de nodos y enlaces
     * - Descarga el archivo automáticamente al navegador del usuario
     */
    static guardar(nombre) {
        if (!Nodo.hay_nodos_en_superestructura()) {
            this._error("error en guardar, no existe ningun nodo en la superestructura");
            return false;
        }

        const xml = this.#construir_estructura_xml();
        const exito = this.#descargar_archivo_xml(nombre, xml);
        
        if (exito) {
            this.#ULTIMO_NOMBRE_GUARDADO = nombre;
        } else {
            this._error("Error al descargar el archivo XML");
        }
        
        return exito;
    }

    /**
     * Elimina una superestructura guardada en XML.
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
     * Carga una superestructura desde un archivo XML seleccionado por el usuario.
     * 
     * @interface PerdurarSuperestructura
     * 
     * @usecase Recuperar una superestructura desde un archivo XML.
     * 
     * @preconditions El usuario debe seleccionar un archivo XML válido.
     * 
     * @param {string} nombre Este parámetro se ignora en el entorno web.
     * 
     * @return {Promise<boolean|null>} Promesa que resuelve a `true` si la carga fue exitosa, `false` si no se seleccionó archivo, `null` en caso de error.
     * 
     * @postconditions La superestructura queda cargada en memoria.
     * 
     * @notes Reconstruye los nodos y sus relaciones desde el archivo XML.
     */
    static async cargar(nombre) {
        try {
            const xmlDoc = await this.#crear_input_carga();
            const estructura = this.#procesar_xml(xmlDoc);
            
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
     * Verifica la existencia de una superestructura en archivo XML.
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
     * Carga una superestructura desde un string XML existente.
     * 
     * @usecase Cargar una superestructura desde datos XML en memoria.
     * 
     * @param {string} xmlString String XML con la estructura de la superestructura.
     * 
     * @return {boolean} `true` si la carga fue exitosa, `false` en caso contrario.
     * 
     * @notes
     * Útil para cargar superestructuras desde fuentes externas
     * o datos previamente cargados en memoria.
     */
    static cargar_desde_xml(xmlString) {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, 'application/xml');
            
            // Verificar si hay errores en el parsing
            const parseError = xmlDoc.getElementsByTagName('parsererror')[0];
            if (parseError) {
                throw new Error('Error al parsear el XML: ' + parseError.textContent);
            }
            
            const estructura = this.#procesar_xml(xmlDoc);
            
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
            this._error("Error en cargar_desde_xml: " + error.message);
            return false;
        }
    }

}

export { PerdurarSuperestructuraStringXML };