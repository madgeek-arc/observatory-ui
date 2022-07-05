import {Component, Input, OnChanges, SimpleChanges} from "@angular/core";
import * as Highcharts from "highcharts/highmaps";
import HC_exporting from 'highcharts/modules/exporting';
import {SeriesMapbubbleOptions} from "highcharts";

HC_exporting(Highcharts);

declare var require: any;
const worldMap = require('@highcharts/map-collection/custom/world-highres3.topo.json');


@Component({
  selector: 'app-highcharts-bubble-map',
  templateUrl: 'highcharts-bubble-map.component.html'
})

export class HighchartsBubbleMapComponent implements OnChanges {
  @Input() legend: string[] = null;
  @Input() series: any[] = null;

  chart;
  chartCallback;
  updateFlag = false;
  Highcharts: typeof Highcharts = Highcharts;
  chartConstructor = "mapChart";
  ready = false;
  chartOptions: Highcharts.Options
  colorPallet = ['#2A9D8F', '#E9C46A', '#F4A261', '#E76F51', '#A9A9A9'];
  bubbleData = [{ id: "NO", name: "NO", z: 0.2 }, { id: "TR", name: "NO", z: 0.9 }];

  data: any;
  activeView = 0;

  constructor() {}

  ngOnChanges(changes: SimpleChanges) {
    const self = this;
    if (this.legend && this.series) {
      this.chartCallback = chart => {
        // saving chart reference
        self.chart = chart;
        // console.log(self.chart);
      };
      this.loadMap(this.series[0], this.legend[0], this.colorPallet[0])
      // this.changeView(0);
      this.ready = true;
    }
  }

  changeView(view: number) {
    const self = this, chart = this.chart;
    this.ready = false;
    this.activeView = view;
    // setTimeout(() => {
    console.log(this.chartOptions.series[1]['data']);
    console.log(this.series[view]);
    // @ts-ignore
    self.chartOptions.series[1] = {
      name: this.legend[view],
      color: this.colorPallet[view],
      data: this.series[view]
    };
    console.log(this.chartOptions.series[1]['data']);
    self.updateFlag = true;
    this.ready = true
    // }, 0);
    // this.loadMap(this.series[view], 'test', 'red');
    // this.updateMapData();
  }

  loadMap(data, seriesName, seriesColor) {
    this.chartOptions = {
      chart: {
        map: worldMap,
        // events: {
        //   click: event => {
        //     console.log(event);
        //   }
        // }
      },

      mapView: {
        center: [30, 51],
        zoom: 3.5
      },

      title: {
        text: ""
      },

      plotOptions: {
        series: {
          // general options for all series
          cursor: 'pointer',
          events: {
            // click: event => {
            //   console.log(event);
            // }
          }
        },
        mapbubble: {
          // shared options for all mapbubble series
        }
      },

      legend: {
        enabled: false
      },

      series: [
        {
          type: "map",
          name: "Countries",
          borderColor: '#fff',
          negativeColor: 'rgba(139,151,167,0.2)',
          enableMouseTracking: false
        },
        {
          type: "mapbubble",
          name: seriesName,
          color: seriesColor,
          // @ts-ignore
          joinBy: ["iso-a2", "id"],
          data: data,
          marker: {
            fillOpacity: 0.6,
          },
          states: {
            hover: {
              brightness: 0.7,
              borderWidth: 7
            }
          },
          dataLabels: {
            enabled: true,
            style: {
              color: '#fff',
              fontSize: '13px',
              fontWeight: 'bold',
              // textOutline: '1px #a1a1a1'
              textOutline: '1px #000'
            },
            allowOverlap: true,
            formatter: function () {
              // return this.point.z.toFixed(1) + '%';
              return this.point['z'].toLocaleString();
            }
          },
          tooltip: {
            headerFormat: '<span style="font-size: 120%; font-weight: bold; margin-bottom: 15px">{point.key}</span><br>',
            pointFormat: '{point.z} {series.name}',
          }
        }
      ]
    };
  }

}
