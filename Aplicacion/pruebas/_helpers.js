/**
 * Helpers compartidos por las pruebas de venta.
 *
 * Todas las funciones reciben el `ctx` del service worker.
 *
 * v1.5plugin.5a: agrega cierre de modales entre pruebas y
 * espera activa por asientos libres, para que las pruebas
 * sean independientes y no se agoten los asientos del viaje
 * de setup.
 *
 * @version 1.5plugin.5a
 */

import { CODIGO_TERMINAL1 } from "../ConfPlugin.js";

// ============================================================
// Generadores de datos unicos
// ============================================================

let _contador_dni = 0;

export function dni_unico() {
    _contador_dni++;
    const ts = String(Date.now()).slice(-3);
    const cnt = String(_contador_dni % 100000).padStart(5, "0");
    return ts + cnt;
}

export function datos_comprador_aleatorio() {
    const dni = dni_unico();
    return {
        dni,
        apellido: "Prueba",
        nombres: "Auto",
        email: "auto_" + dni + "@test.local",
        celular: "2983555" + String(dni).slice(-3)
    };
}

// Apellidos validos para el piloto: solo letras, sin tildes,
// sin numeros. Se rotan por indice para que pasajeros distintos
// tengan apellidos distintos (util para debugear).
const _APELLIDOS = ["Gomez", "Fernandez", "Rodriguez", "Lopez", "Martinez", "Perez", "Sanchez", "Ramirez"];

export function datos_pasajero_aleatorio(index = 0) {
    const dni = dni_unico();
    const apellido = _APELLIDOS[index % _APELLIDOS.length];
    return {
        dni,
        apellido,
        nombres: "Auto",
        email: "pas_" + dni + "@test.local",
        celular: "2983555" + String(dni).slice(-3),
        celular_emergencia: "2983111" + String(dni).slice(-3),
        fecha_nacimiento: "1990-01-15",
        direccion: "Calle Prueba 123",
        localidad: "Tres Arroyos"
    };
}

// ============================================================
// Cierre de modales
// ============================================================

// Los modales del piloto (generico y apilado) NO se cierran
// solos al cambiar de pestaña cuando la pestaña destino ya
// estaba activa (activar_pestana solo cierra el modal del
// viaje cuando la pestaña destino NO es 'viajes'). Tampoco
// se cierran al hacer logout. Eso deja el modal abierto
// entre pruebas, tapando la lista de viajes y acumulando
// estado. Este helper los cierra explicitamente.
export async function cerrar_modales_si_abiertos(ctx) {
    // Modal apilado primero (esta encima).
    try {
        const apilado_visible = await ctx.esta_visible("#modal_apilado");
        if (apilado_visible) {
            await ctx.clic("#cerrar_modal_apilado");
            await ctx.pausa(200);
        }
    } catch (e) { /* no hacer nada */ }

    // Modal generico.
    try {
        const generico_visible = await ctx.esta_visible("#modal_generico");
        if (generico_visible) {
            await ctx.clic("#cerrar_modal_generico");
            await ctx.pausa(200);
        }
    } catch (e) { /* no hacer nada */ }
}

// ============================================================
// Navegacion
// ============================================================

export async function login_terminal(ctx) {
    await ctx.asegurar_login(CODIGO_TERMINAL1);
}

export async function ir_a_tab(ctx, id_tab) {
    // Cerrar modales que hayan quedado abiertos de una prueba
    // anterior. Si no, tapan el contenido y el estado se acumula.
    await cerrar_modales_si_abiertos(ctx);

    const selector = `.tab[data-tab="${id_tab}"]`;
    const existe = await ctx.esperar(selector, 3000);
    if (!existe || !existe.exito) throw new Error("No existe el tab " + id_tab);
    await ctx.clic(selector);
    const seccion = await ctx.esperar_visible("#" + id_tab, 5000);
    if (!seccion || !seccion.exito) throw new Error("El tab " + id_tab + " no quedo visible");
    await ctx.pausa(300);
}

