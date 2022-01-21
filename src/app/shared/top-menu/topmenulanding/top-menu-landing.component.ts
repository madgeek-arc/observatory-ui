import {Component, OnInit} from "@angular/core";
import {UserInfo} from "../../../domain/userInfo";
import {UserService} from "../../../services/user.service";
import {AuthenticationService} from "../../../services/authentication.service";

@Component({
  selector: 'app-top-menu-landing',
  templateUrl: 'top-menu-landing.component.html',
  styleUrls: ['../top-menu.component.css'],
})

export class TopMenuLandingComponent implements OnInit {

  showLogin = true;
  ready = false;
  userInfo: UserInfo = null;

  constructor(private userService: UserService, private authentication: AuthenticationService) {
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

  logInButton() {
    this.authentication.login();
  }

  logout() {
    this.authentication.logout();
  }
}
