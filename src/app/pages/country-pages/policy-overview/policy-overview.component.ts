import { Component, DestroyRef, inject, ChangeDetectionStrategy, signal } from "@angular/core";
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { DataShareService } from "../services/data-share.service";
import {
  ReadMoreComponent
} from "src/survey-tool/catalogue-ui/shared/reusable-components/read-more.component";
import {
  SidebarMobileToggleComponent
} from "src/survey-tool/app/shared/dashboard-side-menu/mobile-toggle/sidebar-mobile-toggle.component";
import { PageContentComponent } from "src/survey-tool/app/shared/page-content/page-content.component";
import { PdfExportService } from "../../services/pdf-export.service";
import { SearchCardComponent } from "../../explore/resources-registry/search/card/search-card.component";
import { ResourceRegistryService } from "../../explore/resources-registry/resource-registry.service";
import { Paging } from "src/survey-tool/catalogue-ui/domain/paging";
import { Document, HighlightedResults } from "src/app/domain/document";

class TableRow {
  OSArea: string;
  nationalPolicy: string;
  financialStrategy: string;

  constructor(OSArea: string, nationalPolicy: string, financialStrategy: string) {
    this.OSArea = OSArea;
    this.nationalPolicy = nationalPolicy;
    this.financialStrategy = financialStrategy;
  }
}

import { CardConfigComponent } from "../card-config/card-config.component";
import { SectionHiddenNoticeComponent } from "../section-hidden-notice/section-hidden-notice.component";

@Component({
  selector: 'app-policy-overview',
  templateUrl: './policy-overview.component.html',
  styleUrls: ['../../dashboard/country-landing-page/country-landing-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgOptimizedImage,
    CommonModule,
    ReadMoreComponent,
    SidebarMobileToggleComponent,
    PageContentComponent,
    SearchCardComponent,
    CardConfigComponent,
    SectionHiddenNoticeComponent
  ]
})

export class PolicyOverviewComponent {
  private destroyRef = inject(DestroyRef);
  private dataShareService =  inject(DataShareService);
  private pdfService = inject(PdfExportService);
  private resourceService = inject(ResourceRegistryService);

  exportActive = signal(false);

  countryCode?: string;
  /** Code used only for the flag/label (EU for the Global default); data still uses countryCode. */
  flagCode = signal<string>(undefined);
  countryName = signal<string>(undefined);
  surveyAnswers: Object[] = [];
  table = signal<TableRow[]>([]);
  countrySurveyAnswer = signal<Object>(undefined);
  countrySurveyAnswerLastUpdate = signal<string | null>(null);
  year = signal<string>(undefined);

  documents = signal<HighlightedResults<Document>[]>([]);

  ngOnInit() {
    this.dataShareService.countryCode.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (code) => {
        this.countryCode = code;
      }
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
        if (this.surveyAnswers[1] === null)
          return;

        this.populateTable();
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


    this.resourceService.getDocument(0, 10, [{key: 'country', values:[this.countryCode]}], false).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => {
        this.documents.set(data.results as HighlightedResults<Document>[]);
      },
      error: (error) => {
        console.error('Error fetching resources:', error);
      }
    });

    this.dataShareService.year.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (year) => {
        this.year.set(year);
      }
    })
  }

  /**
   * Populates the table array with policy data from survey answers.
   * Creates TableRow objects for different Open Science areas containing:
   * - OSArea: The name of the Open Science area
   * - nationalPolicy: The national policy status
   * - financialStrategy: The financial strategy status
   * The data is extracted from the most recent survey answers
   */
  populateTable() {
    const table: TableRow[] = [];
    table.push(new TableRow('Publications', this.surveyAnswers[1]?.['Policies']?.['Question6']?.['Question6-0'], this.surveyAnswers[1]?.['Policies']?.['Question7']?.['Question7-0']));
    table.push(new TableRow('Data Management', this.surveyAnswers[1]?.['Policies']?.['Question10']?.['Question10-0'], this.surveyAnswers[1]?.['Policies']?.['Question11']?.['Question11-0']));
    table.push(new TableRow('FAIR Data', this.surveyAnswers[1]?.['Policies']?.['Question14']?.['Question14-0'], this.surveyAnswers[1]?.['Policies']?.['Question15']?.['Question15-0']));
    table.push(new TableRow('Open Data', this.surveyAnswers[1]?.['Policies']?.['Question18']?.['Question18-0'], this.surveyAnswers[1]?.['Policies']?.['Question19']?.['Question19-0']));
    table.push(new TableRow('Software', this.surveyAnswers[1]?.['Policies']?.['Question22']?.['Question22-0'], this.surveyAnswers[1]?.['Policies']?.['Question23']?.['Question23-0']));
    table.push(new TableRow('Services', this.surveyAnswers[1]?.['Policies']?.['Question26']?.['Question26-0'], this.surveyAnswers[1]?.['Policies']?.['Question27']?.['Question27-0']));
    table.push(new TableRow('Connecting repositories to EOSC', this.surveyAnswers[1]?.['Policies']?.['Question30']?.['Question30-0'], this.surveyAnswers[1]?.['Policies']?.['Question31']?.['Question31-0']));
    table.push(new TableRow('Data stewardship', this.surveyAnswers[1]?.['Policies']?.['Question34']?.['Question34-0'], this.surveyAnswers[1]?.['Policies']?.['Question35']?.['Question35-0']));
    table.push(new TableRow('Long-term data preservation', this.surveyAnswers[1]?.['Policies']?.['Question38']?.['Question38-0'], this.surveyAnswers[1]?.['Policies']?.['Question39']?.['Question39-0']));
    table.push(new TableRow('Skills/Training', this.surveyAnswers[1]?.['Policies']?.['Question42']?.['Question42-0'], this.surveyAnswers[1]?.['Policies']?.['Question43']?.['Question43-0']));
    table.push(new TableRow('Assessment', this.surveyAnswers[1]?.['Policies']?.['Question46']?.['Question46-0'], this.surveyAnswers[1]?.['Policies']?.['Question47']?.['Question47-0']));
    table.push(new TableRow('Engagement', this.surveyAnswers[1]?.['Policies']?.['Question50']?.['Question50-0'], this.surveyAnswers[1]?.['Policies']?.['Question51']?.['Question51-0']));
    this.table.set(table);
  }

  hasSurveyPolicyData(): boolean {
    const surveyData = this.countrySurveyAnswer()?.['OPEN SCIENCE POLICY'];
    if (!surveyData) {
      return false;
    }

    const questions = ['Question10', 'Question11', 'Question12', 'Question13'];
    return this.dataShareService.hasSurveyData(surveyData, questions);
  }

  exportToPDF(contents: HTMLElement[], filename?: string) {
    this.exportActive.set(true);

    this.pdfService.export(contents, filename).then(() => {
      // this.restoreAnimations(modifiedElements, contents);
      this.exportActive.set(false);
    }).catch((error) => {
      // this.restoreAnimations(modifiedElements, contents);
      this.exportActive.set(false);
      console.error('Error during PDF generation:', error);
    });
  }

}


