/**
 * utilidades.js
 * Funciones temporales astronómicas: JD, días desde J2000, GMST (Greenwich Mean Sidereal Time)
 *
 * Unidades:
 *  - tiempos de entrada/almacenamiento: segundos desde epoch Unix (1970-01-01T00:00:00Z) o número JS Date.getTime()/1000
 *  - JD devuelto en días julianos.
 */



/* =========================
   CONSTANTES GLOBALES
   ========================= */
export const G = 6.67430e-11; // m^3 kg^-1 s^-2
export const AU_EN_METROS = 149597870700.0; // 1 UA en metros
export const OBLICUIDAD_RAD = 23.439281 * Math.PI / 180.0; // rad

/* =========================
   UTILIDADES MATEMÁTICAS
   ========================= */
export function normalizar_2pi(ang_rad) {
  let a = ang_rad % (2 * Math.PI);
  if (a < 0) a += 2 * Math.PI;
  return a;
}
export function frac_01(f) { return ((f % 1) + 1) % 1; }
export function dot(a,b){ return a.x*b.x + a.y*b.y + a.z*b.z; }
export function norm(v){ return Math.sqrt(v.x*v.x + v.y*v.y + v.z*v.z); }
export function normalize(v){
  const n = norm(v); if (n===0) return {x:0,y:0,z:0}; return {x: v.x/n, y: v.y/n, z: v.z/n};
}
export function add_vec(a,b){ return {x: a.x+b.x, y: a.y+b.y, z: a.z+b.z}; }
export function sub_vec(a,b){ return {x: a.x-b.x, y: a.y-b.y, z: a.z-b.z}; }
export function mul_vec_scalar(v,s){ return {x: v.x*s, y: v.y*s, z: v.z*s}; }
export function cross(a,b){ return { x: a.y*b.z - a.z*b.y, y: a.z*b.x - a.x*b.z, z: a.x*b.y - a.y*b.x }; }

/* =========================
   UTILIDADES DE TIEMPO
   ========================= */
/**
 * Convierte tiempo Unix a JD
 * @param {number} t_seg_unix
 * @returns {number} JD
 */
export function fecha_a_juliano(t_seg_unix){
  return t_seg_unix / 86400.0 + 2440587.5;
}
export function dias_desde_j2000(t_seg_unix){
  return fecha_a_juliano(t_seg_unix) - 2451545.0;
}
/**
 * GMST aproximado en radianes
 * @param {number} t_seg_unix
 * @returns {number}
 */
export function gmst_en_radianes(t_seg_unix){
  const D = dias_desde_j2000(t_seg_unix);
  let gmst_h = (18.697374558 + 24.06570982441908 * D) % 24.0;
  if (gmst_h < 0) gmst_h += 24.0;
  return gmst_h / 24.0 * 2 * Math.PI;
}
/* =========================
   FRAME LOCAL ENU PARA UN ASTRO
   ========================= */
function frame_local_enu_en_eci_para_astro(astro, lat_grados, lon_grados, t_seg_unix){
  const sup = astro.superficie_posicion(lat_grados, lon_grados, 0, t_seg_unix);
  const pos_eci = sup.pos_eci_m;
  const centro = sup.centro_astro_eci;
  const up = normalize(sub_vec(pos_eci, centro));
  const polo_norte_eci = add_vec(centro, { x: 0, y: 0, z: astro.radio_m });
  const north_vec = normalize(sub_vec(polo_norte_eci, pos_eci));
  const east_vec = normalize(cross(up, north_vec));
  const north_ort = normalize(cross(east_vec, up));
  return { east: east_vec, north: north_ort, up: up };
}

/* =========================
   FUNCIONES ASTRONÓMICAS AUXILIARES
   ========================= */
function ecliptica_au_a_eci_m(pos_au){
  const x_m = pos_au.x * AU_EN_METROS;
  const y_m = pos_au.y * AU_EN_METROS;
  const z_m = pos_au.z * AU_EN_METROS;
  const ce = Math.cos(-OBLICUIDAD_RAD);
  const se = Math.sin(-OBLICUIDAD_RAD);
  const y_eq = ce * y_m - se * z_m;
  const z_eq = se * y_m + ce * z_m;
  return { x: x_m, y: y_eq, z: z_eq };
}
function posicion_astro_eci_m(astro, astro_base, t_seg_unix, devolver_geocentrico = true){
  const pos_au = astro.posicion_absoluta(t_seg_unix);
  const pos_eci_m = ecliptica_au_a_eci_m(pos_au);
  if (!devolver_geocentrico || !astro_base) return pos_eci_m;
  const pos_base_au = astro_base.posicion_absoluta(t_seg_unix);
  const pos_base_eci_m = ecliptica_au_a_eci_m(pos_base_au);
  return sub_vec(pos_eci_m, pos_base_eci_m);
}
function vector_topocentrico(pos_astro_eci_m, pos_usuario_eci_m){
  const v = sub_vec(pos_astro_eci_m, pos_usuario_eci_m);
  return { x: v.x, y: v.y, z: v.z, distancia: norm(v) };
}
function altitud_acimut_desde_topocentrico(vec_topo, frame_enu_eci){
  const r = vec_topo.distancia;
  if (r === 0) return { altitud_rad: 0, acimut_rad: 0 };
  const v = { x: vec_topo.x / r, y: vec_topo.y / r, z: vec_topo.z / r };
  const e = dot(v, frame_enu_eci.east);
  const n = dot(v, frame_enu_eci.north);
  const u = dot(v, frame_enu_eci.up);
  const altitud_rad = Math.asin(u);
  let acimut_rad = Math.atan2(e, n);
  if (acimut_rad < 0) acimut_rad += 2*Math.PI;
  return { altitud_rad, acimut_rad };
}

