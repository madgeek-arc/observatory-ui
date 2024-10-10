import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { EoscReadinessDataService } from "../../../services/eosc-readiness-data.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { RawData } from "../../../../../survey-tool/app/domain/raw-data";
import * as Highcharts from "highcharts";
import {
  distributionByDocumentType, OpenDataVSClosed, trendOfOpenData
} from "../../OSO-stats-queries/explore-queries";
import { OptionsStackingValue } from "highcharts";
import { PdfExportService } from "../../../services/pdf-export.service";


@Component({
  selector: 'app-open-science-by-area-open-data',
  templateUrl: './open-science-by-area-open-data.component.html',
  styleUrls: ['../../../../../assets/css/explore-dashboard.scss']
})

export class OpenScienceByAreaOpenDataComponent implements OnInit {
  protected readonly Math = Math;

  private destroyRef = inject(DestroyRef);
  exportActive = false;

  years = ['2022', '2023'];

  stackedColumnCategories = [];
  stackedColumnSeries = [
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
  yAxisTitle = 'Number of Data Sets';
  legend = {
    align: 'right',
    x: -30,
    verticalAlign: 'top',
    y: -10,
    floating: true,
    backgroundColor: Highcharts.defaultOptions.legend.backgroundColor || 'white',
    borderColor: '#CCC',
    borderWidth: 1,
    shadow: false
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

  constructor(private queryData: EoscReadinessDataService, private pdfService: PdfExportService) {}

  ngOnInit() {
    this.years.forEach((year, index) => {
      this.getCountriesWithPolicy(year, index);
      this.getTotalInvestments(year, index);
      this.getCountriesWithFinancialStrategy(year, index);
      this.getNationalMonitoring(year, index);
    });

    this.getTrend();
    this.getDistributionByDocumentType();
    this.getOpenDataPercentage();

  }

  /** Get Trend of Open Data --------------------------------------------------------------------------------------> **/
  getTrend() {
    this.queryData.getOSOStatsChartData(trendOfOpenData()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        value.series.forEach((series, index) => {
          this.stackedColumnSeries[index].data.push(...series.data);
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
  isNumeric(value: string | null): boolean {
    // Check if the value is empty
    if (value === null)
      return false;

    if (value.trim() === '') {
      return false;
    }

    // Attempt to parse the value as a float
    const number = parseFloat(value);

    // Check if parsing resulted in NaN or the value has extraneous characters
    return !isNaN(number) && isFinite(number) && String(number) === value;
  }

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
      if (this.isNumeric(item.row[1]))
        sum += +item.row[1];
    });

    return Math.round(sum * 100) / 100;
  }

}
