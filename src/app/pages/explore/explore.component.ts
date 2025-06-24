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
    this.menuItems.push(new MenuItem('0','Open Science by Area', 'open-science-by-area', 'open-science-by-area', 'open-science-by-area'));
    this.menuItems[0].items.push(new MenuItem('0-0', 'Publications', 'publications', 'publications'));
    this.menuItems.push(new MenuItem('1', 'Open Science Trends', 'open-science-trends', 'open-science-trends'));
  }

  toggleAreaSubNav() {
    this.hideSubNavigation = !this.hideSubNavigation;
  }

  linkIsActive(event: boolean) {
    // console.log(' active: '+event);
    this.hideSubNavigation = !event;
  }
}