/* =========================
   GRAVEDAD
   ========================= */
function gravedad_desde_astro(pos_astro_eci_m, pos_usuario_eci_m, masa_kg){
  const rx = pos_astro_eci_m.x - pos_usuario_eci_m.x;
  const ry = pos_astro_eci_m.y - pos_usuario_eci_m.y;
  const rz = pos_astro_eci_m.z - pos_usuario_eci_m.z;
  const r2 = rx*rx + ry*ry + rz*rz;
  const r = Math.sqrt(r2);
  if (r === 0) return { gx:0, gy:0, gz:0, magnitud:0 };
  const factor = G * masa_kg / (r2 * r);
  const gx = factor * rx;
  const gy = factor * ry;
  const gz = factor * rz;
  const magnitud = Math.sqrt(gx*gx + gy*gy + gz*gz);
  return { gx, gy, gz, magnitud };
}
function gravedad_total_sobre_usuario(lista_astros, astro_base, lat_grados, lon_grados, alt_m, t_seg_unix){
  const sup = astro_base.superficie_posicion(lat_grados, lon_grados, alt_m, t_seg_unix);
  const pos_usuario_eci_m = sup.pos_eci_m;
  let total = { x:0, y:0, z:0 };
  const contribuciones = [];
  for (const astro of lista_astros){
    const pos_astro_eci_m = posicion_astro_eci_m(astro, astro_base, t_seg_unix, true);
    const g = gravedad_desde_astro(pos_astro_eci_m, pos_usuario_eci_m, astro.masa_kg);
    total.x += g.gx; total.y += g.gy; total.z += g.gz;
    contribuciones.push({ nombre: astro.nombre, g, pos_astro_eci_m });
  }
  const magnitud_total = Math.sqrt(total.x*total.x + total.y*total.y + total.z*total.z);
  return { gravedad_total: { x: total.x, y: total.y, z: total.z, magnitud: magnitud_total }, contribuciones, pos_usuario_eci_m };
}
function proyectar_gravedad_sobre_orientacion(gravedad_total_vec, orient_local_enu, astro_base, lat_grados, lon_grados, t_seg_unix){
  const frame = frame_local_enu_en_eci_para_astro(astro_base, lat_grados, lon_grados, t_seg_unix);
  const v_global = add_vec(add_vec(mul_vec_scalar(frame.east, orient_local_enu.x),
                                   mul_vec_scalar(frame.north, orient_local_enu.y)),
                            mul_vec_scalar(frame.up, orient_local_enu.z));
  const v_norm = normalize(v_global);
  const dotp = gravedad_total_vec.x * v_norm.x + gravedad_total_vec.y * v_norm.y + gravedad_total_vec.z * v_norm.z;
  const paralela = dotp;
  const perp = sub_vec(gravedad_total_vec, mul_vec_scalar(v_norm, paralela));
  return { componente_paralela: paralela, componente_perpendicular: perp, orient_global: v_norm };
}
/* =========================
   FUNCION RECONSTRUIR_TODO_DESDE_STATE
   ========================= */
function reconstruir_todo_desde_state(state, lista_astros, mapa_astros_por_nombre){
  const astro_base = mapa_astros_por_nombre[state.astro_id];
  if (!astro_base) throw new Error("Astro base no encontrado: " + state.astro_id);
  const sup = astro_base.superficie_posicion(state.lat, state.lon, state.alt, state.t);
  const pos_usuario_eci_m = sup.pos_eci_m;
  const centro_astro_eci = sup.centro_astro_eci;
  const frame = frame_local_enu_en_eci_para_astro(astro_base, state.lat, state.lon, state.t);
  const astros_aparentes = [];
  for (const astro of lista_astros){
    const pos_astro_eci_m = posicion_astro_eci_m(astro, astro_base, state.t, true);
    const vec_topo = vector_topocentrico(pos_astro_eci_m, pos_usuario_eci_m);
    const { altitud_rad, acimut_rad } = altitud_acimut_desde_topocentrico(vec_topo, frame);
    const estado_rel = { sobre_cabeza: altitud_rad > (80*Math.PI/180.0), debajo_pies: altitud_rad < (-80*Math.PI/180.0), dia: altitud_rad > 0 };
    astros_aparentes.push({ nombre: astro.nombre, pos_astro_eci_m, vec_topo, altitud_rad, acimut_rad, estado_rel });
  }
  const gravedad_res = gravedad_total_sobre_usuario(lista_astros, astro_base, state.lat, state.lon, state.alt, state.t);
  const proy = proyectar_gravedad_sobre_orientacion(gravedad_res.gravedad_total, state.orient_local_enu, astro_base, state.lat, state.lon, state.t);
  return {
    estado: state,
    astro_base,
    centro_astro_eci,
    pos_usuario_eci_m,
    frame_enu_eci: frame,
    astros_aparentes,
    gravedad: gravedad_res,
    proyeccion: proy
  };
}

/* =========================
   UTIL: mapa_por_nombre
   ========================= */
function mapa_por_nombre(lista){
  const m = {};
  for (const a of lista) m[a.nombre] = a;
  return m;
}