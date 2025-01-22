import { Component, DestroyRef, inject } from "@angular/core";
import * as Highcharts from "highcharts/highcharts.src";
import { EoscReadinessDataService } from "../../../services/eosc-readiness-data.service";
import { StakeholdersService } from "../../../../../survey-tool/app/services/stakeholders.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { RawData } from "../../../../../survey-tool/app/domain/raw-data";
import { zip } from "rxjs/internal/observable/zip";
import { PdfExportService } from "../../../services/pdf-export.service";
import { CountryTableData } from "../../../../../survey-tool/app/domain/country-table-data";
import {
  ColorPallet, countriesNumbers,
  EoscReadiness2022MapSubtitles
} from "../../../eosc-readiness-dashboard/eosc-readiness-2022/eosc-readiness2022-map-subtitles";
import { CategorizedAreaData, Series } from "../../../../../survey-tool/app/domain/categorizedAreaData";
import { latlong } from "../../../../../survey-tool/app/domain/countries-lat-lon";
import { DataHandlerService } from "../../../services/data-handler.service";
import { PointOptionsObject } from "highcharts";

@Component({
  selector: 'app-open-science-by-area-data-management',
  templateUrl: './open-science-by-area-data-management.component.html',
  styleUrls: ['../../../../../assets/css/explore-dashboard.scss']
})

export class OpenScienceByAreaDataManagementComponent {
  protected readonly Math = Math;

  private destroyRef = inject(DestroyRef);
  exportActive = false;

  years = ['2022', '2023'];

  stackedColumnSeries1 = [
    {
      type: 'column',
      name: 'RPOs with Policy on Data Management',
      data: [], // Example data
      color: '#028691' // Primary color
    }, {
      type: 'column',
      name: 'RPOs without Policy on Data Management',
      data: [],
      color: '#fae0d1' // Tertiary color
    }
  ] as Highcharts.SeriesColumnOptions[];

  stackedColumnSeries2 = [
    {
      type: 'column',
      name: 'RFOs with Policy on Data Management',
      data: [],
      color: '#e4587c' // Secondary color
    }, {
      type: 'column',
      name: 'RFOs without Policy on Data Management',
      data: [],
      color: '#515252' // Additional color
    }
  ] as Highcharts.SeriesColumnOptions[];

  stackedColumnCategories = ['2021', '2022'];
  xAxisTitle = 'Year'
  yAxisTitle = 'Percentage of Policies on Data management'
  tooltipPointFormat = '{series.name}: {point.y}%';
  labelFormat = '{value}%';
  plotFormat = '{y}%';

  countriesWithPlans: number[] = [];
  countriesWithPolicy: number[] = [];
  countriesWithStrategy: number[] = [];
  countriesWithMonitoring: number[] = [];
  totalInvestments: number[] = [];

  treeGraph: PointOptionsObject[] = [];

  countriesArray: string[] = [];
  questionsDataArray: any[] = [];
  tmpQuestionsDataArray: any[] = [];
  participatingCountries: number[] = [];
  total: number[] = [];
  mapPointData: CountryTableData[];
  toolTipData: Map<string, string>[] = [];

  mapSubtitlesArray: string[][] = EoscReadiness2022MapSubtitles;

  constructor(private queryData: EoscReadinessDataService, private pdfService: PdfExportService,
              private stakeholdersService: StakeholdersService, private dataHandlerService: DataHandlerService) {}

  ngOnInit() {

    this.years.forEach((year, index) => {
      this.getCountriesWithPolicy(year, index);
      this.getTotalInvestments(year, index);
      this.getCountriesWithFinancialStrategy(year, index);
      this.getNationalMonitoring(year, index);
      this.getPlans(year, index);

      this.getStackedColumnData(year, index);
    });

    this.getTreeGraphData();

    // Maps
    this.getPoliciesOnDataManagement();
    this.getMonitoringOnDataManagement();
  }

