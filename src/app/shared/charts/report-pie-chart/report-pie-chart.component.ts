import { Component, OnInit } from '@angular/core';
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
export class ReportPieChartComponent implements OnInit {
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {};

  ngOnInit(): void {
    this.chartOptions = {
      chart: {
        type: 'pie'
      },
      title: {
        text: 'My first HighChart'
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
      series:  <SeriesPieOptions[]> [{
        name: 'Monitoring',
        type: 'pie',
        data: [
          {
            name: 'Has monitoring',
            y: 12,
            color: '#137CBD'
          },
          {
            name: 'Does not have monitoring',
            y: 88,
            color: '#EC7A1C'
          }
        ]
      }] 
    };
  }
}
