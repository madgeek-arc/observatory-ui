import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { DataShareService } from "../services/data-share.service";
import {
  CatalogueUiReusableComponentsModule
} from 'src/survey-tool/catalogue-ui/shared/reusable-components/catalogue-ui-reusable-components.module';
import { SidebarMobileToggleComponent } from "../../../../survey-tool/app/shared/dashboard-side-menu/mobile-toggle/sidebar-mobile-toggle.component";
import { PageContentComponent } from "../../../../survey-tool/app/shared/page-content/page-content.component";
import { InfoCardComponent } from "src/app/shared/reusable-components/info-card/info-card.component";
import { PdfExportService } from "../../services/pdf-export.service";


@Component({
    selector: 'app-open-repositories',
    imports: [
        CommonModule,
        NgOptimizedImage,
        CatalogueUiReusableComponentsModule,
        SidebarMobileToggleComponent,
        PageContentComponent,
        InfoCardComponent
    ],
    templateUrl: './open-repositories.component.html'
})

export class OpenRepositoriesComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  protected readonly Math = Math;
  exportActive = false;

  countryCode?: string;
  countryName?: string;
  surveyAnswers: Object[] = [];
  countrySurveyAnswer?: Object;
  countrySurveyAnswerLastUpdate: string | null = null;


  rfoOpenRepositoriesPercentage: (number | null)[] = [null, null];
  rfoOpenRepositoriesPercentageDiff: number | null = null;
  rpoOpenRepositoriesPercentage: (number | null)[] = [null, null];
  rpoOpenRepositoriesPercentageDiff: number | null = null;
  hasNationalPolicyOR: string | null = null;
  nationalPolicyClarificationOR: string | null = null;
  hasFinancialStrategyOR: string | null = null;
  financialStrategyClarificationOR: string | null = null;
  hasMonitoringOR: string | null = null;
  monitoringClarificationOR: string | null = null;
  policyMandatoryOR: string | null = null;
  OpenRepositoriesPercentage: (number | null)[] = [null, null];
  OpenRepositoriesPercentageDiff: number | null = null;
  financialInvestment: (string | null)[] = [null, null];
  financialInvestmentPercentageDiff: number | null = null;

  constructor(private dataShareService: DataShareService, private pdfService: PdfExportService) {}

  ngOnInit(): void {
    this.dataShareService.surveyAnswers.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (answers) => {
        this.surveyAnswers = answers;
        this.initCardValues();
      }
    });

    this.dataShareService.countryName.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (name) => {
        this.countryName = name;
      }
    });

    this.dataShareService.countryCode.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (code) => {
        this.countryCode = code;
      }
    });


    this.dataShareService.countrySurveyAnswer.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (answer) => {
        this.countrySurveyAnswer = answer;
      }
    });

    this.dataShareService.countrySurveyAnswerMetaData.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (metadata) => {
        this.countrySurveyAnswerLastUpdate = metadata?.lastUpdate ?? null;
      }
    });
  }

 initCardValues() {
  this.rfoOpenRepositoriesPercentage[1] = this.dataShareService.calculatePercentage(this.surveyAnswers[1]?.['Policies']?.['Question33']?.['Question33-0'], this.surveyAnswers[1]?.['General']?.['Question3']?.['Question3-0']);
  this.rfoOpenRepositoriesPercentage[0] = this.dataShareService.calculatePercentage(this.surveyAnswers[0]?.['Policies']?.['Question33']?.['Question33-0'], this.surveyAnswers[0]?.['General']?.['Question3']?.['Question3-0']);
  this.rfoOpenRepositoriesPercentageDiff = this.dataShareService.calculateDiff(this.rfoOpenRepositoriesPercentage[0], this.rfoOpenRepositoriesPercentage[1]);

  this.financialInvestment[1] = this.surveyAnswers[1]?.['Practices']?.['Question80']?.['Question80-0']?.trim() || null;
  this.financialInvestment[0] = this.surveyAnswers[0]?.['Practices']?.['Question80']?.['Question80-0']?.trim() || null;
  this.financialInvestment = this.financialInvestment.map(value => value === "" ? null : value);
  this.financialInvestmentPercentageDiff = this.dataShareService.calculateDiffAsPercentage(this.financialInvestment[0], this.financialInvestment[1]);

  this.rpoOpenRepositoriesPercentage[1] = this.dataShareService.calculatePercentage(this.surveyAnswers[1]?.['Policies']?.['Question32']?.['Question32-0'], this.surveyAnswers[1]?.['General']?.['Question2']?.['Question2-0']);
  this.rpoOpenRepositoriesPercentage[0] = this.dataShareService.calculatePercentage(this.surveyAnswers[0]?.['Policies']?.['Question32']?.['Question32-0'], this.surveyAnswers[0]?.['General']?.['Question2']?.['Question2-0']);
  this.rpoOpenRepositoriesPercentageDiff = this.dataShareService.calculateDiff(this.rpoOpenRepositoriesPercentage[0], this.rpoOpenRepositoriesPercentage[1]);

  this.hasNationalPolicyOR = this.surveyAnswers[1]?.['Policies']?.['Question30']?.['Question30-0'] || null;
  this.policyMandatoryOR = this.surveyAnswers[1]?.['Policies']?.['Question30']?.['Question30-1-0']?.['Question30-1'] || null;
  this.nationalPolicyClarificationOR = this.surveyAnswers[1]?.['Policies']?.['Question30']?.['Question30-3'] || null;

  this.hasFinancialStrategyOR = this.surveyAnswers[1]?.['Policies']?.['Question31']?.['Question31-0'] || null;
  this.financialStrategyClarificationOR = this.surveyAnswers[1]?.['Policies']?.['Question31']?.['Question31-3'] || null;

  this.hasMonitoringOR = this.surveyAnswers[1]?.['Practices']?.['Question78']?.['Question78-0'] || null;
  this.monitoringClarificationOR = this.surveyAnswers[1]?.['Practices']?.['Question78']?.['Question78-1'] || null;

 }

  hasAnyLeftCardData() {
    return this.dataShareService.hasAnyValue([
      this.rfoOpenRepositoriesPercentage[1],
      this.financialInvestment[1],
      this.rpoOpenRepositoriesPercentage[1],
    ]);
  }

  hasSurveyRepositoriesData(): boolean {
    const surveyData = this?.countrySurveyAnswer?.['OPEN SCIENCE DIGITAL INFRASTRUCTURE'];
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
    this.exportActive = true

    // Χρόνος για να εφαρμοστούν τα styles
    // setTimeout(() => {
      this.pdfService.export(contents, filename).then(() => {
        // this.restoreAnimations(modifiedElements, contents);
        this.exportActive = false;
      }).catch((error) => {
        // this.restoreAnimations(modifiedElements, contents);
        this.exportActive = false;
        console.error('Error during PDF generation:', error);
      });
    // }, 0);
  }

}
