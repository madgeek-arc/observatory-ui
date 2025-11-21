import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import * as Highcharts from "highcharts";
import { LegendOptions, SeriesBubbleOptions, SeriesOptionsType } from "highcharts";
import { zip } from "rxjs/internal/observable/zip";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { EoscReadinessDataService } from "../../services/eosc-readiness-data.service";
import { RawData, Row, Data } from "../../../domain/raw-data";
import { countriesNumbers } from "../../eosc-readiness-dashboard/eosc-readiness-2022/eosc-readiness2022-map-subtitles";
import { DataHandlerService } from "../../services/data-handler.service";
import { SurveyService } from "../../../../survey-tool/app/services/survey.service";
import { PdfExportService } from "../../services/pdf-export.service";
import { ExploreService } from "../explore.service";
import { StakeholdersService } from "../../../../survey-tool/app/services/stakeholders.service";
import { CategorizedAreaData } from "../../../domain/categorizedAreaData";
import { openScienceAreas, policesMapCaptions } from "../../../domain/chart-captions";
import { OAAndTotalPublicationsPerCountry } from "../OSO-stats-queries/explore-queries";
import { SidebarMobileToggleComponent } from "../../../../survey-tool/app/shared/dashboard-side-menu/mobile-toggle/sidebar-mobile-toggle.component";
import { CommonModule } from "@angular/common";
import { ChartsModule } from "src/app/shared/charts/charts.module";
import { PageContentComponent } from "../../../../survey-tool/app/shared/page-content/page-content.component";


@Component({
    selector: 'app-open-science-policies',
    templateUrl: './open-science-policies.component.html',
    styleUrls: ['../../dashboard/country-landing-page/country-landing-page.component.css'],
    imports: [SidebarMobileToggleComponent, CommonModule, ChartsModule, PageContentComponent]
})

