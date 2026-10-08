import { Conf, Entorno } from '../Configuracion/index.js';
import { Objeto } from "../Nucleo/index.js";
import { Nodo } from '../Nodos/Nodo.js';
// Si se necesita NodoElectrico en inicializar, importarlo:
// import { NodoElectrico } from '../Nodos/NodoElectrico.js';
import {
    PerdurarSuperestructura,
    PerdurarSuperestructuraConContexto,
    PerdurarSuperestructuraStringIndexedDB,
    PerdurarSuperestructuraStringIndexedDB64,
    PerdurarSuperestructuraStringJSON,
    PerdurarSuperestructuraStringXML,
    PerdurarSuperestructuraElectricosStringIndexedDB
} from './PerdurarSuperestructura/index.js';
import { Comandos, Comunicadores, VectorGravitacional, Motor, Dominios } from './interfaces/index.js'; // unificado
import { Comando } from '../Comandos/index.js';
import { RegistroGlobal } from './RegistroGlobal.js';
import { mezclar_clase_con_interfaces } from "../miscelaneas/mixin.js";
import { RelojAstronomico } from '../Tiempo/RelojAstronomico.js';
import { NodoNumerico } from '../Nodos/NodoNumerico.js';
import { ProcesadorDeDominio } from './ProcesadorDeDominio.js';
import { Senal } from '../Iteradores/Senal.js';
import { Talamo } from '../Controlador/Talamo.js';
// console.log("Controlador");  

/**
 * Clase Controlador que gestiona la persistencia de la superestructura.
 * 
 * Permite elegir el método de guardado (sql, json, texto, etc.) en tiempo de ejecución.
 *
 * @author Ignacio David Baigorria
 *
 * @class
 * @extends Objeto
 * @implements {Controlador.PerdurarSuperestructura.PerdurarSuperestructura}
 * @implements {Controlador.Interfaces.Comandos}
 * @implements {Controlador.Interfaces.Comunicadores}
 * @implements {Controlador.Interfaces.VectorGravitacional}
 * @implements {Controlador.Interfaces.Dominios}
 * @memberof Controlador
 * @since 1.2.0
 * @version 1.5i.7k
 */
class Controlador extends mezclar_clase_con_interfaces(Objeto, PerdurarSuperestructura, Comandos, Comunicadores, VectorGravitacional, Motor, Dominios) {
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

    // ═══════════════════════════════════════════
    // V 1.4.6 – PROCESADORES DE DOMINIO
    // ═══════════════════════════════════════════

    /**
     * Procesadores de dominio (entrada/salida), indexados por prefijo.
     * @type {Object.<string, ProcesadorDeDominio>}
     * @since 1.4.6
     */
    static _procesadores = {};

    /**
     * Obtiene (o crea) el procesador para un medio y dirección.
     *
     * @param {string} medio     Nombre del medio (ej. 'Archivo', 'Talamo').
     * @param {string} direccion 'entrada' o 'salida'.
     * @returns {ProcesadorDeDominio}
     * @since 1.4.6
     */
    static procesador(medio, direccion) {
        const clave = `${medio}:${direccion}`;
        if (!this._procesadores[clave]) {
            this._procesadores[clave] = new ProcesadorDeDominio(medio, direccion);
            this._procesadores[clave].constructor.recibir_token(this.token);
        }
        return this._procesadores[clave];
    }



        // ======= Métodos de persistencia =======
    static registrar_implementacion(nombre, clase) {
        this.implementaciones[nombre.toUpperCase()] = clase;
        if (this.token && typeof clase.recibir_token === "function") {
            clase.recibir_token(this.token);
        }
    }

    static establecer_metodo(nuevo_metodo) {
        nuevo_metodo = nuevo_metodo.toUpperCase();
        if (this.implementaciones[nuevo_metodo]) {
            this.metodo = nuevo_metodo;
            this.clase_actual = this.implementaciones[nuevo_metodo];
            return true;
        }
        this._alerta(`Método de persistencia '${nuevo_metodo}' no reconocido`);
        return false;
    }

    static recibir_token(token) {
        this.token = token;
        for (const nombre in this.implementaciones) {
            const clase = this.implementaciones[nombre];
            if (clase && typeof clase.recibir_token === "function") {
                clase.recibir_token(token);
            }
        }
    }

    static async delegar(funcion, nombre) {
        if (typeof nombre !== "string") {
            this._error("delegar: el nombre debe ser un string");
            return null;
        }
        const clase = this.clase_actual;
        if (!clase) {
            this._alerta("Clase de persistencia no disponible para el método actual.");
            return null;
        }
        if (typeof clase[funcion] !== "function") {
            this._alerta(`El método '${funcion}' no existe en la clase seleccionada.`);
            return null;
        }
        // `await` funciona tanto si la implementación es async
        // (IndexedDB) como si es sync (JSON/XML).
        return await clase[funcion](nombre);
    }

     /**
     * Verifica que no haya nodos ocupados (autoenlace "ocupado") en la superestructura.
     *
     * @return {boolean} `true` si todos los nodos están desocupados, `false` en caso contrario.
     * @version 1.5i.4
     */
    static verificar_superestructura_desocupada() {
        const resultado = Nodo.por_cada_nodo_ejecutar(this.token, (nodo) => {
            const ady = nodo.adyacente("ocupado");
            return (ady === nodo);
        });

        // Si no hay nodos, no hay ocupados
        if (resultado === null || resultado === undefined) {
            return true;
        }

        // Normalizar a iterable según tipo
        let entradas;
        if (resultado instanceof Map) {
            entradas = resultado.entries();
        } else if (Array.isArray(resultado)) {
            entradas = resultado.entries();
        } else if (typeof resultado === 'object') {
            entradas = Object.entries(resultado);
        } else {
            return true; // No se puede analizar, asumimos que está desocupada
        }

        for (const [id, esta_ocupado] of entradas) {
            if (esta_ocupado) {
                this._error(`No se puede guardar: el nodo con ID ${id} está ocupado.`);
                return false;
            }
        }

        return true;
    }

    // ======= Métodos públicos de operación =======

    /** @return {boolean} 
     * @version 1.5i.4
    */
    static async guardar(nombre) {
        if (this._grafo_parcial) {
            this._error("No se puede guardar un grafo parcial con guardar(). Usar guardar_parcial() o cargar() completo primero.");
            return false;
        }
        if (!this.verificar_superestructura_desocupada()) {
            return false;
        }
        return await this.delegar("guardar", nombre);
    }


    /** @return {boolean} 
     * @version 1.5i.4
    */
    static async cargar(nombre) {
        Nodo.vaciar_superestructura(this.token);
        this._grafo_parcial = false;
        return await this.delegar("cargar", nombre);
    }

    /** @return {Promise<boolean|null>} */
    static async eliminar(nombre) {
        return await this.delegar("eliminar", nombre);
    }

    /** @return {Promise<boolean|null>} */
    static async existe(nombre) {
        return await this.delegar("existe", nombre);
    }

    // ══════════════════════════════════════════════════════
    // CONTEXTOS Y CARGA PARCIAL (v1.5i.7k)
    // ══════════════════════════════════════════════════════

