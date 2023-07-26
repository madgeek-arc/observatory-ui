import {NgModule} from '@angular/core';
import {ExtraOptions, RouterModule, Routes} from '@angular/router';
import {HomeComponent} from "./pages/home/home.component";

const routerOptions: ExtraOptions = {
  scrollPositionRestoration: "enabled",
  anchorScrolling: "enabled",
  // scrollOffset: [0, 64],
  // enableTracing: true
};

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home'
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'eoscreadiness',
    loadChildren: () => import('./pages/eosc-readiness-dashboard/eosc-readiness-dashboard.module').then(m => m.EoscReadinessDashboardModule),
  },
  {
    path: 'archive',
    loadChildren: () => import('./pages/archive/archive.module').then(m => m.ArchiveModule)
  },
  {
    path: 'contributions/:id',
    loadChildren: () => import('../messaging-system-ui/app/messaging-system.module').then(m => m.MessagingSystemModule),
  },
  {
    path: '',
    loadChildren: () => import('../survey-tool/app/survey-tool.module').then(m => m.SurveyToolModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, routerOptions)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
