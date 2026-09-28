import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {NgClass, NgOptimizedImage} from "@angular/common";
import { EoscReadinessDataService } from "../../../services/eosc-readiness-data.service";
import { RawData } from "../../../../domain/raw-data";
import {
  distributionOfOA,
  distributionOfOAByScienceFields,
  distributionOfOAPublications,
  OAPublicationVSClosed,
  trendOfOAPublications
} from "../../OSO-stats-queries/explore-queries";
import * as Highcharts from "highcharts";
import {
  LegendOptions,
  OptionsStackingValue,
  PointOptionsObject,
  SeriesBarOptions,
  SeriesOptionsType
} from "highcharts";
import { PdfExportService } from "../../../services/pdf-export.service";
import { ExploreService } from "../../explore.service";
import { AreaMapsCardComponent, AreaMapTabConfig } from "../../area-maps-card/area-maps-card.component";
import { monitoringMapCaptions, policesMapCaptions } from "../../../../domain/chart-captions";
import { ChartsModule } from "src/app/shared/charts/charts.module";
import { SidebarMobileToggleComponent } from "../../../../../survey-tool/app/shared/dashboard-side-menu/mobile-toggle/sidebar-mobile-toggle.component";
import { PageContentComponent } from "../../../../../survey-tool/app/shared/page-content/page-content.component";


@Component({
    selector: 'app-open-science-by-area-publications',
    templateUrl: './open-science-by-area-publications.component.html',
    styleUrls: ['../../../../../assets/css/explore-dashboard.less'],
  imports: [SidebarMobileToggleComponent, ChartsModule, NgOptimizedImage, PageContentComponent, NgClass, AreaMapsCardComponent]
})

export class OpenScienceByAreaPublicationsComponent implements OnInit {
  protected readonly Math = Math;
  protected trendService = inject(ExploreService);

  private destroyRef = inject(DestroyRef);
  exportActive = false;
  lastUpdateDate?: string;
  smallScreen = false;

  years = ['2023', '2024'];
  year = this.years[this.years.length-1];

  stackedColumnCategories: string[] = [];
  stackedColumnSeries: Highcharts.SeriesColumnOptions[] = [];
  yAxisTitle = 'Number of Publications';
  legend: LegendOptions = {
    // align: 'right',
    // verticalAlign: 'top',
    // x: 0,
    // y: 35,
    // floating: true,
    backgroundColor: Highcharts.defaultOptions.legend.backgroundColor || 'white',
    borderColor: '#CCC',
    borderWidth: 1,
    // shadow: false
  };
  tooltipPointFormat = '{series.name}: {point.y}<br/>Total: {point.total}';

  stackedColumn2Categories = [];
  stackedColumn2Series:Highcharts.SeriesColumnOptions[] = [];
  yAxisTitle2 = 'Percentage of Publications';
  stacking: OptionsStackingValue = 'percent';
  dataLabels_format = '{point.percentage:.0f}%';

  treemapData: Highcharts.PointOptionsObject[] = [];

  countriesWithPolicy: number[] = [];
  countriesWithPolicyImmediate: number[] = [];
  countriesWithStrategy: number[] = [];
  countriesWithMonitoring: number[] = [];
  totalInvestments: number[] = [];
  OAPublications: number[] = [];

  treeGraph: PointOptionsObject[] = [];
  bar: SeriesBarOptions[] = [];
  legendOptions: LegendOptions = {
    align: 'center',
    verticalAlign: 'top',
    backgroundColor: Highcharts.defaultOptions.legend.backgroundColor || 'white',
    borderColor: '#CCC',
    borderWidth: 1,
  };

  policyTabConfig: AreaMapTabConfig = {
    question: 'Question6',
    title: 'National policy on Open Access publications',
    caption: policesMapCaptions[0] + '<strong>Data source:</strong> Survey on National Contributions to EOSC and Open Science ' + this.year + '.',
    labelSuffix: ' countries have a <br>national policy on OΑ publications</span>'
  };

