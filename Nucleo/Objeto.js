import { Conf } from '../Configuracion/index.js';
import { Id, ErroresYAlertas } from './Interfaces/index.js';
import { mezclar_clase_con_interfaces } from "../miscelaneas/mixin.js";

console.log("Objetos");
/**
 * Clase base de todo el sistema en PHP.
 * 
 * Esta clase fue creada para ser el “padre” de todas las clases implementadas en el sistema.
 * Su objetivo principal es agrupar funciones y propiedades comunes a todos los objetos del sistema.
 * Los objetivos especificos se iran imponiendo segun las necesidades con cambios de version.
 *
 * En la **version 2.0** su propósito principal puede agruparse en tres grandes ejes:
 * - Asignación, validación y gestión de identificadores únicos
 *   ([Id]{@link Nucleo.Interfaces.Id}).
 * - Registro, almacenamiento y visualización de errores y alertas
 *   ([Errores]{@link Nucleo.Interfaces.Errores} y [Alertas]{@link Nucleo.Interfaces.Alertas},
 *   agrupadas en [ErroresYAlertas]{@link Nucleo.Interfaces.ErroresYAlertas}).
 * - Configuración inicial basada en valores definidos por
 *   [Conf]{@link Configuracion.Conf}.
 *
 * ---
 *
 * ### 📌 Identificadores únicos (Interface [Id]{@link Nucleo.Interfaces.Id})
 *
 * Cada instancia de `Objeto` posee un **identificador único (id)** que se asigna de forma
 * perezosa: si el objeto aún no tiene un id al invocar
 * {@link Nucleo.Objeto#id id()}, se le genera automáticamente uno nuevo.  
 *
 * También es posible asignar manualmente un id especial (una cadena no numérica) mediante
 * {@link Nucleo.Objeto#_id _id()}. Antes de asignar el id se valida que:
 *
 * - Sea un id 'especial', comprobado por el método protegido
 *   {@link Nucleo.Objeto#es_id_especial es_id_especial()}.
 * - No exista otro objeto con el mismo id en el sistema.
 *
 * Además, es posible comprobar si el id actual es especial mediante
 * {@link Nucleo.Objeto#es_especial es_especial()}.
 *
 * ---
 *
 * ### ⚠️ Sistema de errores y alertas (Interfaces [Errores]{@link Nucleo.Interfaces.Errores} y [Alertas]{@link Nucleo.Interfaces.Alertas})
 *
 * `Objeto` implementa un sistema interno de **recolección de errores y alertas**,
 * lo que facilita la depuración y el seguimiento de eventos durante la ejecución.
 * Cada error o alerta registrado incluye su mensaje y la traza de la pila en el momento
 * de la invocación.
 *
 * Características principales:
 *
 * - Activación y desactivación dinámica de la recolección con:
 *   - [activar_errores]{@link Nucleo.Objeto.activar_errores}
 *   - [desactivar_errores]{@link Nucleo.Objeto.desactivar_errores}
 *   - [activar_alertas]{@link Nucleo.Objeto.activar_alertas}
 *   - [desactivar_alertas]{@link Nucleo.Objeto.desactivar_alertas}
 *   - (o sus variantes combinadas
 *     [activar_errores_y_alertas]{@link Nucleo.Objeto.activar_errores_y_alertas} /
 *     [desactivar_errores_y_alertas]{@link Nucleo.Objeto.desactivar_errores_y_alertas})
 *
 * - Visualización de errores y alertas usando:
 *   - [imprimir_errores]{@link Nucleo.Objeto.imprimir_errores}
 *   - [imprimir_errores_consola]{@link Nucleo.Objeto.imprimir_errores_consola}
 *   - [html_errores]{@link Nucleo.Objeto.html_errores}
 *   - Y sus equivalentes en alertas
 *
 * - Exportación en formato JSON para depuración automatizada:
 *   - [json_errores]{@link Nucleo.Objeto.json_errores}
 *   - y su equivalete para alertas
 * 
 * - Registro de errores y alertas mediante los métodos protegidos internos:
 *   - {@link Nucleo.Objeto._error _error()}
 *   - {@link Nucleo.Objeto._alerta _alerta()}
 *
 * ---
 *
 * ### ⚙️ Configuración centralizada (Clase Conf)
 *
 * El comportamiento inicial de `Objeto` está controlado por las constantes
 * definidas en {@link Configuracion.Conf Conf}:
 *
 * - **Activación inicial de la recolección**:
 *   - [ACTIVAR_ERRORES]{@link Configuracion.Conf#ACTIVAR_ERRORES}
 *   - [ACTIVAR_ALERTAS]{@link Configuracion.Conf#ACTIVAR_ALERTAS}
 *
 *   Estas constantes determinan si la recolección comienza activada o desactivada.
 *   No obstante, este estado puede modificarse dinámicamente mediante los métodos
 *   de activación y desactivación.
 *
 * - **Configuración de la pila de llamadas guardada**:
 *   - [ERRORES_Y_ALERTAS__PILA_DE_LLAMADAS__LIMITE]{@link Configuracion.Conf#ERRORES_Y_ALERTAS__PILA_DE_LLAMADAS__LIMITE}
 *
 *   Esta constante define la profundidad máxima de la pila de llamadas que se guarda
 *   con cada error o alerta. A diferencia de PHP, en JavaScript no se incluyen
 *   argumentos ni objetos de la pila por limitaciones del lenguaje.
 *
 * ---
 *
 * ### 🧩 Integración con otras clases
 *
 * `Objeto` está diseñado como clase base para el resto de las clases del sistema.
 * Al extenderla, cualquier clase obtiene automáticamente:
 * - Identificación única garantizada.
 * - Sistema de recolección de errores y alertas listo para usar.
 * - Comportamiento configurable desde {@link Configuracion.Conf Conf}.
 *
 * ---
 * 
 * ## HISTORIAL DE CAMBIOS
 *  - **V2.0.0.250918**: Se creo la clase como espejo lo mas fiel posible a su version en PHP
 *  - **V2.0.0.250930**: Soluciono error cuando llamo a los imprimir. Tuve que cambiar la privacidad de
 *                        _linea_stack de privada a protected (public por limitacion del lenguaje)
 * 
 * Clase base de objetos con ID único
 * @class
 * @author Ignacio David Baigorria
 * @version 2.0.0.250930
 * @since 0.0
 * @extends Object
 * @implements {Nucleo.Interfaces.Id}
 * @implements {Nucleo.Interfaces.Errores}
 * @implements {Nucleo.Interfaces.Alertas}
 * @implements {Nucleo.Interfaces.ErroresYAlertas}
 * @memberof Nucleo
 */
class Objeto extends mezclar_clase_con_interfaces(Object, ErroresYAlertas, Id) {
  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  //// INTERFAZ ERRORESYALERTAS
  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////

  ////////////////////////////////////////////////////////////////////////////////////////
  //// INTERFAZ ERRORES (ERRORESYALERTAS)
  ////////////////////////////////////////////////////////////////////////////////////////
  /**
   * Lista de errores ocurridos.
   * @type {Array<{fecha: string, mensaje: string, pila: any[]}>}
   */
  static _errores = [];

  /**
   * Contador de errores acumulados.
   * @type {number}
   */
  static _contador_errores = 0;

  /**
   * Habilita o deshabilita el registro de errores.
   * @type {boolean}
   */
  static _activar_rec_errores = Conf.ACTIVAR_ERRORES;

  /**
   * Profundidad máxima de la pila de errores.
   * @type {number}
   */
  static _limite_pila_de_llamadas_errores = Conf.ERRORES_Y_ALERTAS__PILA_DE_LLAMADAS__LIMITE;


  /**
   * Activa la recolección de errores del sistema ([Interface Errores]{@link Nucleo.Interfaces.Errores})
   * 
   * Este metodo pertenece a las interfaces:
	 * - [Interfaz Errores]{@link Nucleo.Interfaces.Errores}
	 * - [Interfaz ErroresYAlertas]{@link Nucleo.Interfaces.ErroresYAlertas}
   * 
   * Esta función permite habilitar dinamicamente la captura y almacenamiento de errores
   * dentro del sistema centralizado, independientemente del valor inicial configurado en
   * la constante [Conf.ACTIVAR_ERRORES]{@link Configuracion.Conf#ACTIVAR_ERRORES}. Permite
   * sobrescribir temporalmente la configuración predeterminada para activar la recopilación
   * de mensajes de error durante la ejecución. 
   * 
   * Una vez activada, cualquier error registrado mediante `[_error()]{@link Nucleo.Objeto._error}` 
   * se almacenará y podrá ser consultado posteriormente mediante los métodos de visualización.
   *
   * Para volver a desactivar la recoleccion de errores de manera dinamica puede usarse 
   * [desactivar_errores()]{@link Nucleo.Objeto.desactivar_errores}
   * 
   * La lista de errores puede luego visualizarse usando métodos como:
   * - [imprimir_errores()]{@link Nucleo.Objeto.imprimir_errores}
   * - [imprimir_errores_consola()]{@link Nucleo.Objeto.imprimir_errores_consola}
   * - [html_errores()]{@link Nucleo.Objeto.html_errores}
   * - [json_errores()]{@link Nucleo.Objeto.json_errores}
   *
   * Configuración relacionada:
   * - [Conf.ACTIVAR_ERRORES]{@link Configuracion.Conf#ACTIVAR_ERRORES}
   * - [Conf.ERRORES_Y_ALERTAS__PILA_DE_LLAMADAS__LIMITE]{@link Configuracion.Conf#ERRORES_Y_ALERTAS__PILA_DE_LLAMADAS__LIMITE}
   * 
   * Métodos relacionados:
   * - [desactivar_errores()]{@link Nucleo.Objeto.desactivar_errores}
   * - [activar_errores_y_alertas()]{@link Nucleo.Objeto.activar_errores_y_alertas}
   * - [desactivar_errores_y_alertas()]{@link Nucleo.Objeto.desactivar_errores_y_alertas}
   *
   * @example
   * ...
   * // Habilitar el registro de errores
   * Objeto.activar_errores();
   * ...
   * @returns {void}
   */
  static activar_errores() {
    Objeto._activar_rec_errores = true;
  }

