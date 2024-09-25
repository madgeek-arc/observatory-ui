import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { zip } from "rxjs/internal/observable/zip";
import { EoscReadinessDataService } from "../../../services/eosc-readiness-data.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { RawData } from "../../../../../survey-tool/app/domain/raw-data";
import * as Highcharts from "highcharts/highcharts.src";
import { isNumeric } from "rxjs/internal-compatibility";
import { StakeholdersService } from "../../../../../survey-tool/app/services/stakeholders.service";

@Component({
  selector: 'app-open-science-by-area-fair-data',
  templateUrl: './open-science-by-area-fair-data.component.html',
})

export class OpenScienceByAreaFairDataComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  countriesArray: string[] = [];
  years = ['2022', '2023']

  stackedColumnSeries = [
    {
      type: 'column',
      name: 'Research Performing Organisations with Policy',
      data: [],
      color: '#028691' // Primary color
    }, {
      type: 'column',
      name: 'Research Founding Organisations with Policy',
      data: [],
      color: '#e4587c' // Secondary color
    }, {
      type: 'column',
      name: 'Research Performing Organisations without Policy',
      data: [],
      color: '#fae0d1' // Tertiary color
    }, {
      type: 'column',
      name: 'Research Founding Organisations without Policy',
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

  constructor(private queryData: EoscReadinessDataService, private stakeholdersService: StakeholdersService) {}

  ngOnInit() {
    this.stakeholdersService.getEOSCSBCountries().pipe().subscribe({
      next: value => {
        this.countriesArray = value; // FIXME: Need the number of countries at that year!
        this.years.forEach((year, index) => {
          this.getCountriesWithPolicy(year);
        });
      },
      error: err => console.error(err)
    });

    this.years.forEach((year, index) => {
      this.getStackedColumnData(year, index);
      // if (this.years.length === index+1)
        // this.stackedColumnSeries = [...this.stackedColumnSeries];
    });

  }

  getCountriesWithPolicy(year: string) {
    this.queryData.getQuestion(year, 'Question14').pipe().subscribe({ // Country has a national policy on FAIR data?
      next: value => {
        this.calculatePercentage(value, this.countriesArray.length);
      }
    });
  }

  calculatePercentage(data: RawData, totalCountries: number) {
    let count = 0;
    data.datasets[0].series.result.forEach(item => {
      if (item.row[1] === 'Yes')
        count++;
    });
    this.countriesWithPolicy.push((Math.round(((count/totalCountries) + Number.EPSILON) * 100)));
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
        this.createStackedColumnSeries(value, year);
        if (this.years.length === index+1)
          this.stackedColumnSeries = [...this.stackedColumnSeries];
      }
    });
  }

  createStackedColumnSeries(data: RawData[], year: string) {
    let RPOCount = 0;
    let RPOCountWithPolicy = 0;
    let RFOCount = 0;
    let RFOCountWithPolicy = 0;

    data[0].datasets[0].series.result.forEach((result) => {
      if (isNumeric(result.row[1]))
        RPOCount += +result.row[1];
    });

    data[1].datasets[0].series.result.forEach((result) => {
      if (isNumeric(result.row[1]))
        RFOCount += +result.row[1];
    });

    data[2].datasets[0].series.result.forEach((result) => {
      if (isNumeric(result.row[1]))
        RPOCountWithPolicy += +result.row[1];
    });

    data[3].datasets[0].series.result.forEach((result) => {
      if (isNumeric(result.row[1]))
        RFOCountWithPolicy += +result.row[1];
    });

    this.stackedColumnSeries[0].data.push(Math.round(((RPOCountWithPolicy/RPOCount) + Number.EPSILON) * 100));
    this.stackedColumnSeries[1].data.push(Math.round(((RFOCountWithPolicy/RFOCount) + Number.EPSILON) * 100));
    this.stackedColumnSeries[2].data.push(Math.round((((RPOCount-RPOCountWithPolicy)/RPOCount) + Number.EPSILON) * 100));
    this.stackedColumnSeries[3].data.push(Math.round((((RFOCount-RFOCountWithPolicy)/RFOCount) + Number.EPSILON) * 100));
  }
  /** <---------------------------------------------------------------------------------------- Stacked column chart **/

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

  protected readonly Math = Math;
}
