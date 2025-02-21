import { Component} from "@angular/core";

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html'
})

export class ExploreComponent {

  hideSubNavigation: boolean = true;
  activeSection: string = null;

  toggleAreaSubNav() {
    this.hideSubNavigation = !this.hideSubNavigation;
  }

  linkIsActive(event, name: string) {
    // console.log(name+' active: '+event);
    if (event)
      this.hideSubNavigation = false;
  }
}
