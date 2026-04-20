/**
 * Interfaz para el manejo de alertas dentro de una clase.
 * 
 * Las clases que implementen esta interfaz deberán proporcionar mecanismos
 * para registrar, imprimir y obtener alertas formateados.
 * @interface
 * @memberof Nucleo.Interfaces
 *
 * @example
 *export class MiClase extends Objeto {/Objeto implementa la interfaz Alertas
 * ...
 *  una_funcion() {
 *     ...     
 *   if (...) {//se produjo un alerta
 * 
 *      // ✅ Esto anda perfecto:
 *      MiClase._alerta("Alerta desde MiClase");
 *
 *      // También podrías:
 *      Objeto._alerta("Alerta desde MiClase");
 *
 *      // Y también:
 *      this.constructor._alerta("Alerta desde MiClase");
 *      return false;
 *    }
 *    ...
 *  }//Fin una_funcion
 *}// Fin clase
 *...
 *const miObjeto = new MiClase();
 *...
 *if (!miObjeto.una_funcion()) {
 *  MiClase.imprimir_alertas();//O de alguna de las otras maneras mensionadas arriba
 *}
 */
class Alertas {
  /**
   * Registra un nuevo alerta en el sistema de alertas.
   * 
   * Lo que hace es recibir un mensaje (un string) como parámetro que de sierta información 
	 * que pueda ser necesaria al programador para que hubique rapidamente el el alerta que se produjo y 
	 * poder corregirlo. Cuando el mensaje es enviado la funcion lo agrega a una lista o pila de mensajes 
	 * de alerta. Para poder observar los mensajes de alerta existen otra funciones llamadas 
   * imprimir_alertas(), imprimir_alertas_conosola() y HTML_alertas()
   * @param {string} alerta - Mensaje de alerta a registrar.
   * @returns {void}
   */
  static _alerta(alerta) {
    throw new Error("Método _alerta() debe ser implementado por la clase que herede.");
  }

  /**
   * Imprime en HTML la lista de alertas registrados.
   * 
   * Este método muestra todos los mensajes de alerta que fueron agregados
   * con llamadas a {@link Nucleo.Interfaces.Alertas._alerta _alerta()}, al sistema 
   * centralizado, junto con la pila de llamadas, permitiendo al programador
   * diagnosticar y depurar más fácilmente el origen de los problemas.
   * 
   * A diferencia de {@link Nucleo.Interfaces.Alertas.imprimir_alertas imprimir_alertas()},
   * este método está especialmente pensado para mostrar las alertas
   * directamente en la consola del navegador en un formato más legible.
   * @returns {void}
   */
  static imprimir_alertas() {
    throw new Error("Método imprimir_alertas() debe ser implementado por la clase que herede.");
  }

  /**
   * Imprime en consola la lista de alertas registrados.
   * 
   * Este método muestra todos los mensajes de alerta que fueron agregados
   * con llamadas a {@link Nucleo.Interfaces.Alertas._alerta _alerta()}, al sistema 
   * centralizado, junto con la pila de llamadas, permitiendo al programador
   * diagnosticar y depurar más fácilmente el origen de los problemas.
   * 
   * A diferencia de {@link Nucleo.Interfaces.Alertas.imprimir_alertas imprimir_alertas()},
   * este método está especialmente pensado para mostrar las alertas
   * directamente en la consola del navegador en un formato más legible.
   * @returns {void}
   */
  static imprimir_alertas_consola() {
    throw new Error("Método imprimir_alertas_consola() debe ser implementado por la clase que herede.");
  }

  /**
   * Devuelve un string HTML con la lista de alertas registrados.
   * 
   * Este método genera y devuelve una lista en formato HTML con
   * todos los mensajes de alerta que fueron agregados
	 * con llamadas a {@link Nucleo.Interfaces.Alertas._alerta _alerta()}, al sistema 
   * centralizado, junto con la pila de llamadas, 
	 * permitiendo al programador diagnosticar y depurar más fácilmente el
	 * origen de los problemas. 
   * 
   * A diferencia de los otros metodos de salida de alertas, no imprime directamente las alertas, 
   * sino que devuelve en forma de
   * contenido HTML para que pueda insertarse en el DOM y visualizarse
   * de forma legible dentro de una página web.
   * @returns {string}
   */
  static html_alertas() {
    throw new Error("Método html_alertas() debe ser implementado por la clase que herede.");
  }

  /**
   * Obtiene las alertas registrados en formato JSON.
   *
   * Este método genera y devuelve una lista en formato JSON con
   * todos los mensajes de alerta que fueron agregados
	 * con llamadas a {@link Nucleo.Interfaces.Alertas._alerta _alerta()}, al sistema 
   * centralizado, junto con la pila de llamadas, 
	 * permitiendo al programador diagnosticar y depurar más fácilmente el
	 * origen de los problemas. 
   * 
   * A diferencia de los otros metodos de salida de alertas, no imprime directamente las alertas, 
   * sino que devuelve 
   * como un string JSON, facilitando su transporte o almacenamiento.
   *
   * @returns {string} JSON con las alertas registrados.
   */
  static json_alertas() {
    throw new Error("Método html_alertas() debe ser implementado por la clase que herede.");
  }

  /**
   * Habilita la recolección de alertas en el sistema.
   *
   * Permite que las alertas registrados mediante `_alerta()` sean almacenados
   * en la lista centralizada para su posterior consulta y visualización.
   *
   * @returns {void}
   */
  static activar_alertas() {
    throw new Error("Método activar_alertas() debe ser implementado por la clase que herede.");
  }

  /**
   * Desactiva la recolección de alertas en el sistema.
   *
   * Las alertas registrados mientras el sistema esté desactivado
   * no se almacenarán ni se mostrarán en la lista centralizada.
   *
   * @returns {void}
   */
  static desactivar_alertas() {
    throw new Error("Método desactivar_alertas() debe ser implementado por la clase que herede.");
  }
}
export {Alertas}