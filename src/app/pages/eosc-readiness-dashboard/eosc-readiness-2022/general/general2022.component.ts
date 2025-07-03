import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { CountryTableData } from "../../../../domain/country-table-data";
import { countriesNumbers, EoscReadiness2022MapSubtitles } from "../eosc-readiness2022-map-subtitles";
import { EoscReadinessDataService } from "../../../services/eosc-readiness-data.service";
import { StakeholdersService } from "../../../../../survey-tool/app/services/stakeholders.service";
import { DataHandlerService } from "../../../services/data-handler.service";
import { RawData } from "../../../../domain/raw-data";
import { isNumeric } from "rxjs/internal-compatibility";
import { zip } from "rxjs/internal/observable/zip";
import { ColorAxisOptions, LegendOptions } from "highcharts";
import * as Highcharts from "highcharts";
import * as UIkit from 'uikit';

@Component({
  selector: 'app-general-2022',
  templateUrl: 'general2022.component.html',
  styleUrls: ['../../eosc-readiness-dashboard.component.css'],
})

export class General2022Component implements OnInit {

  type: string = null;
  year: string = null;
  fragment: string = null;

  countriesArray: string[] = [];
  toolTipData: Map<string, string>[] = [];
  tableAbsoluteDataArray: CountryTableData[][] = [];
  legend: LegendOptions;
  colorAxis: ColorAxisOptions;
  pieSeries: {name: string, type: string, data: (string | number)[][]}[];
  columnSeries: {name: string, type: string, data: (string | number)[][]}[];
  mapSubtitles: string[] = [];
  mapSubtitlesArray: string[][] = EoscReadiness2022MapSubtitles;
  questionsDataArray: any[] = [];
  tmpQuestionsDataArray: any[] = [];
  questionsDataArrayForBarChart: any[] = [];
  sumsArray: string[] = [];

  constructor(private route: ActivatedRoute, private queryData: EoscReadinessDataService,
              private stakeholdersService: StakeholdersService, private dataHandlerService: DataHandlerService) {}

  ngOnInit() {
    this.route.parent.paramMap.subscribe({
      next: value => {
        if (this.year && this.year !== value.get('year')) {
          if (this.type) {
            this.initCharts(this.type);
          }
        }
        this.year = value.get('year');
      }
    });

    this.route.params.subscribe(
      params => {
        this.type = params['type'];
        this.initCharts(this.type);
      }
    );

  }

  initCharts(type: string) {
    switch (type) {
      case 'researchers':
        this.getResearchersData();
        break;
      case 'RPOs':
        this.getRPOsData();
        break;
      case 'RFOs':
        this.getRFOsData();
        break;
      case 'repositories':
        this.getRepositoriesData();
        break;
      case 'investments':
        this.getInvestmentsData(8);
        break;
    }
  }

