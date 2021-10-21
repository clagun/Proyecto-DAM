import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-listado',
  templateUrl: './listado.page.html',
  styleUrls: ['./listado.page.scss'],
})
export class ListadoPage implements OnInit {

  constructor() { }

  GetClass(p: number, pMax: number, pMin: number) {
    let porcentage: Number;
    porcentage=(p-pMin)*100/(pMax-pMin);
    if(porcentage>75)
      return 'rojo';
    else if(porcentage>25)
      return 'amarillo';
    else
      return 'verde';
  }

  ngOnInit() {
  }

}
