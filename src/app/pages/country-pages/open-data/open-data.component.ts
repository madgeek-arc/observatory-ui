import { CommonModule, JsonPipe, LowerCasePipe, NgForOf, NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { SurveyAnswer } from "../../../../survey-tool/app/domain/survey";
import { DestroyRef, inject, OnInit } from "@angular/core";
import { DataShareService } from "../services/data-share.service";

@Component({
  selector: 'app-open-data',
  imports: [
    CommonModule,
    LowerCasePipe,
    NgOptimizedImage,
    NgForOf,
    JsonPipe,
   ],
   standalone: true,
  templateUrl: './open-data.component.html',
  
})
export class OpenDataComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  colorChange = 13;
  financialInvestment = [];
  rfoOpenData = [];
  rpoOpenData = [];

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
        this.financialInvestment[0] = this.surveyAnswers[0]?.['Practices']['Question68']['Question68-0'];
        this.financialInvestment[1] = this.surveyAnswers[1]?.['Practices']['Question68']['Question68-0'];
        console.log(this.financialInvestment);

        this.rfoOpenData[0] = this.surveyAnswers[0]?.['Policies']['Question21']['Question21-0'];
        this.rfoOpenData[1] = this.surveyAnswers[1]?.['Policies']['Question21']['Question21-0'];

        this.rpoOpenData[0] = this.surveyAnswers[0]?.['Policies']['Question20']['Question20-0'];
        this.rpoOpenData[1] = this.surveyAnswers[1]?.['Policies']['Question20']['Question20-0'];
      }
    });
  }

}
