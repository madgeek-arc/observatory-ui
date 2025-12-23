import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { zip } from "rxjs/internal/observable/zip";
import { RawData, Row, Data } from "../../../domain/raw-data";
import { EoscReadinessDataService } from "../../services/eosc-readiness-data.service";
import { PdfExportService } from "../../services/pdf-export.service";
import { ExploreService } from "../explore.service";
import { LegendOptions, PointOptionsObject, SeriesBarOptions, SeriesBubbleOptions } from "highcharts";
import { OAPubsPerCountry } from "../OSO-stats-queries/explore-queries";
import * as Highcharts from 'highcharts';
import { SidebarMobileToggleComponent } from "../../../../survey-tool/app/shared/dashboard-side-menu/mobile-toggle/sidebar-mobile-toggle.component";
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { ChartsModule } from "src/app/shared/charts/charts.module";
import { PageContentComponent } from "../../../../survey-tool/app/shared/page-content/page-content.component";

type MergedElement = { x: string; y: string; z: string; name: string; country: string };

@Component({
    selector: 'app-investments-in-eosc',
    templateUrl: './investments-in-eosc.component.html',
    imports: [SidebarMobileToggleComponent, CommonModule, ChartsModule, NgOptimizedImage, PageContentComponent]
})

export class InvestmentsInEoscComponent implements OnInit {

  private destroyRef = inject(DestroyRef);
  exportActive = false;

  smallScreen = false;
  lastUpdateDate?: string;

  years = ['2022', '2023', '2024'];
  year = this.years[this.years.length-1];

  treeGraph: PointOptionsObject[] = [];
  bar: SeriesBarOptions[] = [];
  legendOptions: LegendOptions = {
    align: 'center',
    verticalAlign: 'top',
    backgroundColor: Highcharts.defaultOptions.legend.backgroundColor || 'white',
    borderColor: '#CCC',
    borderWidth: 1,
  };

  variablePie = [];

  pieTooltip = {
    headerFormat: '',
    pointFormat: '<span style="color:{point.color}">\u25CF</span> <b> ' +
      '{point.name}</b><br/>' +
      'Investment in millions of Euro: <b>{point.y}</b><br/>'
  }

  bubbleWithPlotLines = [] as SeriesBubbleOptions[];
  bubbleChartTooltip: Highcharts.TooltipOptions = {
    useHTML: true,
    followPointer: true,
    formatter: function () {
      const investmentOS = Highcharts.numberFormat(this.point.x, -1, ',', '.');
      const investmentOA = Highcharts.numberFormat(this.point.y, -1, ',', '.');
      const publications = Highcharts.numberFormat(this.point['z'], -1, ',', '.');

      return `
      <table>
        <tr><th colspan="2"><h4>${this.point['country']}</h4></th></tr>
        <tr><th>Investment in EOSC and OS:</th><td>${investmentOS}M</td></tr>
        <tr><th>Investment in OA:</th><td>${investmentOA}M</td></tr>
        <tr><th>Number of Publications:</th><td>${publications}</td></tr>
      </table>
    `;
    }
  };
  // bubbleChartTooltip = {
  //   useHTML: true,
  //   headerFormat: '<table>',
  //   pointFormat: '<tr><th colspan="2"><h4>{point.country}</h4></th></tr>' +
  //     '<tr><th>Investment in EOSC and OS:</th><td>{point.x}M</td></tr>' +
  //     '<tr><th>Investment in OA:</th><td>{point.y}M</td></tr>' +
  //     '<tr><th>Number of Publications:</th><td>{point.z}</td></tr>',
  //   footerFormat: '</table>',
  //   followPointer: true
  // }

  totalInvestments: number[] = [];

  barChartTitles = {
    title: 'Overview of investments in EOSC and Open Science in European Countries',
    xAxis: '',
    yAxis: '',
  }

  constructor(private queryData: EoscReadinessDataService, private pdfService: PdfExportService,
              private exploreService: ExploreService) {}

