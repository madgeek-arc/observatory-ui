import { CommonModule, JsonPipe, LowerCasePipe, NgForOf, NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { SurveyAnswer } from "../../../../survey-tool/app/domain/survey";
import { DestroyRef, inject, OnInit } from "@angular/core";
import { DataShareService } from "../services/data-share.service";

@Component({
  selector: 'app-data-management',
  standalone: true,
  imports: [
    CommonModule,
    LowerCasePipe,
    NgOptimizedImage,
    NgForOf,
    JsonPipe,
  ],
  templateUrl: './data-management.component.html',
})
export class DataManagementComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  colorChange = 33;
  rpoDataManagement = [];
  rfoDataManagement = [];

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
        this.rpoDataManagement[0] = this.surveyAnswers[0]?.['Policies']['Question12']['Question12-0'];

        this.rfoDataManagement[0] = this.surveyAnswers[0]?.['Policies']['Question13']['Question13-0'];
        this.rfoDataManagement[1] = this.surveyAnswers[1]?.['Policies']['Question13']['Question13-0'];
      }
    });
  }
}