export async function ir_a_viajes_y_abrir_primero(ctx) {
    await ir_a_tab(ctx, "viajes");
    const hay = await ctx.esperar(".btn-detalle-viaje", 8000);
    if (!hay || !hay.exito) throw new Error("No hay viajes disponibles");

    await ctx.clic(".btn-detalle-viaje");
    const modal = await ctx.esperar_visible("#modal_generico", 8000);
    if (!modal || !modal.exito) throw new Error("No se abrio el modal del viaje");
    const micros = await ctx.esperar(".btn-ver-pasaje", 8000);
    if (!micros || !micros.exito) throw new Error("El viaje no tiene micros");
}

// Abre el primer micro del viaje que tenga al menos 1 asiento
// libre. Fuerza un refresh del croquis para no depender del
// polling del piloto (que puede tardar 15s o estar pausado
// por inactividad).
export async function abrir_primer_micro_con_libres(ctx) {
    const nombres = await ctx.obtener_atributos(".btn-ver-pasaje", "data-micro");
    if (nombres.length === 0) throw new Error("No hay micros en el viaje");

    for (const nombre of nombres) {
        await ctx.clic(`.btn-ver-pasaje[data-micro="${nombre}"]`);
        const asientos = await ctx.esperar("#croquis_pasaje_micro .seat", 8000);
        if (!asientos || !asientos.exito) continue;

        // Forzar refresh del croquis: no esperar al polling de 15s.
        // refrescar_asientos_pagina() lee viaje_seleccionado y
        // micro_seleccionado del page y hace un fetch a
        // viajes/estado_asientos para actualizar el DOM.
        await ctx.refrescar_asientos_pagina();
        await ctx.pausa(300);

        // Esperar activamente a que aparezca al menos 1 libre.
        let libres = [];
        const inicio = Date.now();
        while (Date.now() - inicio < 8000) {
            libres = await ctx.obtener_atributos(".seat.seat-libre", "data-numero");
            if (libres.length > 0) break;
            await ctx.pausa(300);
        }
        if (libres.length > 0) {
            return { micro: nombre, libres };
        }
    }
    throw new Error("Ningun micro del viaje tiene asientos libres");
}

// Espera a que un asiento tenga la clase "seat-seleccionado-propio".
// El piloto hace un fetch al backend por cada clic, que puede
// tardar mas de lo que dura un ciclo de UI. Sin esta espera,
// clics consecutivos pueden pisarse.
async function esperar_asiento_seleccionado(ctx, numero, timeout_ms = 5000) {
    const inicio = Date.now();
    while (Date.now() - inicio < timeout_ms) {
        const clases = await ctx.obtener_atributos(`.seat[data-numero="${numero}"]`, "class");
        if (clases.length > 0 && String(clases[0]).indexOf("seat-seleccionado-propio") !== -1) {
            return true;
        }
        await ctx.pausa(150);
    }
    return false;
}

// Espera a que un asiento tenga la clase "seat-libre". Se usa antes
// de hacer clic: si el croquis del piloto quedo desactualizado
// (por ejemplo, tras una cancelacion reciente), el asiento puede
// aparecer como "seleccionado" o "vendido" aunque en el backend
// ya este libre.
async function esperar_asiento_libre(ctx, numero, timeout_ms = 8000) {
    const inicio = Date.now();
    while (Date.now() - inicio < timeout_ms) {
        const clases = await ctx.obtener_atributos(`.seat[data-numero="${numero}"]`, "class");
        if (clases.length > 0 && String(clases[0]).indexOf("seat-libre") !== -1) {
            return true;
        }
        await ctx.pausa(200);
    }
    return false;
}

// Espera a que la grilla tenga al menos N asientos con la clase
// "seat-libre". Tolerante a que el croquis se este actualizando.
async function esperar_n_asientos_libres(ctx, n, timeout_ms = 10000) {
    const inicio = Date.now();
    let libres = [];
    while (Date.now() - inicio < timeout_ms) {
        libres = await ctx.obtener_atributos(".seat.seat-libre", "data-numero");
        if (libres.length >= n) return libres;
        await ctx.pausa(300);
    }
    return libres;
}

