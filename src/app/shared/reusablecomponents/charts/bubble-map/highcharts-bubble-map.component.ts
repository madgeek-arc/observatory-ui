import {Component, Input} from "@angular/core";
import * as Highcharts from "highcharts/highmaps";
import HC_exporting from 'highcharts/modules/exporting';
import {SeriesMapbubbleDataOptions, SeriesMapbubbleOptions} from "highcharts";

HC_exporting(Highcharts);

declare var require: any;
const worldMap = require('@highcharts/map-collection/custom/world-highres3.geo.json');


@Component({
  selector: 'app-highcharts-bubble-map',
  templateUrl: 'highcharts-bubble-map.component.html'
})

export class HighchartsBubbleMapComponent {
  @Input() legend: string[] = null;
  @Input() series: any[] = null;

  chart;
  chartCallback;
  updateFlag = false;
  Highcharts: typeof Highcharts = Highcharts;
  chartConstructor = "mapChart";
  ready = false;
  chartOptions: Highcharts.Options
  bubbleData = [{ id: "NO", name: "NO", z: 0.2 }, { id: "TR", name: "NO", z: 0.9 }];

  data: any;
  activeView = 0;

  constructor() {
    const self = this;
    this.loadMap(this.bubbleData, 'test', 'red');

    this.chartCallback = chart => {
      // saving chart reference
      self.chart = chart;
      // console.log(self.chart);
    };
  }

  changeView(view: number) {
    const self = this, chart = this.chart;
    this.activeView = view;
    console.log(self.chartOptions.series[1]);
    console.log(this.series[view]);
    setTimeout(() => {
      self.chartOptions.series[1]['data'] = this.series[view] as SeriesMapbubbleDataOptions;
      self.updateFlag = true;
    }, 0);
    // this.loadMap(this.series[view], 'test', 'red');
    // this.updateMapData();
  }

  loadMap(data, seriesName, seriesColor) {
    this.chartOptions = {
      chart: {
        borderWidth: 1,
        map: worldMap,
        events: {
          load: event => {
            console.log(this.chartOptions.series)
            this.chart.mapZoom(0.24);
            // this.chart.update()
          }
        }
      },

      title: {
        text: ""
      },

      plotOptions: {
        series: {
          cursor: 'pointer',
          events: {
            click: event => {
              console.log(event);
            }
          }
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
        } as unknown as SeriesMapbubbleOptions
      ]
    };
  }

}
