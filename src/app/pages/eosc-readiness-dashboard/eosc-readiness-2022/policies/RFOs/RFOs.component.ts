import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { EoscReadinessDataService } from "../../../../services/eosc-readiness-data.service";
import { StakeholdersService } from "../../../../../../survey-tool/app/services/stakeholders.service";
import { DataHandlerService } from "../../../../services/data-handler.service";
import { CountryTableData } from "../../../../../../survey-tool/app/domain/country-table-data";
import { EoscReadiness2022MapSubtitles } from "../../eosc-readiness2022-map-subtitles";
import { zip } from "rxjs/internal/observable/zip";
import { ActivityGauge } from "../../../../../../survey-tool/app/domain/categorizedAreaData";
import { RawData } from "../../../../../../survey-tool/app/domain/raw-data";
import { isNumeric } from "rxjs/internal-compatibility";
import { countries } from "../../../../../../survey-tool/app/domain/countries";
import UIkit from "uikit";

@Component({
  selector: 'app-national-policy',
  templateUrl: 'RFOs.component.html'
})

export class RFOsComponent implements OnInit {
  year: string = null;
  countriesArray: string[] = [];
  tableAbsoluteDataArray: CountryTableData[][] = [];
  mapSubtitles: string[] = [];
  mapSubtitlesArray: string[][] = EoscReadiness2022MapSubtitles;
  questionsDataArray: any[] = [];
  tmpQuestionsDataArray: any[] = [];
  questionsDataArrayForBarChart: any[] = [];
  sumsArray: string[] = [];
  toolTipData: Map<string, string>[] = [];
  activityGaugeData: ActivityGauge[] = [];
  participatingCountries: number[] = [];
  tableData: string[][] = [];

  constructor(private route: ActivatedRoute, private queryData: EoscReadinessDataService,
              private stakeholdersService: StakeholdersService, private dataHandlerService: DataHandlerService) {
  }

  ngOnInit() {
    this.stakeholdersService.getEOSCSBCountries().subscribe(
      res => {this.countriesArray = res;},
      error => {console.error(error)}
    );

    this.year = this.route.parent.parent.snapshot.paramMap.get('year');
    // if (!this.year)
    //   this.year = '2022';

    this.route.params.subscribe(
      params => {
        if (params['type'] === 'all') {
          this.getAll();
          UIkit.switcher('#topSelector').show(0);
        }
        if (params['type'] === 'publications') {
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
      // this.queryData.getQuestion9(),
      this.queryData.getQuestion(this.year, 'Question9'), // Publications
      // this.queryData.getQuestion13(),
      this.queryData.getQuestion(this.year, 'Question13'), // Data-management
      // this.queryData.getQuestion17(),
      this.queryData.getQuestion(this.year, 'Question17'), // FAIR-data
      // this.queryData.getQuestion21(),
      this.queryData.getQuestion(this.year, 'Question21'), // Open-data
      // this.queryData.getQuestion25(),
      this.queryData.getQuestion(this.year, 'Question25'), // Software
      // this.queryData.getQuestion29(),
      this.queryData.getQuestion(this.year, 'Question29'), // Services
      // this.queryData.getQuestion33(),
      this.queryData.getQuestion(this.year, 'Question33'), // Connecting repositories to EOSC
      // this.queryData.getQuestion37(),
      this.queryData.getQuestion(this.year, 'Question37'), // Data stewardship
      // this.queryData.getQuestion41(),
      this.queryData.getQuestion(this.year, 'Question41'), // Long-term data preservation
      // this.queryData.getQuestion45(),
      this.queryData.getQuestion(this.year, 'Question45'), // Skills/Training
      // this.queryData.getQuestion49(),
      this.queryData.getQuestion(this.year, 'Question49'), // Assessment
      // this.queryData.getQuestion53(),
      this.queryData.getQuestion(this.year, 'Question53'), // Engagement
    ).subscribe(
      res => {
        let y = 0;
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
        this.sumsArray[1] = this.calculateSum(res[5]);

        this.participatingCountries[3] = this.dataHandlerService.convertRawDataForActivityGauge(res[6]);
        y = Math.round((this.participatingCountries[3]/this.countriesArray.length + Number.EPSILON) * 100);
        this.tableData[4] = ['Services'].concat(this.dataHandlerService.convertRawDataForCumulativeTable(res[6], this.countriesArray));
        this.activityGaugeData.push({name: 'Services', y: y});
        this.sumsArray[2] = this.calculateSum(res[6]);

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
        this.sumsArray[3] = this.calculateSum(res[10]);

        this.participatingCountries[6] = this.dataHandlerService.convertRawDataForActivityGauge(res[11]);
        y = Math.round((this.participatingCountries[6]/this.countriesArray.length + Number.EPSILON) * 100);
        this.tableData[7] = ['Assessment'].concat(this.dataHandlerService.convertRawDataForCumulativeTable(res[11], this.countriesArray));
        this.activityGaugeData.push({name: 'Assessment', y: y});
        this.sumsArray[4] = this.calculateSum(res[11]);

        this.participatingCountries[7] = this.dataHandlerService.convertRawDataForActivityGauge(res[12]);
        y = Math.round((this.participatingCountries[7]/this.countriesArray.length + Number.EPSILON) * 100);
        this.tableData[8] = ['Engagement'].concat(this.dataHandlerService.convertRawDataForCumulativeTable(res[12], this.countriesArray));
        this.activityGaugeData.push({name: 'Engagement', y: y});
        this.sumsArray[5] = this.calculateSum(res[12]);

        this.activityGaugeData = [...this.activityGaugeData];
        this.tableData = this.tableData[0].map((_, colIndex) => this.tableData.map(row => row[colIndex])); // Transpose 2d array
        for (let i = 1; i < this.tableData.length; i++) {
          let tmpData = countries.find(country => country.id === this.tableData[i][0]);
          if (tmpData)
            this.tableData[i][0] = tmpData.name + ` (${tmpData.id})`;
        }
        // console.log(this.tableData);
      }
    )
  }

  getPublicationsData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion9(),
      this.queryData.getQuestion(this.year, 'Question9'),
      // this.queryData.getQuestion9comment(),
      this.queryData.getQuestionComment(this.year, 'Question9'),
    ).subscribe(
      res => {
        this.questionsDataArray[0] = this.questionsDataArrayForBarChart[0] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        let tempArr: string[] = [];
        this.questionsDataArray[0].forEach((data: string[]) => {tempArr.push(data[0]);});
        this.countriesArray = res[0].map(element => {return element.toLowerCase()}).filter(element => !tempArr.includes(element));
        this.sumsArray[0] = this.calculateSum(res[1]);
        this.toolTipData[0] = this.dataHandlerService.covertRawDataGetText(res[2]);
      }
    );
  }

