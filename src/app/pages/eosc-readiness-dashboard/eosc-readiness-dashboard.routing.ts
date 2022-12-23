import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {EoscReadinessDashboardComponent} from "./eosc-readiness-dashboard.component";
import {EoscReadinessGuardService} from "../services/eosc-readiness-guard.service";
import {PoliciesComponent} from "./policies/policies.component";
import {PracticesComponent} from "./practices/practices.component";
import {InvestmentsComponent} from "./investments/investments.component";

const nationalContributionsToEOSCDashboardRoutes: Routes = [
  {
    path: '',
    component: EoscReadinessDashboardComponent,
    children: [
      {
        path: '',
        redirectTo: 'policies',
        pathMatch: 'full',
      },
      {
        path: 'policies',
        component: PoliciesComponent,
      },
      {
        path: 'practices',
        component: PracticesComponent,
      },
      {
        path: 'investments',
        component: InvestmentsComponent,
        canActivate: [EoscReadinessGuardService]
      }
    ],
    runGuardsAndResolvers: 'always'
  }
];

@NgModule({
  imports: [RouterModule.forChild(nationalContributionsToEOSCDashboardRoutes)],
  exports: [RouterModule],
  providers: [EoscReadinessGuardService]
})

export class EoscReadinessDashboardRouting {}
