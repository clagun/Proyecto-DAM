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

  itemSelecConfig: any;
  itemSelecEliminar: any;

  electrodomesticosJson: Electromestico[];
  electrodomesticos: Electromestico[] = [];
  nuevoElectrodomestico: Electromestico = <Electromestico>{};

  formulario;

  constructor(private http: HttpClient, private nav: NavController, private form: FormBuilder, private storage: StorageService, private toastController: ToastController, private alertController: AlertController) {
    //formulario para que el usuario pueda guardar la opción de nuevo electrodoméstico
    this.formulario = this.form.group({
      'nombre': ["",Validators.compose([Validators.maxLength(25),Validators.pattern(""), Validators.minLength(1), Validators.required])],
      'consumo':["",Validators.compose([Validators.minLength(1), Validators.required])]
    });//items de los usuarios almacenados en el storage
      this.cargarItems();  
   }

   //Si el storage no está creado (false), se realiza la subscripción y se guarda los valores obtenidos de la lista del Json 
   ngOnInit() {
    this.storage.comprobarStorage().then(() => {
      if(!this.storage.storageCreado) {
        this.getJsonData().subscribe(data =>{
          this.electrodomesticosJson = data;
          this.guardarElectroJson();
        });
      }
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

  //se añaden los electrodomésticos del json al storage y se cargan todos los items
  guardarElectroJson(){
    this.storage.addItemsJson(this.electrodomesticosJson).then(item => {
     this.cargarItems();
    });
  }

  //guarda en el local storage los datos de la opción seleccionada de la lista 
  guardarOpcionConfig(){
    //Se guarda los valores y se vuelve a la página home
      localStorage.setItem('data', JSON.stringify(this.itemSelecConfig));
      this.nav.navigateRoot('home');
  } 

  //se obtienen los electrodomésticos del storage
  cargarItems(){
    this.storage.getItems().then((items) =>{
      this.electrodomesticos = items;
    });
  }

  //elimina un electrodoméstico de la lista 
  eliminarElectro(){
        this.storage.eliminarItem(this.itemSelecEliminar.id).then(item => {
          this.toast('Electrodoméstico eliminado');
          this.cargarItems();
        }); 
        //borra el localstorage si coincide con el electrodoméstico eliminado 
       let electroLocalStorage =  JSON.parse(localStorage.getItem('data'));
       if(electroLocalStorage != null)
       if(electroLocalStorage.id === this.itemSelecEliminar.id) localStorage.removeItem('data');       
  }

  //se le pasa un value (de los datos del formulario) y se añade al storage
  guardarElectro(value){
    this.nuevoElectrodomestico = value;
    this.nuevoElectrodomestico.id = Date.now();
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
