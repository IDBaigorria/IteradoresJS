import { Objeto } from '../Nucleo/Objeto.js';
import { NodoElectrico } from '../Nodos/NodoElectrico.js';
import { NodoNumerico } from '../Nodos/NodoNumerico.js';
import { Senal } from '../Iteradores/Senal.js';
import { Conf } from '../Configuracion/Configuracion.js';

/**
 * Procesador de Dominio: coordina la antena de fase 0 de un dominio.
 *
 * A partir de la versión 1.4.8, **solo se utiliza la antena de fase 0**.
 * El bucle voraz entre fases ha sido eliminado; las señales recibidas ya
 * vienen preempaquetadas en forma de {@link NodoPrimo} por el
 * {@link Controlador}, y la antena de fase 0 las captura directamente.
 * El ascenso a fases superiores será reintroducido más adelante por el
 * futuro Iterador.
 *
 * Incorpora el mecanismo de **sapiencia** (proporción de matrices capturadas
 * sobre el total procesado) y el aprendizaje trivial en fase 0.
 *
 * @author Ignacio David Baigorria
 *
 * @class ProcesadorDeDominio
 * @extends Objeto
 * @since 1.4.5
 * @version 1.4.8
 */
export class ProcesadorDeDominio extends Objeto {
    /**
     * Nombre del dominio (ej. 'Archivo', 'Talamo', 'texto').
     * @type {string}
     * @private
     * @since 1.4.8
     */
    _dominio;

    /**
     * Dirección del subdominio: 'entrada' o 'salida'.
     * @type {string}
     * @private
     */
    _direccion;

    /**
     * Antenas del procesador, indexadas por número de fase.
     *
     * Internamente, la fase completa se construye como
     * `{$dominio}:{$direccion}:{$numero}`.
     *
     * @type {Object<number, Antena>}
     * @private
     */
    _antenas;

    /**
     * Fase máxima permitida para el ascenso (null = sin límite).
     * @type {number|null}
     * @private
     * @since 1.4.7
     */
    _maxima_fase = null;

    /**
     * Elementos capturados durante el último {@link recibir_senal}.
     *
     * Cada elemento es un objeto con las propiedades:
     *   - nodo : {@link NodoNumerico}
     *   - fase : number  (siempre 0 en esta versión)
     *
     * @type {Array<{nodo: NodoNumerico, fase: number}>}
     * @private
     * @since 1.4.8
     */
    _elementos_recibidos = [];

    /**
     * Matrices capturadas por patrones existentes durante el último procesamiento.
     * @type {number}
     * @private
     * @since 1.4.8
     */
    _matrices_capturadas = 0;

    /**
     * Matrices aprendidas (aprendizaje trivial) durante el último procesamiento.
     * @type {number}
     * @private
     * @since 1.4.8
     */
    _matrices_aprendidas = 0;

    /**
     * Sapiencia calculada en el último procesamiento (valor entre 0.0 y 1.0).
     * @type {number}
     * @private
     * @since 1.4.8
     */
    _sapiencia_ultima = 1.0;

    /**
     * Token de seguridad para operaciones restringidas.
     * @type {string}
     * @private
     * @since 1.4.6
     */
    static _token = '';

    /**
     * Recibe el token de seguridad desde el Controlador.
     * @param {string} token Token de seguridad.
     * @returns {void}
     * @since 1.4.6
     */
    static recibir_token(token) {
        this._token = token;
    }

    /**
     * Constructor.
     *
     * @param {string} dominio   Nombre del dominio.
     * @param {string} direccion 'entrada' o 'salida'.
     * @since 1.4.5
     * @version 1.4.8
     */
    constructor(dominio, direccion) {
        super();
        this._dominio = dominio;
        this._direccion = direccion;
        this._antenas = {};
    }

    /**
     * Construye la clave de fase completa a partir del número de fase.
     *
     * @param {number} fase Número de fase.
     * @returns {string} Clave de fase (ej. 'Archivo:entrada:0').
     * @private
     */
    _prefijar_fase(fase) {
        return `${this._dominio}:${this._direccion}:${fase}`;
    }

    /**
     * Obtiene la antena para una fase específica, creándola si no existe.
     *
     * @param {number} fase Número de fase (sin prefijo).
     * @returns {Antena}
     * @since 1.4.5
     * @version 1.4.8
     */
    antena(fase) {
        if (!this._antenas.hasOwnProperty(fase)) {
            this._antenas[fase] = new Antena(this._prefijar_fase(fase));
        }
        return this._antenas[fase];
    }

    /**
     * Establece la fase máxima permitida para el ascenso.
     *
     * @param {number|null} fase Fase máxima (0 para el Tálamo, null para ilimitado).
     * @returns {void}
     * @since 1.4.7
     */
    establecer_maxima_fase(fase) {
        this._maxima_fase = fase;
    }

