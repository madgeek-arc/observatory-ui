import * as Highcharts from "highcharts/highmaps";
import HC_exporting from 'highcharts/modules/exporting';
import HC_tilemap from 'highcharts/modules/tilemap';
import {Component, Input, OnChanges, OnInit, SimpleChanges} from "@angular/core";
import {CategorizedAreaData} from "../../../domain/categorizedAreaData";
import {SeriesOptionsType} from "highcharts/highmaps";
import {PremiumSortPipe} from "../../../../catalogue-ui/shared/pipes/premium-sort.pipe";
HC_exporting(Highcharts);
HC_tilemap(Highcharts);

declare var require: any;
const worldMap = require('@highcharts/map-collection/custom/world-highres3.topo.json');

@Component({
  selector: 'app-highcharts-category-map',
  templateUrl: './highcharts-category-map.component.html'
})

export class HighchartsCategoryMapComponent implements OnChanges {

  @Input() mapData: CategorizedAreaData = null;
  @Input() title: string = null;
  @Input() subtitle: string = null;
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
      if (this.title === 'EOSC-relevant policies in place at national or regional level') {
        this.mapData.series[1].color = this.colorPallet[4];
      } else {
        for (let i = 0; i < this.mapData.series.length; i++) {
          this.mapData.series[i].color = this.colorPallet[this.datasetOrder.indexOf(this.mapData.series[i].name)];
        }
      }

      this.mapData.series[0].allAreas = true;
      // console.log(this.mapData);
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
        text: this.title
      },

      subtitle: {
        text: this.subtitle
      },

      legend: {
        enabled: true,
        accessibility: {
          enabled: false
        }
      },

      plotOptions: {
        map: {
          joinBy: ['iso-a2', 'code'],
          tooltip: {
            headerFormat: '',
            pointFormat: '{point.name}: <b>{series.name}</b>'
          },
          events: {
            legendItemClick: function () {
              return false;
            }
          }
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
