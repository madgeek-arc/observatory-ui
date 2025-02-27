import { NgModule } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { OpenScienceByAreaComponent } from "./open-science-by-area.component";
import { ReusableComponentsModule } from "../../../../survey-tool/app/shared/reusablecomponents/reusable-components.module";
import { OpenScienceByAreaRouting } from "./open-science-by-area.routing";
import { HighchartsChartModule } from "highcharts-angular";
import { DataService } from "../../services/data.service";
import { EoscReadinessDataService } from "../../services/eosc-readiness-data.service";
import { DataHandlerService } from "../../services/data-handler.service";
import { StakeholdersService } from "../../../../survey-tool/app/services/stakeholders.service";
import { OpenScienceByAreaPublicationsComponent } from "./areas/open-science-by-area-publications.component";
import { OpenScienceByAreaOpenDataComponent } from "./areas/open-science-by-area-open-data.component";
import { OpenScienceByAreaFairDataComponent } from "./areas/open-science-by-area-fair-data.component";
import { OpenScienceByAreaDataManagementComponent } from "./areas/open-science-by-area-data-management.component";
import { OpenScienceByAreaCitizenScienceComponent } from "./areas/open-science-by-area-citizen-science.component";
import { OpenScienceByAreaRepositoriesComponent } from "./areas/open-science-by-area-repositories.component";
import { OpenScienceByAreaTrainingComponent } from "./areas/open-science-by-area-training.component";
import { OpenScienceByAreaSoftwareComponent } from "./areas/open-science-by-area-software.component";

@NgModule({
  declarations: [
    OpenScienceByAreaComponent,
    OpenScienceByAreaPublicationsComponent,
    OpenScienceByAreaOpenDataComponent,
    OpenScienceByAreaFairDataComponent,
    OpenScienceByAreaDataManagementComponent,
    OpenScienceByAreaCitizenScienceComponent,
    OpenScienceByAreaRepositoriesComponent,
    OpenScienceByAreaTrainingComponent,
    OpenScienceByAreaSoftwareComponent
  ],
  imports: [
    CommonModule,
    ReusableComponentsModule,
    OpenScienceByAreaRouting,
    HighchartsChartModule,
    NgOptimizedImage,
  ],
  providers: [
    DataService,
    EoscReadinessDataService,
    DataHandlerService,
    StakeholdersService
  ],
})

export class OpenScienceByAreaModule {}
