import { Objeto, Nodo, NodoElectrico, Controlador, Conf, Entorno } from '../index.js';

// Forzar modo desarrollo si no está definido (opcional)
if (!Entorno.es_desarrollo()) {
    console.warn('⚠️ Las pruebas deberían ejecutarse en entorno DESARROLLO');
}

console.log('🚀 Inicio de pruebas para NodoElectrico (JS)');

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

console.groupEnd();
/*
// ──────────────────────────────────────────────────────────
// 2. FÁBRICA DE NODOS ELÉCTRICOS
// ──────────────────────────────────────────────────────────
console.group('🔹 Fábrica de Nodos Eléctricos');

const nodo_vacio = NodoElectrico.crear();
console.log('crear() -> id:', nodo_vacio.id(), 'dato:', nodo_vacio.dato());

const nodo_con_dato = NodoElectrico.crear_con_dato('Hola JS');
console.log('crear_con_dato() -> id:', nodo_con_dato.id(), 'dato:', nodo_con_dato.dato());

const nodo_con_id = NodoElectrico.crear_con_id('especial_js');
console.log('crear_con_id() -> id:', nodo_con_id?.id(), 'es_especial:', nodo_con_id?.es_especial());

const nodo_completo = NodoElectrico.crear_con_dato_e_id('Dato especial', 'id_compuesto');
console.log('crear_con_dato_e_id() -> id:', nodo_completo?.id(), 'dato:', nodo_completo?.dato());

const nodo0 = NodoElectrico.nodo();
console.log('nodo() sin params -> id:', nodo0.id(), 'dato:', nodo0.dato());

const nodo1 = NodoElectrico.nodo('Texto', (n, es_nodo) => {
    console.log(`Callback: es_nodo = ${es_nodo}, nodo id = ${n.id()}`);
});
console.log('nodo() con callback -> id:', nodo1.id());

const nodo2 = NodoElectrico.nodo(nodo1, (n, es_nodo) => {
    console.log(`Callback reutilizando nodo: es_nodo = ${es_nodo}, mismo id = ${n.id()}`);
});
console.log('nodo() reutilizando nodo -> id:', nodo2.id());

console.log('Cantidad de nodos:', NodoElectrico.cantidad_de_nodos());
console.groupEnd();

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