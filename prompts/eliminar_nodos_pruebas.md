//correr en consola del navegador logueado como admin
(async () => {
  const nombre_admin = usuario_actual?.nombre_usuario;
  if (!nombre_admin) {
    console.error('No hay usuario logueado.');
    return;
  }

  async function post(accion, params = {}) {
    const body = new URLSearchParams({
      accion,
      nombre_solicitante: nombre_admin,
      ...params
    });
    const r = await fetch('index.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    });
    return r.json();
  }

  // --- Chequeos previos ---
  const entorno = await post('entorno/info');
  if (!entorno.exito || !entorno.es_pruebas) {
    console.error('Abortado: no estás en modo pruebas.', entorno);
    return;
  }
  const r_nivel = await post('usuarios/mi_perfil');
  if (!r_nivel.exito || r_nivel.perfil?.nivel !== 'admin') {
    console.error('Abortado: no sos admin.', r_nivel);
    return;
  }

  console.log('%c=== LIMPIEZA DE DATOS DE PRUEBA ===',
    'color:#0a0; font-weight:bold; font-size:14px');
  console.log('Admin:', nombre_admin);

  // --- Estado inicial ---
  const res_ini = (await post('grafo/resumen')).resumen;
  console.log('Estado inicial: total=' + res_ini.total
    + ' huérfanos=' + res_ini.huerfanos);

  // --- Dueños ---
  const r_duenos = await post('administrador/listar_duenos');
  if (!r_duenos.exito) {
    console.error('No se pudieron listar dueños:', r_duenos);
    return;
  }
  const duenos = (r_duenos.duenos || []).map(d =>
    typeof d === 'string' ? d : d.nombre_usuario
  );
  console.log('Dueños a procesar:', duenos);

  // --- Acumuladores ---
  const totales = {
    ventas: 0, cancelaciones: 0, viajes: 0, pasajeros: 0,
    empresas: 0, vehiculos: 0, terminales: 0, usuarios: 0,
    salteados: 0
  };

  async function limpiar(etiqueta, accion, params = {}) {
    const r = await post(accion, params);
    if (!r.exito) {
      console.warn('  ⚠ ' + etiqueta + ': ' + (r.error || '(sin detalle)'));
      return r;
    }
    const b = r.cantidad_borrados
      ?? r.cantidad_empresas_borradas
      ?? 0;
    const s = r.cantidad_salteados ?? 0;
    const extra = (r.cantidad_vehiculos_borrados > 0)
      ? ' (+' + r.cantidad_vehiculos_borrados + ' vehículos)'
      : '';
    console.log('  ✓ ' + etiqueta + ': ' + b + ' borrados' + extra
      + (s > 0 ? ', ' + s + ' salteados' : ''));
    if (s > 0 && r.salteados) {
      r.salteados.slice(0, 3).forEach(sa => {
        console.log('      - ' + (sa.nombre || sa.id) + ': ' + sa.motivo);
      });
      if (r.salteados.length > 3) {
        console.log('      ... (+' + (r.salteados.length - 3) + ' más)');
      }
    }
    return r;
  }

  // --- Por cada dueño ---
  for (const dueno of duenos) {
    console.log('\n%c=== Dueño: ' + dueno + ' ===',
      'color:#06c; font-weight:bold');
    console.log('-- (1/6) Ventas de prueba --');
    const rv = await limpiar('ventas', 'ventas/limpiar_prueba', { nombre_dueno: dueno });
    totales.ventas += rv.cantidad_borrados || 0;
    totales.salteados += rv.cantidad_salteados || 0;

    console.log('-- (2/6) Cancelaciones de prueba --');
    const rc = await limpiar('cancelaciones', 'cancelaciones/limpiar_prueba', { nombre_dueno: dueno });
    totales.cancelaciones += rc.cantidad_borrados || 0;
    totales.salteados += rc.cantidad_salteados || 0;

    console.log('-- (3/6) Viajes de prueba --');
    const rvia = await limpiar('viajes', 'viajes/limpiar_prueba', { nombre_dueno: dueno });
    totales.viajes += rvia.cantidad_borrados || 0;

    console.log('-- (4/6) Pasajeros de prueba --');
    const rp = await limpiar('pasajeros', 'pasajeros/limpiar_prueba', { nombre_dueno: dueno });
    totales.pasajeros += rp.cantidad_borrados || 0;

    console.log('-- (5/6) Empresas/vehículos de prueba --');
    const re = await limpiar('empresas', 'empresas/limpiar_prueba', { nombre_dueno: dueno });
    totales.empresas += re.cantidad_empresas_borradas || 0;
    totales.vehiculos += re.cantidad_vehiculos_borrados || 0;
    totales.salteados += re.cantidad_salteados || 0;

    console.log('-- (6/6) Terminales de prueba --');
    const rt = await limpiar('terminales', 'dueno/limpiar_terminales_prueba', { nombre_dueno: dueno });
    totales.terminales += rt.cantidad_borrados || 0;
    totales.salteados += rt.cantidad_salteados || 0;
  }

  // --- Global: usuarios de prueba ---
  console.log('\n%c=== GLOBAL ===', 'color:#06c; font-weight:bold');
  const ru = await limpiar('usuarios', 'administrador/limpiar_usuarios_prueba');
  totales.usuarios += ru.cantidad_borrados || 0;
  totales.salteados += ru.cantidad_salteados || 0;

  // --- Estado final ---
  const res_fin = (await post('grafo/resumen')).resumen;

  console.log('\n%c=== RESUMEN ===', 'color:#0a0; font-weight:bold; font-size:14px');
  console.log('Nodos:');
  console.log('  antes:   ' + res_ini.total);
  console.log('  después: ' + res_fin.total);
  console.log('  dif:     ' + (res_fin.total - res_ini.total));
  console.log('Huérfanos:');
  console.log('  antes:   ' + res_ini.huerfanos);
  console.log('  después: ' + res_fin.huerfanos);
  console.log('  dif:     ' + (res_fin.huerfanos - res_ini.huerfanos));

  console.log('\nBorrados por categoría:');
  console.log('  ventas:        ' + totales.ventas);
  console.log('  cancelaciones: ' + totales.cancelaciones);
  console.log('  viajes:        ' + totales.viajes);
  console.log('  pasajeros:     ' + totales.pasajeros);
  console.log('  empresas:      ' + totales.empresas);
  console.log('  vehículos:     ' + totales.vehiculos);
  console.log('  terminales:    ' + totales.terminales);
  console.log('  usuarios:      ' + totales.usuarios);
  if (totales.salteados > 0) {
    console.log('  salteados:     ' + totales.salteados + ' (revisar arriba)');
  }

  console.log('\n%c=== Limpieza terminada ===',
    'color:#0a0; font-weight:bold');
})();