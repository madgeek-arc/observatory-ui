import { Component, OnInit, ChangeDetectionStrategy, signal, inject } from "@angular/core";
import { ActivatedRoute, RouterLink, RouterOutlet } from "@angular/router";
import { EoscReadinessDataService } from "../../../../services/eosc-readiness-data.service";
import { StakeholdersService } from "src/survey-tool/app/services/stakeholders.service";
import { DataHandlerService } from "../../../../services/data-handler.service";
import { CountryTableData } from "src/app/domain/country-table-data";
import { ColorPallet, EoscReadinessMapSubtitles } from "../../eosc-readiness-map-subtitles";
import { latlong } from "src/app/domain/countries-lat-lon";
import { zip } from "rxjs/internal/observable/zip";
import { countries } from "src/app/domain/countries";
import { CategorizedAreaData, Series } from "src/app/domain/categorizedAreaData";
import { ActivityGauge } from "src/app/shared/charts/gauge-activity/gauge-activity.component";
import * as UIkit from 'uikit';
import { Dataset, RawData } from "src/app/domain/raw-data";
import { GaugeActivityComponent } from "../../../../../shared/charts/gauge-activity/gauge-activity.component";
import { CumulativeDataTablesComponent } from "../../tables/cumulative-data-tables.component";
import { HighchartsCategoryMapComponent } from "../../../../../shared/charts/category-map/highcharts-category-map.component";
import { GaugeSimpleComponent } from "../../../../../shared/charts/gauge-simple/gauge-simple.component";
import { setAt } from "src/app/shared/utils/set-at";

@Component({
    selector: 'app-national-policy',
    templateUrl: 'national-policy.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink, GaugeActivityComponent, CumulativeDataTablesComponent, HighchartsCategoryMapComponent, GaugeSimpleComponent, RouterOutlet]
})

export class NationalPolicyComponent implements OnInit {

  type: string = null;
  year: string = null;

  countriesArray = signal<string[]>([]);
  numberOfCountries = signal<number>(0);
  tableAbsoluteDataArray: CountryTableData[][] = [];
  mapSubtitles: string[] = [];
  mapSubtitlesArray: string[][] = EoscReadinessMapSubtitles;
  questionsDataArray = signal<any[]>([]);
  tmpQuestionsDataArray: any[] = [];
  mapPointData: CountryTableData[];
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
        this.type = params['type'];
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

    const nameArr = [
      'Question6', // national policy on Open Access publications
      'Question10', // national policy on data management
      'Question14', // national policy on FAIR data
      'Question18', // national policy on Open data
      'Question22', // national policy on software
      'Question26', // national policy on offering services through EOSC
      'Question30', // national policy on connecting repositories to EOSC
      'Question34', // national policy on data stewardship
      'Question38', // national policy on long-term data preservation
      'Question42', // national policy on skills/training for Open Science
      'Question46', // national policy on incentives/rewards for Open Science
      'Question50', // national policy on citizen science
    ];

    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion6(),
      this.queryData.getQuestion(this.year, 'Question6'), // Publications
      // this.queryData.getQuestion10(),
      this.queryData.getQuestion(this.year, 'Question10'), // Data-management
      // this.queryData.getQuestion14(),
      this.queryData.getQuestion(this.year, 'Question14'), // FAIR-data
      // this.queryData.getQuestion18(),
      this.queryData.getQuestion(this.year, 'Question18'), // Open-data
      // this.queryData.getQuestion22(),
      this.queryData.getQuestion(this.year, 'Question22'), // Software
      // this.queryData.getQuestion26(),
      this.queryData.getQuestion(this.year, 'Question26'), // Services
      // this.queryData.getQuestion30(),
      this.queryData.getQuestion(this.year, 'Question30'), // Connecting repositories to EOSC
      // this.queryData.getQuestion34(),
      this.queryData.getQuestion(this.year, 'Question34'), // Data stewardship
      // this.queryData.getQuestion38(),
      this.queryData.getQuestion(this.year, 'Question38'), // Long-term data preservation
      // this.queryData.getQuestion42(),
      this.queryData.getQuestion(this.year, 'Question42'), // Skills/Training
      // this.queryData.getQuestion46(),
      this.queryData.getQuestion(this.year, 'Question46'), // Assessment
      // this.queryData.getQuestion50(),
      this.queryData.getQuestion(this.year, 'Question50'), // Engagement
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
        tableData[5] = ['Infrastructures'].concat(this.dataHandlerService.convertRawDataForCumulativeTable(res[9], this.countriesArray(), tableData[5]));
        setAt(this.participatingCountries, 4, this.countTableEntries(tableData[5]));
        y = Math.round((this.participatingCountries()[4]/this.numberOfCountries() + Number.EPSILON) * 100);
        activityGaugeData.push({name: 'Infrastructures', y: y});

