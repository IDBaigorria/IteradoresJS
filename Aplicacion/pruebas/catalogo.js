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
 * @version 1.5plugin.4r
 */

import { prueba as arranque } from "./prueba_01_arranque.js";
import { prueba as login } from "./prueba_02_login.js";
import { prueba as autocompletado_dni_terminal_clientes } from "./prueba_18_autocompletado_dni_terminal_clientes.js";
import { prueba as alta_terminal } from "./prueba_19_alta_terminal.js";
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

export const SECCIONES = [
    {
        id: "base",
        nombre: "Base",
        pruebas: [
            arranque,
            login
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
    }
];

// Array aplanado para compatibilidad con codigo viejo.
export const CATALOGO = SECCIONES.flatMap((s) => s.pruebas);