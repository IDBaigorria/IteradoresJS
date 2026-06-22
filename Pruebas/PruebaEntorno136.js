/**
 * Pruebas exhaustivas de Entorno v1.3.6 (ubicación) en navegador.
 *
 * Utiliza monkey-patching de navigator y fetch para simular todos los
 * escenarios sin necesidad de permisos reales ni conexión a internet.
 *
 * Ejecutar en la consola del navegador o embeber en una página HTML.
 *
 * @since 1.3.6
 */
import { Entorno } from '../Configuracion/Entorno.js';
import { Conf } from '../Configuracion/Configuracion.js';

let pruebas_pasadas = 0;
let pruebas_fallidas = 0;

function assert_iguales(obtenido, esperado, mensaje, tolerancia = 1e-9) {
    const ok = Math.abs(obtenido - esperado) < tolerancia;
    console.log((ok ? '✅' : '❌'), mensaje);
    if (!ok) console.log(`   Esperado: ${esperado}, Obtenido: ${obtenido}`);
    ok ? pruebas_pasadas++ : pruebas_fallidas++;
}

function assert_no_nulo(valor, mensaje) {
    const ok = valor !== null && valor !== undefined;
    console.log((ok ? '✅' : '❌'), mensaje);
    ok ? pruebas_pasadas++ : pruebas_fallidas++;
}

async function ejecutar_pruebas() {
    console.log('══════════════════════════════════');
    console.log(' PRUEBAS ENTORNO 1.3.6 (NAVEGADOR)');
    console.log('══════════════════════════════════\n');

    // --- 1. Constantes ---
    console.log('--- 1. Constantes en Conf ---');
    assert_iguales(Conf.LATITUD_PREDETERMINADA, -34.0, 'LATITUD_PREDETERMINADA');
    assert_iguales(Conf.LONGITUD_PREDETERMINADA, -64.0, 'LONGITUD_PREDETERMINADA');
    assert_no_nulo(Conf.GEOLOCALIZACION_URL, 'GEOLOCALIZACION_URL existe');

    // --- 2. Geolocalización simulada exitosa ---
    console.log('\n--- 2. Geolocalización simulada exitosa ---');
    Entorno._coordenadas_cacheadas = null; // limpiar caché
    const mock_geo_exitosa = {
        getCurrentPosition: (success) => {
            success({ coords: { latitude: 40.4168, longitude: -3.7038 } });
        }
    };
    const coords1 = await Entorno.obtener_coordenadas({ geolocalizacion: mock_geo_exitosa });
    assert_iguales(coords1.latitud, 40.4168, 'Geolocalización: lat Madrid');
    assert_iguales(coords1.longitud, -3.7038, 'Geolocalización: lon Madrid');

    // --- 3. Geolocalización fallida → IP simulada exitosa ---
    console.log('\n--- 3. Geolocalización fallida → IP simulada ---');
    Entorno._coordenadas_cacheadas = null;
    const mock_geo_fallo = {
        getCurrentPosition: (success, error) => {
            error({ message: 'Permission denied' });
        }
    };
    const mock_fetch_exitosa = async () => ({
        ok: true,
        json: async () => ({ latitude: 51.5074, longitude: -0.1278 })
    });
    const coords2 = await Entorno.obtener_coordenadas({
        geolocalizacion: mock_geo_fallo,
        fetch: mock_fetch_exitosa
    });
    assert_iguales(coords2.latitud, 51.5074, 'IP fallback: lat Londres');
    assert_iguales(coords2.longitud, -0.1278, 'IP fallback: lon Londres');

    // --- 4. Ambas fallan → Fallback Conf ---
    console.log('\n--- 4. Ambas fallan → Fallback ---');
    Entorno._coordenadas_cacheadas = null;
    const mock_fetch_fallo = async () => { throw new Error('Network error'); };
    const coords3 = await Entorno.obtener_coordenadas({
        geolocalizacion: mock_geo_fallo,
        fetch: mock_fetch_fallo
    });
    assert_iguales(coords3.latitud, -34.0, 'Fallback latitud Córdoba');
    assert_iguales(coords3.longitud, -64.0, 'Fallback longitud Córdoba');

    // --- 5. Caché ---
    console.log('\n--- 5. Caché ---');
    Entorno._coordenadas_cacheadas = { latitud: 10, longitud: 20 };
    const coords_cache = await Entorno.obtener_coordenadas();
    assert_iguales(coords_cache.latitud, 10, 'Caché: latitud');
    assert_iguales(coords_cache.longitud, 20, 'Caché: longitud');
    Entorno._coordenadas_cacheadas = null;

    // --- 6. Escuchar cambios simulado ---
    console.log('\n--- 6. Escuchar cambios ---');
    let cambio_lat = null, cambio_lon = null;
    const mock_watch = {
        watchPosition: (success) => {
            setTimeout(() => success({ coords: { latitude: 19.0, longitude: -99.0 } }), 10);
            return 123;
        }
    };
    const id = Entorno.escuchar_cambios(
        (lat, lon) => { cambio_lat = lat; cambio_lon = lon; },
        { geolocalizacion: mock_watch }
    );
    assert_no_nulo(id, 'Watcher ID no nulo');
    await new Promise(resolve => setTimeout(resolve, 50));
    assert_iguales(cambio_lat, 19.0, 'Callback lat Ciudad de México');
    assert_iguales(cambio_lon, -99.0, 'Callback lon Ciudad de México');
    assert_iguales(Entorno._coordenadas_cacheadas.latitud, 19.0, 'Caché actualizada');

    console.log('\n══════════════════════════════════');
    console.log(` PRUEBAS: ${pruebas_pasadas} ✅, ${pruebas_fallidas} ❌`);
    console.log('══════════════════════════════════');
}

ejecutar_pruebas().catch(console.error);