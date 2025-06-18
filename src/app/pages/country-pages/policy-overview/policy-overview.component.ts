import { Component, DestroyRef, inject } from "@angular/core";
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { DataShareService } from "../services/data-share.service";
import {
  CatalogueUiReusableComponentsModule
} from "src/survey-tool/catalogue-ui/shared/reusable-components/catalogue-ui-reusable-components.module";

class TableRow {
  OSArea: string;
  nationalPolicy: string;
  financialStrategy: string;

  constructor(OSArea: string, nationalPolicy: string, financialStrategy: string) {
    this.OSArea = OSArea;
    this.nationalPolicy = nationalPolicy;
    this.financialStrategy = financialStrategy;
  }
}

@Component({
  selector: 'app-policy-overview',
  standalone: true,
  templateUrl: './policy-overview.component.html',
  styleUrls: ['../../dashboard/country-landing-page/country-landing-page.component.css'],
  imports: [
    NgOptimizedImage,
    CommonModule,
    CatalogueUiReusableComponentsModule,
  ]
})

export class PolicyOverviewComponent {
  private destroyRef = inject(DestroyRef);

  countryCode?: string;
  countryName?: string;
  surveyAnswers: Object[] = [];
  table: TableRow[] = [];
  surveyAnswer: Object[] = [];
  countrySurveyAnswer?: Object;

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
        if (this.surveyAnswers[1] === null)
          return;

        this.populateTable();
      }
    });

    this.dataShareService.countrySurveyAnswer.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (answer) => {
        this.countrySurveyAnswer = answer;

      }
    });
  }

  /**
   * Populates the table array with policy data from survey answers.
   * Creates TableRow objects for different Open Science areas containing:
   * - OSArea: The name of the Open Science area
   * - nationalPolicy: The national policy status
   * - financialStrategy: The financial strategy status
   * The data is extracted from the most recent survey answers
   */
  populateTable() {
    this.table = [];
    this.table.push(new TableRow('Publications', this.surveyAnswers[1]?.['Policies']?.['Question6']?.['Question6-0'], this.surveyAnswers[1]?.['Policies']?.['Question7']?.['Question7-0']));
    this.table.push(new TableRow('Data Management', this.surveyAnswers[1]?.['Policies']?.['Question10']?.['Question10-0'], this.surveyAnswers[1]?.['Policies']?.['Question11']?.['Question11-0']));
    this.table.push(new TableRow('FAIR Data', this.surveyAnswers[1]?.['Policies']?.['Question14']?.['Question14-0'], this.surveyAnswers[1]?.['Policies']?.['Question15']?.['Question15-0']));
    this.table.push(new TableRow('Open Data', this.surveyAnswers[1]?.['Policies']?.['Question18']?.['Question18-0'], this.surveyAnswers[1]?.['Policies']?.['Question19']?.['Question19-0']));
    this.table.push(new TableRow('Software', this.surveyAnswers[1]?.['Policies']?.['Question22']?.['Question22-0'], this.surveyAnswers[1]?.['Policies']?.['Question23']?.['Question23-0']));
    this.table.push(new TableRow('Services', this.surveyAnswers[1]?.['Policies']?.['Question26']?.['Question26-0'], this.surveyAnswers[1]?.['Policies']?.['Question27']?.['Question27-0']));
    this.table.push(new TableRow('Connecting repositories to EOSC', this.surveyAnswers[1]?.['Policies']?.['Question30']?.['Question30-0'], this.surveyAnswers[1]?.['Policies']?.['Question31']?.['Question31-0']));
    this.table.push(new TableRow('Data stewardship', this.surveyAnswers[1]?.['Policies']?.['Question34']?.['Question34-0'], this.surveyAnswers[1]?.['Policies']?.['Question35']?.['Question35-0']));
    this.table.push(new TableRow('Long-term data preservation', this.surveyAnswers[1]?.['Policies']?.['Question38']?.['Question38-0'], this.surveyAnswers[1]?.['Policies']?.['Question39']?.['Question39-0']));
    this.table.push(new TableRow('Skills/Training', this.surveyAnswers[1]?.['Policies']?.['Question42']?.['Question42-0'], this.surveyAnswers[1]?.['Policies']?.['Question43']?.['Question43-0']));
    this.table.push(new TableRow('Assessment', this.surveyAnswers[1]?.['Policies']?.['Question46']?.['Question46-0'], this.surveyAnswers[1]?.['Policies']?.['Question47']?.['Question47-0']));
    this.table.push(new TableRow('Engagement', this.surveyAnswers[1]?.['Policies']?.['Question50']?.['Question50-0'], this.surveyAnswers[1]?.['Policies']?.['Question51']?.['Question51-0']));
  }

  hasSurveyPolicyData(): boolean {
    const surveyData = this.countrySurveyAnswer?.['OPEN SCIENCE POLICY'];
    if (!surveyData) {
      return false;
    }

    const questions = ['Question10', 'Question11', 'Question12', 'Question13'];
    return this.dataShareService.hasSurveyData(surveyData, questions);
  }

}


