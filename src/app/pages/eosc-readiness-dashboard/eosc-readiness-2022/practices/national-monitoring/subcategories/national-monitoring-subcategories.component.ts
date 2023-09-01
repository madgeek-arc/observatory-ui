import {Component, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {zip} from "rxjs/internal/observable/zip";
import {CategorizedAreaData, Series} from "../../../../../../../survey-tool/app/domain/categorizedAreaData";
import {ColorPallet, EoscReadiness2022MapSubtitles} from "../../../eosc-readiness2022-map-subtitles";
import {CountryTableData} from "../../../../../../../survey-tool/app/domain/country-table-data";
import {EoscReadiness2022DataService} from "../../../../../services/eosc-readiness2022-data.service";
import {StakeholdersService} from "../../../../../../../survey-tool/app/services/stakeholders.service";
import {DataHandlerService} from "../../../../../services/data-handler.service";
import UIkit from "uikit";

@Component({
  selector: 'app-national-monitoring-subcategories',
  templateUrl: 'national-monitoring-subcategories.component.html'
})

export class NationalMonitoringSubcategoriesComponent implements OnInit{

  dataType: string = null;

  countriesArray: string[] = [];
  tableAbsoluteDataArray: CountryTableData[][] = [];
  mapSubtitles: string[] = [];
  mapSubtitlesArray: string[][] = EoscReadiness2022MapSubtitles;
  questionsDataArray: any[] = [];
  tmpQuestionsDataArray: any[] = [];
  toolTipData: Map<string, string>[] = [];

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
    );
  }

  getDataManagementData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.queryData.getQuestion58(),
      this.queryData.getQuestion58comment(),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.tmpQuestionsDataArray[0] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        for (let i = 0; i < this.tmpQuestionsDataArray[0].series.length; i++) {
          this.tmpQuestionsDataArray[0].series[i].data = this.tmpQuestionsDataArray[0].series[i].data.map(code => ({ code }));
        }
        this.toolTipData[0] = this.dataHandlerService.covertRawDataGetText(res[2]);
        this.createMapDataFromCategorization(0,4);
      }
    );
  }

  getFairDataData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.queryData.getQuestion62(),
      this.queryData.getQuestion62comment(),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.tmpQuestionsDataArray[1] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        for (let i = 0; i < this.tmpQuestionsDataArray[1].series.length; i++) {
          this.tmpQuestionsDataArray[1].series[i].data = this.tmpQuestionsDataArray[1].series[i].data.map(code => ({ code }));
        }
        this.toolTipData[1] = this.dataHandlerService.covertRawDataGetText(res[2]);
        this.createMapDataFromCategorization(1,4);
      }
    );
  }

  getOpenDataData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.queryData.getQuestion66(),
      this.queryData.getQuestion66comment(),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.tmpQuestionsDataArray[2] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        for (let i = 0; i < this.tmpQuestionsDataArray[2].series.length; i++) {
          this.tmpQuestionsDataArray[2].series[i].data = this.tmpQuestionsDataArray[2].series[i].data.map(code => ({ code }));
        }
        this.toolTipData[2] = this.dataHandlerService.covertRawDataGetText(res[2]);
        this.createMapDataFromCategorization(2,4);
      }
    );
  }

  getConnectingReposToEOSCData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.queryData.getQuestion78(),
      this.queryData.getQuestion78comment(),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.tmpQuestionsDataArray[3] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        for (let i = 0; i < this.tmpQuestionsDataArray[3].series.length; i++) {
          this.tmpQuestionsDataArray[3].series[i].data = this.tmpQuestionsDataArray[3].series[i].data.map(code => ({ code }));
        }
        this.toolTipData[3] = this.dataHandlerService.covertRawDataGetText(res[2]);
        this.createMapDataFromCategorization(3,4);
      }
    );
  }

  getDataStewardshipData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.queryData.getQuestion82(),
      this.queryData.getQuestion82comment(),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.tmpQuestionsDataArray[4] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        for (let i = 0; i < this.tmpQuestionsDataArray[4].series.length; i++) {
          this.tmpQuestionsDataArray[4].series[i].data = this.tmpQuestionsDataArray[4].series[i].data.map(code => ({ code }));
        }
        this.toolTipData[4] = this.dataHandlerService.covertRawDataGetText(res[2]);
        this.createMapDataFromCategorization(4,4);
      }
    );
  }

  getLongTermDataPreservationData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.queryData.getQuestion86(),
      this.queryData.getQuestion86comment(),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.tmpQuestionsDataArray[5] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        for (let i = 0; i < this.tmpQuestionsDataArray[5].series.length; i++) {
          this.tmpQuestionsDataArray[5].series[i].data = this.tmpQuestionsDataArray[5].series[i].data.map(code => ({ code }));
        }
        this.toolTipData[5] = this.dataHandlerService.covertRawDataGetText(res[2]);
        this.createMapDataFromCategorization(5,4);
      }
    );
  }

  createMapDataFromCategorization(index: number, mapCount: number) {
    // this.mapSubtitles[mapCount] = this.mapSubtitlesArray[mapCount][index];

    this.questionsDataArray[index] = new CategorizedAreaData();

    let position = 0;
    for (let i = 0; i < this.tmpQuestionsDataArray[index].series.length; i++) {
      if (this.tmpQuestionsDataArray[index].series[i].name === 'Awaiting data')
        continue;
      position = this.tmpQuestionsDataArray[index].series[i].name === 'No'? 1 : 0;
      this.questionsDataArray[index].series[i] = new Series(this.mapSubtitlesArray[mapCount][position], false);
      this.questionsDataArray[index].series[i].data = this.tmpQuestionsDataArray[index].series[i].data;
      this.questionsDataArray[index].series[i].showInLegend = true;
      this.questionsDataArray[index].series[i].color = ColorPallet[position];
    }
    let countryCodeArray = [];
    for (let i = 0; i < this.questionsDataArray[index].series.length; i++) {
      for (const data of this.questionsDataArray[index].series[i].data) {
        countryCodeArray.push(data.code);
      }
    }

    this.questionsDataArray[index].series[this.questionsDataArray[index].series.length] = new Series('Awaiting Data', false);
    this.questionsDataArray[index].series[this.questionsDataArray[index].series.length-1].showInLegend = true;
    this.questionsDataArray[index].series[this.questionsDataArray[index].series.length-1].color = ColorPallet[2];
    this.questionsDataArray[index].series[this.questionsDataArray[index].series.length-1].data = this.countriesArray.filter(code => !countryCodeArray.includes(code));
    this.questionsDataArray[index].series[this.questionsDataArray[index].series.length-1].data = this.questionsDataArray[index].series[this.questionsDataArray[index].series.length-1].data.map(code => ({ code }));

  }
}
