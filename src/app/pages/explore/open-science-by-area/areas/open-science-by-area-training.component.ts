import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { EoscReadinessDataService } from "../../../services/eosc-readiness-data.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { RawData } from "../../../../domain/raw-data";
import { PdfExportService } from "../../../services/pdf-export.service";
import { CountryTableData } from "../../../../domain/country-table-data";
import { zip } from "rxjs/internal/observable/zip";
import { StakeholdersService } from "../../../../../survey-tool/app/services/stakeholders.service";
import { DataHandlerService } from "../../../services/data-handler.service";
import { LegendOptions, PointOptionsObject, SeriesBarOptions } from "highcharts";
import { ExploreService } from "../../explore.service";
import { monitoringMapCaptions, policesMapCaptions } from "../../../../domain/chart-captions";
import { SidebarMobileToggleComponent } from "../../../../../survey-tool/app/shared/dashboard-side-menu/mobile-toggle/sidebar-mobile-toggle.component";
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { ChartsModule } from "src/app/shared/charts/charts.module";
import * as Highcharts from "highcharts";

@Component({
  selector: 'app-open-science-by-area-training',
  templateUrl: './open-science-by-area-training.component.html',
  standalone: true,
  imports: [SidebarMobileToggleComponent, CommonModule, ChartsModule, NgOptimizedImage],
})

export class OpenScienceByAreaTrainingComponent implements OnInit {
  protected readonly Math = Math;

  private destroyRef = inject(DestroyRef);
  exportActive = false;

  smallScreen = false;

  years = ['2022', '2023'];

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
    title: 'Financial Investments in Skills/Training in Open Science in 2022',
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

    this.getTreeGraphData('Question92');

    // Maps
    this.stakeholdersService.getEOSCSBCountries().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: countries => {
        this.countriesArray = countries;
        this.getNationalPolicies('Question42', 0);
        this.getMonitoring('Question90', 1, 2);
      },
      error: error => {console.error(error);}
    });

    this.smallScreen = this.exploreService.isMobileOrSmallScreen;
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

  /** Get national monitoring on skills/training for OS -----------------------------------------------------------> **/
  getNationalMonitoring(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question90').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.countriesWithMonitoring[index] = this.calculatePercentage(value, value.datasets[0].series.result.length);
      }
    });
  }

  /** Get financial strategy on skills/training for OS ------------------------------------------------------------> **/
  getCountriesWithFinancialStrategy(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question43').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.countriesWithStrategy[index] = this.calculatePercentage(value, value.datasets[0].series.result.length);
      }
    });
  }

  /** Get investments in skills/training for OS -------------------------------------------------------------------> **/
  getTotalInvestments(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question92').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.totalInvestments[index] = this.calculateSum(value);
      }
    });
  }

  /** Get countries with policy on skills/training for OS ---------------------------------------------------------> **/
  getCountriesWithPolicy(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question42').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.countriesWithPolicy[index] = this.calculatePercentage(value, value.datasets[0].series.result.length);
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

  showComment(index: number, country: {code: string}) {
    this.comment = this.toolTipData[index].get(country.code.toLowerCase())?.replace(/\\n/g,'<br>').replace(/\\t/g,'  ') ?? 'N/A';
    this.countryCode = country.code.toLowerCase();
    this.countryName = this.exploreService.findCountryName(country.code).name
  }

  protected readonly policesMapCaptions = policesMapCaptions;
  protected readonly monitoringMapCaptions = monitoringMapCaptions;
}
