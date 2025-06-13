import { CommonModule, LowerCasePipe, NgOptimizedImage } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { DataShareService } from "../services/data-share.service";
import {
  CatalogueUiReusableComponentsModule
} from "src/survey-tool/catalogue-ui/shared/reusable-components/catalogue-ui-reusable-components.module";
import { DataCheckService } from '../services/data-check.service';


@Component({
  selector: 'app-data-management',
  standalone: true,
  imports: [
    CommonModule,
    NgOptimizedImage,
    CatalogueUiReusableComponentsModule
  ],
  templateUrl: './data-management.component.html',
})
export class DataManagementComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
   protected readonly Math = Math;

  countryCode?: string;
  countryName?: string;
  surveyAnswers: Object[] = [];

  rfoDataManagementPercentage: (number | null)[] = [null, null];
  rfoDataManagementPercentageDiff: number | null = null;
  rpoDataManagementPercentage: (number | null)[] = [null, null];
  rpoDataManagementPercentageDiff: number | null = null;
  financialInvestmentDM: (string | null)[] = [null, null];
  financialInvestmentDMPercentageDiff: number | null = null;
  nationalPolicyResponse: string | null = null;
  financialStrategyResponse: string | null = null;
  nationalPolicyClarification: string | null = null;
  financialStrategyClarification: string | null = null;
  monitoringResponse: string | null = null;
  monitoringClarification: string | null = null;
  policyMandatory: string | null = null;



  constructor(private dataShareService: DataShareService, private dataCheckService: DataCheckService) {}

  ngOnInit() {
    this.dataShareService.countryCode.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (code) => {
        this.countryCode = code;
      }
    });

    this.dataShareService.countryName.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (name) => {
        this.countryName = name;
      }
    });

    this.dataShareService.surveyAnswers.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (answers) => {
        this.surveyAnswers = answers;

        if (this.surveyAnswers[1] === null)
          return;

        this.initCardValues();
      }
    });

    // this.dataShareService.countrySurveyAnswer.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
    // next: (answer) => {
    //     this.countrySurveyAnswer = answer;
    //   }
    // });
  }

  hasAnyLeftCardData() {
    return this.dataCheckService.hasAnyValue([
      this.rfoDataManagementPercentage[1],
      this.rpoDataManagementPercentage[0],
      this.financialInvestmentDM[1],
    ])
  }



  initCardValues() {
    this.rfoDataManagementPercentage[1] = this.dataShareService.calculatePercentage(this.surveyAnswers[1]?.['Policies']?.['Question13']?.['Question13-0'], this.surveyAnswers[1]?.['General']?.['Question3']?.['Question3-0']);
    this.rfoDataManagementPercentage[0] = this.dataShareService.calculatePercentage(this.surveyAnswers[0]?.['Policies']?.['Question13']?.['Question13-0'], this.surveyAnswers[0]?.['General']?.['Question3']?.['Question3-0']);
    this.rfoDataManagementPercentageDiff = this.dataShareService.calculateDiff(this.rfoDataManagementPercentage[0], this.rfoDataManagementPercentage[1]);

    this.rpoDataManagementPercentage[1] = this.dataShareService.calculatePercentage(this.surveyAnswers[1]?.['Policies']?.['Question12']?.['Question12-0'], this.surveyAnswers[1]?.['General']?.['Question2']?.['Question2-0']);
    this.rpoDataManagementPercentage[0] = this.dataShareService.calculatePercentage(this.surveyAnswers[0]?.['Policies']?.['Question12']?.['Question12-0'], this.surveyAnswers[0]?.['General']?.['Question2']?.['Question2-0']);
    this.rpoDataManagementPercentageDiff = this.dataShareService.calculateDiff(this.rpoDataManagementPercentage[0], this.rpoDataManagementPercentage[1]);

    this.financialInvestmentDM[1] = this.surveyAnswers[1]?.['Practices']?.['Question60']?.['Question60-0'];
    this.financialInvestmentDM[0] = this.surveyAnswers[0]?.['Practices']?.['Question60']?.['Question60-0'];
    this.financialInvestmentDMPercentageDiff = this.dataShareService.calculateDiffAsPercentage(this.financialInvestmentDM[0], this.financialInvestmentDM[1]);


    this.nationalPolicyResponse = this.surveyAnswers[1]?.['Policies']?.['Question10']?.['Question10-0'] || null;
    this.policyMandatory = this.surveyAnswers[1]?.['Policies']?.['Question5']?.['Question6-5-0']?.['Question5-1'] || null;
    this.nationalPolicyClarification = this.surveyAnswers[1]?.['Policies']?.['Question10']?.['Question10-3'] || null;

    this.financialStrategyResponse = this.surveyAnswers[1]?.['Policies']?.['Question11']?.['Question11-0'] || null;
    this.financialStrategyClarification = this.surveyAnswers[1]?.['Policies']?.['Question11']?.['Question11-1'] || null;

    this.monitoringResponse = this.surveyAnswers[1]?.['Practices']?.['Question58']?.['Question58-0'] || null;
    this.monitoringClarification = this.surveyAnswers[1]?.['Practices']?.['Question58']?.['Question58-1'] || null;

  }

}
