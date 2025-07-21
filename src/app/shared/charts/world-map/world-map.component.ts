// world-map.component.ts
import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts/highmaps';
import HC_map from 'highcharts/modules/map';
import worldMapData from '@highcharts/map-collection/custom/world-highres3.topo.json';
import { HighchartsChartModule } from 'highcharts-angular';
import { NgIf } from "@angular/common";

HC_map(Highcharts);

@Component({
  selector: 'app-world-map',
  standalone: true,
  imports: [
    HighchartsChartModule,
    NgIf
  ],
  template: `<highcharts-chart *ngIf="ready" [Highcharts]="Highcharts" [constructorType]="'mapChart'" [options]="chartOptions" style="width: 100%; display: block;"></highcharts-chart>`
})
export class WorldMapComponent implements OnInit {
  Highcharts: typeof Highcharts = Highcharts;

  chartOptions: Highcharts.Options = {}
  ready = false;
  ngOnInit() {
    setTimeout(() => {

      this.createMap();
      this.ready = true;
    }, 0)
  }

  createMap() {
    this.chartOptions = {
      chart: {
        map: worldMapData,
        type: 'map',
        height: 600,

      },

      mapView: {
        center: [15, 50],
        // zoom: 3.6
        zoom: 3.6
        // center: [4550, 8200],               // Europe center
        // zoom: -1.2                 // zoom in
      },
      mapNavigation: {enabled: true},
      title: {text: 'Europe (TopoJSON)'},
      plotOptions: {
        map: {
          joinBy: ['iso-a2', 'code'],
          tooltip: {
            headerFormat: '',
            pointFormat: '{point.name}'
          }
        },
      },
      series: [{
        type: 'map',
        name: 'Countries',
        mapData: worldMapData,
        // joinBy: ['iso-a2', 'code'],
        data: [
          {code: 'FR', value: 1},
          {code: 'DE', value: 2},
          {code: 'ES', value: 3}
        ] as unknown as Highcharts.SeriesMapDataOptions[]
      }]
    };
  }
}
