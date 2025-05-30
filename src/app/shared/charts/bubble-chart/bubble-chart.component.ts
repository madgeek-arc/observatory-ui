import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import * as Highcharts from "highcharts";
import { PointOptionsObject, SeriesBubbleOptions } from "highcharts";
import { renderLogo } from "../highcharts-functions";
import { colors } from "../../../domain/chart-color-palette";

@Component({
  selector: 'app-bubble-chart',
  template: '<highcharts-chart [Highcharts]="Highcharts" [options]="chartOptions" [callbackFunction]="chartCallback" style="width: 100%; height: 100%; display: block;"></highcharts-chart>',
})

export class BubbleChartComponent implements OnChanges {
  @Input() data: PointOptionsObject[] = [];
  @Input() series: SeriesBubbleOptions[] = [];
  @Input() title: string = null;
  @Input() subTitle: string = null;
  @Input() xAxisTitle: string = '';
  @Input() yAxisTitle: string = '';
  @Input() toolTip = {};
  @Input() enablePlotLines: boolean = false;
  @Input() enableLegend: boolean = false;
  @Input() categories: string[] = [];
  @Input() caption?: string;
  @Input() height?: number = 400;

  Highcharts: typeof Highcharts = Highcharts;
  chart!: Highcharts.Chart;
  chartOptions: Highcharts.Options = {
    colors: colors ?? Highcharts.getOptions().colors,

    chart: {
      type: 'bubble',
      plotBorderWidth: 1,
      height: this.height,
      // zooming: {
      //   type: 'xy'
      // }
    },

    title: {
      text: this.title,
      style: {
        fontSize: '26px',
        fontWeight: '600'
      },
      align: 'left',
      margin: 40
    },
    caption: {
      text: this.caption,
      useHTML: true
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
        text: this.xAxisTitle
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
        text: this.yAxisTitle
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

    tooltip: {},

    plotOptions: {
      series: {
        dataLabels: {
          enabled: true,
          format: '{point.name}'
        },
        events: {
          click: (event) => {
            console.log(event.point.name);
          }
        }
      }
    },

    credits: {
      enabled: false
    },

    series: [{
      type: 'bubble',
      data: [],
      // colorByPoint: true
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
        chart: {
          type: 'bubble',
          plotBorderWidth: 1,
          height: this.height,
          spacingBottom: 50,
          events: {
            load: function () {
              renderLogo(this.renderer, this.chartWidth, this.chartHeight);
            }
          }
        },
        title: {
          text: this.title,
          style: {
            fontSize: '26px',
            fontWeight: '600'
          },
          align: 'left',
          margin: 40
        },
        caption: {
          text: this.caption,
          useHTML: true
        },
        exporting: {
          sourceWidth: 1000,
          sourceHeight: this.height,
          // chartOptions: {
          //   chart: {
          //     margin: 100 // Increased margin ONLY for export
          //   },
          //   // title: {
          //   //   margin: 40 // Extra space below title when exporting
          //   // }
          // }
        },
        xAxis: {
          title: {
            text: this.xAxisTitle
          },
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
          type: this.categories.length > 0 ? 'linear' : 'logarithmic',
          categories: this.categories.length > 0 ? this.categories : undefined,
          title: {
            text: this.yAxisTitle
          },
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
        tooltip: this.toolTip,
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
