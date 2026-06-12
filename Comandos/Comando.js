/**
 * Define el contrato mínimo que debe cumplir un comando ejecutable.
 *
 * Cada comando del sistema implementa esta interfaz, lo que permite
 * que el {@link Controlador} lo registre y ejecute sin conocer su
 * lógica interna.
 *
 * Un comando puede declarar si solo está disponible en desarrollo
 * y, opcionalmente, proporcionar una función de reversa para
 * deshacer sus efectos.
 *
 * A partir de la versión 1.3.2, el comando también declara sus
 * metadatos (descripción, parámetros esperados y ejemplos de uso)
 * para que el Controlador pueda validar argumentos y generar
 * automáticamente la ayuda.
 *
 * @interface
 * @memberof Nucleo.Interfaces
 * @since 1.3.1
 * @version 1.3.2
 */
class Comando {
    /**
     * Nombre único del comando (ej. 'debug:imprimir').
     * @returns {string}
     */
    static nombre() {
        throw new Error("Método nombre() debe ser implementado.");
    }

    /**
     * Indica si el comando solo debe registrarse en entorno de desarrollo.
     * @returns {boolean}
     */
    static solo_desarrollo() {
        throw new Error("Método solo_desarrollo() debe ser implementado.");
    }

    /**
     * Breve descripción de lo que hace el comando (opcional).
     *
     * Se utiliza en la ayuda generada automáticamente por el Controlador.
     *
     * @returns {string}
     * @since 1.3.2
     */
    static descripcion() {
       return '';
    }

    /**
     * Define los parámetros que acepta el comando (opcional)
     *
     * Cada entrada es un objeto con las siguientes propiedades:
     * - nombre      (string)  Nombre del parámetro (sin guiones).
     * - tipo        (string)  'posicional', 'bandera' u 'opcion'.
     * - obligatorio (boolean) Si es obligatorio.
     * - defecto     (any)     Valor por defecto.
     * - descripcion (string)  Texto explicativo para la ayuda.
     * - valores     (string[]) (Opcional) Lista de valores permitidos.
     *
     * Los nombres de los parámetros no pueden coincidir con las palabras
     * reservadas definidas en {@link Configuracion.Conf.PALABRAS_RESERVADAS_COMANDOS}.
     *
     * @returns {Object[]}
     * @since 1.3.2
     */
    static parametros() {
        return [];
    }

    /**
     * Proporciona uno o varios ejemplos de uso del comando (opcional).
     * @returns {string[]}
     * @since 1.3.2
     */
    static ejemplos() {
        return [];
    }

    /**
     * Ejecuta la lógica del comando.
     *
     * Recibe los argumentos ya validados y normalizados por el Controlador.
     * La estructura del parámetro `args` depende de si el comando ha
     * declarado una definición de parámetros mediante el método
     * {@link Comando.parametros}:
     *
     * - **Con definición de parámetros:** `args` es un objeto con las
     *   propiedades `posicionales` (Array), `banderas` (Object)
     *   y `opciones` (Object).
     * - **Sin definición de parámetros:** `args` es un Array que contiene
     *   los argumentos crudos tal como fueron pasados al comando.
     *
     * @param {string} token Token de seguridad proporcionado por el Controlador.
     * @param {Object|Array} args Argumentos normalizados (objeto con
     *     posicionales, banderas y opciones, o un array de argumentos crudos).
     * @returns {*} Resultado de la ejecución.
     */
    ejecutar(token, args) { 
        throw new Error("Método ejecutar() debe ser implementado.");
    }

    /**
     * Proporciona una función de reversa, o `null` si no es reversible.
     *
     * @returns {Function|null}
     */
    reversa() {
        return null;
    }
}

export { Comando };