    /**
     * Indica si la superestructura cargada es parcial.
     * @type {boolean}
     */
    static _grafo_parcial = false;

    /**
     * Devuelve true si la superestructura en memoria fue
     * cargada de forma parcial.
     *
     * @returns {boolean}
     * @since 1.5i.7k
     */
    static es_grafo_parcial() {
        return this._grafo_parcial === true;
    }

    /**
     * Carga solo los nodos que pertenecen a alguno de los
     * contextos pedidos. Marca la superestructura como parcial.
     *
     * @param {string}   nombre
     * @param {string[]} contextos
     * @returns {Promise<boolean|null>}
     * @since 1.5i.7k
     */
    static async cargar_parcial(nombre, contextos) {
        Nodo.vaciar_superestructura(this.token);
        this._grafo_parcial = false;
        const clase = this.clase_actual;
        if (!clase || typeof clase.cargar_parcial !== "function") {
            this._error("El método de persistencia activo no soporta cargar_parcial.");
            return null;
        }
        const res = await clase.cargar_parcial(nombre, contextos);
        if (res === true) {
            this._grafo_parcial = true;
        }
        return res;
    }

    /**
     * Guarda solo el subgrafo en memoria filtrando por contextos.
     *
     * @param {string}   nombre
     * @param {string[]} contextos
     * @returns {Promise<boolean>}
     * @since 1.5i.7k
     */
    static async guardar_parcial(nombre, contextos) {
        const clase = this.clase_actual;
        if (!clase || typeof clase.guardar_parcial !== "function") {
            this._error("El método de persistencia activo no soporta guardar_parcial.");
            return false;
        }
        return await clase.guardar_parcial(nombre, contextos);
    }

    /**
     * Lista los contextos registrados bajo un nombre.
     *
     * @param {string} nombre
     * @returns {Promise<string[]|null>}
     * @since 1.5i.7k
     */
    static async listar_contextos(nombre) {
        const clase = this.clase_actual;
        if (!clase || typeof clase.listar_contextos !== "function") {
            this._error("El método de persistencia activo no soporta listar_contextos.");
            return null;
        }
        return await clase.listar_contextos(nombre);
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
     * Si la superestructura está vacía, se muestra un mensaje informativo
     * en el contenedor correspondiente (HTML) o en la consola.
     *
     * @returns {boolean} `true` si se ejecutó sin errores, `false` si ocurrió un problema.
     *
     * @since 1.3.0 Unifica imprimir_superestructura e imprimir_superestructura2.
     * @version 1.3.2 Añadido mensaje cuando la superestructura está vacía y encabezado HTML.
     *
     * @see Nodos.Nodo#imprimir
     * @see Configuracion.Entorno
     */
    static imprimir_superestructura() {
        const colores = Conf.NODOS_COLORES;
        const contenedor_id = Conf.NODOS_CONTENEDOR_ID;

        // Obtener o crear el contenedor HTML
        let contenedor = document.getElementById(contenedor_id);
        if (!contenedor) {
            contenedor = document.createElement("div");
            contenedor.id = contenedor_id;
            contenedor.style.cssText = `
                background: ${colores.fondo};
                color: ${colores.texto};
                padding: 1em;
                margin: 1em 0;
                border: 1px solid ${colores.borde};
                font-family: monospace;
                white-space: pre-wrap;
            `;
            document.body.appendChild(contenedor);
        }

        // Encabezado común para ambos entornos
        const encabezado = "===== SUPERESTRUCTURA =====";
        if (Entorno.es_consola()) {
            const estilo = `color: ${Conf.NODOS_COLORES.texto}; background: ${Conf.NODOS_COLORES.fondo};`;
            console.log(`%c${encabezado}`, estilo);
        } else {
            // En HTML, mostramos el encabezado dentro del contenedor
            contenedor.innerHTML = `<h3>${encabezado}</h3>`;
        }

        // Verificar si hay nodos en la superestructura
        if (!Nodo.hay_nodos_en_superestructura()) {
            const mensaje = "No hay nodos en la superestructura.";
            if (Entorno.es_consola()) {
                console.log(mensaje);
            } else {
                // En HTML, añadimos el mensaje debajo del encabezado
                contenedor.innerHTML += `<p>${mensaje}</p>`;
            }
            return false;
        }

        // Iterar sobre todos los nodos e imprimirlos
        const funcion = nodo => nodo.imprimir();
        Nodo.por_cada_nodo_ejecutar(Controlador.token, funcion, null);

        return true;
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
    static async ejecutar_prueba(callback) {
        if (!Entorno.permite_pruebas()) {
            this._alerta('ejecutar_prueba() no está disponible en entorno de producción');
            return;
        }
        if (!this.token) {
            this._error('Controlador no registrado. Llame a Controlador.registrar() primero.');
            return;
        }
        // `await` sobre el callback permite que los tests con
        // callbacks async esperen a que termine el trabajo real.
        // Si el callback es sync, no afecta: devuelve undefined.
        return await callback(this.token);
    }

    // ══════════════════════════════════════════════════════
    // INTERFAZ COMANDOS
    // ══════════════════════════════════════════════════════

    /**
     * Mapa de comandos registrados.
     * @type {Object<string, {
     *     manejador: Function,
     *     reversa: ?Function,
     *     clase: ?typeof Comando
     * }>}
     */
    static comandos = {};

    /** @type {Array<Function>} Pila de reversiones para deshacer. */
    static historial = [];

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
     * @version 1.3.2
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
            reversa,
            clase: null,   // Comando registrado manualmente sin clase
        };
        return true;
    }

    /**
     * Registra un comando a partir de una instancia que implementa {@link Comando}.
     *
     * @param {Comando} comando Instancia del comando.
     * @returns {boolean}
     * @since 1.3.1
     * @version 1.3.4 (eliminada validación de palabras reservadas)
     */
    static registrar_comando_desde_instancia(comando) {
        const nombre = comando.constructor.nombre();
        const solo_desarrollo = comando.constructor.solo_desarrollo();
        const clase = comando.constructor;

        const manejador = (token, args) => comando.ejecutar(token, args);

        let reversa = null;
        const fn_reversa = comando.reversa();
        if (typeof fn_reversa === 'function') {
            reversa = (token, args) => comando.reversa()(token, args);
        }

        this.comandos[nombre] = {
            manejador,
            reversa,
            clase,   // Guardar la clase para el parseo
        };

        return true;
    }

