import { Component, DestroyRef, inject } from "@angular/core";
import * as Highcharts from "highcharts/highcharts.src";
import { EoscReadinessDataService } from "../../../services/eosc-readiness-data.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { RawData } from "../../../../domain/raw-data";
import { PdfExportService } from "../../../services/pdf-export.service";
import { LegendOptions, PointOptionsObject, SeriesBarOptions } from "highcharts";
import { ExploreService } from "../../explore.service";
import { AreaMapsCardComponent, AreaMapTabConfig } from "../../area-maps-card/area-maps-card.component";
import { monitoringMapCaptions, policesMapCaptions } from "../../../../domain/chart-captions";
import {
  SidebarMobileToggleComponent
} from "../../../../../survey-tool/app/shared/dashboard-side-menu/mobile-toggle/sidebar-mobile-toggle.component";
import {NgClass, NgOptimizedImage} from "@angular/common";
import { ChartsModule } from "src/app/shared/charts/charts.module";
import { PageContentComponent } from "../../../../../survey-tool/app/shared/page-content/page-content.component";

@Component({
    selector: 'app-open-science-by-area-data-management',
    templateUrl: './open-science-by-area-data-management.component.html',
    styleUrls: ['../../../../../assets/css/explore-dashboard.less'],
  imports: [SidebarMobileToggleComponent, ChartsModule, NgOptimizedImage, PageContentComponent, NgClass, AreaMapsCardComponent]
})

export class OpenScienceByAreaDataManagementComponent {

  protected trendService = inject(ExploreService);
  protected readonly Math = Math;

  private destroyRef = inject(DestroyRef);
  exportActive = false;
  smallScreen = false;
  lastUpdateDate?: string;

  years = ['2023', '2024'];
  year = this.years[this.years.length-1];

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

  stackedColumnCategories = this.years;
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

  policyTabConfig: AreaMapTabConfig = {
    question: 'Question10',
    title: 'National policy on Data Management',
    caption: policesMapCaptions[1] + '<strong>Data source:</strong> Survey on National Contributions to EOSC and Open Science ' + this.year + '.',
    labelSuffix: ' countries have a <br>national policy on Data Management</span>'
  };

  monitoringTabConfig: AreaMapTabConfig = {
    question: 'Question58',
    title: 'National monitoring on Data Management',
    caption: monitoringMapCaptions[1] + '<strong>Data source:</strong> Survey on National Contributions to EOSC and Open Science ' + this.year + '.',
    labelSuffix: ' countries have a <br>national monitoring on Data Management</span>'
  };

  financialStrategyTabConfig: AreaMapTabConfig = {
    question: 'Question11',
    title: 'National financial strategy on Data Management',
    caption: '<p>This map illustrates the status of national financial strategies on Data Management across European countries.</p><strong>Data source:</strong> Survey on National Contributions to EOSC and Open Science ' + this.year + '.',
    labelSuffix: ' countries have a <br>national financial strategy on Data Management</span>'
  };

  barChartTitles = {
    title: 'Financial Investments in Data Management in '+(+this.year-1),
    xAxis: '',
    yAxis: '',
  }

  constructor(private queryData: EoscReadinessDataService, private pdfService: PdfExportService,
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

    this.exploreService._lastUpdateDate.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => this.lastUpdateDate = value
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
    const nameArr = [
      'Question2', // research performing organisations
      'Question3', // research funding organisations
      'Question12', // research performing organisations in your country have a policy on data management
      'Question13', // research funding organisations in your country have a policy on data management
    ];

    this.queryData.getQuestions(year, nameArr).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value =>  {
        this.exploreService.createStackedColumnSeries([value.datasets[0], value.datasets[2]], this.stackedColumnSeries1);
        this.exploreService.createStackedColumnSeries([value.datasets[1], value.datasets[3]], this.stackedColumnSeries2);
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
    this.queryData.getQuestion(this.year, 'Question60').pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
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

}
