import { Component, DestroyRef, inject, OnInit } from "@angular/core";


import { CommonModule, JsonPipe, LowerCasePipe, NgForOf, NgOptimizedImage } from "@angular/common";
import { DataShareService } from "../services/data-share.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { SurveyAnswer } from "../../../../survey-tool/app/domain/survey";
import { ExploreService } from "../../explore/explore.service";

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
  protected readonly Math = Math;

  colorChange = 11;
  openSoftware = [];
  totalInvestment = [];
  openSoftwarePercentageDiff: number | null = null;
  countryCode?: string;
  countryName?: string;
  surveyAnswers: Object[] = [];
  countrySurveyAnswer?: Object;

  constructor(private dataShareService: DataShareService, private exploreService: ExploreService) {}

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

        this.openSoftwarePercentageDiff = this.dataShareService.calculateDiffAsPercentage(this.openSoftware[0], this.openSoftware[1]);

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
      if (this.totalInvestment.length < 2) {
        return null;
      }
      const previous = this.totalInvestment[0];
      const next = this.totalInvestment[1];

      return this.dataShareService.calculateDiffAsPercentage(
        previous !== undefined && previous !== null ? String(previous) : null,
        next !== undefined && next !== null ? String(next) : null
      );
 }
}
