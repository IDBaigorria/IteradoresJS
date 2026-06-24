import { Conf, Entorno } from '../Configuracion/index.js';
import { Objeto } from "../Nucleo/index.js";
import { Nodo } from '../Nodos/Nodo.js';
// Si se necesita NodoElectrico en inicializar, importarlo:
// import { NodoElectrico } from '../Nodos/NodoElectrico.js';
import {
    PerdurarSuperestructura,
    PerdurarSuperestructuraStringIndexedDB,
    PerdurarSuperestructuraStringJSON,
    PerdurarSuperestructuraStringXML,
    PerdurarSuperestructuraElectricosStringIndexedDB
} from './PerdurarSuperestructura/index.js';
import { Comandos, Comunicadores, VectorGravitacional, Motor } from './interfaces/index.js'; // unificado
import { Comando } from '../Comandos/index.js';
import { RegistroGlobal } from './RegistroGlobal.js';
import { mezclar_clase_con_interfaces } from "../miscelaneas/mixin.js";
import { RelojAstronomico } from '../Tiempo/RelojAstronomico.js';
// console.log("Controlador");  

/**
 * Clase Controlador que gestiona la persistencia de la superestructura.
 * 
 * Permite elegir el método de guardado (sql, json, texto, etc.) en tiempo de ejecución.
 * @class
 * @extends Objeto
 * @implements {Controlador.PerdurarSuperestructura.PerdurarSuperestructura}
 * @implements {Controlador.Interfaces.Comandos}
 * @implements {Controlador.Interfaces.Comunicadores}
 * @implements {Controlador.Interfaces.VectorGravitacional}
 * @memberof Controlador
 * @since 1.2.0
 */
