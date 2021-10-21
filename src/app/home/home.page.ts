import {Component} from '@angular/core';
import {ApireeService} from '../apiree.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(private apireeService: ApireeService) { }


}
