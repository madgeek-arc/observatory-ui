import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { SeriesBarOptions, SeriesOptionsType } from "highcharts";
import { EoscReadinessDataService } from "../../services/eosc-readiness-data.service";
import { RawData } from "../../../../survey-tool/app/domain/raw-data";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { zip } from "rxjs";
import { DataHandlerService } from "../../services/data-handler.service";
import { countries } from "../../../../survey-tool/app/domain/countries";
import { SurveyService } from "../../../../survey-tool/app/services/survey.service";
import { PdfExportService } from "../../services/pdf-export.service";
import { StakeholdersService } from "../../../../survey-tool/app/services/stakeholders.service";
import { ExploreService } from "../explore.service";

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

  barChartCategories = ['Open Access Publications', 'Fair Data', 'Data Management', 'Open Data', 'Open Software', 'Services', 'Connecting repositories to EOSC', 'Data stewardship', 'Long-term data preservation', 'Skills/Training', 'Incentives/Rewards for OS', 'Citizen Science'];

  barChartSeries: SeriesOptionsType[] = [];
  barChartTitles = {
    // title: 'Percentage of countries with national policies different Open Science Categories',
    title: '',
    xAxis: 'National Monitoring on',
    yAxis: 'Percentage of countries with National Monitoring',
  }

  navPills = ['Publications', 'Open Data', 'FAIR Data', 'Data Management', 'Citizen Science', 'Repositories', 'Long-term Data Preservation', 'Skills/Training', 'Software'];
  mapTitles = ['National monitoring on open access publications', 'National Monitoring on Open Data', 'National Monitoring on FAIR Data', 'National Monitoring on Data Management', 'National Monitoring on Citizen Science', 'National Monitoring on Connecting Repositories to EOSC', 'National Monitoring on Long-term Data Preservation', 'National Monitoring on Skills/Training in Open Science', 'National Monitoring on Open Sources Software']

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
      this.getBarChartData(year, index);
    });

    this.getTableData();

    // Maps
    this.stakeholdersService.getEOSCSBCountries().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: countries => {
        this.countriesArray = countries;
        this.getMonitoring('Question54', 0, 2); // National monitoring on open access publications
        // this.getMonitoring('Question66', 1, 2); // National Monitoring on Open Data
        // this.getMonitoring('Question62', 2, 2); // National Monitoring on FAIR Data
        // this.getMonitoring('Question58', 3, 2); // National Monitoring on Data Management
        // this.getMonitoring('Question98', 4, 2); // National Monitoring on Citizen Science
        // this.getMonitoring('Question78', 5, 2); // National Monitoring on Connecting Repositories to EOSC
        // this.getMonitoring('Question86', 6, 2); // National Monitoring on Long-term Data Preservation
        // this.getMonitoring('Question90', 7, 2); // National Monitoring on Skills/Training in Open Science
        // this.getMonitoring('Question70', 8, 2); // National Monitoring on Open Sources Software
      },
      error: error => {console.error(error);}
    });
  }

  /** Get maps data ----------------------------------------------------------------------------------> **/
  getMonitoring(question: string, index: number, mapCount: number) {
    zip(
      this.queryData.getQuestion(this.years[this.years.length-1], question),
      this.queryData.getQuestionComment(this.years[this.years.length-1], question),
    ).subscribe({
      next: res => {
        this.tmpQuestionsDataArray[index] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[0]);
        this.participatingCountries[index] = this.dataHandlerService.convertRawDataForActivityGauge(res[0]);
        this.total[index] = res[0].datasets[0].series.result.length; // Total countries with validated response

        for (let i = 0; i < this.tmpQuestionsDataArray[index].series.length; i++) {
          this.tmpQuestionsDataArray[index].series[i].data = this.tmpQuestionsDataArray[index].series[i].data.map(code => ({ code }));
        }
        this.toolTipData[index] = this.dataHandlerService.covertRawDataGetText(res[1]);
        this.questionsDataArray[index] = this.exploreService.createMapDataFromCategorization(this.tmpQuestionsDataArray[index], this.countriesArray, mapCount);
      },
      error: err => {console.error(err)}
    });
  }

  getChart(index: number) {
    console.log(this.questionsDataArray);
    switch (index) {
      case 0:
        if (!this.questionsDataArray[index])
          this.getMonitoring('Question54', index, 2); // National monitoring on open access publications
        break;
      case 1:
        if (!this.questionsDataArray[index])
          this.getMonitoring('Question66', index, 2); // National Monitoring on Open Data
        break;
      case 2:
        if (!this.questionsDataArray[index])
          this.getMonitoring('Question62', index, 2); // National Monitoring on FAIR Data
        break;
      case 3:
        if (!this.questionsDataArray[index])
          this.getMonitoring('Question58', index, 2); // National Monitoring on Data Management
        break;
      case 4:
        if (!this.questionsDataArray[index])
          this.getMonitoring('Question98', index, 2); // National Monitoring on Citizen Science
        break;
      case 5:
        if (!this.questionsDataArray[index])
          this.getMonitoring('Question78', index, 2); // National Monitoring on Connecting Repositories to EOSC
        break;
      case 6:
        if (!this.questionsDataArray[index])
          this.getMonitoring('Question86', index, 2); // National Monitoring on Long-term Data Preservation
        break;
      case 7:
        if (!this.questionsDataArray[index])
          this.getMonitoring('Question90', index, 2); // National Monitoring on Skills/Training in Open Science
        break;
      case 8:
        if (!this.questionsDataArray[index])
          this.getMonitoring('Question70', index, 2); // National Monitoring on Open Sources Software
        break;
    }
  }

  /** Bar charts ---------------------------------------------------------------------------------------------------> **/
  getBarChartData(year: string, index: number) {
    zip(
      this.queryData.getQuestion(year, 'Question54'), // publications
      this.queryData.getQuestion(year, 'Question62'), // FAIR data
      this.queryData.getQuestion(year, 'Question58'), // Data management
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
        this.barChartSeries.push(this.createBarChartSeries(value, year));

        if (this.years.length === index+1) {
          this.barChartSeries = [...this.barChartSeries];
        }
      },
      error: err => {console.error(err)}
    });
  }

  createBarChartSeries(data: RawData[], year: string) {
    let series: SeriesBarOptions = {
      type: 'bar',
      name: 'Year '+ (+year-1),
      data: []
    }

    data.forEach(el => {
      let count = 0;
      el.datasets[0].series.result.forEach(item => {
        if (item.row[1] === 'Yes')
          count++;
      });
      series.data.push(Math.round(((count/el.datasets[0].series.result.length + Number.EPSILON) * 100)));
    });
    return series;
  }

  /** Create table ------------------------------------------------------------------------------------------------> **/
  getTableData() {
    zip(
      this.queryData.getQuestion(this.year, 'Question6'),  // Publications
      this.queryData.getQuestion(this.year, 'Question10'), // Data-management
      this.queryData.getQuestion(this.year, 'Question14'), // FAIR-data
      this.queryData.getQuestion(this.year, 'Question18'), // Open-data
      this.queryData.getQuestion(this.year, 'Question22'), // Software
      this.queryData.getQuestion(this.year, 'Question26'), // Services
      this.queryData.getQuestion(this.year, 'Question30'), // Connecting repositories to EOSC
      this.queryData.getQuestion(this.year, 'Question34'), // Data stewardship
      this.queryData.getQuestion(this.year, 'Question38'), // Long-term data preservation
      this.queryData.getQuestion(this.year, 'Question42'), // Skills/Training
      this.queryData.getQuestion(this.year, 'Question46'), // Assessment
      this.queryData.getQuestion(this.year, 'Question50'), // Engagement
      // this.surveyService.getSurveyValidatedCountries('m-eosc-sb-2023')
    ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (value: any) => {
        // console.log(value);
        this.surveyService.getSurveyValidatedCountries('m-eosc-sb-2023').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: countries => {
            this.createTable(value, countries);
          },
          error: err => {console.error(err)}
        });
      },
      error: err => {console.error(err)}
    });
  }

  createTable(value: RawData[], countriesEOSC: string[]) {
    this.tableData = [];

    this.tableData[1] = this.dataHandlerService.convertRawDataForCumulativeTable(value[0], countriesEOSC);
    this.tableData[2] = this.dataHandlerService.convertRawDataForCumulativeTable(value[1], countriesEOSC);
    this.tableData[3] = this.dataHandlerService.convertRawDataForCumulativeTable(value[2], countriesEOSC);
    this.tableData[4] = this.dataHandlerService.convertRawDataForCumulativeTable(value[3], countriesEOSC);
    this.tableData[5] = this.dataHandlerService.convertRawDataForCumulativeTable(value[4], countriesEOSC);
    this.tableData[6] = this.dataHandlerService.convertRawDataForCumulativeTable(value[5], countriesEOSC);
    this.tableData[7] = this.dataHandlerService.convertRawDataForCumulativeTable(value[6], countriesEOSC);
    this.tableData[8] = this.dataHandlerService.convertRawDataForCumulativeTable(value[7], countriesEOSC);
    this.tableData[9] = this.dataHandlerService.convertRawDataForCumulativeTable(value[8], countriesEOSC);
    this.tableData[10] = this.dataHandlerService.convertRawDataForCumulativeTable(value[9], countriesEOSC);
    this.tableData[11] = this.dataHandlerService.convertRawDataForCumulativeTable(value[10], countriesEOSC);
    this.tableData[12] = this.dataHandlerService.convertRawDataForCumulativeTable(value[11], countriesEOSC);

    this.tableData[0] = countriesEOSC;
    // console.log(this.tableData);
    // Transpose 2d array
    this.tableData = this.tableData[0].map((_, colIndex) => this.tableData.map(row => row[colIndex]));

    for (let i = 0; i < this.tableData.length; i++) {
      let tmpData = countries.find(country => country.id === this.tableData[i][0]);
      if (tmpData)
        this.tableData[i][0] = tmpData.name + ` (${tmpData.id})`;
    }
    // console.log(this.tableData);
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
