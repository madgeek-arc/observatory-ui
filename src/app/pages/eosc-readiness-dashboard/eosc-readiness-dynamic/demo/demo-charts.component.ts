import { Component, OnInit } from "@angular/core";
import { zip } from "rxjs/internal/observable/zip";
import { StakeholdersService } from "../../../../../survey-tool/app/services/stakeholders.service";
import { DataHandlerService } from "../../../services/data-handler.service";
import { EoscReadinessDataService } from "../../../services/eosc-readiness-data.service";
import { RawData } from "../../../../../survey-tool/app/domain/raw-data";
import { isNumeric } from "rxjs/internal-compatibility";
import { countriesNumbers } from "../../eosc-readiness-2022/eosc-readiness2022-map-subtitles";
import { PointOptionsObject, SeriesBubbleOptions, SeriesOptionsType } from "highcharts";
import * as Highcharts from "highcharts";

@Component({
  selector: "demo-charts",
  templateUrl: "./demo-charts.component.html",
})

export class DemoChartsComponent implements OnInit {
  year = '2022';
  treeGraph: PointOptionsObject[] = [];
  bubbleWithPlotLines = [{
    type: 'bubble',
    data: [
      {x: 95, y: 95, z: 13.8, name: 'BE', country: 'Belgium'},
      {x: 86.5, y: 102.9, z: 14.7, name: 'DE', country: 'Germany'},
      {x: 80.8, y: 91.5, z: 15.8, name: 'FI', country: 'Finland'},
      {x: 80.4, y: 102.5, z: 12, name: 'NL', country: 'Netherlands'},
      {x: 80.3, y: 86.1, z: 11.8, name: 'SE', country: 'Sweden'},
      {x: 78.4, y: 70.1, z: 16.6, name: 'ES', country: 'Spain'},
      {x: 74.2, y: 68.5, z: 14.5, name: 'FR', country: 'France'},
      {x: 73.5, y: 83.1, z: 10, name: 'NO', country: 'Norway'},
      {x: 71, y: 93.2, z: 24.7, name: 'UK', country: 'United Kingdom'},
      {x: 69.2, y: 57.6, z: 10.4, name: 'IT', country: 'Italy'},
      {x: 68.6, y: 20, z: 16, name: 'RU', country: 'Russia'},
      {x: 65.5, y: 126.4, z: 35.3, name: 'US', country: 'United States'},
      {x: 65.4, y: 50.8, z: 28.5, name: 'HU', country: 'Hungary'},
      {x: 63.4, y: 51.8, z: 15.4, name: 'PT', country: 'Portugal'},
      {x: 64, y: 82.9, z: 31.3, name: 'NZ', country: 'New Zealand'}
    ]
  }] as unknown as SeriesBubbleOptions[];

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

  variablePie = [{
    minPointSize: 10,
    innerSize: '20%',
    zMin: 0,
    name: 'countries',
    borderRadius: 5,
    data: [{
      name: 'Repositories',
      y: 50,
      z: 92
    }, {
      name: 'Citizen Science',
      y: 55,
      z: 119
    }, {
      name: 'Services in EOSC',
      y: 31,
      z: 121
    }, {
      name: 'Software',
      y: 7,
      z: 136
    }, {
      name: 'Open Data',
      y: 30,
      z: 200
    }, {
      name: 'FAIR Data',
      y: 41,
      z: 213
    }, {
      name: 'Open Acess',
      y: 35,
      z: 235
    }],
    colors: [
      '#4caefe',
      '#3dc3e8',
      '#2dd9db',
      '#1feeaf',
      '#0ff3a0',
      '#00e887',
      '#23e274'
    ]
  }];

