import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import * as Highcharts from "highcharts";
import { PointOptionsObject, SeriesOptionsType } from "highcharts";

@Component({
  selector: "app-bubble-chart",
  template: '<highcharts-chart [Highcharts]="Highcharts" [options]="chartOptions" [callbackFunction]="chartCallback" style="width: 100%; height: 100%; display: block;"></highcharts-chart>',
})

export class BubbleChartComponent implements OnChanges {
  @Input() data: PointOptionsObject[] = []

  Highcharts: typeof Highcharts = Highcharts;
  chart!: Highcharts.Chart;
  chartOptions: Highcharts.Options = {

    chart: {
      type: 'bubble',
      plotBorderWidth: 1,
      zooming: {
        type: 'xy'
      }
    },

    legend: {
      enabled: false
    },


    accessibility: {
      point: {
        valueDescriptionFormat: '{index}. {point.name}, fat: {point.x}g, ' +
          'sugar: {point.y}g, obesity: {point.z}%.'
      }
    },

    xAxis: {
      gridLineWidth: 1,
      title: {
        text: 'Total Investments in EOSC and OS'
      },
      labels: {
        format: '{value} M'
      },
      plotLines: [{
        color: 'black',
        dashStyle: 'Dot',
        width: 2,
        value: 65,
        label: {
          rotation: 0,
          y: 15,
          style: {
            fontStyle: 'italic'
          },
          text: 'Averege Investments in EOSC and OS'
        },
        zIndex: 3
      }],
      accessibility: {
        rangeDescription: 'Avarage investment in EOSC and OS'
      }
    },

    yAxis: {
      startOnTick: false,
      endOnTick: false,
      title: {
        text: 'Total Investments in OA'
      },
      labels: {
        format: '{value} M'
      },
      maxPadding: 0.2,
      plotLines: [{
        color: 'black',
        dashStyle: 'Dot',
        width: 2,
        value: 50,
        label: {
          align: 'right',
          style: {
            fontStyle: 'italic'
          },
          text: 'Average Investments in OA',
          x: -10
        },
        zIndex: 3
      }],
      accessibility: {
        rangeDescription: 'Total Investments in OA'
      }
    },

    tooltip: {
      useHTML: true,
      headerFormat: '<table>',
      pointFormat: '<tr><th colspan="2"><h3>{point.country}</h3></th></tr>' +
        '<tr><th>Fat intake:</th><td>{point.x}g</td></tr>' +
        '<tr><th>Sugar intake:</th><td>{point.y}g</td></tr>' +
        '<tr><th>Obesity (adults):</th><td>{point.z}%</td></tr>',
      footerFormat: '</table>',
      followPointer: true
    },

    plotOptions: {
      series: {
        dataLabels: {
          enabled: true,
          format: '{point.name}'
        }
      }
    },

    series: [{
      data: this.data,
      colorByPoint: true
    }] as unknown as Highcharts.SeriesBubbleOptions[]

  }

  ngOnChanges(changes: SimpleChanges) {
    this.updateChart();
  }

  updateChart() {
    if (this.chart) {
      // console.log(this.data);
      this.chart.update({
        series: [{
          data: [
            { x: 95, y: 95, z: 13.8, name: 'BE', country: 'Belgium' },
            { x: 86.5, y: 102.9, z: 14.7, name: 'DE', country: 'Germany' },
            { x: 80.8, y: 91.5, z: 15.8, name: 'FI', country: 'Finland' },
            { x: 80.4, y: 102.5, z: 12, name: 'NL', country: 'Netherlands' },
            { x: 80.3, y: 86.1, z: 11.8, name: 'SE', country: 'Sweden' },
            { x: 78.4, y: 70.1, z: 16.6, name: 'ES', country: 'Spain' },
            { x: 74.2, y: 68.5, z: 14.5, name: 'FR', country: 'France' },
            { x: 73.5, y: 83.1, z: 10, name: 'NO', country: 'Norway' },
            { x: 71, y: 93.2, z: 24.7, name: 'UK', country: 'United Kingdom' },
            { x: 69.2, y: 57.6, z: 10.4, name: 'IT', country: 'Italy' },
            { x: 68.6, y: 20, z: 16, name: 'RU', country: 'Russia' },
            { x: 65.5, y: 126.4, z: 35.3, name: 'US', country: 'United States'},
            { x: 65.4, y: 50.8, z: 28.5, name: 'HU', country: 'Hungary' },
            { x: 63.4, y: 51.8, z: 15.4, name: 'PT', country: 'Portugal' },
            { x: 64, y: 82.9, z: 31.3, name: 'NZ', country: 'New Zealand' }
          ]
        }] as unknown as Highcharts.SeriesBubbleOptions[]
      }, true, true);
    } else {

    }
  }

  chartCallback = (chart: Highcharts.Chart) => {
    this.chart = chart;
    this.updateChart(); // Ensure the chart is updated on initialization
  };
}
