import {Component, OnInit} from "@angular/core";
import {UserService} from "../../../services/user.service";
import {MemberOf, StakeholdersMembers} from "../../../domain/userInfo";

@Component({
  selector: 'app-contributions-my-group',
  templateUrl: './my-group.component.html'
})

export class MyGroupComponent implements OnInit {

  currentGroup: MemberOf = null;
  members: StakeholdersMembers = null

  constructor(private userService: UserService) {
  }

  ngOnInit() {
    this.userService.currentStakeholderGroup.subscribe(next => {
      this.currentGroup = next;
      if (this.currentGroup !== null) {
        this.userService.getStakeholdersMembers(this.currentGroup.id).subscribe(
          next => {
            this.members = next;
          });
      }
    });
  }

}
