import {Component, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {CategorizedAreaData, Series} from "../../../../../../../survey-tool/app/domain/categorizedAreaData";
import {ColorPallet, EoscReadiness2022MapSubtitles} from "../../../eosc-readiness2022-map-subtitles";
import {CountryTableData} from "../../../../../../../survey-tool/app/domain/country-table-data";
import {zip} from "rxjs/internal/observable/zip";
import {EoscReadiness2022DataService} from "../../../../../services/eosc-readiness2022-data.service";
import {StakeholdersService} from "../../../../../../../survey-tool/app/services/stakeholders.service";
import {DataHandlerService} from "../../../../../services/data-handler.service";

@Component({
  selector: 'app-financial-strategy-subcategories',
  templateUrl: 'financial-strategy-subcategories.component.html'
})

export class FinancialStrategySubcategoriesComponent implements OnInit{

  dataType: string = null;

  countriesArray: string[] = [];
  tableAbsoluteDataArray: CountryTableData[][] = [];
  mapSubtitles: string[] = [];
  mapSubtitlesArray: string[][] = EoscReadiness2022MapSubtitles;
  questionsDataArray: any[] = [];
  tmpQuestionsDataArray: any[] = [];

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
      this.queryData.getQuestion11(),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.tmpQuestionsDataArray[0] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        for (let i = 0; i < this.tmpQuestionsDataArray[0].series.length; i++) {
          this.tmpQuestionsDataArray[0].series[i].data = this.tmpQuestionsDataArray[0].series[i].data.map(code => ({ code }));
        }
        this.createMapDataFromCategorization(0,1);
      }
    );
  }

  getFairDataData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.queryData.getQuestion15(),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.tmpQuestionsDataArray[1] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        for (let i = 0; i < this.tmpQuestionsDataArray[1].series.length; i++) {
          this.tmpQuestionsDataArray[1].series[i].data = this.tmpQuestionsDataArray[1].series[i].data.map(code => ({ code }));
        }
        this.createMapDataFromCategorization(1,1);
      }
    );
  }

  getOpenDataData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.queryData.getQuestion19(),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.tmpQuestionsDataArray[2] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        for (let i = 0; i < this.tmpQuestionsDataArray[2].series.length; i++) {
          this.tmpQuestionsDataArray[2].series[i].data = this.tmpQuestionsDataArray[2].series[i].data.map(code => ({ code }));
        }
        this.createMapDataFromCategorization(2,1);
      }
    );
  }

  getConnectingReposToEOSCData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.queryData.getQuestion31(),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.tmpQuestionsDataArray[3] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        for (let i = 0; i < this.tmpQuestionsDataArray[3].series.length; i++) {
          this.tmpQuestionsDataArray[3].series[i].data = this.tmpQuestionsDataArray[3].series[i].data.map(code => ({ code }));
        }
        this.createMapDataFromCategorization(3,1);
      }
    );
  }

  getDataStewardshipData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.queryData.getQuestion35(),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.tmpQuestionsDataArray[4] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        for (let i = 0; i < this.tmpQuestionsDataArray[4].series.length; i++) {
          this.tmpQuestionsDataArray[4].series[i].data = this.tmpQuestionsDataArray[4].series[i].data.map(code => ({ code }));
        }
        this.createMapDataFromCategorization(4,1);
      }
    );
  }

  getLongTermDataPreservationData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.queryData.getQuestion39(),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.tmpQuestionsDataArray[5] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        for (let i = 0; i < this.tmpQuestionsDataArray[5].series.length; i++) {
          this.tmpQuestionsDataArray[5].series[i].data = this.tmpQuestionsDataArray[5].series[i].data.map(code => ({ code }));
        }
        this.createMapDataFromCategorization(5,1);
      }
    );
  }

  createMapDataFromCategorization(index: number, mapCount: number) {
    // this.mapSubtitles[mapCount] = this.mapSubtitlesArray[mapCount][index];

    this.questionsDataArray[index] = new CategorizedAreaData();
    for (let i = 0; i < this.tmpQuestionsDataArray[index].series.length; i++) {
      this.questionsDataArray[index].series[i] = new Series(this.mapSubtitlesArray[mapCount][i], false);
      this.questionsDataArray[index].series[i].data = this.tmpQuestionsDataArray[index].series[i].data;
      this.questionsDataArray[index].series[i].showInLegend = true;
      this.questionsDataArray[index].series[i].color = ColorPallet[i];
    }
    let countryCodeArray = [];
    for (let i = 0; i < this.questionsDataArray[index].series.length; i++) {
      for (const data of this.questionsDataArray[index].series[i].data) {
        countryCodeArray.push(data.code)
      }
    }

    this.questionsDataArray[index].series[this.questionsDataArray[index].series.length] = new Series('Awaiting Data', false);
    this.questionsDataArray[index].series[this.questionsDataArray[index].series.length-1].showInLegend = true;
    this.questionsDataArray[index].series[this.questionsDataArray[index].series.length-1].color = ColorPallet[2];
    this.questionsDataArray[index].series[this.questionsDataArray[index].series.length-1].data = this.countriesArray.filter(code => !countryCodeArray.includes(code));
    this.questionsDataArray[index].series[this.questionsDataArray[index].series.length-1].data = this.questionsDataArray[index].series[this.questionsDataArray[index].series.length-1].data.map(code => ({ code }));
  }
}
