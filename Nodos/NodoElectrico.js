import { Objeto } from "../Nucleo/Objeto.js";
import { Nodo } from "../Nodos/index.js";
import { Conf, Entorno } from '../Configuracion/index.js';
import { mezclar_clase_con_interfaces } from "../miscelaneas/mixin.js";
import { generarUUID } from "../miscelaneas/generarUUID.js";
import { IncidentesDobleVia, FabricaDeNodosElectricos, Energia, Fase, Peso, AdyacenteConPeso} from "./Interfaces/index.js";

console.log("NodoElectrico");

/**
 * Clase Enlace (contenedor de enlace con peso perezoso)
 *
 * Representa un enlace entre el nodo actual y un nodo destino, pudiendo almacenar
 * opcionalmente uno o varios pesos dimensionales.
 *
 * **Inicialización perezosa de pesos**:
 * - La propiedad `pesos` es `null` hasta que se asigna el primer peso.
 * - Si solo hay un peso (sin dimensión explícita) se guarda como escalar.
 * - Si se añade una segunda dimensión, se migra a un objeto (clave '' para el default).
 *
 * @class
 * @package Nodos
 * @version 0.0.0
 * @since 1.2.9
 */
class Enlace {
    /**
     * Nodo destino del enlace.
     * @type {NodoElectrico}
     */
    nodo;

    /**
     * Pesos asociados (null, escalar o objeto con claves de dimensión).
     * @type {*}
     */
    pesos = null;

    /**
     * @param {NodoElectrico} nodo Nodo destino
     */
    constructor(nodo) {
        this.nodo = nodo;
    }
}

/**
 * Clase NodoElectrico
 * 
 * Todos los enlaces que generen estos nodos seran de "doble via", por eso cada NodoElectrico maneja dos estrucuras
 * internas: adyacentes e incidentes. conteniendo los enlaces de salida y de entrada respectivamente.
 * 
 * Extiente la clase Nodo implementando FabricaDeNodosElectricos (estatica), Fase, Energia e IncidentesDobleVia.
 * 
 * ###INTERFACES
 * 
 * ##FASE
 * Vamos a manejar el concepdo de "fase" o "frecuencia" de trabajo. 
 * Por ahora la fase es simplemente un string con un nombre
 * similar a los nombres de ayacentes, pero generando un plano o 
 * matriz con estos o llave doble (fase, nombre_de_enlace). 
 * Es añadirle una dimencion mas a los adyacentes que ahora trabajaran en un plano. 
 * 
 * La fase sera concretamente una propiedad ligada a la superestructura y manejada por
 * el controlador. Pero para eso tenemos que tener en la clase nodo (junto a la superestructura)
 * una propiedad privada (o protegida) llamada "fase" con el nombre de la fase en string,
 * de modo que cada instancia de nodo pueda consultarla para saber donde insertar los adyacentes
 * dentro de su (ahora) matris de adyacentes. 
 * 
 * La matris de edyacentes no tendra tamaños prestablecido, sera mas bien un array de arrays 
 * de tamaños variables.
 * 
 * La mayor complejidad viene a la hora de manejar los incidentes. No alcanza una estructura de dos
 * dimenciones para poder representarlos ya que puede haber colciones en los nombres de los enlaces.
 * Me explico: supon que tenemos 3 nodos a, b, y c, a y b apuntando ambos a traves de un enlace
 * "enlace a c"; en este caso en c, tendriamos dos incidentes que comparten el nombre del enlace
 * incidente, por lo que es necesario agregar una tercera dimencion que podria ser -y lo hacemos asi-
 * el id del nodo incidente. Ver las propiedades privadas (o protegias) adyacentes e incidentes para
 * ver bien la estrucura
 * 
 * ## DINAMICOS ##
 * Hay que agregar por_cada_fase_ejecutar y _fase
 * ### MODIFIFICACIONES ###
 * 
 * ## INTERFAZ ADYACENTES ##
 * hay que reescribir cada funcion de la interfaz "adyacentes" para que cumplan con el nuevo estandar
 * 
 * ## HISTORIA ##
 * V0.0.1: muchas cosas espejadas pero faltan hacer pruebas y demas.
 * V0.0.3.251122: Voy a ir interfaz por interfaz, tanto del lado de js como de php haciendo las pruebas y 
 *                comoletando lo que falte en cualquiera de los dos lenguajes.
 * V0.0.3.251124: termine con todos los crear incluyendo su documentacion falta los eliminar para terminar 
 *                 con la interfaz FabricaDeNodosElectricos.
 *                  termine con los eliminar pero solo podre probarlos bien luego de que vea la interfaz 
 *                  adyacentes y la interfaz incidentesdoblevia. 
 *                  estoy con _adyacente _incidente_en. despues de solucionar muchos problemas 
 *                  freno luego de probar imprimir. 
 * 
 *                  FALTA EL OTRO IMPRIMIR MIRAR IMPRIMIR_SUPERESTRUCTURA
 *  
 * V0.0.4.260529	Retomo otra vez
 * V0.1.0.260605	Finalizadas y probadas Interfaces FabricaDeNodosElectricos, Fase, Adyacentes e Incidentes y a punto de comenzar con la interfaz Peso
 * @class
 * @author Ignacio David Baigorria
 * @version 1.2.9
 * @since 1.2.9
 * @extends Nodo
 * @implements {Nodos.Interfaces.IncidentesDobleVia}
 * @implements {Nodos.Interfaces.Energia}
 * @implements {Nodos.Interfaces.FabricaDeNodosElectricos}
 * @implements {Nodos.Interfaces.Fase}
 * @implements {Nodos.Interfaces.Peso}
 * @implements {Nodos.Interfaces.Adyacentes}
 * @memberof Nodos
 * 
 */
class NodoElectrico extends  mezclar_clase_con_interfaces(Nodo, FabricaDeNodosElectricos, IncidentesDobleVia, FabricaDeNodosElectricos, Energia, Fase, Peso, AdyacenteConPeso) {

     /**
     * Enlaces hacia nodos adyacentes.
     * @type {Map<string, Map<string, NodoElectrico>>}
     * @protected
     */
    _adyacentes;
    /**
     * Manejador de Incidentes.
     * @type {Map<string, Map<string, Map<string, NodoElectrico>>>} 
     * @protected
     */
    _incidentes;
    /**
     * Manejador de Salidas.
     * @type {*}
     * @protected
     */
   // _adyacentes;
    /**
     * Configuracion Interana.
     * @type {*}
     * @private
     */
    #CI;
    /**********************************************************************************************
     *  INTERFAZ FASE (ESTATICA)
     * 
     *  Propiedad $fase y sus metodos estaticos relacionados
     **********************************************************************************************/

    /** 
     * Fase de trabajo actual (global)
     * @type {String}
     * @protected
     * @static
     */
    static _fase_actual = 'a';

    /**
     * Conjunto de nombres de fases que han sido utilizados alguna vez.
     * Se usa para mantener un histórico y poder iterar sobre todas las fases.
     * @type {Set<String>}
     * @static
     */
    static _fases = new Set(['a']);

    /**
     * Establece la fase global en la que trabajan todos los nodos eléctricos.
     * Requiere token de autorización.
     *
     * @param {String} token Token de autorización
     * @param {String} fase Nombre de la nueva fase (no vacío)
     * @returns {void}
     * @static
     */
    static _fase(token, fase) {
        console.log("!FFFFFFFFFFF");
        if (typeof fase !== 'string' || !fase.trim()) {
            NodoElectrico._error("Nombre de fase inválido: debe ser un string no vacío");
            return;
        }
        const fase_normalizada = fase.trim();
        // Nota: verificar_token es un método estático heredado de Nodo.
        // Como el mixin copia métodos estáticos, podemos usar this.verificar_token (this = NodoElectrico)
        // o NodoElectrico.verificar_token, o incluso Nodo.verificar_token (más explícito).
        if (NodoElectrico.verificar_token(token)) {
            this._fase_actual = fase_normalizada;
            this._fases.add(fase_normalizada);
        } else {
            this._alerta("INTENTO DE ACCESO NO AUTORIZADO");
        }
    }

    /**
     * Devuelve la fase global actual.
     *
     * @returns {String} Nombre de la fase actual
     * @static
     */
    static fase() {

        return this._fase_actual;
    }

    /**
     * Ejecuta una función por cada fase registrada en el sistema (global).
     * Este método es estático y recorre TODAS las fases que se hayan usado alguna vez.
     * Requiere token de seguridad.
     *
     * @param {string} token   Token de autorización
     * @param {Function} funcion Función que recibe (fase)
     * @returns {void}
     * @static
     *
     * @example
     * NodoElectrico.por_cada_fase_global_ejecutar(token, (fase) => {
     *     console.log(`Fase global: ${fase}`);
     * });
     * @since V1.2.6
     */
    static por_cada_fase_global_ejecutar(token, funcion) {
        if (!this.verificar_token(token)) {
            this._alerta("INTENTO DE ACCESO NO AUTORIZADO");
            return;
        }

        for (const fase of this._fases) {
            funcion(fase);
        }
    }
    /**********************************************************************************************
     *  INTERFAZ FASE (INSTANCIA)
     * 
     *  Metodos relacionados con la fase 
     **********************************************************************************************/

    /**
     * Ejecuta una función por cada fase que tiene actividad en este nodo eléctrico.
     *
     * Una fase tiene "actividad" en el nodo si existe al menos un adyacente o un incidente
     * en esa fase. El método recorre las estructuras internas `_adyacentes` e `_incidentes`
     * para extraer las fases presentes, evitando duplicados, y ejecuta el callback por cada una.
     *
     * Requiere token de seguridad por ser una operación sensible.
     *
     * ---
     * 🔗 Métodos relacionados:
     * - {@link Nodos.NodoElectrico._fase _fase}
     * - {@link Nodos.NodoElectrico.fase fase}
     *
     * ---
     * @example
     * // Ejemplo de uso:
     * const nodo = NodoElectrico.crear();
     * nodo.por_cada_fase_ejecutar(token, (fase) => {
     *     console.log(`El nodo tiene actividad en la fase: ${fase}`);
     * });
     *
     * @param {string} token Token de autorización
     * @param {Function} funcion Función a ejecutar en cada fase, recibe el nombre de la fase.
     * @return {void}
     * @public
     * @since V1.2.6
     */
    por_cada_fase_ejecutar(token, funcion) {
        // Verificar token usando el método estático heredado (a través del constructor)
        if (!this.constructor.verificar_token(token)) {
            this.constructor._alerta("INTENTO DE ACCESO NO AUTORIZADO");
            return;
        }

        // Conjunto para almacenar fases únicas
        const fases_unicas = new Set();

        // Recorrer adyacentes (estructura: Map<fase, Map<enlace, NodoElectrico>>)
        if (this._adyacentes && this._adyacentes.size > 0) {
            for (const [fase, adyacentes_por_fase] of this._adyacentes) {
                if (adyacentes_por_fase && adyacentes_por_fase.size > 0) {
                    fases_unicas.add(fase);
                }
            }
        }

        // Recorrer incidentes (estructura: Map<idNodo, Map<fase, Map<enlace, NodoElectrico>>>)
        if (this._incidentes && this._incidentes.size > 0) {
            for (const fases_por_nodo of this._incidentes.values()) {
                if (fases_por_nodo && fases_por_nodo.size > 0) {
                    for (const fase of fases_por_nodo.keys()) {
                        // Verificar que realmente haya incidentes en esa fase
                        const incidentes_por_fase = fases_por_nodo.get(fase);
                        if (incidentes_por_fase && incidentes_por_fase.size > 0) {
                            fases_unicas.add(fase);
                        }
                    }
                }
            }
        }

        // Ejecutar la función para cada fase única encontrada
        for (const fase of fases_unicas) {
            funcion(fase);
        }
    }
    /**********************************************************************************************
     *  INTERFAZ FABRICA DE NODOS ELECTRICOS (ESTATICA)
     * 
     *  Reemplazo de los metodos existentes
     **********************************************************************************************/
    /**
     * Fuga de energia por ciclo
     * @type {Int}
     * @private
     */
    #fuga;
    /**
     * Copacidad maxima de energia.
     * @type {Int}
     * @private
     */
    #capacidad;

    /**
     * Devuelve la capacidad máxima de energía del nodo eléctrico.
     *
     * Este valor se establece en el momento de la creación del nodo
     * (a través de los métodos estáticos de fábrica) y no puede modificarse
     * durante la vida del nodo.
     *
     * ---
     * 🔗 Métodos relacionados:
     * - {@link Nodos.NodoElectrico#fuga fuga()}
     * - {@link Nodos.NodoElectrico#energia energia()}
     *
     * ---
     * @example
     * const nodo = NodoElectrico.crear(1000, 0.5);
     * console.log(nodo.capacidad()); // 1000
     *
     * @returns {number} Capacidad máxima del nodo (unidades de energía).
     * @public
     * @since V1.2.7
     */
    capacidad() {
        return this.#capacidad;
    }

    /**
     * Devuelve la fuga de energía por ciclo del nodo eléctrico.
     *
     * Este valor se establece en la creación del nodo (a través de los métodos
     * estáticos de fábrica). Representa la cantidad de energía que el nodo pierde
     * espontáneamente en cada ciclo de simulación.
     *
     * ---
     * 🔗 Métodos relacionados:
     * - {@link Nodos.NodoElectrico#capacidad capacidad()}
     * - {@link Nodos.NodoElectrico#energia energia()}
     *
     * ---
     * @example
     * const nodo = NodoElectrico.crear(1000, 0.5);
     * console.log(nodo.fuga()); // 0.5
     *
     * @returns {number} Fuga de energía del nodo por ciclo.
     * @public
     * @since V1.2.7
     */
    fuga() {
        return this.#fuga;
    }
   /**
     * Crea una nueva instancia de {@link Nodos.NodoElectrico} (Interfaz {@link Nodos.Interfaces.FabricaDeNodosElectricos FabricaDeNodosElectricos}).
     *
     * Este método implementa el contrato definido en la interfaz
     * {@link Nodos.Interfaces.FabricaDeNodosElectricos.crear FabricaDeNodosElectricos.crear()}.
     *
     * El constructor de la clase es privado, con lo que se asegura que las instancias 
     * no puedan se de forma directa desde el exterior, por lo que éste método es una
     * de las formas válidas de  nodos.
     * 
  	 * Redefino en la clase hija NodoElectrico y como el resto de los crear tendra dos parametros
	 * extra: capacidad y fuga, si no se les asigna ningun valor se les asignara el valo por defecto
	 * (ver:{@link Configuracion.Conf#CAPACIDAD_NODO_ELECTRICO Conf.CAPACIDAD_NODO_ELECTRICO}
	 *  y {@link Configuracion.Conf#FUGA_NODO_ELECTRICO Conf.FUGA_NODO_ELECTRICO})
     * 
     * 🔗 Otros métodos de creacion que se pueden usar son:
     * - {@link Nodos.NodoElectrico.crear_con_dato crear_con_dato()}
     * - {@link Nodos.NodoElectrico.crear_con_id crear_con_id()}
     * - {@link Nodos.NodoElectrico.crear_con_dato_e_id crear_con_dato_e_id()}
     * - {@link Nodos.NodoElectrico.nodo nodo()}  
     * 
     * ---
     * 🔗 Otros métodos relacionados
     * - {@link Nodos.NodoElectrico.eliminar eliminar()}
     * - {@link Nodos.Nodo.cantidad_de_nodos cantidad_de_nodos()}  
     *
     * ---
     * @static
     * @param {number} [capacidad=Conf.CAPACIDAD_NODO_ELECTRICO] capacidad maxima de energia del nodo 
     * ver:{@link Configuracion.Conf#CAPACIDAD_NODO_ELECTRICO Conf.CAPACIDAD_NODO_ELECTRICO}
     * @param {number} [fuga=Conf.FUGA_NODO_ELECTRICO] fuga de energia por cada ciclo
     * ver:{@link Configuracion.Conf#FUGA_NODO_ELECTRICO Conf.FUGA_NODO_ELECTRICO}
     * @returns {NodoElectrico} Una nueva instancia de {@link Nodos.NodoElectrico}
     *
     * @note Este método incrementa el contador estático de la clase
     *       {@link Nodos.Nodo.cantidad_de_nodos}, y lo agrega a la Superestructura 
     *       lo que permite llevar un registro global de las instancias vivas.
     *
     * @example
     * const n1 = Nodos.NodoElectrico.crear();
     * const n2 = Nodos.NodoElectrico.crear();
     *  // Crear un nodo con capacidad 500 y fuga 0.5
     * const nodoConEnergia = NodoElectrico.crear(500, 0.5);
     *
     * console.log("Nodos actuales:", Nodos.NodoElectrico.cantidad_de_nodos());
     * // Esperado: 2
     * @since V0.0.3
     */
    static crear(capacidad=Conf.CAPACIDAD_NODO_ELECTRICO, fuga=Conf.FUGA_NODO_ELECTRICO) {
      const nodo = new this();
      Nodo._superestructura.set(nodo.id(),nodo);
      nodo.#fuga=fuga;
      nodo.#capacidad=capacidad;
      return nodo;
    }

    /**
     * Crear un nuevo nodo encapsulando el dato recibido (Interfaz {@link Nodos.Interfaces.FabricaDeNodosElectricos FabricaDeNodosElectricos}).
     *
     * Este método crea una nueva instancia de la clase {@link Nodos.NodoElectrico} a partir de un dato cualquiera.  
     * El dato no es procesado ni verificado: se encapsula directamente en el nodo, lo que lo hace
     * muy flexible para representar tanto valores primitivos como estructuras complejas (arrays, objetos, etc.).
     *
     * El constructor de la clase es privado, con lo que se asegura que las instancias 
     * no puedan se de forma directa desde el exterior, por lo que éste método es una
     * de las formas válidas de  nodos.
     *
   	 * Redefino en la clase hija NodoElectrico y como el resto de los crear tendra dos parametros
	 * extra: capacidad y fuga, si no se les asigna ningun valor se les asignara el valo por defecto
	 * (ver:{@link Configuracion.Conf#CAPACIDAD_NODO_ELECTRICO Conf.CAPACIDAD_NODO_ELECTRICO}
	 *  y {@link Configuracion.Conf#FUGA_NODO_ELECTRICO Conf.FUGA_NODO_ELECTRICO})
     *  
     * 🔗 Otros métodos de creacion que se pueden usar son:
     * - {@link Nodos.NodoElectrico.crear()}
     * - {@link Nodos.NodoElectrico.crear_con_id crear_con_id()}
     * - {@link Nodos.NodoElectrico.crear_con_dato_e_id crear_con_dato_e_id()}
     * - {@link Nodos.NodoElectrico.nodo nodo()}  
     * 
     * ---
     * 🔗 Métodos relacionados:
     * - {@link Nodos.NodoElectrico.eliminar eliminar()}
     * - {@link Nodos.Nodo.cantidad_de_nodos cantidad_de_nodos()}
     *
     * @example
     * // Ejemplo de uso:
     * const nodo = Nodos.NodoElectrico.crear_con_dato("Hola Mundo");
     * console.log(nodo.dato()); // Devuelve: "Hola Mundo"
     * // Crear nodo con dato "Sensor" y capacidad y fuga personalizada
     * const sensor = NodoElectrico.crear_con_dato("Sensor", false, 1000, 0.2);
     * 
     * @note Este método incrementa el contador estático de la clase
     *       {@link Nodos.Nodo.cantidad_de_nodos}, y lo agrega a la Superestructura 
     *       lo que permite llevar un registro global de las instancias vivas.
     * 
     * @static
     * @param {*} dato Valor a encapsular en el nuevo nodo.
     * @param {number} [capacidad=Conf.CAPACIDAD_NODO_ELECTRICO] capacidad maxima de energia del nodo 
     * ver:{@link Configuracion.Conf#CAPACIDAD_NODO_ELECTRICO Conf.CAPACIDAD_NODO_ELECTRICO}
     * @param {number} [fuga=Conf.FUGA_NODO_ELECTRICO] fuga de energia por cada ciclo
     * ver:{@link Configuracion.Conf#FUGA_NODO_ELECTRICO Conf.FUGA_NODO_ELECTRICO}
     * @returns {NodoElectrico} Una nueva instancia de {@link Nodos.NodoElectrico}
     * @since V0.0.3
     */
    static crear_con_dato(dato, todos = false, capacidad=Conf.CAPACIDAD_NODO_ELECTRICO, fuga=Conf.FUGA_NODO_ELECTRICO) {
      if (!todos) {
        const nodo = new this();
        nodo._dato=dato;
        nodo.#fuga=fuga;
        nodo.#capacidad=capacidad;
        Nodo._superestructura.set(nodo.id(),nodo);
        return nodo;
      }/* else {// esta parte la voy a quitar cuando encuentre donde se usa
        if (typeof dato !== 'object') {
          if (Array.isArray(dato)) {
            let nodo = NodoElectrico.crear_con_dato("ARRAY");
            let nodoAux = nodo;
            for (const valor of dato) {
              const nodoAux2 = NodoElectrico.crear_con_dato(valor, true);
              nodo._adyacente_en(nodoAux2, "siguiente");
              nodo = nodoAux2;
            }
            return nodoAux;
          } else {
            const nodo = NodoElectrico.();
            nodo._dato(dato);
            return nodo;
          }
        } else {
          const nodo = NodoElectrico.();
          for (const prop in dato) {
            nodo._adyacente_en(NodoElectrico.crear_con_dato(dato[prop], true), prop);
          }
          return nodo;
        }
      }*/
    }