  getSoftwareData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion25(),
      this.queryData.getQuestion(this.year, 'Question25'),
      // this.queryData.getQuestion25comment(),
      this.queryData.getQuestionComment(this.year, 'Question25'),
    ).subscribe(
      res => {
        this.questionsDataArray[1] = this.questionsDataArrayForBarChart[1] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        let tempArr: string[] = [];
        this.questionsDataArray[1].forEach((data: string[]) => {tempArr.push(data[0]);});
        this.countriesArray = res[0].map(element => {return element.toLowerCase()}).filter(element => !tempArr.includes(element));
        this.sumsArray[1] = this.calculateSum(res[1]);
        this.toolTipData[1] = this.dataHandlerService.covertRawDataGetText(res[2]);
      }
    );
  }

  getServicesData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion29(),
      this.queryData.getQuestion(this.year, 'Question29'),
      // this.queryData.getQuestion29comment(),
      this.queryData.getQuestionComment(this.year, 'Question29'),
    ).subscribe(
      res => {
        this.questionsDataArray[2] = this.questionsDataArrayForBarChart[2] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        let tempArr: string[] = [];
        this.questionsDataArray[2].forEach((data: string[]) => {tempArr.push(data[0]);});
        this.countriesArray = res[0].map(element => {return element.toLowerCase()}).filter(element => !tempArr.includes(element));
        this.sumsArray[2] = this.calculateSum(res[1]);
        this.toolTipData[2] = this.dataHandlerService.covertRawDataGetText(res[2]);
      }
    );
  }

  getSkillsTrainingData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion45(),
      this.queryData.getQuestion(this.year, 'Question45'),
      // this.queryData.getQuestion45comment(),
      this.queryData.getQuestionComment(this.year, 'Question45'),
    ).subscribe(
      res => {
        this.questionsDataArray[3] = this.questionsDataArrayForBarChart[3] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        let tempArr: string[] = [];
        this.questionsDataArray[3].forEach((data: string[]) => {tempArr.push(data[0]);});
        this.countriesArray = res[0].map(element => {return element.toLowerCase()}).filter(element => !tempArr.includes(element));
        this.sumsArray[3] = this.calculateSum(res[1]);
        this.toolTipData[3] = this.dataHandlerService.covertRawDataGetText(res[2]);
      }
    );
  }

  getAssessmentData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion49(),
      this.queryData.getQuestion(this.year, 'Question49'),
      // this.queryData.getQuestion49comment(),
      this.queryData.getQuestionComment(this.year, 'Question49'),
    ).subscribe(
      res => {
        this.questionsDataArray[4] = this.questionsDataArrayForBarChart[4] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        let tempArr: string[] = [];
        this.questionsDataArray[4].forEach((data: string[]) => {tempArr.push(data[0]);});
        this.countriesArray = res[0].map(element => {return element.toLowerCase()}).filter(element => !tempArr.includes(element));
        this.sumsArray[4] = this.calculateSum(res[1]);
        this.toolTipData[4] = this.dataHandlerService.covertRawDataGetText(res[2]);
      }
    );
  }

  getEngagementData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion53(),
      this.queryData.getQuestion(this.year, 'Question53'),
      // this.queryData.getQuestion53comment(),
      this.queryData.getQuestion(this.year, 'Question53'),
    ).subscribe(
      res => {
        this.questionsDataArray[5] = this.questionsDataArrayForBarChart[5] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        let tempArr: string[] = [];
        this.questionsDataArray[5].forEach((data: string[]) => {tempArr.push(data[0]);});
        this.countriesArray = res[0].map(element => {return element.toLowerCase()}).filter(element => !tempArr.includes(element));
        this.sumsArray[5] = this.calculateSum(res[1]);
        this.toolTipData[5] = this.dataHandlerService.covertRawDataGetText(res[2]);
      }
    );
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

  countTableEntries(column: string[]) {
    let count = 0;
    column.forEach(row => {
      if (row === 'true')
        count++;
    })
    return count;
  }

}
