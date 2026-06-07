import { Objeto, Nodo, NodoElectrico, Controlador, Conf, Entorno } from '../index.js';

// Forzar modo desarrollo si no está definido (opcional)
if (!Entorno.es_desarrollo()) {
    console.warn('⚠️ Las pruebas deberían ejecutarse en entorno DESARROLLO');
}

console.log('🚀 Inicio de pruebas para NodoElectrico (JS)');
/*
// ──────────────────────────────────────────────────────────
// 1. PRUEBAS EXHAUSTIVAS DE LA INTERFAZ FASE
// ──────────────────────────────────────────────────────────
console.group('🔹 INTERFAZ FASE (NodoElectrico)');
console.log('Prueba fuera del callback:', typeof NodoElectrico._fase);
//NodoElectrico._fase('token_cualquiera', 'prueba'); // Aunque falle por token, verás si existe
Controlador.ejecutar_prueba((token) => {
    console.log('NodoElectrico dentro del callback:', NodoElectrico);
    console.log('¿_fase existe?', typeof NodoElectrico?._fase);
    NodoElectrico._fase(token, 'fase_prueba_js');
});
Controlador.ejecutar_prueba((token) => {
    console.log('NodoElectrico dentro del callback:', NodoElectrico);
    console.log('¿_fase existe?', typeof NodoElectrico?.fase);
    //NodoElectrico._fase(token, 'fase_prueba_js');
});
Controlador.ejecutar_prueba((token) => {
    // 1.1 Establecer fase con token válido
    console.log('▶ 1.1 Establecer fase con token válido');
    NodoElectrico._fase(token, 'fase_alpha');
    console.log('   Fase actual (esperada "fase_alpha"):', NodoElectrico.fase());

    // 1.2 Establecer fase con token inválido (debe mostrar alerta/error)
    console.log('▶ 1.2 Establecer fase con token inválido');
    NodoElectrico._fase('token_invalido', 'fase_beta');
    console.log('   Fase actual (debe seguir siendo "fase_alpha"):', NodoElectrico.fase());

    // 1.3 Crear nodos y agregar actividad en diferentes fases
    console.log('▶ 1.3 Preparar nodos con actividad en múltiples fases');
    const nodo1 = NodoElectrico.crear_con_dato('Nodo 1');
    const nodo2 = NodoElectrico.crear_con_dato('Nodo 2');

    // Cambiar a fase 'gamma' y agregar adyacencia
    NodoElectrico._fase(token, 'fase_gamma');
    nodo1._adyacente_en(nodo2, 'enlace_gamma');

    // Cambiar a fase 'delta' y agregar incidente (mediante adyacencia inversa)
    NodoElectrico._fase(token, 'fase_delta');
    nodo2._adyacente_en(nodo1, 'enlace_delta');  // nodo1 ahora tiene un incidente en fase delta

    // Volver a fase alpha (sin actividad en nodos)
    NodoElectrico._fase(token, 'fase_alpha');

    // 1.4 Método de instancia: por_cada_fase_ejecutar (solo fases con actividad en el nodo)
    console.log('▶ 1.4 por_cada_fase_ejecutar en nodo1 (debe mostrar "fase_gamma" y "fase_delta")');
    const fases_nodo1 = [];
    nodo1.por_cada_fase_ejecutar(token, (fase) => {
        console.log(`   Nodo1 actividad en fase: ${fase}`);
        fases_nodo1.push(fase);
    });
    // Verificar que incluya gamma y delta, pero no alpha
    console.log('   Fases encontradas:', fases_nodo1);

    console.log('▶ 1.5 por_cada_fase_ejecutar en nodo2 (debe mostrar "fase_gamma" y "fase_delta")');
    const fases_nodo2 = [];
    nodo2.por_cada_fase_ejecutar(token, (fase) => {
        console.log(`   Nodo2 actividad en fase: ${fase}`);
        fases_nodo2.push(fase);
    });

    // 1.6 Método estático: por_cada_fase_global_ejecutar (todas las fases registradas)
    console.log('▶ 1.6 por_cada_fase_global_ejecutar (debe listar: fase_alpha, fase_gamma, fase_delta)');
    const fases_globales = [];
    NodoElectrico.por_cada_fase_global_ejecutar(token, (fase) => {
        console.log(`   Fase global: ${fase}`);
        fases_globales.push(fase);
    });

    // 1.7 Probar método estático con token inválido (debe fallar silenciosamente o mostrar alerta)
    console.log('▶ 1.7 por_cada_fase_global_ejecutar con token inválido (debe no listar fases)');
    NodoElectrico.por_cada_fase_global_ejecutar('token_malo', (fase) => {
        console.log(`   Esto no debería ejecutarse: ${fase}`);
    });
    console.log('   (Si no se ve el mensaje anterior, funcionó correctamente)');

    // 1.8 Probar método de instancia en nodo sin actividad
    console.log('▶ 1.8 Nodo sin actividad (recién creado)');
    const nodo_solo = NodoElectrico.crear();
    nodo_solo.por_cada_fase_ejecutar(token, (fase) => {
        console.log(`   Nodo solo NO debería tener fases, pero apareció: ${fase}`);
    });
    console.log('   (Si no se ve ningún listado, correcto)');
});

console.groupEnd();*/
// ──────────────────────────────────────────────────────────
// 2. PRUEBAS EXHAUSTIVAS DE FÁBRICA DE NODOS ELÉCTRICOS
// ──────────────────────────────────────────────────────────
/*
console.group('🔹 Fábrica de Nodos Eléctricos');

// 2.1 Creación básica
console.log('▶ 2.1 Creación básica');
const nodoVacio = NodoElectrico.crear();
console.log('   crear() -> id:', nodoVacio.id(), 'dato:', nodoVacio.dato());

const nodoConCapacidad = NodoElectrico.crear(500, 0.3);
console.log('   crear(500, 0.3) -> capacidad:', nodoConCapacidad.capacidad, 'fuga:', nodoConCapacidad.fuga);

// 2.2 Crear con dato (con y sin capacidad/fuga)
console.log('▶ 2.2 crear_con_dato');
const nodoConDato = NodoElectrico.crear_con_dato('Hola JS');
console.log('   crear_con_dato("Hola JS") -> id:', nodoConDato.id(), 'dato:', nodoConDato.dato());

const nodoConDatoYCapacidad = NodoElectrico.crear_con_dato('Sensor', false, 1000, 0.5);
console.log('   crear_con_dato("Sensor", false, 1000, 0.5) -> capacidad:', nodoConDatoYCapacidad.capacidad, 'fuga:', nodoConDatoYCapacidad.fuga);

// 2.3 Crear con ID especial
console.log('▶ 2.3 crear_con_id');
const nodoConIdValido = NodoElectrico.crear_con_id('especial_js');
console.log('   crear_con_id("especial_js") -> id:', nodoConIdValido?.id(), 'es_especial:', nodoConIdValido?.es_especial());

const nodoConIdInvalido = NodoElectrico.crear_con_id(122); // No cumple es_id_especial
console.log('   crear_con_id("no_especial") (debe fallar) ->', nodoConIdInvalido === null ? 'null (correcto)' : 'ERROR: debería ser null');

// 2.4 Crear con dato e ID especial
console.log('▶ 2.4 crear_con_dato_e_id');
const nodoCompleto = NodoElectrico.crear_con_dato_e_id('Dato especial', 'id_compuesto');
console.log('   crear_con_dato_e_id() -> id:', nodoCompleto?.id(), 'dato:', nodoCompleto?.dato());

const nodoCompletoInvalido = NodoElectrico.crear_con_dato_e_id('Dato', 3545);
console.log('   crear_con_dato_e_id con ID inválido ->', nodoCompletoInvalido === null ? 'null (correcto)' : 'ERROR: debería ser null');

// 2.5 Método nodo() (con diferentes entradas)
console.log('▶ 2.5 nodo()');
const nodo0 = NodoElectrico.nodo();
console.log('   nodo() sin params -> id:', nodo0.id(), 'dato:', nodo0.dato());

const nodo1 = NodoElectrico.nodo('Texto', (n, esNodo) => {
    console.log(`   callback: esNodo = ${esNodo}, nodo id = ${n.id()}`);
});
console.log('   nodo("Texto", callback) -> id:', nodo1.id());

const nodo2 = NodoElectrico.nodo(nodo1, (n, esNodo) => {
    console.log(`   callback reutilizando: esNodo = ${esNodo}, id = ${n.id()}`);
});
console.log('   nodo(nodo1, callback) -> id:', nodo2.id(), '(debe coincidir con nodo1)');

const nodoNull = NodoElectrico.nodo(null);
console.log('   nodo(null) -> dato:', nodoNull.dato(), '(debería ser null)');

// 2.6 Capacidad y fuga por defecto vs personalizada
console.log('▶ 2.6 Verificar capacidad y fuga por defecto');
const nodoDefault = NodoElectrico.crear();
console.log('   capacidad por defecto:', nodoDefault.capacidad, '(esperado:', Conf.CAPACIDAD_NODO_ELECTRICO, ')');
console.log('   fuga por defecto:', nodoDefault.fuga, '(esperado:', Conf.FUGA_NODO_ELECTRICO, ')');

// 2.7 Conteo de nodos y superestructura
console.log('▶ 2.7 Conteo de nodos y superestructura');
const cantidadAntes = NodoElectrico.cantidad_de_nodos();
console.log('   cantidad_de_nodos() antes de crear más:', cantidadAntes);
const tempNode = NodoElectrico.crear();
console.log('   después de crear 1 nodo más:', NodoElectrico.cantidad_de_nodos(), '(debe ser', cantidadAntes + 1, ')');
NodoElectrico.eliminar(tempNode);
console.log('   después de eliminarlo:', NodoElectrico.cantidad_de_nodos(), '(debe volver a', cantidadAntes, ')');

// 2.8 Prueba de eliminación (nodo sin referencias)
console.log('▶ 2.8 Eliminar nodo sin referencias');
const nodoEliminar = NodoElectrico.crear_con_dato('Para eliminar');
const idEliminar = nodoEliminar.id();
console.log('   Nodo creado, id:', idEliminar);
const resultadoEliminar = NodoElectrico.eliminar(nodoEliminar);
console.log('   eliminar() ->', resultadoEliminar === true ? 'true (correcto)' : 'ERROR');
console.log('   ¿Sigue en superestructura?', Nodo.existe(idEliminar) ? 'SÍ (error)' : 'NO (correcto)');

// 2.9 Eliminar nodo con referencias (debe fallar)
console.log('▶ 2.9 Eliminar nodo con referencias');
const nodoA = NodoElectrico.crear_con_dato('A');
const nodoB = NodoElectrico.crear_con_dato('B');
nodoA._adyacente_en(nodoB, 'enlaceAB');
const resultadoEliminarConRef = NodoElectrico.eliminar(nodoB);
console.log('   eliminar(nodoB) (tiene incidente desde nodoA) ->', resultadoEliminarConRef === false ? 'false (correcto)' : 'ERROR');
// Limpiar para no afectar otras pruebas
nodoA.eliminar_adyacente('enlaceAB');

// 2.10 eliminar_autoenlazado (obsoleto, pero se prueba)
console.log('▶ 2.10 eliminar_autoenlazado');
const nodoAuto = NodoElectrico.crear_con_dato('Autoenlazado');
nodoAuto._adyacente(nodoAuto); // autoenlace
console.log('   Nodo con autoenlace, referencias:', nodoAuto.cantidad_de_incidentes_global());
const resAuto = NodoElectrico.eliminar_autoenlazado(nodoAuto);
console.log('   eliminar_autoenlazado() ->', resAuto === true ? 'true (correcto)' : 'ERROR');
console.log('   ¿Sigue en superestructura?', Nodo.existe(nodoAuto.id()) ? 'SÍ (error)' : 'NO (correcto)');



// 2.11 Probar getters globales de adyacentes/incidentes
console.log('▶ 2.11 cantidad_de_adyacentes_global y cantidad_de_incidentes_global');
const nodoGlobal = NodoElectrico.crear();
const aux1 = NodoElectrico.crear();
const aux2 = NodoElectrico.crear();
Controlador.ejecutar_prueba((token) => {
    NodoElectrico._fase(token, 'faseX');
    nodoGlobal._adyacente_en(aux1, 'x');   // aux1 recibe un incidente
    NodoElectrico._fase(token, 'faseY');
    nodoGlobal._adyacente_en(aux2, 'y');   // aux2 recibe un incidente
});
console.log('   adyacentes global de nodoGlobal (debe ser 2):', nodoGlobal.cantidad_de_adyacentes_global());
console.log('   adyacentes fase actual de nodoGlobal (debe ser 1, faseY):', nodoGlobal.cantidad_de_adyacentes());
console.log('   incidentes de aux1 (debe ser 0):', aux1.cantidad_de_incidentes());
console.log('   incidentes de aux2 (debe ser 1):', aux2.cantidad_de_incidentes());
console.log('   incidentes global de aux1 (debe ser 1):', aux1.cantidad_de_incidentes_global());
console.log('   incidentes global de aux2 (debe ser 1):', aux2.cantidad_de_incidentes_global());
console.log('Cantidad final de nodos:', NodoElectrico.cantidad_de_nodos());
console.groupEnd();
*/

