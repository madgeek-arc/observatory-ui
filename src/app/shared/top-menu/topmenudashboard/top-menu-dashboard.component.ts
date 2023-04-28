import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from "@angular/core";
import {Coordinator, Stakeholder, UserInfo} from "../../../../survey-tool/app/domain/userInfo";
import {UserService} from "../../../../survey-tool/app/services/user.service";
import {Router} from "@angular/router";
import {AuthenticationService} from "../../../../survey-tool/app/services/authentication.service";
import {PrivacyPolicyService} from "../../../../survey-tool/app/services/privacy-policy.service";

import * as UIkit from 'uikit';
import {AcceptedPrivacyPolicy} from "../../../../survey-tool/app/domain/privacy-policy";
import {Subscriber} from "rxjs";

@Component({
  selector: 'app-top-menu-dashboard',
  templateUrl: 'top-menu-dashboard.component.html',
  styleUrls: ['../top-menu.component.css'],
  providers: [PrivacyPolicyService]
})

export class TopMenuDashboardComponent implements OnInit, OnChanges, OnDestroy {
  @Input() userInfo: UserInfo = null;

  subscriptions = [];
  currentStakeholder: Stakeholder = null;
  currentCoordinator: Coordinator = null;
  acceptedPrivacyPolicy: AcceptedPrivacyPolicy = null;
  name: string = null;
  showArchive: boolean = false;

  constructor(private userService: UserService,
              private privacyPolicy: PrivacyPolicyService,
              private authentication: AuthenticationService,
              private router: Router) {
  }

  ngOnInit() {

    if (this.authentication.authenticated) {
      this.subscriptions.push(
        this.userService.getUserInfo().subscribe(
          next => {
            this.userService.setUserInfo(next);
            this.userInfo = next;
            // this.showNationalContributionsToEOSC = this.coordinatorOrManager('country');
            // this.showArchive = this.coordinatorContains('country');
          },
          error => {
            console.error(error);
          }
        )
      );
    }

    this.subscriptions.push(
      this.userService.currentStakeholder.subscribe(next => {
        this.currentStakeholder = !!next ? next : JSON.parse(sessionStorage.getItem('currentStakeholder'));
        if (this.currentStakeholder !== null) {
          this.subscriptions.push(
            this.privacyPolicy.hasAcceptedPolicy(this.currentStakeholder.type).subscribe(
              next => {
                this.acceptedPrivacyPolicy = next;
                if (!this.acceptedPrivacyPolicy.accepted) {
                  UIkit.modal('#consent-modal').show();
                }
              },
              error => { console.error(error)},
              () => {}
            )
          );
        }
      })
    );
    this.subscriptions.push(
      this.userService.currentCoordinator.subscribe(next => {
        this.currentCoordinator = !!next ? next : JSON.parse(sessionStorage.getItem('currentCoordinator'));
        if (this.currentCoordinator !== null) {
          this.subscriptions.push(
            this.privacyPolicy.hasAcceptedPolicy(this.currentCoordinator.type).subscribe(
              next => {
                this.acceptedPrivacyPolicy = next;
                if (!this.acceptedPrivacyPolicy.accepted) {
                  UIkit.modal('#consent-modal').show();
                }
              },
              error => { console.error(error)},
              () => {}
            )
          );
        }
      })
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.userInfo)
      this.showArchive = this.coordinatorContains('country') || this.checkIfManager();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => {
      if (subscription instanceof Subscriber) {
        subscription.unsubscribe();
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
    this.router.navigate([`/contributions/${group.id}/home`]);
  }

  setCoordinator(coordinator: Coordinator){
    this.userService.changeCurrentCoordinator(coordinator);
    this.router.navigate([`/contributions/${coordinator.id}/home`]);
  }

  coordinatorContains(name: string) {
    return this.userInfo.coordinators.filter(c => c.type === name).length > 0;
  }

  checkIfManager(): boolean {
    if (this.currentStakeholder) {
      let userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
      for (const manager of this.currentStakeholder.managers) {
        if (userInfo.user.email === manager) {
          return true;
        }
      }
      return false;
    }
    return false;
  }

  logInButton() {
    this.authentication.login();
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
    this.subscriptions.push(
      this.userService.setUserConsent(this.acceptedPrivacyPolicy.privacyPolicy.id).subscribe(
        next => {
          UIkit.modal('#consent-modal').hide();
          // if (!this.consent) {
          //   this.authentication.logout();
          // }
        },
        error => {
          console.error(error);
          UIkit.modal('#consent-modal').hide()
          this.logout();
        },
        () => {UIkit.modal('#consent-modal').hide()}
      )
    );
  }

  closeModal() {
    UIkit.modal('#consent-modal').hide();
    this.logout();
  }
}
