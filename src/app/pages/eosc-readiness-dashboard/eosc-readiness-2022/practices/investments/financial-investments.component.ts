import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {EoscReadiness2022DataService} from "../../../../services/eosc-readiness2022-data.service";
import {StakeholdersService} from "../../../../../../survey-tool/app/services/stakeholders.service";
import {DataHandlerService} from "../../../../services/data-handler.service";
import {CountryTableData} from "../../../../../../survey-tool/app/domain/country-table-data";
import {ColorPallet, EoscReadiness2022MapSubtitles} from "../../eosc-readiness2022-map-subtitles";
import {latlong} from "../../../../../../survey-tool/app/domain/countries-lat-lon";
import {CategorizedAreaData, Series} from "../../../../../../survey-tool/app/domain/categorizedAreaData";
import {zip} from "rxjs/internal/observable/zip";
import UIkit from "uikit";
import {RawData} from "../../../../../../survey-tool/app/domain/raw-data";
import {isNumeric} from "rxjs/internal-compatibility";

@Component({
  selector: 'app-national-policy',
  templateUrl: 'financial-investments.component.html'
})

export class FinancialInvestmentsComponent implements OnInit {

  countriesArray: string[] = [];
  tableAbsoluteDataArray: CountryTableData[][] = [];
  mapSubtitles: string[] = [];
  mapSubtitlesArray: string[][] = EoscReadiness2022MapSubtitles;
  questionsDataArray: any[] = [];
  tmpQuestionsDataArray: any[] = [];
  questionsDataArrayForBarChart: any[] = [];
  sumsArray: string[] = [];

  constructor(private router: Router, private route: ActivatedRoute, private queryData: EoscReadiness2022DataService,
              private stakeholdersService: StakeholdersService, private dataHandlerService: DataHandlerService) {
  }

  ngOnInit() {

    this.route.params.subscribe(
      params => {
        if (params['type'] === 'publications') {
          UIkit.switcher('#topSelector').show(0);
          this.getPublicationsData();
        }
        if (params['type'] === 'data') {
          UIkit.switcher('#topSelector').show(1);
        }
        if (params['type'] === 'software') {
          UIkit.switcher('#topSelector').show(2);
          this.getSoftwareData();
        }
        if (params['type'] === 'services') {
          UIkit.switcher('#topSelector').show(3);
          this.getServicesData();
        }
        if (params['type'] === 'infrastructures') {
          UIkit.switcher('#topSelector').show(4);
        }
        if (params['type'] === 'skills_training') {
          UIkit.switcher('#topSelector').show(5);
          this.getSkillsTrainingData();
        }
        if (params['type'] === 'assessment') {
          UIkit.switcher('#topSelector').show(6);
          this.getAssessmentData();
        }
        if (params['type'] === 'engagement') {
          UIkit.switcher('#topSelector').show(7);
          this.getEngagementData();
        }
      }
    );
  }

  getPublicationsData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.queryData.getQuestion56(),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.questionsDataArray[0] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        this.questionsDataArrayForBarChart[0] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        this.sumsArray[0] = this.calculateSum(res[1]);
      }
    )
  }

  getSoftwareData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.queryData.getQuestion72(),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.questionsDataArray[1] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        this.questionsDataArrayForBarChart[1] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        this.sumsArray[1] = this.calculateSum(res[1]);
      }
    )
  }

  getServicesData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.queryData.getQuestion76(),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.questionsDataArray[2] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        this.questionsDataArrayForBarChart[2] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        this.sumsArray[2] = this.calculateSum(res[1]);
      }
    )
  }

  getSkillsTrainingData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.queryData.getQuestion92(),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.questionsDataArray[3] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        this.questionsDataArrayForBarChart[3] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        this.sumsArray[3] = this.calculateSum(res[1]);
      }
    )
  }

  getAssessmentData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.queryData.getQuestion96(),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.questionsDataArray[4] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        this.questionsDataArrayForBarChart[4] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        this.sumsArray[4] = this.calculateSum(res[1]);
      }
    )
  }

  getEngagementData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.queryData.getQuestion100(),
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
