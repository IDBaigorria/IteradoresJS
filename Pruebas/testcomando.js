// ============================================================
// TEST DE COMANDO (JS)
// ============================================================
// Estado de implementación:
// ✅ = implementado y probado
// ⏳ = pendiente / incompleto
// ❌ = no implementado
// ============================================================

import { Objeto, Nodo, NodoElectrico, Comando, Controlador, Conf, Entorno } from '../index.js';


 alert("prueba comand2222");
// Forzar modo desarrollo si no está definido (opcional)
if (!Entorno.es_desarrollo()) {
    console.warn('⚠️ Las pruebas deberían ejecutarse en entorno DESARROLLO');
}

console.log('🚀 Inicio de pruebas para Comando (JS)');

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

console.groupEnd();