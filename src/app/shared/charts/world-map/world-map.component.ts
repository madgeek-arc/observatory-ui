import { AfterViewInit, Component, EventEmitter, OnInit, Output } from '@angular/core';
import * as Highcharts from 'highcharts/highmaps';
import worldMapData from '@highcharts/map-collection/custom/world-highres3.topo.json';
import { HighchartsChartModule } from 'highcharts-angular';
import { NgIf } from "@angular/common";
import HC_map from 'highcharts/modules/map';
import Exporting from 'highcharts/modules/exporting';
import HC_ExportingOffline from 'highcharts/modules/offline-exporting';

HC_map(Highcharts);
Exporting(Highcharts);
HC_ExportingOffline(Highcharts);

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

  @Output() chartReady = new EventEmitter<Highcharts.Chart>();


  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {}

  colorPallet = ['#2A9D8F', '#E9C46A', '#F4A261', '#E76F51', '#A9A9A9'];
  ready = false;

  ngOnInit() {
    this.createMap();
  }

  ngAfterViewInit() {}

  createMap() {
    const that = this;
    this.ready = false;

    this.chartOptions = {
      chart: {
        map: worldMapData,
        events: {
          load(this: Highcharts.Chart) {
            // `this` is already typed as the Chart instance
            that.chartReady.emit(this);
          }
        }
      },
      mapView: {
        center: [15, 50],
        zoom: 3.4
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
        ]
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

  /** Helper to emit base64 PNG up to parent */
  // public async emitImage() {
  //   if (!this.chartInstance) { return; }
  //   // requires offline-exporting module
  //   const canvas = this.chartInstance.createCanvas();
  //   const dataURL = canvas.toDataURL('image/png');
  //   // strip off the prefix if you want raw base64:
  //   const base64 = dataURL.split(',')[1];
  //   this.chartReady.emit(this.chartInstance);     // or another @Output for image
  //   // OR: emit a string:
  //   // this.imageReady.emit(dataURL);
  // }

}