  getResearchersData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.queryData.getQuestion(this.year, 'Question1'),
      this.queryData.getQuestionComment(this.year, 'Question1'),
    ).subscribe(
      res => {
        // this.countriesArray = res[0];
        this.questionsDataArray[0] = this.questionsDataArrayForBarChart[0] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        let tempArr: string[] = [];
        this.questionsDataArray[0].forEach((data: string[]) => {tempArr.push(data[0]);});
        this.toolTipData[0] = this.dataHandlerService.covertRawDataGetText(res[2]);
        this.countriesArray = res[0].map(element => {return element.toLowerCase()}).filter(element => !tempArr.includes(element));
        this.sumsArray[0] = this.calculateSum(res[1]);
      }
    );
  }

  getRPOsData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion2(),
      // this.queryData.getQuestion2comment(),
      this.queryData.getQuestion(this.year, 'Question2'),
      this.queryData.getQuestionComment(this.year, 'Question2'),
    ).subscribe(
      res => {
        this.questionsDataArray[1] = this.questionsDataArrayForBarChart[1] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        let tempArr: string[] = [];
        this.questionsDataArray[1].forEach((data: string[]) => {tempArr.push(data[0]);});
        this.countriesArray = res[0].map(element => {return element.toLowerCase()}).filter(element => !tempArr.includes(element));
        this.toolTipData[1] = this.dataHandlerService.covertRawDataGetText(res[2]);
        this.sumsArray[1] = this.calculateSum(res[1]);
      }
    );
  }

  getRFOsData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion3(),
      // this.queryData.getQuestion3comment(),
      this.queryData.getQuestion(this.year, 'Question3'),
      this.queryData.getQuestionComment(this.year, 'Question3'),
    ).subscribe(
      res => {
        this.questionsDataArray[2] = this.questionsDataArrayForBarChart[2] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        let tempArr: string[] = [];
        this.questionsDataArray[2].forEach((data: string[]) => {tempArr.push(data[0]);});
        this.countriesArray = res[0].map(element => {return element.toLowerCase()}).filter(element => !tempArr.includes(element));
        this.toolTipData[2] = this.dataHandlerService.covertRawDataGetText(res[2]);
        this.sumsArray[2] = this.calculateSum(res[1]);
      }
    );
  }

  getRepositoriesData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion4(),
      // this.queryData.getQuestion4comment(),
      this.queryData.getQuestion(this.year, 'Question4'),
      this.queryData.getQuestionComment(this.year, 'Question4'),
    ).subscribe(
      res => {
        this.questionsDataArray[3] = this.questionsDataArrayForBarChart[3] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        let tempArr: string[] = [];
        this.questionsDataArray[3].forEach((data: string[]) => {tempArr.push(data[0]);});
        this.countriesArray = res[0].map(element => {return element.toLowerCase()}).filter(element => !tempArr.includes(element));
        this.toolTipData[3] = this.dataHandlerService.covertRawDataGetText(res[2]);
        this.sumsArray[3] = this.calculateSum(res[1]);
      }
    );
  }

  getInvestmentsData(pos: number) {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion5(),
      // this.queryData.getQuestion5comment(),
      this.queryData.getQuestion(this.year, 'Question5'),
      this.queryData.getQuestionComment(this.year, 'Question5'),
    ).subscribe(
      res => {
        this.questionsDataArray[pos] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        this.getInvestmentsDataPie(this.questionsDataArray[pos]);
        this.createStackedColumnSeries(this.questionsDataArray[pos]);
        // let tempArr: string[] = [];
        // this.questionsDataArray[pos].forEach((data: string[]) => {tempArr.push(data[0]);});
        // this.countriesArray = res[0].map(element => {return element.toLowerCase()}).filter(element => !tempArr.includes(element));
        // this.toolTipData[pos] = this.dataHandlerService.covertRawDataGetText(res[2]);
        this.sumsArray[pos] = this.calculateSum(res[1]);
      }
    );
  }

  getInvestmentsDataPercentage(pos: number, param: string) {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion5(),
      // this.queryData.getQuestion5comment(),
      this.queryData.getQuestion(this.year, 'Question5'),
      this.queryData.getQuestionComment(this.year, 'Question5'),
    ).subscribe(
      res => {
        this.questionsDataArray[pos] = this.questionsDataArrayForBarChart[pos] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        for (let i = 0; i < this.questionsDataArray[pos].length; i++) {
          let country = countriesNumbers.find(
            elem=> elem.id.toLowerCase() === this.questionsDataArray[pos][i][0]
          );
          if (country?.[param]) {
            this.questionsDataArray[pos][i][1] = this.round(this.questionsDataArray[pos][i][1] / country[param] * 1000, 4);
          } else {
            this.questionsDataArray[pos].splice(i, 1);
            i--;
          }
        }
        let tempArr: string[] = [];
        this.questionsDataArray[pos].forEach((data: string[]) => {tempArr.push(data[0]);});
        this.countriesArray = res[0].map(element => {return element.toLowerCase()}).filter(element => !tempArr.includes(element));
        this.toolTipData[pos] = this.dataHandlerService.covertRawDataGetText(res[2]);
        // this.sumsArray[pos] = this.calculateSum(res[1]);
      }
    );
  }

  getInvestmentsDataPie(arr: number[]) {
      this.pieSeries = [{
          name: 'No of countries',
          type: 'pie',
          data: [
              [' < 1 M', 0],
              ['1 - 5 M', 0],
              ['5-10 M', 0],
              ['10 - 20 M', 0],
              [' > 20 M', 0]
          ]
      }];
      for (let i = 0; i < arr.length; i++) {
          if (arr[i][1] < 1) {
              (<number>this.pieSeries[0].data[0][1])++;
          } else if (arr[i][1] < 5) {
              (<number>this.pieSeries[0].data[1][1])++;
          } else if (arr[i][1] < 10) {
              (<number>this.pieSeries[0].data[2][1])++;
          } else if (arr[i][1] < 20) {
              (<number>this.pieSeries[0].data[3][1])++;
          } else if (arr[i][1] >= 20) {
              (<number>this.pieSeries[0].data[4][1])++;
          }
      }
      // console.log(this.series[0]);
  }

  createStackedColumnSeries(arr: any[]) {
    arr.sort((a, b) => { return a[1] - b[1]; });
    this.columnSeries = [];
    let serie: {name: string, type: string, data: (string | number)[][]};
    for (let i = 0; i < arr.length; i++) {
      let country = this.findCountryName(arr[i][0]);
      if (arr[i][1] < 1) {
        serie = {name: country.name + ' ('+ country.id +')', type: 'column', data: [[' < 1 M', 1]]}
        this.columnSeries.push(serie);
      } else if (arr[i][1] < 5) {
        serie = {name: country.name + ' ('+ country.id +')', type: 'column', data: [['1 - 5 M', 1]]}
        this.columnSeries.push(serie);
      } else if (arr[i][1] < 10) {
        serie = {name: country.name + ' ('+ country.id +')', type: 'column', data: [['5 - 10 M', 1]]}
        this.columnSeries.push(serie);
      } else if (arr[i][1] < 20) {
        serie = {name: country.name + ' ('+ country.id +')', type: 'column', data: [['10 - 20 M', 1]]}
        this.columnSeries.push(serie);
      } else if (arr[i][1] >= 20) {
        serie = {name: country.name + ' ('+ country.id +')', type: 'column', data: [[' > 20 M', 1]]}
        this.columnSeries.push(serie);
      }
    }
  }

  calculateSum(rawData: RawData): string {
    let sum = 0.0;
    for (const series of rawData.datasets) {
      for (const rowResult of series.series.result) {
        if (isNumeric(rowResult.row[1])) {
          sum += +rowResult.row[1];
        }
      }
    }
    return (Math.round((sum + Number.EPSILON) * 100) / 100).toString();
  }

  findCountryName(code: string) {
    return countriesNumbers.find(
      elem => elem.id.toLowerCase() === code
    );
  }

  activateSwitcher(fragment: string) {
    if (!UIkit.switcher('#investmentsContent')){
      setTimeout( ()=> {
        this.activateSwitcher(fragment);
      }, 100);
    } else {
      switch (fragment) {
        case 'absolute':
          if (!this.questionsDataArray[4])
            this.getInvestmentsData(4);
          UIkit.switcher('#investmentsContent').show(0);
          break;
        case 'gdp':
          if (!this.questionsDataArray[5])
            this.getInvestmentsDataPercentage(5, 'gdp');
          UIkit.switcher('#investmentsContent').show(1);
          break;
        case 'gerd':
          if (!this.questionsDataArray[6])
            this.getInvestmentsDataPercentage(6, 'gerd');
          UIkit.switcher('#investmentsContent').show(2);
          break;
        case 'income':
          if (!this.questionsDataArray[7])
            this.getInvestmentsDataPercentage(7, 'income');
          UIkit.switcher('#investmentsContent').show(3);
          break;
        case 'total':
          if (!this.questionsDataArray[8])
            this.getInvestmentsData(8);
          this.colorAxis = {
            dataClasses: [
              {
                to: 1,
              }, {
                from: 1,
                to: 5,
              }, {
                from: 5,
                to: 10,
              }, {
                from: 10,
                to: 20,
              }, {
                from: 20
              }
            ],
            minColor: '#F1EEF6',
            maxColor: '#008792',
          }
          UIkit.switcher('#investmentsContent').show(0);
          break;
        case 'details':
          if (!this.questionsDataArray[9])
            this.getInvestmentsData(9);
          this.legend = {
              title: {
                  text: 'Ranges in millions',
                  style: {
                      color: ( // theme
                          Highcharts.defaultOptions &&
                          Highcharts.defaultOptions.legend &&
                          Highcharts.defaultOptions.legend.title &&
                          Highcharts.defaultOptions.legend.title.style &&
                          Highcharts.defaultOptions.legend.title.style.color
                      ) || 'black'
                  }
              },
              align: 'left',
              verticalAlign: 'top',
              floating: true,
              layout: 'vertical',
              valueDecimals: 0,
              backgroundColor: ( // theme
                  Highcharts.defaultOptions &&
                  Highcharts.defaultOptions.legend &&
                  Highcharts.defaultOptions.legend.backgroundColor
              ) || 'rgba(255, 255, 255, 0.85)',
              symbolRadius: 0,
              symbolHeight: 14
          }
          this.colorAxis = {
            dataClasses: [
              {
                to: 1,
              }, {
                from: 1,
                to: 5,
              }, {
                from: 5,
                to: 10,
              }, {
                from: 10,
                to: 20,
              }, {
                from: 20
              }
            ],
            minColor: '#F1EEF6',
            maxColor: '#008792',
          }
          UIkit.switcher('#investmentsContent').show(1);
          break;
      }
    }
  }

  round(value: number, precision?: number) {
    const multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
  }

}
