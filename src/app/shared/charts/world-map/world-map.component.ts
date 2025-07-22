import { AfterViewInit, Component, OnInit } from '@angular/core';
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
export class WorldMapComponent implements OnInit, AfterViewInit {
  Highcharts: typeof Highcharts = Highcharts;
  colorPallet = ['#2A9D8F', '#E9C46A', '#F4A261', '#E76F51', '#A9A9A9'];

  chartOptions: Highcharts.Options = {}
  ready = false;

  ngOnInit() {
    this.createMap();
  }

  ngAfterViewInit() {}

  createMap() {
    this.ready = false;

    this.chartOptions = {
      chart: {
        map: worldMapData
      },
      mapView: {
        center: [15, 50],
        zoom: 3.4
      },
      title: {
        text: undefined
      },
      colorAxis: {
        dataClasses: [
          {from: 0, to: 1, color: this.colorPallet[0], name: 'Category A'},
          {from: 1, to: 2, color: this.colorPallet[3], name: 'Category B'},
          {from: 2, color: this.colorPallet[4], name: 'Category C'}
        ]
      },
      exporting: {
        enabled: false
      },
      plotOptions: {
        map: {
          joinBy: ['iso-a2', 'code'],
          dataLabels: {
            enabled: false
          },
        }
      },
      series: [
        {
          type: 'map',
          name: 'Countries',
          data: [
            {code: 'IT', value: 0}, // Category A
            {code: 'FR', value: 1}, // Category B
            {code: 'DE', value: 2}, // Category C
          ] as unknown as Highcharts.SeriesMapDataOptions[],
        },
        {
          type: 'mappoint',
          name: 'Cities',
          color: Highcharts.getOptions().colors?.[1],
          data: [
            {
              name: 'Paris',
              lat: 48.8566,
              lon: 2.3522
            },
          ],
          marker: {
            symbol: 'circle',
            radius: 6
          },
        }
      ]
    };

    this.ready = true;
  }
}
