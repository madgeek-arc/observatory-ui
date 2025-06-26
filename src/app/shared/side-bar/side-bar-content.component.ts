import { Component } from "@angular/core";
import { SideBarService } from "./side-bar-service";

@Component({
  selector: '[sidebar-content]',
  standalone: true,
  template: `
    <div id="sidebar_toggle" (click)="toggleOpen()"></div>
    <div id="sidebar_content" (mouseenter)="onMouseEnter()" (mouseleave)="onMouseLeave()">
      <ng-content></ng-content>
    </div>
  `
})
export class SidebarContentComponent {

  constructor(private layoutService: SideBarService) {
  }

  onMouseEnter() {
    this.layoutService.setHover(true);
  }

  onMouseLeave() {
    this.layoutService.setHover(false);
  }

  public toggleOpen() {
    this.layoutService.setOpen(!this.layoutService.open);
  }
}
