/**
 * Catalogo de pruebas disponibles, agrupadas por seccion.
 *
 * Cada prueba exporta un objeto `{ id, nombre, descripcion,
 * ejecutar(ctx) }`. Se importan aca y se agrupan en SECCIONES.
 *
 * `CATALOGO` se mantiene como array aplanado para
 * compatibilidad con codigo viejo (los mensajes `listar_pruebas`
 * y `correr_prueba` lo siguen usando).
 *
 * Para agregar una seccion nueva, sumar un objeto a SECCIONES
 * con `{id, nombre, pruebas: [...]}`. La ventana la detecta
 * automaticamente.
 *
 * @version 1.5plugin.5v
 */

import { prueba as arranque } from "./prueba_01_arranque.js";
import { prueba as login } from "./prueba_02_login.js";
import { prueba as autocompletado_dni_terminal_clientes } from "./prueba_18_autocompletado_dni_terminal_clientes.js";
import { prueba as alta_terminal } from "./prueba_19_alta_terminal.js";
import { prueba as alta_viaje } from "./prueba_20_alta_viaje.js";
import { prueba as alta_micro } from "./prueba_21_alta_micro.js";
import { prueba as micro_sin_empresa } from "./prueba_22_micro_sin_empresa.js";
import { prueba as micro_sin_vehiculo } from "./prueba_23_micro_sin_vehiculo.js";
import { prueba as micro_monto_vacio } from "./prueba_24_micro_monto_vacio.js";
import { prueba as micro_monto_negativo } from "./prueba_25_micro_monto_negativo.js";
import { prueba as micro_cancelar } from "./prueba_26_micro_cancelar.js";
import { prueba as micro_mismo_vehiculo_dos_veces } from "./prueba_27_micro_mismo_vehiculo.js";
import { prueba as micro_vehiculo_sin_asientos } from "./prueba_28_micro_vehiculo_sin_asientos.js";
import { prueba as micro_colision_numeracion } from "./prueba_29_micro_colision_numeracion.js";
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
import { prueba as eliminar_viaje_limpia_nodos } from "./prueba_30_eliminar_viaje_limpia_nodos.js";
import { prueba as eliminar_micro_limpia_nodos } from "./prueba_31_eliminar_micro_limpia_nodos.js";
import { prueba as eliminar_terminal_limpia_nodos } from "./prueba_32_eliminar_terminal_limpia_nodos.js";
import { prueba as editar_paradas_limpia_nodos } from "./prueba_33_editar_paradas_limpia_nodos.js";
import { prueba as cancelar_venta_limpia_nodos } from "./prueba_34_cancelar_venta_limpia_nodos.js";
import { prueba as deseleccionar_asiento_limpia_nodos } from "./prueba_35_deseleccionar_asiento_limpia_nodos.js";
import { prueba as cambiar_micro_a_mitad_limpia_nodos } from "./prueba_36_cambiar_micro_a_mitad_limpia_nodos.js";
import { prueba as eliminar_vehiculo_limpia_nodos } from "./prueba_37_eliminar_vehiculo_limpia_nodos.js";
import { prueba as eliminar_empresa_limpia_nodos } from "./prueba_38_eliminar_empresa_limpia_nodos.js";
import { prueba as limpiar_viajes_prueba_limpia_nodos } from "./prueba_39_limpiar_viajes_prueba_limpia_nodos.js";
import { prueba as eliminar_usuario_limpia_nodos } from "./prueba_40_eliminar_usuario_limpia_nodos.js";
import { prueba as eliminar_pasajero_limpia_nodos } from "./prueba_41_eliminar_pasajero_limpia_nodos.js";
import { prueba as editar_paradas_sin_hora_limpia_nodos } from "./prueba_42_editar_paradas_sin_hora_limpia_nodos.js";
import { prueba as listar_viajes_indice_comportamiento } from "./prueba_43_listar_viajes_indice_comportamiento.js";
import { prueba as cerrar_sesion_cierra_modales } from "./prueba_44_cerrar_sesion_cierra_modales.js";
import { prueba as alta_empresa } from "./prueba_45_alta_empresa.js";
import { prueba as empresa_nombre_vacio } from "./prueba_46_empresa_nombre_vacio.js";
import { prueba as empresa_cancelar } from "./prueba_47_empresa_cancelar.js";
import { prueba as alta_vehiculo } from "./prueba_48_alta_vehiculo.js";
import { prueba as vehiculo_patente_vacia } from "./prueba_49_vehiculo_patente_vacia.js";
import { prueba as vehiculo_cancelar } from "./prueba_50_vehiculo_cancelar.js";
import { prueba as dj_pasajero_subir } from "./prueba_51_dj_pasajero_subir.js";
import { prueba as dj_pasajero_reemplazar } from "./prueba_52_dj_pasajero_reemplazar.js";
import { prueba as dj_pasajero_eliminar } from "./prueba_53_dj_pasajero_eliminar.js";
import { prueba as bloqueo_expirado_permite_login } from "./prueba_54_bloqueo_expirado_permite_login.js";
import { prueba as subir_foto_reemplazo_limpia_nodos } from "./prueba_55_subir_foto_reemplazo_limpia_nodos.js";

