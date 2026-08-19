/**
 * RelojArtificial - Plano Rítmico ($\mathcal{R}$)
 * 
 * Ciclos culturales, artificiales y descubiertos. Espejo del RelojAstronomico
 * pero para ritmos humanos. Cada ciclo vive en $S^1$ (círculo unitario 2D).
 * 
 * Incluye Prisma Geográfico Rítmico: un espin adicional que usa la longitud
 * efectiva (longitud + LST) para distorsionar el plano rítmico según la
 * ubicación geográfica, permitiendo descubrir zonas horarias.
 * 
 * @author Ignacio David Baigorria
 * @since 1.0.0
 * @version 1.5.1
 */
class RelojArtificial {
    /**
     * Constructor.
     * 
     * @param {number} latitud - Latitud del observador.
     * @param {number} longitud - Longitud del observador.
     * @author Ignacio David Baigorria
     * @since 1.0.0
     * @version 1.5.1
     */
    constructor(latitud = 0.0, longitud = 0.0) {
        /** @type {number} */
        this.latitud = latitud;
        /** @type {number} */
        this.longitud = longitud;
        /** @type {Object<string, Object>} */
        this.ciclos = {};
        /** @type {Array|null} */
        this._cacheEspines = null;
        /** @type {number|null} */
        this._cacheTs = null;
        /** @type {number|null} */
        this._cacheLst = null;

        this.inicializarCiclosFabrica();
    }

    /**
     * Inicializa los ciclos de fábrica.
     * 
     * @author Ignacio David Baigorria
     * @since 1.0.0
     * @version 1.5.1
     */
    inicializarCiclosFabrica() {
        this.ciclos = {
            dia_noche: { periodo: 86400.0, fase: 0.0, masa: 6.0, tipo: 'Ritmo' },
            semana:    { periodo: 604800.0, fase: 0.0, masa: 4.5, tipo: 'Ritmo' },
            anno:      { periodo: 31557600.0, fase: 0.0, masa: 5.0, tipo: 'Ritmo' },
            hora:      { periodo: 3600.0, fase: 0.0, masa: 5.5, tipo: 'Ritmo' },
            minuto:    { periodo: 60.0, fase: 0.0, masa: 3.0, tipo: 'Ritmo' },
        };
    }

    /**
     * Agrega un ciclo nuevo.
     * 
     * @param {string} nombre - Nombre del ciclo.
     * @param {number} periodo - Período en segundos.
     * @param {number} fase - Fase inicial en radianes.
     * @param {number} masa - Masa del ciclo.
     * @param {string} [tipo='Ritmo'] - Tipo del ciclo.
     * @author Ignacio David Baigorria
     * @since 1.0.0
     * @version 1.5.1
     */
    agregarCiclo(nombre, periodo, fase, masa, tipo = 'Ritmo') {
        this.ciclos[nombre] = {
            periodo: periodo,
            fase: fase,
            masa: masa,
            tipo: tipo,
        };
        this.invalidarCache();
    }

    /**
     * Elimina un ciclo.
     * 
     * @param {string} nombre - Nombre del ciclo.
     * @author Ignacio David Baigorria
     * @since 1.0.0
     * @version 1.5.1
     */
    eliminarCiclo(nombre) {
        delete this.ciclos[nombre];
        this.invalidarCache();
    }

    /**
     * Obtiene la configuración de un ciclo.
     * 
     * @param {string} nombre - Nombre del ciclo.
     * @returns {Object|null} Configuración o null.
     * @author Ignacio David Baigorria
     * @since 1.0.0
     * @version 1.5.1
     */
    ciclo(nombre) {
        return this.ciclos[nombre] ?? null;
    }

    /**
     * Devuelve todos los ciclos registrados.
     * 
     * @returns {Object<string, Object>}
     * @author Ignacio David Baigorria
     * @since 1.0.0
     * @version 1.5.1
     */
    ciclosRegistrados() {
        return { ...this.ciclos };
    }

    /**
     * Descubre un ciclo a partir de un período estimado.
     * 
     * @param {string} nombre - Nombre del ciclo.
     * @param {number} periodo - Período estimado en segundos.
     * @param {number} tsRef - Timestamp de referencia.
     * @param {number} [masaInicial=1.0] - Masa inicial.
     * @author Ignacio David Baigorria
     * @since 1.0.0
     * @version 1.5.1
     */
    descubrirCiclo(nombre, periodo, tsRef, masaInicial = 1.0) {
        const fase = (tsRef % periodo) / periodo * 2.0 * Math.PI;
        this.agregarCiclo(nombre, periodo, fase, masaInicial, 'RitmoDescubierto');
    }

