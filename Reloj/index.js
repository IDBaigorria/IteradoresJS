// supongamos que tienes Astro definido (modulo astro.js ya entregado)
import { EstadoCosmico } from "./EstadoCosmico.js";
import { posicion_usuario_eci, frame_local_enu_en_eci } from "./Localizacion.js";
import { posicion_astro_eci_m, vector_topocentrico, altitud_acimut_desde_topocentrico,
         gravedad_total_sobre_usuario, proyectar_gravedad_sobre_orientacion, estado_relativo_por_altitud } from "./MotorCosmico.js";

// crear astros (ejemplo simplificado)
const sol = new Astro("Sol", 0, 609.12, 0, Infinity, null);
sol.masa_kg = 1.98847e30;

const tierra = new Astro("Tierra", 0, 23.9345, 1.0, 365.256, sol);
tierra.masa_kg = 5.9722e24;

const luna = new Astro("Luna", 5.145, 655.728, 0.00256955529, 27.321661, tierra);
luna.masa_kg = 7.342e22;

// Tiempo: ahora
const t_seg_unix = Date.now() / 1000.0;
const lat = -34.6, lon = -58.4, alt = 25.0; // Buenos Aires aprox
const usuario_eci = posicion_usuario_eci(lat, lon, alt, t_seg_unix);

// calcular posicion del Sol geocéntrica y vector topocentrico
const sol_eci = posicion_astro_eci_m(sol, tierra, t_seg_unix, true);
const vec_topo_sol = vector_topocentrico(sol_eci, usuario_eci);
const frame_enu = frame_local_enu_en_eci(lat, lon, t_seg_unix);
const { altitud_rad, acimut_rad } = altitud_acimut_desde_topocentrico(vec_topo_sol, frame_enu);

console.log("Altitud solar (deg):", altitud_rad * 180/Math.PI);
console.log("Es dia?:", altitud_rad > 0);

// gravedad total
const lista = [sol, tierra, luna];
const { gravedad_total, contribuciones } = gravedad_total_sobre_usuario(lista, tierra, lat, lon, alt, t_seg_unix);
console.log("g total (m/s^2):", gravedad_total);
const orient = { x: 0, y: 0, z: 1 }; // ejemplo: usuario "parado" con up local apuntando al cielo
const proyeccion = proyectar_gravedad_sobre_orientacion(gravedad_total, orient);
console.log("Componente paralela a la orientacion (m/s^2):", proyeccion.paralela);

// estado relativo
console.log("Sobre cabeza / debajo pies:", estado_relativo_por_altitud(altitud_rad));
