import { Injectable} from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import { catchError } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class ApireeService {

  items: Observable<any>
  horas: Array<any> = [];
  
  url = "https://api.esios.ree.es/indicators/1001?&geo_ids[]=8741&&time_trunc=hour"

  headers = {
    headers: new HttpHeaders({'Accept': 'application/json; application/vnd.esios-api-v1+json',
                              'Content-Type': 'application/json',
                              'Authorization': 'Token token=537522d6cffdf693a3d0e78afb0d5654dea5c74dfffdb194cd4f84092f710396',
                              })
  };

  constructor(private httpClient: HttpClient) { 
    this.GetHora()
  }

  //Devuelve la fecha del dia.
  FechaCorta(): string {
    //Coge la fecha actual, quita el tiempo y devuelve la fecha solo.
    var fechaHora = new Date().toLocaleString();
    var fechaSolo = fechaHora.split(" ")[0];
    return fechaSolo;
  }

  //Realiza el calculo para hacer las horas del dia y las guarda en un array.
  GetHora() {

    for(let i = 0; i < 24; i++) {

      if(i < 10) {

        this.horas.push("0" + i + ":00");

      } else {
        this.horas.push(i + ":00");
      }
    }
  }
  
  //Realiza la peticion GET al servidor API
  GetAPI(): Observable<any> {
    //Realiza el GET y asigna los valores al Observable items del Array de objetos values dentro del array Indicator.
    return this.httpClient.get(this.url, this.headers).pipe(catchError(this.ErrorHandler));
    }

    ErrorHandler(error: HttpErrorResponse) {
      return throwError(error.message || console.log('Error de Servidor'));
    }

  }