    /**
     * Calcula el espin de un ciclo.
     * 
     * @param {string} nombre - Nombre del ciclo.
     * @param {number} timestamp - Timestamp.
     * @returns {Object} Espin del ciclo.
     * @author Ignacio David Baigorria
     * @since 1.0.0
     * @version 1.5.1
     * @private
     */
    calcularEspinCiclo(nombre, timestamp) {
        const config = this.ciclos[nombre];
        const periodo = config.periodo;
        const fase = config.fase;
        const masa = config.masa;
        const tipo = config.tipo;

        const angulo = fase + ((timestamp % periodo) / periodo) * 2.0 * Math.PI;

        return {
            nombre: nombre,
            tipo: tipo,
            masa: masa,
            vector: {
                x: Math.cos(angulo),
                y: Math.sin(angulo),
                z: 0.0,
            },
        };
    }

    /**
     * Calcula el espin prisma rítmico geográfico.
     * 
     * @param {number} lst - Tiempo sidéreo local en radianes.
     * @returns {Object} Espin prisma.
     * @author Ignacio David Baigorria
     * @since 1.5.1
     * @version 1.5.1
     * @private
     */
    calcularEspinPrisma(lst) {
        const theta = (this.longitud * Math.PI / 180) + lst;

        return {
            nombre: 'prisma_ritmico',
            tipo: 'Prisma',
            masa: 4.0,
            vector: {
                x: Math.cos(theta),
                y: Math.sin(theta),
                z: 0.0,
            },
        };
    }

    /**
     * Devuelve el ramillete de espines rítmicos.
     * 
     * @param {number|null} [timestamp=null] - Timestamp. Si es null, usa Date.now()/1000.
     * @param {number|null} [lst=null] - Tiempo sidéreo local en radianes.
     * @returns {Array} Ramillete de espines.
     * @author Ignacio David Baigorria
     * @since 1.0.0
     * @version 1.5.1
     */
    espines(timestamp = null, lst = null) {
        const ts = timestamp ?? Math.floor(Date.now() / 1000);

        if (this._cacheEspines !== null && this._cacheTs === ts && this._cacheLst === lst) {
            return this._cacheEspines;
        }

        const espines = [];
        for (const nombre of Object.keys(this.ciclos)) {
            espines.push(this.calcularEspinCiclo(nombre, ts));
        }

        if (lst !== null) {
            espines.push(this.calcularEspinPrisma(lst));
        }

        this._cacheEspines = espines;
        this._cacheTs = ts;
        this._cacheLst = lst;

        return espines;
    }

    /**
     * Devuelve un espin específico.
     * 
     * @param {string} nombre - Nombre del espin.
     * @param {number|null} [timestamp=null] - Timestamp.
     * @param {number|null} [lst=null] - LST en radianes.
     * @returns {Object|null} Espin o null.
     * @author Ignacio David Baigorria
     * @since 1.0.0
     * @version 1.5.1
     */
    espin(nombre, timestamp = null, lst = null) {
        if (nombre === 'prisma_ritmico') {
            if (lst === null) {
                return null;
            }
            return this.calcularEspinPrisma(lst);
        }

        if (!this.ciclos[nombre]) {
            return null;
        }

        const ts = timestamp ?? Math.floor(Date.now() / 1000);
        return this.calcularEspinCiclo(nombre, ts);
    }

    /**
     * Calcula el vector de activación combinado.
     * 
     * @param {number|null} [timestamp=null] - Timestamp.
     * @param {number|null} [lst=null] - LST en radianes.
     * @returns {Object} Vector {x, y, z}.
     * @author Ignacio David Baigorria
     * @since 1.0.0
     * @version 1.5.1
     */
    vectorActivacion(timestamp = null, lst = null) {
        const espines = this.espines(timestamp, lst);

        let sx = 0.0;
        let sy = 0.0;
        let sz = 0.0;
        let masaTotal = 0.0;

        for (const espin of espines) {
            const m = espin.masa;
            sx += m * espin.vector.x;
            sy += m * espin.vector.y;
            sz += m * espin.vector.z;
            masaTotal += m;
        }

        if (masaTotal < 1e-12) {
            return { x: 0.0, y: 0.0, z: 0.0 };
        }

        return {
            x: sx / masaTotal,
            y: sy / masaTotal,
            z: sz / masaTotal,
        };
    }

    /**
     * Alias de vectorActivacion.
     * 
     * @param {number|null} [timestamp=null] - Timestamp.
     * @param {number|null} [lst=null] - LST en radianes.
     * @returns {Object} Vector {x, y, z}.
     * @author Ignacio David Baigorria
     * @since 1.0.0
     * @version 1.5.1
     */
    vector(timestamp = null, lst = null) {
        return this.vectorActivacion(timestamp, lst);
    }

    /**
     * Invalida la caché interna.
     * 
     * @author Ignacio David Baigorria
     * @since 1.0.0
     * @version 1.5.1
     * @private
     */
    invalidarCache() {
        this._cacheEspines = null;
        this._cacheTs = null;
        this._cacheLst = null;
    }
}
