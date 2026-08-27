import { Objeto } from '../Nucleo/Objeto.js';
import { Nodo } from '../Nodos/Nodo.js'

/**
 * Iterador – Navegador y manipulador de estructuras enlazadas.
 *
 * Un Iterador es una herramienta para recorrer, construir, modificar y
 * gestionar estructuras de nodos interconectados mediante **alias** (nombres
 * simbólicos que apuntan a enlaces concretos). Su diseño original, forjado a
 * lo largo de múltiples versiones desde 2013, ha sido refinado para
 * integrarse en el ecosistema del framework *Iteradores*.
 *
 * ## Responsabilidades principales
 *
 * 1. **Gestión del ciclo de vida**: crear una estructura nueva, cargar una
 *    previamente persistida y destruirla cuando ya no sea necesaria.
 * 2. **Alias y navegación**: asignar alias a enlaces, y recorrer la estructura
 *    siguiendo caminos de alias. El nodo actual actúa como cursor de lectura
 *    y escritura.
 * 3. **Manipulación de datos**: leer y escribir datos en los nodos alcanzables
 *    a través de rutas de alias, tanto en la estructura principal como en
 *    almacenes auxiliares (datos individuales).
 * 4. **Construcción desde cadenas**: interpretar una cadena con formato
 *    específico para generar automáticamente una estructura de nodos, y
 *    también serializar una estructura existente de vuelta a cadena.
 * 5. **Clonación**: crear una copia profunda de la estructura interna,
 *    opcionalmente excluyendo ciertos datos individuales.
 * 6. **Control de concurrencia**: marcar un iterador como ocupado para evitar
 *    que dos instancias manipulen simultáneamente la misma estructura
 *    persistida.
 * 7. **Historial de navegación**: registrar opcionalmente los nodos visitados
 *    durante el recorrido, permitiendo volver a posiciones anteriores o
 *    reiniciar el camino.
 *
 * ## Historial de versiones
 *
 * La clase `Iterador` original fue desarrollada por Ignacio David Baigorria
 * a partir de 2013. Alcanzó su madurez conceptual en la versión 2.0 (según
 * la numeración antigua) con un conjunto completo de funcionalidades para
 * navegación, alias, construcción desde cadenas y control de concurrencia.
 * Para el framework *Iteradores* actual, esa versión se considera la **1.0**
 * y sirve como punto de partida para una refactorización completa que la
 * adapte a las convenciones de nomenclatura, la herencia de {@link Objeto}
 * y la integración con el sistema de fases, energía y antenas.
 *
 * A partir de la versión 1.5.0, esta clase base se extenderá en
 * {@link IteradorElectrico} e {@link IteradorNumerico}.
 *
 * @class Iterador
 * @extends Objeto
 * @since 1.0 (versión original consolidada)
 * @version 1.5.0 (inicio de refactorización)
 * @author Ignacio David Baigorria
 */
export class Iterador extends Objeto {

    constructor() {
        super();
        /**
         * Nodo cuerpo del iterador.
         * @type {Nodo|null}
         * @since 1.0
         */
        this.raiz_cuerpo = null;
    }

	//********************************************************************************
	//------------------------------------------------------------------------------->
	//---------------------- Interfaz de creación de nodos y validacion de elementos >
	//------------------------------------------------------------------------------->
    /**
     * Verifica si un elemento es válido para ser iterado.
     *
     * En la clase base **todo elemento es válido** (incluyendo `null`, `false` o `0`).
     * Este método está diseñado para ser **sobrescrito en las subclases** cuando
     * se necesite restringir los tipos de elementos que el iterador puede procesar.
     *
     * @param {*}                          elemento Elemento a verificar.
     * @param {function(Nodo, boolean)=}   callback Función opcional que recibe el elemento y un booleano
     *                                             indicando si es un {@link Nodo}.
     * @returns {boolean} Siempre `true` en Iterador. Las subclases pueden devolver `false`.
     *
     * @since 1.5.0
     *
     * @see Iterador#nodo
     */
    static es_elemento_valido(elemento, callback = null) {
        const es_nodo = elemento instanceof Nodo;
        if (callback) callback(elemento, es_nodo);
        return true;
    }

