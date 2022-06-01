import * as Highcharts from "highcharts/highmaps";
import HC_exporting from 'highcharts/modules/exporting';
import HC_tilemap from 'highcharts/modules/tilemap';
import {Component, Input, OnChanges, OnInit, SimpleChanges} from "@angular/core";
import {CategorizedAreaData} from "../../../domain/categorizedAreaData";
import {SeriesMappointOptions, SeriesOptionsType} from "highcharts/highmaps";
import {PremiumSortPipe} from "../../../../catalogue-ui/shared/pipes/premium-sort.pipe";
import proj4 from "proj4";
HC_exporting(Highcharts);
HC_tilemap(Highcharts);

declare var require: any;
const worldMap = require('@highcharts/map-collection/custom/world-highres3.topo.json');

@Component({
  selector: 'app-highcharts-category-map',
  templateUrl: './highcharts-category-map.component.html'
})

export class HighchartsCategoryMapComponent implements OnInit, OnChanges {

  @Input() mapData: CategorizedAreaData = null;
  @Input() title: string = null;
  @Input() subtitle: string = null;

  chart;
  chartCallback;
  updateFlag = false;
  Highcharts: typeof Highcharts = Highcharts;
  colorPallet = ['#2A9D8F', '#E9C46A', '#F4A261', '#E76F51', '#A9A9A9'];
  datasetOrder = [ 'Yes', 'Partly', 'In planning', 'No', 'Awaiting data' ];
  premiumSort = new PremiumSortPipe();
  chartConstructor = "mapChart";
  ready = false;
  chartOptions: Highcharts.Options;

  constructor() {
    const self = this;

    this.createMap();
    this.chartCallback = chart => {
      // saving chart reference
      self.chart = chart;
      // console.log(self.chart);
    };
  }

  ngOnInit() {
    this.createMap();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.ready = false;
    if (this.mapData) {
      const self = this, chart = this.chart;
      // chart.showLoading();

      if (this.title === 'EOSC-relevant policies in place at national or regional level') {
        this.mapData.series[1].color = this.colorPallet[4];
        self.chartOptions.subtitle.text = this.subtitle;
        self.chartOptions.legend.enabled = false;
        self.chartOptions.plotOptions.map.tooltip.pointFormat = '{point.name}';
      } else {
        for (let i = 0; i < this.mapData.series.length; i++) {
          this.premiumSort.transform(this.mapData.series, this.datasetOrder);
          this.mapData.series[i].color = this.colorPallet[this.datasetOrder.indexOf(this.mapData.series[i].name)];
        }
      }

      this.mapData.series[0].allAreas = true;
      // setTimeout(() => {
        self.chartOptions.title.text = this.title;
        self.chartOptions.series = this.mapData.series as undefined[];
        // if (self.chartOptions.series.length === 3) {
        //   self.chartOptions.series[2] = this.mapData.series[2] as SeriesMappointOptions
        // }
        console.log(self.chartOptions.series)
        // chart.hideLoading();
        self.updateFlag = true;
        this.ready = true;
      // }, 0);

    }
  }

  createMap() {
    this.chartOptions = {

      chart: {
        map: worldMap,
        proj4: proj4,
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

      series: [] as SeriesOptionsType[],
    }
  }

}
