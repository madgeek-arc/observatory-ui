import {Component, Input, OnInit} from "@angular/core";
import {Coordinator, Stakeholder, UserInfo} from "../../../domain/userInfo";
import {UserService} from "../../../services/user.service";
import {Router} from "@angular/router";
import {AuthenticationService} from "../../../services/authentication.service";

@Component({
  selector: 'app-top-menu-dashboard',
  templateUrl: 'top-menu-dashboard.component.html',
  styleUrls: ['../top-menu.component.css']
})

export class TopMenuDashboardComponent implements OnInit {
  @Input() userInfo: UserInfo = null;

  currentStakeholder: Stakeholder = null;
  currentCoordinator: Coordinator = null;
  name: string = null;

  constructor(private userService: UserService,
              private authentication: AuthenticationService,
              private router: Router) {
  }

  ngOnInit() {
    this.userService.currentStakeholder.subscribe(next => {
      this.currentStakeholder = next;
    });
    this.userService.currentCoordinator.subscribe(next => {
      this.currentCoordinator = next;
    });
  }

  parseUsername() {
    let firstLetters = "";
    let matches = this.userInfo.user.fullname.match(/\b(\w)/g);
    if(matches)
      firstLetters += matches.join('');
    return firstLetters;
  }

  setGroup(group: Stakeholder) {
    this.userService.changeCurrentStakeholder(group);
    this.router.navigate(['/contributions/home']);
  }

  setCoordinator(coordinator: Coordinator){
    this.userService.changeCurrentCoordinator(coordinator);
    this.router.navigate(['/contributions/home']);
  }

  logout() {
    this.authentication.logout();
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