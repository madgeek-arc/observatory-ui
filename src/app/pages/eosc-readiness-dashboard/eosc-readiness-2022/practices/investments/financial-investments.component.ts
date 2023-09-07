import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {EoscReadiness2022DataService} from "../../../../services/eosc-readiness2022-data.service";
import {StakeholdersService} from "../../../../../../survey-tool/app/services/stakeholders.service";
import {DataHandlerService} from "../../../../services/data-handler.service";
import {CountryTableData} from "../../../../../../survey-tool/app/domain/country-table-data";
import {EoscReadiness2022MapSubtitles} from "../../eosc-readiness2022-map-subtitles";
import {zip} from "rxjs/internal/observable/zip";
import UIkit from "uikit";
import {RawData} from "../../../../../../survey-tool/app/domain/raw-data";
import {isNumeric} from "rxjs/internal-compatibility";
import {ActivityGauge} from "../../../../../../survey-tool/app/domain/categorizedAreaData";
import {countries} from "../../../../../../survey-tool/app/domain/countries";

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
  toolTipData: Map<string, string>[] = [];
  activityGaugeData: ActivityGauge[] = [];
  participatingCountries: number[] = [];
  tableData: string[][] = [];

  constructor(private router: Router, private route: ActivatedRoute, private queryData: EoscReadiness2022DataService,
              private stakeholdersService: StakeholdersService, private dataHandlerService: DataHandlerService) {
  }

  ngOnInit() {

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
      this.queryData.getQuestion56(),  // Publications
      this.queryData.getQuestion60(), // Data-management
      this.queryData.getQuestion64(), // FAIR-data
      this.queryData.getQuestion68(), // Open-data
      this.queryData.getQuestion72(), // Software
      this.queryData.getQuestion76(), // Services
      this.queryData.getQuestion80(), // Connecting repositories to EOSC
      this.queryData.getQuestion84(), // Data stewardship
      this.queryData.getQuestion88(), // Long-term data preservation
      this.queryData.getQuestion92(), // Skills/Training
      this.queryData.getQuestion96(), // Assessment
      this.queryData.getQuestion100(), // Engagement
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
      },
      error => {}
    )
  }

  getPublicationsData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.queryData.getQuestion56(),
      this.queryData.getQuestion56comment(),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.questionsDataArray[0] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        this.questionsDataArrayForBarChart[0] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        this.sumsArray[0] = this.calculateSum(res[1]);
        this.toolTipData[0] = this.dataHandlerService.covertRawDataGetText(res[2]);
      }
    )
  }

  getSoftwareData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.queryData.getQuestion72(),
      this.queryData.getQuestion72comment(),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.questionsDataArray[1] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        this.questionsDataArrayForBarChart[1] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        this.sumsArray[1] = this.calculateSum(res[1]);
        this.toolTipData[1] = this.dataHandlerService.covertRawDataGetText(res[2]);
      }
    )
  }

  getServicesData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.queryData.getQuestion76(),
      this.queryData.getQuestion76comment(),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.questionsDataArray[2] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        this.questionsDataArrayForBarChart[2] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        this.sumsArray[2] = this.calculateSum(res[1]);
        this.toolTipData[2] = this.dataHandlerService.covertRawDataGetText(res[2]);
      }
    )
  }

  getSkillsTrainingData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.queryData.getQuestion92(),
      this.queryData.getQuestion92comment(),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.questionsDataArray[3] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        this.questionsDataArrayForBarChart[3] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        this.sumsArray[3] = this.calculateSum(res[1]);
        this.toolTipData[3] = this.dataHandlerService.covertRawDataGetText(res[2]);
      }
    )
  }

  getAssessmentData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.queryData.getQuestion96(),
      this.queryData.getQuestion96comment(),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.questionsDataArray[4] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        this.questionsDataArrayForBarChart[4] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        this.sumsArray[4] = this.calculateSum(res[1]);
        this.toolTipData[4] = this.dataHandlerService.covertRawDataGetText(res[2]);
      }
    )
  }

  getEngagementData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.queryData.getQuestion100(),
      this.queryData.getQuestion100comment(),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.questionsDataArray[5] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        this.questionsDataArrayForBarChart[5] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
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
