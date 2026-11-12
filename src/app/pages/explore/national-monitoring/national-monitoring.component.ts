import { Component, DestroyRef, inject, OnInit, ChangeDetectionStrategy, signal } from "@angular/core";
import * as Highcharts from "highcharts";
import { LegendOptions, SeriesOptionsType } from "highcharts";
import { EoscReadinessDataService } from "../../services/eosc-readiness-data.service";
import { RawData } from "src/app/domain/raw-data";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { zip } from "rxjs";
import { DataHandlerService } from "../../services/data-handler.service";
import { SurveyService } from "src/survey-tool/app/services/survey.service";
import { PdfExportService } from "../../services/pdf-export.service";
import { StakeholdersService } from "src/survey-tool/app/services/stakeholders.service";
import { ExploreService } from "../explore.service";
import { setAt } from "src/app/shared/utils/set-at";
import { LATEST_SURVEY_YEAR, SURVEY_YEARS, surveyModelId } from "src/app/domain/survey-years";
import { CategorizedAreaData } from "src/app/domain/categorizedAreaData";
import { monitoringMapCaptions, openScienceAreas } from "src/app/domain/chart-captions";
import { SidebarMobileToggleComponent } from "src/survey-tool/app/shared/dashboard-side-menu/mobile-toggle/sidebar-mobile-toggle.component";
import { CommonModule } from "@angular/common";
import { HighchartsCategoryMapComponent } from "src/app/shared/charts/category-map/highcharts-category-map.component";
import { BarOrColumnChartComponent } from "src/app/shared/charts/bar-chart/bar-or-column-chart.component";
import { PageContentComponent } from "src/survey-tool/app/shared/page-content/page-content.component";

