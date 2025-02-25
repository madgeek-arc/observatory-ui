import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { LegendOptions, SeriesBarOptions, SeriesBubbleOptions, SeriesOptionsType } from "highcharts";
import { zip } from "rxjs/internal/observable/zip";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { EoscReadinessDataService } from "../../services/eosc-readiness-data.service";
import { RawData, Row } from "../../../../survey-tool/app/domain/raw-data";
import { countriesNumbers } from "../../eosc-readiness-dashboard/eosc-readiness-2022/eosc-readiness2022-map-subtitles";
import { DataHandlerService } from "../../services/data-handler.service";
import { countries } from "../../../../survey-tool/app/domain/countries";
import { SurveyService } from "../../../../survey-tool/app/services/survey.service";
import { PdfExportService } from "../../services/pdf-export.service";
import * as Highcharts from "highcharts";
import { ExploreService } from "../explore.service";


@Component({
  selector: 'app-open-science-policies',
  templateUrl: './open-science-policies.component.html',
  styleUrls: ['../../dashboard/country-landing-page/country-landing-page.component.css'],
})

export class OpenSciencePoliciesComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  exportActive = false;

  years = ['2022', '2023'];
  year = '2023';
  lastUpdateDate?: string;

  barChartCategories=  ['Open Access Publications', 'Fair Data', 'Data Management', 'Open Data', 'Open Software', 'Services', 'Connecting repositories to EOSC', 'Data stewardship', 'Long-term data preservation', 'Skills/Training', 'Incentives/Rewards for OS', 'Citizen Science'];

  barChartSeries: SeriesOptionsType[] = [];
  barChartTitles = {
    // title: 'Percentage of countries with national policies different Open Science Categories',
    title: '',
    xAxis: 'Policy on',
    yAxis: 'Percentage of countries with national policies',
  }

  barChart2Series: SeriesOptionsType[] = [];
  barChart2Titles = {
    // title: 'Percentage of countries with national policies different Open Science Categories',
    title: '',
    xAxis: 'Financial Strategy on',
    yAxis: 'Percentage of countries with Financial Strategy',
  }
  legendOptions: LegendOptions = {
    layout: 'vertical',
    align: 'right',
    verticalAlign: 'bottom',
    x: -40,
    y: -70,
    floating: true,
    borderWidth: 1,
    backgroundColor: Highcharts.defaultOptions.legend.backgroundColor || '#FFFFFF',
    shadow: true
  };

  bubbleWithCategories = [] as SeriesBubbleOptions[];

  tableData: string[][] = [];

  openScienceAreas = this.barChartCategories;
  mapTitles = ['National Policy on open access publications', 'National Policy on FAIR Data', 'National Policy on Data Management', 'National Policy on Open Data', 'National Policy on Open Sources Software', 'National Policy on offering services through EOSC', 'National Policy on Connecting Repositories to EOSC', 'National Policy on data stewardship', 'National Policy on Long-term Data Preservation', 'National Policy on Skills/Training in Open Science', 'National Policy on incentives/rewards for Open Science', 'National Policy on Citizen Science'];
  policiesRawData: RawData[] = [];
  countriesArray: string[] = [];
  questionsDataArray: any[] = [];
  tmpQuestionsDataArray: any[] = [];
  participatingCountries: number[] = [];
  total: number[] = [];
  toolTipData: Map<string, string>[] = [];

  constructor(private queryData: EoscReadinessDataService, private surveyService: SurveyService,
              private dataHandlerService: DataHandlerService, private pdfService: PdfExportService,
              private exploreService: ExploreService) {}

  ngOnInit() {

    this.years.forEach((year, index) => {
      this.getBarChartData(year, index);
      this.getFinancialBarChartData(year, index);
    });

    this.getBubbleChartData();
    // this.getTableData();

    this.exploreService._lastUpdateDate.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => this.lastUpdateDate = value
    });
  }

  /** Bar charts ---------------------------------------------------------------------------------------------------> **/
  getBarChartData(year: string, index: number) {
    zip(
      this.queryData.getQuestion(year, 'Question6'),   // national policy on open access publications
      this.queryData.getQuestion(year, 'Question14'),  // national policy on FAIR data
      this.queryData.getQuestion(year, 'Question10'),  // national policy on data management
      this.queryData.getQuestion(year, 'Question18'),  // national policy on Open data
      this.queryData.getQuestion(year, 'Question22'),  // national policy on software
      this.queryData.getQuestion(year, 'Question26'),  // national policy on offering services through EOSC
      this.queryData.getQuestion(year, 'Question30'),  // national policy on connecting repositories to EOSC
      this.queryData.getQuestion(year, 'Question34'),  // national policy on data stewardship
      this.queryData.getQuestion(year, 'Question38'),  // national policy on long-term data preservation
      this.queryData.getQuestion(year, 'Question42'),  // national policy on skills/training for Open Science
      this.queryData.getQuestion(year, 'Question46'),  // national policy on incentives/rewards for Open Science
      this.queryData.getQuestion(year, 'Question50'),  // national policy on citizen science
    ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        // console.log(value);
        this.barChartSeries.push(this.createBarChartSeries(value, year));

        if (this.years.length === ++index) {
          this.barChartSeries = [...this.barChartSeries];
          this.policiesRawData = value; // Store response to use in other charts
          this.getChart(0); // Draw first map chart
          this.getTableData(); // Call here to avoid duplicate api calls
        }
      },
      error: err => {console.error(err)}
    });
  }

  getFinancialBarChartData(year: string, index: number) {
    zip(
      this.queryData.getQuestion(year, 'Question7'),  // Publications
      this.queryData.getQuestion(year, 'Question15'), // FAIR-data
      this.queryData.getQuestion(year, 'Question11'), // Data-management
      this.queryData.getQuestion(year, 'Question19'), // Open-data
      this.queryData.getQuestion(year, 'Question23'), // Software
      this.queryData.getQuestion(year, 'Question27'), // Services
      this.queryData.getQuestion(year, 'Question31'), // Connecting repositories to EOSC
      this.queryData.getQuestion(year, 'Question35'), // Data stewardship
      this.queryData.getQuestion(year, 'Question39'), // Long-term data preservation
      this.queryData.getQuestion(year, 'Question43'), // Skills/Training
      this.queryData.getQuestion(year, 'Question47'), // Assessment
      this.queryData.getQuestion(year, 'Question51'), // Engagement
    ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        // console.log(value);
        this.barChart2Series.push(this.createBarChartSeries(value, year));

        if (this.years.length === index+1)
          this.barChart2Series = [...this.barChart2Series];
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

  /** Get maps data ----------------------------------------------------------------------------------> **/
  getNationalPolicies(question: string, index: number) {
    zip(
      // this.queryData.getQuestion(this.years[this.years.length-1], question),
      this.queryData.getQuestion(this.years[this.years.length-1], question + '.1'),
      this.queryData.getQuestionComment(this.years[this.years.length-1], question), // For tooltip
    ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: res => {
        this.tmpQuestionsDataArray[index] = this.dataHandlerService.mergePolicyQuestionData(this.policiesRawData[index], res[0]);
        this.participatingCountries[index] = this.dataHandlerService.convertRawDataForActivityGauge(this.policiesRawData[index]);
        this.total[index] = this.policiesRawData[index].datasets[0].series.result.length; // Total countries with validated response

        this.toolTipData[index] = this.dataHandlerService.covertRawDataGetText(res[1]);
        this.questionsDataArray[index] = this.exploreService.createCategorizedMapDataFromMergedResponse(this.tmpQuestionsDataArray[index], this.countriesArray);
      },
      error: err => {console.error(err)}
    });
  }

  getChart(index: number) {
    // console.log(this.questionsDataArray);
    switch (index) {
      case 0:
        if (!this.questionsDataArray[index])
          this.getNationalPolicies('Question6', index); // National Policy on open access publications
        break;
      case 1:
        if (!this.questionsDataArray[index])
          this.getNationalPolicies('Question14', index); // National Policy on FAIR Data
        break;
      case 2:
        if (!this.questionsDataArray[index])
          this.getNationalPolicies('Question18', index); // National Policy on Data Management
        break;
      case 3:
        if (!this.questionsDataArray[index])
          this.getNationalPolicies('Question18', index); // National Policy on Open Data
        break;
      case 4:
        if (!this.questionsDataArray[index])
          this.getNationalPolicies('Question22', index); // National Policy on Open Sources Software
        break;
      case 5:
        if (!this.questionsDataArray[index])
          this.getNationalPolicies('Question26', index); // National Policy on Services
        break;
      case 6:
        if (!this.questionsDataArray[index])
          this.getNationalPolicies('Question30', index); // National Policy on Connecting Repositories to EOSC
        break;
      case 7:
        if (!this.questionsDataArray[index])
          this.getNationalPolicies('Question34', index); // National Policy on Data stewardship
        break;
      case 8:
        if (!this.questionsDataArray[index])
          this.getNationalPolicies('Question38', index); // National Policy on Long-term Data Preservation
        break;
      case 9:
        if (!this.questionsDataArray[index])
          this.getNationalPolicies('Question42', index); // National Policy on Skills/Training in Open Science
        break;
      case 10:
        if (!this.questionsDataArray[index])
          this.getNationalPolicies('Question46', index); // National Policy on Incentives/rewards for Open Science
        break;
      case 11:
        if (!this.questionsDataArray[index])
          this.getNationalPolicies('Question50', index); // National Policy on Citizen Science
        break;
    }
  }

  /** Bubble chart ------------------------------------------------------------------------------------------------> **/
  getBubbleChartData() {
    zip(
      this.queryData.getQuestion(this.year, 'Question6'),   // national policy on open access publications
      this.queryData.getQuestion(this.year, 'Question6.1'), // national policy is mandatory
      this.queryData.getQuestion(this.year, 'Question56'),  // financial investments in open access publications
      this.queryData.getQuestion(this.year, 'Question57'),  // number of publications published in open access
    ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        // console.log(value);
        // console.log(this.createBubbleChartSeries(value));
        this.bubbleWithCategories = this.createBubbleChartSeries(value);
      },
      error: err => {console.error(err)}
    });
  }

  createBubbleChartSeries(data: RawData[]) {
    const tmpArr = this.mergeArrays(data[0].datasets[0].series.result, data[1].datasets[0].series.result, data[2].datasets[0].series.result, data[3].datasets[0].series.result);
    // console.log(tmpArr);
    let series = [
      {
        name: 'Policy is mandatory',
        color: '#32cd32',
        data: []
      }, {
        name: 'Policy is not mandatory',
        color: '#ff8c00',
        data: []
      }, {
        name: 'No policy',
        color: '#808080',
        data: []
      }
    ] as SeriesBubbleOptions[];

    tmpArr.forEach(el => {

      if (!this.isNumeric(el[3]) || !this.isNumeric(el[4]))
        return;

      //TODO: Z is statically set to 10 until corresponding query is provided
      let item = {x: +el[4], y: this.rangeSelector(+el[3]), z: 10, name: el[0], country: this.findCountryName(el[0]).name};

      if (el[1] === 'No')
        series[2].data.push(item);
      else if (el[1] === 'Yes') {
        if(el[2] === 'Yes')
          series[0].data.push(item);
        else if (el[2] === 'No')
          series[1].data.push(item);
      }

    });
    return series;
  }

  /** Create table ------------------------------------------------------------------------------------------------> **/
  getTableData() {
    if (this.policiesRawData.length) {
      this.surveyService.getSurveyValidatedCountries('m-eosc-sb-2023').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: countries => {
          this.createTable(this.policiesRawData, countries);
        },
        error: err => {console.error(err)}
      });
      return;
    }

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
    ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
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

  /** Other stuff -------------------------------------------------------------------------------------------------> **/
  mergeArrays = (...arrays: Row[][]): string[][] => {
    const map = new Map<string, string[]>();

    // Helper function to add rows to the map
    arrays.forEach((arr, arrayIndex) => {
      arr.forEach(row => {
        const country = row.row[0];
        const value = row.row[1];

        if (!map.has(country)) {
          map.set(country, [country, ...Array(arrays.length).fill(null)]);
        }

        const entry = map.get(country)!;
        entry[arrayIndex + 1] = value; // Fill respective column
      });
    });

    // Convert the map to an array of string arrays
    return Array.from(map.values());
  };

  findCountryName(code: string) {
    return countriesNumbers.find(
      elem => elem.id === code
    );
  }

  isNumeric(value: string | null): boolean {
    // Check if the value is empty
    if (value === null)
      return false;

    if (value.trim() === '') {
      return false;
    }

    // Attempt to parse the value as a float
    const number = parseFloat(value);

    // Check if parsing resulted in NaN or the value has extraneous characters
    return !isNaN(number) && isFinite(number) && String(number) === value;
  }

  rangeSelector(value: number) {
    if (value < 1)
      return 0;
    else if (value < 5)
      return 1;
    else if (value < 10)
      return 2;
    else if (value < 20)
      return 3;
    else
      return 4;
  }

}