    /**
     * Garantiza que el elemento entregado sea un nodo válido.
     *
     * Comportamiento análogo a {@link Nodo.nodo}, pero con la restricción adicional
     * impuesta por {@link Iterador#es_elemento_valido} y creando el tipo de nodo
     * adecuado mediante {@link Iterador#_crear_nodo_con_dato}.
     *
     * @param {*} [elemento=null]               Valor a encapsular o nodo existente.
     * @param {function(Nodo, boolean)=} callback Función opcional que recibe el nodo creado y un booleano
     *                                           indicando si el parámetro original ya era un nodo.
     * @returns {Nodo|null} Nodo válido o `null` si el elemento no es válido.
     *
     * @since 1.5.0
     *
     * @example
     * // Caso 1: elemento no nodo
     * const iterador = new Iterador();
     * const nodo = iterador.nodo("texto", (nodo, esNodo) => {
     *     console.log(esNodo); // false
     * });
     *
     * // Caso 2: elemento ya es nodo
     * const nodoExistente = Nodo.nodo(42);
     * const nodo = iterador.nodo(nodoExistente, (nodo, esNodo) => {
     *     console.log(esNodo); // true
     * });
     *
     * // Caso 3: elemento inválido (en subclase restrictiva)
     * // Si IteradorNumerico requiere NodoNumerico, pasar un Nodo normal
     * // provocará un error y retornará null.
     */
    nodo(elemento = null, callback = null) {
        let es_nodo = false;

        // Una sola llamada que valida y captura si el elemento es un nodo
        const es_valido = this.constructor.es_elemento_valido(elemento, (el, es) => {
            es_nodo = es;
        });

        if (!es_valido) {
            this.constructor._error("Iterador.nodo: el elemento no es válido");
            return null;
        }

        if (es_nodo) {
            if (callback) callback(elemento, true);
            return elemento;
        }

        // Crear un nuevo nodo del tipo adecuado
        const nodo_creado = this._crear_nodo_con_dato(elemento);
        if (callback) callback(nodo_creado, false);
        return nodo_creado;
    }

    /**
     * Crea un nodo del tipo adecuado con el dato proporcionado.
     *
     * Este método es invocado por {@link nodo} cuando el elemento no es un nodo
     * pero sí es válido. Las subclases deben sobrescribirlo para retornar
     * instancias de su tipo de nodo específico.
     *
     * @param {*} dato Dato con el que se creará el nodo.
     * @returns {Nodo} Nueva instancia de Nodo (o subclase) que encapsula `dato`.
     *
     * @since 1.5.0
     * @protected
     */
    _crear_nodo_con_dato(dato) {
        return Nodo.nodo(dato);
    }

    //********************************************************************************
	//------------------------------------------------------------------------------->
	//---------------------- Interfaz de carga y creación y destrucción-------------->
	//-------------------------------------------------------------------------------> 

    // METODOS ESTATICOS PROTEGIDOS
    /**
     * Registra la clase del iterador en la superestructura global.
     *
     * @param {Iterador} iterador Instancia del iterador a registrar.
     * @param {string}   nombrei  Nombre único del iterador.
     * @returns {Nodo|null} Nodo cuerpo del iterador registrado, o null si hubo error.
     * @since 1.0
     * @version 1.5i.0
     * @protected
     */
    static _registrar_iterador(iterador, nombrei) {
        if (!(iterador instanceof Iterador)) {
            Iterador._error("Iterador._registrar_iterador: el dato de entrada tiene que ser de la clase Iterador o heredera");
            return null;
        }
        if (iterador.raiz_cuerpo) {
            Iterador._error("Iterador._registrar_iterador: el Iterador pasado por parametro ya fue creado antes");
            return null;
        }

        let nclases = Nodo.nodo_por_id("iteradores");
        if (!nclases) {
            nclases = Nodo.crear_con_id("iteradores");
        }

        const nombrec = iterador.constructor.name;
        let nclase = nclases.adyacente(nombrec);
        if (!nclase) {
            nclase = Nodo.crear();
            nclases._adyacente_en(nclase, nombrec);
        }

        if (!nclase.adyacente("alias permitidos")) {
            const npermitidos = Iterador._alias_permitidos();
            if (!npermitidos || !(npermitidos instanceof Nodo)) {
                Iterador._error(`Iterador._registrar_iterador: error asignando los enlaces permitidos de ${nombrec}`);
                return null;
            } else {
                nclase._adyacente_en(npermitidos, "alias permitidos");
            }
        }

        let ninformacion = nclase.adyacente("informacion compartida");
        if (!ninformacion) {
            ninformacion = Nodo.crear_con_dato(nombrec);
            nclase._adyacente_en(ninformacion, "informacion compartida");
        }

        let niteradores = nclase.adyacente("iteradores");
        if (!niteradores) {
            niteradores = Nodo.crear();
            nclase._adyacente_en(niteradores, "iteradores");
        }

        if (niteradores.adyacente(nombrei)) {
            Iterador._error(`Iterador._registrar_iterador: ya existe un iterador con el nombre ${nombrei}`);
            return null;
        }

        const cuerpoi = Nodo.crear_con_dato(nombrei);
        niteradores._adyacente_en(cuerpoi, nombrei);

        iterador.raiz_cuerpo = cuerpoi;
        cuerpoi._adyacente_en(ninformacion, "clase");

        return cuerpoi;
    }

