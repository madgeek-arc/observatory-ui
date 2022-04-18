import * as Highcharts from "highcharts/highmaps";
import HC_exporting from 'highcharts/modules/exporting';
import HC_tilemap from 'highcharts/modules/tilemap';
import {Component, OnInit} from "@angular/core";
import {DataHandlerService} from "../../../services/data-handler.service";
import {DataService} from "../../../services/data.service";
import {CategorizedAreaData} from "../../../domain/categorizedAreaData";
import {SeriesOptionsType} from "highcharts/highmaps";
HC_exporting(Highcharts);
HC_tilemap(Highcharts);

declare var require: any;
const worldMap = require('@highcharts/map-collection/custom/world.topo.json');

@Component({
  selector: 'app-highcharts-category-map',
  templateUrl: './highcharts-category-map.component.html'
})

export class HighchartsCategoryMapComponent implements OnInit {

  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options;
  chartConstructor = "mapChart";
  mapData: CategorizedAreaData;
  colorPallet = ['#2A9D8F', '#E76F51', '#E9C46A', '#F4A261', '#8085e9'];
  ready = false;

  constructor(private dataService: DataService, private dataHandlerService: DataHandlerService) {
  }

  ngOnInit() {
    this.dataService.getFinancialContrToEOSCLinkedToPolicies().subscribe(
      rawData => {
        this.mapData = this.dataHandlerService.convertRawDataToCategorizedAreasData(rawData);
        for (let i = 0; i < this.mapData.series.length; i++) {
          this.mapData.series[i].data = this.mapData.series[i].data.map(code => ({ code }));
          this.mapData.series[i].color = this.colorPallet[i];
        }
        this.mapData.series[0].allAreas = true;

      }, error => {
        console.log(error);
      },
      () => {
        this.createMap(this.mapData);
        this.ready = true;
      }
    );
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
