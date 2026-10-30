import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit, signal, ChangeDetectionStrategy } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { ReportCreationService } from "../services/report-creation.service";
import { EoscReadinessDataService } from "../services/eosc-readiness-data.service";
import { StakeholdersService } from "../../../survey-tool/app/services/stakeholders.service";
import { CustomSeriesMapOptions, WorldMapComponent } from "../../shared/charts/report-charts/world-map.component";
import { forkJoin, Observable, of, Subject } from "rxjs";
import { catchError, finalize, map, takeUntil } from "rxjs/operators";
import { RawData, Row } from "../../domain/raw-data";
import { SeriesMappointOptions, SeriesPieOptions } from 'highcharts';
import { latlong } from "../../domain/countries-lat-lon";
import { JsonPipe } from "@angular/common";
import { Chart, chartsCfg } from "./report-chart.configuration";
import { BarColumnsComponent } from "../../shared/charts/report-charts/bar-columns.component";
import { isNumeric } from "../../shared/utils/is-numeric";
import { roundedPercentage } from "../../shared/utils/rounded-percentage";
import { ReportPieChartComponent } from "../../shared/charts/report-charts/report-pie-chart.component";
import * as Highcharts from 'highcharts';


const FIRST_SURVEY_YEAR = 2022;

interface ChartImageData {
  buffer: ArrayBuffer;
  width: number;
  height: number;
  title?: string;
}

@Component({
  selector: 'app-report-creation',
  standalone: true,
  imports: [
    JsonPipe,
    BarColumnsComponent,
    ReactiveFormsModule,
    WorldMapComponent,
    ReportPieChartComponent
  ],
  providers: [StakeholdersService],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './report-creation.component.html'
})

export class ReportCreationComponent implements OnInit {
  private queryData = inject(EoscReadinessDataService);
  private reportService =  inject(ReportCreationService);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  // Emits when a new report year is loaded, to cancel the previous year's in-flight requests
  private reload$ = new Subject<void>();
  private pendingLoads = 0;

  charts: Highcharts.Chart[] = [];
  pieCharts: Highcharts.Chart[][] = [];

  chartsReadyCount = 0;
  pieChartsReadyCount = 0;
  totalPieChartsCount = 0;

  // Every survey year from the first full survey up to last year; a survey runs the year after its reference year,
  // so the current year's survey doesn't exist yet. Years the stats API has no data for are filtered out on init.
  readonly allYears = Array.from(
    {length: new Date().getFullYear() - FIRST_SURVEY_YEAR},
    (_, i) => String(FIRST_SURVEY_YEAR + i)
  );
  // The trend charts compare against the previous survey, so the first year can't be the report year, also document is
  // structured to report for at least three years so skip the first two years
  readonly selectableYears = this.allYears.slice(2);
  // The subset of selectableYears the stats API has data for, found on init
  availableYears = signal<string[]>([]);
  yearControl = new FormControl<string>(this.selectableYears[this.selectableYears.length - 1], {nonNullable: true});

  // Survey years up to and including the selected report year
  years: string[] = [];
  categories: string[] = [];

  loading = signal(false);

  reportData: Record<string, string> = {};
  chartImages: { [key: string]: ChartImageData } = {};
  staticImages: { [key: string]: { path: string, width: number, height: number } } = {};

  chartsCfg: Chart[] = chartsCfg;

  exporting = false;

  ngOnInit() {
    this.loading.set(true);
    this.yearControl.disable({emitEvent: false});

    this.findAvailableYears().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(available => {
      this.availableYears.set(available);
      this.yearControl.enable({emitEvent: false});
      if (available.length === 0) {
        this.loading.set(false);
        return;
      }

      // Start from the latest survey that has data
      this.yearControl.setValue(available[available.length - 1], {emitEvent: false});
      this.loadReport(this.yearControl.value);
      this.yearControl.valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(year => this.loadReport(year));
    });
  }

