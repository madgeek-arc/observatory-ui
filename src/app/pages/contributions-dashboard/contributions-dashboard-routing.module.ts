import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { ContributionsDashboardComponent } from "./contributions-dashboard.component";
import { SurveyFormComponent } from "./my-surveys/survey-form/survey-form.component";
import { ContributionsHomeComponent } from "./home/contributions-home.component";
import { MySurveysComponent } from "./my-surveys/my-surveys.component";
import { MyGroupComponent } from "./my-group/my-group.component";
import {AuthenticationGuardService} from "../../services/authentication-guard.service";

const contributionsDashboardRoutes: Routes = [
  {
    path: '',
    // component: ContributionsDashboardComponent,
    // redirectTo: '/403-forbidden',
    children: [
      {
        path: '',
        redirectTo: 'home'
      },
      {
        path: 'home',
        component: ContributionsHomeComponent,
        canActivate: [AuthenticationGuardService]
      },
      {
        path: 'surveys',
        component: MySurveysComponent,
        canActivate: [AuthenticationGuardService]
      },
      {
        path: 'surveys/:surveyId/answer/:answerId',
        component: SurveyFormComponent,
        canActivate: [AuthenticationGuardService]
      },
      {
        path: 'surveys/:surveyId/answer/:answerId/view',
        component: SurveyFormComponent,
        canActivate: [AuthenticationGuardService]
      },
      {
        path: 'group',
        component: MyGroupComponent,
        canActivate: [AuthenticationGuardService]
      }
    ]
  }
];

@NgModule ({
  imports: [RouterModule.forChild(contributionsDashboardRoutes)],
  exports: [RouterModule]
})

export class ContributionsDashboardRoutingModule {}
