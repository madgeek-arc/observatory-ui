import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {EoscReadiness2022DataService} from "../../../../services/eosc-readiness2022-data.service";
import {StakeholdersService} from "../../../../../../survey-tool/app/services/stakeholders.service";
import {DataHandlerService} from "../../../../services/data-handler.service";
import {CountryTableData} from "../../../../../../survey-tool/app/domain/country-table-data";
import {EoscReadiness2022MapSubtitles} from "../../eosc-readiness2022-map-subtitles";
import {latlong} from "../../../../../../survey-tool/app/domain/countries-lat-lon";
import {CategorizedAreaData, Series} from "../../../../../../survey-tool/app/domain/categorizedAreaData";
import {zip} from "rxjs/internal/observable/zip";
import UIkit from "uikit";

@Component({
  selector: 'app-national-policy',
  templateUrl: 'national-policy.component.html'
})

export class NationalPolicyComponent implements OnInit {

  countriesArray: string[] = [];
  tableAbsoluteDataArray: CountryTableData[][] = [];
  mapSubtitles: string[] = [];
  mapSubtitlesArray: string[][] = EoscReadiness2022MapSubtitles;
  questionsDataArray: any[] = [];
  tmpQuestionsDataArray: any[] = [];
  mapPointData: CountryTableData[];

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
        // console.log('policies component params');
        console.log(params);
        if (params['type'] === 'publications') {
          UIkit.switcher('#topSelector').show(0);
          this.getPublicationsData();
        }
        if (params['type'] === 'data')
          UIkit.switcher('#topSelector').show(1);
      }
    );
  }

  getPublicationsData() {
    zip(
      this.queryData.getQuestion6(),
      this.queryData.getQuestion6_1(),
    ).subscribe(
      res => {
        this.tableAbsoluteDataArray[0] = this.dataHandlerService.convertRawDataToTableData(res[0]);
        this.tmpQuestionsDataArray[0] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[0]);
        for (let i = 0; i < this.tmpQuestionsDataArray[0].series.length; i++) {
          this.tmpQuestionsDataArray[0].series[i].data = this.tmpQuestionsDataArray[0].series[i].data.map(code => ({ code }));
        }
        this.mapPointData = this.dataHandlerService.convertRawDataToTableData(res[1]);
        // this.mapPointData = this.dataHandlerService.convertRawDataToMapPoint(res[1]);
        console.log(this.mapPointData);
        this.createMapDataFromCategorizationWithDots(0,0);

      },
      error => {console.error(error)},
      () => {
        // this.createComplexMapDataset(0, 0);
      }
    );
  }

  createMapDataFromCategorizationWithDots(index: number, mapCount: number) {
    this.mapSubtitles[mapCount] = this.mapSubtitlesArray[mapCount][index];

    this.questionsDataArray[mapCount] = new CategorizedAreaData();

    this.questionsDataArray[mapCount].series[0] = new Series(this.mapSubtitles[mapCount], false);
    for (let i = 0; i < this.tmpQuestionsDataArray[mapCount].series.length; i++) {
      if (this.tmpQuestionsDataArray[mapCount].series[i].name === this.mapSubtitles[mapCount]) {
        this.questionsDataArray[mapCount].series[0].data = this.tmpQuestionsDataArray[mapCount].series[i].data;
        break;
      }
    }
    let countryCodeArray = [];
    for (const data of this.questionsDataArray[mapCount].series[0].data) {
      countryCodeArray.push(data.code)
    }

    this.questionsDataArray[mapCount].series[1] = new Series('Other', false);
    this.questionsDataArray[mapCount].series[1].data = this.countriesArray.filter(code => !countryCodeArray.includes(code));
    this.questionsDataArray[mapCount].series[1].data = this.questionsDataArray[mapCount].series[1].data.map(code => ({ code }));

    let mapPointArray1 = [];
    let mapPointArray2 = [];
    for (let i = 0; i < this.mapPointData.length; i++) {
      console.log(this.mapPointData[i].dedicatedFinancialContributionsToEOSCLinkedToPolicies);
      if (this.mapPointData[i].dedicatedFinancialContributionsToEOSCLinkedToPolicies === 'Yes') {
        mapPointArray1.push({name: this.mapPointData[i].code, lat: latlong.get(this.mapPointData[i].code).latitude, lon: latlong.get(this.mapPointData[i].code).longitude});
      } else if (this.mapPointData[i].dedicatedFinancialContributionsToEOSCLinkedToPolicies === 'No') {
        mapPointArray2.push({name: this.mapPointData[i].code, lat: latlong.get(this.mapPointData[i].code).latitude, lon: latlong.get(this.mapPointData[i].code).longitude});
      }
    }
    let pos = this.questionsDataArray[mapCount].series.length
    this.questionsDataArray[mapCount].series[pos] = new Series('Yes', false, 'mappoint');
    this.questionsDataArray[mapCount].series[pos].data = mapPointArray1;
    this.questionsDataArray[mapCount].series[pos].color = '#7CFC00';
    this.questionsDataArray[mapCount].series[pos].marker.symbol = 'circle';
    this.questionsDataArray[mapCount].series[pos].showInLegend = true;


    pos = this.questionsDataArray[mapCount].series.length
    this.questionsDataArray[mapCount].series[pos] = new Series('No', false, 'mappoint');
    this.questionsDataArray[mapCount].series[pos].data = mapPointArray2;
    this.questionsDataArray[mapCount].series[pos].color = '#FFEF00';
    this.questionsDataArray[mapCount].series[pos].marker.symbol = 'diamond';
    this.questionsDataArray[mapCount].series[pos].showInLegend = true;

  }


  createComplexMapDataset(index: number, mapCount: number) {

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

    if (index > 2) {
      let mapPointArray = [];
      for (let i = 0; i < this.mapPointData.length; i++) {
        if (this.mapPointData[i].mapPointData[index] === 'true') {
          mapPointArray.push({name: this.mapPointData[i].code, lat: latlong.get(this.mapPointData[i].code).latitude, lon: latlong.get(this.mapPointData[i].code).longitude});
        }
      }
      const pos = this.questionsDataArray[mapCount].series.length
      this.questionsDataArray[mapCount].series[pos] = new Series('Countries with use cases and best practices relevant to the policy', false, 'mappoint');
      this.questionsDataArray[mapCount].series[pos].data = mapPointArray;
      this.questionsDataArray[mapCount].series[pos].color = '#7CFC00';
      this.questionsDataArray[mapCount].series[pos].marker.symbol = 'circle';
      this.questionsDataArray[mapCount].series[pos].showInLegend = true;
    }

    // if (index === 0 || index === 4 || index === 7) {
    //
    //   let mapPointArray = [];
    //   if (index === 0) {
    //     for (let i = 0; i < this.question3.length; i++) {
    //       mapPointArray.push({name: this.question3[i].code, lat: latlong.get(this.question3[i].code).latitude, lon: latlong.get(this.question3[i].code).longitude});
    //     }
    //   }
    //
    //   if (index === 4) {
    //     for (let i = 0; i < this.question12.length; i++) {
    //       mapPointArray.push({name: this.question12[i].code, lat: latlong.get(this.question12[i].code).latitude, lon: latlong.get(this.question12[i].code).longitude});
    //     }
    //   }
    //
    //   if (index === 7) {
    //     for (let i = 0; i < this.question14.length; i++) {
    //       mapPointArray.push({name: this.question14[i].code, lat: latlong.get(this.question14[i].code).latitude, lon: latlong.get(this.question14[i].code).longitude});
    //     }
    //   }
    //
    //   const pos = this.questionsDataArray[mapCount].series.length
    //   this.questionsDataArray[mapCount].series[pos] = new Series('Countries with financial strategies linked to the policy', false, 'mappoint');
    //   this.questionsDataArray[mapCount].series[pos].data = mapPointArray;
    //   this.questionsDataArray[mapCount].series[pos].color = '#FFEF00';
    //   this.questionsDataArray[mapCount].series[pos].marker.symbol = 'diamond';
    //   this.questionsDataArray[mapCount].series[pos].showInLegend = true;
    // }

    // console.log(this.countryCodeArray);

  }

}
