import * as Highcharts from "highcharts/highmaps";
import HC_exporting from 'highcharts/modules/exporting';
import HC_tilemap from 'highcharts/modules/tilemap';
import {Component, OnInit} from "@angular/core";
HC_exporting(Highcharts);
HC_tilemap(Highcharts);

declare var require: any;
const worldMap = require('@highcharts/map-collection/custom/world.topo.json');

interface ExtendedPointOptionsObject extends Highcharts.PointOptionsObject {
  country: string;
}

@Component({
  selector: 'app-highcharts-category-map',
  templateUrl: './highcharts-category-map.component.html'
})

export class HighchartsCategoryMapComponent implements OnInit {

  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options;
  chartConstructor = "mapChart";

  ngOnInit() {
    this.createMap();
    this.chartOptions
  }

  createMap() {
    this.chartOptions = {

      chart: {
        map: worldMap,
        spacingBottom: 20
      },

      mapView: {
        center: [13, 48],
        zoom: 4.5
      },

      title: {
        text: 'Countries which have dedicated financial contributions to the EOSC linked to policies'
      },

      legend: {
        enabled: true
      },

      plotOptions: {
        map: {
          joinBy: ['iso-a2', 'code'],
          tooltip: {
            headerFormat: '',
            pointFormat: '{point.name}: <b>{series.name}</b>'
          },
        },
        series: {
          point: {
            events: {
              click: function () {
                console.log(this);
              }
            }
          }
        }
      },

      series: [{
        allAreas: true,
        name: 'Yes',
        type: undefined,
        color: '#2A9D8F',
        data: ['IE', 'IS', 'GB', 'PT'].map(code => ({ code }))
      }, {
        allAreas: false,
        name: 'No',
        type: undefined,
        color: '#E76F51',
        data: [
          'NO', 'SE', 'DK', 'DE', 'NL', 'BE', 'LU', 'ES', 'FR', 'PL',
          'CZ', 'AT', 'CH', 'LI', 'SK', 'HU', 'SI', 'IT', 'SM', 'HR',
          'BA', 'YF', 'ME', 'AL', 'MK'
        ].map(code => ({ code }))
      }, {
        allAreas: false,
        name: 'Partly',
        type: undefined,
        color: '#E9C46A',
        data: [
          'FI', 'EE', 'LV', 'LT', 'BY', 'UA', 'MD', 'RO', 'BG', 'GR',
          'TR', 'CY'
        ].map(code => ({ code }))
      }, {
        allAreas: false,
        name: 'In Planning',
        color: '#F4A261',
        type: undefined,
        data: [
          'RU'
        ].map(code => ({ code }))
      }]
    }
  }

}
