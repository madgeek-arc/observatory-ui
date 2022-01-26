import {Component, Input, OnInit} from "@angular/core";
import {Coordinator, Stakeholder, UserInfo} from "../../../domain/userInfo";
import {UserService} from "../../../services/user.service";
import {Router} from "@angular/router";
import {AuthenticationService} from "../../../services/authentication.service";
import {PrivacyPolicyService} from "../../../services/privacy-policy.service";

import * as UIkit from 'uikit';
import {AcceptedPrivacyPolicy} from "../../../domain/privacy-policy";

@Component({
  selector: 'app-top-menu-dashboard',
  templateUrl: 'top-menu-dashboard.component.html',
  styleUrls: ['../top-menu.component.css'],
  providers: [PrivacyPolicyService]
})

export class TopMenuDashboardComponent implements OnInit {
  @Input() userInfo: UserInfo = null;

  currentStakeholder: Stakeholder = null;
  currentCoordinator: Coordinator = null;
  acceptedPrivacyPolicy: AcceptedPrivacyPolicy = null;
  name: string = null;

  constructor(private userService: UserService,
              private privacyPolicy: PrivacyPolicyService,
              private authentication: AuthenticationService,
              private router: Router) {
  }

  ngOnInit() {
    this.userService.currentStakeholder.subscribe(next => {
      this.currentStakeholder = next;
      if (this.currentStakeholder !== null) {
        this.privacyPolicy.hasAcceptedPolicy(this.currentStakeholder.type).subscribe(
          next => {
            this.acceptedPrivacyPolicy = next;
            if (!this.acceptedPrivacyPolicy.accepted) {
              UIkit.modal('#consent-modal').show();
            }
          },
          error => { console.log(error)},
          () => {}
        )
      }
    });
    this.userService.currentCoordinator.subscribe(next => {
      this.currentCoordinator = next;
      if (this.currentCoordinator !== null) {
        console.log(this.currentCoordinator.type);
        this.privacyPolicy.hasAcceptedPolicy(this.currentCoordinator.type).subscribe(
          next => {
            this.acceptedPrivacyPolicy = next;
            if (!this.acceptedPrivacyPolicy.accepted) {
              UIkit.modal('#consent-modal').show();
            }
          },
          error => { console.log(error)},
          () => {}
        )
      }
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

  updateConsent() {
    this.userService.setUserConsent(this.acceptedPrivacyPolicy.privacyPolicy.id).subscribe(
      next => {
        UIkit.modal('#consent-modal').hide();
        // if (!this.consent) {
        //   this.authentication.logout();
        // }
      },
      error => {
        console.log(error);
        UIkit.modal('#consent-modal').hide()
        this.logout();
      },
      () => {UIkit.modal('#consent-modal').hide()}
    );
  }

  closeModal() {
    UIkit.modal('#consent-modal').hide();
    this.logout();
  }
}