// ──────────────────────────────────────────────────────────
// 3. PRUEBAS EXHAUSTIVAS DE ADYACENTES
// ──────────────────────────────────────────────────────────
/*console.group('🔹 Adyacentes');

// 3.1 Preparación
const nodoA = NodoElectrico.crear_con_dato('A');
const nodoB = NodoElectrico.crear_con_dato('B');
const nodoC = NodoElectrico.crear_con_dato('C');

console.log('▶ 3.1 _adyacente() (generación automática de nombre)');
const enlace1 = nodoA._adyacente(nodoB);
console.log('   Enlace generado (basado en id de B):', enlace1);
const enlace2 = nodoA._adyacente(nodoB); // segundo enlace
console.log('   Segundo enlace:', enlace2, '(debe ser algo como `${nodoB.id()}.1`)');

console.log('▶ 3.2 _adyacente_en() con nombre fijo y reemplazo');
const ok = nodoA._adyacente_en(nodoB, 'fijo', true);
console.log('   Asignación exitosa:', ok);
const ok2 = nodoA._adyacente_en(nodoC, 'fijo', false);
console.log('   Intento de reasignar "fijo" sin reemplazar:', ok2 === false ? 'false (correcto)' : 'error');

console.log('▶ 3.3 adyacente() obtener nodo por nombre de enlace');
const nodoObtenido = nodoA.adyacente('fijo');
console.log('   Nodo en "fijo":', nodoObtenido?.id(), '(debe ser B)');
const nodoInexistente = nodoA.adyacente('noexiste');
console.log('   Enlace inexistente:', nodoInexistente === null ? 'null (correcto)' : 'error');

console.log('▶ 3.4 adyacentes() y cantidad_de_adyacentes()');
const todos = nodoA.adyacentes();
if (todos === null) {
    console.log('   adyacentes() devuelve null (no hay adyacentes en la fase actual)');
} else {
    console.log('   adyacentes() devuelve Map con tamaño:', todos.size);
}
console.log('   cantidad_de_adyacentes() (fase actual):', nodoA.cantidad_de_adyacentes());

console.log('▶ 3.5 tiene_adyacente() y tiene_adyacente_a()');
console.log('   tiene_adyacente():', nodoA.tiene_adyacente());
const nombreEnlace = nodoA.tiene_adyacente_a(nodoB);
console.log('   tiene_adyacente_a(nodoB) devuelve nombre:', nombreEnlace || 'false');
const falso = nodoA.tiene_adyacente_a(nodoC);
console.log('   tiene_adyacente_a(nodoC) (no existe):', falso === false ? 'false (correcto)' : 'error');

console.log('▶ 3.6 eliminar_adyacente()');
const eliminado = nodoA.eliminar_adyacente('fijo');
console.log('   Nodo eliminado:', eliminado?.id(), '(debe ser B)');
const eliminadoInex = nodoA.eliminar_adyacente('fijo');
console.log('   Eliminar otra vez:', eliminadoInex === null ? 'null (correcto)' : 'error');

console.log('▶ 3.7 eliminar_adyacentes()');
nodoA._adyacente_en(nodoB, 'temp1');
nodoA._adyacente_en(nodoC, 'temp2');
const eliminados = nodoA.eliminar_adyacentes();
console.log('   Eliminados:', eliminados.size, 'nodos (deben ser 2)');

console.log('▶ 3.8 por_cada_adyacente_ejecutar()');
nodoA._adyacente(nodoB);
nodoA._adyacente(nodoC);
const resultados = nodoA.por_cada_adyacente_ejecutar((n, e) => n.id());
console.log('   Resultados:', resultados);

console.log('▶ 3.9 Adyacentes con múltiples fases');
Controlador.ejecutar_prueba((token) => {
    NodoElectrico._fase(token, 'faseX');
    nodoA._adyacente_en(nodoB, 'enlaceX');
    NodoElectrico._fase(token, 'faseY');
    nodoA._adyacente_en(nodoB, 'enlaceY');
});
console.log('   cantidad_de_adyacentes() (fase actual, debe ser 1):', nodoA.cantidad_de_adyacentes());
console.log('   cantidad_de_adyacentes_global() (debe ser 2):', nodoA.cantidad_de_adyacentes_global());
console.log('   tiene_adyacente_a(nodoB) en fase actual (debe devolver "enlaceY"):', nodoA.tiene_adyacente_a(nodoB));

console.groupEnd();

// ──────────────────────────────────────────────────────────
// 4. PRUEBAS EXHAUSTIVAS DE INCIDENTES
// ──────────────────────────────────────────────────────────
console.group('🔹 Incidentes');

// 4.1 Preparación
const nodoX = NodoElectrico.crear_con_dato('X');
const nodoY = NodoElectrico.crear_con_dato('Y');
const nodoZ = NodoElectrico.crear_con_dato('Z');

console.log('▶ 4.1 Creación de incidentes mediante _adyacente_en()');
nodoX._adyacente_en(nodoY, 'incidente1');   // desde X hacia Y
nodoX._adyacente_en(nodoY, 'incidente2');   // segundo enlace desde X
nodoZ._adyacente_en(nodoY, 'incidenteZ');   // desde Z hacia Y
console.log('   NodoY tiene incidentes desde X (2 enlaces) y desde Z (1 enlace)');

console.log('▶ 4.2 tiene_incidente()');
console.log('   tiene_incidente() en nodoY:', nodoY.tiene_incidente());
console.log('   tiene_incidente() en nodoX (sin incidentes):', nodoX.tiene_incidente());

console.log('▶ 4.3 tiene_incidente_a() debe devolver nombre del enlace');
const enlaceDesdeX = nodoY.tiene_incidente_a(nodoX);
console.log('   Incidente desde X hacia Y (primer enlace encontrado):', enlaceDesdeX || 'false');
const enlaceDesdeZ = nodoY.tiene_incidente_a(nodoZ);
console.log('   Incidente desde Z:', enlaceDesdeZ || 'false');
const falsoInc = nodoX.tiene_incidente_a(nodoY);
console.log('   Incidente inexistente:', falsoInc === false ? 'false (correcto)' : 'error');

console.log('▶ 4.4 incidentes() estructura');
const incidentes = nodoY.incidentes();
if (incidentes === null) {
    console.log('   incidentes() devuelve null (no hay incidentes en la fase actual)');
} else {
    console.log('   incidentes() devuelve un Map con', incidentes.size, 'entradas (por cada nodo origen)');
    for (const [idOrigen, enlacesMap] of incidentes) {
        console.log(`     Origen: ${idOrigen}`);
        // enlacesMap es un Map<enlace, Nodo>
        const listaEnlaces = [...enlacesMap.keys()];
        console.log(`       Enlaces: ${listaEnlaces.join(', ')}`);
    }
}

console.log('▶ 4.5 cantidad_de_incidentes() y cantidad_de_incidentes_global()');
console.log('   cantidad_de_incidentes() (fase actual):', nodoY.cantidad_de_incidentes());
let faseActual=NodoElectrico.fase();
// Forzar múltiples fases
Controlador.ejecutar_prueba((token) => {
    
    NodoElectrico._fase(token, 'faseAlpha');
    nodoX._adyacente_en(nodoY, 'alfa');
    NodoElectrico._fase(token, 'faseBeta');
    nodoX._adyacente_en(nodoY, 'beta');
    NodoElectrico._fase(token,faseActual);
});
console.log('   Después de añadir incidentes en otras fases:');
console.log('      cantidad_de_incidentes() (fase actual Beta, debe ser 1):', nodoY.cantidad_de_incidentes());
console.log('      cantidad_de_incidentes_global() (debe sumar todos):', nodoY.cantidad_de_incidentes_global());

console.log('▶ 4.6 por_cada_incidente_ejecutar()');
const resultadosInc = nodoY.por_cada_incidente_ejecutar((nodoOrigen, enlace) => `${nodoOrigen.id()}->${enlace}`);
console.log('   Resultados:', resultadosInc);

console.groupEnd();
/*
// ──────────────────────────────────────────────────────────
// 5. PRUEBAS EXHAUSTIVAS DE ENERGÍA
// ──────────────────────────────────────────────────────────
console.group('🔹 Energía');

// Helper para dormir (simular paso del tiempo)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
    // 5.1 Getters básicos
    console.log('▶ 5.1 capacidad() y fuga()');
    const nodo = NodoElectrico.crear(100, 10);
    console.log('   capacidad:', nodo.capacidad(), '(debe ser 100)');
    console.log('   fuga:', nodo.fuga(), '(debe ser 10)');

    // 5.2 Energía inicial y _energia()
    console.log('▶ 5.2 energia() inicial y _energia()');
    console.log('   energia inicial:', nodo.energia(), '(debe ser 0)');
    nodo._energia(50);
    console.log('   después de _energia(50):', nodo.energia(), '(debe ser 50)');
    nodo._energia(60);
    console.log('   después de _energia(60):', nodo.energia(), '(debe ser 100, saturado)');

    // 5.3 Callbacks de saturación
    console.log('▶ 5.3 Callbacks de saturación');
    let saturado = false;
    let faseCallbackEjecutado = false;

    // Callback por defecto de fase
    NodoElectrico._ejecutar_cuando_satura_por_fase((n) => {
        faseCallbackEjecutado = true;
        console.log('   [FASE] Callback por defecto de saturación ejecutado');
    });

    // Reemplazar (true)
    const nodo2 = NodoElectrico.crear(50, 0);
    nodo2._ejecutar_cuando_satura((n) => {
        saturado = true;
        console.log('   [INSTANCIA] Callback de saturación (reemplazar) ejecutado');
    });
    nodo2._energia(60);
    console.log('   saturación con reemplazar:', saturado ? 'OK' : 'FALLÓ');
    console.log('   callback de fase ejecutado?', faseCallbackEjecutado ? 'SÍ (error, no debió)' : 'NO (correcto)');

    // Complementar (false)
    let saturado2 = false;
    let faseCallbackEjecutado2 = false;
    NodoElectrico._ejecutar_cuando_satura_por_fase((n) => {
        faseCallbackEjecutado2 = true;
        console.log('   [FASE2] Callback por defecto ejecutado');
    });
    const nodo3 = NodoElectrico.crear(50, 0);
    nodo3._ejecutar_cuando_satura((n) => {
        saturado2 = true;
        console.log('   [INSTANCIA] Callback de saturación (complementar) ejecutado');
    }, false);//complementa
    nodo3._energia(60);
    console.log('   saturación con complementar:', saturado2 ? 'OK' : 'FALLÓ');
    console.log('   callback de fase ejecutado?', faseCallbackEjecutado2 ? 'SÍ (correcto)' : 'NO (error)');

    // 5.4 Callbacks de agotamiento
    console.log('▶ 5.4 Callbacks de agotamiento');
    let agotado = false;
    let faseAgotado = false;

    NodoElectrico._ejecutar_cuando_agota_por_fase((n) => {
        faseAgotado = true;
        console.log('   [FASE] Callback por defecto de agotamiento ejecutado');
    });

    const nodo4 = NodoElectrico.crear(30, 0);
    nodo4._ejecutar_cuando_agota((n) => {
        agotado = true;
        console.log('   [INSTANCIA] Callback de agotamiento (reemplazar) ejecutado');
    });
    nodo4._energia(20);
    nodo4._energia(-30);
    console.log('   agotamiento con reemplazar:', agotado ? 'OK' : 'FALLÓ');
    console.log('   callback de fase ejecutado?', faseAgotado ? 'SÍ (error, no debió)' : 'NO (correcto)');

    // Complementar
    let agotado2 = false;
    let faseAgotado2 = false;
    NodoElectrico._ejecutar_cuando_agota_por_fase((n) => {
        faseAgotado2 = true;
        console.log('   [FASE2] Callback de agotamiento ejecutado');
    });
    const nodo5 = NodoElectrico.crear(30, 0);
    nodo5._ejecutar_cuando_agota((n) => {
        agotado2 = true;
        console.log('   [INSTANCIA] Callback de agotamiento (complementar) ejecutado');
    }, false);
    nodo5._energia(20);
    nodo5._energia(-30);
    console.log('   agotamiento con complementar:', agotado2 ? 'OK' : 'FALLÓ');
    console.log('   callback de fase ejecutado?', faseAgotado2 ? 'SÍ (correcto)' : 'NO (error)');

    // 5.5 Fuga por tiempo real
    console.log('▶ 5.5 Fuga por tiempo real');
    const nodo6 = NodoElectrico.crear(100, 5);
    nodo6._energia(100);
    console.log('   energía inicial:', nodo6.energia());
    await sleep(2100); // espera 2.1 segundos (2 ciclos de 1 segundo)
    const energiaDespues = nodo6.energia();
    console.log('   energía después de ~2 segundos (2 ciclos, fuga 5*2=10):', energiaDespues, '(debe ser 90)');

    // 5.6 Callback global de agotamiento (todas las fases)
    console.log('▶ 5.6 Callback global de agotamiento');
    let globalAgotado = false;
    NodoElectrico._ejecutar_cuando_agota_global((n) => {
        globalAgotado = true;
        console.log('   [GLOBAL] Todas las fases sin energía');
    });

    const nodo7 = NodoElectrico.crear(50, 0);
    await Controlador.ejecutar_prueba(async (token) => {
        let faseactual=NodoElectrico.fase();
        NodoElectrico._fase(token, 'faseA');
        nodo7._energia(10);
        NodoElectrico._fase(token, 'faseB');
        nodo7._energia(20);
        // Vaciar ambas fases
        NodoElectrico._fase(token, 'faseA');
        nodo7._energia(-10);
        NodoElectrico._fase(token, 'faseB');
        nodo7._energia(-20);
        NodoElectrico._fase(token, faseactual);
    });
    console.log('   callback global', globalAgotado ? 'ejecutado (OK)' : 'NO ejecutado (ERROR)');

    // 5.7 Obtener callbacks registrados
    console.log('▶ 5.7 Obtener callbacks registrados');
    const cbSat = NodoElectrico.ejecutar_cuando_satura_por_fase();
    console.log('   callback saturación fase actual:', cbSat ? 'registrado' : 'ninguno');
    const cbAgot = NodoElectrico.ejecutar_cuando_agota_por_fase();
    console.log('   callback agotamiento fase actual:', cbAgot ? 'registrado' : 'ninguno');
    const globalCb = NodoElectrico.ejecutar_cuando_agota_global();
    console.log('   callback global:', globalCb ? 'registrado' : 'ninguno');

    console.log('✅ Pruebas de energía completadas');
})();
console.groupEnd();*/
// ──────────────────────────────────────────────────────────
// 5. PRUEBAS EXHAUSTIVAS DE PESOS Y ADYACENTE CON PESO
// ──────────────────────────────────────────────────────────
console.group('🔹 Pesos y AdyacenteConPeso');
/*
console.log('▶ 5.0 Preparación de nodos limpios');
const pA = NodoElectrico.crear_con_dato('PA');
const pB = NodoElectrico.crear_con_dato('PB');
const pC = NodoElectrico.crear_con_dato('PC');

pA._adyacente_en(pB, 'e1');
pA._adyacente_en(pC, 'e2');

// ─── 5.1 Asignar y leer pesos (unidimensional) ───
console.log('▶ 5.1 _peso() y peso() básicos');
pA._peso('e1', 10);
console.log('   peso("e1") sin dimensión:', pA.peso('e1'), '(debe ser 10)');
console.log('   peso("e2") (sin peso):', pA.peso('e2'), '(debe ser null)');

pA._peso('e2', 5.5, 'distancia');
console.log('   peso("e2","distancia"):', pA.peso('e2','distancia'), '(debe ser 5.5)');
console.log('   peso("e2") sin dimensión (debe ser null):', pA.peso('e2'), '(debe ser null)');

// ─── 5.2 Migración perezosa y múltiples dimensiones ───
console.log('▶ 5.2 Migración perezosa y múltiples dimensiones');
pA._peso('e1', 20);
pA._peso('e1', 99, 'coste');   // migra a objeto
console.log('   peso("e1") default:', pA.peso('e1'), '(debe ser 20)');
console.log('   peso("e1","coste"):', pA.peso('e1','coste'), '(debe ser 99)');
console.log('   pesos("e1") completo:', JSON.stringify(pA.pesos('e1')), '(debe tener "":20, "coste":99)');

// ─── 5.3 pesos() y consultas sobre enlaces sin peso ───
console.log('▶ 5.3 pesos() en enlace sin peso');
console.log('   pesos("e2"):', JSON.stringify(pA.pesos('e2')), '(debe tener "distancia":5.5)');
console.log('   pesos("enlace_inexistente"):', JSON.stringify(pA.pesos('enlace_inexistente')), '(debe ser objeto vacío)');

// ─── 5.4 Ordenamiento por peso ───
console.log('▶ 5.4 adyacentes_ordenados_por_peso()');
const pD = NodoElectrico.crear_con_dato('PD');
const pE = NodoElectrico.crear_con_dato('PE');
pA._adyacente_en(pD, 'e3');
pA._adyacente_en(pE, 'e4');
pA._peso('e1', 20);
pA._peso('e2', 5, 'coste');
pA._peso('e3', 50);
pA._peso('e4', 30);

const ordenadosAsc = pA.adyacentes_ordenados_por_peso(null, true);
console.log('   Orden ascendente por default (sin incluir sin peso):');
ordenadosAsc.forEach(item => {
    console.log(`      enlace: ${item.nombre_enlace}, nodo: ${item.nodo.id()}, peso: ${item.peso}`);
});

const ordenadosAscConSinPeso = pA.adyacentes_ordenados_por_peso(null, true, true);
console.log('   Orden ascendente incluyendo sin peso:');
ordenadosAscConSinPeso.forEach(item => {
    console.log(`      enlace: ${item.nombre_enlace}, peso: ${item.peso}`);
});

const ordenadosDesc = pA.adyacentes_ordenados_por_peso(null, false);
console.log('   Orden descendente por default (sin incluir sin peso):');
ordenadosDesc.forEach(item => console.log(`      enlace: ${item.nombre_enlace}, peso: ${item.peso}`));

const ordenadosCoste = pA.adyacentes_ordenados_por_peso('coste', true);
console.log('   Orden ascendente por coste (sin incluir sin peso):');
ordenadosCoste.forEach(item => {
    console.log(`      enlace: ${item.nombre_enlace}, peso: ${item.peso}`);
});
// Deben aparecer solo los que tienen coste: e2 y e1

// ─── 5.5 Compatibilidad con métodos de Adyacentes ───
console.log('▶ 5.5 Métodos de Adyacentes no afectados por pesos');
const ady = pA.adyacente('e1');
console.log('   adyacente("e1") devuelve Nodo id:', ady?.id(), '(debe ser PB)');
const todosMap = pA.adyacentes();
console.log('   adyacentes() devuelve Map con', todosMap?.size, 'elementos (todos Nodo)');
const tiene = pA.tiene_adyacente_a(pB);
console.log('   tiene_adyacente_a(pB):', tiene ? `'${tiene}'` : 'false', '(debe devolver "e1")');
const resultadosPorCada = pA.por_cada_adyacente_ejecutar((n, e) => n.id());
console.log('   por_cada_adyacente_ejecutar: ', [...resultadosPorCada.values()].join(','));

// eliminar_adyacente con peso
const eliminadoConPeso = pA.eliminar_adyacente('e1');
console.log('   eliminar_adyacente("e1") devuelve:', eliminadoConPeso?.id(), '(debe ser PB)');
console.log('   ¿sigue existiendo e1?', pA.adyacente('e1') ? 'SI (error)' : 'NO (correcto)');

pA.eliminar_adyacentes();
console.log('   después de eliminar_adyacentes, cantidad:', pA.cantidad_de_adyacentes(), '(debe ser 0)');

// ─── 5.6 _adyacente_con_peso() y _adyacente_con_peso_en() ───
console.log('▶ 5.6 _adyacente_con_peso() y _adyacente_con_peso_en()');
const pX = NodoElectrico.crear_con_dato('PX');
const pY = NodoElectrico.crear_con_dato('PY');
const pZ = NodoElectrico.crear_con_dato('PZ');

const enlaceCreado = pX._adyacente_con_peso(pY, 42, 'vitalidad');
console.log('   _adyacente_con_peso genera enlace:', enlaceCreado);
console.log('   peso(enlace, "vitalidad"):', pX.peso(enlaceCreado, 'vitalidad'), '(debe ser 42)');

pX._adyacente_con_peso_en(pZ, 'especial', 7.5, null, false);
console.log('   peso("especial") default:', pX.peso('especial'), '(debe ser 7.5)');

pX._adyacente_con_peso_en(pY, 'especial', 99, 'coste', true);
const nodoEnEspecial = pX.adyacente('especial');
console.log('   después de reemplazar, nodo en "especial":', nodoEnEspecial?.id(), '(debe ser PY)');
console.log('   peso("especial","coste"):', pX.peso('especial','coste'), '(debe ser 99)');

// ─── 5.7 Casos extremos ───
console.log('▶ 5.7 Casos extremos');
console.log('   _peso("inexistente", 1):', pX._peso('inexistente', 1), '(debe ser false)');
const pAux = NodoElectrico.crear();
const pAux2 = NodoElectrico.crear();
pAux._adyacente_en(pAux2, 'unico');
pAux._peso('unico', 123);
console.log('   peso("unico","inexistente") sobre escalar:', pAux.peso('unico','inexistente'), '(debe ser null)');
console.log('   peso("unico") default:', pAux.peso('unico'), '(debe ser 123)');
*/

