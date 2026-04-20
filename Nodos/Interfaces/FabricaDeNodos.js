/**
 * Interfaz FabricaDeNodos
 *
 * Define el conjunto de métodos estáticos que debe implementar cualquier clase que actúe como
 * fábrica de nodos. Su propósito es garantizar la creación uniforme y la eliminación controlada
 * de instancias de {@link ./classes/Iteradores-Nodos-Nodo.html Nodo}.
 *
 * Métodos disponibles:
 * - `cantidad_de_nodos()` → Devuelve la cantidad de nodos vivos en memoria.
 * - `crear()` y `crear_con_dato(dato)` → Creación básica de nodos vacíos o con datos encapsulados.
 * - `crear_con_id(id)` y `crear_con_dato_e_id(dato, id)` → Creación de nodos con identificadores *especiales*.
 * - `nodo(elemento, callback)` → Garantiza que el valor recibido sea un nodo válido.
 * - `eliminar(nodo)` → Elimina un nodo si no posee enlaces entrantes.
 *
 * ⚠️ Método `eliminar_autoenlazado(nodo)` está marcado como `@deprecated`:  
 * la responsabilidad de limpiar autoenlaces recae sobre el programador.
 *
 * @interface
 * @since V3.2
 * @memberof Nodos.Interfaces
 */
class FabricaDeNodos {
  /**
   * Devuelve la cantidad de nodos actuales.
   *
   * Define la operación que deben implementar las clases que funcionen
   * como fábricas de nodos.
   *
   * @since V2.7
   * @static
   * @returns {number} Cantidad de instancias de nodos existentes.
   */
  static cantidad_de_nodos() {
     throw new Error("Método cantidad_de_nodos() debe ser implementado por la clase que herede.");
  }

  /**
   * Crea una nueva instancia de nodo.
   *
   * Define la operación de fábrica que deben implementar
   * las clases encargadas de generar nodos.
   *
   * @static
   * @returns {Nodos.Nodo} Una nueva instancia de nodo.
   */
  static crear() {
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
   * @returns {Nodos.Nodo} Instancia de nodo que encapsula el dato.
   *
   */
  static crear_con_dato(dato, todos = false) {
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
   * @param {*} id Identificador a asignar al nuevo nodo, debe ser unico y *especial*.
   * @returns {Nodos.Nodo|null} Instancia de nodo con identificador *especial* o null si no pudo crearlo.
   * @static
   */
  static crear_con_id(id) {
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
   * @param {*} id IIdentificador a asignar al nuevo nodo, debe ser unico y *especial*.
   * @returns {Nodos.Nodo} Instancia de nodo con dato e identificador *especial* o null si no pudo crearlo.
   *
   * @static
   */
  static crear_con_dato_e_id(dato, id) {
    throw new Error("Método crear() debe ser implementado por la clase que herede.");
  }

  /**
   * Garantizar que el elemento entregado sea un nodo válido.
   *
   *
   * Este método recibe un valor cualquiera (o ninguno) o un posible nodo y asegura que el resultado final
   * sea siempre una instancia de {@link Nodos.Nodo}.  
   *
   * Comportamiento general:
   * - Si no recibe ningun parametro devuelve un nuevo Nodo vací totalmente válido.
   * - Si el parámetro recibido **ya es un Nodo**, se retorna tal cual y en el callback se indica `true`.  
   * - Si el parámetro **no es un Nodo**, se encapsula en una nueva instancia de {@link Nodos.Nodo}
   *   creada con {@link Nodos.Nodo.crear_con_dato crear_con_dato()}, y en el callback se indica `false`.  
   * - Si no se pasa ningún valor, se genera un nodo válido que encapsula explícitamente `null`.  
   *
   * El segundo parámetro es un **callback opcional** que se ejecuta justo antes de retornar el nodo.  
   * Recibe dos argumentos:
   *   1. `nodo` → La instancia final de {@link Nodos.Nodo}.  
   *   2. `esNodo` → Booleano que indica si el parámetro original ya era un nodo (`true`) o no (`false`).  
   *
   * Esta interfaz existe para abstraer el detalle de construcción de nodos y garantizar que las
   * implementaciones que la utilicen trabajen siempre con objetos válidos sin necesidad de
   * comprobaciones adicionales.  
   *
   *
   * @function nodo
   * @static
   * @param {*} [elemento=null] Valor a encapsular o un nodo existente.  
   *                            Si no se provee, se crea un nodo vacío válido.  
   * @param {function(Nodo, boolean)=} callback Función opcional que recibe el nodo y un booleano
   *                                                  indicando si el parámetro original ya era un nodo.  
   * @returns {Nodo} Nodo válido que encapsula el valor recibido.
   *
   * @since V2.9.3
   */
  static nodo(elemento = null, es_nodo = null) {
    throw new Error("Método nodo() debe ser implementado por la clase que herede.");
  }

  /**
   * Eliminar un nodo del sistema.
   *
   * Borra el nodo de la superestructura y de los nodos especiales, y del sistema en general devolviendo
   * `true` en caso de éxito.  
   * 
   * ⚠️ Condición imprescindible: no debe tener enlaces entrantes desde otros nodos;
   * en ese caso devuelve `false` y lanza un error.  
   * 
   * 🔄  Si el nodo es "autoenlazado", puede utilizarseel método 
   * {@link Nodos.Interfaces.FabricaDeNodos.eliminar_autoenlazado eliminar_autoenlazado()}.
   * 
   * @static
   * @param {Nodo} nodo Nodo a eliminar.
   * @returns {boolean|null} `true` si fue eliminado, `false` si no pudo eliminarse,
   *                         `null` si el parámetro no es válido.
   */
  static eliminar(nodo) {
    throw new Error("Método eliminar() debe ser implementado por la clase que herede.");
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
   * {@link Nodos.Interfaces.FabricaDeNodos.eliminar método de eliminación estándar}.
   * 
   * Si el nodo tiene autoenlaces pueden eliminarse usando el metodo 
   * {@link Nodos.Interfaces.Adyacentes.eliminar_enlace() eliminar_enlace} 
   * que elimina los enlaces uno por uno; o el metodo
   * {@link Nodos.Interfaces.Adyacentes.eliminar_enlaces() eliminar_enlaces}
   * que elimina todos los enlaces que salen del nodo, incluyendo los que apuntan a sí mismo
   * 
   * @deprecated 
   * @static
   * @param {Nodo} nodo Nodo a eliminar.
   * @returns {boolean|null} `true` si fue eliminado, `false` si no pudo eliminarse,
   *                         `null` si el parámetro no es válido.     */
  static eliminar_autoenlazado(nodo) {
    throw new Error("Método eliminar_autoenlazado() debe ser implementado por la clase que herede.");
  }
}

export { FabricaDeNodos }