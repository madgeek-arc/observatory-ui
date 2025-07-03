import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { CountryTableData } from "../../../../../../domain/country-table-data";
import { countriesNumbers, EoscReadiness2022MapSubtitles } from "../../../eosc-readiness2022-map-subtitles";
import { EoscReadinessDataService } from "../../../../../services/eosc-readiness-data.service";
import { StakeholdersService } from "../../../../../../../survey-tool/app/services/stakeholders.service";
import { DataHandlerService } from "../../../../../services/data-handler.service";
import { RawData } from "../../../../../../domain/raw-data";
import { zip } from "rxjs/internal/observable/zip";
import { isNumeric } from "rxjs/internal-compatibility";
import * as UIkit from 'uikit';

@Component({
  selector: 'app-financial-investments-subcategories',
  templateUrl: 'financial-investments-subcategories.component.html'
})

export class FinancialInvestmentsSubcategoriesComponent implements OnInit{

  year: string = null;
  dataType: string = null;

  countriesArray: string[] = [];
  tableAbsoluteDataArray: CountryTableData[][] = [];
  mapSubtitles: string[] = [];
  mapSubtitlesArray: string[][] = EoscReadiness2022MapSubtitles;
  questionsDataArray: any[] = [];
  tmpQuestionsDataArray: any[] = [];
  questionsDataArrayForBarChart: any[] = [];
  sumsArray: string[] = [];
  toolTipData: Map<string, string>[] = [];
  pieSeries: {name: string, type: string, data: (string | number)[][]}[][] = [];
  columnSeries: {name: string, type: string, data: (string | number)[][]}[][] = [];

  constructor(private route: ActivatedRoute, private queryData: EoscReadinessDataService,
              private stakeholdersService: StakeholdersService, private dataHandlerService: DataHandlerService) {
  }

  ngOnInit() {
    this.year = this.route.parent.parent.parent.snapshot.paramMap.get('year');
    // if (!this.year)
    //   this.year = '2022';

    this.route.params.subscribe(
      params => {
        this.dataType = params['dataType'];
        switch (this.dataType) {
          case 'dataManagement':
            this.getDataManagementData();
            UIkit.switcher('#dataContent').show(0);
            break;
          case 'fairData':
            this.getFairDataData();
            UIkit.switcher('#dataContent').show(1);
            break;
          case 'openData':
            this.getOpenDataData();
            UIkit.switcher('#dataContent').show(2);
            break;
          case 'connectingRepositoriesToEOSC':
            this.getConnectingReposToEOSCData();
            UIkit.switcher('#infrastructuresContent').show(0);
            break;
          case 'dataStewardship':
            this.getDataStewardshipData();
            UIkit.switcher('#infrastructuresContent').show(1);
            break;
          case 'longTermDataPreservation':
            this.getLongTermDataPreservationData();
            UIkit.switcher('#infrastructuresContent').show(2);
            break;
        }
      }
    )
  }

