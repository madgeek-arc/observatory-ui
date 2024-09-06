import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { SeriesBarOptions, SeriesBubbleOptions, SeriesOptionsType } from "highcharts";
import { zip } from "rxjs/internal/observable/zip";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { EoscReadinessDataService } from "../../services/eosc-readiness-data.service";
import {RawData, Row} from "../../../../survey-tool/app/domain/raw-data";
import { StakeholdersService } from "../../../../survey-tool/app/services/stakeholders.service";
import {countriesNumbers} from "../../eosc-readiness-dashboard/eosc-readiness-2022/eosc-readiness2022-map-subtitles";



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

  bubbleWithCategories = [] as SeriesBubbleOptions[];

  constructor(private queryData: EoscReadinessDataService, private stakeholdersService: StakeholdersService) {}

  ngOnInit() {
    this.stakeholdersService.getEOSCSBCountries().pipe().subscribe({
      next: value => this.countriesArray = value,
      error: err => console.error(err)
    });

    ['2022', '2023'].forEach(year => {
      this.getBarChartData(year);
    });
    this.getBubbleChartData();
  }

  /** Bar chart ---------------------------------------------------------------------------------------------------> **/
  getBarChartData(year: string) {
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

  /** Bubble chart ------------------------------------------------------------------------------------------------> **/
  getBubbleChartData() {
    zip(
      this.queryData.getQuestion(this.year, 'Question6'),   // national policy on open access publications
      this.queryData.getQuestion(this.year, 'Question6.1'), // national policy is mandatory
      this.queryData.getQuestion(this.year, 'Question56'),  // financial investments in open access publications
      this.queryData.getQuestion(this.year, 'Question57'),  // number of publications published in open access
    ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        // console.log(value);
        // console.log(this.createBubbleChartSeries(value));
        this.bubbleWithCategories = this.createBubbleChartSeries(value);
      },
      error: err => {console.error(err)}
    });
  }

  createBubbleChartSeries(data: RawData[]) {
    const tmpArr = this.mergeArrays(data[0].datasets[0].series.result, data[1].datasets[0].series.result, data[2].datasets[0].series.result, data[3].datasets[0].series.result);
    // console.log(tmpArr);
    let series = [
      {
        name: 'Policy is mandatory',
        color: '#32cd32',
        data: []
      }, {
        name: 'Policy is not mandatory',
        color: '#ff8c00',
        data: []
      }, {
        name: 'No policy',
        color: '#808080',
        data: []
      }
    ] as SeriesBubbleOptions[];

    tmpArr.forEach(el => {

      if (!this.isNumeric(el[3]) || !this.isNumeric(el[4]))
        return;

      //TODO: Z is statically set to 10 until corresponding query is ready
      let item = {x: +el[4], y: this.rangeSelector(+el[3]), z: 10, name: el[0], country: this.findCountryName(el[0]).name};

      if (el[1] === 'No')
        series[2].data.push(item);
      else if (el[1] === 'Yes') {
        if(el[2] === 'Yes')
          series[0].data.push(item);
        else if (el[2] === 'No')
          series[1].data.push(item);
      }

    });
    return series;
  }

  /** Other stuff -------------------------------------------------------------------------------------------------> **/
  mergeArrays = (...arrays: Row[][]): string[][] => {
    const map = new Map<string, string[]>();

    // Helper function to add rows to the map
    arrays.forEach((arr, arrayIndex) => {
      arr.forEach(row => {
        const country = row.row[0];
        const value = row.row[1];

        if (!map.has(country)) {
          map.set(country, [country, ...Array(arrays.length).fill(null)]);
        }

        const entry = map.get(country)!;
        entry[arrayIndex + 1] = value; // Fill respective column
      });
    });

    // Convert the map to an array of string arrays
    return Array.from(map.values());
  };

  findCountryName(code: string) {
    return countriesNumbers.find(
      elem => elem.id === code
    );
  }

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

  rangeSelector(value: number) {
    if (value < 1)
      return 0;
    else if (value < 5)
      return 1;
    else if (value < 10)
      return 2;
    else if (value < 20)
      return 3;
    else
      return 4;
  }

}