    /**
     * Registra un comando a partir de una clase que implementa {@link Comando}.
     *
     * @param {typeof Comando} clase Clase del comando.
     * @returns {boolean}
     * @since 1.3.1
     * @version 1.3.4 (eliminada validación de palabras reservadas)
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
     * Ejecuta un comando previamente registrado.
     *
     * Este método es el punto central de ejecución del sistema de comandos.
     * Se encarga de localizar el manejador asociado al comando, verificar
     * permisos, parsear los argumentos cuando es posible y, finalmente,
     * invocar la lógica del comando.
     *
     * **Flujo de ejecución detallado:**
     *
     * 1. **Búsqueda del comando:** Busca el nombre en el mapa interno de
     *    comandos registrados. Si no existe, registra un error con
     *    {@link Controlador._error} y retorna `null`.
     *
     * 2. **Verificación de permisos:** Invoca {@link Controlador.tiene_permiso}
     *    para comprobar si el usuario actual está autorizado. Si no lo está,
     *    registra un error y retorna `null`. Por ahora,
     *    {@link Controlador.tiene_permiso} es un placeholder que retorna `true`.
     *
     * 3. **Parseo de argumentos (opcional):** Si el comando tiene una clase
     *    asociada y ésta implementa el método {@link Comando.parametros},
     *    se obtiene la definición de parámetros y se invoca
     *    {@link Controlador._parsear_y_validar_args} para convertir los
     *    argumentos crudos en una estructura normalizada.
     *    Si no hay definición de parámetros, los argumentos se pasan
     *    directamente al manejador como un array crudo.
     *
     * 4. **Ejecución del manejador:** Invoca el manejador del comando con el
     *    token de seguridad interno y los argumentos (parseados o crudos).
     *
     * 5. **Registro de reversa:** Si el comando tiene definida una función de
     *    reversa (proporcionada durante el registro), la almacena en la pila
     *    de historial para que pueda ser deshecha posteriormente con
     *    {@link Controlador.deshacer_ultimo}.
     *
     * @param {string} nombre Nombre del comando (ej. 'depuracion:imprimir').
     * @param {...*}   args   Argumentos para el manejador (crudos, serán parseados si hay definición).
     *
     * @returns {*} El resultado devuelto por el manejador del comando, o
     *              `null` si el comando no existe, no hay permiso o los
     *              argumentos son inválidos.
     *
     * @example
     * // Ejecución básica
     * Controlador.ejecutar_comando('depuracion:imprimir');
     *
     * // Con argumentos
     * Controlador.ejecutar_comando('depuracion:imprimir', '--errores');
     * Controlador.ejecutar_comando('comunicacion:escribir', 'archivo', '/ruta', 'contenido');
     *
     * @see Controlador.registrar_comando
     * @see Controlador.tiene_permiso
     * @see Controlador.deshacer_ultimo
     * @since 1.3.1
     * @version 1.3.4
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
        const clase = registro.clase;
        const manejador = registro.manejador;

        // Parsear argumentos solo si el comando tiene definición
        let args_parseados;
        if (clase && typeof clase.parametros === 'function') {
            const definicion = clase.parametros();
            args_parseados = Controlador._parsear_y_validar_args(definicion, args, clase);
            if (args_parseados === null) {
                return null;
            }
        } else {
            args_parseados = args;
        }

        const token = Controlador.token;
        const resultado = manejador(token, args_parseados);

        if (registro.reversa) {
            this.historial.push(() => registro.reversa(token, args_parseados));
        }

        return resultado;
    }

    /**
     * Valida los argumentos crudos contra la definición de parámetros del comando.
     *
     * Si se encuentran errores de validación, los registra con {@link Controlador._error}.
     *
     * @param {Object[]} definicion Definición de parámetros.
     * @param {Array}    args       Argumentos crudos.
     * @param {typeof Comando} clase Clase del comando.
     * @returns {Object|null} Estructura con 'posicionales', 'banderas' y 'opciones',
     *                        o `null` si hay errores.
     * @private
     * @since 1.3.2
     * @version 1.3.4 (eliminada la llamada a _mostrar_ayuda)
     */
    static _parsear_y_validar_args(definicion, args, clase) {
        const posicionales = [];
        const banderas = {};
        const opciones = {};

        // Inicializar defectos
        for (const param of definicion) {
            if (param.tipo === 'bandera') {
                banderas[param.nombre] = param.defecto ?? false;
            } else if (param.tipo === 'opcion' && param.defecto !== undefined) {
                opciones[param.nombre] = param.defecto;
            }
        }

        for (const arg of args) {
            if (typeof arg === 'string' && arg.startsWith('--')) {
                const sin_guiones = arg.slice(2);
                if (sin_guiones.includes('=')) {
                    const [clave, valor] = sin_guiones.split('=', 2);
                    opciones[clave] = valor;
                } else {
                    banderas[sin_guiones] = true;
                }
            } else {
                posicionales.push(arg);
            }
        }

        const nombres_conocidos = definicion.map(p => p.nombre);
        const errores = [];

        // Validar banderas desconocidas
        for (const nombre of Object.keys(banderas)) {
            if (!nombres_conocidos.includes(nombre)) {
                errores.push(`Flag desconocido: '--${nombre}'.`);
            }
        }

        // Validar opciones desconocidas
        for (const nombre of Object.keys(opciones)) {
            if (!nombres_conocidos.includes(nombre)) {
                errores.push(`Opción desconocida: '--${nombre}'.`);
            }
        }

        // Validar parámetros según definición
        let pos_def = 0;
        for (const param of definicion) {
            const nombre = param.nombre;
            const tipo = param.tipo;
            const obligatorio = param.obligatorio ?? false;
            const valores_permitidos = param.valores ?? null;

            if (tipo === 'posicional') {
                if (obligatorio && posicionales[pos_def] === undefined) {
                    errores.push(`Falta el argumento posicional '${nombre}' (obligatorio). Valores permitidos: ${valores_permitidos.join(', ')}.`);
                } else if (posicionales[pos_def] !== undefined && valores_permitidos) {
                    if (!valores_permitidos.includes(posicionales[pos_def])) {
                        errores.push(`Valor inválido para '${nombre}': '${posicionales[pos_def]}'. Valores permitidos: ${valores_permitidos.join(', ')}.`);
                    }
                }
                pos_def++;
            } else if (tipo === 'opcion' && valores_permitidos && opciones[nombre] !== undefined) {
                if (!valores_permitidos.includes(opciones[nombre])) {
                    errores.push(`Valor inválido para '--${nombre}': '${opciones[nombre]}'. Valores permitidos: ${valores_permitidos.join(', ')}.`);
                }
            }
        }

        if (errores.length > 0) {
            for (const error of errores) {
                Controlador._error(error);
            }
            return null;
        }

        return { posicionales, banderas, opciones };
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

    // ══════════════════════════════════════════════════════
    // INTERFAZ COMUNICADORES
    // ══════════════════════════════════════════════════════

    /**
     * Mapa de comunicadores registrados.
     *
     * @type {Object<string, {instancia: Comunicador, clase: typeof Comunicador}>}
     */
    static comunicadores = {};

    /**
     * Registra un nuevo comunicador a partir de una clase que cumple
     * el contrato de comunicador (métodos estáticos `nombre`, `solo_desarrollo`).
     *
     * No requiere importar la interfaz Comunicador, usando duck typing.
     *
     * @param {Function} clase Clase del comunicador.
     * @returns {boolean} `true` si se registró correctamente.
     * @since 1.3.3
     */
    static registrar_comunicador_desde_clase(clase) {
        if (typeof clase.nombre !== 'function' || typeof clase.solo_desarrollo !== 'function') {
            Controlador._error('La clase no cumple con el contrato de Comunicador.');
            return false;
        }

        const instancia = new clase();
        return this.registrar_comunicador_desde_instancia(instancia);
    }

    /**
     * Registra un nuevo comunicador a partir de una instancia que cumple
     * el contrato de comunicador (métodos `enviar`, `solicitar`, etc.).
     *
     * Si ya existe un comunicador con el mismo nombre, emite una alerta y
     * sobrescribe la entrada anterior.
     *
     * @param {Object} comunicador Instancia del comunicador.
     * @returns {boolean} `true` si se registró correctamente.
     * @since 1.3.3
     */
    static registrar_comunicador_desde_instancia(comunicador) {
        // Duck typing: verificamos que tenga los métodos esenciales
        if (typeof comunicador.enviar !== 'function' || typeof comunicador.solicitar !== 'function') {
            Controlador._error('La instancia no cumple con el contrato de Comunicador.');
            return false;
        }

        const nombre = comunicador.constructor.nombre();
        const clase = comunicador.constructor;

        if (this.comunicadores[nombre]) {
            Controlador._alerta(`El comunicador '${nombre}' ya está registrado y será sobrescrito.`);
        }

        this.comunicadores[nombre] = {
            instancia: comunicador,
            clase: clase
        };

        return true;
    }

    /**
     * Obtiene la instancia única de un comunicador por su nombre.
     *
     * Si se invoca sin argumentos (o con el valor especial `'predeterminado'`),
     * devuelve automáticamente el comunicador de salida estándar correspondiente
     * al entorno actual:
     * - En **consola** → `consola`
     * - En **navegador** → `html`
     *
     * @param {string} [nombre='predeterminado'] Nombre del comunicador.
     * @returns {Comunicador|null} La instancia del comunicador, o `null` si no está disponible.
     * @since 1.3.3
     * @version 1.4.7 (nombres actualizados a 'consola' y 'html')
     */
    static comunicador(nombre = 'predeterminado') {
        if (nombre === 'predeterminado') {
            nombre = Entorno.es_consola() ? 'consola' : 'html';
        }

        if (!this.comunicadores[nombre]) {
            Controlador._error(`Comunicador desconocido: '${nombre}'.`);
            return null;
        }

        if (!Controlador.tiene_permiso_comunicador(nombre)) {
            Controlador._error(`Permiso denegado para el comunicador '${nombre}'.`);
            return null;
        }

        return this.comunicadores[nombre].instancia;
    }

    /**
     * Escribe un mensaje en la salida estándar configurada según el entorno.
     *
     * Convierte el texto a {@link Senal} mediante el {@link Talamo} y lo envía
     * a través del comunicador predeterminado.
     *
     * @param {string} mensaje Texto a escribir en la salida estándar.
     * @returns {void}
     * @since 1.3.3
     * @version 1.4.7 (usa Talamo para convertir el string)
     */
    static escribir_salida(mensaje) {
        const salida = Controlador.comunicador();
        if (salida) {
            const senal = Talamo.obtener().traducir_entrada(mensaje);
            salida.enviar('', senal);
        }
    }

    /**
     * Verifica si el usuario actual tiene permiso para usar el comunicador.
     *
     * **Placeholder:** actualmente retorna `true` para cualquier comunicador.
     * En el futuro se integrará con un sistema de roles/permisos.
     *
     * @param {string} nombre Nombre del comunicador.
     *
     * @returns {boolean} `true` si el usuario tiene permiso, `false` en caso contrario.
     *
     * @see Controlador.comunicador
     * @since 1.3.3
     */
    static tiene_permiso_comunicador(nombre) {
        // TODO: implementar verificación real de permisos
        return true;
    }

    /**
     * Registra los comandos genéricos de comunicación.
     *
     * Se invoca durante {@link inicializar} para que estén disponibles
     * tanto para programadores como para el futuro sistema de aprendizaje.
     *
     * @returns {void}
     * @since 1.3.3
     * @version 1.4.7 (traducción delegada al Tálamo, eliminación usa método propio)
     * @private
     */
    static _registrar_comandos_comunicacion() {
        // ─── comunicación:leer ───────────────────────────────
        this.registrar_comando('comunicacion:leer', (token, args) => {
            const medio  = args[0] ?? null;
            const fuente = args[1] ?? '';
            if (!medio) {
                Controlador._error("Falta el medio para 'comunicacion:leer'.");
                return null;
            }
            const comunicador = Controlador.comunicador(medio);
            if (!comunicador) return null;

            return comunicador.solicitar(fuente);
        }, null, false);

        // ─── comunicación:escribir ────────────────────────────
        this.registrar_comando('comunicacion:escribir', (token, args) => {
            const medio   = args[0] ?? null;
            const senal   = args[1] ?? null;
            const destino = args[2] ?? '';
            if (!medio || !senal) {
                Controlador._error("Faltan medio o señal para 'comunicacion:escribir'.");
                return false;
            }
            if (!(senal instanceof Senal)) {
                Controlador._error("El parámetro debe ser una Senal.");
                return false;
            }
            const comunicador = Controlador.comunicador(medio);
            if (!comunicador) return false;

            comunicador.enviar(destino, senal);
            return true;
        }, null, false);

        // ─── comunicación:preguntar ───────────────────────────
        this.registrar_comando('comunicacion:preguntar', (token, args) => {
            const medio   = args[0] ?? 'salida_depuracion_consola';
            const mensaje = args[1] ?? '';
            const comunicador = Controlador.comunicador(medio);
            if (!comunicador) return null;
            if (medio === 'salida_depuracion_consola') {
                const respuesta = prompt(mensaje);
                const texto = respuesta !== null ? respuesta : '';
                return Talamo.obtener().traducir_entrada(texto);
            }
            return comunicador.solicitar(mensaje);
        }, null, false);

        // ─── comunicación:eliminar ────────────────────────────
        this.registrar_comando('comunicacion:eliminar', (token, args) => {
            const medio   = args[0] ?? null;
            const destino = args[1] ?? '';
            if (!medio) {
                Controlador._error("Falta el medio para 'comunicacion:eliminar'.");
                return false;
            }
            const comunicador = Controlador.comunicador(medio);
            if (!comunicador) return false;

            if (typeof comunicador.eliminar === 'function') {
                comunicador.eliminar(destino);
                return true;
            }

            Controlador._error(`El comunicador '${medio}' no soporta eliminación.`);
            return false;
        }, null, false);

        // ─── comunicación:listar ──────────────────────────────
        this.registrar_comando('comunicacion:listar', (token, args) => {
            const medio      = args[0] ?? null;
            const directorio = args[1] ?? '.';
            if (!medio) {
                Controlador._error("Falta el medio para 'comunicacion:listar'.");
                return null;
            }
            const comunicador = Controlador.comunicador(medio);
            if (!comunicador) return null;

            if (typeof comunicador.listar === 'function') {
                return comunicador.listar(directorio);
            }

            Controlador._error(`El comunicador '${medio}' no soporta listado.`);
            return null;
        }, null, false);

        // ─── comunicación:escuchar ─────────────────────────────
        this.registrar_comando('comunicacion:escuchar', (token, args) => {
            const medio = args[0] ?? null;
            if (!medio) {
                Controlador._error("Falta el medio para 'comunicacion:escuchar'.");
                return false;
            }
            const comunicador = Controlador.comunicador(medio);
            if (!comunicador) return false;
            comunicador.escuchar((senal) => {
                const salida = Controlador.comunicador();
                if (salida) {
                    salida.enviar('', senal);
                }
            });
            return true;
        }, null, false);
    }

    // ═══════════════════════════════════════════════════════════
    // RELOJ ASTRONÓMICO Y UBICACIÓN (v1.3.6)
    // ═══════════════════════════════════════════════════════════

    /**
     * Instancia del reloj astronómico asociada al controlador.
     *
     * Se inicializa en {@link inicializar} con las coordenadas obtenidas
     * de {@link Entorno.obtener_coordenadas}.
     *
     * @type {RelojAstronomico|null}
     * @since 1.3.6
     * @private
     */
    static _reloj = null;

    /**
     * Devuelve el vector gravitacional correspondiente al instante actual
     * (o al timestamp proporcionado) según la ubicación del controlador.
     *
     * @param {number|null} [timestamp=null] Timestamp Unix (segundos). Si es null, se usa el instante actual.
     * @returns {{x: number, y: number, z: number}|null} Vector unitario, o null si el reloj no está inicializado.
     * @since 1.3.6
     */
    static vector_gravitacional_actual(timestamp = null) {
        if (!this._reloj) {
            this._alerta('Reloj astronómico no inicializado.');
            return null;
        }
        return this._reloj.vector(timestamp);
    }

    /**
     * Actualiza manualmente la ubicación del controlador y del reloj astronómico.
     *
     * @param {number} latitud  Nueva latitud.
     * @param {number} longitud Nueva longitud.
     * @returns {void}
     * @since 1.3.6
     */
    static _actualizar_ubicacion(latitud, longitud) {
        if (this._reloj) {
            this._reloj._ubicacion(latitud, longitud);
        }
    }

    // ═══════════════════════════════════════════════════════════
    // MOTOR DE EJECUCIÓN (v1.3.7)
    // ═══════════════════════════════════════════════════════════

    /**
     * Estados posibles del motor.
     *
     * @enum {string}
     * @since 1.3.7
     */
    static MOTOR_DETENIDO = 'detenido';
    static MOTOR_ACTIVO = 'activo';
    static MOTOR_PAUSADO = 'pausado';
    static MOTOR_PAUSA_URGENTE = 'pausa_urgente';

    /**
     * Estado actual del motor.
     * @type {string}
     * @private
     */
    static _estado_motor = Controlador.MOTOR_DETENIDO;

    /**
     * @type {string|null}
     * @private
     */
    static _indice_fase_actual = null;

    /**
     * ID del temporizador del motor (setInterval).
     * @type {number|null}
     * @private
     */
    static _timer_motor = null;

    /**
     * ID del temporizador de timeout de pausa urgente.
     * @type {number|null}
     * @private
     */
    static _pausa_urgente_timer = null;

    /**
     * Razón de la última pausa urgente.
     * @type {string}
     * @private
     */
    static _razon_pausa_urgente = '';

    /**
     * Inicia el motor de ejecución.
     *
     * Si ya está activo o pausado, no hace nada.
     * Arranca un setInterval que llamará a {@link _bucle_motor}
     * cada {@link Conf.MOTOR_INTERVALO_MS} milisegundos.
     *
     * @returns {void}
     * @since 1.3.7
     */
    static _iniciar_motor() {
        if ([this.MOTOR_ACTIVO, this.MOTOR_PAUSADO].includes(this._estado_motor)) {
            return;
        }

        this._estado_motor = this.MOTOR_ACTIVO;
        this._indice_fase_actual = 0;
        this._ciclos_ejecutados = 0;

        this._timer_motor = setInterval(() => {
            if (this._estado_motor !== this.MOTOR_ACTIVO) {
                return;
            }

            this._bucle_motor();
            this._ciclos_ejecutados++;

            const max = Conf.MOTOR_MAX_CICLOS;
            if (max > 0 && this._ciclos_ejecutados >= max) {
                this._estado_motor = this.MOTOR_DETENIDO;
                clearInterval(this._timer_motor);
                this._timer_motor = null;
            }
        }, Conf.MOTOR_INTERVALO_MS);
    }

    /**
     * Pausa el motor por solicitud explícita.
     *
     * El temporizador se detiene y el estado se conserva.
     * Se debería persistir la superestructura aquí para evitar pérdidas.
     *
     * @returns {void}
     * @since 1.3.7
     */
    static _pausar_motor() {
        if (this._estado_motor !== this.MOTOR_ACTIVO) {
            return;
        }

        this._estado_motor = this.MOTOR_PAUSADO;
        if (this._timer_motor !== null) {
            clearInterval(this._timer_motor);
            this._timer_motor = null;
        }
        // TODO: persistir superestructura cuando esté operativo
        // PerdurarSuperestructura.guardar('motor');
    }

    /**
     * Reanuda el motor tras una pausa explícita.
     *
     * @returns {void}
     * @since 1.3.7
     */
    static _reanudar_motor() {
        if (this._estado_motor !== this.MOTOR_PAUSADO) {
            return;
        }

        // TODO: cargar superestructura para restaurar estado
        // PerdurarSuperestructura.cargar('motor');

        this._estado_motor = this.MOTOR_ACTIVO;
        this._timer_motor = setInterval(() => {
            this._bucle_motor();
        }, Conf.MOTOR_INTERVALO_MS);
    }

    /**
     * Detiene el motor completamente.
     *
     * Limpia el temporizador y el estado interno.
     *
     * @returns {void}
     * @since 1.3.7
     */
    static _detener_motor() {
        // TODO: persistir superestructura antes de detener
        if (this._timer_motor !== null) {
            clearInterval(this._timer_motor);
            this._timer_motor = null;
        }
        if (this._pausa_urgente_timer !== null) {
            clearTimeout(this._pausa_urgente_timer);
            this._pausa_urgente_timer = null;
        }
        this._estado_motor = this.MOTOR_DETENIDO;
        this._indice_fase_actual = 0;
    }

    /**
     * Pausa el motor de forma urgente.
     *
     * Se programa una reanudación automática tras
     * {@link Conf.MOTOR_PAUSA_URGENTE_TIMEOUT_S} segundos.
     *
     * @param {string} [razon=''] Motivo de la pausa.
     * @returns {void}
     * @since 1.3.7
     */
    static _pausar_urgente(razon = '') {
        if (this._estado_motor !== this.MOTOR_ACTIVO) {
            return;
        }

        this._estado_motor = this.MOTOR_PAUSA_URGENTE;
        this._razon_pausa_urgente = razon;

        // TODO: persistir superestructura

        // Programar reanudación automática
        this._pausa_urgente_timer = setTimeout(() => {
            if (this._estado_motor === this.MOTOR_PAUSA_URGENTE) {
                this._alerta(`Timeout de pausa urgente alcanzado (${Conf.MOTOR_PAUSA_URGENTE_TIMEOUT_S}s). Reanudando.`);
                this._estado_motor = this.MOTOR_ACTIVO;
                this._razon_pausa_urgente = '';
                this._pausa_urgente_timer = null;
            }
        }, Conf.MOTOR_PAUSA_URGENTE_TIMEOUT_S * 1000);
    }

    /**
     * Ejecuta una rodaja de trabajo del motor.
     *
     * Atiende a la fase actual y ejecuta hasta {@link Conf.MOTOR_QUANTUM}
     * comandos. Si la fase se queda sin comandos, el péndulo avanza
     * inmediatamente.
     *
     * @returns {void}
     * @since 1.3.7
     * @private
     */
    static _bucle_motor() {
        if (this._estado_motor !== this.MOTOR_ACTIVO) return;

        let fase = this._indice_fase_actual;
        if (fase === null) {
            fase = this._pendulo(null);
            if (fase === null) {
                this._estado_motor = this.MOTOR_DETENIDO;
                return;
            }
        }

        const quantum = Conf.MOTOR_QUANTUM;

        for (let i = 0; i < quantum; i++) {
            const entrada = this._siguiente_comando_en_fase(fase);
            if (entrada === null) break;
            const [nombre_comando, args] = entrada;
            this.ejecutar_comando(nombre_comando, ...args);
        }

        if (this._siguiente_comando_en_fase(fase) === null) {
            if (this._dominio_actual !== null) {
                const siguiente = this._siguiente_dominio(this._dominio_actual);
                if (siguiente !== null) {
                    this._activar_dominio(siguiente);
                    fase = this._pendulo(null);
                } else {
                    this._desactivar_dominio();
                    fase = this._pendulo(null);
                }
            }
        }

        if (Object.keys(this._colas_comandos).length > 0) {
            this._indice_fase_actual = this._pendulo(fase);
        } else {
            this._indice_fase_actual = null;
            this._estado_motor = this.MOTOR_DETENIDO;
        }
    }


    // ═══════════════════════════════════════════════════════════
    // COLAS DE COMANDOS POR FASE (v1.3.9)
    // ═══════════════════════════════════════════════════════════

    /**
     * Colas de comandos pendientes.
     * @type {Object<string, Array<[string, Array]>>}
     * @since 1.3.8
     * @version 1.3.9
     * @private
     */
    static _colas_comandos = {};

    /**
     * Añade un comando a la cola de una fase.
     *
     * Si la fase no existe, se crea automáticamente.
     *
     * @param {string}   fase    Identificador de la fase.
     * @param {Function} comando Función a ejecutar.
     * @returns {void}
     * @since 1.3.8
     */
    static encolar_comando_en_fase(fase, nombre_comando, ...args) {
        if (!this._colas_comandos[fase]) {
            this._colas_comandos[fase] = [];
        }
        this._colas_comandos[fase].push([nombre_comando, args]);
    }

    /**
     * Obtiene el siguiente comando pendiente en una fase (y lo retira).
     *
     * @param {string} fase Identificador de la fase.
     * @returns {Function|null} El comando, o null si no hay.
     * @since 1.3.8
     * @private
     */
    static _siguiente_comando_en_fase(fase) {
        const cola = this._colas_comandos[fase];
        if (!cola || cola.length === 0) {
            delete this._colas_comandos[fase];
            return null;
        }
        return cola.shift();
    }

    /**
     * Devuelve la siguiente fase que debe ser atendida (péndulo).
     *
     * @param {string|null} fase_actual Fase que acaba de ser atendida.
     * @returns {string|null} Siguiente fase, o null si no hay.
     * @since 1.3.7
     * @version 1.3.9 
     * @private
     */
    static _pendulo(fase_actual) {
        const fases = Object.entries(this._colas_comandos)
            .filter(([_, cola]) => cola.length > 0)
            .map(([fase]) => fase)
            .filter(fase => {
                if (this._dominio_actual === null) return true;
                return fase.startsWith(this._dominio_actual + ':');
            });

        if (fases.length === 0) return null;
        fases.sort();

        if (fase_actual === null || !fases.includes(fase_actual)) return fases[0];
        const indice = fases.indexOf(fase_actual);
        return fases[(indice + 1) % fases.length];
    }

    /**
     * Registra los comandos genéricos de dominio.
     *
     * @returns {void}
     * @since 1.3.3
     * @version 1.4.7 (adaptados a Senal y Talamo)
     * @private
     */
    static _registrar_comandos_dominio() {
        // ─── dominio:leer_byte ──────────────────────────────
        this.registrar_comando('dominio:leer_byte', (token, args) => {
            const medio  = args[0] ?? null;
            const fuente = args[1] ?? '';
            if (!medio) {
                Controlador._error("Falta el parámetro 'medio' para 'dominio:leer_byte'.");
                return null;
            }
            const comunicador = Controlador.comunicador(medio);
            if (!comunicador) return null;

            return comunicador.solicitar(fuente);
        }, null, true);

        // ─── dominio:escribir_byte ───────────────────────────
        this.registrar_comando('dominio:escribir_byte', (token, args) => {
            const medio   = args[0] ?? null;
            const byte    = args[1] ?? null;
            const destino = args[2] ?? '';
            if (!medio || byte === null) {
                Controlador._error("Faltan parámetros 'medio' o 'byte' para 'dominio:escribir_byte'.");
                return false;
            }
            const comunicador = Controlador.comunicador(medio);
            if (!comunicador) return false;

            // Convertir el byte en una Senal de una sola matriz
            const senal = Talamo.obtener().traducir_entrada(String.fromCharCode(byte));
            comunicador.enviar(destino, senal);
            return true;
        }, null, true);
    }

    // ══════════════════════════════════════════════════════
    // COMANDOS DEL VISUALIZADOR DE GRAFO (v1.5i.7i)
    // ══════════════════════════════════════════════════════

    /**
     * Registra los comandos del visualizador de grafo.
     *
     * Estos comandos exponen operaciones sobre la
     * superestructura sin revelar el token de seguridad.
     * El token queda encapsulado en los closures.
     *
     * @returns {void}
     */
    static _registrar_comandos_grafo() {
        // ─── grafo:resumen ─────────────────────────────
        this.registrar_comando('grafo:resumen', (token, args) => {
            const nodos = Controlador._grafo_cargar_estructura(token);
            const alcanzables = Controlador._grafo_bfs_desde_raices(nodos);
            const total = Object.keys(nodos).length;
            const huerfanos = total - Object.keys(alcanzables).length;

            const refs = {};
            for (const id in nodos) {
                const ady = nodos[id].ady;
                for (const enlace in ady) {
                    const destino = ady[enlace];
                    refs[destino] = (refs[destino] || 0) + 1;
                }
            }
            const top = Object.entries(refs)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 20);

            return {
                total,
                alcanzables: Object.keys(alcanzables).length,
                huerfanos,
                top_referencias: Object.fromEntries(top),
            };
        }, null, false);

        // ─── grafo:listar ──────────────────────────────
        this.registrar_comando('grafo:listar', (token, args) => {
            const opciones = (args && args[0]) || {};
            const filtro = String(opciones.filtro || 'todos');
            const filtro_enlace = String(opciones.enlace || '');
            const filtro_texto = String(opciones.texto || '');
            const offset = Math.max(0, parseInt(opciones.offset, 10) || 0);
            const limite = Math.max(1, Math.min(500, parseInt(opciones.limite, 10) || 50));

            const nodos = Controlador._grafo_cargar_estructura(token);
            const alcanzables = (filtro !== 'todos')
                ? Controlador._grafo_bfs_desde_raices(nodos)
                : {};

            const refs_count = {};
            for (const id in nodos) {
                const ady = nodos[id].ady;
                for (const enlace in ady) {
                    const destino = ady[enlace];
                    refs_count[destino] = (refs_count[destino] || 0) + 1;
                }
            }

            const resultados = [];
            for (const id in nodos) {
                const info = nodos[id];
                if (filtro === 'huerfanos' && alcanzables[id]) continue;
                if (filtro === 'alcanzables' && !alcanzables[id]) continue;
                if (filtro_enlace !== '' && !(filtro_enlace in info.ady)) continue;
                if (filtro_texto !== '' && String(info.dato).toLowerCase().indexOf(filtro_texto.toLowerCase()) === -1) continue;

                resultados.push({
                    id: id,
                    dato: String(info.dato).slice(0, 100),
                    es_especial: isNaN(Number(id)),
                    n_adyacentes: Object.keys(info.ady).length,
                    n_referencias: refs_count[id] || 0,
                    tipo: Controlador._grafo_inferir_tipo(id, info.ady),
                });
            }

            return {
                total: resultados.length,
                offset: offset,
                limite: limite,
                nodos: resultados.slice(offset, offset + limite),
            };
        }, null, false);

        // ─── grafo:nodo ────────────────────────────────
        this.registrar_comando('grafo:nodo', (token, args) => {
            const id = String((args && args[0]) || '');
            if (id === '') return null;

            const nodo = Nodo.nodo_por_id(id);
            if (!nodo) return null;

            const adyacentes = [];
            const ady = nodo.adyacentes();
            if (ady) {
                for (const [enlace, destino] of ady) {
                    adyacentes.push({
                        enlace: String(enlace),
                        id_destino: destino.id(),
                        dato_destino: String(destino.dato() || '').slice(0, 80),
                    });
                }
            }

            const referencias = [];
            Nodo.por_cada_nodo_ejecutar(token, (otro) => {
                const ady2 = otro.adyacentes();
                if (!ady2) return;
                for (const [enlace, destino] of ady2) {
                    if (destino.id() === id) {
                        referencias.push({
                            id_origen: otro.id(),
                            enlace: String(enlace),
                            dato_origen: String(otro.dato() || '').slice(0, 80),
                        });
                    }
                }
            }, null);

            return {
                id: id,
                dato: String(nodo.dato() || ''),
                es_especial: isNaN(Number(id)),
                adyacentes: adyacentes,
                referencias: referencias,
            };
        }, null, false);

        // ─── grafo:eliminar_huerfanos ──────────────────
        //
        // Elimina todos los nodos no alcanzables desde las
        // raíces (IDs especiales) del grafo. Solo lo llama el
        // enrutador del piloto (admin o soporte).
        //
        // No lleva chequeo de es_pruebas: se usa en producción
        // para limpiar la acumulación de nodos basura. El
        // enrutador es quien decide cuándo exponerlo.
        this.registrar_comando('grafo:eliminar_huerfanos', (token, args) => {
            const nodos = Controlador._grafo_cargar_estructura(token);
            const alcanzables = Controlador._grafo_bfs_desde_raices(nodos);

            const huerfanos = {};
            for (const id in nodos) {
                if (!alcanzables[id]) huerfanos[id] = true;
            }

            const total_huerfanos = Object.keys(huerfanos).length;
            if (total_huerfanos === 0) {
                return { eliminados: 0, total_huerfanos: 0 };
            }

            for (const id in huerfanos) {
                const nodo = Nodo.nodo_por_id(id);
                if (!nodo) continue;
                const ady = nodo.adyacentes();
                if (!ady) continue;
                for (const [enlace, destino] of ady) {
                    if (huerfanos[destino.id()]) {
                        nodo.eliminar_adyacente(String(enlace));
                    }
                }
            }

            let eliminados = 0;
            for (const id in huerfanos) {
                const nodo = Nodo.nodo_por_id(id);
                if (nodo && Nodo.eliminar(nodo)) eliminados++;
            }

            return {
                eliminados: eliminados,
                total_huerfanos: total_huerfanos,
            };
        }, null, false);
    }

