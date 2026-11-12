import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { DataShareService } from "../services/data-share.service";
import { CountryPageIndicatorsService } from "../services/country-page-indicators.service";
import {
  ReadMoreComponent, ReadMoreTextComponent
} from "src/survey-tool/catalogue-ui/shared/reusable-components/read-more.component";
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
    selector: 'app-data-management',
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
    templateUrl: './data-management.component.html'
})
export class DataManagementComponent implements OnInit {
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

  rfoDataManagementPercentage = signal<(number | null)[]>([null, null]);
  rfoDataManagementPercentageDiff = signal<number | null>(null);
  rpoDataManagementPercentage = signal<(number | null)[]>([null, null]);
  rpoDataManagementPercentageDiff = signal<number | null>(null);
  financialInvestmentDM = signal<(string | null)[]>([null, null]);
  financialInvestmentDMPercentageDiff = signal<number | null>(null);
  nationalPolicyResponse = signal<string | null>(null);
  financialStrategyResponse = signal<string | null>(null);
  nationalPolicyClarification = signal<string | null>(null);
  financialStrategyClarification = signal<string | null>(null);
  monitoringResponse = signal<string | null>(null);
  monitoringClarification = signal<string | null>(null);
  policyMandatory = signal<string | null>(null);

  stackedColumnSeries1 = signal([
    {
      type: 'column',
      name: 'RPOs with Policy on Data Management',
      data: [],
      // color: colors[0]
    }, {
      type: 'column',
      name: 'RPOs without Policy on Data Management',
      data: [],
      // color: colors[7]
    }
  ] as Highcharts.SeriesColumnOptions[]);
  stackedColumnSeries2 = signal([
    {
      type: 'column',
      name: 'RFOs with Policy on Data Management',
      data: [],
      // color: colors[1]
    }, {
      type: 'column',
      name: 'RFOs without Policy on Data Management',
      data: [],
      // color: colors[8]
    }
  ] as Highcharts.SeriesColumnOptions[]);
  stackedColumnCategories = signal<string[]>([]);
  xAxisTitle = 'Year'
  yAxisTitle = 'Percentage of Policies on Data Management'
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

  initCardValues() {
    setAt(this.rfoDataManagementPercentage, 1, this.dataShareService.calculatePercentage(this.surveyAnswers[1]?.['Policies']?.['Question13']?.['Question13-0'], this.surveyAnswers[1]?.['General']?.['Question3']?.['Question3-0']));
    setAt(this.rfoDataManagementPercentage, 0, this.dataShareService.calculatePercentage(this.surveyAnswers[0]?.['Policies']?.['Question13']?.['Question13-0'], this.surveyAnswers[0]?.['General']?.['Question3']?.['Question3-0']));
    this.rfoDataManagementPercentageDiff.set(this.dataShareService.calculateDiff(this.rfoDataManagementPercentage()[0], this.rfoDataManagementPercentage()[1]));

    setAt(this.rpoDataManagementPercentage, 1, this.dataShareService.calculatePercentage(this.surveyAnswers[1]?.['Policies']?.['Question12']?.['Question12-0'], this.surveyAnswers[1]?.['General']?.['Question2']?.['Question2-0']));
    setAt(this.rpoDataManagementPercentage, 0, this.dataShareService.calculatePercentage(this.surveyAnswers[0]?.['Policies']?.['Question12']?.['Question12-0'], this.surveyAnswers[0]?.['General']?.['Question2']?.['Question2-0']));
    this.rpoDataManagementPercentageDiff.set(this.dataShareService.calculateDiff(this.rpoDataManagementPercentage()[0], this.rpoDataManagementPercentage()[1]));

    setAt(this.financialInvestmentDM, 1, this.surveyAnswers[1]?.['Practices']?.['Question60']?.['Question60-0']);
    setAt(this.financialInvestmentDM, 0, this.surveyAnswers[0]?.['Practices']?.['Question60']?.['Question60-0']);
    this.financialInvestmentDMPercentageDiff.set(this.dataShareService.calculateDiffAsPercentage(this.financialInvestmentDM()[0], this.financialInvestmentDM()[1]));


    this.nationalPolicyResponse.set(this.surveyAnswers[1]?.['Policies']?.['Question10']?.['Question10-0'] || null);
    this.policyMandatory.set(this.surveyAnswers[1]?.['Policies']?.['Question5']?.['Question6-5-0']?.['Question5-1'] || null);
    this.nationalPolicyClarification.set(this.surveyAnswers[1]?.['Policies']?.['Question10']?.['Question10-3'] || null);

    this.financialStrategyResponse.set(this.surveyAnswers[1]?.['Policies']?.['Question11']?.['Question11-0'] || null);
    this.financialStrategyClarification.set(this.surveyAnswers[1]?.['Policies']?.['Question11']?.['Question11-1'] || null);

    this.monitoringResponse.set(this.surveyAnswers[1]?.['Practices']?.['Question58']?.['Question58-0'] || null);
    this.monitoringClarification.set(this.surveyAnswers[1]?.['Practices']?.['Question58']?.['Question58-1'] || null);

  }

