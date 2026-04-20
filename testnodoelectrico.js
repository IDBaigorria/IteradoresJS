console.log('Inicio de test (main.js)');
import { Objeto, Nodo, NodoElectrico, Controlador } from './index.js';

const nodo=NodoElectrico.crear();
const nodo1=NodoElectrico.crear_con_dato("d", false, 2,3);
const nodo2=NodoElectrico.crear_con_id("mala");
const nodo3=NodoElectrico.crear_con_dato_e_id("d","mala1");
const nodo4=NodoElectrico.nodo(nodo3);

//alert (nodo4.id());
//NodoElectrico.eliminar(nodo);
nodo._adyacente(nodo1); 
nodo._adyacente(nodo1); 
nodo._adyacente_en(nodo1,"mmmm");
nodo3._adyacente_en(nodo1, "mmmm");
nodo._adyacente_en(nodo3, "mm");
console.log("cantidad de adyacentes nodo: "+nodo.cantidad_de_incidentes());
console.log("cantidad de adyacentes nodo1: "+nodo1.cantidad_de_incidentes());

const res=nodo.por_cada_adyacente_ejecutar((nodo, enlace)=>{
    console.log("ete "+nodo.id());
    return nodo.id();
});
console.log("Encontre:");
for (const[enlace, id] of res){
    console.log(enlace+"=>"+nodo.id());
}

const res2=nodo.por_cada_incidente_ejecutar((nodo, enlace)=>{
    console.log("ese "+nodo.id());
    return nodo.id();
});
console.log("Encontre:");
for (const [idincidente, idincidentes] of res2){
    for (const[enlace,nodo] of idincidentes){
        console.log(enlace+"=>"+nodo.id());
    }
}
    if (nodo3.tiene_adyacente()){
         console.log("tiene adyacente");
    }else{
        console.log("no tiene adyacente");
    }
        if (nodo3.tiene_incidente()){
         console.log("tiene incidente");
    }else{
        console.log("no tiene incidente");
    }

     if (nodo.tiene_adyacente_a(nodo1)){
         console.log("tiene adyacente a");
    }else{
        console.log("no tiene adyacente a");
    }
        if (nodo1.tiene_incidente_a(nodo)){
         console.log("tiene incidente a");
    }else{
        console.log("no tiene incidente a");
    }

    const ady=nodo1.adyacentes();
    const inc=nodo1.incidentes();
    console.log(ady);
    console.log(inc);
//nodo.eliminar_adyacentes();
NodoElectrico.imprimir_superestructura();
Nodo.imprimir_errores();
Objeto.imprimir_alertas();
