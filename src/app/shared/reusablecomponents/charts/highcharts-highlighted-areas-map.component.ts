import * as Highcharts from "highcharts/highmaps";
import HC_exporting from 'highcharts/modules/exporting';
import HC_tilemap from 'highcharts/modules/tilemap';
import {Component, Input, OnChanges, OnInit, SimpleChanges} from "@angular/core";
import {SeriesOptionsType} from "highcharts/highmaps";
import {PremiumSortPipe} from "../../../../catalogue-ui/shared/pipes/premium-sort.pipe";
HC_exporting(Highcharts);
HC_tilemap(Highcharts);

declare var require: any;
const worldMap = require('@highcharts/map-collection/custom/world.topo.json');

@Component({
  selector: 'app-highcharts-highlighted-areas-map',
  templateUrl: './highcharts-highlighted-areas-map.component.html'
})

export class HighchartsHighlightedAreasMapComponent implements OnChanges, OnInit {

  // @Input() mapData: CategorizedAreaData = null;
  @Input() title: string = null;
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options;
  colorPallet = ['#2A9D8F', '#E9C46A', '#F4A261', '#E76F51', '#A9A9A9'];
  chartConstructor = "mapChart";

  ngOnInit() {
    this.createMap();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.createMap();
  }

  createMap() {
    this.chartOptions = {

      chart: {
        map: worldMap,
        // borderWidth: 1
      },

      mapView: {
        center: [30, 51],
        zoom: 3.5
      },

      title: {
        text: 'Nordic countries'
      },

      subtitle: {
        text: 'Demo of drawing all areas in the map, only highlighting partial data'
      },

      legend: {
        enabled: false
      },

      series: [{
        name: 'Country',
        type: 'map',
        data: [
          ['is', 1],
          ['no', 1],
          ['se', 1],
          ['dk', 1],
          ['fi', 1]
        ],
        // dataLabels: {
        //   enabled: true,
        //   color: '#FFFFFF',
        //   // formatter: function () {
        //   //   if (this.point.value) {
        //   //     return this.point.name;
        //   //   }
        //   // }
        // },
        tooltip: {
          headerFormat: '',
          pointFormat: '{point.name}'
        }
      }]

    }
  }

}
