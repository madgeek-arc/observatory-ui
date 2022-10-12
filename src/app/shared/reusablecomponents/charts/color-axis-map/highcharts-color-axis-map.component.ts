import * as Highcharts from "highcharts/highmaps";
import HC_exporting from 'highcharts/modules/exporting';
import HC_ExportingOffline from 'highcharts/modules/offline-exporting';
import {Component, Input, SimpleChanges} from "@angular/core";
import {CategorizedAreaData} from "../../../../domain/categorizedAreaData";
import {SeriesOptionsType} from "highcharts/highmaps";

HC_exporting(Highcharts);
HC_ExportingOffline(Highcharts);

declare var require: any;
const worldMap = require('@highcharts/map-collection/custom/world-highres3.topo.json');


@Component({
  selector: 'app-highcharts-color-axis',
  templateUrl: 'highcharts-color-axis-map.component.html'
})

export class HighchartsColorAxisMapComponent {

  @Input() mapData: CategorizedAreaData = null;
  @Input() title: string = null;
  @Input() subtitle: string = null;

  chart;
  chartCallback;
  updateFlag = false;
  Highcharts: typeof Highcharts = Highcharts;
  chartConstructor = "mapChart";
  chartOptions: Highcharts.Options;

  ready: boolean = false;

  constructor() {
    const self = this;

    this.createMap();
    this.chartCallback = chart => {
      // saving chart reference
      self.chart = chart;
      // console.log(self.chart);
    };
  }

  ngOnChanges(changes: SimpleChanges) {
    this.ready = false;
    const self = this, chart = this.chart;

    setTimeout(() => {
      self.chartOptions.title.text = this.title;
      self.chartOptions.subtitle.text = this.subtitle;
      // self.chartOptions.series = this.mapData.series as SeriesOptionsType[];
      // console.log(self.chartOptions.series)
      // chart.hideLoading();
      this.ready = true;
      self.updateFlag = true;
    }, 0);
  }

