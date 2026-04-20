/**
 * Interfaz de objetos con id único.
 * @interface
 * @memberof Nucleo.Interfaces
 */
class Id {
  /**
   * Determina si un identificador es especial.
   *
   * @param {string} id El id a comprobar.
   * @returns {boolean} `true` si el id es especial, `false` en caso contrario.
   */
   static es_id_especial(id) {
      throw new Error("Método es_id_especial() debe ser implementado por la clase que herede.");
   }

  /**
   * Devuelve el identificador único del objeto.
   *
   * Si el objeto aún no tiene un id, se le asigna uno nuevo automáticamente,
   * asegurando que sea único dentro del sistema.
   *
   * @returns {string} El id único del objeto.
   */
  id() {
    throw new Error("Método id() debe ser implementado por la clase que herede.");
   }

  /**
   * Asigna un identificador único al objeto.
   *
   * El id proporcionado debe ser especial (debe poder pasar positivamente la 
   * verificacion realizada por [es_id_especial(id)]{@link Nucleo.Intefaces.Id.es_id_especial})
   * y no estar repetido en otros objetos.
   *
   * @param {string} id - El id a asignar.
   * @returns {boolean} `true` si el id fue asignado exitosamente, `false` en caso contrario.
   */
  _id(id) { 
    throw new Error("Método _id() debe ser implementado por la clase que herede.");
  }

  /**
   * Comprueba si el objeto actual posee un id especial.
   *
   * Se considera **especial** cuando el id del objeto puede pasar positivamente la 
   * verificacion realizada por [es_id_especial(id)]{@link Nucleo.Intefaces.Id.es_id_especial}
   * de manera de poder distinguirlo de otros objetos **comunes**.
   * Si el objeto aún no tiene ningún id, este método le asignará uno común automáticamente.
   *
   * @returns {boolean} `true` si el objeto tiene un id especial, `false` en caso contrario.
   */
  es_especial() { 
    throw new Error("Método es_especial() debe ser implementado por la clase que herede.");
  }
}

export { Id }
