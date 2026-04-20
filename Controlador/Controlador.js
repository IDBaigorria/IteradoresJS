import { Conf } from '../Configuracion/index.js';
import { Objeto } from "../Nucleo/index.js";
import { Nodo } from '../Nodos/Nodo.js';
import{PerdurarSuperestructura, PerdurarSuperestructuraStringIndexedDB, PerdurarSuperestructuraStringJSON, PerdurarSuperestructuraStringXML, PerdurarSuperestructuraElectricosStringIndexedDB} from './PerdurarSuperestructura/index.js';
import { mezclar_clase_con_interfaces } from "../miscelaneas/mixin.js";
console.log("Controlador");

/**
 * Clase Controlador que gestiona la persistencia de la superestructura.
 * 
 * Permite elegir el método de guardado (sql, json, texto, etc.) en tiempo de ejecución.
 * @class
 * @extends Objeto
 * @implements {Nodos.PerdurarSuperestructura.PerdurarSuperestructura}
 * @memberof Controlador
 */
class Controlador extends mezclar_clase_con_interfaces(Objeto, PerdurarSuperestructura) {
/** 
     * @type {string} Método de persistencia activo por defecto
     */
    static metodo = Conf.SUPERESTRUCTURA_METODO_PERDURAR;

    /**
     * @type {Object<string, Function>} 
     * Mapa de clases de persistencia disponibles.
     * La clave es el identificador del método (por ejemplo: 'sql', 'json', etc.)
     * y el valor es la clase correspondiente.
     */
    static implementaciones = {};

    /**
     * @type {?Function} Clase de persistencia actualmente activa.
     */
    static clase_actual = null;

    /**
     * @type {string} Token de seguridad recibido de la clase Nodo.
     */
    static token = "";

    /**
     * Registra una clase de persistencia disponible para el sistema.
     *
     * @param {string} nombre Identificador del método ('sql', 'json', 'texto', etc.)
     * @param {Function} clase Clase de implementación concreta.
     * @return {void}
     */
    static registrar_implementacion(nombre, clase) {
        this.implementaciones[nombre] = clase;

        // Si ya existe el token, lo transmite a la clase registrada
        if (this.token && typeof clase.recibir_token === "function") {
            clase.recibir_token(this.token);
        }
    }

    /**
     * Establece qué método de persistencia será el actual.
     *
     * @param {string} nuevo_metodo Identificador de la implementación ('sql', 'json', 'texto', etc.)
     * @return {boolean} Devuelve `true` si el método fue reconocido y configurado correctamente.
     */
    static establecer_metodo(nuevo_metodo) {
        if (this.implementaciones[nuevo_metodo]) {
            this.metodo = nuevo_metodo;
            this.clase_actual = this.implementaciones[nuevo_metodo];
            return true;
        }
        this._alerta(`Método de persistencia '${nuevo_metodo}' no reconocido`);
        return false;
    }

    /**
     * Recibe el token de seguridad desde la clase Nodo y lo distribuye
     * a todas las implementaciones de persistencia registradas.
     *
     * @param {string} token Token de seguridad proporcionado por Nodo.
     * @return {void}
     */
    static recibir_token(token) {
        this.token = token;
        for (const nombre in this.implementaciones) {
            const clase = this.implementaciones[nombre];
            if (typeof clase.recibir_token === "function") {
                clase.recibir_token(token);
            }
        }
    }

    /**
     * Ejecuta una operación delegada a la clase de persistencia activa.
     *
     * @param {string} funcion Nombre del método a ejecutar.
     * @param {*} nombre Parámetro principal de la operación.
     * @return {*} Devuelve el resultado de la operación o `null` si no fue posible.
     */
    static delegar(funcion, nombre) {
        const clase = this.clase_actual;

        if (!clase) {
            this._alerta("Clase de persistencia no disponible para el método actual.");
            return null;
        }

        if (typeof clase[funcion] !== "function") {
            this._alerta(`El método '${funcion}' no existe en la clase seleccionada.`);
            return null;
        }

        return clase[funcion](nombre);
    }

    // ======= Métodos públicos de operación =======

    /** @return {boolean} */
    static guardar(nombre) {
        return this.delegar("guardar", nombre);
    }

    /** @return {boolean} */
    static cargar(nombre) {
        return this.delegar("cargar", nombre);
    }

    /** @return {boolean} */
    static eliminar(nombre) {
        return this.delegar("eliminar", nombre);
    }

    /** @return {boolean} */
    static existe(nombre) {
        return this.delegar("existe", nombre);
    }

    /** @return {boolean} */
    static imprimir(nombre) {
        return this.delegar("imprimir", nombre);
    }
    
    /** @type {boolean} */
    static inicializo = false;

    /**
     * Inicializa el sistema registrando las clases principales.
     * Solo se ejecuta una vez.
     * 
     * @returns {void}
     */
    static inicializar() {
        if (!this.inicializo) {
           // if (typeof Nodo !== "undefined" && typeof PerdurarSuperestructura !== "undefined") {
                Nodo.registrar_controlador(Controlador);
                Controlador.registrar_implementacion("IndexedDB", PerdurarSuperestructuraStringIndexedDB);
                Controlador.registrar_implementacion("JSON", PerdurarSuperestructuraStringJSON);
                Controlador.registrar_implementacion("XML", PerdurarSuperestructuraStringXML);
                Controlador.registrar_implementacion("EIndexedDB", PerdurarSuperestructuraElectricosStringIndexedDB);
                this.inicializo = true;
                Controlador.establecer_metodo("EIndexedDB");
                alert("sii");
            } else {
                console.error("Error: clases requeridas no definidas");
            }
       // }
    }


}

// Ejecutar inicialización global
Controlador.inicializar();
export {Controlador}