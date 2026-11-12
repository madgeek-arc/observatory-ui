import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { DataShareService } from "../services/data-share.service";
import { CountryPageIndicatorsService } from "../services/country-page-indicators.service";
import {
  ReadMoreComponent, ReadMoreTextComponent
} from 'src/survey-tool/catalogue-ui/shared/reusable-components/read-more.component';
import { EoscReadinessDataService } from "../../services/eosc-readiness-data.service";
import {
  distributionOfDataByDocumentTypeCountry,
  OAvsTotalDataPerCountry,
  trendOfOpenDataCountry
} from "../coutry-pages.queries";
import * as Highcharts from "highcharts";
import { LegendOptions, OptionsStackingValue, SeriesOptionsType } from "highcharts";
import { StackedColumnComponent } from "src/app/shared/charts/stacked-column-chart/stacked-column.component";
import { ExploreService } from "../../explore/explore.service";
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
    selector: 'app-open-data',
    imports: [
        CommonModule,
        NgOptimizedImage,
        ReadMoreComponent, ReadMoreTextComponent,
        StackedColumnComponent,
        SidebarMobileToggleComponent,
        PageContentComponent,
        InfoCardComponent,
        CardConfigComponent,
        SectionHiddenNoticeComponent
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './open-data.component.html'
})
export class OpenDataComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  exportActive = signal(false);
  smallScreen = signal<boolean>(false);

  countryCode?: string;
  /** Code used only for the flag/label (EU for the Global default); data still uses countryCode. */
  flagCode = signal<string>(undefined);
  countryName = signal<string>(undefined);
  surveyAnswers: Object[] = [];
  countrySurveyAnswer = signal<Object>(undefined);
  countrySurveyAnswerLastUpdate = signal<string | null>(null);
  year = signal<string>(undefined);
  prevYear: string;


  rfoOpenDataPercentage = signal<(number | null)[]>([null, null]);
  rfoOpenDataPercentageDiff = signal<number | null>(null);
  ODfinancialInvestment = signal<(string | null)[]>([null, null]);
  ODfinancialInvestmentPercentageDiff = signal<number | null>(null);
  rpoOpenDataPercentage = signal<(number | null)[]>([null, null]);
  rpoOpenDataPercentageDiff = signal<number | null>(null);
  hasNationalPolicyOD = signal<string | null>(null);
  nationalPolicyClarificationOD = signal<string | null>(null);
  hasFinancialStrategyOD = signal<string | null>(null);
  financialStrategyClarificationOD = signal<string | null>(null);
  hasMonitoringOD = signal<string | null>(null);
  monitoringClarificationOD = signal<string | null>(null);
  policyMandatoryOD = signal<string | null>(null);
  OpenDataPercentage = signal<(number | null)[]>([null, null]);
  OpenDataPercentageDiff = signal<number | null>(null);

  legend: LegendOptions = {
    // align: 'right',
    // x: -30,
    // verticalAlign: 'top',
    // y: 30,
    // floating: true,
    backgroundColor: Highcharts.defaultOptions.legend.backgroundColor || 'white',
    borderColor: '#CCC',
    borderWidth: 1,
    // shadow: false,
    // reversed: false
  };
  tooltipPointFormat = '{series.name}: {point.y}<br/>Total: {point.total}';

  stackedColumnCategories = signal<string[]>([]);
  stackedColumnSeries = signal<Highcharts.SeriesColumnOptions[]>([]);

  stackedColumn2Categories = signal<string[]>([]);
  stackedColumn2Series = signal<Highcharts.SeriesColumnOptions[]>([]);
  stacking: OptionsStackingValue = 'percent';
  dataLabels_format = '{point.percentage:.0f}%';

  lastUpdateDate = signal<string>(undefined);

  protected dataShareService = inject(DataShareService);
  private exploreService = inject(ExploreService);
  private queryData = inject(EoscReadinessDataService);
  private pdfService = inject(PdfExportService);

  ngOnInit() {

    this.smallScreen.set(this.exploreService.isMobileOrSmallScreen);

    this.exploreService._lastUpdateDate.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => this.lastUpdateDate.set(value)
    });

    combineLatest([
      this.dataShareService.countryCode$,
      this.dataShareService.year$,
    ])
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter(([code, year]) => !!code && !!year)
      )
      .subscribe(([code, year]) => {
        this.countryCode = code;
        this.year.set(year);
        const numericYear = +year;
        this.prevYear = (numericYear - 1).toString();
        this.countryCode = code;
        this.getOpenDataPercentage();
        this.getTrendsOpenData();
        this.getDistributionByDocumentType();
      })

    this.dataShareService.countryName.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (name) => {
        this.countryName.set(name);
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

  initCardValues() {
    setAt(this.rfoOpenDataPercentage, 1, this.dataShareService.calculatePercentage(this.surveyAnswers[1]?.['Policies']?.['Question21']?.['Question21-0'], this.surveyAnswers[1]?.['General']?.['Question3']?.['Question3-0']));
    setAt(this.rfoOpenDataPercentage, 0, this.dataShareService.calculatePercentage(this.surveyAnswers[0]?.['Policies']?.['Question21']?.['Question21-0'], this.surveyAnswers[0]?.['General']?.['Question3']?.['Question3-0']));
    this.rfoOpenDataPercentageDiff.set(this.dataShareService.calculateDiff(this.rfoOpenDataPercentage()[0], this.rfoOpenDataPercentage()[1]));

    setAt(this.ODfinancialInvestment, 1, this.surveyAnswers[1]?.['Practices']?.['Question68']?.['Question68-0']);
    setAt(this.ODfinancialInvestment, 0, this.surveyAnswers[0]?.['Practices']?.['Question68']?.['Question68-0']);
    this.ODfinancialInvestmentPercentageDiff.set(this.dataShareService.calculateDiffAsPercentage(this.ODfinancialInvestment()[0], this.ODfinancialInvestment()[1]));

    setAt(this.rpoOpenDataPercentage, 1, this.dataShareService.calculatePercentage(this.surveyAnswers[1]?.['Policies']?.['Question20']?.['Question20-0'], this.surveyAnswers[1]?.['General']?.['Question2']?.['Question2-0']));
    setAt(this.rpoOpenDataPercentage, 0, this.dataShareService.calculatePercentage(this.surveyAnswers[0]?.['Policies']?.['Question20']?.['Question20-0'], this.surveyAnswers[0]?.['General']?.['Question2']?.['Question2-0']));
    this.rpoOpenDataPercentageDiff.set(this.dataShareService.calculateDiff(this.rpoOpenDataPercentage()[0], this.rpoOpenDataPercentage()[1]));

    this.hasNationalPolicyOD.set(this.surveyAnswers[1]?.['Policies']?.['Question18']?.['Question18-0'] || null);
    this.policyMandatoryOD.set(this.surveyAnswers[1]?.['Policies']?.['Question18']?.['Question18-1-0']?.['Question18-1'] || null);
    this.nationalPolicyClarificationOD.set(this.surveyAnswers[1]?.['Policies']?.['Question18']?.['Question18-3'] || null);

    this.hasFinancialStrategyOD.set(this.surveyAnswers[1]?.['Policies']?.['Question19']?.['Question19-0'] || null);
    this.financialStrategyClarificationOD.set(this.surveyAnswers[1]?.['Policies']?.['Question19']?.['Question19-3'] || null);

    this.hasMonitoringOD.set(this.surveyAnswers[1]?.['Practices']?.['Question66']?.['Question66-0'] || null);
    this.monitoringClarificationOD.set(this.surveyAnswers[1]?.['Practices']?.['Question66']?.['Question66-1'] || null);

  }

  getOpenDataPercentage() {
    this.queryData.getOSOStats(OAvsTotalDataPerCountry(this.countryCode, this.prevYear, this.year())).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        setAt(this.OpenDataPercentage, 0, this.dataShareService.calculatePercentage(value.data[0][0][0], value.data[1][0][0]));
        setAt(this.OpenDataPercentage, 1, this.dataShareService.calculatePercentage(value.data[2][0][0], value.data[3][0][0]));
        this.OpenDataPercentageDiff.set(this.dataShareService.calculateDiff(this.OpenDataPercentage()[0], this.OpenDataPercentage()[1]));
      }
    });
  }

  /** Get trends of Open Data -------------------------------------------------------------------------------------> **/
  getTrendsOpenData() {
    this.queryData.getOSOStatsChartData(trendOfOpenDataCountry(this.countryCode, this.year())).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        const newSeries: Highcharts.SeriesColumnOptions[] = [];
        value.series.forEach((series, index) => {
          let tmpSeries: SeriesOptionsType = {
            type: 'column',
            name: value.dataSeriesNames[index],
            data: series.data
          }
          newSeries.push(tmpSeries);
        });
        this.stackedColumnSeries.update(current => [...current, ...newSeries]);

        this.stackedColumnCategories.set(value.xAxis_categories);
      }
    });
  }

  /** Get Distribution By Document Type ---------------------------------------------------------------------------> **/
  getDistributionByDocumentType() {
    this.queryData.getOSOStatsChartData(distributionOfDataByDocumentTypeCountry(this.countryCode, this.year())).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        const newSeries: Highcharts.SeriesColumnOptions[] = [];
        value.series.forEach((series, index) => {
          let tmpSeries: SeriesOptionsType = {
            type: 'column',
            name: value.dataSeriesNames[index],
            data: series.data
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
      { id: '25', hasData: this.OpenDataPercentage()[1]    != null },
      { id: '26', hasData: this.rfoOpenDataPercentage()[1] != null },
      { id: '27', hasData: this.ODfinancialInvestment()[1] != null },
      { id: '28', hasData: this.rpoOpenDataPercentage()[1] != null },
    ]);
  }

  hasAnyLeftCardData() {
    return this.dataShareService.hasAnyValue([
      this.OpenDataPercentage()[1],
      this.rfoOpenDataPercentage()[1],
      this.ODfinancialInvestment()[1],
      this.rpoOpenDataPercentage()[1]
    ]);
  }

  hasSurveyOpenData(): boolean {
    const surveyData = this?.countrySurveyAnswer()?.['OPEN SCIENCE DIGITAL INFRASTRUCTURE'];
    if (!surveyData) {
      return false;
    }
    const questions = ['Question15', 'Question18'];
    return this.dataShareService.hasSurveyData(surveyData, questions);
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
