/**
 * Registro global de comandos y comunicadores pendientes.
 *
 * Actúa como un buzón temporal donde los módulos de comandos y
 * comunicadores se autoencolan sin necesidad de importar Controlador,
 * eliminando así las dependencias circulares.
 *
 * Una vez que el {@link Controlador} se inicializa, se inyecta a sí mismo
 * en este registro mediante {@link _controlador}, y a partir de ese momento
 * los comandos pueden obtener la referencia al Controlador a través de
 * {@link controlador}.
 *
 * @module Controlador/RegistroGlobal
 * @since 1.3.4
 */
export const RegistroGlobal = {
    /**
     * Lista de comandos pendientes de registro.
     *
     * Cada entrada puede ser:
     * - `{ clase: Function }` para comandos con clase (función constructora).
     * - `{ nombre: string, manejador: Function }` para comandos dinámicos.
     *
     * @type {Array<{clase?: Function, nombre?: string, manejador?: Function}>}
     */
    comandos_pendientes: [],

    /**
     * Lista de comunicadores pendientes de registro.
     *
     * Cada entrada es `{ clase: Function }`.
     *
     * @type {Array<{clase: Function}>}
     */
    comunicadores_pendientes: [],

    /**
     * Referencia interna a la clase Controlador.
     * Se establece durante {@link Controlador.inicializar}.
     *
     * @type {typeof Controlador|null}
     * @private
     */
    _controladorRef: null,

    /**
     * Almacena la referencia a la clase Controlador.
     *
     * @param {typeof Controlador} clase - La clase Controlador ya inicializada.
     * @returns {void}
     */
    _controlador(clase) {
        this._controladorRef = clase;
    },

    /**
     * Obtiene la clase Controlador registrada.
     *
     * Útil para que comandos y otros componentes accedan a los servicios
     * del Controlador sin depender directamente de él.
     *
     * @returns {typeof Controlador|null} La clase Controlador, o `null` si aún no se ha registrado.
     */
    controlador() {
        return this._controladorRef;
    },

    /**
     * Encola un comando para su registro posterior.
     *
     * Comportamiento según los argumentos:
     * - Si `claseONombre` es una función (clase), se encola como comando con clase.
     * - Si `claseONombre` es un string **y** se proporciona `manejador`, se encola como comando dinámico.
     * - Si `claseONombre` es un string **sin** `manejador`, se ignora con advertencia (en JS las clases deben pasarse como función).
     *
     * @param {Function|string} claseONombre - Clase del comando (función) o nombre del comando dinámico.
     * @param {Function|null}   [manejador=null] - Función manejadora (solo para comandos dinámicos).
     * @returns {void}
     *
     * @example
     * // Comando con clase
     * RegistroGlobal.encolar_comando(ComandoDepuracionImprimir);
     *
     * // Comando dinámico
     * RegistroGlobal.encolar_comando('comunicacion:escribir', (token, args) => { ... });
     */
    encolar_comando(claseONombre, manejador = null) {
        if (typeof claseONombre === 'function') {
            // Comando con clase
            this.comandos_pendientes.push({ clase: claseONombre });
        } else if (typeof claseONombre === 'string') {
            if (manejador !== null) {
                // Comando dinámico: nombre + manejador
                this.comandos_pendientes.push({
                    nombre:    claseONombre,
                    manejador: manejador,
                });
            } else {
                // String sin manejador: no soportado en JS
                console.warn(
                    `RegistroGlobal: encolar_comando con string "${claseONombre}" sin manejador no es soportado. Usa la clase directamente.`
                );
            }
        }
    },

    /**
     * Encola un comunicador para su registro posterior.
     *
     * @param {Function} clase - Clase del comunicador.
     * @returns {void}
     *
     * @example
     * RegistroGlobal.encolar_comunicador(SalidaDepuracionHTML);
     */
    encolar_comunicador(clase) {
        this.comunicadores_pendientes.push({ clase });
    },

    /**
     * Vacía las listas de pendientes.
     *
     * Útil para reiniciar el estado o para pruebas.
     *
     * @returns {void}
     */
    limpiar() {
        this.comandos_pendientes = [];
        this.comunicadores_pendientes = [];
    },
};