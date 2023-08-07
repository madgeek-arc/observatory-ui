import {Component, OnInit} from '@angular/core';
import {Chart, PaneBackgroundOptions, SeriesOptionsType} from 'highcharts';
import * as Highcharts from 'highcharts';
import HighchartsMore from 'highcharts/highcharts-more';
import SolidGauge from 'highcharts/modules/solid-gauge';

HighchartsMore(Highcharts);
SolidGauge(Highcharts);
@Component({
  selector: 'activity-gauge',
  templateUrl: 'gauge-activity.component.html'
})

export class GaugeActivityComponent implements OnInit {
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options;
  paneBackground: Array<PaneBackgroundOptions> = new Array<PaneBackgroundOptions>();
  series: Array<SeriesOptionsType> = new Array<SeriesOptionsType>();

  ngOnInit() {
    let length = 7;
    this.createPane(length);
    this.generateSeries(length);
    this.createGauge();
  }

  createGauge() {
    this.chartOptions = {
      chart: {
        type: 'solidgauge',
      },

      title: {
        text: 'Activity',
        style: {
          fontSize: '24px'
        }
      },

      tooltip: {
        borderWidth: 0,
        backgroundColor: 'none',
        shadow: false,
        style: {
          fontSize: '12px'
        },
        valueSuffix: '%',
        pointFormat: '{series.name}<br><span style="font-size:2em; color: {point.color}; font-weight: bold">{point.y}</span>',
        positioner: function (labelWidth) {
          return {
            x: (this.chart.chartWidth - labelWidth) / 2,
            y: (this.chart.plotHeight / 2) + 15
          };
        }
      },

      pane: {
        startAngle: 0,
        endAngle: 360,
        background: this.paneBackground
      },

      yAxis: {
        min: 0,
        max: 100,
        lineWidth: 0,
        tickPositions: []
      },

      plotOptions: {
        solidgauge: {
          dataLabels: {
            enabled: false
          },
          linecap: 'round',
          stickyTracking: false,
          rounded: true
        }
      },

      series: this.series
    };

  }

  createPane(size: number) {
    let radius = 113;
    const step = 12;
    for (let i = 0; i < size; i++) {
      let paneBackGround = {
        outerRadius: (radius = radius-1)+'%',
        innerRadius: (radius = radius-step)+'%',
        backgroundColor: Highcharts.color(Highcharts.getOptions().colors[i])
          .setOpacity(0.3)
          .get(),
        borderWidth: 0
      }
      this.paneBackground.push(paneBackGround)
    }
  }

  generateSeries(size: number) {
    let radius = 113;
    const step = 12;
    for (let i = 0; i < size; i++) {
      let data: SeriesOptionsType = {
        type: 'solidgauge',
        name: 'test '+i,
        data: [{
          color: Highcharts.getOptions().colors[i],
          radius: (radius = radius-1)+'%',
          innerRadius: (radius = radius-step)+'%',
          y: (i+5)*7
        }]
      }
      this.series.push(data);
    }
  }

}