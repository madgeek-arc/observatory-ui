import {Component, Input, OnChanges, OnInit, SimpleChanges} from "@angular/core";
import {MemberOf, UserInfo} from "../../../domain/userInfo";
import {UserService} from "../../../services/user.service";
import {Router} from "@angular/router";
import {LoginService} from "../../../services/login.service";

@Component({
  selector: 'app-top-menu-landing',
  templateUrl: 'top-menu-landing.component.html',
  styleUrls: ['../top-menu.component.css']
})

export class TopMenuLandingComponent implements OnInit {
  @Input() userInfo: UserInfo = null;

  currentGroup: MemberOf = null;

  constructor(private userService: UserService, private loginService: LoginService, private router: Router) {
  }

  ngOnInit() {
    this.userService.currentStakeholderGroup.subscribe(next => {
      this.currentGroup = next;
    });
  }

  setGroup(group: MemberOf) {
    this.userService.changeCurrentGroup(group);
    this.router.navigate(['/contributions/home']);
  }

  parseUsername() {
    let firstLetters = "";
    let matches = this.userInfo.user.fullname.match(/\b(\w)/g);
    if(matches)
      firstLetters += matches.join('');
    return firstLetters;
  }

  logout() {
    this.loginService.logout();
  }

  logInButton() {
    this.loginService.login();
    // window.location.href = 'http://localhost:8280/observatory/login';
  }
}
