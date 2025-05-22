import { CommonModule, NgOptimizedImage } from "@angular/common";
import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { DataShareService } from "../services/data-share.service";
import { EoscReadinessDataService } from "../../services/eosc-readiness-data.service";
import { OAvsTotalPubsPerCountry, trendOfOAPublicationsCountry } from "../coutry-pages.queries";
import { LegendOptions, SeriesOptionsType } from "highcharts";
import * as Highcharts from "highcharts";
import { ChartsModule } from "../../../shared/charts/charts.module";
import { ExploreService } from "../../explore/explore.service";


@Component({
  selector: 'app-open-access-publications',
  imports: [
    CommonModule,
    NgOptimizedImage,
    ChartsModule,
  ],
  standalone: true,
  templateUrl: './open-access-publications.html',
})

export class OpenAccessPublicationsPage implements OnInit {
  private destroyRef = inject(DestroyRef);

  protected readonly Math = Math;

  countryCode?: string;
  countryName?: string;
  surveyAnswers: Object[] = [];

  lastUpdateDate?: string;

  financialInvestment: (string | null)[] = [];
  OAPublications: (number | null)[] = [null, null];
  rpoPublicationPercentage: (number | null)[] = [null, null];
  rfoPublicationPercentage: (number | null)[] = [null, null];

  stackedColumnSeries: Highcharts.SeriesColumnOptions[] = [];
  stackedColumnCategories: string[] = [];
  yAxisTitle = 'Number of Publications';
  legend: LegendOptions = {
    align: 'right',
    verticalAlign: 'top',
    x: 0,
    y: 35,
    floating: true,
    backgroundColor: Highcharts.defaultOptions.legend.backgroundColor || 'white',
    borderColor: '#CCC',
    borderWidth: 1,
    shadow: false
  };
  tooltipPointFormat = '{series.name}: {point.y}<br/>Total: {point.total}';

  constructor(private dataShareService: DataShareService, private queryData: EoscReadinessDataService, private exploreService: ExploreService) {}

  ngOnInit() {

    this.exploreService._lastUpdateDate.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => this.lastUpdateDate = value
    });

    this.dataShareService.countryCode.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (code) => {
        this.countryCode = code;
        if (this.countryCode) {
          this.getPublicationPercentage();
          this.getTrends();
        }
      }
    });

    this.dataShareService.countryName.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (name) => {
        this.countryName = name;
      }
    });

    this.dataShareService.surveyAnswers.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (answers) => {
        this.surveyAnswers = answers;

        this.rfoPublicationPercentage[1] = this.calculatePercentage(this.surveyAnswers[1]?.['Policies']?.['Question9']?.['Question9-0'], this.surveyAnswers[1]?.['General']?.['Question3']?.['Question3-0']);
        this.rfoPublicationPercentage[0] = this.calculatePercentage(this.surveyAnswers[0]?.['Policies']?.['Question9']?.['Question9-0'], this.surveyAnswers[0]?.['General']?.['Question3']?.['Question3-0']);

        this.financialInvestment[0] = this.surveyAnswers[0]?.['Practices']?.['Question56']?.['Question56-0'];
        this.financialInvestment[1] = this.surveyAnswers[1]?.['Practices']?.['Question56']?.['Question56-0'];

        this.rpoPublicationPercentage[1] = this.calculatePercentage(this.surveyAnswers[1]?.['Policies']?.['Question8']?.['Question8-0'], this.surveyAnswers[1]?.['General']?.['Question2']?.['Question2-0']);
        this.rpoPublicationPercentage[0] = this.calculatePercentage(this.surveyAnswers[0]?.['Policies']?.['Question8']?.['Question8-0'], this.surveyAnswers[0]?.['General']?.['Question2']?.['Question2-0']);
      }
    });
  }

  /** Get OA VS closed, restricted and embargoed Publications -----------------------------------------------------> **/
  getPublicationPercentage() {
    this.queryData.getOSOStats(OAvsTotalPubsPerCountry(this.countryCode)).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.OAPublications[0] = (Math.round((+value.data[0] / +value.data[1] + Number.EPSILON) * 100));
        this.OAPublications[1] = (Math.round((+value.data[2] / +value.data[3] + Number.EPSILON) * 100));
      }
    });
  }

  /** Get trends of Publications ----------------------------------------------------------------------------------> **/
  getTrends() {
    this.queryData.getOSOStatsChartData(trendOfOAPublicationsCountry(this.countryCode)).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        value.series.forEach((series, index) => {
          const tmpSeries: SeriesOptionsType = {
            type: 'column',
            name: value.dataSeriesNames[index],
            data: series.data,
          };
          this.stackedColumnSeries.push(tmpSeries);
        });
        this.stackedColumnCategories = value.xAxis_categories;
      }
    });
  }


  calculatePercentage(value: string, total: string): number | null {

    if (value === undefined || total === undefined
      || (!this.dataShareService.isNumeric(value) && !this.dataShareService.isNumeric(total))
      || +total === 0) {
      return null;
    }

    return Math.round((+value / +total + Number.EPSILON) * 100);
  }

  get rpoPublicationPercentageChange(): number | null {
    return this.calculateChangeFromArray(this.rpoPublicationPercentage);
  }


  get rfoPublicationPercentageChange(): number | null {
    return this.calculateChangeFromArray(this.rfoPublicationPercentage)
  }

  get financialInvestmentChange(): number | null {
    return this.calculatePercentageChangeFromArray(this.financialInvestment);
  }

  calculateChangeFromArray(values: (number | string | null | undefined)[]): number | null {
    if (values.length < 2) {
      return null;
    }
    const [value0, value1] = values;

    if (value0 === null || value1 === null || value0 === undefined || value1 === undefined) {
      return null; // Avoid NaN
    }
    if (!this.dataShareService.isNumeric(String(value0)) || !this.dataShareService.isNumeric(String(value1))) {
      return null; // Avoid NaN
    }
    return (+value1 - +value0);
  }

  calculatePercentageChangeFromArray(values: (number | string | null | undefined)[]): number | null {
    if (values.length < 2) {
      return null;
    }
    const [value0, value1] = values;

    if (value0 === null || value1 === null || value0 === undefined || value1 === undefined) {
      return null; // Avoid NaN
    }
    if (!this.dataShareService.isNumeric(String(value0)) || !this.dataShareService.isNumeric(String(value1))) {
      return null; // Avoid NaN
    }
    if (+value0 === 0 && +value1 === 0) {
      return 0;
    }

    const average = (+value1 + +value0) / 2;
    return Math.round((Math.abs(+value1 - +value0) / average) * 100);
  }

}
