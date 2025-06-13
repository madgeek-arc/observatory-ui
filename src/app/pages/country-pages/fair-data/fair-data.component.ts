import { CommonModule, JsonPipe, LowerCasePipe, NgForOf, NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { SurveyAnswer } from "../../../../survey-tool/app/domain/survey";
import { DestroyRef, inject, OnInit } from "@angular/core";
import { DataShareService } from "../services/data-share.service";
import { ContentCollapseComponent } from "src/app/content-collapse/content-collapse.component";
import { CatalogueUiReusableComponentsModule } from 'src/survey-tool/catalogue-ui/shared/reusable-components/catalogue-ui-reusable-components.module';
import { EoscReadinessDataService } from "../../services/eosc-readiness-data.service";
import { DataCheckService } from '../services/data-check.service';

@Component({
  selector: 'app-fair-data',
  imports: [
    CommonModule,
    LowerCasePipe,
    NgOptimizedImage,
    NgForOf,
    JsonPipe,
    CatalogueUiReusableComponentsModule,
    ContentCollapseComponent
  ],
  standalone: true,
  templateUrl: './fair-data.component.html',
})
export class FairDataComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  protected readonly Math = Math;

  countryCode?: string;
  countryName?: string;
  surveyAnswers: Object[] = [];

  rfoFairDataPercentage: (number | null)[] = [null, null];
  rfoFairDataPercentageDiff: number | null = null;
  rpoFairDataPercentage: (number | null)[] = [null,null];
  rpoFairDataPercentageDiff: number | null = null;
  financialInvestmentInFairData: (string | null)[] = [null, null];
  financialInvestmentInFairDataPercentageDiff: number | null = null;
  hasNationalPolicyFD: string | null = null;
  nationalPolicyClarificationFD: string | null = null;
  hasFinancialStrategyFD: string | null = null;
  financialStrategyClarificationFD: string | null = null;
  hasMonitoringFD: string | null = null;
  monitoringClarificationFD: string | null = null;
  policyMandatoryFD: string | null = null;

  constructor(private dataShareService: DataShareService,  private queryData: EoscReadinessDataService, private dataCheckService: DataCheckService) {}

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
        this.initCardValues();
      }
    });
  }

  hasAnyLeftCardData() {
    return this.dataCheckService.hasAnyValue([
      this.rfoFairDataPercentage[1],
      this.rpoFairDataPercentage[0],
      this.financialInvestmentInFairData[1]
    ]);
  }

  initCardValues() {
     this.rfoFairDataPercentage[1] = this.dataShareService.calculatePercentage(this.surveyAnswers[1]?.['Policies']?.['Question17']?.['Question17-0'], this.surveyAnswers[1]?.['General']?.['Question3']?.['Question3-0']);
     this.rfoFairDataPercentage[0] = this.dataShareService.calculatePercentage(this.surveyAnswers[0]?.['Policies']?.['Question17']?.['Question17-0'], this.surveyAnswers[0]?.['General']['Question3']?.['Question3-0']);
     this.rfoFairDataPercentageDiff = this.dataShareService.calculateDiff(this.rfoFairDataPercentage[0], this.rfoFairDataPercentage[1]);

     this.rpoFairDataPercentage[1] = this.dataShareService.calculatePercentage(this.surveyAnswers[1]?.['Policies']?.['Question16']?.['Question16-0'], this.surveyAnswers[1]?.['General']?.['Question2']?.['Question2-0']);
     this.rpoFairDataPercentage[0] = this.dataShareService.calculatePercentage(this.surveyAnswers[0]?.['Policies']?.['Question16']?.['Question16-0'], this.surveyAnswers[0]?.['General']?.['Question2']?.['Question2-0']);
     this.rpoFairDataPercentageDiff = this.dataShareService.calculateDiff(this.rpoFairDataPercentage[0], this.rpoFairDataPercentage[1]);

     this.financialInvestmentInFairData[1] = this.surveyAnswers[1]?.['Practices']?.['Question64']?.['Question64-0'];
     this.financialInvestmentInFairData[0] = this.surveyAnswers[0]?.['Practices']?.['Question64']?.['Question64-0'];
     this.financialInvestmentInFairDataPercentageDiff = this.dataShareService.calculateDiffAsPercentage(this.financialInvestmentInFairData[0], this.financialInvestmentInFairData[1]);

     this.hasFinancialStrategyFD = this.surveyAnswers[1]?.['Policies']?.['Question15']?.['Question15-0'];
     this.financialStrategyClarificationFD = this.surveyAnswers[1]?.['Policies']?.['Question15']?.['Question15-1'];

     this.hasNationalPolicyFD = this.surveyAnswers[1]?.['Policies']?.['Question14']?.['Question14-0'];
     this.nationalPolicyClarificationFD = this.surveyAnswers[1]?.['Policies']?.['Question14']?.['Question14-3'];

     this.hasMonitoringFD = this.surveyAnswers[1]?.['Practices']?.['Question62']?.['Question62-0'];
     this.monitoringClarificationFD = this.surveyAnswers[1]?.['Practices']?.['Question62']?.['Question62-1'];

     this.policyMandatoryFD = this.surveyAnswers[1]?.['Policies']?.['Question14']?.['Question14-1-0']?.['Question14-1'];

  }

}
