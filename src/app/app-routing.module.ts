import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {HomeComponent} from "./pages/home.component";
import {SurveyFormComponent} from "./pages/contributions-dashboard/my-surveys/survey-form/survey-form.component";

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
    path: 'contributions',
    loadChildren: () => import('./pages/contributions-dashboard/contributions-dashboard.module').then(m => m.ContributionsDashboardModule),
    // canActivate: [AuthGuardService]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
