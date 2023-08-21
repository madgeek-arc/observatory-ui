import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {EoscReadiness2022DataService} from "../../../../services/eosc-readiness2022-data.service";
import {StakeholdersService} from "../../../../../../survey-tool/app/services/stakeholders.service";
import {DataHandlerService} from "../../../../services/data-handler.service";
import {CountryTableData} from "../../../../../../survey-tool/app/domain/country-table-data";
import {ColorPallet, EoscReadiness2022MapSubtitles} from "../../eosc-readiness2022-map-subtitles";
import {latlong} from "../../../../../../survey-tool/app/domain/countries-lat-lon";
import {ActivityGauge, CategorizedAreaData, Series} from "../../../../../../survey-tool/app/domain/categorizedAreaData";
import {zip} from "rxjs/internal/observable/zip";
import UIkit from "uikit";

@Component({
  selector: 'app-national-policy',
  templateUrl: 'national-policy.component.html'
})

export class NationalPolicyComponent implements OnInit {

  countriesArray: string[] = [];
  tableAbsoluteDataArray: CountryTableData[][] = [];
  mapSubtitles: string[] = [];
  mapSubtitlesArray: string[][] = EoscReadiness2022MapSubtitles;
  questionsDataArray: any[] = [];
  tmpQuestionsDataArray: any[] = [];
  mapPointData: CountryTableData[];
  activityGaugeData: ActivityGauge[] = [];
  activitySum: number = 0;
  tableData: string[][] = [];

  constructor(private route: ActivatedRoute, private queryData: EoscReadiness2022DataService,
              private stakeholdersService: StakeholdersService, private dataHandlerService: DataHandlerService) {
  }

  ngOnInit() {

    this.route.params.subscribe(
      params => {
        // console.log('policies component params');
        if (params['type'] === 'all') {
          UIkit.switcher('#topSelector').show(0);
          this.getAllData();
        }
        if (params['type'] === 'publications') {
          UIkit.switcher('#topSelector').show(1);
          this.getPublicationsData();
        }
        if (params['type'] === 'data') {
          UIkit.switcher('#topSelector').show(2);
        }
        if (params['type'] === 'software') {
          UIkit.switcher('#topSelector').show(3);
          this.getSoftwareData();
        }
        if (params['type'] === 'services') {
          UIkit.switcher('#topSelector').show(4);
          this.getServicesData();
        }
        if (params['type'] === 'infrastructures') {
          UIkit.switcher('#topSelector').show(5);
        }
        if (params['type'] === 'skills_training') {
          UIkit.switcher('#topSelector').show(6);
          this.getSkillsTrainingData();
        }
        if (params['type'] === 'assessment') {
          UIkit.switcher('#topSelector').show(7);
          this.getAssessmentData();
        }
        if (params['type'] === 'engagement') {
          UIkit.switcher('#topSelector').show(8);
          this.getEngagementData();
        }
      }
    );
  }

