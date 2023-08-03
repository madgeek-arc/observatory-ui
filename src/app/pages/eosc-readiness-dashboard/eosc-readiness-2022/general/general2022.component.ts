import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import UIkit from "uikit";
import {CountryTableData} from "../../../../../survey-tool/app/domain/country-table-data";
import {EoscReadiness2022MapSubtitles} from "../eosc-readiness2022-map-subtitles";
import {EoscReadiness2022DataService} from "../../../services/eosc-readiness2022-data.service";
import {StakeholdersService} from "../../../../../survey-tool/app/services/stakeholders.service";
import {DataHandlerService} from "../../../services/data-handler.service";
import {zip} from "rxjs/internal/observable/zip";
import {RawData} from "../../../../../survey-tool/app/domain/raw-data";
import {isNumeric} from "rxjs/internal-compatibility";

@Component({
  selector: 'app-general-2022',
  templateUrl: 'general2022.component.html'
})

export class General2022Component implements OnInit {

  type: string = null;

  countriesArray: string[] = [];
  tableAbsoluteDataArray: CountryTableData[][] = [];
  mapSubtitles: string[] = [];
  mapSubtitlesArray: string[][] = EoscReadiness2022MapSubtitles;
  questionsDataArray: any[] = [];
  commentMap = new Map<string, string>();
  tmpQuestionsDataArray: any[] = [];
  questionsDataArrayForBarChart: any[] = [];
  sumsArray: string[] = [];

  constructor(private router: Router, private route: ActivatedRoute, private queryData: EoscReadiness2022DataService,
              private stakeholdersService: StakeholdersService, private dataHandlerService: DataHandlerService) {
  }

  ngOnInit() {
    this.route.params.subscribe(
      params => {
        // console.log(params);
        this.type = params['type'];
        if (params['type'] === 'researchers') {
          this.getResearchersData();
        }
        if (params['type'] === 'RPOs') {
          this.getRPOsData();
        }
        if (params['type'] === 'RFOs') {
          this.getRFOsData();
        }
        if (params['type'] === 'repositories') {
          this.getRepositoriesData();
        }
        if (params['type'] === 'investments') {
          this.getInvestmentsData();
        }
      }
    )
  }

  getResearchersData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.queryData.getQuestion1(),
      this.queryData.getQuestion1_2(),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        let tempArr: string[] = [];
        this.questionsDataArray[0] = this.questionsDataArrayForBarChart[0] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        this.questionsDataArray[0].forEach((data: string[]) => {tempArr.push(data[0]);});
        // this.questionsDataArrayForBarChart[0] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        this.questionsDataArray[5] = this.dataHandlerService.covertRawDataGetText(res[2]);
        this.countriesArray = this.countriesArray.map(element => {return element.toLowerCase()}).filter(element => !tempArr.includes(element));
        this.sumsArray[0] = this.calculateSum(res[1]);
      }
    )
  }

  getRPOsData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.queryData.getQuestion2(),
    ).subscribe(
      res => {
        // this.countriesArray = res[0];
        this.questionsDataArray[1] = this.questionsDataArrayForBarChart[1] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        this.sumsArray[1] = this.calculateSum(res[1]);
      }
    )
  }

  getRFOsData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.queryData.getQuestion3(),
    ).subscribe(
      res => {
        // this.countriesArray = res[0];
        this.questionsDataArray[2] = this.questionsDataArrayForBarChart[2] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        this.sumsArray[2] = this.calculateSum(res[1]);
      }
    )
  }

  getRepositoriesData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.queryData.getQuestion4(),
    ).subscribe(
      res => {
        // this.countriesArray = res[0];
        this.questionsDataArray[3] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        this.questionsDataArrayForBarChart[3] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        this.sumsArray[3] = this.calculateSum(res[1]);
      }
    )
  }

  getInvestmentsData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.queryData.getQuestion5(),
    ).subscribe(
      res => {
        // this.countriesArray = res[0];
        this.questionsDataArray[4] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        this.questionsDataArrayForBarChart[4] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        this.sumsArray[4] = this.calculateSum(res[1]);
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
