import { CommonModule, NgOptimizedImage } from "@angular/common";
import { Component, DestroyRef, inject, OnInit, ChangeDetectionStrategy, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { DataShareService } from "../services/data-share.service";
import { CountryPageIndicatorsService } from "../services/country-page-indicators.service";
import { EoscReadinessDataService } from "../../services/eosc-readiness-data.service";
import {
  distributionOfOAByFieldOfScience,
  distributionOfOAByScholarlyOutputs,
  OAvsTotalPubsPerCountry,
  trendOfOAPublicationsCountry
} from "../coutry-pages.queries";
import * as Highcharts from "highcharts";
import { LegendOptions, OptionsStackingValue, SeriesBarOptions, SeriesOptionsType } from "highcharts";
import { BarOrColumnChartComponent } from "src/app/shared/charts/bar-chart/bar-or-column-chart.component";
import { StackedColumnComponent } from "src/app/shared/charts/stacked-column-chart/stacked-column.component";
import { ExploreService } from "../../explore/explore.service";
import {
  ReadMoreComponent, ReadMoreTextComponent
} from "src/survey-tool/catalogue-ui/shared/reusable-components/read-more.component";
import { SidebarMobileToggleComponent } from "src/survey-tool/app/shared/dashboard-side-menu/mobile-toggle/sidebar-mobile-toggle.component";
import { PageContentComponent } from "src/survey-tool/app/shared/page-content/page-content.component";
import { InfoCardComponent } from "src/app/shared/reusable-components/info-card/info-card.component";
import { PdfExportService } from "../../services/pdf-export.service";
import { combineLatest} from "rxjs";
import { filter } from "rxjs/operators";



import { CardConfigComponent } from "../card-config/card-config.component";
import { SectionHiddenNoticeComponent } from "../section-hidden-notice/section-hidden-notice.component";
import { setAt } from "src/app/shared/utils/set-at";

@Component({
    selector: 'app-open-access-publications',
    imports: [
        CommonModule,
        NgOptimizedImage,
        BarOrColumnChartComponent,
        StackedColumnComponent,
        ReadMoreComponent, ReadMoreTextComponent,
        SidebarMobileToggleComponent,
        PageContentComponent,
        InfoCardComponent,
        CardConfigComponent,
        SectionHiddenNoticeComponent
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './open-access-publications.html'
})

export class OpenAccessPublicationsPage implements OnInit {
  private destroyRef = inject(DestroyRef);
  protected readonly Math = Math;
  smallScreen = signal<boolean>(false);
  exportActive = signal(false);

  countryCode?: string;
  /** Code used only for the flag/label (EU for the Global default); data still uses countryCode. */
  flagCode = signal<string>(undefined);
  countryName = signal<string>(undefined);
  surveyAnswers: Object[] = [];
  countrySurveyAnswer = signal<Object>(undefined);
  countrySurveyAnswerLastUpdate = signal<string | null>(null);
  lastUpdateDate = signal<string>(undefined);
  year = signal<string>(undefined);

  financialInvestment = signal<(string | null)[]>([null, null]);
  financialInvestmentPercentageDiff = signal<number | null>(null);
  OAPubsPercentage = signal<(number | null)[]>([null, null]);
  OAPubsPercentageDiff = signal<number | null>(null);
  rpoPubsPercentage = signal<(number | null)[]>([null, null]);
  rpoPubsPercentageDiff = signal<number | null>(null);
  rfoPubsPercentage = signal<(number | null)[]>([null, null]);
  rfoPubsPercentageDiff = signal<number | null>(null);
  nationalPolicyResponse = signal<string | null>(null);
  financialStrategyResponse = signal<string | null>(null);
  nationalPolicyClarification = signal<string | null>(null);
  financialStrategyClarification = signal<string | null>(null);
  monitoringResponse = signal<string | null>(null);
  monitoringClarification = signal<string | null>(null);
  policyMandatory = signal<string | null>(null);

  stackedColumnSeries = signal<Highcharts.SeriesColumnOptions[]>([]);
  stackedColumnCategories = signal<string[]>([]);
  yAxisTitle = 'Number of Publications';
  legend: LegendOptions = {
    // align: 'right',
    // verticalAlign: 'top',
    // x: 0,
    // y: 35,
    // floating: true,
    backgroundColor: Highcharts.defaultOptions.legend.backgroundColor || 'white',
    borderColor: '#CCC',
    borderWidth: 1,
    // shadow: false
  };
  tooltipPointFormat = '{series.name}: {point.y}<br/>Total: {point.total}';

  stackedColumn2Series = signal<Highcharts.SeriesColumnOptions[]>([]);
  stackedColumn2Categories = signal([]);
  yAxisTitle2 = 'Percentage of Publications';
  stacking: OptionsStackingValue = 'percent';
  dataLabels_format = '{point.percentage:.0f}%';

  bar = signal<SeriesOptionsType[]>([
    {
      type: 'bar',
      name: 'Open',
      data: []
    },
    {
      type: 'bar',
      name: 'Closed',
      data: []
    }
  ]);
  barCategories = signal<string[]>([]);
  barChartTitles = {
    title: 'Distribution of Publications Access by Fields of Science in ',
    xAxis: '',
    yAxis: '',
  }

  protected dataShareService = inject(DataShareService);
  private queryData = inject(EoscReadinessDataService);
  private exploreService = inject(ExploreService);
  private pdfService = inject(PdfExportService);

  ngOnInit() {
    this.smallScreen.set(this.exploreService.isMobileOrSmallScreen);

    this.exploreService._lastUpdateDate.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => this.lastUpdateDate.set(value)
    });


    combineLatest([
      this.dataShareService.countryCode$,
      this.dataShareService.year$
    ])
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter(([code, year]) => !!code && !!year)
      )
      .subscribe(([code, year]) => {
        this.countryCode = code;
        this.year.set(year);
        this.getPublicationPercentage();
        this.getTrends();
        this.getDistributionsOA();
        this.getDistributionOAScholarlyOutputs();
      });

    this.dataShareService.countryName.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (name) => {
        this.countryName.set(name);
        this.barChartTitles.title += name;
      }
    });

    this.dataShareService.displayCountryCode$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (code) => {
        this.flagCode.set(code);
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
        this.countrySurveyAnswer.set(answer);
      }
    });



  this.dataShareService.countrySurveyAnswerMetaData.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
    next: (metadata) => {
      this.countrySurveyAnswerLastUpdate.set(metadata?.lastUpdate ?? null);
    }
  });

  }

  /** Get OA VS closed, restricted and embargoed Publications -----------------------------------------------------> **/
  getPublicationPercentage() {
    this.queryData.getOSOStats(OAvsTotalPubsPerCountry(this.countryCode, this.year())).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        setAt(this.OAPubsPercentage, 0, this.dataShareService.calculatePercentage(value.data[0][0][0], value.data[1][0][0]));
        setAt(this.OAPubsPercentage, 1, this.dataShareService.calculatePercentage(value.data[2][0][0], value.data[3][0][0]));
        this.OAPubsPercentageDiff.set(this.dataShareService.calculateDiff(this.OAPubsPercentage()[0], this.OAPubsPercentage()[1]));
      }
    });
  }

  /** Get trends of Publications ----------------------------------------------------------------------------------> **/
  getTrends() {
    this.queryData.getOSOStatsChartData(trendOfOAPublicationsCountry(this.countryCode, this.year())).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        const newSeries: Highcharts.SeriesColumnOptions[] = [];
        value.series.forEach((series, index) => {
          const tmpSeries: SeriesOptionsType = {
            type: 'column',
            name: value.dataSeriesNames[index],
            data: series.data,
          };
          newSeries.push(tmpSeries);
        });
        this.stackedColumnSeries.update(current => [...current, ...newSeries]);
        this.stackedColumnCategories.set(value.xAxis_categories);
      }
    });
  }

  /** Get Distribution of Open Access Types by Fields of Science --------------------------------------------------> **/
  getDistributionsOA() {
    this.queryData.getOSOStatsChartData(distributionOfOAByFieldOfScience(this.countryCode, this.year())).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        // build the new series in a local copy and set it once: OnPush charts only redraw on a new reference
        const bar = this.bar().map(s => ({...s})) as SeriesBarOptions[];
        value.series.forEach((series, index) => {
          bar[index].data = series.data;
        });
        const closed = bar[bar.length - 1];
        closed.data = [...closed.data];
        for (let i = 0; i < closed.data.length; i++) {
          closed.data[i] = -closed.data[i];
        }
        this.bar.set(bar);
        this.barCategories.set(value.xAxis_categories);

      }
    });
  }

  /** Get Distribution of Open Access Types by Different Scholarly Publication Outputs ----------------------------> **/
  getDistributionOAScholarlyOutputs() {
    this.queryData.getOSOStatsChartData(distributionOfOAByScholarlyOutputs(this.countryCode, this.year())).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        const newSeries: Highcharts.SeriesColumnOptions[] = [];
        value.series.forEach((series, index) => {
          const tmpSeries: SeriesOptionsType = {
            type: 'column',
            name: value.dataSeriesNames[index],
            data: series.data,
          }

          newSeries.push(tmpSeries);
        });
        this.stackedColumn2Series.update(current => [...current, ...newSeries]);
        this.stackedColumn2Categories.set(value.xAxis_categories);
      }
    });
  }

  /** Check if at least one data value is available for displaying the left card.
   * Uses the generic method of DataCheckService to check for null & undefined values.
   */
  private readonly indicatorsService = inject(CountryPageIndicatorsService);

  /** Left card block renders only if at least one of its cards will be visible (see service). */
  hasAnyLeftCardVisible(): boolean {
    return this.indicatorsService.anyCardVisible([
      { id: '16', hasData: this.OAPubsPercentage()[1]  != null },
      { id: '17', hasData: this.rfoPubsPercentage()[1] != null },
      { id: '18', hasData: this.rpoPubsPercentage()[1] != null },
      { id: '19', hasData: this.financialInvestment()[1] != null },
    ]);
  }

  hasAnyLeftCardData() {
    return this.dataShareService.hasAnyValue([
      this.rfoPubsPercentage()[1],
      this.rpoPubsPercentage()[1],
      this.financialInvestment()[1]
    ]);
  }

  hasSurveyPublicationData(): boolean {
    const surveyData = this.countrySurveyAnswer()?.['SCIENCE, TECHNOLOGY & INNOVATION - STI POLICY FRAMEWORK'];
    if (!surveyData) {
      return false;
    }
    const questions = ['Question7'];
    return this.dataShareService.hasSurveyData(surveyData, questions);
  }

  initCardValues() {
    setAt(this.rfoPubsPercentage, 1, this.dataShareService.calculatePercentage(this.surveyAnswers[1]?.['Policies']?.['Question9']?.['Question9-0'], this.surveyAnswers[1]?.['General']?.['Question3']?.['Question3-0']));
    setAt(this.rfoPubsPercentage, 0, this.dataShareService.calculatePercentage(this.surveyAnswers[0]?.['Policies']?.['Question9']?.['Question9-0'], this.surveyAnswers[0]?.['General']?.['Question3']?.['Question3-0']));
    this.rfoPubsPercentageDiff.set(this.dataShareService.calculateDiff(this.rfoPubsPercentage()[0], this.rfoPubsPercentage()[1]));

    setAt(this.financialInvestment, 0, this.surveyAnswers[0]?.['Practices']?.['Question56']?.['Question56-0'] || null);
    setAt(this.financialInvestment, 1, this.surveyAnswers[1]?.['Practices']?.['Question56']?.['Question56-0'] || null);
    this.financialInvestmentPercentageDiff.set(this.dataShareService.calculateDiffAsPercentage(this.financialInvestment()[0], this.financialInvestment()[1]));

    setAt(this.rpoPubsPercentage, 1, this.dataShareService.calculatePercentage(this.surveyAnswers[1]?.['Policies']?.['Question8']?.['Question8-0'], this.surveyAnswers[1]?.['General']?.['Question2']?.['Question2-0']));
    setAt(this.rpoPubsPercentage, 0, this.dataShareService.calculatePercentage(this.surveyAnswers[0]?.['Policies']?.['Question8']?.['Question8-0'], this.surveyAnswers[0]?.['General']?.['Question2']?.['Question2-0']));
    this.rpoPubsPercentageDiff.set(this.dataShareService.calculateDiff(this.rpoPubsPercentage()[0], this.rpoPubsPercentage()[1]));

    this.nationalPolicyResponse.set(this.surveyAnswers[1]?.['Policies']?.['Question6']?.['Question6-0'] || null);
    this.nationalPolicyClarification.set(this.surveyAnswers[1]?.['Policies']?.['Question6']?.['Question6-6'] || null);

    this.financialStrategyResponse.set(this.surveyAnswers[1]?.['Policies']?.['Question7']?.['Question7-0'] || null);
    this.financialStrategyClarification.set(this.surveyAnswers[1]?.['Policies']?.['Question7']?.['Question7-1'] || null);

    this.monitoringResponse.set(this.surveyAnswers[1]?.['Practices']?.['Question54']?.['Question54-0'] || null);
    this.monitoringClarification.set(this.surveyAnswers[1]?.['Practices']?.['Question54']?.['Question54-1'] || null);

    this.policyMandatory.set(this.surveyAnswers[1]?.['Policies']?.['Question6']?.['Question6-1-0']?.['Question6-1'] || null);
  }

  exportToPDF(contents: HTMLElement[], filename?: string) {
    this.exportActive.set(true)

    // Χρόνος για να εφαρμοστούν τα styles
    // setTimeout(() => {
      this.pdfService.export(contents, filename).then(() => {
        // this.restoreAnimations(modifiedElements, contents);
        this.exportActive.set(false);
      }).catch((error) => {
        // this.restoreAnimations(modifiedElements, contents);
        this.exportActive.set(false);
        console.error('Error during PDF generation:', error);
      });
    // }, 0);
  }

}
