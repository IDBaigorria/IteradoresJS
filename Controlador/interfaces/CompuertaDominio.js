/**
 * Contrato para la compuerta entre el tálamo y los dominios especializados.
 *
 * La compuerta es el mecanismo que traduce comandos de alto nivel del
 * {@link Controlador} (actuando como tálamo) en secuencias de comandos
 * atómicos de dominio (como `leer_byte` o `escribir_byte`), y viceversa.
 *
 * ## Rol futuro
 *
 * - **Ida:** Descompone un comando del tálamo en una secuencia de comandos
 *   atómicos que se inyectan en la fase 0 de un dominio especializado.
 * - **Vuelta:** Recompone los resultados del dominio especializado en un
 *   comando de respuesta para el tálamo.
 *
 * Por ahora esta clase es solo documental y no declara métodos.
 *
 * @class CompuertaDominio
 * @since 1.3.8
 */
export class CompuertaDominio {
    // Métodos se definirán en versiones futuras.
}
