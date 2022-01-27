import {Component, OnInit} from "@angular/core";
import {UserService} from "../../services/user.service";
import {UserInfo} from "../../domain/userInfo";
import {ActivatedRoute, Router} from "@angular/router";
import {AuthenticationService} from "../../services/authentication.service";


@Component({
  selector: 'app-contributions-dashboard',
  templateUrl: 'contributions-dashboard.component.html',
})

export class ContributionsDashboardComponent implements OnInit{

  open: boolean = true;
  consent: boolean = false;
  userInfo: UserInfo;

  constructor(public userService: UserService,
              public authentication: AuthenticationService,
              public router: Router,
              public route: ActivatedRoute) {
    this.userService.getUserInfo().subscribe(
      res => {
        this.userInfo = res;
        this.userService.userId = this.userInfo.user.email;
      }, error => {
        console.log(error);
      },
      () => {
        this.setGroup();
      }
    );
  }

  ngOnInit() {
  }

  setGroup() {
    this.route.children[0].params.subscribe(params => {
      let groupId = params['id'];
      if (this.userInfo.stakeholders.length) {
        for (const stakeholder of this.userInfo.stakeholders) {
          if (groupId === stakeholder.id){
            this.userService.changeCurrentStakeholder(stakeholder);
            break;
          }
        }
      }
      if (this.userInfo.coordinators.length) {
        for (const coordinator of this.userInfo.coordinators) {
          if (groupId === coordinator.id) {
            this.userService.changeCurrentCoordinator(coordinator);
            break;
          }
        }
      }
    });
  }

}
