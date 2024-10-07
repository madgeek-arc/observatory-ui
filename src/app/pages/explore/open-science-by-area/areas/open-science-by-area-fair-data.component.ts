import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { zip } from "rxjs/internal/observable/zip";
import { EoscReadinessDataService } from "../../../services/eosc-readiness-data.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { RawData } from "../../../../../survey-tool/app/domain/raw-data";
import * as Highcharts from "highcharts/highcharts.src";
import { StakeholdersService } from "../../../../../survey-tool/app/services/stakeholders.service";
import { PdfExportService } from "../../../services/pdf-export.service";

@Component({
  selector: 'app-open-science-by-area-fair-data',
  templateUrl: './open-science-by-area-fair-data.component.html',
  styleUrls: ['../../../../../assets/css/explore-dashboard.scss']
})

export class OpenScienceByAreaFairDataComponent implements OnInit {
  protected readonly Math = Math;

  private destroyRef = inject(DestroyRef);

  countriesArray: string[] = [];
  years = ['2022', '2023']

  stackedColumnSeries1 = [
    {
      type: 'column',
      name: 'Research Performing Organisations with Policy',
      data: [],
      color: '#028691' // Primary color
    }, {
      type: 'column',
      name: 'Research Performing Organisations without Policy',
      data: [],
      color: '#fae0d1' // Tertiary color
    }
  ] as Highcharts.SeriesColumnOptions[];
  stackedColumnSeries2 = [
    {
      type: 'column',
      name: 'Research Funding Organisations with Policy',
      data: [],
      color: '#e4587c' // Secondary color
    }, {
      type: 'column',
      name: 'Research Funding Organisations without Policy',
      data: [],
      color: '#515252' // Additional color
    }
  ] as Highcharts.SeriesColumnOptions[];
  stackedColumnCategories = ['2021', '2022'];
  xAxisTitle = 'Year';
  yAxisTitle = 'Percentage of Policies on FAIR Data';
  tooltipPointFormat = '{series.name}: {point.y}%';
  labelFormat = '{value}%';
  plotFormat = '{y}%';

  countriesWithPolicy: number[] = [];
  countriesWithStrategy: number[] = [];
  countriesWithMonitoring: number[] = [];
  totalInvestments: number[] = [];

  constructor(private queryData: EoscReadinessDataService, private stakeholdersService: StakeholdersService,
              private pdfService: PdfExportService) {}

  ngOnInit() {
    this.stakeholdersService.getEOSCSBCountries().pipe().subscribe({
      next: value => {
        this.countriesArray = value; // FIXME: Need the number of countries at that year!
        this.years.forEach((year, index) => {
          this.getCountriesWithPolicy(year, index);
          this.getTotalFairInvestments(year, index);
          this.getCountriesWithFinancialStrategy(year, index);
          this.getNationalMonitoring(year, index);
        });
      },
      error: err => console.error(err)
    });

    this.years.forEach((year, index) => {
      this.getStackedColumnData(year, index);
    });

  }

  /** Get national monitoring on FAIR Data -------------------------------------------------------------------------> **/
  getNationalMonitoring(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question62').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ // National monitoring in FAIR data
      next: value => {
        this.countriesWithMonitoring[index] = this.calculatePercentage(value, this.countriesArray.length);
      }
    });
  }

  /** Get financial strategy on FAIR Data -------------------------------------------------------------------------> **/
  getCountriesWithFinancialStrategy(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question15').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ // Financial strategy in FAIR data
      next: value => {
        this.countriesWithStrategy[index] = this.calculatePercentage(value, this.countriesArray.length);
      }
    });
  }


  /** Get investments on FAIR Data --------------------------------------------------------------------------------> **/
  getTotalFairInvestments(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question64').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ // Financial investment in FAIR data
      next: value => {
        this.totalInvestments[index] = this.calculateSum(value);
      }
    });
  }

  /** Get countries with policy on FAIR Data percentage -----------------------------------------------------------> **/
  getCountriesWithPolicy(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question14').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ // Country has a national policy on FAIR data
      next: value => {
        this.countriesWithPolicy[index] = this.calculatePercentage(value, this.countriesArray.length);
      }
    });
  }

  /** Stacked column chart ----------------------------------------------------------------------------------------> **/
  getStackedColumnData(year: string, index: number) {
    zip(
      this.queryData.getQuestion(year, 'Question2'),  // research performing organisations
      this.queryData.getQuestion(year, 'Question3'),  // research funding organisations
      this.queryData.getQuestion(year, 'Question16'),  // research performing organisations with policy on FAIR data
      this.queryData.getQuestion(year, 'Question17'),  // research funding organisations with policy on FAIR data
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

  /** Export to PDF -----------------------------------------------------------------------------------------------> **/
  exportToPDF(content: HTMLElement, filename?: string) {
    this.pdfService.export(content, filename);
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

}
