import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { DataShareService } from "../services/data-share.service";
import { CountryPageIndicatorsService } from "../services/country-page-indicators.service";
import {
  ReadMoreComponent, ReadMoreTextComponent
} from 'src/survey-tool/catalogue-ui/shared/reusable-components/read-more.component';
import { SidebarMobileToggleComponent } from "src/survey-tool/app/shared/dashboard-side-menu/mobile-toggle/sidebar-mobile-toggle.component";
import { PageContentComponent } from "src/survey-tool/app/shared/page-content/page-content.component";
import { InfoCardComponent } from "src/app/shared/reusable-components/info-card/info-card.component";
import { PdfExportService } from "../../services/pdf-export.service";
import { ExploreService } from "../../explore/explore.service";


import { CardConfigComponent } from "../card-config/card-config.component";
import { SectionHiddenNoticeComponent } from "../section-hidden-notice/section-hidden-notice.component";
import { setAt } from "src/app/shared/utils/set-at";

@Component({
    selector: 'app-open-repositories',
    imports: [
        CommonModule,
        NgOptimizedImage,
        ReadMoreComponent, ReadMoreTextComponent,
        SidebarMobileToggleComponent,
        PageContentComponent,
        InfoCardComponent,
        CardConfigComponent,
        SectionHiddenNoticeComponent
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './open-repositories.component.html'
})

export class OpenRepositoriesComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private exploreService = inject(ExploreService)

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


  rfoOpenRepositoriesPercentage = signal<(number | null)[]>([null, null]);
  rfoOpenRepositoriesPercentageDiff = signal<number | null>(null);
  rpoOpenRepositoriesPercentage = signal<(number | null)[]>([null, null]);
  rpoOpenRepositoriesPercentageDiff = signal<number | null>(null);
  hasNationalPolicyOR = signal<string | null>(null);
  nationalPolicyClarificationOR = signal<string | null>(null);
  hasFinancialStrategyOR = signal<string | null>(null);
  financialStrategyClarificationOR = signal<string | null>(null);
  hasMonitoringOR = signal<string | null>(null);
  monitoringClarificationOR = signal<string | null>(null);
  policyMandatoryOR = signal<string | null>(null);
  OpenRepositoriesPercentage: (number | null)[] = [null, null];
  OpenRepositoriesPercentageDiff: number | null = null;
  financialInvestment = signal<(string | null)[]>([null, null]);
  financialInvestmentPercentageDiff = signal<number | null>(null);

  private dataShareService = inject(DataShareService);
  private pdfService = inject(PdfExportService);

  ngOnInit(): void {
    this.exploreService._lastUpdateDate.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => this.lastUpdateDate.set(value)
    });

    this.dataShareService.surveyAnswers.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (answers) => {
        this.surveyAnswers = answers;
        this.initCardValues();
      }
    });

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

    this.dataShareService.year.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (year) => {
        this.year.set(year);
      }
    })

    this.dataShareService.countryCode.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (code) => {
        this.countryCode = code;
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
  setAt(this.rfoOpenRepositoriesPercentage, 1, this.dataShareService.calculatePercentage(this.surveyAnswers[1]?.['Policies']?.['Question33']?.['Question33-0'], this.surveyAnswers[1]?.['General']?.['Question3']?.['Question3-0']));
  setAt(this.rfoOpenRepositoriesPercentage, 0, this.dataShareService.calculatePercentage(this.surveyAnswers[0]?.['Policies']?.['Question33']?.['Question33-0'], this.surveyAnswers[0]?.['General']?.['Question3']?.['Question3-0']));
  this.rfoOpenRepositoriesPercentageDiff.set(this.dataShareService.calculateDiff(this.rfoOpenRepositoriesPercentage()[0], this.rfoOpenRepositoriesPercentage()[1]));

  setAt(this.financialInvestment, 1, this.surveyAnswers[1]?.['Practices']?.['Question80']?.['Question80-0']?.trim() || null);
  setAt(this.financialInvestment, 0, this.surveyAnswers[0]?.['Practices']?.['Question80']?.['Question80-0']?.trim() || null);
  this.financialInvestment.set(this.financialInvestment().map(value => value === "" ? null : value));
  this.financialInvestmentPercentageDiff.set(this.dataShareService.calculateDiffAsPercentage(this.financialInvestment()[0], this.financialInvestment()[1]));

  setAt(this.rpoOpenRepositoriesPercentage, 1, this.dataShareService.calculatePercentage(this.surveyAnswers[1]?.['Policies']?.['Question32']?.['Question32-0'], this.surveyAnswers[1]?.['General']?.['Question2']?.['Question2-0']));
  setAt(this.rpoOpenRepositoriesPercentage, 0, this.dataShareService.calculatePercentage(this.surveyAnswers[0]?.['Policies']?.['Question32']?.['Question32-0'], this.surveyAnswers[0]?.['General']?.['Question2']?.['Question2-0']));
  this.rpoOpenRepositoriesPercentageDiff.set(this.dataShareService.calculateDiff(this.rpoOpenRepositoriesPercentage()[0], this.rpoOpenRepositoriesPercentage()[1]));

  this.hasNationalPolicyOR.set(this.surveyAnswers[1]?.['Policies']?.['Question30']?.['Question30-0'] || null);
  this.policyMandatoryOR.set(this.surveyAnswers[1]?.['Policies']?.['Question30']?.['Question30-1-0']?.['Question30-1'] || null);
  this.nationalPolicyClarificationOR.set(this.surveyAnswers[1]?.['Policies']?.['Question30']?.['Question30-3'] || null);

  this.hasFinancialStrategyOR.set(this.surveyAnswers[1]?.['Policies']?.['Question31']?.['Question31-0'] || null);
  this.financialStrategyClarificationOR.set(this.surveyAnswers[1]?.['Policies']?.['Question31']?.['Question31-3'] || null);

  this.hasMonitoringOR.set(this.surveyAnswers[1]?.['Practices']?.['Question78']?.['Question78-0'] || null);
  this.monitoringClarificationOR.set(this.surveyAnswers[1]?.['Practices']?.['Question78']?.['Question78-1'] || null);

 }

  private readonly indicatorsService = inject(CountryPageIndicatorsService);

  /** Left card block renders only if at least one of its cards will be visible (see service). */
  hasAnyLeftCardVisible(): boolean {
    return this.indicatorsService.anyCardVisible([
      { id: '50', hasData: this.OpenRepositoriesPercentage[1]    != null },
      { id: '51', hasData: this.rfoOpenRepositoriesPercentage()[1] != null },
      { id: '52', hasData: this.financialInvestment()[1]           != null },
      { id: '53', hasData: this.rpoOpenRepositoriesPercentage()[1] != null },
    ]);
  }

  hasAnyLeftCardData() {
    return this.dataShareService.hasAnyValue([
      this.rfoOpenRepositoriesPercentage()[1],
      this.financialInvestment()[1],
      this.rpoOpenRepositoriesPercentage()[1],
    ]);
  }

  hasSurveyRepositoriesData(): boolean {
    const surveyData = this?.countrySurveyAnswer()?.['OPEN SCIENCE DIGITAL INFRASTRUCTURE'];
    if (!surveyData) {
      return false;
    }

    const questions = [
      'Question16',
      'Question17',
      'Question18',
      'Question19',
      'Question20',
    ];
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