export const SECCIONES = [
    {
        id: "base",
        nombre: "Base",
        pruebas: [
            arranque,
            login,
            cerrar_sesion_cierra_modales
        ]
    },
    {
        id: "autocompletado",
        nombre: "Autocompletado",
        pruebas: [
            autocompletado_dni_terminal_clientes
        ]
    },
    {
        id: "puntos_de_venta",
        nombre: "Puntos de venta",
        pruebas: [
            alta_terminal
        ]
    },
    {
        id: "viajes",
        nombre: "Viajes",
        pruebas: [
            alta_viaje
        ]
    },
    {
        id: "micros",
        nombre: "Micros",
        pruebas: [
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
        id: "ventas",
        nombre: "Ventas",
        pruebas: [
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
            venta_sin_asientos
        ]
    },
    {
        id: "autenticacion",
        nombre: "Autenticación",
        pruebas: [
            bloqueo_expirado_permite_login
        ]
    },
    {
        id: "empresas",
        nombre: "Empresas",
        pruebas: [
            alta_empresa,
            empresa_nombre_vacio,
            empresa_cancelar
        ]
    },
    {
        id: "vehiculos",
        nombre: "Vehículos",
        pruebas: [
            alta_vehiculo,
            vehiculo_patente_vacia,
            vehiculo_cancelar,
            subir_foto_reemplazo_limpia_nodos
        ]
    },
    {
        id: "declaraciones_juradas",
        nombre: "Declaraciones juradas",
        pruebas: [
            dj_pasajero_subir,
            dj_pasajero_reemplazar,
            dj_pasajero_eliminar
        ]
    },
    {
        id: "grafo",
        nombre: "Grafo",
        pruebas: [
            eliminar_viaje_limpia_nodos,
            eliminar_micro_limpia_nodos,
            eliminar_terminal_limpia_nodos,
            editar_paradas_limpia_nodos,
            cancelar_venta_limpia_nodos,
            deseleccionar_asiento_limpia_nodos,
            cambiar_micro_a_mitad_limpia_nodos,
            eliminar_vehiculo_limpia_nodos,
            eliminar_empresa_limpia_nodos,
            limpiar_viajes_prueba_limpia_nodos,
            eliminar_usuario_limpia_nodos,
            eliminar_pasajero_limpia_nodos,
            editar_paradas_sin_hora_limpia_nodos,
            listar_viajes_indice_comportamiento
        ]
    }
];

// Array aplanado para compatibilidad con codigo viejo.
export const CATALOGO = SECCIONES.flatMap((s) => s.pruebas);