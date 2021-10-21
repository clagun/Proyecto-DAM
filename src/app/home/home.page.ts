import {Component} from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

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