  monitoringTabConfig: AreaMapTabConfig = {
    question: 'Question54',
    title: 'National monitoring on Open Access publications',
    caption: monitoringMapCaptions[0] + '<strong>Data source:</strong> Survey on National Contributions to EOSC and Open Science ' + this.year + '.',
    labelSuffix: ' countries have a <br>national monitoring on OΑ publications</span>'
  };

  financialStrategyTabConfig: AreaMapTabConfig = {
    question: 'Question7',
    title: 'National financial strategy on Open Access publications',
    caption: monitoringMapCaptions[2] + '<strong>Data source:</strong> Survey on National Contributions to EOSC and Open Science ' + this.year + '.',
    labelSuffix: ' countries have a <br>national financial strategy on OΑ publications</span>'
  };

  bar2: SeriesOptionsType[] = [
    {
      type: 'bar',
      name: 'Open',
      data: []
    },
    {
      type: 'bar',
      name: 'Closed',
      data: []
    }
  ];
  barCategories: string[] = [];

  barChartTitles = {
    title: 'Financial Investments in Open Access Publications in '+(+this.year-1),
    xAxis: '',
    yAxis: '',
  }

  barChart2Titles = {
    title: 'Distribution of Publications Access by Fields of Science',
    xAxis: '',
    yAxis: '',
  }

  constructor(private queryData: EoscReadinessDataService, private pdfService: PdfExportService,
              private exploreService: ExploreService) {}

