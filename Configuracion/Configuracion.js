/**
 * Clase de configuración global de la aplicación.
 * Todas las propiedades son estáticas e inmutables.
 *
 * @class
 * @memberof Configuracion
 *
 */
class Conf {
  /**
   * Nombre de la aplicación 
   * @type {string}  */
  static NOMBRE_APP = "MiSuperApp";

  /**
   * Versión de la aplicación 
   * @type {string}  */
  static VERSION_APP = "0.0.0";

  /**
   * Autor de la aplicación  
   * @type {string}*/
  static AUTOR_APP = "Ignacio David Baigorria";

  /**
   * Prefijo de sesión basado en el nombre de la app
   *  @type {string}  */
  static PREFIJO_SESSION = Conf.NOMBRE_APP + "_";

  /** 
   * Si se ejecuta en localhost
   * @type {boolean}  */
  static LOCAL = true;

  // --- Bases de datos (temporal, luego reemplazarás) ---

  /** 
   * Host de la base de datos general
   * @type {string}  */
  static HOST_SQL = "localhost";

  /** 
   * Usuario de la base de datos general
   * @type {string}  */
  static USUARIO_SQL = "root";

  /** 
   * Contraseña de la base de datos general
   * @type {string}  */
  static CONTRASENA_SQL = "";

  /** 
   * Nombre de la base de datos general
   * @type {string}  */
  static NOMBRE_BD_INDEXEDDB = "HyS";

   /**
   * Método predeterminado de persistencia de la superestructura.
   * Posibles valores: "sql", "json", "texto_plano".
   * 
   * @type {string}
   * @default "sql"
   */
  static SUPERESTRUCTURA_METODO_PERDURAR = "SQL";

  /** 
   * Host de la base de datos de superestructura
   * @type {string}  */
  static SUPERESTRUCTURA_HOST_SQL = Conf.HOST_SQL;

  /** 
   * Usuario de la base de datos de superestructura
   * @type {string}  */
  static SUPERESTRUCTURA_USUARIO_SQL = Conf.USUARIO_SQL;

  /** 
   * Contraseña de la base de datos de superestructura
   * @type {string}  */
  static SUPERESTRUCTURA_CONTRASENA_SQL = Conf.CONTRASENA_SQL;

  /** 
   * Nombre de la base de datos de superestructura
   * @type {string}  */
  static SUPERESTRUCTURA_NOMBRE_BD_INDEXEDDB = Conf.NOMBRE_BD_INDEXEDDB;


  /** @type {string} Carpeta donde se guardan los archivos JSON */
  static SUPERESTRUCTURA_CARPETA_GUARDAR_JSON = "";

  /** @type {string} Carpeta donde se guardan los archivos de texto plano */
  static SUPERESTRUCTURA_CARPETA_GUARDAR_TEXTO_PLANO = "";


  // --- Errores y alertas ---
  /////////////////////////////////////////////////////////////////////////////
  /**
   * Indica si la recolección de errores está activada de forma predeterminada.
   *
   * Esta constante define el estado inicial de la recolección de errores
   * para todos los objetos del sistema. Su valor puede ser sobrescrito
   * dinámicamente mediante los métodos 
   * {@link Nucleo.Objeto.activar_errores Objeto.activar_errores()},
   * {@link Nucleo.Objeto.desactivar_errores Objeto.desactivar_errores()}, 
   * {@link Nucleo.Objeto.activar_errores_y_alertas Objeto.activar_errores_y_alertas()} y
   * {@link Nucleo.Objeto.desactivar_errores Objeto.desactivar_errores_y_alertas()}
   * 
   * @type {boolean}
   * @const
   */
  static ACTIVAR_ERRORES = true;

  /**
   * Indica si la recolección de errores está activada de forma predeterminada.
   *
   * Esta constante define el estado inicial de la recolección de errores
   * para todos los objetos del sistema. Su valor puede ser sobrescrito
   * dinámicamente mediante los métodos 
   * {@link Nucleo.Objeto.activar_alertas Objeto.activar_alertas()},
   * {@link Nucleo.Objeto.desactivar_alertas Objeto.desactivar_alertas()}, 
   * {@link Nucleo.Objeto.activar_errores_y_alertas Objeto.activar_errores_y_alertas()} y
   * {@link Nucleo.Objeto.desactivar_errores Objeto.desactivar_errores_y_alertas()}
   * 
   * @type {boolean}
   * @const
   */
   static ACTIVAR_ALERTAS = true;
   
