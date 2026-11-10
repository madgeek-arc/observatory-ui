import { Component, OnInit, ChangeDetectionStrategy } from "@angular/core";
import { PageContentComponent } from "src/survey-tool/app/shared/page-content/page-content.component";
import { SidebarMobileToggleComponent } from "src/survey-tool/app/shared/dashboard-side-menu/mobile-toggle/sidebar-mobile-toggle.component";

@Component({
    selector: 'app-open-science-use-cases',
    templateUrl: './open-science-use-cases.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [PageContentComponent, SidebarMobileToggleComponent]
})

export class OpenScienceUseCasesComponent implements OnInit {

  ngOnInit() {
  }
}
