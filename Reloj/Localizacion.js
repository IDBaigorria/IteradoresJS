/**
 * earth_location.js
 * Conversión de posición del usuario en la Tierra:
 *  - lat/lon/alt -> ECEF (WGS84)
 *  - ECEF <-> ECI (rotación usando GMST)
 *  - generación de frame local ENU (East, North, Up)
 *
 * Notas:
 *  - WGS84 usado para elipsoide terrestre.
 *  - Aproximación razonable para simulación (precisión de metros).
 */

import { gmst_en_radianes } from "./utilidades.js";

/** Constantes WGS84 */
const WGS84_A = 6378137.0;          // semieje mayor (m)
const WGS84_F = 1 / 298.257223563;  // aplanamiento
const WGS84_E2 = WGS84_F * (2 - WGS84_F); // e^2

/**
 * Convierte lat/lon/alt (grados, grados, metros) a coordenadas ECEF (x,y,z en metros).
 * @param {number} lat_grados - latitud en grados (-90..90)
 * @param {number} lon_grados - longitud en grados (-180..180), positivo este
 * @param {number} alt_m - altitud en metros
 * @returns {{x:number,y:number,z:number}} ECEF en metros
 */
export function latlonalt_a_ecef(lat_grados, lon_grados, alt_m) {
  const lat = lat_grados * Math.PI / 180.0;
  const lon = lon_grados * Math.PI / 180.0;
  const a = WGS84_A;
  const e2 = WGS84_E2;

  const sinLat = Math.sin(lat);
  const cosLat = Math.cos(lat);

  const N = a / Math.sqrt(1 - e2 * sinLat * sinLat); // radio de curvatura en el ecuador

  const x = (N + alt_m) * cosLat * Math.cos(lon);
  const y = (N + alt_m) * cosLat * Math.sin(lon);
  const z = (N * (1 - e2) + alt_m) * sinLat;

  return { x, y, z };
}

/**
 * Rota un vector en torno al eje Z por un ángulo theta (rad).
 * @param {{x:number,y:number,z:number}} v
 * @param {number} theta_rad
 * @returns {{x:number,y:number,z:number}}
 */
function rotacion_z(v, theta_rad) {
  const c = Math.cos(theta_rad);
  const s = Math.sin(theta_rad);
  return {
    x: c * v.x - s * v.y,
    y: s * v.x + c * v.y,
    z: v.z
  };
}

/**
 * Convierte coordenadas ECEF (Earth-Centered, Earth-Fixed) a ECI (Earth-Centered Inertial)
 * usando GMST (aprox). ECI = Rz(GMST) * ECEF
 * @param {{x:number,y:number,z:number}} ecef
 * @param {number} t_seg_unix - segundos unix para calcular GMST
 * @returns {{x:number,y:number,z:number}} ECI en metros
 */
export function ecef_a_eci(ecef, t_seg_unix) {
  const theta = gmst_en_radianes(t_seg_unix);
  return rotacion_z(ecef, theta);
}

/**
 * Convierte coordenadas ECI a ECEF (inversa).
 * ECEF = Rz(-GMST) * ECI
 * @param {{x:number,y:number,z:number}} eci
 * @param {number} t_seg_unix
 * @returns {{x:number,y:number,z:number}}
 */
export function eci_a_ecef(eci, t_seg_unix) {
  const theta = gmst_en_radianes(t_seg_unix);
  return rotacion_z(eci, -theta);
}

/**
 * Obtiene la posición del usuario en ECI (metros), dado su lat/lon/alt y tiempo.
 * @param {number} lat_grados
 * @param {number} lon_grados
 * @param {number} alt_m
 * @param {number} t_seg_unix
 * @returns {{x:number,y:number,z:number}}
 */
export function posicion_usuario_eci(lat_grados, lon_grados, alt_m, t_seg_unix) {
  const ecef = latlonalt_a_ecef(lat_grados, lon_grados, alt_m);
  return ecef_a_eci(ecef, t_seg_unix);
}

/**
 * Construye el frame local ENU (East, North, Up) como vectores unitarios expresados en ECI.
 * Devuelve {east:{x,y,z}, north:{x,y,z}, up:{x,y,z}} en ECI.
 * @param {number} lat_grados
 * @param {number} lon_grados
 * @param {number} t_seg_unix
 * @returns {{east:object,north:object,up:object}}
 */
export function frame_local_enu_en_eci(lat_grados, lon_grados, t_seg_unix) {
  // primera crear ECEF unit vectors en lat/lon, y luego rotarlos a ECI
  const lat = lat_grados * Math.PI / 180.0;
  const lon = lon_grados * Math.PI / 180.0;

  // ECEF basis at location (not normalized to unit distance):
  // east  = (-sin lon, cos lon, 0)
  // north = (-sin lat * cos lon, -sin lat * sin lon, cos lat)
  // up    = (cos lat * cos lon, cos lat * sin lon, sin lat)
  const east_ecef = { x: -Math.sin(lon), y: Math.cos(lon), z: 0.0 };
  const north_ecef = { x: -Math.sin(lat) * Math.cos(lon), y: -Math.sin(lat) * Math.sin(lon), z: Math.cos(lat) };
  const up_ecef = { x: Math.cos(lat) * Math.cos(lon), y: Math.cos(lat) * Math.sin(lon), z: Math.sin(lat) };

  // convertir a ECI (rotación Z por GMST)
  const east_eci = rotacion_z(east_ecef, gmst_en_radianes(t_seg_unix));
  const north_eci = rotacion_z(north_ecef, gmst_en_radianes(t_seg_unix));
  const up_eci = rotacion_z(up_ecef, gmst_en_radianes(t_seg_unix));

  // normalizar vectores por si acaso
  const norm = v => {
    const n = Math.sqrt(v.x*v.x + v.y*v.y + v.z*v.z);
    return { x: v.x/n, y: v.y/n, z: v.z/n };
  };

  return {
    east: norm(east_eci),
    north: norm(north_eci),
    up: norm(up_eci)
  };
}
