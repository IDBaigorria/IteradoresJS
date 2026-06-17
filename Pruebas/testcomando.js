
// ============================================================
// TEST DE COMANDO (JS)
// ============================================================
// Estado de implementación:
// ✅ = implementado y probado
// ⏳ = pendiente / incompleto
// ❌ = no implementado
// ============================================================

import { Objeto, Nodo, NodoElectrico, Comando, Comunicador, Controlador, Conf, Entorno } from '../index.js';
import './../Comunicadores/index.js'
import './../Comandos/index.js';         // puebla registro_pendiente
//import './../Comunicadores/index.js';    // puebla registro_comunicadores_pendiente


// alert("prueba comand2222");
// Forzar modo desarrollo si no está definido (opcional)
if (!Entorno.es_desarrollo()) {
    console.warn('⚠️ Las pruebas deberían ejecutarse en entorno DESARROLLO');
}

/*console.log('🚀 Inicio de pruebas para Comando (JS)');

console.group('🔹 Pruebas del sistema de comandos (debug:imprimir)');

Controlador.ejecutar_prueba((token) => {
    // 7.1 Ejecutar el comando debug:imprimir en modo CONSOLA
    console.log('▶ 7.1 Ejecutar "debug:imprimir" en modo CONSOLA');
    Entorno.establecer_salida(Entorno.SALIDA_CONSOLA);
    const resultado = Controlador.ejecutar_comando('debug:imprimir');
    console.log('   Resultado:', resultado, '(debe ser true)');

    // 7.2 Ejecutar el comando en modo HTML
    console.log('▶ 7.2 Ejecutar "debug:imprimir" en modo HTML');
    Entorno.establecer_salida(Entorno.SALIDA_HTML);
    Controlador.ejecutar_comando('debug:imprimir');

    // 7.3 Intentar ejecutar un comando inexistente
    console.log('▶ 7.3 Ejecutar comando inexistente');
    const resInexistente = Controlador.ejecutar_comando('comando:inexistente');
    console.log('   Resultado:', resInexistente, '(debe ser null)');
    console.log('   (Debe aparecer un error en el log)');
    NodoElectrico.imprimir_errores();
    NodoElectrico.limpiar_errores();

    // 7.4 Probar deshacer con pila vacía
    console.log('▶ 7.4 Deshacer con historial vacío');
    const resDeshacer = Controlador.deshacer_ultimo();
    console.log('   Resultado:', resDeshacer, '(debe ser null)');
    console.log('   (Debe aparecer una alerta "No hay comandos para deshacer")');
    NodoElectrico.imprimir_alertas();
    NodoElectrico.limpiar_alertas();

    // 7.5 Registrar un comando en caliente (post-inicialización)
    console.log('▶ 7.5 Registrar comando en tiempo de ejecución');
    const registrado = Controlador.registrar_comando(
        'prueba:eco',
        (token, ...args) => args.join(', '),
        null,
        false
    );
    console.log('   Registro:', registrado, '(debe ser true)');
    const eco = Controlador.ejecutar_comando('prueba:eco', 'Hola', 'Mundo');
    console.log('   Ejecución con argumentos:', eco, "(debe ser 'Hola, Mundo')");

    // 7.6 Probar que un comando de desarrollo no se registra en producción
    console.log('▶ 7.6 Bloqueo de comando de desarrollo en producción');
    Entorno.establecer_modo(Entorno.MODO_PRODUCCION);
    const registradoProd = Controlador.registrar_comando(
        'debug:temp', () => {}, null, true
    );
    console.log('   Registro en producción:', registradoProd, '(debe ser false)');
    Entorno.establecer_modo(Entorno.MODO_DESARROLLO);

    console.log('▶ 7.7 Encolar comando después de inicializar (registro inmediato)');
    const ComandoAnonimo = class extends Comando {   // ← extender Comando
        static nombre() { return 'anonimo:test'; }
        static solo_desarrollo() { return false; }
        ejecutar(token, ...args) { return 'OK'; }
        reversa() { return null; }
    };
    const instanciaAnonima = new ComandoAnonimo();
    Controlador.encolar_comando(instanciaAnonima);
    const resAnonimo = Controlador.ejecutar_comando('anonimo:test');
    console.log('   Resultado:', resAnonimo, "(debe ser 'OK')");

    console.log('✅ Pruebas de comandos completadas');
});

console.groupEnd();*/

