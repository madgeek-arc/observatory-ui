import { CommonModule, NgOptimizedImage } from "@angular/common";
import { Component, DestroyRef, inject, OnInit, ChangeDetectionStrategy, signal } from "@angular/core";
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
    selector: 'app-citizen-science',
    templateUrl: './citizen-science.component.html',
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
export class CitizenScienceComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private exploreService = inject(ExploreService);

  protected readonly Math = Math;
  exportActive = signal(false);

  countryCode?: string;
  /** Code used only for the flag/label (EU for the Global default); data still uses countryCode. */
  flagCode = signal<string>(undefined);
  countryName = signal<string>(undefined);
  surveyAnswers = signal<Object[]>([]);
  countrySurveyAnswer?: Object;
  countrySurveyAnswerLastUpdate = signal<string | null>(null);
  year = signal<string>(undefined);
  lastUpdateDate = signal<string>(undefined);

  citizenScienceProjects:  (string | null)[] = [null, null];
  citizenSciencePercentageDiff: number | null = null;
  financialInvestmentInCS = signal<(string | null)[]>([null, null]);
  financialInvestmentInCsPercentageDiff = signal<number | null>(null);
  hasNationalPolicyCS = signal<string | null>(null);  nationalPolicyClarificationCS = signal<string | null>(null);
  hasFinancialStrategyCS = signal<string | null>(null);
  financialStrategyClarificationCS = signal<string | null>(null);
  hasMonitoringCS = signal<string | null>(null);
  monitoringClarificationCS = signal<string | null>(null);
  policyMandatoryCS = signal<string | null>(null);

  private dataShareService = inject(DataShareService);
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
        this.surveyAnswers.set(answers);
        if (this.surveyAnswers()[1] === null)
          return;

        this.initCardValues();
      }
    });

    this.dataShareService.countrySurveyAnswer.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (answer) => {
        this.countrySurveyAnswer = answer;
      }
    });

    this.dataShareService.countrySurveyAnswerMetaData.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (metadata) => {
        this.countrySurveyAnswerLastUpdate.set(metadata?.lastUpdate ?? null);
      }
    });
  }

  initCardValues() {
    this.citizenScienceProjects[1] = this.surveyAnswers()[1]?.['Practices']?.['Question101']?.['Question101-0']?.['Question101-1-1'];
    this.citizenScienceProjects[0] = this.surveyAnswers()[0]?.['Practices']?.['Question101']?.['Question101-0']?.['Question101-1-1'];
    this.citizenSciencePercentageDiff = this.dataShareService.calculateDiffAsPercentage(this.citizenScienceProjects[0], this.citizenScienceProjects[1]);

    setAt(this.financialInvestmentInCS, 1, this.surveyAnswers()[1]?.['Practices']?.['Question100']?.['Question100-0']);
    setAt(this.financialInvestmentInCS, 0, this.surveyAnswers()[0]?.['Practices']?.['Question100']?.['Question100-0']);
    this.financialInvestmentInCsPercentageDiff.set(this.dataShareService.calculateDiffAsPercentage(this.financialInvestmentInCS()[0], this.financialInvestmentInCS()[1]));

    this.hasNationalPolicyCS.set(this.surveyAnswers()[1]?.['Policies']?.['Question50']?.['Question50-0'] || null);
    this.policyMandatoryCS.set(this.surveyAnswers()[1]?.['Policies']?.['Question50']?.['Question50-1-0']?.['Question50-1'] || null);
    this.nationalPolicyClarificationCS.set(this.surveyAnswers()[1]?.['Policies']?.['Question50']?.['Question50-3'] || null);

    this.hasFinancialStrategyCS.set(this.surveyAnswers()[1]?.['Policies']?.['Question51']?.['Question51-0'] || null);
    this.financialStrategyClarificationCS.set(this.surveyAnswers()[1]?.['Policies']?.['Question51']?.['Question51-1'] || null);

    this.hasMonitoringCS.set(this.surveyAnswers()[1]?.['Practices']?.['Question98']?.['Question98-0'] || null);
    this.monitoringClarificationCS.set(this.surveyAnswers()[1]?.['Practices']?.['Question98']?.['Question98-1'] || null);

    console.log("Final citizenScienceProjects:", this.citizenScienceProjects);
    console.log("Final financialInvestmentInCS:", this.financialInvestmentInCS());

  }

  private readonly indicatorsService = inject(CountryPageIndicatorsService);

  /** Left card block renders only if its card will be visible (see service). */
  hasAnyLeftCardVisible(): boolean {
    return this.indicatorsService.anyCardVisible([
      { id: '47', hasData: this.financialInvestmentInCS()[1] != null },
    ]);
  }

  hasAnyLeftCardData() {
    return this.dataShareService.hasAnyValue([
      this.financialInvestmentInCS()[1],
      this.citizenScienceProjects[1]
    ]);
  }

  hasSurveyCitizenScienceData(): boolean {
    return this.surveyAnswers()[1]?.['Practices']?.['Question95']?.['Question95-0'] === 'Yes' || this.surveyAnswers()[1]?.['Practices']?.['Question95']?.['Question95-3'];
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