        setAt(this.participatingCountries, 5, this.dataHandlerService.convertRawDataForActivityGauge(res[10]));
        y =  Math.round((this.participatingCountries()[5]/this.numberOfCountries() + Number.EPSILON) * 100);
        tableData[6] = ['Skills/Training'].concat(this.dataHandlerService.convertRawDataForCumulativeTable(res[10], this.countriesArray()));
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
      // this.queryData.getQuestion6(),
      this.queryData.getQuestion(this.year, 'Question6'),
      // this.queryData.getQuestion6_1(),
      this.queryData.getQuestion(this.year, 'Question6.1'),
      // this.queryData.getQuestion6comment(),
      this.queryData.getQuestionComment(this.year, 'Question6'),
    ).subscribe(
      res => {
        this.countriesArray.set(res[0]);
        this.tableAbsoluteDataArray[0] = this.dataHandlerService.convertRawDataToTableData(res[1]);
        this.tmpQuestionsDataArray[0] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        setAt(this.participatingCountries, 0, this.dataHandlerService.convertRawDataForActivityGauge(res[1]));
        setAt(this.participatingCountriesPercentage, 0, Math.round((this.participatingCountries()[0]/(res[1] as RawData).datasets[0].series.result.length + Number.EPSILON) * 100));
        for (let i = 0; i < this.tmpQuestionsDataArray[0].series.length; i++) {
          this.tmpQuestionsDataArray[0].series[i].data = this.tmpQuestionsDataArray[0].series[i].data.map(code => ({ code }));
        }
        setAt(this.toolTipData, 0, this.dataHandlerService.covertRawDataGetText(res[3]));
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
      // this.queryData.getQuestion22(),
      this.queryData.getQuestion(this.year, 'Question22'),
      // this.queryData.getQuestion22_1(),
      this.queryData.getQuestion(this.year, 'Question22.1'),
      // this.queryData.getQuestion22comment(),
      this.queryData.getQuestionComment(this.year, 'Question22'),
    ).subscribe(
      res => {
        this.countriesArray.set(res[0]);
        this.tableAbsoluteDataArray[1] = this.dataHandlerService.convertRawDataToTableData(res[1]);
        this.tmpQuestionsDataArray[1] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        setAt(this.participatingCountries, 2, this.dataHandlerService.convertRawDataForActivityGauge(res[1]));
        setAt(this.participatingCountriesPercentage, 2, Math.round((this.participatingCountries()[2]/(res[1] as RawData).datasets[0].series.result.length + Number.EPSILON) * 100));
        for (let i = 0; i < this.tmpQuestionsDataArray[1].series.length; i++) {
          this.tmpQuestionsDataArray[1].series[i].data = this.tmpQuestionsDataArray[1].series[i].data.map(code => ({ code }));
        }
        this.mapPointData = this.dataHandlerService.convertRawDataToTableData(res[2]);
        setAt(this.toolTipData, 1, this.dataHandlerService.covertRawDataGetText(res[3]));
        this.createMapDataFromCategorizationWithDots(1,0);
        console.log(this.questionsDataArray());

      },
      error => {console.error(error)},
      () => {}
    );
  }

  getServicesData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion26(),
      this.queryData.getQuestion(this.year, 'Question26'),
      // this.queryData.getQuestion26_1(),
      this.queryData.getQuestion(this.year, 'Question26.1'),
      // this.queryData.getQuestion26comment(),
      this.queryData.getQuestionComment(this.year, 'Question26'),
    ).subscribe(
      res => {
        this.countriesArray.set(res[0]);
        this.tableAbsoluteDataArray[2] = this.dataHandlerService.convertRawDataToTableData(res[1]);
        this.tmpQuestionsDataArray[2] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        setAt(this.participatingCountries, 3, this.dataHandlerService.convertRawDataForActivityGauge(res[1]));
        setAt(this.participatingCountriesPercentage, 3, Math.round((this.participatingCountries()[3]/(res[1] as RawData).datasets[0].series.result.length + Number.EPSILON) * 100));
        for (let i = 0; i < this.tmpQuestionsDataArray[2].series.length; i++) {
          this.tmpQuestionsDataArray[2].series[i].data = this.tmpQuestionsDataArray[2].series[i].data.map(code => ({ code }));
        }
        this.mapPointData = this.dataHandlerService.convertRawDataToTableData(res[2]);
        setAt(this.toolTipData, 2, this.dataHandlerService.covertRawDataGetText(res[3]));
        this.createMapDataFromCategorizationWithDots(2,0);

      },
      error => {console.error(error)},
      () => {}
    );
  }

  getSkillsTrainingData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion42(),
      this.queryData.getQuestion(this.year, 'Question42'),
      // this.queryData.getQuestion42_1(),
      this.queryData.getQuestion(this.year, 'Question42.1'),
      // this.queryData.getQuestion42comment(),
      this.queryData.getQuestionComment(this.year, 'Question42'),
    ).subscribe(
      res => {
        this.countriesArray.set(res[0]);
        this.tableAbsoluteDataArray[3] = this.dataHandlerService.convertRawDataToTableData(res[1]);
        this.tmpQuestionsDataArray[3] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        setAt(this.participatingCountries, 5, this.dataHandlerService.convertRawDataForActivityGauge(res[1]));
        setAt(this.participatingCountriesPercentage, 5, Math.round((this.participatingCountries()[5]/(res[1] as RawData).datasets[0].series.result.length + Number.EPSILON) * 100));
        for (let i = 0; i < this.tmpQuestionsDataArray[3].series.length; i++) {
          this.tmpQuestionsDataArray[3].series[i].data = this.tmpQuestionsDataArray[3].series[i].data.map(code => ({ code }));
        }
        this.mapPointData = this.dataHandlerService.convertRawDataToTableData(res[2]);
        setAt(this.toolTipData, 3, this.dataHandlerService.covertRawDataGetText(res[3]));
        this.createMapDataFromCategorizationWithDots(3,0);

      },
      error => {console.error(error)},
      () => {}
    );
  }

  getAssessmentData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion46(),
      this.queryData.getQuestion(this.year, 'Question46'),
      // this.queryData.getQuestion46_1(),
      this.queryData.getQuestion(this.year, 'Question46.1'),
      // this.queryData.getQuestion46comment(),
      this.queryData.getQuestionComment(this.year, 'Question46'),
    ).subscribe(
      res => {
        this.countriesArray.set(res[0]);
        this.tableAbsoluteDataArray[4] = this.dataHandlerService.convertRawDataToTableData(res[1]);
        this.tmpQuestionsDataArray[4] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        setAt(this.participatingCountries, 6, this.dataHandlerService.convertRawDataForActivityGauge(res[1]));
        setAt(this.participatingCountriesPercentage, 6, Math.round((this.participatingCountries()[6]/(res[1] as RawData).datasets[0].series.result.length + Number.EPSILON) * 100));
        for (let i = 0; i < this.tmpQuestionsDataArray[4].series.length; i++) {
          this.tmpQuestionsDataArray[4].series[i].data = this.tmpQuestionsDataArray[4].series[i].data.map(code => ({ code }));
        }
        this.mapPointData = this.dataHandlerService.convertRawDataToTableData(res[2]);
        setAt(this.toolTipData, 4, this.dataHandlerService.covertRawDataGetText(res[3]));
        this.createMapDataFromCategorizationWithDots(4,0);

      },
      error => {console.error(error)},
      () => {}
    );
  }

  getEngagementData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion50(),
      this.queryData.getQuestion(this.year, 'Question50'),
      // this.queryData.getQuestion50_1(),
      this.queryData.getQuestion(this.year, 'Question50.1'),
      // this.queryData.getQuestion50comment(),
      this.queryData.getQuestionComment(this.year, 'Question50'),
    ).subscribe(
      res => {
        this.countriesArray.set(res[0]);
        this.tableAbsoluteDataArray[5] = this.dataHandlerService.convertRawDataToTableData(res[1]);
        this.tmpQuestionsDataArray[5] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        setAt(this.participatingCountries, 7, this.dataHandlerService.convertRawDataForActivityGauge(res[1]));
        setAt(this.participatingCountriesPercentage, 7, Math.round((this.participatingCountries()[7]/(res[1] as RawData).datasets[0].series.result.length + Number.EPSILON) * 100));
        for (let i = 0; i < this.tmpQuestionsDataArray[5].series.length; i++) {
          this.tmpQuestionsDataArray[5].series[i].data = this.tmpQuestionsDataArray[5].series[i].data.map(code => ({ code }));
        }
        this.mapPointData = this.dataHandlerService.convertRawDataToTableData(res[2]);
        setAt(this.toolTipData, 5, this.dataHandlerService.covertRawDataGetText(res[3]));
        this.createMapDataFromCategorizationWithDots(5,0);

      },
      error => {console.error(error)},
      () => {}
    );
  }

  createMapDataFromCategorizationWithDots(index: number, mapCount: number) {
    // this.mapSubtitles[index] = this.mapSubtitlesArray[mapCount][index];

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

    if (countryCodeArray.length > 0) {
      mapData.series[mapData.series.length] = new Series('Awaiting Data', false);
      mapData.series[mapData.series.length-1].showInLegend = true;
      mapData.series[mapData.series.length-1].color = ColorPallet[2];
      mapData.series[mapData.series.length-1].data = this.countriesArray().filter(code => !countryCodeArray.includes(code));
      mapData.series[mapData.series.length-1].data = mapData.series[mapData.series.length-1].data.map(code => ({ code }));
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
      pos = mapData.series.length;
      mapData.series[pos] = new Series('National policy is mandatory', false, 'mappoint');
      mapData.series[pos].data = mapPointArray1;
      mapData.series[pos].color = '#7CFC00';
      mapData.series[pos].marker.symbol = 'circle';
      mapData.series[pos].showInLegend = true;
    }

    if (mapPointArray2.length > 0) {
      pos = mapData.series.length;
      mapData.series[pos] = new Series('National policy is not mandatory', false, 'mappoint');
      mapData.series[pos].data = mapPointArray2;
      mapData.series[pos].color = '#FFEF00';
      mapData.series[pos].marker.symbol = 'diamond';
      mapData.series[pos].showInLegend = true;
    }
    setAt(this.questionsDataArray, index, mapData);
  }

  countTableEntries(column: string[]) {
    // console.log(column);
    let count = 0;
    column.forEach(row => {
      if (row === 'true')
        count++;
    })
    return count;
  }

}
