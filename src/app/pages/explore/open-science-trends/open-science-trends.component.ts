import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import * as Highcharts from "highcharts";
import { LegendOptions, SeriesOptionsType } from "highcharts";
import { EoscReadinessDataService } from "../../services/eosc-readiness-data.service";
import { trendOfOAPublications, trendOfOpenData } from "../OSO-stats-queries/explore-queries";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { zip } from "rxjs";
import { PdfExportService } from "../../services/pdf-export.service";
import { ExploreService } from "../explore.service";


@Component({
  selector: 'app-open-science-trends',
  templateUrl: './open-science-trends.component.html',
})

export class OpenScienceTrendsComponent implements OnInit {

  private destroyRef = inject(DestroyRef);
  exportActive = false;
  lastUpdateDate?: string;

  years = ['2022', '2023'];

  columnChartCategories = ['Open Access Publications', 'Fair Data', 'Data Management', 'Open Data', 'Open Software', 'Services', 'Connecting repositories to EOSC', 'Data Stewardship', 'Long-term Data Preservation', 'Skills / Training', 'Incentives / Rewards for OS', 'Citizen Science'];

  columnChartSeries: SeriesOptionsType[] = [];
  columnChartTitles = {
    title: 'Trends in National Open Science Policies by Areas',
    xAxis: 'Policy on',
    yAxis: 'Percentage of countries with national policies',
  }

  columnChart2Series: SeriesOptionsType[] = [];
  columnChart2Titles = {
    title: 'Trends in Financial Strategy on EOSC and Open Science by Areas',
    xAxis: 'Financial Strategy on',
    yAxis: 'Percentage of countries with Financial Strategy',
  }
  legendOptions: LegendOptions = {
    layout: 'vertical',
    align: 'right',
    verticalAlign: 'bottom',
    x: -40,
    y: -180,
    floating: true,
    borderWidth: 1,
    backgroundColor: Highcharts.defaultOptions.legend.backgroundColor || '#FFFFFF',
    shadow: true
  };


  stackedColumnCategories = [];
  stackedColumnSeries = [] as Highcharts.SeriesColumnOptions[];
  yAxisTitle = 'Number of Publications';
  legend: LegendOptions = {
    align: 'right',
    x: -30,
    verticalAlign: 'top',
    y: 30,
    floating: true,
    backgroundColor: Highcharts.defaultOptions.legend.backgroundColor || 'white',
    borderColor: '#CCC',
    borderWidth: 1,
    shadow: false,
    reversed: false
  };
  tooltipPointFormat = '{series.name}: {point.y}<br/>Total: {point.total}';

  stackedColumn2Categories: string[] = [];
  stackedColumn2Series: Highcharts.SeriesColumnOptions[] = [];
  yAxis2Title = 'Number of Data Sets';


  constructor(private queryData: EoscReadinessDataService, private pdfService: PdfExportService,
              private exploreService: ExploreService) {}

  ngOnInit() {
    this.years.forEach((year) => {
      this.getColumnChartData(year);
      this.getFinancialColumnChartData(year);
    });

    this.getTrendsPublications();
    this.getTrendsOpenData();

    this.exploreService._lastUpdateDate.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => this.lastUpdateDate = value
    });
  }

  /** Bar charts --------------------------------------------------------------------------------------------------> **/
  getColumnChartData(year: string) {
    zip(
      this.queryData.getQuestion(year, 'Question6'),   // national policy on Open Access publications
      this.queryData.getQuestion(year, 'Question14'),  // national policy on FAIR data
      this.queryData.getQuestion(year, 'Question10'),  // national policy on data management
      this.queryData.getQuestion(year, 'Question18'),  // national policy on Open data
      this.queryData.getQuestion(year, 'Question22'),  // national policy on software
      this.queryData.getQuestion(year, 'Question26'),  // national policy on offering services through EOSC
      this.queryData.getQuestion(year, 'Question30'),  // national policy on connecting repositories to EOSC
      this.queryData.getQuestion(year, 'Question34'),  // national policy on data stewardship
      this.queryData.getQuestion(year, 'Question38'),  // national policy on long-term data preservation
      this.queryData.getQuestion(year, 'Question42'),  // national policy on skills/training for Open Science
      this.queryData.getQuestion(year, 'Question46'),  // national policy on incentives/rewards for Open Science
      this.queryData.getQuestion(year, 'Question50'),  // national policy on citizen science
    ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        // console.log(value);
        this.columnChartSeries.push(this.exploreService.createColumnChartSeries(value, year));

        if (this.columnChartSeries.length === this.years.length) { // When series complete
          this.columnChartSeries = [...this.columnChartSeries]; // Trigger angular detection change
        }
      },
      error: err => {console.error(err)}
    });
  }

  getFinancialColumnChartData(year: string) {
    zip(
      this.queryData.getQuestion(year, 'Question7'),  // Publications
      this.queryData.getQuestion(year, 'Question15'), // FAIR-data
      this.queryData.getQuestion(year, 'Question11'), // Data-management
      this.queryData.getQuestion(year, 'Question19'), // Open-data
      this.queryData.getQuestion(year, 'Question23'), // Software
      this.queryData.getQuestion(year, 'Question27'), // Services
      this.queryData.getQuestion(year, 'Question31'), // Connecting repositories to EOSC
      this.queryData.getQuestion(year, 'Question35'), // Data stewardship
      this.queryData.getQuestion(year, 'Question39'), // Long-term data preservation
      this.queryData.getQuestion(year, 'Question43'), // Skills/Training
      this.queryData.getQuestion(year, 'Question47'), // Assessment
      this.queryData.getQuestion(year, 'Question51'), // Engagement
    ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        // console.log(value);
        this.columnChart2Series.push(this.exploreService.createColumnChartSeries(value, year));

        if (this.columnChart2Series.length === this.years.length) { // When series complete
          this.columnChart2Series = [...this.columnChart2Series]; // Trigger angular detection change
        }

      },
      error: err => {console.error(err)}
    });
  }

  // createColumnChartSeries(data: RawData[], year: string) {
  //   let series: Highcharts.SeriesColumnOptions = {
  //     type: 'column',
  //     name: 'Year '+ (+year-1),
  //     data: []
  //   }
  //
  //   data.forEach(el => {
  //     let count = 0;
  //     el.datasets[0].series.result.forEach(item => {
  //       if (item.row[1] === 'Yes')
  //         count++;
  //     });
  //     series.data.push(Math.round(((count/el.datasets[0].series.result.length + Number.EPSILON) * 100)));
  //   });
  //   return series;
  // }

  /** Get trends of Publications ----------------------------------------------------------------------------------> **/
  getTrendsPublications() {
    this.queryData.getOSOStatsChartData(trendOfOAPublications()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
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

  /** Get trends of Open Data -------------------------------------------------------------------------------------> **/
  getTrendsOpenData() {
    this.queryData.getOSOStatsChartData(trendOfOpenData()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        value.series.forEach((series, index) => {
          let tmpSeries: SeriesOptionsType = {
            type: 'column',
            name: value.dataSeriesNames[index],
            data: series.data
          }
          this.stackedColumn2Series.push(tmpSeries);
        });

        this.stackedColumn2Categories = value.xAxis_categories;
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

}