    /**
     * Crea un nuevo iterador con el nombre dado.
     *
     * @param {string}   nombre        Nombre del iterador.
     * @param {Iterador} iterador      Instancia del iterador.
     * @param {*}        [elemento=null] Elemento inicial.
     * @param {function(boolean)} [esNodoCallback=null] Callback para recibir si el elemento era nodo.
     * @returns {Iterador|null} El iterador o null si falló.
     * @since 1.0
     * @version 1.5i.0
     * @protected
     */
    static _crear_interno(nombre, iterador, elemento = null, esNodoCallback = null) {
        if (typeof nombre !== 'string') {
            Iterador._error("Iterador._crear_interno: el nombre del iterador debe ser un string");
            return null;
        }

        const cuerpo = Iterador._registrar_iterador(iterador, nombre);
        if (!cuerpo) {
            Iterador._error("Iterador._crear_interno: la clase del iterador no es valida");
            return null;
        }

        cuerpo._adyacente_en(cuerpo, "ocupado");

        if (elemento) { // Nota: JS trata null, undefined, false, 0, '' como falsy
            iterador.nodo(elemento, (nodo, esNodo) => {
                if (!nodo) {
                    Iterador._error(`Iterador._crear_interno: el elemento que intenta asignar con la creacion de ${nombre} no es valido`);
                    Iterador._destruir_interno(iterador);
                    if (esNodoCallback) esNodoCallback(false);
                    return null; // Ojo: no detiene el flujo, pero devolvemos
                } else {
                    if (esNodoCallback) esNodoCallback(esNodo);
                    cuerpo._adyacente_en(nodo, "actual");
                }
            });
        }

        return iterador;
    }

    /**
     * Destruye internamente el iterador.
     *
     * Elimina enlaces auxiliares, libera datos y quita el cuerpo del registro global.
     *
     * @param {Iterador} iterador Iterador a destruir.
     * @returns {boolean} True si se destruyó correctamente, false en caso contrario.
     * @since 1.0
     * @version 1.5i.0
     * @protected
     */
    static _destruir_interno(iterador) {
        const cuerpo = iterador.raiz_cuerpo;
        if (!cuerpo || !cuerpo.adyacente("ocupado")) {
            Iterador._error("Iterador._destruir_interno: el iterador no esta ocupado");
            return false;
        }

        // placeholders para limpieza de datos (serán implementados en versiones completas)
        iterador.destruir_datos();
        iterador.destruir_datos_individuales();
        iterador.destruir_datos_temporales();

        const nclones = cuerpo.adyacente("cantidad de clones");
        if (nclones) {
            cuerpo.eliminar_adyacente("cantidad de clones");
            Nodo.eliminar(nclones);
        }
        if (cuerpo.adyacente("clon")) {
            cuerpo.eliminar_adyacente("clon");
        }

        iterador.eliminar_todos_los_alias();

        cuerpo.eliminar_adyacente("ocupado");

        const its = Nodo.nodo_por_id("iteradores");
        const clase = iterador.constructor.name;
        const nclase = its.adyacente(clase);
        const niteradores = nclase.adyacente("iteradores");
        niteradores.eliminar_adyacente(cuerpo.dato());

        if (!Nodo.eliminar(cuerpo)) {
            Iterador._error("Iterador._destruir_interno: no se pudo destruir el cuerpo del iterador");
            return false;
        }

        return true;
    }

