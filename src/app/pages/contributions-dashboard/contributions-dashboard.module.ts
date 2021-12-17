import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContributionsDashboardComponent } from "./contributions-dashboard.component";
import { ContributionsDashboardRoutingModule } from "./contributions-dashboard-routing.module";
import { ReusableComponentsModule } from "../../shared/reusablecomponents/reusable-components.module";
import { ContributionsHomeComponent } from "./home/contributions-home.component";
import { MySurveysComponent } from "./my-surveys/my-surveys.component";
import { MyGroupComponent } from "./my-group/my-group.component";
import {SurveyCardComponent} from "./my-surveys/survey-card/survey-card.component";
import {FormsModule} from "@angular/forms";
import {CoordinatorsComponent} from "./coordinators/coordinators.component";

@NgModule ({
  imports: [
    CommonModule,
    ContributionsDashboardRoutingModule,
    ReusableComponentsModule,
    FormsModule,
  ],
  declarations: [
    ContributionsHomeComponent,
    MySurveysComponent,
    MyGroupComponent,
    SurveyCardComponent,
    CoordinatorsComponent
  ],
  providers: [],
})

export class ContributionsDashboardModule {}