  /**
   * Desactiva la recolección de errores del sistema ([Interface Errores]{@link Nucleo.Interfaces.Errores}).
   *
   * Este metodo pertenece a las interfaces:
   * - [Interfaz Errores]{@link Nucleo.Interfaces.Errores}
   * - [Interfaz ErroresYAlertas]{@link Nucleo.Interfaces.ErroresYAlertas}
   *
	 * Este método deshabilita dinámicamente la recolección de errores en el sistema, incluso si la constante 
	 * [Conf.ACTIVAR_ERRORES]{@link Configuracion.Conf#ACTIVAR_ERRORES} 
	 * está establecida en true. De esta forma, permite sobrescribir temporalmente el comportamiento 
	 * predeterminado para detener la recopilación de mensajes de error.
	 * 
	 * De esta manera se impide que los errores registrados mediante 
   * `[_error()]{@link Nucleo.Objeto._error}` se agreguen a la lista centralizada. 
	 * 
	 * Los errores que ocurran mientras el sistema esté
	 * desactivado no serán almacenados ni mostrados por los métodos de visualización.
   *
   * Para volver a activar la recoleccion de errores puede usarse [activar_errores()]{@link Nucleo.Objeto.activar_errores}
   * 
   * La lista de errores puede luego visualizarse usando métodos como:
   * - [imprimir_errores()]{@link Nucleo.Objeto.imprimir_errores}
   * - [imprimir_errores_consola()]{@link Nucleo.Objeto.imprimir_errores_consola}
   * - [html_errores()]{@link Nucleo.Objeto.html_errores}
   * - [html_errores()]{@link Nucleo.Objeto.json_errores}
   * 
   * Configuración relacionada:
   * - [Conf.ACTIVAR_ERRORES]{@link Configuracion.Conf#ACTIVAR_ERRORES}
   * - [Conf.ERRORES_Y_ALERTAS__PILA_DE_LLAMADAS__LIMITE]{@link Configuracion.Conf#ERRORES_Y_ALERTAS__PILA_DE_LLAMADAS__LIMITE}
   * 
   * Métodos relacionados:
   * - [activar_errores()]{@link Nucleo.Objeto.activar_errores}
   * - [activar_errores_y_alertas()]{@link Nucleo.Objeto.activar_errores_y_alertas}
   * - [desactivar_errores_y_alertas()]{@link Nucleo.Objeto.desactivar_errores_y_alertas}
   *
   * @example
   * ...
   * // Deshabilitar el registro de errores
   * Objeto.desactivar_errores();
   * ...
   * @returns {void}
   */
  static desactivar_errores() {
    Objeto._activar_rec_errores = false;
  }

  /**
   * Registra un error si el sistema de errores está activado ([Interface Errores]{@link Nucleo.Interfaces.Errores}).
   * 
   * Este metodo pertenece a las interfaces:
	 * - [Interfaz Errores]{@link Nucleo.Interfaces.Errores}
	 * - [Interfaz ErroresYAlertas]{@link Nucleo.Interfaces.ErroresYAlertas}
   * 
   * Esta función recibe un mensaje (un string) que describe información relevante
   * para que el programador ubique rápidamente el error ocurrido y pueda corregirlo.
   * Cuando se invoca, agrega el mensaje a la lista/pila de errores centralizada.
   *
   * La lista de errores puede luego visualizarse usando métodos como:
   * - [imprimir_errores()]{@link Nucleo.Objeto.imprimir_errores}
   * - [imprimir_errores_consola()]{@link Nucleo.Objeto.imprimir_errores_consola}
   * - [html_errores()]{@link Nucleo.Objeto.html_errores}
   * - [json_errores()]{@link Nucleo.Objeto.json_errores}
   *
   * Configuración relacionada:
	 * - Para activar o desactivar la recoleccion de forma predeterminada (tambien puede hacerse dinamicamente con los metodos relacionados de mas abajo)
   *     - [Conf.ACTIVAR_ERRORES]{@link Configuracion.Conf#ACTIVAR_ERRORES}
	 * - Para determinar cuánta información de la pila de llamadas se incluye junto al alerta registrado. 
   *     - [Conf.ERRORES_Y_ALERTAS__PILA_DE_LLAMADAS__LIMITE]{@link Configuracion.Conf#ERRORES_Y_ALERTAS__PILA_DE_LLAMADAS__LIMITE}
	 * 
	 * Dependiendo de dicha configuración, se puede reducir el consumo de memoria impidiendo la recoleccion 
	 * o limitando la profundidad de la traza 

	 * 
   * Métodos relacionados:
   * - [activar_errores()]{@link Nucleo.Objeto.activar_errores}
   * - [desactivar_errores()]{@link Nucleo.Objeto.desactivar_errores}
   * - [activar_errores_y_alertas()]{@link Nucleo.Objeto.activar_errores_y_alertas}
   * - [desactivar_errores_y_alertas()]{@link Nucleo.Objeto.desactivar_errores_y_alertas}
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
   * @param {string} error - Mensaje de error a registrar.
   * @returns {void}
   */
  static _error(error) {
    console.log(error);
    if (this._activar_rec_errores) { // acceso a la config estática
      if (typeof error !== "string") {
        this.agregar_error(
          "El mensaje de error debe ser un String", this
        );
      } else {
        this.agregar_error(error, this);
      }
    }

  }

  /**
   * Auxiliar. Agrega un error a la lista interna de errores.
   *
   * Con el error se guarda también la 'fecha', el 'mensaje', 
   * la 'clase' que generó el error y la 'traza' (stack trace).
   *
   * @param {string} error - Mensaje de error a registrar.
   * @returns {void}
   * @see Objeto._error
   */
  static agregar_error(error) {
    // Inicialización perezosa
    if (this._errores == null) {
      this._errores = [];
    }
    const ahora = new Date();

    // Capturar pila de llamadas (sin incluir esta función misma)
    const stack = new Error().stack
      ?.split("\n")
      .slice(3, this._limite_pila_de_llamadas_errores) // saltar las 2 primeras líneas irrelevantes
      .map(l => l.trim());
    this._errores[this._contador_errores] = {
      fecha: ahora.toISOString(),
      mensaje: error,
      pila: stack
    };

    this._contador_errores++;
    console.log(this._errores);
  }
  /**
   * Imprime en la consola del navegador todos los errores registrados
   * ([Interface Errores]{@link Nucleo.Interfaces.Errores}).
   *
   * Este metodo pertenece a las interfaces:
	 * - [Interfaz Errores]{@link Nucleo.Interfaces.Errores}
	 * - [Interfaz ErroresYAlertas]{@link Nucleo.Interfaces.ErroresYAlertas}
   * 
   * Este método muestra todos los mensajes de error que fueron agregados
   * con llamadas a {@link Nucleo.Objeto._error _error()}, al sistema 
   * centralizado, junto con la pila de llamadas, permitiendo al programador
   * diagnosticar y depurar más fácilmente el origen de los problemas.
   * 
   * A diferencia de {@link Nucleo.Objeto.imprimir_errores imprimir_errores()},
   * este método está especialmente pensado para mostrar los errores
   * directamente en la consola del navegador en un formato más legible.
   *
   * La lista de errores puede visualizarse usando también:
   * - [imprimir_errores()]{@link Nucleo.Objeto.imprimir_errores}
   * - [html_errores()]{@link Nucleo.Objeto.html_errores}
   * - [json_errores()]{@link Nucleo.Objeto.json_errores}
   *
   * Configuración relacionada:
	 * - Para activar o desactivar la recoleccion de forma predeterminada (tambien puede hacerse dinamicamente con los metodos relacionados de mas abajo)
   *     - [Conf.ACTIVAR_ERRORES]{@link Configuracion.Conf#ACTIVAR_ERRORES}
	 * - Para determinar cuánta información de la pila de llamadas se incluye junto al alerta registrado. 
   *     - [Conf.ERRORES_Y_ALERTAS__PILA_DE_LLAMADAS__LIMITE]{@link Configuracion.Conf#ERRORES_Y_ALERTAS__PILA_DE_LLAMADAS__LIMITE}
	 * 
	 * Dependiendo de dicha configuración, se puede reducir el consumo de memoria impidiendo la recoleccion 
	 * o limitando la profundidad de la traza 

   *
   * Métodos relacionados:
   * - [_error]{@link Nucleo.Objeto._error}
   * - [activar_errores()]{@link Nucleo.Objeto.activar_errores}
   * - [desactivar_errores()]{@link Nucleo.Objeto.desactivar_errores}
   * - [activar_errores_y_alertas()]{@link Nucleo.Objeto.activar_errores_y_alertas}
   * - [desactivar_errores_y_alertas()]{@link Nucleo.Objeto.desactivar_errores_y_alertas}
   *
   * @example
   * export class MiClase extends Objeto {
   *   una_funcion() {
   *      if (...) {
   *         MiClase._error("Error desde MiClase");
   *         return false;
   *      }
   *      return true;
   *   }
   * }
   * 
   * const miObjeto = new MiClase();
   * if (!miObjeto.una_funcion()) {
   *   // ✅ Imprime los errores en la consola
   *   MiClase.imprimir_errores_consola();
   * }
   *
   * @returns {void} No devuelve ningún valor.
   */
  static imprimir_errores_consola() {
    if (!this._errores || this._errores.length === 0) {
      console.log("(No hay errores registrados)");
      return;
    }

    console.log("===== ERRORES =====");

    for (const error of this._errores) {
      const pila = error.pila || [];
      const cant = pila.length;
      const ini = 0; // en JS no necesitamos saltar niveles "irrelevantes" como en PHP

      // Origen: primera línea significativa de la pila
      const origen = pila[ini] ?? "(desconocido)";
      const firma_origen = Objeto._linea_stack(origen);

      console.log(`[${error.fecha}] ${error.mensaje}`);
      if (firma_origen) {
        console.log(`  Origen: ${firma_origen}`);
      }

      // Resto de la pila
      if (ini+1<cant){
        console.log("  Pila de llamadas:");
      }
      for (let i = ini + 1; i < cant; i++) {
        const nivel = pila[i];
        const firma = this._linea_stack(nivel);
        console.log(`   → ${firma}`);
      }

      console.log("------------------------");
    }
  }