    /**
     * Carga la estructura básica de la superestructura en memoria.
     *
     * Devuelve { id: { dato, ady: { enlace: id_destino } } }.
     *
     * @param {string} token
     * @returns {Object}
     */
    static _grafo_cargar_estructura(token) {
        const nodos = {};
        Nodo.por_cada_nodo_ejecutar(token, (nodo) => {
            const ady = {};
            const adyacentes = nodo.adyacentes();
            if (adyacentes) {
                for (const [enlace, destino] of adyacentes) {
                    ady[String(enlace)] = destino.id();
                }
            }
            nodos[nodo.id()] = {
                dato: String(nodo.dato() || ''),
                ady: ady,
            };
        }, null);
        return nodos;
    }

    /**
     * BFS desde los nodos especiales (raíces del grafo).
     *
     * @param {Object} nodos
     * @returns {Object} { id: true }
     */
    static _grafo_bfs_desde_raices(nodos) {
        const alcanzables = {};
        const cola = [];
        for (const id in nodos) {
            if (isNaN(Number(id))) {
                alcanzables[id] = true;
                cola.push(id);
            }
        }
        while (cola.length > 0) {
            const id = cola.shift();
            if (!nodos[id]) continue;
            const ady = nodos[id].ady;
            for (const enlace in ady) {
                const destino = ady[enlace];
                if (!alcanzables[destino]) {
                    alcanzables[destino] = true;
                    cola.push(destino);
                }
            }
        }
        return alcanzables;
    }

