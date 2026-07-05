/**
 * @namespace Interfaces
 * @memberof Nodos
 *
 * Punto central de importación y re‑exportación de todas las interfaces
 * que definen los contratos del sistema de nodos.
 *
 * ## Interfaces incluidas
 *
 * | Interfaz                    | Implementada por         | Propósito                                             |
 * |-----------------------------|--------------------------|-------------------------------------------------------|
 * | `FabricaDeNodos`            | `Nodo`                   | Fábricas básicas (crear, nodo, eliminar)              |
 * | `Datos`                     | `Nodo`                   | Almacenamiento de datos simples                       |
 * | `Adyacentes`                | `NodoElectrico`          | Gestión de aristas salientes                          |
 * | `Incidentes`                | `NodoElectrico`          | Gestión de aristas entrantes                          |
 * | `IncidentesDobleVia`        | `NodoElectrico`          | Extiende `Incidentes` con doble vía                   |
 * | `AccesoAEspeciales`         | `Nodo`                   | Acceso al registro de nodos especiales                |
 * | `AccesoASuperestructura`    | `Nodo`                   | Acceso a la superestructura                           |
 * | `Impresion`                 | `NodoElectrico`          | Impresión para depuración (HTML / consola)            |
 * | `Energia`                   | `NodoElectrico`          | Gestión de energía, capacidad y fuga                  |
 * | `Fase`                      | `NodoElectrico`          | Manejo de la fase de trabajo global                   |
 * | `Peso`                      | `NodoElectrico`          | Asignación y consulta de pesos en enlaces             |
 * | `AdyacenteConPeso`          | `NodoElectrico`          | Creación de enlaces con peso en un solo paso          |
 * | `DatosElectrico`            | `NodoElectrico`          | Almacenamiento de datos multifase y multidimensional  |
 * | `FabricaDeNodosElectricos`  | `NodoElectrico`          | Fábricas de nodos eléctricos (crear, crear_con_dato)  |
 * | `IdentidadNumerica`         | `NodoNumerico`           | Matriz identidad y p‑grama multifase                  |
 * | `FabricaDeNodosNumericos`   | `NodoNumerico`           | Fábricas de nodos numéricos (primos, secuencias, paralelos) |
 * | `GestorPrimosLibres`        | `NodoPrimo`              | Pool de primos libres por fase                        |
 *
 * ## Convenciones del proyecto
 *
 * - **camelCase** solo para clases e interfaces.
 * - **snake_case** para variables, funciones, métodos y archivos.
 * - Los setters usan el prefijo `_` (ej. `_identidad`, `_fase`).
 * - Documentación JSDoc exhaustiva con `@param`, `@returns`, `@see`, etc.
 *
 * @version 1.4.4
 * @since 1.0.0
 * @author Ignacio David Baigorria
 */
import { FabricaDeNodos } from './FabricaDeNodos.js';
import { Datos } from './Datos.js';
import { Adyacentes } from './Adyacentes.js';
import { Incidentes } from './Incidentes.js';
import { IncidentesDobleVia } from './IncidentesDobleVia.js';
import { AccesoAEspeciales } from './AccesoAEspeciales.js';
import { AccesoASuperestructura } from './AccesoASuperestructura.js';
import { Impresion } from './Impresion.js';
import { Energia } from './Energia.js';
import { Fase } from './Fase.js';
import { Peso } from './Peso.js';
import { AdyacenteConPeso } from './AdyacenteConPeso.js';
import { DatosElectrico } from './DatosElectrico.js';

import { FabricaDeNodosElectricos } from './FabricaDeNodosElectricos.js';
import { IdentidadNumerica } from './IdentidadNumerica.js';
import { FabricaDeNodosNumericos } from './FabricaDeNodosNumericos.js';
import { GestorPrimosLibres } from './GestorPrimosLibres.js';

export {
    FabricaDeNodos,
    Datos,
    Adyacentes,
    FabricaDeNodosElectricos,
    Fase,
    Incidentes,
    IncidentesDobleVia,
    Energia,
    AccesoASuperestructura,
    AccesoAEspeciales,
    Impresion,
    Peso,
    AdyacenteConPeso,
    DatosElectrico,
    IdentidadNumerica,
    FabricaDeNodosNumericos,
    GestorPrimosLibres
}