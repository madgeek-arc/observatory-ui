import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {TopMenuDashboardComponent} from "./top-menu/topmenudashboard/top-menu-dashboard.component";
import {RouterModule} from "@angular/router";
import {FooterComponent} from "./footer/footer.component";
import {FullFooterComponent} from "./footer/full-footer.component";

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
  ],
  exports: [
    TopMenuDashboardComponent,
    FooterComponent,
    FullFooterComponent
  ],
  declarations: [
    TopMenuDashboardComponent,
    FooterComponent,
    FullFooterComponent
  ]
})

export class SharedModule {}
