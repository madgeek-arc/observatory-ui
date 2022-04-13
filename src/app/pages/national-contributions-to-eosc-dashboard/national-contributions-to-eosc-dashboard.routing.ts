import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {NationalContributionsToEOSCDashboardComponent} from "./national-contributions-to-eosc-dashboard.component";
import {NCTEPoliciesComponent} from "./policies/ncte-policies.component";
import {NCTEFundingComponent} from "./funding/ncte-funding.component";

const nationalContributionsToEOSCDashboardRoutes: Routes = [
  {
    path: '',
    component: NationalContributionsToEOSCDashboardComponent,
    // data: {
    //   breadcrumb: 'Service'
    // },
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
      // {
      //   path: 'resourcesAndSupport',
      //   component: ResourcesAndSupportComponent,
      // },
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