  /**
   * Imprime en consola la lista de errores registrados previamente ([Interface Errores]{@link Nucleo.Interfaces.Errores}).
   *
   * Este metodo pertenece a las interfaces:
	 * - [Interfaz Errores]{@link Nucleo.Interfaces.Errores}
	 * - [Interfaz ErroresYAlertas]{@link Nucleo.Interfaces.ErroresYAlertas}
   * 
   * Este método muestra todos los mensajes de error que fueron agregados
   * con llamadas a {@link Nucleo.Objeto._error _error()}, al sistema 
   * centralizado, junto con la pila de llamadas, permitiendo al programador
   * diagnosticar y depurar más fácilmente el origen de los problemas.
   *
   * La lista de errores puede visualizarse usando también:
   * - [imprimir_errores_consola()]{@link Nucleo.Objeto.imprimir_errores_consola}
   * - [html_errores()]{@link Nucleo.Objeto.html_errores}
   * - [json_errores()]{@link Nucleo.Objeto.json_errores}
   *
   * Configuración relacionada:
	 * - Para activar o desactivar la recoleccion de forma predeterminada (tambien puede hacerse dinamicamente con los metodos relacionados de mas abajo)
   *     - [Conf.ACTIVAR_ERRORES]{@link Configuracion.Conf#ACTIVAR_ERRORES}
	 * - Para determinar cuánta información de la pila de llamadas se incluye junto al alerta registrado. 
   *     - [Conf.ERRORES_Y_ALERTAS__PILA_DE_LLAMADAS__LIMITE]{@link Configuracion.Conf#ERRORES_Y_ALERTAS__PILA_DE_LLAMADAS__LIMITE}
	 * 
	 * Dependiendo de dicha configuración, se puede reducir el consumo de memoria impidiendo la recoleccion 
	 * o limitando la profundidad de la traza 

   *
   * Métodos relacionados:
   * - [_error]{@link Nucleo.Objeto._error}
   * - [activar_errores()]{@link Nucleo.Objeto.activar_errores}
   * - [desactivar_errores()]{@link Nucleo.Objeto.desactivar_errores}
   * - [activar_errores_y_alertas()]{@link Nucleo.Objeto.activar_errores_y_alertas}
   * - [desactivar_errores_y_alertas()]{@link Nucleo.Objeto.desactivar_errores_y_alertas}
   *
   * @example
   * export class MiClase extends Objeto { //Objeto implementa la interfaz Errores
   *   una_funcion() {
   *      if (...) { // Se produjo un error
   *         MiClase._error("Error desde MiClase");
   *         return false;
   *      }
   *      return true;
   *   }
   * }
   * 
   * const miObjeto = new MiClase();
   * if (!miObjeto.una_funcion()) {
   *   // ✅ Imprimir todos los errores registrados hasta el momento
   *   MiClase.imprimir_errores();
   * }
   *
   * @returns {void} No devuelve ningún valor.
   */
  static imprimir_errores() {
    if (!this._errores || this._errores.length === 0) {
      console.warn("(No hay errores registrados)");
      return;
    }

    // Buscar contenedor o crearlo
    let contenedor = document.getElementById("errores-log");
    if (!contenedor) {
      contenedor = document.createElement("div");
      contenedor.id = "errores-log";
      contenedor.style.cssText = `
        background:#fee;
        color:#900;
        padding:1em;
        margin:1em 0;
        border:1px solid #c00;
        font-family: monospace;
        white-space: pre-wrap;
      `;
      document.body.appendChild(contenedor);
    }

    // Limpiar antes de escribir
    contenedor.innerHTML = "<h3>===== ERRORES =====</h3>";

    for (const error of this._errores) {
      const pila = error.pila || [];
      const cant = pila.length;
      const ini = 0; // no necesitamos saltar niveles en JS

      // Origen: primera línea significativa
      const origen = pila[ini] ?? "(desconocido)";
      const firma_origen = this._linea_stack(origen);

      // Construir bloque de error
      let html = `<div style="margin-bottom:1em;">`;
      html += `<strong>[${error.fecha}] ${error.mensaje}</strong><br/>`;

      if (firma_origen) {
        html += `<em>Origen:</em> ${firma_origen}<br/>`;
      }
      if (ini+1<cant){
        html += `<em>Pila de llamadas:</em><br/>`;
      }
      for (let i = ini + 1; i < cant; i++) {
        const nivel = pila[i];
        const firma = this._linea_stack(nivel);
        html += `&nbsp;&nbsp;→ ${firma}<br/>`;
      }

      html += `</div>`;

      // Agregar al contenedor
      contenedor.innerHTML += html;
    }
  }
  /**
   * Genera y devuelve una cadena HTML que representa todos los errores
   * registrados ([Interface Errores]{@link Nucleo.Interfaces.Errores}).
   *
   * Este metodo pertenece a las interfaces:
	 * - [Interfaz Errores]{@link Nucleo.Interfaces.Errores}
	 * - [Interfaz ErroresYAlertas]{@link Nucleo.Interfaces.ErroresYAlertas}
   * 
   * Este método devuelve todos los mensajes de error que fueron agregados
   * con llamadas a {@link Nucleo.Objeto._error _error()}, al sistema 
   * centralizado, junto con la pila de llamadas, permitiendo al programador
   * diagnosticar y depurar más fácilmente el origen de los problemas.
   * 
   * A diferencia de {@link Nucleo.Objeto.imprimir_errores imprimir_errores()}
   * y {@link Nucleo.Objeto.imprimir_errores_consola imprimir_errores_consola()},
   * este método no imprime directamente los errores, sino que devuelve
   * un bloque HTML listo para insertarse en el DOM y mostrarse al usuario.
   *
   * La lista de errores puede visualizarse usando también:
   * - [imprimir_errores()]{@link Nucleo.Objeto.imprimir_errores}
   * - [imprimir_errores_consola()]{@link Nucleo.Objeto.imprimir_errores_consola}
   * - [json_errores()]{@link Nucleo.Objeto.json_errores}
   *
   * Configuración relacionada:
	 * - Para activar o desactivar la recoleccion de forma predeterminada (tambien puede hacerse dinamicamente con los metodos relacionados de mas abajo)
   *     - [Conf.ACTIVAR_ERRORES]{@link Configuracion.Conf#ACTIVAR_ERRORES}
	 * - Para determinar cuánta información de la pila de llamadas se incluye junto al alerta registrado. 
   *     - [Conf.ERRORES_Y_ALERTAS__PILA_DE_LLAMADAS__LIMITE]{@link Configuracion.Conf#ERRORES_Y_ALERTAS__PILA_DE_LLAMADAS__LIMITE}
	 * 
	 * Dependiendo de dicha configuración, se puede reducir el consumo de memoria impidiendo la recoleccion 
	 * o limitando la profundidad de la traza 

   *
   * Métodos relacionados:
   * - [_error]{@link Nucleo.Objeto._error}
   * - [activar_errores()]{@link Nucleo.Objeto.activar_errores}
   * - [desactivar_errores()]{@link Nucleo.Objeto.desactivar_errores}
   * - [activar_errores_y_alertas()]{@link Nucleo.Objeto.activar_errores_y_alertas}
   * - [desactivar_errores_y_alertas()]{@link Nucleo.Objeto.desactivar_errores_y_alertas}
   *
   * @example
   * export class MiClase extends Objeto {
   *   una_funcion() {
   *      if (...) {
   *         MiClase._error("Error desde MiClase");
   *         return false;
   *      }
   *      return true;
   *   }
   * }
   * 
   * const miObjeto = new MiClase();
   * if (!miObjeto.una_funcion()) {
   *   // ✅ Obtiene el HTML de los errores y lo inserta en el DOM
   *   document.body.innerHTML += MiClase.html_errores();
   * }
   *
   * @returns {string} HTML con la representación de todos los errores registrados.
   */
  static html_errores() {
    if (!this._errores || this._errores.length === 0) {
      return "<p><i>No hay errores registrados.</i></p>";
    }

    let html = "<ul>";

    for (const error of this._errores) {
      const pila = error.pila || [];
      const cant = pila.length;
      const ini = 0; // misma lógica que en consola

      // Origen: primera línea significativa
      const origen = pila[ini] ?? "(desconocido)";
      const firmaOrigen = Objeto._linea_stack(origen);

      html += `<li><strong>[${error.fecha}] ${error.mensaje}</strong>`;
      if (firmaOrigen) {
        html += `<br>Origen: ${firmaOrigen}`;
      }

      // Pila de llamadas
      if (ini+1<cant){
        html += "<br>Pila de llamadas:<ul>";
      }
      for (let i = ini + 1; i < cant; i++) {
        const nivel = pila[i];
        const firma = Objeto._linea_stack(nivel);
        html += `<li>→ ${firma}</li>`;
      }
      html += "</ul></li><br>";
    }

    html += "</ul>";
    return html;
  }
  /**
   * Devuelve la lista de errores registrados en formato JSON.
   *
   * Este metodo pertenece a las interfaces:
	 * - [Interfaz Errores]{@link Nucleo.Interfaces.Errores}
	 * - [Interfaz ErroresYAlertas]{@link Nucleo.Interfaces.ErroresYAlertas}
   * 
   * Este método devuelve todos los mensajes de error que fueron agregados
   * con llamadas a {@link Nucleo.Objeto._error _error()}, al sistema 
   * centralizado, junto con la pila de llamadas, permitiendo al programador
   * diagnosticar y depurar más fácilmente el origen de los problemas.
   * 
   * A diferencia de {@link Nucleo.Objeto.imprimir_errores imprimir_errores()}
   * y {@link Nucleo.Objeto.imprimir_errores_consola imprimir_errores_consola()},
   * este método no imprime directamente los errores, sino que devuelve
   * un bloque JSON
   * Esto permite transportar o almacenar la
   * información de errores de manera estructurada.
   *
   * La lista de errores tambien puede visualizarse usando métodos como:
   * - [imprimir_errores()]{@link Nucleo.Objeto.imprimir_errores}
   * - [imprimir_errores_consola()]{@link Nucleo.Objeto.imprimir_errores_consola}
   * - [html_errores()]{@link Nucleo.Objeto.html_errores}
   *
   * Configuración relacionada:
	 * - Para activar o desactivar la recoleccion de forma predeterminada (tambien puede hacerse dinamicamente con los metodos relacionados de mas abajo)
   *     - [Conf.ACTIVAR_ERRORES]{@link Configuracion.Conf#ACTIVAR_ERRORES}
	 * - Para determinar cuánta información de la pila de llamadas se incluye junto al alerta registrado. 
   *     - [Conf.ERRORES_Y_ALERTAS__PILA_DE_LLAMADAS__LIMITE]{@link Configuracion.Conf#ERRORES_Y_ALERTAS__PILA_DE_LLAMADAS__LIMITE}
	 * 
	 * Dependiendo de dicha configuración, se puede reducir el consumo de memoria impidiendo la recoleccion 
	 * o limitando la profundidad de la traza 

   *
   * Métodos relacionados:
   * - [_error]{@link Nucleo.Objeto._error}
   * - [activar_errores()]{@link Nucleo.Objeto.activar_errores}
   * - [desactivar_errores()]{@link Nucleo.Objeto.desactivar_errores}
   * - [activar_errores_y_alertas()]{@link Nucleo.Objeto.activar_errores_y_alertas}
   * - [desactivar_errores_y_alertas()]{@link Nucleo.Objeto.desactivar_errores_y_alertas}
   *
   * @example
   *export class MiClase extends Objeto { // Objeto implementa la interfaz Errores
  * ...
  * const miObjeto = new MiClase();
  * ...
  * if (!miObjeto.una_funcion()) {
  *   console.log(MiClase.json_errores()); // Devuelve un JSON con todos los errores
  * }
  *
  * @returns {string} JSON con la lista de errores registrados.
  */
  static json_errores() {
    if (!this._errores || this._errores.length === 0) {
      return {
        mensaje: "No hay errores registrados",
        errores: []
      };
    }

    const erroresJSON = [];

    for (const error of this._errores) {
      const pila = error.pila || [];
      const ini = 0; // misma lógica que en html_errores

      // Origen: primera línea significativa
      const origen = pila[ini] ?? "(desconocido)";
      const firmaOrigen = Objeto._linea_stack(origen);

      // Pila de llamadas
      const pilaLlamadas = [];
      for (let i = ini + 1; i < pila.length; i++) {
        const firma = Objeto._linea_stack(pila[i]);
        pilaLlamadas.push(firma);
      }

      erroresJSON.push({
        fecha: error.fecha,
        mensaje: error.mensaje,
        origen: firmaOrigen,
        pila: pilaLlamadas
      });
    }

    return {
      mensaje: `${this._errores.length} error(es) registrados`,
      errores: erroresJSON
    };
  }