// Selecciona un asiento con reintentos. A veces el primer clic no
// queda registrado en el DOM (condicion de carrera con el polling
// del piloto, corregida en piloto v1.5piloto.74e, pero igual el
// plugin debe ser robusto). Reintenta hasta `max_intentos` veces.
// Verifica primero si ya esta seleccionado para no deseleccionarlo.
async function seleccionar_un_asiento_con_reintentos(ctx, numero, max_intentos = 3) {
    for (let intento = 0; intento < max_intentos; intento++) {
        // Si ya quedo seleccionado de un intento anterior, listo.
        const ya_seleccionado = await esperar_asiento_seleccionado(ctx, numero, 500);
        if (ya_seleccionado) return true;

        // Verificar que el asiento este libre antes de hacer clic.
        const libre = await esperar_asiento_libre(ctx, numero, 5000);
        if (!libre) {
            // El croquis todavia no se actualizo o el asiento esta en
            // otro estado. Esperar un poco y reintentar.
            await ctx.pausa(600);
            continue;
        }

        await ctx.clic(`.seat[data-numero="${numero}"]`);
        const ok = await esperar_asiento_seleccionado(ctx, numero, 4000);
        if (ok) return true;
    }
    return false;
}

export async function seleccionar_n_asientos(ctx, n) {
    // Esperar a que aparezcan N asientos libres (puede tardar si el
    // croquis no se actualizo tras una cancelacion previa).
    const libres = await esperar_n_asientos_libres(ctx, n, 10000);
    if (libres.length < n) {
        throw new Error("Solo hay " + libres.length + " asientos libres, se necesitan " + n);
    }
    const elegidos = libres.slice(0, n);
    for (const numero of elegidos) {
        const ok = await seleccionar_un_asiento_con_reintentos(ctx, numero, 3);
        if (!ok) throw new Error("El asiento " + numero + " no quedo seleccionado tras 3 intentos");
    }
    const boton = await ctx.esperar_visible("#contenedor_boton_confirmar_venta", 5000);
    if (!boton || !boton.exito) throw new Error("No aparecio el boton Vender");
    return elegidos;
}

export async function abrir_modal_confirmacion(ctx) {
    await ctx.clic("#boton_confirmar_venta");
    const form = await ctx.esperar_visible("#formulario_confirmacion_venta", 8000);
    if (!form || !form.exito) throw new Error("No se abrio el formulario de confirmacion");
}

// ============================================================
// Espera a que el aviso del DNI se resuelva
// ============================================================

// Texto esperado en el aviso del pasajero/comprador cuando el
// DNI no esta registrado.
const _TEXTOS_NO_REGISTRADO = ["no registrado", "complete los datos"];
// Textos esperados cuando el DNI SI esta registrado (vienen de
// _calcular_antiguedad_datos: "Datos actualizados hoy / ayer /
// hace N dias / meses / anios").
const _TEXTOS_REGISTRADO = ["actualizados", "actualizado"];

// Espera a que el valor de un input sea exactamente el esperado.
// Util cuando el valor se completa por un fetch asincrono y no
// sabemos cuanto va a tardar.
export async function esperar_valor(ctx, sel, valor_esperado, timeout_ms = 5000) {
    const inicio = Date.now();
    while (Date.now() - inicio < timeout_ms) {
        const v = await ctx.valor(sel);
        if (v === valor_esperado) return true;
        await ctx.pausa(150);
    }
    return false;
}

// Espera a que el valor de un input quede vacio (o null).
export async function esperar_valor_vacio(ctx, sel, timeout_ms = 5000) {
    const inicio = Date.now();
    while (Date.now() - inicio < timeout_ms) {
        const v = await ctx.valor(sel);
        if (v === "" || v === null) return true;
        await ctx.pausa(150);
    }
    return false;
}

function _aviso_esta_resuelto(texto) {
    if (!texto) return false;
    const t = String(texto).toLowerCase();
    for (const frag of _TEXTOS_NO_REGISTRADO) {
        if (t.indexOf(frag) !== -1) return true;
    }
    for (const frag of _TEXTOS_REGISTRADO) {
        if (t.indexOf(frag) !== -1) return true;
    }
    return false;
}

// Espera hasta que el aviso de un pasajero o del comprador
// deje de decir "Buscando..." y muestre una resolucion.
async function esperar_aviso_dni(ctx, selector_aviso, timeout_ms = 5000) {
    const inicio = Date.now();
    while (Date.now() - inicio < timeout_ms) {
        const texto = await ctx.texto(selector_aviso);
        if (_aviso_esta_resuelto(texto)) return texto;
        await ctx.pausa(150);
    }
    return null;
}

