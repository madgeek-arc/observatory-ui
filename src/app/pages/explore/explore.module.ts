import { NgModule } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import {
  ReusableComponentsModule
} from "../../../survey-tool/app/shared/reusablecomponents/reusable-components.module";
import { DataService } from "../services/data.service";
import { DataHandlerService } from "../services/data-handler.service";
import { StakeholdersService } from "../../../survey-tool/app/services/stakeholders.service";
import { EoscReadinessDataService } from "../services/eosc-readiness-data.service";
import { ExploreRouting } from "./explore.routing";
import { CustomSearchComponent } from "./custom-search/custom-search.component";
import { OpenScienceImpactComponent } from "./open-science-impact/open-science-impact.component";
import { OpenScienceUseCasesComponent } from "./open-science-use-cases/open-science-use-cases.component";
import { ExploreService } from "./explore.service";
import { ChartsModule } from "../../shared/charts/charts.module";
import { PageContentComponent } from "../../../survey-tool/app/shared/page-content/page-content.component";
import {
  SidebarMobileToggleComponent
} from "../../../survey-tool/app/shared/dashboard-side-menu/mobile-toggle/sidebar-mobile-toggle.component";


@NgModule({
  declarations: [
    CustomSearchComponent,
    OpenScienceImpactComponent,
    OpenScienceUseCasesComponent,
  ],
  imports: [
    CommonModule,
    ReusableComponentsModule,
    ExploreRouting,
    ChartsModule,
    NgOptimizedImage,
    PageContentComponent,
    SidebarMobileToggleComponent,
  ],
  providers: [
    DataService,
    EoscReadinessDataService,
    DataHandlerService,
    StakeholdersService,
    ExploreService
  ],
})

export class ExploreModule {}
