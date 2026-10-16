/**
 * Configuración temprana de Conf y Entorno.
 *
 * Este módulo existe por una razón de orden de evaluación:
 * los `import` estáticos de un módulo ES se evalúan ANTES
 * que el cuerpo del módulo. Si `arranque.js` importara
 * `Controlador` directamente junto con la configuración,
 * `configurar_conf(Conf)` no se ejecutaría antes de que el
 * Controlador se inicialice (su auto-init corre al final
 * del módulo), y leería la config por defecto.
 *
 * Solución: un módulo separado que hace la configuración
 * como efecto de lado. `arranque.js` lo importa ANTES que
 * a Controlador. El orden de los `import` determina el
 * orden de evaluación (depth-first, orden de aparición).
 *
 * @version 1.5plugin.8d
 * @since 1.5plugin.8d
 */

import { Conf, Entorno } from "../Configuracion/index.js";
import { configurar_conf } from "./ConfiguracionApli.js";

// Salida consola: los caminos HTML del framework tocan
// document, que no existe en el service worker.
Entorno.establecer_salida(Entorno.SALIDA_CONSOLA);
Entorno.establecer_modo(Entorno.MODO_DESARROLLO);

// Config propia del plugin.
configurar_conf(Conf);