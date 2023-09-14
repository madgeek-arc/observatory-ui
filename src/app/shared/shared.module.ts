import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {TopMenuDashboardComponent} from "./top-menu/topmenudashboard/top-menu-dashboard.component";
import {RouterModule} from "@angular/router";
import {FooterComponent} from "./footer/footer.component";

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
  ],
  exports: [
    TopMenuDashboardComponent,
    FooterComponent
  ],
  declarations: [
    TopMenuDashboardComponent,
    FooterComponent
  ]
})

export class SharedModule {}
