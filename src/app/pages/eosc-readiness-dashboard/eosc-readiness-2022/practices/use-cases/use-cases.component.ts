import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { EoscReadinessDataService } from "../../../../services/eosc-readiness-data.service";
import { StakeholdersService } from "../../../../../../survey-tool/app/services/stakeholders.service";
import { DataHandlerService } from "../../../../services/data-handler.service";
import { CountryTableData } from "../../../../../domain/country-table-data";
import { ColorPallet, EoscReadiness2022MapSubtitles } from "../../eosc-readiness2022-map-subtitles";
import { zip } from "rxjs/internal/observable/zip";
import { ActivityGauge } from "../../../../../shared/charts/gauge-activity/gauge-activity.component";
import { CategorizedAreaData, Series } from "../../../../../domain/categorizedAreaData";
import { countries } from "../../../../../domain/countries";
import UIkit from "uikit";

@Component({
  selector: 'app-national-policy',
  templateUrl: 'use-cases.component.html'
})

export class UseCasesComponent implements OnInit {
  year: string = null;
  countriesArray: string[] = [];
  tableAbsoluteDataArray: CountryTableData[][] = [];
  mapSubtitles: string[] = [];
  mapSubtitlesArray: string[][] = EoscReadiness2022MapSubtitles;
  questionsDataArray: any[] = [];
  tmpQuestionsDataArray: any[] = [];
  toolTipData: Map<string, string>[] = [];
  activityGaugeData: ActivityGauge[] = [];
  participatingCountries: number[] = [];
  participatingCountriesPercentage: number[] = [];
  tableData: string[][] = [];


  constructor(private route: ActivatedRoute, private queryData: EoscReadinessDataService,
              private stakeholdersService: StakeholdersService, private dataHandlerService: DataHandlerService) {
  }

