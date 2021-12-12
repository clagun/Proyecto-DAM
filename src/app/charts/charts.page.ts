import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { Observable } from 'rxjs';
import { ApiaverageService } from '../servicios/apiaverage.service';
import { DatePipe } from '@angular/common'



@Component({
  selector: 'app-charts',
  templateUrl: './charts.page.html',
  styleUrls: ['./charts.page.scss'],
})
export class ChartsPage implements AfterViewInit {
  @ViewChild('barCanvas') private barCanvas: ElementRef;
  @ViewChild('lineCanvas') private lineCanvas: ElementRef;

  barChart: any;
  lineChart: any;
  valorMedio: Observable<any>;
  preciopromedioDiario: Array<any> = [];
  fechasDatos: Array<any> = [];

  constructor(private apiaverage: ApiaverageService, public datepipe: DatePipe) {
    Chart.register(...registerables);

  }

  ngAfterViewInit() {
    //this.barChartMethod();
    this.GetPrecioMedio();
    this.lineChartMethod();
  }

  GetPrecioMedio() {
    this.apiaverage.GetAPI().subscribe(data => {
      this.valorMedio = data.indicator.values;

      for (let i = 0; i < data.indicator.values.length; i++) {
        this.preciopromedioDiario.push(data.indicator.values[i].value);
        var fecha = this.formatearFecha(data.indicator.values[i].datetime);
        this.fechasDatos.push(fecha);
      }
    })
  }

  formatearFecha(fecha: Date): string {
    var fechatext = this.datepipe.transform(fecha, 'YYYY-MM-dd');
    return fechatext;
  }

  lineChartMethod() {
    this.lineChart = new Chart(this.lineCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: this.fechasDatos,
        datasets: [
          {
            label: '€/MWh',
            fill: false,
            backgroundColor: 'rgba(75,192,192,0.4)',
            borderColor: 'rgba(75,192,192,1)',
            borderCapStyle: 'butt',
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: 'miter',
            pointBorderColor: 'rgba(75,192,192,1)',
            pointBackgroundColor: '#fff',
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: 'rgba(75,192,192,1)',
            pointHoverBorderColor: 'rgba(220,220,220,1)',
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
            data: this.preciopromedioDiario,
            spanGaps: false,
          }
        ]
      }
    });
  }
}