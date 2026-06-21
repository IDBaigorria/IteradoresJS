/**
 * Punto de entrada principal del framework (módulo raíz).
 *
 * Centraliza la carga de todos los módulos en un orden específico
 * para garantizar que los comandos y comunicadores se autoencolen
 * en {@link RegistroGlobal} antes de que el {@link Controlador}
 * sea evaluado e inicializado.
 *
 * ## Orden de carga y justificación
 *
 * 1. **Comandos y Comunicadores**
 *    `import './Comandos/index.js'` e `import './Comunicadores/index.js'`
 *    se colocan **antes que cualquier export que referencie al Controlador**.
 *    Estos módulos index importan a su vez cada comando/comunicador,
 *    cuyo código ejecuta `RegistroGlobal.encolar_comando()` al final del
 *    archivo. Como no importan directamente al Controlador, no disparan
 *    su inicialización prematura.
 *
 * 2. **Exports del resto de módulos**
 *    Las líneas `export { ... } from '...'` reexportan las clases
 *    principales (Objeto, Nodo, NodoElectrico, Comando, Comunicador,
 *    Controlador, etc.). La evaluación de `./Controlador/index.js`
 *    ejecuta el código de `Controlador.js`, que finaliza con
 *    `Controlador.inicializar()`. En ese momento los pendientes ya
 *    están encolados y se procesan correctamente.
 *
 * ## Notas para desarrollo
 *
 * - Los comandos y comunicadores deben importar únicamente
 *   {@link RegistroGlobal} y las dependencias base; nunca deben
 *   importar directamente al Controlador.
 * - Si se añaden módulos dinámicos después de la inicialización,
 *   deben encolarse en {@link RegistroGlobal} y opcionalmente
 *   gatillar un reprocesamiento.
 * - El orden de los imports es relevante: los efectos secundarios
 *   (autoencolación) ocurren antes de que el Controlador se
 *   evalúe.
 *
 * @module Index
 * @since  1.3.0
 * @version 1.3.4
 */

// ═══════════════════════════════════════════════════════
// 1. Autoencolación de comandos y comunicadores
// ═══════════════════════════════════════════════════════
import './Comandos/index.js';         // puebla comandos_pendientes
import './Comunicadores/index.js';    // puebla comunicadores_pendientes

// ═══════════════════════════════════════════════════════
// 2. Exports públicos del framework
// ═══════════════════════════════════════════════════════
export { Objeto } from './Nucleo/index.js';
export { Nodo } from './Nodos/index.js';
export { NodoElectrico } from './Nodos/index.js';
export { RelojAstronomico } from './Tiempo/index.js'
export { Comunicador } from './Comunicadores/index.js';
export { Comando } from './Comandos/index.js';
export { Controlador, RegistroGlobal } from './Controlador/index.js';
export { Conf, Entorno } from './Configuracion/index.js';