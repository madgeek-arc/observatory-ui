import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import * as Highcharts from "highcharts";
import treemap from 'highcharts/modules/treemap';
import treegraph from 'highcharts/modules/treegraph';
import HC_more from 'highcharts/highcharts-more';
import { PointOptionsObject, SeriesOptions, SeriesOptionsType } from "highcharts";

treemap(Highcharts);
HC_more(Highcharts);
treegraph(Highcharts);


@Component({
  selector: "app-tree-graph",
  template: '<highcharts-chart [Highcharts]="Highcharts" [options]="chartOptions" [callbackFunction]="chartCallback" style="width: 100%; height: 100%; display: block;"></highcharts-chart>',
})


export class TreeGraphComponent implements OnChanges {
  @Input() data: PointOptionsObject[] = [];

  Highcharts: typeof Highcharts = Highcharts;
  chart!: Highcharts.Chart;
  chartOptions: Highcharts.Options = {
    title: {
      text: 'Treegraph with box layout'
    },
    series: [
      {
        type: 'treegraph',
        data: this.data,
        tooltip: {
          pointFormat: '{point.name}'
        },
        marker: {
          symbol: 'rect',
          width: '25%'
        },
        borderRadius: 10,
        dataLabels: {
          format: '{point.name}',
          style: {
            whiteSpace: 'nowrap'
          }
        },
        levels: [
          {
            level: 1,
            levelIsConstant: false
          },
          {
            level: 2,
            colorByPoint: true
          },
          {
            level: 3,
            colorVariation: {
              key: 'brightness',
              to: -0.5
            }
          },
          {
            level: 4,
            colorVariation: {
              key: 'brightness',
              to: 0.5
            }
          }
        ]
      } as unknown as  Highcharts.SeriesTreegraphOptions
    ]
  }
  // chartOptions: Highcharts.Options = {
  //   chart: {
  //     type: 'treegraph'
  //   },
  //   title: {
  //     text: 'Treegraph Example'
  //   },
  //   series: [{
  //     type: 'treegraph',
  //     data: [],
  //     tooltip: {
  //       pointFormat: '{point.name}'
  //     },
  //     marker: {
  //       symbol: 'rect',
  //       width: '25%'
  //     },
  //     borderRadius: 10,
  //     dataLabels: {
  //       format: '{point.name}',
  //       style: {
  //         whiteSpace: 'nowrap'
  //       }
  //     },
  //     levels: [
  //       {
  //         level: 1,
  //         levelIsConstant: false
  //       },
  //       {
  //         level: 2,
  //         colorByPoint: true
  //       },
  //       {
  //         level: 3,
  //         colorVariation: {
  //           key: 'brightness',
  //           to: -0.5
  //         }
  //       },
  //       {
  //         level: 4,
  //         colorVariation: {
  //           key: 'brightness',
  //           to: 0.5
  //         }
  //       }
  //     ]
  //   }],
  //   plotOptions: {
  //     series: {
  //       dataLabels: {
  //         enabled: true,
  //         format: '{point.name}'
  //       }
  //     }
  //   }
  // }

  ngOnChanges(changes: SimpleChanges) {
    this.updateChart();
  }

  updateChart() {
    if (this.chart) {
      this.chart.update({
        series: [{
          data: [
            {
              id: '0.0',
              parent: '',
              name: 'Country investments'
            },
            {
              id: '1.3',
              parent: '0.0',
              name: '< 1 M'
            },
            {
              id: '1.1',
              parent: '0.0',
              name: '1-5 M'
            },
            {
              id: '1.2',
              parent: '0.0',
              name: '5-10 M'
            },
            {
              id: '1.4',
              parent: '0.0',
              name: '10-20M'
            },
            {
              id: '1.5',
              parent: '0.0',
              name: '> 20 M'
            },

            /* 1-5M */
            {
              id: '2.9',
              parent: '1.1',
              name: 'Bulgaria'
            },

            {
              id: '2.8',
              parent: '1.1',
              name: 'Poland'
            },

            {
              id: '2.7',
              parent: '1.1',
              name: 'Estonia'
            },

            {
              id: '2.6',
              parent: '1.1',
              name: 'Denmark'
            },


            /* 5-10M */
            {
              id: '2.4',
              parent: '1.2',
              name: 'Norway'
            },

            /* <1 */
            {
              id: '2.13',
              parent: '1.3',
              name: 'Slovenia'
            },

            {
              id: '2.11',
              parent: '1.3',
              name: 'Serbia'
            },

            {
              id: '2.12',
              parent: '1.3',
              name: 'Greece'
            },

            {
              id: '2.14',
              parent: '1.3',
              name: 'Bosnia and Herzegovina'
            },

            {
              id: '2.10',
              parent: '1.3',
              name: 'Turkey'
            },
            {
              id: '2.10',
              parent: '1.3',
              name: 'Slovakia'
            },
            {
              id: '2.10',
              parent: '1.3',
              name: 'Ukraine'
            },
            {
              id: '2.10',
              parent: '1.3',
              name: 'Latvia'
            },
            {
              id: '2.10',
              parent: '1.3',
              name: 'Luxembourg'
            },
            {
              id: '2.10',
              parent: '1.3',
              name: 'Georgia'
            },
            {
              id: '2.10',
              parent: '1.3',
              name: 'Cyprus'
            },

            /* 10-20 */
            {
              id: '2.15',
              parent: '1.4',
              name: 'Ireland'
            },

            /* >20 M */
            {
              id: '2.19',
              parent: '1.5',
              name: 'Czech Republic'
            },

            {
              id: '2.20',
              parent: '1.5',
              name: 'Finland'
            },

            {
              id: '2.21',
              parent: '1.5',
              name: 'France'
            },

            {
              id: '2.22',
              parent: '1.5',
              name: 'Spain'
            },
            {
              id: '2.22',
              parent: '1.5',
              name: 'Germany'
            },
            {
              id: '2.22',
              parent: '1.5',
              name: 'Netherlands'
            }
          ]

        }] as SeriesOptionsType[]
      }, true, true);
    } else {

    }
  }


  chartCallback = (chart: Highcharts.Chart) => {
    this.chart = chart;
    this.updateChart(); // Ensure the chart is updated on initialization

  };

}