    /**
     * Infiere un tipo legible para un nodo a partir de sus enlaces.
     * Heurística. Se puede refinar con el tiempo.
     *
     * @param {string} id
     * @param {Object} ady
     * @returns {string}
     */
    static _grafo_inferir_tipo(id, ady) {
        if (id === 'usuarios') return 'Contenedor raíz: usuarios';
        if (id === 'sesiones') return 'Contenedor raíz: sesiones';
        if (isNaN(Number(id))) return 'Especial';

        if (ady.nivel) return 'Usuario';
        if (ady.apellido && ady.nombres) return 'Pasajero';
        if (ady.origen && ady.destino && ady.micros) return 'Viaje';
        if (ady.vehiculo_copia && ady.monto) return 'Micro';
        if (ady.total && ady.comprador) return 'Venta';
        if (ady.numero && ady.estado) return 'Cupón';
        if (ady.detalle_terminales && ady.detalle_cupones) return 'Rendición';
        if (ady.monto_efectivo && ady.monto_banco) return 'Liquidación';
        if (ady.id_venta && ady.motivo) return 'Cancelación';
        if (ady.usuario && ady.creado_en) return 'Sesión';
        if (ady.asientos && ady.foto) return 'Vehículo/Copia';
        if (ady.asientos) return 'Vehículo';
        if (ady.vehiculos) return 'Empresa';
        if (ady.filas && ady.columnas) return 'Piso';
        if (ady.fila && ady.columna) return 'Asiento';
        return '?';
    }

