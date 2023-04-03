import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {EoscReadiness2022DataService} from "../../../../services/eosc-readiness2022-data.service";
import {StakeholdersService} from "../../../../../../survey-tool/app/services/stakeholders.service";
import {DataHandlerService} from "../../../../services/data-handler.service";
import {CountryTableData} from "../../../../../../survey-tool/app/domain/country-table-data";
import {EoscReadiness2022MapSubtitles} from "../../eosc-readiness2022-map-subtitles";
import UIkit from "uikit";
import {zip} from "rxjs/internal/observable/zip";
import {CategorizedAreaData, Series} from "../../../../../../survey-tool/app/domain/categorizedAreaData";
import {mapSubtitles} from "../../../../../../survey-tool/app/domain/mapSubtitles";

@Component({
  selector: 'app-national-policy',
  templateUrl: 'financial-strategy.component.html'
})

export class FinancialStrategyComponent implements OnInit {
  countriesArray: string[] = [];
  tableAbsoluteDataArray: CountryTableData[][] = [];
  mapSubtitles: string[] = [];
  mapSubtitlesArray: string[][] = EoscReadiness2022MapSubtitles;
  questionsDataArray: any[] = [];

  constructor(private router: Router, private route: ActivatedRoute, private queryData: EoscReadiness2022DataService,
              private stakeholdersService: StakeholdersService, private dataHandlerService: DataHandlerService) {
  }

  ngOnInit() {
    this.stakeholdersService.getEOSCSBCountries().subscribe(
      res => {}
    );

    this.route.params.subscribe(
      params => {
        // console.log('policies component params');
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
      this.queryData.getQuestion7(),
      ).subscribe(
      res => {
        this.tableAbsoluteDataArray[0] = this.dataHandlerService.convertRawDataToTableData(res[0]);
        // this.createMapDataset(0, 2);
      }
    )
  }

  createMapDataset(index: number, mapCount: number) {
    this.mapSubtitles[mapCount] = this.mapSubtitlesArray[mapCount][index];

    this.questionsDataArray[mapCount] = new CategorizedAreaData();
    this.questionsDataArray[mapCount].series[0] = new Series('Has Policy', false);

    let countryCodeArray = [];
    for (let i = 0; i < this.tableAbsoluteDataArray[mapCount].length; i++) {
      if (this.tableAbsoluteDataArray[mapCount][i].EOSCRelevantPoliciesInPlace[index] === 'true') {
        countryCodeArray.push(this.tableAbsoluteDataArray[mapCount][i].code);
      }
    }
    this.questionsDataArray[mapCount].series[0].data = countryCodeArray;

    this.questionsDataArray[mapCount].series[1] = new Series('No Policy', false);
    this.questionsDataArray[mapCount].series[1].data = this.countriesArray.filter( code => !countryCodeArray.includes(code));

    for (let i = 0; i < this.questionsDataArray[mapCount].series.length; i++) {
      this.questionsDataArray[mapCount].series[i].data = this.questionsDataArray[mapCount].series[i].data.map(code => ({ code }));
    }

  }

}
