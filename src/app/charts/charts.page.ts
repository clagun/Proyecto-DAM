import {Component, OnInit, ViewChild, ElementRef, AfterViewInit, } from '@angular/core';
import {Chart, registerables} from 'chart.js';
import {Observable} from 'rxjs';
import {ApiaverageService} from '../servicios/apiaverage.service';
import {DatePipe} from '@angular/common'



@Component({
  selector: 'app-charts',
  templateUrl: './charts.page.html',
  styleUrls: ['./charts.page.scss'],
})
export class ChartsPage {
  @ViewChild('lineCanvas') private lineCanvas: ElementRef;

  lineChart: any;
  valorMedio: Observable<any>;
  preciopromedioDiario: Array<any>=[];
  fechasDatos: Array<any>=[];

  constructor(private apiaverage: ApiaverageService, public datepipe: DatePipe) {
    Chart.register(...registerables);

  }

  ionViewWillEnter() {
    this.GetPrecioMedio();
  }

  GetPrecioMedio() {
    this.preciopromedioDiario=[];
    this.fechasDatos=[];
    this.apiaverage.GetAPI().subscribe(data => {
      console.log(data.indicator.values);
      for(let i=0; i<data.indicator.values.length; i++) {
        this.preciopromedioDiario.push(data.indicator.values[i].value);
        var fecha=this.formatearFecha(data.indicator.values[i].datetime);
        this.fechasDatos.push(fecha);
      }
      this.lineChartMethod();
    })
  }

  formatearFecha(fecha: Date): string {
    var fechatext=this.datepipe.transform(fecha, 'MM-dd');
    return fechatext;
  }

  lineChartMethod() {
    let ctx=this.lineCanvas.nativeElement;
    ctx.height='20vh';
    if(this.lineChart) {
      this.lineChart.destroy();
    }
    this.lineChart=new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.fechasDatos,
        datasets: [
          {
            label: '€/MWh',
            backgroundColor: '#ffffff',
            borderColor: '#4caf50',
            borderCapStyle: 'butt',
            pointBorderColor: '#4caf50',
            pointBackgroundColor: '#fff',
            pointBorderWidth: 2,
            pointHoverRadius: 5,
            pointRadius: 3,
            pointHitRadius: 10,
            data: this.preciopromedioDiario,
          },
        ]
      },
      options: {
        color: '#333',
        scales: {
          y: {
            min: 0,
            suggestedMax: 500,
            ticks: {
              color: '#333',
            },
            grid: {
              borderColor: '#333',
              color: '#333',
              borderWidth: 0.2,
              lineWidth: 0.1
            }
          },
          x: {
            ticks: {
              color: '#333',
            },
            grid: {
              borderColor: '#333',
              color: '#333',
              borderWidth: 0.2,
              lineWidth: 0.1
            }
          }
        }
      },

    });
  }
}