// ──────────────────────────────────────────────────────────
// 5. PRUEBAS EXHAUSTIVAS DE PESOS Y ADYACENTE CON PESO
// ──────────────────────────────────────────────────────────
console.group('🔹 Pesos y AdyacenteConPeso');

console.log('▶ 5.0 Preparación de nodos limpios');
const pA = NodoElectrico.crear_con_dato('PA');
const pB = NodoElectrico.crear_con_dato('PB');
const pC = NodoElectrico.crear_con_dato('PC');

pA._adyacente_en(pB, 'e1');
pA._adyacente_en(pC, 'e2');

// ─── 5.1 Asignación directa (acumular = false) ───
console.log('▶ 5.1 Asignación directa (_peso con acumular=false)');
pA._peso('e1', 10, null);
console.log('   peso("e1") tras asignación directa:', pA.peso('e1'), '(debe ser 10)');

pA._peso('e2', 5.5, 'distancia');
console.log('   peso("e2","distancia"):', pA.peso('e2','distancia'), '(debe ser 5.5)');
console.log('   peso("e2") default sin asignar:', pA.peso('e2'), '(debe ser null)');

// ─── 5.2 Acumulación (comportamiento por defecto) ───
console.log('▶ 5.2 Acumulación (_peso por defecto y explícito)');
const res1 = pA._peso('e1', 5, null, true);
console.log('   _peso("e1",5,null,true) devuelve:', res1, '(debe ser 15)');
console.log('   peso("e1"):', pA.peso('e1'), '(debe ser 15)');

