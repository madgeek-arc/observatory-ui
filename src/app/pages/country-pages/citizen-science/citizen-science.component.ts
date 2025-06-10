import { CommonModule, JsonPipe, LowerCasePipe, NgForOf, NgOptimizedImage } from "@angular/common";
import { Component } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { SurveyAnswer } from "../../../../survey-tool/app/domain/survey";
import { DestroyRef, inject, OnInit } from "@angular/core";
import { DataShareService } from "../services/data-share.service";
import { CatalogueUiReusableComponentsModule } from 'src/survey-tool/catalogue-ui/shared/reusable-components/catalogue-ui-reusable-components.module';
import { ContentCollapseComponent } from "src/app/content-collapse/content-collapse.component";



@Component({
  selector: 'app-citizen-science',
  standalone: true,
  templateUrl: './citizen-science.component.html',
  imports: [
    CommonModule,
    LowerCasePipe,
    NgOptimizedImage,
    CatalogueUiReusableComponentsModule,
    ContentCollapseComponent
  ]
})
export class CitizenScienceComponent implements OnInit {
  private destroyRef = inject(DestroyRef);  
  protected readonly Math = Math;

  countryCode?: string;
  countryName?: string;
  surveyAnswers: Object[] = [];
  countrySurveyAnswer?: Object;

  citizenScienceProjects:  (string | null)[] = [null, null];
  citizenSciencePercentageDiff: number | null = null;
  financialInvestmentInCS: (string | null)[] = [null, null];
  financialInvestmentInCsPercentageDiff: number | null = null;
  hasNationalPolicyCS: string | null = null
  nationalPolicyClarificationCS: string | null = null;
  hasFinancialStrategyCS: string | null = null;
  financialStrategyClarificationCS: string | null = null;
  hasMonitoringCS: string | null = null;
  monitoringClarificationCS: string | null = null;
  policyMandatoryCS: string | null = null;

  constructor(private dataShareService: DataShareService) {}

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

    this.dataShareService.countrySurveyAnswer.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (answer) => {
        this.countrySurveyAnswer = answer;
      }
    });
  }

  initCardValues() {
    this.citizenScienceProjects[1] = this.surveyAnswers[1]?.['Practices']?.['Question101']?.['Question101-0'];
    this.citizenScienceProjects[0] = this.surveyAnswers[0]?.['Practices']?.['Question101']?.['Question101-0'];
    this.citizenSciencePercentageDiff = this.dataShareService.calculateDiffAsPercentage(this.citizenScienceProjects[0], this.citizenScienceProjects[1]);
    console.log(this.citizenScienceProjects);

    this.financialInvestmentInCS[1] = this.surveyAnswers[1]?.['Practices']?.['Question100']?.['Question100-0'];
    this.financialInvestmentInCS[0] = this.surveyAnswers[0]?.['Practices']?.['Question100']?.['Question100-0'];
    this.financialInvestmentInCsPercentageDiff = this.dataShareService.calculateDiffAsPercentage(this.financialInvestmentInCS[0], this.financialInvestmentInCS[1]);

    this.hasNationalPolicyCS = this.surveyAnswers[1]?.['Policies']?.['Question50']?.['Question50-0'] || null;
    this.nationalPolicyClarificationCS = this.surveyAnswers[1]?.['Policies']?.['Question50']?.['Question50-3'] || null;

    this.hasFinancialStrategyCS = this.surveyAnswers[1]?.['Policies']?.['Question51']?.['Question51-0'] || null;
    this.financialStrategyClarificationCS = this.surveyAnswers[1]?.['Policies']?.['Question51-1'] || null;

    this.hasMonitoringCS = this.surveyAnswers[1]?.['Practices']?.['Question98']?.['Question98-0'] || null;
    this.monitoringClarificationCS = this.surveyAnswers[1]?.['Practices']?.['Question98']?.['Question98-1'] || null;

    this.policyMandatoryCS = this.surveyAnswers[1]?.['Policies']?.['Question50']?.['Question50-1-0']?.['Question50-1'] || null;

  }

}
