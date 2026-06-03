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

/*
// ──────────────────────────────────────────────────────────
// 3. ADYACENTES
// ──────────────────────────────────────────────────────────
console.group('🔹 Adyacentes');

const nodo_a = NodoElectrico.crear_con_dato('A');
const nodo_b = NodoElectrico.crear_con_dato('B');

const enlace_auto = nodo_a._adyacente(nodo_b);
console.log('_adyacente() -> enlace generado:', enlace_auto);

const ok = nodo_a._adyacente_en(nodo_b, 'enlace_fijo', true);
console.log('_adyacente_en() -> éxito:', ok);

const obtenido = nodo_a.adyacente('enlace_fijo');
console.log('adyacente("enlace_fijo") -> nodo:', obtenido?.dato());

const copia_ady = nodo_a.adyacentes();
console.log('adyacentes() -> tamaño:', copia_ady.size);
console.log('cantidad_de_adyacentes():', nodo_a.cantidad_de_adyacentes());
console.log('tiene_adyacente():', nodo_a.tiene_adyacente());

const enlace_encontrado = nodo_a.tiene_adyacente_a(nodo_b);
console.log('tiene_adyacente_a(nodo_b) -> enlace:', enlace_encontrado);

const eliminado_ady = nodo_a.eliminar_adyacente('enlace_fijo');
console.log('eliminar_adyacente() -> nodo eliminado:', eliminado_ady?.dato());

const todos_ady = nodo_a.eliminar_adyacentes();
console.log('eliminar_adyacentes() -> cantidad eliminada:', todos_ady.size);

const resultados_ady = nodo_a.por_cada_adyacente_ejecutar((n, e) => n.dato());
console.log('por_cada_adyacente_ejecutar() -> resultados:', resultados_ady);
console.groupEnd();

// ──────────────────────────────────────────────────────────
// 4. INCIDENTES
// ──────────────────────────────────────────────────────────
console.group('🔹 Incidentes');

console.log('tiene_incidente() (antes):', nodo_b.tiene_incidente());
nodo_a._adyacente_en(nodo_b, 'prueba');
console.log('tiene_incidente() (después):', nodo_b.tiene_incidente());

const incidente_enlace = nodo_b.tiene_incidente_a(nodo_a);
console.log('tiene_incidente_a(nodo_a) -> enlace:', incidente_enlace);

const incidentes_map = nodo_b.incidentes();
console.log('incidentes() -> estructura:', incidentes_map);
console.log('cantidad_de_incidentes():', nodo_b.cantidad_de_incidentes());

const resultados_inc = nodo_b.por_cada_incidente_ejecutar((n, e) => n.id());
console.log('por_cada_incidente_ejecutar() -> resultados:', resultados_inc);
console.groupEnd();

// ──────────────────────────────────────────────────────────
// 5. ENERGÍA (PENDIENTE)
// ──────────────────────────────────────────────────────────
console.group('🔹 Energía ❌ FALTA IMPLEMENTAR');
console.log('❌ _energia(cantidad)');
console.log('❌ energia()');
console.log('❌ _ejecutar_cuando_satura() / ejecutar_cuando_satura()');
console.log('❌ _ejecutar_cuando_agota() / ejecutar_cuando_agota()');
console.log('❌ métodos estáticos *_por_fase');
console.groupEnd();

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