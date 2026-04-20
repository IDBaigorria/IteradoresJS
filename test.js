    console.log('Inicio de test (main.js)');
    import { Objeto, NodoElectrico, Controlador } from './index.js';

/*
    const div = document.getElementById('salida');
    class MiClase extends Objeto {
      static prueba() {
        this._error("Algo salió mal en MiClase");
      }
    }


      const obj1 = new Objeto();
      const obj2 = new MiClase();
     // obj1._id("hola");
     // obj2._id("chau");
      //Objeto.

      div.innerHTML = `
        <p>Objeto 1 - ID: ${obj1.id()}</p>
        <p>Objeto 2 - ID: ${obj2.id()}</p>
      `;

  console.log("nodo");
  console.log(NodoElectrico.cantidad_de_nodos());
// Caso 0: se lo llama sin ningún parámetro (crea nodo vacio completamente valido): 
const nodo0= NodoElectrico.nodo();
console.log(nodo0.dato()); // "null"
console.log(nodo0.id()); //0
console.log(NodoElectrico.cantidad_de_nodos());//1

// Caso 1: se le pasa un parámetro no Nodo (crea un nodo con el dato pasado por parametro)
const nodo1=NodoElectrico.nodo("Soy el nodo 1");
console.log(nodo1.dato()); // "Soy el nodo 1"
console.log(nodo1.id());//1
console.log(NodoElectrico.cantidad_de_nodos());//2

// Caso 2: le paso un parametro que es un nodo (no crea ningun nodo, devuelve el mismo nodo)
const nodo2=NodoElectrico.nodo(nodo1);
console.log(nodo2.dato()); // "soy el nodo 1"
console.log(nodo2.id()); //1
console.log(NodoElectrico.cantidad_de_nodos());//2

//caso 3: se le pasa un parametro no Nodo y una funcion callback (crea una instancia de Nodo
//con el dato pasado por parametro. Además invoca a la funcion callback y le pasa el Nodo creado
//y otro parametro booleano para que pueda verificar si el dato original era un nodo o no)
const nodo3 = NodoElectrico.nodo("soy nodo 3", (nodo, esNodo) => {
    if (esNodo){
       console.log("el parametro de entrada era un nodo");
    }else{
       console.log("el parametro de entrada no era un nodo"); // Imprime esto
    }
});
console.log(nodo3.id());//2
console.log(NodoElectrico.cantidad_de_nodos());//3

//caso 4: se le pasa un parametro que es un Nodo y una funcion callback (crea una instancia de Nodo
//con el dato pasado por parametro. Además invoca a la funcion callback y le pasa el Nodo creado
//y otro parametro booleano para que pueda verificar si el dato original era un nodo o no)
const nodo4 = NodoElectrico.nodo(nodo3, (nodo, esNodo) => {
    if (esNodo){
       console.log("el parametro de entrada era un nodo"); //imprime esto
    }else{
       console.log("el parametro de entrada no era un nodo"); 
    }
});
console.log(nodo4.id());//2
console.log(NodoElectrico.cantidad_de_nodos());//3

*/
//Ejemplo de uso:
console.log("pruebas Adyacentes");

/*console.log("_adyacente(nodo)");
const nodo = NodoElectrico.crear();
const otro1 = NodoElectrico.crear_con_id("ejemplo");
const otro2 = NodoElectrico.crear_con_id("otro_ejemplo");

const enlace1=nodo._adyacente(otro1); // crea enlace "ejemplo" a otro1
const enlace2=nodo._adyacente(otro2); // crea enlace "otro_ejemplo" a otro2
const enlace3=nodo._adyacente(otro1); // crea enlace "ejemplo.1" a otro1
console.log("En el enlace "+enlace1+" se agrego el nodo "+nodo.adyacente(enlace1).id()); //ejemplo / ejemplo
console.log("En el enlace "+enlace2+" se agrego el nodo "+nodo.adyacente(enlace2).id()); //otro_ejemplo / otro_ejemplo
console.log("En el enlace "+enlace3+" se agrego el nodo "+nodo.adyacente(enlace3).id()); //ejemplo.1 / ejemplo

*/
/*console.log("_adyacente_en");
const nodoA = NodoElectrico.crear_con_dato("A");
const nodoB = NodoElectrico.crear_con_dato("B");

// asigno nodoB como adyacente de nodoA bajo el enlace "conecta"
nodoA._adyacente_en(nodoB, "conecta");
console.log(nodoA.adyacente("conecta").dato());//imprime "B"*/
/*
console.log("adyacente()");
const n1 = NodoElectrico.crear_con_dato("A");
const n2 = NodoElectrico.crear_con_dato("B");
n1._adyacente_en(n2, "enlaceAB");

const ady = n1.adyacente("enlaceAB");
if (ady) console.log("Nodo adyacente:", ady.dato());//B

*/

