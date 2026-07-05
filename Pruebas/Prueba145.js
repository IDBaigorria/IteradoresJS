/**
 * Pruebas exhaustivas v1.4.5 – Framework Iteradores (JS)
 *
 * Cubre: Senal, Antena, ProcesadorDeDominio y secuencia_de_matrices() en NodoNumerico.
 *
 * @since 1.4.5
 * @author Ignacio David Baigorria
 */
import { Controlador } from '../Controlador/Controlador.js';
import { Matriz2x2 } from '../Nodos/Matriz2x2.js';
import { NodoElectrico } from '../Nodos/NodoElectrico.js';
import { NodoNumerico } from '../Nodos/NodoNumerico.js';
import { NodoPrimo } from '../Nodos/NodoPrimo.js';
import { NodoParalelo } from '../Nodos/NodoParalelo.js';
import { Senal } from '../Controlador/Senal.js';
import { Antena } from '../Controlador/Antena.js';
import { ProcesadorDeDominio } from '../Controlador/ProcesadorDeDominio.js';

// ─── Helpers ──────────────────────────────────────────
function assert_iguales(a, b, mensaje, tolerancia = 1e-9) {
    let ok;
    if (a === b) {
        ok = true;
    } else if (typeof a === 'number' && typeof b === 'number') {
        ok = Math.abs(a - b) < tolerancia;
    } else {
        ok = false;
    }
    console.log((ok ? '✅ ' : '❌ ') + mensaje);
    if (!ok) console.log('   Esperado: ' + b + ', Obtenido: ' + a);
    return ok;
}

function assert_no_nulo(v, mensaje) {
    const ok = v !== null && v !== undefined;
    console.log((ok ? '✅ ' : '❌ ') + mensaje);
    if (!ok) console.log('   Se esperaba valor no nulo.');
    return ok;
}

function assert_verdadero(v, mensaje) {
    const ok = !!v;
    console.log((ok ? '✅ ' : '❌ ') + mensaje);
    return ok;
}

function assert_falso(v, mensaje) {
    const ok = !v;
    console.log((ok ? '✅ ' : '❌ ') + mensaje);
    return ok;
}

console.log('══════════════════════════════════');
console.log(' PRUEBAS 1.4.5 - Framework Iteradores (JS)');
console.log('══════════════════════════════════\n');

