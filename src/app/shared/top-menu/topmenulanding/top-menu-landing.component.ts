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
  userInfo: UserInfo = null;

  constructor(private userService: UserService, private authentication: AuthenticationService) {
  }

  ngOnInit() {
    this.userService.getUserInfo().subscribe(next => {
      this.userInfo = next;
      this.showLogin = false
    });
  }

  logInButton() {
    this.authentication.login();
  }

  logout() {
    this.authentication.logout();
  }
}