   /**
   * Límite máximo de profundidad de la pila de llamadas a almacenar
   * para cada error o alerta recolectada.
   *
   * Limitar la profundidad ayuda a controlar el uso de memoria,
   * ya que cada error o alerta conserva parte de la traza de llamadas
   * que lo originó. Este valor afecta el comportamiento de los métodos
   * {@link Nucleo.Objeto._error Objeto._error()}
   * y {@link Nucleo.Objeto._alerta Objeto._alerta()}.
   *
   * @type {number}
   * @const
   */
  static ERRORES_Y_ALERTAS__PILA_DE_LLAMADAS__LIMITE = 10;


  //Nodos electricos////////////////////////////////////////////////////////////////////////////
  /**
   * Capacidad maxima almacenada por defecto. 
   * 
   * Se usa cuando se crean nodos nuevos y no se especifica la capacidad del mismo
   * @type {number}
   * @const 
   */
  static CAPACIDAD_NODO_ELECTRICO=256;
  
  /**
   * Cantidad de energia por defecto que se pierde por ciclo de tiempo
   * @type {number}
   * @const 
   */
  static FUGA_NODO_ELECTRICO=0;
  /**
   * Tiempo base de un ciclo de simulación (en segundos).
   * Se usa para calcular la fuga de energía proporcional al tiempo real.
   * @type {number}
   * @const 
   */
  static TIEMPO_CICLO= 1.0; // segundos
    // ═══════════════════════════════════════════════════════════
    // APARIENCIA DE BLOQUES DE DEPURACIÓN V1.3.0
    // ═══════════════════════════════════════════════════════════

    /**
     * Colores de fondo, texto y borde para el bloque de errores.
     * @type {{ fondo: string, texto: string, borde: string }}
     */
    static ERRORES_COLORES= {
        fondo: '#fee',
        texto: '#900',
        borde: '#c00',
    }
    

    /**
     * Colores para el bloque de alertas.
     * @type {{ fondo: string, texto: string, borde: string }}
     */
    static ALERTAS_COLORES= {
        fondo: '#fffde7',
        texto: '#864100',
        borde: '#ffc107',
    }

    /**
     * Colores para el bloque de impresión de nodos.
     * @type {{ fondo: string, texto: string, borde: string }}
     */
    static NODOS_COLORES= {
        fondo: '#eef6ff',
        texto: '#003366',
        borde: '#0066cc',
    }

    /**
     * ID del elemento contenedor donde se insertan los bloques de errores.
     * @type {string}
     */
    static ERRORES_CONTENEDOR_ID= 'errores-log';

    /**
     * ID del elemento contenedor para los bloques de alertas.
     * @type {string}
     */
    static ALERTAS_CONTENEDOR_ID= 'alertas-log';

    /**
     * ID del elemento contenedor para los bloques de nodos.
     * @type {string}
     */
    static NODOS_CONTENEDOR_ID= 'nodos-log';


    // ═══════════════════════════════════════════════════════════
    // RELOJ ASTRONÓMICO
    // ═══════════════════════════════════════════════════════════

    /**
     * Peso del vector solar en la combinación final del Reloj Astronómico.
     *
     * Determina la influencia relativa del Sol frente a la Luna en el vector
     * gravitacional resultante. Un valor mayor da más peso al ciclo día/noche.
     *
     * @type {number}
     * @see RelojAstronomico
     * @since 1.3.5
     */
    static RELOJ_ALFA_SOL = 0.7;

    /**
     * Peso del vector lunar en la combinación final del Reloj Astronómico.
     *
     * @type {number}
     * @since 1.3.5
     */
    static RELOJ_BETA_LUNA = 0.3;

    /**
     * Inclinación de la eclíptica respecto al ecuador celeste, en grados.
     *
     * @type {number}
     * @since 1.3.5
     */
    static RELOJ_INCLINACION_ECLIPTICA = 23.5;

    /**
     * Inclinación de la órbita lunar respecto a la eclíptica, en grados.
     *
     * @type {number}
     * @since 1.3.5
     */
    static RELOJ_INCLINACION_LUNAR = 5.15;

    /**
     * Período de precesión del nodo ascendente lunar, en años.
     *
     * @type {number}
     * @since 1.3.5
     */
    static RELOJ_PERIODO_PRECESION_NODAL = 18.6;

    /**
     * Radio medio de la Tierra en metros (reservado para uso futuro).
     *
     * @type {number}
     * @since 1.3.5
     */
    static RELOJ_RADIO_TIERRA = 6371000.0;