export async function llenar_comprador(ctx, datos) {
    if (datos.dni !== undefined) {
        await ctx.escribir("#comprador_dni", datos.dni);
        // Esperar a que la busqueda del DNI termine antes de
        // escribir el resto, porque si el DNI no esta registrado
        // el piloto limpia los campos.
        await esperar_aviso_dni(ctx, "#comprador_aviso_autocompletado", 5000);
    }
    if (datos.apellido !== undefined) await ctx.escribir("#comprador_apellido", datos.apellido);
    if (datos.nombres !== undefined) await ctx.escribir("#comprador_nombres", datos.nombres);
    if (datos.email !== undefined) await ctx.escribir("#comprador_email", datos.email);
    if (datos.celular !== undefined) await ctx.escribir("#comprador_celular", datos.celular);
}

export async function llenar_pasajero(ctx, index, datos) {
    if (datos.dni !== undefined) {
        await ctx.escribir(`#pasajero_dni_${index}`, datos.dni);
        // Esperar a que la busqueda del DNI termine antes de
        // escribir el resto, porque si el DNI no esta registrado
        // el piloto limpia los campos.
        await esperar_aviso_dni(ctx, `#pasajero_aviso_${index}`, 5000);
    }
    if (datos.apellido !== undefined) await ctx.escribir(`#pasajero_apellido_${index}`, datos.apellido);
    if (datos.nombres !== undefined) await ctx.escribir(`#pasajero_nombres_${index}`, datos.nombres);
    if (datos.email !== undefined) await ctx.escribir(`#pasajero_email_${index}`, datos.email);
    if (datos.celular !== undefined) await ctx.escribir(`#pasajero_celular_${index}`, datos.celular);
    if (datos.celular_emergencia !== undefined) await ctx.escribir(`#pasajero_emergencia_${index}`, datos.celular_emergencia);
    if (datos.fecha_nacimiento !== undefined) await ctx.escribir(`#pasajero_fecha_nacimiento_${index}`, datos.fecha_nacimiento);
    if (datos.direccion !== undefined) await ctx.escribir(`#pasajero_direccion_${index}`, datos.direccion);
    if (datos.localidad !== undefined) await ctx.escribir(`#pasajero_localidad_${index}`, datos.localidad);
}

// ============================================================
// Metodos y montos
// ============================================================

export async function setear_metodo_y_cuotas(ctx, metodo, cuotas) {
    await ctx.escribir("#metodo_pago", metodo);
    await ctx.pausa(400);
    if (cuotas !== undefined) {
        await ctx.escribir("#cuotas_venta", String(cuotas));
        await ctx.pausa(400);
    }
}

export async function setear_monto_pagado(ctx, monto) {
    await ctx.escribir("#monto_pagado", String(monto));
}

export async function confirmar_venta(ctx) {
    await ctx.clic("#confirmar_venta");
    const ok = await ctx.esperar_visible("#opciones_impresion", 8000);
    if (!ok || !ok.exito) {
        const aviso = await ctx.leer_aviso();
        throw new Error("No se confirmo la venta. Aviso: " + (aviso || "(sin aviso)"));
    }
}

// ============================================================
// Cierre y cancelacion
// ============================================================

export async function obtener_id_ultima_venta(ctx) {
    // Cerrar el panel de "Venta exitosa" si esta abierto.
    const visible = await ctx.esta_visible("#opciones_impresion");
    if (visible) {
        await ctx.clic("#btn_cerrar_opciones");
        await ctx.pausa(300);
    }
    // Pedir al backend el id de la ultima venta de la terminal.
    const r = await ctx.enviar("obtener_id_ultima_venta_terminal", {});
    if (!r || !r.exito) {
        throw new Error("No se pudo obtener el id de la ultima venta: " + (r && r.error ? r.error : "(sin detalle)"));
    }
    return r.id_venta;
}

// Espera a que no haya asientos con la clase
// `seat-seleccionado-propio` en el croquis.
export async function esperar_sin_asientos_propios(ctx, timeout_ms = 8000) {
    const inicio = Date.now();
    while (Date.now() - inicio < timeout_ms) {
        const propios = await ctx.obtener_atributos(".seat.seat-seleccionado-propio", "data-numero");
        if (propios.length === 0) return true;
        await ctx.pausa(200);
    }
    return false;
}

