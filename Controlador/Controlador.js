import { Conf, Entorno } from '../Configuracion/index.js';
import { Objeto } from "../Nucleo/index.js";
import { Nodo } from '../Nodos/Nodo.js';
import{PerdurarSuperestructura, PerdurarSuperestructuraStringIndexedDB, PerdurarSuperestructuraStringJSON, PerdurarSuperestructuraStringXML, PerdurarSuperestructuraElectricosStringIndexedDB} from './PerdurarSuperestructura/index.js';
import{Comandos} from './interfaces/index.js';
import{Comando} from '../Comandos/index.js';
import { mezclar_clase_con_interfaces } from "../miscelaneas/mixin.js";
console.log("Controlador");

/**
 * Clase Controlador que gestiona la persistencia de la superestructura.
 * 
 * Permite elegir el método de guardado (sql, json, texto, etc.) en tiempo de ejecución.
 * @class
 * @extends Objeto
 * @implements {Nodos.PerdurarSuperestructura.PerdurarSuperestructura}
 * @implements {Nodos.Interfaces.Comandos}
 * @memberof Controlador
 */
class Controlador extends mezclar_clase_con_interfaces(Objeto, PerdurarSuperestructura, Comandos) {
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

    /**
     * Imprime todos los nodos de la superestructura en el formato adecuado
     * según el entorno configurado (HTML o consola).
     *
     * Delega en {@link Nodos.Nodo#imprimir imprimir()} de cada nodo para la
     * representación individual. La iteración se realiza a través de
     * {@link Nodos.Nodo.por_cada_nodo_ejecutar}, usando el token interno que
     * {@link Controlador} recibió durante la inicialización.
     *
     * Si la superestructura está vacía, emite una alerta y retorna `false`.
     *
     * @returns {boolean} `true` si se imprimió al menos un nodo, `false` en caso contrario.
     *
     * @since 1.3.0 Unifica imprimir_superestructura e imprimir_superestructura2.
     *
     * @see Nodos.Nodo#imprimir
     * @see Configuracion.Entorno
     */
    static imprimir_superestructura() {
        if (!Nodo.hay_nodos_en_superestructura()) {
            Controlador._alerta("Controlador.imprimir_superestructura() — la superestructura está vacía");
            return false;
        }

        // Encabezado opcional para consola
        if (Entorno.es_consola()) {
            const estilo = `color: ${Conf.NODOS_COLORES.texto}; background: ${Conf.NODOS_COLORES.fondo};`;
            console.log("%c===== SUPERESTRUCTURA =====", estilo);
        }

        const funcion = nodo => nodo.imprimir();
        Nodo.por_cada_nodo_ejecutar(Controlador.token, funcion, null);

        return true;
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
                Controlador.establecer_metodo("EIndexedDB");
                // ──────────────────────────────────────────────
                // Carga asíncrona de comandos (siempre)
                // ──────────────────────────────────────────────
                this.cargar_comandos_pendientes();
                console.log('✅ Comandos registrados:', Object.keys(this.comandos));

                this.inicializo = true;
            } 
       // }
    }
    // ──────────────────────────────────────────────────────────
    // MÉTODO PARA PRUEBAS: ejecutar_prueba
    // ──────────────────────────────────────────────────────────

    /**
     * Ejecuta una función de prueba inyectando el token de seguridad.
     *
     * Este método está diseñado exclusivamente para entornos de desarrollo y pruebas.
     * Permite que código externo (como suites de prueba) pueda invocar operaciones
     * que requieren el token de seguridad sin necesidad de conocerlo.
     *
     * El token se pasa como único argumento a la función callback, la cual puede
     * usarlo para llamar a métodos protegidos como NodoElectrico._fase()
     * o NodoElectrico.por_cada_nodo_ejecutar().
     *
     *
     * 🔗 Métodos relacionados que requieren token:
     * - {@link Nodos.NodoElectrico._fase}
     * - {@link Nodos.NodoElectrico.por_cada_nodo_ejecutar}
     * - {@link Nodos.NodoElectrico.por_cada_fase_ejecutar}
     *
     * ---
     * @example
     * ```javascript
     * // Ejemplo de uso en test.js
     * Controlador.ejecutar_prueba((token) => {
     *     NodoElectrico._fase(token, 'fase_test');
     *     NodoElectrico.por_cada_fase_ejecutar(token, (fase) => {
     *         console.log(`Fase: ${fase}`);
     *     });
     * });
     * ```
     *
     * @param {Function} callback Función que recibirá el token como único parámetro.
     *                            La función debe respetar la firma: `(token: string) => void`.
     * @returns {void}
     * 
     * @since 0.2.6
     * @static
     */
    static ejecutar_prueba(callback) {
        if (!Entorno.permite_pruebas()) {
            this._alerta('ejecutar_prueba() no está disponible en entorno de producción');
            return;
        }
        if (!this.token) {
            this._error('Controlador no registrado. Llame a Controlador.registrar() primero.');
            return;
        }
        callback(this.token);
    }
   
    // ══════════════════════════════════════════════════════
    // INTERFAZ COMANDOS
    // ══════════════════════════════════════════════════════

    /** @type {Object<string, {manejador: Function, reversa: ?Function}>} */
    static comandos = {};

    /** @type {Array<Function>} Pila de reversiones para deshacer. */
    static historial = [];

    /** @type {Array<{clase?: typeof Comando, instancia?: Comando}>} */
    static registro_pendiente = [];

    /**
     * Registra un nuevo comando en el sistema.
     *
     * El registro se permite en todos los entornos de forma predeterminada.
     * Si se establece `solo_desarrollo = true`, el comando solo se registrará
     * en modo desarrollo, evitando exponer herramientas de depuración en producción.
     *
     * Si el comando ya existía, se sobrescribe y se emite una alerta.
     *
     * @param {string}        nombre
     * @param {Function}      manejador
     * @param {Function|null} [reversa=null]
     * @param {boolean}       [solo_desarrollo=false]
     * @returns {boolean}
     *
     * @example
     * Controlador.registrar_comando('debug:imprimir', (token) => {
     *     if (!Entorno.permite_pruebas()) { ... }
     *     Objeto.imprimir_errores();
     * }, null, true);
     *
     * @see Controlador.ejecutar_comando
     * @see Controlador.deshacer_ultimo
     * @since 1.3.1
     */
    static registrar_comando(nombre, manejador, reversa = null, solo_desarrollo = false) {
        if (solo_desarrollo && !Entorno.es_desarrollo()) {
            Controlador._alerta(
                `El comando '${nombre}' es de desarrollo y no puede registrarse en el entorno actual.`
            );
            return false;
        }

        if (this.comandos[nombre]) {
            Controlador._alerta(`El comando '${nombre}' ya está registrado y será sobrescrito.`);
        }

        this.comandos[nombre] = {
            manejador,
            reversa
        };
        return true;
    }

    /**
     * Registra un comando a partir de una instancia que implementa {@link Comando}.
     *
     * @param {Comando} comando Instancia del comando.
     * @returns {boolean}
     * @since 1.3.1
     */
    static registrar_comando_desde_instancia(comando) {
        const nombre = comando.constructor.nombre();
        const solo_desarrollo = comando.constructor.solo_desarrollo();

        const manejador = (token, ...args) => comando.ejecutar(token, ...args);

        let reversa = null;
        const fn_reversa = comando.reversa();
        if (typeof fn_reversa === 'function') {
            reversa = (token, ...args) => comando.reversa()(token, ...args);
        }

        return this.registrar_comando(nombre, manejador, reversa, solo_desarrollo);
    }

    /**
     * Registra un comando a partir de una clase que implementa {@link Comando}.
     *
     * @param {typeof Comando} clase Clase del comando.
     * @returns {boolean}
     * @since 1.3.1
     */
    static registrar_comando_desde_clase(clase) {
        if (typeof clase.nombre !== 'function' || typeof clase.solo_desarrollo !== 'function') {
            Controlador._error('La clase no cumple con la interfaz Comando.');
            return false;
        }

        const instancia = new clase();
        return this.registrar_comando_desde_instancia(instancia);
    }

    /**
     * Encola un comando para registro diferido o inmediato.
     *
     * @param {typeof Comando | Comando} comando Clase o instancia.
     * @returns {void}
     * @since 1.3.1
     */
    static encolar_comando(comando) {
        if (this.inicializo) {
            if (comando instanceof Comando) {
                this.registrar_comando_desde_instancia(comando);
            } else {
                this.registrar_comando_desde_clase(comando);
            }
            return;
        }

        if (comando instanceof Comando) {
            this.registro_pendiente.push({ instancia: comando });
        } else {
            this.registro_pendiente.push({ clase: comando });
        }
    }

    /**
     * Procesa la lista de comandos pendientes y los registra.
     *
     * @returns {number} Cantidad de comandos registrados.
     * @since 1.3.1
     */
    static cargar_comandos_pendientes() {
        let contador = 0;
        for (const entrada of this.registro_pendiente) {
            if (entrada.instancia) {
                if (this.registrar_comando_desde_instancia(entrada.instancia)) {
                    contador++;
                }
            } else if (entrada.clase) {
                if (this.registrar_comando_desde_clase(entrada.clase)) {
                    contador++;
                }
            }
        }
        this.registro_pendiente = [];
        return contador;
    }

    /**
     * Ejecuta un comando previamente registrado.
     *
     * Busca el manejador asociado al nombre, verifica los permisos
     * mediante {@link Controlador.tiene_permiso} y lo invoca con el token interno
     * y los argumentos proporcionados.
     *
     * Si el comando tiene definida una reversa, esta se guarda en el historial
     * para poder deshacerla posteriormente con {@link Controlador.deshacer_ultimo}.
     *
     * @param {string} nombre Nombre del comando.
     * @param {...*}   args   Argumentos adicionales para el manejador.
     *
     * @returns {*} El resultado del manejador, o `null` si el comando no existe,
     *              el entorno no permite la ejecución o se deniega el permiso.
     *
     * @example
     * Controlador.ejecutar_comando('debug:imprimir');
     *
     * @see Controlador.registrar_comando
     * @see Controlador.tiene_permiso
     * @see Controlador.deshacer_ultimo
     * @since 1.3.1
     */
    static ejecutar_comando(nombre, ...args) {
        if (!this.comandos[nombre]) {
            Controlador._error(`Comando desconocido: '${nombre}'.`);
            return null;
        }

        if (!Controlador.tiene_permiso(nombre)) {
            Controlador._error(`Permiso denegado para el comando '${nombre}'.`);
            return null;
        }

        const registro = this.comandos[nombre];
        const token = Controlador.token;
        const resultado = registro.manejador(token, ...args);

        if (registro.reversa) {
            this.historial.push(() => registro.reversa(token, ...args));
        }

        return resultado;
    }

    /**
     * Verifica si el usuario actual tiene permiso para ejecutar el comando.
     *
     * **Placeholder:** actualmente retorna `true` para cualquier comando.
     *
     * @param {string} nombre_comando Nombre del comando.
     * @returns {boolean}
     *
     * @see Controlador.ejecutar_comando
     * @since 1.3.1
     */
    static tiene_permiso(nombre_comando) {
        // TODO: implementar verificación real
        return true;
    }

    /**
     * Deshace el último comando ejecutado que tuviera reversa.
     *
     * Extrae de la pila de historial la reversa más reciente y la invoca.
     * Si no hay comandos para deshacer, emite una alerta y retorna `null`.
     *
     * @returns {*} El resultado de la reversa, o `null` si no hay nada que deshacer.
     *
     * @see Controlador.ejecutar_comando
     * @see Controlador.registrar_comando
     * @since 1.3.1
     */
    static deshacer_ultimo() {
        if (!this.historial.length) {
            Controlador._alerta('No hay comandos para deshacer.');
            return null;
        }
        const reversa = this.historial.pop();
        return reversa();
    }

}

// Ejecutar inicialización global
Controlador.inicializar();
export {Controlador}