import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { EoscReadinessDataService } from "../../../services/eosc-readiness-data.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { RawData } from "../../../../../survey-tool/app/domain/raw-data";
import { OAPublicationVSClosed, trendOfOAPublications } from "../../OSO-stats-queries/explore-queries";
import * as Highcharts from "highcharts";


@Component({
  selector: 'app-open-science-by-area-publications',
  templateUrl: './open-science-by-area-publications.component.html',
  styleUrls: ['../../../../../assets/css/explore-dashboard.scss']
})

export class OpenScienceByAreaPublicationsComponent implements OnInit {
  protected readonly Math = Math;

  private destroyRef = inject(DestroyRef);

  years = ['2022', '2023'];

  stackedColumnCategories = ['2020', '2021', '2022', '2023', '2024'];
  stackedColumnSeries = [
    {
      type: 'column',
      name: 'Gold OA only',
      data: [],
      color: '#FFD700' // Gold color
    }, {
      type: 'column',
      name: 'Green OA only',
      data: [],
      color: '#228B22' // Forest green color
    }, {
      type: 'column',
      name: 'Both Gold & Green OA',
      data: [],
      color: '#FF69B4' // Hot pink color for mixed category
    }, {
      type: 'column',
      name: 'Neither',
      data: [],
      color: '#b0c4de'
    }, {
      type: 'column',
      name: 'Closed',
      data: [],
      color: '#808080' // Grey color
    }
  ] as Highcharts.SeriesColumnOptions[];
  yAxisTitle = 'Number of Publications';
  legend = {
    align: 'right',
    x: -30,
    verticalAlign: 'top',
    y: -10,
    floating: true,
    backgroundColor: Highcharts.defaultOptions.legend.backgroundColor || 'white',
    borderColor: '#CCC',
    borderWidth: 1,
    shadow: false
  };
  tooltipPointFormat = '{series.name}: {point.y}<br/>Total: {point.total}';

  countriesWithPolicy: number[] = [];
  countriesWithStrategy: number[] = [];
  countriesWithMonitoring: number[] = [];
  totalInvestments: number[] = [];
  OAPublications: number[] = [];

  constructor(private queryData: EoscReadinessDataService) {}

  ngOnInit() {
    this.getPublicationPercentage();
    this.getTrends();

    this.years.forEach((year, index) => {
      this.getCountriesWithPolicy(year, index);
      this.getTotalInvestments(year, index);
      this.getCountriesWithFinancialStrategy(year, index);
      this.getNationalMonitoring(year, index);
      // this.getPlans(year, index);
    });

  }

  /** Get trends of Publications ----------------------------------------------------------------------------------> **/
  getTrends() {
    this.queryData.getOSOStats(trendOfOAPublications()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        value.data.forEach((item, index) => {
          item.forEach(el => {
            this.stackedColumnSeries[index].data.push(+el[0]);
          });
        });
        // console.log(this.stackedColumnSeries);
        this.stackedColumnSeries = [...this.stackedColumnSeries];
      }
    });
  }

  /** Get OA VS closed, restricted and embargoed Publications ---------------------------------------------------  > **/
  getPublicationPercentage() {
    this.queryData.getOSOStats(OAPublicationVSClosed()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.OAPublications[0] = (Math.round((+value.data[2]/+value.data[3] + Number.EPSILON) * 100));
        this.OAPublications[1] = (Math.round((+value.data[0]/+value.data[1] + Number.EPSILON) * 100));
      }
    });
  }

  /** Get national monitoring on Publications -------------------------------------------------------------------  > **/
  getNationalMonitoring(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question54').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.countriesWithMonitoring[index] = this.calculatePercentage(value, value.datasets[0].series.result.length);
      }
    });
  }

  /** Get financial strategy on Publications -------------------------------------------------------------------------> **/
  getCountriesWithFinancialStrategy(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question7').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.countriesWithStrategy[index] = this.calculatePercentage(value, value.datasets[0].series.result.length);
      }
    });
  }


  /** Get investments on Publications -----------------------------------------------------------------------------> **/
  getTotalInvestments(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question56').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.totalInvestments[index] = this.calculateSum(value);
      }
    });
  }

  /** Get countries with policy on Publications percentage --------------------------------------------------------> **/
  getCountriesWithPolicy(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question6').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.countriesWithPolicy[index] = this.calculatePercentage(value, value.datasets[0].series.result.length);
      }
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
