/**
 * Interfaz que define el manejo de adyacentes en un nodo.
 *
 * Permite establecer y recuperar adyacentes enlazados por el nodo.
 * Estos métodos son implementados por la clase {@link Nodos.Nodo Nodo}
 * y herederos.
 * 
 * La representacion interna puede variar segun la implementacion 
 * 
 * @interface
 * @since V0.1.9
 * @memberof Nodos.Interfaces
 */
class Adyacentes {
    /**
     * Verifica si el nodo tiene al menos un adyacente
     *
	 * Este método comprueba si tiene al menos un nodo adyacente. O dicho de otro modo
	 * si tiene conexiones "salientes"; en tal caso devuelve true; caso contrario devuelve 
	 * false
	 * 
	 * Si el nodo está autoenlazado, es decir tiene algun enlace que sale de él hacia él
	 * mismo tambien devuelve true. 
	 *  
	 *⚠️ Importante: verifica las conexiciones de "salida", pero no las de "entrada". Para
	 * verificar las conexiones de entrada use
	 * {@link Nodos.Interfaces.Adyacentes#tiene_incidente tiene_incidente}
     * 
     * @return {boolean} Devuelve **true** si tiene adyacentes, o **false** en caso contrario.
     * @public
     */
    tiene_adyacente() {
        throw new Error("Método tiene_adyacente() debe ser implementado por la clase que herede.");
    }


    /**
     * Verifica si el nodo actual tiene como adyacente al nodo indicado.
     *
     * Indica si el nodo actual enlaza directamente hacia el nodo pasado como parámetro.  
     * Devuelve el nombre del enlace en caso de existir, o `false` en caso contrario.
     * 
     * 🔗 Método complementario:
     * - {@link Nodos.Interfaces.Adyacentes#tiene_incidente_a tiene_incidente_a()}
     * 
     * @param {Nodo} nodo Nodo a verificar.
     * @return {string|boolean} Nombre del enlace si existe, `false` en caso contrario.
     * @public
     * @since 3.2.3
     */
    tiene_adyacente_a(nodo) {
        throw new Error("Método tiene_adyacente_a() debe ser implementado por la clase que herede.");
    }


    /**
     * Valida un nombre de enlace.
     *
     * Comprueba que el nombre de un enlace sea correcto antes de usarse en un grafo.  
     * Solo se permiten `number` o `string`, pero no `0`, `"0"` ni `""`.  
     * Este método debe implementarse de forma estática.
     * 
     * @param {number|string} enlace Nombre del enlace a validar
     * @return {boolean} `true` si es válido, `false` en caso contrario
	 * @since 3.2.3
     * @static
     */
    static validar_nombre_enlace(enlace){
        throw new Error("Método validar_nombre_enlace() debe ser implementado por la clase que herede.");
    }

    /**
     * Devuelve el nodo adyacente en el enlace especificado.
     *
     * Comprueba si existe un nodo en el enlace indicado y lo devuelve;  
     * si no existe, devuelve `null`.
     * 
     * @param {number|string} enlace El identificador del enlace a consultar
     * @return {Nodo|null} Nodo adyacente si existe, `null` en caso contrario
     */
    adyacente(enlace){
        throw new Error("Método adyacente() debe ser implementado por la clase que herede.");
    };

    /**
     * Devuelve todos los adyacentes del nodo.
     *
     * Retorna un `Map` con todos los nodos adyacentes si existen, 
     * o `null` en caso contrario.  
     * 
     * Se usa cuando se necesita consultar el estado actual de las conexiones de un nodo
     * sin afectar su integridad.
     *
     * @param void
     * @return {?Map<string|number, Nodo>} Map con nodos adyacentes o `null` si no existen
     */
    adyacentes(){
        throw new Error("Método adyacentes() debe ser implementado por la clase que herede.");
    }

    /**
     * Asigna un adyacente con nombre único.
     *
     * Agrega un nodo como adyacente generando automáticamente un nombre de enlace único
     * basado en el `id()` del nodo destino.  
     * Si ya existe un enlace con ese nombre, se crean variantes incrementales (`id.1`, `id.2`, ...).
     *
     * @param {Nodo} un_nodo Nodo que se desea enlazar
     * @return {Nodo} Nodo adyacente recién asignado
     * @public
     */
     _adyacente(un_nodo){
        throw new Error("Método _adyacente() debe ser implementado por la clase que herede.");
    }
    
    /**
     * Asigna un nodo adyacente en un enlace específico.
     *
	 * Permite enlazar un nodo adyacente en un enlace identificado por un string. 
	 * 
	 * Si ya existía un nodo en esa posición, puede reemplazarse explícitamente con `$reemplazar=true`.
	 * Si `$reemplazar=false` (comportamiento predeterminado), y ya hay un nodo en el enlace dado
	 * genera un mensaje de error.
     * 
     * @param {Nodo} un_nodo Nodo que se enlazará.
     * @param {string} enlace Identificador del enlace.
     * @param {boolean} [reemplazar=false] Si `true`, permite sobreescribir un nodo existente.
     * @return {boolean} `true` si la asignación fue exitosa, `false` en caso contrario.
     */
     _adyacente_en(unNodo, enlace, reemplazar = false) {
        throw new Error("Método _adyacente_en() debe ser implementado por la clase que herede.");
    }

