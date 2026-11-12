import { Component, OnInit, ChangeDetectionStrategy, signal, inject } from "@angular/core";
import {ActivatedRoute, Router, RouterLink, RouterOutlet} from "@angular/router";
import { DashboardSideMenuComponent, MenuItem, MenuSection} from "src/survey-tool/app/shared/dashboard-side-menu/dashboard-side-menu.component";
import { DashboardSideMenuService} from "src/survey-tool/app/shared/dashboard-side-menu/dashboard-side-menu.service";
import { FormsModule} from "@angular/forms";

import {IconsService} from "src/survey-tool/app/shared/icons/icons.service";
import {exploreIcons} from "../../explore/explore.icons";

@Component({
  standalone: true,
  selector: 'app-readiness',
  imports: [
    DashboardSideMenuComponent,
    RouterOutlet,
    FormsModule,
    RouterLink,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './eosc-readiness-dashboard.component.html'
})

export class EoscReadinessDashboardComponent implements OnInit {
  menuSections = signal<MenuSection[]>([]);
  year = signal('');

  hasSidebar = true;
  hasAdminMenu = false;

  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private layoutService = inject(DashboardSideMenuService);
  private iconService = inject(IconsService);

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.year.set(params['year'] || '2024');
      this.initMenuItems();
    })
    this.iconService.registerIcons(exploreIcons);



    this.layoutService.setOpen(true);

  }

  initMenuItems() {
    // built in a local and set once, so the sidebar gets a new array when the year changes
    const menuItems: MenuItem[] = [];
    const BASE_PATH = `/eoscreadiness/${this.year()}`;
    menuItems.push(new MenuItem('0', 'General', null, `${BASE_PATH}/general/researchers`, `${BASE_PATH}/general/researchers`, {name: 'clear_all'}));
    // General with all subitems
    menuItems[0].items.push(new MenuItem('0-0', 'Researchers', null, `${BASE_PATH}/general/researchers`, null));
    menuItems[0].items.push(new MenuItem('0-1', 'RPOs', null, `${BASE_PATH}/general/RPOs`, null, {name: ''}));
    menuItems[0].items.push(new MenuItem('0-2', 'RFOs', null, `${BASE_PATH}/general/RFOs`, null, {name: ''}));
    menuItems[0].items.push(new MenuItem('0-3', 'Repositories', null, `${BASE_PATH}/general/repositories`, null, {name: ''}));
    menuItems[0].items.push(new MenuItem('0-4', 'Investments', null, `${BASE_PATH}/general/investments`, null, {name: ''}));

    // Default  Policies Route
    menuItems.push(new MenuItem('1', 'EOSC Policies', null, `${BASE_PATH}/policies/nationalPolicy/all`, `${BASE_PATH}/policies/nationalPolicy/all`, {name: 'policy'}));
    // Policies with all subitems
    menuItems[1].items.push(new MenuItem('1-0', 'National Policy', null, `${BASE_PATH}/policies/nationalPolicy/all`, `${BASE_PATH}/policies/nationalPolicy`, {name: ''}));
    menuItems[1].items.push(new MenuItem('1-1', 'Financial Strategy', null, `${BASE_PATH}/policies/financialStrategy/all`,`${BASE_PATH}/policies/financialStrategy`,  {name: ''}));
    menuItems[1].items.push(new MenuItem('1-2', 'RPOs with Policy', null, `${BASE_PATH}/policies/RPOs/all`, `${BASE_PATH}/policies/RPOs`, {name: ''}));
    menuItems[1].items.push(new MenuItem('1-3', 'RFOs with Policy', null, `${BASE_PATH}/policies/RFOs/all`, `${BASE_PATH}/policies/RFOs`, {name: ''}));

    // Default Practices Route
    menuItems.push(new MenuItem('2', 'EOSC Practices', null, `${BASE_PATH}/practices/nationalMonitoring/all`, null, {name: 'assignment'}));
    // Practices with all subitems
    menuItems[2].items.push(new MenuItem('2-0', 'Monitoring', null, `${BASE_PATH}/practices/nationalMonitoring/all`, `${BASE_PATH}/practices/nationalMonitoring`, {name: ''}));
    menuItems[2].items.push(new MenuItem('2-1', 'Use Cases', null, `${BASE_PATH}/practices/useCases/all`, `${BASE_PATH}/practices/useCases`, {name: ''}));
    menuItems[2].items.push(new MenuItem('2-2', 'Investments', null, `${BASE_PATH}/practices/investments/all`, `${BASE_PATH}/practices/investments`, {name: ''}));
    menuItems[2].items.push(new MenuItem('2-3', 'Outputs', null, `${BASE_PATH}/practices/outputs/all`, `${BASE_PATH}/practices/outputs`, {name: ''}));

    //Glossary
    menuItems.push(new MenuItem('3', 'Glossary', null, `${BASE_PATH}/glossary`, null, {name: 'auto_stories'}));

    this.menuSections.set([{items: menuItems}]);
  }

  public get open() {
    return this.layoutService.open;
  }

  public get hover() {
    return this.layoutService.hover;
  }
}