Controlador.ejecutar_prueba(function (token) {
    // ══════════════════════════════════
    // 1. PRUEBAS DE Senal
    // ══════════════════════════════════
    console.log('=== 1. Señal (Senal) ===');
    
    console.log('--- 1.1 Creación y agregado de matrices:');
    const senal = new Senal();
    assert_verdadero(senal.longitud_cruda() === 0, 'Señal nueva tiene longitud 0');
    
    const mA = Matriz2x2.crear_prima(2);
    const mB = Matriz2x2.crear_prima(3);
    const mC = Matriz2x2.crear_prima(5);
    senal._matriz(mA);
    senal._matriz(mB);
    senal._matriz(mC);
    assert_verdadero(senal.longitud_cruda() === 3, 'Señal con 3 matrices tiene longitud 3');
    
    console.log('--- 1.2 Consumo sin patrón:');
    senal.consumir(1);
    assert_verdadero(senal.longitud_no_consumida() === 2, 'Tras consumir 1, no consumidas = 2');
    assert_verdadero(senal.indice_consumido() === 1, 'Índice comido = 1');
    
    let elementos = senal.elementos_procesados();
    assert_verdadero(elementos.length === 1, 'Un elemento procesado');
    assert_verdadero(elementos[0] instanceof Matriz2x2, 'Elemento procesado sin patrón es Matriz2x2');
    assert_verdadero(elementos[0].es_igual(mA), 'La matriz consumida es la primera (M(2))');
    
    console.log('--- 1.3 Consumo con patrón:');
    // Nodo primo real (tiene identidad y p‑grama propios)
    const nodoPatron = NodoNumerico.crear_primo(97);
    senal.consumir(2, nodoPatron);
    
    assert_verdadero(senal.longitud_no_consumida() === 0, 'Tras consumir 2 más, no consumidas = 0');
    elementos = senal.elementos_procesados();
    assert_verdadero(elementos.length === 2, 'Ahora hay 2 elementos procesados');
    assert_verdadero(elementos[1] === nodoPatron, 'El segundo elemento procesado es el NodoNumerico patrón');
    
    console.log('--- 1.4 Consumo excesivo (manejo de error):');
    const senalErr = new Senal();
    senalErr._matriz(Matriz2x2.inicial());
    senalErr.consumir(5);
    assert_verdadero(senalErr.indice_consumido() === 0, 'Tras intento de consumo excesivo, índice sigue en 0');
    
    console.log('--- 1.5 obtener_no_consumidas:');
    const noCons1 = senal.no_consumidas();
    assert_verdadero(noCons1.length === 0, 'obtener_no_consumidas() vacío al haber consumido todo');
    
    const senalFresca = new Senal([Matriz2x2.inicial(), Matriz2x2.crear_prima(11)]);
    const noCons2 = senalFresca.no_consumidas();
    assert_verdadero(noCons2.length === 2, 'obtener_no_consumidas() devuelve todas sin consumir');
    
    console.log('--- 1.6 obtener_crudas() y obtener_elementos_procesados():');
    const crudas = senal.crudas();
    assert_verdadero(crudas.length === 3, 'obtener_crudas() devuelve las 3 matrices originales');
    
    // ══════════════════════════════════
    // 2. PRUEBAS DE secuencia_de_matrices()
    // ══════════════════════════════════
    console.log('=== 2. Método secuencia_de_matrices() en NodoNumerico ===');
    
    NodoElectrico._fase(token, 'a');
    
    console.log('--- 2.1 NodoPrimo positivo:');
    const p2 = NodoNumerico.crear_primo(2);
    const secP2 = p2.secuencia_de_matrices();
    assert_verdadero(secP2.length === 1, 'secuencia de primo(2) tiene 1 matriz');
    assert_verdadero(secP2[0].es_igual(Matriz2x2.crear_prima(2)), 'secuencia de primo(2) = [M(2)]');
    
    console.log('--- 2.2 NodoPrimo negativo (deshacer):');
    const pNeg = NodoNumerico.crear_primo(-2);
    const secPNeg = pNeg.secuencia_de_matrices();
    assert_verdadero(secPNeg.length === 1, 'secuencia de primo(-2) tiene 1 matriz');
    assert_verdadero(secPNeg[0].es_igual(Matriz2x2.crear_negativa_prima(2)), 'secuencia de primo(-2) = [M(-2)]');
    
    console.log('--- 2.3 NodoParalelo:');
    const p3 = NodoNumerico.crear_primo(3);
    const p5 = NodoNumerico.crear_primo(5);
    const paralelo = NodoNumerico.crear_paralelo([p3, p5]);
    const secPar = paralelo.secuencia_de_matrices();
    assert_verdadero(secPar.length === 2, 'secuencia de paralelo(3,5) tiene 2 matrices (omite marca 1)');
    assert_verdadero(secPar[0].es_igual(Matriz2x2.crear_prima(3)), 'primera matriz es M(3)');
    assert_verdadero(secPar[1].es_igual(Matriz2x2.crear_prima(5)), 'segunda matriz es M(5)');
    
    console.log('--- 2.4 Secuencia compuesta (hacer):');
    const p7 = NodoNumerico.crear_primo(7);
    const compHacer = NodoNumerico.crear_numerico([p2, p7]);
    const secHacer = compHacer.secuencia_de_matrices();
    assert_verdadero(secHacer.length === 2, 'secuencia compuesta(2,7) tiene 2 matrices');
    assert_verdadero(secHacer[0].es_igual(Matriz2x2.crear_prima(2)), 'primera es M(2)');
    assert_verdadero(secHacer[1].es_igual(Matriz2x2.crear_prima(7)), 'segunda es M(7)');
    
    console.log('--- 2.5 Secuencia con deshacer (marca -1 omitida):');
    const pNeg3 = NodoNumerico.crear_primo(-3);
    const pNeg5 = NodoNumerico.crear_primo(-5);
    const compDeshacer = NodoNumerico.crear_numerico([pNeg3, pNeg5]);
    const secDeshacer = compDeshacer.secuencia_de_matrices();
    assert_verdadero(secDeshacer.length === 2, 'secuencia de deshacer omite marca -1: tiene 2 matrices');
    assert_verdadero(secDeshacer[0].es_igual(Matriz2x2.crear_negativa_prima(3)), 'primera es M(-3)');
    assert_verdadero(secDeshacer[1].es_igual(Matriz2x2.crear_negativa_prima(5)), 'segunda es M(-5)');
    
    console.log('--- 2.6 Nodo sin p‑grama:');
    const nodoVacio = NodoNumerico._tomar_nodo_libre();
    const secVacia = nodoVacio.secuencia_de_matrices();
    assert_verdadero(secVacia.length === 0, 'secuencia de nodo sin p‑grama es []');
    NodoNumerico._devolver_nodo_libre(nodoVacio);
    
    // ══════════════════════════════════
    // 3. PRUEBAS DE Antena
    // ══════════════════════════════════
    console.log('=== 3. Antena ===');
    
    NodoElectrico._fase(token, 'x');
    
    console.log('--- 3.1 Registro de patrón válido e inválido:');
    const antena = new Antena('x');
    
    // Nodo sin identidad real (nodo libre) no debe registrarse
    const nodoMalo = NodoNumerico._tomar_nodo_libre();
    antena.registrar_patron(nodoMalo);
    assert_verdadero(antena.patrones().length === 0, 'Nodo sin identidad real no se registra como patrón');
    
    // Nodo con identidad real (primo) sí debe registrarse
    const patron1 = NodoNumerico.crear_primo(11);
    antena.registrar_patron(patron1);
    assert_verdadero(antena.patrones().length === 1, 'Patrón con identidad real se registra');
    assert_verdadero(antena.patrones()[0] === patron1, 'El patrón registrado es el correcto');
    
    NodoNumerico._devolver_nodo_libre(nodoMalo);
    
    console.log('--- 3.2 Captura simple con patrón de 1 matriz:');
    const senalA = new Senal([Matriz2x2.crear_prima(11)]);
    const capturoA = antena.intentar_capturar(senalA);
    assert_verdadero(capturoA, 'Antena captura M(11)');
    assert_verdadero(senalA.indice_consumido() === 1, 'Índice avanzó 1');
    const elemA = senalA.elementos_procesados();
    assert_verdadero(elemA[0] === patron1, 'Elemento procesado es el patrón esperado');
    
    console.log('--- 3.3 Captura con patrón de longitud 2:');
    NodoElectrico._fase(token, 'x');
    const p13 = NodoNumerico.crear_primo(13);
    const p17 = NodoNumerico.crear_primo(17);
    const comp1317 = NodoNumerico.crear_numerico([p13, p17]);
    
    const antena2 = new Antena('x');
    antena2.registrar_patron(comp1317);
    
    const senalB = new Senal([Matriz2x2.crear_prima(13), Matriz2x2.crear_prima(17)]);
    const capturoB = antena2.intentar_capturar(senalB);
    assert_verdadero(capturoB, 'Antena captura [M(13), M(17)]');
    assert_verdadero(senalB.indice_consumido() === 2, 'Índice avanzó 2');
    
    console.log('--- 3.4 Prioridad por longitud (voracidad):');
    const p19 = NodoNumerico.crear_primo(19);
    const comp131719 = NodoNumerico.crear_numerico([p13, p17, p19]);
    
    const antena3 = new Antena('x');
    // Registramos primero el corto, luego el largo
    antena3.registrar_patron(comp1317);       // longitud 2
    antena3.registrar_patron(comp131719);     // longitud 3
    
    const senalVoraz = new Senal([
        Matriz2x2.crear_prima(13),
        Matriz2x2.crear_prima(17),
        Matriz2x2.crear_prima(19)
    ]);
    const capturoVoraz = antena3.intentar_capturar(senalVoraz);
    assert_verdadero(capturoVoraz, 'Antena captura en modo voraz');
    assert_verdadero(senalVoraz.indice_consumido() === 3, 'Consumió 3 matrices (la secuencia más larga)');
    const elemVoraz = senalVoraz.elementos_procesados();
    assert_verdadero(elemVoraz[0] === comp131719, 'El patrón usado fue el de longitud 3');
    
    console.log('--- 3.5 Sin coincidencia:');
    const senalNoCoincide = new Senal([Matriz2x2.crear_prima(23)]);
    const capturoNo = antena3.intentar_capturar(senalNoCoincide);
    assert_falso(capturoNo, 'Antena no captura M(23) (sin patrón)');
    assert_verdadero(senalNoCoincide.indice_consumido() === 0, 'Índice sin cambios');
    
    console.log('--- 3.6 Patrón con secuencia de deshacer:');
    const pNeg13 = NodoNumerico.crear_primo(-13);
    const pNeg17 = NodoNumerico.crear_primo(-17);
    const compNeg1317 = NodoNumerico.crear_numerico([pNeg13, pNeg17]);
    
    const antenaDeshacer = new Antena('x');
    antenaDeshacer.registrar_patron(compNeg1317);
    
    const senalNeg = new Senal([Matriz2x2.crear_negativa_prima(13), Matriz2x2.crear_negativa_prima(17)]);
    const capturoNeg = antenaDeshacer.intentar_capturar(senalNeg);
    assert_verdadero(capturoNeg, 'Antena captura secuencia de deshacer [M(-13), M(-17)]');
    assert_verdadero(senalNeg.indice_consumido() === 2, 'Índice avanzó 2 en señal de deshacer');
    
    // ══════════════════════════════════
    // 4. PRUEBAS DE ProcesadorDeDominio
    // ══════════════════════════════════
    console.log('=== 4. ProcesadorDeDominio ===');
    
    NodoElectrico._fase(token, 'y');
    
    console.log('--- 4.1 Creación y nombre:');
    const proc = new ProcesadorDeDominio('test');
    assert_verdadero(proc.nombre_dominio() === 'test', 'Nombre del dominio correcto');
    
    console.log('--- 4.2 Procesamiento con múltiples fases:');
    // Mini-lenguaje:
    // Fase 'a': letras 'a' = primo 2, 'b' = primo 3
    // Fase 'b': palabra "ab" = composición de 2 y 3
    NodoElectrico._fase(token, 'a');
    const pA = NodoNumerico.crear_primo(2);
    const pB = NodoNumerico.crear_primo(3);
    
    NodoElectrico._fase(token, 'b');
    const compAB = NodoNumerico.crear_numerico([pA, pB]);
    
    proc._patron(pA, 'a');
    proc._patron(pB, 'a');
    proc._patron(compAB, 'b');
    
    // Señal "ab" → debe capturarse como palabra compuesta (fase 'b')
    const senalAB = new Senal([Matriz2x2.crear_prima(2), Matriz2x2.crear_prima(3)]);
    proc.procesar(senalAB);
    
    assert_verdadero(senalAB.indice_consumido() === 2, 'Procesador consumió 2 matrices (\'ab\')');
    const elemAB = senalAB.elementos_procesados();
    assert_verdadero(elemAB.length === 1, 'Procesador produjo 1 elemento procesado');
    assert_verdadero(elemAB[0] === compAB, 'El elemento procesado es el patrón \'ab\'');
    
    console.log('--- 4.3 Señal sin capturas:');
    const senalSin = new Senal([Matriz2x2.crear_prima(5)]); // primo 5 no tiene patrón
    proc.procesar(senalSin);
    assert_verdadero(senalSin.indice_consumido() === 0, 'Procesador no consumió nada');
    
    console.log('--- 4.4 Capturas múltiples (reinicio voraz):');
    // Señal "abab" = [M(2), M(3), M(2), M(3)]
    const senalABAB = new Senal([
        Matriz2x2.crear_prima(2),
        Matriz2x2.crear_prima(3),
        Matriz2x2.crear_prima(2),
        Matriz2x2.crear_prima(3)
    ]);
    proc.procesar(senalABAB);
    assert_verdadero(senalABAB.indice_consumido() === 4, 'Procesador consumió 4 matrices (\'abab\')');
    const elemABAB = senalABAB.elementos_procesados();
    assert_verdadero(elemABAB.length === 2, 'Procesador produjo 2 elementos');
    assert_verdadero(elemABAB[0] === compAB, 'Primer elemento es \'ab\'');
    assert_verdadero(elemABAB[1] === compAB, 'Segundo elemento es \'ab\'');
    
    console.log('--- 4.5 Orden de captura con mezcla de fases:');
    // Señal "aba" = [M(2), M(3), M(2)]
    const senalABA = new Senal([
        Matriz2x2.crear_prima(2),
        Matriz2x2.crear_prima(3),
        Matriz2x2.crear_prima(2)
    ]);
    proc.procesar(senalABA);
    assert_verdadero(senalABA.indice_consumido() === 3, 'Procesador consumió 3 matrices (\'aba\')');
    const elemABA = senalABA.elementos_procesados();
    assert_verdadero(elemABA.length === 2, 'Procesador produjo 2 elementos');
    assert_verdadero(elemABA[0] === compAB, 'Primer elemento es \'ab\' (fase b)');
    assert_verdadero(elemABA[1] === pA, 'Segundo elemento es \'a\' (fase a)');
    
    // ══════════════════════════════════
    // 5. PRUEBAS DE INTEGRACIÓN
    // ══════════════════════════════════
    console.log('=== 5. Integración: flujo \'tom\' simplificado ===');
    
    NodoElectrico._fase(token, 'car');
    const pT = NodoNumerico.crear_primo(29); // t
    const pO = NodoNumerico.crear_primo(31); // o
    const pM = NodoNumerico.crear_primo(37); // m
    
    NodoElectrico._fase(token, 'pal');
    const nodoTom = NodoNumerico.crear_numerico([pT, pO, pM]);
    
    const procTexto = new ProcesadorDeDominio('texto:entrada');
    procTexto._patron(pT, 'car');
    procTexto._patron(pO, 'car');
    procTexto._patron(pM, 'car');
    procTexto._patron(nodoTom, 'pal');
    
    const senalTom = new Senal([
        Matriz2x2.crear_prima(29),
        Matriz2x2.crear_prima(31),
        Matriz2x2.crear_prima(37)
    ]);
    
    procTexto.procesar(senalTom);
    
    assert_verdadero(senalTom.indice_consumido() === 3, 'Procesador consumió toda la señal \'tom\' (3 matrices)');
    const elemTom = senalTom.elementos_procesados();
    assert_verdadero(elemTom.length === 1, 'Procesador dejó 1 elemento: \'tom\'');
    assert_verdadero(elemTom[0] === nodoTom, 'El elemento es el patrón \'tom\'');
    
    console.log('--- 5.1 generar_senal_de_salida:');
    const senalSalida = senalTom.generar_senal_de_salida('car');
    const crudasSalida = senalSalida.crudas();
    assert_verdadero(crudasSalida.length === 1, 'Señal de salida tiene 1 matriz');
    assert_verdadero(crudasSalida[0].es_igual(nodoTom.identidad()), 'La matriz es la identidad del patrón \'tom\'');
    
    console.log('--- 5.2 Sin fases registradas:');
    const procVacio = new ProcesadorDeDominio('vacio');
    const senalVacia = new Senal([Matriz2x2.inicial()]);
    procVacio.procesar(senalVacia);
    assert_verdadero(senalVacia.indice_consumido() === 0, 'Procesador sin fases no consume nada');
});

console.log('\n══════════════════════════════════');
console.log(' PRUEBAS 1.4.5 FINALIZADAS');
console.log('══════════════════════════════════');