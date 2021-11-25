import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContributionsDashboardComponent } from "./contributions-dashboard.component";
import { ContributionsDashboardRoutingModule } from "./contributions-dashboard-routing.module";
import { ReusableComponentsModule } from "../../shared/reusablecomponents/reusable-components.module";

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
    // ContributionsDashboardComponent,
  ],
  providers: [
    // SharedService
  ],
})

export class ContributionsDashboardModule {}
