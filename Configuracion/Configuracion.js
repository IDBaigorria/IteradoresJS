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

    // ═══════════════════════════════════════════════════════════
    // PRIMOS PRECARGADOS (v1.4.8)
    // ═══════════════════════════════════════════════════════════

    /**
     * Primeros 512 números primos, precargados para evitar generación bajo demanda.
     *
     * Rangos semánticos (v1.4.8+):
     *   - Índices   0..255  → bytes del Tálamo (mapeo byte↔matriz)
     *   - Índice  256       → NodoPrimo de marcado: comando
     *   - Índice  257       → NodoPrimo de marcado: medio
     *   - Índice  258       → NodoPrimo de marcado: dirección
     *   - Índice  259       → NodoPrimo de marcado: mensaje
     *   - Índices 260..264  → NodoPrimo de acción: aprender, predecir, imaginar, controlar, ejecutar
     *   - Índices 265..511  → reservados para futuros marcadores o acciones
     *
     * @type {number[]}
     * @const
     * @since 1.4.8
     */
    static PRIMOS_PRECARGADOS = [
        // 0..255: bytes del Tálamo
        2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71,
        73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151,
        157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233,
        239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317,
        331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419,
        421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503,
        509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607,
        613, 617, 619, 631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691, 701,
        709, 719, 727, 733, 739, 743, 751, 757, 761, 769, 773, 787, 797, 809, 811,
        821, 823, 827, 829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907, 911,
        919, 929, 937, 941, 947, 953, 967, 971, 977, 983, 991, 997, 1009, 1013,
        1019, 1021, 1031, 1033, 1039, 1049, 1051, 1061, 1063, 1069, 1087, 1091,
        1093, 1097, 1103, 1109, 1117, 1123, 1129, 1151, 1153, 1163, 1171, 1181,
        1187, 1193, 1201, 1213, 1217, 1223, 1229, 1231, 1237, 1249, 1259, 1277,
        1279, 1283, 1289, 1291, 1297, 1301, 1303, 1307, 1319, 1321, 1327, 1361,
        1367, 1373, 1381, 1399, 1409, 1423, 1427, 1429, 1433, 1439, 1447, 1451,
        1453, 1459, 1471, 1481, 1483, 1487, 1489, 1493, 1499, 1511, 1523, 1531,
        1543, 1549, 1553, 1559, 1567, 1571, 1579, 1583, 1597, 1601, 1607, 1609,
        1613, 1619,
        
        // 256..511: mas primos
        1621, 1627, 1637, 1657, 1663, 1667, 1669, 1693, 1697, 
        1699, 1709, 1721, 1723, 1733, 1741, 1747, 1753, 1759, 1777, 1783, 1787,
        1789, 1801, 1811, 1823, 1831, 1847, 1861, 1867, 1871, 1873, 1877, 1879,
        1889, 1901, 1907, 1913, 1931, 1933, 1949, 1951, 1973, 1979, 1987, 1993,
        1997, 1999, 2003, 2011, 2017, 2027, 2029, 2039, 2053, 2063, 2069, 2081,
        2083, 2087, 2089, 2099, 2111, 2113, 2129, 2131, 2137, 2141, 2143, 2153,
        2161, 2179, 2203, 2207, 2213, 2221, 2237, 2239, 2243, 2251, 2267, 2269,
        2273, 2281, 2287, 2293, 2297, 2309, 2311, 2333, 2339, 2341, 2347, 2351,
        2357, 2371, 2377, 2381, 2383, 2389, 2393, 2399, 2411, 2417, 2423, 2437,
        2441, 2447, 2459, 2467, 2473, 2477, 2503, 2521, 2531, 2539, 2543, 2549,
        2551, 2557, 2579, 2591, 2593, 2609, 2617, 2621, 2633, 2647, 2657, 2659,
        2663, 2671, 2677, 2683, 2687, 2689, 2693, 2699, 2707, 2711, 2713, 2719,
        2729, 2731, 2741, 2749, 2753, 2767, 2777, 2789, 2791, 2797, 2801, 2803,
        2819, 2833, 2837, 2843, 2851, 2857, 2861, 2879, 2887, 2897, 2903, 2909,
        2917, 2927, 2939, 2953, 2957, 2963, 2969, 2971, 2999, 3001, 3011, 3019,
        3023, 3037, 3041, 3049, 3061, 3067, 3079, 3083, 3089, 3109, 3119, 3121,
        3137, 3163, 3167, 3169, 3181, 3187, 3191, 3203, 3209, 3217, 3221, 3229,
        3251, 3253, 3257, 3259, 3271, 3299, 3301, 3307, 3313, 3319, 3323, 3329,
        3331, 3343, 3347, 3359, 3361, 3371, 3373, 3389, 3391, 3407, 3413, 3433,
        3449, 3457, 3461, 3463, 3467, 3469, 3491, 3499, 3511, 3517, 3527, 3529,
        3533, 3539, 3541, 3547, 3557, 3559, 3571, 3581, 3583, 3593, 3607, 3613,
        3617, 3623, 3631, 3637, 3643, 3659, 3671,
    ];
}

export {Conf}