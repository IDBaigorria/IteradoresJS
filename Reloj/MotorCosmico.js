/**
 * MotorCosmico.js
 * Motor astronómico que:
 *  - transforma posiciones de Astro (eclíptica/heliocéntrica en AU) a ECI en metros
 *  - calcula vector topocéntrico usuario->astro
 *  - calcula altitud azimut del astro desde el punto del usuario (para día/noche y "sobre cabeza")
 *  - calcula vector gravitacional total y proyectado sobre la orientación del usuario
 *
 * Dependencias: utilidades_tiempo.js, Localizacion.js
 */

import { AU_EN_METROS } from "./utilidades.js";
import { posicion_usuario_eci, frame_local_enu_en_eci } from "./Localizacion.js";

/** Constantes físicas */
const G = 6.67430e-11; // m^3 kg^-1 s^-2

/** Oblicuidad de la eclíptica (J2000) para convertir eclíptica -> ecuatorial */
const OBLICUIDAD_RAD = 23.439281 * Math.PI / 180.0;

/**
 * Convierte vector en coordenadas eclípticas (x,y,z, unidades AU) a metros y luego a coordenadas ecuatoriales (ECI)
 * Pasos:
 *  - UA -> m
 *  - rotar alrededor del eje X por -oblicuidad para pasar de eclíptica a ecuatorial
 *  - se asume que el sistema está centrado en el Sol (heliocéntrico); más adelante restamos la posición de la Tierra
 *
 * @param {{x:number,y:number,z:number}} pos_au - posicion en AU en plano eclíptico
 * @returns {{x:number,y:number,z:number}} pos en metros en coordenadas ecuatoriales (m)
 */
export function ecliptica_au_a_ecuatorial_m(pos_au) {
  const x_m = pos_au.x * AU_EN_METROS;
  const y_m = pos_au.y * AU_EN_METROS;
  const z_m = pos_au.z * AU_EN_METROS;

  // rotación alrededor del eje X por -ε (oblicuidad)
  const ce = Math.cos(-OBLICUIDAD_RAD);
  const se = Math.sin(-OBLICUIDAD_RAD);

  const y_eq = ce * y_m - se * z_m;
  const z_eq = se * y_m + ce * z_m;
  const x_eq = x_m;

  return { x: x_eq, y: y_eq, z: z_eq };
}

/**
 * Calcula la posición ECI (metros) de un astro dado su método posicion_absoluta (que devuelve AU eclípticos)
 * y restando la posición heliocéntrica de la Tierra para producir vectores geocéntricos si se desea.
 *
 * @param {Object} astro - objeto que expone metodo posicion_absoluta(t_seg_unix) devolviendo {x,y,z} en AU (eclíptico heliocéntrico)
 * @param {Object|null} astro_tierra - objeto astro para la Tierra (misma interfaz) o null si no resta
 * @param {number} t_seg_unix - tiempo Unix en segundos
 * @param {boolean} devolver_geocentrico - si true, devuelve vector geocéntrico ECI (astro - tierra) en metros; si false devuelve heliocéntrico en ECI (metros)
 * @returns {{x:number,y:number,z:number}} posición en ECI (m)
 */
export function posicion_astro_eci_m(astro, astro_tierra, t_seg_unix, devolver_geocentrico = true) {
  // obtener posiciones en AU (asumimos metodo posicion_absoluta en AU eclíptico)
  const pos_au = astro.posicion_absoluta(t_seg_unix);
  const pos_eq_m = ecliptica_au_a_ecuatorial_m(pos_au); // heliocéntrico en ECI-like (ecuatorial)

  if (!devolver_geocentrico || !astro_tierra) {
    return pos_eq_m;
  }

  // restar posición de la Tierra (heliocéntrica) -> geocéntrico
  const pos_tierra_au = astro_tierra.posicion_absoluta(t_seg_unix);
  const pos_tierra_eq_m = ecliptica_au_a_ecuatorial_m(pos_tierra_au);

  return {
    x: pos_eq_m.x - pos_tierra_eq_m.x,
    y: pos_eq_m.y - pos_tierra_eq_m.y,
    z: pos_eq_m.z - pos_tierra_eq_m.z
  };
}