  // Question1 (researchers in FTEs) feeds most charts, so a year without it has no usable survey data
  private findAvailableYears(): Observable<string[]> {
    return forkJoin(this.selectableYears.map(year =>
      this.queryData.getQuestionEU(year, 'Question1').pipe(
        map(result => this.hasRows(result)),
        catchError(() => of(false))
      )
    )).pipe(map(found => this.selectableYears.filter((_, i) => found[i])));
  }

  // The stats API answers 200 with an empty body (null) for a query that has no data
  private hasData(result: RawData | null): boolean {
    return Array.isArray(result?.datasets?.[0]?.series?.result);
  }

  // A year the survey hasn't been loaded for can also come back as a valid response with no rows
  private hasRows(result: RawData | null): boolean {
    return this.hasData(result) && result!.datasets[0].series.result.length > 0;
  }

  loadReport(year: string) {
    // Cancel the previous year's requests first, so a late response can't overwrite the new state
    this.reload$.next();

    this.years = this.allYears.slice(0, this.allYears.indexOf(year) + 1);
    this.categories = this.years.map(y => `Survey ${y}`);

    // chartsCfg is shared module state, so reset what loadChart fills in
    this.chartsCfg.forEach(chart => {
      chart.data = [];
      chart.chartSeries = [];
      chart.pieSeries = [];
    });
    this.charts = [];
    this.pieCharts = [];
    this.chartsReadyCount = 0;
    this.pieChartsReadyCount = 0;
    this.totalPieChartsCount = this.countAllPieSeries();
    // generateReport() reuses these when non-empty, so they must not outlive the year they were rendered for
    this.chartImages = {};
    this.reportData = {
      Year: this.years[this.years.length-1],
      FiscalYear: this.years[this.years.length-2]
    };

    this.pendingLoads = this.chartsCfg.length;
    this.loading.set(true);
    this.chartsCfg.forEach(chart => this.loadChart(chart));
  }

