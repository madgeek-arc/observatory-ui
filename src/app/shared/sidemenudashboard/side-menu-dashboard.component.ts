import {Component, OnInit, ViewChild} from "@angular/core";

@Component({
  selector: 'app-side-menu-dashboard',
  templateUrl: 'side-menu-dashboard.component.html',
  styleUrls: ['./side-menu-dashboard.component.css']
})

export class SideMenuDashboardComponent {

  toggle: number[] = [];

  setToggle(position: number) {
    if (this.toggle[position] === position) {
      this.toggle[position] = 0;
    } else {
      this.toggle[position] = position;
    }
  }

  checkIfCollapsed(position: number) {
    return this.toggle[position] === position;
  }

}
