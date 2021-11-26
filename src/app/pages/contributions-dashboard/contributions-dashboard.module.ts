import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContributionsDashboardComponent } from "./contributions-dashboard.component";
import { ContributionsDashboardRoutingModule } from "./contributions-dashboard-routing.module";
import { ReusableComponentsModule } from "../../shared/reusablecomponents/reusable-components.module";
import { ContributionsHomeComponent } from "./home/contributions-home.component";
import { MySurveysComponent } from "./my-surveys/my-surveys.component";
import { MyGroupComponent } from "./my-group/my-group.component";

@NgModule ({
  imports: [
    CommonModule,
    // TabsModule.forRoot(),
    // FormsModule,
    // ReactiveFormsModule,
    // // SourcesRouting,
    ContributionsDashboardRoutingModule,
    ReusableComponentsModule,
    // SourcesModule
  ],
  declarations: [
    ContributionsHomeComponent,
    MySurveysComponent,
    MyGroupComponent
    // ContributionsDashboardComponent,
  ],
  providers: [
    // SharedService
  ],
})

export class ContributionsDashboardModule {}
