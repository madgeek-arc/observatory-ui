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
import {NCTEResourcesAndSupportComponent} from "./mandate/ncte-resourcesAndSupport.component";

@NgModule({
  declarations: [
    NationalContributionsToEOSCDashboardComponent,
    NCTEPoliciesComponent,
    NCTEFundingComponent,
    NCTEResourcesAndSupportComponent,
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
    DataHandlerService
  ],
})

export class NationalContributionsToEOSCDashboardModule {}
