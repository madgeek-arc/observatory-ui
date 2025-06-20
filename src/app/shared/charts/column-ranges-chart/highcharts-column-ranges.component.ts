import {Component, Input, OnChanges, SimpleChanges} from "@angular/core";
import * as Highcharts from "highcharts";
import HC_exporting from 'highcharts/modules/exporting';
import HC_ExportingOffline from 'highcharts/modules/offline-exporting';
import ExportData from 'highcharts/modules/export-data';

HC_exporting(Highcharts);
HC_ExportingOffline(Highcharts);
ExportData(Highcharts);

@Component({
  selector: 'app-column-ranges-chart',
  template: '<div *ngIf="chartId" [id]="chartId" class="container"></div>',
  styles: [`.container {display: block; width: 100%; height: 100%; }`]
})

export class HighchartsColumnRangesComponent implements OnChanges {


  @Input() chartId: string = null;
  @Input() series: any = [];
  @Input() title: string = null;
  @Input() subTitle: string = null;
  // @Input() subTitle: string = null;

  backgroundColor: string = '#F3F4F5';
  chartOptions: Highcharts.Options = {}
  stackedColumns: Highcharts.Chart;


  ngOnChanges(changes: SimpleChanges) {
    if (this.series?.length > 0 && this.chartId !== null) {
      setTimeout(() => {
        this.initializeOptions();
        this.createChart();
      }, 0);
    }
  }

  private initializeOptions(): void {

    this.chartOptions = {
      chart: {
        type: 'column',
        backgroundColor: this.backgroundColor
      },
      title: {
        text: this.title
      },
      subtitle: {
        text: this.subTitle
      },
      legend: {
        enabled: false
      },
      // xAxis: {
      //   categories: ['<1 M', '1-5 M', '5-10 M', '10-20 M', '>20 M']
      // },
      xAxis: {
        type: 'category'
      },
      yAxis: {
        visible: false
      },
      plotOptions: {
        column: {
          stacking: 'normal',
          dataLabels: {
            // useHTML: true,
            enabled: true,
            inside: true,
            align: 'center',
            verticalAlign: 'middle',
            style: {
              fontWeight: 'bold',
              whiteSpace: 'normal',
              // textOverflow: 'wrap',
            },
            formatter: function() {
              // return '<span style=" white-space: normal">'+this.series.name+'</span>'
              return this.series.name;
            }
            // formatter: function() {
            //   // return this.series.name;
            //   return 'Large text with many spaces';
            // }
          }
        }
      },
      series: this.series
    }
  }

  createChart() {
    this.stackedColumns = Highcharts.chart(this.chartId, this.chartOptions);
  }

}
