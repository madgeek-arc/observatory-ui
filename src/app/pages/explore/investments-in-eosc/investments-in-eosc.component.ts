import { Component, OnInit } from "@angular/core";
import {PointOptionsObject, SeriesBubbleOptions} from "highcharts";
import {zip} from "rxjs/internal/observable/zip";
import {RawData} from "../../../../survey-tool/app/domain/raw-data";
import {EoscReadinessDataService} from "../../services/eosc-readiness-data.service";
import {countriesNumbers} from "../../eosc-readiness-dashboard/eosc-readiness-2022/eosc-readiness2022-map-subtitles";


// declare var UIkit;

@Component({
  selector: 'app-investments-in-eosc',
  templateUrl: './investments-in-eosc.component.html',
})

export class InvestmentsInEoscComponent implements OnInit {

  year = '2022';

  treeGraph: PointOptionsObject[] = [];

  variablePie = [{
    minPointSize: 10,
    innerSize: '20%',
    zMin: 0,
    name: 'countries',
    borderRadius: 5,
    data: [{
      name: 'Repositories',
      y: 50,
      z: 92
    }, {
      name: 'Citizen Science',
      y: 55,
      z: 119
    }, {
      name: 'Services in EOSC',
      y: 31,
      z: 121
    }, {
      name: 'Software',
      y: 7,
      z: 136
    }, {
      name: 'Open Data',
      y: 30,
      z: 200
    }, {
      name: 'FAIR Data',
      y: 41,
      z: 213
    }, {
      name: 'Open Acess',
      y: 35,
      z: 235
    }],
    colors: [
      '#4caefe',
      '#3dc3e8',
      '#2dd9db',
      '#1feeaf',
      '#0ff3a0',
      '#00e887',
      '#23e274'
    ]
  }];

  pieTooltip = {
    headerFormat: '',
    pointFormat: '<span style="color:{point.color}">\u25CF</span> <b> ' +
      '{point.name}</b><br/>' +
      'Investment in millions of Euroso: <b>{point.y}</b><br/>'
  }

  bubbleWithPlotLines = [{
    type: 'bubble',
    data: [
      {x: 95, y: 95, z: 13.8, name: 'BE', country: 'Belgium'},
      {x: 86.5, y: 102.9, z: 14.7, name: 'DE', country: 'Germany'},
      {x: 80.8, y: 91.5, z: 15.8, name: 'FI', country: 'Finland'},
      {x: 80.4, y: 102.5, z: 12, name: 'NL', country: 'Netherlands'},
      {x: 80.3, y: 86.1, z: 11.8, name: 'SE', country: 'Sweden'},
      {x: 78.4, y: 70.1, z: 16.6, name: 'ES', country: 'Spain'},
      {x: 74.2, y: 68.5, z: 14.5, name: 'FR', country: 'France'},
      {x: 73.5, y: 83.1, z: 10, name: 'NO', country: 'Norway'},
      {x: 71, y: 93.2, z: 24.7, name: 'UK', country: 'United Kingdom'},
      {x: 69.2, y: 57.6, z: 10.4, name: 'IT', country: 'Italy'},
      {x: 68.6, y: 20, z: 16, name: 'RU', country: 'Russia'},
      {x: 65.5, y: 126.4, z: 35.3, name: 'US', country: 'United States'},
      {x: 65.4, y: 50.8, z: 28.5, name: 'HU', country: 'Hungary'},
      {x: 63.4, y: 51.8, z: 15.4, name: 'PT', country: 'Portugal'},
      {x: 64, y: 82.9, z: 31.3, name: 'NZ', country: 'New Zealand'}
    ]
  }] as unknown as SeriesBubbleOptions[];

  constructor(private queryData: EoscReadinessDataService) {
  }

  ngOnInit() {
    this.getRanges();
  }

  getRanges() {
    zip(
      this.queryData.getQuestion(this.year, 'Question5'),
      this.queryData.getQuestionComment(this.year, 'Question5'),
    ).subscribe(
      res => {
        this.treeGraph = this.createRanges(res[0]);
        // console.log(this.treeGraph);
        // console.log(this.dataHandlerService.covertRawDataToColorAxisMap(res[1]));
      }
    );
  }

  createRanges(data: RawData) {
    const arr = [
      {
        id: '0.0',
        parent: '',
        name: 'Country investments'
      },
      {
        id: '1.1',
        parent: '0.0',
        name: '< 1 M'
      },
      {
        id: '1.2',
        parent: '0.0',
        name: '1-5 M'
      },
      {
        id: '1.3',
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
      }

    ];

    let count = 0;

    data.datasets[0].series.result.forEach((element: any) => {
      // console.log(element.row[1]);
      // console.log(isNumeric(element.row[1]));

      if (!this.isNumeric(element.row[1]))
        return;

      if (+element.row[1] === 0)
        return;

      count++;
      let countryName = this.findCountryName(element.row[0]).name;

      let item = {
        id: '2.'+count,
        parent: '1.',
        name: countryName,
        y: +element.row[1]
      }

      if (+element.row[1] < 1) {
        item.parent = '1.1';
      } else if (+element.row[1] < 5) {
        item.parent = '1.2';
      } else if (+element.row[1] < 10) {
        item.parent = '1.3';
      } else if (+element.row[1] < 20) {
        item.parent = '1.4';
      } else if (+element.row[1] >= 20) {
        item.parent = '1.5';
      }

      // console.log(item);
      arr.push(item);

    });

    // console.log(arr);
    return arr;

  }

  findCountryName(code: string) {
    return countriesNumbers.find(
      elem => elem.id === code
    );
  }

  isNumeric(value: string): boolean {
    // Check if the value is empty
    if (value.trim() === '') {
      return false;
    }

    // Attempt to parse the value as a float
    const number = parseFloat(value);

    // Check if parsing resulted in NaN or the value has extraneous characters
    return !isNaN(number) && isFinite(number) && String(number) === value;
  }
}
