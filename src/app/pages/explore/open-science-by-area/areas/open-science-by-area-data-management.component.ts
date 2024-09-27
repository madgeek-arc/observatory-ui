import { Component, DestroyRef, inject } from "@angular/core";
import * as Highcharts from "highcharts/highcharts.src";
import { EoscReadinessDataService } from "../../../services/eosc-readiness-data.service";
import { StakeholdersService } from "../../../../../survey-tool/app/services/stakeholders.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { RawData } from "../../../../../survey-tool/app/domain/raw-data";
import { zip } from "rxjs/internal/observable/zip";

@Component({
  selector: 'app-open-science-by-area-data-management',
  templateUrl: './open-science-by-area-data-management.component.html',
  styleUrls: ['../../../../../assets/css/explore-dashboard.scss']
})

export class OpenScienceByAreaDataManagementComponent {
  protected readonly Math = Math;

  private destroyRef = inject(DestroyRef);

  countriesArray: string[] = [];
  years = ['2022', '2023']

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
  yAxisTitle = 'Percentage of Policies on FAIR Data'
  tooltipPointFormat = '{series.name}: {point.y}%';
  labelFormat = '{value}%';
  plotFormat = '{y}%';

  countriesWithPlans: number[] = [];
  countriesWithPolicy: number[] = [];
  countriesWithStrategy: number[] = [];
  countriesWithMonitoring: number[] = [];
  totalInvestments: number[] = [];

  constructor(private queryData: EoscReadinessDataService, private stakeholdersService: StakeholdersService) {}

  ngOnInit() {

    this.stakeholdersService.getEOSCSBCountries().pipe().subscribe({
      next: value => {
        this.countriesArray = value; // FIXME: Need the number of countries at that year!
        this.years.forEach((year, index) => {
          this.getCountriesWithPolicy(year, index);
          this.getTotalInvestments(year, index);
          this.getCountriesWithFinancialStrategy(year, index);
          this.getNationalMonitoring(year, index);
          this.getPlans(year, index);
        });
      },
      error: err => console.error(err)
    });

    this.years.forEach((year, index) => {
      this.getStackedColumnData(year, index);
    });
  }

/** Get national monitoring on Data Management ------------------------------------------------------------------  > **/
  getNationalMonitoring(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question58').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ // National monitoring in FAIR data
      next: value => {
        this.countriesWithMonitoring[index] = this.calculatePercentage(value, this.countriesArray.length);
      }
    });
  }

  /** Get financial strategy on Data Management -------------------------------------------------------------------> **/
  getCountriesWithFinancialStrategy(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question11').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ // Financial strategy in FAIR data
      next: value => {
        this.countriesWithStrategy[index] = this.calculatePercentage(value, this.countriesArray.length);
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

  /** Get countries with policy on Data Management percentage -----------------------------------------------------------> **/
  getCountriesWithPolicy(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question10').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ // Country has a national policy on FAIR data
      next: value => {
        this.countriesWithPolicy[index] = this.calculatePercentage(value, this.countriesArray.length);
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
    let percentage = Math.abs((data[1] - data[0]) / data[0]);
    return Math.round((percentage + Number.EPSILON) * 100);

  }

  calculateSum(data: RawData) {
    let sum = 0;
    data.datasets[0].series.result.forEach(item => {
      if (this.isNumeric(item.row[1]))
        sum += +item.row[1];
    });
    return sum;
  }

}