        /**
     * Carga un iterador existente por nombre.
     *
     * @param {string}   nombre   Nombre del iterador.
     * @param {Iterador} iterador Instancia nueva sin cuerpo.
     * @param {*}        [elemento=null] Elemento inicial.
     * @param {function(boolean)} [esNodoCallback=null] Callback para recibir si el elemento era nodo.
     * @returns {Iterador|null} Iterador con cuerpo o null.
     * @since 1.0
     * @version 1.5i.0
     * @protected
     */
    static _cargar_interno(nombre, iterador, elemento = null, esNodoCallback = null) {
        if (typeof nombre !== 'string') {
            Iterador._error("Iterador._cargar_interno: el nombre del iterador debe ser un string");
            return null;
        }
        if (!(iterador instanceof Iterador)) {
            Iterador._error("Iterador._cargar_interno: el iterador de entrada tiene que ser de la clase Iterador o heredera");
            return false;
        }
        if (iterador.raiz_cuerpo) {
            Iterador._error("Iterador._cargar_interno: el iterador pasado por parametro ya fue creado antes");
            return null;
        }

        const iteradores = Nodo.nodo_por_id("iteradores");
        if (!iteradores) {
            Iterador._error("Iterador._cargar_interno: no existen iteradores");
            return null;
        }

        const nombrec = iterador.constructor.name;
        const nclase = iteradores.adyacente(nombrec);
        if (!nclase) {
            Iterador._error("Iterador._cargar_interno: no existen iteradores de esa clase");
            return null;
        }

        const nits = nclase.adyacente("iteradores");
        if (!nits) {
            Iterador._error("Iterador._cargar_interno: error interno en la estructura");
            return null;
        }

        const cuerpo = nits.adyacente(nombre);
        if (!cuerpo) {
            Iterador._error(`Iterador._cargar_interno: no existe ningun iterador con el nombre ${nombre}`);
            return null;
        }

        if (cuerpo.adyacente("ocupado")) {
            Iterador._error("Iterador._cargar_interno: el iterador que intenta cargar esta ocupado");
            return null;
        }

        const clase = cuerpo.adyacente("clase");
        if (!clase || clase.dato() !== iterador.constructor.name) {
            Iterador._error("Iterador._cargar_interno: el iterador que se intenta cargar no pertenece a esta clase");
            return null;
        }

        iterador.raiz_cuerpo = cuerpo;
        cuerpo._adyacente_en(cuerpo, "ocupado");

        if (elemento) {
            let es_nodo = false;
            const es_valido = iterador.constructor.es_elemento_valido(elemento, (el, es) => { es_nodo = es; });
            if (!es_valido) {
                Iterador._error(`Iterador._cargar_interno: el elemento que intenta asignar con la carga de ${nombre} no es valido`);
                cuerpo.eliminar_adyacente("ocupado");
                if (esNodoCallback) esNodoCallback(false);
                return null;
            }
            const nodo = es_nodo ? elemento : iterador._crear_nodo_con_dato(elemento);
            if (esNodoCallback) esNodoCallback(es_nodo);
            if (cuerpo.adyacente("actual")) {
                Iterador._alerta("Iterador._cargar_interno: el iterador ya tenia una posicion actual, se asignara la nueva");
            }
            cuerpo._adyacente_en(nodo, "actual");
        }

        return iterador;
    }

        /**
     * Carga o crea un iterador con el nombre dado.
     *
     * @param {string}   nombre   Nombre del iterador.
     * @param {Iterador} iterador Instancia nueva sin cuerpo.
     * @param {*}        [elemento=null] Elemento inicial.
     * @param {function(boolean)} [esNodoCallback=null] Callback para saber si elemento era nodo.
     * @param {function(boolean)} [nuevoCallback=null] Callback para saber si fue creado (true) o cargado (false).
     * @returns {Iterador|null} Iterador con cuerpo o null.
     * @since 1.0
     * @version 1.5i.0
     * @protected
     */
    static _iterador_interno(nombre, iterador, elemento = null, esNodoCallback = null, nuevoCallback = null) {
        // validaciones iniciales
        if (typeof nombre !== 'string') {
            Iterador._error("Iterador._iterador_interno: el nombre del iterador debe ser un string");
            return null;
        }
        if (!(iterador instanceof Iterador)) {
            Iterador._error("Iterador._iterador_interno: el iterador de entrada tiene que ser de la clase Iterador o heredera");
            return false;
        }
        if (iterador.raiz_cuerpo) {
            Iterador._error("Iterador._iterador_interno: el iterador pasado por parametro ya fue creado antes");
            return null;
        }

        const nombrec = iterador.constructor.name;

        // intenta cargar
        const iteradores = Nodo.nodo_por_id("iteradores");
        if (iteradores) {
            const nclase = iteradores.adyacente(nombrec);
            if (nclase) {
                const nits = nclase.adyacente("iteradores");
                if (nits) {
                    const cuerpo = nits.adyacente(nombre);
                    if (cuerpo) {
                        // es carga
                        if (cuerpo.adyacente("ocupado")) {
                            Iterador._error("Iterador._iterador_interno: el iterador que intenta cargar esta ocupado");
                            return null;
                        }
                        const clase = cuerpo.adyacente("clase");
                        if (!clase || clase.dato() !== iterador.constructor.name) {
                            Iterador._error("Iterador._iterador_interno: el iterador que se intenta cargar no pertenece a esta clase");
                            return null;
                        }

                        iterador.raiz_cuerpo = cuerpo;
                        cuerpo._adyacente_en(cuerpo, "ocupado");

                        if (elemento) {
                            let es_nodo = false;
                            const es_valido = iterador.constructor.es_elemento_valido(elemento, (el, es) => { es_nodo = es; });
                            if (!es_valido) {
                                Iterador._error(`Iterador._iterador_interno: el elemento no es valido`);
                                cuerpo.eliminar_adyacente("ocupado");
                                if (esNodoCallback) esNodoCallback(false);
                                return null;
                            }
                            const nodo = es_nodo ? elemento : iterador._crear_nodo_con_dato(elemento);
                            if (esNodoCallback) esNodoCallback(es_nodo);
                            if (cuerpo.adyacente("actual")) {
                                Iterador._alerta("Iterador._iterador_interno: el iterador ya tenia una posicion actual, se asignara la nueva");
                            }
                            cuerpo._adyacente_en(nodo, "actual");
                        }

                        if (nuevoCallback) nuevoCallback(false);
                        return iterador;
                    }
                }
            }
        }

        // no existe, crear
        const cuerpo = Iterador._registrar_iterador(iterador, nombre);
        if (!cuerpo) {
            Iterador._error("Iterador._iterador_interno: la clase del iterador no es valida");
            return null;
        }
        cuerpo._adyacente_en(cuerpo, "ocupado");

        if (elemento) {
            let es_nodo = false;
            const es_valido = iterador.constructor.es_elemento_valido(elemento, (el, es) => { es_nodo = es; });
            if (!es_valido) {
                Iterador._error(`Iterador._iterador_interno: el elemento no es valido`);
                Iterador._destruir_interno(iterador);
                if (esNodoCallback) esNodoCallback(false);
                return null;
            }
            const nodo = es_nodo ? elemento : iterador._crear_nodo_con_dato(elemento);
            if (esNodoCallback) esNodoCallback(es_nodo);
            cuerpo._adyacente_en(nodo, "actual");
        }

        if (nuevoCallback) nuevoCallback(true);
        return iterador;
    }