  ngOnInit() {
    this.year = this.route.parent.parent.snapshot.paramMap.get('year');
    // if (!this.year)
    //   this.year = '2022';

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
    this.tableData = [];
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion55(),
      this.queryData.getQuestion(this.year, 'Question55'), // Publications
      // this.queryData.getQuestion59(),
      this.queryData.getQuestion(this.year, 'Question59'), // Data-management
      // this.queryData.getQuestion63(),
      this.queryData.getQuestion(this.year, 'Question63'), // FAIR-data
      // this.queryData.getQuestion67(),
      this.queryData.getQuestion(this.year, 'Question67'), // Open-data
      // this.queryData.getQuestion71(),
      this.queryData.getQuestion(this.year, 'Question71'), // Software
      // this.queryData.getQuestion75(),
      this.queryData.getQuestion(this.year, 'Question75'), // Services
      // this.queryData.getQuestion79(),
      this.queryData.getQuestion(this.year, 'Question79'), // Connecting repositories to EOSC
      // this.queryData.getQuestion83(),
      this.queryData.getQuestion(this.year, 'Question83'), // Data stewardship
      // this.queryData.getQuestion87(),
      this.queryData.getQuestion(this.year, 'Question87'), // Long-term data preservation
      // this.queryData.getQuestion91(),
      this.queryData.getQuestion(this.year, 'Question91'), // Skills/Training
      // this.queryData.getQuestion95(),
      this.queryData.getQuestion(this.year, 'Question95'), // Assessment
      // this.queryData.getQuestion99(),
      this.queryData.getQuestion(this.year, 'Question99'), // Engagement
    ).subscribe(
      res => {
        let y = 0;

        this.countriesArray = res[0];
        this.tableData[0] = ['Countries'].concat(this.countriesArray);

        this.participatingCountries[0] = this.dataHandlerService.convertRawDataForActivityGauge(res[1]);
        y = Math.round((this.participatingCountries[0]/this.countriesArray.length + Number.EPSILON) * 100);
        this.tableData[1] = ['Publications'].concat(this.dataHandlerService.convertRawDataForCumulativeTable(res[1], this.countriesArray));
        this.activityGaugeData.push({name: 'Publications', y: y});

        this.tableData[2] = this.dataHandlerService.convertRawDataForCumulativeTable(res[2], this.countriesArray);
        this.tableData[2] = this.dataHandlerService.convertRawDataForCumulativeTable(res[3], this.countriesArray, this.tableData[2]);
        this.tableData[2] = ['Data'].concat(this.dataHandlerService.convertRawDataForCumulativeTable(res[4], this.countriesArray, this.tableData[2]));
        this.participatingCountries[1] = this.countTableEntries(this.tableData[2]);
        y = Math.round((this.participatingCountries[1]/this.countriesArray.length + Number.EPSILON) * 100);
        this.activityGaugeData.push({name: 'Data', y: y});

        this.participatingCountries[2] = this.dataHandlerService.convertRawDataForActivityGauge(res[5]);
        y = Math.round((this.participatingCountries[2]/this.countriesArray.length + Number.EPSILON) * 100);
        this.tableData[3] = ['Software'].concat(this.dataHandlerService.convertRawDataForCumulativeTable(res[5], this.countriesArray));
        this.activityGaugeData.push({name: 'Software', y: y});

        this.participatingCountries[3] = this.dataHandlerService.convertRawDataForActivityGauge(res[6]);
        y = Math.round((this.participatingCountries[3]/this.countriesArray.length + Number.EPSILON) * 100);
        this.tableData[4] = ['Services'].concat(this.dataHandlerService.convertRawDataForCumulativeTable(res[6], this.countriesArray));
        this.activityGaugeData.push({name: 'Services', y: y});

        this.tableData[5] = this.dataHandlerService.convertRawDataForCumulativeTable(res[7], this.countriesArray);
        this.tableData[5] = this.dataHandlerService.convertRawDataForCumulativeTable(res[8], this.countriesArray, this.tableData[5]);
        this.tableData[5] = ['Infrastructure'].concat(this.dataHandlerService.convertRawDataForCumulativeTable(res[9], this.countriesArray, this.tableData[5]));
        this.participatingCountries[4] = this.countTableEntries(this.tableData[5]);
        y = Math.round((this.participatingCountries[4]/this.countriesArray.length + Number.EPSILON) * 100);
        this.activityGaugeData.push({name: 'Infrastructure', y: y});

        this.tableData[6] = ['Skills/Training'].concat(this.dataHandlerService.convertRawDataForCumulativeTable(res[10], this.countriesArray));
        this.participatingCountries[5] = this.dataHandlerService.convertRawDataForActivityGauge(res[10]);
        y =  Math.round((this.participatingCountries[5]/this.countriesArray.length + Number.EPSILON) * 100);
        this.activityGaugeData.push({name: 'Skills/Training', y: y});

        this.participatingCountries[6] = this.dataHandlerService.convertRawDataForActivityGauge(res[11]);
        y = Math.round((this.participatingCountries[6]/this.countriesArray.length + Number.EPSILON) * 100);
        this.tableData[7] = ['Assessment'].concat(this.dataHandlerService.convertRawDataForCumulativeTable(res[11], this.countriesArray));
        this.activityGaugeData.push({name: 'Assessment', y: y});

        this.participatingCountries[7] = this.dataHandlerService.convertRawDataForActivityGauge(res[12]);
        y = Math.round((this.participatingCountries[7]/this.countriesArray.length + Number.EPSILON) * 100);
        this.tableData[8] = ['Engagement'].concat(this.dataHandlerService.convertRawDataForCumulativeTable(res[12], this.countriesArray));
        this.activityGaugeData.push({name: 'Engagement', y: y});

        this.activityGaugeData = [...this.activityGaugeData];
        this.tableData = this.tableData[0].map((_, colIndex) => this.tableData.map(row => row[colIndex])); // Transpose 2d array
        for (let i = 1; i < this.tableData.length; i++) {
          let tmpData = countries.find(country => country.id === this.tableData[i][0]);
          if (tmpData)
            this.tableData[i][0] = tmpData.name + ` (${tmpData.id})`;
        }
        // console.log(this.tableData);
      },
      error => {console.error(error)},
      () => {}
    );
  }

  getPublicationsData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion55(),
      this.queryData.getQuestion(this.year, 'Question55'),
      // this.queryData.getQuestion55comment(),
      this.queryData.getQuestionComment(this.year, 'Question55'),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.tmpQuestionsDataArray[0] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        this.participatingCountries[0] = this.dataHandlerService.convertRawDataForActivityGauge(res[1]);
        this.participatingCountriesPercentage[0] = Math.round((this.participatingCountries[0]/this.countriesArray.length + Number.EPSILON) * 100);
        for (let i = 0; i < this.tmpQuestionsDataArray[0].series.length; i++) {
          this.tmpQuestionsDataArray[0].series[i].data = this.tmpQuestionsDataArray[0].series[i].data.map(code => ({ code }));
        }
        this.toolTipData[0] = this.dataHandlerService.covertRawDataGetText(res[2]);
        this.createMapDataFromCategorization(0,3);
      }
    );
  }

  getSoftwareData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion71(),
      this.queryData.getQuestion(this.year, 'Question71'),
      // this.queryData.getQuestion71comment(),
      this.queryData.getQuestion(this.year, 'Question71'),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.tmpQuestionsDataArray[1] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        this.participatingCountries[2] = this.dataHandlerService.convertRawDataForActivityGauge(res[1]);
        this.participatingCountriesPercentage[2] = Math.round((this.participatingCountries[2]/this.countriesArray.length + Number.EPSILON) * 100);
        for (let i = 0; i < this.tmpQuestionsDataArray[1].series.length; i++) {
          this.tmpQuestionsDataArray[1].series[i].data = this.tmpQuestionsDataArray[1].series[i].data.map(code => ({ code }));
        }
        this.toolTipData[1] = this.dataHandlerService.covertRawDataGetText(res[2]);
        this.createMapDataFromCategorization(1,3);
      }
    );
  }

  getServicesData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion75(),
      this.queryData.getQuestion(this.year, 'Question75'),
      // this.queryData.getQuestion75comment(),
      this.queryData.getQuestionComment(this.year, 'Question75'),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.tmpQuestionsDataArray[2] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        this.participatingCountries[3] = this.dataHandlerService.convertRawDataForActivityGauge(res[1]);
        this.participatingCountriesPercentage[3] = Math.round((this.participatingCountries[3]/this.countriesArray.length + Number.EPSILON) * 100);
        for (let i = 0; i < this.tmpQuestionsDataArray[2].series.length; i++) {
          this.tmpQuestionsDataArray[2].series[i].data = this.tmpQuestionsDataArray[2].series[i].data.map(code => ({ code }));
        }
        this.toolTipData[2] = this.dataHandlerService.covertRawDataGetText(res[2]);
        this.createMapDataFromCategorization(2,3);
      }
    );
  }

  getSkillsTrainingData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion91(),
      this.queryData.getQuestion(this.year, 'Question91'),
      // this.queryData.getQuestion91comment(),
      this.queryData.getQuestionComment(this.year, 'Question91'),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.tmpQuestionsDataArray[3] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        this.participatingCountries[5] = this.dataHandlerService.convertRawDataForActivityGauge(res[1]);
        this.participatingCountriesPercentage[5] = Math.round((this.participatingCountries[5]/this.countriesArray.length + Number.EPSILON) * 100);
        for (let i = 0; i < this.tmpQuestionsDataArray[3].series.length; i++) {
          this.tmpQuestionsDataArray[3].series[i].data = this.tmpQuestionsDataArray[3].series[i].data.map(code => ({ code }));
        }
        this.toolTipData[3] = this.dataHandlerService.covertRawDataGetText(res[2]);
        this.createMapDataFromCategorization(3,3);
      }
    );
  }

  getAssessmentData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion95(),
      this.queryData.getQuestion(this.year, 'Question95'),
      // this.queryData.getQuestion95comment(),
      this.queryData.getQuestionComment(this.year, 'Question95'),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.tmpQuestionsDataArray[4] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        this.participatingCountries[6] = this.dataHandlerService.convertRawDataForActivityGauge(res[1]);
        this.participatingCountriesPercentage[6] = Math.round((this.participatingCountries[6]/this.countriesArray.length + Number.EPSILON) * 100);
        for (let i = 0; i < this.tmpQuestionsDataArray[4].series.length; i++) {
          this.tmpQuestionsDataArray[4].series[i].data = this.tmpQuestionsDataArray[4].series[i].data.map(code => ({ code }));
        }
        this.toolTipData[4] = this.dataHandlerService.covertRawDataGetText(res[2]);
        this.createMapDataFromCategorization(4,3);
      }
    );
  }

  getEngagementData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion99(),
      this.queryData.getQuestion(this.year, 'Question99'),
      // this.queryData.getQuestion99comment(),
      this.queryData.getQuestionComment(this.year, 'Question99'),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.tmpQuestionsDataArray[5] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        this.participatingCountries[7] = this.dataHandlerService.convertRawDataForActivityGauge(res[1]);
        this.participatingCountriesPercentage[7] = Math.round((this.participatingCountries[7]/this.countriesArray.length + Number.EPSILON) * 100);
        for (let i = 0; i < this.tmpQuestionsDataArray[5].series.length; i++) {
          this.tmpQuestionsDataArray[5].series[i].data = this.tmpQuestionsDataArray[5].series[i].data.map(code => ({ code }));
        }
        this.toolTipData[5] = this.dataHandlerService.covertRawDataGetText(res[2]);
        this.createMapDataFromCategorization(5,3);
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
        countryCodeArray.push(data.code)
      }
    }

    this.questionsDataArray[index].series[this.questionsDataArray[index].series.length] = new Series('Awaiting Data', false);
    this.questionsDataArray[index].series[this.questionsDataArray[index].series.length-1].showInLegend = true;
    this.questionsDataArray[index].series[this.questionsDataArray[index].series.length-1].color = ColorPallet[this.questionsDataArray[index].series.length-1];
    this.questionsDataArray[index].series[this.questionsDataArray[index].series.length-1].data = this.countriesArray.filter(code => !countryCodeArray.includes(code));
    this.questionsDataArray[index].series[this.questionsDataArray[index].series.length-1].data = this.questionsDataArray[index].series[this.questionsDataArray[index].series.length-1].data.map(code => ({ code }));
  }

  countTableEntries(column: string[]) {
    let count = 0;
    column.forEach(row => {
      if (row === 'true')
        count++;
    })
    return count;
  }

}
