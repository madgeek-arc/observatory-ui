import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from "@angular/core";
import * as Highcharts from 'highcharts';
import { HighchartsChartModule } from "highcharts-angular";

@Component({
  standalone: true,
  selector: 'bar-columns-chart',
  template: `
    <highcharts-chart [Highcharts]="Highcharts" [options]="chartOptions" style="width: 100%; display: block;"></highcharts-chart>`,
  imports: [
    HighchartsChartModule
  ]
})

export class BarColumnsComponent implements OnChanges {

  @Input() series: Highcharts.SeriesColumnOptions[] = [];
  @Input() categories: string[] = ['>0 to 50 €K', '>50 to 100 €K', '>100 to 250 €K', '>250 to 500 €K', '>500 to 1000 €K', '>1000 €K'];
  @Input() enableLegend = false;
  @Input() titleText = undefined;
  @Input() subtitleText = undefined;
  @Input() XAxisTitleText = undefined;
  @Input() YAxisTitleText = undefined;
  @Input() stacking = undefined;
  @Input() reversedStacks = true;
  @Input() dataLabelsEnabled = false;
  @Input() whitespace?: string = undefined;


  @Output() chartReady = new EventEmitter<Highcharts.Chart>();


  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {};

  ngOnChanges(changes: SimpleChanges) {
    this.updateChart();
  }

  updateChart() {
    const that = this;
    // if (this.series.length === 1) {
    //   // If last column is empty remove from chart as requested
    //   if (this.series[0].data[5] === 0) {
    //     this.series[0].data.pop();
    //     this.categories.pop();
    //   }
    // }

    this.chartOptions = {
      chart: {
        height: 660,
        width: 990,
        events: {
          load(this: Highcharts.Chart) {
            // `this` is already typed as the Chart instance
            that.chartReady.emit(this);
          }
        }
      },
      title: {
        text: this.titleText
      },
      subtitle: {
        text: this.subtitleText
      },
      credits: {
        enabled: false
      },
      xAxis: {
        categories: this.categories,
        title: {
          text: this.XAxisTitleText
        },
        labels: {
          allowOverlap: true,
          style: this.whitespace ? {
            fontSize: '18px',
            whiteSpace: this.whitespace,
            textOverflow: 'none'
          } : {
            fontSize: '18px',
          }
        }
      },
      yAxis: {
        allowDecimals: false,
        title: {
          text: this.YAxisTitleText
        },
        reversedStacks: this.reversedStacks,
      },
      legend: {
        enabled: this.enableLegend,
        itemStyle: {
          fontSize: '18px',
        }
      },
      exporting: {
        enabled: false
      },
      plotOptions: {
        series: {
          stacking: this.stacking,
          dataLabels: {
            enabled: this.dataLabelsEnabled,
            style: {
              fontSize: '14px',
              fontWeight: 'bold',
            },
            formatter: function() {
              if (this.y === 0 || this.y === null) {
                return '';
              }
              return this.y.toString();
            }
          },
        }
      },
      series: this.series.length > 0 ? this.series : []

    }

  }

}

