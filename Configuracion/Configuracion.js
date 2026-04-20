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

  /* =========================
   BLOQUE: ASTROS PRECONFIGURADOS (OPCIÓN MIXTA)
   ========================= */

  /* SOL *//*
  static SOL = new Astro({
    nombre: "Sol",
    masa_kg: 1.98847e30,
    radio_m: 695700000,
    periodo_rotacion_s: 25.38 * 24*3600,
    radio_orbita_ua: 0,
    periodo_orbital_dias: Infinity,
    inclinacion_orbital_deg: 0.0,
    referencia: null,
    fase_inicial: 0
  });
*/
  /* TIERRA *//*
  static TIERRA = new Astro({
    nombre: "Tierra",
    masa_kg: 5.97219e24,
    radio_m: 6371008.8,
    periodo_rotacion_s: 23.9344696 * 3600.0,
    radio_orbita_ua: 1.00000011,
    periodo_orbital_dias: 365.256363004,
    inclinacion_orbital_deg: 0.0,
    referencia: SOL,
    fase_inicial: 0.0
  });

  /* LUNA *//*
  static LUNA = new Astro({
    nombre: "Luna",
    masa_kg: 7.342e22,
    radio_m: 1737100,
    periodo_rotacion_s: 27.321661 * 24*3600,
    radio_orbita_ua: 384400 / AU_EN_METROS,
    periodo_orbital_dias: 27.321661,
    inclinacion_orbital_deg: 5.145,
    referencia: TIERRA,
    fase_inicial: 0.0
  });

  /* VENUS *//*
  static VENUS = new Astro({
    nombre: "Venus",
    masa_kg: 4.8675e24,
    radio_m: 6051800,
    periodo_rotacion_s: -243.025 * 24*3600,
    radio_orbita_ua: 0.72333566,
    periodo_orbital_dias: 224.70069,
    inclinacion_orbital_deg: 3.395,
    referencia: SOL,
    fase_inicial: 0.1
  });

  /* MARTE *//*
  static MARTE = new Astro({
    nombre: "Marte",
    masa_kg: 6.4171e23,
    radio_m: 3389500,
    periodo_rotacion_s: 24.6229 * 3600,
    radio_orbita_ua: 1.523679,
    periodo_orbital_dias: 686.98,
    inclinacion_orbital_deg: 1.850,
    referencia: SOL,
    fase_inicial: 0.2
  });

  /* JUPITER *//*
  static JUPITER = new Astro({
    nombre: "Jupiter",
    masa_kg: 1.89813e27,
    radio_m: 69911000,
    periodo_rotacion_s: 9.925 * 3600.0,
    radio_orbita_ua: 5.204267,
    periodo_orbital_dias: 4332.59,
    inclinacion_orbital_deg: 1.305,
    referencia: SOL,
    fase_inicial: 0.3
  });

  static LISTA_ASTROS_PRECONFIG = [SOL, TIERRA, LUNA, VENUS, MARTE, JUPITER];
  static MAPA_ASTROS_PRECONFIG = mapa_por_nombre(LISTA_ASTROS_PRECONFIG);*/
}

export {Conf}