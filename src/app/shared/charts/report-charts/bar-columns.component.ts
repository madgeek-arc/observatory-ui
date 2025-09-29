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
  @Input() XAxisTitleText = undefined;
  @Input() stacking = undefined;


  @Output() chartReady = new EventEmitter<Highcharts.Chart>();


  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {};

  ngOnChanges(changes: SimpleChanges) {
    this.updateChart();
  }

  updateChart() {
    const that = this;
    if (this.series.length === 1) {
      // If last column empty remove from chart as requested
      if (this.series[0].data[5] === 0) {
        this.series[0].data.pop();
        this.categories.pop();
      }
    }

    this.chartOptions = {
      chart: {
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
      credits: {
        enabled: false
      },
      xAxis: {
        categories: this.categories,
        title: {
          text: this.XAxisTitleText
        }
      },
      yAxis: {
        title: {
          text: undefined
        }
      },
      legend: {
        enabled: this.enableLegend
      },
      exporting: {
        enabled: false
      },
      plotOptions: {
        series: {
          stacking: this.stacking,
        }
      },
      series: this.series.length > 0 ? this.series : []

    }

  }

}

