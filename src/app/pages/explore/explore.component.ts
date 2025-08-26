import { Component, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import {
  DashboardSideMenuComponent,
  MenuItem, MenuSection
} from "../../../survey-tool/app/shared/dashboard-side-menu/dashboard-side-menu.component";
import {
  DashboardSideMenuService
} from "../../../survey-tool/app/shared/dashboard-side-menu/dashboard-side-menu.service";
import { IconsService } from "../../../survey-tool/app/utils/icons/icons.service";
import { exploreIcons } from "./explore.icons";

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [
    DashboardSideMenuComponent,
    RouterOutlet,
  ],
  templateUrl: './explore.component.html'
})

export class ExploreComponent implements OnInit {

  menuItems: MenuItem[] = [];
  menuSections: MenuSection[] = [];

  hasSidebar = true;
  hasAdminMenu = false;

  constructor(private layoutService: DashboardSideMenuService, private iconService: IconsService) {}

  ngOnInit() {
    this.iconService.registerIcons(exploreIcons);

    this.intMenuItems();

    this.layoutService.setOpen(true);

  }

  intMenuItems() {

    // Open Science by Area with all subitems
    this.menuItems.push(new MenuItem('0','Open Science by Area', null, '/explore/open-science-by-area', '/explore/open-science-by-area', {name: 'OS by Area'}));
    this.menuItems[0].items.push(new MenuItem('0-0', 'Publications', null, '/explore/open-science-by-area/publications', null, {name: 'OA Publications'}));
    this.menuItems[0].items.push(new MenuItem('0-1', 'Open Data', null, '/explore/open-science-by-area/open-data', null, {name: 'Open Data'}));
    this.menuItems[0].items.push(new MenuItem('0-2', 'FAIR Data', null, '/explore/open-science-by-area/fair-data', null, {name: 'FAIR Data'}));
    this.menuItems[0].items.push(new MenuItem('0-3', 'Data Management', null, '/explore/open-science-by-area/data-management', null, {name: 'Data Management'}));
    this.menuItems[0].items.push(new MenuItem('0-4', 'Citizen Science', null, '/explore/open-science-by-area/citizen-science', null, {name: 'Citizen Science'}));
    this.menuItems[0].items.push(new MenuItem('0-5', 'Repositories', null, '/explore/open-science-by-area/repositories', null, {name: 'Repositories'}));
    this.menuItems[0].items.push(new MenuItem('0-6', 'Open Science Training', null, '/explore/open-science-by-area/training', null, {name: 'OS Training'}));
    this.menuItems[0].items.push(new MenuItem('0-7', 'Open Software', null, '/explore/open-science-by-area/software', null, {name: 'Open Software'}));
    this.menuItems[0].items.push(new MenuItem('0-8', 'Licencing', null, '/explore/open-science-by-area/licensing', null, {name: 'Licencing'}, null, 'custom-disabled-link'));
    this.menuItems[0].items.push(new MenuItem('0-9', 'Persistent Identifiers', null, '/explore/open-science-by-area/persistentIdentifiers', null, {name: 'Persistent Identifiers'}, null, 'custom-disabled-link'));

    // Main menu items
    this.menuItems.push(new MenuItem('1', 'Open Science Trends', null, '/explore/open-science-trends', null, {name: 'OS Trends'}));
    this.menuItems.push(new MenuItem('2', 'Investments in EOSC', null, '/explore/investments-in-eosc', null, {name: 'Investments'}));
    this.menuItems.push(new MenuItem('3', 'National Monitoring', null, '/explore/national-monitoring', null, {name: 'OS Monitoring'}));
    this.menuItems.push(new MenuItem('4', 'Open Science Policies', null, '/explore/open-science-policies', null, {name: 'OS Policies'}));
      this.menuItems.push(new MenuItem('7', 'Open Science Resource Registry', null, '/explore/resource-registry/search', null, {name: 'OS Resource Registry'}, null,));

    // Coming soon items (disabled)
    this.menuSections.push({items: this.menuItems});

    this.menuItems = [];
    this.menuItems.push(new MenuItem('5', 'Open Science Use Cases', null, '', '', {name: 'OS Use Cases'}, null, 'custom-disabled-link'));
    this.menuItems.push(new MenuItem('6', 'Open Science by Country', null, '', '', {name: 'OS by Country'}, null, 'custom-disabled-link'));
    this.menuItems.push(new MenuItem('8', 'Open Science Impact', null, '', '', {name: 'OS Impact'}, null, 'custom-disabled-link'));
    this.menuItems.push(new MenuItem('9', 'Custom Search', null, '', '', {name: 'Custom Search'}, null, 'custom-disabled-link'));

    this.menuSections.push({items: this.menuItems});
  }

  public get open() {
    return this.layoutService.open;
  }

  public get hover() {
    return this.layoutService.hover;
  }
}