  ngOnInit() {
    this.getPieChartData();
    this.getTreeGraphData();
    this.getBubbleChartData();
    this.years.forEach((year, index) => {
      this.getTotalInvestments(year, index);
    });

    this.smallScreen = this.exploreService.isMobileOrSmallScreen;

    this.exploreService._lastUpdateDate.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => this.lastUpdateDate = value
    });
  }

  /** Get total investments ---------------------------------------------------------------------------------------> **/
  getTotalInvestments(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question5').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.totalInvestments[index] = this.calculateSum(value);
      }
    });
  }

  /** Tree graph --------------------------------------------------------------------------------------------------> **/
  getTreeGraphData() {
    this.queryData.getQuestion(this.year, 'Question5').pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      res => {
        this.bar = this.exploreService.createInvestmentsBar(res);
        this.treeGraph = this.exploreService.createRanges(res);
      }
    );
  }

  /** Bubble chart ------------------------------------------------------------------------------------------------> **/
  getBubbleChartData() {
    zip(
      this.queryData.getQuestion(this.year, 'Question5'),  // Investments in EOSC and Open Science
      this.queryData.getQuestion(this.year, 'Question56'), // Investments in Open Access publications
      this.queryData.getOSOStats(OAPubsPerCountry(this.years[this.years.length-2])), // OA Publications from stat tool from the previous year to match the investments.
    ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        // console.log(value);
        this.bubbleWithPlotLines = this.createBubbleSeries([value[0], value[1]], value[2]);
      },
      error: err => {console.error(err)}
    });
  }

  createBubbleSeries(rawData: RawData[], data: Data) {
    const series = [{
      type: 'bubble',
      data: [],
      colorByPoint: true
    }] as unknown as SeriesBubbleOptions[];

    const result = this.mergeArrays(rawData[0].datasets[0].series.result, rawData[1].datasets[0].series.result, data);

    // console.log(result);
    result.forEach(el => {
      if (!this.exploreService.isNumeric(el.x) || !this.exploreService.isNumeric(el.y) || !this.exploreService.isNumeric(el.z))
        return;

      let item = {
        x: +el.x,
        y: +el.y,
        z: +el.z,
        name: el.name,
        country: this.exploreService.findCountryName(el.name).name
      };
      series[0].data.push(item);
    });

    // console.log(series);
    return series;
  }

  /** pie chart ---------------------------------------------------------------------------------------------------> **/
  getPieChartData() {
    zip(
      this.queryData.getQuestion(this.year, 'Question100'), // Investments in citizen science
      this.queryData.getQuestion(this.year, 'Question72'),  // Investments in open source software
      this.queryData.getQuestion(this.year, 'Question68'),  // Investments in Open Data
      this.queryData.getQuestion(this.year, 'Question64'),  // Investments in FAIR data
      // this.queryData.getQuestion(this.year, 'Question60'), // Investments in Data Management
      this.queryData.getQuestion(this.year, 'Question76'),  // Investments in offering services through EOSC
      this.queryData.getQuestion(this.year, 'Question80'),  // Investments in connecting repositories to EOSC
      // this.queryData.getQuestion(this.year, 'Question84'), // Investments in data stewardship
      // this.queryData.getQuestion(this.year, 'Question88'), // Investments in long-term Data Preservation
      this.queryData.getQuestion(this.year, 'Question56'),  // Investments in open access publications
      // this.queryData.getQuestion(this.year, 'Question92'), // Investments in skills/training
      // this.queryData.getQuestion(this.year, 'Question96'), // Investments in incentives/rewards
      this.queryData.getQuestion(this.year, 'Question5'),   // Total Investments per country
    ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        // console.log(value);
        this.variablePie = this.createPieSeries(value);
        // this.countryArray = this.mergeByCountryCode(value);
      },
      error: err => {console.error(err)}
    });
  }

  createPieSeries(data: RawData[]) {
    const names = ['Citizen Science', 'Software', 'Open Data', 'FAIR Data', 'Services in EOSC', 'Repositories', 'Open Access', 'Other'];
    const series = [{
      minPointSize: 10,
      innerSize: '20%',
      zMin: 0,
      name: 'countries',
      borderRadius: 5,
      data: [],
    }];

    let sum = 0.0;
    for (let i = 0; i < data.length-1; i++) {
      let item = {name: names[i], y: this.calculateSum(data[i]), z: 80};
      sum += item.y;
      series[0].data.push(item);
    }

    let other = +(this.calculateSum(data[data.length-1]) - sum).toFixed(2);
    series[0].data.push({name: names[names.length-1], y: other, z: 80});
    return series;
  }

  /** Export to PDF -----------------------------------------------------------------------------------------------> **/
  exportToPDF(contents: HTMLElement[], filename?: string) {
    console.log('Contents to export:', contents);
    this.exportActive = true
    this.pdfService.export(contents, filename).then(() => {
      this.exportActive = false;
    }).catch((error) => {
      this.exportActive = false;
      console.error('Error during PDF generation:', error);
    });
  }

  /** Other -------------------------------------------------------------------------------------------------------> **/
  mergeArrays = (arr1: Row[], arr2: Row[], arr3: Data): MergedElement[] => {
    const map = new Map<string, Partial<MergedElement>>();

    // Helper function to update the map with values
    const addToMap = (arr: Row[], key: keyof MergedElement) => {
      for (const element of arr) {
        const name = element.row[0];
        const value = element.row[1];

        if (!map.has(name)) {
          map.set(name, { name });
        }

        const entry = map.get(name)!;
        entry[key] = String(value);
      }
    };

    // Populate the map with values from each array
    addToMap(arr1, 'x');
    addToMap(arr2, 'y');
    // addToMap(arr3, 'z');
    arr3.data[0].forEach(row => {
      const value = row[0];
      const name = row[1];
      const entry = map.get(name)!;
      if (entry)
        entry['z'] = String(value);
    });

    // Convert the map to an array of MergedElement objects
    return Array.from(map.values()).map(entry => ({
      x: entry.x || null,
      y: entry.y || null,
      z: entry.z || null,
      name: entry.name || '',
      country: ''
    }));
  };

  calculateSum(rawData: RawData): number {
    let sum = 0.0;
    for (const series of rawData.datasets) {
      for (const rowResult of series.series.result) {
        if (this.exploreService.isNumeric(rowResult.row[1])) {
          sum += +rowResult.row[1];
        }
      }
    }
    return (Math.round((sum + Number.EPSILON) * 100) / 100);
  }

  calculatePercentageChange(previous: number, next: number) {
    let percentage = Math.abs((next - previous) / previous);
    return Math.round((percentage + Number.EPSILON) * 100);
  }

  // mergeByCountryCode(rawData: RawData[]): string[][] { // Function to merge arrays by country code
  //   let data: string[][][] = [];
  //   for (let i = 0; i < rawData.length; i++) {
  //     data[i] = [];
  //     rawData[i].datasets[0].series.result.forEach(el => {
  //       data[i].push(el.row);
  //     })
  //   }
  //
  //   const mergedData: Record<string, string[]> = {};
  //
  //   // Loop through each internal array
  //   data.forEach((array) => {
  //     array.forEach(([country, value]) => {
  //       if (!mergedData[country]) {
  //         mergedData[country] = []; // Initialize if not existing
  //       }
  //       mergedData[country].push(value); // Add value to the country
  //     });
  //   });
  //   // console.log(mergedData);
  //   for (let mergedDataKey in mergedData) {
  //     // console.log(mergedData[mergedDataKey]);
  //     let sum = 0.0;
  //     mergedData[mergedDataKey].forEach((value, index) => {
  //       if (index === mergedData[mergedDataKey].length-1) // Ignore total
  //         return;
  //
  //       if (this.exploreService.isNumeric(value))
  //         sum += +value;
  //     });
  //     mergedData[mergedDataKey].splice(mergedData[mergedDataKey].length-1, 0, sum.toFixed(2));
  //   }
  //
  //   // Convert the merged data into an array of arrays, each starting with the country code
  //   return Object.entries(mergedData).map(([country, values]) => [country, ...values]);
  // }

}