    // ══════════════════════════════════════════════════════
    // INTERFAZ DOMINIOS
    // ══════════════════════════════════════════════════════

    /**
     * Dominio actualmente activo (null = modo global).
     * @type {string|null}
     * @private
     * @since 1.3.9
     */
    static _dominio_actual = null;
    
    /**
     * Activa el modo exclusivo para un dominio.
     *
     * Mientras un dominio está activo, el péndulo solo itera sobre fases
     * cuyo nombre comience por el prefijo del dominio (ej. 'html:').
     *
     * @param {string} dominio
     * @returns {void}
     * @since 1.3.9
     */
    static _activar_dominio(dominio) {
        this._dominio_actual = dominio;
        this._indice_fase_actual = null;
    }

    /**
     * Desactiva el modo exclusivo de dominio.
     *
     * El péndulo vuelve a considerar todas las fases activas.
     *
     * @returns {void}
     * @since 1.3.9
     */
    static _desactivar_dominio() {
        this._dominio_actual = null;
        this._indice_fase_actual = null;
    } 

    /**
     * Deshace el último comando ejecutado por el motor.
     *
     * Solo puede ejecutarse cuando el motor está en estado DETENIDO.
     * @returns {*}
     * @since 1.3.9
     */
    static deshacer_motor() {
        if (this._estado_motor !== this.MOTOR_DETENIDO) {
            this._alerta('El motor debe estar DETENIDO para deshacer.');
            return null;
        }
        return this.deshacer_ultimo();
    }
     /**
     * Devuelve el siguiente dominio con comandos pendientes (excluyendo el tálamo).
     *
     * @param {string|null} dominio_actual Dominio actual.
     * @return {string|null} Siguiente dominio, o null si no hay.
     * @since 1.3.9
     */   
    static _siguiente_dominio(dominio_actual) {
        const dominios = [];
        for (const fase in this._colas_comandos) {
            if (this._colas_comandos[fase].length === 0) continue;
            const partes = fase.split(':');
            const dom = partes.length > 1 ? partes[0] : 'talamo';
            if (dom !== 'talamo' && !dominios.includes(dom)) {
                dominios.push(dom);
            }
        }
        if (dominios.length === 0) return null;
        dominios.sort();
        if (dominio_actual === null || !dominios.includes(dominio_actual)) return dominios[0];
        const indice = dominios.indexOf(dominio_actual);
        return dominios[(indice + 1) % dominios.length];
    }
    // ═══════════════════════════════════════════════════════════
    // INICIALIZAR
    // ═══════════════════════════════════════════════════════════ 
    /** @type {boolean} */
    static inicializo = false;

