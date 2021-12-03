import {Injectable} from '@angular/core';
import {Observable, throwError} from 'rxjs';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {catchError} from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class ApireeService {

  items: Observable<any>
  horas: Array<any>=[];

    //Coge la fecha y luego coge el dia, mes y año, los guarda en un String y los pasa al url para la API.
    fechaHoy = new Date();
    dia = this.fechaHoy.getDate();
    mes = this.fechaHoy.getMonth() + 1;
    anio = this.fechaHoy.getFullYear();
    fechaManianaAPI = this.anio + "-" + this.mes + "-" + (this.dia + 1);

  url="https://api.esios.ree.es/indicators/1001?&geo_ids[]=8741&&time_trunc=hour"
  urldiaSiguiente ="https://api.esios.ree.es/indicators/1001?start_date=" + this.fechaManianaAPI + "T00:00&end_date=" + this.fechaManianaAPI + "T23:59&geo_ids[]=8741"

  headers={
    headers: new HttpHeaders({
      'Accept': 'application/json; application/vnd.esios-api-v1+json',
      'Content-Type': 'application/json',
      'Authorization': 'Token token=537522d6cffdf693a3d0e78afb0d5654dea5c74dfffdb194cd4f84092f710396',
    })
  };

  constructor(private httpClient: HttpClient) {
    this.GetHora()
  }

  //Devuelve la fecha del dia.
  FechaCorta() :string{

    var fecha = new Date().toLocaleDateString()
    
    return fecha
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

    return this.httpClient.get(this.urldiaSiguiente, this.headers).pipe(catchError(this.ErrorHandler));

  }

}