  /**
   * Auxiliar para limpiar una línea del stack trace.
   * 
   * 
   * Ejemplo de línea original:
   *   "at MiClase.miMetodo (/ruta/archivo.js:10:15)"
   *
   * La devolvemos tal cual, pero recortada y sin "at ".
   *
   * @param {string} linea - Línea cruda de la traza de error.
   * @returns {string} Línea formateada para mostrar en consola.
   * @protected
   */
  static _linea_stack(linea) {
    if (typeof linea !== "string") return "(línea desconocida)";
    return linea.replace(/^at\s+/, "").trim();
  }
  
  ////////////////////////////////////////////////////////////////////////////////////////
  //// INTERFAZ ALERTAS (ERRORESYALERTAS)
  ////////////////////////////////////////////////////////////////////////////////////////
  /**
   * Lista de alertas ocurridos.
   * @type {Array<{fecha: string, mensaje: string, pila: any[]}>}
   */
  static _alertas = [];

  /**
   * Contador de alertas acumulados.
   * @type {number}
   */
  static _contador_alertas = 0;

  /**
   * Habilita o deshabilita el registro de alertas.
   * @type {boolean}
   */
  static _activar_rec_alertas = Conf.ACTIVAR_ALERTAS;

  /**
   * Profundidad máxima de la pila de alertas.
   * @type {number}
   */
  static _limite_pila_de_llamadas_alertas = Conf.ERRORES_Y_ALERTAS__PILA_DE_LLAMADAS__LIMITE;

  /**
   * Activa la recolección de alertas del sistema ([Interface Alertas]{@link Nucleo.Interfaces.Alertas})
   * 
   * Este metodo pertenece a las interfaces:
	 * - [Interfaz Alertas]{@link Nucleo.Interfaces.Alertas}
	 * - [Interfaz ErroresYAlertas]{@link Nucleo.Interfaces.ErroresYAlertas}
   * 
   * Esta función permite habilitar dinamicamente la captura y almacenamiento de alertas
   * dentro del sistema centralizado, independientemente del valor inicial configurado en
   * la constante [Conf.ACTIVAR_ALERTAS]{@link Configuracion.Conf#ACTIVAR_ALERTAS}. Permite
   * sobrescribir temporalmente la configuración predeterminada para activar la recopilación
   * de mensajes de alerta durante la ejecución. 
   * 
   * Una vez activada, cualquier alerta registrado mediante `[_alerta()]{@link Nucleo.Objeto._alerta}` 
   * se almacenará y podrá ser consultado posteriormente mediante los métodos de visualización.
   *
   * Para volver a desactivar la recoleccion de alertas puede usarse [desactivar_alertas()]{@link Nucleo.Objeto.desactivar_alertas}
   * 
   * La lista de alertas puede luego visualizarse usando métodos como:
   * - [imprimir_alertas()]{@link Nucleo.Objeto.imprimir_alertas}
   * - [imprimir_alertas_consola()]{@link Nucleo.Objeto.imprimir_alertas_consola}
   * - [html_alertas()]{@link Nucleo.Objeto.html_alertas}
   * - [json_alertas()]{@link Nucleo.Objeto.json_alertas}
   *
   * Configuración relacionada:
	 * - Para activar o desactivar la recoleccion de forma predeterminada (tambien puede hacerse dinamicamente con los metodos relacionados de mas abajo)
   *     - [Conf.ACTIVAR_ALERTAS]{@link Configuracion.Conf#ACTIVAR_ALERTAS}
	 * - Para determinar cuánta información de la pila de llamadas se incluye junto al error registrado.     		
   *     - [Conf.ERRORES_Y_ALERTAS__PILA_DE_LLAMADAS__LIMITE]{@link Configuracion.Conf#ERRORES_Y_ALERTAS__PILA_DE_LLAMADAS__LIMITE}
   * 
	 * Dependiendo de dicha configuración, se puede reducir el consumo de memoria impidiendo la recoleccion 
	 * o limitando la profundidad de la traza  
   * 
   * Métodos relacionados:
   * - [desactivar_alertas()]{@link Nucleo.Objeto.desactivar_alertas}
   * - [activar_errores_y_alertas()]{@link Nucleo.Objeto.activar_errores_y_alertas}
   * - [desactivar_errores_y_alertas()]{@link Nucleo.Objeto.desactivar_errores_y_alertas}
   *
   * @example
   * ...
   * // Habilitar el registro de alertas
   * Objeto.activar_alertas();
   * ...
   * @returns {void}
   */
  static activar_alertas() {
    Objeto._activar_rec_alertas = true;
  }

  /**
   * Desactiva la recolección de alertas del sistema ([Interface Alertas]{@link Nucleo.Interfaces.Alertas}).
   *
   * Este metodo pertenece a las interfaces:
   * - [Interfaz Alertas]{@link Nucleo.Interfaces.Alertas}
   * - [Interfaz ErroresYAlertas]{@link Nucleo.Interfaces.ErroresYAlertas}
   *
	 * Este método deshabilita dinámicamente la recolección de errores en el sistema, incluso si la constante 
	 * [Conf.ACTIVAR_ERRORES]{@link Configuracion.Conf#ACTIVAR_ALERTAS} 
	 * está establecida en true. De esta forma, permite sobrescribir temporalmente el comportamiento 
	 * predeterminado para detener la recopilación de mensajes de error.
	 * 
	 * De esta manera se impide que los errores registrados mediante 
   * `[_alerta()]{@link Nucleo.Objeto._alerta}` se agreguen a la lista centralizada. 
	 * 
	 * Los errores que ocurran mientras el sistema esté
	 * desactivado no serán almacenados ni mostrados por los métodos de visualización.
   *
   * Para volver a activar la recoleccion de alertas puede usarse [activar_alertas()]{@link Nucleo.Objeto.activar_alertas}
   * 
   * La lista de alertas puede luego visualizarse usando métodos como:
   * - [imprimir_alertas()]{@link Nucleo.Objeto.imprimir_alertas}
   * - [imprimir_alertas_consola()]{@link Nucleo.Objeto.imprimir_alertas_consola}
   * - [html_alertas()]{@link Nucleo.Objeto.html_alertas}
   * - [html_alertas()]{@link Nucleo.Objeto.json_alertas}
   * 
   * Configuración relacionada:
	 * - Para activar o desactivar la recoleccion de forma predeterminada (tambien puede hacerse dinamicamente con los metodos relacionados de mas abajo)
   *     - [Conf.ACTIVAR_ALERTAS]{@link Configuracion.Conf#ACTIVAR_ALERTAS}
	 * - Para determinar cuánta información de la pila de llamadas se incluye junto al error registrado.     		
   *     - [Conf.ERRORES_Y_ALERTAS__PILA_DE_LLAMADAS__LIMITE]{@link Configuracion.Conf#ERRORES_Y_ALERTAS__PILA_DE_LLAMADAS__LIMITE}
   * 
	 * Dependiendo de dicha configuración, se puede reducir el consumo de memoria impidiendo la recoleccion 
	 * o limitando la profundidad de la traza  
   * 
   * Métodos relacionados:
   * - [activar_alertas()]{@link Nucleo.Objeto.activar_alertas}
   * - [activar_errores_y_alertas()]{@link Nucleo.Objeto.activar_errores_y_alertas}
   * - [desactivar_errores_y_alertas()]{@link Nucleo.Objeto.desactivar_errores_y_alertas}
   *
   * @example
   * ...
   * // Deshabilitar el registro de alertas
   * Objeto.desactivar_alertas();
   * ...
   * @returns {void}
   */
  static desactivar_alertas() {
    Objeto._activar_rec_alertas = false;
  }

