import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { DataShareService } from "../services/data-share.service";
import {
  CatalogueUiReusableComponentsModule
} from 'src/survey-tool/catalogue-ui/shared/reusable-components/catalogue-ui-reusable-components.module';
import * as Highcharts from "highcharts/highcharts.src";
import { ExploreService } from "../../explore/explore.service";
import { ChartsModule } from "../../../shared/charts/charts.module";
import { SidebarMobileToggleComponent } from "../../../../survey-tool/app/shared/dashboard-side-menu/mobile-toggle/sidebar-mobile-toggle.component";
import { PageContentComponent } from "../../../../survey-tool/app/shared/page-content/page-content.component";
import { InfoCardComponent } from "src/app/shared/reusable-components/info-card/info-card.component";


@Component({
    selector: 'app-fair-data',
    imports: [
        CommonModule,
        NgOptimizedImage,
        CatalogueUiReusableComponentsModule,
        ChartsModule,
        SidebarMobileToggleComponent,
        PageContentComponent,
        InfoCardComponent
    ],
    templateUrl: './fair-data.component.html'
})
export class FairDataComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  protected readonly Math = Math;

  countryCode?: string;
  countryName?: string;
  surveyAnswers: Object[] = [];
  countrySurveyAnswer?: Object;

  rfoFairDataPercentage: (number | null)[] = [null, null];
  rfoFairDataPercentageDiff: number | null = null;
  rpoFairDataPercentage: (number | null)[] = [null,null];
  rpoFairDataPercentageDiff: number | null = null;
  financialInvestmentInFairData: (string | null)[] = [null, null];
  financialInvestmentInFairDataPercentageDiff: number | null = null;
  hasNationalPolicyFD: string | null = null;
  nationalPolicyClarificationFD: string | null = null;
  hasFinancialStrategyFD: string | null = null;
  financialStrategyClarificationFD: string | null = null;
  hasMonitoringFD: string | null = null;
  monitoringClarificationFD: string | null = null;
  policyMandatoryFD: string | null = null;

  stackedColumnSeries1 = [
    {
      type: 'column',
      name: 'Research Performing Organisations with Policy',
      data: [],
      // color: colors[0]
    }, {
      type: 'column',
      name: 'Research Performing Organisations without Policy',
      data: [],
      // color: colors[7]
    }
  ] as Highcharts.SeriesColumnOptions[];
  stackedColumnSeries2 = [
    {
      type: 'column',
      name: 'Research Funding Organisations with Policy',
      data: [],
      // color: colors[1]
    }, {
      type: 'column',
      name: 'Research Funding Organisations without Policy',
      data: [],
      // color: colors[8]
    }
  ] as Highcharts.SeriesColumnOptions[];
  stackedColumnCategories = ['2021', '2022'];
  xAxisTitle = 'Year';
  yAxisTitle = 'Percentage of Policies on FAIR Data';
  tooltipPointFormat = '<span style="color:{series.color}">{series.name}</span> : <b>{point.y}</b>';
  labelFormat = '{value}%';
  plotFormat = '{point.percentage:.0f}%';

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
  }

  hasAnyLeftCardData() {
    return this.dataShareService.hasAnyValue([
      this.rfoFairDataPercentage[1],
      this.rpoFairDataPercentage[0],
      this.financialInvestmentInFairData[1]
    ]);
  }

  hasCountrySurveyAnswerData() {
    const surveyData = this.countrySurveyAnswer?.['OPEN SCIENCE DIGITAL INFRASTRUCTURE'];
    if (!surveyData) {
      return false;
    }
    const questions = ['Question15', 'Question18'];
    return this.dataShareService.hasSurveyData(surveyData, questions);

  }


  initCardValues() {
    this.rfoFairDataPercentage[1] = this.dataShareService.calculatePercentage(this.surveyAnswers[1]?.['Policies']?.['Question17']?.['Question17-0'], this.surveyAnswers[1]?.['General']?.['Question3']?.['Question3-0']);
    this.rfoFairDataPercentage[0] = this.dataShareService.calculatePercentage(this.surveyAnswers[0]?.['Policies']?.['Question17']?.['Question17-0'], this.surveyAnswers[0]?.['General']['Question3']?.['Question3-0']);
    this.rfoFairDataPercentageDiff = this.dataShareService.calculateDiff(this.rfoFairDataPercentage[0], this.rfoFairDataPercentage[1]);

    this.rpoFairDataPercentage[1] = this.dataShareService.calculatePercentage(this.surveyAnswers[1]?.['Policies']?.['Question16']?.['Question16-0'], this.surveyAnswers[1]?.['General']?.['Question2']?.['Question2-0']);
    this.rpoFairDataPercentage[0] = this.dataShareService.calculatePercentage(this.surveyAnswers[0]?.['Policies']?.['Question16']?.['Question16-0'], this.surveyAnswers[0]?.['General']?.['Question2']?.['Question2-0']);
    this.rpoFairDataPercentageDiff = this.dataShareService.calculateDiff(this.rpoFairDataPercentage[0], this.rpoFairDataPercentage[1]);

    this.financialInvestmentInFairData[1] = this.surveyAnswers[1]?.['Practices']?.['Question64']?.['Question64-0'] || null;
    this.financialInvestmentInFairData[0] = this.surveyAnswers[0]?.['Practices']?.['Question64']?.['Question64-0'] || null;
    this.financialInvestmentInFairDataPercentageDiff = this.dataShareService.calculateDiffAsPercentage(this.financialInvestmentInFairData[0], this.financialInvestmentInFairData[1]);

    this.hasFinancialStrategyFD = this.surveyAnswers[1]?.['Policies']?.['Question15']?.['Question15-0'] || null;
    this.financialStrategyClarificationFD = this.surveyAnswers[1]?.['Policies']?.['Question15']?.['Question15-1'] || null;

    this.hasNationalPolicyFD = this.surveyAnswers[1]?.['Policies']?.['Question14']?.['Question14-0'];
    this.policyMandatoryFD = this.surveyAnswers[1]?.['Policies']?.['Question14']?.['Question14-1-0']?.['Question14-1'];
    this.nationalPolicyClarificationFD = this.surveyAnswers[1]?.['Policies']?.['Question14']?.['Question14-3'];

    this.hasMonitoringFD = this.surveyAnswers[1]?.['Practices']?.['Question62']?.['Question62-0'];
    this.monitoringClarificationFD = this.surveyAnswers[1]?.['Practices']?.['Question62']?.['Question62-1'];

  }


  createStackedColumns() {

    const rpo: string[] = [  // research performing organisations
      this.surveyAnswers[0]?.['General']?.['Question2']?.['Question2-0'],
      this.surveyAnswers[1]?.['General']?.['Question2']?.['Question2-0']
    ];
    const rpoWithPolicy: string[] = [ // research performing organisations with policy on FAIR data
      this.surveyAnswers[0]?.['Policies']?.['Question16']?.['Question16-0'],
      this.surveyAnswers[1]?.['Policies']?.['Question16']?.['Question16-0']
    ];

    if (this.exploreService.isNumeric(rpoWithPolicy[0]) && this.exploreService.isNumeric(rpoWithPolicy[1])) {
      this.stackedColumnSeries1[0].data.push(+rpoWithPolicy[0], +rpoWithPolicy[1]);

      if (this.exploreService.isNumeric(rpo[0]) && this.exploreService.isNumeric(rpo[1])) {
        this.stackedColumnSeries1[1].data.push(+rpo[0] - +rpoWithPolicy[0], +rpo[1] - +rpoWithPolicy[1]);
      }
    }


    const rfo: string[] = [  // research funding organisations
      this.surveyAnswers[0]?.['General']?.['Question3']?.['Question3-0'],
      this.surveyAnswers[1]?.['General']?.['Question3']?.['Question3-0']
    ];
    const rfoWithPolicy: string[] = [ // research funding organisations with policy on FAIR data
      this.surveyAnswers[0]?.['Policies']?.['Question17']?.['Question17-0'],
      this.surveyAnswers[1]?.['Policies']?.['Question17']?.['Question17-0']
    ];

    if (this.exploreService.isNumeric(rfoWithPolicy[0]) && this.exploreService.isNumeric(rfoWithPolicy[1])) {
      this.stackedColumnSeries2[0].data.push(+rfoWithPolicy[0], +rfoWithPolicy[1]);

      if (this.exploreService.isNumeric(rfo[0]) && this.exploreService.isNumeric(rfo[1])) {
        this.stackedColumnSeries2[1].data.push(+rfo[0] - +rpoWithPolicy[0], +rfo[1] - +rpoWithPolicy[1]);
      }
    }
    this.stackedColumnSeries1 = [...this.stackedColumnSeries1];
    this.stackedColumnSeries2 = [...this.stackedColumnSeries2];

  }

}
