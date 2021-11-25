import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { ContributionsDashboardComponent } from "./contributions-dashboard.component";
import { SurveyFormComponent } from "../survey-form/survey-form.component";

const contributionsDashboardRoutes: Routes = [
  {
    path: '',
    // component: ContributionsDashboardComponent,
    // redirectTo: '/403-forbidden',
    children: [
      {
        path: 'survey',
        component: SurveyFormComponent,
      }
    ]
  }
];

@NgModule ({
  imports: [RouterModule.forChild(contributionsDashboardRoutes)],
  exports: [RouterModule]
})

export class ContributionsDashboardRoutingModule {}
