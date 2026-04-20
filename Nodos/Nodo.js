import { Objeto } from "../Nucleo/index.js";
import { Conf } from '../Configuracion/index.js';
import { mezclar_clase_con_interfaces } from "../miscelaneas/mixin.js";
import { FabricaDeNodos, Datos, Adyacentes, Incidentes, AccesoASuperestructura, AccesoAEspeciales, Impresion } from "./Interfaces/index.js";
console.log("Nodo");
// Importar tu función de misceláneas (ajustá la ruta según tu estructura)
import { generarUUID } from "./../miscelaneas/generarUUID.js";

/**
 * Clase: Nodo
 *
 * Clase de prueba implementando objetivos pendientes sugeridos en el manual v1.0.
 * Se añaden interfaces para manipulación de atributos de nodos y enlaces (como el "peso").
 * Mantiene compatibilidad con implementaciones previas hasta que se actualicen.
 *
 *
 * ## CONSIDERACIONES GENERALES
 * - Clase base para la construcción de Nodos para grafos.
 * - Administra datos internos y enlaces a nodos adyacentes.
 * - Controla referencias y pertenencia a superestructuras comunes o especiales.
 *
 * ## VARIABLES DE INSTANCIA
 * - `referencias` → Número de enlaces que apuntan al nodo.
 * - `dato` → Dato contenido en el nodo (con interfaz de acceso).
 * - `adyacentes` → Array de nodos adyacentes.
 *
 * ## VARIABLES DE CLASE
 * - `static cant` → Cantidad total de nodos creados.
 * - `static superestructura` → Nodo raíz de la superestructura común.
 * - `static nodos_especiales` → Nodo raíz de la superestructura de nodos especiales.
 * 
 * ---
 * ## INTERFAZ FABRICADENODOS
 * 
 * Implementa la interfaz {@link Nodos.Interfaces.FabricaDeNodos FabricaDeNodos}
 * proporcionando la lógica concreta para la creación y eliminación de nodos dentro de la estructura.
 *
 * Esta clase es el núcleo de la construcción de grafos y redes: cada instancia representa un nodo
 * que puede contener datos, identificadores *especiales* y enlaces a otros nodos adyacentes.
 *
 * Responsabilidades principales:
 * - Encapsular datos arbitrarios dentro de nodos válidos.
 * - Administrar la creación de nodos con o sin identificadores *especiales*.
 * - Garantizar que cualquier valor pueda convertirse en nodo válido.
 * - Gestionar el conteo de instancias vivas mediante la variable estática de control.
 * - Ejecutar la eliminación controlada de nodos bajo las condiciones de integridad requeridas.
 *
 * ---
 * ## INTERFAZ DATOS
 * 
 * Implementa la interfaz {@link Nodos.Interfaces.Datos Datos},
 * proporcionando la capacidad de almacenar y recuperar un valor cualquiera.
 *
 * Métodos implementados de la interfaz Datos:
 * - {@link Nodos.Nodo#_dato _dato()} : asigna un valor al nodo.
 * - {@link Nodos.Nodo_dato dato()}   : devuelve el valor almacenado en el nodo.
 * 
 * ---
 * ## INTERFAZ ADYACENTES
 * 
 * La clase también implementa la interfaz {@link Adyacentes}, 
 * que define un conjunto de métodos para manejar y consultar las relaciones 
 * de adyacencia entre nodos.
 *
 * Gracias a esta interfaz, un nodo puede:
 * - {@link Nodo#tiene_adyacente tiene_adyacente} Verificar si tiene adyacentes.
 * - {@link Nodo_cantidad_de_adyacentes cantidad_de_adyacentes} Obtener la cantidad de adyacentes.
 * - {@link Nodo#_adyacente _adyacente} Agregar un nodo adyacente generando un enlace automáticamente.
 * - {@link Nodo#_adyacente_en _adyacente_en} Agregar un nodo adyacente en un enlace suministrado.
 * - {@link Nodo#eliminar_enlace eliminar_enlace} Eliminar un enlace hacia un adyacente específico.
 * - {@link Nodo#eliminar_enlaces eliminar_enlaces} Eliminar todos los enlaces a adyacentes.
 * - {@link Nodo#adyacente adyacente} Recuperar un adyacente en particular.
 * - {@link Nodo_adyacentes adyacentes} Recuperar todos los adyacentes.
 * - {@link Nodo#tiene_adyacente_a tiene_adyacente_a} Verificar si existe adyacente en un enlace específico.
 * - {@link Nodo#tiene_incidente tiene_incidente} Verificar si este nodo es adyacente de otros nodos.
 * - {@link Nodo#tiene_incidente_a tiene_incidente_a} Verificar si este nodo es adyacente de un nodo suministrado.
 * - {@link Nodo#validad_nombre_enlace validad_nombre_enlace} Verificar que el nombre del enlace sea válido.
 * - {@link Nodo#por_cada_adyacente_ejecutar por_cada_adyacente_ejecutar} Ejecutar una función en cada adyacente.
 * 
 * ---
 * 
 * ## Historial de cambios ##
 * 
 * **V3.2.1** Implemento interfaz FabricaDeNodos
 * **V3.2.2** Implemento interfaz Datos
 * **V3.2.3** **Desicion importante**: A partir de ahora todos los enlaces seran string para 
 *            homogeneizar y simplicar algunas tareas como eliminar_enlace. 
 *            Esto reducirá los tiempos de eliminar_enlace de O(n) a O(1).
 *            Se tiene en cuenta que la gran mayoria de los casos de uso reales no he 
 *            usado numeros para los enteros. Solo al principio. 
 * **V3.2.3.250930** Finalizada refactorizacion de interfas Adyacentes
 * **V3.2.4.250930** Comienzo con interfaces AccesoASuperestructura y AccesoAEspeciales
 * **V3.2.4.250930** Despues de varias charlas con IA respecto a la incializacion perezosa del array adyacentes
 *                    he decidido que no tiene sentido en JS, al contrario de PHP donde si lo tiene. Voy a proceder
 *                    a realizar las reformas  
 * **V3.2.5.251006** **desicion importante** ver notas en php       
 * **V3.2.5.251021** elimine todos los vestigios de superestructura y nodos_especiales como Nodo (abora va a ser un array), 
 *                    modifique los lugares donde se usaba referencias === 1 o 2.
 *                  terminada interfaz de accesoASuperestructura, ahora voy por especiales
 * **V3.2.6.251121:** agrego interfaz Incidentes
 * **V3.2.7.251124:** repaso la interfaz adyacentes implementando y los procedimientos que faltan y viendo la documentacion
 * **V3.3.0.260108: Retomo despues de un tiempo con ideas mas claras. Comienzo revicion y agregado de lo que falta. Igualo numeracion con PHP**
 * 
 * @class
 * @author Ignacio David Baigorria
 * @version 3.2.7
 * @since 0.0
 * @extends Objeto
 * @implements {Nodos.Interfaces.FabricaDeNodos}
 * @implements {Nodos.Interfaces.Datos}
 * @implements {Nodos.Interfaces.Adyacentes}
 * @implements {Nodos.Interfaces.Incidentes}
 * @implements {Nodos.Interfaces.AccesoASuperestructura}
 * @implements {Nodos.Interfaces.AccesoAEspeciales}
 * @implements {Nodos.Interfaces.Impresion}
 * @memberof Nodos
 * 
 */
class Nodo extends mezclar_clase_con_interfaces(Objeto, FabricaDeNodos, Datos, Adyacentes, Incidentes, AccesoASuperestructura, AccesoAEspeciales, Impresion) {
    ////////////////////////////////////////////////////
    // VARIABLES DE INSTANCIA
    ////////////////////////////////////////////////////

    /**
     * Cantidad de enlaces hacia sí mismo que tiene el nodo.
     * @type {number}
     * @protected
     */
    _referencias = 0;

    /**
     * Dato principal almacenado en el nodo.
     * @type {*}
     * @protected
     */
    _dato;

    /**
     * Enlaces hacia nodos adyacentes.
     * @type {Map<string, Nodo>}
     * @protected
     */
    _adyacentes;

    ////////////////////////////////////////////////////
    // VARIABLES DE CLASE
    ////////////////////////////////////////////////////

    /**
     * Cantidad total de nodos actuales.
     * @type {number}
     * @static
     * @protected
     */
    static _cant = 0;

    /**
     * Superestructura: Nodo que enlaza con todos los nodos comunes creados.
     * @type {Map}
     * @static
     * @protected
     */
    static _superestructura = new Map();

    /**
     * Superestructura: Nodo que enlaza con todos los nodos especiales creados.
     * @type {Map}
     * @static
     * @protected
     */
    static _nodos_especiales = new Map();;

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///// Interfaz FabricaDeNodos //////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * Constructor de la clase Nodo
     *
     * Interfaz: Construcción y destrucción
     * Caso de uso: Crea internamente un nodo
     * @note Incrementa el contador de nodos existentes (Nodo._cant)
     * @function
     * @protected
     */
    constructor() {
        super();
        Nodo._cant++;
    }

    /**
     * Destructor simulado de la clase Nodo
     *
     * Interfaz: Construcción y destrucción
     * Caso de uso: Destruye internamente un nodo
     *
     * @protected
     * @note Decrementa el contador de nodos existentes (Nodo._cant)
     * @function
     */
    destructor() {
        Nodo._cant--;
    }

    /**
     * Devuelve la cantidad de nodos existentes actualmente en el sistema (Interfaz {@link Nodos.Interfaces.FabricaDeNodos FabricaDeNodos})
     *
     * Implementa el contrato definido en la interfaz
     * {@link Nodos.Interfaces.FabricaDeNodos.cantidad_de_nodos FabricaDeNodos.cantidad_de_nodos}.
     *
     * El conteo se mantiene en la propiedad estática privada {@link Nodos.Nodo._cant},
     * la cual se incrementa en {@link Nodos.Nodo#constructor constructor} y se decrementa en 
     * {@link Nodos.Nodo#destructor destructor}.
     *
     * ---
     * Métodos relacionados
     * - {@link Nodos.Nodo.crear()}
     * - {@link Nodos.Nodo.crear_con_dato crear_con_dato()}
     * - {@link Nodos.Nodo.crear_con_id crear_con_id()}
     * - {@link Nodos.Nodo.crear_con_dato_e_id crear_con_dato_e_id()}
     * - {@link Nodos.Nodo.nodo nodo()}  
     * - {@link Nodos.Nodo.eliminar eliminar()}
     *
     * @since V2.7
     * @static
     * @returns {number} Cantidad total de instancias de {@link Nodos.Nodo Nodo} existentes.
     *
     * @note Este método no requiere argumentos porque la cuenta es global 
     *       y compartida entre todas las instancias de la clase.
     *
     * ---
     * @example
     * console.log("Cantidad de nodos:", Nodo.cantidad_de_nodos()); //Esperado: 0
     *
     * const n1 = Nodo.(); 
     * const n2 = Nodo.();
     *
     * console.log(Nodo.cantidad_de_nodos()); 
     * // Esperado: 2
     *
     * Nodo.eliminar(n1);
     * console.log(Nodo.cantidad_de_nodos());
     * // Esperado: 1
     */
      static cantidad_de_nodos() {
        return Nodo._cant;
      }

