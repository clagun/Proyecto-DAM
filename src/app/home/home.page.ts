import { Component } from '@angular/core';
import { ApireeService } from '../servicios/apiree.service';
import { Observable } from 'rxjs';
import { ApiaverageService } from '../servicios/apiaverage.service';

import { IonRouterOutlet, Platform } from '@ionic/angular';

declare var cordova: any; // stop TypeScript complaining.

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  items: Observable<any>;
  valorMedio: Observable<any>;
  precios: Array<any> = [];
  horas: Array<any> = [];
  timeArr: Array<string> = [];
  preciosmaniana: Array<any> = [];
  horasmaniana: Array<any> = [];
  preciopromedioDiario: Array<any> = [];
  fechasDatos: Array<any> = [];

  precioMin: any;
  precioMinManiana: any;
  horaMin: any;
  horaMinManiana: any;
  precioMinEntre: any;
  horaMinEntre: any;
  preciopromedio15dias: any;
  preciomax15dias: any;
  preciomin15dias: any;

  electrodomestico: any;
  nombreelectro: any;

  constructor(private apireeService: ApireeService,
              private apiaverage: ApiaverageService,
              private platform: Platform,
              private routerOutlet: IonRouterOutlet) 
  {
    this.GetAPIPrecio();
    this.GetPrecioMedio();

    //se añade función de salir de la app, al dar botón atrás del hardware
    this.platform.backButton.subscribeWithPriority(-1, () => {
      if (!this.routerOutlet.canGoBack()) {
        navigator['app'].exitApp();
      }
    });
  }

  //Realiza la subscripción al API, coge los precios y horas y los guarda en un array, coge el precio mas barato y la hora.
  GetAPIPrecio() {

    this.apireeService.GetAPI().subscribe(data => {
      this.items = data.indicator.values;

      for (let i = 0; i < data.indicator.values.length; i++) {

        this.precios.push(data.indicator.values[i].value / 1000);
        this.horas.push(data.indicator.values[i].datetime);

      }

      this.precioMin = Math.min.apply(Math, this.precios);
      var index = this.precios.indexOf(this.precioMin);

      //Realiza un split de la fecha desde la T (2021-10-16T21:00:00.000+02:00) entonces almacena solo el tiempo.
      var tiempo = this.horas[index].split("T")[1];
      //Realiza un slice que quita el sobrante de la hora (segundos y cambio de hora) 21:00:00.000+02:00
      this.horaMin = tiempo.slice(0, 5);

      this.precioMinEntre = this.precios[8];
      this.horaMinEntre = this.horas[0];


      for (let i = 8; i <= 22; i++) {

        if (this.precios[i] <= this.precioMinEntre) {

          this.precioMinEntre = this.precios[i];
          this.horaMinEntre = this.horas[i];

        }
      }

      this.horaMinEntre = this.horaMinEntre.split("T")[1];
      this.horaMinEntre = this.horaMinEntre.slice(0, 5);

      //si hay datos guardados en el local storage con la clave data, se ejecuta el método
      if (localStorage.getItem('data')) {
        this.getPreciosHomeLocal();
      }
    });
  }

  //Realiza la subscripción al API, coge los precios y horas y los guarda en un array, coge el precio mas barato y hora para el dia siguiente
  GetAPIPrecioManiana() {

    this.apireeService.GetAPIDiaSiguiente().subscribe(data => {
      this.items = data.indicator.values;

      for (let i = 0; i < data.indicator.values.length; i++) {

        this.preciosmaniana.push(data.indicator.values[i].value / 1000);

        this.horasmaniana.push(data.indicator.values[i].datetime);

      }

      //Almacena el precio minimo del dia
      this.precioMinManiana = Math.min.apply(Math, this.preciosmaniana);

      //Almacena el indice del precio minimo
      var minIndex = this.preciosmaniana.indexOf(this.precioMinManiana);

      //Almacena el datetime del precio minimo  quita la hora
      this.horaMinManiana = this.horasmaniana[minIndex].split("T")[1].slice(0, 5);

    });
  }

  GetPrecioMedio() {
    this.apiaverage.GetAPI().subscribe(data => {
      this.valorMedio=data.indicator.values;
      
      for (let i=0; i<data.indicator.values.length; i++){
        //console.log(data.indicator.values[i].value);
        this.preciopromedioDiario.push(data.indicator.values[i].value);
        this.fechasDatos.push(data.indicator.values[i].datetime);
      }
      this.preciomax15dias = (Math.max.apply(null, this.preciopromedioDiario)/1000);
      this.preciomin15dias = (Math.min.apply(null, this.preciopromedioDiario)/1000);
      var suma = this.preciopromedioDiario.reduce((previous, current) => current += previous);
      this.preciopromedio15dias = (suma/ this.preciopromedioDiario.length)/1000;
    })
    }

  //Se ejecuta cuando entra en una página (antes de ser cargada), actualiza datos precios
  ionViewWillEnter() {
    this.GetAPIPrecio();
    this.GetAPIPrecioManiana();
    this.GetPrecioMedio();

    // esperamos a que this.precioMinManiana este definido
    (async () => {
      while (this.precioMinManiana === undefined)
        await new Promise(resolve => setTimeout(resolve, 1000));

      // formateamos el precio a dos decimales  
      var precio = Number((Math.abs(this.precioMinManiana) * 100).toPrecision(15));
      precio = Math.round(precio) / 100 * Math.sign(this.precioMinManiana);

      // lanzamos la notificación
      cordova.plugins.notification.local.schedule({
        id: 1,
        smallIcon: "res://icon",
        icon: "res://icon",
        color: '4caf50',
        title: "El precio más barato de mañana",
        text: "Hora: " + this.horaMinManiana + " Precio: " + precio + "€",
        trigger: { every: { hour: 21, minute: 45 }, count: 365 },
        foreground: true
      });
    })();
  }


  /* obtiene los valores del local storage y con los precios de la api
   se calcula los precios mínimos del electrodoméstico seleccionado, se añade 10% impuestos*/
  getPreciosHomeLocal() {
    //toma los datos del local storage, se parsea el json y se guarda lo obtenido
    this.electrodomestico = JSON.parse(localStorage.getItem('data'));
    this.precioMinEntre = (this.electrodomestico.consumo / 1000) * this.precioMinEntre * 1.10;
    this.precioMin = (this.electrodomestico.consumo / 1000) * this.precioMin * 1.10;
    this.nombreelectro = this.electrodomestico.nombre;
  }
}
