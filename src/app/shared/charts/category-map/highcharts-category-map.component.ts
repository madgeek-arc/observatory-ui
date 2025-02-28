import * as Highcharts from "highcharts/highmaps";
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from "@angular/core";
import { SeriesOptionsType } from "highcharts/highmaps";
import { CategorizedAreaData } from "../../../domain/categorizedAreaData";
import { PremiumSortPipe } from "../../pipes/premium-sort.pipe";
import HC_ExportingOffline from 'highcharts/modules/offline-exporting';
import HC_exporting from 'highcharts/modules/exporting';

HC_exporting(Highcharts);
HC_ExportingOffline(Highcharts);

declare var require: any;
const worldMap = require('@highcharts/map-collection/custom/world-highres3.topo.json');

@Component({
  selector: 'app-highcharts-category-map',
  templateUrl: './highcharts-category-map.component.html',
  styles: ['#container { display: block; width: 100%; height: 100%; }']
})

export class HighchartsCategoryMapComponent implements OnInit, OnChanges {

  @Input() mapData: CategorizedAreaData = null;
  @Input() title: string = null;
  @Input() subtitle: string = null;
  @Input() pointFormat: string = null;
  @Input() mapType: string = null;
  @Input() toolTipData: Map<string, string> = new Map;
  @Input() customLabelText?: string = undefined;
  @Input() backgroundColor?: string = undefined;
  @Input() caption?: string = undefined;

