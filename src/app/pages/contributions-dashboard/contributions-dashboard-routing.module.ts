import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { ContributionsDashboardComponent } from "./contributions-dashboard.component";
import { SurveyFormComponent } from "../survey-form/survey-form.component";
import { ContributionsHomeComponent } from "./home/contributions-home.component";
import { MySurveysComponent } from "./my-surveys/my-surveys.component";
import { MyGroupComponent } from "./my-group/my-group.component";

const contributionsDashboardRoutes: Routes = [
  {
    path: '',
    // component: ContributionsDashboardComponent,
    // redirectTo: '/403-forbidden',
    children: [
      {
        path: 'home',
        component: ContributionsHomeComponent,
      },
      {
        path: 'surveys',
        component: MySurveysComponent,
      },
      {
        path: 'surveys/id',
        component: SurveyFormComponent,
      },
      {
        path: 'group',
        component: MyGroupComponent,
      }
    ]
  }
];

@NgModule ({
  imports: [RouterModule.forChild(contributionsDashboardRoutes)],
  exports: [RouterModule]
})

export class ContributionsDashboardRoutingModule {}
