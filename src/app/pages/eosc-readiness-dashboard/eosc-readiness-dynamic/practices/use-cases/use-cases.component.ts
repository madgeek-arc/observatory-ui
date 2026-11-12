import { Component, OnInit, ChangeDetectionStrategy, signal, inject } from "@angular/core";
import { ActivatedRoute, RouterLink, RouterOutlet } from "@angular/router";
import { EoscReadinessDataService } from "../../../../services/eosc-readiness-data.service";
import { StakeholdersService } from "src/survey-tool/app/services/stakeholders.service";
import { DataHandlerService } from "../../../../services/data-handler.service";
import { CountryTableData } from "src/app/domain/country-table-data";
import { ColorPallet, EoscReadinessMapSubtitles } from "../../eosc-readiness-map-subtitles";
import { zip } from "rxjs/internal/observable/zip";
import { ActivityGauge } from "src/app/shared/charts/gauge-activity/gauge-activity.component";
import { CategorizedAreaData, Series } from "src/app/domain/categorizedAreaData";
import { countries } from "src/app/domain/countries";
import * as UIkit from 'uikit';
import { RawData } from "src/app/domain/raw-data";
import { GaugeActivityComponent } from "../../../../../shared/charts/gauge-activity/gauge-activity.component";
import { CumulativeDataTablesComponent } from "../../tables/cumulative-data-tables.component";
import { HighchartsCategoryMapComponent } from "../../../../../shared/charts/category-map/highcharts-category-map.component";
import { GaugeSimpleComponent } from "../../../../../shared/charts/gauge-simple/gauge-simple.component";
import { setAt } from "src/app/shared/utils/set-at";

@Component({
    selector: 'app-national-policy',
    templateUrl: 'use-cases.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink, GaugeActivityComponent, CumulativeDataTablesComponent, HighchartsCategoryMapComponent, GaugeSimpleComponent, RouterOutlet]
})

export class UseCasesComponent implements OnInit {
  year: string = null;
  countriesArray = signal<string[]>([]);
  numberOfCountries = signal(0);
  tableAbsoluteDataArray: CountryTableData[][] = [];
  mapSubtitles: string[] = [];
  mapSubtitlesArray: string[][] = EoscReadinessMapSubtitles;
  questionsDataArray = signal<any[]>([]);
  tmpQuestionsDataArray: any[] = [];
  toolTipData = signal<Map<string, string>[]>([]);
  activityGaugeData = signal<ActivityGauge[]>([]);
  participatingCountries = signal<number[]>([]);
  participatingCountriesPercentage = signal<number[]>([]);
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
    this.activityGaugeData.set([]);
    this.tableData.set([]);
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
        let tableData: string[][] = [];
        const activityGaugeData: ActivityGauge[] = [];
        let y = 0;

        this.countriesArray.set(res[0]);
        tableData[0] = ['Countries'].concat(this.countriesArray());

        this.numberOfCountries.set((res[1] as RawData).datasets[0].series.result.length);

        setAt(this.participatingCountries, 0, this.dataHandlerService.convertRawDataForActivityGauge(res[1]));
        y = Math.round((this.participatingCountries()[0]/this.numberOfCountries() + Number.EPSILON) * 100);
        tableData[1] = ['Publications'].concat(this.dataHandlerService.convertRawDataForCumulativeTable(res[1], this.countriesArray()));
        activityGaugeData.push({name: 'Publications', y: y});

        tableData[2] = this.dataHandlerService.convertRawDataForCumulativeTable(res[2], this.countriesArray());
        tableData[2] = this.dataHandlerService.convertRawDataForCumulativeTable(res[3], this.countriesArray(), tableData[2]);
        tableData[2] = ['Data'].concat(this.dataHandlerService.convertRawDataForCumulativeTable(res[4], this.countriesArray(), tableData[2]));
        setAt(this.participatingCountries, 1, this.countTableEntries(tableData[2]));
        y = Math.round((this.participatingCountries()[1]/this.numberOfCountries() + Number.EPSILON) * 100);
        activityGaugeData.push({name: 'Data', y: y});

        setAt(this.participatingCountries, 2, this.dataHandlerService.convertRawDataForActivityGauge(res[5]));
        y = Math.round((this.participatingCountries()[2]/this.numberOfCountries() + Number.EPSILON) * 100);
        tableData[3] = ['Software'].concat(this.dataHandlerService.convertRawDataForCumulativeTable(res[5], this.countriesArray()));
        activityGaugeData.push({name: 'Software', y: y});