  ngOnInit() {
    this.getPublicationPercentage();
    this.getTrends();
    this.getDistributionOAPublication();
    // this.getDistributionOAByScienceFields();

    this.getTreeGraphData('Question56');

    this.getDistributionsOA();

    this.smallScreen = this.exploreService.isMobileOrSmallScreen;

    // Multi-year Bars
    this.years.forEach((year, index) => {
      this.getCountriesWithPolicy(year, index);
      this.getTotalInvestments(year, index);
      this.getCountriesWithFinancialStrategy(year, index);
      this.getNationalMonitoring(year, index);
      this.getCountriesWithPolicyImmediate(year, index);
      // this.getPlans(year, index);
    });

    this.exploreService._lastUpdateDate.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => this.lastUpdateDate = value
    });

  }

  /** Get trends of Publications ----------------------------------------------------------------------------------> **/
  getTrends() {
    this.queryData.getOSOStatsChartData(trendOfOAPublications(this.year)).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        value.series.forEach((series, index) => {
          const tmpSeries: SeriesOptionsType = {
            type: 'column',
            name: value.dataSeriesNames[index],
            data: series.data,
          };
          this.stackedColumnSeries.push(tmpSeries);
        });
        this.stackedColumnCategories = value.xAxis_categories;
      }
    });
  }

  /** Get Distribution of Open Access Types by Fields of Science --------------------------------------------------> **/
  getDistributionsOA() {
    this.queryData.getOSOStatsChartData(distributionOfOA(this.year)).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        value.series.forEach((series, index) => {
          (this.bar2[index] as SeriesBarOptions).data = series.data;
        });
        for (let i = 0; i < (this.bar2[this.bar2.length - 1] as SeriesBarOptions).data.length; i++) {
          (this.bar2[this.bar2.length - 1] as SeriesBarOptions).data[i] = -(this.bar2[this.bar2.length - 1] as SeriesBarOptions).data[i];
        }
        this.barCategories = value.xAxis_categories;

      }
    });
  }

  /** Get Distribution of Open Access Types by Fields of Science **/
  getDistributionOAByScienceFields() {
    this.queryData.getOSOStatsChartData(distributionOfOAByScienceFields(this.year)).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        let tmpArr = [];
        value.xAxis_categories.forEach((category, index) => {
          let topLevelItem: Highcharts.PointOptionsObject = {
            id: '',
            name: ''
          };
          tmpArr = category.split(/ (.*)/s);
          topLevelItem.id = index.toString();
          topLevelItem.name = tmpArr[1];
          this.treemapData.push(topLevelItem);
        });

        value.series[0].data.forEach((el, index) => {
          let itemsGroup: Highcharts.PointOptionsObject[] = [
            {
              parent: index.toString(),
              name: 'Gold OA Only',
              value: value.series[0].data[index],
              color: '#FFD700'  // Gold
            }, {
              parent: index.toString(),
              name: 'Green OA Only',
              value: value.series[1].data[index],
              color: '#228B22'  // Green
            }, {
              parent: index.toString(),
              name: 'Both Gold & Green OA',
              value: value.series[2].data[index],
              color: '#FF69B4'  // Pink
            }, {
              parent: index.toString(),
              name: 'Neither',
              value: value.series[3].data[index],
              color: '#b0c4de'
            }, {
              parent: index.toString(),
              name: 'Closed',
              value: value.series[4].data[index],
              color: '#808080'  // Grey
            }
          ]

          this.treemapData.push(...itemsGroup);
        });
        this.treemapData = [...this.treemapData];
      }
    });
  }

  /** Get Distribution of Open Access Types by Different Scholarly Publication Outputs **/
  getDistributionOAPublication() {
    this.queryData.getOSOStatsChartData(distributionOfOAPublications(this.year)).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        value.series.forEach((series, index) => {
          const tmpSeries: SeriesOptionsType = {
            type: 'column',
            name: value.dataSeriesNames[index],
            data: series.data,
          }

          this.stackedColumn2Series.push(tmpSeries);
        });
        this.stackedColumn2Categories = value.xAxis_categories;
        // this.stackedColumn2Series[0].data.forEach((item, index) => {
        //   let sum = 0;
        //   this.stackedColumn2Series.forEach(series => {
        //     sum += (+series.data[index]);
        //   });
        //   this.stackedColumn2Categories[index] = this.stackedColumn2Categories[index]+ ` (total = ${sum.toLocaleString('en-GB')} )`
        // });
      }
    });
  }

  /** Get OA VS closed, restricted and embargoed Publications -----------------------------------------------------> **/
  getPublicationPercentage() {
    this.queryData.getOSOStats(OAPublicationVSClosed(this.year)).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.OAPublications[0] = (Math.round((+value.data[2]/+value.data[3] + Number.EPSILON) * 100));
        this.OAPublications[1] = (Math.round((+value.data[0]/+value.data[1] + Number.EPSILON) * 100));
      }
    });
  }

  /** Get national monitoring on Publications ---------------------------------------------------------------------> **/
  getNationalMonitoring(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question54').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.countriesWithMonitoring[index] = this.calculatePercentage(value, value.datasets[0].series.result.length);
      }
    });
  }

  /** Get financial strategy on Publications -------------------------------------------------------------------------> **/
  getCountriesWithFinancialStrategy(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question7').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.countriesWithStrategy[index] = this.calculatePercentage(value, value.datasets[0].series.result.length);
      }
    });
  }


  /** Get investments on Publications -----------------------------------------------------------------------------> **/
  getTotalInvestments(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question56').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.totalInvestments[index] = this.calculateSum(value);
      }
    });
  }

  /** Get countries with policy on Publications percentage --------------------------------------------------------> **/
  getCountriesWithPolicy(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question6').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.countriesWithPolicy[index] = this.calculatePercentage(value, value.datasets[0].series.result.length);
      }
    });
  }

  /** Get countries with policy on immediate OA Publications percentage --------------------------------------------------------> **/
  getCountriesWithPolicyImmediate(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question6.3').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.countriesWithPolicyImmediate[index] = this.calculatePercentage(value, value.datasets[0].series.result.length);
      }
    });
  }

  /** Investments as tree graph -----------------------------------------------------------------------------------> **/
  getTreeGraphData(question: string) {
    this.queryData.getQuestion(this.years[this.years.length-1], question).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
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
