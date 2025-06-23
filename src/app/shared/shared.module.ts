import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { TopMenuDashboardComponent } from "./top-menu/topmenudashboard/top-menu-dashboard.component";
import { FooterComponent } from "./footer/footer.component";
import { FullFooterComponent } from "./footer/full-footer.component";
import { ChartsModule } from "./charts/charts.module";
import { PipeModule } from "./pipes/pipe.module";
import { ToggleComponent } from './toggle/toggle.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ChartsModule,
    PipeModule
  ],
  exports: [
    TopMenuDashboardComponent,
    FooterComponent,
    FullFooterComponent
  ],
  declarations: [
    TopMenuDashboardComponent,
    FooterComponent,
    FullFooterComponent,
    ToggleComponent
  ]
})

export class SharedModule {}