  getDataManagementData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion60(),
      this.queryData.getQuestion(this.year, 'Question60'),
      // this.queryData.getQuestion60comment(),
      this.queryData.getQuestionComment(this.year, 'Question60'),
    ).subscribe(
      res => {
        this.questionsDataArray[0] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        this.getInvestmentsDataPie(this.questionsDataArray[0], 0);
        this.createStackedColumnSeries(this.questionsDataArray[0], 0);
        // this.questionsDataArray[0] = this.questionsDataArrayForBarChart[0] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        // let tempArr: string[] = [];
        // this.questionsDataArray[0].forEach((data: string[]) => {tempArr.push(data[0]);});
        // this.countriesArray = res[0].map(element => {return element.toLowerCase()}).filter(element => !tempArr.includes(element));
        // this.toolTipData[0] = this.dataHandlerService.covertRawDataGetText(res[2]);
        this.sumsArray[0] = this.calculateSum(res[1]);
      }
    )
  }

  getFairDataData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion64(),
      this.queryData.getQuestion(this.year, 'Question64'),
      // this.queryData.getQuestion64comment(),
      this.queryData.getQuestionComment(this.year, 'Question64'),
    ).subscribe(
      res => {
        this.questionsDataArray[1] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        this.getInvestmentsDataPie(this.questionsDataArray[1], 1);
        this.createStackedColumnSeries(this.questionsDataArray[1], 1);
        // this.questionsDataArray[1] = this.questionsDataArrayForBarChart[1] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        // let tempArr: string[] = [];
        // this.questionsDataArray[1].forEach((data: string[]) => {tempArr.push(data[0]);});
        // this.countriesArray = res[0].map(element => {return element.toLowerCase()}).filter(element => !tempArr.includes(element));
        // this.toolTipData[1] = this.dataHandlerService.covertRawDataGetText(res[2]);
        this.sumsArray[1] = this.calculateSum(res[1]);
      }
    )
  }

  getOpenDataData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion68(),
      this.queryData.getQuestion(this.year, 'Question68'),
      // this.queryData.getQuestion68comment(),
      this.queryData.getQuestionComment(this.year, 'Question68'),
    ).subscribe(
      res => {
        this.questionsDataArray[2] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        this.getInvestmentsDataPie(this.questionsDataArray[2], 2);
        this.createStackedColumnSeries(this.questionsDataArray[2], 2);
        // this.questionsDataArray[2] = this.questionsDataArrayForBarChart[2] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        // let tempArr: string[] = [];
        // this.questionsDataArray[2].forEach((data: string[]) => {tempArr.push(data[0]);});
        // this.countriesArray = res[0].map(element => {return element.toLowerCase()}).filter(element => !tempArr.includes(element));
        // this.toolTipData[2] = this.dataHandlerService.covertRawDataGetText(res[2]);
        this.sumsArray[2] = this.calculateSum(res[1]);
      }
    )
  }

  getConnectingReposToEOSCData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion80(),
      this.queryData.getQuestion(this.year, 'Question80'),
      // this.queryData.getQuestion80comment(),
      this.queryData.getQuestionComment(this.year, 'Question80'),
    ).subscribe(
      res => {
        this.questionsDataArray[3] = this.questionsDataArrayForBarChart[3] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        this.getInvestmentsDataPie(this.questionsDataArray[3], 3);
        this.createStackedColumnSeries(this.questionsDataArray[3], 3);
        // this.questionsDataArray[3] = this.questionsDataArrayForBarChart[3] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        // let tempArr: string[] = [];
        // this.questionsDataArray[3].forEach((data: string[]) => {tempArr.push(data[0]);});
        // this.countriesArray = res[0].map(element => {return element.toLowerCase()}).filter(element => !tempArr.includes(element));
        // this.toolTipData[3] = this.dataHandlerService.covertRawDataGetText(res[2]);
        this.sumsArray[3] = this.calculateSum(res[1]);
      }
    )
  }

  getDataStewardshipData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion84(),
      this.queryData.getQuestion(this.year, 'Question84'),
      // this.queryData.getQuestion84comment(),
      this.queryData.getQuestionComment(this.year, 'Question84'),
    ).subscribe(
      res => {
        this.questionsDataArray[4] = this.questionsDataArrayForBarChart[4] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        this.getInvestmentsDataPie(this.questionsDataArray[4], 4);
        this.createStackedColumnSeries(this.questionsDataArray[4], 4);
        // this.questionsDataArray[4] = this.questionsDataArrayForBarChart[4] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        // let tempArr: string[] = [];
        // this.questionsDataArray[4].forEach((data: string[]) => {tempArr.push(data[0]);});
        // this.countriesArray = res[0].map(element => {return element.toLowerCase()}).filter(element => !tempArr.includes(element));
        // this.toolTipData[4] = this.dataHandlerService.covertRawDataGetText(res[2]);
        this.sumsArray[4] = this.calculateSum(res[1]);
      }
    )
  }

  getLongTermDataPreservationData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion88(),
      this.queryData.getQuestion(this.year, 'Question88'),
      // this.queryData.getQuestion88comment(),
      this.queryData.getQuestion(this.year, 'Question88'),
    ).subscribe(
      res => {
        this.questionsDataArray[5] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        this.getInvestmentsDataPie(this.questionsDataArray[5], 5);
        this.createStackedColumnSeries(this.questionsDataArray[5], 5);
        // this.questionsDataArray[5] = this.questionsDataArrayForBarChart[5] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        // let tempArr: string[] = [];
        // this.questionsDataArray[5].forEach((data: string[]) => {tempArr.push(data[0]);});
        // this.countriesArray = res[0].map(element => {return element.toLowerCase()}).filter(element => !tempArr.includes(element));
        // this.toolTipData[5] = this.dataHandlerService.covertRawDataGetText(res[2]);
        this.sumsArray[5] = this.calculateSum(res[1]);
      }
    )
  }

  getInvestmentsDataPie(arr: number[], index: number) {
    this.pieSeries[index] = [{
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
        (<number>this.pieSeries[index][0].data[0][1])++;
      } else if (arr[i][1] < 5) {
        (<number>this.pieSeries[index][0].data[1][1])++;
      } else if (arr[i][1] < 10) {
        (<number>this.pieSeries[index][0].data[2][1])++;
      } else if (arr[i][1] < 20) {
        (<number>this.pieSeries[index][0].data[3][1])++;
      } else if (arr[i][1] >= 20) {
        (<number>this.pieSeries[index][0].data[4][1])++;
      }
    }
    // console.log(this.series[0]);
  }

  createStackedColumnSeries(arr: any[], index: number) {
    arr.sort((a, b) => { return a[1] - b[1]; });
    this.columnSeries[index] = [];
    let serie: {name: string, type: string, data: (string | number)[][]};
    for (let i = 0; i < arr.length; i++) {
      let country = this.findCountryName(arr[i][0]);
      if (arr[i][1] < 1) {
        serie = {name: country.name + ' ('+ country.id +')', type: 'column', data: [[' < 1 M', 1]]}
        this.columnSeries[index].push(serie);
      } else if (arr[i][1] < 5) {
        serie = {name: country.name + ' ('+ country.id +')', type: 'column', data: [['1 - 5 M', 1]]}
        this.columnSeries[index].push(serie);
      } else if (arr[i][1] < 10) {
        serie = {name: country.name + ' ('+ country.id +')', type: 'column', data: [['5 - 10 M', 1]]}
        this.columnSeries[index].push(serie);
      } else if (arr[i][1] < 20) {
        serie = {name: country.name + ' ('+ country.id +')', type: 'column', data: [['10 - 20 M', 1]]}
        this.columnSeries[index].push(serie);
      } else if (arr[i][1] >= 20) {
        serie = {name: country.name + ' ('+ country.id +')', type: 'column', data: [[' > 20 M', 1]]}
        this.columnSeries[index].push(serie);
      }
    }
  }

  findCountryName(code: string) {
    return countriesNumbers.find(
      elem => elem.id.toLowerCase() === code
    );
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
}
