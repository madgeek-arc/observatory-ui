import { Component, OnInit } from "@angular/core";
import { MenuItem, SideBarComponent } from "../../shared/side-bar/side-bar.component";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { CommonModule } from "@angular/common";

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [
    SideBarComponent,
    RouterOutlet,
    RouterLinkActive,
    RouterLink
  ],
  templateUrl: './explore.component.html'
})

export class ExploreComponent implements OnInit {

  menuItems: MenuItem[] = [];

  hideSubNavigation: boolean = true;
  activeSection: string = null;

  ngOnInit() {
    // Open Science by Area with all subitems
    this.menuItems.push(new MenuItem('0','Open Science by Area', 'open-science-by-area', 'open-science-by-area', null));
    this.menuItems[0].items.push(new MenuItem('0-0', 'Publications', 'open-science-by-area/publications', 'open-science-by-area/publications'));
    this.menuItems[0].items.push(new MenuItem('0-1', 'Open Data', 'open-science-by-area/open-data', 'open-science-by-area/open-data'));
    this.menuItems[0].items.push(new MenuItem('0-2', 'FAIR Data', 'open-science-by-area/fair-data', 'open-science-by-area/fair-data'));
    this.menuItems[0].items.push(new MenuItem('0-3', 'Data Management', 'open-science-by-area/data-management', 'open-science-by-area/data-management'));
    this.menuItems[0].items.push(new MenuItem('0-4', 'Citizen Science', 'open-science-by-area/citizen-science', 'open-science-by-area/citizen-science'));
    this.menuItems[0].items.push(new MenuItem('0-5', 'Repositories', 'open-science-by-area/repositories', 'open-science-by-area/repositories'));
    this.menuItems[0].items.push(new MenuItem('0-6', 'Open Science Training', 'open-science-by-area/training', 'open-science-by-area/training'));
    this.menuItems[0].items.push(new MenuItem('0-7', 'Open Software', 'open-science-by-area/software', 'open-science-by-area/software'));
    this.menuItems[0].items.push(new MenuItem('0-8', 'Licencing', 'open-science-by-area/licensing', 'open-science-by-area/licensing', null, null, 'custom-disabled-link'));
    this.menuItems[0].items.push(new MenuItem('0-9', 'Persistent Identifiers', 'open-science-by-area/persistentIdentifiers', 'open-science-by-area/persistentIdentifiers', null, null, 'uk-disabled-link'));

    // Main menu items
    this.menuItems.push(new MenuItem('1', 'Open Science Trends', 'open-science-trends', 'open-science-trends'));
    this.menuItems.push(new MenuItem('2', 'Investments in EOSC', 'investments-in-eosc', 'investments-in-eosc'));
    this.menuItems.push(new MenuItem('3', 'National Monitoring', 'national-monitoring', 'national-monitoring'));
    this.menuItems.push(new MenuItem('4', 'Open Science Policies', 'open-science-policies', 'open-science-policies'));

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
}
