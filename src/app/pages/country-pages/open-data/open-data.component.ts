import { CommonModule, LowerCasePipe, NgOptimizedImage } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { DataShareService } from "../services/data-share.service";
import {
  CatalogueUiReusableComponentsModule
} from 'src/survey-tool/catalogue-ui/shared/reusable-components/catalogue-ui-reusable-components.module';
import { EoscReadinessDataService } from "../../services/eosc-readiness-data.service";
import { OAvsTotalDataPerCountry } from "../coutry-pages.queries";

@Component({
  selector: 'app-open-data',
  imports: [
    CommonModule,
    LowerCasePipe,
    NgOptimizedImage,
    CatalogueUiReusableComponentsModule,
   ],
   standalone: true,
  templateUrl: './open-data.component.html',

})
export class OpenDataComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  protected readonly Math = Math;


  countryCode?: string;
  countryName?: string;
  surveyAnswers: Object[] = [];
  countrySurveyAnswer?: Object;


  rfoOpenDataPercentage: (number | null)[] = [null, null];
  rfoOpenDataPercentageDiff: number | null = null;
  ODfinancialInvestment: (string | null)[] = [null, null];
  ODfinancialInvestmentPercentageDiff: number | null = null;
  rpoOpenDataPercentage: (number | null)[] = [null, null];
  rpoOpenDataPercentageDiff: number | null = null;
  hasNationalPolicyOD: string | null = null;
  nationalPolicyClarificationOD: string | null = null;
  hasFinancialStrategyOD: string | null = null;
  financialStrategyClarificationOD: string | null = null;
  hasMonitoringOD: string | null = null;
  monitoringClarificationOD: string | null = null;
  policyMandatoryOD: string | null = null;
  OpenDataPercentage: (number | null)[] = [null, null];
  OpenDataPercentageDiff: number | null = null;



  constructor(private dataShareService: DataShareService, private queryData: EoscReadinessDataService) {}

  ngOnInit() {
    this.dataShareService.countryCode.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (code) => {
        this.countryCode = code;
        this.getOpenDataPercentage();
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

    this.dataShareService.countrySurveyAnswer.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (answer) => {
        this.countrySurveyAnswer = answer;
      }
    });

  }

  initCardValues() {
    this.rfoOpenDataPercentage[1] = this.dataShareService.calculatePercentage(this.surveyAnswers[1]?.['Policies']?.['Question21']?.['Question21-0'], this.surveyAnswers[1]?.['General']?.['Question3']?.['Question3-0']);
    this.rfoOpenDataPercentage[0] = this.dataShareService.calculatePercentage(this.surveyAnswers[0]?.['Policies']?.['Question21']?.['Question21-0'], this.surveyAnswers[0]?.['General']?.['Question3']?.['Question3-0']);
    this.rfoOpenDataPercentageDiff = this.dataShareService.calculateDiff(this.rfoOpenDataPercentage[0], this.rfoOpenDataPercentage[1]);

    this.ODfinancialInvestment[1] = this.surveyAnswers[1]?.['Practices']?.['Question68']?.['Question68-0'];
    this.ODfinancialInvestment[0] = this.surveyAnswers[0]?.['Practices']?.['Question68']?.['Question68-0'];
    this.ODfinancialInvestmentPercentageDiff = this.dataShareService.calculateDiffAsPercentage(this.ODfinancialInvestment[0], this.ODfinancialInvestment[1]);

    this.rpoOpenDataPercentage[1] = this.dataShareService.calculatePercentage(this.surveyAnswers[1]?.['Policies']?.['Question20']?.['Question20-0'], this.surveyAnswers[1]?.['General']?.['Question2']?.['Question2-0']);
    this.rpoOpenDataPercentage[0] = this.dataShareService.calculatePercentage(this.surveyAnswers[0]?.['Policies']?.['Question20']?.['Question20-0'], this.surveyAnswers[0]?.['General']?.['Question2']?.['Question2-0']);
    this.rpoOpenDataPercentageDiff = this.dataShareService.calculateDiff(this.rpoOpenDataPercentage[0], this.rpoOpenDataPercentage[1]);

    this.hasNationalPolicyOD = this.surveyAnswers[1]?.['Policies']?.['Question18']?.['Question18-0'] || null;
    this.policyMandatoryOD = this.surveyAnswers[1]?.['Policies']?.['Question18']?.['Question18-1-0']?.['Question18-1'] || null;
    this.nationalPolicyClarificationOD = this.surveyAnswers[1]?.['Policies']?.['Question18']?.['Question18-3'] || null;

    this.hasFinancialStrategyOD = this.surveyAnswers[1]?.['Policies']?.['Question19']?.['Question19-0'] || null;
    this.financialStrategyClarificationOD = this.surveyAnswers[1]?.['Policies']?.['Question19']?.['Question19-3'] || null;

    this.hasMonitoringOD = this.surveyAnswers[1]?.['Practices']?.['Question66']?.['Question66-0'] || null;
    this.monitoringClarificationOD = this.surveyAnswers[1]?.['Practices']?.['Question66']?.['Question66-1'] || null;

  }

  getOpenDataPercentage() {
    this.queryData.getOSOStats(OAvsTotalDataPerCountry(this.countryCode)).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.OpenDataPercentage[0] = this.dataShareService.calculatePercentage(value.data[0][0][0], value.data[1][0][0]);
        this.OpenDataPercentage[1] = this.dataShareService.calculatePercentage(value.data[2][0][0], value.data[3][0][0]);
        this.OpenDataPercentageDiff = this.dataShareService.calculateDiff(this.OpenDataPercentage[0], this.OpenDataPercentage[1]);
      }
    });
  }

}