    // METODOS PUBLUCOS //////////

    /**
     * Crea un nuevo iterador con el nombre dado.
     *
     * @param {string} nombre Nombre del iterador.
     * @param {*} [elemento=null] Elemento inicial.
     * @param {function(boolean)} [esNodoCallback=null] Callback que recibe si elemento era nodo.
     * @returns {Iterador|null} Instancia del iterador creado.
     * @since 1.0
     * @version 1.5i.0
     */
    static crear(nombre, elemento = null, esNodoCallback = null) {
        const iter = new Iterador();
        const resultado = Iterador._crear_interno(nombre, iter, elemento, esNodoCallback);
        if (!resultado) {
            Iterador._error("Iterador.crear: no se pudo crear");
            return null;
        }
        return iter;
    }

    /**
     * Destruye el iterador actual.
     *
     * @returns {boolean} True si se destruyó correctamente.
     * @since 1.0
     * @version 1.5i.0
     */
    destruir() {
        if (!Iterador._destruir_interno(this)) {
            Iterador._error("Iterador.destruir: no se completo el proceso de destruccion");
            return false;
        }
        return true;
    }

        /**
     * Carga un iterador existente por nombre.
     *
     * @param {string} nombre Nombre del iterador.
     * @param {*} [elemento=null] Elemento inicial.
     * @param {function(boolean)} [esNodoCallback=null] Callback que recibe si elemento era nodo.
     * @returns {Iterador|null} Instancia del iterador cargado.
     * @since 1.0
     * @version 1.5i.0
     */
    static cargar(nombre, elemento = null, esNodoCallback = null) {
        const iter = new Iterador();
        const resultado = Iterador._cargar_interno(nombre, iter, elemento, esNodoCallback);
        if (!resultado) {
            Iterador._error("Iterador.cargar: no se pudo cargar");
            return null;
        }
        return iter;
    }
    /**
     * Carga o crea un iterador con el nombre dado.
     *
     * @param {string} nombre Nombre del iterador.
     * @param {*} [elemento=null] Elemento inicial.
     * @param {function(boolean)} [esNodoCallback=null] Callback que recibe si elemento era nodo.
     * @param {function(boolean)} [nuevoCallback=null] Callback que recibe true si fue creado, false si cargado.
     * @returns {Iterador|null} Instancia del iterador.
     * @since 1.0
     * @version 1.5i.0
     */
    static iterador(nombre, elemento = null, esNodoCallback = null, nuevoCallback = null) {
        const iter = new Iterador();
        const resultado = Iterador._iterador_interno(nombre, iter, elemento, esNodoCallback, nuevoCallback);
        if (!resultado) {
            Iterador._error("Iterador.iterador: no se pudo cargar ni crear el iterador con ese nombre");
            return null;
        }
        return iter;
    }


    //********************************************************************************
	//------------------------------------------------------------------------------->
	//---------------------- INTERFAZ de Propiedades del Iterador ------------------->
	//------------------------------------------------------------------------------->
	//------------------------------------------------------------------------------->

	/**
	 * Verifica si el elemento dado es una instancia de Iterador.
	 *
	 * 🔗 Interfaz: Propiedades del Iterador
	 * Caso de uso: saber si un elemento es iterador.
	 *
	 * @since 1.0
	 * @version 1.5i.1
	 *
	 * @param {*} elemento Elemento a comprobar.
	 * @returns {boolean} `true` si es un Iterador, `false` en caso contrario.
	 */
	static es_iterador(elemento) {
		return elemento instanceof Iterador;
	}