const res2 = pA._peso('e1', -3);
console.log('   _peso("e1",-3) devuelve:', res2, '(debe ser 12)');
console.log('   peso("e1"):', pA.peso('e1'), '(debe ser 12)');

const res3 = pA._peso('e2', 2.5, 'energia');
console.log('   _peso("e2",2.5,"energia") devuelve:', res3, '(debe ser 2.5)');
const res4 = pA._peso('e2', 1.5, 'energia');
console.log('   acumular de nuevo ->', res4, '(debe ser 4.0)');

// ─── 5.3 Migración automática de escalar a objeto ───
console.log('▶ 5.3 Migración de escalar a objeto al acumular en nueva dimensión');
const res5 = pA._peso('e1', 7, 'coste');
console.log('   _peso("e1",7,"coste") devuelve:', res5, '(debe ser 7)');
console.log('   pesos("e1"):', JSON.stringify(pA.pesos('e1')), '(debe tener "":12, "coste":7)');
console.log('   peso("e1") default:', pA.peso('e1'), '(debe ser 12)');

// ─── 5.4 Ordenamiento ───
console.log('▶ 5.4 adyacentes_ordenados_por_peso()');
const pD = NodoElectrico.crear_con_dato('PD');
const pE = NodoElectrico.crear_con_dato('PE');
pA._adyacente_en(pD, 'e3');
pA._adyacente_en(pE, 'e4');
pA._peso('e3', 50, null, false);
pA._peso('e4', 30, null, false);

