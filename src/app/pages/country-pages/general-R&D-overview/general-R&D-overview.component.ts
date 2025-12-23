import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { DataShareService } from "../services/data-share.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { OAvsTotalDataPerCountry, OAvsTotalPubsPerCountry } from "../coutry-pages.queries";
import { EoscReadinessDataService } from "../../services/eosc-readiness-data.service";
import {
  CatalogueUiReusableComponentsModule
} from "../../../../survey-tool/catalogue-ui/shared/reusable-components/catalogue-ui-reusable-components.module";
import { SidebarMobileToggleComponent } from "../../../../survey-tool/app/shared/dashboard-side-menu/mobile-toggle/sidebar-mobile-toggle.component";
import { PageContentComponent } from "../../../../survey-tool/app/shared/page-content/page-content.component";
import { InfoCardComponent } from "src/app/shared/reusable-components/info-card/info-card.component";
import { PdfExportService } from "../../services/pdf-export.service";
import {combineLatest} from "rxjs";
import {filter} from "rxjs/operators";
import { ExploreService } from "../../explore/explore.service";



@Component({
    selector: 'app-general-R&D-overview',
    templateUrl: './general-R&D-overview.component.html',
    imports: [
        CommonModule,
        NgOptimizedImage,
        CatalogueUiReusableComponentsModule,
        SidebarMobileToggleComponent,
        PageContentComponent,
        InfoCardComponent
    ]
})

export class GeneralRDOverviewComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private exploreService = inject(ExploreService);

  protected readonly Math = Math;
  exportActive = false;

  openSoftware: (string | null)[] = [null, null];
  openSoftwarePercentageDiff: number | null = null;
  rfos: (string | null)[] = [null, null];
  rfosPercentageDiff: number | null = null;
  rpos: (string | null)[] = [null, null];
  rposPercentageDiff: number | null = null;
  totalInvestment: (string | null)[] = [null, null];
  investmentPercentageDiff: (number | null) = null;
  OAPubsPercentage: (number | null)[] = [null, null];
  OAPubsPercentageDiff: number | null = null;
  OpenDataPercentage: (number | null)[] = [null, null];
  OpenDataPercentageDiff: number | null = null;

  countryCode?: string;
  countryName?: string;
  surveyAnswers: Object[] = [null, null];
  countrySurveyAnswer?: Object;
  countrySurveyAnswerLastUpdate: string | null = null;
  year: string;
  prevYear: string;
  lastUpdateDate?: string;

  constructor(private dataShareService: DataShareService, private queryData: EoscReadinessDataService, private pdfService: PdfExportService) {}

  ngOnInit() {

    combineLatest([
      this.dataShareService.countryCode$,
      this.dataShareService.year$,
    ])
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter(([code, year]) => !!code && !!year)
      )
    .subscribe(([code, year]) => {
      this.countryCode = code;
      this.year = year;
      const numericYear = +year;
      this.prevYear = (numericYear - 1).toString();
      this.getPublicationPercentage();
      this.getOpenDataPercentage();
    });

    this.exploreService._lastUpdateDate.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => this.lastUpdateDate = value
    });

    this.dataShareService.countryName.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (name) => {
        this.countryName = name;
      }
    });

    this.dataShareService.surveyAnswers.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (answers) => {
        this.surveyAnswers = answers;
        this.initData();
      }
    });

    this.dataShareService.countrySurveyAnswer.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (answer) => {
        this.countrySurveyAnswer = answer;
      }
    });

    this.dataShareService.countrySurveyAnswerMetaData.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (metadata) => {
        this.countrySurveyAnswerLastUpdate = metadata?.lastUpdate ?? null;
      }
    });

  }

  /** Get OA VS closed, restricted and embargoed Publications -----------------------------------------------------> **/
  getPublicationPercentage() {
    this.queryData.getOSOStats(OAvsTotalPubsPerCountry(this.countryCode, this.year)).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.OAPubsPercentage[0] = this.dataShareService.calculatePercentage(value.data[0][0][0], value.data[1][0][0]);
        this.OAPubsPercentage[1] = this.dataShareService.calculatePercentage(value.data[2][0][0], value.data[3][0][0]);
        this.OAPubsPercentageDiff = this.dataShareService.calculateDiff(this.OAPubsPercentage[0], this.OAPubsPercentage[1]);
      }
    });
  }

  /** Get Open VS closed, restricted and embargoed Data -----------------------------------------------------------> **/
  getOpenDataPercentage() {
    this.queryData.getOSOStats(OAvsTotalDataPerCountry(this.countryCode, this.prevYear, this.year)).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.OpenDataPercentage[0] = this.dataShareService.calculatePercentage(value.data[0][0][0], value.data[1][0][0]);
        this.OpenDataPercentage[1] = this.dataShareService.calculatePercentage(value.data[2][0][0], value.data[3][0][0]);
        this.OpenDataPercentageDiff = this.dataShareService.calculateDiff(this.OpenDataPercentage[0], this.OpenDataPercentage[1]);
      }
    });
  }

  /** Gets and initializes data from surveys for open software usage and total investment,
   * calculates percentage differences between consecutive years
   */
  initData() {
    if (this.surveyAnswers[1] === null)
      return;

    this.openSoftware[0] = this.surveyAnswers[0]?.['Practices']?.['Question73']?.['Question73-0'] || null;
    this.openSoftware[1] = this.surveyAnswers[1]?.['Practices']?.['Question73']?.['Question73-0'] || null;
    this.openSoftwarePercentageDiff = this.dataShareService.calculateDiffAsPercentage(this.openSoftware[0], this.openSoftware[1]);

    this.totalInvestment[0] = this.surveyAnswers[0]?.['General']?.['Question5']?.['Question5-0'] || null;
    this.totalInvestment[1] = this.surveyAnswers[1]?.['General']?.['Question5']?.['Question5-0'] || null;
    this.investmentPercentageDiff = this.dataShareService.calculateDiffAsPercentage(this.totalInvestment[0], this.totalInvestment[1]);

    this.rfos[0] = this.surveyAnswers[0]?.['General']?.['Question3']?.['Question3-0'] || null;
    this.rfos[1] = this.surveyAnswers[1]?.['General']?.['Question3']?.['Question3-0'] || null;
    this.rfosPercentageDiff = this.dataShareService.calculateDiffAsPercentage(this.rfos[0], this.rfos[1]);

    this.rpos[0] = this.surveyAnswers[0]?.['General']?.['Question2']?.['Question2-0'] || null;
    this.rpos[1] = this.surveyAnswers[1]?.['General']?.['Question2']?.['Question2-0'] || null;
    this.rposPercentageDiff = this.dataShareService.calculateDiffAsPercentage(this.rpos[0], this.rpos[1]);
  }

  hasAnyLeftCardData(){
    return this.dataShareService.hasAnyValue([
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
    return this.dataShareService.hasSurveyData(surveyData, questions)
  }

    /** Export to PDF -----------------------------------------------------------------------------------------------> **/

  exportToPDF(contents: HTMLElement[], filename?: string) {
    this.exportActive = true

    // Χρόνος για να εφαρμοστούν τα styles
    // setTimeout(() => {
      this.pdfService.export(contents, filename).then(() => {
        // this.restoreAnimations(modifiedElements, contents);
        this.exportActive = false;
      }).catch((error) => {
        // this.restoreAnimations(modifiedElements, contents);
        this.exportActive = false;
        console.error('Error during PDF generation:', error);
      });
    // }, 0);
  }
}
