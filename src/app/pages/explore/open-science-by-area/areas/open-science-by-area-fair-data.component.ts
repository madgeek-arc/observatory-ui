import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { EoscReadinessDataService } from "../../../services/eosc-readiness-data.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { RawData } from "../../../../domain/raw-data";
import * as Highcharts from "highcharts/highcharts.src";
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
    selector: 'app-open-science-by-area-fair-data',
    templateUrl: './open-science-by-area-fair-data.component.html',
    styleUrls: ['../../../../../assets/css/explore-dashboard.less'],
  imports: [SidebarMobileToggleComponent, ChartsModule, NgOptimizedImage, PageContentComponent, NgClass, AreaMapsCardComponent]
})

export class OpenScienceByAreaFairDataComponent implements OnInit {
  protected readonly Math = Math;
  protected  trendService = inject(ExploreService);

  private destroyRef = inject(DestroyRef);
  exportActive = false;
  smallScreen = false;
  lastUpdateDate?: string;

  years = ['2023', '2024'];
  year = this.years[this.years.length-1];

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
  stackedColumnCategories = this.years;
  xAxisTitle = 'Year';
  yAxisTitle = 'Percentage of Policies on FAIR Data';
  tooltipPointFormat = '<span style="color:{series.color}">{series.name}</span> : <b>{point.y}</b>';
  labelFormat = '{value}%';
  plotFormat = '{point.percentage:.0f}%';

  countriesWithPolicy: number[] = [];
  countriesWithStrategy: number[] = [];
  countriesWithMonitoring: number[] = [];
  totalInvestments: number[] = [];

  treeGraph: PointOptionsObject[] = [];
  bar: SeriesBarOptions[] = [];
  legendOptions: LegendOptions = {
    align: 'center',
    verticalAlign: 'top',
  };

  policyTabConfig: AreaMapTabConfig = {
    question: 'Question14',
    title: 'National policy on FAIR Data',
    caption: policesMapCaptions[2] + '<strong>Data source:</strong> Survey on National Contributions to EOSC and Open Science ' + this.year + '.',
    labelSuffix: ' countries have a <br>national policy on FAIR Data</span>'
  };

  monitoringTabConfig: AreaMapTabConfig = {
    question: 'Question62',
    title: 'National monitoring on FAIR Data',
    caption: monitoringMapCaptions[2] + '<strong>Data source:</strong> Survey on National Contributions to EOSC and Open Science ' + this.year + '.',
    labelSuffix: ' countries have a <br>national monitoring on FAIR Data</span>'
  };

  financialStrategyTabConfig: AreaMapTabConfig = {
    question: 'Question15',
    title: 'National financial strategy on FAIR Data',
    caption: '<p>This map illustrates the status of national financial strategies on FAIR Data across European countries.</p><strong>Data source:</strong> Survey on National Contributions to EOSC and Open Science ' + this.year + '.',
    labelSuffix: ' countries have a <br>national financial strategy on FAIR Data</span>'
  };

  barChartTitles = {
    title: 'Financial Investments in FAIR Data in '+(+this.year-1),
    xAxis: '',
    yAxis: '',
  };

  constructor(private queryData: EoscReadinessDataService, private pdfService: PdfExportService,
              private exploreService: ExploreService) {}

  ngOnInit() {
    this.years.forEach((year, index) => {
      this.getCountriesWithPolicy(year, index);
      this.getTotalFairInvestments(year, index);
      this.getCountriesWithFinancialStrategy(year, index);
      this.getNationalMonitoring(year, index);

      this.getStackedColumnData(year, index);
    });

    this.getTreeGraphData();

    this.smallScreen = this.exploreService.isMobileOrSmallScreen;

    this.exploreService._lastUpdateDate.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => this.lastUpdateDate = value
    });

  }

  /** Get national monitoring on FAIR Data -------------------------------------------------------------------------> **/
  getNationalMonitoring(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question62').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ // National monitoring in FAIR data
      next: value => {
        this.countriesWithMonitoring[index] = this.calculatePercentage(value, value.datasets[0].series.result.length);
      }
    });
  }

  /** Get financial strategy on FAIR Data -------------------------------------------------------------------------> **/
  getCountriesWithFinancialStrategy(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question15').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ // Financial strategy in FAIR data
      next: value => {
        this.countriesWithStrategy[index] = this.calculatePercentage(value, value.datasets[0].series.result.length);
      }
    });
  }

  /** Get investments on FAIR Data --------------------------------------------------------------------------------> **/
  getTotalFairInvestments(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question64').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ // Financial investment in FAIR data
      next: value => {
        this.totalInvestments[index] = this.calculateSum(value);
      }
    });
  }

  /** Get countries with policy on FAIR Data percentage -----------------------------------------------------------> **/
  getCountriesWithPolicy(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question14').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ // Country has a national policy on FAIR data
      next: value => {
        this.countriesWithPolicy[index] = this.calculatePercentage(value, value.datasets[0].series.result.length);
      }
    });
  }

  /** Stacked column chart ----------------------------------------------------------------------------------------> **/
  getStackedColumnData(year: string, index: number) {
    const nameArr = [
      'Question2', // Research performing organisations
      'Question3', // Research funding organisations
      'Question16', // Research performing organisations with policy on FAIR data
      'Question17', // Research funding organisations with policy on FAIR data
    ]
    this.queryData.getQuestions(year ,nameArr).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
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

  /** Investments as tree graph ------------------------------------------------------------------------------------>**/
  getTreeGraphData() {
    this.queryData.getQuestion(this.year, 'Question64').pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
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