    /**
     * Crea una nueva instancia de {@link Nodos.Nodo} (Interfaz {@link Nodos.Interfaces.FabricaDeNodos FabricaDeNodos}).
     *
     * Este método implementa el contrato definido en la interfaz
     * {@link Nodos.Interfaces.FabricaDeNodos.crear FabricaDeNodos.crear()}.
     *
     * El constructor de la clase es privado, con lo que se asegura que las instancias 
     * no puedan se de forma directa desde el exterior, por lo que éste método es una
     * de las formas válidas de  nodos.
     * 
     * 🔗 Otros métodos de creacion que se pueden usar son:
     * - {@link Nodos.Nodo.crear_con_dato crear_con_dato()}
     * - {@link Nodos.Nodo.crear_con_id crear_con_id()}
     * - {@link Nodos.Nodo.crear_con_dato_e_id crear_con_dato_e_id()}
     * - {@link Nodos.Nodo.nodo nodo()}  
     * 
     * ---
     * 🔗 Otros métodos relacionados
     * - {@link Nodos.Nodo.eliminar eliminar()}
     * - {@link Nodos.Nodo.cantidad_de_nodos Nodo.cantidad_de_nodos}  
     *
     * ---
     * @static
     * @returns {Nodo} Una nueva instancia de {@link Nodos.Nodo}.
     *
     * @note Este método incrementa el contador estático de la clase
     *       {@link Nodos.Nodo.cantidad_de_nodos}, y lo agrega a la Superestructura 
     *       lo que permite llevar un registro global de las instancias vivas.
     *
     * @example
     * const n1 = Nodos.Nodo.();
     * const n2 = Nodos.Nodo.();
     *
     * console.log("Nodos actuales:", Nodos.Nodo.cantidad_de_nodos());
     * // Esperado: 2
     */
    static crear() {
      const nodo = new this();
      Nodo._superestructura.set(nodo.id(),nodo);
      return nodo;
    }

