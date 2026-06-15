import { Component, DestroyRef, inject, OnInit } from "@angular/core";
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
    selector: 'app-open-science-by-area-repositories',
    templateUrl: './open-science-by-area-repositories.component.html',
    styleUrls: ['../../../../../assets/css/explore-dashboard.less'],
  imports: [SidebarMobileToggleComponent, ChartsModule, NgOptimizedImage, PageContentComponent, NgClass, AreaMapsCardComponent]
})

export class OpenScienceByAreaRepositoriesComponent implements OnInit {
  protected readonly Math = Math;
  protected trendService = inject(ExploreService);

  private destroyRef = inject(DestroyRef);
  exportActive = false;
  smallScreen = false;

  years = ['2023', '2024'];
  year = this.years[this.years.length-1];

  repositories: number[] = [];
  countriesWithPolicy: number[] = [];
  countriesWithStrategy: number[] = [];
  countriesWithMonitoring: number[] = [];
  totalInvestments: number[] = [];

  treeGraph: PointOptionsObject[][] = [];
  bar: SeriesBarOptions[][] = [];
  legendOptions: LegendOptions = {
    align: 'center',
    verticalAlign: 'top',
  };

  // Connecting Repositories to EOSC
  reposPolicyTabConfig: AreaMapTabConfig = {
    question: 'Question30',
    title: 'National policy on Connecting Repositories to EOSC',
    caption: policesMapCaptions[6] + '<strong>Data source:</strong> Survey on National Contributions to EOSC and Open Science ' + this.year + '.',
    labelSuffix: ' countries have a national policy <br>on connecting repositories to EOSC</span>'
  };

  reposMonitoringTabConfig: AreaMapTabConfig = {
    question: 'Question78',
    title: 'National monitoring on Connecting Repositories to EOSC',
    caption: monitoringMapCaptions[6] + '<strong>Data source:</strong> Survey on National Contributions to EOSC and Open Science ' + this.year + '.',
    labelSuffix: ' countries have a national monitoring <br>on connecting repositories to EOSC</span>'
  };

  reposFinancialStrategyTabConfig: AreaMapTabConfig = {
    question: 'Question31',
    title: 'National financial strategy on Connecting Repositories to EOSC',
    caption: '<p>This map illustrates the status of national financial strategies on Connecting Repositories to EOSC across European countries.</p><strong>Data source:</strong> Survey on National Contributions to EOSC and Open Science ' + this.year + '.',
    labelSuffix: ' countries have a national financial strategy <br>on connecting repositories to EOSC</span>'
  };

  // Long-term Data Preservation
  ltdpPolicyTabConfig: AreaMapTabConfig = {
    question: 'Question38',
    title: 'National policy on Long-term Data Preservation',
    caption: policesMapCaptions[8] + '<strong>Data source:</strong> Survey on National Contributions to EOSC and Open Science ' + this.year + '.',
    labelSuffix: ' countries have a national policy <br>on Long-term Data Preservation</span>'
  };

  ltdpMonitoringTabConfig: AreaMapTabConfig = {
    question: 'Question86',
    title: 'National monitoring on Long-term Data Preservation',
    caption: monitoringMapCaptions[8] + '<strong>Data source:</strong> Survey on National Contributions to EOSC and Open Science ' + this.year + '.',
    labelSuffix: ' countries have a national monitoring <br>on Long-term Data Preservation</span>'
  };

  ltdpFinancialStrategyTabConfig: AreaMapTabConfig = {
    question: 'Question39',
    title: 'National financial strategy on Long-term Data Preservation',
    caption: '<p>This map illustrates the status of national financial strategies on Long-term Data Preservation across European countries.</p><strong>Data source:</strong> Survey on National Contributions to EOSC and Open Science ' + this.year + '.',
    labelSuffix: ' countries have a national financial strategy <br>on Long-term Data Preservation</span>'
  };

  barChartTitles = {
    title: 'Financial Investments in Connecting Repositories to EOSC in '+(+this.year-1),
    xAxis: '',
    yAxis: '',
  }

  barChartTitles2 = {
    title: 'Financial Investments in Long-term Data Preservation in '+(+this.year-1),
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
      this.getMonitoringPercentage(year, index);
      this.getRepositories(year, index);
    });

    this.getTreeGraphData('Question80', 0);
    this.getTreeGraphData('Question88', 1);

  }

  /** Get national monitoring on connecting repositories ----------------------------------------------------------> **/
  getMonitoringPercentage(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question78').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.countriesWithMonitoring[index] = this.calculatePercentage(value, value.datasets[0].series.result.length);
      }
    });
  }

  /** Get financial strategy on connecting repositories -----------------------------------------------------------> **/
  getCountriesWithFinancialStrategy(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question31').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.countriesWithStrategy[index] = this.calculatePercentage(value, value.datasets[0].series.result.length);
      }
    });
  }

  /** Get investments in connecting repositories ------------------------------------------------------------------> **/
  getTotalInvestments(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question80').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.totalInvestments[index] = this.calculateSum(value);
      }
    });
  }

  /** Get countries with policy on connecting repositories --------------------------------------------------------> **/
  getCountriesWithPolicy(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question30').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.countriesWithPolicy[index] = this.calculatePercentage(value, value.datasets[0].series.result.length);
      }
    });
  }

  /** Get how many repositories offered long-term data preservation -----------------------------------------------> **/
  getRepositories(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question89').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.repositories[index] = this.calculateSum(value);
      }
    });
  }

  /** Investments as tree graph -----------------------------------------------------------------------------------> **/
  getTreeGraphData(question: string, index: number) {
    this.queryData.getQuestion(this.year, question).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      res => {
        this.bar[index] = this.exploreService.createInvestmentsBar(res);
        this.treeGraph[index] = this.exploreService.createRanges(res);
      }
    );
  }

  /** Export to PDF -----------------------------------------------------------------------------------------------> **/
  exportToPDF(contents: HTMLElement[], filename?: string) {
    this.exportActive = true;
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
