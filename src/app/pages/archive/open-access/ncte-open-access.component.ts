import { Component, OnInit, ChangeDetectionStrategy, inject, signal } from "@angular/core";
import { DataService } from "../../services/data.service";
import { CountryTableData } from "src/app/domain/country-table-data";
import { DataHandlerService } from "../../services/data-handler.service";
import { environment } from "src/environments/environment";
import { StakeholdersService } from "src/survey-tool/app/services/stakeholders.service";
import { CountriesTableComponent } from "../countries-table.component";

@Component({
    selector: 'app-ncte-open-access',
    templateUrl: './ncte-open-access.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CountriesTableComponent]
})

export class NCTEOpenAccessComponent implements OnInit {

  private dataService = inject(DataService);
  private dataHandlerService = inject(DataHandlerService);
  private stakeholdersService = inject(StakeholdersService);

  private chartsURL = environment.STATS_API_ENDPOINT + 'chart?json=';
  private profileName = environment.profileName;

  tablePercentageData = signal<CountryTableData[]>(undefined);
  loadingPercentageTable = signal(true);
  //
  // totalFundingForEOSC: string = null;
  //
  // financialContrToEOSCPieChartURL: SafeResourceUrl;

  ngOnInit() {

    this.loadingPercentageTable.set(true);
    this.stakeholdersService.getEOSCSBCountries().subscribe(
      eoscSBCountries => {
        // console.log('EOSC SB Countries', eoscSBCountries);
        this.dataService.getOAPublicationPerCountry().subscribe(
          rawData => {
            this.tablePercentageData.set(this.dataHandlerService.convertRawDataToPercentageTableData(rawData, eoscSBCountries));
            // console.log('Table data', this.tablePercentageData());
            this.loadingPercentageTable.set(false);
          }, error => {
            console.error(error);
            this.loadingPercentageTable.set(false);
          }
        );
      }, error => {
        console.log(error);
      }
    );

  }
}
