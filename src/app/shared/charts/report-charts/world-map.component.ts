import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { SeriesOptionsType } from 'highcharts/highmaps';
import { HighchartsChartModule } from 'highcharts-angular';
import worldMapData from '@highcharts/map-collection/custom/world-highres3.topo.json';
import * as Highcharts from 'highcharts/highmaps';

import HC_map from 'highcharts/modules/map';
import Exporting from 'highcharts/modules/exporting';
import HC_ExportingOffline from 'highcharts/modules/offline-exporting';

HC_map(Highcharts);
Exporting(Highcharts);
HC_ExportingOffline(Highcharts);

type MapData = Highcharts.SeriesMapDataOptions & { code: string };

export type CustomSeriesMapOptions = Omit<Highcharts.SeriesMapOptions, 'data'> & {
  data: MapData[];
};

@Component({
  selector: 'app-world-map',
  standalone: true,
  imports: [
    HighchartsChartModule
],
  template: `@if (ready) {<highcharts-chart [Highcharts]="Highcharts" [constructorType]="'mapChart'" [options]="chartOptions" style="width: 100%; display: block;"></highcharts-chart>}`
})

export class WorldMapComponent implements OnChanges {

  @Input() series: SeriesOptionsType[] = [];

  @Output() chartReady = new EventEmitter<Highcharts.Chart>();


  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {};

  colorPallet = ['#008792', '#E9C46A', '#F4A261', '#EB5C80', '#A9A9A9'];
  ready = false;

  ngOnChanges() {
    if (this.series.length) {
      this.createMap();
    }
  }

  createMap() {
    const that = this;
    this.ready = false;

    this.chartOptions = {
      chart: {
        map: worldMapData,
        height: 660,
        width: 990,
        events: {
          load(this: Highcharts.Chart) {
            // `this` is already typed as the Chart instance
            that.chartReady.emit(this);
          }
        }
      },
      mapView: {
        center: [15, 50],
        zoom: 4.5
      },
      title: {
        text: undefined
      },
      credits: {
        enabled: false
      },
      colorAxis: {
        dataClasses: [
          {from: 0, to: 1, color: this.colorPallet[0], name: 'Category A'},
          {from: 1, to: 2, color: this.colorPallet[3], name: 'Category B'},
          {from: 2, color: this.colorPallet[4], name: 'Category C'}
        ],
        showInLegend: false,
      },
      legend: {
        itemStyle: {
          fontSize: '18px',
        },
        align: 'center',
      },
      exporting: {
        enabled: true,
      },
      plotOptions: {
        map: {
          joinBy: ['iso-a2', 'code'],
          dataLabels: {
            enabled: false
          },
          // allAreas: true,
          // nullColor: '#f7f7f7'
        },
        // mappoint: {
        //   showInLegend: true, // Ensure mappoint series show in legend
        // }
      },
      series: this.series as SeriesOptionsType[],
    };

    this.ready = true;
  }

}
