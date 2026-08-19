/**
 * CompositorVentanas - De espines a llave matricial única
 * 
 * Mapea cada espin atómico de los tres planos a un primo único (>100) y
 * compone una matriz 2×2 no conmutativa producto de todas las matrices
 * canónicas. Estados de dominio dinámicos reciben primos asignados
 * automáticamente a partir del 191.
 * 
 * @author Ignacio David Baigorria
 * @since 1.0.0
 * @version 1.5.1
 */
class CompositorVentanas {
    /**
     * Constructor.
     * 
     * @author Ignacio David Baigorria
     * @since 1.0.0
     * @version 1.5.1
     */
    constructor() {
        /** @type {Object<string, number>} */
        this.primosEstado = {};
        /** @type {number} */
        this.contadorEstado = 0;
    }

    /**
     * Primos del plano cósmico.
     * 
     * @returns {Object<string, number>}
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     */
    static get PRIMOS_COSMICO() {
        return {
            sol: 101,
            luna: 103,
            jupiter: 107,
            eje_terrestre: 109,
            centro_tierra: 113,
        };
    }

    /**
     * Primos del plano rítmico.
     * 
     * @returns {Object<string, number>}
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     */
    static get PRIMOS_RITMICO() {
        return {
            dia_noche: 127,
            semana: 131,
            anno: 137,
            hora: 139,
            minuto: 149,
            prisma_ritmico: 151,
        };
    }

    /**
     * Primos del plano de acción.
     * 
     * @returns {Object<string, number>}
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     */
    static get PRIMOS_ACCION() {
        return {
            APRENDER: 157,
            PREDECIR: 163,
            CORREGIR: 167,
            CONTROLAR: 173,
            ASCENDER: 179,
            DESCENDER: 181,
        };
    }

    /**
     * Primo base para estados dinámicos.
     * 
     * @returns {number}
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     */
    static get PRIMO_BASE_ESTADO() {
        return 191;
    }

    /**
     * Genera la matriz 2×2 canónica para un primo.
     * 
     * @param {number} primo - Primo a mapear.
     * @returns {Object} Matriz {a, b, c, d}.
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     * @private
     */
    matrizCanonica(primo) {
        return {
            a: primo,
            b: 0,
            c: 0,
            d: 1,
        };
    }

    /**
     * Producto no conmutativo de dos matrices 2×2.
     * 
     * @param {Object} m1 - Primera matriz {a, b, c, d}.
     * @param {Object} m2 - Segunda matriz {a, b, c, d}.
     * @returns {Object} Producto {a, b, c, d}.
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     * @private
     */
    producto(m1, m2) {
        return {
            a: m1.a * m2.a + m1.b * m2.c,
            b: m1.a * m2.b + m1.b * m2.d,
            c: m1.c * m2.a + m1.d * m2.c,
            d: m1.c * m2.b + m1.d * m2.d,
        };
    }

    /**
     * Resuelve el primo para un espin, asignando dinámicamente si es estado.
     * 
     * @param {Object} espin - Espin con nombre y tipo.
     * @returns {number|null} Primo asignado o null.
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     * @private
     */
    resolverPrimo(espin) {
        const nombre = espin.nombre;
        const tipo = espin.tipo;
        const pc = CompositorVentanas.PRIMOS_COSMICO;
        const pr = CompositorVentanas.PRIMOS_RITMICO;
        const pa = CompositorVentanas.PRIMOS_ACCION;

        if (pc[nombre] !== undefined) {
            return pc[nombre];
        }

        if (pr[nombre] !== undefined) {
            return pr[nombre];
        }

        if (pa[nombre] !== undefined) {
            return pa[nombre];
        }

        if (tipo === 'Estado') {
            if (this.primosEstado[nombre] === undefined) {
                this.primosEstado[nombre] = this.siguientePrimoEstado();
            }
            return this.primosEstado[nombre];
        }

        return null;
    }

    /**
     * Genera el siguiente primo disponible para estados dinámicos.
     * 
     * @returns {number} Primo asignado.
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     * @private
     */
    siguientePrimoEstado() {
        let candidato = CompositorVentanas.PRIMO_BASE_ESTADO + this.contadorEstado;
        this.contadorEstado++;

        while (!this.esPrimo(candidato)) {
            candidato++;
            this.contadorEstado++;
        }

        return candidato;
    }

    /**
     * Verifica si un número es primo.
     * 
     * @param {number} n - Número a verificar.
     * @returns {boolean} True si es primo.
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     * @private
     */
    esPrimo(n) {
        if (n < 2) return false;
        if (n === 2) return true;
        if (n % 2 === 0) return false;
        const limite = Math.floor(Math.sqrt(n));
        for (let i = 3; i <= limite; i += 2) {
            if (n % i === 0) return false;
        }
        return true;
    }

    /**
     * Compone la llave matricial única a partir de tres ramilletes de espines.
     * 
     * @param {Array} espinesCosmicos - Espines del plano cósmico.
     * @param {Array} espinesRitmicos - Espines del plano rítmico.
     * @param {Array} espinesEstadoAccion - Espines del plano estado×acción.
     * @returns {Object} Matriz 2×2 resultante {a, b, c, d}.
     * @author Ignacio David Baigorria
     * @since 1.0.0
     * @version 1.5.1
     */
    componer(espinesCosmicos, espinesRitmicos, espinesEstadoAccion) {
        const todos = [...espinesCosmicos, ...espinesRitmicos, ...espinesEstadoAccion];

        let resultado = {
            a: 1,
            b: 0,
            c: 0,
            d: 1,
        };

        for (const espin of todos) {
            const primo = this.resolverPrimo(espin);
            if (primo === null) {
                continue;
            }
            const m = this.matrizCanonica(primo);
            resultado = this.producto(resultado, m);
        }

        return resultado;
    }

    /**
     * Devuelve el p-grama (secuencia de primos) de una composición.
     * 
     * @param {Array} espinesCosmicos - Espines del plano cósmico.
     * @param {Array} espinesRitmicos - Espines del plano rítmico.
     * @param {Array} espinesEstadoAccion - Espines del plano estado×acción.
     * @returns {Array} Lista de primos en orden de composición.
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     */
    pGrama(espinesCosmicos, espinesRitmicos, espinesEstadoAccion) {
        const todos = [...espinesCosmicos, ...espinesRitmicos, ...espinesEstadoAccion];
        const primos = [];

        for (const espin of todos) {
            const primo = this.resolverPrimo(espin);
            if (primo !== null) {
                primos.push(primo);
            }
        }

        return primos;
    }

    /**
     * Resetea los primos de estado dinámicos.
     * 
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     */
    resetearEstados() {
        this.primosEstado = {};
        this.contadorEstado = 0;
    }
}
