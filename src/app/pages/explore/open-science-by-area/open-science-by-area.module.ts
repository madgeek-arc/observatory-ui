import { NgModule } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ReusableComponentsModule } from "../../../../survey-tool/app/shared/reusablecomponents/reusable-components.module";
import { OpenScienceByAreaRouting } from "./open-science-by-area.routing";
import { HighchartsChartModule } from "highcharts-angular";
import { DataService } from "../../services/data.service";
import { EoscReadinessDataService } from "../../services/eosc-readiness-data.service";
import { DataHandlerService } from "../../services/data-handler.service";
import { StakeholdersService } from "../../../../survey-tool/app/services/stakeholders.service";
import { ChartsModule } from "../../../shared/charts/charts.module";

@NgModule({
  
  imports: [
    CommonModule,
    ReusableComponentsModule,
    OpenScienceByAreaRouting,
    HighchartsChartModule,
    ChartsModule,
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
