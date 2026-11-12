import { Component, OnInit, ChangeDetectionStrategy, signal, inject } from "@angular/core";
import { ActivatedRoute, RouterLink, RouterOutlet } from "@angular/router";
import { EoscReadinessDataService } from "../../../../services/eosc-readiness-data.service";
import { StakeholdersService } from "src/survey-tool/app/services/stakeholders.service";
import { DataHandlerService } from "../../../../services/data-handler.service";
import { CountryTableData } from "src/app/domain/country-table-data";
import { EoscReadinessMapSubtitles } from "../../eosc-readiness-map-subtitles";
import { ActivityGauge } from "src/app/shared/charts/gauge-activity/gauge-activity.component";
import { RawData } from "src/app/domain/raw-data";
import { countries } from "src/app/domain/countries";
import { zip } from "rxjs/internal/observable/zip";
import { isNumeric } from "src/app/shared/utils/is-numeric";
import * as UIkit from 'uikit';
import { GaugeActivityComponent } from "../../../../../shared/charts/gauge-activity/gauge-activity.component";
import { CumulativeDataTablesComponent } from "../../tables/cumulative-data-tables.component";
import { HighchartsColorAxisMapComponent } from "../../../../../shared/charts/color-axis-map/highcharts-color-axis-map.component";
import { HighchartsBarComponent } from "../../../../../shared/charts/bar-chart/highcharts-bar.component";
import { setAt } from "src/app/shared/utils/set-at";

@Component({
    selector: 'app-national-policy',
    templateUrl: 'RPOs.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink, GaugeActivityComponent, CumulativeDataTablesComponent, HighchartsColorAxisMapComponent, HighchartsBarComponent, RouterOutlet]
})

export class RPOsComponent implements OnInit {
  year: string = null;
  countriesArray = signal<string[]>([]);
  numberOfCountries = signal(0);
  tableAbsoluteDataArray: CountryTableData[][] = [];
  mapSubtitles: string[] = [];
  mapSubtitlesArray: string[][] = EoscReadinessMapSubtitles;
  questionsDataArray = signal<any[]>([]);
  tmpQuestionsDataArray: any[] = [];
  questionsDataArrayForBarChart = signal<any[]>([]);
  sumsArray = signal<string[]>([]);
  toolTipData = signal<Map<string, string>[]>([]);
  activityGaugeData = signal<ActivityGauge[]>([]);
  participatingCountries = signal<number[]>([]);
  tableData = signal<string[][]>([]);

  private route = inject(ActivatedRoute);
  private queryData = inject(EoscReadinessDataService);
  private stakeholdersService = inject(StakeholdersService);
  private dataHandlerService = inject(DataHandlerService);

