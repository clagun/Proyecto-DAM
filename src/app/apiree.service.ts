import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApireeService {

  constructor() { }

  FechaCorta(fecha: string): string {
    var d=new Date(fecha);
    return d.toLocaleDateString();
  }

  AnadirCero(i: number): string {
    var x;
    if(i<10) {
      x="0"+i;
    }
    else {
      x=i;
    }
    return x;
  }

  GetHora(fecha: string): string {
    var d=new Date(fecha);
    var x=this.AnadirCero(d.getHours())+':'+this.AnadirCero(d.getMinutes())
    return x;
  }
}