  loadChart(chart: Chart) {
    // map each key to its observable
    let calls: Observable<RawData>[] = [];
    if (chart.type === 'stackedBars' || chart.type === 'barChart' || chart.type === 'totalInvestments') {
      this.years.forEach(year => {
        calls.push(...chart.namedQueries.map(q => this.queryData.getQuestionEU(year, q)));
      });
    } else {
      calls = chart.namedQueries.map(q =>
        this.queryData.getQuestionEU(this.years[this.years.length-1], q)
      );
    }


    // run them all in parallel
    forkJoin(calls).pipe(
      takeUntil(this.reload$),
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.onChartLoaded())
    ).subscribe({
      next: results => {
        if (!results.every(result => this.hasData(result))) {
          console.warn(`No survey data for ${chart.title} (${chart.namedQueries.join(', ')}), skipping`);
          return;
        }

        // the results is an array in the same order as namedQueries
        chart.data = results;
        // console.log(`Loaded ${chart.title}:`, results);
        if (chart.type === 'rangeColumns') {
          chart.chartSeries = this.rangeColumnsSeries(results, chart.stats[0]);
          return;
        }

        if (chart.type === 'totalInvestmentsRangeColumns') {
          chart.chartSeries = this.totalInvestmentsRangeColumnsSeries(results, chart.stats[0]);
          return;
        }

        if (chart.type === 'stackedBars') {
          chart.chartSeries = this.stackedBarSeries(results, chart.stats[0]);
          return;
        }

        if (chart.type === 'barChart') {
          chart.chartSeries = this.barSeries(results, chart.stats[0]);
          return;
        }

        if (chart.type === 'totalInvestments') {
          chart.chartSeries = this.totalInvestmentsPer1000ResearchersFTEs(results, chart.stats[0]);
          return;
        }

        let legendWording = 'national policy';
        if (chart.title.includes('Monitoring'))
          legendWording = 'national monitoring';
        else if (chart.title.includes('Financial Strategy'))
          legendWording = 'financial strategy';

        chart.chartSeries = this.mapSeries(results, legendWording); // Create map series

        results.forEach(result => {
          // console.log('Loaded Pie:', result);
          chart.pieSeries.push(this.pieSeries(result, chart.pieSeries.length, legendWording));
        });

        if (chart.stats) {
          chart.stats.forEach((query, index) => {
            this.reportData[query] = this.countAnswer(chart.data[index]);
          });
        }
      },
      error: err => console.error(`Error loading ${chart.title}`, err)
    });
  }

  // Counts finished (or cancelled) chart loads, to know when the whole report has loaded
  private onChartLoaded() {
    this.pendingLoads = Math.max(0, this.pendingLoads - 1);
    this.loading.set(this.pendingLoads > 0);
  }

  async generateReport() {
    if (this.exporting || this.loading())
      return;

    this.exporting = true;
    // The report year must not change while its charts are being exported
    this.yearControl.disable({emitEvent: false});
    // const before = this.pieCharts.map(r => r ? r.map(c => Object.keys(c||{}).length) : []);
    // console.log('before keysCount: ', before);
    try {
      console.log(`Processing ${(this.charts.length + this.countAllPieSeries())} charts...`);

      // Generate image buffers for all charts
      // const chartImages: { [key: string]: ChartImageData } = {};
      // const staticImages: { [key: string]: { path: string, width: number, height: number } } = {};

      if (Object.keys(this.chartImages).length === 0) {
        // Process Map charts
        for (let i = 0; i < this.charts.length; i++) {
          const chart = this.charts[i];
          console.log(`Converting chart ${i + 1} to image buffer...`);

          const imageBuffer = await this.chartToArrayBuffer(chart, 495, 330);
          this.chartImages[`chartImage${i + 1}`] = {
            buffer: imageBuffer,
            width: 495,
            height: 330,
            title: `Chart ${i + 1}`
          };
        }

        // Process Pie Charts
        const pieChartsSnapshot = this.pieCharts.map(row => row ? row.slice() : []);
        for (let i = 0; i < pieChartsSnapshot.length; i++) {
          const row = pieChartsSnapshot[i];
          if (!row)
            continue;

          for (let j = 0; j < row.length; j++) {
            const pieChart = row[j];
            if (!pieChart) continue; // Skip if no pie chart at this index

            console.log(`Exporting pie chart [${i}, ${j}]...`);
            const buffer = await this.chartToArrayBuffer(pieChart, 312, 226);
            this.chartImages[`pieChartImage_${i}_${j}`] = {
              buffer: buffer,
              width: 312,
              height: 226,
              title: `Pie Chart [${i + 1}, ${j + 1}]`
            };
          }
        }

      }
      if (Object.keys(this.staticImages).length === 0) {
        // Add static images if needed
        this.staticImages['logoImage'] = {path: 'assets/images/2-2.png', width: 200, height: 300};
      }

      // Export document with both chart images and static images
      await this.reportService.exportDocWithMultipleImages(this.reportData, this.chartImages, this.staticImages);

      console.log('Report generated successfully!');

      // const after = this.pieCharts.map(r => r ? r.map(c => Object.keys(c||{}).length) : []);
      // console.log('after keysCount: ', after);

    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      this.exporting = false;
      this.yearControl.enable({emitEvent: false});
    }

  }

  // Convert Highcharts instance to ArrayBuffer
  private async chartToArrayBuffer(chart: Highcharts.Chart, width: number, height: number): Promise<ArrayBuffer> {
    try {
      // Get SVG from Highcharts
      const svgString = chart.getSVG({
        // chart: {
        //   backgroundColor: '#ffffff'
        // }
      });

      // Convert SVG to ArrayBuffer using the service helper
      return await this.reportService.svgToArrayBuffer(svgString, width, height);
    } catch (error) {
      console.error('Error converting chart to ArrayBuffer:', error);
      throw error;
    }
  }

  totalInvestmentsPer1000ResearchersFTEs(data: RawData[], queryName: string) {
    const seriesOptions: Highcharts.SeriesBarOptions[] = [
      {
        type: 'bar',
        color: '#008792',
        dataLabels: {
          enabled: true,
          inside: true,
          style: {
            color: '#FFFFFF',
            textOutline: 'black'
          }
        },
        data: []
      }
    ];

    const trends: {year: string, investment: number}[] = [];

    this.years.forEach((year, index) => {
      let investments = 0;
      let researchersInFTE = 0;
      data[index * 2].datasets[0].series.result.forEach(result => {
        if (isNumeric(result.row[1]) && parseFloat(result.row[1]) !== 0) {
          // console.log(parseFloat(result.row[1]));
          let tmp: number | null = this.getResearchersInFTEs(data[index * 2 + 1], result.row[0])
          // console.log(tmp);
          if (tmp !== null) { // Add to the sum only if both values exist and are valid
            investments += parseFloat(result.row[1]);
            researchersInFTE += tmp;
          }
        }
      });

      if (investments === 0 && researchersInFTE === 0) {
        seriesOptions[0].data.push(0);
        trends.push({year: year, investment: 0});
      } else {
        seriesOptions[0].data.push(Math.round((investments * 1000) / (researchersInFTE / 1000)));
        trends.push({year: year, investment: Math.round((investments * 1000) / (researchersInFTE / 1000))});
      }

    });

    trends.sort((a: { year: string; }, b: { year: string; }) => a.year.localeCompare(b.year));

    const surveyStartYear = trends[0];
    const previousYear = trends[trends.length-2];
    const currentYear = trends[trends.length-1];

    this.reportData[queryName+'[0]'] = currentYear.investment > previousYear.investment ? 'an increase' : currentYear.investment < previousYear.investment ? 'a decrease' : 'no change';
    this.reportData[queryName+'[1]'] = currentYear.investment > surveyStartYear.investment ? 'an overall increase' : currentYear.investment < surveyStartYear.investment ? 'an overall decrease' : 'overall no change';

    return seriesOptions;
  }

  // Trends charts
  barSeries(data: RawData[], queryName: string) {
    const seriesOptions: Highcharts.SeriesBarOptions[] = [
      {
        type: 'bar',
        color: '#008792',
        dataLabels: {
          inside: true,
          style: {
            color: '#FFFFFF',
            textOutline: 'black'
          }
        },
        data: []
      }
    ];

    const trends: {year: string, hasPolicy: number}[] = [];

    this.years.forEach((year, index) => {
      let hasPolicy = 0;
      // let isMandatory = 0;
      data[index].datasets[0].series.result.forEach(element => {
        if (element.row[1] === 'Yes') {
          hasPolicy++;
        }
      });

      seriesOptions[0].data.push(hasPolicy);

      trends.push({year: year, hasPolicy: hasPolicy});
    });

    trends.sort((a: { year: string; }, b: { year: string; }) => a.year.localeCompare(b.year));

    const surveyStartYear = trends[0];
    const previousYear = trends[trends.length-2];
    const currentYear = trends[trends.length-1];

    this.reportData[queryName+'[0]'] = currentYear.hasPolicy > previousYear.hasPolicy ? 'an increase' : currentYear.hasPolicy < previousYear.hasPolicy ? 'a decrease' : 'no change';
    this.reportData[queryName+'[1]'] = currentYear.hasPolicy > surveyStartYear.hasPolicy ? 'an overall increase' : currentYear.hasPolicy < surveyStartYear.hasPolicy ? 'an overall decrease' : 'overall no change';

    return seriesOptions;
  }

  stackedBarSeries(data: RawData[], queryName: string): Highcharts.SeriesBarOptions[] {
    const seriesOptions: Highcharts.SeriesBarOptions[] = [
      {
        type: 'bar',
        name: 'Policy is mandatory',
        color: '#008792',
        dataLabels: {
          enabled: true,
          style: {
            color: '#FFFFFF',
            textOutline: 'black'
          }
        },
        data: []
      },
      {
        type: 'bar',
        name: 'Policy is not mandatory',
        color: '#EB5C80',
        dataLabels: {
          enabled: true,
          style: {
            color: '#FFFFFF',
            textOutline: 'black'
          }
        },
        data: []
      }
    ];

    const trends: {year: string, hasPolicy: number, isMandatory: number}[] = [];

    this.years.forEach((year, index) => {
      let hasPolicy = 0;
      let isMandatory = 0;
      data[index * 2].datasets[0].series.result.forEach(element => {
        if (element.row[1] === 'Yes') {
          hasPolicy++;
        }
      });
      data[index * 2 + 1].datasets[0].series.result.forEach(element => {
        if (element.row[1] === 'Yes') {
          isMandatory++;
        }
      });

      seriesOptions[0].data.push(isMandatory);
      seriesOptions[1].data.push(hasPolicy-isMandatory);

      trends.push({year: year, hasPolicy: hasPolicy, isMandatory: isMandatory});
    });

    trends.sort((a: { year: string; }, b: { year: string; }) => a.year.localeCompare(b.year));

    const surveyStartYear = trends[0];
    const previousYear = trends[trends.length-2];
    const currentYear = trends[trends.length-1];

    this.reportData[queryName+'[0]'] = currentYear.hasPolicy > previousYear.hasPolicy ? 'an increase' : currentYear.hasPolicy < previousYear.hasPolicy ? 'a decrease' : 'no change';
    this.reportData[queryName+'[1]'] = currentYear.hasPolicy > surveyStartYear.hasPolicy ? 'an overall increase' : currentYear.hasPolicy < surveyStartYear.hasPolicy ? 'an overall decrease' : 'overall no change';
    this.reportData[queryName+'[2]'] = currentYear.isMandatory > previousYear.isMandatory ? 'an increase' : currentYear.isMandatory < previousYear.isMandatory ? 'a decrease' : 'no change';
    this.reportData[queryName+'[3]'] = currentYear.isMandatory > surveyStartYear.isMandatory ? 'an overall increase' : currentYear.isMandatory < surveyStartYear.isMandatory ? 'an overall decrease' : 'overall no change';

    return seriesOptions;
  }

  rangeColumnsSeries(data: RawData[], query: string): Highcharts.SeriesColumnOptions[] {
    let seriesOptions: Highcharts.SeriesColumnOptions[] = [];
    let series: Highcharts.SeriesColumnOptions = {
      type: 'column',
      name: 'countries',
      data: [],
      showInLegend: false,
      color: '#008792',
    };

    let responses = data[0].datasets[0].series.result.length; // Double-check if this is valid
    let notInvesting = 0;
    const seriesData = [0, 0, 0, 0, 0, 0];

    const investments: {code: string, value: number | null}[] = [];
    let totalInvested = 0; // in millions of euros
    data[0].datasets[0].series.result.map((element) => {

      if (isNumeric(element.row[1]))
        totalInvested += parseFloat(element.row[1]);

      // * 1000 in order to ser value in €K
      return investments.push({
        code: element.row[0],
        value: isNumeric(element.row[1]) ? (parseFloat(element.row[1]) * 1000) : null
      });
    });
    this.reportData[query+'_invested'] = totalInvested.toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2});

    const tmpData = data[1].datasets[0].series.result;
    investments.forEach((element, index) => {
      const researchersInFTEs = this.getResearchersByCountry(element.code, tmpData);

      if (researchersInFTEs !== null && element.value !== null)
        investments[index].value = investments[index].value / (researchersInFTEs / 1000);
      else
        investments[index].value = null;

      if (investments[index].value === 0 || investments[index].value === null) {
        notInvesting++;
      } else if (investments[index].value <= 50) {
        seriesData[0]++;
      } else if (investments[index].value <= 100) {
        seriesData[1]++;
      } else if (investments[index].value <= 250) {
        seriesData[2]++;
      } else if (investments[index].value <= 500) {
        seriesData[3]++;
      } else if (investments[index].value <= 1000) {
        seriesData[4]++;
      } else {
        seriesData[5]++;
      }

    });


    let percentage = Math.round((notInvesting / responses + Number.EPSILON) * 100);
    this.reportData[query+'[0]'] = `${percentage}% (${notInvesting}/${responses})`;

    percentage = Math.round((seriesData[0] / responses + Number.EPSILON) * 100);
    this.reportData[query+'[1]'] = `${percentage}% (${seriesData[0]}/${responses})`;

    percentage = Math.round((seriesData[1] / responses + Number.EPSILON) * 100);
    this.reportData[query+'[2]'] = `${percentage}% (${seriesData[1]}/${responses})`;

    percentage = Math.round((seriesData[2] / responses + Number.EPSILON) * 100);
    this.reportData[query+'[3]'] = `${percentage}% (${seriesData[2]}/${responses})`;

    percentage = Math.round((seriesData[3] / responses + Number.EPSILON) * 100);
    this.reportData[query+'[4]'] = `${percentage}% (${seriesData[3]}/${responses})`;

    percentage = Math.round((seriesData[4] / responses + Number.EPSILON) * 100);
    this.reportData[query+'[5]'] = `${percentage}% (${seriesData[4]}/${responses})`;

    percentage = Math.round((seriesData[5] / responses + Number.EPSILON) * 100);
    this.reportData[query+'[6]'] = `${percentage}% (${seriesData[5]}/${responses})`;

    series.data = seriesData;
    seriesOptions.push(series)
    return seriesOptions;
  }

  getResearchersByCountry(countryCode: string, rows: Row[]): number | null {
    if (!countryCode || !Array.isArray(rows)) return null;
    const match = rows.find(r => r && Array.isArray(r.row) && r.row[0] === countryCode);
    if (!match)
      return null;

    const researchers: (number | null) = (isNumeric(match.row[1]) ? parseFloat(match.row[1]) : null);
    if (researchers === 0)
      return null;

    return researchers;
  }

  pieSeries(data: RawData, index: number, legendWording: string) {

    let yesCount = 0;
    let noCount = 0;

    data.datasets[0].series.result.forEach(entry => {
      // console.log('Row:', entry.row);
      if (entry.row[1] === 'Yes') yesCount++;
      else if (entry.row[1] === 'No') noCount++;
    });

    // Rounding each slice on its own can total 101 (52.5% + 47.5% -> 53% + 48%), so the labels are fixed here:
    // "Yes" is rounded like the report text, "No" takes the rest.
    const total = yesCount + noCount;
    const yesPercentage = roundedPercentage(yesCount, total);
    const noPercentage = total > 0 ? 100 - yesPercentage : 0;

    let series: SeriesPieOptions[] = [{
      // name: 'Policy',
      type: 'pie',
      data: [
        {
          name: index > 0 ? 'Policy is not mandatory' : `Does not have ${legendWording}`,
          y: noCount,
          color: '#EB5C80',
          legendIndex: 1,
          custom: {percentage: noPercentage}
        },
        {
          name: index > 0 ? 'Policy is mandatory' : `Has ${legendWording}`,
          y: yesCount,
          color: '#008792',
          legendIndex: 0,
          custom: {percentage: yesPercentage}
        }
      ]
    }];

    return series;
  }

  mapSeries(data: RawData[], legendWording: string) {

    let series = [];
    const mapLegendSeries = [
      {
        type: 'map',
        name: `Has ${legendWording}`,
        color: '#008792',
        showInLegend: true,
        data: [], // Keep empty for legend-only
        // visible: false, // Hide from the map but show in legend
        legendIndex: 0
      },
      {
        type: 'map',
        name: `Does not have ${legendWording}`,
        color: '#EB5C80',
        showInLegend: true,
        data: [], // Keep empty for legend-only
        // visible: false, // Hide from the map but show in legend
        legendIndex: 1
      },
      {
        type: 'map',
        name: 'Awaiting data',
        color: '#A9A9A9',
        showInLegend: true,
        data: [], // Keep empty for legend-only
        // visible: false, // Hide from the map but show in legend
        legendIndex: 4
      }
    ];

    if (data.length >= 1) {
      const tmpSeries: CustomSeriesMapOptions = {
        type: 'map',
        name: 'Countries',
        allAreas: true,
        data: [],
        showInLegend: false,
      }

      let flag1 = false;
      let flag2 = false;
      let flag3 = false;
      data[0].datasets[0].series.result.forEach(element => {
        if (element.row[1] === 'Yes') {
          tmpSeries.data.push({code: element.row[0], value: 0});
          flag1 = true;
        }
        else if (element.row[1] === 'No') {
          tmpSeries.data.push({code: element.row[0], value: 1});
          flag2 = true;
        }
        else {
          tmpSeries.data.push({code: element.row[0], value: 2});
          flag3 = true;
        }
      });

      // Filter out legend series that aren't needed
      const activeLegendSeries = [];
      if (flag1) activeLegendSeries.push(mapLegendSeries[0]);
      if (flag2) activeLegendSeries.push(mapLegendSeries[1]);
      if (flag3) activeLegendSeries.push(mapLegendSeries[2]);

      series.push(...activeLegendSeries);

      series.push(tmpSeries);
    }

    if (data.length === 2) {

      const tmpMandatorySeries: SeriesMappointOptions = {
        type: 'mappoint',
        name: 'Policy is mandatory',
        marker: {
          symbol: 'circle',
        },
        dataLabels: {
          enabled: false,
        },
        color: '#23CE6B',
        data: [],
        showInLegend: true,
        legendIndex: 2
      }

      const tmpNotMandatorySeries: SeriesMappointOptions = {
        type: 'mappoint',
        name: 'Policy is not mandatory',
        marker: {
          symbol: 'diamond',
        },
        dataLabels: {
          enabled: false,
        },
        color: '#FFCB47',
        data: [],
        showInLegend: true,
        legendIndex: 3
      }

      // console.log(data[1].datasets[0].series.result);
      data[1].datasets[0].series.result.forEach(element => {
        if (element.row[1] === 'Yes')
          tmpMandatorySeries.data.push({name: element.row[0], lat: latlong.get(element.row[0]).latitude, lon: latlong.get(element.row[0]).longitude});
        else if (element.row[1] === 'No')
          tmpNotMandatorySeries.data.push({name: element.row[0], lat: latlong.get(element.row[0]).latitude, lon: latlong.get(element.row[0]).longitude});
      });

      if (tmpMandatorySeries.data.length)
        series.push(tmpMandatorySeries);
      if (tmpNotMandatorySeries.data.length)
        series.push(tmpNotMandatorySeries);
    }

    // console.log(series);

    return series;
  }


  /** utils **/
  countAnswer(data: RawData) {
    let count = 0;
    let total = 0;
    data.datasets[0].series.result.forEach(element => {
      if (element.row[1] && element.row[1] !== null && element.row[1] !== 'null' && element.row[1].trim() !== '')
        total++;

      if (element.row[1] === 'Yes')
        count++;
    });

    return `${roundedPercentage(count, total)}% (${count}/${total})`
  }

  countAllPieSeries() {
    let count = 0;
    chartsCfg.forEach(chart => {
      if (chart.type === 'mapWithPoints')
        count+=chart.namedQueries.length;
    });

    return count;
  }

  // Store the ready charts
  onChartReady(chart: Highcharts.Chart, chartIndex: number) {
    console.log(`Chart ${chartIndex + 1} ready`);
    if (this.charts[chartIndex]) // Skip if the chart already exists
      return;

    this.charts[chartIndex] = chart;
    this.chartsReadyCount++;
    this.cdr.detectChanges();
  }

  onPieChartReady(chart: Highcharts.Chart, i: number, j: number) {
    console.log(`Pie Chart ready [${i}, ${j}]`);
    if (this.pieCharts[i] && this.pieCharts[i][j]) // Skip if the chart already exists
      return;

    if (!this.pieCharts[i])
      this.pieCharts[i] = [];

    this.pieCharts[i][j] = chart;
    this.pieChartsReadyCount++;
    this.cdr.detectChanges();
  }

  // Generate individual chart image (useful for testing)
  async downloadSingleChart(chartIndex: number) {
    if (this.charts[chartIndex]) {
      try {
        const imageBuffer = await this.chartToArrayBuffer(this.charts[chartIndex], 800, 600);

        // Create a download link for testing
        const blob = new Blob([imageBuffer], { type: 'image/png' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `chart_${chartIndex + 1}.png`;
        link.click();
        URL.revokeObjectURL(url);

        console.log(`Chart ${chartIndex + 1} downloaded successfully`);
      } catch (error) {
        console.error(`Error downloading chart ${chartIndex + 1}:`, error);
      }
    }
  }

  getResearchersInFTEs(data: RawData, code: string): number | null {
    let researchersInFTEs: number | null = null;
    data.datasets[0].series.result.forEach(element => {
      if (element.row[0] === code)
        if (isNumeric(element.row[1])) {
          researchersInFTEs = parseFloat(element.row[1]);
          return;
        } else {
          researchersInFTEs = null;
          return ;
        }
    });
    return researchersInFTEs;
  }

  totalInvestmentsRangeColumnsSeries(data: RawData[], query: string): Highcharts.SeriesColumnOptions[] {
    let seriesOptions: Highcharts.SeriesColumnOptions[] = [];
    let series: Highcharts.SeriesColumnOptions = {
      type: 'column',
      name: 'countries',
      data: [],
      showInLegend: false,
      color: '#008792',
    };

    let responses = data[0].datasets[0].series.result.length;
    let notInvesting = 0;
    const seriesData = [0, 0, 0, 0, 0, 0];

    const investments: {code: string, value: number | null}[] = [];
    data[0].datasets[0].series.result.map((element) => {

      // ser value in €M
      return investments.push({
        code: element.row[0],
        value: isNumeric(element.row[1]) ? (parseFloat(element.row[1])) : null
      });
    });


    investments.forEach((element, index) => {
      if (investments[index].value === 0 || investments[index].value === null) {
        notInvesting++;
      } else if (investments[index].value <= 1) {
        seriesData[0]++;
      } else if (investments[index].value <= 5) {
        seriesData[1]++;
      } else if (investments[index].value <= 10) {
        seriesData[2]++;
      } else if (investments[index].value <= 50) {
        seriesData[3]++;
      } else if (investments[index].value <= 100) {
        seriesData[4]++;
      } else {
        seriesData[5]++;
      }

    });


    let percentage = Math.round((notInvesting / responses + Number.EPSILON) * 100);
    this.reportData[query+'[0]'] = `${percentage}% (${notInvesting}/${responses})`;

    percentage = Math.round((seriesData[0] / responses + Number.EPSILON) * 100);
    this.reportData[query+'[1]'] = `${percentage}% (${seriesData[0]}/${responses})`;

    percentage = Math.round((seriesData[1] / responses + Number.EPSILON) * 100);
    this.reportData[query+'[2]'] = `${percentage}% (${seriesData[1]}/${responses})`;

    percentage = Math.round((seriesData[2] / responses + Number.EPSILON) * 100);
    this.reportData[query+'[3]'] = `${percentage}% (${seriesData[2]}/${responses})`;

    percentage = Math.round((seriesData[3] / responses + Number.EPSILON) * 100);
    this.reportData[query+'[4]'] = `${percentage}% (${seriesData[3]}/${responses})`;

    percentage = Math.round((seriesData[4] / responses + Number.EPSILON) * 100);
    this.reportData[query+'[5]'] = `${percentage}% (${seriesData[4]}/${responses})`;

    percentage = Math.round((seriesData[5] / responses + Number.EPSILON) * 100);
    this.reportData[query+'[6]'] = `${percentage}% (${seriesData[5]}/${responses})`;

    series.data = seriesData;
    seriesOptions.push(series)
    return seriesOptions;
  }
}
