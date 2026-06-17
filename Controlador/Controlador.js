import { Conf, Entorno } from '../Configuracion/index.js';
import { Objeto } from "../Nucleo/index.js";
import { Nodo } from '../Nodos/Nodo.js';
import{PerdurarSuperestructura, PerdurarSuperestructuraStringIndexedDB, PerdurarSuperestructuraStringJSON, PerdurarSuperestructuraStringXML, PerdurarSuperestructuraElectricosStringIndexedDB} from './PerdurarSuperestructura/index.js';
import { Comunicadores } from './interfaces/index.js';  // ← se mantiene (interfaz)
// ❌ ELIMINADO: import{Comunicador} from '../Comunicadores/Comunicador.js';
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
class Controlador extends mezclar_clase_con_interfaces(Objeto, PerdurarSuperestructura, Comandos, Comunicadores) {
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

        // Si hay nodos, limpiamos el contenedor (por si tenía un mensaje anterior)
       // contenedor.innerHTML = '';

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
     * Además, valida que los nombres de los parámetros definidos por el comando
     * no colisionen con las {@link Configuracion.Conf.PALABRAS_RESERVADAS_COMANDOS
     * palabras reservadas}. Si se detecta una colisión, el registro se rechaza
     * y se emite un error.
     *
     * @param {Comando} comando Instancia del comando.
     * @returns {boolean}
     * @since 1.3.1
     * @version 1.3.2
     */
    static registrar_comando_desde_instancia(comando) {
        const nombre = comando.constructor.nombre();
        const solo_desarrollo = comando.constructor.solo_desarrollo();
        const clase = comando.constructor;

        // Verificar palabras reservadas
        if (!Controlador._validar_parametros_reservados(clase)) {
            return false;
        }

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
     * Además, valida que los nombres de los parámetros definidos por el comando
     * no colisionen con las {@link Configuracion.Conf.PALABRAS_RESERVADAS_COMANDOS
     * palabras reservadas}. Si se detecta una colisión, el registro se rechaza
     * y se emite un error.
     * 
     * @param {typeof Comando} clase Clase del comando.
     * @returns {boolean}
     * @since 1.3.1
     * @version 1.3.2
     */
    static registrar_comando_desde_clase(clase) {
        if (typeof clase.nombre !== 'function' || typeof clase.solo_desarrollo !== 'function') {
            Controlador._error('La clase no cumple con la interfaz Comando.');
            return false;
        }

        // Verificar palabras reservadas
        if (!Controlador._validar_parametros_reservados(clase)) {
            return false;
        }

        const instancia = new clase();
        return this.registrar_comando_desde_instancia(instancia);
    }

    /**
     * Verifica que los parámetros del comando no usen palabras reservadas.
     *
     * @param {typeof Comando} clase Clase del comando.
     * @returns {boolean}
     * @private
     */
    static _validar_parametros_reservados(clase) {
        if (typeof clase.parametros !== 'function') {
            return true;
        }

        const reservadas = Conf.PALABRAS_RESERVADAS_COMANDOS;
        const parametros = clase.parametros();
        for (const param of parametros) {
            if (reservadas.includes(param.nombre)) {
                Controlador._error(
                    `El comando '${clase.nombre()}' usa una palabra reservada como parámetro: '${param.nombre}'.`
                );
                return false;
            }
        }
        return true;
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
     * Este método es el punto central de ejecución del sistema de comandos.
     * Se encarga de localizar el manejador asociado al comando, verificar
     * permisos, parsear y validar argumentos, mostrar ayuda cuando se solicita
     * y, finalmente, invocar la lógica del comando.
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
     * 3. **Detección de solicitud de ayuda:** Examina cada argumento en
     *    busca de las palabras reservadas definidas en
     *    {@link Configuracion.Conf.PALABRAS_RESERVADAS_COMANDOS}
     *    (`man`, `help`, `h`). Si encuentra alguna, invoca
     *    {@link Controlador._mostrar_ayuda} con la clase del comando y
     *    retorna `true` sin ejecutar el comando.
     *
     * 4. **Parseo y validación de argumentos:** Si el comando tiene una clase
     *    asociada y ésta implementa el método {@link Comando.parametros},
     *    se obtiene la definición de parámetros y se invoca
     *    {@link Controlador._parsear_y_validar_args} para convertir los
     *    argumentos crudos en una estructura normalizada. Si hay errores
     *    de validación (flags/opciones desconocidas, parámetros obligatorios
     *    faltantes), se registran con {@link Controlador._error}, se muestra
     *    la ayuda y se retorna `null`.
     *
     * 5. **Ejecución del manejador:** Invoca el manejador del comando con el
     *    token de seguridad interno y los argumentos parseados (o crudos, si
     *    no hay definición de parámetros).
     *
     * 6. **Registro de reversa:** Si el comando tiene definida una función de
     *    reversa (proporcionada durante el registro), la almacena en la pila
     *    de historial para que pueda ser deshecha posteriormente con
     *    {@link Controlador.deshacer_ultimo}.
     *
     * **Solicitudes de ayuda:**
     * Las palabras reservadas (`--man`, `--help`, `-h`) están centralizadas
     * en {@link Configuracion.Conf.PALABRAS_RESERVADAS_COMANDOS}.
     * Al detectar cualquiera de ellas, el sistema muestra automáticamente
     * la ayuda generada a partir de {@link Comando.descripcion},
     * {@link Comando.parametros} y {@link Comando.ejemplos}, adaptando
     * el formato al entorno (consola o HTML). La ejecución del comando **no**
     * se realiza.
     *
     * **Validación de argumentos:**
     * Si el comando define parámetros, el método
     * {@link Controlador._parsear_y_validar_args} compara cada argumento
     * recibido contra la definición. Los argumentos que no coinciden con
     * ningún parámetro declarado se registran como error y provocan la
     * visualización de la ayuda.
     *
     * ⚠️ **Importante para desarrolladores de comandos:**
     * No utilice ninguna de las palabras reservadas como nombre de un
     * parámetro en {@link Comando.parametros}. El sistema rechazará el
     * registro de comandos que infrinjan esta regla mediante
     * {@link Controlador.registrar_comando_desde_instancia} o
     * {@link Controlador.registrar_comando_desde_clase}.
     *
     * @param {string} nombre Nombre del comando (ej. 'depuracion:imprimir').
     * @param {...*}   args   Argumentos para el manejador (crudos, serán parseados).
     *
     * @returns {*} El resultado devuelto por el manejador del comando, o
     *              `null` si el comando no existe, no hay permiso o los
     *              argumentos son inválidos. Retorna `true` si se mostró
     *              la ayuda.
     *
     * @example
     * // Ejecución básica
     * Controlador.ejecutar_comando('depuracion:imprimir');
     *
     * // Con argumentos
     * Controlador.ejecutar_comando('depuracion:imprimir', '--errores');
     *
     * // Solicitar ayuda
     * Controlador.ejecutar_comando('depuracion:imprimir', '--man');
     *
     * @see Controlador.registrar_comando
     * @see Controlador.tiene_permiso
     * @see Controlador.deshacer_ultimo
     * @see Controlador._mostrar_ayuda
     * @see Controlador._parsear_y_validar_args
     * @see Configuracion.Conf.PALABRAS_RESERVADAS_COMANDOS
     * @since 1.3.1
     * @version 1.3.2
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

        // Detectar solicitud de ayuda
        const ayuda_flags = Conf.PALABRAS_RESERVADAS_COMANDOS;
        for (const arg of args) {
            const sin_guiones = String(arg).replace(/^-+/, '');
            if (ayuda_flags.includes(sin_guiones)) {
                if (clase !== null) {
                    Controlador._mostrar_ayuda(clase);
                } else {
                    console.log(`Comando '${nombre}' (sin ayuda disponible).`);
                }
                return true;
            }
        }

        // Parsear y validar argumentos solo si el comando tiene definición
        let args_parseados;
        if (clase && typeof clase.parametros === 'function') {
            const definicion = clase.parametros();
            args_parseados = Controlador._parsear_y_validar_args(definicion, args, clase);
            if (args_parseados === null) {
                return null;
            }
        } else {
            // Sin definición: pasar los argumentos tal cual
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
     * @param {Object[]} definicion Definición de parámetros.
     * @param {Array}    args       Argumentos crudos.
     * @param {typeof Comando} clase Clase del comando (para mostrar ayuda).
     * @returns {Object|null} Estructura con 'posicionales', 'banderas' y 'opciones',
     *                        o `null` si hay errores.
     * @private
     * @since 1.3.2
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
            Controlador._mostrar_ayuda(clase);
            return null;
        }

        return { posicionales, banderas, opciones };
    }

    /**
     * Muestra la ayuda de un comando en el formato adecuado según el entorno.
     *
     * La ayuda se genera dinámicamente consultando los métodos
     * {@link Comando.descripcion}, {@link Comando.parametros} y
     * {@link Comando.ejemplos} de la clase del comando. Si alguno de estos
     * métodos no está definido, se omite la sección correspondiente.
     *
     * @param {typeof Comando} clase Clase del comando.
     * @private
     * @since 1.3.2
     */
    static _mostrar_ayuda(clase) {
        const nombre = clase.nombre();
        let ayuda = `Comando: ${nombre}\n`;

        // Descripción (opcional)
        if (typeof clase.descripcion === 'function') {
            ayuda += clase.descripcion() + '\n';
        }

        // Parámetros (opcionales)
        if (typeof clase.parametros === 'function') {
            const parametros = clase.parametros();
            if (parametros.length > 0) {
                ayuda += '\nParámetros:\n';
                for (const p of parametros) {
                    const obligatorio = p.obligatorio ? ' (obligatorio)' : '';
                    ayuda += `  --${p.nombre} [${p.tipo}]${obligatorio}: ${p.descripcion}\n`;
                }
            }
        }

        // Ejemplos (opcionales)
        if (typeof clase.ejemplos === 'function') {
            const ejemplos = clase.ejemplos();
            if (ejemplos.length > 0) {
                ayuda += '\nEjemplos:\n';
                for (const ej of ejemplos) {
                    ayuda += `  ${ej}\n`;
                }
            }
        }

        // Salida según entorno
        if (Entorno.es_consola()) {
            console.log(ayuda);
        } else {
            const pre = document.createElement('pre');
            pre.textContent = ayuda;
            document.body.appendChild(pre);
        }
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
     * Estructura:
     * {
     *     'nombre_comunicador': {
     *         instancia: Comunicador,   // Instancia única del comunicador
     *         clase: typeof Comunicador // Clase del comunicador
     *     },
     *     ...
     * }
     *
     * @type {Object<string, {instancia: Comunicador, clase: typeof Comunicador}>}
     */
    static comunicadores = {};

    /**
     * Lista de comunicadores pendientes de registro.
     *
     * Se pobla mediante {@link encolar_comunicador} durante la carga
     * de módulos. Al finalizar la inicialización, {@link cargar_comunicadores_pendientes}
     * los procesa y registra.
     *
     * @type {Array<{clase?: typeof Comunicador, instancia?: Comunicador}>}
     */
    static registro_comunicadores_pendiente = [];

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
     * Encola un comunicador para registro diferido o inmediato.
     *
     * Acepta tanto una clase como una instancia que cumplan el contrato
     * de comunicador (duck typing). Si el Controlador ya está inicializado,
     * el registro es inmediato; en caso contrario, se guarda en la lista
     * de pendientes.
     *
     * @param {Function|Object} comunicador Clase o instancia.
     * @returns {void}
     * @since 1.3.3
     */
    static encolar_comunicador(comunicador) {
        if (this.inicializo) {
            // Registro inmediato
            if (typeof comunicador === 'function') {
                this.registrar_comunicador_desde_clase(comunicador);
            } else {
                this.registrar_comunicador_desde_instancia(comunicador);
            }
            return;
        }

        // Registro diferido
        if (typeof comunicador === 'function') {
            this.registro_comunicadores_pendiente.push({ clase: comunicador });
        } else {
            this.registro_comunicadores_pendiente.push({ instancia: comunicador });
        }
    }

    /**
     * Procesa la lista de comunicadores autoencolados y los registra.
     * ... (documentación sin cambios) ...
     */
    static cargar_comunicadores_pendientes() {
        let contador = 0;

        for (const entrada of this.registro_comunicadores_pendiente) {
            let exito = false;

            if (entrada.instancia) {
                exito = this.registrar_comunicador_desde_instancia(entrada.instancia);
            } else if (entrada.clase) {
                exito = this.registrar_comunicador_desde_clase(entrada.clase);
            }

            if (exito) {
                contador++;
            }
        }

        this.registro_comunicadores_pendiente = [];
        return contador;
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
     */
    static _registrar_comandos_comunicacion() {
        // ─── comunicación:leer ───────────────────────────────
        this.registrar_comando('comunicacion:leer', (token, args) => {
            const medio   = Array.isArray(args) ? args[0] : (args.opciones?.medio || args.posicionales?.[0]);
            const destino = Array.isArray(args) ? args[1] || '' : (args.opciones?.destino || args.posicionales?.[1] || '');
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
            const destino = args[2] ?? '';   // predeterminado: cadena vacía
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
            const medio   = Array.isArray(args) ? args[0] || 'salida_depuracion_consola' : (args.opciones?.medio || args.posicionales?.[0] || 'salida_depuracion_consola');
            const mensaje = Array.isArray(args) ? args[1] || '' : (args.opciones?.mensaje || args.posicionales?.[1] || '');
            const comunicador = Controlador.comunicador(medio);
            if (!comunicador) return null;
            if (medio === 'salida_depuracion_consola') {
                return prompt(mensaje);
            }
            return comunicador.solicitar('', mensaje);
        }, null, false);

        // ─── comunicación:eliminar ────────────────────────────
        this.registrar_comando('comunicacion:eliminar', (token, args) => {
            const medio   = Array.isArray(args) ? args[0] : (args.opciones?.medio || args.posicionales?.[0]);
            const destino = Array.isArray(args) ? args[1] || '' : (args.opciones?.destino || args.posicionales?.[1] || '');
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
            const medio   = Array.isArray(args) ? args[0] : (args.opciones?.medio || args.posicionales?.[0]);
            const destino = Array.isArray(args) ? args[1] || '.' : (args.opciones?.destino || args.posicionales?.[1] || '.');
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
            const medio = Array.isArray(args) ? args[0] : (args.opciones?.medio || args.posicionales?.[0]);
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

        // ─── Alias archivo:leer ───────────────────────────────
        this.registrar_comando('archivo:leer', (token, args) => {
            const destino = Array.isArray(args) ? args[0] || '' : (args.posicionales?.[0] || '');
            return Controlador.ejecutar_comando('comunicacion:leer', 'archivo', destino);
        }, null, false);

        // ─── Alias archivo:escribir ────────────────────────────
        this.registrar_comando('archivo:escribir', (token, args) => {
            const destino = Array.isArray(args) ? args[0] || '' : (args.opciones?.destino || '');
            const mensaje = Array.isArray(args) ? args[1] || '' : (args.opciones?.mensaje || '');
            return Controlador.ejecutar_comando('comunicacion:escribir', 'archivo', destino, mensaje);
        }, null, false);

        // ─── Alias archivo:eliminar ────────────────────────────
        this.registrar_comando('archivo:eliminar', (token, args) => {
            const destino = Array.isArray(args) ? args[0] || '' : (args.posicionales?.[0] || '');
            return Controlador.ejecutar_comando('comunicacion:eliminar', 'archivo', destino);
        }, null, false);

        // ─── Alias archivo:listar ─────────────────────────────
        this.registrar_comando('archivo:listar', (token, args) => {
            const destino = Array.isArray(args) ? args[0] || '.' : (args.posicionales?.[0] || '.');
            return Controlador.ejecutar_comando('comunicacion:listar', 'archivo', destino);
        }, null, false);
    }

    /** @type {boolean} */
    static inicializo = false;

    /**
     * Inicializa el sistema registrando las clases principales.
     * Solo se ejecuta una vez.
     * 
     * @returns {Promise<void>}
     */
    static async inicializar() {
        if (!this.inicializo) {
            Nodo.registrar_controlador(Controlador);
            Controlador.registrar_implementacion("IndexedDB", PerdurarSuperestructuraStringIndexedDB);
            Controlador.registrar_implementacion("JSON", PerdurarSuperestructuraStringJSON);
            Controlador.registrar_implementacion("XML", PerdurarSuperestructuraStringXML);
            Controlador.registrar_implementacion("EIndexedDB", PerdurarSuperestructuraElectricosStringIndexedDB);
            Controlador.establecer_metodo("EIndexedDB");

            // ──────────────────────────────────────────────
            // Carga y registro de comandos (siempre)
            // ──────────────────────────────────────────────
            this.cargar_comandos_pendientes();

            // Procesar y registrar los comunicadores autoencolados
            this.cargar_comunicadores_pendientes();

            // Registrar los comandos genéricos de comunicación
            this._registrar_comandos_comunicacion();


            console.log('✅ Comandos registrados:', Object.keys(this.comandos));

            this.inicializo = true;
        }
    }



}

// Ejecutar inicialización global
Controlador.inicializar();
export {Controlador}