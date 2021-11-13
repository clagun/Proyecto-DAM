import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AlertController, NavController, ToastController } from '@ionic/angular';
import { map } from 'rxjs/operators';
import { Electromestico, StorageService } from '../servicios/storage.service';

@Component({
  selector: 'app-configuracion',
  templateUrl: './configuracion.page.html',
  styleUrls: ['./configuracion.page.scss'],
})
export class ConfiguracionPage implements OnInit {

  electrodomesticosJson: any[];
  itemSeleccionado: any;

  electrodomesticos: Electromestico[] = [];

  nuevoElectrodomestico: Electromestico = <Electromestico>{};

  formulario;

  constructor(private http: HttpClient, private nav: NavController, private form: FormBuilder, private storage: StorageService, private toastController: ToastController, private alertController: AlertController) {
    //formulario para que el usuario pueda guardar la opción de nuevo electrodoméstico
    this.formulario = this.form.group({
      'nombre': ["",Validators.compose([Validators.maxLength(25),Validators.pattern(""), Validators.minLength(1), Validators.required])],
      'consumo':["",Validators.compose([Validators.minLength(1), Validators.required])],
      'editable':[true],
    });//items de los usuarios almacenados en el storage
      this.cargarItems();  
   }

   //Realiza la subscripción, se guarda los valores obtenidos de la lista del Json en una variable
  ngOnInit() {
    this.getJsonData().subscribe(data =>{
      this.electrodomesticosJson = data;
    });
  }

  //se mapea los datos y devuelve el contenido obtenido del json
  getJsonData(){
    return this.http.
    get("assets/database/db.json").
    pipe(
      map((respuesta:any) => {
        return respuesta.data;
      })
      )
  }

  //guarda en el local storage los datos de la opción seleccionada de la lista 
  guardarOpcionConfig(){
    //si se ha elegido una opción, se guarda los valores y se vuelve a la página home
    if(this.itemSeleccionado != null) {
      localStorage.setItem('data', JSON.stringify(this.itemSeleccionado));
      this.nav.navigateRoot('home');
    } //si no se elige ninguna opción sale una alerta
    else  {
      this.alerta('Elige un electrodoméstico de la lista');
    }
  } 

  //se obtienen los electrodomésticos del storage
  cargarItems(){
    this.storage.getItems().then((items) =>{
      this.electrodomesticos = items;
    });
  }

  //elimina un electrodoméstico de la lista (solo los introducidos por los usuarios)
  eliminarElectro(){
    if(this.itemSeleccionado != null)
    //los electrodomésticos de los usuarios del Json están en false
      if(this.itemSeleccionado.editable != false) {
        this.storage.eliminarItem(this.itemSeleccionado.id).then(item => {
          this.toast('Electrodoméstico eliminado');
          this.cargarItems();
          this.itemSeleccionado = null;
        });
      }
      else {
        this.alerta('No se puede eliminar este electrodoméstico.');
    }
  }

  //se le pasa un value (de los datos del formulario) y se añade al storage
  guardarElectro(value){
    this.nuevoElectrodomestico = value;
    this.nuevoElectrodomestico.id = Date.now(); this.nuevoElectrodomestico.editable = true;
    this.storage.addItem(this.nuevoElectrodomestico).then(item => {
      this.toast('Electrodoméstico añadido');
      this.cargarItems();
     });
     //se resetea los datos del formulario
    this.formulario.reset();
  }

 //crea una notificación toast
  async toast(msg){
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000
    });
    toast.present();
  }

  //crea una notificación alert
  async alerta(msg) {
    const alert = await this.alertController.create({
      message: msg,
      buttons: ['Aceptar']
    });
    alert.present();
  }
}
