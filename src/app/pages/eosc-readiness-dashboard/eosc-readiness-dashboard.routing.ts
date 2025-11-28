import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { EoscReadiness2021DashboardComponent } from "./eosc-readiness-2021/eosc-readiness-2021-dashboard.component";
import { Policies2021Component } from "./eosc-readiness-2021/policies/policies-2021.component";
import { Practices2021Component } from "./eosc-readiness-2021/practices/practices-2021.component";
import { Investments2021Component } from "./eosc-readiness-2021/investments/investments-2021.component";
import { PoliciesComponent } from "./eosc-readiness-dynamic/policies/policies.component";
import { PracticesComponent } from "./eosc-readiness-dynamic/practices/practices.component";
import { NationalPolicyComponent } from "./eosc-readiness-dynamic/policies/national-policy/national-policy.component";
import {
  FinancialStrategyComponent
} from "./eosc-readiness-dynamic/policies/financial-strategy/financial-strategy.component";
import { RPOsComponent } from "./eosc-readiness-dynamic/policies/RPOs/RPOs.component";
import { RFOsComponent } from "./eosc-readiness-dynamic/policies/RFOs/RFOs.component";
import {
  NationalMonitoringComponent
} from "./eosc-readiness-dynamic/practices/national-monitoring/national-monitoring.component";
import { UseCasesComponent } from "./eosc-readiness-dynamic/practices/use-cases/use-cases.component";
import {
  FinancialInvestmentsComponent
} from "./eosc-readiness-dynamic/practices/investments/financial-investments.component";
import { OutputsComponent } from "./eosc-readiness-dynamic/practices/outputs/outputs.component";
import {
  NationalPolicySubcategoriesComponent
} from "./eosc-readiness-dynamic/policies/national-policy/subcategories/national-policy-subcategories.component";
import {
  FinancialStrategySubcategoriesComponent
} from "./eosc-readiness-dynamic/policies/financial-strategy/subcategories/financial-strategy-subcategories.component";
import {
  RFOsSubcategoriesComponent
} from "./eosc-readiness-dynamic/policies/RFOs/subcategories/RFOs-subcategories.component";
import {
  RPOsSubcategoriesComponent
} from "./eosc-readiness-dynamic/policies/RPOs/subcategories/RPOs-subcategories.component";
import {
  FinancialInvestmentsSubcategoriesComponent
} from "./eosc-readiness-dynamic/practices/investments/subcategories/financial-investments-subcategories.component";
import {
  NationalMonitoringSubcategoriesComponent
} from "./eosc-readiness-dynamic/practices/national-monitoring/subcategories/national-monitoring-subcategories.component";
import {
  UseCasesSubcategoriesComponent
} from "./eosc-readiness-dynamic/practices/use-cases/subcategories/use-cases-subcategories.component";
import {
  OutputsSubcategoriesComponent
} from "./eosc-readiness-dynamic/practices/outputs/subcategories/outputs-subcategories.component";
import { GeneralComponent } from "./eosc-readiness-dynamic/general/general.component";
import { GlossaryComponent } from "./eosc-readiness-dynamic/glossary/glossary.component";
import { EoscReadinessGuard } from "../services/eosc-readiness-guard.service";
import { EoscReadinessDashboardComponent } from "./eosc-readiness-dynamic/eosc-readiness-dashboard.component";

const nationalContributionsToEOSCDashboardRoutes: Routes = [
  {
    path: '',
    redirectTo: '2024',
    pathMatch: 'full'
  },
  {
    path: '2021',
    component: EoscReadiness2021DashboardComponent,
    children: [
      {
        path: '',
        redirectTo: 'policies',
        pathMatch: 'full',
      },
      {
        path: 'policies',
        component: Policies2021Component,
      },
      {
        path: 'practices',
        component: Practices2021Component,
      },
      {
        path: 'investments',
        component: Investments2021Component,
        canActivate: [EoscReadinessGuard]
      },
    ],
    runGuardsAndResolvers: 'always'
  },
  {
    path: ':year',
    component: EoscReadinessDashboardComponent,
    children: [
      {
        path: '',
        redirectTo: 'general/researchers',
        pathMatch: 'full',
      },
      {
        path: 'general/:type',
        component: GeneralComponent
      },
      {
        path: 'policies',
        component: PoliciesComponent,
        children: [
          {
            path: 'nationalPolicy/:type',
            component: NationalPolicyComponent,
            children: [
              {
                path: ':dataType',
                component: NationalPolicySubcategoriesComponent,
              }
            ]
          },
          {
            path: 'financialStrategy/:type',
            component: FinancialStrategyComponent,
            children: [
              {
                path: ':dataType',
                component: FinancialStrategySubcategoriesComponent,
              }
            ]
          },
          {
            path: 'RPOs/:type',
            component: RPOsComponent,
            children: [
              {
                path: ':dataType',
                component: RPOsSubcategoriesComponent,
              }
            ]
          },
          {
            path: 'RFOs/:type',
            component: RFOsComponent,
            children: [
              {
                path: ':dataType',
                component: RFOsSubcategoriesComponent,
              }
            ]
          }
        ]
      },
      {
        path: 'practices',
        component: PracticesComponent,
        children: [
          {
            path: 'nationalMonitoring/:type',
            component: NationalMonitoringComponent,
            children: [
              {
                path: ':dataType',
                component: NationalMonitoringSubcategoriesComponent,
              }
            ]
          },
          {
            path: 'useCases/:type',
            component: UseCasesComponent,
            children: [
              {
                path: ':dataType',
                component: UseCasesSubcategoriesComponent,
              }
            ]
          },
          {
            path: 'investments/:type',
            component: FinancialInvestmentsComponent,
            children: [
              {
                path: ':dataType',
                component: FinancialInvestmentsSubcategoriesComponent,
              }
            ]
          },
          {
            path: 'outputs/:type',
            component: OutputsComponent,
            children: [
              {
                path: ':dataType',
                component: OutputsSubcategoriesComponent,
              }
            ]
          }
        ]
      },
      {
        path: 'glossary',
        component: GlossaryComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(nationalContributionsToEOSCDashboardRoutes)],
  exports: [RouterModule],
  providers: []
})

export class EoscReadinessDashboardRouting {}