        setAt(this.participatingCountries, 3, this.dataHandlerService.convertRawDataForActivityGauge(res[6]));
        y = Math.round((this.participatingCountries()[3]/this.numberOfCountries() + Number.EPSILON) * 100);
        tableData[4] = ['Services'].concat(this.dataHandlerService.convertRawDataForCumulativeTable(res[6], this.countriesArray()));
        activityGaugeData.push({name: 'Services', y: y});

        tableData[5] = this.dataHandlerService.convertRawDataForCumulativeTable(res[7], this.countriesArray());
        tableData[5] = this.dataHandlerService.convertRawDataForCumulativeTable(res[8], this.countriesArray(), tableData[5]);
        tableData[5] = ['Infrastructure'].concat(this.dataHandlerService.convertRawDataForCumulativeTable(res[9], this.countriesArray(), tableData[5]));
        setAt(this.participatingCountries, 4, this.countTableEntries(tableData[5]));
        y = Math.round((this.participatingCountries()[4]/this.numberOfCountries() + Number.EPSILON) * 100);
        activityGaugeData.push({name: 'Infrastructure', y: y});

        tableData[6] = ['Skills/Training'].concat(this.dataHandlerService.convertRawDataForCumulativeTable(res[10], this.countriesArray()));
        setAt(this.participatingCountries, 5, this.dataHandlerService.convertRawDataForActivityGauge(res[10]));
        y =  Math.round((this.participatingCountries()[5]/this.numberOfCountries() + Number.EPSILON) * 100);
        activityGaugeData.push({name: 'Skills/Training', y: y});

        setAt(this.participatingCountries, 6, this.dataHandlerService.convertRawDataForActivityGauge(res[11]));
        y = Math.round((this.participatingCountries()[6]/this.numberOfCountries() + Number.EPSILON) * 100);
        tableData[7] = ['Assessment'].concat(this.dataHandlerService.convertRawDataForCumulativeTable(res[11], this.countriesArray()));
        activityGaugeData.push({name: 'Assessment', y: y});