  createStackedColumns() {

    const rpo: string[] = [  // research performing organisations
      this.surveyAnswers[0]?.['General']?.['Question2']?.['Question2-0'],
      this.surveyAnswers[1]?.['General']?.['Question2']?.['Question2-0']
    ];
    const rpoWithPolicy: string[] = [ // research performing organisations in your country with a policy on data management
      this.surveyAnswers[0]?.['Policies']?.['Question12']?.['Question12-0'],
      this.surveyAnswers[1]?.['Policies']?.['Question12']?.['Question12-0']
    ];

    if (this.exploreService.isNumeric(rpoWithPolicy[0]) && this.exploreService.isNumeric(rpoWithPolicy[1])) {
      this.stackedColumnSeries1()[0].data.push(+rpoWithPolicy[0], +rpoWithPolicy[1]);

      if (this.exploreService.isNumeric(rpo[0]) && this.exploreService.isNumeric(rpo[1])) {
        this.stackedColumnSeries1()[1].data.push(+rpo[0] - +rpoWithPolicy[0], +rpo[1] - +rpoWithPolicy[1])
      }
    }


    const rfo: string[] = [  // research funding organisations
      this.surveyAnswers[0]?.['General']?.['Question3']?.['Question3-0'],
      this.surveyAnswers[1]?.['General']?.['Question3']?.['Question3-0']
    ];
    const rfoWithPolicy: string[] = [ // research funding organisations in your country have a policy on data management
      this.surveyAnswers[0]?.['Policies']?.['Question13']?.['Question13-0'],
      this.surveyAnswers[1]?.['Policies']?.['Question13']?.['Question13-0']
    ];

    if (this.exploreService.isNumeric(rfoWithPolicy[0]) && this.exploreService.isNumeric(rfoWithPolicy[1])) {
      this.stackedColumnSeries2()[0].data.push(+rfoWithPolicy[0], +rfoWithPolicy[1]);

      if (this.exploreService.isNumeric(rfo[0]) && this.exploreService.isNumeric(rfo[1])) {
        this.stackedColumnSeries2()[1].data.push(+rfo[0] - +rpoWithPolicy[0], +rfo[1] - +rfoWithPolicy[1])
      }
    }

    this.stackedColumnSeries1.set([...this.stackedColumnSeries1()]);
    this.stackedColumnSeries2.set([...this.stackedColumnSeries2()]);
  }

  private readonly indicatorsService = inject(CountryPageIndicatorsService);

  /** Left card block renders only if at least one of its cards will be visible (see service). */
  hasAnyLeftCardVisible(): boolean {
    return this.indicatorsService.anyCardVisible([
      { id: '40', hasData: this.rfoDataManagementPercentage()[1] != null },
      { id: '41', hasData: this.rpoDataManagementPercentage()[1] != null },
      { id: '42', hasData: this.financialInvestmentDM()[1]       != null },
    ]);
  }

  hasAnyLeftCardData() {
    return this.dataShareService.hasAnyValue([
      this.rfoDataManagementPercentage()[1],
      this.rpoDataManagementPercentage()[1],
      this.financialInvestmentDM()[1],
    ]);
  }

  hasSurveyDataManagementData(): boolean {
    const surveyData = this.countrySurveyAnswer()?.['OPEN SCIENCE DIGITAL INFRASTRUCTURE'];
    if (!surveyData) {
      return false;
    }
    const questions = ['Question15'];
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
