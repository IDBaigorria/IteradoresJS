/**
 * Copiar tabla de pasajeros del micro abierto.
 *
 * Lee viaje_seleccionado y micro_seleccionado del page,
 * pide viajes/estado_asientos, y arma una tabla TSV
 * (tab-separado) lista para pegar en Excel.
 *
 * Columnas: nombre, apellido, tipo_documento, documento,
 * genero, franja_etaria.
 *
 * Filas: una por asiento, ordenadas por numero.
 * Asiento sin pasajero -> fila de columnas vacias.
 *
 * @version 1.5plugin.7p
 * @since 1.5plugin.7p
 */

import { _post } from "./pruebas/_helpers.js";

// ============================================================
// Helpers de calculo
// ============================================================

/**
 * Fecha de hoy en formato YYYY-MM-DD (hora local del navegador).
 */
function _hoy_iso() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dia = String(d.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + dia;
}

/**
 * Edad exacta en anios entre dos fechas ISO YYYY-MM-DD.
 * Devuelve -1 si la fecha es invalida.
 */
function _calcular_edad(fecha_nac_iso, hoy_iso) {
    const m1 = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha_nac_iso || "");
    const m2 = /^(\d{4})-(\d{2})-(\d{2})$/.exec(hoy_iso || "");
    if (!m1 || !m2) return -1;
    const anio_n = parseInt(m1[1], 10);
    const mes_n = parseInt(m1[2], 10);
    const dia_n = parseInt(m1[3], 10);
    const anio_h = parseInt(m2[1], 10);
    const mes_h = parseInt(m2[2], 10);
    const dia_h = parseInt(m2[3], 10);
    let edad = anio_h - anio_n;
    if (mes_h < mes_n || (mes_h === mes_n && dia_h < dia_n)) {
        edad--;
    }
    if (edad < 0 || edad > 130) return -1;
    return edad;
}

/**
 * Franja etaria segun edad. Devuelve "" si edad < 0.
 */
function _franja_etaria(edad) {
    if (edad < 0) return "";
    if (edad <= 15) return "0-15";
    if (edad <= 17) return "16-17";
    if (edad <= 29) return "18-29";
    if (edad <= 44) return "30-44";
    if (edad <= 59) return "45-59";
    if (edad <= 74) return "60-74";
    return "75+";
}

/**
 * Infiere genero por terminacion de las palabras del nombre.
 * Cuenta palabras terminadas en "a"/"á" (femenino) y en
 * "o"/"ó" (masculino). Devuelve "F" o "M" si hay mayoria
 * clara, "" si empate o cero.
 */
function _inferir_genero(nombres) {
    const texto = String(nombres || "").trim();
    if (texto === "") return "";
    const palabras = texto.split(/\s+/);
    let fem = 0;
    let masc = 0;
    for (const p of palabras) {
        const ultima = p.slice(-1).toLowerCase();
        if (ultima === "a" || ultima === "á") fem++;
        else if (ultima === "o" || ultima === "ó") masc++;
    }
    if (fem > masc) return "F";
    if (masc > fem) return "M";
    return "";
}

// ============================================================
// Armado de la tabla
// ============================================================

/**
 * Arma la tabla TSV a partir del array de asientos.
 *
 * @param {Array} asientos Array de asientos de viajes/estado_asientos.
 * @returns {string}
 */
function _armar_tabla(asientos) {
    const hoy = _hoy_iso();
    const filas = [];
    for (const a of asientos) {
        if (a && a.tiene_pasajero && a.pasajero) {
            const p = a.pasajero;
            const nombres = p.nombres || "";
            const apellido = p.apellido || "";
            const dni = p.dni || p.dni_visible || "";
            const edad = _calcular_edad(p.fecha_nacimiento, hoy);
            const franja = _franja_etaria(edad);
            const genero = _inferir_genero(nombres);
            filas.push([nombres, apellido, "DNI", dni, genero, franja].join("\t"));
        } else {
            // Fila vacia: 6 columnas separadas por 5 tabs.
            filas.push(["", "", "", "", "", ""].join("\t"));
        }
    }
    return filas.join("\n");
}

/**
 * Ordena por numero de asiento ascendente (numerico).
 */
function _ordenar_por_numero(asientos) {
    const copia = (asientos || []).slice();
    copia.sort(function (a, b) {
        const na = parseInt(a && a.numero, 10);
        const nb = parseInt(b && b.numero, 10);
        if (isNaN(na) && isNaN(nb)) return 0;
        if (isNaN(na)) return 1;
        if (isNaN(nb)) return -1;
        return na - nb;
    });
    return copia;
}

// ============================================================
// API publica
// ============================================================

/**
 * Lee el viaje/micro del page y devuelve la tabla TSV.
 *
 * @param {object} ctx
 * @returns {Promise<object>} {exito, tabla, viaje, micro, cantidad_filas}
 *                             o {exito: false, error}.
 */
export async function copiar_pasajeros_del_micro(ctx) {
    // 1. Leer viaje y micro del page.
    let info;
    try {
        const r = await chrome.scripting.executeScript({
            target: { tabId: ctx.pestana_id },
            world: "MAIN",
            func: () => {
                if (typeof viaje_seleccionado === "undefined" || !viaje_seleccionado) {
                    return { exito: false, error: "sin viaje abierto en el croquis" };
                }
                if (typeof micro_seleccionado === "undefined" || !micro_seleccionado) {
                    return { exito: false, error: "sin micro abierto en el croquis" };
                }
                const v = viaje_seleccionado;
                return {
                    exito: true,
                    nombre_viaje: v.nombre_viaje,
                    nombre_dueno: v.dueno,
                    nombre_micro: micro_seleccionado,
                };
            }
        });
        info = (r && r[0] && r[0].result) ? r[0].result : { exito: false, error: "sin resultado" };
    } catch (e) {
        return { exito: false, error: "Error al leer el page: " + e.message };
    }
    if (!info.exito) return { exito: false, error: info.error };

    // 2. Pedir estado_asientos.
    let datos;
    try {
        datos = await _post(ctx, "viajes/estado_asientos", {
            nombre_viaje: info.nombre_viaje,
            nombre_micro: info.nombre_micro,
            nombre_dueno: info.nombre_dueno,
        });
    } catch (e) {
        return { exito: false, error: "Error de red: " + e.message };
    }
    if (!datos.exito || !Array.isArray(datos.asientos)) {
        return { exito: false, error: datos.error || "estado_asientos no devolvio asientos" };
    }

    // 3. Armar la tabla.
    const ordenados = _ordenar_por_numero(datos.asientos);
    const tabla = _armar_tabla(ordenados);

    return {
        exito: true,
        tabla: tabla,
        viaje: info.nombre_viaje,
        micro: info.nombre_micro,
        cantidad_filas: ordenados.length,
    };
}