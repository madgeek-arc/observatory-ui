import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import * as Highcharts from "highcharts";
import { EoscReadinessDataService } from "../../services/eosc-readiness-data.service";
import { trendOfOAPublications, trendOfOpenData } from "../OSO-stats-queries/explore-queries";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { zip } from "rxjs";
import { SeriesBarOptions, SeriesOptionsType } from "highcharts";
import { RawData } from "../../../../survey-tool/app/domain/raw-data";


@Component({
  selector: 'app-open-science-trends',
  templateUrl: './open-science-trends.component.html',
})

export class OpenScienceTrendsComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  years = ['2022', '2023'];

  barChartCategories = ['Open Access Publications', 'Fair Data', 'Data Management', 'Open Data', 'Open Software', 'Services', 'Connecting repositories to EOSC', 'Data stewardship', 'Long-term data preservation', 'Skills/Training', 'Incentives/Rewards for OS', 'Citizen Science'];

  barChartSeries: SeriesOptionsType[] = [];
  barChartTitles = {
    // title: 'Percentage of countries with national policies different Open Science Categories',
    title: '',
    xAxis: 'Policy on',
    yAxis: 'Percentage of countries with national policies',
  }

  barChart2Series: SeriesOptionsType[] = [];
  barChart2Titles = {
    // title: 'Percentage of countries with national policies different Open Science Categories',
    title: '',
    xAxis: 'Financial Strategy on',
    yAxis: 'Percentage of countries with Financial Strategy',
  }


  stackedColumnCategories = ['2020', '2021', '2022', '2023', '2024'];
  stackedColumnSeries = [
    {
      type: 'column',
      name: 'Gold OA only',
      data: [],
      color: '#FFD700' // Gold color
    }, {
      type: 'column',
      name: 'Green OA only',
      data: [],
      color: '#228B22' // Forest green color
    }, {
      type: 'column',
      name: 'Both Gold & Green OA',
      data: [],
      color: '#FF69B4' // Hot pink color for mixed category
    }, {
      type: 'column',
      name: 'Neither',
      data: [],
      color: '#b0c4de'
    }, {
      type: 'column',
      name: 'Closed',
      data: [],
      color: '#808080' // Grey color
    }
  ] as Highcharts.SeriesColumnOptions[];
  yAxisTitle = 'Number of Publications';
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
  yAxis2Title = 'Number of Data Sets';
  // legend = {
  //   align: 'right',
  //   x: -30,
  //   verticalAlign: 'top',
  //   y: -10,
  //   floating: true,
  //   backgroundColor: Highcharts.defaultOptions.legend.backgroundColor || 'white',
  //   borderColor: '#CCC',
  //   borderWidth: 1,
  //   shadow: false
  // };
  // tooltipPointFormat = '{series.name}: {point.y}<br/>Total: {point.total}';

  constructor(private queryData: EoscReadinessDataService) {}

  ngOnInit() {
    this.years.forEach((year, index) => {
      this.getBarChartData(year, index);
      this.getFinancialBarChartData(year, index);
    });

    this.getTrendsPublications();
    this.getTrendsOpenData();
  }

  /** Bar charts ---------------------------------------------------------------------------------------------------> **/
  getBarChartData(year: string, index: number) {
    zip(
      this.queryData.getQuestion(year, 'Question6'),   // national policy on open access publications
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
        this.barChartSeries.push(this.createBarChartSeries(value, year));

        if (this.years.length === index+1)
          this.barChartSeries = [...this.barChartSeries];
      },
      error: err => {console.error(err)}
    });
  }

  getFinancialBarChartData(year: string, index: number) {
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
        this.barChart2Series.push(this.createBarChartSeries(value, year));

        if (this.years.length === index+1)
          this.barChart2Series = [...this.barChart2Series];
      },
      error: err => {console.error(err)}
    });
  }

  createBarChartSeries(data: RawData[], year: string) {
    let series: SeriesBarOptions = {
      type: 'bar',
      name: 'Year '+ (+year-1),
      data: []
    }

    data.forEach(el => {
      let count = 0;
      el.datasets[0].series.result.forEach(item => {
        if (item.row[1] === 'Yes')
          count++;
      });
      series.data.push(Math.round(((count/el.datasets[0].series.result.length + Number.EPSILON) * 100)));
    });
    return series;
  }

  /** Get trends of Publications ----------------------------------------------------------------------------------> **/
  getTrendsPublications() {
    this.queryData.getOSOStats(trendOfOAPublications()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        value.data.forEach((item, index) => {
          item.forEach(el => {
            this.stackedColumnSeries[index].data.push(+el[0]);
          });
        });
        // console.log(this.stackedColumnSeries);
        this.stackedColumnSeries = [...this.stackedColumnSeries];
      }
    });
  }

  /** Get trends of Publications ----------------------------------------------------------------------------------> **/
  getTrendsOpenData() {
    this.queryData.getOSOStatsChartData(trendOfOpenData()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        value.series.forEach((series, index) => {
          this.stackedColumn2Series[index].data.push(...series.data);
        });

        this.stackedColumn2Categories = value.xAxis_categories;
      }
    });
  }

}
