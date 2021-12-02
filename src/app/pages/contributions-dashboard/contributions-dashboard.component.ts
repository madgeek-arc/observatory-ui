import {Component, OnInit, ViewChild} from "@angular/core";
import {UserService} from "../../../catalogue-ui/services/user.service";
import {MemberOf, UserInfo} from "../../../catalogue-ui/domain/userInfo";

@Component({
  selector: 'app-contributions-dashboard',
  templateUrl: 'contributions-dashboard.component.html',
  providers: [UserService]
})

export class ContributionsDashboardComponent implements OnInit{

  open: boolean = true;
  userInfo: UserInfo;
  currentStakeholderGroup: MemberOf = null;

  constructor(public userService: UserService) {
    this.userService.getUserInfo().subscribe(
      res => {
        this.userInfo = res;
        this.userService.changeCurrentGroup(this.userInfo.memberOf[0]);
        console.log(this.userInfo);
      }
    );
  }

  ngOnInit() {
  }

  getCurrentStakeholderGroup(currentGroup: MemberOf) {
    this.currentStakeholderGroup = currentGroup;
  }

  toggleOpen(event: MouseEvent) {
    event.preventDefault();
    this.open = !this.open;
  }

}