	/**
	 * Obtiene el nombre del iterador.
	 *
	 * 🔗 Interfaz: Propiedades del Iterador
	 * Caso de uso: obtener nombre del iterador.
	 *
	 * @since 1.0
	 * @version 1.5i.1
	 *
	 * @returns {string|boolean} El nombre del iterador, `false` si no está ocupado o no tiene cuerpo.
	 */
	nombre() {
		const cuerpo = this.raiz_cuerpo;
		if (!cuerpo || !cuerpo.adyacente("ocupado")) {
			Iterador._error("Iterador.nombre: el iterador no esta ocupado");
			return false;
		}
		return cuerpo.dato();
	}

	//********************************************************************************
	//------------------------------------------------------------------------------->
	//---------------------- INTERFAZ de Marca de ocupado---------------------------->
	//------------------------------------------------------------------------------->
	//------------------------------------------------------------------------------->
	/**
	 * Notas generales de la interfaz:
	 * Esta interfaz tiene como tarea administrar el acceso a la "marca de ocupado" del iterador.
	 * Esta marca en la realidad no es más que un enlace de la raíz del iterador a sí misma.
	 */

	/**
	 * Activa la "marca de ocupado".
	 *
	 * 🔗 Interfaz: INTERFAZ OCUPAR/DESOCUPAR/OCUPADO
	 * Caso de uso: Activar la "marca de ocupado".
	 *
	 * @since 1.0
	 * @version 1.5i.1
	 *
	 * @returns {boolean} `true` si se activó, `false` si ya estaba ocupado o no tiene cuerpo.
	 */
	_ocupar() { // En JS no hay protected real, se indica con guion bajo
		const cuerpo = this.raiz_cuerpo;
		if (!cuerpo) {
			Iterador._error("Iterador._ocupar: el iterador no tiene cuerpo!!");
			return false;
		}
		if (!cuerpo.adyacente("ocupado")) {
			cuerpo._adyacente_en(cuerpo, "ocupado");
			return true;
		} else {
			Iterador._alerta("Iterador._ocupar: el iterador ya esta ocupado");
			return false;
		}
	}

    /**
     * Elimina la "marca de ocupado".
     *
     * 🔗 Interfaz: INTERFAZ OCUPAR/DESOCUPAR/OCUPADO
     * Caso de uso: Desactivar la "marca de ocupado".
     *
     * @since 1.0
     * @version 1.5i.1
     *
     * @returns {boolean} `true` si se desactivó, `false` si no estaba ocupado.
     */
    desocupar() {
        const cuerpo = this.raiz_cuerpo;
        if (!cuerpo) {
            Iterador._alerta("Iterador.desocupar: el iterador ya esta desocupado(1)");
            return false;
        }
        if (cuerpo.adyacente("ocupado")) {
            this._liberar(); // placeholder para liberación adicional
            this.destruir_datos_temporales();
            cuerpo.eliminar_adyacente("ocupado");
            this.raiz_cuerpo = null;
            return true;
        } else {
            Iterador._alerta("Iterador.desocupar: el iterador ya esta desocupado (2)");
            return false;
        }
    }

	/**
	 * Comprueba si el iterador está ocupado.
	 *
	 * 🔗 Interfaz: INTERFAZ OCUPAR/DESOCUPAR/OCUPADO
	 * Caso de uso: Saber si existe "marca de ocupado".
	 *
	 * @since 1.0
	 * @version 1.5i.1
	 *
	 * @returns {boolean} `true` si está ocupado, `false` en caso contrario.
	 */
	ocupado() {
		const cuerpo = this.raiz_cuerpo;
		if (cuerpo && cuerpo.adyacente("ocupado")) {
			return true;
		} else {
			return false;
		}
	}
	//********************************************************************************
	//------------------------------------------------------------------------------->
	//----------------------manejo de ALIAS------------------------------------------>
	//------------------------------------------------------------------------------->
	//------------------------------------------------------------------------------->
	//------------------------------------------------------------------------------->
		/*Notas generales de la interfaz:
			Esta interfaz administra la relación bidireccional entre alias y enlaces.
			En la clase base cualquier string es un alias válido.
		*/

	/**
	 * Devuelve el nodo con los alias permitidos para esta clase.
	 * En la clase base devuelve un nodo vacío (sin restricciones). Las subclases deben sobrescribir.
	 *
	 * @returns {Nodo} Nodo vacío.
	 * @since 1.0
	 * @version 1.5i.1
	 * @protected
	 */
	static _alias_permitidos() {
		return Nodo.crear();
	}

	/**
	 * Verifica si un alias es válido.
	 * En la clase base solo se exige que sea string.
	 *
	 * @param {*} alias Alias a validar.
	 * @param {Iterador} iterador Iterador sobre el que se valida.
	 * @returns {boolean} `true` si es string.
	 * @since 1.0
	 * @version 1.5i.1
	 * @protected
	 */
	static _es_alias_valido(alias, iterador) {
		if (typeof alias !== 'string') {
			Iterador._error("Iterador._es_alias_valido: el alias debe ser un string");
			return false;
		}
		return true;
	}

