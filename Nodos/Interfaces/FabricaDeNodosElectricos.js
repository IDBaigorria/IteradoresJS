import { FabricaDeNodos } from "./index.js";
import { Conf } from "../../Configuracion/index.js"

/**
 * Interfaz para crear y eliminar nodos electricos
 * 
 * La principal diferencia entre los nodos electricos y los comunes es que los electricos
 * trabajan en "fase". Esto es asi para poder tener distintos comportamientos del nodo usando 
 * los mismos metodos pero diferenciando enlaces. Esto significa que los adyacentes del nodo
 * comun ahora se ven replicados por cada face. Replicados en el espacio de nombres pero no en
 * el contenido. Interface es una especie de matris donde por cada fase tienen enlaces a nodos
 * y dependiendo en que fase se este trabajando el enlace puede existir o sinificar una
 * cosa totalmente distinta. Esto es un poco asi porque se piensa en este caso como que cada
 * nodo es en realidad un componente eletronico interconectado a otros componentes realizando
 * una simulacion, entonces el mismo componente puede representar un comportamiento distinto para
 * cada "fase" de trabajo, pero para esto debe tener algunas cosas unicas de cada fase, como
 * los adyacentes (de la interfaz adyacente).
 * 
 * Siguiendo este razonamiento de componentes electricos cada nodo tiene un codenzador que le
 * da su tiempo de vida. si este se queda sin energia el nodo y el nodo llega a cero. por ahora
 * se guarda una funcion distinta por cada fase que se ejecuta cuando llega a cero la energia 
 * dependiendo la fase y otra funcion tambien por fase para cuando se desborda la energia (pasa
 * la capacidad maxima que se guardae una propiedad de instancia). La propiedad energia va
 * a tener entonces un array con la energia de cada fase, similar a como se maneja el resto
 * de la clase.
 * 
 * Espero que se entienda. y sino q lo lea una ia jeeeee
 * 
 * Vamos al diseño de la fabrica para que todo funcione cada instancia de NodoElectrico tiene una 
 * capacidad (maxima) y un fuga. La fuga es para imitar lo que sucede en verdad en un capacitor 
 * electrolitico que nunca es perfecto y va perdiendo "energia" con el paso del tiempo. (esto ayudara 
 * mas adelante para ver como transcurre el tiempo). 
 * 
 * Entonces todos los nodos electricos tienen tres propiedades de instancia:
 * energia (actual)
 * capacidad (maxima)
 * fuga (de energia por ciclo de tiempo)
 * 
 * energia es dinamico y tiene su propia interfaz. en esta interfaz nos concentraremos en las constantes
 * de creacion capacidad y fuga. Para que sea compatible con la intefaz de nodo las pondremos opciones
 * en cada entrada de las funciones de creacion y tomaremos los valores por defecto de la clase Conf si 
 * es que no se proporcionan.
 * @interface
 * @since V1.2.0
 * @memberof Nodos.Interfaces
 */
class FabricaDeNodosElectricos extends FabricaDeNodos{
  /**
   * Crea una nueva instancia de nodo.
   *
   * Define la operación de fábrica que deben implementar
   * las clases encargadas de generar nodos.
   *
   * @static
   * @param {number} [capacidad=Conf.CAPACIDAD_NODO_ELECTRICO] capacidad maxima de energia del nodo 
   * ver:{@link Configuracion.Conf#CAPACIDAD_NODO_ELECTRICO Conf.CAPACIDAD_NODO_ELECTRICO}
   * @param {number} [fuga=Conf.FUGA_NODO_ELECTRICO] fuga de energia por cada ciclo
   * ver:{@link Configuracion.Conf#FUGA_NODO_ELECTRICO Conf.FUGA_NODO_ELECTRICO}
   * @returns {NodoElectrico} Una nueva instancia de {@link Nodos.NodoElectrico}
   */
  static crear(capacidad=Conf.CAPACIDAD_NODO_ELECTRICO, fuga=Conf.FUGA_NODO_ELECTRICO) {
    throw new Error("Método crear() debe ser implementado por la clase que herede.");
  }

  /**
   * Crear un nuevo nodo encapsulando el dato recibido.
   *
   * Devuelve una nueva instancia de la clase {@link Nodos.Nodo} que contiene el dato provisto.  
   * Este método no discrimina el tipo del dato, puede ser un valor primitivo o un objeto complejo,
   * que será encapsulado directamente en el nodo.
   * @static
   * @param {*} dato Valor a encapsular en el nuevo nodo.
   * @param {number} [capacidad=Conf.CAPACIDAD_NODO_ELECTRICO] capacidad maxima de energia del nodo 
   * ver:{@link Configuracion.Conf#CAPACIDAD_NODO_ELECTRICO Conf.CAPACIDAD_NODO_ELECTRICO}
   * @param {number} [fuga=Conf.FUGA_NODO_ELECTRICO] fuga de energia por cada ciclo
   * ver:{@link Configuracion.Conf#FUGA_NODO_ELECTRICO Conf.FUGA_NODO_ELECTRICO}
   * @returns {NodoElectrico} Una nueva instancia de {@link Nodos.NodoElectrico}
   *
   */
  static crear_con_dato(dato, todos = false, capacidad=Conf.CAPACIDAD_NODO_ELECTRICO, fuga=Conf.FUGA_NODO_ELECTRICO) {
    throw new Error("Método crear_con_dato() debe ser implementado por la clase que herede.");
  }

