import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import * as Highcharts from "highcharts";
import { LegendOptions, SeriesOptionsType } from "highcharts";
import { EoscReadinessDataService } from "../../services/eosc-readiness-data.service";
import { RawData } from "../../../domain/raw-data";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { zip } from "rxjs";
import { DataHandlerService } from "../../services/data-handler.service";
import { SurveyService } from "../../../../survey-tool/app/services/survey.service";
import { PdfExportService } from "../../services/pdf-export.service";
import { StakeholdersService } from "../../../../survey-tool/app/services/stakeholders.service";
import { ExploreService } from "../explore.service";
import { CategorizedAreaData } from "../../../domain/categorizedAreaData";

@Component({
  selector: 'app-national-monitoring',
  templateUrl: './national-monitoring.component.html',
  styleUrls: ['../../dashboard/country-landing-page/country-landing-page.component.css'],
})

export class NationalMonitoringComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  exportActive = false;

  year = '2023';
  years = ['2022', '2023'];

  tableData: string[][] = [];

  barChartCategories = ['Open Access Publications', 'Data Management', 'Fair Data', 'Open Data', 'Open Software', 'Services', 'Connecting repositories to EOSC', 'Data stewardship', 'Long-term data preservation', 'Skills/Training', 'Incentives/Rewards for OS', 'Citizen Science'];

  barChartSeries: SeriesOptionsType[] = [];
  barChartTitles = {
    title: 'National Monitoring of Open Science by Areas',
    xAxis: 'National Monitoring on',
    yAxis: 'Percentage of countries with National Monitoring',
  }
  legendOptions: LegendOptions = {
    layout: 'vertical',
    align: 'right',
    verticalAlign: 'bottom',
    x: -40,
    y: -190,
    floating: true,
    borderWidth: 1,
    backgroundColor: Highcharts.defaultOptions.legend.backgroundColor || '#FFFFFF',
    shadow: true
  };

  openScienceAreas = ['Publications', 'Data Management', 'FAIR Data', 'Open Data', 'Software', 'Services', 'Repositories', 'Data stewardship', 'Long-term Data Preservation', 'Skills/Training', 'Incentives', 'Citizen Science'];
  mapTitles = ['National Monitoring on open access publications', 'National Monitoring on Data Management', 'National Monitoring on FAIR Data', 'National Monitoring on Open Data', 'National Monitoring on Open Sources Software', 'National Monitoring on offering services through EOSC', 'National Monitoring on Connecting Repositories to EOSC', 'National Monitoring on data stewardship', 'National Monitoring on Long-term Data Preservation', 'National Monitoring on Skills/Training in Open Science', 'National Monitoring on incentives/rewards for Open Science', 'National Monitoring on Citizen Science'];

  monitoringRawData: RawData[] = [];
  monitoringMapData: CategorizedAreaData = new CategorizedAreaData();
  countriesArray: string[] = [];
  questionsDataArray: any[] = [];
  tmpQuestionsDataArray: any[] = [];
  participatingCountries: number[] = [];
  total: number[] = [];
  toolTipData: Map<string, string>[] = [];

  constructor(private queryData: EoscReadinessDataService, private surveyService: SurveyService,
              private dataHandlerService: DataHandlerService, private pdfService: PdfExportService,
              private stakeholdersService: StakeholdersService, private exploreService: ExploreService) {}

  ngOnInit() {
    this.years.forEach((year, index) => {
      this.getMonitoringData(year, index);
    });
  }

  /** Get maps data ----------------------------------------------------------------------------------> **/
  getMonitoring(question: string, index: number, mapCount: number) {
    zip(
      // this.queryData.getQuestion(this.years[this.years.length-1], question),
      this.queryData.getQuestionComment(this.years[this.years.length-1], question),
    ).subscribe({
      next: res => {
        this.tmpQuestionsDataArray[index] = this.dataHandlerService.convertRawDataToCategorizedAreasData(this.monitoringRawData[index]);
        this.participatingCountries[index] = this.dataHandlerService.convertRawDataForActivityGauge(this.monitoringRawData[index]);
        this.total[index] = this.monitoringRawData[index].datasets[0].series.result.length; // Total countries with validated response

        for (let i = 0; i < this.tmpQuestionsDataArray[index].series.length; i++) {
          this.tmpQuestionsDataArray[index].series[i].data = this.tmpQuestionsDataArray[index].series[i].data.map(code => ({ code }));
        }
        this.toolTipData[index] = this.dataHandlerService.covertRawDataGetText(res[0]);
        this.questionsDataArray[index] = this.exploreService.createMapDataFromCategorization(this.tmpQuestionsDataArray[index], this.countriesArray, mapCount);
      },
      error: err => {console.error(err)}
    });
  }

  getChart(index: number) {
    // console.log(this.questionsDataArray);
    switch (index) {
      case 0:
        if (!this.questionsDataArray[index])
          this.getMonitoring('Question54', index, 2); // National Monitoring on open access publications
        break;
      case 1:
        if (!this.questionsDataArray[index])
          this.getMonitoring('Question58', index, 2); // National Monitoring on Data Management
        break;
      case 2:
        if (!this.questionsDataArray[index])
          this.getMonitoring('Question62', index, 2); // National Monitoring on FAIR Data
        break;
      case 3:
        if (!this.questionsDataArray[index])
          this.getMonitoring('Question66', index, 2); // National Monitoring on Open Data
        break;
      case 4:
        if (!this.questionsDataArray[index])
          this.getMonitoring('Question70', index, 2); // National Monitoring on Open Sources Software
        break;
      case 5:
        if (!this.questionsDataArray[index])
          this.getMonitoring('Question74', index, 2); // National Monitoring on Services
        break;
      case 6:
        if (!this.questionsDataArray[index])
          this.getMonitoring('Question78', index, 2); // National Monitoring on Connecting Repositories to EOSC
        break;
      case 7:
        if (!this.questionsDataArray[index])
          this.getMonitoring('Question82', index, 2); // National Monitoring on Data stewardship
        break;
      case 8:
        if (!this.questionsDataArray[index])
          this.getMonitoring('Question86', index, 2); // National Monitoring on Long-term Data Preservation
        break;
      case 9:
        if (!this.questionsDataArray[index])
          this.getMonitoring('Question90', index, 2); // National Monitoring on Skills/Training in Open Science
        break;
      case 10:
        if (!this.questionsDataArray[index])
          this.getMonitoring('Question94', index, 2); // National Monitoring on Incentives/rewards for Open Science
        break;
      case 11:
        if (!this.questionsDataArray[index])
          this.getMonitoring('Question98', index, 2); // National Monitoring on Citizen Science
        break;
    }
  }

  /** Chart initializations ---------------------------------------------------------------------------------------> **/
  getMonitoringData(year: string, index: number) {
    zip(
      this.queryData.getQuestion(year, 'Question54'), // Publications
      this.queryData.getQuestion(year, 'Question58'), // Data management
      this.queryData.getQuestion(year, 'Question62'), // FAIR data
      this.queryData.getQuestion(year, 'Question66'), // Open data
      this.queryData.getQuestion(year, 'Question70'), // Software
      this.queryData.getQuestion(year, 'Question74'), // Services
      this.queryData.getQuestion(year, 'Question78'), // Connecting repositories to EOSC
      this.queryData.getQuestion(year, 'Question82'), // Data stewardship
      this.queryData.getQuestion(year, 'Question86'), // Long-term data preservation
      this.queryData.getQuestion(year, 'Question90'), // Skills/training for Open Science
      this.queryData.getQuestion(year, 'Question94'), // Incentives/rewards for Open Science
      this.queryData.getQuestion(year, 'Question98'), // Citizen science
    ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.barChartSeries.push(this.exploreService.createBarChartSeries(value, year));

        if (this.years.length === ++index) { // If this is the last year
          this.barChartSeries = [...this.barChartSeries]; // Trigger angular detection change
          this.monitoringRawData = value; // Store monitoring data for use in other charts

          this.getTableData(); // Create table

          // Overview Map creation
          this.stakeholdersService.getEOSCSBCountries().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: countries => {
              this.countriesArray = countries;
              // this.getChart(0); // Draw first map
              this.monitoringMapData = this.exploreService.mergeCategorizedMapData(this.monitoringRawData, this.openScienceAreas, this.countriesArray, 'monitoring');
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
    if (this.monitoringRawData.length) {
      this.surveyService.getSurveyValidatedCountries('m-eosc-sb-2023').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: countries => {
          this.tableData = this.exploreService.createTable(this.monitoringRawData, countries);
        },
        error: err => {console.error(err)}
      });

      return;
    }

    zip(
      this.queryData.getQuestion(this.year, 'Question54'), // Publications
      this.queryData.getQuestion(this.year, 'Question58'), // Data management
      this.queryData.getQuestion(this.year, 'Question62'), // FAIR data
      this.queryData.getQuestion(this.year, 'Question66'), // Open data
      this.queryData.getQuestion(this.year, 'Question70'), // Software
      this.queryData.getQuestion(this.year, 'Question74'), // Services
      this.queryData.getQuestion(this.year, 'Question78'), // Connecting repositories to EOSC
      this.queryData.getQuestion(this.year, 'Question82'), // Data stewardship
      this.queryData.getQuestion(this.year, 'Question86'), // Long-term data preservation
      this.queryData.getQuestion(this.year, 'Question90'), // Skills/training for Open Science
      this.queryData.getQuestion(this.year, 'Question94'), // Incentives/rewards for Open Science
      this.queryData.getQuestion(this.year, 'Question98'), // Citizen science
      // this.surveyService.getSurveyValidatedCountries('m-eosc-sb-2023')
    ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (value: any) => {
        // console.log(value);
        this.surveyService.getSurveyValidatedCountries('m-eosc-sb-2023').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: countries => {
            this.tableData = this.exploreService.createTable(value, countries);
          },
          error: err => {console.error(err)}
        });
      },
      error: err => {console.error(err)}
    });
  }

  /** Export to PDF -----------------------------------------------------------------------------------------------> **/
  exportToPDF(contents: HTMLElement[], filename?: string) {
    this.exportActive = true
    this.pdfService.export(contents, filename).then(() => {
      this.exportActive = false;
    }).catch((error) => {
      this.exportActive = false;
      console.error('Error during PDF generation:', error);
    });
  }

}
