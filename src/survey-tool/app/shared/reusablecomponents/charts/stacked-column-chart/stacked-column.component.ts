import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import * as Highcharts from "highcharts";
import { SeriesOptionsType } from "highcharts";

@Component({
  selector: "app-stacked-column",
  template: '<highcharts-chart [Highcharts]="Highcharts" [options]="chartOptions" [callbackFunction]="chartCallback" style="width: 100%; height: 100%; display: block;"></highcharts-chart>',
})

export class StackedColumnComponent implements OnChanges {

  @Input() series: any = [];
  @Input() title: string = null;
  @Input() subTitle: string = null;
  @Input() categories: string[] = [];
  @Input() xAxis: string = null;
  @Input() yAxis: string = null;
  @Input() yAxisMax: number = null;
  @Input() yAxisLabelsFormat: string = null;
  @Input() pointFormat: string = null;
  @Input() plotFormat: string = null;
  @Input() legend = null;

  Highcharts: typeof Highcharts = Highcharts;
  chart!: Highcharts.Chart;
  chartOptions: Highcharts.Options = {
    chart: {
      type: 'column'
    },
    title: {
      text: this.title
    },
    xAxis: {
      // Updated categories to include specific document types and their totals
      categories: this.categories,
      title: {
        text: this.xAxis
      }
    },
    yAxis: {
      min: 0,
      title: {
        text: this.yAxis,
        // align: 'high'
      },
      labels: {
        overflow: 'justify'
      },
      stackLabels: {
        enabled: true
      }
    },
    tooltip: {
      headerFormat: '<b>{point.x}</b><br/>',
      pointFormat: this.pointFormat
    },
    plotOptions: {
      column: {
        stacking: 'normal',
        dataLabels: {
          enabled: true,
          color: 'white'
        }
      }
    },
    legend: {
      backgroundColor: '#FFFFFF',
      reversed: true
    },
    credits: {
      enabled: false
    },
    series: []
  }



  ngOnChanges(changes: SimpleChanges) {
    // console.log(changes['data']);
    this.updateChart();
  }

  updateChart() {
    if (this.chart) {
      // console.log(this.data);
      this.chart.update({
        title: {
          text: this.title
        },
        xAxis: {
          categories: this.categories,
          title: {
            text: this.xAxis || undefined
          }
        },
        yAxis: {
          max: this.yAxisMax || undefined,
          title: {
            text: this.yAxis,
          },
          labels: {
            format: this.yAxisLabelsFormat || undefined
          }
        },
        tooltip: {
          pointFormat: this.pointFormat
        },
        plotOptions: {
          column: {
            dataLabels: {
              format: this.plotFormat || undefined
            }
          }
        },
        legend: this.legend || {},
        series: this.series as SeriesOptionsType[]
      }, true, true);
    } else {

    }
  }


  chartCallback = (chart: Highcharts.Chart) => {
    this.chart = chart;
    this.updateChart(); // Ensure the chart is updated on initialization

  }

}