  ngOnInit() {
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
    this.activityGaugeData.set([]);
    this.tableData.set([]);
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion8(),
      this.queryData.getQuestion(this.year, 'Question8'), // Publications
      // this.queryData.getQuestion12(),
      this.queryData.getQuestion(this.year, 'Question12'), // Data-management
      // this.queryData.getQuestion16(),
      this.queryData.getQuestion(this.year, 'Question16'), // FAIR-data
      // this.queryData.getQuestion20(),
      this.queryData.getQuestion(this.year, 'Question20'), // Open-data
      // this.queryData.getQuestion24(),
      this.queryData.getQuestion(this.year, 'Question24'), // Software
      // this.queryData.getQuestion28(),
      this.queryData.getQuestion(this.year, 'Question28'), // Services
      // this.queryData.getQuestion32(),
      this.queryData.getQuestion(this.year, 'Question32'), // Connecting repositories to EOSC
      // this.queryData.getQuestion36(),
      this.queryData.getQuestion(this.year, 'Question36'), // Data stewardship
      // this.queryData.getQuestion40(),
      this.queryData.getQuestion(this.year, 'Question40'), // Long-term data preservation
      // this.queryData.getQuestion44(),
      this.queryData.getQuestion(this.year, 'Question44'), // Skills/Training
      // this.queryData.getQuestion48(),
      this.queryData.getQuestion(this.year, 'Question48'), // Assessment
      // this.queryData.getQuestion52(),
      this.queryData.getQuestion(this.year, 'Question52'), // Engagement
    ).subscribe(
      res => {
        let tableData: string[][] = [];
        const activityGaugeData: ActivityGauge[] = [];
        let y = 0;
        this.countriesArray.set(res[0]);
        tableData[0] = ['Countries'].concat(this.countriesArray());

        this.numberOfCountries.set((res[1] as RawData).datasets[0].series.result.length);

        setAt(this.participatingCountries, 0, this.dataHandlerService.convertRawDataForActivityGauge(res[1]));
        y = Math.round((this.participatingCountries()[0]/this.numberOfCountries() + Number.EPSILON) * 100);
        activityGaugeData.push({name: 'Publications', y: y});
        tableData[1] = ['Publications'].concat(this.dataHandlerService.convertRawDataForCumulativeTable(res[1], this.countriesArray()));
        setAt(this.sumsArray, 0, this.calculateSum(res[1]));

        tableData[2] = this.dataHandlerService.convertRawDataForCumulativeTable(res[2], this.countriesArray());
        tableData[2] = this.dataHandlerService.convertRawDataForCumulativeTable(res[3], this.countriesArray(), tableData[2]);
        tableData[2] = ['Data'].concat(this.dataHandlerService.convertRawDataForCumulativeTable(res[4], this.countriesArray(), tableData[2]));
        setAt(this.participatingCountries, 1, this.countTableEntries(tableData[2]));
        y = Math.round((this.participatingCountries()[1]/this.numberOfCountries() + Number.EPSILON) * 100);
        activityGaugeData.push({name: 'Data', y: y});

        setAt(this.participatingCountries, 2, this.dataHandlerService.convertRawDataForActivityGauge(res[5]));
        y = Math.round((this.participatingCountries()[2]/this.numberOfCountries() + Number.EPSILON) * 100);
        activityGaugeData.push({name: 'Software', y: y});
        tableData[3] = ['Software'].concat(this.dataHandlerService.convertRawDataForCumulativeTable(res[5], this.countriesArray()));
        setAt(this.sumsArray, 1, this.calculateSum(res[5]));

        setAt(this.participatingCountries, 3, this.dataHandlerService.convertRawDataForActivityGauge(res[6]));
        y = Math.round((this.participatingCountries()[3]/this.numberOfCountries() + Number.EPSILON) * 100);
        tableData[4] = ['Services'].concat(this.dataHandlerService.convertRawDataForCumulativeTable(res[6], this.countriesArray()));
        activityGaugeData.push({name: 'Services', y: y});
        setAt(this.sumsArray, 2, this.calculateSum(res[6]));

        tableData[5] = this.dataHandlerService.convertRawDataForCumulativeTable(res[7], this.countriesArray());
        tableData[5] = this.dataHandlerService.convertRawDataForCumulativeTable(res[8], this.countriesArray(), tableData[5]);
        tableData[5] = ['Infrastructures'].concat(this.dataHandlerService.convertRawDataForCumulativeTable(res[9], this.countriesArray(), tableData[5]));
        setAt(this.participatingCountries, 4, this.countTableEntries(tableData[5]));
        y = Math.round((this.participatingCountries()[4]/this.numberOfCountries() + Number.EPSILON) * 100);
        activityGaugeData.push({name: 'Infrastructures', y: y});

        setAt(this.participatingCountries, 5, this.dataHandlerService.convertRawDataForActivityGauge(res[10]));
        y =  Math.round((this.participatingCountries()[5]/this.numberOfCountries() + Number.EPSILON) * 100);
        tableData[6] = ['Skills/Training'].concat(this.dataHandlerService.convertRawDataForCumulativeTable(res[10], this.countriesArray()));
        activityGaugeData.push({name: 'Skills/Training', y: y});
        setAt(this.sumsArray, 3, this.calculateSum(res[10]));

        setAt(this.participatingCountries, 6, this.dataHandlerService.convertRawDataForActivityGauge(res[11]));
        y = Math.round((this.participatingCountries()[6]/this.numberOfCountries() + Number.EPSILON) * 100);
        tableData[7] = ['Assessment'].concat(this.dataHandlerService.convertRawDataForCumulativeTable(res[11], this.countriesArray()));
        activityGaugeData.push({name: 'Assessment', y: y});
        setAt(this.sumsArray, 4, this.calculateSum(res[11]));

        setAt(this.participatingCountries, 7, this.dataHandlerService.convertRawDataForActivityGauge(res[12]));
        y = Math.round((this.participatingCountries()[7]/this.numberOfCountries() + Number.EPSILON) * 100);
        tableData[8] = ['Engagement'].concat(this.dataHandlerService.convertRawDataForCumulativeTable(res[12], this.countriesArray()));
        activityGaugeData.push({name: 'Engagement', y: y});
        setAt(this.sumsArray, 5, this.calculateSum(res[12]));

        this.activityGaugeData.set(activityGaugeData);
        tableData = tableData[0].map((_, colIndex) => tableData.map(row => row[colIndex])); // Transpose 2d array
        for (let i = 1; i < tableData.length; i++) {
          let tmpData = countries.find(country => country.id === tableData[i][0]);
          if (tmpData)
            tableData[i][0] = tmpData.name + ` (${tmpData.id})`;
        }
        this.tableData.set(tableData);
        // console.log(tableData);
      },
      error => {}
    );
  }

  getPublicationsData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion8(),
      this.queryData.getQuestion(this.year, 'Question8'),
      // this.queryData.getQuestion8comment(),
      this.queryData.getQuestionComment(this.year, 'Question8'),
      ).subscribe(
      res => {
        const mapData = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        setAt(this.questionsDataArray, 0, mapData);
        setAt(this.questionsDataArrayForBarChart, 0, mapData);
        let tempArr: string[] = [];
        this.questionsDataArray()[0].forEach((data: string[]) => {tempArr.push(data[0]);});
        this.countriesArray.set(res[0].map(element => {return element.toLowerCase()}).filter(element => !tempArr.includes(element)));
        setAt(this.toolTipData, 0, this.dataHandlerService.covertRawDataGetText(res[2]));
        setAt(this.sumsArray, 0, this.calculateSum(res[1]));
      }
    )
  }

  getSoftwareData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion24(),
      this.queryData.getQuestion(this.year, 'Question24'),
      // this.queryData.getQuestion24comment(),
      this.queryData.getQuestionComment(this.year, 'Question24'),
    ).subscribe(
      res => {
        const mapData = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        setAt(this.questionsDataArray, 1, mapData);
        setAt(this.questionsDataArrayForBarChart, 1, mapData);
        let tempArr: string[] = [];
        this.questionsDataArray()[1].forEach((data: string[]) => {tempArr.push(data[0]);});
        this.countriesArray.set(res[0].map(element => {return element.toLowerCase()}).filter(element => !tempArr.includes(element)));
        setAt(this.sumsArray, 1, this.calculateSum(res[1]));
        setAt(this.toolTipData, 1, this.dataHandlerService.covertRawDataGetText(res[2]));
      }
    )
  }

  getServicesData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion28(),
      this.queryData.getQuestion(this.year, 'Question28'),
      // this.queryData.getQuestion28comment(),
      this.queryData.getQuestionComment(this.year, 'Question28'),
    ).subscribe(
      res => {
        const mapData = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        setAt(this.questionsDataArray, 2, mapData);
        setAt(this.questionsDataArrayForBarChart, 2, mapData);
        let tempArr: string[] = [];
        this.questionsDataArray()[2].forEach((data: string[]) => {tempArr.push(data[0]);});
        this.countriesArray.set(res[0].map(element => {return element.toLowerCase()}).filter(element => !tempArr.includes(element)));
        setAt(this.sumsArray, 2, this.calculateSum(res[1]));
        setAt(this.toolTipData, 2, this.dataHandlerService.covertRawDataGetText(res[2]));
      }
    )
  }

  getSkillsTrainingData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion44(),
      this.queryData.getQuestion(this.year, 'Question44'),
      // this.queryData.getQuestion44comment(),
      this.queryData.getQuestionComment(this.year, 'Question44'),
    ).subscribe(
      res => {
        const mapData = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        setAt(this.questionsDataArray, 3, mapData);
        setAt(this.questionsDataArrayForBarChart, 3, mapData);
        let tempArr: string[] = [];
        this.questionsDataArray()[3].forEach((data: string[]) => {tempArr.push(data[0]);});
        this.countriesArray.set(res[0].map(element => {return element.toLowerCase()}).filter(element => !tempArr.includes(element)));
        setAt(this.sumsArray, 3, this.calculateSum(res[1]));
        setAt(this.toolTipData, 3, this.dataHandlerService.covertRawDataGetText(res[2]));
      }
    )
  }

  getAssessmentData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion48(),
      this.queryData.getQuestion(this.year, 'Question48'),
      // this.queryData.getQuestion48comment(),
      this.queryData.getQuestionComment(this.year, 'Question48'),
    ).subscribe(
      res => {
        const mapData = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        setAt(this.questionsDataArray, 4, mapData);
        setAt(this.questionsDataArrayForBarChart, 4, mapData);
        let tempArr: string[] = [];
        this.questionsDataArray()[4].forEach((data: string[]) => {tempArr.push(data[0]);});
        this.countriesArray.set(res[0].map(element => {return element.toLowerCase()}).filter(element => !tempArr.includes(element)));
        setAt(this.sumsArray, 4, this.calculateSum(res[1]));
        setAt(this.toolTipData, 4, this.dataHandlerService.covertRawDataGetText(res[2]));
      }
    )
  }

  getEngagementData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion52(),
      this.queryData.getQuestion(this.year, 'Question52'),
      // this.queryData.getQuestion52comment(),
      this.queryData.getQuestionComment(this.year, 'Question52'),
    ).subscribe(
      res => {
        const mapData = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        setAt(this.questionsDataArray, 5, mapData);
        setAt(this.questionsDataArrayForBarChart, 5, mapData);
        let tempArr: string[] = [];
        this.questionsDataArray()[5].forEach((data: string[]) => {tempArr.push(data[0]);});
        this.countriesArray.set(res[0].map(element => {return element.toLowerCase()}).filter(element => !tempArr.includes(element)));
        setAt(this.sumsArray, 5, this.calculateSum(res[1]));
        setAt(this.toolTipData, 5, this.dataHandlerService.covertRawDataGetText(res[2]));
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
