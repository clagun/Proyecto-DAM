import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { DatePipe } from '@angular/common'

@Injectable({
  providedIn: 'root'
})
export class ApiaverageService {

  items: Observable<any>
  fechaHoy: any;
  ultimaFecha: any;
  fecharequest: any;

  headers = {
    headers: new HttpHeaders({
      'Accept': 'application/json; application/vnd.esios-api-v1+json',
      'Content-Type': 'application/json',
      'Authorization': 'Token token=537522d6cffdf693a3d0e78afb0d5654dea5c74dfffdb194cd4f84092f710396',
    })
  };

  constructor(private httpClient: HttpClient,
    public datepipe: DatePipe) {
    this.fechaHoy = this.formatearFecha(new Date());
    this.restDays(30);
  }



  restDays(days: number): Date {
    this.ultimaFecha = new Date();
    this.ultimaFecha.setDate(this.ultimaFecha.getDate() - days);
    this.fecharequest = this.formatearFecha(this.ultimaFecha);
    return this.fecharequest;
  }

  fechaString(): string {

    var fecha = this.ultimaFecha.toLocaleDateString('es-ES')
    return fecha;
  }

  //Realiza la peticion GET al servidor API
  GetAPI(): Observable<any> {
    //Realiza el GET y asigna los valores al Observable items del Array de objetos values dentro del array Indicator.

    //https://api.esios.ree.es/indicators/59526?start_date=2021-12-03T00%3A00%3A00Z&end_date=2021-12-10T07%3A34%3A17Z
    var url = "https://api.esios.ree.es/indicators/1001?&geo_ids[]=8741&&time_trunc=day&&start_date=" + this.fecharequest + "&&end_date=" + this.fechaHoy + "&&time_agg=avg"
    return this.httpClient.get(url, this.headers).pipe(catchError(this.ErrorHandler));
    //return this.httpClient.get(this.url, this.headers).pipe(catchError(this.ErrorHandler));
  }

  ErrorHandler(error: HttpErrorResponse) {
    return throwError(error.message || console.log('Error de Servidor'));
  }

  formatearFecha(fecha: Date): string {
    var fechatext = this.datepipe.transform(fecha, 'YYYY-MM-dd') + 'T00%3A00%3A00Z';
    return fechatext;
  }
}


