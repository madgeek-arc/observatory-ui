import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { EoscReadinessDataService } from "../../../services/eosc-readiness-data.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { RawData } from "../../../../domain/raw-data";
import { PdfExportService } from "../../../services/pdf-export.service";
import * as Highcharts from "highcharts";
import { LegendOptions, PointOptionsObject, SeriesBarOptions } from "highcharts";
import { ExploreService } from "../../explore.service";
import { monitoringMapCaptions, policesMapCaptions } from "../../../../domain/chart-captions";
import { OpenSoftwareVSClosed } from "../../OSO-stats-queries/explore-queries";
import { AreaMapsCardComponent, AreaMapTabConfig } from "../../area-maps-card/area-maps-card.component";
import {
  SidebarMobileToggleComponent
} from "../../../../../survey-tool/app/shared/dashboard-side-menu/mobile-toggle/sidebar-mobile-toggle.component";
import { ChartsModule } from "src/app/shared/charts/charts.module";
import {NgClass, NgOptimizedImage} from "@angular/common";
import { PageContentComponent } from "../../../../../survey-tool/app/shared/page-content/page-content.component";

@Component({
    selector: 'app-open-science-by-area-software',
    templateUrl: './open-science-by-area-software.component.html',
  imports: [SidebarMobileToggleComponent, ChartsModule, NgOptimizedImage, PageContentComponent, NgClass, AreaMapsCardComponent]
})

export class OpenScienceByAreaSoftwareComponent implements OnInit {
  protected readonly Math = Math;
  protected trendService = inject(ExploreService);

  private destroyRef = inject(DestroyRef);
  exportActive = false;

  smallScreen = false;

  years = ['2023', '2024'];
  year = this.years[this.years.length-1];

  openSoftware: number[] = [];
  sets: number[] = [];
  countriesWithPolicy: number[] = [];
  countriesWithStrategy: number[] = [];
  countriesWithMonitoring: number[] = [];
  totalInvestments: number[] = [];

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
    question: 'Question22',
    title: 'National Policy on Open Source Software',
    caption: policesMapCaptions[4] + '<strong>Data source:</strong> Survey on National Contributions to EOSC and Open Science ' + this.year + '.',
    labelSuffix: ' countries have a <br>national policy on Open Source software</span>'
  };

  monitoringTabConfig: AreaMapTabConfig = {
    question: 'Question70',
    title: 'National Monitoring on Open Source Software',
    caption: monitoringMapCaptions[4] + '<strong>Data source:</strong> Survey on National Contributions to EOSC and Open Science ' + this.year + '.',
    labelSuffix: ' countries have a <br>national monitoring on Open Source software</span>'
  };

  financialStrategyTabConfig: AreaMapTabConfig = {
    question: 'Question23',
    title: 'National financial strategy on Open Source Software',
    caption: '<p>This map illustrates the status of national financial strategies on Open Source Software across European countries.</p><strong>Data source:</strong> Survey on National Contributions to EOSC and Open Science ' + this.year + '.',
    labelSuffix: ' countries have a <br>national financial strategy on Open Source software</span>'
  };

  barChartTitles = {
    title: 'Financial Investments in Open Source Software in '+(+this.year-1),
    xAxis: '',
    yAxis: '',
  }

  constructor(private queryData: EoscReadinessDataService, private pdfService: PdfExportService,
              private exploreService: ExploreService) {}

  ngOnInit() {
    this.years.forEach((year, index) => {
      this.getCountriesWithPolicy(year, index);
      this.getTotalInvestments(year, index);
      this.getCountriesWithFinancialStrategy(year, index);
      this.getNationalMonitoring(year, index);
      this.getSets(year, index);
    });

    this.getOpenSoftwarePercentage();

    this.getTreeGraphData('Question72');

    this.smallScreen = this.exploreService.isMobileOrSmallScreen;
  }

  /** Get national monitoring on open source software ------------------------------------------------------------> **/
  getNationalMonitoring(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question70').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.countriesWithMonitoring[index] = this.calculatePercentage(value, value.datasets[0].series.result.length);
      }
    });
  }

  /** Get financial strategy on open source software --------------------------------------------------------------> **/
  getCountriesWithFinancialStrategy(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question23').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.countriesWithStrategy[index] = this.calculatePercentage(value, value.datasets[0].series.result.length);
      }
    });
  }

  /** Get investments in open source software ---------------------------------------------------------------------> **/
  getTotalInvestments(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question72').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.totalInvestments[index] = this.calculateSum(value);
      }
    });
  }

  /** Get countries with policy on open source software -----------------------------------------------------------> **/
  getCountriesWithPolicy(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question22').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.countriesWithPolicy[index] = this.calculatePercentage(value, value.datasets[0].series.result.length);
      }
    });
  }

  /** Get Open Software VS closed, restricted and embargoed sets -------------------------------------------------> **/
  getOpenSoftwarePercentage() {
    this.queryData.getOSOStats(OpenSoftwareVSClosed(this.year)).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.openSoftware[0] = Math.round((+value.data[2] / +value.data[3] + Number.EPSILON) * 100);
        this.openSoftware[1] = Math.round((+value.data[0] / +value.data[1] + Number.EPSILON) * 100);
      }
    });
  }

  /** Get how many open source software sets were published -------------------------------------------------------> **/
  getSets(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question73').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.sets[index] = this.calculateSum(value);
      }
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

  /** Investments as tree graph -----------------------------------------------------------------------------------> **/
  getTreeGraphData(question: string) {
    this.queryData.getQuestion(this.year, question).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      res => {
        this.bar = this.exploreService.createInvestmentsBar(res);
        this.treeGraph = this.exploreService.createRanges(res);
      }
    );
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
