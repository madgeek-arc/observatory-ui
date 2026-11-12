import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from "@angular/core";
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
import { NgClass, NgOptimizedImage } from "@angular/common";
import { EoscReadinessDataService } from "../../../services/eosc-readiness-data.service";
import { RawData } from "src/app/domain/raw-data";
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
import { setAt } from "src/app/shared/utils/set-at";
import { COMPARISON_SURVEY_YEARS, LATEST_SURVEY_YEAR } from "src/app/domain/survey-years";
import { AreaMapsCardComponent, AreaMapTabConfig } from "../../area-maps-card/area-maps-card.component";
import { monitoringMapCaptions, policesMapCaptions } from "src/app/domain/chart-captions";
import { TreeGraphComponent } from "src/app/shared/charts/tree-graph/tree-graph.component";
import { BarOrColumnChartComponent } from "src/app/shared/charts/bar-chart/bar-or-column-chart.component";
import { StackedColumnComponent } from "src/app/shared/charts/stacked-column-chart/stacked-column.component";
import {
  SidebarMobileToggleComponent
} from "src/survey-tool/app/shared/dashboard-side-menu/mobile-toggle/sidebar-mobile-toggle.component";
import { PageContentComponent } from "src/survey-tool/app/shared/page-content/page-content.component";


@Component({
    selector: 'app-open-science-by-area-publications',
    templateUrl: './open-science-by-area-publications.component.html',
    styleUrls: ['../../../../../assets/css/explore-dashboard.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
      SidebarMobileToggleComponent,
      TreeGraphComponent,
      BarOrColumnChartComponent,
      StackedColumnComponent,
      NgOptimizedImage,
      PageContentComponent,
      NgClass,
      AreaMapsCardComponent
  ]
})

export class OpenScienceByAreaPublicationsComponent implements OnInit {
  protected readonly Math = Math;
  protected trendService = inject(ExploreService);

  private destroyRef = inject(DestroyRef);
  private queryData = inject(EoscReadinessDataService);
  private pdfService = inject(PdfExportService);
  private exploreService = inject(ExploreService);
  exportActive = signal(false);
  lastUpdateDate = toSignal(this.exploreService._lastUpdateDate);
  smallScreen = false;

  years = [...COMPARISON_SURVEY_YEARS];
  year = LATEST_SURVEY_YEAR;

  stackedColumnCategories = signal<string[]>([]);
  stackedColumnSeries = signal<Highcharts.SeriesColumnOptions[]>([]);
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

  stackedColumn2Categories = signal<string[]>([]);
  stackedColumn2Series = signal<Highcharts.SeriesColumnOptions[]>([]);
  yAxisTitle2 = 'Percentage of Publications';
  stacking: OptionsStackingValue = 'percent';
  dataLabels_format = '{point.percentage:.0f}%';

  treemapData: Highcharts.PointOptionsObject[] = [];

  countriesWithPolicy = signal<number[]>([]);
  countriesWithPolicyImmediate = signal<number[]>([]);
  countriesWithStrategy = signal<number[]>([]);
  countriesWithMonitoring = signal<number[]>([]);
  totalInvestments = signal<number[]>([]);
  OAPublications = signal<number[]>([]);

  treeGraph = signal<PointOptionsObject[]>([]);
  bar = signal<SeriesBarOptions[]>([]);
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

  bar2 = signal<SeriesOptionsType[]>([
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
  ]);
  barCategories = signal<string[]>([]);

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
  }

  /** Get trends of Publications ----------------------------------------------------------------------------------> **/
  getTrends() {
    this.queryData.getOSOStatsChartData(trendOfOAPublications(this.year)).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        const stackedColumnSeries: Highcharts.SeriesColumnOptions[] = [];
        value.series.forEach((series, index) => {
          const tmpSeries: SeriesOptionsType = {
            type: 'column',
            name: value.dataSeriesNames[index],
            data: series.data,
          };
          stackedColumnSeries.push(tmpSeries);
        });
        this.stackedColumnSeries.set(stackedColumnSeries);
        this.stackedColumnCategories.set(value.xAxis_categories);
      }
    });
  }

  /** Get Distribution of Open Access Types by Fields of Science --------------------------------------------------> **/
  getDistributionsOA() {
    this.queryData.getOSOStatsChartData(distributionOfOA(this.year)).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        // Copy the series and set the array once: the chart redraws when the reference changes
        const bar2 = this.bar2().map(series => ({ ...series }) as SeriesBarOptions);
        value.series.forEach((series, index) => {
          bar2[index].data = series.data;
        });
        const closed = bar2[bar2.length - 1];
        closed.data = closed.data.map(point => -point);
        this.bar2.set(bar2);
        this.barCategories.set(value.xAxis_categories);

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
        const stackedColumn2Series: Highcharts.SeriesColumnOptions[] = [];
        value.series.forEach((series, index) => {
          const tmpSeries: SeriesOptionsType = {
            type: 'column',
            name: value.dataSeriesNames[index],
            data: series.data,
          }

          stackedColumn2Series.push(tmpSeries);
        });
        this.stackedColumn2Series.set(stackedColumn2Series);
        this.stackedColumn2Categories.set(value.xAxis_categories);
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
        setAt(this.OAPublications, 0, (Math.round((+value.data[2]/+value.data[3] + Number.EPSILON) * 100)));
        setAt(this.OAPublications, 1, (Math.round((+value.data[0]/+value.data[1] + Number.EPSILON) * 100)));
      }
    });
  }

  /** Get national monitoring on Publications ---------------------------------------------------------------------> **/
  getNationalMonitoring(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question54').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        setAt(this.countriesWithMonitoring, index, this.calculatePercentage(value, value.datasets[0].series.result.length));
      }
    });
  }

  /** Get financial strategy on Publications -------------------------------------------------------------------------> **/
  getCountriesWithFinancialStrategy(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question7').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        setAt(this.countriesWithStrategy, index, this.calculatePercentage(value, value.datasets[0].series.result.length));
      }
    });
  }


  /** Get investments on Publications -----------------------------------------------------------------------------> **/
  getTotalInvestments(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question56').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        setAt(this.totalInvestments, index, this.calculateSum(value));
      }
    });
  }

  /** Get countries with policy on Publications percentage --------------------------------------------------------> **/
  getCountriesWithPolicy(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question6').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        setAt(this.countriesWithPolicy, index, this.calculatePercentage(value, value.datasets[0].series.result.length));
      }
    });
  }

  /** Get countries with policy on immediate OA Publications percentage --------------------------------------------------------> **/
  getCountriesWithPolicyImmediate(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question6.3').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        setAt(this.countriesWithPolicyImmediate, index, this.calculatePercentage(value, value.datasets[0].series.result.length));
      }
    });
  }

  /** Investments as tree graph -----------------------------------------------------------------------------------> **/
  getTreeGraphData(question: string) {
    this.queryData.getQuestion(this.year, question).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      res => {
        this.bar.set(this.exploreService.createInvestmentsBar(res));
        this.treeGraph.set(this.exploreService.createRanges(res));
      }
    );
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
