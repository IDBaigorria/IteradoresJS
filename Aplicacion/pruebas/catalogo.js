/**
 * Catalogo de pruebas disponibles, agrupadas en PESTANAS
 * tematicas. Cada pestana tiene GRUPOS por rol y un campo
 * `limpieza` con las categorias que limpia su boton
 * "Limpiar pruebas".
 *
 * Categorias validas: ventas, cancelaciones, viajes,
 * pasajeros, empresas, terminales, usuarios, huerfanos.
 *
 * @version 1.5plugin.7w
 */

// === Base ===
import { prueba as arranque } from "./prueba_01_arranque.js";
import { prueba as login } from "./prueba_02_login.js";
import { prueba as cerrar_sesion_cierra_modales } from "./prueba_44_cerrar_sesion_cierra_modales.js";

// === Administrador ===
import { prueba as bloqueo_expirado_permite_login } from "./prueba_54_bloqueo_expirado_permite_login.js";
import { prueba as eliminar_usuario_limpia_nodos } from "./prueba_40_eliminar_usuario_limpia_nodos.js";

// === Puntos de venta ===
import { prueba as alta_terminal } from "./prueba_19_alta_terminal.js";
import { prueba as eliminar_terminal_limpia_nodos } from "./prueba_32_eliminar_terminal_limpia_nodos.js";

// === Empresas/Micros ===
import { prueba as alta_empresa } from "./prueba_45_alta_empresa.js";
import { prueba as empresa_nombre_vacio } from "./prueba_46_empresa_nombre_vacio.js";
import { prueba as empresa_cancelar } from "./prueba_47_empresa_cancelar.js";
import { prueba as alta_vehiculo } from "./prueba_48_alta_vehiculo.js";
import { prueba as vehiculo_patente_vacia } from "./prueba_49_vehiculo_patente_vacia.js";
import { prueba as vehiculo_cancelar } from "./prueba_50_vehiculo_cancelar.js";
import { prueba as subir_foto_reemplazo_limpia_nodos } from "./prueba_55_subir_foto_reemplazo_limpia_nodos.js";
import { prueba as alta_micro } from "./prueba_21_alta_micro.js";
import { prueba as micro_sin_empresa } from "./prueba_22_micro_sin_empresa.js";
import { prueba as micro_sin_vehiculo } from "./prueba_23_micro_sin_vehiculo.js";
import { prueba as micro_monto_vacio } from "./prueba_24_micro_monto_vacio.js";
import { prueba as micro_monto_negativo } from "./prueba_25_micro_monto_negativo.js";
import { prueba as micro_cancelar } from "./prueba_26_micro_cancelar.js";
import { prueba as micro_mismo_vehiculo_dos_veces } from "./prueba_27_micro_mismo_vehiculo.js";
import { prueba as micro_vehiculo_sin_asientos } from "./prueba_28_micro_vehiculo_sin_asientos.js";
import { prueba as micro_colision_numeracion } from "./prueba_29_micro_colision_numeracion.js";
import { prueba as eliminar_vehiculo_limpia_nodos } from "./prueba_37_eliminar_vehiculo_limpia_nodos.js";
import { prueba as eliminar_empresa_limpia_nodos } from "./prueba_38_eliminar_empresa_limpia_nodos.js";
import { prueba as agregar_micro_actualiza_empresas_compartido } from "./prueba_64_agregar_micro_empresa_compartido.js";

// === Viajes ===
import { prueba as alta_viaje } from "./prueba_20_alta_viaje.js";
import { prueba as eliminar_viaje_limpia_nodos } from "./prueba_30_eliminar_viaje_limpia_nodos.js";
import { prueba as eliminar_micro_limpia_nodos } from "./prueba_31_eliminar_micro_limpia_nodos.js";
import { prueba as editar_paradas_limpia_nodos } from "./prueba_33_editar_paradas_limpia_nodos.js";
import { prueba as editar_paradas_sin_hora_limpia_nodos } from "./prueba_42_editar_paradas_sin_hora_limpia_nodos.js";
import { prueba as limpiar_viajes_prueba_limpia_nodos } from "./prueba_39_limpiar_viajes_prueba_limpia_nodos.js";
import { prueba as listar_viajes_indice_comportamiento } from "./prueba_43_listar_viajes_indice_comportamiento.js";
import { prueba as eliminar_viaje_con_terminal_autorizado } from "./prueba_61_eliminar_viaje_con_terminal.js";
import { prueba as autorizar_terminal_aparece_en_compartido } from "./prueba_62_autorizar_terminal_compartido.js";
import { prueba as desautorizar_terminal_desaparece_del_compartido } from "./prueba_63_desautorizar_terminal_compartido.js";

