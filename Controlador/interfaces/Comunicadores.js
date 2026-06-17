import { Comunicador } from './../../Comunicadores/index.js';

/**
 * Define el contrato para la gestión centralizada de comunicadores.
 *
 * Mantiene un mapa de comunicadores registrados (uno por tipo),
 * verifica permisos y proporciona acceso controlado a ellos.
 *
 * También expone un método de conveniencia para escribir directamente
 * en la salida estándar configurada según el entorno para depuración.
 *
 * @interface
 * @memberof Comunicadores
 * @since 1.3.3
 */
class Comunicadores {
    /**
     * Registra un comunicador a partir de una clase que implementa {@link Comunicador}.
     *
     * @param {typeof Comunicador} clase Clase del comunicador.
     * @returns {boolean}
     */
    static registrar_comunicador_desde_clase(clase) {
        throw new Error("Método registrar_comunicador_desde_clase() debe ser implementado.");
    }

    /**
     * Registra un comunicador a partir de una instancia.
     *
     * @param {Comunicador} comunicador Instancia del comunicador.
     * @returns {boolean}
     */
    static registrar_comunicador_desde_instancia(comunicador) {
        throw new Error("Método registrar_comunicador_desde_instancia() debe ser implementado.");
    }

    /**
     * Encola un comunicador para registro diferido o inmediato.
     *
     * @param {typeof Comunicador | Comunicador} comunicador Clase o instancia.
     * @returns {void}
     */
    static encolar_comunicador(comunicador) {
        throw new Error("Método encolar_comunicador() debe ser implementado.");
    }

    /**
     * Procesa la lista de comunicadores pendientes y los registra.
     *
     * @returns {number} Número de comunicadores registrados exitosamente.
     */
    static cargar_comunicadores_pendientes() {
        throw new Error("Método cargar_comunicadores_pendientes() debe ser implementado.");
    }

    /**
     * Obtiene la instancia única de un comunicador por su nombre.
     *
     * Si se invoca sin argumentos (o con el valor especial `'predeterminado'`),
     * devuelve automáticamente el comunicador de salida estándar correspondiente
     * al entorno actual:
     * - En **consola** → `salida_depuracion_consola`
     * - En **navegador** → `salida_depuracion_html`
     *
     * En cualquier otro caso, busca el comunicador en el mapa interno y verifica
     * que el usuario actual tenga permiso para utilizarlo mediante
     * {@link tiene_permiso}.
     *
     * Si el comunicador no existe o el usuario no tiene permiso, retorna `null`
     * y registra un error.
     *
     * @param {string} [nombre='predeterminado'] Nombre del comunicador
     *     (ej. `'archivo'`, `'http'`). Si se omite o es `'predeterminado'`,
     *     se usa la salida estándar según el entorno.
     *
     * @returns {Comunicador|null} La instancia del comunicador,
     *                             o `null` si no está disponible.
     *
     * @example
     * // Obtener la salida estándar (consola o HTML según Entorno)
     * const salida = Controlador.comunicador();
     * salida.enviar('', 'Hola mundo');
     *
     * // Obtener un comunicador específico
     * const http = Controlador.comunicador('http');
     * if (http) {
     *     http.enviar('https://api.example.com', datos);
     * }
     *
     * @since 1.3.3
     */
    static comunicador(nombre = 'predeterminado') {
        throw new Error("Método comunicador() debe ser implementado.");
    }

    /**
     * Verifica si el usuario actual tiene permiso para usar el comunicador.
     *
     * @param {string} nombre Nombre del comunicador.
     * @returns {boolean}
     */
    static tiene_permiso(nombre) {
        throw new Error("Método tiene_permiso() debe ser implementado.");
    }

    /**
     * Escribe un mensaje en la salida estándar configurada según el entorno.
     *
     * Obtiene el comunicador predeterminado (resuelto por
     * {@link comunicador}) y envía el mensaje a través de él.
     *
     * Es el equivalente a `console.log`, pero adaptado al tipo de salida
     * definido en {@link Configuracion.Entorno}.
     *
     * @param {string} mensaje Texto a escribir en la salida estándar.
     *
     * @returns {void}
     *
     * @example
     * Controlador.escribir_salida("Operación completada.");
     *
     * @since 1.3.3
     */
    static escribir_salida(mensaje) {
        throw new Error("Método escribir_salida() debe ser implementado.");
    }
}

export { Comunicadores };