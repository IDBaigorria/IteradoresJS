import { Objeto } from "../Nucleo/Objeto.js";
import { Nodo } from "../Nodos/index.js";
import { Conf } from '../Configuracion/index.js';
import { mezclar_clase_con_interfaces } from "../miscelaneas/mixin.js";
import { generarUUID } from "../miscelaneas/generarUUID.js";
import { IncidentesDobleVia, FabricaDeNodosElectricos, Energia, Fase} from "./Interfaces/index.js";

console.log("Nodo");
/**
 * Clase NodoElectrico
 * 
 * Todos los enlaces que generen estos nodos seran de "doble via", por eso cada Nodo maneja dos estrucuras
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
 * Hay que agregar por_cada_fase_ejecutar y establecer_fase
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
 *                  FALTA EL OTRO IMPRIMIR MIRAR IMPRIMIR_SUPERESTRUCTURA, 
 * 
 * @class
 * @author Ignacio David Baigorria
 * @version 0.0.3
 * @since 1.2
 * @extends Nodo
 * @implements {Nodos.Interfaces.IncidentesDobleVia}
 * @implements {Nodos.Interfaces.Energia}
 * @implements {Nodos.Interfaces.FabricaDeNodosElectricos}
 * @implements {Nodos.Interfaces.Fase}
 * @memberof Nodos
 * 
 */
class NodoElectrico extends  mezclar_clase_con_interfaces(Nodo, FabricaDeNodosElectricos, IncidentesDobleVia, FabricaDeNodosElectricos, Energia, Fase) {

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
     * Fase de trabajo
     * @type {String}
     * @protected
     */
    static _fase='a';
	/**
	 * Un array con key igual a los nombres de la fases y valor booleanto true si el nombre de fase fue utilizado
	 * en algun momento
	 * @var array
	 */
	static _fases= new Set(['']);;
    /**
     * Establece la "fase" en la que trabajan todos los nodos
     * 
     * @param {String} token token de autorizacion
     * @param {String} fase string con el nombre de la fase
     */
    static establecer_fase(token, fase){
        if (typeof fase !== 'string' || !fase.trim()) {
            NodoElectrico._error("Nombre de fase inválido: debe ser un string no vacío");
            return;
        }
        const fase_normalizada = fase.trim();
        if (this.verificar_token(token)){
            this._fase=fase_normalizada;
            this._fases.add(faseNormalizada);
        }else{
            this._alerta("INTENTO DE ACCESO NO AUTORIZADO");
        }
    }
    /**********************************************************************************************
     *  INTERFAZ FASE (INSTANCIA)
     * 
     *  Metodos relacionados con la fase 
     **********************************************************************************************/
/**
     * Ejecuta una función por cada fase registrada en el nodo (Interfaz {@link Nodos.Interfaces.Fase Fase}).
     *
     * Permite iterar sobre todas las fases registradas en el nodo ejecutando una función
     * callback en cada una. Requiere token de seguridad por ser una operación sensible.
     * 
     * ---
     * 🔗 Métodos relacionados:
     * - {@link Nodos.NodoElectrico.establecer_fase establecer_fase}
     *
     * ---
     * @example
     * // Ejemplo de uso:
     * nodo.por_cada_fase_ejecutar(token, (fase) => {
     *     console.log(`Procesando fase: ${fase}`);
     * });
     *
     * @note Requiere token de seguridad válido.
     * @param {string} token Token de autorización
     * @param {Function} funcion Función a ejecutar en cada fase
     * @return {void}
     * @public
     * @since 0.0.1
     */
    por_cada_fase_ejecutar(token, funcion) {
      /*  if (!this.constructor.verificar_token(token)) {
            this.constructor._alerta("INTENTO DE ACCESO NO AUTORIZADO");
            return;
        }
        
        // Implementación: iterar sobre todas las fases registradas
        if (this.#S && this.#S.size > 0) {
            for (const [fase, adyacentes] of this.#S) {
                if (adyacentes && adyacentes.size > 0) {
                    funcion(fase);
                }
            }
        }
        
        if (this.#E && this.#E.size > 0) {
            for (const [fase, incidentes] of this.#E) {
                if (incidentes && incidentes.size > 0) {
                    // Evitar duplicados si ya se procesó esta fase desde #S
                    if (!this.#S || !this.#S.has(fase)) {
                        funcion(fase);
                    }
                }
            }
        }*/
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
     * Nivel de energia actual.
     * @type {Int}
     * @private
     */
    #energia;
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
     *
     * console.log("Nodos actuales:", Nodos.NodoElectrico.cantidad_de_nodos());
     * // Esperado: 2
     * @since V0.0.3
     */
    static crear(capacidad=Conf.CAPACIDAD_NODO_ELECTRICO, fuga=Conf.FUGA_NODO_ELECTRICO) {
      const nodo = new this();
      NodoElectrico._superestructura.set(nodo.id(),nodo);
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
            let nodo = Nodo.crear_con_dato("ARRAY");
            let nodoAux = nodo;
            for (const valor of dato) {
              const nodoAux2 = Nodo.crear_con_dato(valor, true);
              nodo._adyacente_en(nodoAux2, "siguiente");
              nodo = nodoAux2;
            }
            return nodoAux;
          } else {
            const nodo = Nodo.();
            nodo._dato(dato);
            return nodo;
          }
        } else {
          const nodo = Nodo.();
          for (const prop in dato) {
            nodo._adyacente_en(Nodo.crear_con_dato(dato[prop], true), prop);
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
     *
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
        Nodo._error(`No se pudo  el nodo con id ${id}`);
        return null;
      }
   }

