import {Component, OnInit} from "@angular/core";
import {Coordinator, Stakeholder, UserInfo} from "../../../domain/userInfo";
import {UserService} from "../../../services/user.service";
import {AuthenticationService} from "../../../services/authentication.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-top-menu-landing',
  templateUrl: 'top-menu-landing.component.html',
  styleUrls: ['../top-menu.component.css'],
})

export class TopMenuLandingComponent implements OnInit {

  showLogin = true;
  ready = false;
  userInfo: UserInfo = null;

  constructor(private userService: UserService, private authentication: AuthenticationService, private router: Router) {
  }

  ngOnInit() {
    if (this.authentication.authenticated) {
      this.userService.getUserInfo().subscribe(next => {
          this.userInfo = next;
          this.showLogin = false
          this.ready = true;
        },
        error => {
          console.log(error);
          this.ready = true;
        });
    } else {
      this.ready = true;
    }
  }

  setGroup(group: Stakeholder) {
    this.userService.changeCurrentStakeholder(group);
    this.router.navigate([`/contributions/${group.id}/home`]);
  }

  setCoordinator(coordinator: Coordinator){
    this.userService.changeCurrentCoordinator(coordinator);
    this.router.navigate([`/contributions/${coordinator.id}/home`]);
  }

  logInButton() {
    this.authentication.login();
  }

  logout() {
    this.authentication.logout();
  }
}
