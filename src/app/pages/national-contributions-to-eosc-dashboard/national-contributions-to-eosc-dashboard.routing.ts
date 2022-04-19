import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {NationalContributionsToEOSCDashboardComponent} from "./national-contributions-to-eosc-dashboard.component";
import {NCTEPoliciesComponent} from "./policies/ncte-policies.component";
import {NCTEFundingComponent} from "./funding/ncte-funding.component";
import {NationalContributionsToEOSCGuardService} from "../../services/nationalContributionsToEOSC-guard.service";
import {NCTEResourcesAndSupportComponent} from "./mandate/ncte-resourcesAndSupport.component";

const nationalContributionsToEOSCDashboardRoutes: Routes = [
  {
    path: '',
    component: NationalContributionsToEOSCDashboardComponent,
    canActivate: [NationalContributionsToEOSCGuardService],
    children: [
      {
        path: '',
        redirectTo: 'policies',
        pathMatch: 'full',
      },
      {
        path: 'policies',
        component: NCTEPoliciesComponent,
      },
      {
        path: 'funding',
        component: NCTEFundingComponent,
      },
      {
        path: 'resourcesAndSupport',
        component: NCTEResourcesAndSupportComponent,
      },
      // {
      //   path: 'miscellaneous',
      //   component: MiscellaneousComponent,
      // }
    ],
    runGuardsAndResolvers: 'always'
  }
];

@NgModule({
  imports: [RouterModule.forChild(nationalContributionsToEOSCDashboardRoutes)],
  exports: [RouterModule]
})

export class NationalContributionsToEOSCDashboardRouting {}