// ──────────────────────────────────────────────────────────
// PRUEBAS EXHAUSTIVAS DEL SISTEMA DE COMANDOS v1.3.2
// ──────────────────────────────────────────────────────────
// Cubre: parseo centralizado, ayuda automática, validación
// de argumentos, palabras reservadas y el comando
// depuracion:imprimir.
// ──────────────────────────────────────────────────────────
/*
console.group('🔹 Pruebas del sistema de comandos v1.3.2');

Controlador.ejecutar_prueba((token) => {
    let nodo=Nodo.crear();
    Nodo._error("error");
    Nodo._alerta("alerta");
    // ─── 7.1 Ejecución básica del comando depuracion:imprimir ───
    console.log('▶ 7.1 Ejecutar "depuracion:imprimir" sin argumentos (todo)');
    Entorno.establecer_salida(Entorno.SALIDA_CONSOLA);
    let resultado = Controlador.ejecutar_comando('depuracion:imprimir');
    console.log('   Resultado:', resultado, '(debe ser true)');

    // ─── 7.2 Ejecutar con una sola bandera ───
    console.log('▶ 7.2 Ejecutar "depuracion:imprimir --errores"');
    resultado = Controlador.ejecutar_comando('depuracion:imprimir', '--errores');
    console.log('   Resultado:', resultado, '(debe ser true)');

    // ─── 7.3 Ejecutar con múltiples banderas ───
    console.log('▶ 7.3 Ejecutar "depuracion:imprimir --errores --super"');
    resultado = Controlador.ejecutar_comando('depuracion:imprimir', '--errores', '--super');
    console.log('   Resultado:', resultado, '(debe ser true)');

    // ─── 7.4 Solicitar ayuda con --man ───
    console.log('▶ 7.4 Solicitar ayuda con "depuracion:imprimir --man"');
    resultado = Controlador.ejecutar_comando('depuracion:imprimir', '--man');
    console.log('   Resultado:', resultado, '(debe ser true, y debe mostrarse la ayuda)');

    // ─── 7.5 Solicitar ayuda con --help ───
    console.log('▶ 7.5 Solicitar ayuda con "depuracion:imprimir --help"');
    resultado = Controlador.ejecutar_comando('depuracion:imprimir', '--help');
    console.log('   Resultado:', resultado, '(debe ser true)');

    // ─── 7.6 Pasar un flag desconocido ───
    console.log('▶ 7.6 Pasar flag desconocido "--desconocido"');
    NodoElectrico.limpiar_errores();
    resultado = Controlador.ejecutar_comando('depuracion:imprimir', '--desconocido');
    console.log('   Resultado:', resultado, '(debe ser null)');
    console.log('   Errores generados:');
    NodoElectrico.imprimir_errores();

    // ─── 7.7 Comando sin definición de parámetros ───
    console.log('▶ 7.7 Registrar y ejecutar comando sin parametros()');
    const ComandoSimple = class extends Comando {
        static nombre() { return 'test:simple'; }
        static solo_desarrollo() { return false; }
        static descripcion() { return 'Comando simple.'; }
        static parametros() { return []; }
        static ejemplos() { return []; }
        ejecutar(token, args) { return 'OK'; }
        reversa() { return null; }
    };
    const instanciaSimple = new ComandoSimple();
    Controlador.encolar_comando(instanciaSimple);
    resultado = Controlador.ejecutar_comando('test:simple', 'cualquier', 'cosa');
    console.log('   Resultado:', resultado, "(debe ser 'OK')");

    // ─── 7.8 Comando inexistente ───
    console.log('▶ 7.8 Ejecutar comando inexistente');
    NodoElectrico.limpiar_errores();
    resultado = Controlador.ejecutar_comando('comando:inexistente');
    console.log('   Resultado:', resultado, '(debe ser null)');
    console.log('   Errores generados:');
    NodoElectrico.imprimir_errores();

    // ─── 7.9 Probar bloqueo de comandos de desarrollo en producción ───
    console.log('▶ 7.9 Bloqueo de comando de desarrollo en producción');
    Entorno.establecer_modo(Entorno.MODO_PRODUCCION);
    const registrado = Controlador.registrar_comando('depuracion:temp', () => {}, null, true);
    console.log('   Registro en producción:', registrado, '(debe ser false)');
    Entorno.establecer_modo(Entorno.MODO_DESARROLLO);

    // ─── 7.10 Deshacer con historial vacío ───
    console.log('▶ 7.10 Deshacer con historial vacío');
    NodoElectrico.limpiar_alertas();
    resultado = Controlador.deshacer_ultimo();
    console.log('   Resultado:', resultado, '(debe ser null)');
    console.log('   Alertas generadas:');
    NodoElectrico.imprimir_alertas();

    console.log('✅ Pruebas de comandos v1.3.2 completadas');
});

console.groupEnd();*/

