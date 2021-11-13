import { Injectable } from '@angular/core';

import { Storage } from '@ionic/storage';

//interface de electrodoméstico
export interface Electromestico{
  id: number,
  nombre: string,
  consumo: number,
  editable: boolean
}

//nombre de la lista de electrodoméstico que el usuario guardará en el storage
const LISTA_ITEMS = 'dataUsuario';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(private storage: Storage) { }

  //toma un item electrodoméstico y lo añade al storage (clave dataUsuario)
  addItem(item: Electromestico): Promise<any>{
    return this.storage.get(LISTA_ITEMS).then((items: Electromestico[]) => {
      if(items) {
        items.push(item);
        return this.storage.set(LISTA_ITEMS, items);
      } else {
        return this.storage.set(LISTA_ITEMS, [item]);
      }
    });
}

//retorna el contenido del storage
getItems(): Promise<Electromestico[]>{
  return this.storage.get(LISTA_ITEMS);
}

//para eliminar un electrodoméstico, se le pasa parametro de id, recorre los items 
// si el id es diferente a los ids de los items, se añade en nueva lista y guarda en el storage
eliminarItem(id: number): Promise<Electromestico>{
  return this.storage.get(LISTA_ITEMS).then((items: Electromestico[]) =>{
    if(!items || items.length === 0) {
      return null;
    } 
    let nuevaLista: Electromestico[] = [];

    for (let i of items){
      if(i.id !== id) {
        nuevaLista.push(i);
      }
    }
    return this.storage.set(LISTA_ITEMS, nuevaLista);
  });
}

}
