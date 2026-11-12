import { Component, DestroyRef, inject, OnInit, ChangeDetectionStrategy, signal } from "@angular/core";
import { EoscReadinessDataService } from "../../../services/eosc-readiness-data.service";
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
import { RawData } from "src/app/domain/raw-data";
import * as Highcharts from "highcharts";
import {
  LegendOptions,
  OptionsStackingValue,
  PointOptionsObject,
  SeriesBarOptions,
  SeriesOptionsType
} from "highcharts";
import { distributionByDocumentType, OpenDataVSClosed, trendOfOpenData } from "../../OSO-stats-queries/explore-queries";
import { PdfExportService } from "../../../services/pdf-export.service";
import { ExploreService } from "../../explore.service";
import { setAt } from "src/app/shared/utils/set-at";
import { COMPARISON_SURVEY_YEARS, LATEST_SURVEY_YEAR } from "src/app/domain/survey-years";
import { AreaMapsCardComponent, AreaMapTabConfig } from "../../area-maps-card/area-maps-card.component";
import { monitoringMapCaptions, policesMapCaptions } from "src/app/domain/chart-captions";
import { SidebarMobileToggleComponent } from "src/survey-tool/app/shared/dashboard-side-menu/mobile-toggle/sidebar-mobile-toggle.component";
import {NgClass, NgOptimizedImage} from "@angular/common";
import { TreeGraphComponent } from "src/app/shared/charts/tree-graph/tree-graph.component";
import { BarOrColumnChartComponent } from "src/app/shared/charts/bar-chart/bar-or-column-chart.component";
import { StackedColumnComponent } from "src/app/shared/charts/stacked-column-chart/stacked-column.component";
import { PageContentComponent } from "src/survey-tool/app/shared/page-content/page-content.component";


