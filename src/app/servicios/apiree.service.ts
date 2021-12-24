import {Injectable} from '@angular/core';
import {Observable, throwError} from 'rxjs';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {catchError} from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { ApiaverageService } from './apiaverage.service';


@Injectable({
  providedIn: 'root'
})
export class ApireeService {

  items: Observable<any>
  horas: Array<any>=[];
  fechaMostrar : any;
  cambiarFecha = false;

    //Coge la fecha y luego coge el dia, mes y año, los guarda en un String y los pasa al url para la API.
    fechaHoy = new Date();

  url="https://api.esios.ree.es/indicators/1001?&geo_ids[]=8741&&time_trunc=hour"
  
  headers={
    headers: new HttpHeaders({
      'Accept': 'application/json; application/vnd.esios-api-v1+json',
      'Content-Type': 'application/json',
      'Authorization': 'Token token=537522d6cffdf693a3d0e78afb0d5654dea5c74dfffdb194cd4f84092f710396',
    })
  };

  constructor(private httpClient: HttpClient,
              public datepipe: DatePipe,
              public apiAverage : ApiaverageService) {
    this.GetHora();
    this.obtenerFecha();
  }

  //Devuelve la fecha del dia.
  FechaCorta() :string{
    var fecha = this.obtenerFecha();
    var fecha1 =  this.fechaMostrar.toLocaleDateString('es-ES');
    return fecha1; 
  }

  obtenerFecha(): Date {
    var hora = this.datepipe.transform(this.fechaHoy,'HH:mm')
    console.log('la fecha de hoy es: ' , this.fechaHoy)
    this.fechaMostrar = new Date(); 
    console.log(this.cambiarFecha)
    if (hora >= '20:59' || this.cambiarFecha == true){
      this.fechaMostrar.setDate(this.fechaMostrar.getDate() + 1);
      this.cambiarFecha = true;
    } 
    console.log('la fecha a mostrar es: ' , this.fechaMostrar)
    return this.fechaMostrar;
  }

  //Realiza el calculo para hacer las horas del dia y las guarda en un array.
  GetHora() {

    for(let i=0; i<24; i++) {

      if(i<10) {

        this.horas.push("0"+i+":00");

      } else {
        this.horas.push(i+":00");
      }
    }
  }

  //Realiza la peticion GET al servidor API
  GetAPI(): Observable<any> {
    //Realiza el GET y asigna los valores al Observable items del Array de objetos values dentro del array Indicator.
    return this.httpClient.get(this.url, this.headers).pipe(catchError(this.ErrorHandler));
  }

  ErrorHandler(error: HttpErrorResponse) {
    return throwError(error.message||console.log('Error de Servidor'));
  }

  GetAPIDiaSiguiente(): Observable<any> {
    this.obtenerFecha();
    var fechaconsulta = this.formatearFecha(this.fechaMostrar);
    console.log("LA FECHA CONSULTAR ES: " + fechaconsulta);
    var urldiaSiguiente ="https://api.esios.ree.es/indicators/1001?start_date=" + fechaconsulta + "T00:00&end_date=" + fechaconsulta + "T23:59&geo_ids[]=8741"
    return this.httpClient.get(urldiaSiguiente, this.headers).pipe(catchError(this.ErrorHandler));

  }

  formatearFecha(fecha: Date): string {
    var fechatext = this.datepipe.transform(fecha, 'YYYY-MM-dd');
    return fechatext;
  }

}

