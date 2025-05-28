import { Component, Input, OnChanges } from '@angular/core';
import * as Highcharts from 'highcharts';
import Exporting from 'highcharts/modules/exporting';
import ExportData from 'highcharts/modules/export-data';
import VariablePie from 'highcharts/modules/variable-pie';
import { colors } from "../../../domain/chart-color-palette";
import { renderLogo } from "../highcharts-functions";

// Initialize the variable pie module
VariablePie(Highcharts);
Exporting(Highcharts);
ExportData(Highcharts);

@Component({
  selector: 'app-pie-chart',
  template: '<div *ngIf="chartId" [id]="chartId"></div>',
})
export class PieChartComponent implements OnChanges {

  @Input() chartId: string = null;
  @Input() title = 'Countries distribution';
  @Input() subTitle: string = null;
  @Input() type = 'pie';
  @Input() tooltip = null;
  @Input() series: any = [];
  @Input() caption?: string;
  @Input() height?: number = 400;

  backgroundColor: string = '#FFFFFF';
  chart: Highcharts.Chart;


  ngOnChanges() {
    if (this.series?.length > 0 && this.chartId !== null) {

      setTimeout(() => { // Timeout with delay 0 to reorder the
        // console.log(document.getElementById(this.chartId));
        this.initChart();
        this.chart.update({
          colors: colors ?? Highcharts.getOptions().colors,
          tooltip: this.tooltip,
          chart: {
            type: this.type,
            backgroundColor: this.backgroundColor,
            height: this.height,
            spacingBottom: 50,
            events: {
              load: function () {
                renderLogo(this.renderer, this.chartWidth, this.chartHeight);
              }
            }
          },
          caption: {
            text: this.caption,
            useHTML: true
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
          series: this.series
        }, true, true, true);
      }, 0);

    }
  }

  initChart() {
    // console.log(this.chartId);
    this.chart = Highcharts.chart(this.chartId, {
      colors: colors ?? Highcharts.getOptions().colors,
      chart: {
        type: this.type,
        backgroundColor: this.backgroundColor,
        height: this.height,
        spacingBottom: 50,
        events: {
          load: function () {
            renderLogo(this.renderer, this.chartWidth, this.chartHeight);
          }
        }
      },
      caption: {
        text: this.caption,
        useHTML: true
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
      credits: {
        enabled: false
      },
      series: this.series
    } as any);
  }
}
