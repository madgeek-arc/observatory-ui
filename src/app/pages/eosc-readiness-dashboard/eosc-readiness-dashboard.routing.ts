import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {EoscReadinessDashboardComponent} from "./eosc-readiness-2021/eosc-readiness-dashboard.component";
import {EoscReadinessGuardService} from "../services/eosc-readiness-guard.service";
import {PoliciesComponent} from "./eosc-readiness-2021/policies/policies.component";
import {PracticesComponent} from "./eosc-readiness-2021/practices/practices.component";
import {InvestmentsComponent} from "./eosc-readiness-2021/investments/investments.component";
import {EoscReadinessDashboard2022Component} from "./eosc-readiness-2022/eosc-readiness-dashboard2022.component";
import {DataTypeComponent} from "./eosc-readiness-2022/dataComponent/dataType.component";
import {Policies2022Component} from "./eosc-readiness-2022/policies/policies2022.component";
import {Practices2022Component} from "./eosc-readiness-2022/practices/practices2022.component";
import {NationalPolicyComponent} from "./eosc-readiness-2022/policies/national-policy/national-policy.component";
import {
  FinancialStrategyComponent
} from "./eosc-readiness-2022/policies/financial-strategy/financial-strategy.component";

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
        path: 'policies',
        component: Policies2022Component,
        children: [
          {
            path: 'nationalPolicy/:type',
            component: NationalPolicyComponent,
            children: [
              {
                path: ':dataType',
                component: DataTypeComponent,
              }
            ]
          },
          {
            path: 'financialStrategy/:type',
            component: FinancialStrategyComponent,
            children: [
              {
                path: ':dataType',
                component: DataTypeComponent,
              }
            ]
          },
          {
            path: 'RPOs/:type',
            component: NationalPolicyComponent,
            children: [
              {
                path: ':dataType',
                component: DataTypeComponent,
              }
            ]
          },
          {
            path: 'RFOs/:type',
            component: NationalPolicyComponent,
            children: [
              {
                path: ':dataType',
                component: DataTypeComponent,
              }
            ]
          }
        ]
      },
      {
        path: 'practices',
        component: Practices2022Component,
        children: [
          {
            path: 'nationalMonitoring',
            component: NationalPolicyComponent,
            children: [
              {
                path: ':dataType',
                component: DataTypeComponent,
              }
            ]
          },
          {
            path: 'useCases',
            component: NationalPolicyComponent,
            children: [
              {
                path: ':dataType',
                component: DataTypeComponent,
              }
            ]
          },
          {
            path: 'financialInvestment',
            component: NationalPolicyComponent,
            children: [
              {
                path: ':dataType',
                component: DataTypeComponent,
              }
            ]
          },
          {
            path: 'published',
            component: NationalPolicyComponent,
            children: [
              {
                path: ':dataType',
                component: DataTypeComponent,
              }
            ]
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
