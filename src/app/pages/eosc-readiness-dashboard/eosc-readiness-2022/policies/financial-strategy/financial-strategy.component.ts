import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { EoscReadinessDataService } from "../../../../services/eosc-readiness-data.service";
import { StakeholdersService } from "../../../../../../survey-tool/app/services/stakeholders.service";
import { DataHandlerService } from "../../../../services/data-handler.service";
import { CountryTableData } from "../../../../../domain/country-table-data";
import { ColorPallet, EoscReadiness2022MapSubtitles } from "../../eosc-readiness2022-map-subtitles";
import { zip } from "rxjs/internal/observable/zip";
import { ActivityGauge } from "../../../../../shared/charts/gauge-activity/gauge-activity.component";
import { countries } from "../../../../../domain/countries";
import { CategorizedAreaData, Series } from "../../../../../domain/categorizedAreaData";
import * as UIkit from 'uikit';

@Component({
    selector: 'app-national-policy',
    templateUrl: 'financial-strategy.component.html',
    standalone: false
})

export class FinancialStrategyComponent implements OnInit {
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
    this.stakeholdersService.getEOSCSBCountries().subscribe(
      res => {this.countriesArray = res;},
      error => {console.error(error)}
    )

    this.year = this.route.parent.parent.snapshot.paramMap.get('year');
    // if (!this.year)
    //   this.year = '2022';

