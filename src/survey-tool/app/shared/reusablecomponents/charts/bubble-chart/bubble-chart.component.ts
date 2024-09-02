import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import * as Highcharts from "highcharts";
import { PointOptionsObject, SeriesBubbleOptions } from "highcharts";

@Component({
  selector: "app-bubble-chart",
  template: '<highcharts-chart [Highcharts]="Highcharts" [options]="chartOptions" [callbackFunction]="chartCallback" style="width: 100%; height: 100%; display: block;"></highcharts-chart>',
})

export class BubbleChartComponent implements OnChanges {
  @Input() data: PointOptionsObject[] = [];
  @Input() series: SeriesBubbleOptions[] = [];
  @Input() enablePlotLines: boolean = false;
  @Input() enableLegend: boolean = false;
  @Input() categories: string[] = [];

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

    title: {
      text: ''
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
      // labels: {
      //   format: '{value} M'
      // },
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

    credits: {
      enabled: false
    },

    series: [{
      data: [],
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
        xAxis: {
          labels: {
            format: this.enablePlotLines ? '{value} M' : undefined
          },
          plotLines: this.enablePlotLines ? [{
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
          }] : []
        },
        yAxis: {
          categories: this.categories.length > 0 ? this.categories : undefined,
          plotLines: this.enablePlotLines ? [{
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
          }] : []
        },
        legend: {
          enabled: this.enableLegend
        },
        series: this.series as unknown as Highcharts.SeriesBubbleOptions[]
      }, true, true);
    } else {

    }
  }

  chartCallback = (chart: Highcharts.Chart) => {
    this.chart = chart;
    this.updateChart(); // Ensure the chart is updated on initialization
  };
}