  /**
   * Registra un alerta si el sistema de alertas está activado ([Interface Alertas]{@link Nucleo.Interfaces.Alertas}).
   * 
   * Este metodo pertenece a las interfaces:
	 * - [Interfaz Alertas]{@link Nucleo.Interfaces.Alertas}
	 * - [Interfaz ErroresYAlertas]{@link Nucleo.Interfaces.ErroresYAlertas}
   * 
   * Esta función recibe un mensaje (un string) que describe información relevante
   * para que el programador ubique rápidamente el alerta ocurrido y pueda corregirlo.
   * Cuando se invoca, agrega el mensaje a la lista/pila de alertas centralizada.
   *
   * La lista de alertas puede luego visualizarse usando métodos como:
   * - [imprimir_alertas()]{@link Nucleo.Objeto.imprimir_alertas}
   * - [imprimir_alertas_consola()]{@link Nucleo.Objeto.imprimir_alertas_consola}
   * - [html_alertas()]{@link Nucleo.Objeto.html_alertas}
   * - [json_alertas()]{@link Nucleo.Objeto.json_alertas}
   *
   * Configuración relacionada:
	 * - Para activar o desactivar la recoleccion de forma predeterminada (tambien puede hacerse dinamicamente con los metodos relacionados de mas abajo)
   *     - [Conf.ACTIVAR_ALERTAS]{@link Configuracion.Conf#ACTIVAR_ALERTAS}
	 * - Para determinar cuánta información de la pila de llamadas se incluye junto al error registrado.     		
   *     - [Conf.ERRORES_Y_ALERTAS__PILA_DE_LLAMADAS__LIMITE]{@link Configuracion.Conf#ERRORES_Y_ALERTAS__PILA_DE_LLAMADAS__LIMITE}
   * 
	 * Dependiendo de dicha configuración, se puede reducir el consumo de memoria impidiendo la recoleccion 
	 * o limitando la profundidad de la traza  
   * 
   * Métodos relacionados:
   * - [activar_alertas()]{@link Nucleo.Objeto.activar_alertas}
   * - [desactivar_alertas()]{@link Nucleo.Objeto.desactivar_alertas}
   * - [activar_errores_y_alertas()]{@link Nucleo.Objeto.activar_errores_y_alertas}
   * - [desactivar_errores_y_alertas()]{@link Nucleo.Objeto.desactivar_errores_y_alertas}
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
   * @param {string} alerta - Mensaje de alerta a registrar.
   * @returns {void}
   */
  static _alerta(alerta) {
    console.log(alerta);
    if (this._activar_rec_alertas) { // acceso a la config estática
      if (typeof alerta !== "string") {
        this.agregar_alerta(
          "El mensaje de alerta debe ser un String", this
        );
      } else {
        this.agregar_alerta(alerta, this);
      }
    }
  }

  /**
   * Auxiliar. Agrega un alerta a la lista interna de alertas.
   *
   * Con el alerta se guarda también la 'fecha', el 'mensaje', 
   * la 'clase' que generó el alerta y la 'traza' (stack trace).
   *
   * @param {string} alerta - Mensaje de alerta a registrar.
   * @returns {void}
   * @see Objeto._alerta
   */
  static agregar_alerta(alerta) {
    // Inicialización perezosa
    if (this._alertas == null) {
      this._alertas = [];
    }
    const ahora = new Date();

    // Capturar pila de llamadas (sin incluir esta función misma)
    const stack = new Error().stack
      ?.split("\n")
      .slice(3, this._limite_pila_de_llamadas_alertas) // saltar las 3 primeras líneas irrelevantes
      .map(l => l.trim());
    this._alertas[this._contador_alertas] = {
      fecha: ahora.toISOString(),
      mensaje: alerta,
      pila: stack
    };

    this._contador_alertas++;
    console.log(this._alertas);
  }
  /**
   * Imprime en la consola del navegador todos los alertas registrados
   * ([Interface Alertas]{@link Nucleo.Interfaces.Alertas}).
   *
   * Este metodo pertenece a las interfaces:
	 * - [Interfaz Alertas]{@link Nucleo.Interfaces.Alertas}
	 * - [Interfaz ErroresYAlertas]{@link Nucleo.Interfaces.ErroresYAlertas}
   * 
   * Este método muestra todos los mensajes de alerta que fueron agregados
   * con llamadas a {@link Nucleo.Objeto._alerta _alerta()}, al sistema 
   * centralizado, junto con la pila de llamadas, permitiendo al programador
   * diagnosticar y depurar más fácilmente el origen de los problemas.
   * 
   * A diferencia de {@link Nucleo.Objeto.imprimir_alertas imprimir_alertas()},
   * este método está especialmente pensado para mostrar los alertas
   * directamente en la consola del navegador en un formato más legible.
   *
   * La lista de alertas puede visualizarse usando también:
   * - [imprimir_alertas()]{@link Nucleo.Objeto.imprimir_alertas}
   * - [html_alertas()]{@link Nucleo.Objeto.html_alertas}
   * - [json_alertas()]{@link Nucleo.Objeto.json_alertas}
   *
   * Configuración relacionada:
	 * - Para activar o desactivar la recoleccion de forma predeterminada (tambien puede hacerse dinamicamente con los metodos relacionados de mas abajo)
   *     - [Conf.ACTIVAR_ALERTAS]{@link Configuracion.Conf#ACTIVAR_ALERTAS}
	 * - Para determinar cuánta información de la pila de llamadas se incluye junto al error registrado.     		
   *     - [Conf.ERRORES_Y_ALERTAS__PILA_DE_LLAMADAS__LIMITE]{@link Configuracion.Conf#ERRORES_Y_ALERTAS__PILA_DE_LLAMADAS__LIMITE}
   * 
	 * Dependiendo de dicha configuración, se puede reducir el consumo de memoria impidiendo la recoleccion 
	 * o limitando la profundidad de la traza  
   *
   * Métodos relacionados:
   * - [_alerta]{@link Nucleo.Objeto._alerta}
   * - [activar_alertas()]{@link Nucleo.Objeto.activar_alertas}
   * - [desactivar_alertas()]{@link Nucleo.Objeto.desactivar_alertas}
   * - [activar_errores_y_alertas()]{@link Nucleo.Objeto.activar_errores_y_alertas}
   * - [desactivar_errores_y_alertas()]{@link Nucleo.Objeto.desactivar_errores_y_alertas}
   *
   * @example
   * export class MiClase extends Objeto {
   *   una_funcion() {
   *      if (...) {
   *         MiClase._alerta("Alerta desde MiClase");
   *         return false;
   *      }
   *      return true;
   *   }
   * }
   * 
   * const miObjeto = new MiClase();
   * if (!miObjeto.una_funcion()) {
   *   // ✅ Imprime los alertas en la consola
   *   MiClase.imprimir_alertas_consola();
   * }
   *
   * @returns {void} No devuelve ningún valor.
   */
  static imprimir_alertas_consola() {
    if (!this._alertas || this._alertas.length === 0) {
      console.log("(No hay alertas registrados)");
      return;
    }

    console.log("===== ALERTAS =====");

    for (const alerta of this._alertas) {
      const pila = alerta.pila || [];
      const cant = pila.length;
      const ini = 0; // en JS no necesitamos saltar niveles "irrelevantes" como en PHP

      // Origen: primera línea significativa de la pila
      const origen = pila[ini] ?? "(desconocido)";
      const firma_origen = Objeto._linea_stack(origen);

      console.log(`[${alerta.fecha}] ${alerta.mensaje}`);
      if (firma_origen) {
        console.log(`  Origen: ${firma_origen}`);
      }

      // Resto de la pila
      if (ini+1<cant){
        console.log("  Pila de llamadas:");
      }
      for (let i = ini + 1; i < cant; i++) {
        const nivel = pila[i];
        const firma = this._linea_stack(nivel);
        console.log(`   → ${firma}`);
      }

      console.log("------------------------");
    }
  }

