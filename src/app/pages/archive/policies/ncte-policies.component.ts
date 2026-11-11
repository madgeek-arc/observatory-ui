import { Component, OnInit, ChangeDetectionStrategy, inject, signal } from "@angular/core";
import { CountryTableData } from "src/app/domain/country-table-data";
import { DataService } from "../../services/data.service";
import { DataHandlerService } from "../../services/data-handler.service";
import { CategorizedAreaData, Series } from "src/app/domain/categorizedAreaData";
import { StakeholdersService } from "src/survey-tool/app/services/stakeholders.service";
import { latlong } from "src/app/domain/countries-lat-lon";
import { zip } from "rxjs";
import { HighchartsCategoryMapComponent } from "../../../shared/charts/category-map/highcharts-category-map.component";
import { CountriesTableComponent } from "../countries-table.component";

@Component({
    selector: 'app-ncte-policies',
    templateUrl: './ncte-policies.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [HighchartsCategoryMapComponent, CountriesTableComponent]
})

export class NCTEPoliciesComponent implements OnInit{

  private dataService = inject(DataService);
  private dataHandlerService = inject(DataHandlerService);
  private stakeholdersService = inject(StakeholdersService);

  // read by the template
  tableAbsoluteData = signal<CountryTableData[]>(undefined);
  countryCodeArray = signal<CategorizedAreaData>(null);
  mapSubtitle = signal<string>(null);
  loadingAbsoluteTable = signal(true);

  // only used to build the map datasets
  mapPointData: CountryTableData[];
  question3: CountryTableData[];
  question12: CountryTableData[];
  question14: CountryTableData[];
  countriesArray: string[] = [];

  ngOnInit() {
    this.loadingAbsoluteTable.set(true);
    zip(
      this.dataService.getEOSCRelevantPolicies(),
      this.dataService.getUseCasesAndPracticesByDimension(),
      this.stakeholdersService.getEOSCSBCountries(),
      this.dataService.getQuestion5(),
      this.dataService.getQuestion14(),
      this.dataService.getQuestion16()).subscribe(
        next => {
          this.tableAbsoluteData.set(this.dataHandlerService.convertRawDataToTableData(next[0]));
          this.loadingAbsoluteTable.set(false);
          this.mapPointData = this.dataHandlerService.convertRawDataToTableData(next[1]);
          this.countriesArray = next[2];
          this.question3 = this.dataHandlerService.convertRawDataToMapPoint(next[3]);
          this.question12 = this.dataHandlerService.convertRawDataToMapPoint(next[4]);
          this.question14 = this.dataHandlerService.convertRawDataToMapPoint(next[5]);
        },
      error => {},
      () => {
        this.createMapDataset(0);
      }
    );
  }

  createMapDataset(index: number) {

    this.createMapSubtitle(index);

    const mapData = new CategorizedAreaData();
    mapData.series[0] = new Series('Has Policy', false);

    let countryCodeArray = [];
    for (let i = 0; i < this.tableAbsoluteData().length; i++) {
      if (this.tableAbsoluteData()[i].EOSCRelevantPoliciesInPlace[index] === 'true') {
        countryCodeArray.push(this.tableAbsoluteData()[i].code);
      }
    }
    mapData.series[0].data = countryCodeArray;

    mapData.series[1] = new Series('No Policy', false);
    mapData.series[1].data = this.countriesArray.filter( code => !countryCodeArray.includes(code));

    for (let i = 0; i < mapData.series.length; i++) {
      mapData.series[i].data = mapData.series[i].data.map(code => ({ code }));
    }

    if (index > 2) {
      let mapPointArray = [];
      for (let i = 0; i < this.mapPointData.length; i++) {
        if (this.mapPointData[i].mapPointData[index] === 'true') {
          mapPointArray.push({name: this.mapPointData[i].code, lat: latlong.get(this.mapPointData[i].code).latitude, lon: latlong.get(this.mapPointData[i].code).longitude});
        }
      }
      const pos = mapData.series.length
      mapData.series[pos] = new Series('Countries with use cases and best practices relevant to the policy', false, 'mappoint');
      mapData.series[pos].data = mapPointArray;
      mapData.series[pos].color = '#7CFC00';
      mapData.series[pos].marker.symbol = 'circle';
      mapData.series[pos].showInLegend = true;
    }

    if (index === 0 || index === 4 || index === 7) {

      let mapPointArray = [];
      if (index === 0) {
        for (let i = 0; i < this.question3.length; i++) {
          mapPointArray.push({name: this.question3[i].code, lat: latlong.get(this.question3[i].code).latitude, lon: latlong.get(this.question3[i].code).longitude});
        }
      }

      if (index === 4) {
        for (let i = 0; i < this.question12.length; i++) {
          mapPointArray.push({name: this.question12[i].code, lat: latlong.get(this.question12[i].code).latitude, lon: latlong.get(this.question12[i].code).longitude});
        }
      }

      if (index === 7) {
        for (let i = 0; i < this.question14.length; i++) {
          mapPointArray.push({name: this.question14[i].code, lat: latlong.get(this.question14[i].code).latitude, lon: latlong.get(this.question14[i].code).longitude});
        }
      }

      const pos = mapData.series.length
      mapData.series[pos] = new Series('Countries with financial strategies linked to the policy', false, 'mappoint');
      mapData.series[pos].data = mapPointArray;
      mapData.series[pos].color = '#FFEF00';
      mapData.series[pos].marker.symbol = 'diamond';
      mapData.series[pos].showInLegend = true;
    }

    this.countryCodeArray.set(mapData);
  }

  createMapSubtitle(index: number) {
    switch (index) {
      case 0:
        this.mapSubtitle.set('There are one or more policies relevant for the EOSC in place');
        break;
      case 1:
        this.mapSubtitle.set('Policy in planning');
        break;
      case 2:
        this.mapSubtitle.set('One or more of the open science policies explicitly mentions EOSC');
        break;
      case 3:
        this.mapSubtitle.set('Policy addresses Open access to data, data management and/or FAIR');
        break;
      case 4:
        this.mapSubtitle.set('Policy addresses FAIRisation of data');
        break;
      case 5:
        this.mapSubtitle.set('Policy addresses Open access to software');
        break;
      case 6:
        this.mapSubtitle.set('Policy addresses Preservation and reuse of scientific information');
        break;
      case 7:
        this.mapSubtitle.set('Policy addresses Infrastructures that include aspects of open science');
        break;
      case 8:
        this.mapSubtitle.set('Policy addresses Skills and competencies');
        break;
      case 9:
        this.mapSubtitle.set('Policy addresses Incentives and rewards');
        break;
      case 10:
        this.mapSubtitle.set('Policy addresses Citizen science');
        break;
      case 11:
        this.mapSubtitle.set('Other');
        break;
    }
  }

}
