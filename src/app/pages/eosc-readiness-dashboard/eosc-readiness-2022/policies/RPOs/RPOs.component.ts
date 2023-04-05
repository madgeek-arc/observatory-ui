import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {EoscReadiness2022DataService} from "../../../../services/eosc-readiness2022-data.service";
import {StakeholdersService} from "../../../../../../survey-tool/app/services/stakeholders.service";
import {DataHandlerService} from "../../../../services/data-handler.service";
import {CountryTableData} from "../../../../../../survey-tool/app/domain/country-table-data";
import {EoscReadiness2022MapSubtitles} from "../../eosc-readiness2022-map-subtitles";
import {zip} from "rxjs/internal/observable/zip";
import {isNumeric} from "rxjs/internal-compatibility";
import UIkit from "uikit";
import {RawData} from "../../../../../../survey-tool/app/domain/raw-data";

@Component({
  selector: 'app-national-policy',
  templateUrl: 'RPOs.component.html'
})

export class RPOsComponent implements OnInit {

  countriesArray: string[] = [];
  tableAbsoluteDataArray: CountryTableData[][] = [];
  mapSubtitles: string[] = [];
  mapSubtitlesArray: string[][] = EoscReadiness2022MapSubtitles;
  questionsDataArray: any[] = [];
  tmpQuestionsDataArray: any[] = [];
  questionsDataArrayForBarChart: any[] = [];
  sumsArray: string[] = [];

  constructor(private router: Router, private route: ActivatedRoute, private queryData: EoscReadiness2022DataService,
              private stakeholdersService: StakeholdersService, private dataHandlerService: DataHandlerService) {
  }

  ngOnInit() {

    this.route.params.subscribe(
      params => {
        console.log(params);
        if (params['type'] === 'publications'){
          this.getPublicationsData();
          UIkit.switcher('#topSelector').show(0);
        }
        if (params['type'] === 'data')
          UIkit.switcher('#topSelector').show(1);
      }
    );
  }

  getPublicationsData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.queryData.getQuestion8(),
      ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.questionsDataArray[0] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        this.questionsDataArrayForBarChart[0] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        this.sumsArray[0] = this.calculateSum(res[1]);
      }
    )
  }

  calculateSum(rawData: RawData): string {
    let sum = 0.0;
    for (const series of rawData.datasets) {
      for (const rowResult of series.series.result) {
        if (isNumeric(rowResult.row[1])) {
          sum += +rowResult.row[1];
        }
      }
    }
    return (Math.round((sum + Number.EPSILON) * 100) / 100).toString();
  }


}
