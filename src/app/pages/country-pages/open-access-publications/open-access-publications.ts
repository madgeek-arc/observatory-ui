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
import { CatalogueUiReusableComponentsModule } from "src/survey-tool/catalogue-ui/shared/reusable-components/catalogue-ui-reusable-components.module";


@Component({
  selector: 'app-open-access-publications',
  imports: [
    CommonModule,
    NgOptimizedImage,
    ChartsModule,
    CatalogueUiReusableComponentsModule,
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
  countrySurveyAnswer?: Object;
  lastUpdateDate?: string;

  financialInvestment: (string | null)[] = [null, null];
  financialInvestmentPercentageDiff: number | null = null;
  OAPubsPercentage: (number | null)[] = [null, null];
  OAPubsPercentageDiff: number | null = null;
  rpoPubsPercentage: (number | null)[] = [null, null];
  rpoPubsPercentageDiff: number | null = null;
  rfoPubsPercentage: (number | null)[] = [null, null];
  rfoPubsPercentageDiff: number | null = null;
  nationalPolicyResponse: string | null = null;
  financialStrategyResponse: string | null = null;
  nationalPolicyClarification: string | null = null;
  financialStrategyClarification: string | null = null;
  monitoringResponse: string | null = null;
  monitoringClarification: string | null = null;
  policyMandatory: string | null = null;

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
        this.initCardValues();
      }
    });

    this.dataShareService.countrySurveyAnswer.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (answer) => {
        this.countrySurveyAnswer = answer;
      }
    });
  }

  /** Get OA VS closed, restricted and embargoed Publications -----------------------------------------------------> **/
  getPublicationPercentage() {
    this.queryData.getOSOStats(OAvsTotalPubsPerCountry(this.countryCode)).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.OAPubsPercentage[0] = this.dataShareService.calculatePercentage(value.data[0][0][0], value.data[1][0][0]);
        this.OAPubsPercentage[1] = this.dataShareService.calculatePercentage(value.data[2][0][0], value.data[3][0][0]);
        this.OAPubsPercentageDiff = this.dataShareService.calculateDiff(this.OAPubsPercentage[0], this.OAPubsPercentage[1]);
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

  initCardValues() {
    this.rfoPubsPercentage[1] = this.dataShareService.calculatePercentage(this.surveyAnswers[1]?.['Policies']?.['Question9']?.['Question9-0'], this.surveyAnswers[1]?.['General']?.['Question3']?.['Question3-0']);
    this.rfoPubsPercentage[0] = this.dataShareService.calculatePercentage(this.surveyAnswers[0]?.['Policies']?.['Question9']?.['Question9-0'], this.surveyAnswers[0]?.['General']?.['Question3']?.['Question3-0']);
    this.rfoPubsPercentageDiff = this.dataShareService.calculateDiff(this.rfoPubsPercentage[0], this.rfoPubsPercentage[1]);

    this.financialInvestment[0] = this.surveyAnswers[0]?.['Practices']?.['Question56']?.['Question56-0'];
    this.financialInvestment[1] = this.surveyAnswers[1]?.['Practices']?.['Question56']?.['Question56-0'];
    this.financialInvestmentPercentageDiff = this.dataShareService.calculateDiffAsPercentage(this.financialInvestment[0], this.financialInvestment[1]);

    this.rpoPubsPercentage[1] = this.dataShareService.calculatePercentage(this.surveyAnswers[1]?.['Policies']?.['Question8']?.['Question8-0'], this.surveyAnswers[1]?.['General']?.['Question2']?.['Question2-0']);
    this.rpoPubsPercentage[0] = this.dataShareService.calculatePercentage(this.surveyAnswers[0]?.['Policies']?.['Question8']?.['Question8-0'], this.surveyAnswers[0]?.['General']?.['Question2']?.['Question2-0']);
    this.rpoPubsPercentageDiff = this.dataShareService.calculateDiff(this.rpoPubsPercentage[0], this.rpoPubsPercentage[1]);

    this.nationalPolicyResponse = this.surveyAnswers[1]?.['Policies']?.['Question6']?.['Question6-0'];
    this.nationalPolicyClarification = this.surveyAnswers[1]?.['Policies']?.['Question6']?.['Question6-6'];

    this.financialStrategyResponse = this.surveyAnswers[1]?.['Policies']?.['Question7']?.['Question7-0'];
    this.financialStrategyClarification = this.surveyAnswers[1]?.['Policies']?.['Question7']?.['Question7-1'];

    this.monitoringResponse = this.surveyAnswers[1]?.['Practices']?.['Question54']?.['Question54-0'];
    this.monitoringClarification = this.surveyAnswers[1]?.['Practices']?.['Question54']?.['Question54-1'];

    this.policyMandatory = this.surveyAnswers[1]?.['Policies']?.['Question6']?.['Question6-1-0']?.['Question6-1'];
  }

}