    /**
     * Elimina un enlace del nodo.
     *
     * Busca y elimina un enlace dado si existe. Y devuelve el nodo
     * que estaba enlazado en dicho enlace o devuelve `null` en caso contrario.  
     * 
  	 * ⚠️ Importante: Este método no elimina los nodos del sistema. Si se eliminan
	 * todos los enlaces que conectan a un nodo este aún permanece en el sistema 
	 * como nodo suelto a menos que se use el metodo estatico
	 * {@link Nodos.Interfaces.Adyacentes#eliminar Nodo::eliminar($nodo)}
     *
     * @param {string} enlace Enlace del adyacente a eliminar
     * @return {?Nodo} Nodo eliminado o `null` si no existe
     * @deprecated usar elminar_adyacente
     */
    eliminar_enlace(enlace) {
        throw new Error("Método eliminar_enlace() debe ser implementado por la clase que herede.");
    }

    /**
     * Elimina todos los enlaces del nodo.
     *
     * Borra todas las conexiones salientes y devuelve los nodos eliminados como Map.  
     * Si no hay adyacentes, retorna un Map vacío.
     *
  	 * ⚠️ Importante: Este método no elimina los nodos del sistema. Si se eliminan
	 * todos los enlaces que conectan a un nodo este aún permanece en el sistema 
	 * como nodo suelto a menos que se use el metodo estatico
	 * {@link Nodos.Interfaces.Adyacentes#eliminar Nodo::eliminar($nodo)}
     * 
     * @param void
     * @return {Map<string|number, Nodo>} Map con nodos eliminados, o Map vacío si no existen
     * @deprecated usar eliminar_adyacente
     */
    eliminar_enlaces(enlace) {
        throw new Error("Método eliminar_enlaces() debe ser implementado por la clase que herede.");
    }

    /**
     * Elimina un adyacente del nodo.
     *
     * Busca y elimina un adyacente dado si existe. Y devuelve el nodo
     * que estaba enlazado en dicho adyacente o devuelve `null` en caso contrario.  
     * 
  	 * ⚠️ Importante: Este método no elimina los nodos del sistema. Si se eliminan
	 * todos los enlaces que conectan a un nodo este aún permanece en el sistema 
	 * como nodo suelto a menos que se use el metodo estatico
	 * {@link Nodos.Interfaces.Adyacentes#eliminar Nodo.eliminar(nodo)}
     *
     * @param {string} enlace Enlace del adyacente a eliminar
     * @return {?Nodo} Nodo eliminado o `null` si no existe
     */
    eliminar_adyacente(enlace) {
        throw new Error("Método eliminar_enlace() debe ser implementado por la clase que herede.");
    }

    /**
     * Elimina todos los adyacentes del nodo.
     *
     * Borra todas las conexiones entrandes y devuelve los nodos eliminados como Map.  
     * Si no hay adyacentes, retorna un Map vacío.
     *
  	 * ⚠️ Importante: Este método no elimina los nodos del sistema. Si se eliminan
	 * todos los enlaces que conectan a un nodo este aún permanece en el sistema 
	 * como nodo suelto a menos que se use el metodo estatico
	 * {@link Nodos.Interfaces.Adyacentes#eliminar Nodo.eliminar(nodo)}
     * 
     * 
     * @param void
     * @return {Map<string|number, Nodo>} Map con nodos eliminados, o Map vacío si no existen
     */
    eliminar_adyacentes(enlace) {
        throw new Error("Método eliminar_enlaces() debe ser implementado por la clase que herede.");
    }
    /**
     * Devuelve la cantidad de adyacentes.
     *
     * Retorna el número de nodos adyacentes vinculados al nodo.  
     * Si no existen adyacentes, devuelve 0.
     *
     * @param void
     * @return {number} Número de adyacentes actuales
     * @since 2.9.4
     * @public
     */
    cantidad_de_adyacentes() {
        throw new Error("Método cantidad_de_adyacentes() debe ser implementado por la clase que herede.");
    }


    /**
     * Ejecuta una función sobre cada nodo adyacente.
     *
     * Recorre todos los adyacentes y aplica la función indicada sobre cada uno.  
     * La función recibe el nodo, el enlace y parámetros adicionales en caso de proveerse.  
     * Retorna un objeto con los resultados, o `null` si no existen adyacentes.
     * 
     * @param {Function} funcion Función a ejecutar sobre cada nodo adyacente.
     * @param {...*} parametros Parámetros adicionales para la función.
     * @return {Object|null} Resultados de la ejecución o `null` si no hay adyacentes.
     */
    por_cada_adyacente_ejecutar(funcion, ...parametros) {
        throw new Error("Método por_cada_adyacente_ejecutar(funcion, ...parametros) debe ser implementado por la clase que herede.");
    }
}

export {Adyacentes}