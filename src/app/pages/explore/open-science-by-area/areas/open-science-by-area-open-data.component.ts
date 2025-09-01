import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { EoscReadinessDataService } from "../../../services/eosc-readiness-data.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { RawData } from "../../../../domain/raw-data";
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
import { CountryTableData } from "../../../../domain/country-table-data";
import { zip } from "rxjs/internal/observable/zip";
import { StakeholdersService } from "../../../../../survey-tool/app/services/stakeholders.service";
import { DataHandlerService } from "../../../services/data-handler.service";
import { ExploreService } from "../../explore.service";
import { monitoringMapCaptions, policesMapCaptions } from "../../../../domain/chart-captions";
import { SidebarMobileToggleComponent } from "../../../../../survey-tool/app/shared/dashboard-side-menu/mobile-toggle/sidebar-mobile-toggle.component";
import {CommonModule, NgOptimizedImage} from "@angular/common";
import { ChartsModule } from "src/app/shared/charts/charts.module";
import { PageContentComponent } from "../../../../../survey-tool/app/shared/page-content/page-content.component";


@Component({
    selector: 'app-open-science-by-area-open-data',
    templateUrl: './open-science-by-area-open-data.component.html',
    styleUrls: ['../../../../../assets/css/explore-dashboard.less'],
    imports: [SidebarMobileToggleComponent, CommonModule, ChartsModule, NgOptimizedImage, PageContentComponent]
})

export class OpenScienceByAreaOpenDataComponent implements OnInit {
  protected readonly Math = Math;

  private destroyRef = inject(DestroyRef);
  exportActive = false;
  smallScreen = false;
  lastUpdateDate?: string;

  years = ['2022', '2023'];

  stackedColumnCategories = [];
  stackedColumnSeries: Highcharts.SeriesColumnOptions[] = [];
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

  stackedColumn2Categories = [];
  stackedColumn2Series = [
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
  ] as Highcharts.SeriesColumnOptions[];
  yAxisTitle2 = 'Percentage of Open Data';
  stacking: OptionsStackingValue = 'percent';
  dataLabels_format = '{point.percentage:.0f}%';

  openData: number[] = [];
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
    title: 'Financial Investments in Open Data in 2022',
    xAxis: '',
    yAxis: '',
  }

  constructor(private queryData: EoscReadinessDataService, private pdfService: PdfExportService,
              private stakeholdersService: StakeholdersService, private dataHandlerService: DataHandlerService,
              private exploreService: ExploreService) {}

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

    // Maps
    this.stakeholdersService.getEOSCSBCountries().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: countries => {
        this.countriesArray = countries;
        this.getNationalPolicies('Question18', 0);
        this.getMonitoring('Question66', 1, 2);
      },
      error: error => {console.error(error);}
    });

    this.exploreService._lastUpdateDate.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => this.lastUpdateDate = value
    });

  }

  /** Get Trend of Open Data --------------------------------------------------------------------------------------> **/
  getTrend() {
    this.queryData.getOSOStatsChartData(trendOfOpenData()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        value.series.forEach((series, index) => {
          let tmpSeries: SeriesOptionsType = {
            type: 'column',
            name: value.dataSeriesNames[index],
            data: series.data
          }
          this.stackedColumnSeries.push(tmpSeries);
        });
        this.stackedColumnCategories = value.xAxis_categories;
      }
    });
  }

  /** Get Distribution of Open Data Types by Different Document Type ----------------------------------------------> **/
  getDistributionByDocumentType() {
    this.queryData.getOSOStatsChartData(distributionByDocumentType()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        value.series.forEach((series, index) => {
          this.stackedColumn2Series[index].data.push(...series.data);
        });

        this.stackedColumn2Categories = value.xAxis_categories;
        this.stackedColumn2Series[0].data.forEach((item, index) => {
          let sum = 0;
          this.stackedColumn2Series.forEach(series => {
            sum += (+series.data[index]);
          });
          this.stackedColumn2Categories[index] = this.stackedColumn2Categories[index]+ ` (total = ${sum.toLocaleString('en-GB')} )`
        });
      }
    });
  }

  /** Get Open Data VS closed, restricted and embargoed sets ------------------------------------------------------> **/
  getOpenDataPercentage() {
    this.queryData.getOSOStats(OpenDataVSClosed()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.openData[0] = (Math.round((+value.data[2]/+value.data[3] + Number.EPSILON) * 100));
        this.openData[1] = (Math.round((+value.data[0]/+value.data[1] + Number.EPSILON) * 100));
      }
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

  /** Get national monitoring on Open Data ----------------------------------------------------------------------  > **/
  getNationalMonitoring(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question66').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.countriesWithMonitoring[index] = this.calculatePercentage(value, value.datasets[0].series.result.length);
      }
    });
  }

  /** Get financial strategy on Open Data -------------------------------------------------------------------------> **/
  getCountriesWithFinancialStrategy(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question19').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.countriesWithStrategy[index] = this.calculatePercentage(value, value.datasets[0].series.result.length);
      }
    });
  }

  /** Get investments on Open Data --------------------------------------------------------------------------------> **/
  getTotalInvestments(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question68').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.totalInvestments[index] = this.calculateSum(value);
      }
    });
  }

  /** Get countries with policy on Open Data percentage -----------------------------------------------------------> **/
  getCountriesWithPolicy(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question18').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.countriesWithPolicy[index] = this.calculatePercentage(value, value.datasets[0].series.result.length);
      }
    });
  }

  /** Investments as tree graph ------------------------------------------------------------------------------------>**/
  getTreeGraphData() {
    this.queryData.getQuestion(this.years[this.years.length-1], 'Question68').pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
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

  showComment(index: number, country: {code: string}) {
    this.comment = this.toolTipData[index].get(country.code.toLowerCase())?.replace(/\\n/g,'<br>').replace(/\\t/g,'  ') ?? 'N/A';
    this.countryCode = country.code.toLowerCase();
    this.countryName = this.exploreService.findCountryName(country.code).name
  }

  protected readonly policesMapCaptions = policesMapCaptions;
  protected readonly monitoringMapCaptions = monitoringMapCaptions;
}