// === Ventas ===
import { prueba as autocompletado_dni_terminal_clientes } from "./prueba_18_autocompletado_dni_terminal_clientes.js";
import { prueba as venta_basica } from "./prueba_03_venta_basica.js";
import { prueba as venta_cuotas } from "./prueba_04_venta_cuotas.js";
import { prueba as venta_transferencia } from "./prueba_05_venta_transferencia.js";
import { prueba as venta_dos_asientos } from "./prueba_06_venta_dos_asientos.js";
import { prueba as venta_tres_asientos } from "./prueba_07_venta_tres_asientos.js";
import { prueba as venta_ligadura_dni_igual } from "./prueba_08_venta_ligadura_dni_igual.js";
import { prueba as venta_comprador_lleno_pasajero_vacio } from "./prueba_09_venta_comprador_lleno_pasajero_vacio.js";
import { prueba as venta_dni_duplicado } from "./prueba_10_venta_dni_duplicado.js";
import { prueba as venta_correccion_dni_pasajero } from "./prueba_11_venta_correccion_dni_pasajero.js";
import { prueba as venta_correccion_dni_comprador } from "./prueba_12_venta_correccion_dni_comprador.js";
import { prueba as venta_monto_mayor_total } from "./prueba_13_venta_monto_mayor_total.js";
import { prueba as venta_monto_cero } from "./prueba_14_venta_monto_cero.js";
import { prueba as venta_sin_comprador } from "./prueba_15_venta_sin_comprador.js";
import { prueba as venta_cancelar_reabrir } from "./prueba_16_venta_cancelar_reabrir.js";
import { prueba as venta_sin_asientos } from "./prueba_17_venta_sin_asientos.js";
import { prueba as cancelar_venta_limpia_nodos } from "./prueba_34_cancelar_venta_limpia_nodos.js";
import { prueba as deseleccionar_asiento_limpia_nodos } from "./prueba_35_deseleccionar_asiento_limpia_nodos.js";
import { prueba as cambiar_micro_a_mitad_limpia_nodos } from "./prueba_36_cambiar_micro_a_mitad_limpia_nodos.js";
import { prueba as venta_terminal_arbol_dual } from "./prueba_58_venta_terminal_arbol_dual.js";
import { prueba as cambiar_asiento_desde_croquis } from "./prueba_59_cambiar_asiento_desde_croquis.js";
import { prueba as cancelar_venta_arbol_dual } from "./prueba_60_cancelar_venta_arbol_dual.js";
import { prueba as reiniciar_seleccion_en_login } from "./prueba_66_reiniciar_seleccion_en_login.js";

// === Pasajeros ===
import { prueba as dj_pasajero_subir } from "./prueba_51_dj_pasajero_subir.js";
import { prueba as dj_pasajero_reemplazar } from "./prueba_52_dj_pasajero_reemplazar.js";
import { prueba as dj_pasajero_eliminar } from "./prueba_53_dj_pasajero_eliminar.js";
import { prueba as eliminar_pasajero_limpia_nodos } from "./prueba_41_eliminar_pasajero_limpia_nodos.js";
import { prueba as cambiar_asiento_desde_clientes } from "./prueba_65_cambiar_asiento_desde_clientes.js";

// === Grafo ===
import { prueba as eliminar_huerfanos_limpia_grafo } from "./prueba_56_eliminar_huerfanos_limpia_grafo.js";
import { prueba as enlace_dueno_apunta_al_compartido } from "./prueba_57_enlace_dueno_apunta_al_compartido.js";

