import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { DataShareService } from "../services/data-share.service";
import {
  CatalogueUiReusableComponentsModule
} from 'src/survey-tool/catalogue-ui/shared/reusable-components/catalogue-ui-reusable-components.module';

@Component({
  selector: 'app-open-science-training',
  templateUrl: './open-science-training.component.html',
  styleUrls: ['./open-science-training.component.less'],
  standalone: true,
  imports: [
    CommonModule,
    NgOptimizedImage,
    CatalogueUiReusableComponentsModule,
  ],
})
export class OpenScienceTrainingComponent  implements OnInit {
  private destroyRef = inject(DestroyRef);
  protected readonly Math = Math;

  countryCode?: string;
  countryName?: string;
  surveyAnswers: Object[] = [];
  countrySurveyAnswer?: Object;

  rfoTrainingPercentage: (number | null)[] = [null, null];
  rfoTrainingPercentageDiff: number | null = null;
  rpoTrainingPercentage: (number | null)[] = [null, null];
  rpoTrainingPercentageDiff: number | null = null;
  trainingFinancialInvestment: (string | null)[] = [null, null];
  trainingFinancialInvestmentPercentageDiff: number | null = null;
  hasNationalPolicy: string | null = null;
  nationalPolicyClarification: string | null = null;
  policyMandatory: string | null = null;
  nationalPolicyClarificationTraining: string | null = null;
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
    this.rfoTrainingPercentage[1] = this.dataShareService.calculatePercentage(this.surveyAnswers[1]?.['Policies']?.['Question45']?.['Question45-0'], this.surveyAnswers[1]?.['General']?.['Question3']?.['Question3-0']);
    this.rfoTrainingPercentage[0] = this.dataShareService.calculatePercentage(this.surveyAnswers[0]?.['Policies']?.['Question45']?.['Question45-0'], this.surveyAnswers[0]?.['General']?.['Question3']?.['Question3-0']);
    this.rfoTrainingPercentageDiff = this.dataShareService.calculateDiff(this.rfoTrainingPercentage[0], this.rfoTrainingPercentage[1]);

    this.rpoTrainingPercentage[1] = this.dataShareService.calculatePercentage(this.surveyAnswers[1]?.['Policies']?.['Question44']?.['Question44-0'], this.surveyAnswers[1]?.['General']?.['Question2']?.['Question2-0']);
    this.rpoTrainingPercentage[0] = this.dataShareService.calculatePercentage(this.surveyAnswers[0]?.['Policies']?.['Question44']?.['Question44-0'], this.surveyAnswers[0]?.['General']?.['Question2']?.['Question2-0']);
    this.rpoTrainingPercentageDiff = this.dataShareService.calculateDiff(this.rpoTrainingPercentage[0], this.rpoTrainingPercentage[1]);

    this.trainingFinancialInvestment[1] = this.surveyAnswers[1]?.['Practices']?.['Question92']?.['Question92-0'];
    this.trainingFinancialInvestment[0] = this.surveyAnswers[0]?.['Practices']?.['Question92']?.['Question92-0'];
    this.trainingFinancialInvestmentPercentageDiff = this.dataShareService.calculateDiffAsPercentage(this.trainingFinancialInvestment[0], this.trainingFinancialInvestment[1]);

    this.hasNationalPolicy = this.surveyAnswers[1]?.['Policies']?.['Question42']?.['Question42-0'];
    this.nationalPolicyClarification = this.surveyAnswers[1]?.['Policies']?.['Question42']?.['Question42-3'];
    this.policyMandatory = this.surveyAnswers[1]?.['Policies']?.['Question42']?.['Question42-1-0']?.['Question42-1'];

    this.hasFinancialStrategy = this.surveyAnswers[1]?.['Policies']?.['Question43']?.['Question43-0'];
    this.financialStrategyClarification = this.surveyAnswers[1]?.['Policies']?.['Question43']?.['Question43-3'];

    this.hasMonitoring = this.surveyAnswers[1]?.['Practices']?.['Question90']?.['Question90-0'];
    this.monitoringClarification = this.surveyAnswers[1]?.['Practices']?.['Question90']?.['Question90-1'];


  }

  hasAnyLeftCardData() {
    return this.dataShareService.hasAnyValue([
      this.rfoTrainingPercentage[1],
      this.trainingFinancialInvestment[1],
      this.rpoTrainingPercentage[1],
    ]);
  }

  hasSurveyTrainingData(): boolean {
    const surveyData = this?.countrySurveyAnswer?.['OPEN SCIENCE DIGITAL SKILLS'];
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

}
