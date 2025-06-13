import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { DataShareService } from "../services/data-share.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { OAvsTotalDataPerCountry, OAvsTotalPubsPerCountry } from "../coutry-pages.queries";
import { EoscReadinessDataService } from "../../services/eosc-readiness-data.service";
import { CatalogueUiReusableComponentsModule } from 'src/survey-tool/catalogue-ui/shared/reusable-components/catalogue-ui-reusable-components.module';
import { ContentCollapseComponent } from "src/app/content-collapse/content-collapse.component";
import { DataCheckService } from "../services/data-check.service";


@Component({
  selector: 'app-general-R&D-overview',
  standalone: true,
  templateUrl: './general-R&D-overview.component.html',
  imports: [
    CommonModule,
    NgOptimizedImage,
    // CatalogueUiReusableComponentsModule,
     ContentCollapseComponent
  ]
})

export class GeneralRDOverviewComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  protected readonly Math = Math;

  openSoftware: (string | null)[] = [null, null];
  openSoftwarePercentageDiff: number | null = null;
  totalInvestment: (string | null)[] = [null, null];
  investmentPercentageDiff: (number | null) = null;
  investment: (number | null) = null;
  OAPubsPercentage: (number | null)[] = [null, null];
  OAPubsPercentageDiff: number | null = null;
  OpenDataPercentage: (number | null)[] = [null, null];
  OpenDataPercentageDiff: number | null = null;

  countryCode?: string;
  countryName?: string;
  surveyAnswers: Object[] = [];
  countrySurveyAnswer?: Object;

  constructor(private dataShareService: DataShareService, private queryData: EoscReadinessDataService, private dataCheckService: DataCheckService) {}

  ngOnInit() {
    this.dataShareService.countryCode.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (code) => {
        this.countryCode = code;
        this.getPublicationPercentage();
        this.getOpenDataPercentage();
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
        this.openSoftware[0] = this.surveyAnswers[0]?.['Practices']?.['Question73']?.['Question73-0'] || null;
        this.openSoftware[1] = this.surveyAnswers[1]?.['Practices']?.['Question73']?.['Question73-0'] || null;
        this.openSoftwarePercentageDiff = this.dataShareService.calculateDiffAsPercentage(this.openSoftware[0], this.openSoftware[1]);

        this.totalInvestment[0] = this.surveyAnswers[0]?.['General']?.['Question5']?.['Question5-0'] || null;
        this.totalInvestment[1] = this.surveyAnswers[1]?.['General']?.['Question5']?.['Question5-0'] || null;
        this.investmentPercentageDiff = this.dataShareService.calculateDiffAsPercentage(this.totalInvestment[0], this.totalInvestment[1]);
      }
    });

    this.dataShareService.countrySurveyAnswer.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (answer) => {
        this.countrySurveyAnswer = answer;
      }
    });
  }

  /** Get OA VS closed, restricted and embargoed Publications -----------------------------------------------------> **/
  getPublicationPercentage() {
    this.queryData.getOSOStats(OAvsTotalPubsPerCountry(this.countryCode)).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.OAPubsPercentage[0] = this.dataShareService.calculatePercentage(value.data[0][0][0], value.data[1][0][0]);
        this.OAPubsPercentage[1] = this.dataShareService.calculatePercentage(value.data[2][0][0], value.data[3][0][0]);
        this.OAPubsPercentageDiff = this.dataShareService.calculateDiff(this.OAPubsPercentage[0], this.OAPubsPercentage[1]);
      }
    });
  }

  /** Get Open VS closed, restricted and embargoed Data -----------------------------------------------------------> **/
  getOpenDataPercentage() {
    this.queryData.getOSOStats(OAvsTotalDataPerCountry(this.countryCode)).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.OpenDataPercentage[0] = this.dataShareService.calculatePercentage(value.data[0][0][0], value.data[1][0][0]);
        this.OpenDataPercentage[1] = this.dataShareService.calculatePercentage(value.data[2][0][0], value.data[3][0][0]);
        this.OpenDataPercentageDiff = this.dataShareService.calculateDiff(this.OpenDataPercentage[0], this.OpenDataPercentage[1]);
      }
    });
  }

  hasAnyLeftCardData(){
    return this.dataCheckService.hasAnyValue([
      this.OAPubsPercentage[1],
      this.OpenDataPercentage[1],
      this.totalInvestment[1],
      this.openSoftware[1]
    ]);
  }

  hasSurveyGeneralData(): boolean {
    const surveyData = this.countrySurveyAnswer?.['SCIENCE, TECHNOLOGY & INNOVATION - STI POLICY FRAMEWORK'];
    if (!surveyData) {
      return false;
    }
    const questions = ['Question2', 'Question3', 'Question4', 'Question30'];
    return this.dataCheckService.hasSurveyData(surveyData, questions)
  }

}
