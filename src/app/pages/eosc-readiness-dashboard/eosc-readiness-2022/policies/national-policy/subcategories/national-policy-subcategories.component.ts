import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { zip } from "rxjs/internal/observable/zip";
import { ColorPallet, EoscReadiness2022MapSubtitles } from "../../../eosc-readiness2022-map-subtitles";
import { latlong } from "../../../../../../domain/countries-lat-lon";
import { EoscReadinessDataService } from "../../../../../services/eosc-readiness-data.service";
import { StakeholdersService } from "../../../../../../../survey-tool/app/services/stakeholders.service";
import { DataHandlerService } from "../../../../../services/data-handler.service";
import { CountryTableData } from "../../../../../../domain/country-table-data";
import { CategorizedAreaData, Series } from "../../../../../../domain/categorizedAreaData";
import * as UIkit from 'uikit';

@Component({
    selector: 'app-national-policy-subcategories',
    templateUrl: 'national-policy-subcategories.component.html',
    standalone: false
})

export class NationalPolicySubcategoriesComponent implements OnInit{

  year: string = null;
  dataType: string = null;

  countriesArray: string[] = [];
  tableAbsoluteDataArray: CountryTableData[][] = [];
  mapSubtitles: string[] = [];
  mapSubtitlesArray: string[][] = EoscReadiness2022MapSubtitles;
  questionsDataArray: any[] = [];
  tmpQuestionsDataArray: any[] = [];
  mapPointData: CountryTableData[];
  toolTipData: Map<string, string>[] = [];
  participatingCountries: number[] = [];
  participatingCountriesPercentage: number[] = [];

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
      // this.queryData.getQuestion10(),
      this.queryData.getQuestion(this.year, 'Question10'),
      // this.queryData.getQuestion10_1(),
      this.queryData.getQuestion(this.year, 'Question10.1'),
      // this.queryData.getQuestion10comment(),
      this.queryData.getQuestionComment(this.year, 'Question10'),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.tableAbsoluteDataArray[0] = this.dataHandlerService.convertRawDataToTableData(res[1]);
        this.tmpQuestionsDataArray[0] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        this.participatingCountries[0] = this.dataHandlerService.convertRawDataForActivityGauge(res[1]);
        this.participatingCountriesPercentage[0] = Math.round((this.participatingCountries[0]/this.countriesArray.length + Number.EPSILON) * 100);
        for (let i = 0; i < this.tmpQuestionsDataArray[0].series.length; i++) {
          this.tmpQuestionsDataArray[0].series[i].data = this.tmpQuestionsDataArray[0].series[i].data.map(code => ({ code }));
        }
        this.mapPointData = this.dataHandlerService.convertRawDataToTableData(res[2]);
        this.toolTipData[0] = this.dataHandlerService.covertRawDataGetText(res[3]);
        this.createMapDataFromCategorizationWithDots(0,0);

      },
      error => {console.error(error)},
      () => {}
    );
  }

  getFairDataData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion14(),
      this.queryData.getQuestion(this.year, 'Question14'),
      // this.queryData.getQuestion14_1(),
      this.queryData.getQuestion(this.year, 'Question14.1'),
      // this.queryData.getQuestion14comment(),
      this.queryData.getQuestionComment(this.year, 'Question14'),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.tableAbsoluteDataArray[1] = this.dataHandlerService.convertRawDataToTableData(res[1]);
        this.tmpQuestionsDataArray[1] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        this.participatingCountries[1] = this.dataHandlerService.convertRawDataForActivityGauge(res[1]);
        this.participatingCountriesPercentage[1] = Math.round((this.participatingCountries[1]/this.countriesArray.length + Number.EPSILON) * 100);
        for (let i = 0; i < this.tmpQuestionsDataArray[1].series.length; i++) {
          this.tmpQuestionsDataArray[1].series[i].data = this.tmpQuestionsDataArray[1].series[i].data.map(code => ({ code }));
        }
        this.mapPointData = this.dataHandlerService.convertRawDataToTableData(res[2]);
        this.toolTipData[1] = this.dataHandlerService.covertRawDataGetText(res[3]);
        this.createMapDataFromCategorizationWithDots(1,0);

      },
      error => {console.error(error)},
      () => {}
    );
  }

  getOpenDataData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion18(),
      this.queryData.getQuestion(this.year, 'Question18'),
      // this.queryData.getQuestion18_1(),
      this.queryData.getQuestion(this.year, 'Question18.1'),
      // this.queryData.getQuestion18comment(),
      this.queryData.getQuestionComment(this.year, 'Question18'),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.tableAbsoluteDataArray[2] = this.dataHandlerService.convertRawDataToTableData(res[1]);
        this.tmpQuestionsDataArray[2] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        this.participatingCountries[2] = this.dataHandlerService.convertRawDataForActivityGauge(res[1]);
        this.participatingCountriesPercentage[2] = Math.round((this.participatingCountries[2]/this.countriesArray.length + Number.EPSILON) * 100);
        for (let i = 0; i < this.tmpQuestionsDataArray[2].series.length; i++) {
          this.tmpQuestionsDataArray[2].series[i].data = this.tmpQuestionsDataArray[2].series[i].data.map(code => ({ code }));
        }
        this.mapPointData = this.dataHandlerService.convertRawDataToTableData(res[2]);
        this.toolTipData[2] = this.dataHandlerService.covertRawDataGetText(res[3]);
        this.createMapDataFromCategorizationWithDots(2,0);

      },
      error => {console.error(error)},
      () => {}
    );
  }

  getConnectingReposToEOSCData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion30(),
      this.queryData.getQuestion(this.year, 'Question30'),
      // this.queryData.getQuestion30_1(),
      this.queryData.getQuestion(this.year, 'Question30.1'),
      // this.queryData.getQuestion30comment(),
      this.queryData.getQuestionComment(this.year, 'Question30'),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.tableAbsoluteDataArray[3] = this.dataHandlerService.convertRawDataToTableData(res[1]);
        this.tmpQuestionsDataArray[3] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        this.participatingCountries[3] = this.dataHandlerService.convertRawDataForActivityGauge(res[1]);
        this.participatingCountriesPercentage[3] = Math.round((this.participatingCountries[3]/this.countriesArray.length + Number.EPSILON) * 100);
        for (let i = 0; i < this.tmpQuestionsDataArray[3].series.length; i++) {
          this.tmpQuestionsDataArray[3].series[i].data = this.tmpQuestionsDataArray[3].series[i].data.map(code => ({ code }));
        }
        this.mapPointData = this.dataHandlerService.convertRawDataToTableData(res[2]);
        this.toolTipData[3] = this.dataHandlerService.covertRawDataGetText(res[3]);
        this.createMapDataFromCategorizationWithDots(3,0);

      },
      error => {console.error(error)},
      () => {}
    );
  }

  getDataStewardshipData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion34(),
      this.queryData.getQuestion(this.year, 'Question34'),
      // this.queryData.getQuestion34_1(),
      this.queryData.getQuestion(this.year, 'Question34.1'),
      // this.queryData.getQuestion34comment(),
      this.queryData.getQuestionComment(this.year, 'Question34'),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.tableAbsoluteDataArray[4] = this.dataHandlerService.convertRawDataToTableData(res[1]);
        this.tmpQuestionsDataArray[4] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        this.participatingCountries[4] = this.dataHandlerService.convertRawDataForActivityGauge(res[1]);
        this.participatingCountriesPercentage[4] = Math.round((this.participatingCountries[4]/this.countriesArray.length + Number.EPSILON) * 100);
        for (let i = 0; i < this.tmpQuestionsDataArray[4].series.length; i++) {
          this.tmpQuestionsDataArray[4].series[i].data = this.tmpQuestionsDataArray[4].series[i].data.map(code => ({ code }));
        }
        this.mapPointData = this.dataHandlerService.convertRawDataToTableData(res[2]);
        this.toolTipData[4] = this.dataHandlerService.covertRawDataGetText(res[3]);
        this.createMapDataFromCategorizationWithDots(4,0);

      },
      error => {console.error(error)},
      () => {}
    );
  }

  getLongTermDataPreservationData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion38(),
      this.queryData.getQuestion(this.year, 'Question38'),
      // this.queryData.getQuestion38_1(),
      this.queryData.getQuestion(this.year, 'Question38.1'),
      // this.queryData.getQuestion38comment(),
      this.queryData.getQuestionComment(this.year, 'Question38'),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.tableAbsoluteDataArray[5] = this.dataHandlerService.convertRawDataToTableData(res[1]);
        this.tmpQuestionsDataArray[5] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        this.participatingCountries[5] = this.dataHandlerService.convertRawDataForActivityGauge(res[1]);
        this.participatingCountriesPercentage[5] = Math.round((this.participatingCountries[5]/this.countriesArray.length + Number.EPSILON) * 100);
        for (let i = 0; i < this.tmpQuestionsDataArray[5].series.length; i++) {
          this.tmpQuestionsDataArray[5].series[i].data = this.tmpQuestionsDataArray[5].series[i].data.map(code => ({ code }));
        }
        this.mapPointData = this.dataHandlerService.convertRawDataToTableData(res[2]);
        this.toolTipData[5] = this.dataHandlerService.covertRawDataGetText(res[3]);
        this.createMapDataFromCategorizationWithDots(5,0);

      },
      error => {console.error(error)},
      () => {}
    );
  }

  createMapDataFromCategorizationWithDots(index: number, mapCount: number) {
    // this.mapSubtitles[index] = this.mapSubtitlesArray[mapCount][index];

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
        countryCodeArray.push(data.code)
      }
    }

    if (countryCodeArray.length > 0) {
      this.questionsDataArray[index].series[this.questionsDataArray[index].series.length] = new Series('Awaiting Data', false);
      this.questionsDataArray[index].series[this.questionsDataArray[index].series.length-1].showInLegend = true;
      this.questionsDataArray[index].series[this.questionsDataArray[index].series.length-1].color = ColorPallet[2];
      this.questionsDataArray[index].series[this.questionsDataArray[index].series.length-1].data = this.countriesArray.filter(code => !countryCodeArray.includes(code));
      this.questionsDataArray[index].series[this.questionsDataArray[index].series.length-1].data = this.questionsDataArray[index].series[this.questionsDataArray[index].series.length-1].data.map(code => ({ code }));
    }

    let mapPointArray1 = [];
    let mapPointArray2 = [];
    for (let i = 0; i < this.mapPointData.length; i++) {
      if (this.mapPointData[i].dedicatedFinancialContributionsToEOSCLinkedToPolicies === 'Yes') {
        mapPointArray1.push({name: this.mapPointData[i].code, lat: latlong.get(this.mapPointData[i].code).latitude, lon: latlong.get(this.mapPointData[i].code).longitude});
      } else if (this.mapPointData[i].dedicatedFinancialContributionsToEOSCLinkedToPolicies === 'No') {
        mapPointArray2.push({name: this.mapPointData[i].code, lat: latlong.get(this.mapPointData[i].code).latitude, lon: latlong.get(this.mapPointData[i].code).longitude});
      }
    }

    let pos: number;
    if (mapPointArray1.length > 0) {
      pos = this.questionsDataArray[index].series.length;
      this.questionsDataArray[index].series[pos] = new Series('National policy is mandatory', false, 'mappoint');
      this.questionsDataArray[index].series[pos].data = mapPointArray1;
      this.questionsDataArray[index].series[pos].color = '#7CFC00';
      this.questionsDataArray[index].series[pos].marker.symbol = 'circle';
      this.questionsDataArray[index].series[pos].showInLegend = true;
    }

    if (mapPointArray2.length > 0) {
      pos = this.questionsDataArray[index].series.length;
      this.questionsDataArray[index].series[pos] = new Series('National policy is not mandatory', false, 'mappoint');
      this.questionsDataArray[index].series[pos].data = mapPointArray2;
      this.questionsDataArray[index].series[pos].color = '#FFEF00';
      this.questionsDataArray[index].series[pos].marker.symbol = 'diamond';
      this.questionsDataArray[index].series[pos].showInLegend = true;
    }
  }

}
