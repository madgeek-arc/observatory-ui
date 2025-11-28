import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EoscReadinessDashboardRouting } from "./eosc-readiness-dashboard.routing";
import { HighchartsChartModule } from "highcharts-angular";
import { DataService } from "../services/data.service";
import { DataHandlerService } from "../services/data-handler.service";
import { StakeholdersService } from "../../../survey-tool/app/services/stakeholders.service";
import { Policies2021Component } from "./eosc-readiness-2021/policies/policies-2021.component";
import { Practices2021Component } from "./eosc-readiness-2021/practices/practices-2021.component";
import { ArchiveModule } from "../archive/archive.module";
import { Investments2021Component } from "./eosc-readiness-2021/investments/investments-2021.component";
import { PoliciesComponent } from "./eosc-readiness-dynamic/policies/policies.component";
import { PracticesComponent } from "./eosc-readiness-dynamic/practices/practices.component";
import { EoscReadinessDataService } from "../services/eosc-readiness-data.service";
import { NationalPolicyComponent } from "./eosc-readiness-dynamic/policies/national-policy/national-policy.component";
import { FinancialStrategyComponent } from "./eosc-readiness-dynamic/policies/financial-strategy/financial-strategy.component";
import { RPOsComponent } from "./eosc-readiness-dynamic/policies/RPOs/RPOs.component";
import { RFOsComponent } from "./eosc-readiness-dynamic/policies/RFOs/RFOs.component";
import { NationalMonitoringComponent } from "./eosc-readiness-dynamic/practices/national-monitoring/national-monitoring.component";
import { UseCasesComponent } from "./eosc-readiness-dynamic/practices/use-cases/use-cases.component";
import { FinancialInvestmentsComponent } from "./eosc-readiness-dynamic/practices/investments/financial-investments.component";
import { OutputsComponent } from "./eosc-readiness-dynamic/practices/outputs/outputs.component";
import { NationalPolicySubcategoriesComponent } from "./eosc-readiness-dynamic/policies/national-policy/subcategories/national-policy-subcategories.component";
import { FinancialStrategySubcategoriesComponent } from "./eosc-readiness-dynamic/policies/financial-strategy/subcategories/financial-strategy-subcategories.component";
import { RFOsSubcategoriesComponent } from "./eosc-readiness-dynamic/policies/RFOs/subcategories/RFOs-subcategories.component";
import { RPOsSubcategoriesComponent } from "./eosc-readiness-dynamic/policies/RPOs/subcategories/RPOs-subcategories.component";
import { FinancialInvestmentsSubcategoriesComponent } from "./eosc-readiness-dynamic/practices/investments/subcategories/financial-investments-subcategories.component";
import { NationalMonitoringSubcategoriesComponent } from "./eosc-readiness-dynamic/practices/national-monitoring/subcategories/national-monitoring-subcategories.component";
import { UseCasesSubcategoriesComponent } from "./eosc-readiness-dynamic/practices/use-cases/subcategories/use-cases-subcategories.component";
import { OutputsSubcategoriesComponent } from "./eosc-readiness-dynamic/practices/outputs/subcategories/outputs-subcategories.component";
import { GeneralComponent } from "./eosc-readiness-dynamic/general/general.component";
import { CumulativeDataTablesComponent } from "./eosc-readiness-dynamic/tables/cumulative-data-tables.component";
import { GlossaryComponent } from "./eosc-readiness-dynamic/glossary/glossary.component";
import { ChartsModule } from "../../shared/charts/charts.module";

@NgModule({
  declarations: [
    Policies2021Component,
    Practices2021Component,
    Investments2021Component,
    PoliciesComponent,
    PracticesComponent,
    GeneralComponent,
    GlossaryComponent,
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
