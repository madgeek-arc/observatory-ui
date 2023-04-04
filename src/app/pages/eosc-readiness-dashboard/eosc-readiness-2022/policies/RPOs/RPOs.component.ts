import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {EoscReadiness2022DataService} from "../../../../services/eosc-readiness2022-data.service";
import {StakeholdersService} from "../../../../../../survey-tool/app/services/stakeholders.service";
import {DataHandlerService} from "../../../../services/data-handler.service";
import {CountryTableData} from "../../../../../../survey-tool/app/domain/country-table-data";
import {EoscReadiness2022MapSubtitles} from "../../eosc-readiness2022-map-subtitles";
import {zip} from "rxjs/internal/observable/zip";
import {CategorizedAreaData, Series} from "../../../../../../survey-tool/app/domain/categorizedAreaData";
import UIkit from "uikit";

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

  constructor(private router: Router, private route: ActivatedRoute, private queryData: EoscReadiness2022DataService,
              private stakeholdersService: StakeholdersService, private dataHandlerService: DataHandlerService) {
  }

  ngOnInit() {
    this.stakeholdersService.getEOSCSBCountries().subscribe(
      res => {this.countriesArray = res;},
      error => {console.error(error)}
    );

    this.route.params.subscribe(
      params => {
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
      this.queryData.getQuestion8(),
      ).subscribe(
      res => {
        this.questionsDataArray[0] = this.dataHandlerService.covertRawDataToColorAxisMap(res[0]);
        this.questionsDataArrayForBarChart[0] = this.dataHandlerService.covertRawDataToColorAxisMap(res[0]);
      }
    )
  }

}
