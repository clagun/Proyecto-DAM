import {Component, OnInit} from '@angular/core';
import {ApireeService} from '../apiree.service';
import { Observable  } from 'rxjs';

@Component({
  selector: 'app-listado',
  templateUrl: './listado.page.html',
  styleUrls: ['./listado.page.scss'],
})
export class ListadoPage implements OnInit {

  items:Observable<any>;
  precios: Array<any> = [];
 
  minArr: number;
  maxArr: number;

  constructor(private apireeService: ApireeService) { 
    this.GetAPILista()
  }

  //Toma como parametro el precio desde la pagina .html, realiza los calculos para saber que color tiene que ser el circulo.
  GetClass(precio: number) {

    let porcentage: Number;

    porcentage= (precio-this.minArr)*100/(this.maxArr-this.minArr);

    if(porcentage>75)
      return 'rojo';
    else if(porcentage>25)
      return 'amarillo';
    else
      return 'verde'; 

    //Condicion por si acaso que queremos usar los valores de kwH como en la pagina oficial.
  /*     if( precio < 0.10 ) {
        return 'verde';
    } else if(precio >= 0.10 && precio <= 0.15) {
        return 'amarillo';
    } else {
        return 'rojo';
    }  */

  }

  //Realiza la subscripción al API y guarda los valores necesarios en los arrays y saca los min y max valores.
  GetAPILista() {

   this.apireeService.GetAPI().subscribe(data => {

     this.items = data.indicator.values;
     for(let i = 0; i < data.indicator.values.length; i++) {

      this.precios.push(data.indicator.values[i].value / 1000);

     }

   this.maxArr = Math.max.apply(Math, this.precios);
   this.minArr = Math.min.apply(Math, this.precios);

   });


  }

  ngOnInit() {
  }

}