  /**
   * Imprime en consola la lista de alertas registrados previamente ([Interface Alertas]{@link Nucleo.Interfaces.Alertas}).
   *
   * Este metodo pertenece a las interfaces:
	 * - [Interfaz Alertas]{@link Nucleo.Interfaces.Alertas}
	 * - [Interfaz ErroresYAlertas]{@link Nucleo.Interfaces.ErroresYAlertas}
   * 
   * Este método muestra todos los mensajes de alerta que fueron agregados
   * con llamadas a {@link Nucleo.Objeto._alerta _alerta()}, al sistema 
   * centralizado, junto con la pila de llamadas, permitiendo al programador
   * diagnosticar y depurar más fácilmente el origen de los problemas.
   *
   * La lista de alertas puede visualizarse usando también:
   * - [imprimir_alertas_consola()]{@link Nucleo.Objeto.imprimir_alertas_consola}
   * - [html_alertas()]{@link Nucleo.Objeto.html_alertas}
   * - [json_alertas()]{@link Nucleo.Objeto.json_alertas}
   *
   * Configuración relacionada:
	 * - Para activar o desactivar la recoleccion de forma predeterminada (tambien puede hacerse dinamicamente con los metodos relacionados de mas abajo)
   *     - [Conf.ACTIVAR_ALERTAS]{@link Configuracion.Conf#ACTIVAR_ALERTAS}
	 * - Para determinar cuánta información de la pila de llamadas se incluye junto al error registrado.     		
   *     - [Conf.ERRORES_Y_ALERTAS__PILA_DE_LLAMADAS__LIMITE]{@link Configuracion.Conf#ERRORES_Y_ALERTAS__PILA_DE_LLAMADAS__LIMITE}
   * 
	 * Dependiendo de dicha configuración, se puede reducir el consumo de memoria impidiendo la recoleccion 
	 * o limitando la profundidad de la traza  
   *
   * Métodos relacionados:
   * - [_alerta]{@link Nucleo.Objeto._alerta}
   * - [activar_alertas()]{@link Nucleo.Objeto.activar_alertas}
   * - [desactivar_alertas()]{@link Nucleo.Objeto.desactivar_alertas}
   * - [activar_errores_y_alertas()]{@link Nucleo.Objeto.activar_errores_y_alertas}
   * - [desactivar_errores_y_alertas()]{@link Nucleo.Objeto.desactivar_errores_y_alertas}
   *
   * @example
   * export class MiClase extends Objeto { //Objeto implementa la interfaz Alertas
   *   una_funcion() {
   *      if (...) { // Se produjo un alerta
   *         MiClase._alerta("Alerta desde MiClase");
   *         return false;
   *      }
   *      return true;
   *   }
   * }
   * 
   * const miObjeto = new MiClase();
   * if (!miObjeto.una_funcion()) {
   *   // ✅ Imprimir todos los alertas registrados hasta el momento
   *   MiClase.imprimir_alertas();
   * }
   *
   * @returns {void} No devuelve ningún valor.
   */
  static imprimir_alertas() {
    if (!this._alertas || this._alertas.length === 0) {
      console.warn("(No hay alertas registrados)");
      return;
    }

    // Buscar contenedor o crearlo
    let contenedor = document.getElementById("alertas-log");
    if (!contenedor) {
      contenedor = document.createElement("div");
      contenedor.id = "alertas-log";
      contenedor.style.cssText = `
        background:#fee;
        color:#900;
        padding:1em;
        margin:1em 0;
        border:1px solid #c00;
        font-family: monospace;
        white-space: pre-wrap;
      `;
      document.body.appendChild(contenedor);
    }

    // Limpiar antes de escribir
    contenedor.innerHTML = "<h3>===== ALERTAS =====</h3>";

    for (const alerta of this._alertas) {
      const pila = alerta.pila || [];
      const cant = pila.length;
      const ini = 0; // no necesitamos saltar niveles en JS

      // Origen: primera línea significativa
      const origen = pila[ini] ?? "(desconocido)";
      const firma_origen = this._linea_stack(origen);

      // Construir bloque de alerta
      let html = `<div style="margin-bottom:1em;">`;
      html += `<strong>[${alerta.fecha}] ${alerta.mensaje}</strong><br/>`;

      if (firma_origen) {
        html += `<em>Origen:</em> ${firma_origen}<br/>`;
      }
      if (ini+1<cant){
        html += `<em>Pila de llamadas:</em><br/>`;
      }
      for (let i = ini + 1; i < cant; i++) {
        const nivel = pila[i];
        const firma = this._linea_stack(nivel);
        html += `&nbsp;&nbsp;→ ${firma}<br/>`;
      }

      html += `</div>`;

      // Agregar al contenedor
      contenedor.innerHTML += html;
    }
  }
  /**
   * Genera y devuelve una cadena HTML que representa todos los alertas
   * registrados ([Interface Alertas]{@link Nucleo.Interfaces.Alertas}).
   *
   * Este metodo pertenece a las interfaces:
	 * - [Interfaz Alertas]{@link Nucleo.Interfaces.Alertas}
	 * - [Interfaz ErroresYAlertas]{@link Nucleo.Interfaces.ErroresYAlertas}
   * 
   * Este método devuelve todos los mensajes de alerta que fueron agregados
   * con llamadas a {@link Nucleo.Objeto._alerta _alerta()}, al sistema 
   * centralizado, junto con la pila de llamadas, permitiendo al programador
   * diagnosticar y depurar más fácilmente el origen de los problemas.
   * 
   * A diferencia de {@link Nucleo.Objeto.imprimir_alertas imprimir_alertas()}
   * y {@link Nucleo.Objeto.imprimir_alertas_consola imprimir_alertas_consola()},
   * este método no imprime directamente los alertas, sino que devuelve
   * un bloque HTML listo para insertarse en el DOM y mostrarse al usuario.
   *
   * La lista de alertas puede visualizarse usando también:
   * - [imprimir_alertas()]{@link Nucleo.Objeto.imprimir_alertas}
   * - [imprimir_alertas_consola()]{@link Nucleo.Objeto.imprimir_alertas_consola}
   * - [json_alertas()]{@link Nucleo.Objeto.json_alertas}
   *
   * Configuración relacionada:
	 * - Para activar o desactivar la recoleccion de forma predeterminada (tambien puede hacerse dinamicamente con los metodos relacionados de mas abajo)
   *     - [Conf.ACTIVAR_ALERTAS]{@link Configuracion.Conf#ACTIVAR_ALERTAS}
	 * - Para determinar cuánta información de la pila de llamadas se incluye junto al error registrado.     		
   *     - [Conf.ERRORES_Y_ALERTAS__PILA_DE_LLAMADAS__LIMITE]{@link Configuracion.Conf#ERRORES_Y_ALERTAS__PILA_DE_LLAMADAS__LIMITE}
   * 
	 * Dependiendo de dicha configuración, se puede reducir el consumo de memoria impidiendo la recoleccion 
	 * o limitando la profundidad de la traza  
   *
   * Métodos relacionados:
   * - [_alerta]{@link Nucleo.Objeto._alerta}
   * - [activar_alertas()]{@link Nucleo.Objeto.activar_alertas}
   * - [desactivar_alertas()]{@link Nucleo.Objeto.desactivar_alertas}
   * - [activar_errores_y_alertas()]{@link Nucleo.Objeto.activar_errores_y_alertas}
   * - [desactivar_errores_y_alertas()]{@link Nucleo.Objeto.desactivar_errores_y_alertas}
   *
   * @example
   * export class MiClase extends Objeto {
   *   una_funcion() {
   *      if (...) {
   *         MiClase._alerta("Alerta desde MiClase");
   *         return false;
   *      }
   *      return true;
   *   }
   * }
   * 
   * const miObjeto = new MiClase();
   * if (!miObjeto.una_funcion()) {
   *   // ✅ Obtiene el HTML de los alertas y lo inserta en el DOM
   *   document.body.innerHTML += MiClase.html_alertas();
   * }
   *
   * @returns {string} HTML con la representación de todos los alertas registrados.
   */
  static html_alertas() {
    if (!this._alertas || this._alertas.length === 0) {
      return "<p><i>No hay alertas registrados.</i></p>";
    }

    let html = "<ul>";

    for (const alerta of this._alertas) {
      const pila = alerta.pila || [];
      const cant = pila.length;
      const ini = 0; // misma lógica que en consola

      // Origen: primera línea significativa
      const origen = pila[ini] ?? "(desconocido)";
      const firmaOrigen = Objeto._linea_stack(origen);

      html += `<li><strong>[${alerta.fecha}] ${alerta.mensaje}</strong>`;
      if (firmaOrigen) {
        html += `<br>Origen: ${firmaOrigen}`;
      }

      // Pila de llamadas
      if (ini+1<cant){
        html += "<br>Pila de llamadas:<ul>";
      }
      for (let i = ini + 1; i < cant; i++) {
        const nivel = pila[i];
        const firma = Objeto._linea_stack(nivel);
        html += `<li>→ ${firma}</li>`;
      }
      html += "</ul></li><br>";
    }

    html += "</ul>";
    return html;
  }
  /**
   * Devuelve la lista de alertas registrados en formato JSON.
   *
   * Este metodo pertenece a las interfaces:
	 * - [Interfaz Alertas]{@link Nucleo.Interfaces.Alertas}
	 * - [Interfaz ErroresYAlertas]{@link Nucleo.Interfaces.ErroresYAlertas}
   * 
   * Este método devuelve todos los mensajes de alerta que fueron agregados
   * con llamadas a {@link Nucleo.Objeto._alerta _alerta()}, al sistema 
   * centralizado, junto con la pila de llamadas, permitiendo al programador
   * diagnosticar y depurar más fácilmente el origen de los problemas.
   * 
   * A diferencia de {@link Nucleo.Objeto.imprimir_alertas imprimir_alertas()}
   * y {@link Nucleo.Objeto.imprimir_alertas_consola imprimir_alertas_consola()},
   * este método no imprime directamente los alertas, sino que devuelve
   * un bloque JSON
   * Esto permite transportar o almacenar la
   * información de alertas de manera estructurada.
   *
   * La lista de alertas tambien puede visualizarse usando métodos como:
   * - [imprimir_alertas()]{@link Nucleo.Objeto.imprimir_alertas}
   * - [imprimir_alertas_consola()]{@link Nucleo.Objeto.imprimir_alertas_consola}
   * - [html_alertas()]{@link Nucleo.Objeto.html_alertas}
   *
   * Configuración relacionada:
	 * - Para activar o desactivar la recoleccion de forma predeterminada (tambien puede hacerse dinamicamente con los metodos relacionados de mas abajo)
   *     - [Conf.ACTIVAR_ALERTAS]{@link Configuracion.Conf#ACTIVAR_ALERTAS}
	 * - Para determinar cuánta información de la pila de llamadas se incluye junto al error registrado.     		
   *     - [Conf.ERRORES_Y_ALERTAS__PILA_DE_LLAMADAS__LIMITE]{@link Configuracion.Conf#ERRORES_Y_ALERTAS__PILA_DE_LLAMADAS__LIMITE}
   * 
	 * Dependiendo de dicha configuración, se puede reducir el consumo de memoria impidiendo la recoleccion 
	 * o limitando la profundidad de la traza  
   * 
   * Métodos relacionados:
   * - [_alerta]{@link Nucleo.Objeto._alerta}
   * - [activar_alertas()]{@link Nucleo.Objeto.activar_alertas}
   * - [desactivar_alertas()]{@link Nucleo.Objeto.desactivar_alertas}
   * - [activar_errores_y_alertas()]{@link Nucleo.Objeto.activar_errores_y_alertas}
   * - [desactivar_errores_y_alertas()]{@link Nucleo.Objeto.desactivar_errores_y_alertas}
   *
   * @example
   *export class MiClase extends Objeto { // Objeto implementa la interfaz Alertas
  * ...
  * const miObjeto = new MiClase();
  * ...
  * if (!miObjeto.una_funcion()) {
  *   console.log(MiClase.json_alertas()); // Devuelve un JSON con todos los alertas
  * }
  *
  * @returns {string} JSON con la lista de alertas registrados.
  */
  static json_alertas() {
    if (!this._alertas || this._alertas.length === 0) {
      return {
        mensaje: "No hay alertas registrados",
        alertas: []
      };
    }

    const alertasJSON = [];

    for (const alerta of this._alertas) {
      const pila = alerta.pila || [];
      const ini = 0; // misma lógica que en html_alertas

      // Origen: primera línea significativa
      const origen = pila[ini] ?? "(desconocido)";
      const firmaOrigen = Objeto._linea_stack(origen);

      // Pila de llamadas
      const pilaLlamadas = [];
      for (let i = ini + 1; i < pila.length; i++) {
        const firma = Objeto._linea_stack(pila[i]);
        pilaLlamadas.push(firma);
      }

      alertasJSON.push({
        fecha: alerta.fecha,
        mensaje: alerta.mensaje,
        origen: firmaOrigen,
        pila: pilaLlamadas
      });
    }

    return {
      mensaje: `${this._alertas.length} alerta(es) registrados`,
      alertas: alertasJSON
    };
  }