    /**
     * Crear un nuevo nodo asignándole un identificador válido (Interfaz {@link Nodos.Interfaces.FabricaDeNodosElectricos FabricaDeNodosElectricos}).
     *
     * Este método permite  un nodo directamente a partir de un identificador.  
     * Antes de instanciar el nodo, el identificador debe ser unico y es evaluado mediante el método
     * {@link Nucleo.Objeto.es_id_especial es_id_especial(id)}, lo que asegura que cumple con los criterios
     * internos de validez para identificadores *especiales*. 
     * Si el identificador no supera la verificación, el nodo no será creado y generará un mensaje de error.
     *
     * El constructor de la clase {@link Nodos.NodoElectrico} es privado, por lo que esta función constituye
     * una de las formas válidas de construir nodos desde el exterior.
     *
  	 * Redefino en la clase hija NodoElectrico y como el resto de los crear tendra dos parametros
	 * extra: capacidad y fuga, si no se les asigna ningun valor se les asignara el valo por defecto
	 * (ver:{@link Configuracion.Conf#CAPACIDAD_NODO_ELECTRICO Conf.CAPACIDAD_NODO_ELECTRICO}
	 *  y {@link Configuracion.Conf#FUGA_NODO_ELECTRICO Conf.FUGA_NODO_ELECTRICO})
     * 
     * 🔗 Otros métodos de creación que se pueden usar:
     * - {@link Nodos.NodoElectrico.crear()}
     * - {@link Nodos.NodoElectrico.crear_con_dato crear_con_dato()}
     * - {@link Nodos.NodoElectrico.crear_con_dato_e_id crear_con_dato_e_id()}
     * - {@link Nodos.NodoElectrico.nodo nodo()}  
     *
     * ---
     * 🔗 Métodos relacionados:
     * - {@link Nodos.NodoElectrico.eliminar eliminar()}
     * - {@link Nodos.Nodo.cantidad_de_nodos cantidad_de_nodos()}
     * - {@link Nucleo.Objeto#es_especial es_especial()}
     * 
     * @example
     * // Ejemplo de uso:
     * const nodo = Nodos.NodoElectrico.crear_con_id("soy_especial");
     * console.log(nodo.id()); // Devuelve: "soy_especial"
     * // Crear nodo con id "Sensor" y capacidad y fuga personalizada
     * const sensor = NodoElectrico.crear_con_id("Sensor", 1000, 0.2);
     * @note Este método incrementa el contador estático de la clase
     *       {@link Nodos.Nodo.cantidad_de_nodos} y lo agrega a la Superestructura.
     *
     * @static
     * @param {string} id Identificador *especial* a asignar al nuevo nodo (debe pasar la verificación).
      * @param {number} [capacidad=Conf.CAPACIDAD_NODO_ELECTRICO] capacidad maxima de energia del nodo 
     * ver:{@link Configuracion.Conf#CAPACIDAD_NODO_ELECTRICO Conf.CAPACIDAD_NODO_ELECTRICO}
     * @param {number} [fuga=Conf.FUGA_NODO_ELECTRICO] fuga de energia por cada ciclo
     * ver:{@link Configuracion.Conf#FUGA_NODO_ELECTRICO Conf.FUGA_NODO_ELECTRICO}
     * @returns {NodoElectrico|null} Una nueva instancia de {@link Nodos.NodoElectrico}     
     * @since V0.0.3
     */
    static crear_con_id(id,capacidad=Conf.CAPACIDAD_NODO_ELECTRICO, fuga=Conf.FUGA_NODO_ELECTRICO) {
      const nodo = new this();
      if (nodo._id(id)) {
        nodo.#fuga=fuga;
        nodo.#capacidad=capacidad;
        Nodo._superestructura.set(nodo.id(),nodo);
        Nodo._nodos_especiales.set(nodo.id(),nodo);
       // Nodo.agregar_a_superestructura(nodo);
       // Nodo.agregar_nodo_especial(nodo);
        return nodo;
      } else {
        NodoElectrico._error(`No se pudo  el nodo con id ${id}`);
        return null;
      }
   }

    /**
     * Crear un nuevo nodo encapsulando un dato y asignándole un identificador válido (Interfaz {@link Nodos.Interfaces.FabricaDeNodosElectricos}).
     *
     * Este método combina las capacidades de {@link Nodos.NodoElectrico.crear_con_dato crear_con_dato()}  
     * y {@link Nodos.NodoElectrico.crear_con_id crear_con_id()}.  
     * Permite instanciar un nodo con un valor cualquiera (primitivo, complejo u otro nodo) y a la vez asignarle
     * un identificador único *especial* que debe pasar la validación de {@link Nodos.Objeto.es_id_especial}.
     *
     * El constructor de la clase {@link Nodos.NodoElectrico} es privado, de modo que esta función constituye una de las formas válidas de creación de nodos.
     *
  	 * Redefino en la clase hija NodoElectrico y como el resto de los crear tendra dos parametros
	 * extra: capacidad y fuga, si no se les asigna ningun valor se les asignara el valo por defecto
	 * (ver:{@link Configuracion.Conf#CAPACIDAD_NODO_ELECTRICO Conf.CAPACIDAD_NODO_ELECTRICO}
	 *  y {@link Configuracion.Conf#FUGA_NODO_ELECTRICO Conf.FUGA_NODO_ELECTRICO})
     * 
     * ---
     * 🔗 Otros métodos de creación que se pueden usar:
     * - {@link Nodos.NodoElectrico.crear()}
     * - {@link Nodos.NodoElectrico.crear_con_dato crear_con_dato()}
     * - {@link Nodos.NodoElectrico.crear_con_id crear_con_id()}
     * - {@link Nodos.NodoElectrico.nodo nodo()}  
     * 
     * ---
     * 🔗 Métodos relacionados:
     * - {@link Nodos.NodoElectrico.eliminar eliminar()}
     * - {@link Nodos.Nodo.cantidad_de_nodos cantidad_de_nodos()}
     * - {@link Nucleo.Objeto#es_especial es_especial()}
     * 
     * @example
     * // Ejemplo de uso:
     * const nodo = Nodos.NodoElectrico.crear_con_dato_e_id("Hola Mundo", "soy_especial");
     * console.log(nodo.dato()); // Devuelve: "Hola Mundo"
     * console.log(nodo.id());   // Devuelve: "soy_especial"
     * // Crear nodo con dato "Sensor", id "Sensor01" y capacidad y fuga personalizada
     * const sensor = NodoElectrico.crear_con_dato_e_id("Sensor", "Sensor01, 1000, 0.2);
     * 
     *
     * @note Este método incrementa el contador estático de la clase
     *       {@link Nodos.Nodo.cantidad_de_nodos}, y lo registra en la Superestructura
     *       para mantener un seguimiento global de instancias.
     *
     * @static
     * @param {*} dato Valor a encapsular en el nodo.
     * @param {*} id Identificador *especial* del nodo (debe pasar verificación).
     * @param {number} [capacidad=Conf.CAPACIDAD_NODO_ELECTRICO] capacidad maxima de energia del nodo 
     * ver:{@link Configuracion.Conf#CAPACIDAD_NODO_ELECTRICO Conf.CAPACIDAD_NODO_ELECTRICO}
     * @param {number} [fuga=Conf.FUGA_NODO_ELECTRICO] fuga de energia por cada ciclo
     * ver:{@link Configuracion.Conf#FUGA_NODO_ELECTRICO Conf.FUGA_NODO_ELECTRICO}
     * @returns {NodoElectrico|null} Instancia de nodo con dato e identificador *especial* válido si tuvo exito o null en caso contrario.
     * @since V0.0.3
     */
      static crear_con_dato_e_id(dato, id,capacidad=Conf.CAPACIDAD_NODO_ELECTRICO, fuga=Conf.FUGA_NODO_ELECTRICO) {
        if (Objeto.es_id_especial(id)){
          const nodo = new this();
          if (nodo._id_interno(id)) {
            Nodo._superestructura.set(id, nodo);
            Nodo._nodos_especiales.set(id, nodo);
            nodo._dato=dato;
            nodo.#fuga=fuga;
            nodo.#capacidad=capacidad;
            return nodo;
          }
          NodoElectrico._error(`No se pudo  el nodo con dato e id ${id}`);
          return null;  
        }
        NodoElectrico._error("Para asignar un id, este debe ser especial");
        return null;
      }
      
    /**
     * Garantizar que el elemento entregado sea un nodo válido (Interfaz {@link Nodos.Interfaces.FabricaDeNodosElectricos FabricaDeNodosElectricos}).
     *
     * Este método recibe un valor cualquiera (o ninguno) o un posible nodo y asegura que el resultado final
     * sea siempre una instancia de {@link Nodos.NodoElectrico}.  
     *
     * Comportamiento:
     * - Si no recibe ningun parámetro crea un Nodo vacío totalmente válido
     * - Si el parámetro recibido **ya es un Nodo**, simplemente lo retorna y pasa `true` a `esNodo` en el callback.  
     * - Si el parámetro **no es un Nodo**, crea uno nuevo con 
     *   {@link Nodos.NodoElectrico.crear_con_dato crear_con_dato()}, lo retorna y pasa `false` a `esNodo`.  
     * - Si no se pasa ningún valor en el parámetro `elemento`, crea un nodo vacío totalmente válido
     *   encapsulando `null`.  
     *
     * ⚠️ El callback es opcional y se ejecuta inmediatamente antes de retornar el nodo.  
     * Se llama con dos argumentos:
     *   1. `nodo` → La instancia de {@link Nodos.NodoElectrico} creada o pasada.
     *   2. `esNodo` → Booleano que indica si el parámetro original ya era un nodo (`true`) o no (`false`).
     *   
     * Esto permite al llamador obtener información sobre el tipo del elemento mientras se trabaja
     * con nodos válidos sin necesidad de variables externas.
     *
     * El constructor de {@link Nodos.NodoElectrico} es privado, así que esta función constituye una de las
     * formas válidas de creación de nodos.
     *
  	 * Redefino en la clase hija NodoElectrico y como el resto de los crear tendra dos parametros
	 * extra: capacidad y fuga, si no se les asigna ningun valor se les asignara el valo por defecto
	 * (ver:{@link Configuracion.Conf#CAPACIDAD_NODO_ELECTRICO Conf.CAPACIDAD_NODO_ELECTRICO}
	 *  y {@link Configuracion.Conf#FUGA_NODO_ELECTRICO Conf.FUGA_NODO_ELECTRICO})
     * 
     * --- 
     * 🔗 Otros métodos de creación:
     * - {@link Nodos.NodoElectrico.crear()}
     * - {@link Nodos.NodoElectrico.crear_con_dato crear_con_dato()}
     * - {@link Nodos.NodoElectrico.crear_con_id crear_con_id()}
     * - {@link Nodos.NodoElectrico.crear_con_dato_e_id crear_con_dato_e_id()}
     *
     * --- 
     * 🔗 Otros métodos relacionados:
     * - {@link Nodos.NodoElectrico.eliminar eliminar()}
     * - {@link Nodos.Nodo.cantidad_de_nodos cantidad_de_nodos()}
     *
     * --- 
     * @example
     * // Caso 0: se lo llama sin ningún parámetro (crea nodo vacio completamente valido): 
     * const nodo0= NodoElectrico.nodo();
     * console.log(nodo0.dato()); // "null"
     * console.log(nodo0.id()); //0
     * console.log(NodoElectrico.cantidad_de_nodos());//1
     * 
     * // Caso 1: se le pasa un parámetro no Nodo (crea un nodo con el dato pasado por parametro)
     * const nodo1=NodoElectrico.nodo("Soy el nodo 1");
     * console.log(nodo1.dato()); // "Soy el nodo 1"
     * console.log(nodo1.id());//1
     * console.log(NodoElectrico.cantidad_de_nodos());//2
     * 
     * // Caso 2: le paso un parametro que es un nodo (no crea ningun nodo, devuelve el mismo nodo)
     * const nodo2=NodoElectrico.nodo(nodo1);
     * console.log(nodo2.dato()); // "soy el nodo 1"
     * console.log(nodo2.id()); //1
     * console.log(NodoElectrico.cantidad_de_nodos());//2
     * 
     * //caso 3: se le pasa un parametro no Nodo y una funcion callback (crea una instancia de NodoElectrico
     * //con el dato pasado por parametro. Además invoca a la funcion callback y le pasa el NodoElectrico creado
     * //y otro parametro booleano para que pueda verificar si el dato original era un nodo o no)
     * const nodo3 = NodoElectrico.nodo("soy nodo 3", (nodo, esNodo) => {
     *     if (esNodo){
     *        console.log("el parametro de entrada era un nodo");
     *     }else{
     *        console.log("el parametro de entrada no era un nodo"); // Imprime esto
     *     }
     * });
     * console.log(nodo3.id());//2
     * condole.log(NodoElectrico.cantidad_de_nodos());//3
     * 
     * //caso 4: se le pasa un parametro que es un Nodo y una funcion callback (crea una instancia de NodoElectrico
     * //con el dato pasado por parametro. Además invoca a la funcion callback y le pasa el NodoElectrico creado
     * //y otro parametro booleano para que pueda verificar si el dato original era un nodo o no)
     * const nodo4 = NodoElectrico.nodo(nodo3, (nodo, esNodo) => {
     *     if (esNodo){
     *        console.log("el parametro de entrada era un nodo"); //imprime esto
     *     }else{
     *        console.log("el parametro de entrada no era un nodo"); 
     *     }
     * });
     * console.log(nodo4.id());//2
     * console.log(NodoElectrico.cantidad_de_nodos());//3
     * 
     * // Caso 5: capacidad personalizada personalizada
     * const sensor = NodoElectrico.nodo("Sensor", null, 1000, 0.2);
     *
     * @static
     * @param {*} [elemento=null] Valor a encapsular o nodo existente. Si se omite, se crea un nodo vacío.
     * @param {function(NodoElectrico, boolean)|null} callback Función opcional que recibe el nodo creado y un booleano
     *                                                indicando si el parámetro original ya era un nodo.
     * @param {number} [capacidad=Conf.CAPACIDAD_NODO_ELECTRICO] capacidad maxima de energia del nodo 
     * ver:{@link Configuracion.Conf#CAPACIDAD_NODO_ELECTRICO Conf.CAPACIDAD_NODO_ELECTRICO}
     * @param {number} [fuga=Conf.FUGA_NODO_ELECTRICO] fuga de energia por cada ciclo
     * ver:{@link Configuracion.Conf#FUGA_NODO_ELECTRICO Conf.FUGA_NODO_ELECTRICO}
     * @returns {NodoElectrico} Una nueva instancia de {@link Nodos.NodoElectrico}
     * @since V0.0.3
     */
    static nodo(elemento = null, callback = null, capacidad=Conf.CAPACIDAD_NODO_ELECTRICO, fuga=Conf.FUGA_NODO_ELECTRICO) {
        let nodo, es_nodo;
        if (elemento instanceof Nodo) {
            nodo = elemento;
            es_nodo = true;
        } else {
            nodo = new this();
            nodo._dato=elemento;
            nodo.#fuga=fuga;
            nodo.#capacidad=capacidad;
            Nodo._superestructura.set(nodo.id(), nodo);
            es_nodo = false;
        }
        if (callback) callback(nodo, es_nodo);
        return nodo;
    }

