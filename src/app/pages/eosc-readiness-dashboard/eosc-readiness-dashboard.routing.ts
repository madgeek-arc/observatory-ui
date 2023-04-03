import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {EoscReadinessDashboardComponent} from "./eosc-readiness-dashboard.component";
import {EoscReadinessGuardService} from "../services/eosc-readiness-guard.service";
import {PoliciesComponent} from "./policies/policies.component";
import {PracticesComponent} from "./practices/practices.component";
import {InvestmentsComponent} from "./investments/investments.component";
import {EoscReadinessDashboard2022Component} from "./eosc-readiness-2022/eosc-readiness-dashboard2022.component";
import {DataTypeComponent} from "./eosc-readiness-2022/dataComponent/dataType.component";
import {NationalPolicyComponent} from "./eosc-readiness-2022/policies/national-policy.component";
import {Practices2022Component} from "./eosc-readiness-2022/practices/practices2022.component";

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
      },
    ],
    runGuardsAndResolvers: 'always'
  },
  {
    path: '2022',
    component: EoscReadinessDashboard2022Component,
    children: [
      {
        path: '',
        redirectTo: 'policies/nationalPolicy/publications',
        pathMatch: 'full',
      },
      {
        path: 'policies/:path/:type',
        component: NationalPolicyComponent,
        children: [
          {
            path: ':dataType',
            component: DataTypeComponent,
          }
        ]
      },
      {
        path: 'practices/:path',
        component: Practices2022Component,
        children: [
          {
            path: ':dataType',
            component: DataTypeComponent,
          }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(nationalContributionsToEOSCDashboardRoutes)],
  exports: [RouterModule],
  providers: [EoscReadinessGuardService]
})

export class EoscReadinessDashboardRouting {}
