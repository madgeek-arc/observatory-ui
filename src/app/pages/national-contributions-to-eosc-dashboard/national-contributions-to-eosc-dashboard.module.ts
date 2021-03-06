import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReusableComponentsModule} from "../../shared/reusablecomponents/reusable-components.module";
import {NationalContributionsToEOSCDashboardRouting} from "./national-contributions-to-eosc-dashboard.routing";
import {NationalContributionsToEOSCDashboardComponent} from "./national-contributions-to-eosc-dashboard.component";
import {NCTEPoliciesComponent} from "./policies/ncte-policies.component";
import {NCTEFundingComponent} from "./funding/ncte-funding.component";
import {HighchartsChartModule} from "highcharts-angular";
import {DataService} from "../../services/data.service";
import {CountriesTableComponent} from "./countries-table.component";
import {DataHandlerService} from "../../services/data-handler.service";
import {NCTEMandate} from "./mandate/ncte-mandate";
import {NCTEOpenAccessComponent} from "./open-access/ncte-open-access.component";
import {NCTEMonitoringComponent} from "./monitoring/ncte-monitoring.component";
import {StakeholdersService} from "../../services/stakeholders.service";

@NgModule({
  declarations: [
    NationalContributionsToEOSCDashboardComponent,
    NCTEPoliciesComponent,
    NCTEFundingComponent,
    NCTEMandate,
    NCTEMonitoringComponent,
    NCTEOpenAccessComponent,
    CountriesTableComponent
  ],
  imports: [
    CommonModule,
    ReusableComponentsModule,
    NationalContributionsToEOSCDashboardRouting,
    HighchartsChartModule
  ],
  providers: [
    DataService,
    DataHandlerService,
    StakeholdersService
  ],
})

export class NationalContributionsToEOSCDashboardModule {}
