import {
  AfterViewInit, Component, computed, ElementRef, inject, OnDestroy, OnInit, signal, ViewChild,
  ChangeDetectionStrategy
} from "@angular/core";
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { Administrator, Coordinator, Stakeholder, UserInfo } from "src/survey-tool/app/domain/userInfo";
import { UserService } from "src/survey-tool/app/services/user.service";
import { MessagingSystemService } from "src/messaging-system-ui/services/messaging-system.service";
import { AuthenticationService } from "src/survey-tool/app/services/authentication.service";
import { PrivacyPolicyService } from "src/survey-tool/app/services/privacy-policy.service";
import { AcceptedPrivacyPolicy } from "src/survey-tool/app/domain/privacy-policy";
import { UnreadMessages } from "src/messaging-system-ui/app/domain/messaging";
import { MessagingWebsocketService } from "src/messaging-system-ui/services/messaging-websocket.service";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import * as UIkit from 'uikit';

@Component({
    selector: 'app-top-menu-dashboard',
    templateUrl: 'top-menu-dashboard.component.html',
    styleUrls: ['../top-menu.component.css', './top-menu-dashboard.component.less'],
    providers: [PrivacyPolicyService],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink, RouterLinkActive]
})

export class TopMenuDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  private _destroyed: Subject<boolean> = new Subject();

  private userService = inject(UserService);
  private privacyPolicy = inject(PrivacyPolicyService);
  private authentication = inject(AuthenticationService);
  private router = inject(Router);
  private messagingService = inject(MessagingSystemService);
  private messagingWebsocket = inject(MessagingWebsocketService);

  userInfo = signal<UserInfo>(null);
  currentStakeholder = signal<Stakeholder>(null);
  currentCoordinator = signal<Coordinator>(null);
  currentAdministrator = signal<Administrator>(null);
  acceptedPrivacyPolicy = signal<AcceptedPrivacyPolicy>(null);
  name: string = null;
  showArchive = computed(() => !!this.userInfo() && (this.coordinatorContains('eosc-sb') || this.checkIfManager()));
  superAdmin = computed(() => !!this.userInfo()?.admin);
  // groupIds: string[] = [];
  unreadMessages = signal<UnreadMessages>(new UnreadMessages());

  @ViewChild('canvas') canvas: ElementRef;
  @ViewChild('mobileNav', { static: false }) mobileNav: ElementRef;

  private navComponent: any;


  constructor() {
    this.messagingService.unreadMessages.subscribe(
      next => this.unreadMessages.set(next)
    );
    this.messagingService.setUnreadCount();

  }

  ngOnInit() {
    // if (this.authentication.authenticated) {
      this.userService.getUserObservable().pipe(takeUntil(this._destroyed)).subscribe(
        next => {
          this.userInfo.set(next);
          if (next) {
            if (!this.messagingWebsocket.stompClientUnread) {
              this.messagingWebsocket.initializeWebSocketConnectionUnread(`/topic/messages/inbox/unread/${next.user.email}`);
              this.messagingWebsocket.WsJoin(`/app/messages/inbox/unread/${next.user.email}`, 'action');
            }
            if (!this.messagingWebsocket.stompClientNotification) {
              this.messagingWebsocket.initializeWebSocketConnectionNotification(`/topic/messages/inbox/notification/${next.user.email}`);
            }
          }
        },
        error => {console.error(error)}
      );
    // }

    this.userService.currentStakeholder.pipe(takeUntil(this._destroyed)).subscribe(next => {
      const current = !!next ? next : JSON.parse(sessionStorage.getItem('currentStakeholder'));
      this.currentStakeholder.set(current);
      if (current !== null) {
        this.privacyPolicy.hasAcceptedPolicy(current.type).pipe(takeUntil(this._destroyed)).subscribe(
          next => {
            this.acceptedPrivacyPolicy.set(next);
            if (!next.accepted) {
              UIkit.modal('#consent-modal').show();
            }
          },
          error => { console.error(error)},
          () => {}
        );
      }
    });

    this.userService.currentCoordinator.pipe(takeUntil(this._destroyed)).subscribe(next => {
      const current = !!next ? next : JSON.parse(sessionStorage.getItem('currentCoordinator'));
      this.currentCoordinator.set(current);
      if (current !== null) {
        this.privacyPolicy.hasAcceptedPolicy(current.type).pipe(takeUntil(this._destroyed)).subscribe(
          next => {
            this.acceptedPrivacyPolicy.set(next);
            if (!next.accepted) {
              UIkit.modal('#consent-modal').show();
            }
          },
          error => { console.error(error)},
          () => {}
        );
      }
    });

    this.userService.currentAdministrator.pipe(takeUntil(this._destroyed)).subscribe(next => {
      this.currentAdministrator.set(!!next ? next : JSON.parse(sessionStorage.getItem('currentAdministrator')));
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

  ngAfterViewInit() {

    setTimeout(() => {
      // Initialize UIKit nav component
      this.initializeNavComponent();
      // Set the initial active state
      this.setActiveNavOnLoad();
    }, 100);

    // Listen to route changes
    // this.router.events.pipe(takeUntil(this._destroyed)).subscribe(event => {
    //   if (event instanceof NavigationEnd) {
    //     setTimeout(() => {
    //       this.setActiveNavOnLoad();
    //     }, 100);
    //   }
    // });
  }


  ngOnDestroy(): void {
    this._destroyed.next(true);
    this._destroyed.complete();
  }

  parseUsername() {
    let firstLetters = "";
    let matches = this.userInfo().user.fullname.match(/\b(\w)/g);
    if(matches)
      firstLetters += matches.join('');
    return firstLetters;
  }

  setStakeholder(stakeholder: Stakeholder) {
    // this.userService.changeCurrentCoordinator(null);
    // this.userService.changeCurrentAdministrator(null);

    this.userService.changeCurrentStakeholder(stakeholder);
    this.router.navigate([`/contributions/${stakeholder.id}/stakeholder`]);
  }

  setCoordinator(coordinator: Coordinator){
    // this.userService.changeCurrentStakeholder(null);
    // this.userService.changeCurrentAdministrator(null);
    this.userService.changeCurrentCoordinator(coordinator);
    this.router.navigate([`/contributions/${coordinator.id}/coordinator`]);
  }

  setAdministrator(admin: Administrator){
    // this.userService.changeCurrentStakeholder(null);
    // this.userService.changeCurrentCoordinator(null);
    this.userService.changeCurrentAdministrator(admin);
    this.router.navigate([`/contributions/${admin.id}/administrator`]);
  }

  coordinatorContains(name: string) {
    return this.userInfo().coordinators.filter(c => c.type === name).length > 0;
  }

  checkIfManager(): boolean {
    const userInfo = this.userInfo();
    if (userInfo.stakeholders?.length > 0) {
      for (const stakeholder of userInfo.stakeholders) {
        for (const manager of stakeholder.admins) {
          if (userInfo.user.email === manager) {
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
    const unreadMessages = this.unreadMessages();
    if (!unreadMessages)
      return '';
    for (const group of unreadMessages?.groups) {
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

  // change() {
  //   const el: HTMLElement = document.getElementById('hamburger');
  //   if(el.classList.contains('change')) {
  //     el.classList.remove('change');
  //     const el1: HTMLElement = document.getElementById('sidebar_main_content');
  //     el1.classList.remove('sidebar_main_active');
  //   } else {
  //     el.classList.add('change');
  //     const el1: HTMLElement = document.getElementById('sidebar_main_content');
  //     el1.classList.add('sidebar_main_active');
  //   }
  // }

  updateConsent() {
    this.userService.setUserConsent(this.acceptedPrivacyPolicy().privacyPolicy.id).pipe(takeUntil(this._destroyed))
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

  private initializeNavComponent() {
    if (typeof UIkit !== 'undefined' && this.mobileNav) {
      this.navComponent = UIkit.nav(this.mobileNav.nativeElement);
    }
  }

  private setActiveNavOnLoad() {
    const currentUrl = this.router.url;
    // Check if the current route matches any submenu items
    if (currentUrl.startsWith('/about/')) {
      this.openSubmenu('about');
    } else if (currentUrl.startsWith('/resources/')) {
      this.openSubmenu('resources');
    }
  }

  private openSubmenu(section: string) {
    // console.log(this.navComponent);
    if (this.navComponent) {
      // Find the parent li element index
      const parentIndex = this.getParentMenuIndex(section);
      if (parentIndex !== -1) {
        // Use UIKit's nav toggle method
        this.navComponent.toggle(parentIndex, true);
      }
    }
  }

  private getParentMenuIndex(section: string): number {
    switch (section) { // Return the index +3 to account for the dual-navigation mobile/desktop
      case 'about':
        return 0; // First uk-parent item (About)
      case 'resources':
        return 1; // Second uk-parent item (Resources)
      default:
        return -1;
    }
  }

}
