import { Objeto, Nodo, NodoElectrico, Controlador, Conf, Entorno } from '../index.js';

// Forzar modo desarrollo si no está definido (opcional)
if (!Entorno.es_desarrollo()) {
    console.warn('⚠️ Las pruebas deberían ejecutarse en entorno DESARROLLO');
}

console.log('🚀 Inicio de pruebas para Entorno e Impresión (JS)');

// ──────────────────────────────────────────────────────────
// 0. CONFIGURACIÓN INICIAL
// ──────────────────────────────────────────────────────────
console.group('🔹 Configuración inicial de Entorno');
console.log('▶ Modo actual:', Entorno.modo());
console.log('▶ Tipo de salida:', Entorno.salida());
console.log('▶ Persistencia:', Entorno.persistencia());
console.log('▶ ¿Permite pruebas?:', Entorno.permite_pruebas());
console.groupEnd();
/*
// ──────────────────────────────────────────────────────────
// 1. PRUEBAS DE ENTORNO
// ──────────────────────────────────────────────────────────
console.group('🔹 Pruebas de Entorno');

console.log('▶ 1.1 Cambiar a producción y verificar');
Entorno.establecer_modo(Entorno.MODO_PRODUCCION);
console.log('   Modo:', Entorno.modo(), '(debe ser "produccion")');
console.log('   ¿Es producción?:', Entorno.es_produccion() ? 'Sí (correcto)' : 'No (error)');
console.log('   ¿Permite pruebas?:', Entorno.permite_pruebas() ? 'Sí (error)' : 'No (correcto)');

console.log('▶ 1.2 Cambiar tipo de salida a consola y verificar');
Entorno.establecer_salida(Entorno.SALIDA_CONSOLA);
console.log('   Tipo de salida:', Entorno.salida(), '(debe ser "consola")');
console.log('   ¿Es consola?:', Entorno.es_consola() ? 'Sí (correcto)' : 'No (error)');

console.log('▶ 1.3 Cambiar método de persistencia a json');
Entorno.establecer_persistencia(Entorno.PERSISTENCIA_JSON);
console.log('   Persistencia:', Entorno.persistencia(), '(debe ser "json")');
console.log('   ¿Es json?:', Entorno.es_persistencia_json() ? 'Sí (correcto)' : 'No (error)');

console.log('▶ 1.4 Volver a desarrollo, HTML y INDEXEDBD');
Entorno.establecer_modo(Entorno.MODO_DESARROLLO);
Entorno.establecer_salida(Entorno.SALIDA_HTML);
Entorno.establecer_persistencia(Entorno.PERSISTENCIA_INDEXEDBD);
console.log('   Modo:', Entorno.modo());
console.log('   Salida:', Entorno.salida());
console.log('   Persistencia:', Entorno.persistencia());

console.groupEnd();

// ──────────────────────────────────────────────────────────
// 2. PRUEBAS DE OBJETO (ERRORES Y ALERTAS)
// ──────────────────────────────────────────────────────────
console.group('🔹 Pruebas de Objeto (errores y alertas)');

// Limpiar previos

// Generar
NodoElectrico._error('Error de prueba 1: algo salió mal');
NodoElectrico._alerta('Alerta de prueba 1: precaución');

console.log('▶ 2.1 Imprimir errores en modo HTML');
Entorno.establecer_salida(Entorno.SALIDA_HTML);
NodoElectrico.imprimir_errores();

console.log('▶ 2.2 Imprimir alertas en modo HTML');
NodoElectrico.imprimir_alertas();

console.log('▶ 2.3 Imprimir errores en modo CONSOLA');
Entorno.establecer_salida(Entorno.SALIDA_CONSOLA);
NodoElectrico.imprimir_errores();

console.log('▶ 2.4 Imprimir alertas en modo CONSOLA');
NodoElectrico.imprimir_alertas();

console.log('▶ 2.5 Verificar que en producción los errores/alertas SÍ se muestran');
Entorno.establecer_modo(Entorno.MODO_PRODUCCION);
Entorno.establecer_salida(Entorno.SALIDA_CONSOLA);
console.log('   (Debe verse el error y alerta a continuación)');
NodoElectrico.imprimir_errores();
NodoElectrico.imprimir_alertas();

Entorno.establecer_modo(Entorno.MODO_DESARROLLO);

console.groupEnd();

// ──────────────────────────────────────────────────────────
// 3. PRUEBAS DE IMPRESIÓN DE NODO (CLASE BASE)
// ──────────────────────────────────────────────────────────
console.group('🔹 Pruebas de Nodo (imprimir)');

const nodo_base = Nodo.crear_con_dato('Nodo Base');
nodo_base._adyacente_en(Nodo.crear_con_dato('Vecino'), 'enlace1');

console.log('▶ 3.1 Imprimir Nodo en modo CONSOLA');
Entorno.establecer_salida(Entorno.SALIDA_CONSOLA);
nodo_base.imprimir();

console.log('▶ 3.2 Imprimir Nodo en modo HTML');
Entorno.establecer_salida(Entorno.SALIDA_HTML);
console.log(nodo_base.imprimir()); // HTML retorna string
Nodo.imprimir_alertas();
console.log('▶ 3.3 Verificar que en producción NO se imprime y se genera alerta');
Entorno.establecer_modo(Entorno.MODO_PRODUCCION);
nodo_base.imprimir();
console.log('   (Debe aparecer una alerta de que no está permitido)');
Nodo.imprimir_alertas();

Entorno.establecer_modo(Entorno.MODO_DESARROLLO);

console.groupEnd();

// ──────────────────────────────────────────────────────────
// 4. PRUEBAS DE IMPRESIÓN DE NODOELECTRICO
// ──────────────────────────────────────────────────────────
console.group('🔹 Pruebas de NodoElectrico (imprimir)');

const ne1 = NodoElectrico.crear_con_dato('NE1');
const ne2 = NodoElectrico.crear_con_dato('NE2');
const ne3 = NodoElectrico.crear_con_dato('NE3');

ne1._adyacente_en(ne2, 'e1');
ne1._peso('e1', 10);                     // default acumula
ne1._adyacente_en(ne3, 'e2');
ne1._peso('e2', 5.5, 'distancia', false); // asignación directa
ne1._peso('e2', 3, 'coste');             // acumula coste

console.log('▶ 4.1 Imprimir NodoElectrico en CONSOLA (fase actual: ' + NodoElectrico.fase() + ')');
Entorno.establecer_salida(Entorno.SALIDA_CONSOLA);
ne1.imprimir();

console.log('▶ 4.2 Imprimir NodoElectrico en HTML');
Entorno.establecer_salida(Entorno.SALIDA_HTML);
console.log(ne1.imprimir());
//NodoElectrico.imprimir_alertas();
console.log('▶ 4.3 Verificar que en producción NO se imprime');
Entorno.establecer_modo(Entorno.MODO_PRODUCCION);
ne1.imprimir();
console.log('   (Debe aparecer una alerta)');
NodoElectrico.imprimir_alertas();

Entorno.establecer_modo(Entorno.MODO_DESARROLLO);
Entorno.establecer_salida(Entorno.SALIDA_HTML);

console.groupEnd();
*/
// ──────────────────────────────────────────────────────────
// 6. PRUEBAS DE IMPRESIÓN DE LA SUPERESTRUCTURA
// ──────────────────────────────────────────────────────────
console.group('🔹 Impresión de la superestructura (Controlador)');

