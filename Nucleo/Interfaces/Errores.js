/**
 * Interfaz para el manejo de errores dentro de una clase.
 * 
 * Las clases que implementen esta interfaz deberán proporcionar mecanismos
 * para registrar, imprimir y obtener errores formateados.
 * @interface
 * @memberof Nucleo.Interfaces
 *
 * @example
 *export class MiClase extends Objeto {/Objeto implementa la interfaz Errores
 * ...
 *  una_funcion() {
 *     ...     
 *   if (...) {//se produjo un error
 * 
 *      // ✅ Esto anda perfecto:
 *      MiClase._error("Error desde MiClase");
 *
 *      // También podrías:
 *      Objeto._error("Error desde MiClase");
 *
 *      // Y también:
 *      this.constructor._error("Error desde MiClase");
 *      return false;
 *    }
 *    ...
 *  }//Fin una_funcion
 *}// Fin clase
 *...
 *const miObjeto = new MiClase();
 *...
 *if (!miObjeto.una_funcion()) {
 *  MiClase.imprimir_errores();//O de alguna de las otras maneras mensionadas arriba
 *}
 */
class Errores {
  /**
   * Registra un nuevo error en el sistema de errores.
   * 
   * Lo que hace es recibir un mensaje (un string) como parámetro que de sierta información 
	 * que pueda ser necesaria al programador para que hubique rapidamente el el error que se produjo y 
	 * poder corregirlo. Cuando el mensaje es enviado la funcion lo agrega a una lista o pila de mensajes 
	 * de error. Para poder observar los mensajes de error existen otra funciones llamadas 
   * imprimir_errores(), imprimir_errores_conosola() y HTML_errores()
   * @param {string} error - Mensaje de error a registrar.
   * @returns {void}
   */
  static _error(error) {
    throw new Error("Método _error() debe ser implementado por la clase que herede.");
  }

  /**
   * Imprime en HTML la lista de errores registrados.
   * 
   * Este método muestra todos los mensajes de error que fueron agregados
   * con llamadas a {@link Nucleo.Interfaces.Errores._error _error()}, al sistema 
   * centralizado, junto con la pila de llamadas, permitiendo al programador
   * diagnosticar y depurar más fácilmente el origen de los problemas.
   * 
   * A diferencia de {@link Nucleo.Interfaces.Errores.imprimir_errores imprimir_errores()},
   * este método está especialmente pensado para mostrar los errores
   * directamente en la consola del navegador en un formato más legible.
   * @returns {void}
   */
  static imprimir_errores() {
    throw new Error("Método imprimir_errores() debe ser implementado por la clase que herede.");
  }

  /**
   * Imprime en consola la lista de errores registrados.
   * 
   * Este método muestra todos los mensajes de error que fueron agregados
   * con llamadas a {@link Nucleo.Interfaces.Errores._error _error()}, al sistema 
   * centralizado, junto con la pila de llamadas, permitiendo al programador
   * diagnosticar y depurar más fácilmente el origen de los problemas.
   * 
   * A diferencia de {@link Nucleo.Interfaces.Errores.imprimir_errores imprimir_errores()},
   * este método está especialmente pensado para mostrar los errores
   * directamente en la consola del navegador en un formato más legible.
   * @returns {void}
   */
  static imprimir_errores_consola() {
    throw new Error("Método imprimir_errores_consola() debe ser implementado por la clase que herede.");
  }

  /**
   * Devuelve un string HTML con la lista de errores registrados.
   * 
   * Este método genera y devuelve una lista en formato HTML con
   * todos los mensajes de error que fueron agregados
	 * con llamadas a {@link Nucleo.Interfaces.Errores._error _error()}, al sistema 
   * centralizado, junto con la pila de llamadas, 
	 * permitiendo al programador diagnosticar y depurar más fácilmente el
	 * origen de los problemas. 
   * 
   * A diferencia de los otros metodos de salida de errores, no imprime directamente los errores, 
   * sino que devuelve en forma de
   * contenido HTML para que pueda insertarse en el DOM y visualizarse
   * de forma legible dentro de una página web.
   * @returns {string}
   */
  static html_errores() {
    throw new Error("Método html_errores() debe ser implementado por la clase que herede.");
  }

  /**
   * Obtiene los errores registrados en formato JSON.
   *
   * Este método genera y devuelve una lista en formato JSON con
   * todos los mensajes de error que fueron agregados
	 * con llamadas a {@link Nucleo.Interfaces.Errores._error _error()}, al sistema 
   * centralizado, junto con la pila de llamadas, 
	 * permitiendo al programador diagnosticar y depurar más fácilmente el
	 * origen de los problemas. 
   * 
   * A diferencia de los otros metodos de salida de errores, no imprime directamente los errores, 
   * sino que devuelve 
   * como un string JSON, facilitando su transporte o almacenamiento.
   *
   * @returns {string} JSON con los errores registrados.
   */
  static json_errores() {
    throw new Error("Método html_errores() debe ser implementado por la clase que herede.");
  }

  /**
   * Habilita la recolección de errores en el sistema.
   *
   * Permite que los errores registrados mediante `_error()` sean almacenados
   * en la lista centralizada para su posterior consulta y visualización.
   *
   * @returns {void}
   */
  static activar_errores() {
    throw new Error("Método activar_errores() debe ser implementado por la clase que herede.");
  }

  /**
   * Desactiva la recolección de errores en el sistema.
   *
   * Los errores registrados mientras el sistema esté desactivado
   * no se almacenarán ni se mostrarán en la lista centralizada.
   *
   * @returns {void}
   */
  static desactivar_errores() {
    throw new Error("Método desactivar_errores() debe ser implementado por la clase que herede.");
  }
}
export {Errores}