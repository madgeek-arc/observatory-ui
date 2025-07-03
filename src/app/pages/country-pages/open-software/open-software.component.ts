import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { DataShareService } from "../services/data-share.service";
import {
  CatalogueUiReusableComponentsModule
} from 'src/survey-tool/catalogue-ui/shared/reusable-components/catalogue-ui-reusable-components.module';
import { SidebarMobileToggleComponent } from "../../../../survey-tool/app/shared/dashboard-side-menu/mobile-toggle/sidebar-mobile-toggle.component";

@Component({
  selector: 'app-open-software',
  templateUrl: './open-software.component.html',
  standalone: true,
  imports: [
    CommonModule,
    NgOptimizedImage,
    CatalogueUiReusableComponentsModule,
    SidebarMobileToggleComponent
  ],
})

export class OpenSoftwareComponent implements OnInit{
  private destroyRef = inject(DestroyRef);
    protected readonly Math = Math;
    countryCode?: string;
    countryName?: string;
    surveyAnswers: Object[] = [];
    countrySurveyAnswer?: Object;

    rfoSoftwarePercentage: (number | null)[] = [null, null];
    rfoSoftwarePercentageDiff: number | null = null;
    rpoSoftwarePercentage: (number | null)[] = [null, null];
    rpoSoftwarePercentageDiff: number | null = null;
    softwareFinancialInvestment: (string | null)[] = [null, null];
    softwareFinancialInvestmentPercentageDiff: number | null = null;
    hasNationalPolicy: string | null = null;
    nationalPolicyClarification: string | null = null;
    policyMandatory: string | null = null;
    nationalPolicyClarificationSoftware: string | null = null;
    hasFinancialStrategy: string | null = null;
    financialStrategyClarification: string | null = null;
    hasMonitoring: string | null = null;
    monitoringClarification: string | null = null;


    constructor(private dataShareService: DataShareService) {}

    ngOnInit() {
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
    }

  initCardValues() {
    this.rfoSoftwarePercentage[1] = this.dataShareService.calculatePercentage(this.surveyAnswers[1]?.['Policies']?.['Question25']?.['Question25-0'], this.surveyAnswers[1]?.['General']?.['Question3']?.['Question3-0']);
    this.rfoSoftwarePercentage[0] = this.dataShareService.calculatePercentage(this.surveyAnswers[0]?.['Policies']?.['Question25']?.['Question25-0'], this.surveyAnswers[0]?.['General']?.['Question3']?.['Question3-0']);
    this.rfoSoftwarePercentageDiff = this.dataShareService.calculateDiff(this.rfoSoftwarePercentage[0], this.rfoSoftwarePercentage[1]);

    this.rpoSoftwarePercentage[1] = this.dataShareService.calculatePercentage(this.surveyAnswers[1]?.['Policies']?.['Question24']?.['Question24-0'], this.surveyAnswers[1]?.['General']?.['Question2']?.['Question2-0']);
    this.rpoSoftwarePercentage[0] = this.dataShareService.calculatePercentage(this.surveyAnswers[0]?.['Policies']?.['Question24']?.['Question24-0'], this.surveyAnswers[0]?.['General']?.['Question2']?.['Question2-0']);
    this.rpoSoftwarePercentageDiff = this.dataShareService.calculateDiff(this.rpoSoftwarePercentage[0], this.rpoSoftwarePercentage[1]);

    this.softwareFinancialInvestment[1] = this.surveyAnswers[1]?.['Practices']?.['Question72']?.['Question72-0'];
    this.softwareFinancialInvestment[0] = this.surveyAnswers[0]?.['Practices']?.['Question72']?.['Question72-0'];
    this.softwareFinancialInvestmentPercentageDiff = this.dataShareService.calculateDiffAsPercentage(this.softwareFinancialInvestment[0], this.softwareFinancialInvestment[1]);

    this.hasNationalPolicy = this.surveyAnswers[1]?.['Policies']?.['Question22']?.['Question22-0'];
    this.nationalPolicyClarification = this.surveyAnswers[1]?.['Policies']?.['Question22']?.['Question22-3'];
    this.policyMandatory = this.surveyAnswers[1]?.['Policies']?.['Policies22-1-0']?.['Question22-1'];

    this.hasFinancialStrategy = this.surveyAnswers[1]?.['Policies']?.['Question23']?.['Question23-0'];
    this.financialStrategyClarification = this.surveyAnswers[1]?.['Policies']?.['Question23']?.['Question23-1'];

    this.hasMonitoring = this.surveyAnswers[1]?.['Practices']?.['Question70']?.['Question70-0'];
    this.monitoringClarification = this.surveyAnswers[1]?.['Practices']?.['Question70']?.['Question70-1'];

  }

  hasAnyLeftCardData() {
    return this.dataShareService.hasAnyValue([
      this.rfoSoftwarePercentage[1],
      this.softwareFinancialInvestment[1],
      this.rpoSoftwarePercentage[1],
    ]);
  }

  hasSurveySoftwareData(): boolean {
    const surveyData = this?.countrySurveyAnswer?.['OPEN SCIENCE DIGITAL INFRASTRUCTURE']?.[';Question19']?.['Question19-1'];
    return !!(surveyData && surveyData.trim() !== '');
  }

}