    /**
     * Verifica si un enlace es válido para el iterador.
     * En la clase base se acepta número o string. Las subclases pueden sobrescribir.
     *
     * @param {*} enlace Enlace a validar.
     * @param {Iterador} iterador Iterador.
     * @returns {boolean} `true` si es válido.
     * @since 1.0
     * @version 1.5i.1
     * @protected
     */
    static _es_enlace_valido(enlace, iterador) {
        if (typeof enlace !== 'string') {
            Iterador._error("Iterador._es_enlace_valido: el enlace debe ser un string");
            return false;
        }
        return true;
    }

	/**
	 * Asigna un alias a un enlace.
	 *
	 * @param {number|string} enlace Enlace.
	 * @param {string} alias Alias.
	 * @returns {boolean} `true` si se asignó.
	 */
	_alias(enlace, alias) {
		const cuerpo = this.raiz_cuerpo;
		if (!cuerpo || !cuerpo.adyacente("ocupado")) {
			Iterador._error("Iterador._alias: el iterador no esta ocupado");
			return false;
		}
		if (!Iterador._es_alias_valido(alias, this)) {
			Iterador._error("Iterador._alias: el alias no es válido");
			return false;
		}

		let nalias = cuerpo.adyacente("alias");
		if (!nalias) {
			nalias = Nodo.crear();
			cuerpo._adyacente_en(nalias, "alias");
		}
		let nenlacesalias = cuerpo.adyacente("enlaces alias");
		if (!nenlacesalias) {
			nenlacesalias = Nodo.crear();
			cuerpo._adyacente_en(nenlacesalias, "enlaces alias");
		}

		// Si ya existía el alias
		const ant_alias = nalias.adyacente(alias);
		if (ant_alias) {
			const datoant = ant_alias.dato();
			ant_alias._dato(enlace);
			const nodoeli = nenlacesalias.eliminar_adyacente(datoant);
			if (nodoeli) Nodo.eliminar(nodoeli);
		} else {
			nalias._adyacente_en(Nodo.crear_con_dato(enlace), alias);
		}

		// Si ya existía el enlace
		const ant_enlace = nenlacesalias.adyacente(enlace);
		if (ant_enlace) {
			const datoant = ant_enlace.dato();
			ant_enlace._dato(alias);
			const nodoeli = nalias.eliminar_adyacente(datoant);
			if (nodoeli) Nodo.eliminar(nodoeli);
		} else {
			nenlacesalias._adyacente_en(Nodo.crear_con_dato(alias), enlace);
		}

		return true;
	}

	/**
	 * Elimina un alias individualmente.
	 * @param {string} alias Alias a eliminar.
	 * @returns {boolean} `true` si se eliminó.
	 */
	eliminar_alias(alias) {
		const cuerpo = this.raiz_cuerpo;
		if (!cuerpo || !cuerpo.adyacente("ocupado")) {
			Iterador._error("Iterador.eliminar_alias: el iterador no esta ocupado");
			return false;
		}
		const todoslosalias = cuerpo.adyacente("alias");
		if (todoslosalias) {
			const nodo1 = todoslosalias.adyacente(alias);
			if (nodo1) {
				const enlace = nodo1.dato();
				const todoslosenlacesalias = cuerpo.adyacente("enlaces alias");
				if (todoslosenlacesalias) {
					const nodo2 = todoslosenlacesalias.adyacente(enlace);
					if (nodo2) {
						todoslosalias.eliminar_adyacente(alias);
						Nodo.eliminar(nodo1);
						todoslosenlacesalias.eliminar_adyacente(enlace);
						Nodo.eliminar(nodo2);
						return true;
					} else {
						Iterador._alerta("no existe el alias que intenta eliminar(1)");
						return false;
					}
				} else {
					Iterador._alerta("no existe el alias que intenta eliminar(1)");
					return false;
				}
			}
		}
		Iterador._alerta("no existe el alias que intenta eliminar(2)");
		return false;
	}

	/**
	 * Asigna varios alias desde un objeto {alias: enlace}.
	 * @param {Object} arreglo_alias Objeto con pares alias->enlace.
	 * @returns {boolean} `true` si todos se asignaron.
	 */
	_varios_alias(arreglo_alias) {
		const cuerpo = this.raiz_cuerpo;
		if (!cuerpo || !cuerpo.adyacente("ocupado")) {
			Iterador._error("Iterador._varios_alias: el iterador no esta ocupado");
			return false;
		}
		if (typeof arreglo_alias !== 'object' || arreglo_alias === null) {
			Iterador._error("Iterador._varios_alias: debe recibir un objeto cuyas claves sean alias y valores enlaces");
			return false;
		}
		let error = false;
		for (const alias in arreglo_alias) {
			const enlace = arreglo_alias[alias];
			if (!this._alias(enlace, alias)) {
				error = true;
			}
		}
		if (error) {
			Iterador._error("Iterador._varios_alias: uno o varios pares no son válidos");
			return false;
		}
		return true;
	}