// ──────────────────────────────────────────────────────────
// PRUEBAS EXHAUSTIVAS DE LOS COMANDOS DE DEPURACIÓN v1.3.2
// ──────────────────────────────────────────────────────────
// Cubre: depuracion:imprimir, depuracion:limpiar,
// depuracion:recoleccion y sus combinaciones.
// ──────────────────────────────────────────────────────────
/*
console.group('🔹 Pruebas de los tres comandos de depuración');

Controlador.ejecutar_prueba((token) => {
    // ─── Preparación: generar errores y alertas ─────────────
    NodoElectrico.limpiar_errores();
    NodoElectrico.limpiar_alertas();
    NodoElectrico._error("Error de prueba A");
    NodoElectrico._error("Error de prueba B");
    NodoElectrico._alerta("Alerta de prueba 1");
    NodoElectrico._alerta("Alerta de prueba 2");
    NodoElectrico._alerta("Alerta de prueba 3");

    // ─── 8.1 Imprimir todo ──────────────────────────────────
    console.log('▶ 8.1 depuracion:imprimir (sin argumentos)');
    Controlador.ejecutar_comando('depuracion:imprimir');

    // ─── 8.2 Imprimir solo errores ─────────────────────────
    console.log('▶ 8.2 depuracion:imprimir --errores');
    Controlador.ejecutar_comando('depuracion:imprimir', '--errores');

    // ─── 8.3 Limpiar solo alertas ──────────────────────────
    console.log('▶ 8.3 depuracion:limpiar --alertas (debe quedar 2 errores)');
    Controlador.ejecutar_comando('depuracion:limpiar', '--alertas');
    Controlador.ejecutar_comando('depuracion:imprimir');
    console.log('   (No deberían aparecer alertas)');

    // ─── 8.4 Imprimir solo alertas (vacío) ─────────────────
    console.log('▶ 8.4 depuracion:imprimir --alertas (debe estar vacío)');
    Controlador.ejecutar_comando('depuracion:imprimir', '--alertas');

    // ─── 8.5 Limpiar todo ──────────────────────────────────
    console.log('▶ 8.5 depuracion:limpiar (limpia ambas pilas)');
    Controlador.ejecutar_comando('depuracion:limpiar');
    Controlador.ejecutar_comando('depuracion:imprimir');
    console.log('   (No debería haber errores ni alertas)');

    // ─── 8.6 Desactivar recolección y generar mensajes ──────
    console.log('▶ 8.6 Desactivar recolección de errores y generar uno');
    Controlador.ejecutar_comando('depuracion:recoleccion', 'desactivar', '--errores');
    NodoElectrico._error("Este error NO debe registrarse");
    Controlador.ejecutar_comando('depuracion:imprimir', '--errores');
    console.log('   (No debería aparecer el error)');

    // ─── 8.7 Reactivar recolección y generar otro ──────────
    console.log('▶ 8.7 Activar recolección de errores y generar otro');
    Controlador.ejecutar_comando('depuracion:recoleccion', 'activar', '--errores');
    NodoElectrico._error("Este error SÍ debe registrarse");
    Controlador.ejecutar_comando('depuracion:imprimir', '--errores');
    console.log('   (Debe aparecer un error)');

    // ─── 8.8 Desactivar todo ───────────────────────────────
    console.log('▶ 8.8 depuracion:recoleccion desactivar (todo)');
    Controlador.ejecutar_comando('depuracion:recoleccion', 'desactivar');
    NodoElectrico._error("No registrado");
    NodoElectrico._alerta("No registrada");
    Controlador.ejecutar_comando('depuracion:imprimir', '--errores', '--alertas');
    console.log('   (Debe aparecer un error)');

    // ─── 8.9 Reactivar todo y generar ─────────────────────
    console.log('▶ 8.9 depuracion:recoleccion activar (todo)');
    Controlador.ejecutar_comando('depuracion:recoleccion', 'activar');
    NodoElectrico._error("Error final");
    NodoElectrico._alerta("Alerta final");
    Controlador.ejecutar_comando('depuracion:imprimir');
    console.log('   (Deben aparecer ambos)');

    // ─── 8.10 Ayuda de cada comando ───────────────────────
    console.log('▶ 8.10 Ayuda de los tres comandos');
    Controlador.ejecutar_comando('depuracion:limpiar');
    Controlador.ejecutar_comando('depuracion:imprimir', '--man');
    Controlador.ejecutar_comando('depuracion:limpiar', '--help');
    Controlador.ejecutar_comando('depuracion:recoleccion', '-h');
    Controlador.ejecutar_comando('depuracion:imprimir', '--manual');
    Controlador.ejecutar_comando('depuracion:limpiar', '--ayuda');
    Controlador.ejecutar_comando('depuracion:recoleccion', '-ay');
    Controlador.ejecutar_comando('depuracion:imprimir');

    // ─── 8.11 Combinaciones inválidas ────────────────────
    console.log('▶ 8.11 Combinaciones inválidas');
    NodoElectrico.limpiar_errores();
    Controlador.ejecutar_comando('depuracion:recoleccion', 'invalidar');
    Controlador.ejecutar_comando('depuracion:recoleccion');
    Controlador.ejecutar_comando('depuracion:imprimir', '--inexistente');
    console.log('   Errores generados:');
    NodoElectrico.imprimir_errores();

    console.log('✅ Pruebas de los tres comandos de depuración completadas');
});

console.groupEnd();
*/
// ─── 9. Pruebas de comando reversible con argumentos ───
/*console.group('🔹 Comando reversible con argumentos');

Controlador.ejecutar_prueba((token) => {
    console.log("▶ 9.1 Ejecutar 'prueba:crear_nodo' con argumentos");
    const resultado = Controlador.ejecutar_comando('prueba:crear_nodo', 'Sensor', '--capacidad=150', '--fuga=0.3');
    console.log('   Resultado:', resultado);
    const id_nodo = parseInt(resultado.match(/\d+/)?.[0]);
    console.log('   ID del nodo creado:', id_nodo);
    Controlador.ejecutar_comando("depuracion:imprimir");
    console.log('▶ 9.2 Verificar que el nodo existe');
    const nodo = NodoElectrico.existe(id_nodo) ? NodoElectrico.nodo_por_id(id_nodo) : null;
    console.log('   Nodo obtenido:', nodo ? nodo.dato() : 'no encontrado');
    Controlador.ejecutar_comando("depuracion:imprimir");
    console.log('▶ 9.3 Deshacer el comando (eliminar nodo)');
    const deshecho = Controlador.deshacer_ultimo();
    console.log('   Resultado de deshacer:', deshecho);
    Controlador.ejecutar_comando("depuracion:imprimir");
    console.log('▶ 9.4 Verificar que el nodo ya no existe');
    console.log('   Existe:', NodoElectrico.existe(id_nodo) ? 'sí (error)' : 'no (correcto)');
    Controlador.ejecutar_comando("depuracion:imprimir");
    console.log('▶ 9.5 Deshacer de nuevo (pila vacía)');
    NodoElectrico.limpiar_alertas();
    const res_vacio = Controlador.deshacer_ultimo();
    console.log('   Resultado:', res_vacio, '(debe ser null)');
   // NodoElectrico.imprimir_alertas();
    Controlador.ejecutar_comando("depuracion:imprimir");
    console.log('✅ Pruebas de comando reversible completadas');
});

console.groupEnd();*/
// ──────────────────────────────────────────────────────────
// 10. PRUEBAS DE LA VERSIÓN 1.3.3 (COMUNICADORES)
// ──────────────────────────────────────────────────────────
console.group('🔹 Comunicadores y comandos de comunicación v1.3.3');

