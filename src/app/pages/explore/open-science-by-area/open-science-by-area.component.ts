import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SidebarMobileToggleComponent } from "../../../../survey-tool/app/shared/dashboard-side-menu/mobile-toggle/sidebar-mobile-toggle.component";
import { RouterModule } from "@angular/router";


@Component({
  standalone: true,
  selector: 'app-open-science-by-area',
  templateUrl: './open-science-by-area.component.html',
  imports: [SidebarMobileToggleComponent, CommonModule, RouterModule],
})

export class OpenScienceByAreaComponent implements OnInit {

  ngOnInit() {
  }
}
