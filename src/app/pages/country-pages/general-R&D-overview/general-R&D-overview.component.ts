import { Component, DestroyRef, inject, OnInit } from "@angular/core";


import { CommonModule, JsonPipe, LowerCasePipe, NgForOf, NgOptimizedImage } from "@angular/common";
import { DataShareService } from "../services/data-share.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { SurveyAnswer } from "../../../../survey-tool/app/domain/survey";

@Component({
  selector: 'app-general-R&D-overview',
  standalone: true,
  templateUrl: './general-R&D-overview.component.html',
  imports: [
    CommonModule,
    NgOptimizedImage
  ]
})

export class GeneralRDOverviewComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  colorChange = 11;
  openSoftware = [];
  totalInvestment = [];
  countryCode?: string;
  countryName?: string;
  surveyAnswers: Object[] = [];
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
        this.openSoftware[0] = this.surveyAnswers[0]?.['Practices']['Question73']['Question73-0'];
        this.openSoftware[1] = this.surveyAnswers[1]?.['Practices']['Question73']['Question73-0'];

        this.totalInvestment[0] = this.surveyAnswers[0]?.['General']['Question5']['Question5-0'];
        this.totalInvestment[1] = this.surveyAnswers[1]?.['General']['Question5']['Question5-0'];
      }
    });

    this.dataShareService.countrySurveyAnswer.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (answer) => {
        this.countrySurveyAnswer = answer;
      }
    });
  }

  get totalInvestmentChange(): number | null {
      return this.calculatePercentageChangeFromArray(this.totalInvestment);
 }

 calculatePercentageChangeFromArray(values: (number | string | null | undefined)[]): number | null {
      if (values.length < 2) {
        return null;
      }
      const [value0, value1] = values;

      if (value0 === null || value1 === null || value0 === undefined || value1 === undefined) {
        return null; // Avoid NaN
      }
      if (!this.dataShareService.isNumeric(String(value0)) || !this.dataShareService.isNumeric(String(value1))) {
        return null; // Avoid NaN
      }
      if (+value0 === 0 && +value1 === 0) {
        return 0;
      }

      const average = (+value1 + +value0) / 2;
      return Math.round((Math.abs(+value1 - +value0) / average) * 100);
    }

}