@Component({
    selector: 'app-open-science-by-area-open-data',
    templateUrl: './open-science-by-area-open-data.component.html',
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

export class OpenScienceByAreaOpenDataComponent implements OnInit {
  protected readonly Math = Math;
  protected trendService = inject(ExploreService);

  private destroyRef = inject(DestroyRef);
  private queryData = inject(EoscReadinessDataService);
  private pdfService = inject(PdfExportService);
  private exploreService = inject(ExploreService);
  exportActive = signal(false);
  smallScreen = false;
  lastUpdateDate = toSignal(this.exploreService._lastUpdateDate);

  years = [...COMPARISON_SURVEY_YEARS];
  year = LATEST_SURVEY_YEAR;

  stackedColumnCategories = signal<string[]>([]);
  stackedColumnSeries = signal<Highcharts.SeriesColumnOptions[]>([]);
  yAxisTitle = 'Number of Data Sets';
  legend: LegendOptions = {
    // align: 'right',
    // x: -30,
    // verticalAlign: 'top',
    // y: 30,
    // floating: true,
    backgroundColor: Highcharts.defaultOptions.legend.backgroundColor || 'white',
    borderColor: '#CCC',
    borderWidth: 1,
    // shadow: false,
    reversed: false,
  };
  tooltipPointFormat = '{series.name}: {point.y}<br/>Total: {point.total}';

  stackedColumn2Categories = signal<string[]>([]);
  stackedColumn2Series = signal([
    {
      type: 'column',
      name: 'Open',
      data: [],
      color: '#028691'
    }, {
      type: 'column',
      name: 'Closed',
      data: [],
      color: '#fae0d1'
    }, {
      type: 'column',
      name: 'Restricted',
      data: [],
      color: '#e4587c'
    }, {
      type: 'column',
      name: 'Embargo',
      data: [],
      color: '#515252'
    }
  ] as Highcharts.SeriesColumnOptions[]);
  yAxisTitle2 = 'Percentage of Open Data';
  stacking: OptionsStackingValue = 'percent';
  dataLabels_format = '{point.percentage:.0f}%';

  openData = signal<number[]>([]);
  countriesWithPolicy = signal<number[]>([]);
  countriesWithStrategy = signal<number[]>([]);
  countriesWithMonitoring = signal<number[]>([]);
  totalInvestments = signal<number[]>([]);

  treeGraph = signal<PointOptionsObject[]>([]);
  bar = signal<SeriesBarOptions[]>([]);
  legendOptions: LegendOptions = {
    align: 'center',
    verticalAlign: 'top',
  };

  policyTabConfig: AreaMapTabConfig = {
    question: 'Question18',
    title: 'National policy on Open Data',
    caption: policesMapCaptions[3] + '<strong>Data source:</strong> Survey on National Contributions to EOSC and Open Science ' + this.year + '.',
    labelSuffix: ' countries have a <br>national policy on Open Data</span>'
  };

  monitoringTabConfig: AreaMapTabConfig = {
    question: 'Question66',
    title: 'National monitoring on Open Data',
    caption: monitoringMapCaptions[3] + '<strong>Data source:</strong> Survey on National Contributions to EOSC and Open Science ' + this.year + '.',
    labelSuffix: ' countries have a <br>national monitoring on Open Data</span>'
  };

  financialStrategyTabConfig: AreaMapTabConfig = {
    question: 'Question19',
    title: 'National financial strategy on Open Data',
    caption: '<p>This map illustrates the status of national financial strategies on Open Data across European countries.</p><strong>Data source:</strong> Survey on National Contributions to EOSC and Open Science ' + this.year + '.',
    labelSuffix: ' countries have a <br>national financial strategy on Open Data</span>'
  };

  barChartTitles = {
    title: 'Financial Investments in Open Data in '+(+this.year-1),
    xAxis: '',
    yAxis: '',
  }

  ngOnInit() {
    this.years.forEach((year, index) => {
      this.getCountriesWithPolicy(year, index);
      this.getTotalInvestments(year, index);
      this.getCountriesWithFinancialStrategy(year, index);
      this.getNationalMonitoring(year, index);
    });

    this.getOpenDataPercentage();

    this.getTreeGraphData();
    this.getTrend();
    this.getDistributionByDocumentType();

    this.smallScreen = this.exploreService.isMobileOrSmallScreen;
  }

  /** Get Trend of Open Data --------------------------------------------------------------------------------------> **/
  getTrend() {
    this.queryData.getOSOStatsChartData(trendOfOpenData(this.year)).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        const stackedColumnSeries: Highcharts.SeriesColumnOptions[] = [];
        value.series.forEach((series, index) => {
          let tmpSeries: SeriesOptionsType = {
            type: 'column',
            name: value.dataSeriesNames[index],
            data: series.data
          }
          stackedColumnSeries.push(tmpSeries);
        });
        this.stackedColumnSeries.set(stackedColumnSeries);
        this.stackedColumnCategories.set(value.xAxis_categories);
      }
    });
  }

  /** Get Distribution of Open Data Types by Different Document Type ----------------------------------------------> **/
  getDistributionByDocumentType() {
    this.queryData.getOSOStatsChartData(distributionByDocumentType(this.year)).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        // Build the new series and categories in locals and set them once: the chart redraws when the reference changes
        const stackedColumn2Series = this.stackedColumn2Series().map((series, index) => ({
          ...series,
          data: [...series.data, ...(value.series[index]?.data ?? [])]
        }));

        const stackedColumn2Categories = [...value.xAxis_categories];
        stackedColumn2Series[0].data.forEach((item, index) => {
          let sum = 0;
          stackedColumn2Series.forEach(series => {
            sum += (+series.data[index]);
          });
          stackedColumn2Categories[index] = stackedColumn2Categories[index]+ ` (total = ${sum.toLocaleString('en-GB')} )`
        });
        this.stackedColumn2Series.set(stackedColumn2Series);
        this.stackedColumn2Categories.set(stackedColumn2Categories);
      }
    });
  }

  /** Get Open Data VS closed, restricted and embargoed sets ------------------------------------------------------> **/
  getOpenDataPercentage() {
    this.queryData.getOSOStats(OpenDataVSClosed(this.year)).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        setAt(this.openData, 0, (Math.round((+value.data[2]/+value.data[3] + Number.EPSILON) * 100)));
        setAt(this.openData, 1, (Math.round((+value.data[0]/+value.data[1] + Number.EPSILON) * 100)));
      }
    });
  }

  /** Get national monitoring on Open Data ----------------------------------------------------------------------  > **/
  getNationalMonitoring(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question66').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        setAt(this.countriesWithMonitoring, index, this.calculatePercentage(value, value.datasets[0].series.result.length));
      }
    });
  }

  /** Get financial strategy on Open Data -------------------------------------------------------------------------> **/
  getCountriesWithFinancialStrategy(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question19').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        setAt(this.countriesWithStrategy, index, this.calculatePercentage(value, value.datasets[0].series.result.length));
      }
    });
  }

  /** Get investments on Open Data --------------------------------------------------------------------------------> **/
  getTotalInvestments(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question68').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        setAt(this.totalInvestments, index, this.calculateSum(value));
      }
    });
  }

  /** Get countries with policy on Open Data percentage -----------------------------------------------------------> **/
  getCountriesWithPolicy(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question18').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        setAt(this.countriesWithPolicy, index, this.calculatePercentage(value, value.datasets[0].series.result.length));
      }
    });
  }

  /** Investments as tree graph ------------------------------------------------------------------------------------>**/
  getTreeGraphData() {
    this.queryData.getQuestion(this.year, 'Question68').pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
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