    /**
     * Duración de un día solar medio, en segundos.
     *
     * @type {number}
     * @since 1.3.5
     */
    static RELOJ_SEGUNDOS_POR_DIA = 86400.0;

    /**
     * Duración de un año juliano (365.25 días), en segundos.
     *
     * @type {number}
     * @since 1.3.5
     */
    static RELOJ_SEGUNDOS_POR_ANIO = 31557600.0;

    /**
     * Duración de un mes sinódico lunar (~29.53 días), en segundos.
     *
     * @type {number}
     * @since 1.3.5
     */
    static RELOJ_SEGUNDOS_POR_MES_SINODICO = 2551442.8;

    /**
     * Duración de un día sidéreo (23h 56m 4s), en segundos.
     *
     * @type {number}
     * @since 1.3.5
     */
    static RELOJ_SEGUNDOS_POR_DIA_SIDEREO = 86164.0905;

    // ═══════════════════════════════════════════════════════════
    // UBICACIÓN GEOGRÁFICA
    // ═══════════════════════════════════════════════════════════

    /**
     * Latitud predeterminada cuando no se puede detectar la ubicación real.
     *
     * Utilizada por {@link Entorno.obtener_coordenadas} como último recurso.
     *
     * @type {number}
     * @since 1.3.6
     */
    static LATITUD_PREDETERMINADA = -34.0;   //Tres Arroyos, Argentina

    /**
     * Longitud predeterminada cuando no se puede detectar la ubicación real.
     *
     * @type {number}
     * @since 1.3.6
     */
    static LONGITUD_PREDETERMINADA = -64.0;

    /**
     * URL del servicio de geolocalización por IP.
     *
     * El servicio debe ser accesible vía fetch desde el navegador (soportar CORS),
     * gratuito para uso comercial y devolver un JSON con las claves "lat" y "lon"
     * (o similar, ver mapeo en Entorno.obtener_coordenadas).
     *
     * @type {string}
     * @since 1.3.6
     */
    static GEOLOCALIZACION_URL = 'https://ipapi.co/json/';
    //static GEOLOCALIZACION_URL = 'https://freegeoip.app/json/';

    // ═══════════════════════════════════════════════════════════
    // MOTOR DE EJECUCIÓN (v1.3.7)
    // ═══════════════════════════════════════════════════════════
    /**
     * Número máximo de ciclos que ejecuta el motor antes de detenerse.
     *
     * Un valor de 0 significa "sin límite" (bucle infinito).
     * En pruebas, se puede poner un número pequeño (ej. 1 o 2) para verificar
     * el funcionamiento sin colgar el proceso.
     *
     * @type {number}
     * @since 1.3.7
     */
    static MOTOR_MAX_CICLOS = 2; //0=infinito
    /**
     * Frecuencia del motor en ciclos por minuto.
     *
     * Determina cuántas veces por minuto el motor ejecuta una rodaja de trabajo.
     * Es la configuración primaria de la que se deriva {@link MOTOR_INTERVALO_MS}.
     * Un valor de 20 equivale a un ciclo cada 3 segundos.
     *
     * @type {number}
     * @since 1.3.7
     */
    static MOTOR_CICLOS_POR_MINUTO = 20;

    /**
     * Intervalo en milisegundos entre ciclos del motor.
     *
     * Se calcula automáticamente como `60000 / MOTOR_CICLOS_POR_MINUTO`.
     * Con el valor por defecto (20), resulta en 3000 ms.
     *
     * @type {number}
     * @since 1.3.7
     */
    static get MOTOR_INTERVALO_MS() {
        return 60000 / this.MOTOR_CICLOS_POR_MINUTO;
    }

    /**
     * Número máximo de comandos que se ejecutan en un solo ciclo del motor.
     *
     * @type {number}
     * @since 1.3.7
     */
    static MOTOR_QUANTUM = 20;

    /**
     * Tiempo máximo en segundos que el motor espera durante una pausa urgente
     * antes de reanudarse automáticamente.
     *
     * @type {number}
     * @since 1.3.7
     */
    static MOTOR_PAUSA_URGENTE_TIMEOUT_S = 30;

    /**
     * Matriz que actúa como marca de inicio para conjuntos desordenados.
     * @type {number[][]}
     * @since 1.4.2
     */
    static MATRIZ_MARCA_CONJUNTO = [[1, 1], [0, 1]];
}

export {Conf}