export class OpenSciencePoliciesComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  protected readonly policesMapCaptions = policesMapCaptions;

  exportActive = false;

  years = ['2022', '2023', '2024'];
  year = this.years[this.years.length-1];
  lastUpdateDate?: string;

  smallScreen = false;

  columnChartCategories= openScienceAreas;

  columnChartSeries: SeriesOptionsType[] = [];
  columnChartTitles = {
    title: 'National Open Science Policies by Areas',
    xAxis: 'Policy on',
    yAxis: 'Percentage of countries with national policies',
  }

  columnChart2Series: SeriesOptionsType[] = [];
  columnChart2Titles = {
    title: 'Financial Strategy on EOSC and Open Science by Areas',
    xAxis: 'Financial Strategy on',
    yAxis: 'Percentage of countries with Financial Strategy',
  }

  columnChart3Series: SeriesOptionsType[] = [];
  columnChart3Titles = {
    title: 'Coverage of Researchers by National Open Science Policies in Europe',
    xAxis: 'National Policy on',
    yAxis: 'Percentage of Researchers Covered',
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
  policiesPerCountryPerYear = new Map<string, RawData>();
  researchersPerCountryPerYear = new Map<string, RawData>();
  totalResearchersPerYear = new Map<string, string>();

  bubbleChart = [] as SeriesBubbleOptions[];
  bubbleChartTooltip = {
    useHTML: true,
    headerFormat: '<table>',
    pointFormat: '<tr><th colspan="2"><h4>{point.country}</h4></th></tr>' +
      '<tr><th>Publications per Researcher FTE:</th><td>{point.x}</td></tr>' +
      '<tr><th>Financial investment per researcher FTE:</th><td>{point.y}</td></tr>' +
      '<tr><th>OA Publications:</th><td>{point.z}%</td></tr>',
    footerFormat: '</table>',
    followPointer: true
  }

  tableData: string[][] = [];

  openScienceAreas = this.columnChartCategories;
  mapTitles = ['National Policy on Open Access Publications', 'National Policy on Data Management', 'National Policy on FAIR Data', 'National Policy on Open Data', 'National Policy on Open Sources Software', 'National Policy on offering services through EOSC', 'National Policy on Connecting Repositories to EOSC', 'National Policy on Data Stewardship', 'National Policy on Long-term Data Preservation', 'National Policy on Skills/Training in Open Science', 'National Policy on Incentives/Rewards for Open Science', 'National Policy on Citizen Science'];

  policiesRawData: RawData = new RawData();
  policiesMapData: CategorizedAreaData = new CategorizedAreaData();
  countriesArray: string[] = [];
  questionsDataArray: any[] = [];
  tmpQuestionsDataArray: any[] = [];
  participatingCountries: number[] = [];
  total: number[] = [];
  toolTipData: Map<string, string>[] = [];

  constructor(private queryData: EoscReadinessDataService, private surveyService: SurveyService,
              private dataHandlerService: DataHandlerService, private pdfService: PdfExportService,
              private exploreService: ExploreService, private stakeholdersService: StakeholdersService) {}

  ngOnInit() {

    this.years.forEach((year, index) => {
      this.getColumnChartData(year, index);
      this.getFinancialColumnChartData(year);
    });

    this.getBubbleChartData();
    // this.getTableData();

    this.exploreService._lastUpdateDate.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => this.lastUpdateDate = value
    });

    this.smallScreen = this.exploreService.isMobileOrSmallScreen;
  }

  /** Bar charts ---------------------------------------------------------------------------------------------------> **/
  getColumnChartData(year: string, index: number) {
    const nameArr = [
      'Question6', // national policy on Open Access publications
      'Question14', // national policy on FAIR data
      'Question10', // national policy on data management
      'Question18', // national policy on Open data
      'Question22', // national policy on software
      'Question26', // national policy on offering services through EOSC
      'Question30', // national policy on connecting repositories to EOSC
      'Question34', // national policy on data stewardship
      'Question38', // national policy on long-term data preservation
      'Question42', // national policy on skills/training for Open Science
      'Question46', // national policy on incentives/rewards for Open Science
      'Question50', // national policy on citizen science
    ];

    this.queryData.getQuestions(year, nameArr).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        // console.log(value);
        this.policiesPerCountryPerYear.set(year, value);
        this.columnChartSeries.push(this.exploreService.createColumnChartSeries(value, year));

        if (this.columnChartSeries.length === this.years.length) {
          this.columnChartSeries.sort((a, b) => a.name.localeCompare(b.name));
          this.columnChartSeries = [...this.columnChartSeries];
        }

        if (this.policiesPerCountryPerYear.size === this.years.length) {
          this.getResearchersByYear();
        }

        if (this.years.length === ++index) {
          this.policiesRawData = value; // Store response to use in other charts

          this.getTableData(); // Call here to avoid duplicate api calls

          // Call Map initialization here to avoid duplicate api calls
          this.stakeholdersService.getEOSCSBCountries().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: countries => {
              this.countriesArray = countries;
              this.getChart(0); // Draw first map
              this.policiesMapData = this.exploreService.mergeCategorizedMapData(this.policiesRawData, this.openScienceAreas, this.countriesArray, 'policies');
            },
            error: error => {console.error(error);}
          });
        }
      },
      error: err => {console.error(err)}
    });
  }

  getFinancialColumnChartData(year: string) {
    const nameArr = [
      'Question7', // Publications
      'Question15', // FAIR-data
      'Question11', // Data-management
      'Question19', // Open-data
      'Question23', // Software
      'Question27', // Services
      'Question31', // Connecting repositories to EOSC
      'Question35', // Data stewardship
      'Question39', // Long-term data preservation
      'Question43', // Skills/Training
      'Question47', // Assessment
      'Question51', // Engagement
    ];

    this.queryData.getQuestions(year, nameArr).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        // console.log(value);
        this.columnChart2Series.push(this.exploreService.createColumnChartSeries(value, year));

        if (this.columnChart2Series.length === this.years.length) { // When series complete
          this.columnChart2Series.sort((a, b) => a.name.localeCompare(b.name));
          this.columnChart2Series = [...this.columnChart2Series]; // Trigger angular detection change
        }
      },
      error: err => {console.error(err)}
    });
  }

  getResearchersByYear(): void {
    this.years.forEach((year) => {
      this.queryData.getQuestion(year, 'Question1').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: value => {
          this.researchersPerCountryPerYear.set(year, value);
          this.totalResearchersPerYear.set(year, this.exploreService.calculateSum(value));

          this.columnChart3Series.push(this.createResearchersColumnChartSeries(year));

          if (this.columnChart3Series.length === this.years.length) {
            this.columnChart3Series.sort((a, b) => a.name.localeCompare(b.name));
            this.columnChart3Series = [...this.columnChart3Series];
          }
        },
        error: error => {console.error(error);}
      });
    })
  }

  createResearchersColumnChartSeries(year: string) {
    let series: Highcharts.SeriesColumnOptions = {
      type: 'column',
      name: 'Year '+ year,
      data: []
    }
    this.policiesPerCountryPerYear.get(year).datasets.forEach(data => {
      let researchersCount = 0;
      data.series.result.forEach(item => {
        if (item.row[1] === 'Yes') {
          this.researchersPerCountryPerYear.get(year).datasets[0].series.result.forEach(data => {
            if (data.row[0] === item.row[0]) {
              if (this.exploreService.isNumeric(data.row[1])) {
                researchersCount+= +data.row[1];
              }
            }
          });
        }
      });
      series.data.push(Math.round(((researchersCount/(+this.totalResearchersPerYear.get(year)) + Number.EPSILON) * 100)));
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
        this.tmpQuestionsDataArray[index] = this.dataHandlerService.mergePolicyQuestionData({
          datasets: [this.policiesRawData.datasets[index]]
        }, res[0]);
        this.participatingCountries[index] = this.dataHandlerService.convertRawDataForActivityGauge({datasets: [this.policiesRawData.datasets[index]]});
        this.total[index] = this.policiesRawData.datasets[index].series.result.length; // Total countries with validated response

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
          this.getNationalPolicies('Question6', index); // National Policy on Open Access publications
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
      this.queryData.getQuestion(this.year, 'Question1'),   // Number of Researchers in FTE per country
      this.queryData.getQuestion(this.year, 'Question5'),   // Financial investments in EOSC and Open Science per country
      this.queryData.getQuestion(this.year, 'Question56'),  // Financial investments in Open Access publications
      // this.queryData.getQuestion(this.year, 'Question57'), // number of publications published in Open Access
      this.queryData.getOSOStats(OAAndTotalPublicationsPerCountry(this.years[this.years.length-2])), // number of publications published in Open Access

    ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.bubbleChart = this.createBubbleChartSeries(value[3], value[0], value[1], value[2]);
      },
      error: err => {console.error(err)}
    });
  }

  createBubbleChartSeries(data: Data, ...rawData: RawData[]) {
    const tmpArr = this.mergeArrays(data, rawData[0].datasets[0].series.result, rawData[1].datasets[0].series.result, rawData[2].datasets[0].series.result);
    // console.log(tmpArr);
    let series = [{
      data: [],
      colorByPoint: true
    }] as unknown as SeriesBubbleOptions[];

    tmpArr.forEach(el => {

      if (!this.exploreService.isNumeric(el[1]) || !this.exploreService.isNumeric(el[2])
        || !this.exploreService.isNumeric(el[3]) || !this.exploreService.isNumeric(el[4])
        || !this.exploreService.isNumeric(el[5]))
        return;

      let item = {
        x: Math.round(((+el[3] * 1000000 / +el[1]) + Number.EPSILON) * 100) / 100,
        y: Math.round((((+el[2] * 1000000) / +el[1]) + Number.EPSILON) * 100) / 100,
        z: Math.round(((+el[4] / +el[5]) + Number.EPSILON) * 100), // calculate OA Pubs of total Pubs percentage
        name: el[0],
        country: this.findCountryName(el[0]).name
      };

      series[0].data.push(item);

    });
    return series;
  }

  /** Create table ------------------------------------------------------------------------------------------------> **/
  getTableData() {
    if (this.policiesRawData.datasets.length) {
      this.surveyService.getSurveyValidatedCountries('m-eosc-sb-2023').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: countries => {
          this.tableData = this.exploreService.createTable(this.policiesRawData, countries);
        },
        error: err => {console.error(err)}
      });
      return;
    }


    const nameArr = [
      'Question6', // national policy on Open Access publications
      'Question14', // national policy on FAIR data
      'Question10', // national policy on data management
      'Question18', // national policy on Open data
      'Question22', // national policy on software
      'Question26', // national policy on offering services through EOSC
      'Question30', // national policy on connecting repositories to EOSC
      'Question34', // national policy on data stewardship
      'Question38', // national policy on long-term data preservation
      'Question42', // national policy on skills/training for Open Science
      'Question46', // national policy on incentives/rewards for Open Science
      'Question50', // national policy on citizen science
    ];

    this.queryData.getQuestions(this.year, nameArr).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
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

  /** Other stuff -------------------------------------------------------------------------------------------------> **/
  mergeArrays = (data: Data, ...arrays: Row[][]): string[][] => {
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

    data.data.forEach(series => { // Add OA and total publications to each country
      series.forEach(row => {
        const entry = map.get(row[1])!;
        if (entry)
          entry.push(row[0]); // Fill respective column
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

  /** Method for mobile select switch */
  onSelectChange(event: any) {
    const selectedIndex = event.target.value;
    const tabs = document.querySelectorAll('.uk-tab li a');
    if (tabs[selectedIndex]) {
      (tabs[selectedIndex] as HTMLElement).click();
    }
  }

}
