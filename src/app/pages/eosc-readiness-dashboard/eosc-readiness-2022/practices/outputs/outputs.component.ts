import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {EoscReadinessDataService} from "../../../../services/eosc-readiness-data.service";
import {StakeholdersService} from "../../../../../../survey-tool/app/services/stakeholders.service";
import {DataHandlerService} from "../../../../services/data-handler.service";
import {CountryTableData} from "../../../../../../survey-tool/app/domain/country-table-data";
import {EoscReadiness2022MapSubtitles} from "../../eosc-readiness2022-map-subtitles";
import {countries} from "../../../../../../survey-tool/app/domain/countries";
import {zip} from "rxjs/internal/observable/zip";
import {RawData} from "../../../../../../survey-tool/app/domain/raw-data";
import {isNumeric} from "rxjs/internal-compatibility";
import {ActivityGauge} from "../../../../../../survey-tool/app/domain/categorizedAreaData";
import UIkit from "uikit";

@Component({
  selector: 'app-national-policy',
  templateUrl: 'outputs.component.html'
})

export class OutputsComponent implements OnInit {
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
    this.year = this.route.parent.parent.snapshot.paramMap.get('year');
    // if (!this.year)
    //   this.year = '2022';

    this.route.params.subscribe(
      params => {
        if (params['type'] === 'all') {
          UIkit.switcher('#topSelector').show(0);
          this.getAll();
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

  getAll() {
    this.activityGaugeData = [];
    this.tableData = [];
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion57(),
      this.queryData.getQuestion(this.year, 'Question57'), // Publications
      // this.queryData.getQuestion61(),
      this.queryData.getQuestion(this.year, 'Question61'), // Data-management
      // this.queryData.getQuestion65(),
      this.queryData.getQuestion(this.year, 'Question65'), // FAIR-data
      // this.queryData.getQuestion69(),
      this.queryData.getQuestion(this.year, 'Question69'), // Open-data
      // this.queryData.getQuestion73(),
      this.queryData.getQuestion(this.year, 'Question73'), // Software
      // this.queryData.getQuestion77(),
      this.queryData.getQuestion(this.year, 'Question77'), // Services
      // this.queryData.getQuestion81(),
      this.queryData.getQuestion(this.year, 'Question81'), // Connecting repositories to EOSC
      // this.queryData.getQuestion85(),
      this.queryData.getQuestion(this.year, 'Question85'), // Data stewardship
      // this.queryData.getQuestion89(),
      this.queryData.getQuestion(this.year, 'Question89'), // Long-term data preservation
      // this.queryData.getQuestion93(),
      this.queryData.getQuestion(this.year, 'Question93'), // Skills/Training
      // this.queryData.getQuestion97(),
      this.queryData.getQuestion(this.year, 'Question97'), // Assessment
      // this.queryData.getQuestion101(),
      this.queryData.getQuestion(this.year, 'Question101'), // Engagement
    ).subscribe(
      res => {
        let y = 0;
        this.countriesArray = res[0];
        this.tableData[0] = ['Countries'].concat(this.countriesArray);

        this.participatingCountries[0] = this.dataHandlerService.convertRawDataForActivityGauge(res[1]);
        y = Math.round((this.participatingCountries[0]/this.countriesArray.length + Number.EPSILON) * 100);
        this.activityGaugeData.push({name: 'Publications', y: y});
        this.tableData[1] = ['Publications'].concat(this.dataHandlerService.convertRawDataForCumulativeTable(res[1], this.countriesArray));
        this.sumsArray[0] = this.calculateSum(res[1]);

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
        this.tableData[5] = ['Infrastructure'].concat(this.dataHandlerService.convertRawDataForCumulativeTable(res[9], this.countriesArray, this.tableData[5]));
        this.participatingCountries[4] = this.countTableEntries(this.tableData[5]);
        y = Math.round((this.participatingCountries[4]/this.countriesArray.length + Number.EPSILON) * 100);
        this.activityGaugeData.push({name: 'Infrastructure', y: y});

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
      },
      error => {}
    )
  }

  getPublicationsData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion57(),
      this.queryData.getQuestion(this.year, 'Question57'),
      // this.queryData.getQuestion57comment(),
      this.queryData.getQuestionComment(this.year, 'Question57'),
    ).subscribe(
      res => {
        this.questionsDataArray[0] = this.questionsDataArrayForBarChart[0] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        let tempArr: string[] = [];
        this.questionsDataArray[0].forEach((data: string[]) => {tempArr.push(data[0]);});
        this.countriesArray = res[0].map(element => {return element.toLowerCase()}).filter(element => !tempArr.includes(element));
        this.sumsArray[0] = this.calculateSum(res[1]);
        this.toolTipData[0] = this.dataHandlerService.covertRawDataGetText(res[2]);
      }
    )
  }

