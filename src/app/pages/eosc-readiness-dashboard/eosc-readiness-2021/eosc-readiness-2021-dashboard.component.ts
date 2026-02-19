import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, RouterLink, RouterOutlet } from "@angular/router";
import {
  DashboardSideMenuService
} from "../../../../survey-tool/app/shared/dashboard-side-menu/dashboard-side-menu.service";
import {
  DashboardSideMenuComponent,
  MenuItem,
  MenuSection
} from "../../../../survey-tool/app/shared/dashboard-side-menu/dashboard-side-menu.component";
import { FormsModule } from "@angular/forms";
import { IconsService } from "../../../../survey-tool/app/shared/icons/icons.service";
import { exploreIcons } from "../../explore/explore.icons";

@Component({
  selector: 'app-readiness-2021',
  templateUrl: 'eosc-readiness-2021-dashboard.component.html',
  imports: [
    DashboardSideMenuComponent,
    RouterOutlet,
    FormsModule,
    RouterLink,
  ]
})

export class EoscReadiness2021DashboardComponent implements OnInit {
  menuItems: MenuItem[] = [];
  menuSections: MenuSection[] = [];
  year: string = '';
  hasSidebar = true;
  hasAdminMenu = false;

  constructor(private activatedRoute: ActivatedRoute, private layoutService: DashboardSideMenuService, private iconService: IconsService) {
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.year = params['year'] || '2021';
      this.menuItems = [];
      this.menuSections = [];
      this.initMenuItems();
    })
    this.iconService.registerIcons(exploreIcons);



    this.layoutService.setOpen(true);
  }

  initMenuItems() {
    const BASE_PATH = `/eoscreadiness/${this.year}`;
    const defaultPoliciesRoute = `${BASE_PATH}/policies`;
    this.menuItems.push(new MenuItem('0','EOSC Policies', null, defaultPoliciesRoute, defaultPoliciesRoute, {name: 'policy'}));
    // EOSC Policies with all subitems
    this.menuItems[0].items.push(new MenuItem('0-0', 'EOSC-relevant Policies', null, `${BASE_PATH}/policies`, `${BASE_PATH}/policies`, {name: ''}));
    this.menuItems[0].items[this.menuItems[0].items.length -1].params = {chart: "0"};
    this.menuItems[0].items.push(new MenuItem('0-1', 'Implementation Measures', null, `${BASE_PATH}/policies`, null, {name: ''}));
    this.menuItems[0].items[this.menuItems[0].items.length -1].params = {chart: "1"};
    this.menuItems[0].items.push(new MenuItem('0-2', 'Financial Strategies', null, `${BASE_PATH}/policies`, null, {name: ''}));
    this.menuItems[0].items[this.menuItems[0].items.length -1].params = {chart: "2"};
    this.menuItems[0].items.push(new MenuItem('0-3', 'EOSC-relevant Activities', null, `${BASE_PATH}/policies`, null, {name: ''}));
    this.menuItems[0].items[this.menuItems[0].items.length -1].params = {chart: "3"};
    this.menuItems[0].items.push(new MenuItem('0-4', 'EOSC-relevant Services', null, `${BASE_PATH}/policies`, null, {name: ''}));
    this.menuItems[0].items[this.menuItems[0].items.length -1].params = {chart: "4"};
    this.menuItems[0].items.push(new MenuItem('0-5', 'EOSC-relevant Infrastructure', null, `${BASE_PATH}/policies`, null, {name: ''}));
    this.menuItems[0].items[this.menuItems[0].items.length -1].params = {chart: "5"};

    const defaultPracticesRoute = `${BASE_PATH}/practices`
    this.menuItems.push(new MenuItem('1', 'EOSC Practices', null, defaultPracticesRoute, defaultPracticesRoute, {name: 'assignment'}));
    // EOSC Practices with all subitems
    this.menuItems[1].items.push(new MenuItem('1-0', 'Mandated Organisations', null, `${BASE_PATH}/practices`, `${BASE_PATH}/practices`, {name: ''}));
    this.menuItems[1].items[this.menuItems[1].items.length - 1].params = {chart: "0"};
    this.menuItems[1].items.push(new MenuItem('1-1', 'National Monitoring', null, `${BASE_PATH}/practices`, null, {name: ''}));
    this.menuItems[1].items[this.menuItems[1].items.length - 1].params = {chart: "1"};
    this.menuItems[1].items.push(new MenuItem('1-2', 'Monitoring Reporting', null, `${BASE_PATH}/practices`, null, {name: ''}));
    this.menuItems[1].items[this.menuItems[1].items.length - 1].params = {chart: "2"};
    this.menuItems[1].items.push(new MenuItem('1-3', 'Use Cases', null, `${BASE_PATH}/practices`, null, {name: ''}));
    this.menuItems[1].items[this.menuItems[1].items.length - 1].params = {chart: "3"};

    const defaultInvestmentsRoute = `${BASE_PATH}/investments`
    this.menuItems.push(new MenuItem('2', 'EOSC Investments', null, defaultInvestmentsRoute, defaultInvestmentsRoute, {name: 'euro'}));
    // EOSC Investments with all subitems
    this.menuItems[2].items.push(new MenuItem('2-0', 'National Contributions', null, `${BASE_PATH}/investments`, `${BASE_PATH}/investments`, {name: ''}));
    this.menuItems[2].items[this.menuItems[2].items.length - 1].params = {chart: "0"};
    this.menuItems[2].items.push(new MenuItem('2-1', 'EOSC-A Members', null, `${BASE_PATH}/investments`, null, {name: ''}));
    this.menuItems[2].items[this.menuItems[2].items.length - 1].params = {chart: "1"};
    this.menuItems[2].items.push(new MenuItem('2-2', 'Other Contributions', null, `${BASE_PATH}/investments`, null, {name: ''}));
    this.menuItems[2].items[this.menuItems[2].items.length - 1].params = {chart: "2"};
    this.menuItems[2].items.push(new MenuItem('2-3', 'Contribution Sources', null, `${BASE_PATH}/investments`, null, {name: ''}));
    this.menuItems[2].items[this.menuItems[2].items.length - 1].params = {chart: "3"};
    this.menuItems[2].items.push(new MenuItem('2-4', 'Contribution Level', null, `${BASE_PATH}/investments`, null, {name: ''}));
    this.menuItems[2].items[this.menuItems[2].items.length - 1].params = {chart: "4"};
    this.menuItems[2].items.push(new MenuItem('2-5', 'Earmarked Contributions', null, `${BASE_PATH}/investments`, null, {name: ''}));
    this.menuItems[2].items[this.menuItems[2].items.length - 1].params = {chart: "5"};
    this.menuItems[2].items.push(new MenuItem('2-6', 'Non-earmarked Contributions', null, `${BASE_PATH}/investments`, null, {name: ''}));
    this.menuItems[2].items[this.menuItems[2].items.length - 1].params = {chart: "6"};
    this.menuItems[2].items.push(new MenuItem('2-7', 'Structural/Investment Funds', null, `${BASE_PATH}/investments`, null, {name: ''}));
    this.menuItems[2].items[this.menuItems[2].items.length - 1].params = {chart: "7"};


    this.menuSections.push({items: this.menuItems});
  }

  public get open(){
    return this.layoutService.open;
  }

  public get hover() {
    return this.layoutService.hover;
  }
}