/**
 * Calcula el vector topocéntrico (desde la posición del usuario en ECI hacia el astro en ECI).
 * @param {{x:number,y:number,z:number}} astro_eci_m - posición del astro en ECI (m) (o geocéntrica)
 * @param {{x:number,y:number,z:number}} usuario_eci_m - posición del usuario en ECI (m)
 * @returns {{x:number,y:number,z:number,distancia:number}} vector y distancia (m)
 */
export function vector_topocentrico(astro_eci_m, usuario_eci_m) {
  const dx = astro_eci_m.x - usuario_eci_m.x;
  const dy = astro_eci_m.y - usuario_eci_m.y;
  const dz = astro_eci_m.z - usuario_eci_m.z;
  const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
  return { x: dx, y: dy, z: dz, distancia: dist };
}

/**
 * Calcula altitud (elevación) y acimut del astro desde la posición del usuario.
 * Utiliza el frame local ENU (expresado en ECI) para proyectar vector_topocentrico.
 *
 * @param {{x:number,y:number,z:number}} vec_topo - vector topocéntrico ECI (m)
 * @param {{east:object,north:object,up:object}} frame_enu_eci - vectores unitarios ENU en ECI
 * @returns {{altitud_rad:number, acimut_rad:number}} altitud (rad, -π/2..π/2), acimut (rad 0..2π medido desde north hacia east)
 */
export function altitud_acimut_desde_topocentrico(vec_topo, frame_enu_eci) {
  // proyectar vector en componentes ENU
  const dot = (a,b) => a.x*b.x + a.y*b.y + a.z*b.z;
  // normalizar vector topo
  const r = vec_topo.distancia;
  if (r === 0) return { altitud_rad: 0, acimut_rad: 0 };
  const v = { x: vec_topo.x / r, y: vec_topo.y / r, z: vec_topo.z / r };

  const e = dot(v, frame_enu_eci.east);
  const n = dot(v, frame_enu_eci.north);
  const u = dot(v, frame_enu_eci.up);

  const altitud_rad = Math.asin(u); // -π/2 .. π/2
  // acimut: atan2(east, north) -> 0 = north, increasing hacia east
  let acimut_rad = Math.atan2(e, n);
  if (acimut_rad < 0) acimut_rad += 2*Math.PI;

  return { altitud_rad, acimut_rad };
}

/**
 * Calcula la contribución gravitacional (vector) de un astro sobre un punto (usuario).
 * Fórmula: g = -G * M / r^2 * r_hat  (vector en m/s^2, dirección hacia el astro)
 *
 * @param {{x:number,y:number,z:number}} pos_astro_m - posición del astro en ECI (m) (si es geocéntrico, pos desde centro de la Tierra a astro)
 * @param {{x:number,y:number,z:number}} pos_usuario_eci_m - posición del usuario en ECI (m)
 * @param {number} masa_kg - masa del astro en kg
 * @returns {{gx:number,gy:number,gz:number, magnitud:number}} vector gravedad en m/s^2 (atracción sobre el usuario)
 */
export function gravedad_desde_astro(pos_astro_m, pos_usuario_eci_m, masa_kg) {
  const rx = pos_astro_m.x - pos_usuario_eci_m.x;
  const ry = pos_astro_m.y - pos_usuario_eci_m.y;
  const rz = pos_astro_m.z - pos_usuario_eci_m.z;
  const r2 = rx*rx + ry*ry + rz*rz;
  const r = Math.sqrt(r2);
  if (r === 0) return { gx: 0, gy: 0, gz: 0, magnitud: 0 };
  const factor = G * masa_kg / (r2 * r); // G*M / r^3
  const gx = factor * rx;
  const gy = factor * ry;
  const gz = factor * rz;
  const magnitud = Math.sqrt(gx*gx + gy*gy + gz*gz);
  return { gx, gy, gz, magnitud };
}

