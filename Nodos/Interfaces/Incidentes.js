/**
 * Interfaz que define el manejo de datos en un nodo.
 *
 * Permite establecer y recuperar un valor almacenado en el nodo.
 * Estos métodos son implementados por la clase {@link Nodos.Nodo Nodo}.
 *
 * @interface
 * @since V0.2.0
 * @memberof Nodos.Interfaces
 */
class Incidentes {

    /**
     * Verifica si el nodo es adyacente de al menos un nodo(Interfaz {@link Nodos.Interfaces.Incidentes Incidentes}).
     *
     * Evalúa si no existe al menos otro nodo que lo tenga él como adyacente. O dicho de 
     * otro modo, si no tiene conexiones "entrantes"; en tal caso se concidera "suelto"
     * y devuelve true; caso contrario devuelve false.
     * 
     * Si el nodo está autoenlazado, es decir tiene algun enlace que sale de él hacia él
     * mismo ya no se concidera "suelto" y devuelve false. 
     * 
     * ⚠️ Importante: verifica las conexiciones de "entrada", pero no las de "salida".
     * Para verificar las conexiones de "salida" utilice 
     * {@link Nodos.Interfaces.Incidentes#tiene_adyacente tiene_adyacente}
     *
     * 
     * @note Utiliza la propiedad interna `this.referencias` y el método `es_especial()`.
     * @return {boolean} Devuelve **true** si el nodo está considerado suelto, o **false** en caso contrario.
     * @public
     */	
    tiene_incidente() {
        throw new Error("Método tiene_incidente() debe ser implementado por la clase que herede.");
    }


    /**
     * Verifica si el nodo actual es adyacente del nodo indicado.
     *
     * Indica si el nodo actual está enlazado desde el nodo pasado como parámetro.  
     * Devuelve el nombre del enlace en caso de existir, o `false` en caso contrario.
     * 
     * 🔗 Método complementario:
     * - {@link Nodos.Interfaces.Incidentes#tiene_adyacente_a tiene_adyacente_a()}
     * 
     * @param {Nodo} nodo Nodo a verificar.
     * @return {string|boolean} Nombre del enlace si existe, `false` en caso contrario.
     * @public
     * @since 3.2.3
     */
    tiene_incidente_a(nodo) {
         throw new Error("Método tiene_incidente_a() debe ser implementado por la clase que herede.");
    }



    /**
     * Devuelve el nodo incidente en el enlace especificado.
     *
     * Comprueba si existe un nodo en el enlace indicado y lo devuelve;  
     * si no existe, devuelve `null`.
     * 
     * @param {number|string} enlace El identificador del enlace a consultar
     * @return {Nodo|null} Nodo adyacente si existe, `null` en caso contrario
     */
    incidente(enlace){
        throw new Error("Método adyacente() debe ser implementado por la clase que herede.");
    };

    /**
     * Devuelve todos los incidentes del nodo.
     * 
     * No tiene sentido porque puedne haber mas de un nodo adyacente con un mismo nombre de enlace
     *
     * Retorna un `Map` con todos los nodos incidentes si existen, 
     * o `null` en caso contrario.  
     * 
     * Se usa cuando se necesita consultar el estado actual de las conexiones de un nodo
     * sin afectar su integridad.
     *
     * @param void
     * @return {?Map<string|number, Nodo>} Map con nodos incidentes o `null` si no existen
     */
/*    incidentes(){
        throw new Error("Método incidentes() debe ser implementado por la clase que herede.");
    }*/

    /**
     * Asigna un incidente con nombre único.
     *
     * Agrega un nodo como incidente generando automáticamente un nombre de enlace único
     * basado en el `id()` del nodo destino.  
     * Si ya existe un enlace con ese nombre, se crean variantes incrementales (`id.1`, `id.2`, ...).
     *
     * @param {Nodo} un_nodo Nodo que se desea enlazar
     * @return {Nodo} Nodo incidente recién asignado
     * @public
     */
     _incidente(un_nodo){
        throw new Error("Método _incidente() debe ser implementado por la clase que herede.");
    }
    
    /**
     * Asigna un nodo incidente en un enlace específico.
     *
	 * Permite enlazar un nodo incidente en un enlace identificado por un string. 
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
     _incidente_en(unNodo, enlace, reemplazar = false) {
        throw new Error("Método _incidente_en() debe ser implementado por la clase que herede.");
    }

    /**
     * Elimina un incidente del nodo.
     *
     * Busca y elimina un incidente dado si existe. Y devuelve el nodo
     * que estaba enlazado en dicho incidente o devuelve `null` en caso contrario.  
     * 
  	 * ⚠️ Importante: Este método no elimina los nodos del sistema. Si se eliminan
	 * todos los enlaces que conectan a un nodo este aún permanece en el sistema 
	 * como nodo suelto a menos que se use el metodo estatico
	 * {@link ./classes/Nodos.Interfaces.Incidentes.eliminar Nodo::eliminar($nodo)}
     *
     * @param {string} enlace Enlace del adyacente a eliminar
     * @return {?Nodo} Nodo eliminado o `null` si no existe
     */
    eliminar_incidente(enlace) {
        throw new Error("Método eliminar_incidente() debe ser implementado por la clase que herede.");
    }

    /**
     * Elimina todos los incidentes del nodo.
     *
     * Borra todas las conexiones entrantes y devuelve los nodos eliminados como Map.  
     * Si no hay incidentes, retorna un Map vacío.
     *
  	 * ⚠️ Importante: Este método no elimina los nodos del sistema. Si se eliminan
	 * todos los enlaces que conectan a un nodo este aún permanece en el sistema 
	 * como nodo suelto a menos que se use el metodo estatico
	 * {@link ./classes/Nodos.Interfaces.Incidentes.eliminar Nodo::eliminar($nodo)}
     * 
     * @param void
     * @return {Map<string|number, Nodo>} Map con nodos eliminados, o Map vacío si no existen
     */
    eliminar_incidentes(enlace) {
        throw new Error("Método eliminar_enlaces() debe ser implementado por la clase que herede.");
    }


    /**
     * Devuelve la cantidad de incidentes.
     *
     * Retorna el número de nodos incidentes o con enlaces entrantes al nodo.  
     * Si no existen incidentes, devuelve 0.
     *
     * @param void
     * @return {number} Número de incidentes actuales
     * @since 3.2.3
     * @public
     */
    cantidad_de_incidentes() {
        throw new Error("Método cantidad_de_incidentes() debe ser implementado por la clase que herede.");
    }

    /**
     * Ejecuta una función sobre cada nodo incidente.
     *
     * Recorre todos los incidentes y aplica la función indicada sobre cada uno.  
     * La función recibe el nodo, el enlace y parámetros adicionales en caso de proveerse.  
     * Retorna un objeto con los resultados, o `null` si no existen incidentes.
     * 
     * @param {Function} funcion Función a ejecutar sobre cada nodo adyacente.
     * @param {...*} parametros Parámetros adicionales para la función.
     * @return {Object|null} Resultados de la ejecución o `null` si no hay incidentes.
     */
    por_cada_incidente_ejecutar(funcion, ...parametros) {
        throw new Error("Método por_cada_adyacente_ejecutar(funcion, ...parametros) debe ser implementado por la clase que herede.");
    }
}

export {Incidentes}