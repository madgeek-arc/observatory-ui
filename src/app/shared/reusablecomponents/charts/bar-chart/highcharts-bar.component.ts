import {AfterViewInit, Component, Input} from "@angular/core";
import * as Highcharts from "highcharts";
import HC_exporting from 'highcharts/modules/exporting';
import HC_ExportingOffline from 'highcharts/modules/offline-exporting';
import {SeriesMapDataOptions} from "highcharts/highmaps";

HC_exporting(Highcharts);
HC_ExportingOffline(Highcharts);

@Component({
  selector: 'app-bar-chart',
  templateUrl: './highcharts-bar.component.html'
})

export class HighchartsBarComponent implements AfterViewInit{

  @Input() mapData: (number | SeriesMapDataOptions | [string, number])[] = [];
  @Input() title: string = null;

  public ngAfterViewInit(): void {
    this.createChartBar();
  }

  private createChartBar(): void {

    const chart = Highcharts.chart('chart-bar' as any, {
      chart: {
        type: 'bar',
      },
      title: {
        text: 'Bar Chart',
      },
      credits: {
        enabled: false,
      },
      legend: {
        enabled: false,
      },
      yAxis: {
        min: 0,
        title: undefined,
      },
      xAxis: {
        type: 'category',
      },
      tooltip: {
        headerFormat: `<div>Country: {point.key}</div>`,
        pointFormat: `<div>{series.name}: {point.y}</div>`,
        shared: true,
        useHTML: true,
      },
      plotOptions: {
        bar: {
          dataLabels: {
            enabled: true,
          },
        },
      },
      series: [{
        name: 'Amount in millions',
        data: [
          ['gr', 30],
          ['tr', 50],
          ['cy', 40],
          ['sp', 80]
        ],
      }],
    } as any);
  }

}
