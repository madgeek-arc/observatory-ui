import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { EoscReadinessDataService } from "../../../services/eosc-readiness-data.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { RawData } from "../../../../domain/raw-data";
import { PdfExportService } from "../../../services/pdf-export.service";
import { ExploreService } from "../../explore.service";
import { AreaMapsCardComponent, AreaMapTabConfig } from "../../area-maps-card/area-maps-card.component";
import { LegendOptions, PointOptionsObject, SeriesBarOptions } from "highcharts";
import { monitoringMapCaptions, policesMapCaptions } from "../../../../domain/chart-captions";
import {NgClass, NgOptimizedImage} from "@angular/common";
import { SidebarMobileToggleComponent } from "../../../../../survey-tool/app/shared/dashboard-side-menu/mobile-toggle/sidebar-mobile-toggle.component";
import { ChartsModule } from "src/app/shared/charts/charts.module";
import * as Highcharts from "highcharts";
import { PageContentComponent } from "../../../../../survey-tool/app/shared/page-content/page-content.component";


@Component({
    selector: 'app-open-science-by-area-citizen-science',
    templateUrl: './open-science-by-area-citizen-science.component.html',
    styleUrls: ['../../../../../assets/css/explore-dashboard.less'],
  imports: [SidebarMobileToggleComponent, ChartsModule, NgOptimizedImage, PageContentComponent, NgClass, AreaMapsCardComponent]
})

export class OpenScienceByAreaCitizenScienceComponent implements OnInit {
  protected readonly Math = Math;
  protected trendService = inject(ExploreService);

  private destroyRef = inject(DestroyRef);
  exportActive = false;
  smallScreen = false;

  years = ['2023', '2024'];
  year = this.years[this.years.length-1];

  citizenProjects: number[] = [];
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
    question: 'Question50',
    title: 'National policy on Citizen Science',
    caption: policesMapCaptions[11] + '<strong>Data source:</strong> Survey on National Contributions to EOSC and Open Science ' + this.year + '.',
    labelSuffix: ' countries have a <br>national policy on Citizen Science</span>'
  };

  monitoringTabConfig: AreaMapTabConfig = {
    question: 'Question98',
    title: 'National monitoring on Citizen Science',
    caption: monitoringMapCaptions[11] + '<strong>Data source:</strong> Survey on National Contributions to EOSC and Open Science ' + this.year + '.',
    labelSuffix: ' countries have a <br>national monitoring on Citizen Science</span>'
  };

  financialStrategyTabConfig: AreaMapTabConfig = {
    question: 'Question51',
    title: 'National financial strategy on Citizen Science',
    caption: '<p>This map illustrates the status of national financial strategies on Citizen Science across European countries.</p><strong>Data source:</strong> Survey on National Contributions to EOSC and Open Science ' + this.year + '.',
    labelSuffix: ' countries have a <br>national financial strategy on Citizen Science</span>'
  };

  barChartTitles = {
    title: 'Financial Investments on Citizen Science in '+(+this.year-1),
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
      this.getCitizenScienceProjects(year, index);
    });

    this.getTreeGraphData();

    this.smallScreen = this.exploreService.isMobileOrSmallScreen;

  }

  /** Get national monitoring on Citizen science ------------------------------------------------------------------> **/
  getNationalMonitoring(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question98').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.countriesWithMonitoring[index] = this.calculatePercentage(value, value.datasets[0].series.result.length);
      }
    });
  }

  /** Get financial strategy on Citizen science -------------------------------------------------------------------> **/
  getCountriesWithFinancialStrategy(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question51').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.countriesWithStrategy[index] = this.calculatePercentage(value, value.datasets[0].series.result.length);
      }
    });
  }

  /** Get investments in Citizen science --------------------------------------------------------------------------> **/
  getTotalInvestments(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question100').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.totalInvestments[index] = this.calculateSum(value);
      }
    });
  }

  /** Get countries with policy on Citizen science percentage -----------------------------------------------------> **/
  getCountriesWithPolicy(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question50').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.countriesWithPolicy[index] = this.calculatePercentage(value, value.datasets[0].series.result.length);
      }
    });
  }

  /** Get projects with a citizen science dimension count -------------------------------------------------------- > **/
  getCitizenScienceProjects(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question101').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.citizenProjects[index] = this.calculateSum(value);
      }
    });
  }

  /** Investments as tree graph -----------------------------------------------------------------------------------> **/
  getTreeGraphData() {
    this.queryData.getQuestion(this.year, 'Question100').pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
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
