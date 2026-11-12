import { Component, DestroyRef, inject, OnInit, ChangeDetectionStrategy, signal } from "@angular/core";
import {CommonModule, NgOptimizedImage} from "@angular/common";
import {DataShareService} from "../services/data-share.service";
import { CountryPageIndicatorsService } from "../services/country-page-indicators.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {OAvsTotalDataPerCountry, OAvsTotalPubsPerCountry} from "../coutry-pages.queries";
import {EoscReadinessDataService} from "../../services/eosc-readiness-data.service";
import {
  ReadMoreComponent
} from "src/survey-tool/catalogue-ui/shared/reusable-components/read-more.component";
import {
  SidebarMobileToggleComponent
} from "src/survey-tool/app/shared/dashboard-side-menu/mobile-toggle/sidebar-mobile-toggle.component";
import {PageContentComponent} from "src/survey-tool/app/shared/page-content/page-content.component";
import {InfoCardComponent} from "src/app/shared/reusable-components/info-card/info-card.component";
import {PdfExportService} from "../../services/pdf-export.service";
import {combineLatest} from "rxjs";
import {filter} from "rxjs/operators";
import {ExploreService} from "../../explore/explore.service";
import {StakeholderNewsService} from "../../services/stakeholder-news.service";
import {NewsItem} from "src/app/domain/news";


import { CardConfigComponent } from "../card-config/card-config.component";
import { SectionHiddenNoticeComponent } from "../section-hidden-notice/section-hidden-notice.component";
import { setAt } from "src/app/shared/utils/set-at";

@Component({
  selector: 'app-general-R&D-overview',
  templateUrl: './general-R&D-overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    NgOptimizedImage,
    ReadMoreComponent,
    SidebarMobileToggleComponent,
    PageContentComponent,
    InfoCardComponent,
    CardConfigComponent,
    SectionHiddenNoticeComponent
  ]
})

