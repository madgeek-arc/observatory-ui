import {Component, ElementRef, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild} from "@angular/core";
import {Router} from "@angular/router";
import {Administrator, Coordinator, Stakeholder, UserInfo} from "../../../../survey-tool/app/domain/userInfo";
import {UserService} from "../../../../survey-tool/app/services/user.service";
import {MessagingSystemService} from "src/messaging-system-ui/services/messaging-system.service";
import {AuthenticationService} from "../../../../survey-tool/app/services/authentication.service";
import {PrivacyPolicyService} from "../../../../survey-tool/app/services/privacy-policy.service";
import {AcceptedPrivacyPolicy} from "../../../../survey-tool/app/domain/privacy-policy";
import {UnreadMessages} from "../../../../messaging-system-ui/app/domain/messaging";
import {MessagingWebsocketService} from "../../../../messaging-system-ui/services/messaging-websocket.service";
import {Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";
import * as UIkit from 'uikit';

@Component({
  selector: 'app-top-menu-dashboard',
  templateUrl: 'top-menu-dashboard.component.html',
  styleUrls: ['../top-menu.component.css', './top-menu-dashboard.component.less'],
  providers: [PrivacyPolicyService]
})

export class TopMenuDashboardComponent implements OnInit, OnChanges, OnDestroy {
  private _destroyed: Subject<boolean> = new Subject();

  userInfo: UserInfo = null;
  currentStakeholder: Stakeholder = null;
  currentCoordinator: Coordinator = null;
  currentAdministrator: Administrator = null;
  acceptedPrivacyPolicy: AcceptedPrivacyPolicy = null;
  name: string = null;
  showArchive: boolean = false;
  // groupIds: string[] = [];
  unreadMessages: UnreadMessages = new UnreadMessages();

  @ViewChild('canvas') canvas: ElementRef;

  constructor(private userService: UserService, private privacyPolicy: PrivacyPolicyService,
              private authentication: AuthenticationService, private router: Router,
              private messagingService: MessagingSystemService, private messagingWebsocket: MessagingWebsocketService) {

    this.messagingService.unreadMessages.subscribe(
      next => this.unreadMessages = next
    );
    this.messagingService.setUnreadCount();

  }

  ngOnInit() {
    // if (this.authentication.authenticated) {
      this.userService.getUserObservable().pipe(takeUntil(this._destroyed)).subscribe(
        next => {
          // if (next) {
            this.userInfo = next;
          // }
          // else {
          //   this.userService.getUserInfo().subscribe(
          //     next => {
          //       this.userService.setUserInfo(next);
          //       this.userInfo = next;
          //     },
          //     error => {console.error(error);
          //     }
          //   )
          // }
          if (this.userInfo) {
            if (!this.messagingWebsocket.stompClientUnread) {
              this.messagingWebsocket.initializeWebSocketConnectionUnread(`/topic/messages/inbox/unread/${this.userInfo.user.email}`);
              this.messagingWebsocket.WsJoin(`/app/messages/inbox/unread/${this.userInfo.user.email}`, 'action');
            }
            if (!this.messagingWebsocket.stompClientNotification) {
              // console.log('open notification socket');
              this.messagingWebsocket.initializeWebSocketConnectionNotification(`/topic/messages/inbox/notification/${this.userInfo.user.email}`);
            }

            this.showArchive = this.coordinatorContains('eosc-sb') || this.checkIfManager();

          }
        },
        error => {console.error(error)}
      );
    // }

    this.userService.currentStakeholder.pipe(takeUntil(this._destroyed)).subscribe(next => {
      this.currentStakeholder = !!next ? next : JSON.parse(sessionStorage.getItem('currentStakeholder'));
      if (this.currentStakeholder !== null) {
        this.privacyPolicy.hasAcceptedPolicy(this.currentStakeholder.type).pipe(takeUntil(this._destroyed)).subscribe(
          next => {
            this.acceptedPrivacyPolicy = next;
            if (!this.acceptedPrivacyPolicy.accepted) {
              UIkit.modal('#consent-modal').show();
            }
          },
          error => { console.error(error)},
          () => {}
        );
      }
    });

    this.userService.currentCoordinator.pipe(takeUntil(this._destroyed)).subscribe(next => {
      this.currentCoordinator = !!next ? next : JSON.parse(sessionStorage.getItem('currentCoordinator'));
      if (this.currentCoordinator !== null) {
        this.privacyPolicy.hasAcceptedPolicy(this.currentCoordinator.type).pipe(takeUntil(this._destroyed)).subscribe(
          next => {
            this.acceptedPrivacyPolicy = next;
            if (!this.acceptedPrivacyPolicy.accepted) {
              UIkit.modal('#consent-modal').show();
            }
          },
          error => { console.error(error)},
          () => {}
        );
      }
    });

    this.userService.currentAdministrator.pipe(takeUntil(this._destroyed)).subscribe(next => {
      this.currentAdministrator = !!next ? next : JSON.parse(sessionStorage.getItem('currentAdministrator'));
      // todo: do we need privacy policy modal for admins?

/*      if (this.currentAdministrator !== null) {
        this.privacyPolicy.hasAcceptedPolicy(this.currentAdministrator.type).pipe(takeUntil(this._destroyed)).subscribe(
          next => {
            this.acceptedPrivacyPolicy = next;
            if (!this.acceptedPrivacyPolicy.accepted) {
              UIkit.modal('#consent-modal').show();
            }
          },
          error => { console.error(error)},
          () => {}
        );
      }*/
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.userInfo)
      this.showArchive = this.coordinatorContains('eosc-sb') || this.checkIfManager();
  }

  ngOnDestroy(): void {
    this._destroyed.next(true);
    this._destroyed.complete();
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

  setAdministrator(admin: Administrator){
    this.userService.changeCurrentAdministrator(admin);
    this.router.navigate([`/contributions/${admin.id}/home`]);
  }

  coordinatorContains(name: string) {
    return this.userInfo.coordinators.filter(c => c.type === name).length > 0;
  }

  checkIfManager(): boolean {
    if (this.userInfo.stakeholders?.length > 0) {
      for (const stakeholder of this.userInfo.stakeholders) {
        for (const manager of stakeholder.admins) {
          if (this.userInfo.user.email === manager) {
            return true;
          }
        }
      }
    }

    // if (this.currentStakeholder) {
    //   let userInfo = this.userService.getCurrentUserInfo();
    //   for (const manager of this.currentStakeholder.admins) {
    //     if (userInfo.user.email === manager) {
    //       return true;
    //     }
    //   }
    //   return false;
    // }
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
    this.userService.setUserConsent(this.acceptedPrivacyPolicy.privacyPolicy.id).pipe(takeUntil(this._destroyed))
      .subscribe(next => {
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
    );
  }

  closeModal() {
    UIkit.modal('#consent-modal').hide();
    this.logout();
  }

  navigate(url: string, dropbarId: string) {
    this.router.navigate([url]).then(
      () => {
        UIkit.dropdown('#'+dropbarId).hide(false);
      }
    );
  }

  closeOffCanvas(canvasId: string) {
    const offCanvas = UIkit.offcanvas(document.getElementById(canvasId));
    if (offCanvas) {
      offCanvas.hide();
    }
  }

  closeCanvas(element = this.canvas.nativeElement) {
    UIkit.offcanvas(element).hide();
  }

}