/*
//adyacentes
//Ejemplo de uso:
//Ejemplo de uso:
const nodo = NodoElectrico.crear();
nodo._adyacente(NodoElectrico.crear_con_id("A"));
nodo._adyacente(NodoElectrico.crear_con_id("B"));
const todos = nodo.adyacentes();
if (todos !== null) {
  for (const [enlace, ady] of todos) {
    console.log(`Enlace: ${enlace}, Nodo ID: ${ady.id()}`);//imprimo cada adyacente
    todos.delete(enlace);//elimina en el resultado pero no afecta la estructura del nodo original
  }
}
//comprobacion
console.log("compruebo eliminacion en resultado")
for (const [enlace, ady] of todos) {
    console.log(`Enlace: ${enlace}, Nodo ID: ${ady.id()}`);//no imprime nada ya que no hay nada
  }
console.log("comprobacion nuevo resultado");
const todos2 = nodo.adyacentes();
if (todos2 !== null) {
  for (const [enlace, ady] of todos2) {
    console.log(`Enlace: ${enlace}, Nodo ID: ${ady.id()}`);//imprime lo mismo que antes
  }
}*/
/*
console.log("eliminar_enlace");
//Ejemplo de uso:
const nodo = NodoElectrico.crear_con_id("nodo");
const otro = NodoElectrico.crear_con_id("otro");
nodo._adyacente_en(otro, "A");
console.log("Se agregó el nodo "+nodo.adyacente("A").id());
const eliminado = nodo.eliminar_enlace("A");
if (eliminado !== null) {
  console.log("Se eliminó el nodo con ID: " + eliminado.id());// imprime "otro"
}
console.log("comprobación de que realmente se eliminó");
const ady=nodo.adyacente("A");
if (!ady){
		console.log("No existe adyacente en 'A'"); //imprime esto
}else{
		console.log( "Hasta aca no llega");
}*/
/*
console.log("eliminar_enlaces");
//Ejemplo de uso:
const nodo = NodoElectrico.crear_con_id("nodo");
const otroA = NodoElectrico.crear_con_id("otroA");
const otroB = NodoElectrico.crear_con_id("otroB");
nodo._adyacente_en(otroA, "A");
nodo._adyacente_en(otroB, "B");
console.log("Se agregaron enlaces:")
const todos=nodo.adyacentes();
if (todos) {
  for (const [enlace, ady] of todos) {
    console.log(`Enlace: ${enlace}, Nodo ID: ${ady.id()}`);//imprimo cada adyacente
  }
}
const copia = nodo.eliminar_enlaces();
console.log("Se eliminaron enlaces:");
if (copia){
   for (const [enlace, eliminado] of copia) {
      console.log("Enlace: "+enlace+ "Nodo ID: "+ eliminado.id()); 
   }
}
console.log("Comprobación");
const todos2=nodo.adyacentes();
if (todos2){
   console.log("Aún tiene adyacentes, algo falló");
}else{
   console.log("No tiene ningún adyacente");//imprime esto
}*/
/*
const nodo = NodoElectrico.crear();
const nodoA = NodoElectrico.crear_con_dato("A");
const nodoB = NodoElectrico.crear_con_dato("B");
nodo._adyacente_en(nodoA, "conectaA");
nodo._adyacente_en(nodoB, "conectaB");

// ejecuta una función sobre cada adyacente
const resultados = nodo.por_cada_adyacente_ejecutar((nodo, enlace) => {
    return "hay nodo con dato:"+ nodo.dato();
});
if (resultados){
   for (const [enlace, resultado] of resultados) {
      console.log("En enlace '"+enlace+ "' "+ resultado); 
   }
}
*/
/*
console.log("tiene_incidente_a");
const n1 = NodoElectrico.crear_con_dato("A");
const n2 = NodoElectrico.crear_con_dato("B");
n2._adyacente_en(n1, "enlaceBA");

if (n1.tiene_incidente_a(n2)) {
  console.log("A es adyacente de B");
}
*/
/*
console.log("tiene_incidente_a");
const nA = NodoElectrico.crear_con_dato("A");
const nB = NodoElectrico.crear_con_dato("B");
nB._adyacente_en(nA, "enlaceBA");

if (nA.tiene_incidente_a(nB)) {
  console.log("B es incidente de A");
}*/
/*
console.log("tiene_adyacente");
//Ejemplo de uso:
const nodo = NodoElectrico.crear();
if (nodo.tiene_adyacente()) {
    console.log("El nodo tiene adyacentes");
}else{
    console.log("El nodo no tiene adyacentes");//imprime esto
}
const otroNodo = NodoElectrico.crear();
nodo._adyacente(otroNodo);
if (nodo.tiene_adyacente()) {
    console.log("El nodo tiene adyacentes");//imprime esto
}else{
    console.log("El nodo no tiene adyacentes");
}*/
/*
console.log("tiene_incidente");
const nodo = NodoElectrico.crear();
if (nodo.tiene_incidente()) {
    console.log("El nodo tiene conexiones entrantes.");
}else{
    console.log("El nodo no tiene conexiones entrantes.");//imprime esto
}
const otroNodo = NodoElectrico.crear();
otroNodoElectrico._adyacente(nodo);
otroNodoElectrico._adyacente(nodo);
if (nodo.tiene_incidente()) {
    console.log("El nodo tiene conexiones entrantes.");//imprime esto
}else{
    console.log("El nodo no tiene conexiones entrantes.");
}*/
/*
console.log("cantidad_de_adyacentes");
//Ejemplo de uso:
const nodo = NodoElectrico.crear();
const otro1 = NodoElectrico.crear();
const otro2 = NodoElectrico.crear();
nodo._adyacente_en(otro1, "X");
nodo._adyacente_en(otro2, "Y");
console.log(nodo.cantidad_de_adyacentes()); // 2*/
/*console.log("cantidad_de_incidentes");
//Ejemplo de uso:
const nodo = NodoElectrico.crear();
const otro1 = NodoElectrico.crear();
const otro2 = NodoElectrico.crear();
otro1._adyacente_en(nodo, "X");
otro2._adyacente_en(nodo, "X");
console.log(nodo.cantidad_de_incidentes()); // 2*/
/*const nombre1="23";
const nombre2="veintitres";
const nombre3=23;
const nombre4="0";

if (NodoElectrico.validar_nombre_enlace(nombre1)) {
    console.log("el nombre de enlace "+nombre1+" es válido");
}else{
    NodoElectrico._error("Nombre de enlace "+nombre1+" inválido");
}
if (NodoElectrico.validar_nombre_enlace(nombre2)) {
    console.log("el nombre de enlace "+nombre2+" es válido");
}else{
    NodoElectrico._error("Nombre de enlace "+nombre2+" inválido");
}     
if (NodoElectrico.validar_nombre_enlace(nombre3)) {
    console.log("el nombre de enlace "+nombre3+" es válido");
}else{
    NodoElectrico._error("Nombre de enlace "+nombre3+" inválido");
}
if (NodoElectrico.validar_nombre_enlace(nombre4)) {
    console.log("el nombre de enlace "+nombre4+" es válido");
}else{
    NodoElectrico._error("Nombre de enlace "+nombre4+" inválido");
}*/
 //NodoElectrico.imprimir_errores();
