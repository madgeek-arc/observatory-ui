import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {EoscReadiness2022DataService} from "../../../../services/eosc-readiness2022-data.service";
import {StakeholdersService} from "../../../../../../survey-tool/app/services/stakeholders.service";
import {DataHandlerService} from "../../../../services/data-handler.service";
import {CountryTableData} from "../../../../../../survey-tool/app/domain/country-table-data";
import {ColorPallet, EoscReadiness2022MapSubtitles} from "../../eosc-readiness2022-map-subtitles";
import {CategorizedAreaData, Series} from "../../../../../../survey-tool/app/domain/categorizedAreaData";
import {zip} from "rxjs/internal/observable/zip";
import UIkit from "uikit";

@Component({
  selector: 'app-national-policy',
  templateUrl: 'national-monitoring.component.html'
})

export class NationalMonitoringComponent implements OnInit {

  countriesArray: string[] = [];
  tableAbsoluteDataArray: CountryTableData[][] = [];
  mapSubtitles: string[] = [];
  mapSubtitlesArray: string[][] = EoscReadiness2022MapSubtitles;
  questionsDataArray: any[] = [];
  tmpQuestionsDataArray: any[] = [];

  constructor(private router: Router, private route: ActivatedRoute, private queryData: EoscReadiness2022DataService,
              private stakeholdersService: StakeholdersService, private dataHandlerService: DataHandlerService) {
  }

  ngOnInit() {

    this.route.params.subscribe(
      params => {
        // console.log('policies component params');
        if (params['type'] === 'publications') {
          UIkit.switcher('#topSelector').show(0);
          this.getPublicationsData();
        }
        if (params['type'] === 'data') {
          UIkit.switcher('#topSelector').show(1);
        }
      }
    );
  }

  getPublicationsData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.queryData.getQuestion54(),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.tmpQuestionsDataArray[0] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        for (let i = 0; i < this.tmpQuestionsDataArray[0].series.length; i++) {
          this.tmpQuestionsDataArray[0].series[i].data = this.tmpQuestionsDataArray[0].series[i].data.map(code => ({ code }));
        }
        this.createMapDataFromCategorization(0,2);
      }
    );
  }

  createMapDataFromCategorization(index: number, mapCount: number) {
    // this.mapSubtitles[mapCount] = this.mapSubtitlesArray[mapCount][index];

    this.questionsDataArray[index] = new CategorizedAreaData();
    for (let i = 0; i < this.tmpQuestionsDataArray[index].series.length; i++) {
      this.questionsDataArray[index].series[i] = new Series(this.mapSubtitlesArray[mapCount][i], false);
      this.questionsDataArray[index].series[i].data = this.tmpQuestionsDataArray[index].series[i].data;
      this.questionsDataArray[index].series[i].showInLegend = true;
      this.questionsDataArray[index].series[i].color = ColorPallet[i];
    }
    let countryCodeArray = [];
    for (let i = 0; i < this.questionsDataArray[index].series.length; i++) {
      for (const data of this.questionsDataArray[index].series[i].data) {
        countryCodeArray.push(data.code)
      }
    }

    this.questionsDataArray[index].series[this.questionsDataArray[index].series.length] = new Series('Awaiting Data', false);
    this.questionsDataArray[index].series[this.questionsDataArray[index].series.length-1].showInLegend = true;
    this.questionsDataArray[index].series[this.questionsDataArray[index].series.length-1].color = ColorPallet[this.questionsDataArray[index].series.length-1];
    this.questionsDataArray[index].series[this.questionsDataArray[index].series.length-1].data = this.countriesArray.filter(code => !countryCodeArray.includes(code));
    this.questionsDataArray[index].series[this.questionsDataArray[index].series.length-1].data = this.questionsDataArray[index].series[this.questionsDataArray[index].series.length-1].data.map(code => ({ code }));
  }

}
