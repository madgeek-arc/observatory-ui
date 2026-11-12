import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { DataShareService } from "../services/data-share.service";
import { CountryPageIndicatorsService } from "../services/country-page-indicators.service";
import {
  ReadMoreComponent, ReadMoreTextComponent
} from 'src/survey-tool/catalogue-ui/shared/reusable-components/read-more.component';
import * as Highcharts from "highcharts/highcharts.src";
import { ExploreService } from "../../explore/explore.service";
import { StackedColumnComponent } from "src/app/shared/charts/stacked-column-chart/stacked-column.component";
import { SidebarMobileToggleComponent } from "src/survey-tool/app/shared/dashboard-side-menu/mobile-toggle/sidebar-mobile-toggle.component";
import { PageContentComponent } from "src/survey-tool/app/shared/page-content/page-content.component";
import { InfoCardComponent } from "src/app/shared/reusable-components/info-card/info-card.component";
import { PdfExportService } from "../../services/pdf-export.service";


import { CardConfigComponent } from "../card-config/card-config.component";
import { SectionHiddenNoticeComponent } from "../section-hidden-notice/section-hidden-notice.component";
import { setAt } from "src/app/shared/utils/set-at";

@Component({
    selector: 'app-fair-data',
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
    templateUrl: './fair-data.component.html'
})
export class FairDataComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  protected readonly Math = Math;
  exportActive = signal(false);

  countryCode?: string;
  /** Code used only for the flag/label (EU for the Global default); data still uses countryCode. */
  flagCode = signal<string>(undefined);
  countryName = signal<string>(undefined);
  surveyAnswers: Object[] = [];
  countrySurveyAnswer = signal<Object>(undefined);
  countrySurveyAnswerLastUpdate = signal<string | null>(null);
  year = signal<string>(undefined);
  lastUpdateDate = signal<string>(undefined);

  rfoFairDataPercentage = signal<(number | null)[]>([null, null]);
  rfoFairDataPercentageDiff = signal<number | null>(null);
  rpoFairDataPercentage = signal<(number | null)[]>([null,null]);
  rpoFairDataPercentageDiff = signal<number | null>(null);
  financialInvestmentInFairData = signal<(string | null)[]>([null, null]);
  financialInvestmentInFairDataPercentageDiff = signal<number | null>(null);
  hasNationalPolicyFD = signal<string | null>(null);
  nationalPolicyClarificationFD = signal<string | null>(null);
  hasFinancialStrategyFD = signal<string | null>(null);
  financialStrategyClarificationFD = signal<string | null>(null);
  hasMonitoringFD = signal<string | null>(null);
  monitoringClarificationFD = signal<string | null>(null);
  policyMandatoryFD = signal<string | null>(null);

  stackedColumnSeries1 = signal([
    {
      type: 'column',
      name: 'Research Performing Organisations with Policy',
      data: [],
      // color: colors[0]
    }, {
      type: 'column',
      name: 'Research Performing Organisations without Policy',
      data: [],
      // color: colors[7]
    }
  ] as Highcharts.SeriesColumnOptions[]);
  stackedColumnSeries2 = signal([
    {
      type: 'column',
      name: 'Research Funding Organisations with Policy',
      data: [],
      // color: colors[1]
    }, {
      type: 'column',
      name: 'Research Funding Organisations without Policy',
      data: [],
      // color: colors[8]
    }
  ] as Highcharts.SeriesColumnOptions[]);
  stackedColumnCategories = signal<string[]>([]);
  xAxisTitle = 'Year';
  yAxisTitle = 'Percentage of Policies on FAIR Data';
  tooltipPointFormat = '<span style="color:{series.color}">{series.name}</span> : <b>{point.y}</b>';
  labelFormat = '{value}%';
  plotFormat = '{point.percentage:.0f}%';

  private dataShareService = inject(DataShareService);
  private exploreService = inject(ExploreService);
  private pdfService = inject(PdfExportService);

  ngOnInit() {
    this.exploreService._lastUpdateDate.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => this.lastUpdateDate.set(value)
    });

    this.dataShareService.countryCode.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (code) => {
        this.countryCode = code;
      }
    });

    this.dataShareService.year.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (year) => {
        this.year.set(year);
        // Convert the year from string to number using unary plus, then calculate the two previous years as strings
        const numericYear = +year;
        this.stackedColumnCategories.set([
          (numericYear - 1).toString(),
          (numericYear).toString(),
        ]);
      }
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
        if (this.surveyAnswers[1] === null)
          return;

        this.initCardValues();
        this.createStackedColumns();
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

  private readonly indicatorsService = inject(CountryPageIndicatorsService);

  /** Left card block renders only if at least one of its cards will be visible (see service). */
  hasAnyLeftCardVisible(): boolean {
    return this.indicatorsService.anyCardVisible([
      { id: '33', hasData: this.rfoFairDataPercentage()[1]         != null },
      { id: '34', hasData: this.rpoFairDataPercentage()[1]         != null },
      { id: '35', hasData: this.financialInvestmentInFairData()[1] != null },
    ]);
  }

  hasAnyLeftCardData() {
    return this.dataShareService.hasAnyValue([
      this.rfoFairDataPercentage()[1],
      this.rpoFairDataPercentage()[1],
      this.financialInvestmentInFairData()[1]
    ]);
  }

  hasCountrySurveyAnswerData() {
    const surveyData = this.countrySurveyAnswer()?.['OPEN SCIENCE DIGITAL INFRASTRUCTURE'];
    if (!surveyData) {
      return false;
    }
    const questions = ['Question15', 'Question18'];
    return this.dataShareService.hasSurveyData(surveyData, questions);

  }


  initCardValues() {
    setAt(this.rfoFairDataPercentage, 1, this.dataShareService.calculatePercentage(this.surveyAnswers[1]?.['Policies']?.['Question17']?.['Question17-0'], this.surveyAnswers[1]?.['General']?.['Question3']?.['Question3-0']));
    setAt(this.rfoFairDataPercentage, 0, this.dataShareService.calculatePercentage(this.surveyAnswers[0]?.['Policies']?.['Question17']?.['Question17-0'], this.surveyAnswers[0]?.['General']['Question3']?.['Question3-0']));
    this.rfoFairDataPercentageDiff.set(this.dataShareService.calculateDiff(this.rfoFairDataPercentage()[0], this.rfoFairDataPercentage()[1]));

    setAt(this.rpoFairDataPercentage, 1, this.dataShareService.calculatePercentage(this.surveyAnswers[1]?.['Policies']?.['Question16']?.['Question16-0'], this.surveyAnswers[1]?.['General']?.['Question2']?.['Question2-0']));
    setAt(this.rpoFairDataPercentage, 0, this.dataShareService.calculatePercentage(this.surveyAnswers[0]?.['Policies']?.['Question16']?.['Question16-0'], this.surveyAnswers[0]?.['General']?.['Question2']?.['Question2-0']));
    this.rpoFairDataPercentageDiff.set(this.dataShareService.calculateDiff(this.rpoFairDataPercentage()[0], this.rpoFairDataPercentage()[1]));

    setAt(this.financialInvestmentInFairData, 1, this.surveyAnswers[1]?.['Practices']?.['Question64']?.['Question64-0'] || null);
    setAt(this.financialInvestmentInFairData, 0, this.surveyAnswers[0]?.['Practices']?.['Question64']?.['Question64-0'] || null);
    this.financialInvestmentInFairDataPercentageDiff.set(this.dataShareService.calculateDiffAsPercentage(this.financialInvestmentInFairData()[0], this.financialInvestmentInFairData()[1]));

    this.hasFinancialStrategyFD.set(this.surveyAnswers[1]?.['Policies']?.['Question15']?.['Question15-0'] || null);
    this.financialStrategyClarificationFD.set(this.surveyAnswers[1]?.['Policies']?.['Question15']?.['Question15-1'] || null);

    this.hasNationalPolicyFD.set(this.surveyAnswers[1]?.['Policies']?.['Question14']?.['Question14-0']);
    this.policyMandatoryFD.set(this.surveyAnswers[1]?.['Policies']?.['Question14']?.['Question14-1-0']?.['Question14-1']);
    this.nationalPolicyClarificationFD.set(this.surveyAnswers[1]?.['Policies']?.['Question14']?.['Question14-3']);

    this.hasMonitoringFD.set(this.surveyAnswers[1]?.['Practices']?.['Question62']?.['Question62-0']);
    this.monitoringClarificationFD.set(this.surveyAnswers[1]?.['Practices']?.['Question62']?.['Question62-1']);

  }


  createStackedColumns() {

    const rpo: string[] = [  // research performing organisations
      this.surveyAnswers[0]?.['General']?.['Question2']?.['Question2-0'],
      this.surveyAnswers[1]?.['General']?.['Question2']?.['Question2-0']
    ];
    const rpoWithPolicy: string[] = [ // research performing organisations with policy on FAIR data
      this.surveyAnswers[0]?.['Policies']?.['Question16']?.['Question16-0'],
      this.surveyAnswers[1]?.['Policies']?.['Question16']?.['Question16-0']
    ];

    if (this.exploreService.isNumeric(rpoWithPolicy[0]) && this.exploreService.isNumeric(rpoWithPolicy[1])) {
      this.stackedColumnSeries1()[0].data.push(+rpoWithPolicy[0], +rpoWithPolicy[1]);

      if (this.exploreService.isNumeric(rpo[0]) && this.exploreService.isNumeric(rpo[1])) {
        this.stackedColumnSeries1()[1].data.push(+rpo[0] - +rpoWithPolicy[0], +rpo[1] - +rpoWithPolicy[1]);
      }
    }


    const rfo: string[] = [  // research funding organisations
      this.surveyAnswers[0]?.['General']?.['Question3']?.['Question3-0'],
      this.surveyAnswers[1]?.['General']?.['Question3']?.['Question3-0']
    ];
    const rfoWithPolicy: string[] = [ // research funding organisations with policy on FAIR data
      this.surveyAnswers[0]?.['Policies']?.['Question17']?.['Question17-0'],
      this.surveyAnswers[1]?.['Policies']?.['Question17']?.['Question17-0']
    ];

    if (this.exploreService.isNumeric(rfoWithPolicy[0]) && this.exploreService.isNumeric(rfoWithPolicy[1])) {
      this.stackedColumnSeries2()[0].data.push(+rfoWithPolicy[0], +rfoWithPolicy[1]);

      if (this.exploreService.isNumeric(rfo[0]) && this.exploreService.isNumeric(rfo[1])) {
        this.stackedColumnSeries2()[1].data.push(+rfo[0] - +rfoWithPolicy[0], +rfo[1] - +rfoWithPolicy[1]);
      }
    }

    this.stackedColumnSeries1.set([...this.stackedColumnSeries1()]);
    this.stackedColumnSeries2.set([...this.stackedColumnSeries2()]);

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
