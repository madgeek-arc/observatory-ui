import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { EoscReadinessDashboardComponent2021 } from "./eosc-readiness-2021/eosc-readiness-dashboard.component2021";
import { PoliciesComponent } from "./eosc-readiness-2021/policies/policies.component";
import { PracticesComponent } from "./eosc-readiness-2021/practices/practices.component";
import { InvestmentsComponent } from "./eosc-readiness-2021/investments/investments.component";
import { EoscReadinessDashboard2022Component } from "./eosc-readiness-2022/eosc-readiness-dashboard2022.component";
import { Policies2022Component } from "./eosc-readiness-2022/policies/policies2022.component";
import { Practices2022Component } from "./eosc-readiness-2022/practices/practices2022.component";
import { NationalPolicyComponent } from "./eosc-readiness-2022/policies/national-policy/national-policy.component";
import {
  FinancialStrategyComponent
} from "./eosc-readiness-2022/policies/financial-strategy/financial-strategy.component";
import { RPOsComponent } from "./eosc-readiness-2022/policies/RPOs/RPOs.component";
import { RFOsComponent } from "./eosc-readiness-2022/policies/RFOs/RFOs.component";
import {
  NationalMonitoringComponent
} from "./eosc-readiness-2022/practices/national-monitoring/national-monitoring.component";
import { UseCasesComponent } from "./eosc-readiness-2022/practices/use-cases/use-cases.component";
import {
  FinancialInvestmentsComponent
} from "./eosc-readiness-2022/practices/investments/financial-investments.component";
import { OutputsComponent } from "./eosc-readiness-2022/practices/outputs/outputs.component";
import {
  NationalPolicySubcategoriesComponent
} from "./eosc-readiness-2022/policies/national-policy/subcategories/national-policy-subcategories.component";
import {
  FinancialStrategySubcategoriesComponent
} from "./eosc-readiness-2022/policies/financial-strategy/subcategories/financial-strategy-subcategories.component";
import {
  RFOsSubcategoriesComponent
} from "./eosc-readiness-2022/policies/RFOs/subcategories/RFOs-subcategories.component";
import {
  RPOsSubcategoriesComponent
} from "./eosc-readiness-2022/policies/RPOs/subcategories/RPOs-subcategories.component";
import {
  FinancialInvestmentsSubcategoriesComponent
} from "./eosc-readiness-2022/practices/investments/subcategories/financial-investments-subcategories.component";
import {
  NationalMonitoringSubcategoriesComponent
} from "./eosc-readiness-2022/practices/national-monitoring/subcategories/national-monitoring-subcategories.component";
import {
  UseCasesSubcategoriesComponent
} from "./eosc-readiness-2022/practices/use-cases/subcategories/use-cases-subcategories.component";
import {
  OutputsSubcategoriesComponent
} from "./eosc-readiness-2022/practices/outputs/subcategories/outputs-subcategories.component";
import { General2022Component } from "./eosc-readiness-2022/general/general2022.component";
import { Glossary2022Component } from "./eosc-readiness-2022/glossary/glossary-2022.component";
import { EoscReadinessGuard } from "../services/eosc-readiness-guard.service";
import { EoscReadinessDashboardComponent } from "./eosc-readiness-dynamic/eosc-readiness-dashboard.component";
import { DemoChartsComponent } from "./eosc-readiness-dynamic/demo/demo-charts.component";

const nationalContributionsToEOSCDashboardRoutes: Routes = [
  {
    path: '',
    redirectTo: '2023',
    pathMatch: 'full'
  },
  {
    path: 'demo',
    component: DemoChartsComponent
  },
  {
    path: '2021',
    component: EoscReadinessDashboardComponent2021,
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
        canActivate: [EoscReadinessGuard]
      },
    ],
    runGuardsAndResolvers: 'always'
  },
  // {
  //   path: '2022',
  //   component: EoscReadinessDashboard2022Component,
  //   // canActivateChild: [ArchiveGuardService],
  //   children: [
  //     {
  //       path: '',
  //       redirectTo: 'general/researchers',
  //       pathMatch: 'full',
  //     },
  //     {
  //       path: 'general/:type',
  //       component: General2022Component
  //     },
  //     {
  //       path: 'policies',
  //       component: Policies2022Component,
  //       children: [
  //         {
  //           path: 'nationalPolicy/:type',
  //           component: NationalPolicyComponent,
  //           children: [
  //             {
  //               path: ':dataType',
  //               component: NationalPolicySubcategoriesComponent,
  //             }
  //           ]
  //         },
  //         {
  //           path: 'financialStrategy/:type',
  //           component: FinancialStrategyComponent,
  //           children: [
  //             {
  //               path: ':dataType',
  //               component: FinancialStrategySubcategoriesComponent,
  //             }
  //           ]
  //         },
  //         {
  //           path: 'RPOs/:type',
  //           component: RPOsComponent,
  //           children: [
  //             {
  //               path: ':dataType',
  //               component: RPOsSubcategoriesComponent,
  //             }
  //           ]
  //         },
  //         {
  //           path: 'RFOs/:type',
  //           component: RFOsComponent,
  //           children: [
  //             {
  //               path: ':dataType',
  //               component: RFOsSubcategoriesComponent,
  //             }
  //           ]
  //         }
  //       ]
  //     },
  //     {
  //       path: 'practices',
  //       component: Practices2022Component,
  //       children: [
  //         {
  //           path: 'nationalMonitoring/:type',
  //           component: NationalMonitoringComponent,
  //           children: [
  //             {
  //               path: ':dataType',
  //               component: NationalMonitoringSubcategoriesComponent,
  //             }
  //           ]
  //         },
  //         {
  //           path: 'useCases/:type',
  //           component: UseCasesComponent,
  //           children: [
  //             {
  //               path: ':dataType',
  //               component: UseCasesSubcategoriesComponent,
  //             }
  //           ]
  //         },
  //         {
  //           path: 'investments/:type',
  //           component: FinancialInvestmentsComponent,
  //           children: [
  //             {
  //               path: ':dataType',
  //               component: FinancialInvestmentsSubcategoriesComponent,
  //             }
  //           ]
  //         },
  //         {
  //           path: 'outputs/:type',
  //           component: OutputsComponent,
  //           children: [
  //             {
  //               path: ':dataType',
  //               component: OutputsSubcategoriesComponent,
  //             }
  //           ]
  //         }
  //       ]
  //     },
  //     {
  //       path: 'glossary',
  //       component: Glossary2022Component
  //     }
  //   ]
  // },
  {
    path: ':year',
    component: EoscReadinessDashboardComponent,
    // canActivateChild: [EoscReadinessGuard],
    children: [
      {
        path: '',
        redirectTo: 'general/researchers',
        pathMatch: 'full',
      },
      {
        path: 'general/:type',
        component: General2022Component
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
        component: Practices2022Component,
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
        component: Glossary2022Component
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
