import {Component, OnInit} from '@angular/core';
import {ApireeService} from '../apiree.service';
import { ArgumentOutOfRangeError, Observable  } from 'rxjs';
import { min } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  items:Observable<any>;
  homePrecios: Array<any> = [];
  horas: Array<any> = [];
  timeArr: Array<string> = [];

  minArr: any;
  hora: any;
  minimoPrecioEntre: any;
  horaPrecioMasBarato: any;
  tiempoMasBaratoEntre: any;

  constructor(private apireeService: ApireeService) {
      this.GetAPIPrecio();
   }

//Realiza la subscripción al API, coge los precios y horas y los guarda en un array, coge el precio mas barato y la hora.
  GetAPIPrecio() {

    this.apireeService.GetAPI().subscribe(data => {
      this.items = data.indicator.values;

      for(let i = 0; i < data.indicator.values.length; i++) {
 
       this.homePrecios.push(data.indicator.values[i].value / 1000);
       this.horas.push(data.indicator.values[i].datetime);
       
      }
      
     this.minArr = Math.min.apply(Math, this.homePrecios);
     var index = this.homePrecios.indexOf(this.minArr);

      //Realiza un split de la fecha desde la T (2021-10-16T21:00:00.000+02:00) entonces almacena solo el tiempo.
      var tiempo = this.horas[index].split("T")[1];
      //Realiza un slice que quita el sobrante de la hora (segundos y cambio de hora) 21:00:00.000+02:00
      this.hora = tiempo.slice(0, 5);
      
      this.minimoPrecioEntre = this.homePrecios[8];
      this.tiempoMasBaratoEntre = this.horas[0];
    

      for(let i = 8; i <= 22; i++) {

          if(this.homePrecios[i] < this.minimoPrecioEntre) {
            
            this.minimoPrecioEntre = this.homePrecios[i];
            this.tiempoMasBaratoEntre = this.horas[i];
            
          }
        
      }

      this.tiempoMasBaratoEntre = this.tiempoMasBaratoEntre.split("T")[1];
      this.tiempoMasBaratoEntre = this.tiempoMasBaratoEntre.slice(0, 5);
     
    });


   }

}