//
async function probarIndexedDB() {
    const nombre = "test_superestructura_indexeddb";

    console.log("=== Prueba IndexedDB ===");
    // 0. Elegir metodo
  //  Controlador.establecer_metodo("XML");
    // 1. Limpiamos la superestructura actual
    //NodoElectrico.vaciar_todos();  

    // 2. Creamos algunos nodos
    const n1 = NodoElectrico.crear_con_dato("Nodo 1");
    const n2 = NodoElectrico.crear_con_dato("Nodo 2");
    const n3 = NodoElectrico.crear_con_dato("Nodo 3");

    // 3. Creamos enlaces entre ellos
    n1._adyacente_en(n2, "enlace_12");
    n2._adyacente_en(n3, "enlace_23");
    n3._adyacente_en(n1, "enlace_31");

    console.log("Nodos y enlaces creados.");
    NodoElectrico.imprimir_superestructura();
    // 4. Guardar la superestructura
    const guardado = await Controlador.guardar(nombre);
    console.log("Guardado:", guardado);

    // 5. Verificar existencia
    const existe1 = await Controlador.existe(nombre);
    console.log("¿Existe después de guardar?:", existe1);

    n3._adyacente_en(NodoElectrico.crear_con_dato("soy nodo n4"), "enlace 34");
    NodoElectrico.imprimir_superestructura();
    // 7. Cargar desde IndexedDB
    const cargado = await Controlador.cargar(nombre);
    console.log("Cargado:", cargado);
    NodoElectrico.imprimir_superestructura();
    // 8. Mostrar nodos cargados
   /* const todos = NodoElectrico.todos();
    console.log("Nodos cargados:");
    for (const [id, nodo] of Object.entries(todos)) {
        console.log(`ID: ${id}, dato: ${nodo.dato()}`);
    }*/

    // 9. Probar eliminación
    const eliminado = await Controlador.eliminar(nombre);
    console.log("Eliminado:", eliminado);

    // 10. Verificar que ya no exista
    const existe2 = await Controlador.existe(nombre);
    console.log("¿Existe después de eliminar?:", existe2);
    // 10. Verificar que ya no exista
    const existe3 = await Controlador.existe("klasdfm");
    console.log("¿Existe después de eliminar?:", existe3);
    console.log("=== Fin de la prueba ===");
    
   NodoElectrico.imprimir_errores();
   Objeto.imprimir_alertas();
}

probarIndexedDB().catch(err => console.error("Error general en la prueba:", err));
