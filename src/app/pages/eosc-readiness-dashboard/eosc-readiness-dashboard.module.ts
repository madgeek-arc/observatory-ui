import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReusableComponentsModule} from "../../../survey-tool/app/shared/reusablecomponents/reusable-components.module";
import {EoscReadinessDashboardRouting} from "./eosc-readiness-dashboard.routing";
import {EoscReadinessDashboardComponent} from "./eosc-readiness-2021/eosc-readiness-dashboard.component";
import {HighchartsChartModule} from "highcharts-angular";
import {DataService} from "../services/data.service";
import {DataHandlerService} from "../services/data-handler.service";
import {StakeholdersService} from "../../../survey-tool/app/services/stakeholders.service";
import {PoliciesComponent} from "./eosc-readiness-2021/policies/policies.component";
import {PracticesComponent} from "./eosc-readiness-2021/practices/practices.component";
import {ArchiveModule} from "../archive/archive.module";
import {InvestmentsComponent} from "./eosc-readiness-2021/investments/investments.component";
import {EoscReadinessDashboard2022Component} from "./eosc-readiness-2022/eosc-readiness-dashboard2022.component";
import {Policies2022Component} from "./eosc-readiness-2022/policies/policies2022.component";
import {DataTypeComponent} from "./eosc-readiness-2022/dataComponent/dataType.component";
import {Practices2022Component} from "./eosc-readiness-2022/practices/practices2022.component";
import {EoscReadiness2022DataService} from "../services/eosc-readiness2022-data.service";
import {NationalPolicyComponent} from "./eosc-readiness-2022/policies/national-policy/national-policy.component";
import {FinancialStrategyComponent} from "./eosc-readiness-2022/policies/financial-strategy/financial-strategy.component";
import {RPOsComponent} from "./eosc-readiness-2022/policies/RPOs/RPOs.component";

@NgModule({
  declarations: [
    EoscReadinessDashboardComponent,
    PoliciesComponent,
    PracticesComponent,
    InvestmentsComponent,
    EoscReadinessDashboard2022Component,
    Policies2022Component,
    Practices2022Component,
    NationalPolicyComponent,
    FinancialStrategyComponent,
    RPOsComponent,
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
    EoscReadiness2022DataService,
    DataHandlerService,
    StakeholdersService
  ],
})

export class EoscReadinessDashboardModule {}
