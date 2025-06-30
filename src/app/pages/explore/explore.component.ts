import { Component, OnInit } from "@angular/core";
import {
  DashboardSideMenuComponent,
  MenuItem
} from "../../../survey-tool/app/shared/dashboard-side-menu/dashboard-side-menu.component";
import { ActivatedRoute, Router, RouterOutlet } from "@angular/router";
import {
  DashboardSideMenuService
} from "../../../survey-tool/app/shared/dashboard-side-menu/dashboard-side-menu.service";

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

  hasSidebar = true;
  hasAdminMenu = false;

  constructor(private layoutService: DashboardSideMenuService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {

    this.intMenuItems();

    this.layoutService.setOpen(true);

  }

  intMenuItems() {

    // Open Science by Area with all subitems
    this.menuItems.push(new MenuItem('0','Open Science by Area', null, '/explore/open-science-by-area', '/explore/open-science-by-area', {}));
    this.menuItems[0].items.push(new MenuItem('0-0', 'Publications', null, '/explore/open-science-by-area/publications', null, {}));
    this.menuItems[0].items.push(new MenuItem('0-1', 'Open Data', null, '/explore/open-science-by-area/open-data', null, {}));
    this.menuItems[0].items.push(new MenuItem('0-2', 'FAIR Data', null, '/explore/open-science-by-area/fair-data', null, {}));
    this.menuItems[0].items.push(new MenuItem('0-3', 'Data Management', null, '/explore/open-science-by-area/data-management', null, {}));
    this.menuItems[0].items.push(new MenuItem('0-4', 'Citizen Science', null, '/explore/open-science-by-area/citizen-science', null, {}));
    this.menuItems[0].items.push(new MenuItem('0-5', 'Repositories', null, '/explore/open-science-by-area/repositories', null, {}));
    this.menuItems[0].items.push(new MenuItem('0-6', 'Open Science Training', null, '/explore/open-science-by-area/training', null, {}));
    this.menuItems[0].items.push(new MenuItem('0-7', 'Open Software', null, '/explore/open-science-by-area/software', null, {}));
    this.menuItems[0].items.push(new MenuItem('0-8', 'Licencing', null, '/explore/open-science-by-area/licensing', null, {}, null, 'custom-disabled-link'));
    this.menuItems[0].items.push(new MenuItem('0-9', 'Persistent Identifiers', null, '/explore/open-science-by-area/persistentIdentifiers', null, {}, null, 'custom-disabled-link'));

    // Main menu items
    this.menuItems.push(new MenuItem('1', 'Open Science Trends', null, '/explore/open-science-trends', null, {}));
    this.menuItems.push(new MenuItem('2', 'Investments in EOSC', null, '/explore/investments-in-eosc', null, {}));
    this.menuItems.push(new MenuItem('3', 'National Monitoring', null, '/explore/national-monitoring', null, {}));
    this.menuItems.push(new MenuItem('4', 'Open Science Policies', null, '/explore/open-science-policies', null, {}));

    // Coming soon items (disabled)
    this.menuItems.push(new MenuItem('5', 'Open Science Use Cases', null, '', '', {}, null, 'custom-disabled-link'));
    this.menuItems.push(new MenuItem('6', 'Open Science by Country', null, '', '', {}, null, 'custom-disabled-link'));
    this.menuItems.push(new MenuItem('7', 'Open Science Resource Registry', null, '', '', {}, null, 'custom-disabled-link'));
    this.menuItems.push(new MenuItem('8', 'Open Science Impact', null, '', '', {}, null, 'custom-disabled-link'));
    this.menuItems.push(new MenuItem('9', 'Custom Search', null, '', '', {}, null, 'custom-disabled-link'));

  }

  public get open() {
    return this.layoutService.open;
  }

  public get hover() {
    return this.layoutService.hover;
  }
}
