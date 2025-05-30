import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArchiveRouting } from "./archive.routing";
import { ArchiveComponent } from "./archive.component";
import { NCTEPoliciesComponent } from "./policies/ncte-policies.component";
import { NCTEFundingComponent } from "./funding/ncte-funding.component";
import { HighchartsChartModule } from "highcharts-angular";
import { DataService } from "../services/data.service";
import { CountriesTableComponent } from "./countries-table.component";
import { DataHandlerService } from "../services/data-handler.service";
import { NCTEMandate } from "./mandate/ncte-mandate";
import { NCTEOpenAccessComponent } from "./open-access/ncte-open-access.component";
import { NCTEMonitoringComponent } from "./monitoring/ncte-monitoring.component";
import { StakeholdersService } from "../../../survey-tool/app/services/stakeholders.service";
import { ChartsModule } from "../../shared/charts/charts.module";

@NgModule({
  declarations: [
    ArchiveComponent,
    NCTEPoliciesComponent,
    NCTEFundingComponent,
    NCTEMandate,
    NCTEMonitoringComponent,
    NCTEOpenAccessComponent,
    CountriesTableComponent
  ],
  imports: [
    CommonModule,
    ArchiveRouting,
    HighchartsChartModule,
    ChartsModule,
  ],
  providers: [
    DataService,
    DataHandlerService,
    StakeholdersService
  ],
  exports: [
    NCTEPoliciesComponent,
    CountriesTableComponent,
    NCTEFundingComponent,
    NCTEMandate
  ]
})

export class ArchiveModule {}