class Controlador extends mezclar_clase_con_interfaces(Objeto, PerdurarSuperestructura, Comandos, Comunicadores, VectorGravitacional, Motor) {
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
     * - En **consola** → {@link SalidaDepuracionConsola} (`salida_depuracion_consola`).
     * - En **navegador** → {@link SalidaDepuracionHTML} (`salida_depuracion_html`).
     *
     * En cualquier otro caso, busca el comunicador en el mapa interno y verifica
     * que el usuario actual tenga permiso para utilizarlo mediante
     * {@link Controlador.tiene_permiso_comunicador}.
     *
     * Si el comunicador no existe o el usuario no tiene permiso, retorna `null`
     * y registra un error.
     *
     * @param {string} [nombre='predeterminado'] Nombre del comunicador
     *     (ej. `'archivo'`, `'http'`). Si se omite o es `'predeterminado'`,
     *     se usa la salida estándar según el entorno.
     *
     * @returns {Comunicador|null} La instancia del comunicador,
     *                             o `null` si no está disponible.
     *
     * @example
     * // Obtener la salida estándar (consola o HTML según Entorno)
     * const salida = Controlador.comunicador();
     * salida.enviar('', 'Hola mundo');
     *
     * // Obtener un comunicador específico
     * const http = Controlador.comunicador('http');
     * if (http) {
     *     http.enviar('https://api.example.com', datos);
     * }
     *
     * @see SalidaDepuracionHTML
     * @see SalidaDepuracionConsola
     * @since 1.3.3
     */
    static comunicador(nombre = 'predeterminado') {
        if (nombre === 'predeterminado') {
            nombre = Entorno.es_consola() ? 'salida_depuracion_consola' : 'salida_depuracion_html';
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
     * Obtiene el comunicador predeterminado ({@link SalidaDepuracionHTML}
     * o {@link SalidaDepuracionConsola}) y envía el mensaje a través de él.
     *
     * Es el equivalente a `console.log`, pero adaptado al tipo de salida
     * definido en {@link Configuracion.Entorno}.
     *
     * @param {string} mensaje Texto a escribir en la salida estándar.
     *
     * @returns {void}
     *
     * @example
     * Controlador.escribir_salida("Operación completada.");
     *
     * @since 1.3.3
     */
    static escribir_salida(mensaje) {
        const salida = Controlador.comunicador();   // predeterminado
        if (salida) {
            salida.enviar('', mensaje);
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
     * @version 1.3.4
     * @private
     */
    static _registrar_comandos_comunicacion() {
        // ─── comunicación:leer ───────────────────────────────
        this.registrar_comando('comunicacion:leer', (token, args) => {
            const medio   = args[0] ?? null;
            const destino = args[1] ?? '';
            if (!medio) {
                Controlador._error("Falta el parámetro 'medio' para 'comunicacion:leer'.");
                return null;
            }
            const comunicador = Controlador.comunicador(medio);
            if (!comunicador) return null;
            return comunicador.solicitar(destino);
        }, null, false);

        // ─── comunicación:escribir ────────────────────────────
        this.registrar_comando('comunicacion:escribir', (token, args) => {
            const medio   = args[0] ?? null;
            const mensaje = args[1] ?? '';
            const destino = args[2] ?? '';
            if (!medio) {
                Controlador._error("Falta el parámetro 'medio' para 'comunicacion:escribir'.");
                return false;
            }
            const comunicador = Controlador.comunicador(medio);
            if (!comunicador) return false;
            comunicador.enviar(destino, mensaje);
            return true;
        }, null, false);

        // ─── comunicación:preguntar ───────────────────────────
        this.registrar_comando('comunicacion:preguntar', (token, args) => {
            const medio   = args[0] ?? 'salida_depuracion_consola';
            const mensaje = args[1] ?? '';
            const comunicador = Controlador.comunicador(medio);
            if (!comunicador) return null;
            if (medio === 'salida_depuracion_consola') {
                return prompt(mensaje);
            }
            return comunicador.solicitar('', mensaje);
        }, null, false);

        // ─── comunicación:eliminar ────────────────────────────
        this.registrar_comando('comunicacion:eliminar', (token, args) => {
            const medio   = args[0] ?? null;
            const destino = args[1] ?? '';
            if (!medio) {
                Controlador._error("Falta el parámetro 'medio' para 'comunicacion:eliminar'.");
                return false;
            }
            const comunicador = Controlador.comunicador(medio);
            if (!comunicador) return false;
            comunicador.enviar(destino, null, { accion: 'eliminar' });
            return true;
        }, null, false);

        // ─── comunicación:listar ──────────────────────────────
        this.registrar_comando('comunicacion:listar', (token, args) => {
            const medio   = args[0] ?? null;
            const destino = args[1] ?? '.';
            if (!medio) {
                Controlador._error("Falta el parámetro 'medio' para 'comunicacion:listar'.");
                return null;
            }
            const comunicador = Controlador.comunicador(medio);
            if (!comunicador) return null;
            return comunicador.solicitar(destino, null, { accion: 'listar' });
        }, null, false);

        // ─── comunicación:escuchar ─────────────────────────────
        this.registrar_comando('comunicacion:escuchar', (token, args) => {
            const medio = args[0] ?? null;
            if (!medio) {
                Controlador._error("Falta el parámetro 'medio' para 'comunicacion:escuchar'.");
                return false;
            }
            const comunicador = Controlador.comunicador(medio);
            if (!comunicador) return false;
            comunicador.escuchar((mensaje) => {
                const salida = Controlador.comunicador();
                salida?.enviar('', `[${medio}] Recibido: ${JSON.stringify(mensaje)}`);
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
        if (this._estado_motor !== this.MOTOR_ACTIVO) {
            return;
        }

        let fase = this._indice_fase_actual;
        if (fase === null) {
            fase = this._pendulo(null);
            if (fase === null) return;
        }

        const quantum = Conf.MOTOR_QUANTUM;

        for (let i = 0; i < quantum; i++) {
            const comando = this._siguiente_comando_en_fase(fase);
            if (comando === null) break;
            const resultado = comando();
            if (resultado === 'PAUSAR_URGENTE') {
                this._pausar_urgente('Comando solicitó pausa urgente');
                return;
            }
        }

        this._indice_fase_actual = this._pendulo(fase);
    }

    // ═══════════════════════════════════════════════════════════
    // COLAS DE COMANDOS POR FASE (v1.3.8)
    // ═══════════════════════════════════════════════════════════

    /**
     * Colas de comandos pendientes, indexadas por identificador de fase.
     *
     * @type {Object<string, Function[]>}
     * @since 1.3.8
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
    static encolar_comando_en_fase(fase, comando) {
        if (!this._colas_comandos[fase]) {
            this._colas_comandos[fase] = [];
        }
        this._colas_comandos[fase].push(comando);
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
     * @version 1.3.8 (adaptado a colas dinámicas)
     * @private
     */
    static _pendulo(fase_actual) {
        const fases = Object.entries(this._colas_comandos)
            .filter(([_, cola]) => cola.length > 0)
            .map(([fase]) => fase);

        if (fases.length === 0) {
            return null;
        }

        fases.sort();

        if (fase_actual === null || !fases.includes(fase_actual)) {
            return fases[0];
        }

        const indice = fases.indexOf(fase_actual);
        return fases[(indice + 1) % fases.length];
    }

        /**
     * Registra los comandos genéricos de comunicación.
     *
     * Se invoca durante {@link inicializar} para que estén disponibles
     * tanto para programadores como para el futuro sistema de aprendizaje.
     *
     * @returns {void}
     * @since 1.3.3
     * @version 1.3.4
     * @private
     */
    static _registrar_comandos_dominio() {
        // ─── dominio:leer_byte ──────────────────────────────
        this.registrar_comando('dominio:leer_byte', (token, args) => {
            // TODO: implementar cuando exista la compuerta
            const ctrl = RegistroGlobal.controlador();
            ctrl?.escribir_salida("[placeholder] dominio:leer_byte ejecutado.");
            return true;
        }, null, true);

        // ─── dominio:escribir_byte ───────────────────────────
        this.registrar_comando('dominio:escribir_byte', (token, args) => {
            // TODO: implementar cuando exista la compuerta
            const ctrl = RegistroGlobal.controlador();
            ctrl?.escribir_salida("[placeholder] dominio:escribir_byte ejecutado.");
            return true;
        }, null, true);
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
     * @version 1.3.4
     */
    static async inicializar() {
        if (!this.inicializo) {
            // ─── Registro del controlador ante Nodo ────────────
            Nodo.registrar_controlador(Controlador);

            // ─── Implementaciones de persistencia ──────────────
            Controlador.registrar_implementacion("IndexedDB", PerdurarSuperestructuraStringIndexedDB);
            Controlador.registrar_implementacion("JSON", PerdurarSuperestructuraStringJSON);
            Controlador.registrar_implementacion("XML", PerdurarSuperestructuraStringXML);
            Controlador.registrar_implementacion("EIndexedDB", PerdurarSuperestructuraElectricosStringIndexedDB);
            Controlador.establecer_metodo("EIndexedDB");

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
            this.inicializo = true;
        }
    }

}

// Ejecutar inicialización global
Controlador.inicializar();
export { Controlador };