// El token se inicializa internamente con ejecutar_prueba
Controlador.ejecutar_prueba((token) => {
    console.log('▶ 6.1 Preparar superestructura mixta');

    // Nodos base
    const n1 = Nodo.crear_con_dato('Base 1');
    const n2 = Nodo.crear_con_dato('Base 2');
    n1._adyacente_en(n2, 'b1');

    // Nodos eléctricos con pesos
    const ne1 = NodoElectrico.crear_con_dato('Eléctrico A');
    const ne2 = NodoElectrico.crear_con_dato('Eléctrico B');
    ne1._adyacente_en(ne2, 'e1');
    ne1._peso('e1', 10);                     // default acumula
    ne1._adyacente_en(ne2, 'e2');            // creamos e2
    ne1._peso('e2', 5.5, 'distancia', false); // asignación directa

    // Enlace mixto
    n1._adyacente_en(ne1, 'mixto');

    console.log('   Nodos creados: 2 base + 2 eléctricos');

    console.log('▶ 6.2 Imprimir superestructura en modo CONSOLA');
    Entorno.establecer_salida(Entorno.SALIDA_CONSOLA);
    Controlador.imprimir_superestructura();

    console.log('▶ 6.3 Imprimir superestructura en modo HTML');
    Entorno.establecer_salida(Entorno.SALIDA_HTML);
    Controlador.imprimir_superestructura();

    console.log('▶ 6.4 Verificar que en producción NO se imprime');
    Entorno.establecer_modo(Entorno.MODO_PRODUCCION);
    Controlador.imprimir_superestructura();
    console.log('   (Debe aparecer una alerta)');
    NodoElectrico.imprimir_alertas();
    Entorno.establecer_modo(Entorno.MODO_DESARROLLO);

    console.log('▶ 6.5 Superestructura vacía');
    // Simplemente mostramos cuántos nodos hay ahora
    console.log('   (Actualmente hay ' + Nodo.cantidad_de_nodos() + ' nodos en la superestructura)');

    console.log('✅ Pruebas de superestructura completadas');
});

console.groupEnd();

// ──────────────────────────────────────────────────────────
// 6. RESUMEN FINAL
// ──────────────────────────────────────────────────────────
Objeto.imprimir_alertas();
Objeto.imprimir_errores();
console.log('✅ Pruebas de Entorno e Impresión finalizadas');