/**
 * Pruebas exhaustivas v1.4.5 + Integración del ciclo de salida v1.4.6
 *
 * Cubre: Senal, Antena, ProcesadorDeDominio, secuencia_de_matrices(),
 *        AplanadorSenal y flujo completo de bytes → señal → bytes.
 *
 * @since 1.4.5
 * @version 1.4.6
 * @author Ignacio David Baigorria
 */
import { Controlador } from '../Controlador/Controlador.js';
import { Matriz2x2 } from '../Nodos/Matriz2x2.js';
import { NodoElectrico } from '../Nodos/NodoElectrico.js';
import { NodoNumerico } from '../Nodos/NodoNumerico.js';
import { NodoPrimo } from '../Nodos/NodoPrimo.js';
import { NodoParalelo } from '../Nodos/NodoParalelo.js';
import { Senal } from '../Iteradores/Senal.js';
import { Antena } from '../Controlador/Antena.js';
import { ProcesadorDeDominio } from '../Controlador/ProcesadorDeDominio.js';
import { MapeoBytesMatrices } from '../Controlador/MapeoBytesMatrices.js';   

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
console.log(' PRUEBAS 1.4.5 + INTEGRACIÓN 1.4.6');
console.log('══════════════════════════════════\n');

Controlador.ejecutar_prueba(function (token) {
    // ══════════════════════════════════
    // 1. PRUEBAS DE Senal
    // ══════════════════════════════════
    console.log('=== 1. Señal (Senal) ===');
    
    console.log('--- 1.1 Creación y agregado de matrices:');
    const senal = new Senal();
    assert_verdadero(senal.longitud_cruda() === 0, 'Señal nueva tiene longitud 0');
    
    const m_a = Matriz2x2.crear_prima(2);
    const m_b = Matriz2x2.crear_prima(3);
    const m_c = Matriz2x2.crear_prima(5);
    senal._matriz(m_a);
    senal._matriz(m_b);
    senal._matriz(m_c);
    assert_verdadero(senal.longitud_cruda() === 3, 'Señal con 3 matrices tiene longitud 3');
    
    console.log('--- 1.2 Consumo sin patrón:');
    senal.consumir(1);
    assert_verdadero(senal.longitud_no_consumida() === 2, 'Tras consumir 1, no consumidas = 2');
    assert_verdadero(senal.indice_consumido() === 1, 'Índice comido = 1');
    
    let elementos = senal.elementos_procesados();
    assert_verdadero(elementos.length === 1, 'Un elemento procesado');
    assert_verdadero(elementos[0] instanceof Matriz2x2, 'Elemento procesado sin patrón es Matriz2x2');
    assert_verdadero(elementos[0].es_igual(m_a), 'La matriz consumida es la primera (M(2))');
    
    console.log('--- 1.3 Consumo con patrón:');
    const nodo_patron = NodoNumerico.crear_primo(97);
    senal.consumir(2, nodo_patron);
    
    assert_verdadero(senal.longitud_no_consumida() === 0, 'Tras consumir 2 más, no consumidas = 0');
    elementos = senal.elementos_procesados();
    assert_verdadero(elementos.length === 2, 'Ahora hay 2 elementos procesados');
    assert_verdadero(elementos[1] === nodo_patron, 'El segundo elemento procesado es el NodoNumerico patrón');
    
    console.log('--- 1.4 Consumo excesivo (manejo de error):');
    const senal_err = new Senal();
    senal_err._matriz(Matriz2x2.inicial());
    senal_err.consumir(5);
    assert_verdadero(senal_err.indice_consumido() === 0, 'Tras intento de consumo excesivo, índice sigue en 0');
    
    console.log('--- 1.5 no_consumidas:');
    const no_cons_1 = senal.no_consumidas();
    assert_verdadero(no_cons_1.length === 0, 'no_consumidas() vacío al haber consumido todo');
    
    const senal_fresca = new Senal([Matriz2x2.inicial(), Matriz2x2.crear_prima(11)]);
    const no_cons_2 = senal_fresca.no_consumidas();
    assert_verdadero(no_cons_2.length === 2, 'no_consumidas() devuelve todas sin consumir');
    
    console.log('--- 1.6 crudas() y elementos_procesados():');
    const crudas = senal.crudas();
    assert_verdadero(crudas.length === 3, 'crudas() devuelve las 3 matrices originales');
    
    // ══════════════════════════════════
    // 2. PRUEBAS DE secuencia_de_matrices()
    // ══════════════════════════════════
    console.log('=== 2. Método secuencia_de_matrices() en NodoNumerico ===');
    
    NodoElectrico._fase(token, 'a');
    
    console.log('--- 2.1 NodoPrimo positivo:');
    const p_2 = NodoNumerico.crear_primo(2);
    const sec_p2 = p_2.secuencia_de_matrices();
    assert_verdadero(sec_p2.length === 1, 'secuencia de primo(2) tiene 1 matriz');
    assert_verdadero(sec_p2[0].es_igual(Matriz2x2.crear_prima(2)), 'secuencia de primo(2) = [M(2)]');
    
    console.log('--- 2.2 NodoPrimo negativo (deshacer):');
    const p_neg = NodoNumerico.crear_primo(-2);
    const sec_p_neg = p_neg.secuencia_de_matrices();
    assert_verdadero(sec_p_neg.length === 1, 'secuencia de primo(-2) tiene 1 matriz');
    assert_verdadero(sec_p_neg[0].es_igual(Matriz2x2.crear_negativa_prima(2)), 'secuencia de primo(-2) = [M(-2)]');
    
    console.log('--- 2.3 NodoParalelo:');
    const p_3 = NodoNumerico.crear_primo(3);
    const p_5 = NodoNumerico.crear_primo(5);
    const paralelo = NodoNumerico.crear_paralelo([p_3, p_5]);
    const sec_par = paralelo.secuencia_de_matrices();
    assert_verdadero(sec_par.length === 2, 'secuencia de paralelo(3,5) tiene 2 matrices (omite marca 1)');
    assert_verdadero(sec_par[0].es_igual(Matriz2x2.crear_prima(3)), 'primera matriz es M(3)');
    assert_verdadero(sec_par[1].es_igual(Matriz2x2.crear_prima(5)), 'segunda matriz es M(5)');
    
    console.log('--- 2.4 Secuencia compuesta (hacer):');
    const p_7 = NodoNumerico.crear_primo(7);
    const comp_hacer = NodoNumerico.crear_numerico([p_2, p_7]);
    const sec_hacer = comp_hacer.secuencia_de_matrices();
    assert_verdadero(sec_hacer.length === 2, 'secuencia compuesta(2,7) tiene 2 matrices');
    assert_verdadero(sec_hacer[0].es_igual(Matriz2x2.crear_prima(2)), 'primera es M(2)');
    assert_verdadero(sec_hacer[1].es_igual(Matriz2x2.crear_prima(7)), 'segunda es M(7)');
    
    console.log('--- 2.5 Secuencia con deshacer (marca -1 omitida):');
    const p_neg3 = NodoNumerico.crear_primo(-3);
    const p_neg5 = NodoNumerico.crear_primo(-5);
    const comp_deshacer = NodoNumerico.crear_numerico([p_neg3, p_neg5]);
    const sec_deshacer = comp_deshacer.secuencia_de_matrices();
    assert_verdadero(sec_deshacer.length === 2, 'secuencia de deshacer omite marca -1: tiene 2 matrices');
    assert_verdadero(sec_deshacer[0].es_igual(Matriz2x2.crear_negativa_prima(3)), 'primera es M(-3)');
    assert_verdadero(sec_deshacer[1].es_igual(Matriz2x2.crear_negativa_prima(5)), 'segunda es M(-5)');
    
    console.log('--- 2.6 Nodo sin p‑grama:');
    const nodo_vacio = NodoNumerico.tomar_nodo_libre();
    const sec_vacia = nodo_vacio.secuencia_de_matrices();
    assert_verdadero(sec_vacia.length === 0, 'secuencia de nodo sin p‑grama es []');
    NodoNumerico.devolver_nodo_libre(nodo_vacio);
    
    // ══════════════════════════════════
    // 3. PRUEBAS DE Antena
    // ══════════════════════════════════
    console.log('=== 3. Antena ===');
    
    const fase_antena = 10;
    NodoElectrico._fase(token, fase_antena);
    
    console.log('--- 3.1 Registro de patrón válido e inválido:');
    const antena = new Antena(fase_antena);
    
    const patron_1 = NodoNumerico.crear_primo(101);
    antena._patron(patron_1);
    assert_verdadero(antena.patrones().length === 1, 'Patrón (primo 101) se registra');
    assert_verdadero(antena.patrones()[0] === patron_1, 'El patrón registrado es el correcto');
    
    const nodo_malo = NodoNumerico.tomar_nodo_libre();
    antena._patron(nodo_malo);
    assert_verdadero(antena.patrones().length === 1, 'Nodo sin identidad real no se registra');
    NodoNumerico.devolver_nodo_libre(nodo_malo);
    
    console.log('--- 3.2 Captura simple con patrón de 1 matriz:');
    const senal_a = new Senal([Matriz2x2.crear_prima(101)]);
    const capturo_a = antena.intentar_capturar(senal_a);
    assert_verdadero(capturo_a, 'Antena captura M(101)');
    assert_verdadero(senal_a.indice_consumido() === 1, 'Índice avanzó 1');
    const elem_a = senal_a.elementos_procesados();
    assert_verdadero(elem_a[0] === patron_1, 'Elemento procesado es el patrón esperado');
    
    console.log('--- 3.3 Captura con patrón de longitud 2:');
    const p_103 = NodoNumerico.crear_primo(103);
    const p_107 = NodoNumerico.crear_primo(107);
    const comp_103_107 = NodoNumerico.crear_numerico([p_103, p_107]);
    
    const antena_2 = new Antena(fase_antena);
    antena_2._patron(comp_103_107);
    
    const senal_b = new Senal([Matriz2x2.crear_prima(103), Matriz2x2.crear_prima(107)]);
    const capturo_b = antena_2.intentar_capturar(senal_b);
    assert_verdadero(capturo_b, 'Antena captura [M(103), M(107)]');
    assert_verdadero(senal_b.indice_consumido() === 2, 'Índice avanzó 2');
    
    console.log('--- 3.4 Prioridad por longitud (voracidad):');
    const p_109 = NodoNumerico.crear_primo(109);
    const comp_103_107_109 = NodoNumerico.crear_numerico([p_103, p_107, p_109]);
    
    const antena_3 = new Antena(fase_antena);
    antena_3._patron(comp_103_107);
    antena_3._patron(comp_103_107_109);
    
    const senal_voraz = new Senal([
        Matriz2x2.crear_prima(103),
        Matriz2x2.crear_prima(107),
        Matriz2x2.crear_prima(109)
    ]);
    assert_verdadero(antena_3.intentar_capturar(senal_voraz), 'Antena captura en modo voraz');
    assert_verdadero(senal_voraz.indice_consumido() === 3, 'Consumió 3 matrices');
    const elem_voraz = senal_voraz.elementos_procesados();
    assert_verdadero(elem_voraz[0] === comp_103_107_109, 'El patrón usado fue el de longitud 3');
    
    console.log('--- 3.5 Sin coincidencia:');
    const senal_no_coincide = new Senal([Matriz2x2.crear_prima(113)]);
    const capturo_no = antena_3.intentar_capturar(senal_no_coincide);
    assert_falso(capturo_no, 'Antena no captura M(113) (sin patrón)');
    assert_verdadero(senal_no_coincide.indice_consumido() === 0, 'Índice sin cambios');
    
    console.log('--- 3.6 Patrón con secuencia de deshacer:');
    const p_neg103 = NodoNumerico.crear_primo(-103);
    const p_neg107 = NodoNumerico.crear_primo(-107);
    const comp_neg_103_107 = NodoNumerico.crear_numerico([p_neg103, p_neg107]);
    
    const antena_deshacer = new Antena(fase_antena);
    antena_deshacer._patron(comp_neg_103_107);
    
    const senal_neg = new Senal([Matriz2x2.crear_negativa_prima(103), Matriz2x2.crear_negativa_prima(107)]);
    assert_verdadero(antena_deshacer.intentar_capturar(senal_neg), 'Antena captura deshacer [M(-103), M(-107)]');
    assert_verdadero(senal_neg.indice_consumido() === 2, 'Índice avanzó 2');
    
    // ══════════════════════════════════
    // 4. PRUEBAS DE ProcesadorDeDominio
    // ══════════════════════════════════
    console.log('=== 4. ProcesadorDeDominio ===');
    
    const fase_1 = 20;
    const fase_2 = 30;
    
    console.log('--- 4.1 Creación y nombre:');
    const proc = new ProcesadorDeDominio('test', 'entrada');
    assert_verdadero(proc.medio() === 'test', 'Nombre del medio correcto');
    assert_verdadero(proc.direccion() === 'entrada', 'Dirección correcta');
    
    console.log('--- 4.2 Procesamiento con múltiples fases:');
    NodoElectrico._fase(token, fase_1);
    const p_a = NodoNumerico.crear_primo(211);
    const p_b = NodoNumerico.crear_primo(223);
    
    NodoElectrico._fase(token, fase_2);
    const comp_ab = NodoNumerico.crear_numerico([p_a, p_b]);
    
    proc._patron(p_a, fase_1);
    proc._patron(p_b, fase_1);
    proc._patron(comp_ab, fase_2);
    
    const senal_ab = new Senal([Matriz2x2.crear_prima(211), Matriz2x2.crear_prima(223)]);
    proc.procesar(senal_ab);
    
    assert_verdadero(senal_ab.indice_consumido() === 2, 'Procesador consumió 2 matrices (\'ab\')');
    const elem_ab = senal_ab.elementos_procesados();
    assert_verdadero(elem_ab.length === 1, 'Procesador produjo 1 elemento procesado');
    assert_verdadero(elem_ab[0] === comp_ab, 'El elemento procesado es el patrón \'ab\'');
    
    console.log('--- 4.3 Señal sin capturas:');
    const senal_sin = new Senal([Matriz2x2.crear_prima(227)]);
    proc.procesar(senal_sin);
    assert_verdadero(senal_sin.indice_consumido() === 1, 'Procesador consumió 1 matriz (aprendizaje trivial)');
    
    console.log('--- 4.4 Capturas múltiples (reinicio voraz):');
    const senal_abab = new Senal([
        Matriz2x2.crear_prima(211),
        Matriz2x2.crear_prima(223),
        Matriz2x2.crear_prima(211),
        Matriz2x2.crear_prima(223)
    ]);
    proc.procesar(senal_abab);
    assert_verdadero(senal_abab.indice_consumido() === 4, 'Procesador consumió 4 matrices (\'abab\')');
    const elem_abab = senal_abab.elementos_procesados();
    assert_verdadero(elem_abab.length === 2, 'Procesador produjo 2 elementos');
    assert_verdadero(elem_abab[0] === comp_ab, 'Primer elemento es \'ab\'');
    assert_verdadero(elem_abab[1] === comp_ab, 'Segundo elemento es \'ab\'');
    
    console.log('--- 4.5 Orden de captura con mezcla de fases:');
    const senal_aba = new Senal([
        Matriz2x2.crear_prima(211),
        Matriz2x2.crear_prima(223),
        Matriz2x2.crear_prima(211)
    ]);
    proc.procesar(senal_aba);
    assert_verdadero(senal_aba.indice_consumido() === 3, 'Procesador consumió 3 matrices (\'aba\')');
    const elem_aba = senal_aba.elementos_procesados();
    assert_verdadero(elem_aba.length === 2, 'Procesador produjo 2 elementos');
    assert_verdadero(elem_aba[0] === comp_ab, 'Primer elemento es \'ab\' (fase 30)');
    assert_verdadero(elem_aba[1] === p_a, 'Segundo elemento es \'a\' (fase 20)');
    
    // ══════════════════════════════════
    // 5. PRUEBAS DE INTEGRACIÓN 1.4.5 (tom)
    // ══════════════════════════════════
    console.log('=== 5. Integración: flujo \'tom\' simplificado ===');
    
    const fase_car = 40;
    const fase_pal = 50;
    
    NodoElectrico._fase(token, fase_car);
    const p_t = NodoNumerico.crear_primo(307);
    const p_o = NodoNumerico.crear_primo(311);
    const p_m = NodoNumerico.crear_primo(313);
    
    NodoElectrico._fase(token, fase_pal);
    const nodo_tom = NodoNumerico.crear_numerico([p_t, p_o, p_m]);
    assert_no_nulo(nodo_tom, "crear_numerico con 3 componentes ('tom') devuelve nodo");
    
    const proc_texto = new ProcesadorDeDominio('texto', 'entrada');
    proc_texto.constructor.recibir_token(token);
    proc_texto._patron(p_t, fase_car);
    proc_texto._patron(p_o, fase_car);
    proc_texto._patron(p_m, fase_car);
    proc_texto._patron(nodo_tom, fase_pal);
    
    const senal_tom = new Senal([
        Matriz2x2.crear_prima(307),
        Matriz2x2.crear_prima(311),
        Matriz2x2.crear_prima(313)
    ]);
    
    proc_texto.procesar(senal_tom);
    
    assert_verdadero(senal_tom.indice_consumido() === 3, 'Procesador consumió toda la señal \'tom\' (3 matrices)');
    const elem_tom = senal_tom.elementos_procesados();
    assert_verdadero(elem_tom.length === 1, 'Procesador dejó 1 elemento: \'tom\'');
    assert_verdadero(elem_tom[0] === nodo_tom, 'El elemento es el patrón \'tom\'');
    
    console.log('--- 5.1 senal_de_salida:');
    const senal_salida = senal_tom.senal_de_salida(fase_car);
    const crudas_salida = senal_salida.crudas();
    assert_verdadero(crudas_salida.length === 1, 'Señal de salida tiene 1 matriz');
    assert_verdadero(crudas_salida[0].es_igual(nodo_tom.identidad()), 'La matriz es la identidad del patrón \'tom\'');
    
    console.log('--- 5.2 Sin fases registradas:');
    const proc_vacio = new ProcesadorDeDominio('vacio', 'entrada');
    const senal_vacia = new Senal([Matriz2x2.inicial()]);
    proc_vacio.procesar(senal_vacia);
    assert_verdadero(senal_vacia.indice_consumido() === 1, 'Procesador consumió 1 matriz (aprendizaje trivial)');

    // ══════════════════════════════════
    // 6. PRUEBA DE INTEGRACIÓN DEL CICLO DE SALIDA 1.4.6
    // ══════════════════════════════════
    console.log('=== 6. Integración del ciclo de salida 1.4.6 ===');
    console.log('--- 6.1 Flujo completo: bytes → dominio vacío → aprendizaje trivial → bytes');

    const texto_original = "fin";
    const senal_salida_2 = Senal.desde_bytes(texto_original);
    assert_verdadero(senal_salida_2.longitud_cruda() === 3, "Señal cruda tiene 3 matrices (f, i, n)");

    const proc_texto_salida = new ProcesadorDeDominio('texto', 'entrada');
    proc_texto_salida.constructor.recibir_token(token);
    proc_texto_salida.procesar(senal_salida_2);

    assert_verdadero(senal_salida_2.indice_consumido() === 3, "Procesador consumió 3 matrices");
    const elem_salida = senal_salida_2.elementos_procesados();
    assert_verdadero(elem_salida.length === 3, "Señal dejó 3 elementos procesados");
    assert_verdadero(elem_salida[0] instanceof NodoPrimo, "Elemento 0 es NodoPrimo");
    assert_verdadero(elem_salida[1] instanceof NodoPrimo, "Elemento 1 es NodoPrimo");
    assert_verdadero(elem_salida[2] instanceof NodoPrimo, "Elemento 2 es NodoPrimo");

    // DEBUG: ver contenido de los elementos procesados
    console.log('DEBUG: elementos procesados antes de a_bytes:');
    for (let i = 0; i < elem_salida.length; i++) {
        const e = elem_salida[i];
        console.log(`Elemento ${i}: es_primo=${e.es_primo ? e.es_primo() : false}, pgrama=${JSON.stringify(e.pgrama())}, abajo=${JSON.stringify(e.dato('abajo'))}`);
    }

    const fase_anterior = NodoElectrico.fase();
    NodoElectrico._fase(token, 'texto:entrada:0');

    const bytes_salida = Senal.a_bytes(senal_salida_2);
    const ok = assert_verdadero(bytes_salida === texto_original, "Bytes de salida coinciden con la entrada original ('fin')");

    NodoElectrico._fase(token, fase_anterior);

    if (ok) {
        console.log('\nResultado final:');
        console.log('Entrada:', texto_original);
        console.log('Salida: ', bytes_salida);
        console.log('\n✅ Ciclo de salida 1.4.6 verificado correctamente.');
    }
});

console.log('\n══════════════════════════════════');
console.log(' PRUEBAS 1.4.5 + INTEGRACIÓN 1.4.6 FINALIZADAS');
console.log('══════════════════════════════════');