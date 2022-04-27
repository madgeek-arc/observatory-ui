import * as Highcharts from "highcharts/highmaps";
import HC_exporting from 'highcharts/modules/exporting';
import HC_tilemap from 'highcharts/modules/tilemap';
import {Component, Input, OnChanges, OnInit, SimpleChanges} from "@angular/core";
import {HighlightedAreaSeries} from "../../../domain/categorizedAreaData";
import {SeriesOptionsType} from "highcharts/highmaps";
import {StakeholdersService} from "../../../services/stakeholders.service";

HC_exporting(Highcharts);
HC_tilemap(Highcharts);

declare var require: any;
const worldMap = require('@highcharts/map-collection/custom/world.topo.json');

@Component({
  selector: 'app-highcharts-highlighted-areas-map',
  templateUrl: './highcharts-highlighted-areas-map.component.html'
})

export class HighchartsHighlightedAreasMapComponent implements OnChanges, OnInit {

  @Input() mapData: HighlightedAreaSeries[] = null;
  @Input() title: string = null;
  @Input() subtitle: string = null;
  chart;
  updateFlag = false;
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options;
  colorPallet = ['#A9A9A9'];
  chartConstructor = "mapChart";
  chartCallback;
  countriesArray: string[] = [];

  constructor(private stakeholdersService: StakeholdersService) {
    const self = this;

    this.chartCallback = chart => {
      // saving chart reference
      self.chart = chart;
    };
    this.createMap([]);
  }

  ngOnInit() {
    this.stakeholdersService.getEOSCSBCountries().subscribe(
      res => {
        this.countriesArray = res;
        for (let i = 0; i < this.countriesArray.length; i++) {
          this.countriesArray[i] = this.countriesArray[i].toLocaleLowerCase();
        }
      },
      error => console.log(error),
      );

  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.mapData) {
      for (let i = 0; i < this.countriesArray.length; i++) {
        // TODO: merge the arrays and color the unique countries from the countriesArray
      }
      const self = this, chart = this.chart;
      // chart.showLoading();
      // chart.hideLoading();
      self.chartOptions.series = this.mapData as SeriesOptionsType[];
      self.updateFlag = true;
    }

  }

  createMap(countries: string[]) {
    this.chartOptions = {

      chart: {
        map: worldMap,
        // borderWidth: 1

        // events: {
        //   load: function () {
        //     this.series[0].data = this.series[0].data.map((el) => {
        //       // console.log(el);
        //       if (countries.includes(el['hc-key'])) {
        //         el.color = '#A9A9A9';
        //         return el;
        //       }
        //       return el;
        //     });
        //     this.update({
        //       series: [{
        //         data: this.series[0].data as Highcharts.Point[],
        //       } as Highcharts.SeriesOptionsType]
        //     });
        //   }
        // }
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
        enabled: false
      },

      series: [{
        name: 'Country',
        type: 'map',
        data: [],
        tooltip: {
          headerFormat: '',
          pointFormat: '{point.name}'
        }
      }]

    }
  }

}
