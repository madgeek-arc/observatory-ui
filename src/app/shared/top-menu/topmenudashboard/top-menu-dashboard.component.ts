import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from "@angular/core";
import {Router} from "@angular/router";
import {Coordinator, Stakeholder, UserInfo} from "../../../../survey-tool/app/domain/userInfo";
import {UserService} from "../../../../survey-tool/app/services/user.service";
import {MessagingSystemService} from "src/messaging-system-ui/services/messaging-system.service";
import {AuthenticationService} from "../../../../survey-tool/app/services/authentication.service";
import {PrivacyPolicyService} from "../../../../survey-tool/app/services/privacy-policy.service";
import {AcceptedPrivacyPolicy} from "../../../../survey-tool/app/domain/privacy-policy";
import {UnreadMessages} from "../../../../messaging-system-ui/app/domain/messaging";
import {Subscriber} from "rxjs";
import * as UIkit from 'uikit';
import {MessagingWebsocketService} from "../../../../messaging-system-ui/services/messaging-websocket.service";

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
  // groupIds: string[] = [];
  unreadMessages: UnreadMessages = new UnreadMessages();

  constructor(private userService: UserService, private privacyPolicy: PrivacyPolicyService,
              private authentication: AuthenticationService, private router: Router,
              private messagingService: MessagingSystemService, private messagingWebsocket: MessagingWebsocketService) {

    this.messagingService.unreadMessages.subscribe(
      next => this.unreadMessages = next
    );
    this.messagingService.setUnreadCount();

  }

  ngOnInit() {

    if (this.authentication.authenticated) {
      this.subscriptions.push(
        this.userService.userInfo.subscribe(
          next => {
            if (next) {
              this.userInfo = next;
            } else {
              this.userService.getUserInfo().subscribe(
                next => {
                  this.userService.setUserInfo(next);
                  this.userInfo = next;
                },
                error => {console.error(error);}
              );
            }
            if (this.userInfo) {

              this.messagingWebsocket.initializeWebSocketConnection(`/topic/stream/inbox/unread/${this.userInfo.user.email}`);
              this.messagingWebsocket.WsJoin(`/app/stream/unread/${this.userInfo.user.email}`, 'testo');

              this.showArchive = this.coordinatorContains('eosc-sb') || this.checkIfManager();
              // for (const stakeholder of this.userInfo.stakeholders) {
              //   this.groupIds.push(stakeholder.id);
              // }
              // for (const coordinator of this.userInfo.coordinators) {
              //   this.groupIds.push(coordinator.id);
              // }

              //   .subscribe(
              //   res => {
              //     this.unreadMessages = res;
              //   },
              //   error => {console.error(error)}
              // );
            }
          },
          error => {console.error(error)}
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
      this.showArchive = this.coordinatorContains('eosc-sb') || this.checkIfManager();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => {
      if (subscription instanceof Subscriber) {
        subscription.unsubscribe();
      }
    });
    // this.messagingService.eventSource.close();
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

  showUnread(id: string) {
    if (!this.unreadMessages)
      return '';
    for (const group of this.unreadMessages?.groups) {
      if (group.groupId === id) {
        if (group.unread > 0)
          return group.unread;
        return '';
      }
    }
    return '';
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