Controlador.ejecutar_prueba((token) => {

    // ─── 10.1 Escribir en salida estándar ────────────────────
    console.log('▶ 10.1 Escribir en salida estándar mediante Controlador.escribir_salida()');
    Controlador.escribir_salida('   Mensaje de prueba desde escribir_salida (debe verse en el formato adecuado)');
/*
    // Prueba 10.2
     console.log('▶ 10.2 Comunicación:escribir en salida consola');

    Controlador.ejecutar_comando('comunicacion:escribir', 'salida_depuracion_consola', 'Hola desde prueba');


    // ─── 10.3 Comunicación con archivos (limitado en navegador)
    console.log('▶ 10.3 Leer y descargar archivo (limitado en navegador, solo descarga)');
    Controlador.ejecutar_comando('comunicacion:escribir', 'archivo', 'Contenido de prueba', 'test.txt');

    // ─── 10.4 Listar directorio (no soportado en navegador) ──
    console.log('▶ 10.4 Intentar listar directorio (debe mostrar error informativo)');
    Controlador.ejecutar_comando('comunicacion:listar', 'archivo', '.');
    NodoElectrico.imprimir_errores();
    NodoElectrico.limpiar_errores();

    // ─── 10.5 Ayuda de comandos de comunicación ─────────────
    console.log('▶ 10.5 Ayuda de comunicación:leer');
    Controlador.ejecutar_comando('comunicacion:leer', '--help');

    // ─── 10.6 Verificar comandos de depuración actualizados ──
    console.log('▶ 10.6 Comandos de depuración con nueva salida');
    NodoElectrico.limpiar_errores();
    NodoElectrico.limpiar_alertas();
    NodoElectrico._error("Error de prueba v1.3.3");
    NodoElectrico._alerta("Alerta de prueba v1.3.3");

    console.log('   Ejecutando depuracion:imprimir (debe verse el error y la alerta):');
    Controlador.ejecutar_comando('depuracion:imprimir');

    console.log('   Ejecutando depuracion:limpiar --errores:');
    Controlador.ejecutar_comando('depuracion:limpiar', '--errores');
    console.log('   Verificación (errores deberían estar vacíos):');
    Controlador.ejecutar_comando('depuracion:imprimir', '--errores');

    console.log('   Ejecutando depuracion:limpiar (limpiar todo):');
    Controlador.ejecutar_comando('depuracion:limpiar');
    Controlador.ejecutar_comando('depuracion:imprimir');*/

    console.log('✅ Pruebas de la versión 1.3.3 completadas');
});

console.groupEnd();