	/**
	 * Elimina todos los alias.
	 * @returns {boolean} `true` si se eliminaron.
	 */
	eliminar_todos_los_alias() {
		const cuerpo = this.raiz_cuerpo;
		if (!cuerpo || !cuerpo.adyacente("ocupado")) {
			Iterador._error("Iterador.eliminar_todos_los_alias: el iterador no esta ocupado");
			return false;
		}
		const nalias = cuerpo.adyacente("alias");
		const nenlacesalias = cuerpo.adyacente("enlaces alias");
		if (!nalias || !nenlacesalias) {
			Iterador._alerta("Iterador.eliminar_todos_los_alias: no había alias");
			return true;
		}

		// Eliminar mapa alias→enlace
		const adyacentesAlias = nalias.adyacentes();
		if (adyacentesAlias) {
			for (const enlaceAlias of Object.keys(adyacentesAlias)) {
				const nodoaelim = nalias.adyacente(enlaceAlias);
				nalias.eliminar_adyacente(enlaceAlias);
				if (!Nodo.eliminar(nodoaelim)) {
					Iterador._error("Iterador.eliminar_todos_los_alias: error al eliminar nodo alias");
				}
			}
		}
		cuerpo.eliminar_adyacente("alias");
		Nodo.eliminar(nalias);

		// Eliminar mapa enlace→alias
		const adyacentesEnlaces = nenlacesalias.adyacentes();
		if (adyacentesEnlaces) {
			for (const enlace of Object.keys(adyacentesEnlaces)) {
				const nodoaelim = nenlacesalias.adyacente(enlace);
				nenlacesalias.eliminar_adyacente(enlace);
				if (!Nodo.eliminar(nodoaelim)) {
					Iterador._error("Iterador.eliminar_todos_los_alias: error al eliminar nodo enlace alias");
				}
			}
		}
		cuerpo.eliminar_adyacente("enlaces alias");
		Nodo.eliminar(nenlacesalias);

		return true;
	}

	/**
	 * Devuelve el enlace asociado a un alias.
	 * Si no hay traducción, devuelve el alias.
	 *
	 * @param {string|number} alias Alias.
	 * @returns {*} Enlace o alias original.
	 */
    enlace(alias) {
        const cuerpo = this.raiz_cuerpo;
        if (!cuerpo || !cuerpo.adyacente("ocupado")) {
            Iterador._error("Iterador.enlace: el iterador no esta ocupado");
            return false;
        }
        if (!this.constructor._es_alias_valido(alias, this)) {
            Iterador._error("Iterador.enlace: el alias no es válido");
            return false;
        }
        const nalias = cuerpo.adyacente("alias");
        if (nalias) {
            const nodo = nalias.adyacente(alias);
            if (nodo) return nodo.dato();
        }
        return alias;
    }

	/**
	 * Devuelve el alias asociado a un enlace.
	 * Si no hay traducción, devuelve el enlace.
	 *
	 * @param {string|number} enlace Enlace.
	 * @returns {*} Alias o enlace original.
	 */
    alias(enlace) {
        const cuerpo = this.raiz_cuerpo;
        if (!cuerpo || !cuerpo.adyacente("ocupado")) {
            Iterador._error("Iterador.alias: el iterador no esta ocupado");
            return false;
        }
        if (!this.constructor._es_enlace_valido(enlace, this)) {
            Iterador._error("Iterador.alias: el enlace no es válido");
            return false;
        }
        const nenlacesalias = cuerpo.adyacente("enlaces alias");
        if (nenlacesalias) {
            const nodo = nenlacesalias.adyacente(enlace);
            if (nodo) return nodo.dato();
        }
        return enlace;
    }

    /**
     * Devuelve el nodo de alias permitidos.
     * Placeholder: debe ser implementado por subclases.
     * @returns {Nodo|null}
     * @since 1.0
     * @version 1.5i.0
     * @protected
     */
    //_alias_permitidos() { return Nodo.nodo("hola"); }

    /** Placeholder para destruir datos */
    destruir_datos() {}

    /** Placeholder para destruir datos individuales */
    destruir_datos_individuales() {}

    /** Placeholder para destruir datos temporales */
    destruir_datos_temporales() {}

    /** Placeholder para eliminar todos los alias */
    //eliminar_todos_los_alias() {}
    _liberar() {
        // Pendiente de implementación
    }
    
}