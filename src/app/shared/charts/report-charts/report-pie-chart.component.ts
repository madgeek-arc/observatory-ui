import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import * as Highcharts from 'highcharts';
import { SeriesPieOptions } from 'highcharts';
import Exporting from 'highcharts/modules/exporting';
import ExportData from 'highcharts/modules/export-data';
import { HighchartsChartModule } from "highcharts-angular";


Exporting(Highcharts);
ExportData(Highcharts);

@Component({
  selector: 'app-report-pie-chart',
  standalone: true,
  imports: [
    HighchartsChartModule
  ],
  template: `<highcharts-chart [Highcharts]="Highcharts" [options]="chartOptions" style="width: 100%; display: block;"></highcharts-chart>`
})

export class ReportPieChartComponent implements OnInit, OnChanges {
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {};

  @Input() series: SeriesPieOptions[] = [];

  @Output() chartReady = new EventEmitter<Highcharts.Chart>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['series'] && this.series) {
      this.updateChartOptions();
    }
  }


  ngOnInit(): void {
    this.updateChartOptions();
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
        text: undefined
      },
      credits: {
        enabled: false
      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.y}</b> ({point.percentage:.0f}%)'
      },
      plotOptions: {
        pie: {
          innerSize: '50%',
          startAngle: 90,
          allowPointSelect: true,
          cursor: 'pointer',
          showInLegend: true,
          dataLabels: {
            enabled: true,
            format: '{point.percentage:.0f}%',
            distance: -40,
            style: {
              fontSize: '16px',
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
      series: this.series.length > 0 ? this.series : []
    };
  }
}