  createMap() {
    this.chartOptions = {
    chart: {
      map: worldMap
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
    mapNavigation: {
      enabled: false,
      buttonOptions: {
        alignTo: "spacingBox"
      }
    },
    legend: {
      enabled: true
    },
    colorAxis: {
      min: 0
    },
    plotOptions: {
      series: {
        point: {
          events: {
            click: function () {
              console.log(this);
            },
          }
        }
      }
    },
    series: [
      {
        type: "map",
        name: "Random data",
        states: {
          hover: {
            color: "#BADA55"
          }
        },
        dataLabels: {
          enabled: true,
          // format: "{point.value}",
          formatter: function () {
            if (this.point.value > 0)
              return this.point.value;
            else
              return '';
          }
        },
        allAreas: false,
        data: [
          ["fo", 0],
          ["um", 1],
          ["us", 2],
          ["jp", 3],
          ["sc", 4],
          ["in", 5],
          ["fr", 6],
          ["fm", 7],
          ["cn", 8],
          ["pt", 9],
          ["sw", 10],
          ["sh", 11],
          ["br", 12],
          ["ki", 13],
          ["ph", 14],
          ["mx", 15],
          ["es", 16],
          ["bu", 17],
          ["mv", 18],
          ["sp", 19],
          ["gb", 20],
          ["gr", 21.8],
          ["as", 22],
          ["dk", 23],
          ["gl", 24],
          ["gu", 25],
          ["mp", 26],
          ["pr", 27],
          ["vi", 28],
          ["ca", 29],
          ["st", 30],
          ["cv", 31],
          ["dm", 32],
          ["nl", 33],
          ["jm", 34],
          ["ws", 35],
          ["om", 36],
          ["vc", 37],
          ["tr", 38.1],
          ["bd", 39],
          ["lc", 40],
          ["nr", 41],
          ["no", 42],
          ["kn", 43],
          ["bh", 44],
          ["to", 45],
          ["fi", 46],
          ["id", 47],
          ["mu", 48],
          ["se", 49],
          ["tt", 50],
          ["my", 51],
          ["pa", 52],
          ["pw", 53],
          ["tv", 54],
          ["mh", 55],
          ["cl", 56],
          ["th", 57],
          ["gd", 58],
          ["ee", 59],
          ["ag", 60],
          ["tw", 61],
          ["bb", 62],
          ["it", 63],
          ["mt", 64],
          ["vu", 65],
          ["sg", 66],
          ["cy", 67],
          ["lk", 68],
          ["km", 69],
          ["fj", 70],
          ["ru", 71],
          ["va", 72],
          ["sm", 73],
          ["kz", 74],
          ["az", 75],
          ["tj", 76],
          ["ls", 77],
          ["uz", 78],
          ["ma", 79],
          ["co", 80],
          ["tl", 81],
          ["tz", 82],
          ["ar", 83],
          ["sa", 84],
          ["pk", 85],
          ["ye", 86],
          ["ae", 87],
          ["ke", 88],
          ["pe", 89],
          ["do", 90],
          ["ht", 91],
          ["pg", 92],
          ["ao", 93],
          ["kh", 94],
          ["vn", 95],
          ["mz", 96],
          ["cr", 97],
          ["bj", 98],
          ["ng", 99],
          ["ir", 100],
          ["sv", 0],
          ["sl", 0],
          ["gw", 0],
          ["hr", 0],
          ["bz", 0],
          ["za", 0],
          ["cf", 0],
          ["sd", 0],
          ["cd", 0],
          ["kw", 0],
          ["de", 0],
          ["be", 0],
          ["ie", 0],
          ["kp", 0],
          ["kr", 0],
          ["gy", 0],
          ["hn", 0],
          ["mm", 0],
          ["ga", 0],
          ["gq", 0],
          ["ni", 0],
          ["lv", 0],
          ["ug", 0],
          ["mw", 0],
          ["am", 0],
          ["sx", 0],
          ["tm", 0],
          ["zm", 0],
          ["nc", 0],
          ["mr", 0],
          ["dz", 0],
          ["lt", 0],
          ["et", 0],
          ["er", 0],
          ["gh", 0],
          ["si", 0],
          ["gt", 0],
          ["ba", 0],
          ["jo", 0],
          ["sy", 0],
          ["mc", 0],
          ["al", 0],
          ["uy", 0],
          ["cnm", 0],
          ["mn", 0],
          ["rw", 0],
          ["so", 0],
          ["bo", 0],
          ["cm", 0],
          ["cg", 0],
          ["eh", 0],
          ["rs", 0],
          ["me", 0],
          ["tg", 0],
          ["la", 0],
          ["af", 0],
          ["ua", 0],
          ["sk", 0],
          ["jk", 0],
          ["bg", 0],
          ["qa", 0],
          ["li", 0],
          ["at", 0],
          ["sz", 0],
          ["hu", 0],
          ["ro", 0],
          ["ne", 0],
          ["lu", 0],
          ["ad", 0],
          ["ci", 0],
          ["lr", 0],
          ["bn", 0],
          ["iq", 0],
          ["ge", 0],
          ["gm", 0],
          ["ch", 0],
          ["td", 0],
          ["kv", 0],
          ["lb", 0],
          ["dj", 0],
          ["bi", 0],
          ["sr", 0],
          ["il", 0],
          ["ml", 0],
          ["sn", 0],
          ["gn", 0],
          ["zw", 0],
          ["pl", 0],
          ["mk", 0],
          ["py", 0],
          ["by", 0],
          ["cz", 0],
          ["bf", 0],
          ["na", 0],
          ["ly", 0],
          ["tn", 0],
          ["bt", 0],
          ["md", 0],
          ["ss", 0],
          ["bw", 0],
          ["bs", 0],
          ["nz", 0],
          ["cu", 0],
          ["ec", 0],
          ["au", 0],
          ["ve", 0],
          ["sb", 0],
          ["mg", 0],
          ["is", 0],
          ["eg", 0],
          ["kg", 0],
          ["np", 0]
        ]
      }
    ]
  }
  }

}