  /**
   * Crear un nuevo nodo asignándole un identificador válido.
   *
   * El identificador pasado como argumento debe superar positivamente la verificación realizada
   * por el método {@link Nucleo.Interfaces.Id.es_id_especial es_id_especial(id)}.
   *
   * 🔗 Método relacionado:
   * - {@link Nucleo.Interfaces.Id.es_especial es_especial}
   *
   * @static
   * @param {string} id Identificador *especial* a asignar al nuevo nodo (debe pasar la verificación).
   * @param {number} [capacidad=Conf.CAPACIDAD_NODO_ELECTRICO] capacidad maxima de energia del nodo 
   * ver:{@link Configuracion.Conf#CAPACIDAD_NODO_ELECTRICO Conf.CAPACIDAD_NODO_ELECTRICO}
   * @param {number} [fuga=Conf.FUGA_NODO_ELECTRICO] fuga de energia por cada ciclo
   * ver:{@link Configuracion.Conf#FUGA_NODO_ELECTRICO Conf.FUGA_NODO_ELECTRICO}
   * @returns {NodoElectrico|null} Una nueva instancia de {@link Nodos.NodoElectrico}     
   */
  static crear_con_id(id, capacidad=Conf.CAPACIDAD_NODO_ELECTRICO, fuga=Conf.FUGA_NODO_ELECTRICO) {
    throw new Error("Método crear_con_id() debe ser implementado por la clase que herede.");
  }

  /**
   * Crear un nuevo nodo encapsulando un dato y asignándole un identificador válido.
   *
   * El identificador pasado como argumento debe superar positivamente la verificación realizada
   * por el método {@link Nucleo.Interfaces.Id.es_id_especial es_id_especial(id)}.
   *
   * 🔗 Método relacionado:
   * - {@link Nucleo.Interfaces.Id.es_especial es_especial}
   *
   * @param {*} dato Valor a encapsular en el nodo.
   * @param {*} id Identificador *especial* del nodo (debe pasar verificación).
   * @param {number} [capacidad=Conf.CAPACIDAD_NODO_ELECTRICO] capacidad maxima de energia del nodo 
   * ver:{@link Configuracion.Conf#CAPACIDAD_NODO_ELECTRICO Conf.CAPACIDAD_NODO_ELECTRICO}
   * @param {number} [fuga=Conf.FUGA_NODO_ELECTRICO] fuga de energia por cada ciclo
   * ver:{@link Configuracion.Conf#FUGA_NODO_ELECTRICO Conf.FUGA_NODO_ELECTRICO}
   * @returns {NodoElectrico|null} Instancia de nodo con dato e identificador *especial* válido si tuvo exito o null en caso contrario.
   *
   * @static
   */
  static crear_con_dato_e_id(dato, id, capacidad=Conf.CAPACIDAD_NODO_ELECTRICO, fuga=Conf.FUGA_NODO_ELECTRICO) {
    throw new Error("Método crear() debe ser implementado por la clase que herede.");
  }

  /**
   * Garantizar que el elemento entregado sea un nodo válido.
   *
   *
   * Este método recibe un valor cualquiera (o ninguno) o un posible nodo y asegura que el resultado final
   * sea siempre una instancia de {@link Nodos.NodoElectrico}.  
   *
   * Comportamiento general:
   * - Si no recibe ningun parametro devuelve un nuevo NodoElectrico vacío totalmente válido.
   * - Si el parámetro recibido **ya es un NodoElectrico**, se retorna tal cual y en el callback se indica `true`.  
   * - Si el parámetro **no es un NodoElectrico**, se encapsula en una nueva instancia de {@link Nodos.Nodo}
   *   creada con {@link Nodos.NodoElectrico.crear_con_dato crear_con_dato()}, y en el callback se indica `false`.  
   * - Si no se pasa ningún valor, se genera un nodo válido que encapsula explícitamente `null`.  
   *
   * El segundo parámetro es un **callback opcional** que se ejecuta justo antes de retornar el nodo.  
   * Recibe dos argumentos:
   *   1. `nodo` → La instancia final de {@link Nodos.NodoElectrico}.  
   *   2. `esNodo` → Booleano que indica si el parámetro original ya era un nodo (`true`) o no (`false`).  
   *
   * Esta interfaz existe para abstraer el detalle de construcción de nodos y garantizar que las
   * implementaciones que la utilicen trabajen siempre con objetos válidos sin necesidad de
   * comprobaciones adicionales.  
   *
   *
   * @function nodo
   * @static
   * @param {*} [elemento=null] Valor a encapsular o nodo existente. Si se omite, se crea un nodo vacío.
   * @param {function(NodoElectrico, boolean)|null} callback Función opcional que recibe el nodo creado y un booleano
   *                                                indicando si el parámetro original ya era un nodo.
   * @param {number} [capacidad=Conf.CAPACIDAD_NODO_ELECTRICO] capacidad maxima de energia del nodo 
   * ver:{@link Configuracion.Conf#CAPACIDAD_NODO_ELECTRICO Conf.CAPACIDAD_NODO_ELECTRICO}
   * @param {number} [fuga=Conf.FUGA_NODO_ELECTRICO] fuga de energia por cada ciclo
   * ver:{@link Configuracion.Conf#FUGA_NODO_ELECTRICO Conf.FUGA_NODO_ELECTRICO}
   * @returns {NodoElectrico} Una nueva instancia de {@link Nodos.NodoElectrico}
   *
   * @since V2.9.3
   */
  static nodo(elemento = null, es_nodo = null, capacidad=Conf.CAPACIDAD_NODO_ELECTRICO, fuga=Conf.FUGA_NODO_ELECTRICO) {
    throw new Error("Método nodo() debe ser implementado por la clase que herede.");
  }

}
export {FabricaDeNodosElectricos}