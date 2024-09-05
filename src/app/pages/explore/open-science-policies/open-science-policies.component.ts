import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { SeriesBarOptions, SeriesBubbleOptions, SeriesOptionsType } from "highcharts";
import { zip } from "rxjs/internal/observable/zip";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { EoscReadinessDataService } from "../../services/eosc-readiness-data.service";
import { RawData } from "../../../../survey-tool/app/domain/raw-data";
import { StakeholdersService } from "../../../../survey-tool/app/services/stakeholders.service";



@Component({
  selector: 'app-open-science-policies',
  templateUrl: './open-science-policies.component.html',
  styleUrls: ['../../dashboard/country-landing-page/country-landing-page.component.css'],
})

export class OpenSciencePoliciesComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  countriesArray: string[] = [];
  year = '2022';

  barChartCategories = ['Open Access Publications', 'Fair Data', 'Data Management', 'Open Data', 'Open Software', 'Services', 'Connecting repositories to EOSC', 'Data stewardship', 'Long-term data preservation', 'Skills/Training', 'Incentives/Rewards for OS', 'Citizen Science'];

  barChartSeries: SeriesOptionsType[] = [];

  barChartTitles = {
    // title: 'Percentage of countries with national policies different Open Science Categories',
    title: '',
    xAxis: 'Policy on',
    yAxis: 'Percentage of countries with national policies',
  }

  bubbleWithCategories = [{
    name: 'Policy is mandatory',
    color: '#32cd32',
    data: [
      {x: 2060938, y: 3, z: 56.19, name: 'DE', country: 'Germany'},
      {x: 1669248, y: 3, z: 64.99, name: 'FR', country: 'France'},
      {x: 2222182, y: 2, z: 49.89, name: 'IT', country: 'Italy'},
      {x: 1813897, y: 2, z: 77.89, name: 'ES', country: 'Spain'},
      {x: 523172, y: 2, z: 81.61, name: 'PT', country: 'Portugal'}
    ]
  }, {
    name: 'Policy is not mandatory',
    color: '#ff8c00',
    data: [
      {x: 1120814, y: 1, z: 54.40, name: 'NL', country: 'Netherlands'},
      {x: 472697, y: 2, z: 72.84, name: 'FI', country: 'Finland'},
      {x: 657130, y: 1, z: 75.41, name: 'PL', country: 'Poland'}
    ]
  }, {
    name: 'No policy',
    color: '#808080',
    data: [
      {x: 219316, y: 0, z: 61.91, name: 'CZ', country: 'Czech Republic'},
    ]
  }] as unknown as SeriesBubbleOptions[];

  constructor(private queryData: EoscReadinessDataService, private stakeholdersService: StakeholdersService) {}

  ngOnInit() {
    this.stakeholdersService.getEOSCSBCountries().pipe().subscribe({
      next: value => this.countriesArray = value,
      error: err => console.error(err)
    });

    ['2022', '2023'].forEach(year => {
      this.getBarChartData(year);
    });
  }

  /** Bar chart ---------------------------------------------------------------------------------------------------> **/
  getBarChartData(year) {
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
        this.barChartSeries = [...this.barChartSeries, this.createBarChartSeries(value, year)];
      },
      error: err => {console.error(err)}
    });
  }

  createBarChartSeries(data: RawData[], year: string) {
    let series: SeriesBarOptions = {
      type: 'bar',
      name: 'Year '+ year,
      data: []
    }

    data.forEach(el => {
      let count = 0;
      el.datasets[0].series.result.forEach(item => {
        if (item.row[1] === 'Yes')
          count++;
      });
      series.data.push(Math.round(((count/this.countriesArray.length + Number.EPSILON) * 100)));
    });
    return series;
  }

}
