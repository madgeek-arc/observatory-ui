import * as Highcharts from "highcharts/highmaps";
import HC_exporting from 'highcharts/modules/exporting';
import HC_tilemap from 'highcharts/modules/tilemap';
import {Component, Input, OnChanges, OnInit, SimpleChanges} from "@angular/core";
import {DataHandlerService} from "../../../services/data-handler.service";
import {DataService} from "../../../services/data.service";
import {CategorizedAreaData} from "../../../domain/categorizedAreaData";
import {SeriesOptionsType} from "highcharts/highmaps";
import {PremiumSortPipe} from "../../../../catalogue-ui/shared/pipes/premium-sort.pipe";
HC_exporting(Highcharts);
HC_tilemap(Highcharts);

declare var require: any;
const worldMap = require('@highcharts/map-collection/custom/world.topo.json');

@Component({
  selector: 'app-highcharts-category-map',
  templateUrl: './highcharts-category-map.component.html'
})

export class HighchartsCategoryMapComponent implements OnChanges {

  @Input() mapData: CategorizedAreaData = null;
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options;
  colorPallet = ['#2A9D8F', '#E9C46A', '#F4A261', '#E76F51', '#A9A9A9'];
  datasetOrder = [ 'Yes', 'Partly', 'In planning', 'No', 'Awaiting data' ];
  premiumSort = new PremiumSortPipe();
  chartConstructor = "mapChart";
  ready = false;

  ngOnChanges(changes: SimpleChanges) {
    this.ready = false;
    if (this.mapData) {
      this.premiumSort.transform(this.mapData.series, this.datasetOrder);
      for (let i = 0; i < this.mapData.series.length; i++) {
        this.mapData.series[i].color = this.colorPallet[i];
      }
      this.mapData.series[0].allAreas = true;
      this.createMap(this.mapData);
      this.ready = true;
    }
  }

  createMap(mapData: CategorizedAreaData) {
    this.chartOptions = {

      chart: {
        map: worldMap,
        spacingBottom: 20,
        backgroundColor: 'rgba(0,0,0,0)'
      },
      mapView: {
        center: [30, 51],
        zoom: 3.5
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

      series: mapData.series as SeriesOptionsType[],
    }
  }

}
