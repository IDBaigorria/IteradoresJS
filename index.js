// ═══════════════════════════════════════════════════════
// 1. Primero todos los exports
// ═══════════════════════════════════════════════════════
export { Objeto } from './Nucleo/index.js';
export { Nodo } from './Nodos/index.js';
export { NodoElectrico } from './Nodos/index.js';
export { Comunicador } from './Comunicadores/index.js';
export { Comando } from './Comandos/index.js';
export { Controlador } from './Controlador/index.js';
export { Conf, Entorno } from './Configuracion/index.js';

// ═══════════════════════════════════════════════════════
// 2. Después los imports que ejecutan autoencolación
// ═══════════════════════════════════════════════════════
//import './Comandos/index.js';         // puebla registro_pendiente
//import './Comunicadores/index.js';    // puebla registro_comunicadores_pendiente