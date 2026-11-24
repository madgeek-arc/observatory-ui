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
  selector: 'app-open-software',
  templateUrl: './open-software.component.html',
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

export class OpenSoftwareComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private exploreService = inject(ExploreService);

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

  rfoSoftwarePercentage = signal<(number | null)[]>([null, null]);
  rfoSoftwarePercentageDiff = signal<number | null>(null);
  rpoSoftwarePercentage = signal<(number | null)[]>([null, null]);
  rpoSoftwarePercentageDiff = signal<number | null>(null);
  softwareFinancialInvestment = signal<(string | null)[]>([null, null]);
  softwareFinancialInvestmentPercentageDiff = signal<number | null>(null);
  hasNationalPolicy = signal<string | null>(null);
  nationalPolicyClarification = signal<string | null>(null);
  policyMandatory = signal<string | null>(null);
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
    setAt(this.rfoSoftwarePercentage, 1, this.dataShareService.calculatePercentage(this.surveyAnswers[1]?.['Policies']?.['Question25']?.['Question25-0'], this.surveyAnswers[1]?.['General']?.['Question3']?.['Question3-0']));
    setAt(this.rfoSoftwarePercentage, 0, this.dataShareService.calculatePercentage(this.surveyAnswers[0]?.['Policies']?.['Question25']?.['Question25-0'], this.surveyAnswers[0]?.['General']?.['Question3']?.['Question3-0']));
    this.rfoSoftwarePercentageDiff.set(this.dataShareService.calculateDiff(this.rfoSoftwarePercentage()[0], this.rfoSoftwarePercentage()[1]));

    setAt(this.rpoSoftwarePercentage, 1, this.dataShareService.calculatePercentage(this.surveyAnswers[1]?.['Policies']?.['Question24']?.['Question24-0'], this.surveyAnswers[1]?.['General']?.['Question2']?.['Question2-0']));
    setAt(this.rpoSoftwarePercentage, 0, this.dataShareService.calculatePercentage(this.surveyAnswers[0]?.['Policies']?.['Question24']?.['Question24-0'], this.surveyAnswers[0]?.['General']?.['Question2']?.['Question2-0']));
    this.rpoSoftwarePercentageDiff.set(this.dataShareService.calculateDiff(this.rpoSoftwarePercentage()[0], this.rpoSoftwarePercentage()[1]));


    setAt(this.softwareFinancialInvestment, 1, this.surveyAnswers[1]?.['Practices']?.['Question72']?.['Question72-0']);
    setAt(this.softwareFinancialInvestment, 0, this.surveyAnswers[0]?.['Practices']?.['Question72']?.['Question72-0']);
    this.softwareFinancialInvestmentPercentageDiff.set(this.dataShareService.calculateDiffAsPercentage(this.softwareFinancialInvestment()[0], this.softwareFinancialInvestment()[1]));

    this.hasNationalPolicy.set(this.surveyAnswers[1]?.['Policies']?.['Question22']?.['Question22-0']);
    this.nationalPolicyClarification.set(this.surveyAnswers[1]?.['Policies']?.['Question22']?.['Question22-3']);
    this.policyMandatory.set(this.surveyAnswers[1]?.['Policies']?.['Question22-1-0']?.['Question22-1']);

    this.hasFinancialStrategy.set(this.surveyAnswers[1]?.['Policies']?.['Question23']?.['Question23-0']);
    this.financialStrategyClarification.set(this.surveyAnswers[1]?.['Policies']?.['Question23']?.['Question23-1']);

    this.hasMonitoring.set(this.surveyAnswers[1]?.['Practices']?.['Question70']?.['Question70-0']);
    this.monitoringClarification.set(this.surveyAnswers[1]?.['Practices']?.['Question70']?.['Question70-1']);

  }

  private readonly indicatorsService = inject(CountryPageIndicatorsService);

  /** Left card block renders only if at least one of its cards will be visible (see service). */
  hasAnyLeftCardVisible(): boolean {
    return this.indicatorsService.anyCardVisible([
      { id: '62', hasData: this.rfoSoftwarePercentage()[1]       != null },
      { id: '63', hasData: this.softwareFinancialInvestment()[1] != null },
      { id: '64', hasData: this.rpoSoftwarePercentage()[1]       != null },
    ]);
  }

  hasAnyLeftCardData() {
    return this.dataShareService.hasAnyValue([
      this.rfoSoftwarePercentage()[1],
      this.softwareFinancialInvestment()[1],
      this.rpoSoftwarePercentage()[1],
    ]);
  }

  hasSurveySoftwareData(): boolean {
    const surveyData = this?.countrySurveyAnswer()?.['OPEN SCIENCE DIGITAL INFRASTRUCTURE']?.[';Question19']?.['Question19-1'];
    return !!(surveyData && surveyData.trim() !== '');
  }

  exportToPDF(contents: HTMLElement[], filename?: string) {
    this.exportActive.set(true)

    this.pdfService.export(contents, filename).then(() => {
      // this.restoreAnimations(modifiedElements, contents);
      this.exportActive.set(false);
    }).catch((error) => {
      // this.restoreAnimations(modifiedElements, contents);
      this.exportActive.set(false);
      console.error('Error during PDF generation:', error);
    });
  }

}
