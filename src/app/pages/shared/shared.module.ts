import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {TopMenuLandingComponent} from "./top-menu/topmenulanding/top-menu-landing.component";
import {TopMenuDashboardComponent} from "./top-menu/topmenudashboard/top-menu-dashboard.component";
import {TopMenuPublicDashboardComponent} from "./top-menu/topmenupublicdashboard/top-menu-public-dashboard.component";
import {RouterModule} from "@angular/router";

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
  ],
  exports: [
    TopMenuDashboardComponent,
    TopMenuPublicDashboardComponent,
    TopMenuLandingComponent
  ],
  declarations: [
    TopMenuLandingComponent,
    TopMenuDashboardComponent,
    TopMenuPublicDashboardComponent,
  ]
})

export class SharedModule {}
