import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReusableComponentsModule} from "../../../survey-tool/app/shared/reusablecomponents/reusable-components.module";
import {EoscReadinessDashboardRouting} from "./eosc-readiness-dashboard.routing";
import {EoscReadinessDashboardComponent} from "./eosc-readiness-dashboard.component";
import {HighchartsChartModule} from "highcharts-angular";
import {DataService} from "../services/data.service";
import {DataHandlerService} from "../services/data-handler.service";
import {StakeholdersService} from "../../../survey-tool/app/services/stakeholders.service";
import {PoliciesComponent} from "./policies/policies.component";
import {PracticesComponent} from "./practices/practices.component";
import {ArchiveModule} from "../archive/archive.module";
import {InvestmentsComponent} from "./investments/investments.component";
import {EoscReadinessDashboard2022Component} from "./eosc-readiness-2022/eosc-readiness-dashboard2022.component";
import {NationalPolicyComponent} from "./eosc-readiness-2022/policies/national-policy.component";
import {DataTypeComponent} from "./eosc-readiness-2022/dataComponent/dataType.component";
import {Practices2022Component} from "./eosc-readiness-2022/practices/practices2022.component";

@NgModule({
  declarations: [
    EoscReadinessDashboardComponent,
    PoliciesComponent,
    PracticesComponent,
    InvestmentsComponent,
    EoscReadinessDashboard2022Component,
    NationalPolicyComponent,
    Practices2022Component,
    DataTypeComponent
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
