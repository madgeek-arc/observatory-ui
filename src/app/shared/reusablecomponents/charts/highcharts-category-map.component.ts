import * as Highcharts from "highcharts/highmaps";
import HC_exporting from 'highcharts/modules/exporting';
import HC_tilemap from 'highcharts/modules/tilemap';
import {Component} from "@angular/core";
HC_exporting(Highcharts);
HC_tilemap(Highcharts);

declare var require: any;
const worldMap = require('@highcharts/map-collection/custom/world.geo.json');

interface ExtendedPointOptionsObject extends Highcharts.PointOptionsObject {
  country: string;
}

@Component({
  selector: 'app-highcharts-category-map',
  templateUrl: './highcharts-category-map.component.html'
})

export class HighchartsCategoryMapComponent {

  Highcharts: typeof Highcharts = Highcharts;
  chartConstructor = "mapChart";
  chartData = [
    { code3: "ABW", z: 105 },
    { code3: "AFG", z: 35530 }
  ];

  chartOptions: Highcharts.Options = {
    chart: {
      map: worldMap,
      spacingBottom: 20
    },

    title: {
      text: 'Countries which have dedicated financial contributions to the EOSC linked to policies'
    },

    legend: {
      enabled: true
    },

    plotOptions: {
      map: {
        // allAreas: true,
        joinBy: ['iso-a2', 'code'],
        // dataLabels: {
        //   // enabled: true,
        //   color: '#FFFFFF',
        //   style: {
        //     fontWeight: 'bold'
        //   },
        //   // Only show dataLabels for areas with high label rank
        //   // format: null,
        //   // formatter: function () {
        //   //   if (
        //   //     this.point.properties &&
        //   //     this.point.properties.labelrank.toString() < 5
        //   //   ) {
        //   //     return this.point.properties['iso-a2'];
        //   //   }
        //   // }
        // },
        tooltip: {
          headerFormat: '',
          pointFormat: '{point.name}: <b>{series.name}</b>'
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
      allAreas: true,
      name: 'No',
      type: undefined,
      color: '#E76F51',
      data: [
        'NO', 'SE', 'DK', 'DE', 'NL', 'BE', 'LU', 'ES', 'FR', 'PL',
        'CZ', 'AT', 'CH', 'LI', 'SK', 'HU', 'SI', 'IT', 'SM', 'HR',
        'BA', 'YF', 'ME', 'AL', 'MK'
      ].map(code => ({ code }))
    }, {
      allAreas: true,
      name: 'Partly',
      type: undefined,
      color: '#E9C46A',
      data: [
        'FI', 'EE', 'LV', 'LT', 'BY', 'UA', 'MD', 'RO', 'BG', 'GR',
        'TR', 'CY'
      ].map(code => ({ code }))
    }, {
      allAreas: true,
      name: 'In Planning',
      color: '#F4A261',
      type: undefined,
      data: [{
        code: 'RU'
      }]
    }]
  }
}