  @Output() mapClick = new EventEmitter<any>();

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
    if(!this.backgroundColor)
      this.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--medium-grey');
    this.createMap();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.ready = false;
    if (this.mapData) {
      const self = this, chart = this.chart;
      // chart.showLoading();
      self.chartOptions.series = [];
      if (this.subtitle) {
        self.chartOptions.subtitle.text = this.subtitle;
      }
      if (this.pointFormat) {
        self.chartOptions.plotOptions.map.tooltip.pointFormat = this.pointFormat;
      }
      if (this.mapType === 'Categorization') {
        for (let i = 0; i < this.mapData.series.length; i++) {
          this.premiumSort.transform(this.mapData.series, this.datasetOrder);
          this.mapData.series[i].color = this.colorPallet[this.datasetOrder.indexOf(this.mapData.series[i].name)];
        }
      } else {
        if (this.mapData.series[0] && !this.mapData.series[0].color)
          this.mapData.series[0].color = '#008792';
        if (this.mapData.series[1] && !this.mapData.series[1].color)
          this.mapData.series[1].color = this.colorPallet[4];
      }

      if (this.mapData.series[0])
        this.mapData.series[0].allAreas = true;

      setTimeout(() => {
        self.chartOptions.title.text = this.title;
        self.chartOptions.series = this.mapData.series as SeriesOptionsType[];
        // console.log(this.mapData.series);
        // console.log(self.chartOptions.series)
        // chart.hideLoading();
        this.ready = true;
        self.updateFlag = true;
      }, 0);

    }
  }

  createMap() {
    const that = this;

    this.chartOptions = {

      chart: {
        map: worldMap,
        spacingBottom: 20,
        backgroundColor: this.backgroundColor,
        events: {
          // load: function () {
          //   // Create a custom info box
          //   const infoBox = document.createElement('div');
          //   infoBox.innerHTML = 'Custom Info Box';
          //   infoBox.style.position = 'absolute';
          //   infoBox.style.top = '130px';
          //   infoBox.style.right = '30px';
          //   infoBox.style.backgroundColor = 'white';
          //   infoBox.style.padding = '10px';
          //   infoBox.style.border = '1px solid #ccc';
          //   infoBox.style.zIndex = '1000'; // Ensure it's on top
          //   this.container.appendChild(infoBox);
          // }
          load: function () {

            // const customLabelText = 'Custom Info Box <br>with <strong>Variable</strong>';
            if (that.customLabelText) {
              // Define your custom label text
              const infoBox = this.renderer.label(that.customLabelText, 10, 10, null, null, null, true)
                .attr({
                  fill: '#AAD3D7',
                  padding: 10,
                  zIndex: 5,
                  borderWidth: 1,
                  borderColor: '#AAD3D7',
                  borderRadius: 30
                })
                .css({
                  color: '#333',
                  borderRadius: 30
                })
                .add();

              // Position the info box in the top right corner
              infoBox.translate(this.plotWidth - 180, 130);
            }

            // const chart = this;
            //
            // const customLabelHTML = '<strong>Custom Info Box</strong><br><em>Styled with HTML</em>';
            //
            // // Create a div for the custom info box
            // const infoBox = document.createElement('div');
            // infoBox.innerHTML = customLabelHTML;
            // infoBox.style.position = 'absolute';
            // infoBox.style.top = '130px';
            // infoBox.style.right = '30px';
            // infoBox.style.backgroundColor = '#f9f9f9'; // Custom background color
            // infoBox.style.padding = '10px';
            // infoBox.style.border = '1px solid #ccc';
            // infoBox.style.borderRadius = '5px';
            // infoBox.style.zIndex = '1000'; // Ensure it's on top
            // infoBox.style.color = '#333';
            // infoBox.style.fontSize = '14px';
            //
            // // Append the info box to the chart container
            // chart.container.appendChild(infoBox);
          }
        }
      },
      mapView: {
        center: [15, 50],
        zoom: 4.1
      },

      title: {
        text: this.title,
        // verticalAlign: 'bottom',
        // y: -5 // Adjusts the vertical position of the title
      },

      subtitle: {
        text: this.subtitle
      },

      caption: {
        text: this.caption
      },

      credits: {
        enabled: false
      },

      mapNavigation: {
        enabled: true,
        buttonOptions: {
          alignTo: "spacingBox"
        },
        enableMouseWheelZoom: false
      },

      legend: {
        enabled: true,
        layout: 'horizontal',
        verticalAlign: 'top',
        accessibility: {
          enabled: true
        }
      },

      tooltip: {
        formatter: function () {
          let comment = that.toolTipData.get(this?.point?.properties?.['iso-a2'].toLowerCase()) ? that.toolTipData.get(this.point.properties['iso-a2'].toLowerCase()):'';
          comment = comment.replace(/\\n/g,'<br>');
          comment = comment.replace(/\\t/g,' ');

          let areas: string = '<br>'; // Open science Areas for merged monitoring/policy maps
          this.point.series.userOptions.custom[this.point['code']]?.forEach((item: string) => {
            areas = areas.concat(item,'<br>');
          });

          return '<b>'+this.point.name+'</b>' + (comment ?  '<br><br>' + '<p>'+comment+'</p>' : '') + areas;
        },
      },

      plotOptions: {
        map: {
          joinBy: ['iso-a2', 'code'],
          tooltip: {
            headerFormat: '',
            pointFormat: '{point.name}'
          }
        },
        series: {
          events: {
            legendItemClick: function(e) {
              // console.log(e);
              e.preventDefault(); // disable legend item click
            }
          },
          point: {
            events: {
              click: function () {
                // console.log(this);
                that.mapClick.emit(this.options);
              },
            }
          }
        }
      },

      series: [] as SeriesOptionsType[],
      exporting: {
        sourceWidth: 1200,
        sourceHeight: 800,
        // chartOptions: {
        //   // Include the custom info box in the export
        //   chart: {
        //     events: {
        //       load: function () {
        //         const infoBox = document.createElement('div');
        //         infoBox.innerHTML = 'Custom Info Box';
        //         infoBox.style.position = 'absolute';
        //         infoBox.style.top = '130px';
        //         infoBox.style.right = '30px';
        //         infoBox.style.backgroundColor = 'white';
        //         infoBox.style.padding = '10px';
        //         infoBox.style.border = '1px solid #ccc';
        //         infoBox.style.zIndex = '1000';
        //         this.container.appendChild(infoBox);
        //       }
        //     }
        //   }
        // }
        // scale: 1,
      }
    }
  }

}