    /**
     * Eliminar un nodo del sistema (Interfaz {@link Nodos.Interfaces.FabricaDeNodosElectricos FabricaDeNodosElectricos}).
     * 
     * Este método intenta eliminar el nodo indicado de la superestructura,
     * de los nodos especiales (si corresponde) y del sistema en general. 
     * Devuelve `true` en caso de éxito.
     *
     * ⚠️ Condición imprescindible: el nodo no debe tener enlaces entrantes (incidentes)
     * desde otros nodos. Si existen, la operación devuelve `false` y lanza
     * un error.  
     *
     *
     * ---
     * 🔗 Métodos de creación relacionados:
     * - {@link Nodos.NodoElectrico.crear crear()}
     * - {@link Nodos.NodoElectrico.crear_con_dato crear_con_dato()}
     * - {@link Nodos.NodoElectrico.crear_con_id crear_con_id()}
     * - {@link Nodos.NodoElectrico.crear_con_dato_e_id crear_con_dato_e_id()}
     * - {@link Nodos.NodoElectrico.nodo nodo()} 
     * 
     * ---
     * ⚠️ Nota importante sobre JavaScript:
     * - Si se invoca `eliminar(nodo);` y luego `nodo.dato()`, la llamada
     *   seguirá funcionando, salvo que también se asigne `nodo = null;`
     *   fuera de la función.
     * - Asignarle `nodo = null` dentro de `eliminar()` solo rompería la
     *   referencia local, no la externa.
     * - Aunque se implementó un método `destructor()` y se invoca
     *   explícitamente dentro de `eliminar()` JS no lo destruye realmente hasta
     *   perder la ultima referencia referencia al nodo.
     * 
     * @example
     * // Crear un nodo
     * let nodo = NodoElectrico.crear_con_dato("Eliminarme");
     *
     * // Eliminar el nodo
     * let resultado = NodoElectrico.eliminar(nodo);
     * console.log(resultado); // true
     *
     * // Intentar eliminar un nodo con referencias
     * let nodoA = NodoElectrico.crear_con_dato("A");
     * let nodoB = NodoElectrico.crear_con_dato("B");
     * nodoA._adyacente(nodoB);
     * console.log(NodoElectrico.eliminar(nodoB)); // false
     *
     * @static
     * @param {NodoElectrico} nodo Nodo a eliminar.
     * @returns {boolean|null} `true` si fue eliminado, `false` si no pudo eliminarse,
     *                         `null` si el parámetro no es válido.
     */
    static eliminar(nodo) {
        if (!(nodo instanceof NodoElectrico)) {
            NodoElectrico._error("El parámetro no es de la clase NodoElectrico");
            return null;
        }

        if (nodo._referencias !== 0) {
            NodoElectrico._error("debe eliminar todos los enlaces que apuntan hacia el nodo antes de intentar eliminarlo");
            return false;
        }

        const nodo_id = nodo.id();

        Nodo._superestructura.delete(nodo_id);
        Nodo._nodos_especiales.delete(nodo_id);

        if (nodo._adyacentes !== undefined && nodo._adyacentes.size > 0) {
            for (const [fase, adyacentes_map] of nodo._adyacentes) {
                if (adyacentes_map && adyacentes_map.size > 0) {
                    for (const [enlace, valor] of adyacentes_map) {
                        const nodo_destino = (valor instanceof Enlace) ? valor.nodo : valor;
                        nodo_destino._referencias--;

                        if (nodo_destino._incidentes !== undefined) {
                            const incidentes_por_id = nodo_destino._incidentes.get(nodo_id);
                            if (incidentes_por_id) {
                                const incidentes_por_fase = incidentes_por_id.get(fase);
                                if (incidentes_por_fase) {
                                    incidentes_por_fase.delete(enlace);
                                    if (incidentes_por_fase.size === 0) {
                                        incidentes_por_id.delete(fase);
                                    }
                                    if (incidentes_por_id.size === 0) {
                                        nodo_destino._incidentes.delete(nodo_id);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        if (typeof nodo.destructor === 'function') {
            nodo.destructor();
        }

        return true;
    }


    /**
	   * Elimina un nodo que solo tiene autoenlaces (Interfaz {@link Nodos.NodoElectrico.Interfaces.FabricaDeNodosElectricos FabricaDeNodosElectricos})
	   * 
	   * Elimina un nodo que solo tiene autoenlaces (enlaces hacia sí mismo).
	   * 
     * ⚠️ **Este método está obsoleto**:
     * 
     * Ya no corresponde a la responsabilidad de la clase manejar la eliminación de autoenlaces.
     * El programador debe asegurarse de limpiar manualmente todos los enlaces —incluyendo los
     * autoenlaces— antes de invocar el 
     * {@link Nodos.NodoElectrico.eliminar método de eliminación estándar}.
     * 
     * Si el nodo tiene autoenlaces pueden eliminarse usando el metodo 
     * {@link Nodos.NodoElectrico.eliminar_enlace() eliminar_enlace} 
     * que elimina los enlaces uno por uno; o el metodo
     * {@link Nodos.NodoElectrico.eliminar_enlaces() eliminar_enlaces}
     * que elimina todos los enlaces que salen del nodo, incluyendo los que apuntan a sí mismo
     * 
     * @deprecated 
     * @static
     * @param {NodoElectrico} nodo Nodo a eliminar.
     * @returns {boolean|null} `true` si fue eliminado, `false` si no pudo eliminarse,
     *                         `null` si el parámetro no es válido.     */
    static eliminar_autoenlazado(nodo) {
        if (!(nodo instanceof NodoElectrico)) {
            NodoElectrico._error("el parámetro no es de la clase NodoElectrico");
            return null;
        }

        let cont_auto = 0;
        let cont_comunes = 0;
        const id = nodo.id();

        if (nodo._adyacentes !== undefined) {
            for (const [, adyacentes_map] of nodo._adyacentes) {
                if (adyacentes_map && adyacentes_map.size > 0) {
                    for (const [, valor] of adyacentes_map) {
                        const nodo_destino = (valor instanceof Enlace) ? valor.nodo : valor;
                        if (id === nodo_destino.id()) {
                            cont_auto++;
                        } else {
                            cont_comunes++;
                        }
                    }
                }
            }
        }

        const referencias_externas = nodo._referencias - cont_auto;

        if (referencias_externas === 0 && cont_comunes === 0) {
            if (nodo._adyacentes !== undefined) {
                for (const [fase, adyacentes_map] of nodo._adyacentes) {
                    if (adyacentes_map && adyacentes_map.size > 0) {
                        const auto_enlaces = [];
                        for (const [enlace, valor] of adyacentes_map) {
                            const nodo_destino = (valor instanceof Enlace) ? valor.nodo : valor;
                            if (nodo_destino.id() === id) {
                                auto_enlaces.push({ fase, enlace });
                            }
                        }
                        for (const { fase, enlace } of auto_enlaces) {
                            adyacentes_map.delete(enlace);
                            if (nodo._incidentes !== undefined) {
                                const incidentes_por_id = nodo._incidentes.get(id);
                                if (incidentes_por_id) {
                                    const incidentes_por_fase = incidentes_por_id.get(fase);
                                    if (incidentes_por_fase) {
                                        incidentes_por_fase.delete(enlace);
                                        if (incidentes_por_fase.size === 0) incidentes_por_id.delete(fase);
                                        if (incidentes_por_id.size === 0) nodo._incidentes.delete(id);
                                    }
                                }
                            }
                            nodo._referencias--;
                        }
                    }
                }
            }

            Nodo._superestructura.delete(id);
            Nodo._nodos_especiales.delete(id);

            if (typeof nodo.destructor === 'function') {
                nodo.destructor();
            }
            return true;
        }

        return false;
    }

    // =================================================================
    // INTERFAZ ENERGÍA
    // =================================================================

    // -----------------------------------------------------------------
    // Propiedades privadas (instancia)
    // -----------------------------------------------------------------

    /**
     * Energía actual por fase.
     * @type {Map<string, number>}
     */
    #energia = new Map();

    /**
     * Último timestamp (segundos) en que se aplicó fuga por fase.
     * @type {Map<string, number>}
     */
    #ultima_fuga = new Map();

    /**
     * Callbacks de saturación registrados por instancia y fase.
     * Estructura: Map<fase, { callback: Function, reemplazar: boolean }>
     * @type {Map<string, { callback: Function, reemplazar: boolean }>}
     */
    #ejecutar_cuando_satura = new Map();

    /**
     * Callbacks de agotamiento registrados por instancia y fase.
     * Estructura: Map<fase, { callback: Function, reemplazar: boolean }>
     * @type {Map<string, { callback: Function, reemplazar: boolean }>}
     */
    #ejecutar_cuando_agota = new Map();

    // -----------------------------------------------------------------
    // Propiedades estáticas privadas
    // -----------------------------------------------------------------

    /**
     * Callbacks por defecto de saturación asociados a una fase (estáticos).
     * @type {Map<string, Function>}
     */
    static #ejecutar_cuando_satura_por_defecto_por_fase = new Map();

    /**
     * Callbacks por defecto de agotamiento asociados a una fase (estáticos).
     * @type {Map<string, Function>}
     */
    static #ejecutar_cuando_agota_por_defecto_por_fase = new Map();

    /**
     * Callback global cuando todas las fases del nodo están sin energía.
     * @type {Function|null}
     */
    static #ejecutar_cuando_agota_global = null;

    // -----------------------------------------------------------------
    // Getters básicos
    // -----------------------------------------------------------------

    /**
     * Devuelve la capacidad máxima de energía del nodo eléctrico.
     *
     * Este valor se establece en el momento de la creación del nodo
     * (a través de los métodos estáticos de fábrica) y no puede modificarse
     * durante la vida del nodo.
     *
     * ---
     * 🔗 Métodos relacionados:
     * - {@link Nodos.NodoElectrico#fuga fuga()}
     * - {@link Nodos.NodoElectrico#energia energia()}
     *
     * ---
     * @example
     * const nodo = NodoElectrico.crear(1000, 0.5);
     * console.log(nodo.capacidad()); // 1000
     *
     * @returns {number}
     * @public
     * @since V1.2.8
     */
    capacidad() {
        return this.#capacidad;
    }

    /**
     * Devuelve la fuga de energía por ciclo del nodo eléctrico.
     *
     * Este valor se establece en la creación del nodo (a través de los métodos
     * estáticos de fábrica). Representa la cantidad de energía que el nodo pierde
     * espontáneamente en cada ciclo de simulación (definido por `Conf.TIEMPO_CICLO`).
     *
     * ---
     * 🔗 Métodos relacionados:
     * - {@link Nodos.NodoElectrico#capacidad capacidad()}
     * - {@link Nodos.NodoElectrico#energia energia()}
     *
     * ---
     * @example
     * const nodo = NodoElectrico.crear(1000, 0.5);
     * console.log(nodo.fuga()); // 0.5
     *
     * @returns {number}
     * @public
     * @since V1.2.8
     */
    fuga() {
        return this.#fuga;
    }

    /**
     * Devuelve la energía actual del nodo eléctrico en la fase activa,
     * aplicando previamente todas las fugas pendientes según el tiempo real transcurrido.
     *
     * Este método llama internamente a `#fugar()` para actualizar la energía
     * de todas las fases antes de devolver el valor de la fase actual.
     *
     * ---
     * 🔗 Método complementario:
     * - {@link Nodos.NodoElectrico#_energia _energia()}
     *
     * ---
     * @example
     * const nodo = NodoElectrico.crear(100, 0);
     * nodo._energia(100);
     * // Esperar 2 segundos (2 ciclos) y luego consultar
     * setTimeout(() => {
     *     console.log(nodo.energia()); // 100 - (fuga * 2)
     * }, 2000);
     *
     * @returns {number} Energía en la fase actual (0 <= valor <= capacidad)
     * @public
     * @since V1.2.8
     */
    energia() {
        this.#fugar();
        return this.#energia.get(NodoElectrico._fase_actual) ?? 0;
    }

    // -----------------------------------------------------------------
    // Método privado de fuga
    // -----------------------------------------------------------------

    /**
     * Aplica la fuga de energía basada en el tiempo real transcurrido.
     *
     * Para cada fase con energía registrada, calcula cuántos ciclos completos
     * han pasado desde la última actualización (según `Conf.TIEMPO_CICLO`)
     * y resta `fuga * ciclos`. Si la energía llega a 0, se ejecuta el callback
     * de agotamiento correspondiente (instancia o fase). Al final, si todas
     * las fases tienen energía 0, se ejecuta el callback global.
     *
     * Este método es llamado automáticamente desde `energia()` y `_energia()`.
     *
     * ---
     * 🔗 Métodos relacionados:
     * - {@link Nodos.NodoElectrico#_energia _energia()}
     * - {@link Nodos.NodoElectrico#energia energia()}
     *
     * ---
     * @returns {void}
     * @private
     * @since V1.2.8
     */
    #fugar() {
        const ahora = Date.now() / 1000;
        let todas_cero = true;

        for (const [fase, energia] of this.#energia) {
            const ultimo = this.#ultima_fuga.get(fase) ?? ahora;
            const delta = ahora - ultimo;
            const ciclos = Math.floor(delta / Conf.TIEMPO_CICLO);
            if (ciclos > 0 && this.#fuga > 0) {
                const perdida = this.#fuga * ciclos;
                const nueva_energia = Math.max(0, energia - perdida);
                this.#energia.set(fase, nueva_energia);
                this.#ultima_fuga.set(fase, ahora);

                if (nueva_energia === 0 && perdida > 0) {
                    this.#ejecutar_callback_agotamiento(fase);
                }
            }
            if ((this.#energia.get(fase) ?? 0) > 0) {
                todas_cero = false;
            }
        }

        if (todas_cero && NodoElectrico.#ejecutar_cuando_agota_global) {
            NodoElectrico.#ejecutar_cuando_agota_global(this);
        }
    }

    // -----------------------------------------------------------------
    // Métodos privados de ejecución de callbacks
    // -----------------------------------------------------------------

    /**
     * Ejecuta el callback de saturación para la fase actual.
     *
     * Respeta el modo `reemplazar` (true = solo instancia si existe, si no la de fase;
     * false = ambos, instancia primero y luego fase).
     *
     * @returns {void}
     * @private
     * @since V1.2.8
     */
    #ejecutar_callback_saturacion() {
        const fase = NodoElectrico._fase_actual;
        const instanciaData = this.#ejecutar_cuando_satura.get(fase);
        const faseCallback = NodoElectrico.ejecutar_cuando_satura_por_fase(fase);
        const reemplazar = instanciaData?.reemplazar ?? true;
        const instanciaCb = instanciaData?.callback ?? null;

        if (reemplazar) {
            if (instanciaCb) {
                instanciaCb(this);
            } else if (faseCallback) {
                faseCallback(this);
            }
        } else {
            if (instanciaCb) {
                instanciaCb(this);
            }
            if (faseCallback) {
                faseCallback(this);
            }
        }
    }

    /**
     * Ejecuta el callback de agotamiento para una fase específica.
     *
     * Respeta el modo `reemplazar` (true = solo instancia si existe, si no la de fase;
     * false = ambos, instancia primero y luego fase).
     *
     * @param {string} fase - Nombre de la fase en la que se ha agotado la energía.
     * @returns {void}
     * @private
     * @since V1.2.8
     */
    #ejecutar_callback_agotamiento(fase) {
        const instanciaData = this.#ejecutar_cuando_agota.get(fase);
        const faseCallback = NodoElectrico.ejecutar_cuando_agota_por_fase(fase);
        const reemplazar = instanciaData?.reemplazar ?? true;
        const instanciaCb = instanciaData?.callback ?? null;

        if (reemplazar) {
            if (instanciaCb) {
                instanciaCb(this);
            } else if (faseCallback) {
                faseCallback(this);
            }
        } else {
            if (instanciaCb) {
                instanciaCb(this);
            }
            if (faseCallback) {
                faseCallback(this);
            }
        }
    }

    // -----------------------------------------------------------------
    // Método público de energía
    // -----------------------------------------------------------------

    /**
     * Añade energía al nodo eléctrico en la fase activa.
     *
     * **Secuencia de operaciones:**
     * 1. Aplica las fugas pendientes llamando a `#fugar()`.
     * 2. Incrementa la energía de la fase actual con `cantidad_energia`.
     * 3. Si supera la capacidad, la ajusta y ejecuta el callback de saturación.
     * 4. Si queda en cero (o se vuelve cero), ejecuta el callback de agotamiento.
     *
     * ---
     * 🔗 Método complementario:
     * - {@link Nodos.NodoElectrico#energia energia()}
     *
     * ---
     * @param {number} cantidad_energia - Cantidad a añadir (puede ser negativa, aunque se recomienda usar la fuga para decrementar).
     * @returns {void}
     * @public
     * @since V1.2.8
     */
    _energia(cantidad_energia) {
        this.#fugar();

        const fase = NodoElectrico._fase_actual;
        let energia_actual = this.#energia.get(fase) ?? 0;
        if (!this.#ultima_fuga.has(fase)) {
            this.#ultima_fuga.set(fase, Date.now() / 1000);
        }
        energia_actual += cantidad_energia;

        if (energia_actual > this.#capacidad) {
            energia_actual = this.#capacidad;
            this.#ejecutar_callback_saturacion();
        }
        this.#energia.set(fase, energia_actual);

        if (energia_actual <= 0) {
            this.#energia.set(fase, 0);
            this.#ejecutar_callback_agotamiento(fase);
        }
    }

    // -----------------------------------------------------------------
    // Callbacks por instancia
    // -----------------------------------------------------------------

    /**
     * Registra un callback para cuando el nodo eléctrico se satura (por instancia).
     *
     * **Modos de ejecución:**
     * - `reemplazar = true` (por defecto): este callback **reemplaza** al callback por defecto de la fase.
     *   Solo se ejecutará este, a menos que sea null, en cuyo caso se ejecuta el de fase.
     * - `reemplazar = false`: este callback **complementa** al de fase. Se ejecutan ambos,
     *   primero el de instancia y luego el de fase (si existe).
     *
     * ---
     * 🔗 Métodos relacionados:
     * - {@link Nodos.NodoElectrico#ejecutar_cuando_satura ejecutar_cuando_satura()}
     * - {@link Nodos.NodoElectrico._ejecutar_cuando_satura_por_fase _ejecutar_cuando_satura_por_fase()}
     *
     * ---
     * @param {Function} funcion - Callback que recibirá el nodo como único argumento.
     * @param {boolean} [reemplazar=true] - Si `true`, reemplaza; si `false`, complementa.
     * @returns {void}
     * @public
     * @since V1.2.8
     */
    _ejecutar_cuando_satura(funcion, reemplazar = true) {
        this.#ejecutar_cuando_satura.set(NodoElectrico._fase_actual, { callback: funcion, reemplazar });
    }

    /**
     * Devuelve el callback de saturación registrado para la instancia (fase actual)
     * junto con el indicador de si reemplaza o complementa.
     *
     * El valor devuelto es un objeto con las propiedades `callback` y `reemplazar`.
     *
     * ---
     * 🔗 Método complementario:
     * - {@link Nodos.NodoElectrico#_ejecutar_cuando_satura _ejecutar_cuando_satura()}
     *
     * ---
     * @returns {{ callback: Function|null, reemplazar: boolean }}
     * @public
     * @since V1.2.8
     */
    ejecutar_cuando_satura() {
        const data = this.#ejecutar_cuando_satura.get(NodoElectrico._fase_actual);
        return data ? { callback: data.callback, reemplazar: data.reemplazar } : { callback: null, reemplazar: true };
    }

    /**
     * Registra un callback para cuando el nodo eléctrico se agota (energía llega a 0) por instancia.
     *
     * **Modos de ejecución:**
     * - `reemplazar = true`: reemplaza al callback por defecto de la fase.
     * - `reemplazar = false`: complementa (se ejecutan ambos, primero este).
     *
     * ---
     * 🔗 Métodos relacionados:
     * - {@link Nodos.NodoElectrico#ejecutar_cuando_agota ejecutar_cuando_agota()}
     * - {@link Nodos.NodoElectrico._ejecutar_cuando_agota_por_fase _ejecutar_cuando_agota_por_fase()}
     *
     * ---
     * @param {Function} funcion - Callback que recibirá el nodo como único argumento.
     * @param {boolean} [reemplazar=true] - Si `true`, reemplaza; si `false`, complementa.
     * @returns {void}
     * @public
     * @since V1.2.8
     */
    _ejecutar_cuando_agota(funcion, reemplazar = true) {
        this.#ejecutar_cuando_agota.set(NodoElectrico._fase_actual, { callback: funcion, reemplazar });
    }

    /**
     * Devuelve el callback de agotamiento registrado para la instancia (fase actual)
     * junto con el indicador de si reemplaza o complementa.
     *
     * @returns {{ callback: Function|null, reemplazar: boolean }}
     * @public
     * @since V1.2.8
     */
    ejecutar_cuando_agota() {
        const data = this.#ejecutar_cuando_agota.get(NodoElectrico._fase_actual);
        return data ? { callback: data.callback, reemplazar: data.reemplazar } : { callback: null, reemplazar: true };
    }

    // -----------------------------------------------------------------
    // Callbacks por defecto por fase (estáticos)
    // -----------------------------------------------------------------

    /**
     * Registra un callback por defecto de saturación para una fase determinada.
     *
     * Este callback se ejecutará cuando un nodo eléctrico en esa fase se sature,
     * **siempre que no exista un callback de instancia que lo reemplace**.
     *
     * ---
     * 🔗 Método complementario:
     * - {@link Nodos.NodoElectrico.ejecutar_cuando_satura_por_fase ejecutar_cuando_satura_por_fase()}
     *
     * ---
     * @param {Function} funcion - Callback que recibirá el nodo como argumento.
     * @param {string|null} [fase=null] - Nombre de la fase. Si es `null`, se usa la fase actual del sistema.
     * @returns {void}
     * @public
     * @static
     * @since V1.2.8
     */
    static _ejecutar_cuando_satura_por_fase(funcion, fase = null) {
        const f = fase ?? NodoElectrico._fase_actual;
        this.#ejecutar_cuando_satura_por_defecto_por_fase.set(f, funcion);
    }

    /**
     * Obtiene el callback por defecto de saturación registrado para una fase.
     *
     * @param {string|null} [fase=null] - Nombre de la fase. Si es `null`, se usa la fase actual.
     * @returns {Function|null}
     * @public
     * @static
     * @since V1.2.8
     */
    static ejecutar_cuando_satura_por_fase(fase = null) {
        const f = fase ?? NodoElectrico._fase_actual;
        return this.#ejecutar_cuando_satura_por_defecto_por_fase.get(f) ?? null;
    }

    /**
     * Registra un callback por defecto de agotamiento para una fase determinada.
     *
     * @param {Function} funcion - Callback que recibirá el nodo como argumento.
     * @param {string|null} [fase=null] - Nombre de la fase. Si es `null`, se usa la fase actual.
     * @returns {void}
     * @public
     * @static
     * @since V1.2.8
     */
    static _ejecutar_cuando_agota_por_fase(funcion, fase = null) {
        const f = fase ?? NodoElectrico._fase_actual;
        this.#ejecutar_cuando_agota_por_defecto_por_fase.set(f, funcion);
    }

    /**
     * Obtiene el callback por defecto de agotamiento registrado para una fase.
     *
     * @param {string|null} [fase=null] - Nombre de la fase. Si es `null`, se usa la fase actual.
     * @returns {Function|null}
     * @public
     * @static
     * @since V1.2.8
     */
    static ejecutar_cuando_agota_por_fase(fase = null) {
        const f = fase ?? NodoElectrico._fase_actual;
        return this.#ejecutar_cuando_agota_por_defecto_por_fase.get(f) ?? null;
    }

    // -----------------------------------------------------------------
    // Callback global (todas las fases)
    // -----------------------------------------------------------------

    /**
     * Registra un callback global que se ejecutará cuando **todas las fases**
     * del nodo eléctrico se queden sin energía (energía = 0).
     *
     * Este callback es útil para detectar que el nodo ha quedado completamente inactivo.
     *
     * ---
     * 🔗 Método complementario:
     * - {@link Nodos.NodoElectrico.ejecutar_cuando_agota_global ejecutar_cuando_agota_global()}
     *
     * ---
     * @param {Function} funcion - Callback que recibirá el nodo como argumento.
     * @returns {void}
     * @public
     * @static
     * @since V1.2.8
     */
    static _ejecutar_cuando_agota_global(funcion) {
        this.#ejecutar_cuando_agota_global = funcion;
    }

    /**
     * Devuelve el callback global de agotamiento (si está registrado).
     *
     * @returns {Function|null}
     * @public
     * @static
     * @since V1.2.8
     */
    static ejecutar_cuando_agota_global() {
        return this.#ejecutar_cuando_agota_global;
    }
    /**********************************************************************************************
     *  INTERFAZ ADYACENTES (INSTANCIA)
     * 
     *  Reemplazo de los metodos existentes
     **********************************************************************************************/
    /**
     * Verifica si el nodo eléctrico tiene al menos un adyacente (Interfaz {@link Nodos.Interfaces.Adyacentes Adyacentes}).
     *
	 * Este método comprueba si tiene al menos un nodo adyacente. O dicho de otro modo
	 * si tiene conexiones "salientes"; en tal caso devuelve true; caso contrario devuelve 
	 * false
	 * 
	 * Si el nodo está autoenlazado, es decir tiene algun enlace que sale de él hacia él
	 * mismo tambien devuelve true. 
	 *  
	 *⚠️ Importante: verifica las conexiciones de "salida", pero no las de "entrada". Para
	 * verificar las conexiones de entrada use
	 * {@link Nodos.NodoElectrico#tiene_incidente tiene_incidente}
     * 
     * ---
     * 🔗 Método complementario:
     * - {@link Nodos.NodoElectrico#tiene_incidente tiene_incidente}
     * 
     * ---
     * 🔗 Otros métodos relacionados:
     * - {@link Nodos.NodoElectrico#tiene_adyacente_a tiene_adyacente_a()}
     * - {@link Nodos.NodoElectrico#tiene_incidente_a tiene_incidente_a()}
     * - {@link Nodos.NodoElectrico#adyacente _adyacente}
     * - {@link Nodos.NodoElectrico#adyacentes _adyacente_en}
     * - {@link Nodos.NodoElectrico#eliminar_adyacente eliminar_adyacente}
     * - {@link Nodos.NodoElectrico#eliminar_adyacentes eliminar_adyacentes}
     * - {@link Nodos.NodoElectrico#cantidad_de_adyacentes cantidad_de_adyacentes}
     * - {@link Nodos.NodoElectrico#cantidad_de_incidentes cantidad_de_incidentes}
     * - {@link Nodos.NodoElectrico#adyacente adyacente}
     * - {@link Nodos.NodoElectrico#adyacentes adyacentes}
     * - {@link Nodos.NodoElectrico#por_cada_adyacente_ejecutar por_cada_adyacente_ejecutar}
     * - {@link Nodos.Nodo.validar_nombre_enlace validar_nombre_enlace}
     * 
     * ---
     * @example 
     * //Ejemplo de uso:
     * const nodo = NodoElectrico.crear();
     * if (nodo.tiene_adyacente()) {
     *     console.log("El nodo tiene adyacentes");
     * }else{
     *     console.log("El nodo no tiene adyacentes");//imprime esto
     * }
     * const otroNodo =NodoElectrico.crear();
     * nodo._adyacente(otroNodo);
     * if (nodo.tiene_adyacente()) {
     *     console.log("El nodo tiene adyacentes");//imprime esto
     * }else{
     *     console.log("El nodo no tiene adyacentes");
     * }
     * 
     * @note Internamente utiliza la propiedad `this.adyacentes`.
     * @return {boolean} Devuelve **true** si existe al menos un adyacente, o **false** en caso contrario.
     * @public
     * @since 0.1
     */
    tiene_adyacente() {
        console.log("m1");
        if (this._adyacentes === undefined) {
            return false;
        }
          console.log("m2");
        if (!this._adyacentes.size) {
            return false;
        } 
          console.log("m3");
        const faseactual =NodoElectrico._fase_actual;
        if (!this._adyacentes.has(faseactual)){
            return false;
        }
          console.log("m4");
        if (!this._adyacentes.get(faseactual).size){
            return false;
        }  console.log("m5");
        return true;
    }

    /**
     * Verifica si el nodo eléctrico actual tiene como adyacente al nodo indicado (Interfaz {@link Nodos.Interfaces.Adyacentes Adyacentes}).
     *
     * Comprueba si el nodo actual enlaza directamente hacia el nodo pasado como parámetro.  
     * Para optimizar, se valida tanto que el nodo actual posea adyacentes salientes 
     * como que el nodo objetivo tenga conexiones entrantes.
     *
     * ---
     * 🔗 Métodos complementario:
     * - {@link Nodos.NodoElectrico#tiene_incidente_a tiene_incidente_a()}
     *
     * ---
     * 🔗 Otros métodos relacionados:
     * - {@link Nodos.NodoElectrico#adyacente _adyacente}
     * - {@link Nodos.NodoElectrico#adyacentes _adyacente_en}
     * - {@link Nodos.NodoElectrico#eliminar_adyacente eliminar_adyacente}
     * - {@link Nodos.NodoElectrico#eliminar_adyacentes eliminar_adyacentes}
     * - {@link Nodos.NodoElectrico#cantidad_de_adyacentes cantidad_de_adyacentes}
     * - {@link Nodos.NodoElectrico#cantidad_de_incidentes cantidad_de_incidentes}
     * - {@link Nodos.NodoElectrico#tiene_adyacente tiene_adyacente}
     * - {@link Nodos.NodoElectrico#tiene_incidente tiene_incidente}
     * - {@link Nodos.NodoElectrico#adyacente adyacente}
     * - {@link Nodos.NodoElectrico#adyacentes adyacentes}
     * - {@link Nodos.NodoElectrico#por_cada_adyacente_ejecutar por_cada_adyacente_ejecutar}
     * - {@link Nodos.Nodo.validar_nombre_enlace validar_nombre_enlace}
     *
     * ---
     * @example
     * const nodoA = NodoElectrico.crear_con_dato("A");
     * const nodoB = NodoElectrico.crear_con_dato("B");
     * nodoA._adyacente_en(nodoB, "enlaceAB");
     *
     * const enlace = nodoA.tiene_adyacente_a(nodoB);
     * if (enlace) {
     *     console.log(`Existe el enlace "${enlace}" desde A hacia B`);
     * } else {
     *     console.log("No existe enlace");
     * }
     *
     * @note Solo devuelve el nombre del enlace si realmente existe; `false` en caso contrario.
     * @param {NodoElectrico} nodo Nodo a verificar.
     * @return {string|boolean} Nombre del enlace si existe, `false` en caso contrario.
     * @public
     * @since 0.0.1
     */
    tiene_adyacente_a(nodo) {
        if (!(nodo instanceof NodoElectrico)) {
            NodoElectrico._error("El nodo que intenta comprobar no es una instancia de la clase NodoElectrico.");
            return false;
        }
        const fase_actual = NodoElectrico._fase_actual;
        const adyacentes_fase = this._adyacentes?.get(fase_actual);
        if (!adyacentes_fase || adyacentes_fase.size === 0) {
            return false;
        }
        const id_objetivo = nodo.id();
        for (const [nombre_enlace, valor] of adyacentes_fase) {
            const nodo_ady = (valor instanceof Enlace) ? valor.nodo : valor;
            if (nodo_ady.id() === id_objetivo) {
                return nombre_enlace;
            }
        }
        return false;
    }

    /**
     * Devuelve el nodo adyacente en el enlace especificado (Interfaz {@link Nodos.Interfaces.Adyacentes Adyacentes}).
     *
     * Comprueba si existe un nodo en el enlace indicado y lo devuelve;  
     * si no existe, devuelve `null`. Para asegurar consistencia.
     *
     * ---
     * 🔗 Método complementario:
     * - {@link Nodos.NodoElectrico#adyacentes adyacentes}
     * 
     * ---
     * 🔗 Otros métodos relacionados:
     * - {@link Nodos.NodoElectrico#cantidad_de_adyacentes cantidad_de_adyacentes}
     * - {@link Nodos.NodoElectrico#cantidad_de_incidentes cantidad_de_incidentes}
     * - {@link Nodos.NodoElectrico#tiene_adyacente tiene_adyacente}
     * - {@link Nodos.NodoElectrico#tiene_incidente tiene_incidente}
     * - {@link Nodos.NodoElectrico#adyacente _adyacente}
     * - {@link Nodos.NodoElectrico#adyacentes _adyacente_en}
     * - {@link Nodos.NodoElectrico#tiene_adyacente_a tiene_adyacente_a}
     * - {@link Nodos.NodoElectrico#tiene_incidente_a tiene_incidente_a}
     * - {@link Nodos.NodoElectrico#eliminar_adyacente eliminar_adyacente}
     * - {@link Nodos.NodoElectrico#eliminar_adyacentes eliminar_adyacentes}
     * - {@link Nodos.NodoElectrico#por_cada_adyacente_ejecutar por_cada_adyacente_ejecutar}
     * - {@link Nodos.Nodo.validar_nombre_enlace validar_nombre_enlace}
     *
     * ---
     * @example
     * const n1 = NodoElectrico.crear_con_dato("A");
     * const n2 = NodoElectrico.crear_con_dato("B");
     * n1._adyacente_en(n2, "enlaceAB");
     *
     * const ady = n1.adyacente("enlaceAB");
     * if (ady) console.log("Nodo adyacente:", ady.dato());//B
     *
     * @note Devuelve `null` si no hay nodo en el enlace.
     * @param {string} enlace El identificador del enlace a consultar
     * @return {NodoElectrico|null} Nodo adyacente si existe, `null` en caso contrario
     */
    adyacente(enlace) {
        console.log("s1");
        if (!NodoElectrico.validar_nombre_enlace(enlace)){
            console.log("s2");
            this.constructor._error("El enlace debe ser un string válido");
            return null;
        }
        console.log("s3");
        if (this._adyacentes === undefined) {
            return null;
        }
        console.log("s4");
        if (!this._adyacentes.size) {
            console.log(this._adyacentes);
            return null;
       } 
        console.log("s5");
        const fase_actual = NodoElectrico._fase_actual;
        if (!this._adyacentes.has(fase_actual)){
            return null;
        }
        console.log("s6");
        if (!this._adyacentes.get(fase_actual).size){
            return null;
        }
        console.log("s7");
        const valor = this._adyacentes.get(fase_actual).get(enlace) ?? null;
        if (valor === null) return null;
        return (valor instanceof Enlace) ? valor.nodo : valor;
    }

    /**
     * Devuelve una copia de todos los adyacentes (Interfaz {@link Nodos.Interfaces.Adyacentes# Adyacentes}).
     *
     * Retorna todos los nodos adyacentes del nodo eléctrico actual en un `Map` independiente, 
     * asegurando que sea una "foto" del estado al momento de la llamada.  
     * Si el nodo no tiene adyacentes, devuelve `null`.  
     * Se utiliza para obtener de manera segura los enlaces actuales sin exponer la referencia interna.
     *
     * ---
     * 🔗 Método complementario:
     * - {@link Nodos.NodoElectrico#adyacente adyacente}
     *
     * ---
     * 🔗 Otros métodos relacionados:
     * - {@link Nodos.NodoElectrico#cantidad_de_adyacentes cantidad_de_adyacentes}
     * - {@link Nodos.NodoElectrico#cantidad_de_incidentes cantidad_de_incidentes}
     * - {@link Nodos.NodoElectrico#tiene_adyacente tiene_adyacente}
     * - {@link Nodos.NodoElectrico#tiene_incidente tiene_incidente}
     * - {@link Nodos.NodoElectrico#adyacente _adyacente}
     * - {@link Nodos.NodoElectrico#adyacentes _adyacente_en}
     * - {@link Nodos.NodoElectrico#tiene_adyacente_a tiene_adyacente_a}
     * - {@link Nodos.NodoElectrico#tiene_incidente_a tiene_incidente_a}
     * - {@link Nodos.NodoElectrico#eliminar_adyacente eliminar_adyacente}
     * - {@link Nodos.NodoElectrico#eliminar_adyacentes eliminar_adyacentes}
     * - {@link Nodos.NodoElectrico#por_cada_adyacente_ejecutar por_cada_adyacente_ejecutar}
     * - {@link Nodos.Nodo.validar_nombre_enlace validar_nombre_enlace}
     * 
     * ---
     * @example 
     * //Ejemplo de uso:
     * const nodo = NodoElectrico.crear();
     * nodo._adyacente(NodoElectrico.crear_con_id("A"));
     * nodo._adyacente(NodoElectrico.crear_con_id("B"));
     * const todos = nodo.adyacentes();
     * if (todos !== null) {
     *   for (const [enlace, ady] of todos) {
     *     console.log(`Enlace: ${enlace}, Nodo ID: ${ady.id()}`);//imprimo cada adyacente
     *     todos.delete(enlace);//elimina en el resultado pero no afecta la estructura del nodo original
     *   }
     * }
     * //comprobacion
     * console.log("compruebo eliminacion en resultado")
     * for (const [enlace, ady] of todos) {
     *     console.log(`Enlace: ${enlace}, Nodo ID: ${ady.id()}`);//no imprime nada ya que no hay nada
     *   }
     * console.log("comprobacion nuevo resultado");
     * const todos2 = nodo.adyacentes();
     * if (todos2 !== null) {
     *   for (const [enlace, ady] of todos2) {
     *     console.log(`Enlace: ${enlace}, Nodo ID: ${ady.id()}`);//imprime lo mismo que antes
     *   }
     * }
     *
     * @note Se devuelve un nuevo Map, copia superficial de #adyacentes.
     * @param void
     * @return {?Map<string|number, NodoElectrico>} Map con nodos adyacentes o `null` si no existen
     * @public
     * @since V0.0.1
     */
    adyacentes() {
        if (!this.tiene_adyacente()) {
            return null;
        }
        const fase_actual = NodoElectrico._fase_actual;
        const adyacentes_fase = this._adyacentes.get(fase_actual);
        if (!adyacentes_fase || adyacentes_fase.size === 0) {
            return null;
        }
        const resultado = new Map();
        for (const [enlace, valor] of adyacentes_fase) {
            resultado.set(enlace, (valor instanceof Enlace) ? valor.nodo : valor);
        }
        return resultado;
    }
    /**
     * Devuelve la cantidad de adyacentes (Interfaz {@link Nodos.Interfaces.Adyacentes Adyacentes}).
     *
     * Retorna el número total de nodos adyacentes actualmente vinculados al nodo eléctrico.  
     * Si no existen adyacentes, devuelve `0`.  
     * Este método permite conocer de manera rápida el grado de salida del nodo.
     *
     * ---
     * 🔗 Método complementario:
     * - {@link Nodos.NodoElectrico#cantidad_de_incidentes cantidad_de_incidentes}
     *
     * ---
     * 🔗 Otros métodos relacionados:
     * - {@link Nodos.NodoElectrico#adyacente _adyacente}
     * - {@link Nodos.NodoElectrico#adyacentes _adyacente_en}
     * - {@link Nodos.NodoElectrico#eliminar_adyacente eliminar_adyacente}
     * - {@link Nodos.NodoElectrico#eliminar_adyacentes eliminar_adyacentes}
     * - {@link Nodos.NodoElectrico#tiene_adyacente tiene_adyacente}
     * - {@link Nodos.NodoElectrico#tiene_incidente tiene_incidente}
     * - {@link Nodos.NodoElectrico#adyacente adyacente}
     * - {@link Nodos.NodoElectrico#adyacentes adyacentes}
     * - {@link Nodos.NodoElectrico#tiene_adyacente_a tiene_adyacente_a}
     * - {@link Nodos.NodoElectrico#tiene_incidente_a tiene_incidente_a}
     * - {@link Nodos.NodoElectrico#por_cada_adyacente_ejecutar por_cada_adyacente_ejecutar}
     * - {@link Nodos.Nodo.validar_nombre_enlace validar_nombre_enlace}
     *
     * ---
     * @example 
     * //Ejemplo de uso:
     * const nodo = NodoElectrico.crear();
     * const otro1 = NodoElectrico.crear();
     * const otro2 = NodoElectrico.crear();
     * nodo._adyacente_en(otro1, "X");
     * nodo._adyacente_en(otro2, "Y");
     * console.log(nodo.cantidad_de_adyacentes()); // 2
     *
     * @note Si no hay adyacentes inicializados, retorna 0 directamente.
     * @param void
     * @return {number} Cantidad de adyacentes del nodo
     * @since 0.0.1
     * @public
     */
    cantidad_de_adyacentes() {
        if (this._adyacentes !== undefined && this._adyacentes.size > 0 && this._adyacentes.has(NodoElectrico._fase_actual)) {
            return this._adyacentes.get(NodoElectrico._fase_actual).size;
        } else {
            return 0;
        }
    }

        /**
     * Devuelve la cantidad total de adyacentes (salientes) sumando todas las fases.
     *
     * A diferencia de {@link Nodos.NodoElectrico#cantidad_de_adyacentes cantidad_de_adyacentes()}
     * que solo cuenta en la **fase actual**, este método recorre todas las fases
     * en las que el nodo eléctrico tiene actividad y suma la totalidad de enlaces salientes.
     *
     * Es especialmente útil cuando se trabaja con múltiples fases y se necesita
     * conocer el grado de salida global del nodo eléctrico, independientemente de la fase activa.
     *
     * La implementación es **opcional** según la interfaz, pero en `NodoElectrico`
     * se implementa completamente.
     *
     * ---
     * 🔗 Método complementario:
     * - {@link Nodos.NodoElectrico#cantidad_de_adyacentes cantidad_de_adyacentes()}
     * - {@link Nodos.NodoElectrico#cantidad_de_incidentes_global cantidad_de_incidentes_global()}
     *
     * ---
     * 🔗 Otros métodos relacionados (adyacentes):
     * - {@link Nodos.NodoElectrico#_adyacente _adyacente}
     * - {@link Nodos.NodoElectrico#_adyacente_en _adyacente_en}
     * - {@link Nodos.NodoElectrico#adyacentes adyacentes}
     * - {@link Nodos.NodoElectrico#tiene_adyacente tiene_adyacente}
     * - {@link Nodos.NodoElectrico#eliminar_adyacente eliminar_adyacente}
     * - {@link Nodos.NodoElectrico#por_cada_adyacente_ejecutar por_cada_adyacente_ejecutar}
     *
     * ---
     * @example
     * // Supongamos dos fases con diferentes enlaces
     * Controlador._fase(token, 'fase1');
     * nodo._adyacente_en(otro, 'enlace1');
     * Controlador._fase(token, 'fase2');
     * nodo._adyacente_en(otro2, 'enlace2');
     *
     * console.log(nodo.cantidad_de_adyacentes_global()); // 2
     * console.log(nodo.cantidad_de_adyacentes()); // 1 (solo fase actual 'fase2')
     *
     * @returns {number} Número total de adyacentes en todas las fases.
     * @public
     * @since V1.2.7
     */
    cantidad_de_adyacentes_global() {
        let total = 0;
        if (this._adyacentes !== undefined && this._adyacentes.size > 0) {
            for (const adyacentesFase of this._adyacentes.values()) {
                if (adyacentesFase && adyacentesFase.size > 0) {
                    total += adyacentesFase.size;
                }
            }
        }
        return total;
    }

    /**
     * Asigna un adyacente con nombre único (Interfaz {@link Nodos.Interfaces.Adyacentes Adyacentes}).
     *
     * Agrega un nodo como adyacente generando automáticamente un nombre de enlace único
     * basado en el `id()` del nodo destino.  
     * Si ya existe un enlace con ese nombre, se crean variantes incrementales (`id.1`, `id.2`, ...).
     *
     * ---
     * 🔗 Método complementario:
     * - {@link Nodos.NodoElectrico#_adyacente_en _adyacente_en}
     * 
     * ---
     * 🔗 Otros métodos relacionados:
     * - {@link Nodos.NodoElectrico#cantidad_de_adyacentes cantidad_de_adyacentes}
     * - {@link Nodos.NodoElectrico#cantidad_de_incidentes cantidad_de_incidentes}
     * - {@link Nodos.NodoElectrico#tiene_adyacente tiene_adyacente}
     * - {@link Nodos.NodoElectrico#tiene_incidente tiene_incidente}
     * - {@link Nodos.NodoElectrico#adyacente adyacente}
     * - {@link Nodos.NodoElectrico#adyacentes adyacentes}
     * - {@link Nodos.NodoElectrico#tiene_adyacente_a tiene_adyacente_a}
     * - {@link Nodos.NodoElectrico#tiene_incidente_a tiene_incidente_a}
     * - {@link Nodos.NodoElectrico#eliminar_adyacente eliminar_adyacente}
     * - {@link Nodos.NodoElectrico#eliminar_adyacentes eliminar_adyacentes}
     * - {@link Nodos.NodoElectrico#por_cada_adyacente_ejecutar por_cada_adyacente_ejecutar}
     * - {@link Nodos.Nodo.validar_nombre_enlace validar_nombre_enlace}
     * 
     * ---
     * @example
     * //Ejemplo de uso:
     * const nodo = NodoElectrico.crear();
     * const otro1 = NodoElectrico.crear_con_id("ejemplo");
     * const otro2 = NodoElectrico.crear_con_id("otro_ejemplo");
     * 
     * const enlace1=nodo._adyacente(otro1); // crea enlace "ejemplo" a otro1
     * const enlace2=nodo._adyacente(otro2); // crea enlace "otro_ejemplo" a otro2
     * const enlace3=nodo._adyacente(otro1); // crea enlace "ejemplo.1" a otro1
     * 
     * console.log("En el enlace "+enlace1+" se agrego el nodo "+nodo.adyacente(enlace1).id()); //ejemplo / ejemplo
     * console.log("En el enlace "+enlace2+" se agrego el nodo "+nodo.adyacente(enlace2).id()); //otro_ejemplo / otro_ejemplo
     * console.log("En el enlace "+enlace3+" se agrego el nodo "+nodo.adyacente(enlace3).id()); //ejemplo.1 / ejemplo
     *
     * @note Usa internamente _adyacente_en para registrar el enlace final.
     * @param {NodoElectrico} un_nodo Nodo que se desea enlazar
     * @return {NodoElectrico} Nodo adyacente recién asignado
     */
    _adyacente(un_nodo)  {
        // Validación de tipo
        if (!(un_nodo instanceof this.constructor)) {
            this.constructor._error("el parámetro debe ser una instancia de NodoElectrico");
            return null;
        }
        // Inicialización perezosa
        if (!this._adyacentes) {
            this._adyacentes = new Map();
        }
        const fase=NodoElectrico._fase_actual;
        if (!this._adyacentes.has(fase)){
            this._adyacentes.set(fase, new Map());
        }
        const adyacentes=this._adyacentes.get(fase);
        let cont = 1;
        const id = String(un_nodo.id());
        let enlace = id;
        
        // Buscar enlace único (Map usa .has())
        console.log("m2mama"+id+cont);
        while (adyacentes.has(enlace)) {
            console.log("mmama"+id+cont);
            enlace = `${id}.${cont}`;
            cont++;
        }
        
        // Asignar adyacente
        adyacentes.set(enlace, un_nodo);
        //if (un_nodo.incidente(enlace)===null){
        un_nodo._incidente_en(this, enlace);
        //}
        // Sumar referencias
        un_nodo._referencias++;
        
        return enlace;
    }
 /**
     * Establece un nodo adyacente con nombre de enlace específico (Interfaz {@link Nodos.Interfaces.Adyacentes Adyacentes}).
     *
     * Crea o reemplaza una relación de adyacencia con otro nodo usando un nombre de enlace
     * específico. Maneja inicialización perezosa de estructuras y actualiza referencias.
     * 
     * ---
     * 🔗 Método complementario:
     * - {@link Nodos.NodoElectrico#_adyacente _adyacente}
     *
     * ---
     * 🔗 Otros métodos relacionados:
     * - {@link Nodos.NodoElectrico#cantidad_de_adyacentes cantidad_de_adyacentes}
     * - {@link Nodos.NodoElectrico#cantidad_de_incidentes cantidad_de_incidentes}
     * - {@link Nodos.NodoElectrico#tiene_adyacente tiene_adyacente}
     * - {@link Nodos.NodoElectrico#tiene_incidente tiene_incidente}
     * - {@link Nodos.NodoElectrico#adyacente adyacente}
     * - {@link Nodos.NodoElectrico#adyacentes adyacentes}
     * - {@link Nodos.NodoElectrico#tiene_adyacente_a tiene_adyacente_a}
     * - {@link Nodos.NodoElectrico#tiene_incidente_a tiene_incidente_a}
     * - {@link Nodos.NodoElectrico#eliminar_adyacente eliminar_adyacente}
     * - {@link Nodos.NodoElectrico#eliminar_adyacentes eliminar_adyacentes}
     * - {@link Nodos.NodoElectrico#por_cada_adyacente_ejecutar por_cada_adyacente_ejecutar}
     * - {@link Nodos.Nodo.validar_nombre_enlace validar_nombre_enlace}
     * 
     * @example
     * // Ejemplo de uso:
     * const nodo1 = NodoElectrico.crear();
     * const nodo2 = NodoElectrico.crear();
     * nodo1._adyacente_en(nodo2, "enlace_principal", true);
     *
     * @note Si $reemplazar es false y el enlace existe, fallará.
     * @param {NodoElectrico} un_nodo Nodo a establecer como adyacente
     * @param {string} enlace Nombre del enlace
     * @param {boolean} reemplazar Permite reemplazar enlace existente
     * @return {boolean} True si éxito, false si error
     * @public
     * @since 0.0.1
     */
    _adyacente_en(un_nodo, enlace, reemplazar = false) {
        if (!(un_nodo instanceof this.constructor)) {
            this.constructor._error("El nodo que intenta asignar no es un NodoElectrico");
            return false;
        }
        
        if (!this.constructor.validar_nombre_enlace(enlace)) {
            this.constructor._error("El enlace debe ser un string válido");
            return false;
        }
        
        if (!this._adyacentes) {
            this._adyacentes = new Map();
        }
        
        const fase = NodoElectrico._fase_actual;
        if (!this._adyacentes.has(fase)) {
            this._adyacentes.set(fase, new Map());
        }
        
        const adyacentes = this._adyacentes.get(fase);
        
        if (adyacentes.has(enlace)) {
            if (reemplazar) {
                const valor_existente = adyacentes.get(enlace);
                const nodo_existente = (valor_existente instanceof Enlace) ? valor_existente.nodo : valor_existente;
                
                // 1. Eliminamos el enlace de ida primero
                adyacentes.delete(enlace);
                
                // 2. Ahora eliminamos el incidente (el enlace de ida ya no existe)
                nodo_existente._referencias--;
                nodo_existente.eliminar_incidente(this, enlace);
            } else {
                this.constructor._error("Ya existía un nodo en el enlace que intenta asignar");
                return false;
            }
        }
        
        // Asignar nuevo nodo
        adyacentes.set(enlace, un_nodo);
        un_nodo._incidente_en(this, enlace);
        un_nodo._referencias++;
        
        return true;
    }

        /**
     * Elimina un nodo adyacente específico (Interfaz {@link Nodos.Interfaces.Adyacentes Adyacentes}).
     *
     * Remueve la relación de adyacencia en el enlace especificado y actualiza las
     * referencias del nodo eliminado. Devuelve el nodo eliminado o null si no existe.
     * 
     * ---
     * 🔗 Método complementario:
     * - {@link Nodos.NodoElectrico#eliminar_adyacentes eliminar_adyacentes}
     *
     * ---
     * 🔗 Otros métodos relacionados:
     * - {@link Nodos.NodoElectrico#_adyacente _adyacente}
     * - {@link Nodos.NodoElectrico#_adyacente_en _adyacente_en}
     * - {@link Nodos.NodoElectrico#cantidad_de_adyacentes cantidad_de_adyacentes}
     * - {@link Nodos.NodoElectrico#cantidad_de_incidentes cantidad_de_incidentes}
     * - {@link Nodos.NodoElectrico#tiene_adyacente tiene_adyacente}
     * - {@link Nodos.NodoElectrico#tiene_incidente tiene_incidente}
     * - {@link Nodos.NodoElectrico#adyacente adyacente}
     * - {@link Nodos.NodoElectrico#adyacentes adyacentes}
     * - {@link Nodos.NodoElectrico#tiene_adyacente_a tiene_adyacente_a}
     * - {@link Nodos.NodoElectrico#tiene_incidente_a tiene_incidente_a}
     * - {@link Nodos.NodoElectrico#por_cada_adyacente_ejecutar por_cada_adyacente_ejecutar}
     * - {@link Nodos.Nodo.validar_nombre_enlace validar_nombre_enlace}
     * ---
     * @example
     * // Ejemplo de uso:
     * const nodo = NodoElectrico.crear();
     * const eliminado = nodo.eliminar_adyacente("enlace_especifico");
     *
     * @note También elimina la relación incidente correspondiente.
     * @param {string} enlace Nombre del enlace a eliminar
     * @return {NodoElectrico|null} Nodo eliminado o null si no existe
     * @public
     * @since 0.0.1
     */
    eliminar_adyacente(enlace) {
        if (!this.constructor.validar_nombre_enlace(enlace)) {
            this.constructor._error("El enlace a eliminar no es válido");
            return null;
        }
        
        if (this._adyacentes===undefined) {
            this.constructor._alerta("No hay adyacentes para eliminar");
            return null;
        }
        
        const fase = NodoElectrico._fase_actual;
        if (!this._adyacentes.has(fase)) {
            this.constructor._alerta("No hay adyacentes para eliminar en la fase");
            return null;
        }
        
        const adyacentes = this._adyacentes.get(fase);
        
        if (!adyacentes.has(enlace)) {
            this.constructor._alerta(`El enlace ${enlace} que se intenta eliminar no existe`);
            return null;
        }
        
        const valor = adyacentes.get(enlace);
        const eliminado = (valor instanceof Enlace) ? valor.nodo : valor;
        eliminado._referencias--;
        adyacentes.delete(enlace);
        eliminado.eliminar_incidente(this, enlace);
        
        return eliminado;
    }

    /**
     * Elimina todos los enlaces del nodo eléctrico (Interfaz {@link Nodos.Interfaces.Adyacentes Adyacentes}).
     *
     * Borra todas las conexiones salientes del nodo eléctrico.  
     * Si no existen enlaces a adyacentes, lanza una alerta y devuelve un Map vacío.  
     * Si existen enlaces salientes, antes de eliminarlos, genera una copia de los
     * mismos con sus nodos adyacentes actuales y los devuelve. 
     * Permite de esa manera obtener una "foto" del estado previo del nodo.
     *
	   * ⚠️ Importante: Este método no elimina los nodos del sistema. Si se eliminan
	   * todos los enlaces que conectan a un nodo este aún permanece en el sistema 
	   * como nodo suelto a menos que se use el metodo estatico
	   * {@link ./classes/Nodos.NodoElectrico.eliminar NodoElectrico::eliminar($nodo)}
     * 
     * ---
     * 🔗 Método complementario:
     * - {@link Nodos.NodoElectrico#eliminar_enlace eliminar_enlace}
     *
     * ---
     * 🔗 Otros métodos relacionados:
     * - {@link Nodos.NodoElectrico#_adyacente _adyacente}
     * - {@link Nodos.NodoElectrico#_adyacente_en _adyacente_en}
     * - {@link Nodos.NodoElectrico#cantidad_de_adyacentes cantidad_de_adyacentes}
     * - {@link Nodos.NodoElectrico#cantidad_de_incidentes cantidad_de_incidentes}
     * - {@link Nodos.NodoElectrico#tiene_adyacente tiene_adyacente}
     * - {@link Nodos.NodoElectrico#tiene_incidente tiene_incidente}
     * - {@link Nodos.NodoElectrico#adyacente adyacente}
     * - {@link Nodos.NodoElectrico#adyacentes adyacentes}
     * - {@link Nodos.NodoElectrico#tiene_adyacente_a tiene_adyacente_a}
     * - {@link Nodos.NodoElectrico#tiene_incidente_a tiene_incidente_a}
     * - {@link Nodos.NodoElectrico#por_cada_adyacente_ejecutar por_cada_adyacente_ejecutar}
     * - {@link Nodos.Nodo.validar_nombre_enlace validar_nombre_enlace}
     *
     * ---
     * @example 
     * //Ejemplo de uso:
     * const nodo = NodoElectrico.crear_con_id("nodo");
     * const otroA = NodoElectrico.crear_con_id("otroA");
     * const otroB = NodoElectrico.crear_con_id("otroB");
     * nodo._adyacente_en(otroA, "A");
     * nodo._adyacente_en(otroB, "B");
     * console.log("Se agregaron enlaces:")
     * const todos=nodo.adyacentes();
     * if (todos) {
     *   for (const [enlace, ady] of todos) {
     *     console.log(`Enlace: ${enlace}, Nodo ID: ${ady.id()}`);//imprimo cada adyacente
     *   }
     * }
     * const copia = nodo.eliminar_enlaces();
     * console.log("Se eliminaron enlaces:"");
     * if (copia){
     *    for (const [enlace, eliminado] of copia) {
     *       console.log("Enlace: "+enlace+ "Nodo ID: "+ eliminado.id()); 
     *    }
     * }
     * console.log("Comprobación");
     * const todos2=nodo.adyacentes();
     * if (todos2){
     *    console.log("Aún tiene adyacentes, algo falló");
     * }else{
     *    console.log("No tiene ningún adyacente");//imprime esto
     * }
     *
     * @public
     * @note Devuelve un Map con todos los adyacentes antes de eliminarlos.
     * @param void
     * @return {Map<string|number, NodoElectrico>} Map con los nodos eliminados, o Map vacío si no había adyacentes
     * @since Modificado en V3.2.3
     * @deprecated
     */
    eliminar_adyacentes() {
        if (this._adyacentes===undefined) {
            this.constructor._alerta("No hay adyacentes para eliminar");
            return new Map();
        }
        
        const fase = NodoElectrico._fase_actual;
        if (!this._adyacentes.has(fase)) {
            this.constructor._alerta("No hay adyacentes para eliminar en la fase");
            return new Map();
        }
        
        const adyacentes = this._adyacentes.get(fase);
        const copia = new Map();
        // Iteramos sobre una copia de las claves para poder eliminar mientras recorremos
        for (const enlace of [...adyacentes.keys()]) {
            const valor = adyacentes.get(enlace);
            const eliminado = (valor instanceof Enlace) ? valor.nodo : valor;
            copia.set(enlace, eliminado);
            // 1. Eliminamos el enlace de ida
            adyacentes.delete(enlace);
            // 2. Decrementamos referencias y eliminamos el incidente (ahora el enlace de ida ya no existe)
            eliminado._referencias--;
            eliminado.eliminar_incidente(this, enlace);
        }
        // El Map ya está vacío, no hace falta clear()
        return copia;
    }
    
   /**
     * Ejecuta una función por cada nodo adyacente (Interfaz {@link Nodos.Interfaces.Adyacentes Adyacentes}).
     *
     * Itera sobre todos los nodos adyacentes ejecutando una función callback para cada uno.
     * La función recibe el nodo adyacente, nombre del enlace y parámetros adicionales.
     * 
     * ---
     * 🔗 Métodos relacionados:
     * - {@link Nodos.NodoElectrico#por_cada_incidente_ejecutar por_cada_incidente_ejecutar}
     * - {@link Nodos.NodoElectrico#adyacentes adyacentes}
     *
     * ---
     * 
     * 🔗 Otros métodos relacionados:
     * - {@link Nodos.NodoElectrico#_adyacente _adyacente}
     * - {@link Nodos.NodoElectrico#_adyacente_en _adyacente_en}
     * - {@link Nodos.NodoElectrico#cantidad_de_adyacentes cantidad_de_adyacentes}
     * - {@link Nodos.NodoElectrico#cantidad_de_incidentes cantidad_de_incidentes}
     * - {@link Nodos.NodoElectrico#tiene_adyacente tiene_adyacente}
     * - {@link Nodos.NodoElectrico#tiene_incidente tiene_incidente}
     * - {@link Nodos.NodoElectrico#adyacente adyacente}
     * - {@link Nodos.NodoElectrico#adyacentes adyacentes}
     * - {@link Nodos.NodoElectrico#tiene_adyacente_a tiene_adyacente_a}
     * - {@link Nodos.NodoElectrico#tiene_incidente_a tiene_incidente_a}
     * - {@link Nodos.NodoElectrico#eliminar_adyacente eliminar_adyacente}
     * - {@link Nodos.NodoElectrico#eliminar_adyacentes eliminar_adyacentes}
     * - {@link Nodos.Nodo.validar_nombre_enlace validar_nombre_enlace}
     * ---
     * 
     * @example
     * // Ejemplo de uso:
     * nodo.por_cada_adyacente_ejecutar((ady, enlace) => {
     *     console.log(`Procesando adyacente en enlace: ${enlace}`);
     * }, parametro_extra);
     *
     * @note Devuelve array con resultados de cada ejecución.
     * @param {Function} funcion Función a ejecutar
     * @param {...any} parametros Parámetros adicionales para la función
     * @return {Map|null} Array asociativo con resultados o null si no hay adyacentes
     * @public
     * @since 0.0.1
     */
    por_cada_adyacente_ejecutar(funcion, ...parametros) {
        if (this._adyacentes===undefined || this._adyacentes.size<1) {
            this.constructor._alerta("Alerta: no existe adyacente");
            return null;
        }

        const resultados = new Map();
        const adyacentes = this._adyacentes.get(NodoElectrico._fase_actual);
        
        for (const [enlace, valor] of adyacentes) {
            const nodo = (valor instanceof Enlace) ? valor.nodo : valor;
            if (nodo) {
                resultados.set(enlace, funcion(nodo, enlace, ...parametros));
            }
        }
        
        return resultados;
    }

    /**********************************************************************************************
     *  INTERFAZ INCIDENTES (INSTANCIA)
     * 
     *  Reemplazo de los metodos existentes
     *  Esta interfaz talves si valga la pena extraerla y diferenciarla de la de Adyacentes
     **********************************************************************************************/

     /**
     * Verifica si el nodo eléctrico es adyacente de al menos un nodo (Interfaz {@link Nodos.Interfaces.Incidentes Incidentes}).
     *
     * Evalúa si no existe al menos otro nodo que lo tenga él como adyacente. O dicho de 
     * otro modo, si no tiene conexiones "entrantes"; en tal caso se concidera "suelto"
     * y devuelve true; caso contrario devuelve false.
     * 
     * Si el nodo está autoenlazado, es decir tiene algun enlace que sale de él hacia él
     * mismo ya no se concidera "suelto" y devuelve false. 
     * 
     * ⚠️ Importante: verifica las conexiciones de "entrada", pero no las de "salida".
     * Para verificar las conexiones de "salida" utilice 
     * {@link Nodos.NodoElectrico#tiene_adyacente tiene_adyacente}
     *
     * ---
     * 🔗 Método complementario:
     * - {@link Nodos.NodoElectrico#tiene_adyacente tiene_adyacente}  
     * 
     * ---
     * 🔗 Otros métodos relacionados:
     * - {@link Nodos.NodoElectrico#tiene_adyacente_a tiene_adyacente_a()}
     * - {@link Nodos.NodoElectrico#tiene_incidente_a tiene_incidente_a()}
     * - {@link Nodos.NodoElectrico#adyacente _adyacente}
     * - {@link Nodos.NodoElectrico#adyacentes _adyacente_en}
     * - {@link Nodos.NodoElectrico#eliminar_adyacente eliminar_adyacente}
     * - {@link Nodos.NodoElectrico#eliminar_adyacentes eliminar_adyacentes}
     * - {@link Nodos.NodoElectrico#cantidad_de_adyacentes cantidad_de_adyacentes}
     * - {@link Nodos.NodoElectrico#cantidad_de_incidentes cantidad_de_incidentes}
     * - {@link Nodos.NodoElectrico#adyacente adyacente}
     * - {@link Nodos.NodoElectrico#adyacentes adyacentes}
     * - {@link Nodos.NodoElectrico#por_cada_adyacente_ejecutar por_cada_adyacente_ejecutar}
     * - {@link Nodos.Nodo.validar_nombre_enlace validar_nombre_enlace}
     * 
     * ---
     * @example 
     * //Ejemplo de uso:
     * const nodo = NodoElectrico.crear();
     * if (nodo.tiene_incidente()) {
     *     console.log("El nodo tiene conexiones entrantes.");
     * }else{
     *     console.log("El nodo no tiene conexiones entrantes.");//imprime esto
     * }
     * const otroNodo = NodoElectrico.crear();
     * otroNodo._adyacente(nodo);
     * if (nodo.tiene_incidente()) {
     *     console.log("El nodo tiene conexiones entrantes.");//imprime esto
     * }else{
     *     console.log("El nodo no tiene conexiones entrantes.");
     * }
     * 
     * @note Utiliza la propiedad interna `this._referencias` y el método `es_especial()`.
     * @return {boolean} Devuelve **true** si el nodo está considerado suelto, o **false** en caso contrario.
     * @public
     * @since 0.0.1
     */		
    tiene_incidente() {
        if (this._incidentes === undefined) {
            return false;
        }
        if (!this._incidentes.size) {
            return false;
        } 
        const idincidentes=this._incidentes;
        const fase=NodoElectrico._fase_actual;
        for(const [idincidente, fases] of idincidentes){
            if(fases.has(fase)){
                const res=fases.size;
                if (res) return true;
            }
        }
        return false;
    }

    /**
     * Verifica si el nodo eléctrico actual es adyacente del nodo indicado (Interfaz {@link Nodos.Interfaces.Adyacentes Adyacentes}).
     *
     * Comprueba si el nodo actual se encuentra enlazado desde el nodo pasado como parámetro.  
     * Para optimizar, se valida tanto que el nodo actual posea conexiones entrantes 
     * como que el nodo objetivo tenga adyacentes salientes.
     *
     * ---
     * 🔗 Método complementario:
     * - {@link Nodos.NodoElectrico#tiene_adyacente_a tiene_adyacente_a()}
     *
     * ---
     * 🔗 Otros métodos relacionados:
     * - {@link Nodos.NodoElectrico#adyacente _adyacente}
     * - {@link Nodos.NodoElectrico#adyacentes _adyacente_en}
     * - {@link Nodos.NodoElectrico#eliminar_adyacente eliminar_adyacente}
     * - {@link Nodos.NodoElectrico#eliminar_adyacentes eliminar_adyacentes}
     * - {@link Nodos.NodoElectrico#cantidad_de_adyacentes cantidad_de_adyacentes}
     * - {@link Nodos.NodoElectrico#cantidad_de_incidentes cantidad_de_incidentes}
     * - {@link Nodos.NodoElectrico#tiene_adyacente tiene_adyacente}
     * - {@link Nodos.NodoElectrico#tiene_incidente tiene_incidente}
     * - {@link Nodos.NodoElectrico#adyacente adyacente}
     * - {@link Nodos.NodoElectrico#adyacentes adyacentes}
     * - {@link Nodos.NodoElectrico#por_cada_adyacente_ejecutar por_cada_adyacente_ejecutar}
     * - {@link Nodos.Nodo.validar_nombre_enlace validar_nombre_enlace}
     *
     * ---
     * @example
     * const nodoA = NodoElectrico.crear_con_dato("A");
     * const nodoB = NodoElectrico.crear_con_dato("B");
     * nodoA._adyacente_en(nodoB, "enlaceAB");  // desde A hacia B
     *
     * // En nodoB, ver si existe incidente desde A
     * const enlace = nodoB.tiene_incidente_a(nodoA);
     * if (enlace) {
     *     console.log(`Existe el enlace "${enlace}" desde A hacia B (incidente en B)`);
     * } else {
     *     console.log("No existe incidente");
     * }
     *
     * @note Solo devuelve el nombre del enlace si realmente existe; `false` en caso contrario.
     * @param {NodoElectrico} nodo Nodo a verificar.
     * @return {string|boolean} Nombre del enlace si existe, `false` en caso contrario.
     * @public
     * @since 0.0.1
     */
    tiene_incidente_a(nodo) {
        if (!(nodo instanceof NodoElectrico)) {
            NodoElectrico._error("El nodo que intenta comprobar no es una instancia de la clase NodoElectrico.");
            return false;
        }
        if (this._incidentes !== undefined) {
            const id = String(nodo.id());
            if (this._incidentes.has(id)) {
                const fases = this._incidentes.get(id);
                const fase_actual = NodoElectrico._fase_actual;
                if (fases.has(fase_actual)) {
                    const enlaces = fases.get(fase_actual);
                    if (enlaces.size > 0) {
                        // Devolvemos el primer nombre de enlace
                        return enlaces.keys().next().value;
                    }
                }
            }
        }
        return false;
    }

    /*
     * Devuelve el nodo incidente en el enlace especificado (Interfaz {@link Nodos.Interfaces.Incidentes Incidentes}).
     *
     * Comprueba si existe un nodo incidente en el enlace indicado y lo devuelve;  
     * si no existe, devuelve `null`. Para asegurar consistencia.
     *
     * ---
     * 🔗 Método complementario:
     * - {@link Nodos.NodoElectrico#incidentes incidentes}
     * 
     * ---
     * 🔗 Otros métodos relacionados:
     * - {@link Nodos.NodoElectrico#cantidad_de_adyacentes cantidad_de_adyacentes}
     * - {@link Nodos.NodoElectrico#cantidad_de_incidentes cantidad_de_incidentes}
     * - {@link Nodos.NodoElectrico#tiene_adyacente tiene_adyacente}
     * - {@link Nodos.NodoElectrico#tiene_incidente tiene_incidente}
     * - {@link Nodos.NodoElectrico#adyacente _adyacente}
     * - {@link Nodos.NodoElectrico#adyacentes _adyacente_en}
     * - {@link Nodos.NodoElectrico#tiene_adyacente_a tiene_adyacente_a}
     * - {@link Nodos.NodoElectrico#tiene_incidente_a tiene_incidente_a}
     * - {@link Nodos.NodoElectrico#eliminar_adyacente eliminar_adyacente}
     * - {@link Nodos.NodoElectrico#eliminar_adyacentes eliminar_adyacentes}
     * - {@link Nodos.NodoElectrico#por_cada_adyacente_ejecutar por_cada_adyacente_ejecutar}
     * - {@link Nodos.Nodo.validar_nombre_enlace validar_nombre_enlace}
     *
     * ---
     * @example
     * const n1 = NodoElectrico.crear_con_dato("A");
     * const n2 = NodoElectrico.crear_con_dato("B");
     * n1._adyacente_en(n2, "enlaceAB");
     *
     * const ady = n1.adyacente("enlaceAB");
     * if (ady) console.log("Nodo adyacente:", ady.dato());//B
     *
     * @note 
     * @param {string} enlace El identificador del enlace a consultar
     * @return {NodoElectrico|null} Nodo adyacente si existe, `null` en caso contrario
     */
    /*incidente(enlace) {
        if (!NodoElectrico.validar_nombre_enlace(enlace)){
            this.constructor._error("El enlace debe ser un string válido");
            return null;
        }
        if (this._incidentes === undefined) {
            return null;
        }
        if (!this._incidentes.size) {
            return null;
        } 
        const faseactual =NodoElectrico._fase_actual;
        if (this._incidentes[faseactual]===undefined){
            return null;
        }
        if (!this._incidentes[faseactual].size){
            return null;
        }
        return this._incidentes[faseactual].get(enlace) ?? null;
    }*/
    /**
     * Devuelve una copia de todos los incidentes (Interfaz {@link Nodos.Interfaces.Incidentes# Incidentes}).
     *
     * Retorna todos los nodos incidentes del nodo eléctrico actual en un `Map` independiente, 
     * asegurando que sea una "foto" del estado al momento de la llamada.  
     * Si el nodo no tiene incidentes, devuelve `null`.  
     * Se utiliza para obtener de manera segura los enlaces actuales sin exponer la referencia interna.
     *
     * ---
     * 🔗 Método complementario:
     * - {@link Nodos.NodoElectrico#adyacente adyacente}
     *
     * ---
     * 🔗 Otros métodos relacionados:
     * - {@link Nodos.NodoElectrico#cantidad_de_adyacentes cantidad_de_adyacentes}
     * - {@link Nodos.NodoElectrico#cantidad_de_incidentes cantidad_de_incidentes}
     * - {@link Nodos.NodoElectrico#tiene_adyacente tiene_adyacente}
     * - {@link Nodos.NodoElectrico#tiene_incidente tiene_incidente}
     * - {@link Nodos.NodoElectrico#adyacente _adyacente}
     * - {@link Nodos.NodoElectrico#adyacentes _adyacente_en}
     * - {@link Nodos.NodoElectrico#tiene_adyacente_a tiene_adyacente_a}
     * - {@link Nodos.NodoElectrico#tiene_incidente_a tiene_incidente_a}
     * - {@link Nodos.NodoElectrico#eliminar_adyacente eliminar_adyacente}
     * - {@link Nodos.NodoElectrico#eliminar_adyacentes eliminar_adyacentes}
     * - {@link Nodos.NodoElectrico#por_cada_adyacente_ejecutar por_cada_adyacente_ejecutar}
     * - {@link Nodos.Nodo.validar_nombre_enlace validar_nombre_enlace}
     * 
     * ---
     * @example 
     * //Ejemplo de uso:
     * const nodo = NodoElectrico.crear();
     * nodo._incidente(NodoElectrico.crear_con_id("A"));
     * nodo._incidente(NodoElectrico.crear_con_id("B"));
     * const todos = nodo.incidentes();
     * if (todos !== null) {
     *   for (const [enlace, inc] of todos) {
     *     console.log(`Enlace: ${enlace}, Nodo ID: ${inc.id()}`);//imprimo cada incidente
     *     todos.delete(enlace);//elimina en el resultado pero no afecta la estructura del nodo original
     *   }
     * }
     * //comprobacion
     * console.log("compruebo eliminacion en resultado")
     * for (const [enlace, inc] of todos) {
     *     console.log(`Enlace: ${enlace}, Nodo ID: ${inc.id()}`);//no imprime nada ya que no hay nada
     *   }
     * console.log("comprobacion nuevo resultado");
     * const todos2 = nodo.incidentes();
     * if (todos2 !== null) {
     *   for (const [enlace, inc] of todos2) {
     *     console.log(`Enlace: ${enlace}, Nodo ID: ${inc.id()}`);//imprime lo mismo que antes
     *   }
     * }
     *
     * @note Se devuelve un nuevo Map, copia superficial de #adyacentes.
     * @param void
     * @return {?Map<string|number, NodoElectrico>} Map con nodos adyacentes o `null` si no existen
     * @public
     * @since V0.0.1
     */
    incidentes() {
        if (!this.tiene_incidente()) {
            return null;
        }
        const res = new Map();
        const faseActual = NodoElectrico._fase_actual;
        for (const [idIncidente, fases] of this._incidentes) {
            if (fases.has(faseActual)) {
                const enlacesFase = fases.get(faseActual);
                if (enlacesFase && enlacesFase.size > 0) {
                    // Copia superficial del Map de enlaces
                    res.set(idIncidente, new Map(enlacesFase));
                }
            }
        }
        // Si después de filtrar no hay nada, devolver null
        return res.size === 0 ? null : res;
    }

    /**
     * Devuelve la cantidad de incidentes (Interfaz {@link Nodos.Interfaces.Incidentes Incidentes}).
     *
     * Retorna el número total de nodos incidentes actualmente vinculados al nodo eléctrico.  
     * Si no existen incidentes, devuelve `0`.  
     * Este método permite conocer de manera rápida el grado de salida del nodo.
     *
     * ---
     * 🔗 Método complementario:
     * - {@link Nodos.NodoElectrico#cantidad_de_adyacentes cantidad_de_adyacentes}
     *
     * ---
     * 🔗 Otros métodos relacionados:
     * - {@link Nodos.NodoElectrico#adyacente _adyacente}
     * - {@link Nodos.NodoElectrico#adyacentes _adyacente_en}
     * - {@link Nodos.NodoElectrico#eliminar_adyacente eliminar_adyacente}
     * - {@link Nodos.NodoElectrico#eliminar_adyacentes eliminar_adyacentes}
     * - {@link Nodos.NodoElectrico#tiene_adyacente tiene_adyacente}
     * - {@link Nodos.NodoElectrico#tiene_incidente tiene_incidente}
     * - {@link Nodos.NodoElectrico#adyacente adyacente}
     * - {@link Nodos.NodoElectrico#adyacentes adyacentes}
     * - {@link Nodos.NodoElectrico#tiene_adyacente_a tiene_adyacente_a}
     * - {@link Nodos.NodoElectrico#tiene_incidente_a tiene_incidente_a}
     * - {@link Nodos.NodoElectrico#por_cada_adyacente_ejecutar por_cada_adyacente_ejecutar}
     * - {@link Nodos.Nodo.validar_nombre_enlace validar_nombre_enlace}
     *
     * ---
     * @example 
     * //Ejemplo de uso:
     * const nodo = NodoElectrico.crear();
     * const otro1 = NodoElectrico.crear();
     * const otro2 = NodoElectrico.crear();
     * nodo._incidente_en(otro1, "X");
     * nodo._incidente_en(otro2, "Y");
     * console.log(nodo.cantidad_de_incidentes()); // 2
     *
     * @note Si no hay adyacentes inicializados, retorna 0 directamente.
     * @param void
     * @return {number} Cantidad de incidentes del nodo
     * @since 0.0.1
     * @public
     */
    cantidad_de_incidentes() {
        if (this._incidentes !== undefined && this._incidentes.size > 0){
            let total=0;
            const idsincidentes=this._incidentes;
            const fase=NodoElectrico._fase_actual;
            for (const  [idincidente, fases ] of idsincidentes) {
                if (fases.has(fase)){
                    let incidentes=fases.get(fase);
                    total+=incidentes.size;
                }
            }
            return total;
        } else {
            return 0;
        }
    }



    /**
     * Devuelve la cantidad total de incidentes (entrantes) sumando todas las fases.
     *
     * @returns {number}
     * @public
     */
    cantidad_de_incidentes_global() {
        let total = 0;
        if (this._incidentes !== undefined && this._incidentes.size > 0) {
            for (const fasesPorNodo of this._incidentes.values()) {
                if (fasesPorNodo && fasesPorNodo.size > 0) {
                    for (const incidentesFase of fasesPorNodo.values()) {
                        if (incidentesFase && incidentesFase.size > 0) {
                            total += incidentesFase.size;
                        }
                    }
                }
            }
        }
        return total;
    }

        /**
     * Asigna un adyacente con nombre único (Interfaz {@link Nodos.Interfaces.Adyacentes Adyacentes}).
     *
     * Agrega un nodo como adyacente generando automáticamente un nombre de enlace único
     * basado en el `id()` del nodo destino.  
     * Si ya existe un enlace con ese nombre, se crean variantes incrementales (`id.1`, `id.2`, ...).
     *
     * ---
     * 🔗 Método complementario:
     * - {@link Nodos.NodoElectrico#_adyacente_en _adyacente_en}
     * 
     * ---
     * 🔗 Otros métodos relacionados:
     * - {@link Nodos.NodoElectrico#cantidad_de_adyacentes cantidad_de_adyacentes}
     * - {@link Nodos.NodoElectrico#cantidad_de_incidentes cantidad_de_incidentes}
     * - {@link Nodos.NodoElectrico#tiene_adyacente tiene_adyacente}
     * - {@link Nodos.NodoElectrico#tiene_incidente tiene_incidente}
     * - {@link Nodos.NodoElectrico#adyacente adyacente}
     * - {@link Nodos.NodoElectrico#adyacentes adyacentes}
     * - {@link Nodos.NodoElectrico#tiene_adyacente_a tiene_adyacente_a}
     * - {@link Nodos.NodoElectrico#tiene_incidente_a tiene_incidente_a}
     * - {@link Nodos.NodoElectrico#eliminar_adyacente eliminar_adyacente}
     * - {@link Nodos.NodoElectrico#eliminar_adyacentes eliminar_adyacentes}
     * - {@link Nodos.NodoElectrico#por_cada_adyacente_ejecutar por_cada_adyacente_ejecutar}
     * - {@link Nodos.Nodo.validar_nombre_enlace validar_nombre_enlace}
     * 
     * ---
     * @example
     * //Ejemplo de uso:
     * const nodo = NodoElectrico.crear();
     * const otro1 = NodoElectrico.crear_con_id("ejemplo");
     * const otro2 = NodoElectrico.crear_con_id("otro_ejemplo");
     * 
     * const enlace1=nodo._adyacente(otro1); // crea enlace "ejemplo" a otro1
     * const enlace2=nodo._adyacente(otro2); // crea enlace "otro_ejemplo" a otro2
     * const enlace3=nodo._adyacente(otro1); // crea enlace "ejemplo.1" a otro1
     * 
     * console.log("En el enlace "+enlace1+" se agrego el nodo "+nodo.adyacente(enlace1).id()); //ejemplo / ejemplo
     * console.log("En el enlace "+enlace2+" se agrego el nodo "+nodo.adyacente(enlace2).id()); //otro_ejemplo / otro_ejemplo
     * console.log("En el enlace "+enlace3+" se agrego el nodo "+nodo.adyacente(enlace3).id()); //ejemplo.1 / ejemplo
     *
     * @note Usa internamente _adyacente_en para registrar el enlace final.
     * @param {NodoElectrico} un_nodo Nodo que se desea enlazar
     * @return {NodoElectrico} Nodo adyacente recién asignado
     */
  /*  _incidente(un_nodo)  {
        // Validación de tipo
        if (!(un_nodo instanceof this.constructor)) {
            this.constructor._error("el parámetro debe ser una instancia de NodoElectrico");
            return null;
        }


        const adyacentes=un_nodo.adyacentes();
        let cont = 1;
        const id = String(this.id());
        let enlace = id;
        
        // Buscar enlace único (Map usa .has())
        while (adyacentes.has(enlace)) {
            enlace = `${id}.${cont}`;
            cont++;
        }
        
        // Inicialización perezosa
        if (!this._incidentes) {
            this._incidentes = new Map();
        }
        const fase=NodoElectrico._fase_actual;
        if (!this._incidentes[fase]){
            this._incidentes[fase]=new Map();
        }

        const incidentes=this._incidentes[fase];
        if (incidentes.has(enlace)){
            this._error("el incidente ya estaba agregado");
        }
        // Asignar adyacente
        adyacentes.set(enlace, un_nodo);
        if (un_nodo.incidente(enlace)===null){
            un_nodo._incidente_en(this, enlace);
        }
        // Sumar referencias
        un_nodo._referencias++;
        
        return enlace;
    }*/
   
    /**
     * Establece un nodo incidente internamente (Interfaz {@link Nodos.Interfaces.Incidentes Incidentes}).
     *
     * Método interno para establecer la relación incidente correspondiente a una
     * adyacencia. Verifica que exista previamente la relación de adyacencia.
     * 
     * ---
     * 🔗 Métodos relacionados:
     * - {@link Nodos.NodoElectrico#_adyacente _adyacente}
     * - {@link Nodos.NodoElectrico#_adyacente_en _adyacente_en}
     * - {@link Nodos.NodoElectrico#cantidad_de_adyacentes cantidad_de_adyacentes}
     * - {@link Nodos.NodoElectrico#cantidad_de_incidentes cantidad_de_incidentes}
     * - {@link Nodos.NodoElectrico#tiene_adyacente tiene_adyacente}
     * - {@link Nodos.NodoElectrico#tiene_incidente tiene_incidente}
     * - {@link Nodos.NodoElectrico#adyacente adyacente}
     * - {@link Nodos.NodoElectrico#adyacentes adyacentes}
     * - {@link Nodos.NodoElectrico#tiene_adyacente_a tiene_adyacente_a}
     * - {@link Nodos.NodoElectrico#tiene_incidente_a tiene_incidente_a}
     * - {@link Nodos.NodoElectrico#por_cada_adyacente_ejecutar por_cada_adyacente_ejecutar}
     * - {@link Nodos.Nodo.validar_nombre_enlace validar_nombre_enlace}
     *
     * @note Solo para uso interno del sistema.
     * @param {NodoElectrico} un_nodo Nodo incidente a establecer
     * @param {string} enlace Nombre del enlace
     * @return {boolean} True si éxito, false si error
     * @protected
     * @since 0.0.1
     */
    _incidente_en(un_nodo, enlace) {
        // Verificar que ya se haya establecido el enlace de ida
        if (!un_nodo.adyacente(enlace)) {
            this.constructor._alerta("No se puede agregar el enlace de vuelta antes que el de ida");
            return false;
        }
        
        // Inicialización perezosa
        if (!this._incidentes) {
            this._incidentes = new Map();
        }
        const idstring=String(un_nodo.id());
        if (!this._incidentes.has(idstring)) {//creo un Map distinto para cada nodo incidentete para evitar coliciones de nombres de enlace
            this._incidentes.set(idstring, new Map());
        }   
        const fases=this._incidentes.get(idstring);
        const fase = NodoElectrico._fase_actual;
        if (!fases.has(fase)){
            fases.set(fase, new Map());
        }
        const incidentes=fases.get(fase);
        
        // Asignar incidente
        incidentes.set(enlace, un_nodo);
        return true;
    }

    /**
     * Elimina un nodo incidente específico internamente (Interfaz {@link Nodos.Interfaces.Incidentes Incidentes}).
     *
     * Método interno para remover una relación incidente. Verifica que previamente
     * se haya eliminado la relación de adyacencia correspondiente.
     * 
     * ---
     * 🔗 Método complementario:
     * - {@link Nodos.NodoElectrico#eliminar_adyacente eliminar_adyacente}
     *
     * ---
     * 🔗 Otros métodos relacionados:
     * - {@link Nodos.NodoElectrico#_adyacente _adyacente}
     * - {@link Nodos.NodoElectrico#_adyacente_en _adyacente_en}
     * - {@link Nodos.NodoElectrico#cantidad_de_adyacentes cantidad_de_adyacentes}
     * - {@link Nodos.NodoElectrico#cantidad_de_incidentes cantidad_de_incidentes}
     * - {@link Nodos.NodoElectrico#tiene_adyacente tiene_adyacente}
     * - {@link Nodos.NodoElectrico#tiene_incidente tiene_incidente}
     * - {@link Nodos.NodoElectrico#adyacente adyacente}
     * - {@link Nodos.NodoElectrico#adyacentes adyacentes}
     * - {@link Nodos.NodoElectrico#tiene_adyacente_a tiene_adyacente_a}
     * - {@link Nodos.NodoElectrico#tiene_incidente_a tiene_incidente_a}
     * - {@link Nodos.NodoElectrico#por_cada_adyacente_ejecutar por_cada_adyacente_ejecutar}
     * - {@link Nodos.Nodo.validar_nombre_enlace validar_nombre_enlace}
     *
     * @note Solo para uso interno del sistema.
     * @param {NodoElectrico} incidente Nodo incidente
     * @param {string} enlace Nombre del enlace a eliminar
     * @return {NodoElectrico|null} Nodo eliminado o null si no existe
     * @protected
     * @since 0.0.1
     */
    eliminar_incidente(incidente, enlace) {
        // Verificar inicialización perezosa
        if (!this._incidentes) {
            this.constructor._alerta("No hay incidentes para eliminar");
            return null;
        }
        
        const fase = NodoElectrico._fase_actual;
        if (!this._incidentes.has(String(incidente.id()))) {
            this.constructor._alerta("No existe ese incidente");
            return null;
        }
        
        const fasesdelincidente=this._incidentes.get(String(incidente.id()));
        if (!fasesdelincidente.has(fase)){
            this.constructor._alerta("no existe ese nodo como adyacente en la fase actual");
            return null;
        }
        const incidentes = fasesdelincidente.get(fase);
        
        // Verificar existencia del enlace
        if (!incidentes.has(enlace)) {
            this.constructor._alerta(`El enlace ${enlace} que se intenta eliminar no existe`);
            return null;
        }
        
        const eliminado = incidentes.get(enlace);
        
        // Verificar que ya se haya eliminado el enlace de ida
        if (eliminado.adyacente(enlace)) {
            this.constructor._alerta("No se puede eliminar el enlace de vuelta antes que el de ida");
            return null;
        }
        
        incidentes.delete(enlace);
        return eliminado;
    }
   /**
     * Ejecuta una función por cada nodo incidente (Interfaz {@link Nodos.Interfaces.Incidentes Incidentes}).
     *
     * Itera sobre todos los nodos incidentes ejecutando una función callback para cada uno.
     * La función recibe el nodo incidente, nombre del enlace y parámetros adicionales.
     * 
     * ---
     * 🔗 Métodos relacionados:
     * - {@link Nodos.NodoElectrico#por_cada_adyacente_ejecutar por_cada_adyacente_ejecutar}
     * - {@link Nodos.NodoElectrico#incidentes incidentes}
     * 
     * 🔗 Otros métodos relacionados:
     * - {@link Nodos.NodoElectrico#eliminar_adyacente eliminar_adyacente}
     * - {@link Nodos.NodoElectrico#_adyacente _adyacente}
     * - {@link Nodos.NodoElectrico#_adyacente_en _adyacente_en}
     * - {@link Nodos.NodoElectrico#cantidad_de_adyacentes cantidad_de_adyacentes}
     * - {@link Nodos.NodoElectrico#cantidad_de_incidentes cantidad_de_incidentes}
     * - {@link Nodos.NodoElectrico#tiene_adyacente tiene_adyacente}
     * - {@link Nodos.NodoElectrico#tiene_incidente tiene_incidente}
     * - {@link Nodos.NodoElectrico#adyacente adyacente}
     * - {@link Nodos.NodoElectrico#adyacentes adyacentes}
     * - {@link Nodos.NodoElectrico#tiene_adyacente_a tiene_adyacente_a}
     * - {@link Nodos.NodoElectrico#tiene_incidente_a tiene_incidente_a}
     * - {@link Nodos.Nodo.validar_nombre_enlace validar_nombre_enlace}
     *
     * ---
     * @example
     * // Ejemplo de uso:
     * nodo.por_cada_incidente_ejecutar((inc, enlace) => {
     *     console.log(`Procesando incidente en enlace: ${enlace}`);
     * }, parametro_extra);
     *
     * @note Devuelve array con resultados de cada ejecución.
     * @param {Function} funcion Función a ejecutar
     * @param {...any} parametros Parámetros adicionales para la función
     * @return {Array|null} Array asociativo con resultados o null si no hay incidentes
     * @public
     * @since 0.0.1
     */
    por_cada_incidente_ejecutar(funcion, ...parametros) {
        if (this._incidentes===undefined || this._incidentes.size<1) {
            this.constructor._alerta("Alerta: no existe incidente");
            return new Map();
        }

        const resultados = new Map();
        const fase =NodoElectrico._fase_actual;
        for (const [idincidente,fases] of this._incidentes){
            if (fases.has(fase)){
                const incidentesres=new Map()
                resultados.set(idincidente,incidentesres );
                const faseaux=fases.get(fase);
                for (const [enlace, incidente] of faseaux ){
                    incidentesres.set(enlace, incidente);
                }
            }
        }
        return resultados;
    }
    /**
     * Llave de seguridad interna utilizada para autorizar operaciones sensibles
     * sobre la superestructura de nodos.
     *
     * Este token es generado por la clase Nodo y entregado únicamente al Controlador
     * durante el proceso de registro, con el fin de validar las operaciones que
     * invoquen directa o indirectamente a {@link Nodo.por_cada_nodo_ejecutar}.
     *
     * @type {string}
     * @private
     * @see Nodo.registrar_controlador
     */
   // static _token = generarUUID();

    /***************************************************************************************
     * NUEVA INTERFAZ PESO (instancia)
     * @since 1.2.9
     ***************************************************************************************/

    /**
     * Asigna o acumula peso en un enlace de la fase actual.
     *
     * Este método unifica la asignación directa y la acumulación de pesos.
     * El comportamiento predeterminado (`acumular = true`) **suma** el valor al peso
     * existente, lo que es ideal para contadores, distancias, costes acumulativos, etc.
     * Si se desea un reemplazo completo, se pasa `false` en el último parámetro.
     *
     * **Proceso interno:**
     * 1. Si el valor almacenado en el enlace aún es un `NodoElectrico` (sin pesos previos),
     *    se envuelve en un objeto `Enlace` (migración perezosa).
     * 2. En modo acumulación, si el peso actual es escalar y se pide una dimensión distinta,
     *    se migra automáticamente a un objeto con claves.
     * 3. En modo asignación, se sobreescribe cualquier estructura anterior.
     *
     * ---
     * 🔹 **Parámetros:**
     * - `nombre_enlace`: Nombre del enlace. Debe existir en la fase actual.
     * - `peso`: Valor numérico a asignar o sumar (puede ser negativo para restar).
     * - `dimension`: Clave de la dimensión. Si es `null`, se usa la dimensión por defecto (internamente clave vacía).
     * - `acumular`: `true` para sumar al valor existente (por defecto), `false` para reemplazar.
     *
     * ---
     * 🔹 **Retorno:**
     * - El nuevo valor del peso tras la operación.
     * - `null` si el enlace no existe o el nombre de enlace es inválido.
     *
     * ---
     * 🔹 **Ejemplos de uso:**
     *
     * **Ejemplo 1 – Acumular (comportamiento por defecto)**
     * ```javascript
     * nodo._peso('ruta', 10);                     // crea/ suma 10 en dimensión por defecto
     * nodo._peso('ruta', 5);                      // ahora el peso por defecto es 15
     * nodo._peso('ruta', -2);                     // resta 2 → 13
     * ```
     *
     * **Ejemplo 2 – Dimensión específica acumulando**
     * ```javascript
     * nodo._peso('ruta', 7.5, 'distancia', true); // inicia 'distancia' en 7.5
     * nodo._peso('ruta', 2.5, 'distancia');        // acumula → 10.0
     * ```
     *
     * **Ejemplo 3 – Asignación directa (reemplazar)**
     * ```javascript
     * nodo._peso('ruta', 100, null, false);       // la dimensión por defecto pasa a 100
     * nodo._peso('ruta', 20, 'coste', false);     // la dimensión 'coste' se fija en 20
     * ```
     *
     * **Ejemplo 4 – Migración automática de escalar a objeto**
     * ```javascript
     * nodo._peso('ruta', 5);                       // default = 5 (escalar)
     * nodo._peso('ruta', 3, 'coste');              // ahora default:5, coste:3 (objeto)
     * ```
     *
     * **Ejemplo 5 – Enlace sin nodo previo**
     * ```javascript
     * // Si el enlace 'nuevo' apunta a un NodoElectrico, _peso lo convierte en Enlace y asigna.
     * nodo._adyacente_en(otro, 'nuevo');
     * nodo._peso('nuevo', 42);                     // ahora 'nuevo' tiene peso 42
     * ```
     *
     * ---
     * 🔗 **Métodos relacionados:**
     * - {@link Nodos.NodoElectrico#peso peso()} para consultar un peso.
     * - {@link Nodos.NodoElectrico#pesos pesos()} para obtener todos los pesos de un enlace.
     * - {@link Nodos.NodoElectrico#adyacentes_ordenados_por_peso adyacentes_ordenados_por_peso()} para ordenar adyacentes por peso.
     * - {@link Nodos.NodoElectrico#_adyacente_con_peso _adyacente_con_peso()} y {@link Nodos.NodoElectrico#_adyacente_con_peso_en _adyacente_con_peso_en()} para crear enlaces con peso en un paso.
     *
     * @param {string}      nombre_enlace Nombre del enlace.
     * @param {number}      peso          Valor a asignar o sumar.
     * @param {string|null} [dimension=null] Dimensión. `null` para la dimensión por defecto.
     * @param {boolean}     [acumular=true]  `true` para acumular (por defecto), `false` para reemplazar.
     * @returns {number|null} Nuevo valor del peso, o `null` si falla.
     *
     * @throws _alerta si el enlace no existe en la fase actual.
     *
     * @since 1.2.9
     */
    _peso(nombre_enlace, peso, dimension = null, acumular = true) {
        if (!this.constructor.validar_nombre_enlace(nombre_enlace)) {
            this.constructor._error('El nombre de enlace no es válido.');
            return null;
        }
        const fase = NodoElectrico._fase_actual;
        const adyacentes_fase = this._adyacentes?.get(fase);
        if (!adyacentes_fase || !adyacentes_fase.has(nombre_enlace)) {
            this.constructor._alerta(`No existe el enlace '${nombre_enlace}' en la fase actual.`);
            return null;
        }

        let valor = adyacentes_fase.get(nombre_enlace);
        if (valor instanceof NodoElectrico) {
            const enlace_obj = new Enlace(valor);
            adyacentes_fase.set(nombre_enlace, enlace_obj);
            valor = enlace_obj;
        }
        const enlace_obj = valor;
        const dim = dimension ?? '';

        if (acumular) {
            // --- MODO SUMA ---
            if (enlace_obj.pesos === null) {
                if (dimension === null) {
                    enlace_obj.pesos = peso;
                } else {
                    enlace_obj.pesos = { [dim]: peso };
                }
                return peso;
            }
            if (typeof enlace_obj.pesos === 'object') {
                if (!(dim in enlace_obj.pesos)) {
                    enlace_obj.pesos[dim] = 0;
                }
                enlace_obj.pesos[dim] += peso;
                return enlace_obj.pesos[dim];
            } else {
                // Escalar
                if (dimension === null || dim === '') {
                    enlace_obj.pesos += peso;
                    return enlace_obj.pesos;
                } else {
                    const anterior = enlace_obj.pesos;
                    enlace_obj.pesos = { '': anterior, [dim]: peso };
                    return peso;
                }
            }
        } else {
            // --- MODO ASIGNACIÓN ---
            if (dimension === null) {
                if (enlace_obj.pesos === null) {
                    enlace_obj.pesos = peso;
                } else if (typeof enlace_obj.pesos === 'object') {
                    enlace_obj.pesos[''] = peso;
                } else {
                    enlace_obj.pesos = peso;
                }
            } else {
                if (enlace_obj.pesos === null) {
                    enlace_obj.pesos = { [dimension]: peso };
                } else if (typeof enlace_obj.pesos === 'object') {
                    enlace_obj.pesos[dimension] = peso;
                } else {
                    const anterior = enlace_obj.pesos;
                    enlace_obj.pesos = { '': anterior, [dimension]: peso };
                }
            }
            return peso;
        }
    }

    /**
     * Obtiene el peso de un enlace en una dimensión determinada.
     *
     * Si el enlace no tiene asignado un objeto Enlace (es decir, nunca se le asignó peso)
     * o no existe la dimensión solicitada, devuelve `null`.
     *
     * @param {string}      nombre_enlace Nombre del enlace.
     * @param {string|null} [dimension=null] Dimensión del peso. Si es null, se usa la dimensión por defecto.
     *
     * @returns {*} El peso almacenado, o `null` si no existe.
     *
     * @see _peso
     * @since 1.2.9
     */
    peso(nombre_enlace, dimension = null) {
        if (!this.constructor.validar_nombre_enlace(nombre_enlace)) {
            this.constructor._error('El nombre de enlace no es válido.');
            return null;
        }
        const fase = NodoElectrico._fase_actual;
        const adyacentes_fase = this._adyacentes?.get(fase);
        if (!adyacentes_fase) return null;
        const valor = adyacentes_fase.get(nombre_enlace);
        if (!(valor instanceof Enlace) || valor.pesos === null) return null;

        if (dimension === null) {
            if (typeof valor.pesos === 'object') {
                return valor.pesos[''] ?? null;
            } else {
                return valor.pesos;
            }
        } else {
            if (typeof valor.pesos === 'object') {
                return valor.pesos[dimension] ?? null;
            }
            return null;
        }
    }



    /**
     * Devuelve una copia del mapa completo de pesos de un enlace.
     *
     * Si el enlace no tiene pesos, retorna un objeto vacío.
     *
     * @param {string} nombre_enlace Nombre del enlace.
     * @returns {Object<string, *>} Mapa de pesos (clave = dimensión, valor = peso). Copia independiente.
     *
     * @see _peso
     * @since 1.2.9
     */
    pesos(nombre_enlace) {
        if (!this.constructor.validar_nombre_enlace(nombre_enlace)) {
            this.constructor._error('El nombre de enlace no es válido.');
            return {};
        }
        const fase = NodoElectrico._fase_actual;
        const adyacentes_fase = this._adyacentes?.get(fase);
        if (!adyacentes_fase) return {};
        const valor = adyacentes_fase.get(nombre_enlace);
        if (!(valor instanceof Enlace) || valor.pesos === null) return {};
        if (typeof valor.pesos === 'object') {
            return { ...valor.pesos };
        } else {
            return { '': valor.pesos };
        }
    }

    /**
     * Ordena los adyacentes de la fase actual según el valor del peso en una dimensión.
     *
     * Recorre todos los enlaces salientes del nodo eléctrico en la fase activa y los ordena
     * por el valor del peso asociado a la dimensión indicada. Los enlaces que **no
     * poseen** esa dimensión de peso reciben un valor implícito de `0` para el
     * ordenamiento, lo que significa que:
     * - En orden **ascendente** (`ascendente = true`) aparecen **al principio**.
     * - En orden **descendente** (`ascendente = false`) aparecen **al final**.
     *
     * El parámetro `incluir_sin_peso` controla si los enlaces sin la dimensión
     * solicitada se incluyen o no en el resultado.
     *
     * ---
     * 🔹 **Parámetros:**
     * - `dimension`: Dimensión del peso por la que ordenar.
     *   Si es `null`, se utiliza la dimensión por defecto (internamente clave vacía).
     * - `ascendente`: `true` para orden ascendente (por defecto), `false` para descendente.
     * - `incluir_sin_peso`: `true` para incluir en el resultado los enlaces que no
     *   poseen la dimensión de peso (con peso implícito 0). Por defecto `false` (solo
     *   se devuelven los enlaces que sí tienen la dimensión).
     *
     * ---
     * 🔹 **Retorno:**
     * Un array de objetos con las propiedades:
     * - `nombre_enlace` → nombre del enlace.
     * - `nodo` → instancia de `NodoElectrico` destino.
     * - `peso` → valor del peso (o `null` si no existe, aunque internamente se trata como 0 para ordenar).
     *
     * ---
     * 🔹 **Ejemplos de uso:**
     *
     * **Ejemplo 1 – Orden ascendente por dimensión 'coste' (sin incluir sin peso)**
     * ```javascript
     * const ordenados = nodo.adyacentes_ordenados_por_peso('coste', true, false);
     * // Solo aparecen enlaces que tienen la dimensión 'coste'.
     * // Ordenados del coste más bajo al más alto.
     * ```
     *
     * **Ejemplo 2 – Orden descendente incluyendo todos (los sin peso como 0)**
     * ```javascript
     * const ordenados = nodo.adyacentes_ordenados_por_peso(null, false, true);
     * // Los que no tienen peso en la dimensión por defecto se consideran peso 0
     * // y aparecen al final (por ser los menores en orden descendente).
     * ```
     *
     * **Ejemplo 3 – Iterar resultados**
     * ```javascript
     * nodo.adyacentes_ordenados_por_peso('distancia').forEach(item => {
     *     console.log(`Enlace: ${item.nombre_enlace}, Nodo: ${item.nodo.id()}, Peso: ${item.peso}`);
     * });
     * ```
     *
     * ---
     * 🔗 **Métodos relacionados:**
     * - {@link Nodos.NodoElectrico#peso peso()} para consultar un peso individual.
     * - {@link Nodos.NodoElectrico#pesos pesos()} para obtener todos los pesos de un enlace.
     * - {@link Nodos.NodoElectrico#_peso _peso()} para asignar o acumular pesos.
     *
     * @param {string|null} [dimension=null]         Dimensión por la que ordenar. `null` para la por defecto.
     * @param {boolean}     [ascendente=true]        `true` para ascendente, `false` para descendente.
     * @param {boolean}     [incluir_sin_peso=false] `true` para incluir enlaces sin la dimensión (peso 0 implícito).
     *
     * @returns {Array<{nombre_enlace: string, nodo: NodoElectrico, peso: *}>} Lista ordenada.
     *
     * @see peso
     * @since 1.2.9
     */
    adyacentes_ordenados_por_peso(dimension = null, ascendente = true, incluir_sin_peso = false) {
        const fase = NodoElectrico._fase_actual;
        const adyacentes_fase = this._adyacentes?.get(fase);
        if (!adyacentes_fase || adyacentes_fase.size === 0) return [];

        const items = [];

        for (const [nombre_enlace, valor] of adyacentes_fase) {
            const nodo = (valor instanceof Enlace) ? valor.nodo : valor;
            let peso = null;

            if (valor instanceof Enlace && valor.pesos !== null) {
                if (typeof valor.pesos === 'object') {
                    const clave = dimension ?? '';
                    peso = valor.pesos[clave] ?? null;
                } else {
                    if (dimension === null) {
                        peso = valor.pesos;
                    }
                }
            }

            if (peso !== null || incluir_sin_peso) {
                items.push({ nombre_enlace, nodo, peso });
            }
        }

        items.sort((a, b) => {
            const pesoA = a.peso ?? 0;   // implícito 0
            const pesoB = b.peso ?? 0;
            if (pesoA === pesoB) return 0;
            return ascendente
                ? (pesoA < pesoB ? -1 : 1)
                : (pesoA > pesoB ? -1 : 1);
        });

        return items;
    }
    /**
     * Asigna un adyacente con nombre único y además le asigna un peso (fase actual).
     *
     * @param {NodoElectrico} un_nodo   Nodo a enlazar.
     * @param {*}             peso      Peso a asignar.
     * @param {string|null}   [dimension=null] Dimensión del peso.
     *
     * @returns {string|null} Nombre del enlace generado, o null si hubo error.
     *
     * @see _adyacente
     * @see _peso
     * @since 1.2.9
     */
    _adyacente_con_peso(un_nodo, peso, dimension = null) {
        const nombre_enlace = this._adyacente(un_nodo);
        if (nombre_enlace !== null) {
            this._peso(nombre_enlace, peso, dimension);
        }
        return nombre_enlace;
    }

    /**
     * Establece un nodo adyacente con nombre de enlace específico y le asigna un peso.
     *
     * @param {NodoElectrico} un_nodo    Nodo a enlazar.
     * @param {string}        enlace     Nombre del enlace.
     * @param {*}             peso       Peso a asignar.
     * @param {string|null}   [dimension=null] Dimensión.
     * @param {boolean}       [reemplazar=false] Si true, permite reemplazar.
     *
     * @returns {boolean} True si éxito.
     *
     * @see _adyacente_en
     * @see _peso
     * @since 1.2.9
     */
    _adyacente_con_peso_en(un_nodo, enlace, peso, dimension = null, reemplazar = false) {
        const exito = this._adyacente_en(un_nodo, enlace, reemplazar);
        if (exito) {
            this._peso(enlace, peso, dimension, false);// asignación directa
        }
        return exito;
    }
    
    /*************************************************************************************************************/
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////*/
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////*/
    //INTERFACE PARA IMPRIMIR LOS NODOS*************************************************/////////////////////////*/
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////*/
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////*/
    /*************************************************************************************************************/

    /**
     * Imprime el nodo eléctrico en el formato adecuado (HTML o consola) según el entorno configurado.
     *
    * **Restricción de entorno:** solo se ejecuta en desarrollo o pruebas.
    * En producción, emite una alerta y no genera salida, ya que este método está pensado
    * exclusivamente para depuración.
    * 
     * Delega en los métodos privados {@link #_imprimir_consola} o {@link #_imprimir_html}
     * dependiendo de {@link Configuracion.Entorno.es_consola Entorno.es_consola()}.
     * **Solo se muestra la información de la fase activa** (propiedad estática `_fase_actual`).
     * 
     * La presentación del nodo se rige por {@link Configuracion.Conf.NODOS_COLORES}
     * y, en modo HTML, el resultado se vuelca en el contenedor con id
     * {@link Configuracion.Conf.NODOS_CONTENEDOR_ID}. Consulte esas propiedades para
     * personalizar la salida.
     *
     * @returns {void|string} En modo HTML devuelve el string; en modo consola imprime directamente.
     * @since 1.3.0 Unificado; eliminado imprimir2.
     *
     * @see #_imprimir_consola
     * @see #_imprimir_html
     * @see Configuracion.Entorno
     */
    imprimir() {
        if (!Entorno.permite_pruebas()) {
            this.constructor._alerta('Impresión de nodos no permitida en entorno de producción.');
            return;
        }

        if (Entorno.es_consola()) {
            this._imprimir_consola();
        } else {
            const html = this._imprimir_html();

            // Insertar en el contenedor global (comportamiento individual)
            let contenedor = document.getElementById(Conf.NODOS_CONTENEDOR_ID);
            if (!contenedor) {
                contenedor = document.createElement("div");
                contenedor.id = Conf.NODOS_CONTENEDOR_ID;
                contenedor.style.cssText = `
                    background: ${Conf.NODOS_COLORES.fondo};
                    color: ${Conf.NODOS_COLORES.texto};
                    padding: 1em;
                    margin: 1em 0;
                    border: 1px solid ${Conf.NODOS_COLORES.borde};
                    font-family: monospace;
                    white-space: pre-wrap;
                `;
                document.body.appendChild(contenedor);
            }
            contenedor.innerHTML += html;

            return html;   // por si alguien necesita el string
        }
    }
    

    /**
     * Imprime el nodo eléctrico en formato texto plano (consola).
     *
     * Muestra todos los datos relevantes del nodo **en la fase actual**,
     * incluyendo pesos de los enlaces.
     * 
     * Los colores de la terminal se toman de {@link Configuracion.Conf.NODOS_COLORES}
     * y se aplican mediante `%c` en `console.log`. Modifique esas constantes para
     * cambiar la apariencia en consola.
     *
     * @returns {void}
     * @private
     * @since 1.3.0
     */
    _imprimir_consola() {
        const estilo = `color: ${Conf.NODOS_COLORES.texto}; background: ${Conf.NODOS_COLORES.fondo};`;
        const fase = NodoElectrico._fase_actual;

        console.log(`%c>> NODO ELÉCTRICO ${this.id()}${this.es_especial() ? " (ESP)" : ""}`, estilo);
        const dato = this.dato();
        if (typeof dato === "string") console.log(`%cDato: ${dato}`, estilo);
        else if (dato === null) console.log(`%cDato: null`, estilo);
        else console.log(`%cDato: este dato no es un string`, estilo);

        console.log(`%cReferencias: ${this._referencias}`, estilo);
        console.log(`%cCapacidad: ${this.capacidad()}`, estilo);
        console.log(`%cFuga: ${this.fuga()}`, estilo);
        console.log(`%cEnergía: ${this.energia()}`, estilo);

        console.log(`%cAdyacentes (fase: ${fase}):`, estilo);
        const adyacentes_fase = this._adyacentes?.get(fase);
        if (adyacentes_fase && adyacentes_fase.size > 0) {
            for (const [enlace, valor] of adyacentes_fase) {
                const nodo = (valor instanceof Enlace) ? valor.nodo : valor;
                const pesos_str = this.#_formatear_pesos_consola(valor);
                console.log(`%c  [${enlace}] => Nodo ${nodo.id()}${pesos_str}`, estilo);
            }
        } else {
            console.log("%c  No tiene", estilo);
        }

        console.log(`%cIncidentes (fase: ${fase}):`, estilo);
        if (this._incidentes && this._incidentes.size > 0) {
            let tiene = false;
            for (const [idnodo, fases] of this._incidentes) {
                const inc_fase = fases.get(fase);
                if (inc_fase && inc_fase.size > 0) {
                    tiene = true;
                    console.log(`%c  Desde nodo ${idnodo}:`, estilo);
                    for (const [enlace, incidente] of inc_fase) {
                        console.log(`%c    [${enlace}] => Nodo ${incidente.id()}`, estilo);
                    }
                }
            }
            if (!tiene) console.log("%c  No tiene", estilo);
        } else {
            console.log("%c  No tiene", estilo);
        }

        console.log(`%cFin Nodo`, estilo);
    }

    /**
     * Imprime el nodo eléctrico en formato HTML, insertándolo en #nodos-log..
     *
     * Genera un bloque HTML con todos los datos del nodo **en la fase activa**,
     * incluyendo enlaces navegables y visualización de pesos.
     * 
     * El bloque HTML se inserta en el elemento con id
     * {@link Configuracion.Conf.NODOS_CONTENEDOR_ID} y utiliza los colores definidos
     * en {@link Configuracion.Conf.NODOS_COLORES}. Ajuste esas propiedades para
     * modificar el estilo o el contenedor de destino.
     *
     * @returns {string} Representación HTML del nodo.
     * @private
     * @since 1.3.0
     */
    _imprimir_html() {
        const colores = Conf.NODOS_COLORES;
        const fase = NodoElectrico._fase_actual;
        const id = this.id();
        const dato = this.dato();

        // Contenedor con los mismos estilos que en PHP
        let html = `<div style="background:${colores.fondo}; color:${colores.texto}; padding:1em; margin:1em 0; border:1px solid ${colores.borde}; font-family:monospace; white-space:pre-wrap;">`;
        html += `<strong>NODO ELÉCTRICO ${id}${this.es_especial() ? " (ESP)" : ""} - Dato: `;
        if (typeof dato === "string") html += dato;
        else if (dato === null) html += "null";
        else html += "este dato no es un string";
        html += `</strong><br/>`;

        html += `Capacidad: ${this.capacidad()}<br/>`;
        html += `Fuga: ${this.fuga()}<br/>`;
        html += `Energía: ${this.energia()}<br/>`;

        html += `Adyacentes (fase: ${fase}):<br/>`;
        const adyacentes_fase = this._adyacentes?.get(fase);
        if (adyacentes_fase && adyacentes_fase.size > 0) {
            html += "<ul>";
            for (const [enlace, valor] of adyacentes_fase) {
                const nodo = (valor instanceof Enlace) ? valor.nodo : valor;
                html += `<li>[${enlace}] => <a href="#nodo-${nodo.id()}" style="color:${colores.texto};">${nodo.id()}</a>`;
                if (valor instanceof Enlace && valor.pesos !== null) {
                    html += ' <span style="color:' + colores.texto + ';">[Pesos: ';
                    if (typeof valor.pesos === 'object') {
                        html += Object.entries(valor.pesos).map(([dim, p]) => {
                            const dim_label = dim === '' ? "''" : dim;
                            return `${dim_label}: ${JSON.stringify(p)}`;
                        }).join(', ');
                    } else {
                        html += `'': ${JSON.stringify(valor.pesos)}`;
                    }
                    html += ']</span>';
                }
                html += '</li>';
            }
            html += "</ul>";
        } else {
            html += "No tiene<br/>";
        }

        html += `Incidentes (fase: ${fase}):<br/>`;
        if (this._incidentes && this._incidentes.size > 0) {
            let tiene = false;
            html += '<ul>';
            for (const [idnodo, fases] of this._incidentes) {
                const inc_fase = fases.get(fase);
                if (inc_fase && inc_fase.size > 0) {
                    tiene = true;
                    html += `<li>Desde nodo ${idnodo}: `;
                    for (const [enlace, incidente] of inc_fase) {
                        html += `[${enlace}] => <a href="#nodo-${incidente.id()}" style="color:${colores.texto};">${incidente.id()}</a> `;
                    }
                    html += '</li>';
                }
            }
            html += '</ul>';
            if (!tiene) html += 'No tiene<br/>';
        } else {
            html += 'No tiene<br/>';
        }

        html += `Número de referencias a él: ${this._referencias}<br/>`;
        html += `</div>`;

        return html;
    }

    /* ──── Helpers privados para formateo de pesos ──── */

    /**
     * Formatea los pesos para la salida de consola.
     *
     * @param {Enlace|NodoElectrico} valor
     * @returns {string} Cadena formateada o vacía.
     * @private
     */
    #_formatear_pesos_consola(valor) {
        if (!(valor instanceof Enlace) || valor.pesos === null) return '';
        if (typeof valor.pesos === 'object') {
            const partes = Object.entries(valor.pesos).map(([dim, p]) => {
                const etiqueta = dim === '' ? 'default' : dim;
                return `${etiqueta}: ${JSON.stringify(p)}`;
            });
            return ` [Pesos: ${partes.join(', ')}]`;
        } else {
            return ` [Pesos: default: ${JSON.stringify(valor.pesos)}]`;
        }
    }

    /**
     * Formatea los pesos para la salida HTML.
     *
     * @param {Enlace|NodoElectrico} valor
     * @returns {string} Fragmento HTML o vacío.
     * @private
     */
    #_formatear_pesos_html(valor) {
        if (!(valor instanceof Enlace) || valor.pesos === null) return '';
        let html = ' <span style="color:#555;">[Pesos: ';
        if (typeof valor.pesos === 'object') {
            const partes = Object.entries(valor.pesos).map(([dim, p]) => {
                const etiqueta = dim === '' ? 'default' : dim;
                return `${etiqueta}: ${JSON.stringify(p)}`;
            });
            html += partes.join(', ');
        } else {
            html += `default: ${JSON.stringify(valor.pesos)}`;
        }
        html += ']</span>';
        return html;
    }

    /**
     * Imprime todos los nodos eléctricos de la superestructura en formato HTML.
     * 
     * Esta función recorre todos los nodos de la superestructura y ejecuta el método
     * {@link Nodos.NodoElectrico#imprimir imprimir()} en cada uno, generando una salida visual útil
     * para depuración o inspección.
     * 
     * @returns {boolean} `true` si se imprimieron nodos, `false` si la superestructura está vacía.
     */
    /*static imprimir_superestructura() {
        if (!NodoElectrico.hay_nodos_en_superestructura()) {
            NodoElectrico._alerta("la superestructura está vacía");
            return false;
        }

        let contenedor = document.getElementById('superestructura');
        if (!contenedor) {
            contenedor = document.createElement('div');
            contenedor.id = 'superestructura';
            document.body.appendChild(contenedor);
        }

        const enlaceInicio = document.createElement('a');
        enlaceInicio.id = 'inicio';
        contenedor.appendChild(enlaceInicio);
        
        const funcion = nodo => {
          const temp = document.createElement("div");
          temp.innerHTML = nodo.imprimir();
          contenedor.appendChild(temp);
        }
        NodoElectrico.por_cada_nodo_ejecutar(NodoElectrico._token, funcion, null);

        return true;
    }*/


    /**
     * Imprime todos los nodos eléctricos de la superestructura en formato de texto (modo consola).
     * 
     * Esta función recorre todos los nodos de la superestructura y ejecuta el método
     * {@link Nodos.NodoElectrico#imprimir2 imprimir2()} de cada nodo, generando una salida en texto plano.
     * Está pensada exclusivamente para depuración en entornos de consola.
     * 
     * @returns {boolean} `true` si se imprimieron nodos, `false` si la superestructura está vacía.
     */
    /*static imprimir_superestructura2() {
        if (!NodoElectrico.hay_nodos_en_superestructura()) {
            NodoElectrico._alerta("la superestructura está vacía");
            return false;
        }

        const funcion = nodo => nodo.imprimir2();
        NodoElectrico.por_cada_nodo_ejecutar(NodoElectrico._token, funcion, null);
        
        return true;
    }*/
}
export {NodoElectrico, Enlace}