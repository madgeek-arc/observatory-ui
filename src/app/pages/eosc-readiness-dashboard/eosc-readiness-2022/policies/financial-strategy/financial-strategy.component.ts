import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {EoscReadiness2022DataService} from "../../../../services/eosc-readiness2022-data.service";
import {StakeholdersService} from "../../../../../../survey-tool/app/services/stakeholders.service";
import {DataHandlerService} from "../../../../services/data-handler.service";
import {CountryTableData} from "../../../../../../survey-tool/app/domain/country-table-data";
import {EoscReadiness2022MapSubtitles} from "../../eosc-readiness2022-map-subtitles";
import {zip} from "rxjs/internal/observable/zip";
import {CategorizedAreaData, Series} from "../../../../../../survey-tool/app/domain/categorizedAreaData";
import UIkit from "uikit";

@Component({
  selector: 'app-national-policy',
  templateUrl: 'financial-strategy.component.html'
})

export class FinancialStrategyComponent implements OnInit {
  countriesArray: string[] = [];
  tableAbsoluteDataArray: CountryTableData[][] = [];
  mapSubtitles: string[] = [];
  mapSubtitlesArray: string[][] = EoscReadiness2022MapSubtitles;
  questionsDataArray: any[] = [];
  tmpQuestionsDataArray: any[] = [];

  constructor(private router: Router, private route: ActivatedRoute, private queryData: EoscReadiness2022DataService,
              private stakeholdersService: StakeholdersService, private dataHandlerService: DataHandlerService) {
  }

  ngOnInit() {
    this.stakeholdersService.getEOSCSBCountries().subscribe(
      res => {this.countriesArray = res;},
      error => {console.error(error)}
    );

    this.route.params.subscribe(
      params => {
        // console.log('policies component params');
        // console.log(params);
        if (params['type'] === 'publications'){
          this.getPublicationsData();
          UIkit.switcher('#topSelector').show(0);
        }
        if (params['type'] === 'data')
          UIkit.switcher('#topSelector').show(1);
      }
    );
  }

  getPublicationsData() {
    zip(
      this.queryData.getQuestion7(),
      ).subscribe(
      res => {
        // this.tableAbsoluteDataArray[0] = this.dataHandlerService.convertRawDataToTableData(res[0]);
        this.tmpQuestionsDataArray[0] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[0]);
        for (let i = 0; i < this.tmpQuestionsDataArray[0].series.length; i++) {
          this.tmpQuestionsDataArray[0].series[i].data = this.tmpQuestionsDataArray[0].series[i].data.map(code => ({ code }));
        }
        // console.log(this.tmpQuestionsDataArray);
        this.createMapDataFromCategorization(0,0);
      }
    )
  }

  createMapDataFromCategorization(index: number, mapCount: number) {
    this.mapSubtitles[mapCount] = this.mapSubtitlesArray[mapCount][index];

    this.questionsDataArray[mapCount] = new CategorizedAreaData();

    // console.log(this.tmpQuestionsDataArray[mapCount].series)
    // this.questionsDataArray[mapCount].series[0] = new Series('Yes', false);
    // this.questionsDataArray[mapCount].series[0].data = this.tmpQuestionsDataArray[mapCount].series[0].data;
    // this.questionsDataArray[mapCount].series[1] = new Series('No', false);
    // this.questionsDataArray[mapCount].series[1].data = this.tmpQuestionsDataArray[mapCount].series[1].data;


    // this.questionsDataArray[mapCount].series[0] = new Series(this.mapSubtitles[mapCount], false);
    for (let i = 0; i < this.tmpQuestionsDataArray[mapCount].series.length; i++) {
      this.questionsDataArray[mapCount].series[i] = new Series(this.mapSubtitles[mapCount], false);
      // if (this.tmpQuestionsDataArray[mapCount].series[i].name === this.mapSubtitles[mapCount]){
      this.questionsDataArray[mapCount].series[i].data = this.tmpQuestionsDataArray[mapCount].series[i].data;
      this.questionsDataArray[mapCount].series[i].showInLegend = true;
        // break;
      // }
    }
    let countryCodeArray = [];
    for (let i = 0; i < this.questionsDataArray[mapCount].series.length; i++) {
      for (const data of this.questionsDataArray[mapCount].series[i].data) {
        countryCodeArray.push(data.code)
      }
    }

    this.questionsDataArray[mapCount].series[this.questionsDataArray[mapCount].series.length] = new Series('Awaiting Data', false);
    this.questionsDataArray[mapCount].series[this.questionsDataArray[mapCount].series.length-1].showInLegend = true;
    this.questionsDataArray[mapCount].series[this.questionsDataArray[mapCount].series.length-1].data = this.countriesArray.filter(code => !countryCodeArray.includes(code));
    this.questionsDataArray[mapCount].series[this.questionsDataArray[mapCount].series.length-1].data = this.questionsDataArray[mapCount].series[this.questionsDataArray[mapCount].series.length-1].data.map(code => ({ code }));
  }

}