  pieTooltip = {
    headerFormat: '',
    pointFormat: '<span style="color:{point.color}">\u25CF</span> <b> ' +
    '{point.name}</b><br/>' +
    'Investment in millions of Euroso: <b>{point.y}</b><br/>'
  }

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
    title: 'Percentage of countries with national policies different Open Science Categories',
    xAxis: 'Policy on',
    yAxis: 'Percentage of countries with national policies',
  }

  stackedColumnCategories = ['Bioentity<br>(total = 37,405,521)', 'Dataset<br>(total = 19,188,757)', 'Image<br>(total = 3,283,874)', 'Collection<br>(total = 579,542)', 'Audiovisual<br>(total = 224,732)', 'Clinical Trial<br>(total = 150,099)', 'Other<br>(total = TBD)'];
  stackedColumnSeries = [
    {
      type: 'column',
      name: 'Open',
      data: [25, 35, 25, 15, 40, 10, 25],  // Random data to not always total 100%
      color: '#028691'  // Primary color
    }, {
      type: 'column',
      name: 'Restricted',
      data: [45, 30, 35, 45, 20, 60, 20],
      color: '#e4587c'  // Secondary color
    }, {
      type: 'column',
      name: 'Closed',
      data: [15, 25, 30, 20, 25, 20, 40],  // Adding varying percentages
      color: '#515252'  // Color for 'Closed' category
    }, {
      type: 'column',
      name: 'Embargo',
      data: [15, 10, 10, 20, 15, 10, 15],  // New category 'Embargo'
      color: '#fae0d1'  // Another color
    }
  ] as Highcharts.SeriesColumnOptions[];
  yAxisTitle = 'Percentage of Open Data'
  tooltipPointFormat = '{series.name}: {point.y} %<br/>Total: {point.total} %';
  plotFormat = '{y}%';

  stackedColumnCategories1 = ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'];
  stackedColumnSeries1 = [
    {
      type: 'column',
      name: 'Gold OA only',
      data: [120000, 130000, 140000, 150000, 160000, 170000, 180000, 190000, 200000, 210000],
      color: '#FFD700' // Gold color
    }, {
      type: 'column',
      name: 'Green OA only',
      data: [80000, 85000, 90000, 95000, 100000, 105000, 110000, 115000, 120000, 125000],
      color: '#228B22' // Forest green color
    }, {
      type: 'column',
      name: 'Both Gold & Green OA',
      data: [40000, 45000, 50000, 55000, 60000, 65000, 70000, 75000, 80000, 85000],
      color: '#FF69B4' // Hot pink color for mixed category
    }, {
      type: 'column',
      name: 'Neither',
      data: [20000, 25000, 30000, 35000, 40000, 45000, 50000, 55000, 60000, 65000],
      color: '#808080' // Grey color
    }
  ] as Highcharts.SeriesColumnOptions[];
  yAxisTitle1 = 'Number of Data Sets'
  legend = {
    align: 'right',
    x: -30,
    verticalAlign: 'top',
    y: 25,
    floating: true,
    backgroundColor: Highcharts.defaultOptions.legend.backgroundColor || 'white',
    borderColor: '#CCC',
    borderWidth: 1,
    shadow: false
  };
  tooltipPointFormat1 = '{series.name}: {point.y}<br/>Total: {point.total}';

  stackedColumnSeries2 = [
    {
      type: 'column',
      name: 'Research Performing Organisations with Policy',
      data: [75, 80, 85],
      color: '#028691' // Primary color
    }, {
      type: 'column',
      name: 'Research Founding Organisations with Policy',
      data: [70, 75, 80],
      color: '#e4587c' // Secondary color
    }, {
      type: 'column',
      name: 'Research Performing Organisations without Policy',
      data: [10, 15, 20],
      color: '#fae0d1' // Tertiary color
    }, {
      type: 'column',
      name: 'Research Founding Organisations without Policy',
      data: [5, 10, 5],
      color: '#515252' // Additional color
    }
  ] as Highcharts.SeriesColumnOptions[];
  stackedColumnCategories2 = ['2021', '2022', '2023'];
  xAxisTitle2 = 'Year'
  yAxisTitle2 = 'Percentage of Policies on FAIR Data'
  tooltipPointFormat2 = '{series.name}: {point.y}%';
  labelFormat2 = '{value}%';

  stackedColumnSeries3 = [{
    type: 'column',
    name: 'RPOs with Policy on Data Management',
    data: [40, 45, 10], // Example data
    color: '#028691' // Primary color
  }, {
    type: 'column',
    name: 'RFOs with Policy on Data Management',
    data: [20, 35, 20], // Example data
    color: '#e4587c' // Secondary color
  }, {
    type: 'column',
    name: 'RPOs without Policy on Data Management',
    data: [30, 25, 30], // Example data
    color: '#fae0d1' // Tertiary color
  }, {
    type: 'column',
    name: 'RFOs without Policy on Data Management',
    data: [20, 15, 40], // Example data
    color: '#515252' // Additional color
  }] as Highcharts.SeriesColumnOptions[];
  stackedColumnCategories3 = ['2021', '2022', '2023'];
  xAxisTitle3 = 'Year'
  yAxisTitle3 = 'Percentage of Policies on FAIR Data'
  tooltipPointFormat3 = '{series.name}: {point.y}%';
  labelFormat3 = '{value}%';

  constructor(private queryData: EoscReadinessDataService, private stakeholdersService: StakeholdersService,
              private dataHandlerService: DataHandlerService) {}

  ngOnInit() {
    this.getRanges();
  }

  getRanges() {
    zip(
      this.queryData.getQuestion(this.year, 'Question5'),
      this.queryData.getQuestionComment(this.year, 'Question5'),
    ).subscribe(
      res => {
        this.treeGraph = this.createRanges(res[0]);
        // console.log(this.treeGraph);
        // console.log(this.dataHandlerService.covertRawDataToColorAxisMap(res[1]));
      }
    );
  }

  createRanges(data: RawData) {
    const arr = [
      {
        id: '0.0',
        parent: '',
        name: 'Country investments'
      },
      {
        id: '1.1',
        parent: '0.0',
        name: '< 1 M'
      },
      {
        id: '1.2',
        parent: '0.0',
        name: '1-5 M'
      },
      {
        id: '1.3',
        parent: '0.0',
        name: '5-10 M'
      },
      {
        id: '1.4',
        parent: '0.0',
        name: '10-20M'
      },
      {
        id: '1.5',
        parent: '0.0',
        name: '> 20 M'
      }

    ];

    let count = 0;

    data.datasets[0].series.result.forEach((element: any) => {
      // console.log(element.row[1]);
      // console.log(isNumeric(element.row[1]));

      if (!isNumeric(element.row[1]))
        return;

      if (+element.row[1] === 0)
        return;

      count++;
      let countryName = this.findCountryName(element.row[0]).name;

      let item = {
        id: '2.'+count,
        parent: '1.',
        name: countryName,
        y: +element.row[1]
      }

      if (+element.row[1] < 1) {
        item.parent = '1.1';
      } else if (+element.row[1] < 5) {
        item.parent = '1.2';
      } else if (+element.row[1] < 10) {
        item.parent = '1.3';
      } else if (+element.row[1] < 20) {
        item.parent = '1.4';
      } else if (+element.row[1] >= 20) {
        item.parent = '1.5';
      }

      // console.log(item);
      arr.push(item);

    });

    // console.log(arr);
    return arr;

  }

  findCountryName(code: string) {
    return countriesNumbers.find(
      elem => elem.id === code
    );
  }

  isNumeric(value: string): boolean {
    // Check if the value is empty
    if (value.trim() === '') {
      return false;
    }

    // Attempt to parse the value as a float
    const number = parseFloat(value);

    // Check if parsing resulted in NaN or the value has extraneous characters
    return !isNaN(number) && isFinite(number) && String(number) === value;
  }


}
