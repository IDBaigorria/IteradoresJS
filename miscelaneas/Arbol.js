/**
 * Funciones para manejo de árbol general usando nodos.
 * Utiliza enlaces 'hmi' (hijo más izquierdo), 'hd' (hermano derecho) y 'p' (padre).
 *
 * Espejo de `miscelaneas/Arbol.php` del proyecto PHP.
 * No incluye las funciones específicas del piloto
 * (_nombres_arbol_para_contexto, _nombre_terminal_de_compartido):
 * esas viven en el proyecto PHP.
 *
 * @namespace miscelaneas.Arbol
 * @author Ignacio David Baigorria
 * @version 1.5plugin.7aa
 * @since 1.5plugin.7aa
 */

/**
 * Normaliza el array de nombres de enlace para las operaciones
 * de árbol. Si es null, devuelve los nombres default.
 *
 * @param {Object|null} nombres
 * @returns {Object}
 */
export function _arbol_nombres(nombres) {
    if (nombres === null || nombres === undefined) {
        return { p: 'p', hd: 'hd', hmi: 'hmi' };
    }
    return {
        p:   (nombres.p   != null && nombres.p   !== '') ? String(nombres.p)   : 'p',
        hd:  (nombres.hd  != null && nombres.hd  !== '') ? String(nombres.hd)  : 'hd',
        hmi: (nombres.hmi != null && nombres.hmi !== '') ? String(nombres.hmi) : 'hmi',
    };
}

/**
 * Agrega un hijo como hijo más izquierdo del nodo padre.
 *
 * @param {Nodo} padre
 * @param {Nodo} hijo
 * @param {Object|null} [nombres=null]
 * @returns {void}
 */
export function _hmi(padre, hijo, nombres = null) {
    const n = _arbol_nombres(nombres);
    const antiguo_hmi = padre.adyacente(n.hmi);
    if (antiguo_hmi) {
        hijo._adyacente_en(antiguo_hmi, n.hd, true);
    }
    padre._adyacente_en(hijo, n.hmi, true);
    hijo._adyacente_en(padre, n.p, true);
}

/**
 * Agrega un hermano derecho inmediato al nodo actual.
 *
 * @param {Nodo} nodo_actual
 * @param {Nodo} nuevo_hermano
 * @param {Object|null} [nombres=null]
 * @returns {void}
 */
export function _hd(nodo_actual, nuevo_hermano, nombres = null) {
    const n = _arbol_nombres(nombres);
    const padre = nodo_actual.adyacente(n.p);
    if (!padre) return;

    const hermano_derecho_actual = nodo_actual.adyacente(n.hd);
    if (hermano_derecho_actual) {
        nuevo_hermano._adyacente_en(hermano_derecho_actual, n.hd, true);
    }
    nodo_actual._adyacente_en(nuevo_hermano, n.hd, true);
    nuevo_hermano._adyacente_en(padre, n.p, true);
}

/**
 * Obtiene el hijo más izquierdo de un nodo.
 *
 * @param {Nodo} nodo
 * @param {Object|null} [nombres=null]
 * @returns {Nodo|null}
 */
export function hmi(nodo, nombres = null) {
    const n = _arbol_nombres(nombres);
    return nodo.adyacente(n.hmi);
}

/**
 * Obtiene el hermano derecho de un nodo.
 *
 * @param {Nodo} nodo
 * @param {Object|null} [nombres=null]
 * @returns {Nodo|null}
 */
export function hd(nodo, nombres = null) {
    const n = _arbol_nombres(nombres);
    return nodo.adyacente(n.hd);
}

/**
 * Obtiene el padre de un nodo.
 *
 * @param {Nodo} nodo
 * @param {Object|null} [nombres=null]
 * @returns {Nodo|null}
 */
export function p(nodo, nombres = null) {
    const n = _arbol_nombres(nombres);
    return nodo.adyacente(n.p);
}

/**
 * Elimina el hijo más izquierdo de un nodo padre.
 * Si el hijo tiene hermano derecho, ese hermano se convierte
 * en el nuevo hmi.
 *
 * @param {Nodo} padre
 * @param {Object|null} [nombres=null]
 * @returns {Nodo|null}
 */
export function eliminar_hmi(padre, nombres = null) {
    const n = _arbol_nombres(nombres);
    const hijo = padre.adyacente(n.hmi);
    if (!hijo) return null;

    const hermano = hijo.adyacente(n.hd);

    hijo.eliminar_adyacente(n.p);
    hijo.eliminar_adyacente(n.hd);

    if (hermano) {
        padre._adyacente_en(hermano, n.hmi, true);
    } else {
        padre.eliminar_adyacente(n.hmi);
    }

    return hijo;
}

/**
 * Elimina el hermano derecho inmediato de un nodo.
 * Si el hermano derecho tiene a su vez hermano derecho,
 * se enlaza correctamente.
 *
 * @param {Nodo} nodo_actual
 * @param {Object|null} [nombres=null]
 * @returns {Nodo|null}
 */
export function eliminar_hd(nodo_actual, nombres = null) {
    const n = _arbol_nombres(nombres);
    const hermano = nodo_actual.adyacente(n.hd);
    if (!hermano) return null;

    const siguiente_hermano = hermano.adyacente(n.hd);

    hermano.eliminar_adyacente(n.p);
    hermano.eliminar_adyacente(n.hd);

    if (siguiente_hermano) {
        nodo_actual._adyacente_en(siguiente_hermano, n.hd, true);
    } else {
        nodo_actual.eliminar_adyacente(n.hd);
    }

    return hermano;
}