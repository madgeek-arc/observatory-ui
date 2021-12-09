import {Component, Input, OnChanges, OnInit, SimpleChanges} from "@angular/core";
import {MemberOf, UserInfo} from "../../../domain/userInfo";
import {UserService} from "../../../services/user.service";
import {Router} from "@angular/router";
import {LoginService} from "../../../services/login.service";

@Component({
  selector: 'app-top-menu-dashboard',
  templateUrl: 'top-menu-dashboard.component.html',
  styleUrls: ['../top-menu.component.css']
})

export class TopMenuDashboardComponent implements OnInit, OnChanges {
  @Input() userInfo: UserInfo = null;

  currentGroup: MemberOf = null;

  constructor(private userService: UserService, private loginService: LoginService, private router: Router) {
  }

  ngOnInit() {
    this.userService.currentStakeholderGroup.subscribe(next => {
      this.currentGroup = next;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    // if (changes.userInfo.currentValue) {
    //    this.currentGroup = changes.userInfo.currentValue.memberOf[0];
    //    this.currentStakeholderGroup.emit(this.currentGroup);
    //    console.log()
    //    // this.parseUsername();
    // }
  }

  parseUsername() {
    let firstLetters = "";
    let matches = this.userInfo.user.fullname.match(/\b(\w)/g);
    if(matches)
      firstLetters += matches.join('');
    return firstLetters;
  }

  setGroup(group: MemberOf) {
    this.userService.changeCurrentGroup(group);
    this.router.navigate(['/contributions/home']);
  }

  logout() {
    this.loginService.logout();
  }

  change() {
    const el: HTMLElement = document.getElementById('hamburger');
    if(el.classList.contains('change')) {
      el.classList.remove('change');
      const el1: HTMLElement = document.getElementById('sidebar_main_content');
      el1.classList.remove('sidebar_main_active');
    } else {
      el.classList.add('change');
      const el1: HTMLElement = document.getElementById('sidebar_main_content');
      el1.classList.add('sidebar_main_active');
    }
  }
}
