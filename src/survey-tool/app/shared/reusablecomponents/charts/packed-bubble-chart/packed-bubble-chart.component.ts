import { Component, Input, SimpleChanges } from "@angular/core";
import * as Highcharts from 'highcharts';
import { PointOptionsType } from "highcharts";
import { SeriesOptionsType } from "highcharts/highmaps";
// import PackedBubble from 'highcharts/modules/packed-bubble';

// PackedBubble(Highcharts);

@Component({
  selector: "app-packed-bubble-chart",
  template: '<highcharts-chart [Highcharts]="Highcharts" [options]="chartOptions" [callbackFunction]="chartCallback" style="width: 100%; height: 100%; display: block;"></highcharts-chart>',
})

export class PackedBubbleChartComponent {
  @Input() series: SeriesOptionsType[] = []

  Highcharts: typeof Highcharts = Highcharts;
  chart!: Highcharts.Chart;
  chartOptions: Highcharts.Options = {
    chart: {
      type: 'packedbubble',
      height: '100%'
    },
    title: {
      text: 'Open Science by Theme in Europe',
      align: 'left'
    },
    tooltip: {
      useHTML: true,
      pointFormat: '<b>{point.name}:</b> {point.value}'
    },
    plotOptions: {
      packedbubble: {
        minSize: '30%',
        maxSize: '120%',
        // zMin: 0,
        // zMax: 1000,
        layoutAlgorithm: {
          splitSeries: false,
          gravitationalConstant: 0.02
        },
        dataLabels: {
          enabled: true,
          format: '{point.name}',
          filter: {
            property: 'y',
            operator: '>',
            value: 250
          },
          style: {
            color: 'black',
            textOutline: 'none',
            fontWeight: 'normal'
          }
        }
      }
    },
    credits: {
      enabled: false
    },
    series: this.series
  }

  ngOnChanges(changes: SimpleChanges) {
    this.updateChart();
  }

