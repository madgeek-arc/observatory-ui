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

  mapSeries: Highcharts.SeriesMapOptions[] = [{
    name: 'UTC',
    data: ['IE', 'IS', 'GB', 'PT'].map(function (code) {
      return { code: code };
    })
  }, {
    name: 'UTC + 1',
    data: ['NO', 'SE', 'DK', 'DE', 'NL', 'BE', 'LU', 'ES', 'FR', 'PL', 'CZ', 'AT', 'CH', 'LI', 'SK', 'HU',
      'SI', 'IT', 'SM', 'HR', 'BA', 'YF', 'ME', 'AL', 'MK'].map(function (code) {
      return { code: code };
    })
  }, {
    type: 'map',
    name: 'UTC + 2',
    data: ['FI', 'EE', 'LV', 'LT', 'BY', 'UA', 'MD', 'RO', 'BG', 'GR', 'TR', 'CY'].map(function (code) {
      return { code: code };
    })
  }, {
    name: 'UTC + 3',
    data: [{
      code: 'RU'
    }]
  }];

  chartOptions: Highcharts.Options = {
    chart: {
      map: worldMap,
    },

    // mapView: {
    //   // projection: {
    //   //   name: 'WebMercator'
    //   // },
    //   center: [14, 51],
    //   zoom: 0.24
    // },

    colors: [
      'rgba(103, 232, 99, 0.5)', 'rgba(135, 207, 233, 0.5)',
      'rgba(255, 241, 118, 0.5)', 'rgba(233, 135, 207, 0.5)'
    ],

    title: {
      text: 'Europe time zones'
    },

    legend: {
      enabled: true
    },

    // plotOptions: {
    //   map: {
    //     allAreas: false,
    //     joinBy: ['iso-a2', 'code'],
    //     dataLabels: {
    //       enabled: true,
    //       color: '#FFFFFF',
    //       style: {
    //         fontWeight: 'bold'
    //       },
    //       // Only show dataLabels for areas with high label rank
    //       format: null,
    //       formatter: function () {
    //         if (
    //           this.point.properties &&
    //           this.point.properties.labelrank.toString() < 5
    //         ) {
    //           return this.point.properties['iso-a2'];
    //         }
    //       }
    //     },
    //     tooltip: {
    //       headerFormat: '',
    //       pointFormat: '{point.name}: <b>{series.name}</b>'
    //     }
    //   }
    // },

    series: this.mapSeries

    // series: [
    //   {
    //     name: 'Yes',
    //     type: 'map',
    //     data: [
    //       ['ie', 10],
    //       ['is', 10],
    //       ['gb', 10],
    //       ['pt', 10]
    //     ],
    //   },
    //   {
    //     name: 'No',
    //     type: 'map',
    //     data: [
    //       ['no', 2],
    //       ['se', 2],
    //       ['dk', 2],
    //       ['de', 2],
    //       ['nl', 2],
    //       ['be', 2],
    //       ['lu', 2],
    //       ['es', 2],
    //       ['fr', 2],
    //       ['pl', 2],
    //       ['cz', 2],
    //       ['at', 2],
    //       ['ch', 2],
    //       ['li', 2],
    //       ['sk', 2],
    //       ['hu', 2],
    //       ['si', 2],
    //       ['it', 2],
    //       ['sm', 2],
    //       ['hr', 2],
    //       ['ba', 2],
    //       ['yf', 2],
    //       ['me', 2],
    //       ['al', 2],
    //       ['mk', 2]
    //     ]
    //   },
    //   // {
    //   //   name: 'UTC + 1',
    //   //   type: "map",
    //   //   joinBy: ['iso-a2', 'code'],
    //   //   data: [
    //   //     'NO', 'SE', 'DK', 'DE', 'NL', 'BE', 'LU', 'ES', 'FR', 'PL',
    //   //     'CZ', 'AT', 'CH', 'LI', 'SK', 'HU', 'SI', 'IT', 'SM', 'HR',
    //   //     'BA', 'YF', 'ME', 'AL', 'MK'
    //   //   ].map(code => ({ code }))
    //   // },
    //   // {
    //   //   name: 'UTC + 2',
    //   //   type: "map",
    //   //   data: [
    //   //     'FI', 'EE', 'LV', 'LT', 'BY', 'UA', 'MD', 'RO', 'BG', 'GR',
    //   //     'TR', 'CY'
    //   //   ].map(code => ({ code }))
    //   // },
    //   // {
    //   //   name: 'UTC + 3',
    //   //   type: "map",
    //   //   data: [{
    //   //     code: 'RU'
    //   //   }]
    //   // }
    //   ]
  };
}