export const SECCIONES = [
    {
        id: "base",
        nombre: "Base",
        limpieza: ["ventas", "cancelaciones", "viajes", "pasajeros", "empresas", "terminales", "usuarios"],
        grupos: [
            {
                id: "admin",
                nombre: "Admin",
                pruebas: [
                    arranque,
                    login,
                    cerrar_sesion_cierra_modales
                ]
            }
        ]
    },
    {
        id: "administrador",
        nombre: "Administrador",
        limpieza: ["usuarios"],
        grupos: [
            {
                id: "admin",
                nombre: "Admin",
                pruebas: [eliminar_usuario_limpia_nodos]
            },
            {
                id: "multi",
                nombre: "Multi-rol",
                pruebas: [bloqueo_expirado_permite_login]
            }
        ]
    },
    {
        id: "puntos_de_venta",
        nombre: "Puntos de venta",
        limpieza: ["terminales"],
        grupos: [
            {
                id: "dueno",
                nombre: "Dueño",
                pruebas: [alta_terminal]
            },
            {
                id: "admin",
                nombre: "Admin",
                pruebas: [eliminar_terminal_limpia_nodos]
            }
        ]
    },
    {
        id: "empresas_micros",
        nombre: "Empresas/Micros",
        limpieza: ["empresas"],
        grupos: [
            {
                id: "dueno",
                nombre: "Dueño",
                pruebas: [
                    alta_empresa,
                    empresa_nombre_vacio,
                    empresa_cancelar,
                    alta_vehiculo,
                    vehiculo_patente_vacia,
                    vehiculo_cancelar,
                    alta_micro,
                    micro_sin_empresa,
                    micro_sin_vehiculo,
                    micro_monto_vacio,
                    micro_monto_negativo,
                    micro_cancelar,
                    micro_mismo_vehiculo_dos_veces,
                    micro_vehiculo_sin_asientos,
                    micro_colision_numeracion
                ]
            },
            {
                id: "admin",
                nombre: "Admin",
                pruebas: [
                    subir_foto_reemplazo_limpia_nodos,
                    eliminar_vehiculo_limpia_nodos,
                    eliminar_empresa_limpia_nodos
                ]
            },
            {
                id: "multi",
                nombre: "Multi-rol",
                pruebas: [agregar_micro_actualiza_empresas_compartido]
            }
        ]
    },
    {
        id: "viajes",
        nombre: "Viajes",
        limpieza: ["viajes"],
        grupos: [
            {
                id: "admin",
                nombre: "Admin",
                pruebas: [
                    eliminar_viaje_limpia_nodos,
                    eliminar_micro_limpia_nodos,
                    editar_paradas_limpia_nodos,
                    editar_paradas_sin_hora_limpia_nodos,
                    limpiar_viajes_prueba_limpia_nodos
                ]
            },
            {
                id: "dueno",
                nombre: "Dueño",
                pruebas: [alta_viaje]
            },
            {
                id: "multi",
                nombre: "Multi-rol",
                pruebas: [
                    listar_viajes_indice_comportamiento,
                    eliminar_viaje_con_terminal_autorizado,
                    autorizar_terminal_aparece_en_compartido,
                    desautorizar_terminal_desaparece_del_compartido
                ]
            }
        ]
    },
    {
        id: "ventas",
        nombre: "Ventas",
        limpieza: ["ventas", "cancelaciones"],
        grupos: [
            {
                id: "terminal",
                nombre: "Terminal",
                pruebas: [
                    autocompletado_dni_terminal_clientes,
                    venta_basica,
                    venta_cuotas,
                    venta_transferencia,
                    venta_dos_asientos,
                    venta_tres_asientos,
                    venta_ligadura_dni_igual,
                    venta_comprador_lleno_pasajero_vacio,
                    venta_dni_duplicado,
                    venta_correccion_dni_pasajero,
                    venta_correccion_dni_comprador,
                    venta_monto_mayor_total,
                    venta_monto_cero,
                    venta_sin_comprador,
                    venta_cancelar_reabrir,
                    venta_sin_asientos,
                    venta_terminal_arbol_dual,
                    cambiar_asiento_desde_croquis,
                    cancelar_venta_arbol_dual,
                    reiniciar_seleccion_en_login
                ]
            },
            {
                id: "admin",
                nombre: "Admin",
                pruebas: [
                    cancelar_venta_limpia_nodos,
                    deseleccionar_asiento_limpia_nodos,
                    cambiar_micro_a_mitad_limpia_nodos
                ]
            }
        ]
    },
    {
        id: "rendiciones",
        nombre: "Rendiciones",
        limpieza: [],
        grupos: []
    },
    {
        id: "liquidaciones",
        nombre: "Liquidaciones",
        limpieza: [],
        grupos: []
    },
    {
        id: "pasajeros",
        nombre: "Pasajeros",
        limpieza: ["pasajeros"],
        grupos: [
            {
                id: "admin",
                nombre: "Admin",
                pruebas: [
                    dj_pasajero_subir,
                    dj_pasajero_reemplazar,
                    dj_pasajero_eliminar,
                    eliminar_pasajero_limpia_nodos
                ]
            },
            {
                id: "terminal",
                nombre: "Terminal",
                pruebas: [cambiar_asiento_desde_clientes]
            }
        ]
    },
    {
        id: "grafo",
        nombre: "Grafo",
        limpieza: ["huerfanos"],
        grupos: [
            {
                id: "admin",
                nombre: "Admin",
                pruebas: [eliminar_huerfanos_limpia_grafo]
            },
            {
                id: "multi",
                nombre: "Multi-rol",
                pruebas: [enlace_dueno_apunta_al_compartido]
            }
        ]
    }
];

// Array aplanado para compatibilidad con codigo viejo.
export const CATALOGO = SECCIONES.flatMap((s) =>
    (s.grupos || []).flatMap((g) => g.pruebas)
);