    /**
     * Inicializa el sistema registrando las clases principales,
     * procesando los comandos y comunicadores pendientes desde
     * {@link RegistroGlobal}, y finalmente se inyecta en dicho registro
     * para que los comandos puedan acceder a los servicios del Controlador.
     *
     * @returns {Promise<void>}
     * @since 1.3.0
     * @version 1.4.6 (inicialización del tálamo y procesadores)
     */
    static async inicializar() {
        if (!this.inicializo) {
            // ─── Registro del controlador ante Nodo ────────────
            Nodo.registrar_controlador(Controlador);

            // ─── Implementaciones de persistencia ──────────────
            Controlador.registrar_implementacion("IndexedDB", PerdurarSuperestructuraStringIndexedDB);
            Controlador.registrar_implementacion("IndexedDB64", PerdurarSuperestructuraStringIndexedDB64);
            Controlador.registrar_implementacion("JSON", PerdurarSuperestructuraStringJSON);
            Controlador.registrar_implementacion("XML", PerdurarSuperestructuraStringXML);
            Controlador.registrar_implementacion("EIndexedDB", PerdurarSuperestructuraElectricosStringIndexedDB);
            Controlador.establecer_metodo("EIndexedDB");

            // ─── Inicializar cache de primos ─────────────────────
            NodoNumerico.inicializar_cache_primos();

            // ─── Inicializar mapeo byte ↔ matriz ─────────────────
            //MapeoBytesMatrices.inicializar();

            // ─── Inicializar tálamo (fase 0 con 256 primos) ───
          /*  const proc_talamo_entrada = Controlador.procesador('Talamo', 'entrada');
            for (let byte = 0; byte < 256; byte++) {
                const matriz = MapeoBytesMatrices.byte_a_matriz(byte);
                if (matriz) {
                    const nodo = NodoNumerico.crear_primo(NodoNumerico.primos_conocidos[byte]);
                    proc_talamo_entrada._patron(nodo, 0);
                }
            }*/

            // ─── Procesar comandos pendientes desde RegistroGlobal ────
            for (const entrada of RegistroGlobal.comandos_pendientes) {
                if (entrada.clase) {
                    this.registrar_comando_desde_clase(entrada.clase);
                } else if (entrada.nombre) {
                    this.registrar_comando(entrada.nombre, entrada.manejador);
                }
            }

            // ─── Procesar comunicadores pendientes ─────────────
            for (const entrada of RegistroGlobal.comunicadores_pendientes) {
                this.registrar_comunicador_desde_clase(entrada.clase);
            }

            // ─── Limpiar pendientes e inyectar Controlador ─────
            RegistroGlobal.limpiar();
            RegistroGlobal._controlador(this); // `this` es la clase Controlador

            // ─── Inicializar reloj astronómico con ubicación ───
            try {
                const coords = await Entorno.obtener_coordenadas();
                this._reloj = new RelojAstronomico(coords.latitud, coords.longitud);

                // Escuchar cambios de ubicación (solo en navegador)
                Entorno.escuchar_cambios((lat, lon) => {
                    this._actualizar_ubicacion(lat, lon);
                });
            } catch (error) {
                console.warn('No se pudo obtener la ubicación. Usando coordenadas predefinidas.');
                this._reloj = new RelojAstronomico(
                    Conf.LATITUD_PREDETERMINADA,
                    Conf.LONGITUD_PREDETERMINADA
                );
            }

            // ─── Registrar comandos genéricos de comunicación ──
            this._registrar_comandos_comunicacion();
            // ─── Registrar comandos genéricos de dominio ──
            this._registrar_comandos_dominio();
            // ─── Comandos del visualizador de grafo ────────
            this._registrar_comandos_grafo();
            this.inicializo = true;
        }
    }

}

// Ejecutar inicialización global
Controlador.inicializar();
export { Controlador };