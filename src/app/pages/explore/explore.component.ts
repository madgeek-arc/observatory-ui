import { Component, OnInit } from "@angular/core";
import { MenuItem, SideBarComponent } from "../../shared/side-bar/side-bar.component";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [
    SideBarComponent,
    RouterOutlet,
  ],
  templateUrl: './explore.component.html'
})

export class ExploreComponent implements OnInit {

  menuItems: MenuItem[] = [];

  hideSubNavigation: boolean = true;
  activeSection: string = null;

  open = true;
  hasSidebar = true;
  hasAdminMenu = false;
  hover = false;

  ngOnInit() {
    // Open Science by Area with all subitems
    this.menuItems.push(new MenuItem('0','Open Science by Area', '/explore/open-science-by-area', '/explore/open-science-by-area', null));
    this.menuItems[0].items.push(new MenuItem('0-0', 'Publications', '/explore/open-science-by-area/publications', null));
    this.menuItems[0].items.push(new MenuItem('0-1', 'Open Data', '/explore/open-science-by-area/open-data', null));
    this.menuItems[0].items.push(new MenuItem('0-2', 'FAIR Data', '/explore/open-science-by-area/fair-data', null));
    this.menuItems[0].items.push(new MenuItem('0-3', 'Data Management', '/explore/open-science-by-area/data-management', null));
    this.menuItems[0].items.push(new MenuItem('0-4', 'Citizen Science', '/explore/open-science-by-area/citizen-science', null));
    this.menuItems[0].items.push(new MenuItem('0-5', 'Repositories', '/explore/open-science-by-area/repositories', null));
    this.menuItems[0].items.push(new MenuItem('0-6', 'Open Science Training', '/explore/open-science-by-area/training', null));
    this.menuItems[0].items.push(new MenuItem('0-7', 'Open Software', '/explore/open-science-by-area/software', null));
    this.menuItems[0].items.push(new MenuItem('0-8', 'Licencing', '/explore/open-science-by-area/licensing', null, null, null, 'custom-disabled-link'));
    this.menuItems[0].items.push(new MenuItem('0-9', 'Persistent Identifiers', '/explore/open-science-by-area/persistentIdentifiers', null, null, null, 'custom-disabled-link'));

    // Main menu items
    this.menuItems.push(new MenuItem('1', 'Open Science Trends', '/explore/open-science-trends', '/explore/open-science-trends'));
    this.menuItems.push(new MenuItem('2', 'Investments in EOSC', '/explore/investments-in-eosc', '/explore/investments-in-eosc'));
    this.menuItems.push(new MenuItem('3', 'National Monitoring', '/explore/national-monitoring', '/explore/national-monitoring'));
    this.menuItems.push(new MenuItem('4', 'Open Science Policies', '/explore/open-science-policies', '/explore/open-science-policies'));

    // Coming soon items (disabled)
    this.menuItems.push(new MenuItem('5', 'Open Science Use Cases', '', '', null, null, 'custom-disabled-link'));
    this.menuItems.push(new MenuItem('6', 'Open Science by Country', '', '', null, null, 'custom-disabled-link'));
    this.menuItems.push(new MenuItem('7', 'Open Science Resource Registry', '', '', null, null, 'custom-disabled-link'));
    this.menuItems.push(new MenuItem('8', 'Open Science Impact', '', '', null, null, 'custom-disabled-link'));
    this.menuItems.push(new MenuItem('9', 'Custom Search', '', '', null, null, 'custom-disabled-link'));

  }

  toggleAreaSubNav() {
    this.hideSubNavigation = !this.hideSubNavigation;
  }

  linkIsActive(event: boolean) {
    // console.log(' active: '+event);
    this.hideSubNavigation = !event;
  }

  onHoverChange(state: boolean) {
    this.hover = state;
  }
}