console.log('   Pesos actuales:');
console.log('      e1 default:', pA.peso('e1'), '(12)');
console.log('      e2 default:', pA.peso('e2'), '(null)');
console.log('      e3 default:', pA.peso('e3'), '(50)');
console.log('      e4 default:', pA.peso('e4'), '(30)');

const ordenados1 = pA.adyacentes_ordenados_por_peso(null, false, false);
console.log('   Orden ascendente default (sin incluir sin peso):');
ordenados1.forEach(item => {
    console.log(`      enlace: ${item.nombre_enlace}, nodo: ${item.nodo.id()}, peso: ${item.peso}`);
});

const ordenados2 = pA.adyacentes_ordenados_por_peso(null, false, true);
console.log('   Incluyendo sin peso:');
ordenados2.forEach(item => console.log(`      enlace: ${item.nombre_enlace}, peso: ${item.peso}`));

const ordenados3 = pA.adyacentes_ordenados_por_peso('coste', false, false);
console.log('   Por "coste" (sin incluir sin peso):');
ordenados3.forEach(item => console.log(`      enlace: ${item.nombre_enlace}, peso: ${item.peso}`));

// ─── 5.5 Compatibilidad con Adyacentes ───
console.log('▶ 5.5 Métodos de Adyacentes no afectados');
const ady = pA.adyacente('e1');
console.log('   adyacente("e1") devuelve Nodo id:', ady?.id(), '(debe ser PB)');
const todosMap = pA.adyacentes();
console.log('   adyacentes() devuelve Map con', todosMap?.size, 'elementos');
const tiene = pA.tiene_adyacente_a(pB);
console.log('   tiene_adyacente_a(pB):', tiene ? `'${tiene}'` : 'false', '(debe devolver "e1")');
const resultadosPorCada = pA.por_cada_adyacente_ejecutar((n, e) => n.id());
console.log('   por_cada_adyacente_ejecutar:', [...resultadosPorCada.values()].join(','));

