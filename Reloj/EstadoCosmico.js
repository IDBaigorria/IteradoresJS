import { Objeto } from "../Nucleo/index.js";
import { Conf } from '../Configuracion/index.js';
import { mezclar_clase_con_interfaces } from "../miscelaneas/mixin.js";
/**
 * @file EstadoCosmico.js
 * @description
 * Representa el vector universal que describe completamente
 * el estado del usuario en el universo en un instante dado.
 * 
 * Este vector contiene:
 * - tiempo universal t (segundos exactos desde un epoch fijo)
 * - latitud del usuario
 * - longitud del usuario
 * - altitud del usuario
 * - orientacion corporal del usuario (vector unitario 3D)
 * 
 * Este vector es SERIALIZABLE y contiene absolutamente toda
 * la información necesaria para reconstruir completamente
 * la posición de todos los astros y del usuario en el espacio.
 * 
 * El motor AstroEngine usa este vector como entrada para:
 * - obtener posiciones heliocéntricas
 * - obtener posiciones geocéntricas
 * - convertir a topocéntricas
 * - obtener orientación espacial
 * - determinar si es día o noche
 * - calcular vectores gravitacionales
 */

class EstadoCosmico extends Objeto{

  constructor(t_seg_unix, astro_id, lat_grados, lon_grados, alt_m, orient_local_enu){
    this.t = t_seg_unix;
    this.astro_id = astro_id;
    this.lat = lat_grados;
    this.lon = lon_grados;
    this.alt = alt_m;
    this.orient_local_enu = normalize(orient_local_enu || {x:0,y:0,z:1});
  }
  serializar(){
    return JSON.stringify({
      t: this.t,
      astro_id: this.astro_id,
      lat: this.lat, lon: this.lon, alt: this.alt,
      orient_local_enu: this.orient_local_enu
    });
  }
  static deserializar(json){
    const d = typeof json === 'string' ? JSON.parse(json) : json;
    return new EstadoCosmico(d.t, d.astro_id, d.lat, d.lon, d.alt, d.orient_local_enu);
  }
}

export {EstadoCosmico}