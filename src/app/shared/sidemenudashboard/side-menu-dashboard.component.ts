import {Component, Input, OnInit, ViewChild} from "@angular/core";
import {MemberOf} from "../../domain/userInfo";
import {UserService} from "../../../catalogue-ui/services/user.service";

@Component({
  selector: 'app-side-menu-dashboard',
  templateUrl: 'side-menu-dashboard.component.html',
  styleUrls: ['./side-menu-dashboard.component.css']
})

export class SideMenuDashboardComponent implements OnInit {

  toggle: number[] = [];
  currentGroup: MemberOf = null;

  constructor(private userService: UserService) {
  }

  ngOnInit() {
    this.userService.currentStakeholderGroup.subscribe(next => {
      this.currentGroup = next;
    });
  }

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
