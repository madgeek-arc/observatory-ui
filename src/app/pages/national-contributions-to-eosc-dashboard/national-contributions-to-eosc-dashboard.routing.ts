import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {NationalContributionsToEOSCDashboardComponent} from "./national-contributions-to-eosc-dashboard.component";
import {NationalContributionsToEOSCGuardService} from "../../services/nationalContributionsToEOSC-guard.service";
import {PoliciesComponent} from "./policies/policies.component";
import {PracticesComponent} from "./practices/practices.component";

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
        component: PoliciesComponent,
      },
      {
        path: 'practices',
        component: PracticesComponent,
      },
      {
        path: 'archive',
        loadChildren: () => import('./archive/archive.module').then(m => m.ArchiveModule)
      }
    ],
    runGuardsAndResolvers: 'always'
  }
];

@NgModule({
  imports: [RouterModule.forChild(nationalContributionsToEOSCDashboardRoutes)],
  exports: [RouterModule]
})

export class NationalContributionsToEOSCDashboardRouting {}
