import {Component} from '@angular/core';
import {ApireeService} from '../servicios/apiree.service';
import {Observable} from 'rxjs';
import {ApiaverageService} from '../servicios/apiaverage.service';
import {IonRouterOutlet, Platform, ToastController} from '@ionic/angular';

declare var cordova: any; // stop TypeScript complaining.

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  items: Observable<any>;
  valorMedio: Observable<any>;
  precios: Array<any>=[];
  horas: Array<any>=[];
  timeArr: Array<string>=[];
  preciosmaniana: Array<any>=[];
  horasmaniana: Array<any>=[];
  preciopromedioDiario: Array<any>=[];
  fechasDatos: Array<any>=[];

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
  hora: any;
  textoDia : any;
  fecha: any;

  constructor(private apireeService: ApireeService,
    private apiaverage: ApiaverageService,
    private platform: Platform,
    private routerOutlet: IonRouterOutlet, 
    public toastController: ToastController) {
   
      this.cambiarFecha();
      //se añade función de salir de la app, al dar botón atrás del hardware
    this.platform.backButton.subscribeWithPriority(-1, () => {
      if(!this.routerOutlet.canGoBack()) {
        navigator['app'].exitApp();
      }
    });
  }

  //Realiza la subscripción al API, coge los precios y horas y los guarda en un array, coge el precio mas barato y la hora.
  GetAPIPrecio() {

    this.apireeService.GetAPI().subscribe(data => {
      this.items=data.indicator.values;

      for(let i=0; i<data.indicator.values.length; i++) {

        this.precios.push(data.indicator.values[i].value/1000);
        this.horas.push(data.indicator.values[i].datetime);
      }
      this.precioMenor();
      console.log("los precios de hoy: " + this.precios)
    });
  }

  
  private precioMenor() {
    var precioscomparar: Array<any>=[] ;
    var horascomparar: Array<any>=[]; 
    
    if(this.textoDia == "Hoy"){
      precioscomparar = this.precios;
      horascomparar= this.horas;
    }else{
      precioscomparar = this.preciosmaniana;
      horascomparar = this.horasmaniana;
    }
    this.precioMin = Math.min.apply(Math, precioscomparar);
    var index = precioscomparar.indexOf(this.precioMin);

    //Realiza un split de la fecha desde la T (2021-10-16T21:00:00.000+02:00) entonces almacena solo el tiempo.
    var tiempo = horascomparar[index].split("T")[1];
    //Realiza un slice que quita el sobrante de la hora (segundos y cambio de hora) 21:00:00.000+02:00
    this.horaMin = tiempo.slice(0, 5);

    this.precioMinEntre = precioscomparar[8];
    this.horaMinEntre = horascomparar[0];


    for (let i = 8; i <= 22; i++) {
      if (precioscomparar[i] <= this.precioMinEntre) {
        this.precioMinEntre = precioscomparar[i];
        this.horaMinEntre = horascomparar[i];
      }
    }

    this.horaMinEntre = this.horaMinEntre.split("T")[1];
    this.horaMinEntre = this.horaMinEntre.slice(0, 5);

    //si hay datos guardados en el local storage con la clave data, se ejecuta el método
    if (localStorage.getItem('data')) {
      this.getPreciosHomeLocal();
    } else {
      this.nombreelectro = "No elegido ";
    }
  }

  //Realiza la subscripción al API, coge los precios y horas y los guarda en un array, coge el precio mas barato y hora para el dia siguiente
  GetAPIPrecioManiana() {

    this.apireeService.GetAPIDiaSiguiente().subscribe(data => {
      this.items=data.indicator.values;

      for(let i=0; i<data.indicator.values.length; i++) {

        this.preciosmaniana.push(data.indicator.values[i].value/1000);
        this.horasmaniana.push(data.indicator.values[i].datetime);

      }
      this.precioMenor();
    });
  }

  GetPrecioMedio() {
    this.apiaverage.GetAPI().subscribe(data => {
      this.valorMedio=data.indicator.values;

      for(let i=0; i<data.indicator.values.length; i++) {
        this.preciopromedioDiario.push(data.indicator.values[i].value);
        this.fechasDatos.push(data.indicator.values[i].datetime);
      }

      this.preciomax15dias=(Math.max.apply(null, this.preciopromedioDiario)/1000);
      this.preciomin15dias=(Math.min.apply(null, this.preciopromedioDiario)/1000);
      var suma=this.preciopromedioDiario.reduce((previous, current) => current+=previous);
      this.preciopromedio15dias=(suma/this.preciopromedioDiario.length)/1000;

      if (localStorage.getItem('data')) {
        this.preciomax15dias=this.calculaPrecio(this.preciomax15dias, this.electrodomestico.consumo);
        this.preciomin15dias=this.calculaPrecio(this.preciomin15dias, this.electrodomestico.consumo);
        this.preciopromedio15dias=this.calculaPrecio(this.preciopromedio15dias, this.electrodomestico.consumo);
      }
    })
  }

  //Se ejecuta cuando entra en una página (antes de ser cargada), actualiza datos precios
  ionViewWillEnter() {
    this.GetAPIPrecio();
    this.GetPrecioMedio();
    this.hora = new Date().getHours();
    if(this.hora >= 21){
      this.GetAPIPrecioManiana();
    }
    
    // lanzamos la notificación
    cordova.plugins.notification.local.schedule({
      id: 1,
      smallIcon: "res://icon",
      icon: "res://icon",
      color: '4caf50',
      title: "Ya puedes consultar los precios de la electricidad de mañana",
      trigger: {every: {hour: 21, minute: 0}, count: 365},
      foreground: true
    });

  }


  /* obtiene los valores del local storage y con los precios de la api
   se calcula los precios mínimos del electrodoméstico seleccionado, se añade 10% impuestos*/
  getPreciosHomeLocal() {
    //toma los datos del local storage, se parsea el json y se guarda lo obtenido
    this.electrodomestico=JSON.parse(localStorage.getItem('data'));
    this.precioMinEntre=this.calculaPrecio(this.precioMinEntre, this.electrodomestico.consumo);
    this.precioMin=this.calculaPrecio(this.precioMin, this.electrodomestico.consumo);
    this.nombreelectro=this.electrodomestico.nombre;
  }

  calculaPrecio(precio: number, consumo: number): number {
    return (consumo/1000)*precio*1.10;
  }

  cambiarFecha(){
    
    if (this.textoDia == "Hoy"){
      this.textoDia = "Mañana";
      //this.apireeService.cambiarFecha = true;
      this.GetAPIPrecio();
      this.fecha= this.apireeService.FechaCorta();
    }else {
      this.textoDia = "Hoy";
      //this.apireeService.cambiarFecha = false;
      this.GetAPIPrecioManiana();
    }     
  }  
}
