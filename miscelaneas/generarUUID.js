/**
 * Genera un UUID versión 4 (RFC 4122).
 * 
 * Si el entorno soporta `crypto.randomUUID()`, utiliza esa función
 * para obtener un UUID criptográficamente seguro.
 * En caso contrario, aplica un polyfill basado en `Math.random()`,
 * que mantiene el formato correcto pero no es apto para seguridad.
 * 
 * @function generarUUID
 * @returns {string} UUID v4 en formato estándar (ej. "3f9a1b70-9210-4ac9-b3c2-71a27b5bdf83")
 * 
 * @example
 * const id = generarUUID();
 * console.log(id); // "e5b0d6f9-20b4-4a93-99f0-21880e78e2b0"
 * 
 * @note
 * La versión con `crypto.randomUUID()` es criptográficamente segura.
 * El polyfill con `Math.random()` solo debe usarse para identificadores
 * internos, logs o nombres de objetos temporales.
 */
export function generarUUID() {
  // Usa la implementación nativa si está disponible
  if (crypto?.randomUUID) return crypto.randomUUID();

  // Polyfill: genera un UUID v4 válido (no criptográficamente seguro)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
