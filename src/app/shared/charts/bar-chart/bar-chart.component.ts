import { Component, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { LegendOptions, SeriesOptionsType } from "highcharts";
import * as Highcharts from "highcharts";
import {colors} from "../../../domain/chart-color-palette";
import {renderLogo} from "../highcharts-functions";


@Component({
  selector: 'app-multi-bar-chart',
  template: '<highcharts-chart [Highcharts]="Highcharts" [options]="chartOptions" [callbackFunction]="chartCallback" style="width: 100%; height: 100%; display: block;"></highcharts-chart>',
})

export class BarChartComponent implements OnInit, OnChanges {
  @Input() series: SeriesOptionsType[] = [];
  @Input() categories: string[] = [];
  @Input() titles = {title: '', xAxis: '', yAxis: ''};
  @Input() stacking?: Highcharts.OptionsStackingValue;
  @Input() legendOptions?: LegendOptions = {};
  @Input() borderRadius?: (number | string | Highcharts.BorderRadiusOptionsObject) = undefined;
  @Input() pointWidth?: number = undefined;
  @Input() valueSuffix?: string = undefined;
  @Input() customTooltip?: boolean = false;
  @Input() tooltip?: string;
  @Input() dataLabelFormat?: string;
  @Input() yAxisLabels?: boolean = true;
  @Input() duplicateXAxis?: boolean = false;
  @Input() caption?: string;
  @Input() height?: number = 400;


  Highcharts: typeof Highcharts = Highcharts;
  chart!: Highcharts.Chart;
  chartOptions: Highcharts.Options = {
    chart: {
      type: 'bar',
      height: this.height,
      spacingBottom: 50
    },
    title: {
      text: this.titles.title,
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
    xAxis: {
      categories: this.categories,
      title: {
        text: this.titles.xAxis
      },
      gridLineWidth: 1,
      lineWidth: 0
    },
    yAxis: {
      // min: 0,
      title: {
        text: this.titles.yAxis,
        align: 'high'
      },
      labels: {
        overflow: 'justify'
      },
      gridLineWidth: 0
    },
    tooltip: {
      valueSuffix: this.valueSuffix,
    },
    plotOptions: {
      bar: {
        borderRadius: this.borderRadius,
        dataLabels: {
          enabled: true,
        },
        groupPadding: 0.1
      },
      series: {
        stacking: this.stacking
      },
    },
    legend: this.legendOptions,
    credits: {
      enabled: false
    },
    series: []
  }

  ngOnInit() {
    (Highcharts as any).Templating = (Highcharts as any).Templating || {};
    (Highcharts as any).Templating.helpers = (Highcharts as any).Templating.helpers || {};
    (Highcharts as any).Templating.helpers.abs = (value: number) => Math.abs(value);

    Highcharts.setOptions({
      lang: {
        thousandsSep: '.'
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    this.updateChart();
  }

  updateChart() {
    const that = this;
    if (this.chart) {
      this.chart.update({
        colors: colors ?? Highcharts.getOptions().colors,
        chart: {
          type: 'bar',
          height: this.height,
          spacingBottom: 50,
          events: {
            load: function () {
              renderLogo(this.renderer, this.chartWidth, this.chartHeight);
            }
          }
        },
        title: {
          text: this.titles.title
        },
        caption: {
          text: this.caption,
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
        xAxis: [{
          type: 'category',
          categories: this.categories,

          title: {
            text: this.titles.xAxis
          }
        },
          this.duplicateXAxis ? {
            // mirror axis on right side
            opposite: true,
            type: 'category',
            categories: this.categories,
            linkedTo: 0,
            lineWidth: 0
          } : {
            showEmpty: false
          }
        ],
        yAxis: {
          title: {
            text: this.titles.yAxis,
          },
          labels: {
            enabled: this.yAxisLabels,
            // format: this.dataLabelFormat,
            formatter: function () {
              if (that.duplicateXAxis) {
                const val = Math.abs(this.value as number);
                // Divide by x and remove any trailing .0
                if (val >= 1000000) {
                  return (val / 1000000).toFixed(1).replace(/\.0$/, '').toString() + 'M';
                } else if (val >= 1000) {
                  return `${(val / 1000).toFixed(1).replace(/\.0$/, '')}` + 'k';
                }
                return val.toString();
              }
              return this.value.toString();
            }
          }
        },
        tooltip: {
          valueSuffix: this.valueSuffix,
          // pointFormat: '{series.name}: {point.y}',
          format: this.tooltip,
          headerFormat: this.customTooltip ? '<b>{series.name}</b><br>' : undefined,
          pointFormatter: this.customTooltip ? function () {
            return   'Countries: ' + this.series.userOptions.custom;
          } : undefined
        },
        plotOptions: {
          bar: {
            borderRadius: this.borderRadius,
            pointWidth: this.pointWidth,
            dataLabels: {
              enabled: true,
              formatter: function () {
                if (that.duplicateXAxis)
                  return `${Highcharts.numberFormat(Math.abs(this.point.y), 0)}`

                if (that.valueSuffix)
                  return this.point.y + that.valueSuffix ?? '';

                return this.point.y
              },
            },
            groupPadding: 0.1
          },
          series: {
            stacking: this.stacking
          },
        },
        legend: this.legendOptions,
        series: this.series
      }, true, true, true);
    } else {

    }
  }


  chartCallback = (chart: Highcharts.Chart) => {
    this.chart = chart;
    this.updateChart(); // Ensure the chart is updated on initialization

  };

}
