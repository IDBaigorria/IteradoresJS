/**
 * Mezcla interfaces en una clase base.
 * Solo copia métodos de instancia y estáticos. No llama constructores.
 *
 * @param {class} ClaseBase - Clase base
 * @param  {...class} Interfaces - Clases tipo interfaz
 * @returns {class} Clase nueva que combina Base con las interfaces
 * @memberof miscelaneas
 */
export function mezclar_clase_con_interfaces(ClaseBase, ...Interfaces) {
  class Combinada extends ClaseBase {
    constructor(...args) {
      super(...args); // solo llamamos al constructor de la clase base
    }
  }

  for (const Interfaz of Interfaces) {
    // Copiar métodos de instancia
    Object.getOwnPropertyNames(Interfaz.prototype).forEach(name => {
      if (name !== "constructor") {
        Object.defineProperty(
          Combinada.prototype,
          name,
          Object.getOwnPropertyDescriptor(Interfaz.prototype, name)
        );
      }
    });

    // Copiar métodos y propiedades estáticas
    Object.getOwnPropertyNames(Interfaz).forEach(key => {
      if (key !== "prototype" && key !== "name") {
        Object.defineProperty(
          Combinada,
          key,
          Object.getOwnPropertyDescriptor(Interfaz, key)
        );
      }
    });
  }

  return Combinada;
}