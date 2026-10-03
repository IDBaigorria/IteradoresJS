/**
 * Catalogo de pruebas disponibles.
 *
 * Cada prueba exporta un objeto `{ id, nombre, descripcion,
 * ejecutar(ctx) }`. Aca se importan y se listan.
 *
 * @version 1.5plugin.1
 */

import { prueba as arranque } from "./prueba_01_arranque.js";

export const CATALOGO = [
    arranque
];