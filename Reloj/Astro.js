import { Objeto } from "../Nucleo/index.js";
import { Conf } from '../Configuracion/index.js';
import { mezclar_clase_con_interfaces } from "../miscelaneas/mixin.js";
/**
 * @file Astro.js
 * @description
 * Representa un astro (Sol, Tierra, Luna, Júpiter, etc.)
 * incluyendo sus parámetros físicos y orbitales básicos.
 * 
 * Este modelo está diseñado para ser:
 * - determinístico
 * - reversible
 * - suficientemente preciso para simulación conceptual
 * 
 * Cada astro puede calcular:
 * - su posición heliocéntrica en coordenadas 3D
 * - su rotación sobre su eje
 * - su vector unitario desde el origen
 * 
 * NOTA:
 * Este modelo usa órbitas circulares para simplicidad,
 * pero la estructura permite luego agregar:
 *  - excentricidad
 *  - anomalía media real
 *  - elementos keplerianos completos
 */
/* =========================
   CLASE Astro (GENÉRICA)
   ========================= */
/**
 * Clase Astro: modelo genérico para cuerpos celestes.
 *
 * params: {
 *   nombre: string,
 *   masa_kg: number,
 *   radio_m: number,
 *   periodo_rotacion_s: number,
 *   eje_rotacion_dir: {x,y,z} optional (unitario),
 *   radio_orbita_ua: number,
 *   periodo_orbital_dias: number,
 *   inclinacion_orbital_deg: number,
 *   referencia: Astro|null,
 *   fase_inicial: number (0..1)
 * }
 */
class Astro extends Objeto {
  constructor(params){
    this.nombre = params.nombre;
    this.masa_kg = params.masa_kg || 1.0;
    this.radio_m = params.radio_m || 1.0;
    this.periodo_rotacion_s = params.periodo_rotacion_s || (24*3600);
    this.eje_rotacion_dir = params.eje_rotacion_dir ? normalize(params.eje_rotacion_dir) : {x:0,y:0,z:1};
    this.radio_orbita_ua = params.radio_orbita_ua || 0.0;
    this.periodo_orbital_dias = params.periodo_orbital_dias || Infinity;
    this.inclinacion_orbital_rad = (params.inclinacion_orbital_deg||0) * Math.PI/180.0;
    this.referencia = params.referencia || null;
    this.fase_inicial = params.fase_inicial || 0.0;
    this._kepler = null;
    this.excentricidad = params.excentricidad || 0.0;
  }

  fase_orbital(t_seg_unix){
    if (!isFinite(this.periodo_orbital_dias) || this.periodo_orbital_dias <= 0) return this.fase_inicial;
    const dias = dias_desde_j2000(t_seg_unix);
    return frac_01(this.fase_inicial + dias / this.periodo_orbital_dias);
  }

  angulo_orbital_rad(t_seg_unix){
    return normalizar_2pi(this.fase_orbital(t_seg_unix) * 2 * Math.PI);
  }

  posicion_absoluta(t_seg_unix){
    const ang = this.angulo_orbital_rad(t_seg_unix);
    const x = this.radio_orbita_ua * Math.cos(ang);
    const y = this.radio_orbita_ua * Math.sin(ang);
    const z = 0;
    const ci = Math.cos(this.inclinacion_orbital_rad);
    const si = Math.sin(this.inclinacion_orbital_rad);
    const y2 = ci * y - si * z;
    const z2 = si * y + ci * z;
    if (!this.referencia) {
      return { x, y: y2, z: z2 };
    } else {
      const ref = this.referencia.posicion_absoluta(t_seg_unix);
      return { x: x + ref.x, y: y2 + ref.y, z: z2 + ref.z };
    }
  }

  posicion_absoluta_eci_m(t_seg_unix){
    const pos_au = this.posicion_absoluta(t_seg_unix);
    const x_m = pos_au.x * AU_EN_METROS;
    const y_m = pos_au.y * AU_EN_METROS;
    const z_m = pos_au.z * AU_EN_METROS;
    const ce = Math.cos(-OBLICUIDAD_RAD);
    const se = Math.sin(-OBLICUIDAD_RAD);
    const y_eq = ce * y_m - se * z_m;
    const z_eq = se * y_m + ce * z_m;
    return { x: x_m, y: y_eq, z: z_eq };
  }

  superficie_posicion(lat_grados, lon_grados, alt_m, t_seg_unix){
    const lat = lat_grados * Math.PI/180.0;
    const lon = lon_grados * Math.PI/180.0;
    const R = this.radio_m;
    const r_surface = R + (alt_m || 0);
    const x = r_surface * Math.cos(lat) * Math.cos(lon);
    const y = r_surface * Math.cos(lat) * Math.sin(lon);
    const z = r_surface * Math.sin(lat);
    const theta = (2*Math.PI * frac_01( t_seg_unix / this.periodo_rotacion_s ));
    const c = Math.cos(theta), s = Math.sin(theta);
    const x_eci_local = c * x - s * y;
    const y_eci_local = s * x + c * y;
    const z_eci_local = z;
    const pos_ecef_local = { x, y, z };
    const pos_eci_local = { x: x_eci_local, y: y_eci_local, z: z_eci_local };
    const centro_astro_eci = this.posicion_absoluta_eci_m(t_seg_unix);
    const pos_eci_absoluta = add_vec(pos_eci_local, centro_astro_eci);
    return { pos_ecef: pos_ecef_local, pos_eci_m: pos_eci_absoluta, centro_astro_eci };
  }
}

export {Astro}