const eliminadoConPeso = pA.eliminar_adyacente('e1');
console.log('   eliminar_adyacente("e1") devuelve:', eliminadoConPeso?.id(), '(debe ser PB)');
console.log('   ¿sigue existiendo e1?', pA.adyacente('e1') ? 'SI (error)' : 'NO (correcto)');

pA.eliminar_adyacentes();
console.log('   después de eliminar_adyacentes, cantidad:', pA.cantidad_de_adyacentes(), '(debe ser 0)');

// ─── 5.6 _adyacente_con_peso y _adyacente_con_peso_en ───
console.log('▶ 5.6 _adyacente_con_peso() y _adyacente_con_peso_en()');
const pX = NodoElectrico.crear_con_dato('PX');
const pY = NodoElectrico.crear_con_dato('PY');
const pZ = NodoElectrico.crear_con_dato('PZ');
console.log("pX.id="+pX.id());
console.log("pY.id="+pY.id());
console.log("pZ.id="+pZ.id());

const enlaceCreado = pX._adyacente_con_peso(pY, 42, 'vitalidad');
console.log('   _adyacente_con_peso genera enlace:', enlaceCreado);
console.log('   peso(enlace, "vitalidad"):', pX.peso(enlaceCreado, 'vitalidad'), '(debe ser 42)');