/**
 * Suma las gravidades de una lista de astros sobre el usuario.
 * Los astros deben tener:
 *  - metodo posicion_absoluta(t_seg_unix) -> {x,y,z} en AU (eclíptico heliocéntrico)
 *  - propiedad masa_kg
 *
 * @param {Array} lista_astros
 * @param {Object} astro_tierra - astro que representa la Tierra (misma interfaz)
 * @param {number} lat_grados
 * @param {number} lon_grados
 * @param {number} alt_m
 * @param {number} t_seg_unix
 * @returns {{
 *   gravedad_total: {x:number,y:number,z:number,magnitud:number},
 *   contribuciones: Array<{nombre:string,g:{gx,gy,gz,magnitud}}>
 * }}
 */
export function gravedad_total_sobre_usuario(lista_astros, astro_tierra, lat_grados, lon_grados, alt_m, t_seg_unix) {
  // posicion usuario en ECI
  const usuario_eci = posicion_usuario_eci(lat_grados, lon_grados, alt_m, t_seg_unix);

  const total = { x:0, y:0, z:0 };
  const contribuciones = [];

  for (const astro of lista_astros) {
    const pos_astro_eci = posicion_astro_eci_m(astro, astro_tierra, t_seg_unix, true); // geocéntrico en ECI (m)
    const g = gravedad_desde_astro(pos_astro_eci, usuario_eci, astro.masa_kg);
    total.x += g.gx;
    total.y += g.gy;
    total.z += g.gz;
    contribuciones.push({ nombre: astro.nombre, g });
  }

  const magnitud_total = Math.sqrt(total.x*total.x + total.y*total.y + total.z*total.z);

  return { gravedad_total: { x: total.x, y: total.y, z: total.z, magnitud: magnitud_total }, contribuciones };
}

/**
 * Proyecta el vector gravedad total sobre la orientacion del usuario (vector unitario orient).
 * Devuelve la componente paralela (positivo = hacia la dirección de orient) y perpendicular.
 *
 * @param {{x:number,y:number,z:number}} gravedad_total
 * @param {{x:number,y:number,z:number}} orient_vector - vector unitario (dirección "hacia donde apunta el usuario")
 * @returns {{paralela:number, perpendicular_vec:{x,y,z}}}
 */
export function proyectar_gravedad_sobre_orientacion(gravedad_total, orient_vector) {
  const dot = gravedad_total.x*orient_vector.x + gravedad_total.y*orient_vector.y + gravedad_total.z*orient_vector.z;
  // componente paralela valor escalar (m/s^2) en dirección orient_vector
  const paralela = dot;
  // componente perpendicular = g - paralela * orient_vector
  const perp = {
    x: gravedad_total.x - paralela * orient_vector.x,
    y: gravedad_total.y - paralela * orient_vector.y,
    z: gravedad_total.z - paralela * orient_vector.z
  };
  return { paralela, perpendicular_vec: perp };
}

/**
 * Determina si el astro (por ejemplo el Sol) está "sobre la cabeza" del usuario:
 *  - usa altitud (rad). Si altitud > umbral_rad -> "sobre la cabeza";
 *  - si altitud < -umbral_rad -> "debajo de los pies"
 *
 * @param {number} altitud_rad
 * @param {number} umbral_ang_rad - por ejemplo 80° en radianes ~ 1.3963
 * @returns {{sobre_cabeza:boolean, debajo_pies:boolean}}
 */
export function estado_relativo_por_altitud(altitud_rad, umbral_ang_rad = 80 * Math.PI / 180.0) {
  return {
    sobre_cabeza: altitud_rad > umbral_ang_rad,
    debajo_pies: altitud_rad < -umbral_ang_rad
  };
}