    /**
     * Crear un nuevo nodo encapsulando un dato y asignándole un identificador válido (Interfaz {@link Nodos.Interfaces.FabricaDeNodosElectricos}).
     *
     * Este método combina las capacidades de {@link Nodos.NodoElectricoElectricos.crear_con_dato crear_con_dato()}  
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
     * //caso 3: se le pasa un parametro no Nodo y una funcion callback (crea una instancia de Nodo
     * //con el dato pasado por parametro. Además invoca a la funcion callback y le pasa el Nodo creado
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
     * //caso 4: se le pasa un parametro que es un Nodo y una funcion callback (crea una instancia de Nodo
     * //con el dato pasado por parametro. Además invoca a la funcion callback y le pasa el Nodo creado
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
        // Validación: debe ser instancia de Nodos.Nodo
        if (!(nodo instanceof NodoElectrico)) {
            NodoElectrico._error("El parámetro no es de la clase NodoElectrico");
            return null;
        }
        if (nodo._referencias === 0) {
            if (nodo._adyacentes !== undefined) {
                //dbo recorrer fase por fase
                for (let [, adyacentes] of nodo._adyacentes) {
                    //recorro cada adyacente de la fase
                    for (let [, nodo2] of adyacentes) {
                        nodo2._referencias--;
                    }
                }
                Nodo._superestructura.delete(nodoid);
                Nodo._nodos_especiales.delete(nodoid);
            }
        }

            /*   let nodoid=nodo.id()+"";//concateno con string vacio para hacer cast rapido
               // Caso 1: Solo 1 referencia (superestructura principal)
               if (nodo._referencias === 1) {
                   Nodo._superestructura.delete(nodoid);//concateno con string vacio para hacer cast rapido
     
                   if (nodo._adyacentes!==undefined) {
                       for (let [, nodo2] of nodo._adyacentes) {
                           nodo2._referencias--;
                       }
                   }
                   nodo.destructor();
                   return true;
               }
     
               // Caso 2: 2 referencias (posiblemente especial)
               else if (nodo._referencias === 2) {
                   if (nodo.es_especial()) {
     
                       Nodo._superestructura.delete(nodoid);
                       Nodo._nodos_especiales.delete(nodoid);
     
                       if (nodo._adyacentes!==undefined) {
                           for (let [, nodo2] of nodo._adyacentes) {
                               nodo2._referencias--;
                           }
                       }
                     nodo.destructor();
                     return true;
                   }else{
                       Nodo._error("debe eliminar todos los enlaces que apuntan hacia el nodo antes de intentar eliminarlo");
                       return null;
                   }
                   
               }
     
               // Caso 3: Más de 2 referencias → no se elimina
               else {
                   Nodo._error("debe eliminar todos los enlaces que enlazan hacia el nodo antes de intentar eliminarlo");
                   return false;
               }*/
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
            NodoElectrico._error("el parámetro no es de la clase Nodo");
            return false;
        }

        // Contar enlaces que apuntan al mismo nodo (autoenlaces)
        let contauto = 0;
        let contcomunes = 0;
        const id = nodo.id();
        if (nodo._adyacentes !== undefined) {
            //debo recorrer todos las fases
            for (const [, adyacentes] of nodo._adyacentes) {
                //recorreo cada nodo adyacente en la fase
                for (const [, nodo2] of adyacentes) {
                    if (id === nodo2.id()) {
                        contauto++;
                    } else {
                        contcomunes++;//cuenta enlaces comunes, si tiene algun enlace no cumple lo de autoenlazado
                    }
                }
            }
        }

        // Calcular referencias externas (descontando autoenlaces)
        const numref = nodo._referencias - contauto;

        if (numref === 0 && contcomunes === 0) {
            // Caso normal
            Nodo._superestructura.delete(id);
            Nodo._nodos_especiales.delete(id);
            nodo.destructor();
            return true;
        }
        // No cumple condiciones para eliminar
        return true;
    }

    /**********************************************************************************************
     *  INTERFAZ ENERGIA (TEMPORAL)
     **********************************************************************************************/

    /////////////////////////////////////////
    // Propiedades para la interfaz Energía
    /////////////////////////////////////////

    /**
     * Energía del nodo
     * @type {Map<string, number>}
     */
    energia = new Map();

    /**
     * Capacidad de energía máxima del nodo (Constante)
     * @type {number}
     */
    capacidad = 256;

    /**
     * Fuga de energía del nodo en el tiempo (Constante)
     * @type {number}
     */
    fuga = 0;

    /**
     * Funciones a ejecutar cuando se satura (por instancia)
     * @type {Map<string, Function> | null}
     */
    ejecutar_cuando_satura = null;

    /**
     * Funciones a ejecutar cuando se queda sin energía (por instancia)
     * @type {Map<string, Function> | null}
     */
    ejecutar_cuando_agota = null;

    /**
     * Funciones por defecto al saturar por fase (compartidas por toda la fase)
     * @type {Map<string, Function>}
     */
    static ejecutar_cuando_satura_por_defecto_por_fase = new Map();

    /**
     * Funciones por defecto al agotar por fase (compartidas por toda la fase)
     * @type {Map<string, Function>}
     */
    static ejecutar_cuando_agota_por_defecto_por_fase = new Map();

    /**
     * Fase actual (equivalente a self::$fase)
     * @type {string}
     */
    static fase = "default";


    //──────────────────────────────────────────────
    // Métodos de configuración de callbacks
    //──────────────────────────────────────────────

    /**
     * Asigna la función por defecto a ejecutar cuando un nodo se satura de energía
     * en una fase. Si no se indica la fase, se usa la fase actual.
     *
     * @param {Function} funcion - Función a ejecutar.
     * @param {string|null} [fase=null] - Fase a la que aplicar la función.
     * @returns {void}
     */
    static _ejecutar_cuando_satura_por_fase(funcion, fase = null) {
        const f = fase ?? NodoElectrico.fase;
        NodoElectrico.ejecutar_cuando_satura_por_defecto_por_fase.set(f, funcion);
    }

    /**
     * Obtiene la función por defecto que debe ejecutarse cuando un nodo se satura
     * en una fase. Si no se indica la fase, se usa la fase actual.
     *
     * @param {string|null} [fase=null] - Fase deseada.
     * @returns {Function|null}
     */
    static ejecutar_cuando_satura_por_fase(fase = null) {
        const f = fase ?? NodoElectrico.fase;
        return NodoElectrico.ejecutar_cuando_satura_por_defecto_por_fase.get(f) ?? null;
    }

    /**
     * Asigna la función a ejecutar cuando un nodo se satura (por instancia).
     * Esta función tiene prioridad sobre la de fase.
     *
     * @param {Function} funcion - Función a ejecutar.
     * @returns {void}
     */
    _ejecutar_cuando_satura(funcion) {
        if (this.ejecutar_cuando_satura === null) {
            this.ejecutar_cuando_satura = new Map();
        }
        this.ejecutar_cuando_satura.set(NodoElectrico.fase, funcion);
    }

    /**
     * Devuelve la función a ejecutar cuando un nodo se satura (por instancia).
     *
     * @returns {Function|null}
     */
    ejecutar_cuando_satura() {
        return this.ejecutar_cuando_satura?.get(NodoElectrico.fase) ?? null;
    }

    /**
     * Asigna la función a ejecutar cuando el nodo se queda sin energía (por instancia).
     *
     * @param {Function} funcion
     * @returns {void}
     */
    _ejecutar_cuando_agota(funcion) {
        if (this.ejecutar_cuando_agota === null) {
            this.ejecutar_cuando_agota = new Map();
        }
        this.ejecutar_cuando_agota.set(NodoElectrico.fase, funcion);
    }

    /**********************************************************************************************
     *  INTERFAZ ADYACENTES (INSTANCIA)
     * 
     *  Reemplazo de los metodos existentes
     **********************************************************************************************/
    /**
     * Verifica si el nodo tiene al menos un adyacente (Interfaz {@link Nodos.Interfaces.Adyacentes Adyacentes}).
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
        const faseactual =NodoElectrico._fase;
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
     * Verifica si el nodo actual tiene como adyacente al nodo indicado (Interfaz {@link Nodos.Interfaces.Adyacentes Adyacentes}).
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
     * const n1 = NodoElectrico.crear_con_dato("A");
     * const n2 = NodoElectrico.crear_con_dato("B");
     * n1._adyacente_en(n2, "enlaceAB");
     *
     * if (n1.tiene_adyacente_a(n2)) {
     *   console.log("A tiene a B como adyacente");
     * }
     *
     * @note Solo devuelve el nombre del enlace si realmente existe; `false` en caso contrario.
     * @param {Nodo} nodo Nodo a verificar.
     * @return {string|boolean} Nombre del enlace si existe, `false` en caso contrario.
     * @public
     * @since 0.0.1
     */
    tiene_adyacente_a(nodo) {
        if (!(nodo instanceof Nodo)) {
            NodoElectrico._error("El nodo que intenta comprobar no es una instancia de la clase Nodo.");
            return false;
        }
        if (!this.tiene_adyacente() || !nodo.tiene_incidente()) {
            return false;
        }
        const idObjetivo = nodo.id();
        // Iteración por todas las fases registradas en el nodo actual
        for (const [fase, adyacentes] of this._adyacentes) {
            // Verifica que adyacentes sea un Map válido y no esté vacío
            if (!(adyacentes instanceof Map) || adyacentes.size === 0) {
                continue;
            }

            // Recorre los enlaces dentro de la fase actual
            for (const [nombreEnlace, nodoAdyacente] of adyacentes) {
                if (nodoAdyacente?.id() === idObjetivo) {
                    //Nodo encontrado!
                    return nombreEnlace;
                }
            }
        }

        // Si no se encontró, devuelve false
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
     * @return {Nodo|null} Nodo adyacente si existe, `null` en caso contrario
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
        const faseactual =NodoElectrico._fase;
        if (!this._adyacentes.has(faseactual)){
            return null;
        }
        console.log("s6");
        if (!this._adyacentes.get(faseactual).size){
            return null;
        }
        console.log("s7");
        return this._adyacentes.get(faseactual).get(enlace) ?? null;
    }

    /**
     * Devuelve una copia de todos los adyacentes (Interfaz {@link Nodos.Interfaces.Adyacentes# Adyacentes}).
     *
     * Retorna todos los nodos adyacentes del nodo actual en un `Map` independiente, 
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
     * @return {?Map<string|number, Nodo>} Map con nodos adyacentes o `null` si no existen
     * @public
     * @since V0.0.1
     */
    adyacentes() {
      if (!this.tiene_adyacente()) {
          return new Map();
      } else {
          return new Map(this._adyacentes.get(NodoElectrico._fase));
      }
    }
    /**
     * Devuelve la cantidad de adyacentes (Interfaz {@link Nodos.Interfaces.Adyacentes Adyacentes}).
     *
     * Retorna el número total de nodos adyacentes actualmente vinculados al nodo.  
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
        if (this._adyacentes !== undefined && this._adyacentes.size > 0 && this._adyacentes.has(NodoElectrico._fase)) {
            return this._adyacentes.get(NodoElectrico._fase).size;
        } else {
            return 0;
        }
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
        const fase=NodoElectrico._fase;
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
        
        // Inicialización perezosa
        if (!this._adyacentes) {
            this._adyacentes = new Map();
        }
        
        const fase = NodoElectrico._fase;
        if (!this._adyacentes.has(fase)) {
            this._adyacentes.set(fase, new Map());
        }
        
        const adyacentes = this._adyacentes.get(fase);
        
        // Revisar si ya existía un nodo en esa posición
        if (adyacentes.has(enlace)) {
            if (reemplazar) {
                const nodo_existente = adyacentes.get(enlace);
                nodo_existente._referencias--;
                nodo_existente.eliminar_incidente(this,enlace);
            } else {
                this.constructor._error("Ya existía un nodo en el enlace que intenta asignar");
                return false;
            }
        }
        
        // Asignar adyacente
        adyacentes.set(enlace, un_nodo);
        un_nodo._incidente_en(this, enlace);
        
        // Sumar referencias del nodo enlazado
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
     * - {@link Nodos.Nodo#eliminar_adyacentes eliminar_adyacentes}
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
     * @return {Nodo|null} Nodo eliminado o null si no existe
     * @public
     * @since 0.0.1
     */
    eliminar_adyacente(enlace) {
        // Validación de tipo
        if (!this.constructor.validar_nombre_enlace(enlace)) {
            this.constructor._error("El enlace a eliminar no es válido");
            return null;
        }
        
        // Verificar inicialización perezosa
        if (this._adyacentes===undefined) {
            this.constructor._alerta("No hay adyacentes para eliminar");
            return null;
        }
        
        const fase = NodoElectrico._fase;
        if (!this._adyacentes.has(fase)) {
            this.constructor._alerta("No hay adyacentes para eliminar en la fase");
            return null;
        }
        
        const adyacentes = this._adyacentes.get(fase);
        
        // Verificar existencia del enlace
        if (!adyacentes.has(enlace)) {
            this.constructor._alerta(`El enlace ${enlace} que se intenta eliminar no existe`);
            return null;
        }
        
        const eliminado = adyacentes.get(enlace);
        eliminado._referencias--;
        adyacentes.delete(enlace);
        eliminado.eliminar_incidente(this, enlace);
        
        
        return eliminado;
    }
    /**
     * Elimina todos los enlaces del nodo (Interfaz {@link Nodos.Interfaces.Adyacentes Adyacentes}).
     *
     * Borra todas las conexiones salientes del nodo.  
     * Si no existen enlaces a adyacentes, lanza una alerta y devuelve un Map vacío.  
     * Si existen enlaces salientes, antes de eliminarlos, genera una copia de los
     * mismos con sus nodos adyacentes actuales y los devuelve. 
     * Permite de esa manera obtener una "foto" del estado previo del nodo.
     *
	   * ⚠️ Importante: Este método no elimina los nodos del sistema. Si se eliminan
	   * todos los enlaces que conectan a un nodo este aún permanece en el sistema 
	   * como nodo suelto a menos que se use el metodo estatico
	   * {@link ./classes/Nodos.Nodo.eliminar Nodo::eliminar($nodo)}
     * 
     * ---
     * 🔗 Método complementario:
     * - {@link Nodos.Nodo#eliminar_enlace eliminar_enlace}
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
     * const nodo = Nodo.crear_con_id("nodo");
     * const otroA = Nodo.crear_con_id("otroA");
     * const otroB = Nodo.crear_con_id("otroB");
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
     * @return {Map<string|number, Nodo>} Map con los nodos eliminados, o Map vacío si no había adyacentes
     * @since Modificado en V3.2.3
     * @deprecated
     */
    eliminar_adyacentes() {

         // Verificar inicialización perezosa
        if (this._adyacentes===undefined) {
            this.constructor._alerta("No hay adyacentes para eliminar");
            return null;
        }
        
        const fase = NodoElectrico._fase;
        if (!this._adyacentes.has(fase)) {
            this.constructor._alerta("No hay adyacentes para eliminar en la fase");
            return null;
        }
        
        const adyacentes = this._adyacentes.get(fase);

        const copia = new Map(adyacentes);
        adyacentes.clear();
        for (const [enlace, eliminado] of copia) {
            eliminado._referencias--;
            eliminado.eliminar_incidente(this, enlace)
        }
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
            return new Map();
        }

        const resultados = new Map();
        const adyacentes = this._adyacentes.get(NodoElectrico._fase);
        
        for (const [enlace, nodo] of adyacentes) {
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
     * Verifica si el nodo es adyacente de al menos un nodo(Interfaz {@link Nodos.Interfaces.Incidentes Incidentes}).
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
        const fase=NodoElectrico._fase;
        for(const [idincidente, fases] of idincidentes){
            if(fases.has(fase)){
                const res=fases.size;
                if (res) return true;
            }
        }
        return false;
    }

    /**
     * Verifica si el nodo actual es adyacente del nodo indicado (Interfaz {@link Nodos.Interfaces.Adyacentes Adyacentes}).
     *
     * Comprueba si el nodo actual se encuentra enlazado desde el nodo pasado como parámetro.  
     * Para optimizar, se valida tanto que el nodo actual posea conexiones entrantes 
     * como que el nodo objetivo tenga adyacentes salientes.
     *
     * ---
     * 🔗 Método complementario:
     * - {@link Nodos.Nodo#tiene_adyacente_a tiene_adyacente_a()}
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
     * const nA = NodoElectrico.crear_con_dato("A");
     * const nB = NodoElectrico.crear_con_dato("B");
     * nB._adyacente_en(nA, "enlaceBA");
     *
     * if (nA.tiene_incidente_a(nB)) {
     *   console.log("B es incidente de A");
     * }
     *
     * @note Solo devuelve el nombre del enlace si realmente existe; `false` en caso contrario.
     * @param {Nodo} nodo Nodo a verificar.
     * @return {string|boolean} Nombre del enlace si existe, `false` en caso contrario.
     * @public
     * @since 0.0.1
     */
    tiene_incidente_a(nodo) {
        if (!(nodo instanceof NodoElectrico)) {
            NodoElectrico._error("El nodo que intenta comprobar no es una instancia de la clase NodoElectrico.");
            return false;
        }
        if (this._incidentes!==undefined){
            const id=String(nodo.id());
            if (this._incidentes.has(id)){
                const fases=this._incidentes.get(id);
                if (fases.has(NodoElectrico._fase)){
                    return true;
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
     * @return {Nodo|null} Nodo adyacente si existe, `null` en caso contrario
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
        const faseactual =NodoElectrico._fase;
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
     * Retorna todos los nodos incidentes del nodo actual en un `Map` independiente, 
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
     * @return {?Map<string|number, Nodo>} Map con nodos adyacentes o `null` si no existen
     * @public
     * @since V0.0.1
     */
    incidentes() {
        const res= new Map();
        if (this._incidentes!==undefined){
            const idincidentes=this._incidentes;
            const faseactual=NodoElectrico._fase;
            for(const [idincidente, fases] of idincidentes){
                if (fases.has(faseactual)){
                    const fase=fases.get(faseactual);
                    const mapfase=new Map([...fase]);
                    res.set(idincidente, mapfase);
                } 
            }
        }
        return res;
    }

    /**
     * Devuelve la cantidad de incidentes (Interfaz {@link Nodos.Interfaces.Incidentes Incidentes}).
     *
     * Retorna el número total de nodos incidentes actualmente vinculados al nodo.  
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
            const fase=NodoElectrico._fase;
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
        const fase=NodoElectrico._fase;
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
        const fase = NodoElectrico._fase;
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
     * - {@link Nodos.Nodo#eliminar_adyacente eliminar_adyacente}
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
        
        const fase = NodoElectrico._fase;
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
     * - {@link Nodos.Nodo#eliminar_adyacente eliminar_adyacente}
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
        const fase =NodoElectrico._fase;
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
     * invoquen directa o indirectamente a {@link NodoElectrico.por_cada_nodo_ejecutar}.
     *
     * @type {string}
     * @private
     * @see NodoElectrico.registrar_controlador
     */
   // static _token = generarUUID();
    /*************************************************************************************************************/
/////////////////////////////////////////////////////////////////////////////////////////////////////////////*/
/////////////////////////////////////////////////////////////////////////////////////////////////////////////*/
//INTERFACE PARA IMPRIMIR LOS NODOS*************************************************/////////////////////////*/
/////////////////////////////////////////////////////////////////////////////////////////////////////////////*/
/////////////////////////////////////////////////////////////////////////////////////////////////////////////*/
/*************************************************************************************************************/

    /**
     * Imprime el nodo en formato HTML (Interfaz {@link Nodos.Interfaces.Impresion}).
     *
     * Muestra una representación visual del nodo con su id, dato, adyacencias incidencias
     * capacidad, fuga, energia y número de referencias.
     * Pensada para uso en entornos de depuración o visualización dentro de un navegador.
     *
     * ---
     * 🔗 Otros métodos complementarios:
     * - {@link Nodos.Nodo#imprimir2 imprimir2()} — versión en texto plano.
     * - {@link Nodos.Nodo#id id()} — obtiene el identificador del nodo.
     * - {@link Nodos.Nodo_dato dato()} — obtiene el dato asociado al nodo.
     * - {@link Nodos.Nodo#tiene_adyacente tiene_adyacente()} — comprueba adyacencias.
     *
     * ---
     * @example
     * nodo.imprimir(); // imprime el nodo como bloque HTML
     *
     * @note Utiliza `console.log` o manipulación directa del DOM para mostrar HTML.
     * @return {void}
     */
    imprimir() {
        const id = this.id();
        const dato = this.dato();
       // const adyacentes = this.adyacentes();

        let html = `<div id="nodo-${id}" style="margin-bottom:20px;">`;
        html += `>>NODO ${id}${this.es_especial() ? " (ESP)" : ""} - Dato: `;

        if (typeof dato === "string") html += dato;
        else if (dato === null) html += "null";
        else html += "este dato no es un string";

        html +="<br/>Referencias: "+this._referencias;
        html +="<br/>Capacidad: "+this.#capacidad;
        html +="<br/>Fuga: "+this.#fuga;
        html +="<br/>Energia: "+this.#energia;//aca tengo que modificar cuando haga la itnerfaz energia
        html += "<br/>Adyacentes:<br/>";
      
        if (this._adyacentes!==undefined) {
             const fases = this._adyacentes;
            html += "<ul>";
            for (const [fase, adyacentes] of fases) {
                html += "<h3>fase: "+fase+"</h3>";
                html += "<ul>";
                console.log(adyacentes);
                for (const [enlace, adyacente] of adyacentes){
                  html += `<li>[${enlace}] => <a href="#nodo-${adyacente.id()}">${adyacente.id()}</a></li>`;
                }
                html += "</ul>"
            }
            html += "</ul>";
        } else {
            html += "No tiene<br/>";
        }
         html += "<br/>Incidentes:<br/>";
        if (this._incidentes!==undefined) {
             const nodos = this._incidentes;
            html += "<ul>";
            for (const [idnodo, fases] of nodos) {
                html += "<h3>idnodo: "+idnodo+"</h3>";
                html += "<ul>";
                //console.log(incidentes);
                for (const [fase, incidentes] of fases){
                    html += "<h4>fase: "+fase+"</h4>";
                    html += "<ul>";  
                    for (const [enlace, incidente] of incidentes){              
                        html += `<li>[${enlace}] => <a href="#nodo-${incidente.id()}">${incidente.id()}</a></li>`;
                    }     
                    html+="</ul>";
                }

                html += "</ul>"
            }
            html += "</ul>";
        } else {
            html += "No tiene<br/>";
        }

        html += `Número de referencias a él: ${this._referencias}<br/>`;
        html += `Fin Nodo <a href="#inicio">↑ Volver al inicio</a></div><br/>`;

        return html;
    }

    /**
     * Imprime todos los nodos de la superestructura en formato HTML.
     * 
     * Esta función recorre todos los nodos de la superestructura y ejecuta el método
     * {@link Nodos.Nodo#imprimir imprimir()} en cada uno, generando una salida visual útil
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
     * Imprime el nodo en formato texto plano (Interfaz {@link Nodos.Interfaces.Impresion}).
     *
     * Muestra en consola (CLI o devtools) una descripción del nodo con su id, dato y adyacencias.
     * Útil para depuración en entorno de línea de comandos.
     *
     * ---
     * 🔗 Otros métodos complementarios:
     * - {@link Nodos.Nodo#imprimir imprimir()} — versión HTML.
     * - {@link Nodos.Nodo#id id()} — obtiene el identificador del nodo.
     * - {@link Nodos.Nodo_dato dato()} — obtiene el dato asociado al nodo.
     *
     * ---
     * @example
     * nodo.imprimir2(); // imprime el nodo en texto plano
     *
     * @note Devuelve `true` si se imprimió correctamente.
     * @return {boolean}
     */
    imprimir2() {
        const id = this.id();
        const dato = this.dato();

        console.log(`\n>> NODO ${id}${this.es_especial() ? " (ESP)" : ""}`);
        
        // Dato
        if (typeof dato === "string") console.log("Dato:", dato);
        else if (dato === null) console.log("Dato: null");
        else console.log("Dato: este dato no es un string");

        console.log("Referencias:", this._referencias);
        console.log("Capacidad:", this.#capacidad);
        console.log("Fuga:", this.#fuga);
        console.log("Energía:", this.#energia);

        // --- ADYACENTES ---
        console.log("Adyacentes:");
        if (this._adyacentes !== undefined) {
            for (const [fase, adyacentes] of this._adyacentes) {
                console.log(`  Fase: ${fase}`);
                for (const [enlace, adyacente] of adyacentes) {
                    console.log(`    [${enlace}] => Nodo ${adyacente.id()}`);
                }
            }
        } else {
            console.log("  No tiene");
        }

        // --- INCIDENTES ---
        console.log("Incidentes:");
        if (this._incidentes !== undefined) {
            for (const [idnodo, fases] of this._incidentes) {
                console.log(`  idnodo: ${idnodo}`);
                for (const [fase, incidentes] of fases) {
                    console.log(`    fase: ${fase}`);
                    for (const [enlace, incidente] of incidentes) {
                        console.log(`      [${enlace}] => Nodo ${incidente.id()}`);
                    }
                }
            }
        } else {
            console.log("  No tiene");
        }

        console.log(`Número de referencias a él: ${this._referencias}`);
        console.log("Fin Nodo\n");

        return true;
    }

    /**
     * Imprime todos los nodos de la superestructura en formato de texto (modo consola).
     * 
     * Esta función recorre todos los nodos de la superestructura y ejecuta el método
     * {@link Nodos.Nodo#imprimir2 imprimir2()} de cada nodo, generando una salida en texto plano.
     * Está pensada exclusivamente para depuración en entornos de consola.
     * 
     * @returns {boolean} `true` si se imprimieron nodos, `false` si la superestructura está vacía.
     */
    /*static imprimir_superestructura2() {
        if (!Nodo.hay_nodos_en_superestructura()) {
            NodoElectrico._alerta("la superestructura está vacía");
            return false;
        }

        const funcion = nodo => nodo.imprimir2();
        NodoElectrico.por_cada_nodo_ejecutar(NodoElectrico._token, funcion, null);
        
        return true;
    }*/
}
export {NodoElectrico}