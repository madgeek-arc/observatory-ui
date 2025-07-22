import { Component, DestroyRef, inject } from "@angular/core";
import * as Highcharts from "highcharts/highcharts.src";
import { EoscReadinessDataService } from "../../../services/eosc-readiness-data.service";
import { StakeholdersService } from "../../../../../survey-tool/app/services/stakeholders.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { RawData } from "../../../../domain/raw-data";
import { zip } from "rxjs/internal/observable/zip";
import { PdfExportService } from "../../../services/pdf-export.service";
import { CountryTableData } from "../../../../domain/country-table-data";
import { DataHandlerService } from "../../../services/data-handler.service";
import { LegendOptions, PointOptionsObject, SeriesBarOptions } from "highcharts";
import { ExploreService } from "../../explore.service";
import { colors } from "../../../../domain/chart-color-palette";
import { monitoringMapCaptions, policesMapCaptions } from "../../../../domain/chart-captions";
import { SidebarMobileToggleComponent } from "../../../../../survey-tool/app/shared/dashboard-side-menu/mobile-toggle/sidebar-mobile-toggle.component";
import {CommonModule, NgOptimizedImage} from "@angular/common";
import { ChartsModule } from "src/app/shared/charts/charts.module";
import { PageContentComponent } from "../../../../../survey-tool/app/shared/page-content/page-content.component";

@Component({
  selector: 'app-open-science-by-area-data-management',
  templateUrl: './open-science-by-area-data-management.component.html',
  styleUrls: ['../../../../../assets/css/explore-dashboard.less'],
  standalone: true,
  imports: [SidebarMobileToggleComponent, CommonModule, ChartsModule, NgOptimizedImage, PageContentComponent]
})

export class OpenScienceByAreaDataManagementComponent {
  protected readonly Math = Math;

  private destroyRef = inject(DestroyRef);
  exportActive = false;
  smallScreen = false;
  lastUpdateDate?: string;

  years = ['2022', '2023'];

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

  countriesWithPlans: number[] = [];
  countriesWithPolicy: number[] = [];
  countriesWithStrategy: number[] = [];
  countriesWithMonitoring: number[] = [];
  totalInvestments: number[] = [];

  treeGraph: PointOptionsObject[] = [];
  bar: SeriesBarOptions[] = [];
  legendOptions: LegendOptions = {
    align: 'center',
    verticalAlign: 'top',
    backgroundColor: '#FFFFFF',
    borderColor: '#CCC',
    borderWidth: 1,
  };

  countriesArray: string[] = [];
  questionsDataArray: any[] = [];
  tmpQuestionsDataArray: any[] = [];
  participatingCountries: number[] = [];
  total: number[] = [];
  mapPointData: CountryTableData[];
  toolTipData: Map<string, string>[] = [];
  comment?: string;
  countryName?: string;
  countryCode?: string;

  barChartTitles = {
    title: 'Financial Investments in Data Management in 2022',
    xAxis: '',
    yAxis: '',
  }

  constructor(private queryData: EoscReadinessDataService, private pdfService: PdfExportService,
              private stakeholdersService: StakeholdersService, private dataHandlerService: DataHandlerService,
              private exploreService: ExploreService) {}