pX._adyacente_con_peso_en(pZ, 'especial', 7.5);
console.log('   _adyacente_con_peso_en("especial", 7.5) -> peso:', pX.peso('especial'), '(debe ser 7.5)');

pX._adyacente_con_peso_en(pY, 'especial', 99, 'coste', true);
console.log('   tras reemplazar, nodo en "especial":', pX.adyacente('especial')?.id(), '(debe ser PY)');
console.log('   peso("especial","coste"):', pX.peso('especial','coste'), '(debe ser 99)');

// ─── 5.7 Casos extremos ───
console.log('▶ 5.7 Casos extremos');
console.log('   _peso("inexistente", 1):', pX._peso('inexistente', 1), '(debe ser null)');
const pAux = NodoElectrico.crear();
const pAux2 = NodoElectrico.crear();
pAux._adyacente_en(pAux2, 'unico');
pAux._peso('unico', 123, null, false);
console.log('   peso("unico","inexistente") sobre escalar:', pAux.peso('unico', 'inexistente'), '(debe ser null)');
console.log('   peso("unico") default:', pAux.peso('unico'), '(debe ser 123)');
pAux._peso('unico', -50);
console.log('   tras acumular -50:', pAux.peso('unico'), '(debe ser 73)');

console.log('✅ Pruebas de pesos completadas');
console.groupEnd();
/*
// ──────────────────────────────────────────────────────────
// 6. ELIMINACIÓN DE NODOS
// ──────────────────────────────────────────────────────────
console.group('🔹 Eliminación de nodos');
const nodo_eliminar = NodoElectrico.crear_con_dato('Eliminame');
console.log('Nodo creado, id:', nodo_eliminar.id());
const eliminado_ok = NodoElectrico.eliminar(nodo_eliminar);
console.log('eliminar() -> resultado:', eliminado_ok);
console.log('Cantidad de nodos después:', NodoElectrico.cantidad_de_nodos());
console.groupEnd();

// ──────────────────────────────────────────────────────────
// 7. IMPRESIÓN
// ──────────────────────────────────────────────────────────
console.group('🔹 Impresión');
const nodo_print = NodoElectrico.crear_con_dato('Para imprimir');
nodo_print._adyacente_en(NodoElectrico.crear_con_dato('Hijo'), 'hijo');
console.log('imprimir2() en consola:');
nodo_print.imprimir2();
console.groupEnd();

// ──────────────────────────────────────────────────────────
// 8. PERSISTENCIA (Controlador)
// ──────────────────────────────────────────────────────────
async function probar_persistencia() {
    console.group('🔹 Persistencia');
    const nombre_db = 'test_nodos_electricos_js';
    await Controlador.eliminar(nombre_db).catch(() => {});

    const n1 = NodoElectrico.crear_con_dato('N1');
    const n2 = NodoElectrico.crear_con_dato('N2');
    n1._adyacente_en(n2, 'enlace');

    console.log('Guardando...');
    const guardado = await Controlador.guardar(nombre_db);
    console.log('Guardado:', guardado);

    const existe = await Controlador.existe(nombre_db);
    console.log('Existe:', existe);

    const cargado = await Controlador.cargar(nombre_db);
    console.log('Cargado:', cargado);

    const eliminado_db = await Controlador.eliminar(nombre_db);
    console.log('Eliminado de DB:', eliminado_db);
    console.groupEnd();
}
probar_persistencia().catch(console.error);
*/
console.log('🏁 Fin de las pruebas JS');
NodoElectrico.imprimir_alertas();
NodoElectrico.imprimir_errores();