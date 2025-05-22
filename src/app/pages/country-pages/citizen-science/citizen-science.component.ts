import { CommonModule, JsonPipe, LowerCasePipe, NgForOf, NgOptimizedImage } from "@angular/common";
import { Component } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { SurveyAnswer } from "../../../../survey-tool/app/domain/survey";
import { DestroyRef, inject, OnInit } from "@angular/core";
import { DataShareService } from "../services/data-share.service";

@Component({
  selector: 'app-citizen-science',
  standalone: true,
  templateUrl: './citizen-science.component.html',
  imports: [
    CommonModule,
    LowerCasePipe,
    NgOptimizedImage,
    NgForOf,
    JsonPipe,
  ]
})
export class CitizenScienceComponent implements OnInit {
  private destroyRef = inject(DestroyRef);  
  colorChange = 2;

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