  getSoftwareData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion73(),
      this.queryData.getQuestion(this.year, 'Question73'),
      // this.queryData.getQuestion73comment(),
      this.queryData.getQuestionComment(this.year, 'Question73'),
    ).subscribe(
      res => {
        this.questionsDataArray[1] = this.questionsDataArrayForBarChart[1] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        let tempArr: string[] = [];
        this.questionsDataArray[1].forEach((data: string[]) => {tempArr.push(data[0]);});
        this.countriesArray = res[0].map(element => {return element.toLowerCase()}).filter(element => !tempArr.includes(element));
        this.sumsArray[1] = this.calculateSum(res[1]);
        this.toolTipData[1] = this.dataHandlerService.covertRawDataGetText(res[2]);
      }
    )
  }

  getServicesData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion77(),
      this.queryData.getQuestion(this.year, 'Question77'),
      // this.queryData.getQuestion77comment(),
      this.queryData.getQuestionComment(this.year, 'Question77'),
    ).subscribe(
      res => {
        this.questionsDataArray[2] = this.questionsDataArrayForBarChart[2] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        let tempArr: string[] = [];
        this.questionsDataArray[2].forEach((data: string[]) => {tempArr.push(data[0]);});
        this.countriesArray = res[0].map(element => {return element.toLowerCase()}).filter(element => !tempArr.includes(element));
        this.sumsArray[2] = this.calculateSum(res[1]);
        this.toolTipData[2] = this.dataHandlerService.covertRawDataGetText(res[2]);
      }
    )
  }

  getSkillsTrainingData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion93(),
      this.queryData.getQuestion(this.year, 'Question93'),
      // this.queryData.getQuestion93comment(),
      this.queryData.getQuestionComment(this.year, 'Question93'),
    ).subscribe(
      res => {
        this.questionsDataArray[3] = this.questionsDataArrayForBarChart[3] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        let tempArr: string[] = [];
        this.questionsDataArray[3].forEach((data: string[]) => {tempArr.push(data[0]);});
        this.countriesArray = res[0].map(element => {return element.toLowerCase()}).filter(element => !tempArr.includes(element));
        this.sumsArray[3] = this.calculateSum(res[1]);
        this.toolTipData[3] = this.dataHandlerService.covertRawDataGetText(res[2]);
      }
    )
  }

  getAssessmentData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion97(),
      this.queryData.getQuestion(this.year, 'Question97'),
      // this.queryData.getQuestion97comment(),
      this.queryData.getQuestionComment(this.year, 'Question97'),
    ).subscribe(
      res => {
        this.questionsDataArray[4] = this.questionsDataArrayForBarChart[4] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        let tempArr: string[] = [];
        this.questionsDataArray[4].forEach((data: string[]) => {tempArr.push(data[0]);});
        this.countriesArray = res[0].map(element => {return element.toLowerCase()}).filter(element => !tempArr.includes(element));
        this.sumsArray[4] = this.calculateSum(res[1]);
        this.toolTipData[4] = this.dataHandlerService.covertRawDataGetText(res[2]);
      }
    )
  }

  getEngagementData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion101(),
      this.queryData.getQuestion(this.year, 'Question101'),
      // this.queryData.getQuestion101comment(),
      this.queryData.getQuestionComment(this.year, 'Question101'),
    ).subscribe(
      res => {
        this.questionsDataArray[5] = this.questionsDataArrayForBarChart[5] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        let tempArr: string[] = [];
        this.questionsDataArray[5].forEach((data: string[]) => {tempArr.push(data[0]);});
        this.countriesArray = res[0].map(element => {return element.toLowerCase()}).filter(element => !tempArr.includes(element));
        this.sumsArray[5] = this.calculateSum(res[1]);
        this.toolTipData[5] = this.dataHandlerService.covertRawDataGetText(res[2]);
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

  countTableEntries(column: string[]) {
    let count = 0;
    column.forEach(row => {
      if (row === 'true')
        count++;
    })
    return count;
  }

}
