import { NgModule } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ReusableComponentsModule } from "../../../survey-tool/app/shared/reusablecomponents/reusable-components.module";
import { DataService } from "../services/data.service";
import { DataHandlerService } from "../services/data-handler.service";
import { StakeholdersService } from "../../../survey-tool/app/services/stakeholders.service";
import { EoscReadinessDataService } from "../services/eosc-readiness-data.service";
import { ExploreRouting } from "./explore.routing";
import { CustomSearchComponent } from "./custom-search/custom-search.component";
import { OpenScienceByCountryComponent } from "./open-science-by-country/open-science-by-country.component";
import { OpenScienceImpactComponent } from "./open-science-impact/open-science-impact.component";
import { OpenScienceResourceRegistryComponent } from "./open-science-resource-registry/open-science-resource-registry.component";
import { OpenScienceTrendsComponent } from "./open-science-trends/open-science-trends.component";
import { OpenScienceUseCasesComponent } from "./open-science-use-cases/open-science-use-cases.component";
import { ExploreService } from "./explore.service";
import { ChartsModule } from "../../shared/charts/charts.module";
import {SidebarMobileToggleComponent} from "../../shared/toggle/sidebar-mobile-toggle.component";

@NgModule({
  declarations: [
    CustomSearchComponent,
    OpenScienceByCountryComponent,
    OpenScienceImpactComponent,
    OpenScienceResourceRegistryComponent,
    OpenScienceTrendsComponent,
    OpenScienceUseCasesComponent
  ],
    imports: [
        CommonModule,
        ReusableComponentsModule,
        ExploreRouting,
        ChartsModule,
        NgOptimizedImage,
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
