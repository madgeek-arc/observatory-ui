import {Component, OnInit, ViewChild} from "@angular/core";
import {UserService} from "../../services/user.service";
import {MemberOf, UserInfo} from "../../domain/userInfo";
import {Router} from "@angular/router";

@Component({
  selector: 'app-contributions-dashboard',
  templateUrl: 'contributions-dashboard.component.html',
  providers: [UserService]
})

export class ContributionsDashboardComponent implements OnInit{

  open: boolean = true;
  userInfo: UserInfo;
  currentStakeholderGroup: MemberOf = null;

  constructor(public userService: UserService, public router: Router) {
    this.userService.getUserInfo().subscribe(
      res => {
        this.userInfo = res;
        this.userService.changeCurrentGroup(this.userInfo.memberOf[0]);
        this.userService.userId = this.userInfo.user.email;
      }, error => {
        this.router.navigate(['/home']);
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
