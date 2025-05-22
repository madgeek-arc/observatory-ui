import { CommonModule, LowerCasePipe, NgOptimizedImage } from "@angular/common";
import { DataShareService } from "../services/data-share.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { SurveyAnswer } from "../../../../survey-tool/app/domain/survey";
import { Component, inject, DestroyRef } from "@angular/core";

@Component({
  selector: 'app-policy-overview',
  standalone: true,
  templateUrl: './policy-overview.component.html',
  imports: [ 
    LowerCasePipe,
    NgOptimizedImage,
    CommonModule
  ]
})

export class PolicyOverviewComponent {
  private destroyRef = inject(DestroyRef);

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
      }
    });
  }
}


