import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { DataShareService } from "../services/data-share.service";
import {
  CatalogueUiReusableComponentsModule
} from "src/survey-tool/catalogue-ui/shared/reusable-components/catalogue-ui-reusable-components.module";
import * as Highcharts from "highcharts/highcharts.src";
import { ExploreService } from "../../explore/explore.service";
import { ChartsModule } from "../../../shared/charts/charts.module";
import { SidebarMobileToggleComponent } from "../../../../survey-tool/app/shared/dashboard-side-menu/mobile-toggle/sidebar-mobile-toggle.component";
import { PageContentComponent } from "../../../../survey-tool/app/shared/page-content/page-content.component";
import { InfoCardComponent } from "src/app/shared/reusable-components/info-card/info-card.component";
import { PdfExportService } from "../../services/pdf-export.service";


@Component({
    selector: 'app-data-management',
    imports: [
        CommonModule,
        NgOptimizedImage,
        CatalogueUiReusableComponentsModule,
        ChartsModule,
        SidebarMobileToggleComponent,
        PageContentComponent,
        InfoCardComponent
    ],
    templateUrl: './data-management.component.html'
})
export class DataManagementComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  protected readonly Math = Math;
  exportActive = false;

  countryCode?: string;
  countryName?: string;
  surveyAnswers: Object[] = [];
  countrySurveyAnswer?: Object;
  countrySurveyAnswerLastUpdate: string | null = null;

  rfoDataManagementPercentage: (number | null)[] = [null, null];
  rfoDataManagementPercentageDiff: number | null = null;
  rpoDataManagementPercentage: (number | null)[] = [null, null];
  rpoDataManagementPercentageDiff: number | null = null;
  financialInvestmentDM: (string | null)[] = [null, null];
  financialInvestmentDMPercentageDiff: number | null = null;
  nationalPolicyResponse: string | null = null;
  financialStrategyResponse: string | null = null;
  nationalPolicyClarification: string | null = null;
  financialStrategyClarification: string | null = null;
  monitoringResponse: string | null = null;
  monitoringClarification: string | null = null;
  policyMandatory: string | null = null;

  stackedColumnSeries1 = [
    {
      type: 'column',
      name: 'RPOs with Policy on Data Management',
      data: [],
      // color: colors[0]
    }, {
      type: 'column',
      name: 'RPOs without Policy on Data Management',
      data: [],
      // color: colors[7]
    }
  ] as Highcharts.SeriesColumnOptions[];
  stackedColumnSeries2 = [
    {
      type: 'column',
      name: 'RFOs with Policy on Data Management',
      data: [],
      // color: colors[1]
    }, {
      type: 'column',
      name: 'RFOs without Policy on Data Management',
      data: [],
      // color: colors[8]
    }
  ] as Highcharts.SeriesColumnOptions[];
  stackedColumnCategories = ['2021', '2022'];
  xAxisTitle = 'Year'
  yAxisTitle = 'Percentage of Policies on Data Management'
  tooltipPointFormat = '<span style="color:{series.color}">{series.name}</span> : <b>{point.y}</b>';
  labelFormat = '{value}%';
  plotFormat = '{point.percentage:.0f}%';

  constructor(private dataShareService: DataShareService, private exploreService: ExploreService, private pdfService: PdfExportService) {}

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

        if (this.surveyAnswers[1] === null)
          return;

        this.initCardValues();
        this.createStackedColumns();
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

  initCardValues() {
    this.rfoDataManagementPercentage[1] = this.dataShareService.calculatePercentage(this.surveyAnswers[1]?.['Policies']?.['Question13']?.['Question13-0'], this.surveyAnswers[1]?.['General']?.['Question3']?.['Question3-0']);
    this.rfoDataManagementPercentage[0] = this.dataShareService.calculatePercentage(this.surveyAnswers[0]?.['Policies']?.['Question13']?.['Question13-0'], this.surveyAnswers[0]?.['General']?.['Question3']?.['Question3-0']);
    this.rfoDataManagementPercentageDiff = this.dataShareService.calculateDiff(this.rfoDataManagementPercentage[0], this.rfoDataManagementPercentage[1]);

    this.rpoDataManagementPercentage[1] = this.dataShareService.calculatePercentage(this.surveyAnswers[1]?.['Policies']?.['Question12']?.['Question12-0'], this.surveyAnswers[1]?.['General']?.['Question2']?.['Question2-0']);
    this.rpoDataManagementPercentage[0] = this.dataShareService.calculatePercentage(this.surveyAnswers[0]?.['Policies']?.['Question12']?.['Question12-0'], this.surveyAnswers[0]?.['General']?.['Question2']?.['Question2-0']);
    this.rpoDataManagementPercentageDiff = this.dataShareService.calculateDiff(this.rpoDataManagementPercentage[0], this.rpoDataManagementPercentage[1]);

    this.financialInvestmentDM[1] = this.surveyAnswers[1]?.['Practices']?.['Question60']?.['Question60-0'];
    this.financialInvestmentDM[0] = this.surveyAnswers[0]?.['Practices']?.['Question60']?.['Question60-0'];
    this.financialInvestmentDMPercentageDiff = this.dataShareService.calculateDiffAsPercentage(this.financialInvestmentDM[0], this.financialInvestmentDM[1]);


    this.nationalPolicyResponse = this.surveyAnswers[1]?.['Policies']?.['Question10']?.['Question10-0'] || null;
    this.policyMandatory = this.surveyAnswers[1]?.['Policies']?.['Question5']?.['Question6-5-0']?.['Question5-1'] || null;
    this.nationalPolicyClarification = this.surveyAnswers[1]?.['Policies']?.['Question10']?.['Question10-3'] || null;

    this.financialStrategyResponse = this.surveyAnswers[1]?.['Policies']?.['Question11']?.['Question11-0'] || null;
    this.financialStrategyClarification = this.surveyAnswers[1]?.['Policies']?.['Question11']?.['Question11-1'] || null;

    this.monitoringResponse = this.surveyAnswers[1]?.['Practices']?.['Question58']?.['Question58-0'] || null;
    this.monitoringClarification = this.surveyAnswers[1]?.['Practices']?.['Question58']?.['Question58-1'] || null;

  }

  createStackedColumns() {

    const rpo: string[] = [  // research performing organisations
      this.surveyAnswers[0]?.['General']?.['Question2']?.['Question2-0'],
      this.surveyAnswers[1]?.['General']?.['Question2']?.['Question2-0']
    ];
    const rpoWithPolicy: string[] = [ // research performing organisations in your country with a policy on data management
      this.surveyAnswers[0]?.['Policies']?.['Question12']?.['Question12-0'],
      this.surveyAnswers[1]?.['Policies']?.['Question12']?.['Question12-0']
    ];

    if (this.exploreService.isNumeric(rpoWithPolicy[0]) && this.exploreService.isNumeric(rpoWithPolicy[1])) {
      this.stackedColumnSeries1[0].data.push(+rpoWithPolicy[0], +rpoWithPolicy[1]);

      if (this.exploreService.isNumeric(rpo[0]) && this.exploreService.isNumeric(rpo[1])) {
        this.stackedColumnSeries1[1].data.push(+rpo[0] - +rpoWithPolicy[0], +rpo[1] - +rpoWithPolicy[1])
      }
    }


    const rfo: string[] = [  // research funding organisations
      this.surveyAnswers[0]?.['General']?.['Question3']?.['Question3-0'],
      this.surveyAnswers[1]?.['General']?.['Question3']?.['Question3-0']
    ];
    const rfoWithPolicy: string[] = [ // research funding organisations in your country have a policy on data management
      this.surveyAnswers[0]?.['Policies']?.['Question13']?.['Question13-0'],
      this.surveyAnswers[1]?.['Policies']?.['Question13']?.['Question13-0']
    ];

    if (this.exploreService.isNumeric(rfoWithPolicy[0]) && this.exploreService.isNumeric(rfoWithPolicy[1])) {
      this.stackedColumnSeries2[0].data.push(+rfoWithPolicy[0], +rfoWithPolicy[1]);

      if (this.exploreService.isNumeric(rfo[0]) && this.exploreService.isNumeric(rfo[1])) {
        this.stackedColumnSeries2[1].data.push(+rfo[0] - +rpoWithPolicy[0], +rfo[1] - +rpoWithPolicy[1])
      }
    }

    this.stackedColumnSeries1 = [...this.stackedColumnSeries1];
    this.stackedColumnSeries2 = [...this.stackedColumnSeries2];
  }

  hasAnyLeftCardData() {
    return this.dataShareService.hasAnyValue([
      this.rfoDataManagementPercentage[1],
      this.rpoDataManagementPercentage[1],
      this.financialInvestmentDM[1],
    ]);
  }

  hasSurveyDataManagementData(): boolean {
    const surveyData = this.countrySurveyAnswer?.['OPEN SCIENCE DIGITAL INFRASTRUCTURE'];
    if (!surveyData) {
      return false;
    }
    const questions = ['Question15'];
    return this.dataShareService.hasSurveyData(surveyData, questions);
  }

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
