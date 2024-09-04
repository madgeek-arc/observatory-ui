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
      // zooming: {
      //   type: 'xy'
      // }
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
      pointFormat: '<tr><th colspan="2"><h4>{point.country}</h4></th></tr>' +
        '<tr><th>Investment in EOSC and OS:</th><td>{point.x}M</td></tr>' +
        '<tr><th>Investment in OA:</th><td>{point.y}M</td></tr>' +
        '<tr><th>Number of publications:</th><td>{point.z}</td></tr>',
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
      type: 'bubble',
      data: [],
      colorByPoint: true
    }] as unknown as Highcharts.SeriesBubbleOptions[]

  }
  xAverage = 0;
  yAverage = 0;

  ngOnChanges(changes: SimpleChanges) {
    if (this.enablePlotLines)
      this.calculateAverage();
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
            value: this.xAverage,
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
            value: this.yAverage,
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

  calculateAverage() {
    if (!this.series[0])
      return;

    this.series[0].data.forEach((el: {x: number, y:number}) => {
      this.xAverage += el.x;
      this.yAverage += el.y;
    });
    this.xAverage = this.xAverage/this.series[0].data.length;
    this.yAverage = this.yAverage/this.series[0].data.length;
  }

  chartCallback = (chart: Highcharts.Chart) => {
    this.chart = chart;
    this.updateChart(); // Ensure the chart is updated on initialization
  };
}