@Component({
    selector: 'app-national-monitoring',
    templateUrl: './national-monitoring.component.html',
    styleUrls: ['../../dashboard/country-landing-page/country-landing-page.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [SidebarMobileToggleComponent, CommonModule, HighchartsCategoryMapComponent, BarOrColumnChartComponent, PageContentComponent]
})

export class NationalMonitoringComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private queryData = inject(EoscReadinessDataService);
  private surveyService = inject(SurveyService);
  private dataHandlerService = inject(DataHandlerService);
  private pdfService = inject(PdfExportService);
  private stakeholdersService = inject(StakeholdersService);
  private exploreService = inject(ExploreService);
  protected readonly monitoringMapCaptions = monitoringMapCaptions;

  exportActive = signal(false);
  smallScreen = false;

  years = [...SURVEY_YEARS];
  year = LATEST_SURVEY_YEAR;

  tableData = signal<string[][]>([]);

  columnChartCategories = openScienceAreas

  columnChartSeries = signal<SeriesOptionsType[]>([]);
  // Filled one response per year; the signal gets the sorted series once every year has arrived
  private columnChartSeriesByYear: SeriesOptionsType[] = [];
  columnChartTitles = {
    title: 'National Monitoring of Open Science by Areas',
    xAxis: 'National Monitoring on',
    yAxis: 'Percentage of countries with National Monitoring',
  }
  legendOptions: LegendOptions = {
    // layout: 'vertical',
    // align: 'right',
    // verticalAlign: 'bottom',
    // x: -40,
    // y: -180,
    // floating: true,
    borderWidth: 1,
    backgroundColor: Highcharts.defaultOptions.legend.backgroundColor || '#FFFFFF',
    // shadow: true
  };

  openScienceAreas = this.columnChartCategories;

  mapTitles = ['National Monitoring on Open Access publications', 'National Monitoring on Data Management', 'National Monitoring on FAIR Data', 'National Monitoring on Open Data', 'National Monitoring on Open Sources Software', 'National Monitoring on offering services through EOSC', 'National Monitoring on Connecting Repositories to EOSC', 'National Monitoring on Data Stewardship', 'National Monitoring on Long-term Data Preservation', 'National Monitoring on Skills/Training in Open Science', 'National Monitoring on incentives/rewards for Open Science', 'National Monitoring on Citizen Science'];

  monitoringRawData: RawData = new RawData();
  monitoringMapData = signal<CategorizedAreaData>(new CategorizedAreaData());
  countriesArray: string[] = [];
  questionsDataArray = signal<any[]>([]);
  tmpQuestionsDataArray: any[] = [];
  participatingCountries = signal<number[]>([]);
  total = signal<number[]>([]);
  toolTipData = signal<Map<string, string>[]>([]);

  ngOnInit() {
    this.years.forEach((year, index) => {
      this.getMonitoringData(year, index);
    });

    this.smallScreen = this.exploreService.isMobileOrSmallScreen;
  }

  /** Get maps data -----------------------------------------------------------------------------------------------> **/
  getMonitoring(question: string, index: number, mapCount: number) {
    zip(
      // this.queryData.getQuestion(this.years[this.years.length-1], question),
      this.queryData.getQuestionComment(this.year, question),
    ).subscribe({
      next: res => {
        this.tmpQuestionsDataArray[index] = this.dataHandlerService.convertRawDataToCategorizedAreasData({datasets: [this.monitoringRawData.datasets[index]]});
        setAt(this.participatingCountries, index, this.dataHandlerService.convertRawDataForActivityGauge({datasets: [this.monitoringRawData.datasets[index]]}));
        setAt(this.total, index, this.monitoringRawData.datasets[index].series.result.length); // Total countries with validated response

        for (let i = 0; i < this.tmpQuestionsDataArray[index].series.length; i++) {
          this.tmpQuestionsDataArray[index].series[i].data = this.tmpQuestionsDataArray[index].series[i].data.map(code => ({ code }));
        }
        setAt(this.toolTipData, index, this.dataHandlerService.covertRawDataGetText(res[0]));
        setAt(this.questionsDataArray, index, this.exploreService.createMapDataFromCategorization(this.tmpQuestionsDataArray[index], this.countriesArray, mapCount));
      },
      error: err => {console.error(err)}
    });
  }

  getChart(index: number) {
    // console.log(this.questionsDataArray);
    switch (index) {
      case 0:
        if (!this.questionsDataArray()[index])
          this.getMonitoring('Question54', index, 2); // National Monitoring on Open Access publications
        break;
      case 1:
        if (!this.questionsDataArray()[index])
          this.getMonitoring('Question58', index, 2); // National Monitoring on Data Management
        break;
      case 2:
        if (!this.questionsDataArray()[index])
          this.getMonitoring('Question62', index, 2); // National Monitoring on FAIR Data
        break;
      case 3:
        if (!this.questionsDataArray()[index])
          this.getMonitoring('Question66', index, 2); // National Monitoring on Open Data
        break;
      case 4:
        if (!this.questionsDataArray()[index])
          this.getMonitoring('Question70', index, 2); // National Monitoring on Open Sources Software
        break;
      case 5:
        if (!this.questionsDataArray()[index])
          this.getMonitoring('Question74', index, 2); // National Monitoring on Services
        break;
      case 6:
        if (!this.questionsDataArray()[index])
          this.getMonitoring('Question78', index, 2); // National Monitoring on Connecting Repositories to EOSC
        break;
      case 7:
        if (!this.questionsDataArray()[index])
          this.getMonitoring('Question82', index, 2); // National Monitoring on Data stewardship
        break;
      case 8:
        if (!this.questionsDataArray()[index])
          this.getMonitoring('Question86', index, 2); // National Monitoring on Long-term Data Preservation
        break;
      case 9:
        if (!this.questionsDataArray()[index])
          this.getMonitoring('Question90', index, 2); // National Monitoring on Skills/Training in Open Science
        break;
      case 10:
        if (!this.questionsDataArray()[index])
          this.getMonitoring('Question94', index, 2); // National Monitoring on Incentives/rewards for Open Science
        break;
      case 11:
        if (!this.questionsDataArray()[index])
          this.getMonitoring('Question98', index, 2); // National Monitoring on Citizen Science
        break;
    }
  }

  /** Chart initializations ---------------------------------------------------------------------------------------> **/
  getMonitoringData(year: string, index: number) {
    const nameArr = [
      'Question54', // Publications
      'Question58', // Data management
      'Question62', // FAIR data
      'Question66', // Open data
      'Question70', // Software
      'Question74', // Services
      'Question78', // Connecting repositories to EOSC
      'Question82', // Data stewardship
      'Question86', // Long-term data preservation
      'Question90', // Skills/training for Open Science
      'Question94', // Incentives/rewards for Open Science
      'Question98', // Citizen science
    ];

    this.queryData.getQuestions(year, nameArr).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.columnChartSeriesByYear.push(this.exploreService.createColumnChartSeries(value, year));

        if (this.columnChartSeriesByYear.length === this.years.length) { // When series complete
          this.columnChartSeriesByYear.sort((a, b) => a.name.localeCompare(b.name));
          this.columnChartSeries.set([...this.columnChartSeriesByYear]);
        }

        if (this.years.length === ++index) { // If this is the last year
          this.monitoringRawData = value; // Store monitoring data for use in other charts

          this.getTableData(); // Create table

          // Overview Map creation
          this.stakeholdersService.getEOSCSBCountries().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: countries => {
              this.countriesArray = countries;
              // this.getChart(0); // Draw first map
              this.monitoringMapData.set(this.exploreService.mergeCategorizedMapData(this.monitoringRawData, this.openScienceAreas, this.countriesArray, 'monitoring'));
            },
            error: error => {console.error(error);}
          });
        }
      },
      error: err => {console.error(err)}
    });
  }

  /** Create table ------------------------------------------------------------------------------------------------> **/
  getTableData() {
    if (this.monitoringRawData.datasets.length) {
      this.surveyService.getSurveyValidatedCountries(surveyModelId(this.year)).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: countries => {
          this.tableData.set(this.exploreService.createTable(this.monitoringRawData, countries));
        },
        error: err => {console.error(err)}
      });

      return;
    }

    const nameArr = [
      'Question54', // Publications
      'Question58', // Data management
      'Question62', // FAIR data
      'Question66', // Open data
      'Question70', // Software
      'Question74', // Services
      'Question78', // Connecting repositories to EOSC
      'Question82', // Data stewardship
      'Question86', // Long-term data preservation
      'Question90', // Skills/training for Open Science
      'Question94', // Incentives/rewards for Open Science
      'Question98', // Citizen science
    ];

    this.queryData.getQuestions(this.year, nameArr).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (value: any) => {
        // console.log(value);
        this.surveyService.getSurveyValidatedCountries(surveyModelId(this.year)).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: countries => {
            this.tableData.set(this.exploreService.createTable(value, countries));
          },
          error: err => {console.error(err)}
        });
      },
      error: err => {console.error(err)}
    });
  }

  /** Export to PDF -----------------------------------------------------------------------------------------------> **/
  exportToPDF(contents: HTMLElement[], filename?: string) {
    this.exportActive.set(true)
    this.pdfService.export(contents, filename).then(() => {
      this.exportActive.set(false);
    }).catch((error) => {
      this.exportActive.set(false);
      console.error('Error during PDF generation:', error);
    });
  }

  /** Method for mobile select */
  onSelectChange(event: any) {
    const selectedIndex = event.target.value;
    const tabs = document.querySelectorAll('.uk-tab li a');
    if (tabs[selectedIndex]) {
      (tabs[selectedIndex] as HTMLElement).click();
   }
  }
}