  /** Get maps data ----------------------------------------------------------------------------------> **/
  getPoliciesOnDataManagement() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.queryData.getQuestion(this.years[this.years.length-1], 'Question10'),
      this.queryData.getQuestion(this.years[this.years.length-1], 'Question10.1'),
      this.queryData.getQuestionComment(this.years[this.years.length-1], 'Question10'),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.tmpQuestionsDataArray[0] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        this.participatingCountries[0] = this.dataHandlerService.convertRawDataForActivityGauge(res[1]);
        this.total[0] = res[1].datasets[0].series.result.length;
        for (let i = 0; i < this.tmpQuestionsDataArray[0].series.length; i++) {
          this.tmpQuestionsDataArray[0].series[i].data = this.tmpQuestionsDataArray[0].series[i].data.map(code => ({ code }));
        }
        this.toolTipData[0] = this.dataHandlerService.covertRawDataGetText(res[3]);
        this.mapPointData = this.dataHandlerService.convertRawDataToTableData(res[2]);
        this.createMapDataFromCategorizationWithDots(0,0);

      },
      error => {console.error(error)},
      () => {}
    );
  }

  getMonitoringOnDataManagement() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.queryData.getQuestion(this.years[this.years.length-1], 'Question58'),
      this.queryData.getQuestionComment(this.years[this.years.length-1], 'Question58'),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.tmpQuestionsDataArray[1] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        this.participatingCountries[1] = this.dataHandlerService.convertRawDataForActivityGauge(res[1]);
        this.total[1] = res[1].datasets[0].series.result.length;
        for (let i = 0; i < this.tmpQuestionsDataArray[1].series.length; i++) {
          this.tmpQuestionsDataArray[1].series[i].data = this.tmpQuestionsDataArray[1].series[i].data.map(code => ({ code }));
        }
        this.toolTipData[1] = this.dataHandlerService.covertRawDataGetText(res[2]);
        this.createMapDataFromCategorization(1,2);
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
    this.questionsDataArray[index].series[this.questionsDataArray[index].series.length-1].color = ColorPallet[2];
    this.questionsDataArray[index].series[this.questionsDataArray[index].series.length-1].data = this.countriesArray.filter(code => !countryCodeArray.includes(code));
    this.questionsDataArray[index].series[this.questionsDataArray[index].series.length-1].data = this.questionsDataArray[index].series[this.questionsDataArray[index].series.length-1].data.map(code => ({ code }));
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

  /** Get national monitoring on Data Management ------------------------------------------------------------------> **/
  getNationalMonitoring(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question58').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ // National monitoring in FAIR data
      next: value => {
        this.countriesWithMonitoring[index] = this.calculatePercentage(value, value.datasets[0].series.result.length);
      }
    });
  }

  /** Get financial strategy on Data Management -------------------------------------------------------------------> **/
  getCountriesWithFinancialStrategy(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question11').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ // Financial strategy in FAIR data
      next: value => {
        this.countriesWithStrategy[index] = this.calculatePercentage(value, value.datasets[0].series.result.length);
      }
    });
  }

  /** Get investments on Data Management --------------------------------------------------------------------------> **/
  getTotalInvestments(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question60').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ // Financial investment in FAIR data
      next: value => {
        this.totalInvestments[index] = this.calculateSum(value);
      }
    });
  }

  /** Get countries with policy on Data Management percentage -----------------------------------------------------> **/
  getCountriesWithPolicy(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question10').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ // Country has a national policy on FAIR data
      next: value => {
        this.countriesWithPolicy[index] = this.calculatePercentage(value, value.datasets[0].series.result.length);
      }
    });
  }

  /** Get data management plans published count ------------------------------------------------------------------ > **/
  getPlans(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question61').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ // National monitoring in FAIR data
      next: value => {
        this.countriesWithPlans[index] = this.calculateSum(value);
        // console.log(this.countriesWithPlans);
      }
    });
  }

  /** Stacked column chart ----------------------------------------------------------------------------------------> **/
  getStackedColumnData(year: string, index: number) {
    zip(
      this.queryData.getQuestion(year, 'Question2'),  // research performing organisations
      this.queryData.getQuestion(year, 'Question3'),  // research funding organisations
      this.queryData.getQuestion(year, 'Question12'), // research performing organisations in your country have a policy on data management
      this.queryData.getQuestion(year, 'Question13'), // research funding organisations in your country have a policy on data management
    ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value =>  {
        this.createStackedColumnSeries([value[0], value[2]], this.stackedColumnSeries1);
        this.createStackedColumnSeries([value[1], value[3]], this.stackedColumnSeries2);
        if (this.years.length === index+1) {
          this.stackedColumnSeries1 = [...this.stackedColumnSeries1];
          this.stackedColumnSeries2 = [...this.stackedColumnSeries2];
        }
      }
    });
  }

  createStackedColumnSeries(data: RawData[], series: Highcharts.SeriesColumnOptions[]) {
    let orgCount = 0;
    let orgCountWithPolicy = 0;
    data[0].datasets[0].series.result.forEach((result) => {
      if (this.isNumeric(result.row[1]))
        orgCount += +result.row[1];
    });

    data[1].datasets[0].series.result.forEach((result) => {
      if (this.isNumeric(result.row[1]))
        orgCountWithPolicy += +result.row[1];
    });

    series[0].data.push(Math.round(((orgCountWithPolicy/orgCount) + Number.EPSILON) * 100));
    series[1].data.push(Math.round((((orgCount-orgCountWithPolicy)/orgCount) + Number.EPSILON) * 100));
  }
  /** <---------------------------------------------------------------------------------------- Stacked column chart **/

  /** Investments as tree graph -----------------------------------------------------------------------------------> **/
  getTreeGraphData() {
    this.queryData.getQuestion(this.years[this.years.length-1], 'Question60').pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      res => {
        this.treeGraph = this.createRanges(res);
      }
    );
  }

  createRanges(data: RawData) {
    const arr = [{id: '0.0', parent: '', name: 'Country investments'}];

    let count = 0;

    data.datasets[0].series.result.forEach((element: any) => {

      if (!this.isNumeric(element.row[1]))
        return;

      if (+element.row[1] === 0)
        return;

      count++;
      let countryName = this.findCountryName(element.row[0]).name;

      let item = {
        id: '2.' + count,
        parent: '1.',
        name: countryName,
        y: +element.row[1]
      }

      if (+element.row[1] < 1) {
        if(arr.findIndex(elem => elem.id === '1.1') < 0)
          arr.push({id: '1.1', parent: '0.0', name: '< 1 M'});

        item.parent = '1.1';
      } else if (+element.row[1] < 5) {
        if(arr.findIndex(elem => elem.id === '1.2') < 0)
          arr.push({id: '1.2', parent: '0.0', name: '1-5 M'});

        item.parent = '1.2';
      } else if (+element.row[1] < 10) {
        if(arr.findIndex(elem => elem.id === '1.3') < 0)
          arr.push({id: '1.3', parent: '0.0', name: '5-10 M'});

        item.parent = '1.3';
      } else if (+element.row[1] < 20) {
        if(arr.findIndex(elem => elem.id === '1.4') < 0)
          arr.push({id: '1.4', parent: '0.0', name: '10-20M'});

        item.parent = '1.4';
      } else if (+element.row[1] >= 20) {
        if(arr.findIndex(elem => elem.id === '1.5') < 0)
          arr.push(
            {id: '1.5', parent: '0.0', name: '> 20 M'});

        item.parent = '1.5';
      }

      arr.push(item);

    });

    // console.log(arr);
    return arr;
  }

  /** Export to PDF -----------------------------------------------------------------------------------------------> **/
  exportToPDF(contents: HTMLElement[], filename?: string) {
    this.exportActive = true
    this.pdfService.export(contents, filename).then(() => {
      this.exportActive = false;
    }).catch((error) => {
      this.exportActive = false;
      console.error('Error during PDF generation:', error);
    });
  }


  /** Other ------------------------------------------------------------------------------------------------------>  **/
  isNumeric(value: string | null): boolean {
    // Check if the value is empty
    if (value === null)
      return false;

    if (value.trim() === '') {
      return false;
    }

    // Attempt to parse the value as a float
    const number = parseFloat(value);

    // Check if parsing resulted in NaN or the value has extraneous characters
    return !isNaN(number) && isFinite(number) && String(number) === value;
  }

  calculatePercentage(data: RawData, totalCountries: number) {
    let count = 0;
    data.datasets[0].series.result.forEach(item => {
      if (item.row[1] === 'Yes')
        count++;
    });
    return(Math.round(((count/totalCountries) + Number.EPSILON) * 100));
  }

  calculatePercentageChange(data: number[]) {
    if (data[0] === 0)
      return '--';

    let percentage = Math.abs((data[1] - data[0]) / data[0]);
    return Math.round((percentage + Number.EPSILON) * 100);

  }

  calculateSum(data: RawData) {
    let sum = 0;
    data.datasets[0].series.result.forEach(item => {
      if (this.isNumeric(item.row[1]))
        sum += +item.row[1];
    });

    return Math.round(sum * 100) / 100;
  }

  findCountryName(code: string) {
    return countriesNumbers.find(
      elem => elem.id === code
    );
  }

}
