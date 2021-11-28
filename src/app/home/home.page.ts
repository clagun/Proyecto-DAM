import {Component, OnInit} from '@angular/core';
import {ApireeService} from '../servicios/apiree.service';
import {Observable} from 'rxjs';

declare var cordova: any; // stop TypeScript complaining.

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  items: Observable<any>;
  homePrecios: Array<any>=[];
  horas: Array<any>=[];
  timeArr: Array<string>=[];

  minArr: any;
  hora: any;
  minimoPrecioEntre: any;
  horaPrecioMasBarato: any;
  tiempoMasBaratoEntre: any;

  electrodomesticoUsuario: any;

  constructor(private apireeService: ApireeService) {
    this.GetAPIPrecio();
  }

  //Realiza la subscripción al API, coge los precios y horas y los guarda en un array, coge el precio mas barato y la hora.
  GetAPIPrecio() {

    this.apireeService.GetAPI().subscribe(data => {
      this.items=data.indicator.values;

      for(let i=0; i<data.indicator.values.length; i++) {

        this.homePrecios.push(data.indicator.values[i].value/1000);
        this.horas.push(data.indicator.values[i].datetime);
      }

      this.minArr=Math.min.apply(Math, this.homePrecios);
      var index=this.homePrecios.indexOf(this.minArr);

      //Realiza un split de la fecha desde la T (2021-10-16T21:00:00.000+02:00) entonces almacena solo el tiempo.
      var tiempo=this.horas[index].split("T")[1];
      //Realiza un slice que quita el sobrante de la hora (segundos y cambio de hora) 21:00:00.000+02:00
      this.hora=tiempo.slice(0, 5);

      this.minimoPrecioEntre=this.homePrecios[8];
      this.tiempoMasBaratoEntre=this.horas[0];


      for(let i=8; i<=22; i++) {

        if(this.homePrecios[i]<this.minimoPrecioEntre) {

          this.minimoPrecioEntre=this.homePrecios[i];
          this.tiempoMasBaratoEntre=this.horas[i];

        }
      }

      this.tiempoMasBaratoEntre=this.tiempoMasBaratoEntre.split("T")[1];
      this.tiempoMasBaratoEntre=this.tiempoMasBaratoEntre.slice(0, 5);

      //si hay datos guardados en el local storage con la clave data, se ejecuta el método
      if(localStorage.getItem('data')) {
        this.getPreciosHomeLocal();
      }
    });
  }

  //Se ejecuta cuando entra en una página (antes de ser cargada), actualiza datos precios
  ionViewWillEnter() {
    this.GetAPIPrecio();

    // esperamos a que this.hora este definido
    (async () => {
      while(this.hora===undefined)
        await new Promise(resolve => setTimeout(resolve, 1000));
      // formateamos el precio a dos decimales  
      var precio=Number((Math.abs(this.minArr)*100).toPrecision(15));
      precio=Math.round(precio)/100*Math.sign(this.minArr);
      // lanzamos la notificación
      cordova.plugins.notification.local.schedule({
        id: 1,
        smallIcon: "res://icon",
        icon: "res://icon",
        color: '4caf50',
        title: "El precio más barato de mañana",
        text: "Hora: "+this.hora+" Precio: "+precio+"€",
        trigger: {every: {hour: 20, minute: 10}, count: 365},
        foreground: true
      });
    })();
  }


  /* obtiene los valores del local storage y con los precios de la api
   se calcula los precios mnimos del electrodoméstico seleccionado*/
  getPreciosHomeLocal() {
    //toma los datos del local storage, se parsea el json y se guarda lo obtenido
    this.electrodomesticoUsuario=JSON.parse(localStorage.getItem('data'));
    this.minimoPrecioEntre=(this.electrodomesticoUsuario.consumo/1000)*this.minimoPrecioEntre;
    this.minArr=(this.electrodomesticoUsuario.consumo/1000)*this.minArr;
  }
}
