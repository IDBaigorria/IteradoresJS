import { mezclar_clase_con_interfaces } from "../../miscelaneas/mixin.js";
import { Errores, Alertas } from "./index.js";

/**
 * @interface
 * @extends Nucleo.Interfaces.Errores
 * @extends Nucleo.Interfaces.Alertas
 * @memberof Nucleo.Interfaces
 */
class ErroresYAlertas extends mezclar_clase_con_interfaces(Errores, Alertas) {
  /**
   * Activa la recolección de errores y alertas en el sistema.
   *
   * Esta función permite que los errores registrados mediante `_error()` y las alertas 
   * registradas mediante `_alerta()`
   * se agreguen a las listas/pilas centralizadas para su posterior análisis o visualización.
   *
   * @see Nucleo.Interfaces.Alertas.activar_alertas
   * @see Nucleo.Interfaces.Errores.activar_errores
   * @returns {void}
   */
  static activar_errores_y_alertas() { throw new Error("Debe implementarse"); }

  /**
   * Desactiva la recolección de mensajes de error y alerta.
   * @see Nucleo.Interfaces.Alertas.desactivar_alertas
   * @see Nucleo.Interfaces.Errores.desactivar_errores
   */
  static desactivar_errores_y_alertas() { throw new Error("Debe implementarse"); }
}

export { ErroresYAlertas };