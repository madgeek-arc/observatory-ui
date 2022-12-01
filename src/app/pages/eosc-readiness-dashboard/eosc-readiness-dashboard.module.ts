import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReusableComponentsModule} from "../../../survey-tool/app/shared/reusablecomponents/reusable-components.module";
import {EoscReadinessDashboardRouting} from "./eosc-readiness-dashboard.routing";
import {EoscReadinessDashboardComponent} from "./eosc-readiness-dashboard.component";
import {HighchartsChartModule} from "highcharts-angular";
import {DataService} from "../../../survey-tool/app/services/data.service";
import {DataHandlerService} from "../../../survey-tool/app/services/data-handler.service";
import {StakeholdersService} from "../../../survey-tool/app/services/stakeholders.service";
import {PoliciesComponent} from "./policies/policies.component";
import {PracticesComponent} from "./practices/practices.component";
import {ArchiveModule} from "../archive/archive.module";
import {InvestmentsComponent} from "./investments/investments.component";

@NgModule({
  declarations: [
    EoscReadinessDashboardComponent,
    PoliciesComponent,
    PracticesComponent,
    InvestmentsComponent
  ],
  imports: [
    CommonModule,
    ReusableComponentsModule,
    EoscReadinessDashboardRouting,
    HighchartsChartModule,
    ArchiveModule
  ],
  providers: [
    DataService,
    DataHandlerService,
    StakeholdersService
  ],
})

export class EoscReadinessDashboardModule {}
