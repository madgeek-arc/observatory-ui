import { Component, OnInit } from "@angular/core";
import {SeriesBubbleOptions, SeriesOptionsType} from "highcharts";


// declare var UIkit;

@Component({
  selector: 'app-open-science-policies',
  templateUrl: './open-science-policies.component.html',
  styleUrls: ['../../dashboard/country-landing-page/country-landing-page.component.css'],
})

export class OpenSciencePoliciesComponent implements OnInit {

  barChartCategories = ['Open Access Publications', 'Fair Data', 'Date Management', 'Open Data', 'Open Software', 'Services', 'Infrastructure', 'Skills/Training', 'Incentives/Rewards for OS', 'Citizen Science'];

  barChartSeries: SeriesOptionsType[] = [{
    type: 'bar',
    name: 'Year 2022',
    data: [51, 22, 8, 2, 12, 21, 10, 5, 16, 5]
  }, {
    type: 'bar',
    name: 'Year 2023',
    data: [63, 37, 10, 4, 15, 26, 14, 6, 18, 8]
  }]

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
      { x: 2060938, y: 3, z: 56.19, name: 'DE', country: 'Germany'},
      { x: 1669248, y: 3, z: 64.99, name: 'FR', country: 'France'},
      { x: 2222182, y: 2, z: 49.89, name: 'IT', country: 'Italy'},
      { x: 1813897, y: 2, z: 77.89, name: 'ES', country: 'Spain'},
      { x: 523172, y: 2, z: 81.61, name: 'PT', country: 'Portugal'}
    ]
  }, {
    name: 'Policy is not mandatory',
    color: '#ff8c00',
    data: [
      { x: 1120814, y: 1, z: 54.40, name: 'NL', country: 'Netherlands'},
      { x: 472697, y: 2, z: 72.84, name: 'FI', country: 'Finland'},
      { x: 657130, y: 1, z: 75.41, name: 'PL', country: 'Poland'}
    ]
  }, {
    name: 'No policy',
    color: '#808080',
    data: [
      { x: 219316, y: 0, z: 61.91, name: 'CZ', country: 'Czech Republic'},
    ]
  }] as unknown as SeriesBubbleOptions[];

  ngOnInit() {
  }
}
