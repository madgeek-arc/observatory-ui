import { CommonModule, JsonPipe, LowerCasePipe, NgForOf, NgOptimizedImage } from "@angular/common";
import { Component } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { SurveyAnswer } from "../../../../survey-tool/app/domain/survey";
import { DestroyRef, inject, OnInit } from "@angular/core";
import { DataShareService } from "../services/data-share.service";
import { ExploreService } from "../../explore/explore.service";


@Component({
  selector: 'app-open-access-publications',
  imports: [
    CommonModule,
    LowerCasePipe,
    NgOptimizedImage,
    NgForOf,
    JsonPipe,
    ],
  standalone: true,
  templateUrl: './open-access-publications.html',
})

export class OpenAccessPublicationsPage implements OnInit {
  private destroyRef = inject(DestroyRef);
  colorChange = 11;
  rfoPublication = [];
  financialInvestment = [];
  rpoPublicationPercentage = [null, null];
  rfoPublicationPercentage = [null, null];

  countryCode?: string;
    countryName?: string;
    surveyAnswers: Object[] = [];
  
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

         // this.rfoPublication[0] = this.surveyAnswers[0]?.answer['Policies']['Question9']['Question9-0'];
         // this.rfoPublication[1] = this.surveyAnswers[1]?.answer['Policies']['Question9']['Question9-0'];
          this.rfoPublicationPercentage[1] = this.calculatePercentage(this.surveyAnswers[1]?.['Policies']['Question9']['Question9-0'], this.surveyAnswers[1]?.['General']['Question3']['Question3-0']);
          this.rfoPublicationPercentage[0] = this.calculatePercentage(this.surveyAnswers[0]?.['Policies']['Question9']['Question9-0'], this.surveyAnswers[0]?.['General']['Question3']['Question3-0']);

          this.financialInvestment[0] = this.surveyAnswers[0]?.['Practices']['Question56']['Question56-0'];
          this.financialInvestment[1] = this.surveyAnswers[1]?.['Practices']['Question56']['Question56-0'];
          

          // const rpoValue = this.rpoPublication[0] = this.surveyAnswers[0]?.answer['Policies']['Question8']['Question8-0'];
          // this.rpoPublication[1] = this.surveyAnswers[1]?.answer['Policies']['Question8']['Question8-0'];

          // const totalRpoValue = this.totalRpos[0] = this.surveyAnswers[0]?.answer['General']['Question2']['Question2-0'];
          // if (this.exploreService.isNumeric(this.surveyAnswers[1]?.answer['General']['Question2']['Question2-0']) && this.exploreService.isNumeric(this.surveyAnswers[1]?.answer['Policies']['Question8']['Question8-0'])) {
            // Math.round((+this.surveyAnswers[1]?.answer['Policies']['Question8']['Question8-0'] / +this.surveyAnswers[1]?.answer['General']['Question2']['Question2-0']) * 100)
          // }

          this.rpoPublicationPercentage[1] = this.calculatePercentage(this.surveyAnswers[1]?.['Policies']['Question8']['Question8-0'], this.surveyAnswers[1]?.['General']['Question2']['Question2-0']);
          this.rpoPublicationPercentage[0] = this.calculatePercentage(this.surveyAnswers[0]?.['Policies']['Question8']['Question8-0'], this.surveyAnswers[0]?.['General']['Question2']['Question2-0']);
        }
      });
    }


    calculatePercentage(value: string, total: string): number {
      
      if (value === undefined || total === undefined) {
        return null; // Avoid NaN
      }

      if (!this.dataShareService.isNumeric(value) && !this.dataShareService.isNumeric(total)) {
        return null; // Avoid NaN
      }
      
      if (+total === 0) {
        return null; // Avoid division by zero
      }

      return Math.round((+value / +total) * 100);
    }

    get rpoPublicationPercentageChange(): number | null {
      return this.calculateChangeFromArray(this.rpoPublicationPercentage);
      }
    

    get rfoPublicationPercentageChange(): number | null {
      return this.calculateChangeFromArray(this.rfoPublicationPercentage)
      }
      
    get financialInvestmentChange(): number | null {
      return this.calculatePercentageChangeFromArray(this.financialInvestment);
 }

  calculateChangeFromArray(values: (number | string | null | undefined)[]): number | null {
    if (values.length < 2) {
      return null;
      }
      const [value0, value1] = values;

    if (value0 === null || value1 ===null || value0 === undefined || value1 === undefined) {
       return null; // Avoid NaN
     }
    if (!this.dataShareService.isNumeric(String(value0)) || !this.dataShareService.isNumeric(String(value1))) {
      return null; // Avoid NaN
     }
      return (+value1 - +value0);
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