  ngOnInit() {

    this.smallScreen = this.exploreService.isMobileOrSmallScreen;

    this.years.forEach((year, index) => {
      this.getCountriesWithPolicy(year, index);
      this.getTotalInvestments(year, index);
      this.getCountriesWithFinancialStrategy(year, index);
      this.getNationalMonitoring(year, index);
      this.getPlans(year, index);

      this.getStackedColumnData(year, index);
    });

    this.getTreeGraphData();

    // Maps
    this.stakeholdersService.getEOSCSBCountries().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: countries => {
        this.countriesArray = countries;
        this.getNationalPolicies('Question10', 0);
        this.getMonitoring('Question58', 1, 2);
      },
      error: error => {console.error(error);}
    });

    this.exploreService._lastUpdateDate.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => this.lastUpdateDate = value
    });
  }

  /** Get maps data ----------------------------------------------------------------------------------> **/
  getNationalPolicies(question: string, index: number) {
    zip(
      this.queryData.getQuestion(this.years[this.years.length-1], question),
      this.queryData.getQuestion(this.years[this.years.length-1], question + '.1'),
      this.queryData.getQuestionComment(this.years[this.years.length-1], question),
    ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: res => {
        this.tmpQuestionsDataArray[index] = this.dataHandlerService.mergePolicyQuestionData(res[0], res[1]);
        this.participatingCountries[index] = this.dataHandlerService.convertRawDataForActivityGauge(res[0]);
        this.total[index] = res[0].datasets[0].series.result.length; // Total countries with validated response

        this.toolTipData[index] = this.dataHandlerService.covertRawDataGetText(res[2]);
        this.questionsDataArray[index] = this.exploreService.createCategorizedMapDataFromMergedResponse(this.tmpQuestionsDataArray[index], this.countriesArray);
      },
      error: err => {console.error(err)}
    });
  }

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

  /** Get national monitoring on Data Management ------------------------------------------------------------------> **/
  getNationalMonitoring(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question58').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ // National monitoring in FAIR data
      next: value => {
        this.countriesWithMonitoring[index] = this.calculatePercentage(value, value.datasets[0].series.result.length);
      }
    });
  }

  /** Get financial strategy on Data Management -------------------------------------------------------------------> **/
  getCountriesWithFinancialStrategy(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question11').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ // Financial strategy in FAIR data
      next: value => {
        this.countriesWithStrategy[index] = this.calculatePercentage(value, value.datasets[0].series.result.length);
      }
    });
  }

  /** Get investments on Data Management --------------------------------------------------------------------------> **/
  getTotalInvestments(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question60').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ // Financial investment in FAIR data
      next: value => {
        this.totalInvestments[index] = this.calculateSum(value);
      }
    });
  }

  /** Get countries with policy on Data Management percentage -----------------------------------------------------> **/
  getCountriesWithPolicy(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question10').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ // Country has a national policy on FAIR data
      next: value => {
        this.countriesWithPolicy[index] = this.calculatePercentage(value, value.datasets[0].series.result.length);
      }
    });
  }

  /** Get data management plans published count ------------------------------------------------------------------ > **/
  getPlans(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question61').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ // National monitoring in FAIR data
      next: value => {
        this.countriesWithPlans[index] = this.calculateSum(value);
        // console.log(this.countriesWithPlans);
      }
    });
  }

  /** Stacked column chart ----------------------------------------------------------------------------------------> **/
  getStackedColumnData(year: string, index: number) {
    zip(
      this.queryData.getQuestion(year, 'Question2'),  // research performing organisations
      this.queryData.getQuestion(year, 'Question3'),  // research funding organisations
      this.queryData.getQuestion(year, 'Question12'), // research performing organisations in your country have a policy on data management
      this.queryData.getQuestion(year, 'Question13'), // research funding organisations in your country have a policy on data management
    ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value =>  {
        this.exploreService.createStackedColumnSeries([value[0], value[2]], this.stackedColumnSeries1);
        this.exploreService.createStackedColumnSeries([value[1], value[3]], this.stackedColumnSeries2);
        if (this.years.length === index+1) {
          this.stackedColumnSeries1 = [...this.stackedColumnSeries1];
          this.stackedColumnSeries2 = [...this.stackedColumnSeries2];
        }
      }
    });
  }
  /** <---------------------------------------------------------------------------------------- Stacked column chart **/

  /** Investments as tree graph -----------------------------------------------------------------------------------> **/
  getTreeGraphData() {
    this.queryData.getQuestion(this.years[this.years.length-1], 'Question60').pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      res => {
        this.bar = this.exploreService.createInvestmentsBar(res);
        this.treeGraph = this.exploreService.createRanges(res);
      }
    );
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


  /** Other ------------------------------------------------------------------------------------------------------>  **/
  calculatePercentage(data: RawData, totalCountries: number) {
    let count = 0;
    data.datasets[0].series.result.forEach(item => {
      if (item.row[1] === 'Yes')
        count++;
    });
    return(Math.round(((count/totalCountries) + Number.EPSILON) * 100));
  }

  calculatePercentageChange(data: number[]) {
    if (data[0] === 0)
      return '--';

    let percentage = Math.abs((data[1] - data[0]) / data[0]);
    return Math.round((percentage + Number.EPSILON) * 100);

  }

  calculateSum(data: RawData) {
    let sum = 0;
    data.datasets[0].series.result.forEach(item => {
      if (this.exploreService.isNumeric(item.row[1]))
        sum += +item.row[1];
    });

    return Math.round(sum * 100) / 100;
  }

  showComment(index: number, country: {code: string}) {
    this.comment = this.toolTipData[index].get(country.code.toLowerCase())?.replace(/\\n/g,'<br>').replace(/\\t/g,'  ') ?? 'N/A';
    this.countryCode = country.code.toLowerCase();
    this.countryName = this.exploreService.findCountryName(country.code).name
  }

  protected readonly policesMapCaptions = policesMapCaptions;
  protected readonly monitoringMapCaptions = monitoringMapCaptions;
}
