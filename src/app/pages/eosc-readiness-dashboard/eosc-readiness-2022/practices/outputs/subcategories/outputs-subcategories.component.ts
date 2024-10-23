import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { CountryTableData } from "../../../../../../../survey-tool/app/domain/country-table-data";
import { EoscReadiness2022MapSubtitles } from "../../../eosc-readiness2022-map-subtitles";
import { EoscReadinessDataService } from "../../../../../services/eosc-readiness-data.service";
import { StakeholdersService } from "../../../../../../../survey-tool/app/services/stakeholders.service";
import { DataHandlerService } from "../../../../../services/data-handler.service";
import { zip } from "rxjs/internal/observable/zip";
import { RawData } from "../../../../../../../survey-tool/app/domain/raw-data";
import { isNumeric } from "rxjs/internal-compatibility";
import UIkit from "uikit";
import { registerLocaleData } from "@angular/common";
import localeEL from '@angular/common/locales/el';

registerLocaleData(localeEL); // Register Greek locale

@Component({
  selector: 'app-outputs-subcategories',
  templateUrl: 'outputs-subcategories.component.html'
})

export class OutputsSubcategoriesComponent implements OnInit {

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
      // this.queryData.getQuestion61(),
      this.queryData.getQuestion(this.year, 'Question61'),
      // this.queryData.getQuestion61comment(),
      this.queryData.getQuestionComment(this.year, 'Question61'),
    ).subscribe(
      res => {
        this.questionsDataArray[0] = this.questionsDataArrayForBarChart[0] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        let tempArr: string[] = [];
        this.questionsDataArray[0].forEach((data: string[]) => {tempArr.push(data[0]);});
        this.countriesArray = res[0].map(element => {return element.toLowerCase()}).filter(element => !tempArr.includes(element));
        this.sumsArray[0] = this.calculateSum(res[1]);
        this.toolTipData[0] = this.dataHandlerService.covertRawDataGetText(res[2]);
      }
    )
  }

  getFairDataData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion65(),
      this.queryData.getQuestion(this.year, 'Question65'),
      // this.queryData.getQuestion65comment(),
      this.queryData.getQuestionComment(this.year, 'Question65'),
    ).subscribe(
      res => {
        this.questionsDataArray[1] = this.questionsDataArrayForBarChart[1] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        let tempArr: string[] = [];
        this.questionsDataArray[1].forEach((data: string[]) => {tempArr.push(data[0]);});
        this.countriesArray = res[0].map(element => {return element.toLowerCase()}).filter(element => !tempArr.includes(element));
        this.sumsArray[1] = this.calculateSum(res[1]);
        this.toolTipData[1] = this.dataHandlerService.covertRawDataGetText(res[2]);
      }
    )
  }

  getOpenDataData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion69(),
      this.queryData.getQuestion(this.year, 'Question69'),
      // this.queryData.getQuestion69comment(),
      this.queryData.getQuestionComment(this.year, 'Question69'),
    ).subscribe(
      res => {
        this.questionsDataArray[2] = this.questionsDataArrayForBarChart[2] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        let tempArr: string[] = [];
        this.questionsDataArray[2].forEach((data: string[]) => {tempArr.push(data[0]);});
        this.countriesArray = res[0].map(element => {return element.toLowerCase()}).filter(element => !tempArr.includes(element));
        this.sumsArray[2] = this.calculateSum(res[1]);
        this.toolTipData[2] = this.dataHandlerService.covertRawDataGetText(res[2]);
      }
    )
  }

  getConnectingReposToEOSCData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion81(),
      this.queryData.getQuestion(this.year, 'Question81'),
      // this.queryData.getQuestion81comment(),
      this.queryData.getQuestionComment(this.year, 'Question81'),
    ).subscribe(
      res => {
        this.questionsDataArray[3] = this.questionsDataArrayForBarChart[3] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        let tempArr: string[] = [];
        this.questionsDataArray[3].forEach((data: string[]) => {tempArr.push(data[0]);});
        this.countriesArray = res[0].map(element => {return element.toLowerCase()}).filter(element => !tempArr.includes(element));
        this.sumsArray[3] = this.calculateSum(res[1]);
        this.toolTipData[3] = this.dataHandlerService.covertRawDataGetText(res[2]);
      }
    )
  }

  getDataStewardshipData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion85(),
      this.queryData.getQuestion(this.year, 'Question85'),
      // this.queryData.getQuestion85comment(),
      this.queryData.getQuestionComment(this.year, 'Question85'),
    ).subscribe(
      res => {
        this.questionsDataArray[4] = this.questionsDataArrayForBarChart[4] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        let tempArr: string[] = [];
        this.questionsDataArray[4].forEach((data: string[]) => {tempArr.push(data[0]);});
        this.countriesArray = res[0].map(element => {return element.toLowerCase()}).filter(element => !tempArr.includes(element));
        this.sumsArray[4] = this.calculateSum(res[1]);
        this.toolTipData[4] = this.dataHandlerService.covertRawDataGetText(res[2]);
      }
    )
  }

  getLongTermDataPreservationData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion89(),
      this.queryData.getQuestion(this.year, 'Question89'),
      // this.queryData.getQuestion89comment(),
      this.queryData.getQuestionComment(this.year, 'Question89'),
    ).subscribe(
      res => {
        this.questionsDataArray[5] = this.questionsDataArrayForBarChart[5] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        let tempArr: string[] = [];
        this.questionsDataArray[5].forEach((data: string[]) => {tempArr.push(data[0]);});
        this.countriesArray = res[0].map(element => {return element.toLowerCase()}).filter(element => !tempArr.includes(element));
        this.sumsArray[5] = this.calculateSum(res[1]);
        this.toolTipData[5] = this.dataHandlerService.covertRawDataGetText(res[2]);
      }
    )
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