  getAllData() {
    this.activityGaugeData = [];
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.queryData.getQuestion6(), // Publications
      this.queryData.getQuestion10(), // Data-management
      this.queryData.getQuestion14(), // FAIR-data
      this.queryData.getQuestion18(), // Open-data
      this.queryData.getQuestion22(), // Software
      this.queryData.getQuestion26(), // Services
      this.queryData.getQuestion30(), // Connecting repositories to EOSC
      this.queryData.getQuestion34(), // Data stewardship
      this.queryData.getQuestion38(), // Long-term data preservation
      this.queryData.getQuestion42(), // Skills/Training
      this.queryData.getQuestion46(), // Assessment
      this.queryData.getQuestion50(), // Engagement
      ).subscribe(
      res => {
        this.activitySum = 0;
        let count = 0;

        this.countriesArray = res[0];
        this.tableData[0] = ['Countries'].concat(this.countriesArray);

        count = this.dataHandlerService.convertRawDataForActivityGauge(res[1]);
        this.tableData[1] = ['Publications'].concat(this.dataHandlerService.convertRawDataForCumulativeTable(res[1], this.countriesArray));
        this.activityGaugeData.push({name: 'Publications', y: Math.round((count/this.countriesArray.length + Number.EPSILON) * 100)});
        this.activitySum += count;

        count = this.dataHandlerService.convertRawDataForActivityGauge(res[2]) + this.dataHandlerService.convertRawDataForActivityGauge(res[3]) + this.dataHandlerService.convertRawDataForActivityGauge(res[4]);
        this.activityGaugeData.push({name: 'Data', y: Math.round((count/(this.countriesArray.length*3) + Number.EPSILON) * 100)});
        this.activitySum += count;

        count = this.dataHandlerService.convertRawDataForActivityGauge(res[5]);
        this.tableData[2] = ['Software'].concat(this.dataHandlerService.convertRawDataForCumulativeTable(res[5], this.countriesArray));
        this.activityGaugeData.push({name: 'Software', y: Math.round((count/this.countriesArray.length + Number.EPSILON) * 100)});
        this.activitySum += count;

        count = this.dataHandlerService.convertRawDataForActivityGauge(res[6]);
        this.tableData[3] = ['Services'].concat(this.dataHandlerService.convertRawDataForCumulativeTable(res[6], this.countriesArray));
        this.activityGaugeData.push({name: 'Services', y: Math.round((count/this.countriesArray.length + Number.EPSILON) * 100)});
        this.activitySum += count;

        count = this.dataHandlerService.convertRawDataForActivityGauge(res[7]) + this.dataHandlerService.convertRawDataForActivityGauge(res[8]) + this.dataHandlerService.convertRawDataForActivityGauge(res[9]);
        this.activityGaugeData.push({name: 'Infrastructures', y: Math.round((count/(this.countriesArray.length*3) + Number.EPSILON) * 100)});
        this.activitySum += count;

        count = this.dataHandlerService.convertRawDataForActivityGauge(res[10]);
        this.tableData[4] = ['Skills/Training'].concat(this.dataHandlerService.convertRawDataForCumulativeTable(res[10], this.countriesArray));
        this.activityGaugeData.push({name: 'Skills/Training', y: Math.round((count/this.countriesArray.length + Number.EPSILON) * 100)});
        this.activitySum += count;

        count = this.dataHandlerService.convertRawDataForActivityGauge(res[11]);
        this.tableData[5] = ['Assessment'].concat(this.dataHandlerService.convertRawDataForCumulativeTable(res[11], this.countriesArray));
        this.activityGaugeData.push({name: 'Assessment', y: Math.round((count/this.countriesArray.length + Number.EPSILON) * 100)});
        this.activitySum += count;

        count = this.dataHandlerService.convertRawDataForActivityGauge(res[12]);
        this.tableData[6] = ['Engagement'].concat(this.dataHandlerService.convertRawDataForCumulativeTable(res[12], this.countriesArray));
        this.activityGaugeData.push({name: 'Engagement', y: Math.round((count/this.countriesArray.length + Number.EPSILON) * 100)});
        this.activitySum += count;

        this.activityGaugeData = [...this.activityGaugeData];
        console.log(this.tableData);
      },
      error => {console.error(error)},
      () => {}
    );
  }



  getPublicationsData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.queryData.getQuestion6(),
      this.queryData.getQuestion6_1(),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.tableAbsoluteDataArray[0] = this.dataHandlerService.convertRawDataToTableData(res[1]);
        this.tmpQuestionsDataArray[0] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        for (let i = 0; i < this.tmpQuestionsDataArray[0].series.length; i++) {
          this.tmpQuestionsDataArray[0].series[i].data = this.tmpQuestionsDataArray[0].series[i].data.map(code => ({ code }));
        }
        this.mapPointData = this.dataHandlerService.convertRawDataToTableData(res[2]);
        this.createMapDataFromCategorizationWithDots(0,0);

      },
      error => {console.error(error)},
      () => {}
    );
  }

  getSoftwareData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.queryData.getQuestion22(),
      this.queryData.getQuestion22_1(),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.tableAbsoluteDataArray[1] = this.dataHandlerService.convertRawDataToTableData(res[1]);
        this.tmpQuestionsDataArray[1] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        for (let i = 0; i < this.tmpQuestionsDataArray[1].series.length; i++) {
          this.tmpQuestionsDataArray[1].series[i].data = this.tmpQuestionsDataArray[1].series[i].data.map(code => ({ code }));
        }
        this.mapPointData = this.dataHandlerService.convertRawDataToTableData(res[2]);
        this.createMapDataFromCategorizationWithDots(1,0);

      },
      error => {console.error(error)},
      () => {}
    );
  }

  getServicesData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.queryData.getQuestion26(),
      this.queryData.getQuestion26_1(),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.tableAbsoluteDataArray[2] = this.dataHandlerService.convertRawDataToTableData(res[1]);
        this.tmpQuestionsDataArray[2] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        for (let i = 0; i < this.tmpQuestionsDataArray[2].series.length; i++) {
          this.tmpQuestionsDataArray[2].series[i].data = this.tmpQuestionsDataArray[2].series[i].data.map(code => ({ code }));
        }
        this.mapPointData = this.dataHandlerService.convertRawDataToTableData(res[2]);
        this.createMapDataFromCategorizationWithDots(2,0);

      },
      error => {console.error(error)},
      () => {}
    );
  }

  getSkillsTrainingData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.queryData.getQuestion42(),
      this.queryData.getQuestion42_1(),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.tableAbsoluteDataArray[3] = this.dataHandlerService.convertRawDataToTableData(res[1]);
        this.tmpQuestionsDataArray[3] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        for (let i = 0; i < this.tmpQuestionsDataArray[3].series.length; i++) {
          this.tmpQuestionsDataArray[3].series[i].data = this.tmpQuestionsDataArray[3].series[i].data.map(code => ({ code }));
        }
        this.mapPointData = this.dataHandlerService.convertRawDataToTableData(res[2]);
        this.createMapDataFromCategorizationWithDots(3,0);

      },
      error => {console.error(error)},
      () => {}
    );
  }

  getAssessmentData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.queryData.getQuestion46(),
      this.queryData.getQuestion46_1(),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.tableAbsoluteDataArray[4] = this.dataHandlerService.convertRawDataToTableData(res[1]);
        this.tmpQuestionsDataArray[4] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        for (let i = 0; i < this.tmpQuestionsDataArray[4].series.length; i++) {
          this.tmpQuestionsDataArray[4].series[i].data = this.tmpQuestionsDataArray[4].series[i].data.map(code => ({ code }));
        }
        this.mapPointData = this.dataHandlerService.convertRawDataToTableData(res[2]);
        this.createMapDataFromCategorizationWithDots(4,0);

      },
      error => {console.error(error)},
      () => {}
    );
  }

  getEngagementData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.queryData.getQuestion50(),
      this.queryData.getQuestion50_1(),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.tableAbsoluteDataArray[5] = this.dataHandlerService.convertRawDataToTableData(res[1]);
        this.tmpQuestionsDataArray[5] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        for (let i = 0; i < this.tmpQuestionsDataArray[5].series.length; i++) {
          this.tmpQuestionsDataArray[5].series[i].data = this.tmpQuestionsDataArray[5].series[i].data.map(code => ({ code }));
        }
        this.mapPointData = this.dataHandlerService.convertRawDataToTableData(res[2]);
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
      this.questionsDataArray[index].series[pos] = new Series('Is mandatory', false, 'mappoint');
      this.questionsDataArray[index].series[pos].data = mapPointArray1;
      this.questionsDataArray[index].series[pos].color = '#7CFC00';
      this.questionsDataArray[index].series[pos].marker.symbol = 'circle';
      this.questionsDataArray[index].series[pos].showInLegend = true;
    }

    if (mapPointArray2.length > 0) {
      pos = this.questionsDataArray[index].series.length;
      this.questionsDataArray[index].series[pos] = new Series('Not mandatory', false, 'mappoint');
      this.questionsDataArray[index].series[pos].data = mapPointArray2;
      this.questionsDataArray[index].series[pos].color = '#FFEF00';
      this.questionsDataArray[index].series[pos].marker.symbol = 'diamond';
      this.questionsDataArray[index].series[pos].showInLegend = true;
    }
  }

}