  updateChart() {
    if (this.chart) {
      this.chart.update({
        series: [{
          name: 'Open Access Publication',
          data: [
            {
              name: 'Germany',
              value: 107767
            },
            {
              name: 'Croatia',
              value: 100020
            },
            {
              name: 'Belgium',
              value: 45097
            },
            {
              name: 'Czech Republic',
              value: 100111
            },
            {
              name: 'Netherlands',
              value: 100158
            },
            {
              name: 'Spain',
              value: 80241
            },
            {
              name: 'Ukraine',
              value: 100249
            },
            {
              name: 'Poland',
              value: 100298
            },
            {
              name: 'France',
              value: 120323
            },
            {
              name: 'Romania',
              value: 78000
            },
            {
              name: 'United Kingdom',
              value: 41501.4
            }, {
              name: 'Turkey',
              value: 35300.2
            }, {
              name: 'Italy',
              value: 100337.6
            },
            {
              name: 'Greece',
              value: 99971.1
            },
            {
              name: 'Austria',
              value: 99969.8
            },
            {
              name: 'Belarus',
              value: 77767.7
            },
            {
              name: 'Serbia',
              value: 150059.3
            },
            {
              name: 'Finland',
              value: 147454.8
            },
            {
              name: 'Bulgaria',
              value: 204451.2
            },
            {
              name: 'Portugal',
              value: 44548.3
            },
            {
              name: 'Norway',
              value: 44444.4
            },
            {
              name: 'Sweden',
              value: 44.3
            },
            {
              name: 'Hungary',
              value: 43.7
            },
            {
              name: 'Switzerland',
              value: 40.2
            },
            {
              name: 'Denmark',
              value: 40
            },
            {
              name: 'Slovakia',
              value: 34.7
            },
            {
              name: 'Ireland',
              value: 34.6
            },
            {
              name: 'Croatia',
              value: 20.7
            },
            {
              name: 'Estonia',
              value: 19.4
            },
            {
              name: 'Slovenia',
              value: 16.7
            },
            {
              name: 'Lithuania',
              value: 12.3
            },
            {
              name: 'Luxembourg',
              value: 10.4
            },
            {
              name: 'Macedonia',
              value: 9.5
            },
            {
              name: 'Moldova',
              value: 7.8
            },
            {
              name: 'Latvia',
              value: 7.5
            },
            {
              name: 'Cyprus',
              value: 7.2
            }
          ]
        }, {
          name: 'Open Data',
          data: [
            {
              name: 'Senegal',
              value: 8.2
            },
            {
              name: 'Cameroon',
              value: 9.2
            },
            {
              name: 'Zimbabwe',
              value: 13.1
            },
            {
              name: 'Ghana',
              value: 14.1
            },
            {
              name: 'Kenya',
              value: 14.1
            },
            {
              name: 'Sudan',
              value: 17.3
            },
            {
              name: 'Tunisia',
              value: 24.3
            },
            {
              name: 'Angola',
              value: 25
            },
            {
              name: 'Libya',
              value: 50.6
            },
            {
              name: 'Ivory Coast',
              value: 7.3
            },
            {
              name: 'Morocco',
              value: 60.7
            },
            {
              name: 'Ethiopia',
              value: 8.9
            },
            {
              name: 'United Republic of Tanzania',
              value: 9.1
            },
            {
              name: 'Nigeria',
              value: 93.9
            },
            {
              name: 'South Africa',
              value: 392.7
            }, {
              name: 'Egypt',
              value: 225.1
            }, {
              name: 'Algeria',
              value: 141.5
            }
          ]
        }, {
          name: 'Open Software',
          data: [
            {
              name: 'Australia',
              value: 409.4
            },
            {
              name: 'New Zealand',
              value: 34.1
            },
            {
              name: 'Papua New Guinea',
              value: 7.1
            }
          ]
        }, {
          name: 'Services offered through EOSC',
          data: [
            {
              name: 'Costa Rica',
              value: 7.6
            },
            {
              name: 'Honduras',
              value: 8.4
            },
            {
              name: 'Jamaica',
              value: 8.3
            },
            {
              name: 'Panama',
              value: 10.2
            },
            {
              name: 'Guatemala',
              value: 12
            },
            {
              name: 'Dominican Republic',
              value: 23.4
            },
            {
              name: 'Cuba',
              value: 30.2
            },
            {
              name: 'USA',
              value: 5334.5
            }, {
              name: 'Canada',
              value: 566
            }, {
              name: 'Mexico',
              value: 456.3
            }
          ]
        }, {
          name: 'Number of signatories of the Agreement on Reforming Research Assessment',
          data: [
            {
              name: 'El Salvador',
              value: 7.2
            },
            {
              name: 'Uruguay',
              value: 8.1
            },
            {
              name: 'Bolivia',
              value: 17.8
            },
            {
              name: 'Trinidad and Tobago',
              value: 34
            },
            {
              name: 'Ecuador',
              value: 43
            },
            {
              name: 'Chile',
              value: 78.6
            },
            {
              name: 'Peru',
              value: 52
            },
            {
              name: 'Colombia',
              value: 74.1
            },
            {
              name: 'Brazil',
              value: 501.1
            }, {
              name: 'Argentina',
              value: 199
            },
            {
              name: 'Venezuela',
              value: 195.2
            }
          ]
        }, {
          name: 'Citizen Science projects',
          data: [
            {
              name: 'Nepal',
              value: 6.5
            },
            {
              name: 'Georgia',
              value: 6.5
            },
            {
              name: 'Brunei Darussalam',
              value: 7.4
            },
            {
              name: 'Kyrgyzstan',
              value: 7.4
            },
            {
              name: 'Afghanistan',
              value: 7.9
            },
            {
              name: 'Myanmar',
              value: 9.1
            },
            {
              name: 'Mongolia',
              value: 14.7
            },
            {
              name: 'Sri Lanka',
              value: 16.6
            },
            {
              name: 'Bahrain',
              value: 20.5
            },
            {
              name: 'Yemen',
              value: 22.6
            },
            {
              name: 'Jordan',
              value: 22.3
            },
            {
              name: 'Lebanon',
              value: 21.1
            },
            {
              name: 'Azerbaijan',
              value: 31.7
            },
            {
              name: 'Singapore',
              value: 47.8
            },
            {
              name: 'Hong Kong',
              value: 49.9
            },
            {
              name: 'Syria',
              value: 52.7
            },
            {
              name: 'DPR Korea',
              value: 59.9
            },
            {
              name: 'Israel',
              value: 64.8
            },
            {
              name: 'Pakistan',
              value: 158.1
            },
            {
              name: 'Vietnam',
              value: 190.2
            },
            {
              name: 'United Arab Emirates',
              value: 201.1
            },
            {
              name: 'Malaysia',
              value: 227.5
            },
            {
              name: 'Kazakhstan',
              value: 236.2
            },
            {
              name: 'Thailand',
              value: 272
            },
            {
              name: 'Taiwan',
              value: 276.7
            },
            {
              name: 'Indonesia',
              value: 453
            },
            {
              name: 'Saudi Arabia',
              value: 494.8
            },
            {
              name: 'Japan',
              value: 1278.9
            },
            {
              name: 'China',
              value: 10540.8
            },
            {
              name: 'India',
              value: 2341.9
            },
            {
              name: 'Russia',
              value: 1766.4
            },
            {
              name: 'Iran',
              value: 618.2
            },
            {
              name: 'Korea',
              value: 610.1
            }]
        }] as SeriesOptionsType[]
      }, true, true);
    }
  }

  chartCallback = (chart: Highcharts.Chart) => {
    this.chart = chart;
    this.updateChart(); // Ensure the chart is updated on initialization
  };

}