    this.route.params.subscribe(
      params => {
        if (params['type'] === 'all') {
          this.getAll();
          UIkit.switcher('#topSelector').show(0);
        }
        if (params['type'] === 'publications'){
          this.getPublicationsData();
          UIkit.switcher('#topSelector').show(1);
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

  getAll() {
    this.activityGaugeData = [];
    this.tableData = [];
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion7(),
      this.queryData.getQuestion(this.year, 'Question7'),  // Publications
      // this.queryData.getQuestion11(),
      this.queryData.getQuestion(this.year, 'Question11'), // Data-management
      // this.queryData.getQuestion15(),
      this.queryData.getQuestion(this.year, 'Question15'), // FAIR-data
      // this.queryData.getQuestion19(),
      this.queryData.getQuestion(this.year, 'Question19'), // Open-data
      // this.queryData.getQuestion23(),
      this.queryData.getQuestion(this.year, 'Question23'), // Software
      // this.queryData.getQuestion27(),
      this.queryData.getQuestion(this.year, 'Question27'), // Services
      // this.queryData.getQuestion31(),
      this.queryData.getQuestion(this.year, 'Question31'), // Connecting repositories to EOSC
      // this.queryData.getQuestion35(),
      this.queryData.getQuestion(this.year, 'Question35'), // Data stewardship
      // this.queryData.getQuestion39(),
      this.queryData.getQuestion(this.year, 'Question39'),// Long-term data preservation
      // this.queryData.getQuestion43(),
      this.queryData.getQuestion(this.year, 'Question43'),// Skills/Training
      // this.queryData.getQuestion47(),
      this.queryData.getQuestion(this.year, 'Question47'),// Assessment
      // this.queryData.getQuestion51(),
      this.queryData.getQuestion(this.year, 'Question51'), // Engagement
    ).subscribe(
      res => {
        let y: number;
        this.countriesArray = res[0];
        this.tableData[0] = ['Countries'].concat(this.countriesArray);

        this.participatingCountries[0] = this.dataHandlerService.convertRawDataForActivityGauge(res[1]);
        y = Math.round((this.participatingCountries[0]/this.countriesArray.length + Number.EPSILON) * 100);
        this.activityGaugeData.push({name: 'Publications', y: y});
        this.tableData[1] = ['Publications'].concat(this.dataHandlerService.convertRawDataForCumulativeTable(res[1], this.countriesArray));

        this.tableData[2] = this.dataHandlerService.convertRawDataForCumulativeTable(res[2], this.countriesArray);
        this.tableData[2] = this.dataHandlerService.convertRawDataForCumulativeTable(res[3], this.countriesArray, this.tableData[2]);
        this.tableData[2] = ['Data'].concat(this.dataHandlerService.convertRawDataForCumulativeTable(res[4], this.countriesArray, this.tableData[2]));
        this.participatingCountries[1] = this.countTableEntries(this.tableData[2]);
        y = Math.round((this.participatingCountries[1]/this.countriesArray.length + Number.EPSILON) * 100);
        this.activityGaugeData.push({name: 'Data', y: y});

        this.participatingCountries[2] = this.dataHandlerService.convertRawDataForActivityGauge(res[5]);
        y = Math.round((this.participatingCountries[2]/this.countriesArray.length + Number.EPSILON) * 100);
        this.activityGaugeData.push({name: 'Software', y: y});
        this.tableData[3] = ['Software'].concat(this.dataHandlerService.convertRawDataForCumulativeTable(res[5], this.countriesArray));

        this.participatingCountries[3] = this.dataHandlerService.convertRawDataForActivityGauge(res[6]);
        y = Math.round((this.participatingCountries[3]/this.countriesArray.length + Number.EPSILON) * 100);
        this.tableData[4] = ['Services'].concat(this.dataHandlerService.convertRawDataForCumulativeTable(res[6], this.countriesArray));
        this.activityGaugeData.push({name: 'Services', y: y});

        this.tableData[5] = this.dataHandlerService.convertRawDataForCumulativeTable(res[7], this.countriesArray);
        this.tableData[5] = this.dataHandlerService.convertRawDataForCumulativeTable(res[8], this.countriesArray, this.tableData[5]);
        this.tableData[5] = ['Infrastructures'].concat(this.dataHandlerService.convertRawDataForCumulativeTable(res[9], this.countriesArray, this.tableData[5]));
        this.participatingCountries[4] = this.countTableEntries(this.tableData[5]);
        y = Math.round((this.participatingCountries[4]/this.countriesArray.length + Number.EPSILON) * 100);
        this.activityGaugeData.push({name: 'Infrastructures', y: y});

        this.participatingCountries[5] = this.dataHandlerService.convertRawDataForActivityGauge(res[10]);
        y =  Math.round((this.participatingCountries[5]/this.countriesArray.length + Number.EPSILON) * 100);
        this.tableData[6] = ['Skills/Training'].concat(this.dataHandlerService.convertRawDataForCumulativeTable(res[10], this.countriesArray));
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
      }
    );
  }

  getPublicationsData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion7(),
      this.queryData.getQuestion(this.year, 'Question7'),
      // this.queryData.getQuestion7comment(),
      this.queryData.getQuestionComment(this.year, 'Question7'),
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
        this.createMapDataFromCategorization(0,1);
      }
    );
  }

  getSoftwareData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion23(),
      this.queryData.getQuestion(this.year, 'Question23'),
      // this.queryData.getQuestion23comment(),
      this.queryData.getQuestionComment(this.year, 'Question23'),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.participatingCountries[2] = this.dataHandlerService.convertRawDataForActivityGauge(res[1]);
        this.participatingCountriesPercentage[2] = Math.round((this.participatingCountries[2]/this.countriesArray.length + Number.EPSILON) * 100);
        this.tmpQuestionsDataArray[1] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        for (let i = 0; i < this.tmpQuestionsDataArray[1].series.length; i++) {
          this.tmpQuestionsDataArray[1].series[i].data = this.tmpQuestionsDataArray[1].series[i].data.map(code => ({ code }));
        }
        this.toolTipData[1] = this.dataHandlerService.covertRawDataGetText(res[2]);
        this.createMapDataFromCategorization(1,1);
      }
    );
  }

  getServicesData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion27(),
      this.queryData.getQuestion(this.year, 'Question27'),
      // this.queryData.getQuestion27comment(),
      this.queryData.getQuestionComment(this.year, 'Question27'),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.participatingCountries[3] = this.dataHandlerService.convertRawDataForActivityGauge(res[1]);
        this.participatingCountriesPercentage[3] = Math.round((this.participatingCountries[3]/this.countriesArray.length + Number.EPSILON) * 100);
        this.tmpQuestionsDataArray[2] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        for (let i = 0; i < this.tmpQuestionsDataArray[2].series.length; i++) {
          this.tmpQuestionsDataArray[2].series[i].data = this.tmpQuestionsDataArray[2].series[i].data.map(code => ({ code }));
        }
        this.toolTipData[2] = this.dataHandlerService.covertRawDataGetText(res[2]);
        this.createMapDataFromCategorization(2,1);
      }
    );
  }

  getSkillsTrainingData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion43(),
      this.queryData.getQuestion(this.year, 'Question43'),
      // this.queryData.getQuestion43comment(),
      this.queryData.getQuestionComment(this.year, 'Question43'),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.participatingCountries[5] = this.dataHandlerService.convertRawDataForActivityGauge(res[1]);
        this.participatingCountriesPercentage[5] = Math.round((this.participatingCountries[5]/this.countriesArray.length + Number.EPSILON) * 100);
        this.tmpQuestionsDataArray[3] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        for (let i = 0; i < this.tmpQuestionsDataArray[3].series.length; i++) {
          this.tmpQuestionsDataArray[3].series[i].data = this.tmpQuestionsDataArray[3].series[i].data.map(code => ({ code }));
        }
        this.toolTipData[3] = this.dataHandlerService.covertRawDataGetText(res[2]);
        this.createMapDataFromCategorization(3,1);
      }
    );
  }

  getAssessmentData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion47(),
      this.queryData.getQuestion(this.year, 'Question47'),
      // this.queryData.getQuestion47comment(),
      this.queryData.getQuestionComment(this.year, 'Question47'),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.participatingCountries[6] = this.dataHandlerService.convertRawDataForActivityGauge(res[1]);
        this.participatingCountriesPercentage[6] = Math.round((this.participatingCountries[6]/this.countriesArray.length + Number.EPSILON) * 100);
        this.tmpQuestionsDataArray[4] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        for (let i = 0; i < this.tmpQuestionsDataArray[4].series.length; i++) {
          this.tmpQuestionsDataArray[4].series[i].data = this.tmpQuestionsDataArray[4].series[i].data.map(code => ({ code }));
        }
        this.toolTipData[4] = this.dataHandlerService.covertRawDataGetText(res[2]);
        this.createMapDataFromCategorization(4,1);
      }
    );
  }

  getEngagementData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion51(),
      this.queryData.getQuestion(this.year, 'Question51'),
      // this.queryData.getQuestion51comment(),
      this.queryData.getQuestion(this.year, 'Question51'),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.participatingCountries[7] = this.dataHandlerService.convertRawDataForActivityGauge(res[1]);
        this.participatingCountriesPercentage[7] = Math.round((this.participatingCountries[7]/this.countriesArray.length + Number.EPSILON) * 100);
        // console.log(this.participatingCountriesPercentage);
        this.tmpQuestionsDataArray[5] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        for (let i = 0; i < this.tmpQuestionsDataArray[5].series.length; i++) {
          this.tmpQuestionsDataArray[5].series[i].data = this.tmpQuestionsDataArray[5].series[i].data.map(code => ({ code }));
        }
        this.toolTipData[5] = this.dataHandlerService.covertRawDataGetText(res[2]);
        this.createMapDataFromCategorization(5,1);
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
    // console.log(this.countriesArray.filter(code => !countryCodeArray.includes(code)));
    this.questionsDataArray[index].series[this.questionsDataArray[index].series.length] = new Series('Awaiting Data', false);
    this.questionsDataArray[index].series[this.questionsDataArray[index].series.length-1].showInLegend = true;
    this.questionsDataArray[index].series[this.questionsDataArray[index].series.length-1].color = ColorPallet[2];
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