  ////////////////////////////////////////////////////////////////////////////////////////
  //// INTERFAZ ERRORESYALERTAS
  ////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Activa la recolección de errores y alertas en el sistema ([Interface ErroresYAlertas]{@link Nucleo.Interfaces.ErroresYAlertas}).
   *
   * Esta función permite habilitar dinamicamente la captura y almacenamiento de errores y de alertas
   * dentro del sistema centralizado, independientemente del valor inicial configurado en
   * las constantes [Conf.ACTIVAR_ERRORES]{@link Configuracion.Conf#ACTIVAR_ERRORES} y 
   * [Conf.ACTIVAR_ALERTAS]{@link Configuracion.Conf#ACTIVAR_ALERTAS}. Permite
   * sobrescribir temporalmente la configuración predeterminada para activar la recopilación
   * de mensajes de error y de alerta durante la ejecución. 
   * 
   * Una vez activada, cualquier error o alerta registrado 
   * mediante `[_error()]{@link Nucleo.Objeto._error}` o `[_alerta()]{@link Nucleo.Objeto._alerta}` se almacenará y podrá ser consultado posteriormente
   * mediante los métodos de visualización.
   * 
   * Para desactivar dinamicamente la recoleccion puede usarse 
   * [desactivar_errores_y_alertas()]{@link Nucleo.Objeto.desactivar_errores_y_alertas}
   * o [desactivar_errores()]{@link Nucleo.Objeto.desactivar_errores} 
   * o [desactivar_alertas()]{@link Nucleo.Objeto.desactivar_alertas}
   * para activado solo uno de los dos tipos de recoleccion
   *
   * Los errores y alertas pueden registrarse usando:
   * - [_error()]{@link Nucleo.Objeto._error}
   * - [_alerta()]{@link Nucleo.Objeto._alerta}
   * 
   * Las listas de errores y alertas pueden luego visualizarse usando métodos como:
   * - [imprimir_errores()]{@link Nucleo.Objeto.imprimir_errores}
   * - [imprimir_errores_consola()]{@link Nucleo.Objeto.imprimir_errores_consola}
   * - [html_errores()]{@link Nucleo.Objeto.html_errores}
   * - [json_errores()]{@link Nucleo.Objeto.json_errores}
   * - [imprimir_alertas()]{@link Nucleo.Objeto.imprimir_alertas}
   * - [imprimir_alertas_consola()]{@link Nucleo.Objeto.imprimir_alertas_consola}
   * - [html_alertas()]{@link Nucleo.Objeto.html_alertas}
   * - [json_alertas()]{@link Nucleo.Objeto.json_alertas}
   *
   * Configuracion relacionada: 
	 * - Para activar o desactivar la recoleccion de forma predeterminada (tambien puede hacerse dinamicamente con los metodos relacionados de mas abajo)
   *     - [Conf.ACTIVAR_ERRORES]{@link Configuracion.Conf#ACTIVAR_ERRORES}
   *     - [Conf.ACTIVAR_ALERTAS]{@link Configuracion.Conf#ACTIVAR_ALERTAS}
	 * - Para determinar cuánta información de la pila de llamadas se incluye junto al error registrado.     		
   *     - [Conf.ERRORES_Y_ALERTAS__PILA_DE_LLAMADAS__LIMITE]{@link Configuracion.Conf#ERRORES_Y_ALERTAS__PILA_DE_LLAMADAS__LIMITE}
   * 
	 * Dependiendo de dicha configuración, se puede reducir el consumo de memoria impidiendo la recoleccion 
	 * o limitando la profundidad de la traza  
   *  
   * Métodos relacionados:
   * - [activar_errores()]{@link Nucleo.Objeto.activar_errores}
   * - [desactivar_errores()]{@link Nucleo.Objeto.desactivar_errores}
   * - [activar_alertas()]{@link Nucleo.Objeto.activar_alertas}
   * - [desactivar_alertas()]{@link Nucleo.Objeto.desactivar_alertas}
   * - [desactivar_errores_y_alertas()]{@link Nucleo.Objeto.desactivar_errores_y_alertas}
   *
   * @example
   * ...
   * // Activar recolección de errores y alertas
   * Objeto.activar_errores_y_alertas();
   * ...
   * @returns {void}
   */
  static activar_errores_y_alertas() {
    Objeto._activar_rec_errores = true;
    Objeto._activar_rec_alertas = true;
  }

  /**
   * Desactiva la recolección de errores y alertas en el sistema ([Interface ErroresYAlertas]{@link Nucleo.Interfaces.ErroresYAlertas}).
   *
 	 * Este método deshabilita dinámicamente la recolección de errores y de alertas en el sistema, 
	 * incluso si la constantes de configuracio
	 * [Conf.ACTIVAR_ERRORES]{@link Configuracion.Conf#ACTIVAR_ERRORES} 
	 * y [Conf.ACTIVAR_ALERTAS]{@link Configuracion.Conf#ACTIVAR_ALERTAS}
	 * están establecida en true. De esta forma, permite sobrescribir temporalmente el comportamiento 
	 * predeterminado para detener la recopilación de mensajes de error y de alerta.
	 * 
	 * De esta manera se impide que los errores y las alertas registradas mediante 
	 * `[_error()]{@link Nucleo.Objeto._error}`
	 * o `[_alerta()]{@link Nucleo.Objeto._alerta}`
	 * se agreguen a las listas centralizadas. 
	 * 
	 * Los errores y las alertas que ocurran mientras el sistema esté
	 * desactivado no serán almacenadas ni mostradas por los métodos de visualización.
	 *
	 * Para volver a activar dinamicamente la recoleccion de errores y alertas puede usarse 
	 * [activar_errores_y_alertas()]{@link Nucleo.Objeto.activar_errores_y_alertas}
	 * o [activar_errores()]{@link Nucleo.Objeto.activar_errores}
	 * o [activar_alertas()]{@link Nucleo.Objeto.activar_alertas}
   * para reactivar solo uno de los dos tipos de recoleccion	  
   *
   * Las listas de errores y alertas pueden luego visualizarse usando métodos como:
   * - [imprimir_errores()]{@link Nucleo.Objeto.imprimir_errores}
   * - [imprimir_errores_consola()]{@link Nucleo.Objeto.imprimir_errores_consola}
   * - [html_errores()]{@link Nucleo.Objeto.html_errores}
   * - [json_errores()]{@link Nucleo.Objeto.json_errores}
   * - [imprimir_alertas()]{@link Nucleo.Objeto.imprimir_alertas}
   * - [imprimir_alertas_consola()]{@link Nucleo.Objeto.imprimir_alertas_consola}
   * - [html_alertas()]{@link Nucleo.Objeto.html_alertas}
   * - [json_alertas()]{@link Nucleo.Objeto.json_alertas}
   *
   * Configuración relacionada:
	 * - Para activar o desactivar la recoleccion de forma predeterminada (tambien puede hacerse dinamicamente con los metodos relacionados de mas abajo)
   *     - [Conf.ACTIVAR_ERRORES]{@link Configuracion.Conf#ACTIVAR_ERRORES}
   *     - [Conf.ACTIVAR_ALERTAS]{@link Configuracion.Conf#ACTIVAR_ALERTAS}
	 * - Para determinar cuánta información de la pila de llamadas se incluye junto al error registrado.     		
   *     - [Conf.ERRORES_Y_ALERTAS__PILA_DE_LLAMADAS__LIMITE]{@link Configuracion.Conf#ERRORES_Y_ALERTAS__PILA_DE_LLAMADAS__LIMITE}
   * 
	 * Dependiendo de dicha configuración, se puede reducir el consumo de memoria impidiendo la recoleccion 
	 * o limitando la profundidad de la traza  
   *  
   * Métodos relacionados:
   * - [activar_errores()]{@link Nucleo.Objeto.activar_errores}
   * - [desactivar_errores()]{@link Nucleo.Objeto.desactivar_errores}
   * - [activar_alertas()]{@link Nucleo.Objeto.activar_alertas}
   * - [desactivar_alertas()]{@link Nucleo.Objeto.desactivar_alertas}
   * - [activar_errores_y_alertas()]{@link Nucleo.Objeto.activar_errores_y_alertas}
   *
   * @example
   * ...
   * // Desactivar recolección de errores y alertas
   * Objeto.desactivar_errores_y_alertas();
   * ...
   * @returns {void}
   */
  static desactivar_errores_y_alertas() {
    Objeto._activar_rec_errores = true;
    Objeto._activar_rec_alertas = true;
  }
  ////////////////////////////////////////////////////////////////////////////////////////
  // Interface Id - Variables auxiliares de clase
  ////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Contador interno de IDs generados.
   * @type {number}
   * @private
   * @static
   */
  static #contador_ids = 1;//1 asegura que ningun id sea 0. esto es asi porque el id 0 podria ser interpretado con false en siertas circunstancias

  /**
   * Depósito interno de IDs ya asignados.
   * Evita que se repitan IDs entre objetos.
   * @type {Map<string, boolean>}
   * @private
   * @static
   */
  static #deposito_de_ids = new Set();//
  //Object.create(null); // 
  //new Map();

  ////////////////////////////////////////////////////////////////////////////////////////
  // Interface Id - Variables de instancia
  ////////////////////////////////////////////////////////////////////////////////////////

  /**
   * ID del objeto (puede ser null hasta que se le asigne uno).
   * @type {string|null}
   * @private
   */
  #id = null;

  ////////////////////////////////////////////////////////////////////////////////////////
  // Interface Id - Métodos auxiliares privados
  ////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Genera un nuevo ID único para un objeto.
   * Utiliza un contador interno y devuelve un string único.
   * @returns {string} El ID generado.
   * @private
   * @static
	 * @deprecated aunque elegante en el papel ineficiente cuando se van a crear muchisimos objetos.
	 * 				Ahora se realiza directamente en el id()
   */
  static #crear_id() {
    const id = String(Objeto.#contador_ids);
    Objeto.#contador_ids++;
    return id;
  }

  /**
   * Intenta agregar un ID al depósito de IDs existentes.
   * Garantiza que el ID no se haya asignado a ningún otro objeto.
   * @param {string} id - El ID que se intenta agregar.
   * @returns {boolean} True si el ID fue agregado exitosamente, false si ya existía.
   * @private
   * @static
   * @deprecated aunque elegante en el papel ineficiente cuando se van a crear muchisimos objetos.
	 * 				Ahora se realiza directamente en el _id()
   */
  static #agregar_id(id) {
    if (Objeto.#deposito_de_ids.has(id)) {
      return false;
    }
    Objeto.#deposito_de_ids.add(id);
    return true;
  }

  ////////////////////////////////////////////////////////////////////////////////////////
  // Interface Id - Métodos auxiliares protegidos
  ////////////////////////////////////////////////////////////////////////////////////////

/**
 * Verifica si un identificador dado es especial ([Interfaz Id]{@link Nucleo.Interfaces.Id}).
 *
 * Un **id especial** es aquel que es una cadena no numérica.  
 * Se utiliza internamente para determinar si un id proporcionado
 * es válido para ser asignado a un objeto mediante el método
 * [_id()]{@link Nucleo.Objeto._id}.
 *
 * @protected
 * @static
 *
 * @example
 * if (Objeto.es_id_especial("miIdEspecial")) {
 *   console.log("El id es especial");
 * } else {
 *   console.log("El id no es especial");
 * }
 *
 * @note Actualmente, un id especial es simplemente cualquier string que no sea numérico.
 *       Esto podría cambiar en el futuro si se implementa un sistema para evitar ids repetidos.
 *
 * @param {string} id El id a comprobar.
 * @returns {boolean} `true` si el id es especial, `false` en caso contrario.
 */
  static es_id_especial(id) {
    //alert("hola");
    return typeof id === "string" && isNaN(Number(id));
  }

  /**
   * Asigna un identificador único **sin realizar comprobaciones adicionales**.
   *
   * Este método pertenece a la interfaz:
   *  - {@link ./classes/Iteradores-Nucleo-Interfaces-Id.html Interfaz Id}
   *
   * A diferencia de {@link ./classes/Iteradores-Nucleo-Objeto.html#method__id _id()}, 
   * esta versión **no verifica** si el objeto ya posee id ni si el id es especial.
   * Se debe usar **exclusivamente** en clases que heredan de esta, y **bajo responsabilidad del programador**,
   * asegurando que:
   * - El id no haya sido previamente asignado.
   * - El id sea válido y único.
   *
   * Está pensada para contextos donde el control ya se realiza externamente,
   * permitiendo ahorrar CPU y memoria al omitir verificaciones redundantes.
   *
   * Si el id ya existe en el depósito global, se registra un error y devuelve `false`.
   * 
   * Métodos relacionados:
   * {@link ./classes/Iteradores-Nucleo-Objeto.html#method__id _id()} Versión segura con comprobaciones.
   *
   * @param {string} id - El id a asignar.
   * @returns {boolean} `true` si fue asignado exitosamente, `false` en caso contrario.
   * @protected
   * @static
   * @since V2.0.1
   * @example
   * // Ejemplo dentro de una clase heredera:
   * _crearNodoRapido(id) {
   *     if (Objeto.esIdEspecial(id)) {
   *         return this._id_interno(id);
   *     }
   * }
   */
  _id_interno(id) {
      // agrego id al depósito
      /*if (Objeto.#deposito_de_ids.has(id)) {
          this._error("Ya existe ese id");
          return false;
      }
      Objeto.#deposito_de_ids.set(id, true);
      this.#id = id;
      return true;*/
              // Verificación ultrarrápida (similar a PHP isset)
      /*  if (Objeto.#deposito_de_ids[id] !== undefined) {
            this._error("Ya existe ese id");
            return false;
        }
        // Asigna la marca
        Objeto.#deposito_de_ids[id] = true;
        this.#id = id;
        return true;*/
        if (Objeto.#deposito_de_ids.has(id)) {
            Objeto._error("Ya existe ese id");
            return false;
        }
        Objeto.#deposito_de_ids.add(id);
        this.#id = id;
        return true;
  }
  ////////////////////////////////////////////////////////////////////////////////////////
  // Interface Id - Métodos públicos
  ////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Devuelve el identificador único del objeto ([Interfaz Id]{@link Nucleo.Interfaces.Id}).
   *
   * Si el objeto aún no tiene un id, se le asigna uno nuevo de forma automática
   * mediante **inicialización perezosa**, asegurando que no esté repetido.
   *
   * Este método se usa para obtener un id persistente que identifique de forma
   * única a cada instancia del objeto en el sistema.
   *
   * Métodos relacionados:
   * - {@link Nucleo.Objeto._id _id()}
   * - {@link Nucleo.Objeto.es_especial es_especial()}
   *
   * @note A futuro se podría mejorar el algoritmo para garantizar unicidad
   *       global incluso entre sesiones distintas.
   *
   * @example
   * const miObjeto = new MiClase();
   * console.log(miObjeto.id()); // Ej: "12345"
   *
   * @returns {string} El id único del objeto.
   */
  id() {
    if (!this.#id) {
   /*   let id_aux = Objeto.#crear_id();
      while (!Objeto.#agregar_id(id_aux)) {
        id_aux = Objeto.#crear_id();
      }*/
      this.#id = Objeto.#contador_ids++;;
    }
    return this.#id;
  }

  /**
   * Asigna un identificador único al objeto ([Interfaz Id]{@link Nucleo.Interfaces.Id}).
   *
   * Solo puede ejecutarse con éxito si el objeto no posee ya un id asignado.
   * Además, el id proporcionado debe ser **especial** (debe poder pasar positivamente la 
   * verificacion realizada por [es_id_especial(id)]{@link Nucleo.Objeto.es_id_especial})
   * y no estar repetido en otros objetos.
   *
   * Este método complementa a {@link Nucleo.Objeto.id id()} (para obtener el id actual)
   * y a {@link Nucleo.Objeto.es_especial es_especial()} (para verificar si es especial).
   *
   * Si la asignación falla, se registrará un error mediante el sistema de errores
   * centralizado de la clase.
   *
   * @example
   * const miObjeto = new MiClase();//clase heredera de Objeto
   * if (miObjeto._id("mi_id_especial")) {
   *   console.log("Asignado id especial:", miObjeto.id());
   * } else {
   *   console.log("Error asignando id especial");
   * }
   *
   * @param {string} id - El id a asignar (debe ser una cadena no numérica).
   * @returns {boolean} `true` si el id fue asignado exitosamente, `false` en caso contrario.
   */
  _id(id) {
    if (this.#id) {
      Objeto._error("El objeto ya tenía id");
      return false;
    }
    if (!Objeto.es_id_especial(id)) {
      Objeto._error("Para asignar un id, este debe ser especial");
      return false;
    }
    if (!Objeto.#agregar_id(id)) {
      Objeto._error("Ya existe ese id");
      return false;
    }
    this.#id = id;
    return true;
  }

  /**
   * Comprueba si el objeto actual posee un id especial ([Interfaz Id]{@link Nucleo.Interfaces.Id}).
   *
   * Se considera **especial** cuando el id del objeto pasa positivamente la 
   * verificacion realizada por [es_id_especial(id)]{@link Nucleo.Objeto.es_id_especial}).
   * Si el objeto aún no tiene ningún id, este método forzará la asignación de un id
   * común mediante {@link Nucleo.Objeto.id id()}.
   *
   * Puedes usar este método luego de haber asignado un id con 
   * {@link Nucleo.Objeto._id _id()} para distinguirlo de otros objetos **comunes**.
   *
   * @example
   * const miObjeto = new MiClase();//Heredera de objeto
   * if (miObjeto.es_especial()) {
   *   console.log("El objeto tiene id especial:", miObjeto.id());
   * } else {
   *   console.log("El objeto no es especial");
   * }
   *
   * @returns {boolean} `true` si el objeto tiene un id especial, `false` en caso contrario.
   */
  es_especial() {
    return Objeto.es_id_especial(this.id());
  }
}

export { Objeto }