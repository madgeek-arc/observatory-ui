import { Component, OnInit } from "@angular/core";

@Component({
  selector: 'app-open-science-by-area-fair-data',
  templateUrl: './open-science-by-area-fair-data.component.html',
})

export class OpenScienceByAreaFairDataComponent implements OnInit {

  stackedColumnSeries = [
    {
      name: 'Research Performing Organisations with Policy',
      data: [80, 85],
      color: '#028691' // Primary color
    }, {
      name: 'Research Founding Organisations with Policy',
      data: [75, 80],
      color: '#e4587c' // Secondary color
    }, {
      name: 'Research Performing Organisations without Policy',
      data: [15, 20],
      color: '#fae0d1' // Tertiary color
    }, {
      name: 'Research Founding Organisations without Policy',
      data: [10, 5],
      color: '#515252' // Additional color
    }
  ];
  stackedColumnCategories = ['2022', '2023'];
  xAxisTitle = 'Year';
  yAxisTitle = 'Percentage of Policies on FAIR Data';
  tooltipPointFormat = '{series.name}: {point.y}%';
  labelFormat = '{value}%';
  plotFormat = '{y}%';

  ngOnInit() {
    this.stackedColumnCategories.forEach(year => {
      this.getStackedColumnData(year);
    });
  }

  getStackedColumnData(year: string) {

  }

}
