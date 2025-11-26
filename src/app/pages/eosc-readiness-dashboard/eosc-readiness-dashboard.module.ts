import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReusableComponentsModule } from "../../../survey-tool/app/shared/reusablecomponents/reusable-components.module";
import { EoscReadinessDashboardRouting } from "./eosc-readiness-dashboard.routing";
import { EoscReadinessDashboardComponent2021 } from "./eosc-readiness-2021/eosc-readiness-dashboard.component2021";
import { HighchartsChartModule } from "highcharts-angular";
import { DataService } from "../services/data.service";
import { DataHandlerService } from "../services/data-handler.service";
import { StakeholdersService } from "../../../survey-tool/app/services/stakeholders.service";
import { PoliciesComponent } from "./eosc-readiness-2021/policies/policies.component";
import { PracticesComponent } from "./eosc-readiness-2021/practices/practices.component";
import { ArchiveModule } from "../archive/archive.module";
import { InvestmentsComponent } from "./eosc-readiness-2021/investments/investments.component";
import { EoscReadinessDashboard2022Component } from "./eosc-readiness-2022/eosc-readiness-dashboard2022.component";
import { Policies2022Component } from "./eosc-readiness-2022/policies/policies2022.component";
import { Practices2022Component } from "./eosc-readiness-2022/practices/practices2022.component";
import { EoscReadinessDataService } from "../services/eosc-readiness-data.service";
import { NationalPolicyComponent } from "./eosc-readiness-2022/policies/national-policy/national-policy.component";
import { FinancialStrategyComponent } from "./eosc-readiness-2022/policies/financial-strategy/financial-strategy.component";
import { RPOsComponent } from "./eosc-readiness-2022/policies/RPOs/RPOs.component";
import { RFOsComponent } from "./eosc-readiness-2022/policies/RFOs/RFOs.component";
import { NationalMonitoringComponent } from "./eosc-readiness-2022/practices/national-monitoring/national-monitoring.component";
import { UseCasesComponent } from "./eosc-readiness-2022/practices/use-cases/use-cases.component";
import { FinancialInvestmentsComponent } from "./eosc-readiness-2022/practices/investments/financial-investments.component";
import { OutputsComponent } from "./eosc-readiness-2022/practices/outputs/outputs.component";
import { NationalPolicySubcategoriesComponent } from "./eosc-readiness-2022/policies/national-policy/subcategories/national-policy-subcategories.component";
import { FinancialStrategySubcategoriesComponent } from "./eosc-readiness-2022/policies/financial-strategy/subcategories/financial-strategy-subcategories.component";
import { RFOsSubcategoriesComponent } from "./eosc-readiness-2022/policies/RFOs/subcategories/RFOs-subcategories.component";
import { RPOsSubcategoriesComponent } from "./eosc-readiness-2022/policies/RPOs/subcategories/RPOs-subcategories.component";
import { FinancialInvestmentsSubcategoriesComponent } from "./eosc-readiness-2022/practices/investments/subcategories/financial-investments-subcategories.component";
import { NationalMonitoringSubcategoriesComponent } from "./eosc-readiness-2022/practices/national-monitoring/subcategories/national-monitoring-subcategories.component";
import { UseCasesSubcategoriesComponent } from "./eosc-readiness-2022/practices/use-cases/subcategories/use-cases-subcategories.component";
import { OutputsSubcategoriesComponent } from "./eosc-readiness-2022/practices/outputs/subcategories/outputs-subcategories.component";
import { General2022Component } from "./eosc-readiness-2022/general/general2022.component";
import { CumulativeDataTablesComponent } from "./eosc-readiness-2022/tables/cumulative-data-tables.component";
import { Glossary2022Component } from "./eosc-readiness-2022/glossary/glossary-2022.component";
import { EoscReadinessDashboardComponent } from "./eosc-readiness-dynamic/eosc-readiness-dashboard.component";
import { DemoChartsComponent } from "./eosc-readiness-dynamic/demo/demo-charts.component";
import { ChartsModule } from "../../shared/charts/charts.module";

@NgModule({
  declarations: [
    PoliciesComponent,
    PracticesComponent,
    InvestmentsComponent,
    EoscReadinessDashboard2022Component,
    Policies2022Component,
    Practices2022Component,
    General2022Component,
    Glossary2022Component,
    NationalPolicyComponent,
    NationalPolicySubcategoriesComponent,
    FinancialStrategyComponent,
    FinancialStrategySubcategoriesComponent,
    RPOsComponent,
    RPOsSubcategoriesComponent,
    RFOsComponent,
    RFOsSubcategoriesComponent,
    FinancialInvestmentsComponent,
    FinancialInvestmentsSubcategoriesComponent,
    NationalMonitoringComponent,
    NationalMonitoringSubcategoriesComponent,
    UseCasesComponent,
    UseCasesSubcategoriesComponent,
    OutputsComponent,
    OutputsSubcategoriesComponent,
    CumulativeDataTablesComponent,
  //   Dynamic Dashboard
    DemoChartsComponent
  ],
  imports: [
    CommonModule,
    EoscReadinessDashboardRouting,
    HighchartsChartModule,
    ArchiveModule,
    ChartsModule,
  ],
  providers: [
    DataService,
    EoscReadinessDataService,
    DataHandlerService,
    StakeholdersService
  ],
})

export class EoscReadinessDashboardModule {}