    /**
     * Inicializa la antena de fase 0 con los dipolos de acción y marcado.
     *
     * Registra como dipolos los primos de marcado (índices 256‑259)
     * y los primos de acción (índices 260‑264) definidos en
     * {@link Conf.PRIMOS_PRECARGADOS}.
     * Estos dipolos permiten al Tálamo (y a cualquier dominio que los
     * necesite) reconocer instantáneamente los {@link NodoPrimo} que el
     * Controlador inyecta durante la ejecución de comandos.
     *
     * @returns {void}
     * @since 1.4.8
     */
    inicializar_acciones() {
        const primos = Conf.PRIMOS_PRECARGADOS;
        const antena_cero = this.antena(0);
        for (let indice = 256; indice <= 264; indice++) {
            const numero_primo = primos[indice];
            const nodo_primo = NodoNumerico.crear_primo(numero_primo);
            if (nodo_primo) {
                const matriz_identidad = nodo_primo.identidad();
                antena_cero._dipolo([matriz_identidad], nodo_primo);
            }
        }
    }

    /**
     * Recibe una señal y la procesa exclusivamente con la antena de fase 0.
     *
     * Ya no existe bucle voraz entre fases. Cada matriz de la señal se
     * intenta capturar con la antena de fase 0. Si no es reconocida,
     * se activa el aprendizaje trivial (creación de un nuevo {@link NodoPrimo}
     * y registro de su dipolo en la misma fase 0). Los elementos capturados
     * (nodos y fase) se almacenan en {@link _elementos_recibidos}.
     *
     * @param {Senal} senal Señal a procesar.
     * @returns {void}
     * @since 1.4.8
     */
    recibir_senal(senal) {
        this._elementos_recibidos = [];
        this._matrices_capturadas = 0;
        this._matrices_aprendidas = 0;

        const matrices = senal.matrices();
        const total = matrices.length;
        let i = 0;

        const antena_fase_0 = this.antena(0);
        const fase_anterior = NodoElectrico.fase();

        while (i < total) {
            const [longitud, patron] = antena_fase_0.intentar_capturar(senal, i);

            if (longitud > 0 && patron !== null) {
                // Captura exitosa en fase 0
                this._elementos_recibidos.push({ nodo: patron, fase: 0 });
                this._matrices_capturadas += longitud;
                i += longitud;
            } else {
                // ─── Aprendizaje trivial (fase 0) ───
                const fase_dominio_cero = this._prefijar_fase(0);
                NodoElectrico._fase(this.constructor._token, fase_dominio_cero);

                if (!NodoNumerico.contador_fase_existe(fase_dominio_cero)) {
                    NodoNumerico._inicializar_contador_fase(fase_dominio_cero, 256);
                }

                const numero = NodoNumerico.siguiente_primo_positivo(fase_dominio_cero);
                const primo = NodoNumerico.crear_primo(numero);
                if (primo) {
                    // Registrar el dipolo en la antena de fase 0
                    antena_fase_0._dipolo([matrices[i]], primo);
                    this._elementos_recibidos.push({ nodo: primo, fase: 0 });
                }

                this._matrices_aprendidas++;
                NodoElectrico._fase(this.constructor._token, fase_anterior);
                i++;
            }
        }

        NodoElectrico._fase(this.constructor._token, fase_anterior);

        // Calcular sapiencia
        const total_matrices = this._matrices_capturadas + this._matrices_aprendidas;
        this._sapiencia_ultima = total_matrices > 0
            ? this._matrices_capturadas / total_matrices
            : 1.0;
    }

    /**
     * Devuelve los elementos recibidos durante el último {@link recibir_senal}.
     *
     * @returns {Array<{nodo: NodoNumerico, fase: number}>}
     * @since 1.4.8
     */
    elementos_recibidos() {
        return this._elementos_recibidos.slice();
    }

    /**
     * Devuelve la sapiencia calculada en el último procesamiento.
     *
     * @returns {number} Valor entre 0.0 (todo aprendido) y 1.0 (todo capturado).
     * @since 1.4.8
     */
    sapiencia() {
        return this._sapiencia_ultima;
    }

    /**
     * Devuelve el nombre del dominio.
     *
     * @returns {string}
     * @since 1.4.8
     */
    dominio() {
        return this._dominio;
    }

    /**
     * Devuelve la dirección del subdominio.
     *
     * @returns {string}
     */
    direccion() {
        return this._direccion;
    }

    /**
     * Devuelve todas las antenas del procesador.
     *
     * @returns {Object<number, Antena>}
     */
    antenas() {
        return Object.assign({}, this._antenas);
    }
}