export class GeneralRDOverviewComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private exploreService = inject(ExploreService);
  private newsService = inject(StakeholderNewsService);

  protected readonly Math = Math;
  exportActive = signal(false);

  openSoftware = signal<(string | null)[]>([null, null]);
  openSoftwarePercentageDiff = signal<number | null>(null);
  rfos = signal<(string | null)[]>([null, null]);
  rfosPercentageDiff = signal<number | null>(null);
  rpos = signal<(string | null)[]>([null, null]);
  rposPercentageDiff = signal<number | null>(null);
  totalInvestment = signal<(string | null)[]>([null, null]);
  investmentPercentageDiff = signal<(number | null)>(null);
  OAPubsPercentage = signal<(number | null)[]>([null, null]);
  OAPubsPercentageDiff = signal<number | null>(null);
  OpenDataPercentage = signal<(number | null)[]>([null, null]);
  OpenDataPercentageDiff = signal<number | null>(null);

  countryNewsItems = signal<NewsItem[]>([]);

  countryCode?: string;
  /** Code used only for the flag/label (EU for the Global default); data still uses countryCode. */
  flagCode = signal<string>(undefined);
  countryName = signal<string>(undefined);
  surveyAnswers: Object[] = [null, null];
  countrySurveyAnswer = signal<Object>(undefined);
  countrySurveyAnswerLastUpdate = signal<string | null>(null);
  year = signal<string>(undefined);
  prevYear: string;
  lastUpdateDate = signal<string>(undefined);

  private dataShareService = inject(DataShareService);
  private queryData = inject(EoscReadinessDataService);
  private pdfService = inject(PdfExportService);

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
        this.year.set(year);
        const numericYear = +year;
        this.prevYear = (numericYear - 1).toString();
        this.getPublicationPercentage();
        this.getOpenDataPercentage();
        this.loadCountryNews();
      });

    this.exploreService._lastUpdateDate.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => this.lastUpdateDate.set(value)
    });

    this.dataShareService.countryName.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (name) => {
        this.countryName.set(name);
      }
    });

    this.dataShareService.displayCountryCode$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (code) => {
        this.flagCode.set(code);
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
        this.countrySurveyAnswer.set(answer);
      }
    });

    this.dataShareService.countrySurveyAnswerMetaData.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (metadata) => {
        this.countrySurveyAnswerLastUpdate.set(metadata?.lastUpdate ?? null);
      }
    });

  }

  /** Get OA VS closed, restricted and embargoed Publications -----------------------------------------------------> **/
  getPublicationPercentage() {
    this.queryData.getOSOStats(OAvsTotalPubsPerCountry(this.countryCode, this.year())).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        setAt(this.OAPubsPercentage, 0, this.dataShareService.calculatePercentage(value.data[0][0][0], value.data[1][0][0]));
        setAt(this.OAPubsPercentage, 1, this.dataShareService.calculatePercentage(value.data[2][0][0], value.data[3][0][0]));
        this.OAPubsPercentageDiff.set(this.dataShareService.calculateDiff(this.OAPubsPercentage()[0], this.OAPubsPercentage()[1]));
      }
    });
  }

  /** Get Open VS closed, restricted and embargoed Data -----------------------------------------------------------> **/
  getOpenDataPercentage() {
    this.queryData.getOSOStats(OAvsTotalDataPerCountry(this.countryCode, this.prevYear, this.year())).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        setAt(this.OpenDataPercentage, 0, this.dataShareService.calculatePercentage(value.data[0][0][0], value.data[1][0][0]));
        setAt(this.OpenDataPercentage, 1, this.dataShareService.calculatePercentage(value.data[2][0][0], value.data[3][0][0]));
        this.OpenDataPercentageDiff.set(this.dataShareService.calculateDiff(this.OpenDataPercentage()[0], this.OpenDataPercentage()[1]));
      }
    });
  }

  /** Fetch public, date-valid news for the current country ----------------------------------------------------> **/
  loadCountryNews() {
    if (!this.countryCode) return;
    const stakeholderId = 'sh-eosc-sb-' + this.countryCode;
    this.newsService.getPublicNews(stakeholderId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (items) => {
          this.countryNewsItems.set(items);
        }
      });
  }

  /** Gets and initializes data from surveys for open software usage and total investment,
   * calculates percentage differences between consecutive years
   */
  initData() {
    if (this.surveyAnswers[1] === null)
      return;

    setAt(this.openSoftware, 0, this.surveyAnswers[0]?.['Practices']?.['Question73']?.['Question73-0'] || null);
    setAt(this.openSoftware, 1, this.surveyAnswers[1]?.['Practices']?.['Question73']?.['Question73-0'] || null);
    this.openSoftwarePercentageDiff.set(this.dataShareService.calculateDiffAsPercentage(this.openSoftware()[0], this.openSoftware()[1]));

    setAt(this.totalInvestment, 0, this.surveyAnswers[0]?.['General']?.['Question5']?.['Question5-0'] || null);
    setAt(this.totalInvestment, 1, this.surveyAnswers[1]?.['General']?.['Question5']?.['Question5-0'] || null);
    this.investmentPercentageDiff.set(this.dataShareService.calculateDiffAsPercentage(this.totalInvestment()[0], this.totalInvestment()[1]));

    setAt(this.rfos, 0, this.surveyAnswers[0]?.['General']?.['Question3']?.['Question3-0'] || null);
    setAt(this.rfos, 1, this.surveyAnswers[1]?.['General']?.['Question3']?.['Question3-0'] || null);
    this.rfosPercentageDiff.set(this.dataShareService.calculateDiffAsPercentage(this.rfos()[0], this.rfos()[1]));

    setAt(this.rpos, 0, this.surveyAnswers[0]?.['General']?.['Question2']?.['Question2-0'] || null);
    setAt(this.rpos, 1, this.surveyAnswers[1]?.['General']?.['Question2']?.['Question2-0'] || null);
    this.rposPercentageDiff.set(this.dataShareService.calculateDiffAsPercentage(this.rpos()[0], this.rpos()[1]));
  }

  private readonly indicatorsService = inject(CountryPageIndicatorsService);

  /** Left card block renders only if at least one of its cards will be visible (see service). */
  hasAnyLeftCardVisible(): boolean {
    return this.indicatorsService.anyCardVisible([
      { id: '1', hasData: this.OAPubsPercentage()[1]  != null },
      { id: '2', hasData: this.OpenDataPercentage()[1] != null },
      { id: '3', hasData: this.totalInvestment()[1]    != null },
      { id: '4', hasData: this.openSoftware()[1]       != null },
    ]);
  }

  hasAnyLeftCardData() {
    return this.dataShareService.hasAnyValue([
      this.OAPubsPercentage()[1],
      this.OpenDataPercentage()[1],
      this.totalInvestment()[1],
      this.openSoftware()[1]
    ]);
  }

  hasSurveyGeneralData(): boolean {
    const stiData = this.countrySurveyAnswer()?.['SCIENCE, TECHNOLOGY & INNOVATION - STI POLICY FRAMEWORK'];
    const stiQuestions = ['Question2', 'Question3', 'Question4', 'Question30', 'Question5', 'Question6', 'Question7', 'Question8', 'Question9', 'Question10'];

    const infraData = this.countrySurveyAnswer()?.['OPEN SCIENCE DIGITAL INFRASTRUCTURE'];
    const infraQuestions = ['Question14', 'Question21', 'Question23', 'Question32', 'Question33'];

    const policyData = this.countrySurveyAnswer()?.['OPEN_SCIENCE_POLICY'];
    const policyQuestions = ['Question11'];

    if (!stiData && !infraData && !policyData) {
      return false;
    }
    const hasSti = stiData ? this.dataShareService.hasSurveyData(stiData, stiQuestions) : false;
    const hasInfra = infraData ? this.dataShareService.hasSurveyData(infraData, infraQuestions) : false;
    const hasPolicy = policyData ? this.dataShareService.hasSurveyData(policyData, policyQuestions) : false;

    return hasSti || hasInfra || hasPolicy;
  }

  /** Export to PDF -----------------------------------------------------------------------------------------------> **/

  exportToPDF(contents: HTMLElement[], filename?: string) {
    this.exportActive.set(true)

    // Χρόνος για να εφαρμοστούν τα styles
    // setTimeout(() => {
    this.pdfService.export(contents, filename).then(() => {
      // this.restoreAnimations(modifiedElements, contents);
      this.exportActive.set(false);
    }).catch((error) => {
      // this.restoreAnimations(modifiedElements, contents);
      this.exportActive.set(false);
      console.error('Error during PDF generation:', error);
    });
    // }, 0);
  }
}