    /**
     * Crear un nuevo nodo encapsulando el dato recibido (Interfaz {@link Nodos.Interfaces.FabricaDeNodos FabricaDeNodos}).
     *
     * Este método crea una nueva instancia de la clase {@link Nodos.Nodo} a partir de un dato cualquiera.  
     * El dato no es procesado ni verificado: se encapsula directamente en el nodo, lo que lo hace
     * muy flexible para representar tanto valores primitivos como estructuras complejas (arrays, objetos, etc.).
     *
     * El constructor de la clase es privado, con lo que se asegura que las instancias 
     * no puedan se de forma directa desde el exterior, por lo que éste método es una
     * de las formas válidas de  nodos.
     * 
     * 🔗 Otros métodos de creacion que se pueden usar son:
     * - {@link Nodos.Nodo.crear()}
     * - {@link Nodos.Nodo.crear_con_id crear_con_id()}
     * - {@link Nodos.Nodo.crear_con_dato_e_id crear_con_dato_e_id()}
     * - {@link Nodos.Nodo.nodo nodo()}  
     * 
     * ---
     * 🔗 Métodos relacionados:
     * - {@link Nodos.Nodo.eliminar eliminar()}
     * - {@link Nodos.Nodo.cantidad_de_nodos cantidad_de_nodos()}
     *
     * @example
     * // Ejemplo de uso:
     * const nodo = Nodos.Nodo.crear_con_dato("Hola Mundo");
     * console.log(nodo.dato()); // Devuelve: "Hola Mundo"
     * 
     * @note Este método incrementa el contador estático de la clase
     *       {@link Nodos.Nodo.cantidad_de_nodos}, y lo agrega a la Superestructura 
     *       lo que permite llevar un registro global de las instancias vivas.
     * 
     * @static
     * @param {*} dato Valor a encapsular en el nuevo nodo.
     * @returns {Nodo} Instancia de nodo que encapsula el dato.
     *
     */
    static crear_con_dato(dato, todos = false) {
      if (!todos) {
        const nodo = new this();
        nodo._dato=dato;
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
     * Crear un nuevo nodo asignándole un identificador válido (Interfaz {@link Nodos.Interfaces.FabricaDeNodos FabricaDeNodos}).
     *
     * Este método permite  un nodo directamente a partir de un identificador.  
     * Antes de instanciar el nodo, el identificador debe ser unico y es evaluado mediante el método
     * {@link Nucleo.Objeto.es_id_especial es_id_especial(id)}, lo que asegura que cumple con los criterios
     * internos de validez para identificadores *especiales*. 
     * Si el identificador no supera la verificación, el nodo no será creado y generará un mensaje de error.
     *
     * El constructor de la clase {@link Nodos.Nodo} es privado, por lo que esta función constituye
     * una de las formas válidas de construir nodos desde el exterior.
     *
     * 🔗 Otros métodos de creación que se pueden usar:
     * - {@link Nodos.Nodo.crear()}
     * - {@link Nodos.Nodo.crear_con_dato crear_con_dato()}
     * - {@link Nodos.Nodo.crear_con_dato_e_id crear_con_dato_e_id()}
     * - {@link Nodos.Nodo.nodo nodo()}  
     *
     * ---
     * 🔗 Métodos relacionados:
     * - {@link Nodos.Nodo.eliminar eliminar()}
     * - {@link Nodos.Nodo.cantidad_de_nodos cantidad_de_nodos()}
     * - {@link Nucleo.Objeto#es_especial es_especial()}
     * 
     * @example
     * // Ejemplo de uso:
     * const nodo = Nodos.Nodo.crear_con_id("soy_especial");
     * console.log(nodo.id()); // Devuelve: "soy_especial"
     *
     * @note Este método incrementa el contador estático de la clase
     *       {@link Nodos.Nodo.cantidad_de_nodos} y lo agrega a la Superestructura.
     *
     * @static
     * @param {*} id Identificador *especial* a asignar al nuevo nodo (debe pasar la verificación).
     * @returns {Nodo|null} Instancia de nodo con el identificador asignado o null si no pudo lo.
     *
     */
    static crear_con_id(id) {
      const nodo = new this();
      if (nodo._id(id)) {
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
     * Crear un nuevo nodo encapsulando un dato y asignándole un identificador válido (Interfaz {@link Nodos.Interfaces.FabricaDeNodos}).
     *
     * Este método combina las capacidades de {@link Nodos.Nodo.crear_con_dato crear_con_dato()}  
     * y {@link Nodos.Nodo.crear_con_id crear_con_id()}.  
     * Permite instanciar un nodo con un valor cualquiera (primitivo, complejo u otro nodo) y a la vez asignarle
     * un identificador único *especial* que debe pasar la validación de {@link Nodos.Objeto.es_id_especial}.
     *
     * El constructor de la clase {@link Nodos.Nodo} es privado, de modo que esta función constituye una de las formas válidas de creación de nodos.
     *
     * ---
     * 🔗 Otros métodos de creación que se pueden usar:
     * - {@link Nodos.Nodo.crear()}
     * - {@link Nodos.Nodo.crear_con_dato crear_con_dato()}
     * - {@link Nodos.Nodo.crear_con_id crear_con_id()}
     * - {@link Nodos.Nodo.nodo nodo()}  
     * 
     * ---
     * 🔗 Métodos relacionados:
     * - {@link Nodos.Nodo.eliminar eliminar()}
     * - {@link Nodos.Nodo.cantidad_de_nodos cantidad_de_nodos()}
     * - {@link Nucleo.Objeto#es_especial es_especial()}
     * 
     * @example
     * // Ejemplo de uso:
     * const nodo = Nodos.Nodo.crear_con_dato_e_id("Hola Mundo", "soy_especial");
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
     * @returns {Nodo|null} Instancia de nodo con dato e identificador *especial* válido si tuvo exito o null en caso contrario.
     *
     */
      static crear_con_dato_e_id(dato, id) {
        if (Objeto.es_id_especial(id)){
          const nodo = new this();
          if (nodo._id_interno(id)) {
            Nodo._superestructura.set(id, nodo);
            Nodo._nodos_especiales.set(id, nodo);
            nodo._dato=dato;
            return nodo;
          }
          Nodo._error(`No se pudo  el nodo con dato e id ${id}`);
          return null;  
        }
        Nodo._error("Para asignar un id, este debe ser especial");
        return null;
      }
      
    /**
     * Garantizar que el elemento entregado sea un nodo válido (Interfaz {@link Nodos.Interfaces.FabricaDeNodos FabricaDeNodos}).
     *
     * Este método recibe un valor cualquiera (o ninguno) o un posible nodo y asegura que el resultado final
     * sea siempre una instancia de {@link Nodos.Nodo}.  
     *
     * Comportamiento:
     * - Si no recibe ningun parámetro crea un Nodo vacío totalmente válido
     * - Si el parámetro recibido **ya es un Nodo**, simplemente lo retorna y pasa `true` a `esNodo` en el callback.  
     * - Si el parámetro **no es un Nodo**, crea uno nuevo con 
     *   {@link Nodos.Nodo.crear_con_dato crear_con_dato()}, lo retorna y pasa `false` a `esNodo`.  
     * - Si no se pasa ningún valor en el parámetro `elemento`, crea un nodo vacío totalmente válido
     *   encapsulando `null`.  
     *
     * ⚠️ El callback es opcional y se ejecuta inmediatamente antes de retornar el nodo.  
     * Se llama con dos argumentos:
     *   1. `nodo` → La instancia de {@link Nodos.Nodo} creada o pasada.
     *   2. `esNodo` → Booleano que indica si el parámetro original ya era un nodo (`true`) o no (`false`).
     *   
     * Esto permite al llamador obtener información sobre el tipo del elemento mientras se trabaja
     * con nodos válidos sin necesidad de variables externas.
     *
     * El constructor de {@link Nodos.Nodo} es privado, así que esta función constituye una de las
     * formas válidas de creación de nodos.
     *
     * --- 
     * 🔗 Otros métodos de creación:
     * - {@link Nodos.Nodo.crear()}
     * - {@link Nodos.Nodo.crear_con_dato crear_con_dato()}
     * - {@link Nodos.Nodo.crear_con_id crear_con_id()}
     * - {@link Nodos.Nodo.crear_con_dato_e_id crear_con_dato_e_id()}
     *
     * --- 
     * 🔗 Otros métodos relacionados:
     * - {@link Nodos.Nodo.eliminar eliminar()}
     * - {@link Nodos.Nodo.cantidad_de_nodos cantidad_de_nodos()}
     *
     * --- 
     * @example
     * // Caso 0: se lo llama sin ningún parámetro (crea nodo vacio completamente valido): 
     * const nodo0= Nodo.nodo();
     * console.log(nodo0.dato()); // "null"
     * console.log(nodo0.id()); //0
     * console.log(Nodo.cantidad_de_nodos());//1
     * 
     * // Caso 1: se le pasa un parámetro no Nodo (crea un nodo con el dato pasado por parametro)
     * const nodo1=Nodo.nodo("Soy el nodo 1");
     * console.log(nodo1.dato()); // "Soy el nodo 1"
     * console.log(nodo1.id());//1
     * console.log(Nodo.cantidad_de_nodos());//2
     * 
     * // Caso 2: le paso un parametro que es un nodo (no crea ningun nodo, devuelve el mismo nodo)
     * const nodo2=Nodo.nodo(nodo1);
     * console.log(nodo2.dato()); // "soy el nodo 1"
     * console.log(nodo2.id()); //1
     * console.log(Nodo.cantidad_de_nodos());//2
     * 
     * //caso 3: se le pasa un parametro no Nodo y una funcion callback (crea una instancia de Nodo
     * //con el dato pasado por parametro. Además invoca a la funcion callback y le pasa el Nodo creado
     * //y otro parametro booleano para que pueda verificar si el dato original era un nodo o no)
     * const nodo3 = Nodo.nodo("soy nodo 3", (nodo, esNodo) => {
     *     if (esNodo){
     *        console.log("el parametro de entrada era un nodo");
     *     }else{
     *        console.log("el parametro de entrada no era un nodo"); // Imprime esto
     *     }
     * });
     * console.log(nodo3.id());//2
     * condole.log(Nodo.cantidad_de_nodos());//3
     * 
     * //caso 4: se le pasa un parametro que es un Nodo y una funcion callback (crea una instancia de Nodo
     * //con el dato pasado por parametro. Además invoca a la funcion callback y le pasa el Nodo creado
     * //y otro parametro booleano para que pueda verificar si el dato original era un nodo o no)
     * const nodo4 = Nodo.nodo(nodo3, (nodo, esNodo) => {
     *     if (esNodo){
     *        console.log("el parametro de entrada era un nodo"); //imprime esto
     *     }else{
     *        console.log("el parametro de entrada no era un nodo"); 
     *     }
     * });
     * console.log(nodo4.id());//2
     * console.log(Nodo.cantidad_de_nodos());//3
     * 
     *
     * @static
     * @param {*} [elemento=null] Valor a encapsular o nodo existente. Si se omite, se crea un nodo vacío.
     * @param {function(Nodo, boolean)=} callback Función opcional que recibe el nodo creado y un booleano
     *                                                indicando si el parámetro original ya era un nodo.
     * @returns {Nodo} Nodo válido que encapsula el valor recibido.
     *
     * @since V2.9.3
     */
    static nodo(elemento = null, callback = null) {
        let nodo, es_nodo;
        if (elemento instanceof Nodo) {
            nodo = elemento;
            es_nodo = true;
        } else {
            nodo = new this();
            nodo._dato=elemento;
            Nodo._superestructura.set(nodo.id(), nodo);
            es_nodo = false;
        }
        if (callback) callback(nodo, es_nodo);
        return nodo;
    }

    /**
     * Eliminar un nodo del sistema (Interfaz {@link Nodos.Interfaces.FabricaDeNodos FabricaDeNodos}).
     * 
     * Este método intenta eliminar el nodo indicado de la superestructura,
     * de los nodos especiales (si corresponde) y del sistema en general. 
     * Devuelve `true` en caso de éxito.
     *
     * ⚠️ Condición imprescindible: el nodo no debe tener enlaces entrantes
     * desde otros nodos. Si existen, la operación devuelve `false` y lanza
     * un error.  
     *
     *
     * ---
     * 🔗 Métodos de creación relacionados:
     * - {@link Nodos.Nodo.crear()}
     * - {@link Nodos.Nodo.crear_con_dato crear_con_dato()}
     * - {@link Nodos.Nodo.crear_con_id crear_con_id()}
     * - {@link Nodos.Nodo.crear_con_dato_e_id crear_con_dato_e_id()}
     * - {@link Nodos.Nodo.nodo nodo()} 
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
     * let nodo = Nodo.crear_con_dato("Eliminarme");
     *
     * // Eliminar el nodo
     * let resultado = Nodo.eliminar(nodo);
     * console.log(resultado); // true
     *
     * // Intentar eliminar un nodo con referencias
     * let nodoA = Nodo.crear_con_dato("A");
     * let nodoB = Nodo.crear_con_dato("B");
     * nodoA._adyacente(nodoB);
     * console.log(Nodo.eliminar(nodoB)); // false
     *
     * @static
     * @param {Nodo} nodo Nodo a eliminar.
     * @returns {boolean|null} `true` si fue eliminado, `false` si no pudo eliminarse,
     *                         `null` si el parámetro no es válido.
     */
      static eliminar(nodo) {
          // Validación: debe ser instancia de Nodos.Nodo
          if (!(nodo instanceof Nodo)) {
              Nodo._error("El parámetro no es de la clase Nodo");
              return null;
          }
          if (nodo._referencias===0){
              if (nodo._adyacentes!==undefined) {
                  for (let [, nodo2] of nodo._adyacentes) {
                      nodo2._referencias--;
                  }
              }
              Nodo._superestructura.delete(nodoid);
              Nodo._nodos_especiales.delete(nodoid);           
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
	   * Elimina un nodo que solo tiene autoenlaces (Interfaz {@link Nodos.Nodo.Interfaces.FabricaDeNodos FabricaDeNodos})
	   * 
	   * Elimina un nodo que solo tiene autoenlaces (enlaces hacia sí mismo).
	   * 
     * ⚠️ **Este método está obsoleto**:
     * 
     * Ya no corresponde a la responsabilidad de la clase manejar la eliminación de autoenlaces.
     * El programador debe asegurarse de limpiar manualmente todos los enlaces —incluyendo los
     * autoenlaces— antes de invocar el 
     * {@link Nodos.Nodo.eliminar método de eliminación estándar}.
     * 
     * Si el nodo tiene autoenlaces pueden eliminarse usando el metodo 
     * {@link Nodos.Nodo.eliminar_enlace() eliminar_enlace} 
     * que elimina los enlaces uno por uno; o el metodo
     * {@link Nodos.Nodo.eliminar_enlaces() eliminar_enlaces}
     * que elimina todos los enlaces que salen del nodo, incluyendo los que apuntan a sí mismo
     * 
     * @deprecated 
     * @static
     * @param {Nodo} nodo Nodo a eliminar.
     * @returns {boolean|null} `true` si fue eliminado, `false` si no pudo eliminarse,
     *                         `null` si el parámetro no es válido.     */
      static eliminar_autoenlazado(nodo) {
          if (!(nodo instanceof Nodo)) {
              Nodo._error("Nodo.eliminar_autoenlazado(nodo): el parámetro no es de la clase Nodo");
              return false;
          }

          // Contar enlaces que apuntan al mismo nodo (autoenlaces)
          let contauto = 0;
          let contcomunes =0;
          const id = nodo.id();
          if (nodo._adyacentes!==undefined) {
              for (const [, nodo2] of nodo._adyacentes) {
                  if (id === nodo2.id()) {
                      contauto++;
                  }else{
                      contcomunes++;//cuenta enlaces comunes, si tiene algun enlace no cumple lo de autoenlazado
                  }
              }
          }

          // Calcular referencias externas (descontando autoenlaces)
          const numref = nodo._referencias - contauto;

         if (numref === 0 && contcomunes===0) {
              // Caso normal
              Nodo._superestructura.delete(id);
              Nodo._nodos_especiales.delete(id);   
              nodo.destructor();
              return true;
          } 
          // No cumple condiciones para eliminar
          return true;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///// Interfaz Datos ///////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Establece el dato dentro del nodo (Interfaz {@link Nodos.Interfaces.Datos Datos}).
       *
       * Este método recibe un valor de cualquier tipo y lo asigna
       * como contenido interno del nodo. 
       *
       * 🔗 Métodos relacionados:
       * - {@link Nodos.Nodo_dato dato()} Para obtener el dato almacenado en el nodo.
       * 
       * @param {*} dato El valor a almacenar (puede ser cualquier tipo: número, cadena, objeto, etc.).
       * @returns {void} No devuelve nada, solo modifica el estado interno del nodo.
       *
       * @example
       * const nodo = Nodo.();
       * nodo._dato("Hola Mundo");
       * console.log(nodo.dato()); // Devuelve: Hola Mundo
       */
      _dato(dato){
        this._dato=dato;
      }

      /**
       * Devuelve el dato almacenado en el nodo (Interfaz {@link Nodos.Interfaces.Datos Datos}).
       *
       * Este método retorna el valor previamente asignado mediante
       * {@link Nodos.Nodo#_dato _dato()}. Si no existe ningún dato, devuelve null.
       *
       * 🔗 Métodos relacionados:
       * - {@link Nodos.Nodo#_dato _dato()} Para asignar un dato al nodo.
       *
       * @example
       * const nodo = Nodo.();
       * nodo._dato(42);
       * console.log(nodo.dato()); // Devuelve: 42
       * const otroNodo = Nodo.();
       * console.log(otroNodo.dato()); // Devuelve: null
       * @returns {*|null} El dato almacenado o null si no se asignó ninguno.
       * @public
       */
      dato() {
          if (this._dato !== undefined) {
              return this._dato;
          } else {
              return null;
          }
      }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///// Interfaz Adyacentes //////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    
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
	   * {@link Nodos.Nodo#tiene_incidente tiene_incidente}
     * 
     * ---
     * 🔗 Método complementario:
     * - {@link Nodos.Nodo#tiene_incidente tiene_incidente}
     * 
     * ---
     * 🔗 Otros métodos relacionados:
     * - {@link Nodos.Nodo#tiene_adyacente_a tiene_adyacente_a()}
     * - {@link Nodos.Nodo#tiene_incidente_a tiene_incidente_a()}
     * - {@link Nodos.Nodo#_adyacente _adyacente}
     * - {@link Nodos.Nodo#_adyacente_en _adyacente_en}
     * - {@link Nodos.Nodo#eliminar_adyacente eliminar_adyacente}
     * - {@link Nodos.Nodo#eliminar_adyacentes eliminar_adyacentes}
     * - {@link Nodos.Nodo#cantidad_de_adyacentes cantidad_de_adyacentes}
     * - {@link Nodos.Nodo#cantidad_de_incidentes cantidad_de_incidentes}
     * - {@link Nodos.Nodo#adyacente adyacente}
     * - {@link Nodos.Nodo#adyacentes adyacentes}
     * - {@link Nodos.Nodo#por_cada_adyacente_ejecutar por_cada_adyacente_ejecutar}
     * - {@link Nodos.Nodo.validar_nombre_enlace validar_nombre_enlace}
     * 
     * ---
     * @example 
     * //Ejemplo de uso:
     * const nodo = Nodo.crear();
     * if (nodo.tiene_adyacente()) {
     *     console.log("El nodo tiene adyacentes");
     * }else{
     *     console.log("El nodo no tiene adyacentes");//imprime esto
     * }
     * const otroNodo = Nodo.crear();
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
     * @since 2.9
     */
    tiene_adyacente() {
      if (this._adyacentes === undefined) {
        return false;
      }
      if (!this._adyacentes.size) {
        return false;
      } else {
        return true;
      }
    }

    /**
     * Verifica si el nodo es adyacente de al menos un nodo(Interfaz {@link Nodos.Interfaces.Adyacentes Adyacentes}).
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
     * {@link Nodos.Nodo#tiene_adyacente tiene_adyacente}
     *
     * ---
     * 🔗 Método complementario:
     * - {@link Nodos.Nodo#tiene_adyacente tiene_adyacente}  
     * 
     * ---
     * 🔗 Otros métodos relacionados:
     * - {@link Nodos.Nodo#tiene_adyacente_a tiene_adyacente_a()}
     * - {@link Nodos.Nodo#tiene_incidente_a tiene_incidente_a()}
     * - {@link Nodos.Nodo#_adyacente _adyacente}
     * - {@link Nodos.Nodo#_adyacente_en _adyacente_en}
     * - {@link Nodos.Nodo#eliminar_adyacente eliminar_adyacente}
     * - {@link Nodos.Nodo#eliminar_adyacentes eliminar_adyacentes}
     * - {@link Nodos.Nodo#cantidad_de_adyacentes cantidad_de_adyacentes}
     * - {@link Nodos.Nodo#cantidad_de_incidentes cantidad_de_incidentes}
     * - {@link Nodos.Nodo#adyacente adyacente}
     * - {@link Nodos.Nodo#adyacentes adyacentes}
     * - {@link Nodos.Nodo#por_cada_adyacente_ejecutar por_cada_adyacente_ejecutar}
     * - {@link Nodos.Nodo.validar_nombre_enlace validar_nombre_enlace}
     * 
     * ---
     * @example 
     * //Ejemplo de uso:
     * const nodo = Nodo.();
     * if (nodo.tiene_incidente()) {
     *     console.log("El nodo tiene conexiones entrantes.");
     * }else{
     *     console.log("El nodo no tiene conexiones entrantes.");//imprime esto
     * }
     * const otroNodo = Nodo.();
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
     * @since 3.1.3
     */		
    es_nodo_suelto() {
      /*if (this._referencias === 1) {
        return false;
      } else if (this._referencias === 2 && this.es_especial()) {
        return false;
      }*/
      return this._referencias!==0;
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
     * - {@link Nodos.Nodo#tiene_incidente_a tiene_incidente_a()}
     *
     * ---
     * 🔗 Otros métodos relacionados:
     * - {@link Nodos.Nodo#_adyacente _adyacente}
     * - {@link Nodos.Nodo#_adyacente_en _adyacente_en}
     * - {@link Nodos.Nodo#eliminar_adyacente eliminar_adyacente}
     * - {@link Nodos.Nodo#eliminar_adyacentes eliminar_adyacentes}
     * - {@link Nodos.Nodo#cantidad_de_adyacentes cantidad_de_adyacentes}
     * - {@link Nodos.Nodo#cantidad_de_incidentes cantidad_de_incidentes}
     * - {@link Nodos.Nodo#tiene_adyacente tiene_adyacente}
     * - {@link Nodos.Nodo#tiene_incidente tiene_incidente}
     * - {@link Nodos.Nodo#adyacente adyacente}
     * - {@link Nodos.Nodo#adyacentes adyacentes}
     * - {@link Nodos.Nodo#por_cada_adyacente_ejecutar por_cada_adyacente_ejecutar}
     * - {@link Nodos.Nodo.validar_nombre_enlace validar_nombre_enlace}
     *
     * ---
     * @example
     * const n1 = Nodo.crear_con_dato("A");
     * const n2 = Nodo.crear_con_dato("B");
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
     * @since 3.2.3
     */
    tiene_adyacente_a(nodo) {
      if (!(nodo instanceof Nodo)) {
        Nodo._error("el nodo que intenta comprobar no es una instancia de la clase Nodo");
        return false;
      }
      if (this.tiene_adyacente() && nodo.tiene_incidente()) {
        const id = nodo.id();
        for (const [enlace, nodoaux] of this._adyacentes) {
          if (nodoaux.id() === id) {
            return enlace;
          }
        }
      }
      return false;
    }


    /**
     * Valida un nombre de enlace (Interfaz {@link Nodos.Interfaces.Adyacentes# Adyacentes}).
     *
     * Este método verifica que el nombre de un enlace sea válido antes de asignarlo.  
     * Solo se permiten valores `number` o `string`, y se prohíben nombres que puedan confundirse con `false` o `null` en la lógica del grafo (`0`, `"0"`, `""`).  
     * Usar siempre este método si no se está seguro antes de usar un nombre de enlace.
     * 
     * ---
     * 🔗 Métodos relacionados:
     * - {@link Nodos.Nodo#_adyacente _adyacente}
     * - {@link Nodos.Nodo#_adyacente_en _adyacente_en}
     * - {@link Nodos.Nodo#eliminar_adyacente eliminar_adyacente}
     * - {@link Nodos.Nodo#eliminar_adyacentes eliminar_adyacentes}
     * - {@link Nodos.Nodo#cantidad_de_adyacentes cantidad_de_adyacentes}
     * - {@link Nodos.Nodo#cantidad_de_incidentes cantidad_de_incidentes}
     * - {@link Nodos.Nodo#tiene_adyacente tiene_adyacente}
     * - {@link Nodos.Nodo#tiene_incidente tiene_incidente}
     * - {@link Nodos.Nodo#adyacente adyacente}
     * - {@link Nodos.Nodo#adyacentes adyacentes}
     * - {@link Nodos.Nodo#tiene_adyacente_a tiene_adyacente_a}
     * - {@link Nodos.Nodo#tiene_incidente_a tiene_incidente_a}
     * - {@link Nodos.Nodo#por_cada_adyacente_ejecutar por_cada_adyacente_ejecutar}
     * 
     * ---
     * @example
     * const nombre1="23";
     * const nombre2="veintitres";
     * const nombre3=23;
     * const nombre4="0";
     * 
     * if (Nodo.validar_nombre_enlace(nombre1)) {
     *     console.log("el nombre de enlace "+nombre1+" es válido");
     * }else{
     *     Nodo._error("Nombre de enlace "+nombre1+" inválido");
     * }
     * if (Nodo.validar_nombre_enlace(nombre2)) {
     *     console.log("el nombre de enlace "+nombre2+" es válido");
     * }else{
     *     Nodo._error("Nombre de enlace "+nombre2+" inválido");
     * }     
     * if (Nodo.validar_nombre_enlace(nombre3)) {
     *     console.log("el nombre de enlace "+nombre3+" es válido");
     * }else{
     *     Nodo._error("Nombre de enlace "+nombre3+" inválido");
     * }
     * if (Nodo.validar_nombre_enlace(nombre4)) {
     *     console.log("el nombre de enlace "+nombre4+" es válido");
     * }else{
     *     Nodo._error("Nombre de enlace "+nombre4+" inválido");
     * }
     * Nodo.imprimir_errores();
     * 
     * @note Devuelve `false` para valores inseguros aunque sean strings o números.
     * @param {string} enlace Nombre del enlace a validar
     * @return {boolean} `true` si es válido, `false` en caso contrario
     * @since 3.2.3
     * @static
     */
    static validar_nombre_enlace(enlace) {
      if (typeof enlace !== "string" ) {
        return false;
      }
      if (enlace === "" || enlace === "0") {
        return false;
      }
      return true;
    }

    /**
     * Devuelve el nodo adyacente en el enlace especificado (Interfaz {@link Nodos.Interfaces.Adyacentes Adyacentes}).
     *
     * Comprueba si existe un nodo en el enlace indicado y lo devuelve;  
     * si no existe, devuelve `null`. Para asegurar consistencia.
     *
     * ---
     * 🔗 Método complementario:
     * - {@link Nodos.Nodo#adyacentes adyacentes}
     * 
     * ---
     * 🔗 Otros métodos relacionados:
     * - {@link Nodos.Nodo#cantidad_de_adyacentes cantidad_de_adyacentes}
     * - {@link Nodos.Nodo#cantidad_de_incidentes cantidad_de_incidentes}
     * - {@link Nodos.Nodo#tiene_adyacente tiene_adyacente}
     * - {@link Nodos.Nodo#tiene_incidente tiene_incidente}
     * - {@link Nodos.Nodo#_adyacente _adyacente}
     * - {@link Nodos.Nodo#_adyacente_en _adyacente_en}
     * - {@link Nodos.Nodo#tiene_adyacente_a tiene_adyacente_a}
     * - {@link Nodos.Nodo#tiene_incidente_a tiene_incidente_a}
     * - {@link Nodos.Nodo#eliminar_adyacente eliminar_adyacente}
     * - {@link Nodos.Nodo#eliminar_adyacentes eliminar_adyacentes}
     * - {@link Nodos.Nodo#por_cada_adyacente_ejecutar por_cada_adyacente_ejecutar}
     * - {@link Nodos.Nodo.validar_nombre_enlace validar_nombre_enlace}
     *
     * ---
     * @example
     * const n1 = Nodo.crear_con_dato("A");
     * const n2 = Nodo.crear_con_dato("B");
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
      if (!Nodo.validar_nombre_enlace(enlace)){
         this.constructor._error("El enlace debe ser un string válido");
         return null;
      }
      if (this._adyacentes===undefined) {
          return null; // todavía no hay mapa creado
      }
      return this._adyacentes.get(enlace) ?? null;
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
     * - {@link Nodos.Nodo#adyacente adyacente}
     *
     * ---
     * 🔗 Otros métodos relacionados:
     * - {@link Nodos.Nodo#cantidad_de_adyacentes cantidad_de_adyacentes}
     * - {@link Nodos.Nodo#cantidad_de_incidentes cantidad_de_incidentes}
     * - {@link Nodos.Nodo#tiene_adyacente tiene_adyacente}
     * - {@link Nodos.Nodo#tiene_incidente tiene_incidente}
     * - {@link Nodos.Nodo#_adyacente _adyacente}
     * - {@link Nodos.Nodo#_adyacente_en _adyacente_en}
     * - {@link Nodos.Nodo#tiene_adyacente_a tiene_adyacente_a}
     * - {@link Nodos.Nodo#tiene_incidente_a tiene_incidente_a}
     * - {@link Nodos.Nodo#eliminar_adyacente eliminar_adyacente}
     * - {@link Nodos.Nodo#eliminar_adyacentes eliminar_adyacentes}
     * - {@link Nodos.Nodo#por_cada_adyacente_ejecutar por_cada_adyacente_ejecutar}
     * - {@link Nodos.Nodo.validar_nombre_enlace validar_nombre_enlace}
     * 
     * ---
     * @example 
     * //Ejemplo de uso:
     * const nodo = Nodo.crear();
     * nodo._adyacente(Nodo.crear_con_id("A"));
     * nodo._adyacente(Nodo.crear_con_id("B"));
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
     * @note Se devuelve un nuevo Map, copia superficial de _adyacentes.
     * @param void
     * @return {?Map<string|number, Nodo>} Map con nodos adyacentes o `null` si no existen
     * @public
     * @since Modificado en V3.2.3
     */
    adyacentes() {
      if (!this.tiene_adyacente()) {
          return null;
      } else {
          return new Map(this._adyacentes);
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
     * - {@link Nodos.Nodo#_adyacente_en _adyacente_en}
     * 
     * ---
     * 🔗 Otros métodos relacionados:
     * - {@link Nodos.Nodo#cantidad_de_adyacentes cantidad_de_adyacentes}
     * - {@link Nodos.Nodo#cantidad_de_incidentes cantidad_de_incidentes}
     * - {@link Nodos.Nodo#tiene_adyacente tiene_adyacente}
     * - {@link Nodos.Nodo#tiene_incidente tiene_incidente}
     * - {@link Nodos.Nodo#adyacente adyacente}
     * - {@link Nodos.Nodo#adyacentes adyacentes}
     * - {@link Nodos.Nodo#tiene_adyacente_a tiene_adyacente_a}
     * - {@link Nodos.Nodo#tiene_incidente_a tiene_incidente_a}
     * - {@link Nodos.Nodo#eliminar_adyacente eliminar_adyacente}
     * - {@link Nodos.Nodo#eliminar_adyacentes eliminar_adyacentes}
     * - {@link Nodos.Nodo#por_cada_adyacente_ejecutar por_cada_adyacente_ejecutar}
     * - {@link Nodos.Nodo.validar_nombre_enlace validar_nombre_enlace}
     * 
     * ---
     * @example
     * //Ejemplo de uso:
     * const nodo = Nodo.crear();
     * const otro1 = Nodo.crear_con_id("ejemplo");
     * const otro2 = Nodo.crear_con_id("otro_ejemplo");
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
     * @param {Nodo} un_nodo Nodo que se desea enlazar
     * @return {Nodo} Nodo adyacente recién asignado
     */
    _adyacente(un_nodo)  {
        // Validación de tipo
        if (!(un_nodo instanceof this.constructor)) {
            this.constructor._error("el parámetro debe ser una instancia de Nodo");
            return null;
        }
        // Inicialización perezosa
        if (!this._adyacentes) {
            this._adyacentes = new Map();
        }
        
        let cont = 1;
        const id = String(un_nodo.id());
        let enlace = id;
        
        // Buscar enlace único (Map usa .has())
        while (this._adyacentes.has(enlace)) {
            enlace = `${id}.${cont}`;
            cont++;
        }
        
        // Asignar adyacente
        this._adyacentes.set(enlace, un_nodo);
        // Sumar referencias
        un_nodo._referencias++;
        
        return enlace;
    }
    /**
     * Asigna un nodo adyacente en una posición dada (Interfaz {@link Nodos.Interfaces.Adyacentes Adyacentes}).
     *
     * Permite enlazar un nodo adyacente en un enlace identificado por un string. 
     * 
     * Si ya existía un nodo en esa posición, puede reemplazarse explícitamente con `$reemplazar=true`.
     * Si `$reemplazar=false` (comportamiento predeterminado), y ya hay un nodo en el enlace dado
     * genera un mensaje de error.
     *
     * ---
     * 🔗 Método complementario:
     * - {@link Nodos.Nodo#_adyacente _adyacente}
     * 
     * ---
     * 🔗 Otros métodos relacionados:
     * - {@link Nodos.Nodo#cantidad_de_adyacentes cantidad_de_adyacentes}
     * - {@link Nodos.Nodo#cantidad_de_incidentes cantidad_de_incidentes}
     * - {@link Nodos.Nodo#tiene_adyacente tiene_adyacente}
     * - {@link Nodos.Nodo#tiene_incidente tiene_incidente}
     * - {@link Nodos.Nodo#adyacente adyacente}
     * - {@link Nodos.Nodo#adyacentes adyacentes}
     * - {@link Nodos.Nodo#tiene_adyacente_a tiene_adyacente_a}
     * - {@link Nodos.Nodo#tiene_incidente_a tiene_incidente_a}
     * - {@link Nodos.Nodo#eliminar_adyacente eliminar_adyacente}
     * - {@link Nodos.Nodo#eliminar_adyacentes eliminar_adyacentes}
     * - {@link Nodos.Nodo#por_cada_adyacente_ejecutar por_cada_adyacente_ejecutar}
     * - {@link Nodos.Nodo.validar_nombre_enlace validar_nombre_enlace}
     * 
     * ---
     * @example
     * const nodoA = Nodo.crear_con_dato("A");
     * const nodoB = Nodo.crear_con_dato("B");
     *
     * // asigno nodoB como adyacente de nodoA bajo el enlace "conecta"
     * nodoA._adyacente_en(nodoB, "conecta");
     * console.log(nodoA.adyacente("conecta").dato());//imprime "B"
     * 
     * 
     *
     * @note El método incrementa automáticamente la propiedad `referencias` del nodo enlazado.
     * @param {Nodo} un_nodo Nodo que se desea asignar como adyacente.
     * @param {string} enlace Nombre identificador del enlace.
     * @param {boolean} [reemplazar=false] Indica si se reemplaza un nodo existente en el mismo enlace.
     * @return {boolean} `true` si la asignación fue exitosa, `false` en caso de error.
     * @public
     */
    _adyacente_en(unNodo, enlace, reemplazar = false) {
        // validar que sea un Nodo
        if (!(unNodo instanceof Nodo)) {
            this.constructor._error("el nodo que intenta asignar no es un Nodo");
            return false;
        }

        // validar nombre del enlace
        if (!this.constructor.validar_nombre_enlace(enlace)) {
            this.constructor._error("el enlace que intenta asignar debe ser un string válido");
            return false;
        }

        // inicialización perezosa del Map
        if (!this._adyacentes) {
            this._adyacentes = new Map();
        }

        // revisar si ya existía un nodo en esa posición
        if (this._adyacentes.has(enlace)) {
            if (reemplazar) {
                const ant = this._adyacentes.get(enlace);
                ant._referencias--;
            } else {
                this.constructor._error("ya existía un nodo en el enlace que intenta asignar");
                return false;
            }
        }

        // asignar adyacente
        this._adyacentes.set(enlace, unNodo);

        // sumar la referencia del nuevo nodo enlazado
        unNodo._referencias++;

        return true;
    }
    
    /**
     * Elimina un enlace por su nombre (Interfaz {@link Nodos.Interfaces.Adyacentes Adyacentes}).
     *
     * Busca y elimina el nodo asociado a un enlace dado.  
     * Valida que el enlace sea del tipo correcto, que existan adyacentes 
     * y que el enlace exista realmente entre los adyacentes del nodo.
     *   
     * Si todo es correcto elimina el enlace y retorna el nodo que estaba en ese enlace;
     * en caso contrario devuelve null y lanza mensajes de error (si el enlace no es valido)
     * o alertas (si no existia el enlace a eliminar)
     *
	   * ⚠️ Importante: Este método no elimina los nodos del sistema. Si se eliminan
	   * todos los enlaces que conectan a un nodo este aún permanece en el sistema 
	   * como nodo suelto a menos que se use el metodo estatico
	   * {@link ./classes/Nodos.Nodo.eliminar Nodo::eliminar($nodo)}
     * 
     * ---
     * 🔗 Método complementario:
     * - {@link Nodos.Nodo#eliminar_adyacentes eliminar_adyacentes}
     * 
     * ---
     * 🔗 Otros métodos relacionados:
     * - {@link Nodos.Nodo#_adyacente _adyacente}
     * - {@link Nodos.Nodo#_adyacente_en _adyacente_en}
     * - {@link Nodos.Nodo#cantidad_de_adyacentes cantidad_de_adyacentes}
     * - {@link Nodos.Nodo#cantidad_de_incidentes cantidad_de_incidentes}
     * - {@link Nodos.Nodo#tiene_adyacente tiene_adyacente}
     * - {@link Nodos.Nodo#tiene_incidente tiene_incidente}
     * - {@link Nodos.Nodo#adyacente adyacente}
     * - {@link Nodos.Nodo#adyacentes adyacentes}
     * - {@link Nodos.Nodo#tiene_adyacente_a tiene_adyacente_a}
     * - {@link Nodos.Nodo#tiene_incidente_a tiene_incidente_a}
     * - {@link Nodos.Nodo#por_cada_adyacente_ejecutar por_cada_adyacente_ejecutar}
     * - {@link Nodos.Nodo.validar_nombre_enlace validar_nombre_enlace}
     *
     * ---
     * @example 
     * //Ejemplo de uso:
     * const nodo = Nodo.crear_con_id("nodo");
     * const otro = Nodo.crear_con_id("otro");
     * nodo._adyacente_en(otro, "A");
     * console.log("Se agregó el nodo ".nodo.adyacente("A").id());
     * const eliminado = nodo.eliminar_enlace("A");
     * if (eliminado !== null) {
     *   console.log("Se eliminó el nodo con ID: " + eliminado.id());// imprime "otro"
     * }
	   * console.log("Comprobación de que realmente se eliminó");
	   * const ady=nodo.adyacente("A");
	   * if (!ady){
	   * 		console.log("No existe adyacente en 'A'"); //imprime esto
	   * }else{
	   * 		console.log( "Hasta aca no llega");
	   * }
     *
     * @note Disminuye el contador interno `referencias` del nodo eliminado.
     * @public
     * @param {string} enlace Enlace del adyacente a eliminar
     * @return {?Nodo} Nodo eliminado o `null` si no existe
     * @since Modificado en V3.2.3
     * @deprecated
     */
    eliminar_enlace(enlace) {
      // Validación de tipo
      if (!Nodo.validar_nombre_enlace(enlace)) {
          Nodo._error("el enlace a eliminar debe ser un string");
          return null;
      }
      // verificar inicialización perezosa
      if (!this.tiene_adyacente()) {
          Nodo._alerta("no hay adyacentes para eliminar");
          return null;
      }
      // Verificar existencia del enlace
      if (!this._adyacentes.has(enlace)) {
          Nodo._alerta("el enlace " + enlace + " que se intenta eliminar no existe");
          return null;
      }
      const eliminado = this._adyacentes.get(enlace);
      eliminado._referencias--;
      this._adyacentes.delete(enlace);
      return eliminado;
    }
    /**
     * Elimina un adyacemte por el nombre de su enlace(Interfaz {@link Nodos.Interfaces.Adyacentes Adyacentes}).
     *
     * Busca y elimina el nodo asociado a un enlace dado.  
     * Valida que el enlace sea del tipo correcto, que existan adyacentes 
     * y que el enlace exista realmente entre los adyacentes del nodo.
     *   
     * Si todo es correcto elimina el enlace y retorna el nodo que estaba en ese enlace;
     * en caso contrario devuelve null y lanza mensajes de error (si el enlace no es valido)
     * o alertas (si no existia el enlace a eliminar)
     *
	   * ⚠️ Importante: Este método no elimina los nodos del sistema. Si se eliminan
	   * todos los enlaces que conectan a un nodo este aún permanece en el sistema 
	   * como nodo suelto a menos que se use el metodo estatico
	   * {@link ./classes/Nodos.Nodo.eliminar Nodo::eliminar($nodo)}
     * 
     * ---
     * 🔗 Método complementario:
     * - {@link Nodos.Nodo#eliminar_adyacentes eliminar_adyacentes}
     * 
     * ---
     * 🔗 Otros métodos relacionados:
     * - {@link Nodos.Nodo#_adyacente _adyacente}
     * - {@link Nodos.Nodo#_adyacente_en _adyacente_en}
     * - {@link Nodos.Nodo#cantidad_de_adyacentes cantidad_de_adyacentes}
     * - {@link Nodos.Nodo#cantidad_de_incidentes cantidad_de_incidentes}
     * - {@link Nodos.Nodo#tiene_adyacente tiene_adyacente}
     * - {@link Nodos.Nodo#tiene_incidente tiene_incidente}
     * - {@link Nodos.Nodo#adyacente adyacente}
     * - {@link Nodos.Nodo#adyacentes adyacentes}
     * - {@link Nodos.Nodo#tiene_adyacente_a tiene_adyacente_a}
     * - {@link Nodos.Nodo#tiene_incidente_a tiene_incidente_a}
     * - {@link Nodos.Nodo#por_cada_adyacente_ejecutar por_cada_adyacente_ejecutar}
     * - {@link Nodos.Nodo.validar_nombre_enlace validar_nombre_enlace}
     *
     * ---
     * @example 
     * //Ejemplo de uso:
     * const nodo = Nodo.crear_con_id("nodo");
     * const otro = Nodo.crear_con_id("otro");
     * nodo._adyacente_en(otro, "A");
     * console.log("Se agregó el nodo ".nodo.adyacente("A").id());
     * const eliminado = nodo.eliminar_adyacente("A");
     * if (eliminado !== null) {
     *   console.log("Se eliminó el nodo con ID: " + eliminado.id());// imprime "otro"
     * }
	   * console.log("Comprobación de que realmente se eliminó");
	   * const ady=nodo.adyacente("A");
	   * if (!ady){
	   * 		console.log("No existe adyacente en 'A'"); //imprime esto
	   * }else{
	   * 		console.log( "Hasta aca no llega");
	   * }
     *
     * @note Disminuye el contador interno `referencias` del nodo eliminado.
     * @public
     * @param {string} enlace Enlace del adyacente a eliminar
     * @return {?Nodo} Nodo eliminado o `null` si no existe
     * @since V3.2.7
     */
    eliminar_adyacente(enlace) {
      // Validación de tipo
      if (!Nodo.validar_nombre_enlace(enlace)) {
          Nodo._error("el enlace a eliminar debe ser un string");
          return null;
      }
      // verificar inicialización perezosa
      if (!this.tiene_adyacente()) {
          Nodo._alerta("no hay adyacentes para eliminar");
          return null;
      }
      // Verificar existencia del enlace
      if (!this._adyacentes.has(enlace)) {
          Nodo._alerta("el enlace " + enlace + " que se intenta eliminar no existe");
          return null;
      }
      const eliminado = this._adyacentes.get(enlace);
      eliminado._referencias--;
      this._adyacentes.delete(enlace);
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
     * - {@link Nodos.Nodo#eliminar_adyacente eliminar_adyacente}
     *
     * ---
     * 🔗 Otros métodos relacionados:
     * - {@link Nodos.Nodo#_adyacente _adyacente}
     * - {@link Nodos.Nodo#_adyacente_en _adyacente_en}
     * - {@link Nodos.Nodo#cantidad_de_adyacentes cantidad_de_adyacentes}
     * - {@link Nodos.Nodo#cantidad_de_incidentes cantidad_de_incidentes}
     * - {@link Nodos.Nodo#tiene_adyacente tiene_adyacente}
     * - {@link Nodos.Nodo#tiene_incidente tiene_incidente}
     * - {@link Nodos.Nodo#adyacente adyacente}
     * - {@link Nodos.Nodo#adyacentes adyacentes}
     * - {@link Nodos.Nodo#tiene_adyacente_a tiene_adyacente_a}
     * - {@link Nodos.Nodo#tiene_incidente_a tiene_incidente_a}
     * - {@link Nodos.Nodo#por_cada_adyacente_ejecutar por_cada_adyacente_ejecutar}
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
    eliminar_enlaces() {
        if (!this.tiene_adyacente()) {
            Nodo._alerta("no hay enlaces para eliminar");
            return new Map();
        }

        const copia = new Map(this._adyacentes);

        for (const eliminado of this._adyacentes.values()) {
            eliminado._referencias--;
        }

        this._adyacentes.clear();
        return copia;
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
     * - {@link Nodos.Nodo#eliminar_adyacente eliminar_adyacente}
     *
     * ---
     * 🔗 Otros métodos relacionados:
     * - {@link Nodos.Nodo#_adyacente _adyacente}
     * - {@link Nodos.Nodo#_adyacente_en _adyacente_en}
     * - {@link Nodos.Nodo#cantidad_de_adyacentes cantidad_de_adyacentes}
     * - {@link Nodos.Nodo#cantidad_de_incidentes cantidad_de_incidentes}
     * - {@link Nodos.Nodo#tiene_adyacente tiene_adyacente}
     * - {@link Nodos.Nodo#tiene_incidente tiene_incidente}
     * - {@link Nodos.Nodo#adyacente adyacente}
     * - {@link Nodos.Nodo#adyacentes adyacentes}
     * - {@link Nodos.Nodo#tiene_adyacente_a tiene_adyacente_a}
     * - {@link Nodos.Nodo#tiene_incidente_a tiene_incidente_a}
     * - {@link Nodos.Nodo#por_cada_adyacente_ejecutar por_cada_adyacente_ejecutar}
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
     * const copia = nodo.eliminar_adyacentes();
     * console.log("Se eliminaron adyacentes:"");
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
     * @since V3.2.7
     */
    eliminar_adyacentes() {
        if (!this.tiene_adyacente()) {
            Nodo._alerta("no hay adyacentes para eliminar");
            return new Map();
        }

        const copia = new Map(this._adyacentes);

        for (const eliminado of this._adyacentes.values()) {
            eliminado._referencias--;
        }

        this._adyacentes.clear();
        return copia;
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
     * - {@link Nodos.Nodo#cantidad_de_incidentes cantidad_de_incidentes}
     *
     * ---
     * 🔗 Otros métodos relacionados:
     * - {@link Nodos.Nodo#_adyacente _adyacente}
     * - {@link Nodos.Nodo#_adyacente_en _adyacente_en}
     * - {@link Nodos.Nodo#eliminar_adyacente eliminar_adyacente}
     * - {@link Nodos.Nodo#eliminar_adyacentes eliminar_adyacentes}
     * - {@link Nodos.Nodo#tiene_adyacente tiene_adyacente}
     * - {@link Nodos.Nodo#tiene_incidente tiene_incidente}
     * - {@link Nodos.Nodo#adyacente adyacente}
     * - {@link Nodos.Nodo#adyacentes adyacentes}
     * - {@link Nodos.Nodo#tiene_adyacente_a tiene_adyacente_a}
     * - {@link Nodos.Nodo#tiene_incidente_a tiene_incidente_a}
     * - {@link Nodos.Nodo#por_cada_adyacente_ejecutar por_cada_adyacente_ejecutar}
     * - {@link Nodos.Nodo.validar_nombre_enlace validar_nombre_enlace}
     *
     * ---
     * @example 
     * //Ejemplo de uso:
     * const nodo = Nodo.crear();
     * const otro1 = Nodo.crear();
     * const otro2 = Nodo.crear();
     * nodo._adyacente_en(otro1, "X");
     * nodo._adyacente_en(otro2, "Y");
     * console.log(nodo.cantidad_de_adyacentes()); // 2
     *
     * @note Si no hay adyacentes inicializados, retorna 0 directamente.
     * @param void
     * @return {number} Cantidad de adyacentes del nodo
     * @since 2.9.4
     * @public
     */
    cantidad_de_adyacentes() {
        return this._adyacentes ? this._adyacentes.size : 0;
    }


    
    /**
     * Ejecuta una función sobre cada nodo adyacente (Interfaz {@link Nodos.Interfaces.Adyacentes Adyacentes}).
     *
     * Permite recorrer todos los nodos adyacentes y ejecutar sobre cada uno una función provista por el usuario.  
     * La función recibe como parámetros el nodo, el nombre del enlace y los parámetros adicionales que se pasen al método.  
     * Devuelve un objeto con los resultados de cada ejecución, indexados por el nombre del enlace.  
     *
     * Si no existen adyacentes, emite una alerta con `_alerta()` y retorna `null`.  
     * 
     * ---
     * 🔗 Otros métodos relacionados:
     * - {@link Nodos.Nodo#_adyacente _adyacente}
     * - {@link Nodos.Nodo#_adyacente_en _adyacente_en}
     * - {@link Nodos.Nodo#eliminar_adyacente eliminar_adyacente}
     * - {@link Nodos.Nodo#eliminar_adyacentes eliminar_adyacentes}
     * - {@link Nodos.Nodo#cantidad_de_adyacentes cantidad_de_adyacentes}
     * - {@link Nodos.Nodo#cantidad_de_incidentes cantidad_de_incidentes}
     * - {@link Nodos.Nodo#tiene_adyacente tiene_adyacente}
     * - {@link Nodos.Nodo#tiene_incidente tiene_incidente}
     * - {@link Nodos.Nodo#adyacente adyacente}
     * - {@link Nodos.Nodo#adyacentes adyacentes}
     * - {@link Nodos.Nodo#tiene_adyacente_a tiene_adyacente_a}
     * - {@link Nodos.Nodo#tiene_incidente_a tiene_incidente_a}
     * - {@link Nodos.Nodo.validar_nombre_enlace validar_nombre_enlace}
     *
     * ---
     * @example
     * const nodo = Nodo.();
     * const nodoA = Nodo.crear_con_dato("A");
     * const nodoB = Nodo.crear_con_dato("B");
     * nodo._adyacente_en(nodoA, "conectaA");
     * nodo._adyacente_en(nodoB, "conectaB");
     *
     * // ejecuta una función sobre cada adyacente
     * const resultados = nodo.por_cada_adyacente_ejecutar((nodo, enlace) => {
     *     return "hay nodo con dato:"+ nodo.dato();
     * });
     * if (resultados){
     *    for (const [enlace, resultado] of resultados) {
     *       console.log("En enlace '"+enlace+ "' "+ resultado); 
     *    }
     * }
	   * //imprime
	   * //En enlace 'conectaA' hay nodo con dato:A
     * //En enlace 'conectaB' hay nodo con dato:B
     * 
     * @note Devuelve `null` si no existen adyacentes.
     * @param {Function} funcion Función a ejecutar sobre cada nodo adyacente.
     * @param {...*} parametros Parámetros adicionales para la función.
     * @return {Object|null} Resultados de cada ejecución, indexados por enlace, o `null` si no existen adyacentes.
     */
    por_cada_adyacente_ejecutar(funcion, ...parametros) {
        if (!this.tiene_adyacente()) {
            Nodo._alerta("no existe adyacente");
            return null;
        }

        const resultados = new Map();
        for (const [enlace, nodo] of this._adyacentes) {
            if (nodo) {
                resultados.set(enlace, funcion(nodo, enlace, ...parametros));
            }
        }
        
        return resultados;
    }


    /**********************************************************************************************
     *  INTERFAZ INCIDENTES (INSTANCIA)
     * 
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
     * {@link Nodos.Nodo#tiene_adyacente tiene_adyacente}
     *
     * ---
     * 🔗 Método complementario:
     * - {@link Nodos.Nodo#tiene_adyacente tiene_adyacente}  
     * 
     * ---
     * 🔗 Otros métodos relacionados:
     * - {@link Nodos.Nodo#tiene_adyacente_a tiene_adyacente_a()}
     * - {@link Nodos.Nodo#tiene_incidente_a tiene_incidente_a()}
     * - {@link Nodos.Nodo#_adyacente _adyacente}
     * - {@link Nodos.Nodo#_adyacente_en _adyacente_en}
     * - {@link Nodos.Nodo#eliminar_adyacente eliminar_adyacente}
     * - {@link Nodos.Nodo#eliminar_adyacentes eliminar_adyacentes}
     * - {@link Nodos.Nodo#cantidad_de_adyacentes cantidad_de_adyacentes}
     * - {@link Nodos.Nodo#cantidad_de_incidentes cantidad_de_incidentes}
     * - {@link Nodos.Nodo#adyacente adyacente}
     * - {@link Nodos.Nodo#adyacentes adyacentes}
     * - {@link Nodos.Nodo#por_cada_adyacente_ejecutar por_cada_adyacente_ejecutar}
     * - {@link Nodos.Nodo.validar_nombre_enlace validar_nombre_enlace}
     * 
     * ---
     * @example 
     * //Ejemplo de uso:
     * const nodo = Nodo.();
     * if (nodo.tiene_incidente()) {
     *     console.log("El nodo tiene conexiones entrantes.");
     * }else{
     *     console.log("El nodo no tiene conexiones entrantes.");//imprime esto
     * }
     * const otroNodo = Nodo.();
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
     * @since 3.1.3
     */		
    tiene_incidente() {
      /*if (this._referencias === 1) {
        return false;
      } else if (this._referencias === 2 && this.es_especial()) {
        return false;
      }*/
      return this._referencias!==0;
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
     * - {@link Nodos.Nodo#_adyacente _adyacente}
     * - {@link Nodos.Nodo#_adyacente_en _adyacente_en}
     * - {@link Nodos.Nodo#eliminar_adyacente eliminar_adyacente}
     * - {@link Nodos.Nodo#eliminar_adyacentes eliminar_adyacentes}
     * - {@link Nodos.Nodo#cantidad_de_adyacentes cantidad_de_adyacentes}
     * - {@link Nodos.Nodo#cantidad_de_incidentes cantidad_de_incidentes}
     * - {@link Nodos.Nodo#tiene_adyacente tiene_adyacente}
     * - {@link Nodos.Nodo#tiene_incidente tiene_incidente}
     * - {@link Nodos.Nodo#adyacente adyacente}
     * - {@link Nodos.Nodo#adyacentes adyacentes}
     * - {@link Nodos.Nodo#por_cada_adyacente_ejecutar por_cada_adyacente_ejecutar}
     * - {@link Nodos.Nodo.validar_nombre_enlace validar_nombre_enlace}
     *
     * ---
     * @example
     * const nA = Nodo.crear_con_dato("A");
     * const nB = Nodo.crear_con_dato("B");
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
     * @since 3.2.3
     */
    tiene_incidente_a(nodo) {
      if (!(nodo instanceof Nodo)) {
        Nodo._error("el nodo que intenta comprobar no es una instancia de la clase Nodo");
        return false;
      }
      if (this.tiene_incidente() && nodo.tiene_adyacente()) {
        const id = this.id();
        for (const [enlace, nodoaux] of nodo._adyacentes) {
          if (nodoaux.id() === id) {
            return enlace;
          }
        }
      }
      return false;
    }
    /**
     * Devuelve la cantidad de incidentes (Interfaz {@link Nodos.Interfaces.Adyacentes Adyacentes}).
     *
     * Retorna el número total de nodos incidentes actualmente vinculados al nodo. Es decir
     * las conexiones o enlaces "entrantes" al nodo:
     * Si no existen incidentes, devuelve `0`.  
     * Este método permite conocer de manera rápida el grado de entrada del nodo.
     *
     * ---
     * 🔗 Método complementario:
     * - {@link Nodos.Nodo#cantidad_de_adyacentes cantidad_de_adyacentes}
     *
     * ---
     * 🔗 Otros métodos relacionados:
     * - {@link Nodos.Nodo#_adyacente _adyacente}
     * - {@link Nodos.Nodo#_adyacente_en _adyacente_en}
     * - {@link Nodos.Nodo#eliminar_adyacente eliminar_adyacente}
     * - {@link Nodos.Nodo#eliminar_adyacentes eliminar_adyacentes}
     * - {@link Nodos.Nodo#tiene_adyacente tiene_adyacente}
     * - {@link Nodos.Nodo#tiene_incidente tiene_incidente}
     * - {@link Nodos.Nodo#adyacente adyacente}
     * - {@link Nodos.Nodo#adyacentes adyacentes}
     * - {@link Nodos.Nodo#tiene_adyacente_a tiene_adyacente_a}
     * - {@link Nodos.Nodo#tiene_incidente_a tiene_incidente_a}
     * - {@link Nodos.Nodo#por_cada_adyacente_ejecutar por_cada_adyacente_ejecutar}
     * - {@link Nodos.Nodo.validar_nombre_enlace validar_nombre_enlace}
     *
     * ---
     * @example 
     * //Ejemplo de uso:
     * const nodo = Nodo.();
     * const otro1 = Nodo.();
     * const otro2 = Nodo.();
     * otro1._adyacente_en(nodo, "X");
     * otro2._adyacente_en(nodo, "X");
     * console.log(nodo.cantidad_de_incidentes()); // 2
     *
     * @param void
     * @return {number} Cantidad de incidentes del nodo
     * @since 3.2.3
     * @public
     */
    cantidad_de_incidentes() {

          return this._referencias;
      
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///// Interfaz de Acceso a Superestructura y Nodos Especiales //////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * Determina si existen nodos en la superestructura (Interfaz {@link Nodos.Interfaces.AccesoASuperestructura AccesoASuperestructura}).
     *
     * Verifica si el mapa estático `Nodos.Nodo.superestructura` contiene nodos registrados.  
     * Devuelve `true` si el `Map` no está vacío (`size > 0`).
     *
     * ---
     * 🔗 Otros métodos complementarios:
     * - {@link Nodos.Nodo_superestructura superestructura()}
     * - {@link Nodos.Nodo#agregar_a_superestructura agregar_a_superestructura()}
     * - {@link Nodos.Nodo#limpiar_superestructura limpiar_superestructura()}
     *
     * ---
     * 🔗 Otros métodos relacionados:
     * - {@link Nodos.Nodo#hay_adyacentes hay_adyacentes()}
     * - {@link Nodos.Nodo_cantidad_de_adyacentes cantidad_de_adyacentes()}
     *
     * ---
     * @example
     * //Ejemplo de uso:
     * if (Nodos.Nodo.hay_nodos_en_superestructura()) {
     *     console.log("Hay nodos registrados en la superestructura.");
     * } else {
     *     console.log("No hay nodos cargados.");
     * }
     *
     * @note Esta verificación utiliza `Nodos.Nodo.superestructura.size > 0`, la forma más eficiente en JS.
     * 
     * @return {boolean} `true` si existen nodos en la superestructura, `false` si está vacía.
     */
    static hay_nodos_en_superestructura() {
      return Nodo._superestructura.size > 0; 
    }




    /**
     * Obtiene un nodo existente por su identificador (Interfaz {@link Nodos.Interfaces.AccesoASuperestructura AccesoASuperestructura}).
     *
     * Devuelve el nodo almacenado en el mapa estático `Nodos.Nodo.superestructura`  
     * con el id especificado.  
     * Si no existe un nodo con ese id, devuelve `null` y genera una alerta controlada.
     *
     * ---
     * 🔗 Otros métodos complementarios:
     * - {@link Nodos.Nodo#hay_nodos_en_superestructura hay_nodos_en_superestructura()}
     * - {@link Nodos.Nodo#agregar_a_superestructura agregar_a_superestructura()}
     * - {@link Nodos.Nodo#eliminar_de_superestructura eliminar_de_superestructura()}
     *
     * ---
     * 🔗 Otros métodos relacionados:
     * - {@link Nodos.Nodo#id id()}
     * - {@link Nodos.Nodo#es_id_especial es_id_especial()}
     *
     * ---
     * @example
     * const nodo = Nodos.Nodo.nodo_por_id("A12");
     * if (nodo) {
     *     console.log("Nodo encontrado:", nodo.id());
     * } else {
     *     console.warn("No existe nodo con ese id.");
     * }
     *
     * @note Esta función asume que `Nodos.Nodo.superestructura` es un Map indexado por id.
     *
     * @param {string} id Identificador del nodo que se desea recuperar.
     * @return {?Nodos.Nodo} El nodo correspondiente o `null` si no se encuentra.
     */
    static nodo_por_id(id) {
        if (Nodo._superestructura.size === 0) {
            Nodo._alerta("Nodos.Nodo.nodo_por_id(id) — No existe ningún nodo en la superestructura.");
            return null;
        }

        if (Nodo._superestructura.has(id)) {
            return Nodo._superestructura.get(id);
        }

        Nodo._alerta("Nodos.Nodo.nodo_por_id(id) — No existe nodo con ese id.");
        return null;
    }

    /**
     * Ejecuta una función de callback sobre todos los nodos existentes en la superestructura.
     *
     * @param {string} token Token de seguridad que autoriza la operación.
     * @param {function(Nodo, ...any): any} funcion Función a ejecutar para cada nodo. Recibe el nodo como primer argumento, seguido de los parámetros adicionales indicados en `parametros`.
     * @param {...any} parametros Parámetros opcionales adicionales que se pasarán al callback.
     * @returns {Object<string, any> | null} Un objeto con los resultados devueltos por cada ejecución del callback,
     *                                       indexado por el ID del nodo. Devuelve `null` si no existe la superestructura
     *                                       o si está vacía.
     *
     * @example
     * ```js
     * Nodo.por_cada_nodo_ejecutar(token, (nodo) => {
     *     console.log("Nodo:", nodo.id());
     * });
     * ```
     *
     * @see Nodo.nodo_por_id
     * @see Nodo.adyacente
     */
    static por_cada_nodo_ejecutar(token, funcion, ...parametros) {
      if (Nodo.verificar_token(token)){
        if (this._superestructura.size === 0) {
          this._alerta("alerta no existe adyacente");
          return null;
        }

        const resultados = {};
        for (const [id, nodo] of this._superestructura.entries()) {
          if (nodo) resultados[id] = funcion(nodo, ...parametros);
        }

        return resultados;
      }else{
        this._error("intento de acceso no aurotizado");
        return null;
      }
    }

    /**
     * Vacía por completo la superestructura de nodos actual.
     * 
     * @usecase Reinicializa la estructura principal de nodos y enlaces, 
     * liberando toda la memoria asociada y dejando el sistema en estado limpio.
     * 
     * @param {symbol} token - Token de seguridad que valida la autorización 
     * para realizar la operación. Debe coincidir con `Nodo._token`.
     * 
     * @returns {boolean|null}
     * Devuelve `true` si la operación se realizó correctamente, 
     * o `null` si se detectó un intento de acceso no autorizado.
     * 
     * @behavior
     * - Si el token coincide con el token interno del módulo, 
     *   se destruye la superestructura en memoria:
     *   - Se reinicia `_superestructura` como `new Map()`
     *   - Se pone `_cant` (contador de nodos) a `0`
     *   - Se limpia el registro `_nodos_especiales`
     * - Si el token no coincide, se invoca `_error("intento de acceso no autorizado")`
     *   y no se modifica el estado interno.
     * 
     * @notes
     * - Este método se usa antes de cargar una nueva superestructura desde un medio persistente
     *   (por ejemplo, IndexedDB o almacenamiento remoto).
     * - No debe llamarse desde código de usuario sin pasar por el controlador principal,
     *   ya que borra toda la topología actual.
     * - El uso de `token` impide que otros módulos interfieran accidentalmente
     *   con la memoria interna de los nodos.
     * 
     * @future
     * - Podría añadirse una confirmación por callback o un evento `onReset` 
     *   que notifique a los observadores de la superestructura.
     * - También podría registrarse un historial de vaciados para auditoría.
     * 
     * @example
     * // Ejemplo de uso seguro desde un controlador
     * const token = Nodo.obtener_token();
     * const resultado = Nodo.vaciar_superestructura(token);
     * if (resultado === true) {
     *     console.log("Superestructura reiniciada correctamente.");
     * } else {
     *     console.error("Error: token inválido o acceso no autorizado.");
     * }
     */
    static vaciar_superestructura(token){
      if (token===this._token){
        console.log("vaciarndo");
        this._superestructura=new Map();
        this._cant=0;
        this._nodos_especiales=new Map();
        return true;
      }else{
        this._error("intento de acceso no aurotizado");
        return null;       
      }
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
    static _token = generarUUID();

    /**
     * Verifica si un token de entrada coincide con el token interno.
     * 
     * @param {string} token Token recibido desde el exterior.
     * @returns {boolean} true si el token es válido, false en caso contrario.
     */
    static verificar_token(token){
      return token === this._token;
    }

  /**
   * Registra el controlador principal que gestionará las operaciones sobre la superestructura.
   *
   * Durante el registro, el Controlador recibe el token de seguridad interno que le permitirá
   * autorizar el uso de {@link Nodo.por_cada_nodo_ejecutar} en contextos controlados.
   *
   * @param {string} controlador Nombre de la clase Controlador que será registrada (por ejemplo, "Controlador").
   * @returns {void}
   *
   * @example
   * ```js
   * Nodo.registrar_controlador("Controlador");
   * ```
   *
   * @see Nodo._token
   * @see Nodo.por_cada_nodo_ejecutar
   */
  static registrar_controlador(controlador) {
    console.log(controlador);
   /* const clase = globalThis[controlador];
    console.log(clase);
    if (typeof clase?.recibir_token === "function") {*/
      controlador.recibir_token(this._token);
      alert("RI");
    /*} else {
      this._error(`⚠️ No se pudo registrar el controlador '${controlador}'.`);
    }*/
  }
  
    /***************************  NODOS ESPECIALES********************* */
   /**
     * Indica si existen nodos especiales en la superestructura.
     *
     * Comprueba si el `Map` privado `_nodos_especiales` contiene
     * al menos un nodo. Este método es estático y actúa sobre el
     * conjunto global de nodos especiales gestionados por la clase `Nodo`.
     *
     * Métodos relacionados:
     * - {@link Nodos.Nodo.por_cada_nodo_especial_ejecutar Nodo.por_cada_nodo_especial_ejecutar()}
     *
     * @returns {boolean} `true` si existen nodos especiales, `false` si el `Map` está vacío.
     */
    static hay_nodos_en_especiales() {
      return Nodo._nodos_especiales.size > 0;
    }
    /**
     * Ejecuta una función sobre cada nodo especial (Interfaz {@link Nodos.Interfaces.AccesoAEspeciales}).
     *
     * Recorre todos los nodos del `Map` privado `_nodos_especiales` y ejecuta
     * la función proporcionada sobre cada uno, pasando los parámetros
     * adicionales si fuera necesario. Devuelve un `Map` con los resultados
     * indexados por el identificador del nodo.
     *
     * ---
     * 🔗 Otros métodos complementarios:
     * - {@link Nodos.Nodo.hay_nodos_especiales Nodo.hay_nodos_especiales()}
     *
     * ---
     * 🔗 Otros métodos relacionados:
     * - {@link Nodos.Nodo.por_cada_nodo_ejecutar Nodo.por_cada_nodo_ejecutar()}
     *
     * ---
     * @example
     * const resultados = Nodo.por_cada_nodo_especial_ejecutar(
     *   nodo => nodo.id()
     * );
     *
     * @note Devuelve `null` si no existen nodos especiales.
     * @param {Function} funcion - Función a ejecutar por cada nodo.
     * @param {...any} parametros - Parámetros adicionales a pasar a la función.
     * @returns {?Map<string, any>} Mapa de resultados indexados por id, o `null` si no hay nodos especiales.
     */
    por_cada_nodo_especial_ejecutar(funcion, ...parametros) {
        if ( Nodo._nodos_especiales.size == 0) {
            Nodo._alerta("no existen especiales");
            return null;
        }

        const resultados = new Map();
        for (const [id, nodo] of Nodo._nodos_especiales) {
            if (nodo) {
                resultados.set(id, funcion(nodo, ...parametros));
            }
        }
        return resultados;
    }

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
     * Muestra una representación visual del nodo con su id, dato, adyacencias y número de referencias.
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
        const adyacentes = this.adyacentes();

        let html = `<div id="nodo-${id}" style="margin-bottom:20px;">`;
        html += `>>NODO ${id}${this.es_especial() ? " (ESP)" : ""} - Dato: `;

        if (typeof dato === "string") html += dato;
        else if (dato === null) html += "null";
        else html += "este dato no es un string";

        html += "<br/>Adyacentes:<br/>";
        if (this.tiene_adyacente()) {
            html += "<ul>";
            for (const [enlace, nodo] of adyacentes) {
                html += `<li>[${enlace}] => <a href="#nodo-${nodo.id()}">${nodo.id()}</a></li>`;
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
    static imprimir_superestructura() {
        if (!Nodo.hay_nodos_en_superestructura()) {
            Nodo._alerta("Nodo.imprimir_superestructura() — la superestructura está vacía");
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
        Nodo.por_cada_nodo_ejecutar(Nodo._token, funcion, null);

        return true;
    }
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

        console.log(`\n>>NODO ${id}${this.es_especial() ? " (ESP)" : ""} - Dato: ${dato ?? "null"}`);
        console.log("Adyacentes:");
        if (this.tiene_adyacente()) {
            for (const [enlace, nodo] of this.adyacentes) {
                console.log(`[${enlace}] => ${nodo.id()}`);
            }
        } else {
            console.log("No tiene");
        }
        console.log(`Número de referencias a él: ${this._referencias}`);
        console.log("Fin Nodo");
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
    static imprimir_superestructura2() {
        if (!Nodo.hay_nodos_en_superestructura()) {
            Nodo._alerta("Nodo.imprimir_superestructura2() — la superestructura está vacía");
            return false;
        }

        const funcion = nodo => nodo.imprimir2();
        Nodo.por_cada_nodo_ejecutar(Nodo._token, funcion, null);
        
        return true;
    }
}
export { Nodo }