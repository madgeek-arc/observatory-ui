import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReusableComponentsModule} from "../../shared/reusablecomponents/reusable-components.module";
import {NationalContributionsToEOSCDashboardRouting} from "./national-contributions-to-eosc-dashboard.routing";
import {NationalContributionsToEOSCDashboardComponent} from "./national-contributions-to-eosc-dashboard.component";
import {NCTEPoliciesComponent} from "./policies/ncte-policies.component";
import {NCTEFundingComponent} from "./funding/ncte-funding.component";
import {HighchartsChartModule} from "highcharts-angular";

@NgModule({
  declarations: [
    NationalContributionsToEOSCDashboardComponent,
    NCTEPoliciesComponent,
    NCTEFundingComponent,
  ],
  imports: [
    CommonModule,
    ReusableComponentsModule,
    NationalContributionsToEOSCDashboardRouting,
    HighchartsChartModule
  ],
})

export class NationalContributionsToEOSCDashboardModule {}
