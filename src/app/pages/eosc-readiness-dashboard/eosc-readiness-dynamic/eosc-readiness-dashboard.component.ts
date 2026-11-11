import { Component, OnInit, ChangeDetectionStrategy } from "@angular/core";
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
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './eosc-readiness-dashboard.component.html'
})

export class EoscReadinessDashboardComponent implements OnInit {
  menuItems: MenuItem[] = [];
  menuSections: MenuSection[] = [];
  year: string = '';

  hasSidebar = true;
  hasAdminMenu = false;

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private layoutService: DashboardSideMenuService, private iconService: IconsService) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.year = params['year'] || '2024';
      this.menuItems = [];
      this.menuSections = [];
      this.initMenuItems();
    })
    this.iconService.registerIcons(exploreIcons);



    this.layoutService.setOpen(true);

  }

  initMenuItems() {
    const BASE_PATH = `/eoscreadiness/${this.year}`;
    this.menuItems.push(new MenuItem('0', 'General', null, `${BASE_PATH}/general/researchers`, `${BASE_PATH}/general/researchers`, {name: 'clear_all'}));
    // General with all subitems
    this.menuItems[0].items.push(new MenuItem('0-0', 'Researchers', null, `${BASE_PATH}/general/researchers`, null));
    this.menuItems[0].items.push(new MenuItem('0-1', 'RPOs', null, `${BASE_PATH}/general/RPOs`, null, {name: ''}));
    this.menuItems[0].items.push(new MenuItem('0-2', 'RFOs', null, `${BASE_PATH}/general/RFOs`, null, {name: ''}));
    this.menuItems[0].items.push(new MenuItem('0-3', 'Repositories', null, `${BASE_PATH}/general/repositories`, null, {name: ''}));
    this.menuItems[0].items.push(new MenuItem('0-4', 'Investments', null, `${BASE_PATH}/general/investments`, null, {name: ''}));

    // Default  Policies Route
    this.menuItems.push(new MenuItem('1', 'EOSC Policies', null, `${BASE_PATH}/policies/nationalPolicy/all`, `${BASE_PATH}/policies/nationalPolicy/all`, {name: 'policy'}));
    // Policies with all subitems
    this.menuItems[1].items.push(new MenuItem('1-0', 'National Policy', null, `${BASE_PATH}/policies/nationalPolicy/all`, `${BASE_PATH}/policies/nationalPolicy`, {name: ''}));
    this.menuItems[1].items.push(new MenuItem('1-1', 'Financial Strategy', null, `${BASE_PATH}/policies/financialStrategy/all`,`${BASE_PATH}/policies/financialStrategy`,  {name: ''}));
    this.menuItems[1].items.push(new MenuItem('1-2', 'RPOs with Policy', null, `${BASE_PATH}/policies/RPOs/all`, `${BASE_PATH}/policies/RPOs`, {name: ''}));
    this.menuItems[1].items.push(new MenuItem('1-3', 'RFOs with Policy', null, `${BASE_PATH}/policies/RFOs/all`, `${BASE_PATH}/policies/RFOs`, {name: ''}));

    // Default Practices Route
    this.menuItems.push(new MenuItem('2', 'EOSC Practices', null, `${BASE_PATH}/practices/nationalMonitoring/all`, null, {name: 'assignment'}));
    // Practices with all subitems
    this.menuItems[2].items.push(new MenuItem('2-0', 'Monitoring', null, `${BASE_PATH}/practices/nationalMonitoring/all`, `${BASE_PATH}/practices/nationalMonitoring`, {name: ''}));
    this.menuItems[2].items.push(new MenuItem('2-1', 'Use Cases', null, `${BASE_PATH}/practices/useCases/all`, `${BASE_PATH}/practices/useCases`, {name: ''}));
    this.menuItems[2].items.push(new MenuItem('2-2', 'Investments', null, `${BASE_PATH}/practices/investments/all`, `${BASE_PATH}/practices/investments`, {name: ''}));
    this.menuItems[2].items.push(new MenuItem('2-3', 'Outputs', null, `${BASE_PATH}/practices/outputs/all`, `${BASE_PATH}/practices/outputs`, {name: ''}));

    //Glossary
    this.menuItems.push(new MenuItem('3', 'Glossary', null, `${BASE_PATH}/glossary`, null, {name: 'auto_stories'}));

    this.menuSections.push({items: this.menuItems});
  }

  public get open() {
    return this.layoutService.open;
  }

  public get hover() {
    return this.layoutService.hover;
  }
}
