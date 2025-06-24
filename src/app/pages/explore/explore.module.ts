import { NgModule } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ReusableComponentsModule } from "../../../survey-tool/app/shared/reusablecomponents/reusable-components.module";
import { HighchartsChartModule } from "highcharts-angular";
import { DataService } from "../services/data.service";
import { DataHandlerService } from "../services/data-handler.service";
import { StakeholdersService } from "../../../survey-tool/app/services/stakeholders.service";
import { EoscReadinessDataService } from "../services/eosc-readiness-data.service";
import { ExploreComponent } from "./explore.component";
import { ExploreRouting } from "./explore.routing";
import { CustomSearchComponent } from "./custom-search/custom-search.component";
import { OpenScienceByCountryComponent } from "./open-science-by-country/open-science-by-country.component";
import { OpenScienceImpactComponent } from "./open-science-impact/open-science-impact.component";
import { OpenScienceResourceRegistryComponent } from "./open-science-resource-registry/open-science-resource-registry.component";
import { OpenScienceTrendsComponent } from "./open-science-trends/open-science-trends.component";
import { OpenScienceUseCasesComponent } from "./open-science-use-cases/open-science-use-cases.component";
import { ExploreService } from "./explore.service";
import { SharedModule } from "../../shared/shared.module";
import { ChartsModule } from "../../shared/charts/charts.module";

@NgModule({
  declarations: [
    ExploreComponent,
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
