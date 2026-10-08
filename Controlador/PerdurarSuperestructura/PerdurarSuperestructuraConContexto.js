import { PerdurarSuperestructura } from "./PerdurarSuperestructura.js";

/**
 * @interface PerdurarSuperestructuraConContexto
 * @extends PerdurarSuperestructura
 *
 * Extiende PerdurarSuperestructura agregando carga y guardado
 * parciales por contexto.
 *
 * Un contexto es un ID especial del grafo (nodo con ID no
 * numérico) que actúa como raíz. El framework no distingue
 * su semántica (usuarios, sesiones, tipos, dueños, etc.):
 * todos son contextos por igual.
 *
 * La interfaz recibe nombres de contextos (IDs especiales),
 * no máscaras. La máscara es un detalle de implementación.
 *
 * @author Ignacio David Baigorria
 * @since 1.5i.7k
 */
class PerdurarSuperestructuraConContexto extends PerdurarSuperestructura {
    static cargar_parcial() { throw new Error("Método cargar_parcial() debe ser implementado"); }
    static guardar_parcial() { throw new Error("Método guardar_parcial() debe ser implementado"); }
    static listar_contextos() { throw new Error("Método listar_contextos() debe ser implementado"); }
}

export { PerdurarSuperestructuraConContexto };