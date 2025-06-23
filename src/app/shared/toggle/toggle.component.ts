import { Component, Input } from "@angular/core";

@Component({
  selector: 'sidebar-mobile-toggle',
  template: `
    <a *ngIf="activeSidebarItem" href="#sidebar_offcanvas" class="sidebar_mobile_toggle uk-link-reset uk-width-3-5 uk-flex uk-flex-middle" uk-toggle>
      <span class="uk-width-expand uk-text-truncate uk-margin-small-left uk-text-bolder">
        {{ activeSidebarItem }}
        <span *ngIf="activeSidebarSubItem">- {{ activeSidebarSubItem }}</span>
      </span>
      <!-- <div class="uk-width-auto uk-margin-small-left">
        <icon name="arrow_right" ratio="1.4" [flex]="true"></icon>
      </div> -->
    </a>
  `
})
export class SidebarMobileToggleComponent {
  @Input() activeSidebarItem: string;
  @Input() activeSidebarSubItem: string;
}

