import { Component, OnInit } from "@angular/core";
import { zip } from "rxjs/internal/observable/zip";
import { StakeholdersService } from "../../../../../survey-tool/app/services/stakeholders.service";
import { DataHandlerService } from "../../../services/data-handler.service";
import { EoscReadinessDataService } from "../../../services/eosc-readiness-data.service";
import { RawData } from "../../../../../survey-tool/app/domain/raw-data";
import { isNumeric } from "rxjs/internal-compatibility";
import { countriesNumbers } from "../../eosc-readiness-2022/eosc-readiness2022-map-subtitles";

@Component({
  selector: "demo-charts",
  templateUrl: "./demo-charts.component.html",
})

export class DemoChartsComponent implements OnInit {
  year = '2022';
  treeGraph = [];

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
        console.log(this.treeGraph);
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

    console.log(arr);
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