// Cierra el formulario de confirmacion de venta, libera los
// asientos que quedaron seleccionados y cierra el modal del
// viaje. Deja el entorno listo para la proxima prueba.
//
// El boton "Cancelar" del piloto solo oculta el form; no
// deselecciona. Este helper aprieta "Reiniciar seleccion" para
// dejar el croquis limpio, como haria el usuario a mano.
export async function cerrar_form_venta_y_liberar(ctx) {
    // Cerrar el formulario.
    await ctx.clic("#cancelar_venta_modal");
    await ctx.pausa(400);

    // Si hay asientos propios, liberarlos.
    const propios = await ctx.obtener_atributos(".seat.seat-seleccionado-propio", "data-numero");
    if (propios.length > 0) {
        // Apretar "Reiniciar seleccion" via main world (sobrescribe
        // confirm, que el piloto usa).
        const r = await ctx.liberar_asientos_propios();
        if (!r || !r.exito) {
            console.warn("No se pudieron liberar los asientos propios:", r && r.error ? r.error : "(sin detalle)");
        } else {
            await esperar_sin_asientos_propios(ctx, 8000);
        }
    }

    // Cerrar el modal del viaje (que quedo abierto detras).
    // Si no se cierra, la proxima prueba arranca con el modal
    // tapando la lista de viajes, y el estado se acumula.
    await cerrar_modales_si_abiertos(ctx);
}

// Pide el detalle de una venta por POST (`ventas/obtener`) y
// devuelve el objeto `venta` del JSON. No depende del DOM,
// asi que funciona aunque no estemos en la pestaña Vendidos.
export async function obtener_venta_por_id(ctx, id_venta) {
    const r = await ctx.pedir_post("index.php", {
        accion: "ventas/obtener",
        id_venta
    });
    if (!r || !r.exito) {
        throw new Error("Error de red al obtener la venta: " + (r && r.error ? r.error : "(sin detalle)"));
    }
    if (!r.json || !r.json.exito) {
        throw new Error("No se pudo obtener la venta: " + (r.json && r.json.error ? r.json.error : "(sin detalle)"));
    }
    return r.json.venta;
}

export async function cancelar_venta(ctx, id_venta, motivo = "Cancelada por prueba automatica") {
    const r = await ctx.pedir_post("index.php", {
        accion: "ventas/cancelar",
        id_venta,
        motivo
    });
    if (!r || !r.exito) {
        throw new Error("Error de red al cancelar: " + (r && r.error ? r.error : "(sin detalle)"));
    }
    if (!r.json || !r.json.exito) {
        throw new Error("No se pudo cancelar: " + (r.json && r.json.error ? r.json.error : "(sin detalle)"));
    }
    // Refrescar el croquis del page para que no quede congelado
    // mostrando el asiento como vendido. Es no bloqueante: si
    // falla, la venta ya esta cancelada, solo se ve el croquis
    // viejo hasta el proximo polling.
    const rf = await ctx.refrescar_asientos_pagina();
    if (!rf || !rf.exito) {
        console.warn("No se pudo refrescar el croquis tras cancelar:", rf && rf.error ? rf.error : "(sin detalle)");
    }
    return r.json;
}

export async function crear_pasajero_de_prueba(ctx, dni, datos = {}) {
    // El dueño lo resuelve el page (`window.usuario_actual.dueno`
    // para terminal). El plugin no conoce el nombre de usuario
    // del dueño de las terminales de prueba.
    const datos_envio = {
        dni,
        apellido: datos.apellido || "Correccion",
        nombres: datos.nombres || "Auto",
        email: datos.email || "",
        celular: datos.celular || "2983555123",
        celular_emergencia: datos.celular_emergencia || "2983555222",
        fecha_nacimiento: datos.fecha_nacimiento || "1990-06-15",
        direccion: datos.direccion || "Calle Correccion 1",
        localidad: datos.localidad || "Tres Arroyos"
    };
    const r = await ctx.crear_pasajero_de_prueba(datos_envio);
    if (!r) throw new Error("Sin respuesta al crear pasajero");
    if (!r.exito) {
        const msg = r.error || "";
        if (!/ya existe/i.test(msg)) {
            throw new Error("No se pudo crear el pasajero: " + msg);
        }
    }
    return r;
}