        setAt(this.participatingCountries, 7, this.dataHandlerService.convertRawDataForActivityGauge(res[12]));
        y = Math.round((this.participatingCountries()[7]/this.numberOfCountries() + Number.EPSILON) * 100);
        tableData[8] = ['Engagement'].concat(this.dataHandlerService.convertRawDataForCumulativeTable(res[12], this.countriesArray()));
        activityGaugeData.push({name: 'Engagement', y: y});

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
        this.countriesArray.set(res[0]);
        this.tmpQuestionsDataArray[0] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        setAt(this.participatingCountries, 0, this.dataHandlerService.convertRawDataForActivityGauge(res[1]));
        setAt(this.participatingCountriesPercentage, 0, Math.round((this.participatingCountries()[0]/res[1].datasets[0].series.result.length + Number.EPSILON) * 100));
        for (let i = 0; i < this.tmpQuestionsDataArray[0].series.length; i++) {
          this.tmpQuestionsDataArray[0].series[i].data = this.tmpQuestionsDataArray[0].series[i].data.map(code => ({ code }));
        }
        setAt(this.toolTipData, 0, this.dataHandlerService.covertRawDataGetText(res[2]));
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
        this.countriesArray.set(res[0]);
        this.tmpQuestionsDataArray[1] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        setAt(this.participatingCountries, 2, this.dataHandlerService.convertRawDataForActivityGauge(res[1]));
        setAt(this.participatingCountriesPercentage, 2, Math.round((this.participatingCountries()[2]/res[1].datasets[0].series.result.length + Number.EPSILON) * 100));
        for (let i = 0; i < this.tmpQuestionsDataArray[1].series.length; i++) {
          this.tmpQuestionsDataArray[1].series[i].data = this.tmpQuestionsDataArray[1].series[i].data.map(code => ({ code }));
        }
        setAt(this.toolTipData, 1, this.dataHandlerService.covertRawDataGetText(res[2]));
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
        this.countriesArray.set(res[0]);
        this.tmpQuestionsDataArray[2] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        setAt(this.participatingCountries, 3, this.dataHandlerService.convertRawDataForActivityGauge(res[1]));
        setAt(this.participatingCountriesPercentage, 3, Math.round((this.participatingCountries()[3]/res[1].datasets[0].series.result.length + Number.EPSILON) * 100));
        for (let i = 0; i < this.tmpQuestionsDataArray[2].series.length; i++) {
          this.tmpQuestionsDataArray[2].series[i].data = this.tmpQuestionsDataArray[2].series[i].data.map(code => ({ code }));
        }
        setAt(this.toolTipData, 2, this.dataHandlerService.covertRawDataGetText(res[2]));
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
        this.countriesArray.set(res[0]);
        this.tmpQuestionsDataArray[3] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        setAt(this.participatingCountries, 5, this.dataHandlerService.convertRawDataForActivityGauge(res[1]));
        setAt(this.participatingCountriesPercentage, 5, Math.round((this.participatingCountries()[5]/res[1].datasets[0].series.result.length + Number.EPSILON) * 100));
        for (let i = 0; i < this.tmpQuestionsDataArray[3].series.length; i++) {
          this.tmpQuestionsDataArray[3].series[i].data = this.tmpQuestionsDataArray[3].series[i].data.map(code => ({ code }));
        }
        setAt(this.toolTipData, 3, this.dataHandlerService.covertRawDataGetText(res[2]));
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
        this.countriesArray.set(res[0]);
        this.tmpQuestionsDataArray[4] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        setAt(this.participatingCountries, 6, this.dataHandlerService.convertRawDataForActivityGauge(res[1]));
        setAt(this.participatingCountriesPercentage, 6, Math.round((this.participatingCountries()[6]/res[1].datasets[0].series.result.length + Number.EPSILON) * 100));
        for (let i = 0; i < this.tmpQuestionsDataArray[4].series.length; i++) {
          this.tmpQuestionsDataArray[4].series[i].data = this.tmpQuestionsDataArray[4].series[i].data.map(code => ({ code }));
        }
        setAt(this.toolTipData, 4, this.dataHandlerService.covertRawDataGetText(res[2]));
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
        this.countriesArray.set(res[0]);
        this.tmpQuestionsDataArray[5] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        setAt(this.participatingCountries, 7, this.dataHandlerService.convertRawDataForActivityGauge(res[1]));
        setAt(this.participatingCountriesPercentage, 7, Math.round((this.participatingCountries()[7]/res[1].datasets[0].series.result.length + Number.EPSILON) * 100));
        for (let i = 0; i < this.tmpQuestionsDataArray[5].series.length; i++) {
          this.tmpQuestionsDataArray[5].series[i].data = this.tmpQuestionsDataArray[5].series[i].data.map(code => ({ code }));
        }
        setAt(this.toolTipData, 5, this.dataHandlerService.covertRawDataGetText(res[2]));
        this.createMapDataFromCategorization(5,3);
      }
    );
  }

  createMapDataFromCategorization(index: number, mapCount: number) {
    // this.mapSubtitles[mapCount] = this.mapSubtitlesArray[mapCount][index];

    const mapData = new CategorizedAreaData();

    let position = 0;
    for (let i = 0; i < this.tmpQuestionsDataArray[index].series.length; i++) {
      if (this.tmpQuestionsDataArray[index].series[i].name === 'Awaiting data')
        continue;
      position = this.tmpQuestionsDataArray[index].series[i].name === 'No'? 1 : 0;
      mapData.series[i] = new Series(this.mapSubtitlesArray[mapCount][position], false);
      mapData.series[i].data = this.tmpQuestionsDataArray[index].series[i].data;
      mapData.series[i].showInLegend = true;
      mapData.series[i].color = ColorPallet[position];
    }
    let countryCodeArray = [];
    for (let i = 0; i < mapData.series.length; i++) {
      for (const data of mapData.series[i].data) {
        countryCodeArray.push(data.code)
      }
    }

    mapData.series[mapData.series.length] = new Series('Awaiting Data', false);
    mapData.series[mapData.series.length-1].showInLegend = true;
    mapData.series[mapData.series.length-1].color = ColorPallet[mapData.series.length-1];
    mapData.series[mapData.series.length-1].data = this.countriesArray().filter(code => !countryCodeArray.includes(code));
    mapData.series[mapData.series.length-1].data = mapData.series[mapData.series.length-1].data.map(code => ({ code }));
    setAt(this.questionsDataArray, index, mapData);
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
