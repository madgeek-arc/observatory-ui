import { Component, DestroyRef, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { DataShareService } from "../services/data-share.service";
import { CountryPageIndicatorsService } from "../services/country-page-indicators.service";
import {
  ReadMoreComponent, ReadMoreTextComponent
} from 'src/survey-tool/catalogue-ui/shared/reusable-components/read-more.component';
import {
  SidebarMobileToggleComponent
} from "src/survey-tool/app/shared/dashboard-side-menu/mobile-toggle/sidebar-mobile-toggle.component";
import { PageContentComponent } from "src/survey-tool/app/shared/page-content/page-content.component";
import { InfoCardComponent } from "src/app/shared/reusable-components/info-card/info-card.component";
import { PdfExportService } from "../../services/pdf-export.service";
import { ExploreService } from "../../explore/explore.service";

import { CardConfigComponent } from "../card-config/card-config.component";
import { SectionHiddenNoticeComponent } from "../section-hidden-notice/section-hidden-notice.component";
import { setAt } from "src/app/shared/utils/set-at";

@Component({
    selector: 'app-open-science-training',
    templateUrl: './open-science-training.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        NgOptimizedImage,
        ReadMoreComponent, ReadMoreTextComponent,
        SidebarMobileToggleComponent,
        PageContentComponent,
        InfoCardComponent,
        CardConfigComponent,
        SectionHiddenNoticeComponent
    ]
})
export class OpenScienceTrainingComponent  implements OnInit {
  private destroyRef = inject(DestroyRef);
  private exploreService = inject(ExploreService);

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

  rfoTrainingPercentage = signal<(number | null)[]>([null, null]);
  rfoTrainingPercentageDiff = signal<number | null>(null);
  rpoTrainingPercentage = signal<(number | null)[]>([null, null]);
  rpoTrainingPercentageDiff = signal<number | null>(null);
  trainingFinancialInvestment = signal<(string | null)[]>([null, null]);
  trainingFinancialInvestmentPercentageDiff = signal<number | null>(null);
  hasNationalPolicy = signal<string | null>(null);
  nationalPolicyClarification: string | null = null;
  policyMandatory = signal<string | null>(null);
  nationalPolicyClarificationTraining: string | null = null;
  hasFinancialStrategy = signal<string | null>(null);
  financialStrategyClarification = signal<string | null>(null);
  hasMonitoring = signal<string | null>(null);
  monitoringClarification = signal<string | null>(null);


  private dataShareService = inject(DataShareService);
  private pdfService = inject(PdfExportService);

    ngOnInit() {
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
    setAt(this.rfoTrainingPercentage, 1, this.dataShareService.calculatePercentage(this.surveyAnswers[1]?.['Policies']?.['Question45']?.['Question45-0'], this.surveyAnswers[1]?.['General']?.['Question3']?.['Question3-0']));
    setAt(this.rfoTrainingPercentage, 0, this.dataShareService.calculatePercentage(this.surveyAnswers[0]?.['Policies']?.['Question45']?.['Question45-0'], this.surveyAnswers[0]?.['General']?.['Question3']?.['Question3-0']));
    this.rfoTrainingPercentageDiff.set(this.dataShareService.calculateDiff(this.rfoTrainingPercentage()[0], this.rfoTrainingPercentage()[1]));

    setAt(this.rpoTrainingPercentage, 1, this.dataShareService.calculatePercentage(this.surveyAnswers[1]?.['Policies']?.['Question44']?.['Question44-0'], this.surveyAnswers[1]?.['General']?.['Question2']?.['Question2-0']));
    setAt(this.rpoTrainingPercentage, 0, this.dataShareService.calculatePercentage(this.surveyAnswers[0]?.['Policies']?.['Question44']?.['Question44-0'], this.surveyAnswers[0]?.['General']?.['Question2']?.['Question2-0']));
    this.rpoTrainingPercentageDiff.set(this.dataShareService.calculateDiff(this.rpoTrainingPercentage()[0], this.rpoTrainingPercentage()[1]));

    setAt(this.trainingFinancialInvestment, 1, this.surveyAnswers[1]?.['Practices']?.['Question92']?.['Question92-0']);
    setAt(this.trainingFinancialInvestment, 0, this.surveyAnswers[0]?.['Practices']?.['Question92']?.['Question92-0']);
    this.trainingFinancialInvestmentPercentageDiff.set(this.dataShareService.calculateDiffAsPercentage(this.trainingFinancialInvestment()[0], this.trainingFinancialInvestment()[1]));

    this.hasNationalPolicy.set(this.surveyAnswers[1]?.['Policies']?.['Question42']?.['Question42-0']);
    this.nationalPolicyClarification = this.surveyAnswers[1]?.['Policies']?.['Question42']?.['Question42-3'];
    this.policyMandatory.set(this.surveyAnswers[1]?.['Policies']?.['Question42']?.['Question42-1-0']?.['Question42-1']);

    this.hasFinancialStrategy.set(this.surveyAnswers[1]?.['Policies']?.['Question43']?.['Question43-0']);
    this.financialStrategyClarification.set(this.surveyAnswers[1]?.['Policies']?.['Question43']?.['Question43-3']);

    this.hasMonitoring.set(this.surveyAnswers[1]?.['Practices']?.['Question90']?.['Question90-0']);
    this.monitoringClarification.set(this.surveyAnswers[1]?.['Practices']?.['Question90']?.['Question90-1']);


  }

  private readonly indicatorsService = inject(CountryPageIndicatorsService);

  /** Left card block renders only if at least one of its cards will be visible (see service). */
  hasAnyLeftCardVisible(): boolean {
    return this.indicatorsService.anyCardVisible([
      { id: '56', hasData: this.rfoTrainingPercentage()[1]       != null },
      { id: '57', hasData: this.trainingFinancialInvestment()[1] != null },
      { id: '58', hasData: this.rpoTrainingPercentage()[1]       != null },
    ]);
  }

  hasAnyLeftCardData() {
    return this.dataShareService.hasAnyValue([
      this.rfoTrainingPercentage()[1],
      this.trainingFinancialInvestment()[1],
      this.rpoTrainingPercentage()[1],
    ]);
  }

  hasSurveyTrainingData(): boolean {
    const surveyData = this?.countrySurveyAnswer()?.['OPEN SCIENCE DIGITAL SKILLS'];
    if (!surveyData) {
      return false;
    }

    const questions = [
      'Question24',
      'Question25',
      'Question26',
      'Question27',
      'Question28',
      'Question29',
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
