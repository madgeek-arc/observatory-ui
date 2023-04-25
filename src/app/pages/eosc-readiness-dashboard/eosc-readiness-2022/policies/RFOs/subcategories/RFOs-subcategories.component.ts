import {Component, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {CountryTableData} from "../../../../../../../survey-tool/app/domain/country-table-data";
import {EoscReadiness2022MapSubtitles} from "../../../eosc-readiness2022-map-subtitles";
import {EoscReadiness2022DataService} from "../../../../../services/eosc-readiness2022-data.service";
import {StakeholdersService} from "../../../../../../../survey-tool/app/services/stakeholders.service";
import {DataHandlerService} from "../../../../../services/data-handler.service";
import {zip} from "rxjs/internal/observable/zip";
import {RawData} from "../../../../../../../survey-tool/app/domain/raw-data";
import {isNumeric} from "rxjs/internal-compatibility";

@Component({
  selector: 'app-RFOs-subcategories',
  templateUrl: 'RFOs-subcategories.component.html'
})

export class RFOsSubcategoriesComponent implements OnInit{

  dataType: string = null;

  countriesArray: string[] = [];
  tableAbsoluteDataArray: CountryTableData[][] = [];
  mapSubtitles: string[] = [];
  mapSubtitlesArray: string[][] = EoscReadiness2022MapSubtitles;
  questionsDataArray: any[] = [];
  tmpQuestionsDataArray: any[] = [];
  questionsDataArrayForBarChart: any[] = [];
  sumsArray: string[] = [];

  constructor(private route: ActivatedRoute, private queryData: EoscReadiness2022DataService,
              private stakeholdersService: StakeholdersService, private dataHandlerService: DataHandlerService) {
  }

  ngOnInit() {
    this.route.params.subscribe(
      params => {
        this.dataType = params['dataType'];
        switch (this.dataType) {
          case 'dataManagement':
            this.getDataManagementData();
            break;
          case 'fairData':
            this.getFairDataData();
            break;
          case 'openData':
            this.getOpenDataData();
            break;
          case 'connectingRepositoriesToEOSC':
            this.getConnectingReposToEOSCData();
            break;
          case 'dataStewardship':
            this.getDataStewardshipData();
            break;
          case 'longTermDataPreservation':
            this.getLongTermDataPreservationData();
            break;
        }
      }
    )
  }

  getDataManagementData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.queryData.getQuestion13(),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.questionsDataArray[0] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        this.questionsDataArrayForBarChart[0] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        this.sumsArray[0] = this.calculateSum(res[1]);
      }
    )
  }

  getFairDataData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.queryData.getQuestion17(),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.questionsDataArray[1] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        this.questionsDataArrayForBarChart[1] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        this.sumsArray[1] = this.calculateSum(res[1]);
      }
    )
  }

  getOpenDataData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.queryData.getQuestion21(),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.questionsDataArray[2] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        this.questionsDataArrayForBarChart[2] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        this.sumsArray[2] = this.calculateSum(res[1]);
      }
    )
  }

  getConnectingReposToEOSCData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.queryData.getQuestion33(),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.questionsDataArray[3] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        this.questionsDataArrayForBarChart[3] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        this.sumsArray[3] = this.calculateSum(res[1]);
      }
    )
  }

  getDataStewardshipData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.queryData.getQuestion37(),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.questionsDataArray[4] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        this.questionsDataArrayForBarChart[4] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        this.sumsArray[4] = this.calculateSum(res[1]);
      }
    )
  }

  getLongTermDataPreservationData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.queryData.getQuestion41(),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.questionsDataArray[5] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        this.questionsDataArrayForBarChart[5] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        this.sumsArray[5] = this.calculateSum(res[1]);
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
