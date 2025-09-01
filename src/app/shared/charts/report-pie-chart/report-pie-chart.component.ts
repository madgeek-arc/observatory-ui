import { Component, Input, OnInit, EventEmitter, SimpleChanges, OnChanges, Output} from '@angular/core';
import * as Highcharts from 'highcharts';
import Exporting from 'highcharts/modules/exporting';
import ExportData from 'highcharts/modules/export-data';
import { SeriesPieOptions } from 'highcharts';


Exporting(Highcharts);
ExportData(Highcharts);

@Component({
  selector: 'app-report-pie-chart',
  templateUrl: './report-pie-chart.component.html',
  styleUrls: ['./report-pie-chart.component.less']
})
export class ReportPieChartComponent implements OnInit, OnChanges {
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {};

  @Input() series: SeriesPieOptions[] = [];

  @Output() chartReady = new EventEmitter<Highcharts.Chart>();

  ngOnChanges(changes: SimpleChanges): void {
  if (changes['series'] && this.series) {
    this.updateChartOptions(); // Αν αλλάξουν τα series, ενημέρωσε το γράφημα
    console.log('Series updated:', this.series);
  }
}


  ngOnInit(): void {
    this.updateChartOptions(); // Αρχική ενημέρωση κατά την εκκίνηση του component
  }

  updateChartOptions() {
    const that = this;
     this.chartOptions = {
      chart: {
        type: 'pie',
       events: {
                 load(this: Highcharts.Chart) {
                   // `this` is already typed as the Chart instance
                   that.chartReady.emit(this);
                 }
               }
      },
      title: {
        text: 'Monitoring'
      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.y}</b> ({point.percentage:.0f}%)'
      },
      plotOptions: {
        pie: {
          innerSize: '60%',
          allowPointSelect: true,
          cursor: 'pointer',
          showInLegend: true,
          dataLabels: {
            enabled: true,
            format: '{point.y}<br>{point.percentage:.0f}%',
            distance: -30,
            style: {
              fontWeight: 'bold',
              color: 'white'
            }
          }
        }
      },
      legend: {
        enabled: true,
        align: 'center',
        verticalAlign: 'bottom'
      },
      // Χρήση των δεδομένων από το @Input ή κενό array
      series: this.series.length > 0 ? this.series : []
    };
  }
  }

